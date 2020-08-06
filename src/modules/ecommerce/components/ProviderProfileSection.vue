<template>
  <div
    :key="contextResource.id"
  >
    <div class="row">
      <div class="col-12 col-sm-4 q-pb-md q-px-md">
        <div class="bg-transparent text-center">
          <router-link
            v-if="selectedUser.id && !(isCurrentUser && isProfilePage)"
            class="anchor-text--reset anchor-text--underline-focus"
            :to="{ name: 'publicProfile', params: { id: selectedUser.id } }"
          >
            <QImg
              class="user-image"
              :src="getAvatarImageUrl(selectedUser)"
              :alt="selectedUser.displayName"
              :ratio="baseImageRatio"
            >
              <slot name="caption" />
            </QImg>
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
                size="13rem"
                rounded
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
                      :name="icons.matAccountCircle"
                      color="white"
                    />
                  </div>
                </div>
                <!-- Start at ~5% -->
                <QCircularProgress
                  v-if="uploadingAvatarSrc"
                  v-show="scope.uploadProgress > 0.02"
                  :value="(0.05 + scope.uploadProgress) / 1.05 * 100"
                  class="absolute-center overflow-hidden"
                  size="4rem"
                  color="secondary"
                />
                <!-- Relative positionning of parent is needed for QUploaderAddTriger -->
                <QUploaderAddTrigger />
              </QAvatar>
            </template>
            <template>
              <!-- Nothing: v-slot:list="uploader" -->
            </template>
          </QUploader>
        </div>
        <div class="q-mt-xs text-center">
          <AppRatingStars
            v-if="ratingsActive"
            :target="selectedUser"
            readonly
          />
        </div>
      </div>
      <div class="col-12 col-sm-8 q-pb-md q-px-md">
        <div class="row text-h6">
          <div v-if="isCurrentUser">
            <AppSwitchableEditor
              class="inline-block"
              :value="selectedUser.displayName"
              :active="isCurrentUser"
              :custom-save="updateUserFn('displayName')"
              :input-label="$t({ id: 'user.name_label' })"
            />
          </div>
          <div v-else>
            {{ selectedUser.displayName }}
          </div>
        </div>
        <div class="row q-mt-sm">
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
              :name="selectedUser.emailVerified ? icons.matCheckCircle : icons.matAnnouncement"
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

        <div class="row q-mt-sm">
          <AppSwitchableEditor
            :value="locationValue"
            :active="isCurrentUser && selectedUserLocations.length <= maxNbLocations"
            :custom-save="updateUserFn('locations')"
            :allow-falsy-save="true"
            tag="div"
            class="col"
          >
            <template v-slot:default>
              <div class="row items-center">
                <div class="ellipsis">
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

        <div class="row q-mt-md">
          <AppSwitchableEditor
            tag="p"
            class="text-justify"
            :value="selectedUser.description"
            :active="isCurrentUser"
            :custom-save="updateUserFn('description')"
            :input-label="$t({ id: 'user.account.my_description_label' })"
            allow-falsy-save
            input-type="textarea"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { get } from 'lodash'
import { matAccountCircle, matAnnouncement, matCheckCircle } from '@quasar/extras/material-icons'

import { extractLocationDataFromPlace } from 'src/utils/places'

import PlacesAutocomplete from 'src/components/PlacesAutocomplete'

import AppUpload from 'src/mixins/AppUpload'
import AuthDialogMixin from 'src/mixins/authDialog'
import ValidationDialogMixin from 'src/mixins/validationDialog'

export default {
  components: {
    PlacesAutocomplete,
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
      date: '',
      newAvatarUrl: '',
      uploadingAvatarSrc: '',
      uploadFolder: 'images/avatars', // used by AppUpload
      maxNbLocations: 1,
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
    contextResource () {
      return (this.isProfilePage ? this.selectedUser : this.activeAsset) || {}
    },
    contextLocations () {
      return this.contextResource.locations || []
    },
    locationValue () {
      return this.contextResource.locationName
    },
    selectedUserLocations () {
      return this.selectedUser.locations || []
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
    ...mapState([
      'route',
      'search',
      'style',
      'asset',
    ]),
    ...mapGetters([
      'activeAsset',
      'baseImageRatio',
      'getAvatarImageUrl',
      'selectedUser',
      'currentUser',
      'isSelectedUserNatural',
      'selectedUserIsCurrentUser',
      'ratingsActive',
      'isProvider',
    ]),
  },
  mounted () {
    // fetch categories in background so we can display the category name as user information
    this.$store.dispatch('fetchCategories')
  },
  created () {
    this.icons = {
      matAccountCircle,
      matAnnouncement,
      matCheckCircle
    }
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
    avatarAdded (added) {
      this.$refs.avatarUploader.$el.blur()
      this.uploadingAvatarSrc = get(added, '[0].__img.src', '')
    },
    uploadingFileUrlHandler ({ url }) { // needed for AppUpload mixin
      this.newAvatarUrl = url
    },
    async avatarUploaded (uploaded) {
      await this.updateUserFn('avatarUrl')(this.newAvatarUrl)
      this.uploadingAvatarSrc = '' // wait for new user to be fetched
    },
    avatarUploadFailed (failed) {
      this.notifyFailure('error.failed_updoad')
      this.uploadingAvatarSrc = ''
    },
    openValidationDialogIfAllowed ({ formType }) {
      if (formType === 'email' && !this.canValidateEmail) return

      return this.openValidationDialog({ formType })
    },
    prepareUpdatedLocations (place, handlerFn) {
      extractLocationDataFromPlace(place, loc => { handlerFn(loc ? [loc] : null) })
    },
  }
}

</script>

<style lang="stylus" scoped>
.q-uploader
  width: auto

.user-image
  border-radius: $generic-border-radius
</style>
