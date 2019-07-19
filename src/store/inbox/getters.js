import { groupBy, get } from 'lodash'

import { convertApiToDisplayScore } from 'src/utils/rating'
import { populateUser } from 'src/utils/user'
import { populateAsset } from 'src/utils/asset'
import { getTopicId } from 'src/utils/conversation'
import { isTransactionId, isAssetId } from 'src/utils/id'

export function conversations (state, getters, rootState, rootGetters) {
  const {
    messages,
    usersById,
    transactionsById,
    assetsById,
  } = state
  const {
    ratingsStatsByType,
    ratedTransactionsById,
  } = rootState.rating
  const {
    currentUser,
    ratingsOptions,
    isUser,
    isProvider,
  } = rootGetters
  const {
    categoriesById,
    assetTypesById,
  } = rootState.common

  const messagesByConversationId = groupBy(messages, 'conversationId')

  const conversations = []

  Object.keys(messagesByConversationId).forEach(conversationId => {
    const conversationMessages = messagesByConversationId[conversationId]

    const exposedConversationMessages = conversationMessages.filter(message => {
      return !message.metadata.isHiddenMessage
    })

    const isEmptyConversation = !exposedConversationMessages.length

    const archived = isConversationArchived({ messages: conversationMessages, currentUser })

    const topicId = getTopicId(conversationMessages)

    const transactionId = isTransactionId(topicId) ? topicId : null
    const assetId = isAssetId(topicId) ? topicId : null

    const transaction = transactionId ? transactionsById[transactionId] || {} : {}
    let asset = assetId ? assetsById[assetId] : {}

    // empty conversations can only be viewed by the conversation creator
    // unless the transaction is cancelled
    if (isEmptyConversation && transaction.cancelledDate) {
      return
    }

    const interlocutorId = getInterlocutorId({ currentUser, messages: conversationMessages })
    const interlocutor = usersById[interlocutorId] || {}

    populateUser(interlocutor)

    if (assetId && asset) {
      asset = populateAsset({
        asset,
        usersById,
        categoriesById,
        assetTypesById
      })

      if (asset.owner) {
        populateUser(asset.owner, {
          categoriesById,
          ratingsStatsByType,
          ratingsOptions,
          isCurrentUser: currentUser.id === asset.owner.id,
        })
      }
    }

    // populate the different types of ratings
    interlocutor.ratings = {}

    const ratingTypes = Object.keys(ratingsOptions.stats)
    ratingTypes.forEach(ratingType => {
      const ratingConfig = ratingsOptions.stats[ratingType]

      const apiAvgScore = get(ratingsStatsByType, `${ratingType}.${interlocutorId}.avg`, null)
      interlocutor.ratings[ratingType] = convertApiToDisplayScore(apiAvgScore, { displayMaxScore: ratingConfig.maxScore })
    })

    const lastInterlocutorMessage = conversationMessages.find(message => message.senderId !== currentUser.id)
    const lastOwnMessage = conversationMessages.find(message => message.senderId === currentUser.id)

    const transactionActions = transactionId ? getTransactionActions({ isUser, isProvider, transaction, isEmptyConversation }) : {}
    const ratingsPrompt = transactionId ? getRatingsPrompt({ isProvider, transaction }) : false
    const ratingsReadonly = !!ratedTransactionsById[transactionId]

    let transactionAsset
    if (transactionId) {
      transactionAsset = get(transaction, 'assetSnapshot', {})
      const assetType = transaction.assetType

      transactionAsset = populateAsset({
        asset: transactionAsset,
        usersById: {},
        categoriesById,
        assetTypesById: {
          [transaction.assetTypeId]: assetType
        }
      })
    }

    const conversation = {
      id: conversationId,
      asset: transactionId ? transactionAsset : asset,
      transaction,
      transactionActions,
      ratingsPrompt,
      ratingsReadonly,
      archived,
      read: lastInterlocutorMessage ? lastInterlocutorMessage.read : true,
      interlocutor,
      messages: exposedConversationMessages,
      lastInterlocutorMessage,
      lastOwnMessage,
      isEmpty: isEmptyConversation
    }

    conversations.push(conversation)
  })

  return conversations
}

function isConversationArchived ({ messages, currentUser }) {
  return messages.some(message => message.metadata.archived && message.senderId === currentUser.id)
}

function getInterlocutorId ({ currentUser, messages }) {
  return currentUser.id === messages[0].senderId
    ? messages[0].receiverId
    : messages[0].senderId
}

function getTransactionActions ({ isUser, isProvider, transaction, isEmptyConversation }) {
  const transactionActions = {}

  if (transaction.status === 'draft') {
    if (isEmptyConversation && isUser) {
      transactionActions.cancel = true
      transactionActions.cancellationReason = 'withdrawn'
    } else if (isProvider) {
      transactionActions.accept = true
      transactionActions.cancel = true
      transactionActions.cancellationReason = 'refusedByOwner'
    } else if (isUser) {
      transactionActions.cancel = true
      transactionActions.cancellationReason = 'withdrawn'
    }
  } else if (transaction.status === 'accepted') {
    if (isUser) {
      transactionActions.confirmAndPay = true
      transactionActions.cancel = true
      transactionActions.cancellationReason = 'refusedByTaker'
    }
  }

  return transactionActions
}

function getRatingsPrompt ({ isProvider, transaction }) {
  if (!isProvider) return false

  return ['validated', 'completed'].includes(transaction.status)
}
