import { get, keyBy } from 'lodash'
import * as types from 'src/store/mutation-types'

export default {
  [types.SET_MESSAGES] (state, { messages, userId }) {
    state.messages = messages || []
    state.messagesFetchedForUserId = userId
  },

  [types.INBOX__SET_USERS] (state, { users }) {
    state.usersById = keyBy(users, 'id')
  },

  [types.INBOX__SET_TRANSACTIONS] (state, { transactions }) {
    state.transactionsById = keyBy(transactions, 'id')
  },

  [types.INBOX__SET_ASSETS] (state, { assets }) {
    state.assetsById = keyBy(assets, 'id')
  },

  [types.INBOX__SET_ORDERS] (state, { orders }) {
    state.ordersById = keyBy(orders, 'id')
  },

  [types.SET_CONVERSATION] (state, { conversation, asset }) {
    state.conversation = conversation
    state.transaction = conversation.transaction || {}
    state.interlocutor = conversation.interlocutor || {}
    state.conversationMessages = conversation.messages

    const assetType = get(conversation, 'transaction.assetType', {})

    if (asset) {
      const populatedAsset = Object.assign({}, asset, {
        assetType,
        owner: state.usersById[asset.ownerId] || {}
      })

      state.asset = populatedAsset
    } else {
      state.asset = {}
    }
  },
}
