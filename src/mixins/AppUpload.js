import { mapState } from 'vuex'

import { getS3SignedUrl } from 'src/utils/s3'
import logger from 'src/utils/logger'

export default {
  data () {
    return {
      uploaderFiles: [], // Quasar files
      uploaderTransformedFiles: [], // copy to keep Quasar data clean, each file "name" need to be the same
    }
  },
  computed: {
    maxUploadFileSize () {
      return this.maxFileSize || this.content.maxUploadFileSize
    },
    uploadedFiles () {
      return this.uploaderFiles.filter(f => f.__status === 'uploaded')
    },
    failedFiles () {
      return this.uploaderFiles.filter(f => f.__status === 'failed')
    },
    isUploadComplete () {
      return this.uploaderFiles.reduce((complete, f) => {
        return complete && (
          this.uploadedFiles.some(u => u.name === f.name) ||
          this.failedFiles.some(x => x.name === f.name)
        )
      }, true)
    },
    ...mapState([
      'content',
    ]),
  },
  watch: {
    isUploadComplete (complete) {
      if (complete && typeof this.afterUploadCompleted === 'function') {
        const transformedUploadedFiles = this.getTransformedUploadedFiles()
        const uploadedOrReused = this.uploaderTransformedFiles
          .filter(u => u && !this.failedFiles.some(failed => failed.name === u.name))
          .map(u => {
            if (u.reused) {
              const uploaded = Object.assign({}, u)
              delete uploaded.reused
              return uploaded
            }
            return transformedUploadedFiles.find(t => t.name === u.name)
          })

        this.afterUploadCompleted({
          transformedUploadedFiles,
          uploadedOrReused,
          uploadedFiles: this.uploadedFiles, // raw Quasar files
          failedFiles: this.failedFiles
        })
      }
    }
  },
  methods: {
    resetUploader () {
      this.$refs.uploader && this.$refs.uploader.reset()
      this.uploaderFiles = []
      this.uploaderTransformedFiles = []
    },
    uploadFilter (files) {
      return files.filter(f => {
        const aboveLimit = f.size > this.maxUploadFileSize
        if (aboveLimit) {
          this.notify('error.file_upload_size_limit', {
            i18nValues: { // in MB
              limit: Math.round(10 * this.maxUploadFileSize / Math.pow(1024, 2)) / 10
            },
            options: { timeout: 10000 }
          })
          return false
        }

        const duplicated = this.uploaderTransformedFiles.some(u => u && files.some(f => f.name === u.name))
        if (duplicated) {
          this.notify('error.file_upload_duplicate_name', {
            i18nValues: { // in MB
              name: files[0].name
            },
            options: { timeout: 10000 }
          })
          return false
        }

        return true
      })
    },
    uploadFactory (files) {
      // even if multiple files are selected in file picker
      // there is only one element in the array
      const file = files[0]
      const options = {}
      if (this.uploadFolder) options.folder = this.uploadFolder

      return getS3SignedUrl(file, options)
        .then(({ fields: formFields, url, fieldName, S3FileUrl }) => {
          let handler = this.uploadingFileUrlHandler
          handler = typeof handler === 'function' ? handler : _ => _

          file.remoteUrl = S3FileUrl

          handler({ file, url: S3FileUrl })

          return { formFields, url, fieldName }
        })
        .catch((err) => {
          logger(err, { notification: 'error.failed_upload' })
        })
    },
    filesAdded (added) {
      this.uploaderFiles = [...this.uploaderFiles, ...added]

      const transformed = this.getTransformedFiles(added)
      this.uploaderTransformedFiles = [...this.uploaderTransformedFiles, ...transformed]
    },
    filesRemoved (removed) {
      this.uploaderFiles = this.uploaderFiles
        .filter(f => f && !removed.some(r => r.name === f.name))
      this.uploaderTransformedFiles = this.uploaderTransformedFiles
        .filter(f => f && !removed.some(r => r.name === f.name))
      // TODO: handle S3 file removal if appropriate
    },
    filesUploading (/* { files: uploading } */) {},
    filesUploaded ({ files: uploaded }) {
      this.uploaderFiles = this.uploaderFiles.filter(f => f && !uploaded.some(u => u.name === f.name))
        .concat(uploaded)

      const transformed = this.getTransformedFiles(uploaded)
      this.uploaderTransformedFiles = this.uploaderTransformedFiles
        .filter(u => !!u) // consider this object unsafe since it transformed by several parties
        .map(old => {
          return transformed.find(t => t && t.name === old.name) || old
        })
    },
    filesFailed ({ files: failed }) {
      this.uploaderFiles = this.uploaderFiles.filter(f => !failed.some(fail => fail.name === f.name))
        .concat(failed)

      const transformed = this.getTransformedFiles(failed)
      this.uploaderTransformedFiles = this.uploaderTransformedFiles
        .filter(u => !!u) // consider this object unsafe since it transformed by several parties
        .map(old => {
          return transformed.find(t => t && t.name === old.name) || old
        })
    },
    getFile ({ files = this.uploaderFiles, name }) {
      return files.find(f => f && f.name === name) || {}
    },
    getTransformedUploadedFiles (fn) {
      return this.getTransformedFiles(this.uploadedFiles, fn)
    },
    getTransformedFiles (files, fn = () => ({})) {
      return files.reduce((tr, f) => {
        tr.push(Object.assign({},
          {
            name: f.name,
            url: f.remoteUrl,
            key: `${f.name}-${f.remoteUrl || f.__img.src}`
          },
          fn(f)
        ))
        return tr
      }, [])
    }
  },
}
