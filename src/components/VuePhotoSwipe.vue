<template>
  <!-- TODO: Turn this component into a standalone package. No equivalent integration with Vue was found -->
  <div>
    <div
      ref="galleryElement"
      :class="[settings.galleryClass, baseGalleryClass]"
      :itemscope="settings.useSchemaMarkup"
      :itemtype="settings.useSchemaMarkup && 'http://schema.org/ImageGallery'"
    >
      <!-- You can insert your own markup in default scoped slot -->
      <slot :items="items">
        <div
          v-for="(item, index) in columnsFirstItems"
          :key="`col-${index}`"
          :class="getColumnContainerClass(index)"
        >
          <div
            v-for="(thumbnail, j) in getColumnItems(item, index)"
            :key="`image-${item.originalIndex + j}`"
            :class="[
              getColumnClass(index),
              thumbnail.hidden ? 'vue-photo-swipe__thumbail--hidden' : ''
            ]"
          >
            <div
              v-if="thumbnailCSSRatio"
              :style="`padding-top: ${thumbnailCSSRatio}`"
            />
            <figure
              :src="thumbnail.src"
              :class="[settings.thumbnailContainerClass, baseThumbnailContainerClass]"
              itemprop="associatedMedia"
              itemscope
              itemtype="http://schema.org/ImageObject"
              @click.capture.prevent="openPhotoSwipe(item.originalIndex + j)"
            >
              <a
                :href="thumbnail.src"
                :class="settings.anchorClass"
                :title="thumbnail.title"
                itemprop="contentUrl"
              >
                <img
                  :src="thumbnail.msrc || thumbnail.src"
                  :alt="thumbnail.alt"
                  :class="settings.thumbnailClass"
                  :data-pswp-pid="item.originalIndex + j"
                  itemprop="thumbnail"
                >
              </a>
            </figure>
          </div>
        </div>
      </slot>
    </div>

    <div
      :class="['pswp', settings.pswpClass]"
      tabindex="-1"
      role="dialog"
      aria-hidden="true"
    >
      <div class="pswp__bg" />
      <div class="pswp__scroll-wrap">
        <div class="pswp__container">
          <div class="pswp__item" />
          <div class="pswp__item" />
          <div class="pswp__item" />
        </div>
        <div class="pswp__ui pswp__ui--hidden">
          <div class="pswp__top-bar">
            <div class="pswp__counter" />
            <button
              class="pswp__button pswp__button--close"
              title="Close (Esc)"
            />

            <button
              class="pswp__button pswp__button--share"
              title="Share"
            />
            <button
              class="pswp__button pswp__button--fs"
              title="Toggle fullscreen"
            />
            <button
              class="pswp__button pswp__button--zoom"
              title="Zoom in/out"
            />

            <span
              v-for="a in [-90, 90]"
              v-show="settings.rotateEl"
              :key="a"
              :class="['custom pswp__button', a === -90 ? '' : 'rotate-right']"
              @click="rotate(a)"
            >
              <!-- Material Icon: https://material.io/tools/icons/?search=rotate&icon=rotate_left -->
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
              >
                <path
                  d="M0 0h24v24H0z"
                  fill="none"
                /><path d="M7.11 8.53L5.7 7.11C4.8 8.27 4.24 9.61 4.07 11h2.02c.14-.87.49-1.72 1.02-2.47zM6.09 13H4.07c.17 1.39.72 2.73 1.62 3.89l1.41-1.42c-.52-.75-.87-1.59-1.01-2.47zm1.01 5.32c1.16.9 2.51 1.44 3.9 1.61V17.9c-.87-.15-1.71-.49-2.46-1.03L7.1 18.32zM13 4.07V1L8.45 5.55 13 10V6.09c2.84.48 5 2.94 5 5.91s-2.16 5.43-5 5.91v2.02c3.95-.49 7-3.85 7-7.93s-3.05-7.44-7-7.93z" />
              </svg>
            </span>

            <div class="pswp__preloader">
              <div class="pswp__preloader__icn">
                <div class="pswp__preloader__cut">
                  <div class="pswp__preloader__donut" />
                </div>
              </div>
            </div>
          </div>
          <div class="pswp__share-modal pswp__share-modal--hidden pswp__single-tap">
            <div class="pswp__share-tooltip" />
          </div>
          <button
            class="pswp__button pswp__button--arrow--left"
            title="Previous (arrow left)"
            @click="resetAngle"
          />
          <button
            class="pswp__button pswp__button--arrow--right"
            title="Next (arrow right)"
            @click="resetAngle"
          />
          <div class="pswp__caption">
            <div class="pswp__caption__center" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PhotoSwipe from 'photoswipe/dist/photoswipe'
import photoSwipeUIDefault from 'photoswipe/dist/photoswipe-ui-default'
import 'photoswipe/dist/photoswipe.css'
import 'photoswipe/dist/default-skin/default-skin.css'

export default {
  props: {
    items: {
      type: Array,
      default: () => []
    },
    options: { // PhotoSwipe + (Component options in vueSettings)
      default: () => ({}),
      type: Object
    },
  },
  data () {
    return {
      angle: 0,
      initialImageSlots: 4, // counted in normal-size images, only used in default markup
      baseThumbnailContainerClass: 'vue-photo-swipe__thumbail-container',
      baseGalleryClass: 'vue-photo-swipe__gallery',
    }
  },
  computed: {
    initialImageSize () {
      return this.settings.hasInitialImage ? this.initialImageSlots : 1
    },
    settings () { // Extracts component options with defaults below
      return Object.assign({}, {
        hasInitialImage: true, // Set to true to set all images to the same size

        nbColumns: 3, // works only with default HTML.
        // Depending on layout, columns can become rows and vice versa
        // Column is just a name for the primary container
        // Initial image column can be bigger than the others though

        hideExtraneousImages: true, // to get a nice rectangle
        maxNbThumbnails: this.items.length, // if lower, additional images still show up in opened gallery

        rotateEl: false, // 2 buttons added to PhotoSwipe own controls if true

        // Disable Schema Markup if not needed or when using custom gallery HTML
        useSchemaMarkup: !this.$slots.default
      }, this.options.vueSettings)
    },
    thumbnailCSSRatio () {
      const ratio = this.settings.thumbnailAspectRatio
      return ratio ? `${(1 / ratio) * 100}%` : null
    },
    initialImageOffset () {
      return this.initialImageSize % this.settings.nbColumns
    },
    columnsFirstItems () {
      const nbFullColumns = Math.floor(this.items.length / this.settings.nbColumns)
      const nbImagesToShow = nbFullColumns ? nbFullColumns * this.settings.nbColumns : 1
      const hideExtraneous = this.settings.hideExtraneousImages

      return this.items
        .map((item, i) => {
          item.originalIndex = i // saved to keep track in markup
          if (i >= nbImagesToShow && hideExtraneous) item.hidden = true
          if (i >= this.settings.maxNbThumbnails) item.hidden = true
          return item
        })
        .filter((item, i) => {
          return i === 0 ||
            (this.initialImageSize > 1 && i === 1) ||
            (i % this.settings.nbColumns) === 0
        })
    }
  },
  mounted () {
    this.initPhotoSwipeFromDOM(`.${this.baseGalleryClass}`)
  },
  methods: {
    getColumnItems (colFirstItem, colIndex) {
      const isInitialImage = colIndex === 0 && this.initialImageSize > 1
      const slotsForInitialImage = +(colIndex === 1 && this.initialImageOffset) // second col only

      return this.items
        .map((item, i) => {
          if (i >= this.settings.maxNbThumbnails) item.hidden = true
          return item
        })
        .slice(colFirstItem.originalIndex, isInitialImage ? 1
          : colFirstItem.originalIndex + this.settings.nbColumns - slotsForInitialImage
        )
    },
    getClassFromClassArray (cl, index) {
      if (typeof cl === 'string') return cl // constant class
      if (!cl || !cl.length) return ''

      // last column class for all last columns without explicit class
      return cl.length <= index ? cl[cl.length - 1] : cl[index]
    },
    getColumnContainerClass (index) {
      return this.getClassFromClassArray(this.settings.columnContainerClass, index)
    },
    getColumnClass (column) { // all thumbnails have the same class in a given column
      return this.getClassFromClassArray(this.settings.columnClass, column)
    },
    openPhotoSwipe (index, disableAnimation, fromURL) {
      const pswpElement = this.$el.querySelector('.pswp')
      const images = this.items

      const options = {
        getThumbBoundsFn: i => {
          // See PhotoSwipe Options -> getThumbBoundsFn section of documentation for more info
          const thumbnail = this.$el.querySelector(`img[data-pswp-pid="${i}"]`) // find thumbnail
          const pageYScroll = window.pageYOffset || document.documentElement.scrollTop
          const rect = thumbnail.getBoundingClientRect()

          return { x: rect.left, y: rect.top + pageYScroll, w: rect.width }
        }
      }
      if (this.$refs.galleryElement) {
        // allows to open from URL
        options.galleryUID = this.$refs.galleryElement.getAttribute('data-pswp-uid')
      }

      if (fromURL) { // PhotoSwipe opened from URL
        if (options.galleryPIDs) {
          // parse real index when custom PIDs are used
          // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
          for (let j = 0; j < images.length; j++) {
            if (index === parseInt(images[j].pid, 10)) {
              options.index = j
              break
            }
          }
        } else { // in URL indexes start from 1
          options.index = parseInt(index, 10) - 1
        }
      } else {
        options.index = parseInt(index, 10)
      }

      // exit if index not found
      if (isNaN(options.index)) return

      if (disableAnimation) options.showAnimationDuration = 0

      const gallery = new PhotoSwipe(
        pswpElement,
        photoSwipeUIDefault,
        images,
        Object.assign(options, this.options)
      )
      gallery.init()
    },
    initPhotoSwipeFromDOM (gallerySelector) {
      // parse picture index and gallery index from URL (#&pid=1&gid=2)
      const photoswipeParseHash = () => {
        const hash = window.location.hash.substring(1)
        const params = {}

        if (hash.length < 5) return params

        const vars = hash.split('&')
        for (let i = 0; i < vars.length; i++) {
          if (!vars[i]) continue

          const pair = vars[i].split('=')
          if (pair.length < 2) continue
          params[pair[0]] = pair[1]
        }

        if (params.gid) params.gid = parseInt(params.gid, 10)

        return params
      }

      // All galleries should only react to the right URLs with consistent uid
      // May be problematic if galleries are loaded in non-deterministic order
      // Explicit `galleryUID` option is safer
      const galleryElements = document.querySelectorAll(gallerySelector)

      for (let i = 0, l = galleryElements.length; i < l; i++) {
        galleryElements[i].setAttribute('data-pswp-uid', i + 1)
      }

      if (!this.$refs.galleryElement) return

      let currentGalleryId = this.$refs.galleryElement.getAttribute('data-pswp-uid')
      try {
        currentGalleryId = parseInt(currentGalleryId, 10)
      } catch (e) {
        // Do nothing
      }

      // Parse URL and open gallery if it contains #&pid=3&gid=1
      const hashData = photoswipeParseHash()

      if (hashData.pid && hashData.gid && hashData.gid === currentGalleryId) {
        this.openPhotoSwipe(hashData.pid, true, true)
      }
    },
    rotate (newAngle, absolute = false) {
      this.angle = newAngle + (absolute ? 0 : this.angle)
      this.$el.querySelectorAll('.pswp__img').forEach(i => {
        i.style.transform = `rotate(${this.angle}deg)`
      })
    },
    resetAngle () {
      this.rotate(0, true)
    }
  }
}
</script>

<style>
  .vue-photo-swipe__thumbail--hidden {
    display: none;
  }
  .pswp__top-bar {
    text-align: right;
  }
  .pswp__caption__center {
    text-align: center;
  }
  .rotate-right {
    transform: scale(-1, 1);
  }
  .custom.pswp__button {
    background: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .custom.pswp__button svg {
    fill: white;
  }
  figure {
    margin: 0;
  }
</style>
