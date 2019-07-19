import { values, uniqBy } from 'lodash'
import stelace, { fetchAllResults } from 'src/utils/stelace'
import * as types from 'src/store/mutation-types'

export async function createTransaction ({ state }, { asset } = {}) {
  const {
    startDate,
    endDate,
    quantity
  } = state

  const transactionAttrs = {
    assetId: asset.id
  }
  if (startDate) transactionAttrs.startDate = startDate
  if (endDate) transactionAttrs.endDate = endDate
  if (quantity) transactionAttrs.quantity = quantity

  const transaction = await stelace.transactions.create(transactionAttrs)

  const message = await stelace.messages.create({
    content: ' ',
    topicId: transaction.id,
    receiverId: transaction.ownerId,
    metadata: {
      isHiddenMessage: true
    }
  })

  return {
    transaction,
    message
  }
}

export async function createTransactionTransition ({ commit, state }, { transactionId, transitionName, data }) {
  const transaction = await stelace.transactions.createTransition(transactionId, { name: transitionName, data })
  commitTransaction({ commit, state }, { transaction })
}

function commitTransaction ({ commit, state }, { transaction }) {
  const newTransactionsById = Object.assign({}, state.transactionsById)
  newTransactionsById[transaction.id] = transaction

  commit({
    type: types.INBOX__SET_TRANSACTIONS,
    transactions: values(newTransactionsById)
  })
}

export async function fetchTransactions ({ commit }, { userId, assetId, asTaker, asOwner }) {
  const fetchTransactionsRequest = (...args) => stelace.transactions.list(...args)

  const fetchAllTransactionsAsOwner = fetchAllResults(fetchTransactionsRequest, {
    ownerId: userId,
    assetId
  })
  const fetchAllTransactionsAsTaker = fetchAllResults(fetchTransactionsRequest, {
    takerId: userId,
    assetId
  })

  const [
    transactionsAsOwner,
    transactionsAsTaker,
  ] = await Promise.all([
    asOwner ? fetchAllTransactionsAsOwner : [],
    asTaker ? fetchAllTransactionsAsTaker : [],
  ])

  const allTransactions = transactionsAsOwner.concat(transactionsAsTaker)

  return uniqBy(allTransactions, transaction => transaction.id)
}

export async function previewTransaction ({ commit }, { assetId, startDate, endDate, quantity }) {
  const previewAttrs = { assetId }
  if (startDate) previewAttrs.startDate = startDate
  if (endDate) previewAttrs.endDate = endDate
  if (quantity) previewAttrs.quantity = quantity

  const preview = await stelace.transactions.preview(previewAttrs)

  commit({
    type: types.SET_TRANSACTION_PREVIEW,
    preview
  })

  return preview
}

export function resetTransactionPreview ({ commit }) {
  commit({
    type: types.SET_TRANSACTION_PREVIEW,
    preview: null
  })
}
