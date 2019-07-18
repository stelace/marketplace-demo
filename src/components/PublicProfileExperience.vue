<script>
import { get } from 'lodash'

export default {
  props: {
    experience: {
      type: Object,
      required: true
    },
    editable: {
      type: Boolean,
      default: false
    },
    headerTag: {
      type: String,
      default: 'h3'
    }
  },
  computed: {
    locationName () {
      return get(this.experience, 'location.shortDisplayName', '')
    }
  }
}
</script>

<template>
  <QCard
    flat
    class="public-profile-experience-card"
  >
    <QCardSection class="public-profile-experience-content row q-py-xs q-px-sm">
      <div class="col-11">
        <component
          :is="headerTag"
          class="text-h6 text-weight-medium q-ma-none ellipsis"
        >
          {{ experience.jobTitle }}
        </component>
        <div class="text-subtitle2 ellipsis">
          {{ experience.companyName }}
        </div>
        <div class="text-grey-7 text-capitalize">
          <AppContent
            tag="span"
            entry="time"
            field="date_fullmonth"
            :options="{ date: new Date(experience.startDate) }"
          />
          -
          <AppContent
            v-if="experience.endDate"
            tag="span"
            entry="time"
            field="date_short"
            :options="{ date: new Date(experience.endDate) }"
          />
          <AppContent
            v-else
            tag="span"
            entry="time"
            field="today"
          />
        </div>
        <div class="text-grey-7">
          {{ locationName }}
        </div>
        <!-- eslint-disable-next-line vue/singleline-html-element-content-newline -->
        <div class="q-mt-md preserve-lines">{{ experience.description }}</div>
      </div>
      <div class="col-1">
        <div class="row justify-center">
          <QIcon
            v-show="editable"
            class="public-profile-experience-edit-icon cursor-pointer"
            size="1.25rem"
            name="edit"
            aria-hidden
            @click="$emit('edit', experience)"
          />
        </div>
      </div>
    </QCardSection>
  </QCard>
</template>

<style lang="stylus" scoped>
$public-profile-experience-edit-opacity = 0.5

.public-profile-experience-card
  width: 100%
  border-bottom: 1px solid $separator-color

.public-profile-experience-edit-icon
  opacity: $public-profile-experience-edit-opacity
  transition: opacity 300ms ease

.public-profile-experience-edit-icon
  &:focus, &:hover
    opacity: 1
</style>
