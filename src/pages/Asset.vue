<template>
  <q-page
    :key="activeAsset.id"
    class="stl-footer--bottom"
  >
    <div class="row justify-center">
      <div class="gt-md">
        <QPageSticky position="top-right" :offset="[50, 20]">
          <TransactionCard />
        </QPageSticky>
      </div>
      <div class="full-width stl-content-container q-pb-xl">
        <div class="q-px-lg q-pt-lg">
          <AppSwitchableEditor
            tag="h1"
            class="text-h4 text-weight-bold q-my-xs"
            :value="activeAsset.name"
            :active="isCurrentUserTheOwner"
            :custom-save="updateAssetFn('name')"
            :input-label="$t({ id: 'asset.name_label' })"
          />
          <AppContent
            v-if="activeAsset.id && (!isAvailable || !activeAsset.active)"
            class="text-uppercase non-selectable"
            tag="QChip"
            entry="asset"
            field="unavailable"
            square
            color="warning"
            text-color="white"
          />

          <AppContent
            v-if="activeAsset.startDate"
            tag="div"
            class="text-body1 text-weight-medium"
            entry="time"
            field="from_start_date_to_end_date"
            :options="{ startDate: activeAsset.startDate, endDate: activeAsset.endDate }"
          />
        </div>

        <div class="row justify-between q-px-lg q-my-md">
          <AppSwitchableEditor
            tag="div"
            class="col-6 text-body1"
            :value="activeAsset.locationName"
            :active="isCurrentUserTheOwner"
            :custom-save="updateAssetFn('locations')"
          >
            <template>
              <!-- v-slot:default="{ content }" -->
              <div class="text-h6 ellipsis">
                {{ activeAsset.locationName }}
              </div>
            </template>
            <template v-slot:placeholder>
              <AppContent
                entry="places"
                field="address_placeholder"
              />
            </template>
            <template v-slot:edition="{ content, saveDraft }">
              <PlacesAutocomplete
                :initial-query="activeAsset.locationName"
                :label="$t({ id: 'places.address_placeholder' })"
                @selectPlace="loc => prepareUpdatedLocations(loc, saveDraft)"
              />
            </template>
          </AppSwitchableEditor>

          <AppSwitchableEditor
            tag="div"
            class="flex-item--auto text-h5 text-weight-medium"
            :value="activeAsset.price"
            :active="isCurrentUserTheOwner"
            :custom-save="updateAssetFn('price')"
            :input-label="$t({ id: 'pricing.price_label' })"
            input-type="number"
          >
            <AppContent
              v-if="activeAsset.assetType && activeAsset.assetType.timeBased"
              entry="pricing"
              field="price_per_time_unit_label"
              :options="{
                price: $fx(activeAsset.price),
                timeUnit: activeAsset.timeUnit
              }"
            />
            <AppContent
              v-else
              entry="pricing"
              field="price_with_currency"
              :options="{ price: $fx(activeAsset.price) }"
            />
          </AppSwitchableEditor>
        </div>

        <div class="text-center q-mb-md">
          <div v-if="!isEditingImages">
            <VuePhotoSwipe
              v-if="galleryItems.length"
              :options="getResourceGalleryOptions(activeAsset)"
              :items="galleryItems"
            />
            <AppContent
              v-if="isCurrentUserTheOwner"
              class="q-ma-lg"
              tag="QBtn"
              color="primary"
              entry="prompt"
              :field="galleryItems.length ? 'edit_pictures' : 'add_pictures'"
              :rounded="style.roundedTheme"
              @click="toggleImageEdition"
            />
          </div>
          <div v-else-if="isCurrentUserTheOwner">
            <AppGalleryUploader
              :reused-images="activeAsset.images"
              @upload-completed="uploadCompleted"
              @reorder="files => uploadCompleted({ uploadedOrReused: files })"
              @remove="removeImage"
            />
            <AppContent
              class="q-ma-md"
              tag="QBtn"
              color="positive"
              entry="navigation"
              field="close"
              :rounded="style.roundedTheme"
              @click="toggleImageEdition(false)"
            />
          </div>
        </div>

        <div class="q-pa-sm text-body1">
          <AppContent
            tag="h3"
            class="text-h4 text-weight-medium"
            entry="asset"
            field="description_label"
          />

          <AppSwitchableEditor
            tag="p"
            class="q-my-lg q-mx-sm text-justify"
            :value="activeAsset.description"
            :active="isCurrentUserTheOwner"
            :custom-save="updateAssetFn('description')"
            :input-label="$t({ id: 'asset.description_label' })"
            allow-falsy-save
            input-type="textarea"
          />

          <div
            v-if="assetCustomAttributes.length"
            class="row text-weight-medium q-py-sm"
          >
            <div v-if="isCurrentUserTheOwner">
              <CustomAttributesEditor
                :definitions="customAttributesOfTypes(['boolean'])"
                :values="activeAsset.customAttributes"
                @change="changeCustomAttributes"
              />
            </div>
            <div v-else>
              <!-- We only keep truthy customAttributes values but depending on UI we could need falsy ones as well -->
              <!-- For instance: `smoking: false` -->
              <div
                v-for="attribute in assetCustomAttributes.filter(ca => !!ca.value && ca.type === 'boolean')"
                :key="attribute.name"
                class="non-selectable col-12 col-sm-4 q-mb-sm"
              >
                <QIcon
                  class="q-mr-sm"
                  :name="attribute.materialIcon"
                  color="secondary"
                  size="1.5rem"
                />
                <AppContent
                  :entry="attribute.label.entry"
                  :field="attribute.label.field"
                  :default-message="attribute.label.default"
                />
              </div>
            </div>
          </div>

          <div v-if="assetCustomAttributes.length" class="q-py-sm">
            <div
              v-for="attribute in assetCustomAttributes.filter(
                ca => ca.type === 'text' && !isShortTextValue(ca.value)
              )"
              :key="attribute.name"
            >
              <div
                v-if="isCurrentUserTheOwner || (!isCurrentUserTheOwner && !!attribute.value)"
                class="q-mb-lg"
              >
                <AppContent
                  tag="h3"
                  class="text-h4 q-mt-sm text-weight-medium"
                  :entry="attribute.label.entry"
                  :field="attribute.label.field"
                  :default-message="attribute.label.default"
                />
                <div>
                  <AppSwitchableEditor
                    :value="attribute.value"
                    :active="isCurrentUserTheOwner"
                    :custom-save="updateAssetFn(attribute.name, true)"
                    allow-falsy-save
                  />
                </div>
              </div>
            </div>

            <div
              v-for="attribute in assetCustomAttributes.filter(
                ca => ca.type === 'text' && isShortTextValue(ca.value)
              )"
              :key="attribute.name"
            >
              <div
                v-if="isCurrentUserTheOwner || (!isCurrentUserTheOwner && !!attribute.value)"
                class="row"
              >
                <AppContent
                  class="text-weight-medium col-12 col-sm-4 q-mb-sm"
                  :entry="attribute.label.entry"
                  :field="attribute.label.field"
                  :default-message="attribute.label.default"
                />
                <div class="col-12 col-sm-4 q-mb-md">
                  <AppSwitchableEditor
                    :value="attribute.value"
                    :active="isCurrentUserTheOwner"
                    :custom-save="updateAssetFn(attribute.name, true)"
                    allow-falsy-save
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <section
          v-show="assetRatingsLoaded && ratingsActive"
          class="q-mt-md"
        >
          <QSeparator class="q-mt-xl" />

          <TransactionRatingsList
            :ratings="assetRatingsByTransaction"
            :target="activeAsset.owner"
            :show-asset-name="false"
            filter-on-asset
          />
        </section>

        <section
          v-if="similarAssets.length"
          class="q-px-sm"
        >
          <q-separator class="q-mt-lg" />

          <AppContent
            tag="h3"
            class="text-h4 text-weight-medium"
            entry="asset"
            field="similar_assets"
          />
          <div class="row q-col-gutter-md justify-assets">
            <AssetCard
              v-for="asset of similarAssets"
              :key="asset.id"
              class="col-10 col-sm-6"
              :asset="asset"
            />
          </div>
        </section>

        <div class="q-mt-xl">
          <ProfileCard />
        </div>

        <section
          v-if="ownerAssets.length"
          class="q-px-sm"
        >
          <QSeparator class="q-mt-xl" />

          <AppContent
            tag="h3"
            class="text-h4 text-weight-medium"
            entry="user"
            field="assets_title"
            :options="{ user: (isCurrentUserTheOwner ? '_SELF_' : ownerDisplayName) || undefined }"
          />
          <div class="row q-col-gutter-md justify-assets">
            <component
              :is="isCurrentUserTheOwner ? 'OwnerAssetCard' : 'AssetCard'"
              v-for="asset of ownerAssets"
              :key="asset.id"
              class="col-10 col-sm-6"
              :asset="asset"
              @remove="removeAsset"
            />
          </div>
        </section>
      </div>
    </div>
    <!-- Sticky sidebar for booking apps -->
    <!-- Use these classes for asset-content div: col-md-7 col-lg-4 col-xl-3 offset-md-1 offset-lg-3 offset-xl-4 -->
    <!-- <q-page-sticky class="force-flex-start no-pointer-events" position="top" :offset="[0,0]" expand>
      <div class="sticky-transaction-container offset-md-8 offset-lg-7 offset-xl-7 col-md-3 col-lg-2 col-xl-1">
        <div class="sticky-transaction all-pointer-events q-ml-lg">
          Qui officia est deserunt qui ipsum qui esse id. Cillum esse duis non cupidatat. Consectetur culpa velit magna laborum quis et exercitation et eu veniam. Labore velit anim officia nisi. Culpa sit nulla laboris excepteur labore. Dolor Lorem irure anim mollit enim consequat quis ullamco velit in culpa. Nostrud sunt culpa et sint dolore ex sit proident consectetur quis aute ut ullamco.
        </div>
      </div>
    </q-page-sticky> -->
    <AppFooter />
  </q-page>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { get, map, sortBy, values, compact, flatten, groupBy, isUndefined } from 'lodash'

import { extractLocationDataFromPlace } from 'src/utils/places'

import {
  populateAsset,
} from 'src/utils/asset'

import * as mutationTypes from 'src/store/mutation-types'
import AppGalleryUploader from 'src/components/AppGalleryUploader'
import CustomAttributesEditor from 'src/components/CustomAttributesEditor'
import OwnerAssetCard from 'src/components/OwnerAssetCard'
import PlacesAutocomplete from 'src/components/PlacesAutocomplete'
import SelectCategories from 'src/components/SelectCategories'
import TransactionCard from 'src/components/TransactionCard'
import ProfileCard from 'src/components/ProfileCard'
import TransactionRatingsList from 'src/components/TransactionRatingsList'

import PageComponentMixin from 'src/mixins/pageComponent'
import PaymentMixin from 'src/mixins/payment'

export default {
  components: {
    AppGalleryUploader,
    CustomAttributesEditor,
    OwnerAssetCard,
    PlacesAutocomplete,
    SelectCategories,
    TransactionCard,
    TransactionRatingsList,
    ProfileCard,
    VuePhotoSwipe: () => import(/* webpackChunkName: 'photoswipe' */ 'src/components/VuePhotoSwipe'),
  },
  mixins: [
    PageComponentMixin,
    PaymentMixin,
  ],
  data () {
    return {
      ownerSimilarAssets: [],
      similarAssets: [],
      shortTextMaxLength: 128,
      checkoutDialogOpened: false,
      assetRatingsByTransaction: [],
      assetRatingsLoaded: false,
      isEditingImages: false,
    }
  },
  metaInfo () { // SEO, overriding any hard-coded content in translations
    return {
      title: this.activeAsset.name,
      meta: [{
        name: 'description',
        vmid: 'description',
        content: this.activeAsset.description
      }]
    }
  },
  computed: {
    assetCustomAttributes () {
      const attrs = Object.assign({}, this.activeAsset.customAttributes)
      const definitions = this.common.customAttributesById

      const assetTypeId = this.activeAsset.assetTypeId
      const config = this.common.config
      const editableCustomAttributeNames = get(config, `stelace.instant.assetTypes.${assetTypeId}.customAttributes`) || []

      // set to `null` undefined editable asset custom attributes
      // so they can appear in the UI for the owner
      editableCustomAttributeNames.forEach(name => {
        if (isUndefined(attrs[name])) attrs[name] = null
      })

      const populatedAssetAttrs = map(attrs, (v, k) => {
        const def = values(definitions).find(d => d.name === k)
        return Object.assign({ value: v }, def)
      })

      return sortBy(populatedAssetAttrs, ca => -ca.priority)
    },
    customAttributes () {
      return values(this.common.customAttributesById)
    },
    customAttributesByType () {
      const customAttributes = this.customAttributes // ensure Vue reactivity
      return groupBy(customAttributes, ca => ca.type)
    },
    galleryItems () {
      return this.getResourceGalleryItems(this.activeAsset)
    },
    isCurrentUserTheOwner () {
      return this.currentUser.id === this.activeAsset.ownerId
    },
    ownerDisplayName () {
      return get(this.activeAsset, 'owner.displayName')
    },
    ownAssets () {
      if (!this.isCurrentUserTheOwner) return []
      return this.usersAssets[this.currentUser.id] || []
    },
    ownerAssets () {
      return this.isCurrentUserTheOwner ? this.ownAssets : this.ownerSimilarAssets
    },
    isAvailable () {
      return this.isActiveAssetAvailable
    },
    ...mapState([
      'asset',
      'common',
      'layout',
      'route',
      'transaction',
      'rating',
      'style',
    ]),
    ...mapGetters([
      'activeAsset',
      'usersAssets',
      'getResourceGalleryItems',
      'getResourceGalleryOptions',
      'currentUser',
      'searchOptions',
      'isActiveAssetAvailable',
      'ratingsOptions',
      'ratingsActive',
      'paymentActive',
      'conversations',
    ]),
  },
  watch: {
    currentUser (current, previous) {
      if (current.id === previous.id) return

      this.afterAuth()

      if (this.paymentActive && current.id) this.viewConversationAfterSuccessfulPayment()
    },
    $route () {
      this.fetchRelatedAssets()
      this.resetTransactionParameters()
      this.$store.dispatch('resetTransactionPreview')
      this.fetchAssetRatingsByTransaction()
    },
    maxAvailableQuantity () {
      if (this.maxAvailableQuantity < this.quantity) {
        this.selectQuantity(this.maxAvailableQuantity)
      }
    }
  },
  async preFetch ({ store, currentRoute, redirect }) {
    const { id: assetId } = currentRoute.params

    try {
      await store.dispatch('fetchActiveAsset', { assetId })
    } catch (err) {
      const code = err.statusCode
      if (code >= 400 && code < 500) redirect(`/${code}`) // needs a string for SSR
      else throw err
    }
  },
  methods: {
    afterAuth () {
      // Not blocking. Move to (blocking) preFetch and remove $route watcher if optimizing for SEO
      // with server-side rendering (SSR)
      this.fetchRelatedAssets()
      this.fetchAssetRatingsByTransaction()
    },
    toggleImageEdition (editing) {
      this.isEditingImages = typeof editing === 'boolean'
        ? editing : !this.isEditingImages
    },
    uploadCompleted ({ uploadedOrReused }) {
      return this.updateAssetFn('images')(uploadedOrReused)
    },
    removeImage (removed) { // one single image
      const newImages = this.activeAsset.images.filter(img => img.name !== removed.name)
      return this.updateAssetFn('images')(newImages)
    },
    updateAssetFn (fieldName, isCustomAttribute) {
      return async (value) => {
        const attrs = {}
        if (fieldName === 'images') {
          attrs.metadata = {
            images: value
          }
        } else if (fieldName === 'customAttributes') {
          attrs.customAttributes = value
        } else if (isCustomAttribute) {
          attrs.customAttributes = {
            [fieldName]: value
          }
        } else {
          attrs[fieldName] = value
        }

        await this.$store.dispatch('updateActiveAsset', {
          assetId: this.activeAsset.id,
          attrs
        })
        this.notifySuccess('notification.saved')
      }
    },
    isShortTextValue (value) {
      return typeof value !== 'string' || value.length <= this.shortTextMaxLength
    },
    changeCustomAttributes (customAttributes) {
      return this.updateAssetFn('customAttributes')(customAttributes)
    },
    customAttributesOfTypes (types) {
      if (!Array.isArray(types)) return []
      return compact(flatten(types.map(t => this.customAttributesByType[t])))
    },
    prepareUpdatedLocations (place, handlerFn) {
      extractLocationDataFromPlace(place, loc => { handlerFn(loc ? [loc] : null) })
      // Note: array of locations expected, app handles only one for now.
    },
    async fetchAssetRatingsByTransaction () {
      if (!this.ratingsActive) return

      this.assetRatingsByTransaction = await this.$store.dispatch('fetchRatingsByTransaction', { assetId: this.activeAsset.id })
      this.assetRatingsLoaded = true
    },
    async fetchRelatedAssets () {
      await this.$store.dispatch('fetchAssetTypes')

      const assetTypeId = get(this.searchOptions, 'modes.default.assetTypesIds', [])

      const ownerId = get(this.activeAsset, 'ownerId')
      if (!ownerId) return {}

      if (this.isCurrentUserTheOwner) {
        await this.$store.dispatch('fetchUserAssets')
      } else {
        this.ownerSimilarAssets = await this.$store.dispatch('fetchAssets', {
          filters: {
            quantity: 1,
            assetTypeId,
            similarTo: this.activeAsset.id,
            filter: `_ownerId == ${ownerId}`
          },
          nbResults: 4
        })

        if (this.ratingActive) {
          const ownerSimilarAssetIds = this.ownerSimilarAssets.map(asset => asset.id)
          await this.$dispatch('fetchRatingsStats', { assetId: ownerSimilarAssetIds, groupBy: 'assetId' })
        }

        this.ownerSimilarAssets = this.ownerSimilarAssets.map(asset => {
          return populateAsset({
            asset,
            usersById: {},
            categoriesById: this.common.categoriesById,
            assetTypesById: this.common.assetTypesById,
            ratingsStatsByAssetId: this.rating.ratingsStatsByAssetId,
            ratingsOptions: this.ratingsOptions,
          })
        })
      }

      this.similarAssets = await this.$store.dispatch('fetchAssets', {
        // Restricting to same category for now
        filters: {
          quantity: 1,
          assetTypeId,
          similarTo: this.activeAsset.id,
          filter: ` _ownerId != ${ownerId}${
            this.activeAsset.categoryId ? ` && _categoryId[${this.activeAsset.categoryId}]` : ''
          }`
        },
        nbResults: 4
      })

      if (this.ratingActive) {
        const similarAssetIds = this.similarAssets.map(asset => asset.id)
        await this.$dispatch('fetchRatingsStats', { assetId: similarAssetIds, groupBy: 'assetId' })
      }

      this.similarAssets = this.similarAssets.map(asset => {
        return populateAsset({
          asset,
          usersById: {},
          categoriesById: this.common.categoriesById,
          assetTypesById: this.common.assetTypesById,
          ratingsStatsByAssetId: this.rating.ratingsStatsByAssetId,
          ratingsOptions: this.ratingsOptions,
        })
      })
    },
    resetTransactionParameters () {
      this.$store.commit(mutationTypes.SET_TRANSACTION_OPTIONS, {
        startDate: null,
        endDate: null,
        quantity: 1
      })
    },
    removeAsset (assetId) {
      const { id } = this.$route.params

      // if the asset removal concerns the current page, redirect to new asset
      if (assetId === id) {
        this.$router.push({ name: 'newAsset' })
      }
    }
  },
}
</script>

<style lang="stylus" scoped>
.justify-assets
  justify-content: center
  @media (min-width: $breakpoint-sm-min)
    justify-content: start

.transaction-card
  width: 300px
  border: 1px solid $grey-3
// .transaction-card__content
</style>
