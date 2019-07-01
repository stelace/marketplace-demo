<script>
import { sortBy } from 'lodash'

import PublicProfileExperience from 'src/components/PublicProfileExperience'
import PublicProfileExperienceDialog from 'src/components/PublicProfileExperienceDialog'

export default {
  components: {
    PublicProfileExperience,
    PublicProfileExperienceDialog,
  },
  props: {
    experiences: {
      type: Array,
      required: true
    },
    editable: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      dialogOpened: false,
      editedExperience: {},
    }
  },
  computed: {
    sortedExperiences () {
      return this.sortExperiences(this.experiences)
    }
  },
  methods: {
    closeDialog () {
      this.dialogOpened = false
    },
    editExperience (experience) {
      this.editedExperience = experience
      this.showDialog()
    },
    addExperience () {
      const experience = {
        companyName: '',
        jobTitle: '',
        startDate: null,
        endDate: null,
        description: '',
        location: null,
      }
      this.editedExperience = experience
      this.showDialog()
    },
    removeExperience (id) {
      const newExperiences = this.experiences.filter(experience => experience.id !== id)
      const sortedExperiences = this.sortExperiences(newExperiences)
      this.$emit('change', sortedExperiences)
    },
    sortExperiences (experiences) {
      return sortBy(experiences, experience => -new Date(experience.startDate).getTime())
    },
    saveExperience (experience) {
      const isNewExperience = !experience.id

      let sortedExperiences

      if (isNewExperience) {
        sortedExperiences = this.sortExperiences(
          this.experiences.concat(
            Object.assign({}, experience, { id: this.getNewKey() })
          )
        )
      } else {
        const newExperiences = this.experiences.map(exp => {
          if (exp.id === experience.id) {
            return experience
          } else {
            return exp
          }
        })

        sortedExperiences = this.sortExperiences(newExperiences)
      }

      this.$emit('change', sortedExperiences)
    },
    getNewKey () {
      return `exp_${new Date().toISOString()}`
    },
    showDialog () {
      this.dialogOpened = true
    }
  },
}
</script>

<template>
  <div class="public-profile-experience-card-list">
    <div class="row justify-between items-center q-px-sm">
      <slot name="title">
        <AppContent
          tag="h2"
          class="text-h4 text-weight-medium"
          entry="user"
          field="experiences.my_experiences"
        />
      </slot>
      <div class="row justify-center">
        <QIcon
          v-show="editable"
          class="public-profile-experience-add-icon cursor-pointer"
          size="2rem"
          name="add"
          aria-hidden
          @click="addExperience"
        />
      </div>
    </div>

    <QCard>
      <PublicProfileExperience
        v-for="experience of sortedExperiences"
        :key="experience.id"
        class="q-pa-md"
        :experience="experience"
        :editable="editable"
        @edit="editExperience"
      />
    </QCard>

    <PublicProfileExperienceDialog
      :opened="dialogOpened"
      :experience="editedExperience"
      @close="closeDialog"
      @save="saveExperience"
      @remove="removeExperience"
    />
  </div>
</template>

<style lang="stylus" scoped>
$public-profile-experience-add-opacity = 0.5

.public-profile-experience-card-list
  width: 100%

.public-profile-experience-add-icon
  opacity: $public-profile-experience-add-opacity
  transition: opacity 300ms ease

.public-profile-experience-add-icon
  &:focus, &:hover
    opacity: 1
</style>
