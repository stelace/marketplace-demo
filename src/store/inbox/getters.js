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
    ratingsStatsByTargetId,
    ratingsStatsByAssetId,
    ratedTransactionsById,
  } = rootState.rating
  const {
    currentUser,
    ratingsOptions,
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

    const interlocutorId = getInterlocutorId({ currentUser, messages: conversationMessages })
    const interlocutor = usersById[interlocutorId] || {}

    populateUser(interlocutor)

    if (assetId && asset) {
      asset = populateAsset({
        asset,
        usersById,
        categoriesById,
        assetTypesById,
        ratingsStatsByAssetId,
        ratingsOptions,
      })

      if (asset.owner) {
        populateUser(asset.owner, {
          ratingsStatsByTargetId,
          ratingsOptions,
          isCurrentUser: currentUser.id === asset.owner.id,
        })
      }
    }

    if (rootGetters.ratingsActive) {
      // populate the different types of ratings
      interlocutor.ratings = {}

      const ratingTypes = Object.keys(ratingsOptions.stats)
      ratingTypes.forEach(ratingType => {
        const ratingConfig = ratingsOptions.stats[ratingType]

        const apiAvgScore = get(ratingsStatsByTargetId, `${ratingType}.${interlocutorId}.avg`, null)
        interlocutor.ratings[ratingType] = convertApiToDisplayScore(apiAvgScore, { displayMaxScore: ratingConfig.maxScore })
      })
    }

    const lastInterlocutorMessage = conversationMessages.find(message => message.senderId !== currentUser.id)
    const lastOwnMessage = conversationMessages.find(message => message.senderId === currentUser.id)

    const transactionActions = transactionId ? getTransactionActions({ currentUser, transaction, isEmptyConversation }) : {}

    let ratingsPrompt
    let ratingsReadonly
    if (rootGetters.ratingsActive) {
      ratingsPrompt = transactionId ? getRatingsPrompt({ currentUser, transaction }) : false
      ratingsReadonly = !!ratedTransactionsById[transactionId]
    } else {
      ratingsPrompt = false
      ratingsReadonly = true
    }

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
        },
        ratingsStatsByAssetId,
        ratingsOptions,
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

function getTransactionActions ({ currentUser, transaction, isEmptyConversation }) {
  const transactionActions = {}

  const isOwner = transaction.ownerId === currentUser.id
  const isTaker = transaction.ownerId !== currentUser.id

  if (['draft', 'pending-acceptance'].includes(transaction.status)) {
    if (isTaker) {
      transactionActions.cancel = true
      transactionActions.cancellationReason = 'withdrawn'
    } else if (isOwner) {
      transactionActions.accept = true
      transactionActions.cancel = true
      transactionActions.cancellationReason = 'refusedByOwner'
    }
  } else if (transaction.status === 'accepted') {
    if (isTaker) {
      transactionActions.confirmAndPay = true
      transactionActions.cancel = true
      transactionActions.cancellationReason = 'refusedByTaker'
    }
  }

  return transactionActions
}

function getRatingsPrompt ({ currentUser, transaction }) {
  const isTaker = transaction.ownerId !== currentUser.id

  if (!isTaker) return false

  return ['validated', 'completed'].includes(transaction.status)
}
