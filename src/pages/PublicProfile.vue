<script>
// This is both user public profile page and profile editing (account) page when authenticated

import { mapGetters, mapState } from 'vuex'
import * as mutationTypes from 'src/store/mutation-types'

import AppGalleryUploader from 'src/components/AppGalleryUploader'
import OwnerAssetCard from 'src/components/OwnerAssetCard'
import PlacesAutocomplete from 'src/components/PlacesAutocomplete'
import TransactionRatingsList from 'src/components/TransactionRatingsList'
import ProfileCard from 'src/components/ProfileCard'

import PageComponentMixin from 'src/mixins/pageComponent'

import { extractLocationDataFromPlace } from 'src/utils/places'

export default {
  components: {
    AppGalleryUploader,
    OwnerAssetCard,
    PlacesAutocomplete,
    TransactionRatingsList,
    ProfileCard,
    VuePhotoSwipe: () => import(/* webpackChunkName: 'photoswipe' */ 'src/components/VuePhotoSwipe'),
  },
  mixins: [
    PageComponentMixin,
  ],
  data () {
    return {
      suggestedOffers: [],
      isEditingImages: false,
      maxNbLocations: 1,
      locationsChanged: false,
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

      await store.dispatch('fetchAssetTypes')
    } catch (err) {
      const code = err.statusCode
      if (code >= 400 && code < 500) redirect(`/${code}`) // needs a string for SSR
      else throw err
    }
  },
  watch: {
    'currentUser.id' () {
      this.fetchUserRatingsByTransaction({ userId: this.selectedUser.id })
    },
    async '$route' () {
      // ensure appropriate assets are displayed when switching profiles
      await Promise.all([this.fetchUserAssets()])
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

      this.fetchUserRatingsByTransaction({ userId: this.selectedUser.id })
    },
    async fetchUserAssets () {
      return this.$store.dispatch('fetchUserAssets', {
        userId: this.selectedUser.id
      })
    },
    async fetchUserRatingsByTransaction ({ userId }) {
      this.userRatingsByTransaction = await this.$store.dispatch('fetchRatingsByTransaction', { targetId: userId })
      this.userRatingsLoaded = true
    },
    updateUserFn (fieldName) {
      return async (value) => {
        await this.updateUser(fieldName, value)
      }
    },
    prepareUpdatedLocations (place, handlerFn) {
      extractLocationDataFromPlace(place, loc => { handlerFn(loc ? [ loc ] : null) })
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

          <div v-if="isCurrentUser || (!isCurrentUser && selectedUserLocations.length)">
            <div class="row justify-between q-my-md">
              <AppSwitchableEditor
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
          v-show="userRatingsLoaded"
          class="q-mt-md"
        >
          <QSeparator class="q-mt-xl" />

          <TransactionRatingsList
            :ratings="userRatingsByTransaction"
            :target="selectedUser"
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
