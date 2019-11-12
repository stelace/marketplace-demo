<script>
import { mapState, mapGetters } from 'vuex'
import { date } from 'quasar'
import { get, values } from 'lodash'

import EventBus from 'src/utils/event-bus'

import TransactionActions from 'src/components/TransactionActions'
import TransactionStatus from 'src/components/TransactionStatus'
import ProfileCard from 'src/components/ProfileCard'

import PageComponentMixin from 'src/mixins/pageComponent'
import AppUpload from 'src/mixins/AppUpload'

import {
  convertEndDate
} from 'src/utils/time'

export default {
  components: {
    TransactionActions,
    TransactionStatus,
    ProfileCard,
  },
  mixins: [
    AppUpload,
    PageComponentMixin,
  ],
  data () {
    return {
      fileUpload: {
        bigger: true, // to prompt first attachment upload such as CV
      },
      conversationId: null,
      draftMessage: '',
      sendingMessage: false,
      uploadFolder: 'attachments', // used by AppUpload
      uploadedAttachments: [],
      lightBackgroundColor: 'grey-2',
    }
  },
  computed: {
    conversation () {
      if (!this.conversationId) return

      return this.conversations.find(conversation => conversation.id === this.conversationId)
    },
    ownerDisplayName () {
      return get(this.inbox.asset, 'owner.displayName')
    },
    nbTimeUnits () {
      return values(get(this.inbox.transaction, 'duration', {}))[0]
    },
    timeUnit () {
      return Object.keys(get(this.inbox.transaction, 'duration', {}))[0]
    },
    startDate () {
      return this.inbox.transaction.startDate ? new Date(this.inbox.transaction.startDate) : undefined
    },
    endDate () {
      return this.inbox.transaction.endDate
        ? new Date(convertEndDate(this.inbox.transaction.endDate, { target: 'ui' }))
        : undefined
    },
    groupedChatMessages () {
      const messageGroups = this.inbox.conversationMessages.reduce((groups, m, i) => {
        // Messages still handled from most recent to oldest
        const newGroup = { additionalMessages: [ m ], contents: [ m.content ] }

        const maxDelayBetweenGroupMessages = 30

        if (i === 0) return [ newGroup ]

        let dateDiff
        const nextMessage = this.inbox.conversationMessages[i - 1]

        dateDiff = m.senderId === nextMessage.senderId
          ? date.getDateDiff(nextMessage.createdDate, m.createdDate, 'minutes')
          : Infinity

        if (dateDiff >= maxDelayBetweenGroupMessages) {
          groups.push(newGroup)
        } else {
          groups[groups.length - 1].additionalMessages.push(m)
          groups[groups.length - 1].contents.push(m.content)
        }

        return groups
      }, [])

      return messageGroups.map(g => Object.assign(g, g.additionalMessages.pop())) // add chat meta
    },
    attachments () {
      return this.inbox.conversationMessages.reduce((a, m) => [...a, ...m.attachments], [])
    },
    canUploadAttachments () {
      return this.inbox.attachmentsEnabled && this.attachments.length <= 5
    },
    messageDisabled () {
      if (!this.conversation) return false
      return this.conversation.isEmpty && this.conversation.transaction && this.conversation.transaction.status === 'cancelled'
    },
    interlocutorAvatar () {
      return this.getAvatarImageUrl(this.inbox.interlocutor)
    },
    currentUserAvatar () { // computed because we need afterAuth results first
      return this.getAvatarImageUrl(this.currentUser)
    },
    ...mapState([
      'auth',
      'content',
      'inbox',
      'layout',
      'style',
    ]),
    ...mapGetters([
      'getAvatarImageUrl',
      'currentUser',
      'conversations',
    ]),
  },
  async preFetch ({ store }) {
    await Promise.all([
      store.dispatch('fetchAssetsRelatedResources'),
    ])
  },
  mounted () {
    EventBus.$on('newMessage', () => this.fetchMessagesAndMarkAsRead())
  },
  beforeDestroy () {
    EventBus.$off('newMessage', () => this.fetchMessagesAndMarkAsRead())
  },
  methods: {
    async afterAuth () {
      const { id: conversationId } = this.$route.params

      this.conversationId = conversationId

      await this.fetchMessagesAndMarkAsRead()
    },
    async fetchMessagesAndMarkAsRead () {
      await this.$store.dispatch('fetchMessages')

      if (!this.conversation) {
        // display an error
      } else {
        await this.$store.dispatch('fetchConversationInfo', { conversationId: this.conversationId })
        await this.$store.dispatch('markConversationAsRead', { conversationId: this.conversationId })
      }
    },
    getTimestamp (date) {
      const delay = this.fromNow(date)

      if (delay.timeUnit === 'd' && delay.nbUnits > 7) {
        return this.$t({ id: 'time.date_long' }, { date })
      }

      return this.$t({ id: 'time.ago' }, {
        timeUnit: delay.timeUnit,
        nbUnits: delay.nbUnits
      })
    },
    // TODO: turn into some util function
    fromNow (pastDate, unit = 'minutes') {
      const now = new Date()
      const minuteDiff = date.getDateDiff(now, pastDate, 'minutes')
      const diff = {
        minutes: minuteDiff,
        nbUnits: minuteDiff,
        timeUnit: 'm'
      }
      const daysToMinutes = 60 * 24
      const hoursToMinutes = 60

      if (diff.minutes > daysToMinutes) {
        diff.nbUnits = Math.round(diff.minutes / daysToMinutes)
        diff.timeUnit = 'd'
      } else if (diff.minutes > hoursToMinutes) {
        diff.nbUnits = Math.round(diff.minutes / hoursToMinutes)
        diff.timeUnit = 'h'
      }

      return diff
    },
    afterUploadCompleted ({ transformedUploadedFiles }) { // AppUpload mixin
      this.uploadedAttachments = transformedUploadedFiles

      if (this.sendingMessage) this.sendMessage()
    },
    async sendMessage () {
      // do not send empty message
      if (!this.draftMessage) return

      const uploadPending = this.uploadedAttachments.length < this.uploaderFiles.length
      this.sendingMessage = true

      // message will be sent after the end of upload, called from afterUploadCompleted
      if (uploadPending) return

      try {
        // fetch any new messages
        await this.$store.dispatch('fetchMessages')

        const firstNotification = this.inbox.conversation.isEmpty ? true : undefined

        await this.$store.dispatch('sendMessage', {
          topicId: this.inbox.transaction.id || this.inbox.asset.id,
          conversationId: this.inbox.conversation.id,
          content: this.draftMessage,
          receiverId: this.inbox.interlocutor.id,
          attachments: this.getTransformedUploadedFiles(),
          metadata: {
            instant: {
              firstNotification,
            }
          }
        })

        this.draftMessage = ''
        this.resetUploader()
      } finally {
        this.sendingMessage = false
      }
    },
    onSaveRatings () {
      // refresh the rating scores
      this.$store.dispatch('fetchMessages', { forceRefreshAll: true })
    },
  },
}
</script>

<template>
  <QPage padding>
    <div class="row flex-center">
      <div class="stl-content-container conversation-container">
        <AppContent
          tag="h1"
          class="text-h4 text-weight-medium"
          entry="pages"
          field="inbox.conversation_with"
          :options="{ interlocutorName: inbox.interlocutor.displayName }"
        />
        <div class="row justify-center">
          <AssetCard
            :asset="inbox.asset"
            class="mobile-stacked"
          />
          <div class="mobile-stacked conversation__details">
            <div class="text-body1 q-mt-none">
              <div v-if="inbox.transaction.id">
                <!-- Further customization is needed once we have full user info -->
                {{ ownerDisplayName }}
                <!-- We need a high level of customization here, with ICU contents stored in Stelace
                  to show something such as 'Candidature reçue le…' -->
                <!-- {{ $t({ id: 'time.date_long' }, { date: inbox.transaction.createdDate }) }} -->
                <span v-if="inbox.transaction.assetType.timeBased">
                  <AppContent
                    v-if="endDate"
                    tag="div"
                    entry="time"
                    field="per_time_unit_with_context"
                    :options="{
                      context: $t({ id: 'time.duration_label' }),
                      nbUnits: nbTimeUnits,
                      timeUnit
                    }"
                  />
                  <AppContent
                    tag="div"
                    entry="time"
                    field="from_start_date_to_end_date"
                    :options="{
                      startDate,
                      endDate,
                      showTime: false
                    }"
                  />
                </span>
              </div>
              <div
                v-if="attachments.length"
                class="conversation__attachments q-my-sm"
              >
                <AppLink
                  v-for="(a, i) in attachments"
                  :key="`${i}-${a.name}`"
                  class="anchor-text--reset q-mr-xs"
                  :to="a.url"
                  :download="a.name"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <QChip
                    class="text-weight-medium text-grey-8"
                    :color="lightBackgroundColor"
                    icon="insert_drive_file"
                  >
                    {{ a.name }}
                  </QChip>
                </AppLink>
              </div>
            </div>
            <TransactionStatus
              v-if="conversation && conversation.transaction"
              class="text-h6 q-my-sm q-pt-sm text-center"
              :transaction="conversation.transaction"
            />
            <TransactionActions
              v-if="conversation && conversation.transaction"
              container-class="row justify-center"
              :transaction="conversation.transaction"
              :actions="conversation.transactionActions"
              :prompt-ratings="conversation.ratingsPrompt"
              :ratings-author="currentUser"
              :ratings-target="conversation.interlocutor"
              :ratings-readonly="conversation.ratingsReadonly"
              :flat="false"
              @save="onSaveRatings"
            />
          </div>
        </div>

        <QSeparator v-if="!messageDisabled" class="q-my-lg" />

        <div
          v-if="!messageDisabled"
          class="row justify-end items-start q-mb-none"
        >
          <div
            v-if="canUploadAttachments && fileUpload.bigger"
            class="mobile-stacked q-pa-sm"
          >
            <QUploader
              ref="uploader"
              :factory="uploadFactory"
              :filter="uploadFilter"
              auto-upload
              flat
              square
              @added="filesAdded"
              @removed="filesRemoved"
              @uploaded="filesUploaded"
              @failed="filesFailed"
            >
              <template v-slot:header="scope">
                <div
                  class="row no-wrap items-center q-px-sm q-py-md q-gutter-xs cursor-pointer relative-position"
                >
                  <!-- Relative positionning of parent is needed for QUploaderAddTriger -->
                  <QUploaderAddTrigger />
                  <QSpinner
                    v-if="scope.isUploading"
                    class="q-uploader__spinner"
                  />
                  <div class="col text-center">
                    <AppContent
                      tag="div"
                      class="q-uploader__title"
                      entry="prompt"
                      field="upload_attachments_button"
                    />
                    <div
                      v-if="scope.files.length"
                      class="q-uploader__subtitle"
                    >
                      {{ scope.uploadSizeLabel }} / {{ scope.uploadProgressLabel }}
                    </div>
                  </div>
                  <QBtn
                    v-if="scope.editable && scope.isUploading"
                    icon="clear"
                    round
                    dense
                    flat
                    @click="scope.abort"
                  >
                    <AppContent
                      tag="QTooltip"
                      class="q-uploader__title"
                      entry="prompt"
                      field="cancel_button"
                    />
                  </QBtn>
                </div>
              </template>
            </QUploader>
          </div>
          <QInput
            v-model="draftMessage"
            class="mobile-stacked q-pb-md"
            type="textarea"
            input-class="q-ml-sm"
            autogrow
            :placeholder="$t({ id: 'pages.inbox.message_to' }, { interlocutorName: inbox.interlocutor.displayName })"
            @keyup.enter.stop
          >
            <template
              v-if="canUploadAttachments && !fileUpload.bigger"
              v-slot:prepend
            >
              <QBtn
                round
                dense
                flat
                icon="attachment"
              />
            </template>
            <template v-slot:append>
              <QBtn
                :disabled="!draftMessage"
                icon="send"
                color="primary"
                round
                dense
                flat
                :loading="sendingMessage"
                @click="sendMessage"
              />
            </template>
          </QInput>
        </div>

        <!-- Each message increases total height up to CSS max-height depending on viewport height -->
        <!--
          TODO: show some indicator than scroll is available (without having to hover)
          We will probably need to get computed styles as q-scroll-area does not expose this
          We could also submit a new PR to expose scroll percentage
          https://github.com/quasarframework/quasar/blob/dev/ui/src/components/scroll-area/QScrollArea.js
        -->
        <component
          :is="inbox.conversationMessages.length > 3 ? 'q-scroll-area' : 'div'"
          :style="inbox.conversationMessages.length > 3 ? `height: ${inbox.conversationMessages.length * 6}rem` : ''"
          class="conversation__messages-container"
        >
          <QChatMessage
            v-for="message in groupedChatMessages"
            :key="message.id"
            class="q-mb-md"
            :name="message.senderId === currentUser.id ? currentUser.displayName : inbox.interlocutor.displayName"
            :avatar="message.senderId === currentUser.id ? currentUserAvatar : interlocutorAvatar"
            :text="message.contents"
            text-sanitize
            :sent="message.senderId === currentUser.id"
            :text-color="message.senderId === currentUser.id
              ? 'white'
              : (style.colorfulTheme ? '' : 'default-color')"
            :bg-color="message.senderId === currentUser.id
              ? (style.colorfulTheme ? 'primary' : 'grey-8')
              : style.colorfulTheme ? 'secondary' : lightBackgroundColor"
            :stamp="getTimestamp(message.createdDate)"
          />
        </component>

        <QSeparator
          v-if="!layout.isLeftDrawerOpened"
          class="q-my-lg"
        />
        <ProfileCard />
      </div>
    </div>
  </QPage>
</template>

<style lang="stylus" scoped>
.conversation-container
  min-width: 50vw

.conversation__messages-container
  max-height: "calc(80vh - %s)" % $toolbar-min-height

.mobile-stacked
  height: auto
  width: 50%
  &.conversation__details
    padding: 0 $spaces.md.x

  @media (max-width: 480px)
    width: 100%
    &.conversation__details
      padding: $spaces.sm.y $spaces.sm.x

  .q-uploader
    width: 100%
    max-width: 100%
</style>

<style lang="stylus">
.conversation__messages-container .q-message-text-content :not([class*="stamp"])
  white-space pre-line
  word-wrap break-word
</style>
