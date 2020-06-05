<script>
import { compact, flatten, get, groupBy, values, pick } from 'lodash'
import { mapState, mapGetters } from 'vuex'
import { date } from 'quasar'

import EventBus from 'src/utils/event-bus'
import { isValidDateString } from 'src/utils/time'
import { extractLocationDataFromPlace } from 'src/utils/places'
import logger from 'src/utils/logger'

import BasicHeroLayout from 'src/layouts/BasicHeroLayout'

import AppGalleryUploader from 'src/components/AppGalleryUploader'
import CustomAttributesEditor from 'src/components/CustomAttributesEditor'
import DateRangePicker from 'src/components/DateRangePicker'
import PlacesAutocomplete from 'src/components/PlacesAutocomplete'
import SelectAssetType from 'src/components/SelectAssetType'
import SelectCategories from 'src/components/SelectCategories'

import PageComponentMixin from 'src/mixins/pageComponent'
import StripeMixin from 'src/mixins/stripe'

export default {
  components: {
    BasicHeroLayout,

    AppGalleryUploader,
    CustomAttributesEditor,
    DateRangePicker,
    PlacesAutocomplete,
    SelectAssetType,
    SelectCategories,
  },
  mixins: [
    PageComponentMixin,
    StripeMixin,
  ],
  data () {
    return {
      name: '',
      nameMaxLength: 70,
      description: '',
      descriptionMaxLength: 2000,
      price: null,
      startDate: '',
      endDate: '',
      quantity: 1,
      locations: [],
      options: ['option1'],
      selectedCategory: null,
      editingAssetType: null,
      visibleStep: 1,
      requestAuthentication: false,
      editingCustomAttributes: {},
      assetImages: [],
      newUserImages: [], // to add to user images for reuse
      uploaderFiles: [],
      creatingAsset: false,
    }
  },
  computed: {
    defaultAssetType () {
      return this.defaultActiveAssetType
    },
    isAssetTypeReadonly () {
      return !!this.asset.asset.id
    },
    categoryRequired () {
      const categories = values(this.common.categoriesById)
      return !!categories.length
    },
    showCategory () { // could depend on some env variable or config
      return this.categoryRequired
    },
    assetTypeRequired () {
      const assetTypes = values(this.common.assetTypesById)
      return !!assetTypes.length
    },
    selectedAssetType () {
      if (!this.asset.asset.id) {
        if (this.editingAssetType) return this.editingAssetType
        else if (this.defaultAssetType) return this.defaultAssetType
        else return null
      } else {
        return this.common.assetTypesById[this.asset.asset.assetTypeId] || null
      }
    },
    editableCustomAttributeNames () {
      if (!this.selectedAssetType) return []

      const config = this.common.config
      const assetTypesConfig = get(config, 'stelace.instant.assetTypes')

      if (!assetTypesConfig) return []

      const assetTypeConfig = assetTypesConfig[this.selectedAssetType.id]
      if (!assetTypeConfig) return []

      return assetTypeConfig.customAttributes || []
    },
    customAttributes () {
      const attrs = this.common.customAttributesById
      const activeNames = this.editableCustomAttributeNames

      return values(attrs).filter((ca) => activeNames.includes(ca.name))
    },
    customAttributesByType () {
      const customAttributes = this.customAttributes // ensure Vue reactivity
      return groupBy(customAttributes, ca => ca.type)
    },
    assetTypes () {
      return values(this.common.assetTypesById)
    },
    showAvailabilityDates () {
      if (!this.selectedAssetType) return false

      return this.selectedAssetType.timeBased && !this.selectedAssetType.infiniteStock
    },
    locationName () {
      const locations = this.locations
      return get(locations, '[0].shortDisplayName', '')
    },
    priceLabel () {
      const defaultPriceLabel = this.$t({ id: 'pricing.price_label' })
      if (!this.selectedAssetType || !this.selectedAssetType.timeBased) return defaultPriceLabel

      const timeUnit = get(this.selectedAssetType, 'timing.timeUnit')
      return this.$t({ id: 'pricing.price_per_time_unit_label' }, { timeUnit })
    },
    step () {
      const steps = [
        true, // fictive step 0
        true,
        false,
        false,
        false,
      ]

      if (this.name.length >= 1) { // with high debounce to reduce distraction while typing
        steps[2] = true
      }

      const validCategory = this.selectedCategory && this.selectedCategory.name
      if ((!this.categoryRequired || validCategory) && !isNaN(parseInt(this.price))) {
        steps[3] = true
      }

      let isValidStartDate = true
      let isValidEndDate = true
      if (this.startDate) {
        isValidStartDate = isValidDateString(this.startDate)
      }
      if (this.endDate) {
        isValidEndDate = isValidDateString(this.endDate)
      }

      if (!this.showAvailabilityDates || (this.showAvailabilityDates && isValidStartDate && isValidEndDate)) {
        // endDate is optional, so is quantity
        steps[4] = true
      }

      // Index of first falsy step
      return steps.indexOf(false) >= 0 ? steps.indexOf(false) - 1 : steps.length - 1
    },
    reusableImages () {
      return this.currentUser.id ? this.currentUser.images : []
    },
    ...mapState([
      'asset',
      'common',
      'content',
      'style',
    ]),
    ...mapGetters([
      'currentUser',
      'activeAssetTypes',
      'defaultActiveAssetType',
      'stripeActive',
    ]),
  },
  async preFetch ({ store }) {
    await store.dispatch('initEditAssetPage')
  },
  async mounted () {
    EventBus.$on('authStatusChanged', (status) => this.onAuthChange(status))
  },
  beforeDestroy () {
    EventBus.$off('authStatusChanged', (status) => this.onAuthChange(status))
  },
  methods: {
    afterAuth () {
      if (this.currentUser.id && this.currentUser.locations.length) {
        this.locations = [this.currentUser.locations[0]]
      }
    },
    changeCustomAttributes (customAttributes) {
      this.editingCustomAttributes = customAttributes
    },
    customAttributesOfTypes (types) {
      if (!Array.isArray(types)) return []
      return compact(flatten(types.map(t => this.customAttributesByType[t])))
    },
    selectAssetType (assetType) {
      this.editingAssetType = assetType
    },
    selectCategory (category) {
      this.selectedCategory = category
    },
    onAuthChange (status) {
      if (status === 'success' && this.requestAuthentication) {
        this.requestAuthentication = false

        this.createAsset()
      } else if (status === 'closed') {
        this.requestAuthentication = false
      }
    },
    filterCompleteFiles (files) {
      return files.filter(f => f.name && f.url)
    },
    uploaderFilesChanged (files) {
      this.uploaderFiles = files
      this.assetImages = this.filterCompleteFiles(files) // url can be undefined because upload is processing
    },
    removeImage (removed) {
      this.newUserImages = this.newUserImages.filter(img => img.name !== removed.name)
    },
    uploadCompleted ({ transformedUploadedFiles, uploadedOrReused }) {
      this.assetImages = uploadedOrReused
      this.newUserImages = transformedUploadedFiles

      if (this.creatingAsset) this.createAsset()
    },
    async createAsset () {
      if (!this.currentUser.id) {
        this.requestAuthentication = true
        this.openAuthDialog({ action: 'createAsset' })
        return
      }

      if (this.step > 3) {
        try {
          const uploadPending = this.uploaderFiles.length && this.assetImages.length < this.uploaderFiles.length
          this.creatingAsset = true

          // if upload is processing, do not perform the asset creation logic right now
          // the logic will be triggered at the end of the upload from afterUploadCompleted
          if (uploadPending) return

          const images = this.assetImages
          /* .map(img => { // clean reused images
              delete img.reused
              return img
            }) */

          let assetQuantity = this.quantity

          const shouldCreateAvailability = this.showAvailabilityDates && this.startDate

          const availabilityAttrs = {}

          if (shouldCreateAvailability) {
            const isAnUnavailability = !this.endDate

            if (!isAnUnavailability) {
              availabilityAttrs.startDate = this.startDate
              availabilityAttrs.endDate = this.endDate
              availabilityAttrs.quantity = this.quantity

              // we want the asset to be available only during the availability period
              assetQuantity = 0
            } else {
              availabilityAttrs.startDate = date.addToDate(new Date(), { year: -1 }).toISOString()
              availabilityAttrs.endDate = this.startDate
              availabilityAttrs.quantity = 0
            }
          }

          const attrs = {
            // autogrow on name QInput makes it a textarea, with possible line returns
            name: this.name.replace('\n', ''),
            assetTypeId: (this.selectedAssetType && this.selectedAssetType.id) || undefined, // `null` not allowed
            description: this.description,
            price: this.price,
            quantity: this.selectedAssetType ? (this.selectedAssetType.infiniteStock ? 1 : assetQuantity) : 1,
            locations: this.locations,
            categoryId: this.selectedCategory ? this.selectedCategory.id : null,
            customAttributes: pick(this.editingCustomAttributes, this.editableCustomAttributeNames),
            active: true,
            validated: true,
            metadata: {
              images,
              // Save dates to create custom availabilities with Workflows
              startDate: this.startDate,
              endDate: this.endDate
            }
          }

          if (this.content.currency) {
            attrs.currency = this.content.currency
          }

          const asset = await this.$store.dispatch('createAsset', { attrs })

          if (shouldCreateAvailability) {
            availabilityAttrs.assetId = asset.id
            await this.$store.dispatch('createAvailability', { attrs: availabilityAttrs })
          }

          this.notifySuccess('notification.saved')
          // this.resetForm() // useful when not keeping the user on the current page

          const updateUserImages = !!this.newUserImages.length
          const updateUserLocations = !!(!this.currentUser.locations.length && asset.locations.length)
          const needUpdateUser = updateUserImages || updateUserLocations

          if (needUpdateUser) {
            const attrs = {}

            if (updateUserImages) {
              const currentUserImages = this.currentUser.images.map(img => img.name)
              // Ensuring we create no duplicate if user has logged in after uploading existing images
              const dedup = this.newUserImages.filter(img => !currentUserImages.includes(img.name))

              attrs.images = this.currentUser.images.concat(dedup)
            }
            if (updateUserLocations) {
              attrs.locations = [asset.locations[0]]
            }

            try { // not awaiting this since it’s not critical
              this.$store.dispatch('updateUser', {
                userId: this.currentUser.id,
                attrs
              })
            } catch (e) {
              logger(e)
            }
          }

          this.creatingAsset = false

          // Show that the asset is ready…
          this.$router.push({ name: 'asset', params: { id: asset.id } })

          if (this.stripeActive) this.displayLinkStripeAccountMessage()
        } catch (err) {
          this.creatingAsset = false

          this.notifyWarning('error.unknown_happened_header')
        }
      }
    },
    /* resetForm () {
      this.name = ''
      this.description = ''
      this.price = null
      this.startDate = ''
      this.endDate = ''
      this.quantity = 1
      this.locations = []
      this.selectedCategory = null
      this.editingCustomAttributes = {}

      this.resetUploader()
    }, */
    selectStartDate (startDate) {
      this.startDate = startDate
    },
    selectEndDate (endDate) {
      this.endDate = endDate
    },
    forceEndDateAfterStartDate (date) {
      return new Date(date).toISOString() >= this.startDate
    },
    selectPlace (place) {
      this.locations = place ? [extractLocationDataFromPlace(place)] : []
    },
  }
}
</script>

<template>
  <BasicHeroLayout>
    <template v-slot:heroContent>
      <AppContent
        class="text-h4"
        tag="h1"
        entry="pages"
        field="new_asset.header"
      />
      <AppContent
        class="text-h6"
        tag="h2"
        entry="pages"
        field="new_asset.header"
      />
    </template>

    <section class="q-pa-sm">
      <form
        class="text-center stl-content-container stl-content-container--large margin-h-center q-mb-xl"
        @submit.prevent="createAsset"
      >
        <div class="step-1 q-py-lg">
          <div class="text-h5">
            {{ $t({ id: 'pages.new_asset.form_header' }) }}
          </div>
          <div class="row justify-center">
            <QInput
              v-model="name"
              class="row-input"
              :label="$t({ id: 'asset.name_label' })"
              :counter="name.length > nameMaxLength / 2"
              :maxlength="nameMaxLength"
              :rules="[
                name => !!name ||
                  $t({ id: 'form.error.missing_title' })
              ]"
              debounce="500"
              autogrow
              required
            />
          </div>
          <div
            v-if="assetTypeRequired && activeAssetTypes.length > 1"
            class="q-mt-md row justify-center"
          >
            <SelectAssetType
              :initial-asset-type="selectedAssetType"
              :label="$t({ id: 'asset.asset_type_label' })"
              :show-search-icon="false"
              :rules="[
                selectedAssetType => assetTypeRequired
                  ? (!!selectedAssetType || $t({ id: 'form.error.missing_field' }))
                  : true
              ]"
              class="row-input -small"
              :readonly="isAssetTypeReadonly"
              bottom-slots
              @change="selectAssetType"
            />
          </div>
        </div>

        <transition enter-active-class="animated fadeInUp">
          <div
            v-if="step > 1"
            class="step-2 q-py-lg"
          >
            <div class="row justify-around">
              <div v-if="showCategory" class="flex-item--grow-shrink-auto q-pr-lg">
                <SelectCategories
                  :set-category="selectedCategory"
                  :label="$t({ id: 'asset.category_label' })"
                  :show-search-icon="false"
                  :rules="[
                    selectedCategory => categoryRequired
                      ? (!!selectedCategory || $t({ id: 'form.error.missing_field' }))
                      : true
                  ]"
                  bottom-slots
                  @change="selectCategory"
                />
              </div>
              <div :style="showCategory ? 'flex: 1 2 auto;' : ''">
                <AppInputNumber
                  v-model="price"
                  :label="priceLabel"
                  :rules="[
                    price => Number.isFinite(price) ||
                      $t({ id: 'form.error.missing_price' })
                  ]"
                  required
                  bottom-slots
                />
              </div>
            </div>
          </div>
        </transition>

        <transition enter-active-class="animated fadeInUp">
          <div
            v-if="step > 2"
            class="step-3 q-py-lg"
          >
            <DateRangePicker
              v-show="showAvailabilityDates"
              class="q-mb-xl"
              :start-date="startDate"
              :end-date="endDate"
              :missing-end-date-meaning="$t({ id: 'time.missing_end_date_meaning' })"
              bottom-slots
              @changeStartDate="selectStartDate"
              @changeEndDate="selectEndDate"
            />

            <div class="row justify-around">
              <div class="col-12 col-sm-5">
                <PlacesAutocomplete
                  :label="$t({ id: 'places.address_placeholder' })"
                  :initial-query="locationName"
                  bottom-slots
                  @selectPlace="selectPlace"
                />
              </div>
              <div
                v-show="!selectedAssetType || !selectedAssetType.infiniteStock"
                class="col-12 col-sm-5"
              >
                <AppInputNumber
                  v-model="quantity"
                  :label="$t({ id: 'asset.quantity_label' })"
                  required
                  min="0"
                  :rules="[
                    quantity => quantity > 0 ||
                      $t({ id: 'form.error.missing_field' })
                  ]"
                  bottom-slots
                />
              </div>
            </div>
          </div>
        </transition>

        <transition enter-active-class="animated fadeInUp">
          <div
            v-if="step > 3"
            class="step-4 q-py-lg"
          >
            <div class="row justify-around">
              <div class="col-12 col-md-7">
                <QInput
                  v-model="description"
                  class="q-mb-md"
                  :label="$t({ id: 'asset.description_label' })"
                  :maxlength="descriptionMaxLength"
                  :counter="description.length > (descriptionMaxLength / 2)"
                  :rules="[
                    description => !!description ||
                      $t({ id: 'form.error.missing_description' })
                  ]"
                  :input-style="customAttributesByType['boolean']
                    ? `min-height: ${customAttributesByType['boolean'].length * 3}rem;` : ''"
                  type="textarea"
                  required
                />
              </div>
              <div
                v-if="customAttributesByType['boolean']"
                class="col-12 col-sm-6 col-md-5 q-pl-md"
              >
                <CustomAttributesEditor
                  :definitions="customAttributesByType['boolean']"
                  :values="editingCustomAttributes"
                  @change="changeCustomAttributes"
                />
              </div>
            </div>

            <div class="row q-py-lg justify-around">
              <CustomAttributesEditor
                :definitions="customAttributesOfTypes(['text', 'number'])"
                :values="editingCustomAttributes"
                class="col-12 col-sm-5"
                @change="changeCustomAttributes"
              />
              <CustomAttributesEditor
                :definitions="customAttributesByType['select']"
                :values="editingCustomAttributes"
                class="col-12 col-sm-5"
                @change="changeCustomAttributes"
              />
            </div>

            <div v-if="customAttributesByType['tags']" class="row q-py-lg justify-around">
              <CustomAttributesEditor
                :definitions="customAttributesByType['tags']"
                :values="editingCustomAttributes"
                class="col-12 col-sm-10"
                @change="changeCustomAttributes"
              />
            </div>

            <div class="step-asset-picture q-py-lg">
              <AppContent
                class="text-h5"
                tag="h3"
                entry="pages"
                field="new_asset.picture_incentive"
              />
              <AppGalleryUploader
                @uploader-files-changed="uploaderFilesChanged"
                @upload-completed="uploadCompleted"
                @remove="removeImage"
              />
            </div>

            <QBtn
              class="q-my-md text-weight-bold"
              :loading="creatingAsset"
              :label="$t( { id: 'prompt.create_button' })"
              :rounded="style.roundedTheme"
              :disabled="step < 4 || !uploaderFiles.length"
              color="secondary"
              size="lg"
              type="submit"
            />
            <AppContent
              v-show="!uploaderFiles.length"
              tag="div"
              class="text-body2 text-center text-grey q-pa-sm"
              entry="form"
              field="error.missing_image"
            />
          </div>
        </transition>
      </form>
    </section>
  </BasicHeroLayout>
</template>

<style lang="stylus" scoped>
.row-input
  flex: 1 0
  min-width: 0
  @media (min-width $breakpoint-sm-min)
    // Using flex-basis instead of max-width for IE11
    // https://github.com/philipwalton/flexbugs#flexbug-17
    flex: 0 0 30rem
  &.-small
    @media (min-width $breakpoint-sm-min)
      flex: 0 0 20rem
</style>
