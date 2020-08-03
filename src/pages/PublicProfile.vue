<script>
// This is both user public profile page and profile editing (account) page when authenticated

import { mapGetters, mapState } from 'vuex'
import * as mutationTypes from 'src/store/mutation-types'
import { values } from 'lodash'

import OwnerAssetCard from 'src/components/OwnerAssetCard'
import PlacesAutocomplete from 'src/components/PlacesAutocomplete'
import TransactionRatingsList from 'src/components/TransactionRatingsList'
import ProfileCard from 'src/components/ProfileCard'
import StripeLinkAccount from 'src/components/StripeLinkAccount'

import PageComponentMixin from 'src/mixins/pageComponent'
import StripeMixin from 'src/mixins/stripe'

import { extractLocationDataFromPlace, isPlaceSearchEnabled } from 'src/utils/places'
import { groupAssetsByCategory } from 'src/utils/asset'

export default {
  components: {
    OwnerAssetCard,
    PlacesAutocomplete,
    TransactionRatingsList,
    ProfileCard,
    ProviderProfileSection: () => import(/* webpackChunkName: 'ecommerce' */ 'src/components/ProviderProfileSection'),
    StripeLinkAccount,
    VuePhotoSwipe: () => import(/* webpackChunkName: 'photoswipe' */ 'src/components/VuePhotoSwipe'),
  },
  mixins: [
    PageComponentMixin,
    StripeMixin,
  ],
  data () {
    return {
      suggestedOffers: [],
      isEditingImages: false,
      maxNbLocations: 1,
      locationsChanged: false,
      isPlaceSearchEnabled,
      userRatingsByTransaction: [],
      userRatingsLoaded: false,
    }
  },
  computed: {
    isCurrentUser () {
      return this.currentUser.id === this.selectedUser.id
    },
    selectedUserAssets () {
      return this.usersAssets[this.selectedUser.id] || []
    },
    selectedUserAssetsByCategory () {
      const categories = values(this.common.categoriesById)
      const searchedAssets = this.searchedAssets
      return groupAssetsByCategory(this.selectedUserAssets, categories, { searchedAssets })
    },
    selectedUserLocations () {
      return this.selectedUser.locations || []
    },
    locationValue () {
      return this.selectedUser.locationName
    },
    ...mapGetters([
      'selectedUser',
      'currentUser',
      'usersAssets',
      'searchOptions',
      'ratingsActive',
      'stripeActive',
      'isSelectedUserProvider',
      'searchedAssets',
      'isEcommerceMarketplace',
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

      await Promise.all([
        store.dispatch('fetchAssetTypes'),
        store.dispatch('fetchCategories'),
      ])
    } catch (err) {
      const code = err.statusCode
      if (code >= 400 && code < 500) redirect(`/${code}`) // needs a string for SSR
      else throw err
    }
  },
  watch: {
    async '$route' () {
      // ensure appropriate objects are displayed when switching profiles
      this.loadProfile()
    }
  },
  async created () {
    this.loadProfile() // not blocking here
  },
  methods: {
    loadProfile () {
      return Promise.all([
        this.fetchUserAssets(),
        this.fetchRatingsStatsByTargetId({ targetId: [this.selectedUser.id] }),
        this.fetchUserRatingsByTransaction({ userId: this.selectedUser.id })
      ])
    },
    async fetchUserAssets () {
      return this.$store.dispatch('fetchUserAssets', {
        userId: this.selectedUser.id
      })
    },
    fetchRatingsStatsByTargetId ({ targetId }) {
      if (!this.ratingsActive) return

      return this.$store.dispatch('fetchRatingsStats', { targetId, groupBy: 'targetId' })
    },
    async fetchUserRatingsByTransaction ({ userId }) {
      if (!this.ratingsActive) return

      this.userRatingsByTransaction = await this.$store.dispatch('fetchRatingsByTransaction', { targetId: userId })
      this.userRatingsLoaded = true
    },
    updateUserFn (fieldName) {
      return async (value) => {
        await this.updateUser(fieldName, value)
      }
    },
    prepareUpdatedLocations (place, handlerFn) {
      extractLocationDataFromPlace(place, loc => { handlerFn(loc ? [loc] : null) })
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
  }
}
</script>

<template>
  <QPage
    :key="selectedUser.id"
    class="stl-footer--bottom"
  >
    <div class="row flex-center">
      <div
        :class="[
          'full-width stl-content-container q-pb-xl',
          isEcommerceMarketplace ? 'stl-content-container--large' : ''
        ]"
      >
        <template v-if="isEcommerceMarketplace">
          <div v-if="isSelectedUserProvider" class="q-mt-xl">
            <ProviderProfileSection />
          </div>
          <div v-else class="q-mt-xl">
            <ProfileCard />
          </div>
        </template>

        <template v-else>
          <section class="q-px-lg q-pt-lg">
            <AppSwitchableEditor
              tag="h1"
              class="text-h4 text-weight-bold q-my-xs"
              :value="selectedUser.profileTitle"
              :active="isCurrentUser"
              :custom-save="updateUserFn('profileTitle')"
              :input-label="$t({ id: 'user.account.my_profile_title_label' })"
            />

            <div v-if="isCurrentUser || (!isCurrentUser && selectedUserLocations.length)">
              <div class="row justify-between q-my-md">
                <AppSwitchableEditor
                  v-if="isPlaceSearchEnabled"
                  :value="locationValue"
                  :active="isCurrentUser && selectedUserLocations.length <= maxNbLocations"
                  :custom-save="updateUserFn('locations')"
                  :allow-falsy-save="true"
                  tag="div"
                  class="text-body1"
                >
                  <template v-slot:default>
                    <div class="row items-center">
                      <div class="text-h6 ellipsis">
                        {{ selectedUser.locationName }}
                      </div>
                    </div>
                  </template>
                  <template v-slot:placeholder>
                    <AppContent
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
            <ProfileCard />
          </div>
        </template>

        <!-- Wait for API before hiding this so we can show some skeleton screen in the future -->
        <section
          v-if="(isEcommerceMarketplace && !isSelectedUserProvider) || !isEcommerceMarketplace"
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
          v-if="isCurrentUser && stripeActive && selectedUserAssets.length && !hasLinkedStripeAccount"
          class="q-px-sm"
        >
          <QSeparator class="q-mt-xl" />

          <StripeLinkAccount />
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
              :class="[
                'col-10',
                isEcommerceMarketplace ? 'col-sm-3' : 'col-sm-6',
              ]"
              :asset="asset"
            />
          </div>
        </section>

        <section
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
          <div v-for="category of selectedUserAssetsByCategory" :key="category.id">
            <div v-if="category.assets.length">
              <div class="text-h5 text-weight-medium q-mb-lg">
                {{ category.name }}
              </div>

              <div class="row q-col-gutter-md justify-assets">
                <component
                  :is="isCurrentUser ? 'OwnerAssetCard' : 'AssetCard'"
                  v-for="asset of category.assets"
                  :key="asset.id"
                  :class="[
                    'col-10',
                    isEcommerceMarketplace ? 'col-sm-3' : 'col-sm-6',
                  ]"
                  :asset="asset"
                  :flat="!asset.previouslySearched"
                />
              </div>
            </div>
          </div>
        </section>

        <section
          v-show="userRatingsLoaded && ratingsActive"
          class="q-mt-md"
        >
          <QSeparator class="q-mt-xl" />

          <TransactionRatingsList
            :ratings="userRatingsByTransaction"
            :target="selectedUser"
          />
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
