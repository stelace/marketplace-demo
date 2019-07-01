<script>
import { mapState } from 'vuex'
import { get, cloneDeep } from 'lodash'

import ConfirmDeleteDialog from 'src/components/ConfirmDeleteDialog'
import DateRangePicker from 'src/components/DateRangePicker'
import PlacesAutocomplete from 'src/components/PlacesAutocomplete'

export default {
  components: {
    ConfirmDeleteDialog,
    DateRangePicker,
    PlacesAutocomplete,
  },
  props: {
    experience: {
      type: Object,
      required: true
    },
    opened: {
      type: Boolean,
      default: false
    },
  },
  data () {
    return {
      editingExperience: {},
      confirmDeleteDialogOpened: false,
    }
  },
  computed: {
    ...mapState([
      'style',
    ]),
    locationName () {
      return get(this.editingExperience, 'location.shortDisplayName', '')
    },
    disabledSaveButton () {
      return !this.editingExperience.jobTitle ||
        !this.editingExperience.companyName ||
        !this.editingExperience.startDate ||
        (this.editingExperience.endDate && this.editingExperience.endDate < this.editingExperience.startDate)
    },
    isNewExperience () {
      return !this.editingExperience.id
    }
  },
  methods: {
    beforeOpen () {
      this.editingExperience = cloneDeep(this.experience)
    },
    onClose () {
      this.$emit('close')
    },
    shake () {
      this.$refs.experienceDialog.shake()
    },
    selectPlace (place) {
      this.editingExperience = Object.assign({}, this.editingExperience, {
        location: place
      })
    },
    save () {
      this.$emit('save', this.editingExperience)
      this.onClose()
    },
    remove () {
      this.hideConfirmDeleteDialog()

      this.$emit('remove', this.editingExperience.id)
      this.onClose()
    },
    selectStartDate (startDate) {
      this.editingExperience = Object.assign({}, this.editingExperience, {
        startDate
      })
    },
    selectEndDate (endDate) {
      this.editingExperience = Object.assign({}, this.editingExperience, {
        endDate
      })
    },
    showConfirmDeleteDialog () {
      this.confirmDeleteDialogOpened = true
    },
    hideConfirmDeleteDialog () {
      this.confirmDeleteDialogOpened = false
    }
  }
}
</script>

<template>
  <QDialog
    ref="experienceDialog"
    :value="opened"
    :maximized="$q.screen.lt.sm"
    persistent
    transition-show="slide-top"
    transition-hide="slide-bottom"
    @before-show="beforeOpen"
    @hide="onClose"
  >
    <QCard class="q-pa-md public-profile-experience-dialog-card">
      <QCardSection class="text-center">
        <QBtn
          flat
          :rounded="style.roundedTheme"
          color="primary"
          class="absolute-top-right"
          label="X"
          @click="onClose"
        />
      </QCardSection>
      <QCardSection>
        <QInput
          v-model="editingExperience.jobTitle"
          :label="$t({ id: 'user.experiences.job_title_label' })"
          autocomplete="jobTitle"
          bottom-slots
          :hint="!editingExperience.jobTitle ? $t({ id: 'form.error.missing_field' }) : ''"
          required
        />
        <QInput
          v-model="editingExperience.companyName"
          :label="$t({ id: 'user.experiences.company_name_label' })"
          autocomplete="companyName"
          bottom-slots
          :hint="!editingExperience.companyName ? $t({ id: 'form.error.missing_field' }) : ''"
          required
        />
        <PlacesAutocomplete
          :key="locationName"
          :label="$t({ id: 'user.experiences.location_label' })"
          :initial-query="locationName"
          bottom-slots
          @selectPlace="selectPlace"
        />
        <DateRangePicker
          :start-date="editingExperience.startDate"
          :end-date="editingExperience.endDate"
          start-date-required
          bottom-slots
          @changeStartDate="selectStartDate"
          @changeEndDate="selectEndDate"
        />
        <QInput
          v-model="editingExperience.description"
          :label="$t({ id: 'user.experiences.description_label' })"
          type="textarea"
          bottom-slots
        />
      </QCardSection>
      <QCardSection class="row justify-between">
        <QBtn
          flat
          :rounded="style.roundedTheme"
          color="primary"
          :disabled="disabledSaveButton"
          @click="save"
        >
          <AppContent
            entry="prompt"
            field="save_button"
          />
        </QBtn>
        <QBtn
          flat
          :rounded="style.roundedTheme"
          color="negative"
          :class="[isNewExperience ? 'invisible' : '']"
          @click="showConfirmDeleteDialog"
        >
          <AppContent
            entry="prompt"
            field="delete_button"
          />
        </QBtn>
      </QCardSection>
    </QCard>

    <ConfirmDeleteDialog
      :opened="confirmDeleteDialogOpened"
      @confirm="remove"
      @cancel="hideConfirmDeleteDialog"
    />
  </QDialog>
</template>

<style lang="stylus" scoped>
.public-profile-experience-dialog-card
  min-width: 20rem

  @media (min-width $breakpoint-sm-min)
    min-width: 30rem

  @media (min-width $breakpoint-md-min)
    min-width: 40rem
</style>
