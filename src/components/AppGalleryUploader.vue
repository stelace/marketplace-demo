<script>
import { mapState } from 'vuex'
import { matDelete, matPhotoSizeSelectActual } from '@quasar/extras/material-icons'

import AppUploadMixin from 'src/mixins/AppUpload'

export default {
  components: {
    SlickList: () => import(/* webpackChunkName: 'slicksort' */ 'vue-slicksort')
      .then(m => m.SlickList),
    SlickItem: () => import(/* webpackChunkName: 'slicksort' */ 'vue-slicksort')
      .then(m => m.SlickItem),
  },
  mixins: [
    AppUploadMixin,
  ],
  props: {
    maxNbImages: {
      type: Number,
      default: 10
    },
    uploadFolder: { // used by AppUpload mixin
      type: String,
      default: 'images'
    },
    reusedImages: {
      type: Array,
      default: () => ([]),
      validator: function (images) {
        return images.every(img => img.name && img.url)
      }
    }
  },
  data () {
    return {
    }
  },
  computed: {
    ...mapState([
      'style',
    ]),
  },
  watch: {
    uploaderTransformedFiles (newFiles) { // AppUpload mixin
      this.$emit('uploader-files-changed', newFiles)
    }
  },
  async mounted () {
    // load a polyfill for browsers not supporting `Array.from` (like IE11)
    // which is needed by `vue-slicksort`
    // (Quasar doesn't polyfill this feature)
    if (!Array.from) await import(/* webpackChunkName: 'polyfill' */ 'src/polyfills/array.js')

    const r = this.reusedImages.map(img => {
      return Object.assign({}, img, { reused: true })
    })

    this.uploaderTransformedFiles.push(...r)
  },
  created () {
    this.icons = {
      matDelete,
      matPhotoSizeSelectActual
    }
  },
  methods: {
    afterUploadCompleted (filesObject) { // AppUpload mixin
      this.$emit('upload-completed', filesObject)
    },
    async remove (file) {
      file.hidden = true // hide as soon as possible before propagation to SlickSort
      await new Promise(resolve => setTimeout(resolve, 300)) // ensure clean animation

      this.$emit('remove', file)
      this.filesRemoved([file]) // from AppUpload mixin
    },
    async reorder ({ oldIndex, newIndex }) {
      if (newIndex === oldIndex) return

      await this.$nextTick() // Wait for SlickSort changes to propagate to Vue data
      this.$emit('reorder', this.uploaderTransformedFiles.filter(u => u && u.name && u.url))
    }
  }
}
</script>

<template>
  <div class="row justify-center">
    <QUploader
      ref="uploader"
      :label="$t({ id: 'prompt.add_pictures' })"
      :factory="uploadFactory"
      :filter="uploadFilter"
      accept="image/*"
      color="transparent"
      flat
      multiple
      auto-upload
      @added="filesAdded"
      @removed="filesRemoved"
      @uploaded="filesUploaded"
      @failed="filesFailed"
    >
      <template>
        <!-- This is global progress -->
        <!-- v-slot:header="scope" -->
        <!-- <div>
          {{ scope.uploadSizeLabel }} / {{ scope.uploadProgressLabel }}
        </div> -->
        <AppContent
          v-if="uploaderTransformedFiles.length > 1"
          class="text-body1 text-default-color"
          tag="div"
          entry="prompt"
          field="drag_change_picture_order"
        />
      </template>
      <template v-slot:list="scope">
        <SlickList
          v-model="uploaderTransformedFiles"
          lock-axis="y"
          @sort-end="reorder"
        >
          <!-- Ensure we have non empty files with filter -->
          <SlickItem
            v-for="(file, index) in uploaderTransformedFiles.filter(u => u && u.name)"
            :key="file.key"
            :index="index"
            class="row justify-center q-pa-sm"
            :disabled="uploaderTransformedFiles.length === 1"
          >
            <div
              v-if="getFile({ files: scope.files, name: file.name }).__img || file.reused"
              class="asset-image-row"
              :class="index > 0 ? 'col-8 col-sm-4' : 'col-12 col-sm-8'"
            >
              <div
                class="asset-image-container text-white"
                :style="`background-image: url('${file.reused ? file.url : getFile({
                  files: scope.files,
                  name: file.name
                }).__img.src}');${
                  file.hidden ? 'display: none' : ''
                }`"
              >
                <div class="absolute-full row justify-end asset-image__control-background">
                  <div class="column justify-end asset-image__control">
                    <QBtn
                      :icon="icons.matDelete"
                      color="white"
                      size="md"
                      flat
                      dense
                      round
                      @click.stop="remove(file) || (!file.reused && scope.removeFile(getFile({
                        files: scope.files,
                        name: file.name
                      })))"
                    />
                  </div>
                </div>
                <QLinearProgress
                  v-if="!file.reused"
                  class="absolute-top"
                  style="height: 6px"
                  color="secondary"
                  :value="getFile({
                    files: scope.files,
                    name: file.name
                  }).__progress"
                />
              </div>
            </div>
          </SlickItem>
        </SlickList>

        <div
          v-if="uploaderTransformedFiles.length < maxNbImages"
          :class="[
            'image-uploader full-width column flex-center q-pa-md q-my-lg relative-position',
            scope.isUploading ? 'disabled' : ''
          ]"
        >
          <QIcon
            class="q-my-md"
            :name="icons.matPhotoSizeSelectActual"
            size="6rem"
          />
          <AppContent
            class="text-h5"
            tag="div"
            entry="prompt"
            field="drag_and_drop_pictures"
          />
          <AppContent
            class="q-my-md text-body1 text-weight-bold text-uppercase"
            tag="div"
            entry="prompt"
            field="binary_or_separator"
          />
          <QBtn
            class="text-weight-medium q-mb-md"
            :label="$t({ id: 'prompt.browse' })"
            :rounded="style.roundedTheme"
            color="primary"
          />
          <!-- Relative positionning of parent is needed for QUploaderAddTriger -->
          <QUploaderAddTrigger v-if="!scope.isUploading" />
        </div>
      </template>
    </QUploader>
  </div>
</template>

<style lang="stylus" scoped>
.asset-image-row
  transition: width $transition-duration

.asset-image-container
  position: relative
  background-size: cover
  background-position: center
  padding-top: $base-image-ratio-padding-top
  border-radius: $generic-border-radius

.asset-image__control-background
  background: linear-gradient(to top left, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 30%)

.asset-image__control
  padding: $spaces.sm.y $spaces.sm.x $spaces.sm.y $spaces.lg.x

.q-uploader
  width: 90%
  max-height: none
  user-select: none

.image-uploader
  background-color: #F9F9F9
  border 3px dashed #EEE
  cursor: pointer
  min-height: 8rem
</style>
