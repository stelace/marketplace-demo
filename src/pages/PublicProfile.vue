<script>
// This is both user public profile page and profile editing (account) page when authenticated

import { mapGetters, mapState } from 'vuex'
import * as mutationTypes from 'src/store/mutation-types'
import { get, compact, uniqBy } from 'lodash'

import AppGalleryUploader from 'src/components/AppGalleryUploader'
import OwnerAssetCard from 'src/components/OwnerAssetCard'
import PlacesAutocomplete from 'src/components/PlacesAutocomplete'
import TransactionRatingsList from 'src/components/TransactionRatingsList'
import TheContextCard from 'src/components/TheContextCard'

import PageComponentMixin from 'src/mixins/pageComponent'

import { extractLocationDataFromPlace } from 'src/utils/places'
import { isUser, isProvider } from 'src/utils/user'
import { populateAsset } from 'src/utils/asset'

export default {
  components: {
    AppGalleryUploader,
    OwnerAssetCard,
    PlacesAutocomplete,
    TransactionRatingsList,
    TheContextCard,
    VuePhotoSwipe: () => import(/* webpackChunkName: 'photoswipe' */ 'src/components/VuePhotoSwipe'),
  },
  mixins: [
    PageComponentMixin,
  ],
  data () {
    return {
      suggestedOffers: [],
      isEditingImages: false,
      maxNbLocations: 4,
      locationsChanged: false,
      userRatingsStatsByTransaction: [],
      userRatingsLoaded: false
    }
  },
  computed: {
    isCurrentUser () {
      return this.currentUser.id === this.selectedUser.id
    },
    isUser () {
      return isUser(this.selectedUser)
    },
    selectedUserAssets () {
      return this.usersAssets[this.selectedUser.id] || []
    },
    selectedUserLocations () {
      return this.selectedUser.locations || []
    },
    underlyingUserAsset () {
      return (this.isUser && this.selectedUser.assetId) || null
    },
    isProvider () {
      return isProvider(this.selectedUser)
    },
    isCurrentUserProvider () {
      return isProvider(this.currentUser)
    },
    galleryItems () {
      return this.getResourceGalleryItems(this.selectedUser)
    },
    multipleLocationsEnabled () {
      return this.isUser
    },
    locationValue () {
      if (this.multipleLocationsEnabled) {
        // Hack to erase the content in locations AppSwitchableEditor
        if (this.locationsChanged) return ' '
        else return ''
      } else {
        return this.selectedUser.locationName
      }
    },
    showRatingsList () {
      return this.isUser && (this.isCurrentUser || this.canViewRatingsList || this.canViewRatingsListCta)
    },
    showRatingsListCta () {
      return this.isUser && this.canViewRatingsListCta
    },
    ...mapGetters([
      'selectedUser',
      'currentUser',
      'usersAssets',
      'getResourceGalleryItems',
      'getResourceGalleryOptions',
      'searchOptions',
      'suggestionSearchMode',
      'canViewRatingsList',
      'canViewRatingsListCta',
    ]),
    ...mapState([
      'asset',
      'content',
      'common',
      'layout',
      'style',
    ]),
  },
  async preFetch ({ store, currentRoute, redirect }) {
    const { id: userId } = currentRoute.params

    try {
      const user = await store.dispatch('fetchUser', { userId })

      store.commit({
        type: mutationTypes.SET_SELECTED_USER,
        user
      })
    } catch (err) {
      const code = err.statusCode
      if (code >= 400 && code < 500) redirect(`/${code}`) // needs a string for SSR
      else throw err
    }
  },
  watch: {
    'currentUser.id' () {
      if (this.showRatingsList) {
        this.fetchUserRatingsStatsByTransaction({ userId: this.selectedUser.id })
      }

      // disable for dev
      /* if (!this.canViewUserProfileDetails) {
        this.openAuthDialog({ persistent: true })
      } */
    },
    async '$route' () {
      // ensure appropriate assets are displayed when switching profiles
      await Promise.all([this.fetchUserAssets(), this.fetchSuggestions()])
    }
  },
  async created () {
    this.fetchUserAssets() // not blocking here
  },
  methods: {
    async afterAuth () {
      this.userId = this.$route.params.id

      await this.$store.dispatch('fetchAssetTypes')

      this.$store.dispatch('fetchRatingsStatsByType', { targetId: [this.userId] })

      if (this.currentUser.id) {
        this.fetchSuggestions()

        if (!this.galleryItems.length) this.toggleImageEdition(true)
      }

      if (this.underlyingUserAsset) {
        this.$store.dispatch('fetchAvailabilities', { assetId: this.underlyingUserAsset })
        this.$store.dispatch('fetchActiveAsset', { assetId: this.underlyingUserAsset })
        this.$store.dispatch('fetchAvailabilityGraph', { assetId: this.underlyingUserAsset })
      }
      if (isUser(this.selectedUser)) {
        this.$store.dispatch('fetchRecommendations', { userId: this.selectedUser.id })
      }
      if (this.showRatingsList) {
        this.fetchUserRatingsStatsByTransaction({ userId: this.selectedUser.id })
      }
    },
    async fetchUserAssets () {
      return this.$store.dispatch('fetchUserAssets', {
        userId: this.selectedUser.id
      })
    },
    async fetchSuggestions () {
      const assetTypesIds = get(this.searchOptions, `modes.${this.suggestionSearchMode}.assetTypesIds`, [])

      let query
      const filters = {
        quantity: 1
      }

      if (this.isUser) {
        if (this.selectedUser.categoryId) {
          filters.categoryId = this.selectedUser.categoryId
        } else {
          query = this.selectedUser.profileTitle
        }
      } else { // Suggest other offers with categories similar to this provider
        const categoriesIds = compact(uniqBy(this.selectedUserAssets.map(asset => asset.categoryId)))

        const showSuggestions = this.selectedUserAssets.some(asset => {
          return asset.validated && asset.active
        })
        if (!showSuggestions) return []

        filters.categoryId = categoriesIds
      }

      filters.assetTypeId = assetTypesIds

      if (this.underlyingUserAsset) filters.without = [this.underlyingUserAsset]

      const suggestedOffers = await this.$store.dispatch('fetchAssets', {
        query,
        filters,
        nbResults: 4
      })

      this.suggestedOffers = suggestedOffers.map(asset => {
        // populate assets to get the owner link
        return populateAsset({
          asset,
          usersById: {},
          categoriesById: this.common.categoriesById,
          assetTypesById: this.common.assetTypesById
        })
      })
    },
    async fetchUserRatingsStatsByTransaction ({ userId }) {
      this.userRatingsStatsByTransaction = await this.$store.dispatch('fetchRatingsStatsByTransaction', { targetId: userId })
      this.userRatingsLoaded = true
    },
    toggleImageEdition (editing) {
      this.isEditingImages = typeof editing === 'boolean'
        ? editing : !this.isEditingImages
    },
    updateUserFn (fieldName) {
      return async (value) => {
        await this.updateUser(fieldName, value)
      }
    },
    prepareUpdatedLocations (place, handlerFn) {
      if (this.multipleLocationsEnabled) {
        const existingLocations = this.selectedUser.locations
        extractLocationDataFromPlace(place, loc => { handlerFn(loc ? existingLocations.concat([ loc ]) : existingLocations) })
      } else {
        extractLocationDataFromPlace(place, loc => { handlerFn(loc ? [ loc ] : null) })
      }
    },
    async removeLocationByIndex (index) {
      const locations = this.selectedUser.locations
      const newLocations = locations.filter((loc, i) => i !== index)

      await this.updateUser('locations', newLocations)
    },
    async updateUser (fieldName, value) {
      await this.$store.dispatch('updateUser', {
        userId: this.selectedUser.id,
        attrs: {
          [fieldName]: value
        }
      })
      this.notifySuccess('notification.saved')

      // Hack to erase the content in locations AppSwitchableEditor (c.f. `computed.locationValue`)
      if (fieldName === 'locations') {
        this.locationsChanged = true
        await this.$nextTick()
        this.locationsChanged = false
      }
    },
    uploadCompleted ({ uploadedOrReused }) {
      return this.updateUser('images', uploadedOrReused)
    },
    removeImage (removed) { // one single image
      const newImages = this.selectedUser.images.filter(img => img.name !== removed.name)
      return this.updateUser('images', newImages)
    },
  }
}
</script>

<template>
  <QPage
    :key="selectedUser.id"
    class="stl-footer--bottom"
  >
    <div class="row flex-center">
      <div class="full-width stl-content-container q-pb-xl">
        <section class="q-px-lg q-pt-lg">
          <AppSwitchableEditor
            tag="h1"
            class="text-h4 text-weight-bold q-my-xs"
            :value="selectedUser.profileTitle"
            :active="isCurrentUser"
            :custom-save="updateUserFn('profileTitle')"
            :input-label="$t({ id: 'user.account.my_profile_title_label' })"
          />

          <!-- Natural user profile page -->
          <div
            v-if="isUser"
            class="q-my-md row justify-start"
          >
            <AppSwitchableEditor
              tag="div"
              class="flex-item--auto text-h5 text-weight-medium"
              :value="selectedUser.profileSalary"
              :active="isCurrentUser"
              :custom-save="updateUserFn('profileSalary')"
              :input-label="$t({ id: 'pricing.asking_price_label' })"
              input-type="number"
            >
              <AppContent
                v-if="selectedUser.profileSalary"
                entry="pricing"
                field="asking_price"
                :options="{
                  price: $fx(selectedUser.profileSalary),
                  timeUnit: 'M'
                }"
              />
            </AppSwitchableEditor>
          </div>

          <div v-if="isCurrentUser || (!isCurrentUser && selectedUserLocations.length)">
            <div class="row justify-between q-my-md">
              <AppSwitchableEditor
                :value="locationValue"
                :active="isCurrentUser && selectedUserLocations.length < maxNbLocations"
                :custom-save="updateUserFn('locations')"
                :allow-falsy-save="true"
                tag="div"
                class="text-body1"
              >
                <template v-slot:default>
                  <div class="row items-center">
                    <AppContent
                      v-if="isUser"
                      v-show="isCurrentUser || selectedUserLocations.length > 0"
                      class="text-h6 flex--grow-auto q-my-none q-mr-sm text-weight-medium"
                      tag="h2"
                      entry="user"
                      field="favorite_places_label"
                    />
                    <template v-if="multipleLocationsEnabled">
                      <QChip
                        v-for="(location, index) in selectedUserLocations"
                        :key="location.id"
                        class="non-selectable text-weight-medium q-ml-none q-mr-sm"
                        :removable="isCurrentUser"
                        :square="!style.roundedTheme"
                        outline
                        color="primary"
                        @remove="removeLocationByIndex(index)"
                      >
                        {{ location.shortDisplayName }}
                      </QChip>
                    </template>
                    <div
                      v-else
                      class="text-h6 ellipsis"
                    >
                      {{ selectedUser.locationName }}
                    </div>
                  </div>
                </template>
                <template v-slot:placeholder>
                  <AppContent
                    v-if="isProvider"
                    class="switchable-editor-placeholder"
                    entry="places"
                    field="address_placeholder"
                  />
                </template>
                <template v-slot:edition="{ content, saveDraft }">
                  <PlacesAutocomplete
                    :initial-query="locationValue"
                    :label="$t({ id: 'places.address_placeholder' })"
                    @selectPlace="loc => prepareUpdatedLocations(loc, saveDraft)"
                  />
                </template>
              </AppSwitchableEditor>
            </div>
          </div>
        </section>

        <div class="q-mt-xl">
          <TheContextCard :load="!layout.isLeftDrawerOpened" />
        </div>

        <div
          v-if="isProvider"
          class="text-center q-mb-md"
        >
          <div v-if="!isEditingImages">
            <VuePhotoSwipe
              v-if="galleryItems.length"
              :options="getResourceGalleryOptions(selectedUser)"
              :items="galleryItems"
            />
            <AppContent
              v-if="isCurrentUser"
              class="q-ma-lg"
              tag="QBtn"
              color="primary"
              entry="prompt"
              :field="galleryItems.length ? 'edit_pictures' : 'add_pictures'"
              :rounded="style.roundedTheme"
              @click="toggleImageEdition"
            />
          </div>
          <div v-else-if="isCurrentUser">
            <AppGalleryUploader
              :reused-images="selectedUser.images"
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

        <!-- Wait for API before hiding this so wa can show some skeleton screen in the future -->
        <section
          v-show="!(selectedUser.id && !isCurrentUser && !selectedUser.description)"
          class="q-px-sm"
        >
          <QSeparator class="q-mt-xl" />
          <!-- Shared by natural user and orgs -->
          <AppContent
            v-if="selectedUser.description"
            tag="h2"
            class="text-h4 text-weight-medium"
            entry="asset"
            field="description_label"
          />
          <!-- reuse generic asset.description_label -->

          <AppSwitchableEditor
            tag="p"
            class="text-body1 q-ma-lg text-justify"
            :value="selectedUser.description"
            :active="isCurrentUser"
            :custom-save="updateUserFn('description')"
            :input-label="$t({ id: 'user.account.my_description_label' })"
            allow-falsy-save
            input-type="textarea"
          />
        </section>

        <section
          v-show="showRatingsList && userRatingsLoaded"
          class="q-mt-md"
        >
          <QSeparator class="q-mt-xl" />

          <TransactionRatingsList
            :ratings-stats="userRatingsStatsByTransaction"
            :target="selectedUser"
            :show-cta="showRatingsListCta"
          />
        </section>

        <section
          v-show="suggestedOffers.length"
          class="q-px-sm"
        >
          <QSeparator class="q-mt-xl" />

          <AppContent
            tag="h2"
            class="text-h4 text-weight-medium"
            entry="asset"
            field="you_may_like"
          />
          <div class="row q-col-gutter-md justify-assets">
            <AssetCard
              v-for="asset of suggestedOffers"
              :key="asset.id"
              class="col-10 col-sm-6"
              :asset="asset"
              :to="suggestionSearchMode === 'reversed' ? asset.ownerLink : null"
            />
          </div>
        </section>

        <section
          v-if="isProvider"
          v-show="selectedUserAssets.length"
          class="q-px-sm"
        >
          <QSeparator class="q-mt-xl" />

          <AppContent
            id="profile-assets"
            tag="h2"
            class="text-h4 text-weight-medium"
            entry="user"
            field="assets_title"
            :options="{ user: (isCurrentUser ? '_SELF_' : selectedUser.displayName) || undefined }"
          />
          <div class="row q-col-gutter-md justify-assets">
            <component
              :is="isCurrentUser ? 'OwnerAssetCard' : 'AssetCard'"
              v-for="asset of selectedUserAssets"
              :key="asset.id"
              class="col-10 col-sm-6"
              :asset="asset"
            />
          </div>
        </section>
      </div>
    </div>

    <AppFooter />
  </QPage>
</template>

<style lang="stylus" scoped>
.justify-assets
  justify-content: center
  @media (min-width: $breakpoint-sm-min)
    justify-content: start
</style>
