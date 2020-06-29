import Vue from 'vue'
import { get, isArrayLike, isEmpty } from 'lodash'
import { Cdn } from 'sharp-aws-image-handler-client'

import { mergeEntries, TRANSFORMED_KEYS } from 'src/utils/content'

const cdn = new Cdn({
  base: process.env.VUE_APP_CDN_WITH_IMAGE_HANDLER_URL,
  bucket: process.env.VUE_APP_CDN_S3_BUCKET,
  servedFromCdnBucket: (uri, base, bucketUrl) => {
    const devBucket = process.env.VUE_APP_CDN_S3_DEV_BUCKET

    if (
      uri.startsWith(base) ||
      uri.startsWith(bucketUrl) ||
      uri.startsWith('https://cdn.instant.stelace.com') // legacy domain
    ) {
      return true
    } else if (
      devBucket && (
        uri.startsWith(`https://${devBucket}.s3.amazonaws.com`) ||
        uri.startsWith('https://dev-cdn.instant.stelace.com') // legacy domain
      )
    ) {
      return devBucket
    }

    return false
  }
})
const isDevDebuggingStyles = process.env.DEV && process.env.VUE_APP_DEBUG_STYLES === 'true'

export function entries (state) {
  const { apiEntries, localEntries, editingEntries, locale } = state

  const merged = mergeEntries({ apiEntries, localEntries, editingEntries })

  // Breaking rules here to trigger a local side effect in a (fortunately cached) getter
  // every time locale or entries are updated
  Vue.registerMessages(locale, merged)

  return merged
}

export function getContents (state, getters) {
  const entries = getters.entries

  /**
   * This function getter makes it easy to return a set of contents from store entries.
   * Note that getContents getter is not cached since it returns a function.
   * @param {String|Function} [testFnOrString=`key => key.startsWith('stringArg')`] - Can be either:
   * - a function that takes 'entry.field.path' key and value as arguments,
   *   expected to return a truthy value to keep this content in returned object.
   *   Suggestions: `key => key.includes()`, `key => RegExp.test(key)`…
   * - or a string that will be used as argument passed to `key => key.startsWith(testString)`
   *   as default function called on each store key
   * @returns filtered entries object
   */
  const getterFn = testFnOrString => {
    let testFn
    if (typeof testFnOrString === 'string') testFn = key => key.startsWith(testFnOrString)
    else if (typeof testFnOrString === 'function') testFn = testFnOrString
    else throw new Error('String or function argument expected to getContents')

    return Object.keys(entries).reduce((filteredObj, key) => {
      const value = entries[key]
      if (testFn(key, value)) filteredObj[key] = value
      return filteredObj
    }, {})
  }
  return getterFn
}

export function getRawContent (state) {
  const { apiEntries, localEntries } = state
  /**
   * Getter function (not cached).
   * @param {String} key
   * @returns {String|Object} Raw content entry field. Object for transformed fields (markdown)
   */
  return (key) => {
    if (!key || typeof key !== 'string') return ''
    const entries = mergeEntries({
      apiEntries,
      localEntries,
      useRawFields: true
    })
    return get(entries, key, '')
  }
}

/**
 * Getter function (not cached):
 * @param {String} key - must include both entry and field like `${entry}.${field}`
 * @returns {String|Boolean} transform type like `'markdown'` or `false` value
 */
export function getContentTransformType (state, getters) {
  // key must include both entry and field like `${entry}.${field}`
  return key => getters.entries[TRANSFORMED_KEYS][key] || false
}

export function termsPath (state, getters) {
  return getters.entries['instant_pages.terms.INSTANT_PAGE_PATH'] || 'terms'
}

export function getHomeHeroUrlTransformed (state, getters, rootState) {
  const url = rootState.style.homeHeroUrl || ''

  return ({ noWebP, width } = {}) => {
    const edits = {
      webp: state.acceptWebP && !noWebP
    }

    if (width) {
      edits.resize = {
        width,
        withoutEnlargement: true
      }
    }

    if (url && cdn.servedFromCdnBucket(url)) {
      return cdn.getUrl(url, edits)
    }
    return url
  }
}

export function placeholderImage (state, getters) {
  return `${state.placeholderImageBaseUrl}/${getters.baseImageWidth}/${getters.baseImageHeight}/nature`
}

export function avatarImageWidth (state, getters, rootState) {
  return rootState.style.avatarImageWidth || 96
}

export function baseImageWidth (state, getters, rootState) {
  return rootState.style.baseImageWidth || 600
}

export function baseImageHeight (state, getters, rootState, rootGetters) {
  return getters.baseImageWidth / rootGetters.baseImageRatio
}

export function largeImageWidth (state, getters) {
  return 2 * getters.baseImageWidth
}

export function largeImageHeight (state, getters, rootState, rootGetters) {
  return getters.largeImageWidth / rootGetters.baseImageRatio
}

// TODO: use srcset to detect resolution
// For now load 2x size everywhere in app
export function getAvatarImageUrl (state, getters) {
  return (user, { resolution = 2 } = {}) => {
    const imgUri = user.avatarUrl || ''
    const avatarSquareSize = Math.round(resolution) * getters.avatarImageWidth

    return cdn.servedFromCdnBucket(imgUri)
      ? cdn.getUrl(imgUri, {
        webp: state.acceptWebP,
        resize: { width: avatarSquareSize, height: avatarSquareSize }
      })
      : imgUri
  }
}

// TODO: handle high resolution (srcset)
export function getBaseImageUrl (state, getters) {
  return (resource, { accessorString, index = 0 } = {}) => {
    const imgUri = getImageUri(resource, { accessorString, index })

    return cdn.servedFromCdnBucket(imgUri)
      ? cdn.getUrl(imgUri, {
        webp: state.acceptWebP,
        resize: { width: getters.baseImageWidth, height: getters.baseImageHeight }
      })
      : imgUri || (isDevDebuggingStyles ? getters.placeholderImage : '')
  }
}

export function getLargeImageUrl (state, getters) {
  return (resource, { accessorString, index = 0 } = {}) => {
    const imgUri = getImageUri(resource, { accessorString, index })

    return cdn.servedFromCdnBucket(imgUri)
      ? cdn.getUrl(imgUri, {
        webp: state.acceptWebP,
        resize: { width: getters.largeImageWidth, height: getters.largeImageHeight }
      })
      : imgUri || (isDevDebuggingStyles ? getters.placeholderImage : '')
  }
}

// Resource param can be asset, profile or any other object with metadata.images for gallery
export function getResourceGalleryItems (state, getters, rootState, rootGetters) {
  return (resource = rootGetters.activeAsset) => {
    if (isEmpty(resource)) return []

    const images = get(resource, 'metadata.images')
    const resourceName = resource.name || ''

    const allImages = isArrayLike(images)
      ? images.map((img, i) => ({
        src: getters.getLargeImageUrl(resource, { index: i }),
        msrc: getters.getBaseImageUrl(resource, { index: i }),
        alt: img.alt || `${resourceName} - Image ${i + 1}`, // TODO: localize this
        title: img.description || '',
        w: getters.largeImageWidth,
        h: getters.largeImageHeight
      }))
      : (isDevDebuggingStyles ? [{ // Placeholder for dev
        src: getters.getLargeImageUrl(resource),
        msrc: getters.getBaseImageUrl(resource),
        alt: `${resourceName}`,
        w: getters.largeImageWidth,
        h: getters.largeImageHeight
      }] : [])

    return allImages
  }
}

// Resource param can be asset, profile or any other object with metadata.images for gallery
export function getResourceGalleryOptions (state, getters, rootState, rootGetters) {
  const nbColumns = 3

  return (resource = rootGetters.activeAsset) => ({
    showHideOpacity: true,

    captionEl: false,
    fullscreenEl: false,
    zoomEl: false,
    shareEl: false,

    vueSettings: {
      nbColumns,
      galleryClass: 'row overflow-hidden',
      hideExtraneousImages: true,
      maxNbThumbnails: 6,
      columnContainerClass: [
        `col-12 ${ // Main picture, even bigger if it’s the only one in gallery
          get(resource, 'metadata.images.length', 0) >= nbColumns ? 'col-sm-8' : ''
        }`,
        'col-12 col-sm-4', // 2 pictures
        'col-12 row', // Lines of 3 pictures starting from 4th
      ],
      columnClass: [
        'asset__gallery-thumbnail',
        'asset__gallery-thumbnail',
        'col-4 asset__gallery-thumbnail'
      ],
      thumbnailContainerClass: 'absolute-top',
      thumbnailClass: 'full-width',
      // can’t get computed aspect ratio from mixin yet, so let’s bypass and get it from store
      thumbnailAspectRatio: rootGetters.baseImageRatio,
      pswpClass: 'z-max',
    },
  })
}

function getAccessorString (index) {
  return `metadata.images[${index}].url`
}

function getImageUri (resource, { accessorString, index = 0 } = {}) {
  return accessorString ? get(resource, accessorString, '') : get(resource, getAccessorString(index), '')
}
