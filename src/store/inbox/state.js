export default {
  messages: [],

  // associate fetched messages to the current user
  // so when the current user changes (happens when switching organization, or logging out and in)
  // the action `fetchMessages` will drop all stored messages and perform a full refresh
  // even if we don't pass forceRefreshAll = true
  messagesFetchedForUserId: null,

  usersById: {},
  transactionsById: {},
  assetsById: {},
  ordersById: {},

  conversation: {},
  asset: {},
  transaction: {},
  interlocutor: {},
  conversationMessages: [],

  attachmentsEnabled: true, // can depend on config
}
