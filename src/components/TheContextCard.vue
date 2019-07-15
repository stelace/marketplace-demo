<template>
  <div
    v-if="load || componentLoaded"
    v-show="load"
    :key="contextResource.id"
    :class="[
      'full-height context-card',
      inDrawer ? 'context-card--in-drawer' : 'q-card'
    ]"
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
      :is="inDrawer ? 'q-scroll-area' : 'div'"
      class="user-card-container"
    >
      <div
        :class="[
          'user-card-content',
          inDrawer ? 'q-pa-md' : 'q-pa-lg'
        ]"
      >
        <!-- Natural user looking for offers -->
        <template v-if="isSelectedUserNatural">
          <div
            v-if="isCurrentUser || canViewUserNames"
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

          <div class="text-center">
            <AppSwitchableEditor
              tag="h2"
              class="text-subtitle2 text-uppercase inline-block"
              :value="selectedUser.categoryName"
              :active="isCurrentUser"
              :custom-save="updateUserFn('categoryId')"
            >
              <template v-slot:default="{ content }">
                {{ selectedUser.categoryName }}
              </template>
              <template v-slot:placeholder>
                <AppContent
                  entry="asset"
                  field="category_label"
                />
              </template>
              <template v-slot:edition="{ content, saveDraft }">
                <SelectCategories
                  :initial-category="{ id: selectedUser.categoryId, name: selectedUser.categoryName }"
                  :label="$t({ id: 'asset.category_label' })"
                  @change="cat => saveDraft(cat ? cat.id : null)"
                />
              </template>
            </AppSwitchableEditor>
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
        v-show="!showAvailabilityCalendar"
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
      <div
        v-else-if="showAvailabilityCalendar"
        class="q-pa-xs q-my-md availability-calendar-container"
      >
        <AppContent
          tag="div"
          class="text-h6 text-center"
          entry="prompt"
          field="my_availability"
        />
        <div v-if="selectedUserIsCurrentUser">
          <div class="q-my-md row justify-center items-center">
            <QChip
              clickable
              :square="!style.roundedTheme"
              color="secondary"
              text-color="white"
            >
              {{ displayAvailabilityStartDate || $t({ id: 'time.start_date_label' }) }}
              <q-popup-proxy
                ref="startDatePopup"
                :offset="[0,8]"
              >
                <div>
                  <QDate
                    :value="datePickerAvailabilityStartDate"
                    @input="selectStartDate"
                  />
                </div>
              </q-popup-proxy>
            </QChip>
            <div class="q-mx-md">
              <QIcon
                name="arrow_forward"
                size="1.5rem"
                color="default-color"
              />
            </div>
            <QChip
              clickable
              :removable="!!displayAvailabilityEndDate"
              :square="!style.roundedTheme"
              color="secondary"
              text-color="white"
              @remove="selectEndDate(null)"
            >
              {{ displayAvailabilityEndDate || $t({ id: 'time.end_date_label' }) }}
              <q-popup-proxy
                ref="endDatePopup"
                :offset="[0,8]"
              >
                <div>
                  <QDate
                    :value="datePickerAvailabilityEndDate"
                    @input="selectEndDate"
                  />
                </div>
              </q-popup-proxy>
            </QChip>
          </div>
          <AppContent
            v-show="!availabilityEndDate"
            class="text-subtitle q-mb-sm text-center"
            tag="div"
            entry="time"
            field="missing_end_date_meaning"
          />
        </div>
        <div
          v-else
          class="flex flex-center"
        >
          <q-date
            v-model="date"
            :events="availabilityEventsFn"
            event-color="positive"
            minimal
          />
        </div>
      </div>
    </component>
  </div>
</template>

<script>
/* global mapboxgl */
import { mapState, mapGetters } from 'vuex'
import { get } from 'lodash'
import { date } from 'quasar'

import { isValidDateString } from 'src/utils/time'
import { isUser } from 'src/utils/user'
import { isAssetId } from 'src/utils/id'

import DatePickerInput from 'src/components/DatePickerInput'
import SelectCategories from 'src/components/SelectCategories'

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
    DatePickerInput,
    SelectCategories,
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
      componentLoaded: false, // cache whole component
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
    availabilityGraph () {
      if (!this.selectedUser.assetId) return
      return this.asset.availabilityGraphByAssetId[this.selectedUser.assetId]
    },
    availability () {
      if (!this.selectedUser.availabilityId) return
      return this.asset.availabilitiesById[this.selectedUser.availabilityId]
    },
    availabilityStartDate () {
      if (!this.availability) return null

      // to express an availability from a date (start date defined but no end date)
      // we define an availability with quantity 0 from now minus one year (start date) to this date (end date)
      // e.g. availability from 2019-01-01 is modeled as
      // unavailability from 2018-01-01 to 2019-01-01

      // the reason is because assets are created with quantity equals to 1 by default,
      // so they are available
      if (this.isUnavailability(this.availability)) {
        return this.availability.endDate
      } else {
        return this.availability.startDate
      }
    },
    availabilityEndDate () {
      if (!this.availability) return null

      if (this.isUnavailability(this.availability)) {
        return null
      } else {
        return this.availability.endDate
      }
    },
    availabilitySaveButtonDisabled () {
      if (!this.availabilityStartDate || !this.availabilityEndDate) return true

      return !isValidDateString(this.availabilityStartDate) ||
        !isValidDateString(this.availabilityEndDate) ||
        this.availabilityStartDate > this.availabilityEndDate
    },
    showAvailabilityCalendar () {
      return this.isProfilePage && this.availability && isUser(this.selectedUser)
    },
    displayAvailabilityStartDate () {
      if (!this.availabilityStartDate) return null
      return this.$t({ id: 'time.date_short' }, { date: new Date(this.availabilityStartDate) })
    },
    displayAvailabilityEndDate () {
      if (!this.availabilityEndDate) return null
      return this.$t({ id: 'time.date_short' }, { date: new Date(this.availabilityEndDate) })
    },
    datePickerAvailabilityStartDate () {
      if (!this.availabilityStartDate) return null
      return date.formatDate(this.availabilityStartDate, 'YYYY/MM/DD')
    },
    datePickerAvailabilityEndDate () {
      if (!this.availabilityEndDate) return null
      return date.formatDate(this.availabilityEndDate, 'YYYY/MM/DD')
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
      'canViewUserNames',
    ]),
  },
  mounted () {
    // fetch categories in background so we can display the category name as user information
    this.$store.dispatch('fetchCategories')
  },
  methods: {
    availabilityEventsFn (dateString) {
      if (!this.availabilityGraph) return false

      const dateFormat = 'YYYY-MM-DD'

      const selectedDate = date.formatDate(dateString, dateFormat)
      const startDate = date.formatDate(this.availability.startDate, dateFormat)
      const endDate = date.formatDate(this.availability.endDate, dateFormat)

      if (endDate < startDate) return false

      const defaultQuantity = this.availabilityGraph.defaultQuantity
      const graphDates = this.availabilityGraph.graphDates
      const firstGraphDate = graphDates[0]

      if (!graphDates.length || selectedDate < firstGraphDate.date) {
        return defaultQuantity > 0
      }

      let available = false

      for (let i = 1; i < graphDates.length; i++) {
        const graphDate = graphDates[i]
        const previousGraphDate = graphDates[i - 1]

        if (previousGraphDate.date <= selectedDate && selectedDate < graphDate.date) {
          available = previousGraphDate.availableQuantity - previousGraphDate.usedQuantity > 0
          break
        }

        const isLastGraphDate = i === graphDates.length - 1
        if (isLastGraphDate && graphDate.date <= selectedDate) {
          available = graphDate.availableQuantity - graphDate.usedQuantity > 0
          break
        }
      }

      return available
    },
    isUnavailability (availability) {
      return availability.quantity === 0
    },
    hideStartDatePopup () {
      this.$refs.startDatePopup.hide()
    },
    hideEndDatePopup () {
      this.$refs.endDatePopup.hide()
    },
    selectStartDate (startDate) {
      this.saveAvailability({
        startDate: startDate ? new Date(startDate).toISOString() : null,
        endDate: this.availabilityEndDate
      })
    },
    selectEndDate (endDate) {
      this.saveAvailability({
        startDate: this.availabilityStartDate,
        endDate: endDate ? new Date(endDate).toISOString() : null
      })
    },
    async saveAvailability ({ startDate, endDate }) {
      if (!startDate) return

      if (endDate && startDate >= endDate) {
        this.notifyWarning('time.error.incorrect_dates')
        return
      }

      const isAnUnavailability = !endDate

      const asset = this.asset.activeAsset

      let assetQuantity = asset.quantity
      const attrs = {}

      if (!isAnUnavailability) {
        attrs.startDate = startDate
        attrs.endDate = endDate
        attrs.quantity = 1
        assetQuantity = 0
      } else {
        attrs.startDate = date.addToDate(new Date(), { year: -1 }).toISOString()
        attrs.endDate = startDate
        attrs.quantity = 0
        assetQuantity = 1
      }

      try {
        await this.$store.dispatch('updateAvailability', {
          availabilityId: this.availability.id,
          attrs
        })

        if (asset.quantity !== assetQuantity) {
          await this.$store.dispatch('updateActiveAsset', {
            assetId: asset.id,
            attrs: {
              quantity: assetQuantity
            }
          })
        }

        // hide popups only if save is successful
        this.hideStartDatePopup()
        this.hideEndDatePopup()

        // short notification duration
        this.notifySuccess('notification.saved', { timeout: 1000 })
      } catch (err) {
        this.notifyWarning('error.unknown_happened_header')
      }
    },
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

.availability-calendar-container .q-date
  box-shadow none

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
