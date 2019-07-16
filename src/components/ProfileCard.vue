<template>
  <div
    :key="contextResource.id"
    class="full-height context-card q-card"
  >
    <div
      :class="[
        'user-card-avatar-container relative-position q-pt-md q-px-md q-pb-none',
      ]"
    >
      <div class="bg-primary-gradient absolute-top" />
      <div class="bg-transparent text-center">
        <router-link
          v-if="selectedUser.id && !(isCurrentUser && isProfilePage)"
          class="anchor-text--reset anchor-text--underline-focus"
          :to="{ name: 'publicProfile', params: { id: selectedUser.id } }"
        >
          <AppAvatar
            :user="selectedUser"
            size="6rem"
            :show-hover-placeholder="!isProfilePage"
          >
            <template v-slot:hover-placeholder>
              <AppContent
                class="text-h6 text-weight-medium text-white"
                entry="navigation"
                field="profile"
              />
            </template>
          </AppAvatar>
        </router-link>
        <QUploader
          v-else
          ref="uploader"
          class="q-uploader--hide-list"
          :factory="uploadFactory"
          :filter="uploadFilter"
          auto-upload
          flat
          accept="image/*"
          color="transparent"
          text-color="transparent"
          @added="avatarAdded"
          @uploaded="avatarUploaded"
          @failed="avatarUploadFailed"
        >
          <template v-slot:header="scope">
            <QAvatar
              ref="avatarUploader"
              :class="[
                'avatar-anchor avatar-uploader relative-position',
                hasAvatar ? '' : 'bg-grey'
              ]"
              size="6rem"
              tabindex="0"
            >
              <div
                v-if="!hasAvatar && !uploadingAvatarSrc"
                class="text-white text-weight-medium"
                :aria-label="selectedUser.displayName"
              >
                {{ displayNameInitial }}
              </div>
              <!-- Assuming file handler cropping is like background cover style -->
              <QImg
                v-if="uploadingAvatarSrc || hasAvatar"
                :src="uploadingAvatarSrc || avatarUrl"
                class="full-height"
              />
              <div
                v-if="!uploadingAvatarSrc"
                class="avatar-placeholder absolute-full flex column flex-center"
              >
                <!-- Wrapping in div to prevent background issues with absolute positionning -->
                <div>
                  <QIcon
                    name="account_circle"
                    color="white"
                  />
                </div>
              </div>
              <!-- Start at ~5% -->
              <QCircularProgress
                v-if="uploadingAvatarSrc"
                v-show="uploader.uploadProgress > 0.02"
                :value="(0.05 + uploader.uploadProgress) / 1.05 * 100"
                class="absolute-center overflow-hidden"
                size="4rem"
                color="secondary"
              />
              <!-- Relative positionning of parent is needed for QUploaderAddTriger -->
              <QUploaderAddTrigger />
            </QAvatar>
          </template>
          <template v-slot:list="uploader">
            <!-- Nothing -->
          </template>
        </QUploader>
      </div>
    </div>

    <component
      :is="'div'"
      class="user-card-container"
    >
      <div class="user-card-content q-pa-lg">
        <!-- Natural user looking for offers -->
        <template v-if="isSelectedUserNatural">
          <div
            v-if="isCurrentUser"
            class="row justify-center text-h6"
          >
            <div class="text-center q-mr-md">
              <AppSwitchableEditor
                class="inline-block"
                :value="selectedUser.firstName"
                :active="isCurrentUser"
                :custom-save="updateUserFn('firstname')"
                :input-label="$t({ id: 'user.firstname_label' })"
              />
            </div>
            <div class="text-center">
              <AppSwitchableEditor
                class="inline-block"
                :value="selectedUser.lastName"
                :active="isCurrentUser"
                :custom-save="updateUserFn('lastname')"
                :input-label="$t({ id: 'user.lastname_label' })"
              />
            </div>
          </div>
          <div
            v-else
            class="row justify-center text-h6"
          >
            <div class="text-center">
              {{ selectedUser.displayName }}
            </div>
          </div>

          <div
            v-if="selectedUser.averageRating"
            class="text-center"
          >
            <AppRatingStars
              :target="selectedUser"
              size="1.25rem"
              readonly
            />
            <div class="q-my-md q-px-lg">
              <AppRatingSlider
                v-if="typeof selectedUser.score === 'number'"
                color="primary"
                :value="selectedUser.score"
                readonly
              />
            </div>
          </div>
          <div
            v-if="selectedUser.nbRecommendations > 0"
            class="row justify-center items-center"
          >
            <AppContent
              entry="rating"
              field="recommendations_count"
              :options="{ nb_recommendations: selectedUser.nbRecommendations }"
            />
            <div class="q-ml-md">
              <router-link
                v-for="user in selectedUser.recommendedBy"
                :key="user.id"
                class="anchor-text--reset anchor-text--underline-focus"
                :to="{ name: 'publicProfile', params: { id: user.id } }"
              >
                <AppAvatar
                  class="recommendation"
                  :user="user"
                  size="1.5rem"
                />
              </router-link>
            </div>
          </div>
        </template>

        <!-- Organization info -->
        <template v-if="!isSelectedUserNatural">
          <div class="text-h6 text-center flex justify-center">
            <!-- Filling Tax ID can change the display name -->
            <AppSwitchableEditor
              :key="selectedUser.displayName"
              :value="selectedUser.displayName"
              :active="isCurrentUser"
              :custom-save="updateUserFn('displayName')"
              :input-label="$t({ id: 'user.organization_name_label' })"
            />
          </div>
        </template>

        <!-- Some info shared between user types -->
        <div class="q-pt-md">
          <div
            v-if="showEmailVerificationLine"
            :class="['q-mb-sm row justify-between items-center', canValidateEmail ? 'cursor-pointer' : '']"
            @click="openValidationDialogIfAllowed({ formType: 'email' })"
          >
            <span
              v-if="showEmailValue"
              class="flex-item--grow"
            >
              <span v-if="selectedUser.email">
                {{ selectedUser.email }}
              </span>
              <AppContent
                v-else
                entry="form"
                field="error.missing_email"
              />
            </span>
            <AppContent
              v-else
              entry="user"
              field="email_address_label"
            />
            <QIcon
              size="1.5rem"
              :color="selectedUser.emailVerified ? 'positive' : 'negative'"
              :name="selectedUser.emailVerified ? 'check_circle' : 'announcement'"
            >
              <AppContent
                v-if="canValidateEmail && !selectedUser.emailVerified"
                tag="QTooltip"
                entry="prompt"
                field="validate"
              />
            </QIcon>
          </div>
        </div>
      </div>

      <!-- Make it pluggable in a new TheContextCardBottom component (and add slot) -->
      <div
        v-if="showMap || mapLoaded"
        class="drawer__map-container"
      >
        <QNoSsr>
          <AppMap
            class="absolute-full"
            :map-options="{
              zoom: 4,
            }"
            :nav-control="{
              show: false
            }"
            @map-load="afterMapLoaded"
          />
        </QNoSsr>
      </div>
    </component>
  </div>
</template>

<script>
/* global mapboxgl */
import { mapState, mapGetters } from 'vuex'
import { get } from 'lodash'

import { isAssetId } from 'src/utils/id'

import AppUpload from 'src/mixins/AppUpload'
import AuthDialogMixin from 'src/mixins/authDialog'
import ValidationDialogMixin from 'src/mixins/validationDialog'

export default {
  components: {
    AppMap: () => import(/* webpackChunkName: 'mapbox' */ 'mapbox-gl')
      .then(mapbox => {
        if (window && !window.mapboxgl) window.mapboxgl = mapbox.default
        return import(/* webpackChunkName: 'mapbox' */ 'src/components/AppMap')
      }),
  },
  mixins: [
    AppUpload,
    AuthDialogMixin,
    ValidationDialogMixin,
  ],
  props: {
    inDrawer: Boolean,
    load: {
      type: Boolean,
      default: true
    },
  },
  data () {
    return {
      // map: null, // DON’T keep map object in Vue, this BREAKS the map (probably reactivity)
      mapLoaded: false, // caching map too
      date: '',
      newAvatarUrl: '',
      uploadingAvatarSrc: '',
      uploadFolder: 'images/avatars', // used by AppUpload
    }
  },
  computed: {
    isCurrentUser () {
      // This component can be used for profile page too
      // This logic is specific to asset page
      return this.currentUser.id === this.selectedUser.id
    },
    isProfilePage () {
      return this.route.name === 'publicProfile'
    },
    avatarUrl () {
      return this.getAvatarImageUrl(this.selectedUser)
    },
    hasAvatar () {
      return !!this.avatarUrl
    },
    displayNameInitial () {
      return get(this.selectedUser, 'displayName[0]')
    },
    showMap () {
      if (!this.contextResourceImageUrl) return false
      if (!this.contextLocations.length) return false

      return this.route.name === 'asset'
    },
    contextResource () {
      return (this.isProfilePage ? this.selectedUser : this.activeAsset) || {}
    },
    contextLocations () {
      return this.contextResource.locations || []
    },
    contextResourceImageUrl () {
      const resource = this.contextResource

      let url = this.getBaseImageUrl(resource)
      if (!url && !isAssetId(resource.id)) {
        url = this.getAvatarImageUrl(resource)
      }

      return url
    },
    mapFeature () {
      const resource = this.contextResource
      if (!this.contextLocations.length) return null

      return {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [resource.locations[0].longitude, resource.locations[0].latitude]
        },
        properties: {
          resourceId: resource.id
        }
      }
    },
    showEmailVerificationLine () {
      return this.isCurrentUser || this.selectedUser.emailVerified
    },
    showEmailValue () {
      return this.isCurrentUser
    },
    canValidateEmail () {
      return this.isCurrentUser
    },
    canChangePassword () {
      return this.isCurrentUser
    },
    ...mapState([
      'route',
      'search',
      'style',
      'asset',
    ]),
    ...mapGetters([
      'activeAsset',
      'getAvatarImageUrl',
      'getBaseImageUrl',
      'selectedUser',
      'currentUser',
      'isSelectedUserNatural',
      'selectedUserIsCurrentUser',
    ]),
  },
  mounted () {
    // fetch categories in background so we can display the category name as user information
    this.$store.dispatch('fetchCategories')
  },
  methods: {
    updateUserFn (fieldName, { displayNotification = true } = {}) {
      return async (value) => {
        await this.$store.dispatch('updateUser', {
          userId: this.selectedUser.id,
          attrs: {
            [fieldName]: value
          }
        })

        if (displayNotification) {
          this.notifySuccess('notification.saved')
        }
      }
    },
    afterMapLoaded (map) {
      this.mapLoaded = true
      this.refreshMap(map)
    },
    refreshMap (map) {
      if (!this.mapFeature) return

      const markerId = `marker-${this.contextResource.id}`
      const coordinates = this.mapFeature.geometry.coordinates

      let el = document.createElement('div')
      el.id = markerId
      el.className = 'stl-map-marker'
      el.style.backgroundImage = `url('${this.contextResourceImageUrl}')`

      new mapboxgl.Marker(el)
        .setLngLat(coordinates)
        .addTo(map)

      map.setCenter(coordinates)
    },
    uploadingFileUrlHandler ({ url }) {
      this.newAvatarUrl = url
    },
    avatarAdded (added) {
      this.$refs.avatarUploader.$el.blur()
      this.uploadingAvatarSrc = get(added, '[0].__img.src', '')
    },
    async avatarUploaded (uploaded) {
      await this.updateUserFn('avatarUrl')(this.newAvatarUrl)
      this.uploadingAvatarSrc = '' // wait for new user to be fetched
    },
    avatarUploadFailed (failed) {
      this.notifyFailure('error.failed_updoad')
      this.uploadingAvatarSrc = ''
    },
    async requestEmailCheck () {
      try {
        await this.$store.dispatch('sendCustomEvent', {
          type: 'email_check_request',
          objectId: this.selectedUser.id, // automatically populated in event for workflows
          metadata: {
            email: this.selectedUser.newEmail || this.selectedUser.email
          }
        })

        this.notifySuccess('user.account.email_validation_link_sent')
      } catch (err) {
        this.notifyWarning('error.unknown_happened_header')
      }
    },
    openValidationDialogIfAllowed ({ formType }) {
      if (formType === 'email' && !this.canValidateEmail) return

      return this.openValidationDialog({ formType })
    }
  }
}

</script>

<style lang="stylus" scoped>
$drawer-map-height = 19rem
$owner-avatar-container-height = 7rem

.context-card
  &:not(.context-card--in-drawer)
    max-width: 360px
    margin: 0 auto 2rem

  &.context-card--in-drawer .user-card-container
    height: "calc(100% - %s)" % $owner-avatar-container-height
    .user-card-avatar-container
      height $owner-avatar-container-height

.user-card-avatar-container
  overflow: hidden
  .bg-primary-gradient
    position: absolute
    height: 80%
    top: -20%
    right: 0
    left: 0
    transform: skewY(-6deg)

.drawer__map-container
  position relative
  background-color $map-background-color
  height $drawer-map-height

.avatar-placeholder
  border-radius 50%
  background $dimmed-background
  transition opacity ease $transition-duration
  opacity 0
  &.avatar-placeholder--show
    opacity: 0.9
.avatar-anchor
  cursor pointer
  &:focus, &:hover
    .avatar-placeholder
      opacity 0.9

.avatar-anchor.avatar-uploader:focus
  outline: 0 // custom focus style above
</style>

<style lang="stylus">
.stl-map-marker
  cursor: grab // No asset card to reveal

// Local quasar overrides but we need global styles to make override effective
.user-card-container
  .scroll.relative-position.overflow-hidden.fit > .absolute
    min-height 100%
    display flex
    flex-direction column
    justify-content space-between // map or calendar sticking to bottom

.user-rating__score-bar
  .q-linear-progress__model
    border-radius 10px
.user-card-avatar-container
  .q-uploader
    width: auto
    background: transparent
    .q-uploader__list
      padding: 0
      background: transparent

.recommendation
  margin-left: -0.35rem // to apply overlapping effect
</style>
