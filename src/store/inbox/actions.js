import { compact, uniqBy, get, uniq } from 'lodash'
import stelace, { fetchAllResults } from 'src/utils/stelace'
import * as types from 'src/store/mutation-types'

import { isAssetId } from 'src/utils/id'

export async function fetchMessages ({ commit, dispatch, state, rootGetters }, { forceRefreshAll = false } = {}) {
  // fetch the current user here
  // getters.currentUser may have not been populated in time
  // OR the current user changes (login/logout or organization)
  await dispatch('fetchCurrentUser')
  const currentUser = rootGetters.currentUser
  const isEcommerceMarketplace = rootGetters.isEcommerceMarketplace
  if (!currentUser) return

  const userId = currentUser.id

  const fetchMessagesRequest = (...args) => stelace.messages.list(...args)

  let messages

  if (forceRefreshAll || state.messagesFetchedForUserId !== userId) {
    messages = await fetchAllResults(fetchMessagesRequest, { userId })
  } else {
    const previousMessages = state.messages
    const lastUpdatedDate = state.messages.reduce((memo, message) => {
      return (!memo || memo <= message.updatedDate) ? message.updatedDate : memo
    }, null)

    const params = {
      userId
    }
    // only get new messages or newly updated messages
    if (lastUpdatedDate) {
      params.updatedDate = {
        gt: lastUpdatedDate
      }
    }

    const newMessages = await fetchAllResults(fetchMessagesRequest, params)

    // skip below fetching if there is no new message
    if (!newMessages.length) return

    messages = uniqBy(newMessages.concat(previousMessages), message => message.id)
  }

  commit({
    type: types.SET_MESSAGES,
    messages,
    userId
  })

  let topicsIds = []
  let usersIds = []
  let assetsIds = []
  let transactionsIds = []

  messages.forEach(message => {
    if (message.senderId !== userId) {
      usersIds.push(message.senderId)
    }
    if (message.receiverId !== userId) {
      usersIds.push(message.receiverId)
    }

    if (message.topicId) {
      topicsIds.push(message.topicId)
    }
  })

  usersIds = compact(uniqBy(usersIds))
  topicsIds = uniqBy(topicsIds)
  assetsIds = topicsIds.filter(isAssetId)

  const fetchAssetsRequest = (...args) => stelace.assets.list(...args)
  const fetchAllAssets = fetchAllResults(fetchAssetsRequest, { id: assetsIds })

  const fetchOrdersRequest = (...args) => stelace.orders.list(...args)
  const fetchAllOrdersAsPayer = fetchAllResults(fetchOrdersRequest, { payerId: userId })
  const fetchAllOrdersAsReceiver = fetchAllResults(fetchOrdersRequest, { receiverId: userId })

  const fetchTransactionsRequest = (...args) => stelace.transactions.list(...args)
  const fetchAllTransactionsAsOwner = fetchAllResults(fetchTransactionsRequest, { ownerId: userId })
  const fetchAllTransactionsAsTaker = fetchAllResults(fetchTransactionsRequest, { takerId: userId })

  let orders

  if (isEcommerceMarketplace) {
    const [
      ordersAsPayer,
      ordersAsReceiver,
    ] = await Promise.all([
      fetchAllOrdersAsPayer,
      fetchAllOrdersAsReceiver,
    ])

    orders = ordersAsPayer.concat(ordersAsReceiver)

    orders.forEach(order => {
      order.lines.forEach(l => {
        const transactionId = get(l, 'metadata.transactionId')
        const assetId = get(l, 'metadata.assetId')

        if (transactionId) transactionsIds.push(transactionId)
        if (assetId) assetsIds.push(assetId)

        if (l.payerId) usersIds.push(l.payerId)
        if (l.receiverId) usersIds.push(l.receiverId)
      })
    })
  }

  transactionsIds = uniq(transactionsIds)
  assetsIds = uniq(assetsIds)

  const [
    assets,
    transactionsAsOwner,
    transactionsAsTaker,
  ] = await Promise.all([
    assetsIds.length ? fetchAllAssets : [],
    fetchAllTransactionsAsOwner,
    fetchAllTransactionsAsTaker,
  ])

  const transactions = transactionsAsOwner.concat(transactionsAsTaker)

  usersIds = compact(uniqBy(usersIds.concat(assets.map(asset => asset.ownerId))))

  const fetchUsersRequest = (...args) => stelace.users.list(...args)
  const fetchAllUsers = fetchAllResults(fetchUsersRequest, { id: usersIds })

  const users = usersIds.length ? await fetchAllUsers : []

  commit({
    type: types.INBOX__SET_USERS,
    users
  })
  commit({
    type: types.INBOX__SET_TRANSACTIONS,
    transactions
  })
  commit({
    type: types.INBOX__SET_ASSETS,
    assets
  })
  commit({
    type: types.INBOX__SET_ORDERS,
    orders
  })

  if (rootGetters.ratingsActive) {
    const transactionsIds = uniqBy(transactions.map(b => b.id))
    const assetIds = uniqBy(assets.map(asset => asset.id))

    await Promise.all([
      dispatch('fetchRatingsStats', { targetId: usersIds, groupBy: 'targetId' }),
      dispatch('fetchRatingsStats', { assetId: assetIds, groupBy: 'assetId' }),
      dispatch('fetchRatedTransactions', { transactionsIds })
    ])
  }
}

export async function setConversationArchivedStatus ({ commit, state, getters }, { conversationId, archived }) {
  const currentUser = getters.currentUser
  const conversations = getters.conversations

  const updateFn = async (message) => {
    if (message.metadata.archived === archived) return message

    const newMessage = await stelace.messages.update(message.id, { metadata: { archived } })
    return newMessage
  }

  const conversation = conversations.find(conversation => conversation.id === conversationId)
  const messagesToArchive = conversation.messages.filter(message => {
    return message.senderId === currentUser.id
  })

  await updateMessages({
    state,
    commit,
    messages: messagesToArchive,
    currentUser,
    updateFn
  })
}

export async function markConversationAsRead ({ commit, state, getters }, { conversationId }) {
  const currentUser = getters.currentUser
  const conversations = getters.conversations

  const updateFn = async (message) => {
    if (message.read) return message

    const newMessage = await stelace.messages.update(message.id, { read: true })
    return newMessage
  }

  const conversation = conversations.find(conversation => conversation.id === conversationId)
  const messagesToMarkAsRead = conversation.messages.filter(message => {
    return message.receiverId === currentUser.id
  })

  await updateMessages({
    state,
    commit,
    messages: messagesToMarkAsRead,
    currentUser,
    updateFn
  })
}

async function updateMessages ({ state, commit, messages, currentUser, updateFn }) {
  const updatedMessages = {}

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]
    const updatedMessage = await updateFn(message)
    updatedMessages[updatedMessage.id] = updatedMessage
  }

  const allMessages = state.messages.map(message => {
    const updatedMessage = updatedMessages[message.id]
    return updatedMessage || message
  })

  commit({
    type: types.SET_MESSAGES,
    messages: allMessages,
    userId: currentUser.id
  })
}

export async function fetchConversationInfo ({ commit, getters }, { conversationId } = {}) {
  const conversations = getters.conversations
  const conversation = conversations.find(conversation => conversation.id === conversationId)

  commit({
    type: types.SET_CONVERSATION,
    conversation,
    asset: conversation.asset
  })
  commit({
    type: types.SET_SELECTED_USER,
    user: conversation.interlocutor
  })
}

export async function sendMessage ({ commit, state, getters }, {
  topicId,
  conversationId,
  content,
  receiverId,
  attachments,
  metadata
}) {
  const currentUser = getters.currentUser

  const message = await stelace.messages.create({
    topicId,
    conversationId,
    content,
    receiverId,
    attachments,
    metadata
  })

  commit({
    type: types.SET_MESSAGES,
    messages: [message].concat(state.messages),
    userId: currentUser.id
  })

  const conversations = getters.conversations
  if (conversationId) {
    const conversation = conversations.find(conversation => conversation.id === conversationId)

    commit({
      type: types.SET_CONVERSATION,
      conversation,
      asset: state.asset
    })
  }

  return message
}
