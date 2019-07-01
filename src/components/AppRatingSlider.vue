<template>
  <div class="rating-slider-container relative-position">
    <QSlider
      class="rating-slider"
      v-bind="$attrs"
      :label="false"
      v-on="$listeners"
    />
    <div class="rating-slider-value absolute">
      {{ $formatNumber(valuePercent, { style: 'percent' }) }}
    </div>
  </div>
</template>

<script>
export default {
  computed: {
    valuePercent () {
      let value = this.$attrs.value || 0
      return value / 100
    }
  }
}
</script>

<style lang="stylus">
$slider-height = 40px
$slider-track-height = 18px

.rating-slider-container .q-slider__track-container
  top: (($slider-height - $slider-track-height) / 2)
  height: 18px
  border-radius: 10px
  background-color: #DDD

.rating-slider-container .q-slider--inactive .q-slider__thumb-container,
.rating-slider-container .q-slider--active .q-slider__thumb-container
  display: none

.rating-slider-value
  top: 15px
  line-height: 9px
  color: #FFF
  left: 50%
  transform: translate(-50%, 0)
  font-weight: bold
  pointer-events: none
</style>
