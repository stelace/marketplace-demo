import { values, uniqBy } from 'lodash'
import stelace, { fetchAllResults } from 'src/utils/stelace'
import * as types from 'src/store/mutation-types'

export async function createTransaction ({ state }, { asset } = {}) {
  const availabilities = await stelace.availabilities.list({ assetId: asset.id })
  const availability = availabilities.length ? availabilities[0] : null

  const {
    startDate,
    endDate,
    duration,
  } = getTransactionDates({ availability })

  const transaction = await stelace.transactions.create({
    assetId: asset.id,
    startDate,
    endDate,
    duration,
    quantity: 1
  })

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

function getTransactionDates ({ availability }) {
  const now = new Date().toISOString()

  const result = {
    startDate: now,
    duration: undefined,
    endDate: undefined
  }

  if (!availability) {
    return result
  }

  result.startDate = availability.endDate < now ? now : availability.endDate

  const isUnavailability = availability.quantity === 0

  if (!isUnavailability && availability.endDate >= now) {
    result.endDate = availability.endDate
  }

  return result
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
