<script>
import { mapState, mapGetters } from 'vuex'
import { get } from 'lodash'

import TransactionActions from 'src/components/TransactionActions'
import TransactionStatus from 'src/components/TransactionStatus'

import PageComponentMixin from 'src/mixins/pageComponent'

export default {
  components: {
    TransactionActions,
    TransactionStatus,
  },
  mixins: [
    PageComponentMixin,
  ],
  data () {
    return {
      filter: '',
      selectFilter: 'active', // 'archive', 'show' or 'hide'
      selected: [],
      columns: [
        {
          name: 'id',
          label: 'ID',
          align: 'left',
          field: row => row.id,
        },
        {
          name: 'interlocutor',
          required: true,
          label: this.$t({ id: 'user.name_label' }),
          align: 'left',
          field: row => get(row, 'interlocutor.displayName', ''),
          sortable: true
        },
        {
          name: 'assetName',
          required: true,
          label: this.$t({ id: 'asset.name_label' }),
          align: 'left',
          field: row => get(row, 'asset.name', ''),
          sortable: true
        },
        {
          name: 'messages', // sorted from last to oldest
          align: 'left',
          label: 'Content',
          field: row => row.messages,
        },
        {
          name: 'status',
          required: true,
          label: this.$t({ id: 'transaction.status.label' }),
          align: 'center',
          field: row => get(row, 'transaction.status', ''),
          sortable: true
        },
      ],
      rating: {
        dialogOpened: false,
        author: {},
        target: {},
        transaction: {},
        savedRatings: [],
        readonly: false
      },
    }
  },
  computed: {
    ...mapState([
      'style',
      'auth',
    ]),
    ...mapGetters([
      'currentUser',
      'conversations',
      'ratingsActive'
    ]),
    // do not display conversations without any visible message
    visibleConversations () {
      return this.conversations.filter(conversation => !conversation.isEmpty)
    },
    filteredConversations () {
      if (this.selectFilter === 'active') return this.activeConversations
      else if (this.selectFilter === 'archive') return this.archivedConversations
      else if (this.selectFilter === 'unread') return this.unreadConversations

      return this.visibleConversations
    },
    activeConversations () {
      return this.visibleConversations.filter(conversation => !conversation.archived)
    },
    archivedConversations () {
      return this.visibleConversations.filter(conversation => conversation.archived)
    },
    unreadConversations () {
      return this.visibleConversations.filter(conversation => !conversation.read)
    },
    selectFilterLabel () {
      return this.selectFilterOptions.find(option => option.value === this.selectFilter).label
    },
    selectFilterOptions () {
      return [
        {
          label: this.$t({ id: 'pages.inbox.filter.active' }),
          count: this.activeConversations.length,
          value: 'active'
        },
        {
          label: this.$t({ id: 'pages.inbox.filter.unread' }),
          count: this.unreadConversations.length,
          value: 'unread'
        },
        {
          label: this.$t({ id: 'pages.inbox.filter.all' }),
          count: this.visibleConversations.length,
          value: 'all'
        },
        {
          label: this.$t({ id: 'pages.inbox.filter.archived' }),
          count: this.archivedConversations.length,
          value: 'archive'
        },
      ]
    },
  },
  methods: {
    afterAuth () {
      this.$store.dispatch('fetchMessages')
    },
    onSaveRatings () {
      // refresh the rating scores
      this.$store.dispatch('fetchMessages', { forceRefreshAll: true })
    },
    archive (conversationId) {
      this.$store.dispatch('setConversationArchivedStatus', { conversationId, archived: true })
    },
    unarchive (conversationId) {
      this.$store.dispatch('setConversationArchivedStatus', { conversationId, archived: false })
    },
    markAsRead (conversationId) {
      this.$store.dispatch('markConversationAsRead', { conversationId })
    },
    searchConversations (rows, terms, cols) {
      const lowerTerms = terms ? terms.toLowerCase() : ''

      return rows.filter(row => {
        const rowMessages = row.messages.map(m => m.content.toLowerCase())
        const assetName = get(row, 'asset.name', '').toLowerCase()
        const interlocutorName = get(row, 'interlocutor.displayName', '').toLowerCase()

        if (rowMessages.some(m => m.includes(lowerTerms))) return true
        if (interlocutorName.includes(lowerTerms)) return true
        if (assetName.includes(lowerTerms)) return true

        return false
      })
    }
  }
}
</script>

<template>
  <QPage
    class="stl-footer--bottom"
    padding
  >
    <div class="inbox stl-content-container stl-content-container--large margin-h-center">
      <AppContent
        tag="h1"
        class="text-h4 text-weight-medium"
        entry="pages"
        field="inbox.inbox_header"
      />
      <div class="row flex-center q-mb-md shadow-2">
        <QTable
          class="col-12"
          :title="$t({ id: 'pages.inbox.inbox_header' })"
          :data="filteredConversations"
          :columns="columns"
          :visible-columns="['interlocutor', 'assetName', 'messages', 'status']"
          :rows-per-page-options="[5, 10, ,20, 50]"
          row-key="id"
          selection="multiple"
          :selected.sync="selected"
          :filter="filter"
          :filter-method="searchConversations"
          :hide-header="$q.screen.xs"
          grid
        >
          <template>
            <!-- v-slot:top="props" -->
            <QSpace />

            <div
              v-if="$q.screen.gt.xs"
              class="col"
            >
              <QBtnDropdown
                :label="selectFilterLabel"
                :rounded="style.roundedTheme"
                :flat="!style.colorfulTheme"
              >
                <QList>
                  <QItem
                    v-for="option in selectFilterOptions"
                    :key="option.value"
                    v-close-popup
                    clickable
                    @click="selectFilter = option.value"
                  >
                    <QItemSection>
                      <QItemLabel class="row justify-between">
                        <div>
                          {{ option.label }}
                        </div>
                        <QBadge
                          class="filter-count-badge q-ml-md"
                          color="grey-3"
                          text-color="default-color"
                        >
                          {{ option.count || 0 }}
                        </QBadge>
                      </QItemLabel>
                    </QItemSection>
                  </QItem>
                </QList>
              </QBtnDropdown>
            </div>

            <QInput
              v-model="filter"
              class="gt-xs"
              borderless
              dense
              debounce="300"
              :placeholder="$t({ id: 'form.search.placeholder' })"
            >
              <template v-slot:append>
                <QIcon name="search" />
              </template>
            </QInput>
          </template>

          <template v-slot:item="props">
            <router-link
              :to="{ name: 'conversation', params: { id: props.row.id } }"
              :class="[
                'conversation anchor-text--reset col-12',
                props.row.read ? '' : 'unread'
              ]"
            >
              <!-- Useless to set archives to lower opacity when shown alone -->
              <QItem
                :class="[
                  'q-pt-md',
                  props.selected ? 'bg-grey-4' : '',
                  props.row.archived && selectFilter !=='archive' ? 'archived-conversation' : ''
                ]"
              >
                <QItemSection
                  class="interlocutor-avatar"
                  avatar
                >
                  <AppAvatar :user="props.row.interlocutor" />
                </QItemSection>

                <QItemSection
                  top
                  class="col-2 gt-xs"
                >
                  <QItemLabel class="interlocutor-name q-mt-sm">
                    {{ props.row.interlocutor.displayName }}
                  </QItemLabel>
                  <AppRatingStars
                    v-if="ratingsActive && typeof props.row.interlocutor.ratings.default === 'number'"
                    :value="props.row.interlocutor.ratings.default"
                    readonly
                  />
                </QItemSection>

                <QItemSection>
                  <QItemLabel lines="1">
                    <span class="asset-name">
                      {{ props.row.asset && props.row.asset.name }}
                    </span>
                  </QItemLabel>
                  <QItemLabel
                    class="text-body2 text-grey-7"
                    lines="1"
                  >
                    <!-- There are some situations where conversations have no messages (initial contact) -->
                    <span class="inline-block q-mr-sm text-grey-6">
                      {{ props.row.lastInterlocutorMessage
                        ? $formatDate(
                          props.row.lastInterlocutorMessage.createdDate,
                          { format: 'dateTime' }
                        )
                        : ''
                      }}
                    </span>
                    <span
                      :class="[
                        props.row.read ? '' : 'text-weight-medium'
                      ]"
                    >
                      {{ props.row.lastInterlocutorMessage
                        ? props.row.lastInterlocutorMessage.content
                        : ''
                      }}
                    </span>
                  </QItemLabel>
                  <QItemLabel class="inbox-prompt-bar q-mt-xs text-body2">
                    <!-- Also use .stop modifier in case a click handler is added on a parent -->
                    <div
                      class="inbox-action-button-container"
                      @click.stop.prevent
                    >
                      <TransactionActions
                        :transaction="props.row.transaction"
                        :actions="props.row.transactionActions"
                        :prompt-ratings="props.row.ratingsPrompt"
                        :ratings-author="currentUser"
                        :ratings-target="props.row.interlocutor"
                        :ratings-readonly="props.row.ratingsReadonly"
                        button-size="0.75em"
                        @save="onSaveRatings"
                      />
                    </div>
                  </QItemLabel>
                </QItemSection>

                <QItemSection side>
                  <TransactionStatus
                    v-if="props.row.transaction"
                    :transaction="props.row.transaction"
                  />
                </QItemSection>

                <QItemSection side>
                  <div
                    class="text-grey-8 q-gutter-xs"
                    @click.stop.prevent
                  >
                    <QBtn
                      v-if="!props.row.archived"
                      flat
                      dense
                      round
                      class="gt-sm"
                      size="12px"
                      icon="archive"
                      @click="archive(props.row.id)"
                    />
                    <QBtn
                      v-if="!props.row.read"
                      flat
                      dense
                      round
                      class="gt-sm"
                      size="12px"
                      icon="drafts"
                      @click="markAsRead(props.row.id)"
                    />
                    <QBtn
                      size="12px"
                      flat
                      dense
                      round
                      icon="more_vert"
                    >
                      <q-menu auto-close>
                        <QList>
                          <QItem
                            v-if="props.row.archived"
                            clickable
                            @click="unarchive(props.row.id)"
                          >
                            <QItemSection avatar>
                              <QIcon name="unarchive" />
                            </QItemSection>
                            <QItemSection>{{ $t({ id: 'prompt.archive_to_inbox_button'}) }}</QItemSection>
                          </QItem>
                          <!-- Still show these on bigger screens as icon labels -->
                          <QItem
                            v-if="!props.row.archived"
                            clickable
                            @click="archive(props.row.id)"
                          >
                            <QItemSection avatar>
                              <QIcon name="archive" />
                            </QItemSection>
                            <QItemSection>{{ $t({ id: 'prompt.archive_button'}) }}</QItemSection>
                          </QItem>
                          <QItem
                            v-if="!props.row.read"
                            clickable
                            @click="markAsRead(props.row.id)"
                          >
                            <QItemSection avatar>
                              <QIcon name="drafts" />
                            </QItemSection>
                            <QItemSection>{{ $t({ id: 'prompt.mark_as_read_button'}) }}</QItemSection>
                          </QItem>
                        </QList>
                      </q-menu>
                    </QBtn>
                  </div>
                </QItemSection>
              </QItem>
            </router-link>
          </template>
        </QTable>
      </div>
    </div>

    <AppFooter />
  </QPage>
</template>

<style lang="stylus" scoped>
.filter-count-badge
  border-radius: $badge-rounded-border-radius

.interlocutor-avatar
  @media (max-width: 420px)
    display: none

.inbox-action-button-container
  display: inline-block

.conversation
  border-bottom: 1px solid $separator-color
  &:hover:hover // overrides unread below
    background: $grey-1
  &.unread
    background: $grey-3
    .interlocutor-name, .asset-name
      font-weight: 500

.archived-conversation
  opacity: 0.6

.absolute-bottom.absolute-bottom
  // override default footer position
  position: absolute
</style>

<style lang="stylus">
.inbox .q-table
  border-bottom: 1px solid $separator-color
  th:not(.sortable)
    color: transparent
  th:not([class*="text-"]) > *
    // Hiding global checkbox too for now.
    visibility: hidden
</style>
