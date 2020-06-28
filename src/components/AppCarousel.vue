<script>
import { fill } from 'lodash'
export default {
  props: {
    items: {
      type: Array, // expected to be null when loading
      default: () => []
    },
    nbItemsPerSlide: {
      type: Number,
      default: 3
    },
    nbSlides: { // Can be less when there are few items
      type: Number,
      default: 4
    }, // Can be less when there are few assets
    active: {
      type: Boolean,
      default: true
    },
    arrows: {
      type: Boolean,
      default: false
    },
    slideDuration: {
      type: Number,
      default: 10000
    }
  },
  data () {
    return {
      slide: 1,
    }
  },
  computed: {
    nbSlidesVisible () {
      if (!Array.isArray(this.items)) return 1
      const nbFullSlides = Math.floor(this.items.length / this.nbItemsPerSlide)
      return this.active ? Math.min(this.nbSlides, nbFullSlides) : 1
    },
  },
  methods: {
    getSlideItems (index) {
      // Array.fill not polyfilled (IE11)
      // TODO: Reconsider using it with @quasar/app v2
      if (!Array.isArray(this.items)) return fill(Array(this.nbItemsPerSlide), null)
      return this.items.slice(this.nbItemsPerSlide * (index - 1), this.nbItemsPerSlide * index)
    },
  }
}
</script>

<template>
  <component
    :is="nbSlidesVisible > 1 && active ? 'QCarousel' : 'div'"
    v-model="slide"
    :class="[
      active && arrows ? 'q-pl-sm' : '' // offsetting QCarouselSlide right gutter
    ]"
    transition-prev="slide-right"
    transition-next="slide-left"
    control-color="default-color"
    :autoplay="slideDuration"
    :arrows="arrows"
    padding
    navigation
    animated
    infinite
    v-bind="$attrs"
  >
    <QCarouselSlide
      v-for="index in nbSlidesVisible"
      :key="index"
      :name="index"
      class="row q-col-gutter-md justify-center"
    >
      <slot :items="items">
        <AssetCard
          v-for="(item, i) of getSlideItems(index)"
          :key="i"
          class="col-12 col-sm-6 col-md-3"
          :asset="item"
        />
      </slot>
    </QCarouselSlide>
  </component>
</template>

<style lang="stylus" scoped>
</style>
