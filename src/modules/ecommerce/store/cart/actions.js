import { getCartFromLocalStorage, setCartInLocalStorage, removeCartFromLocalStorage } from './localStorage'
import pMap from 'p-map'
import stelace, { fetchAllResults } from 'src/utils/stelace'
import { get, keyBy, isUndefined, isNil, omit } from 'lodash'

import * as types from 'src/store/mutation-types'

import { paymentsApi } from 'src/utils/url'
import { populateUser } from 'src/utils/user'

function cloneCart (cart) {
  return {
    ownerId: cart.ownerId,
    lines: cart.lines.slice(0),
  }
}

export async function loadLocalCart ({ commit, state }) {
  const { localCart } = state

  if (!localCart) {
    commit({
      type: types.CART__SET_LOCAL_CART,
      localCart: getCartFromLocalStorage(),
    })
  }
}

export async function addToCart ({ dispatch, rootGetters }, {
  asset,
  incrementQuantityBy = 1,
  startDate, // optional, specified if asset type is time based
  endDate, // optional, specified if asset type is time based
}) {
  const {
    shoppingCart,
  } = rootGetters

  const cartLine = shoppingCart.lines.find(l => l.assetId === asset.id)

  let quantity = 0

  if (cartLine) quantity = cartLine.quantity + incrementQuantityBy
  else quantity = incrementQuantityBy

  quantity = Math.max(quantity, 0)

  return dispatch('updateCart', { asset, quantity, startDate, endDate })
}

export async function updateCart ({ commit, dispatch, rootState, rootGetters }, {
  asset,
  quantity = 1,
  startDate, // optional, specified if asset type is time based
  endDate, // optional, specified if asset type is time based
}) {
  const {
    shoppingCart,
  } = rootGetters

  const maxQuantity = asset.quantity
  if (maxQuantity < quantity) {
    const error = new Error('Max quantity exceeded')
    error.code = 'MAX_QUANTITY_EXCEEDED'
    error.maxQuantity = maxQuantity
    throw error
  }

  if (shoppingCart.ownerId && asset.ownerId !== shoppingCart.ownerId) {
    const error = new Error('Cannot add asset from other owner for now')
    error.code = 'CART_MULTIPLE_OWNERS'
    error.ownerId = shoppingCart.ownerId
    throw error
  }

  const newCart = cloneCart(shoppingCart)

  if (quantity === 0) {
    newCart.lines = newCart.lines.filter(l => l.assetId !== asset.id)
  } else {
    const line = newCart.lines.find(l => l.assetId === asset.id)

    if (line) {
      line.quantity = quantity
      if (!isNil(startDate)) line.startDate = startDate
      if (!isNil(endDate)) line.endDate = endDate
    } else {
      newCart.lines.push({ assetId: asset.id, quantity, ownerId: asset.ownerId, startDate, endDate })
    }
  }

  if (!newCart.ownerId) newCart.ownerId = asset.ownerId

  return dispatch('syncCart', { cart: newCart })
}

export async function removeFromCart ({ commit, dispatch, rootGetters }, { assetIds }) {
  const {
    shoppingCart,
  } = rootGetters

  const lines = shoppingCart.lines.filter(l => !assetIds.includes(l.assetId))

  const newCart = {
    ...shoppingCart,
    lines,
    ownerId: lines[0] ? lines[0].ownerId : null,
  }

  return dispatch('syncCart', { cart: newCart })
}

export async function emptyCart ({ commit, dispatch, rootGetters }) {
  return dispatch('syncCart', { cart: null })
}

export async function syncCart ({ commit, dispatch, rootGetters }, { cart: c } = {}) {
  const {
    currentUser,
    shoppingCart,
  } = rootGetters

  const cart = !isUndefined(c) ? c : shoppingCart

  const removingCart = cart === null

  const cartToSave = !removingCart
    ? cloneCart(cart)
    : null

  if (removingCart) {
    removeCartFromLocalStorage()
  } else {
    setCartInLocalStorage(cartToSave)
  }

  commit({
    type: types.CART__SET_LOCAL_CART,
    localCart: cartToSave,
  })

  if (currentUser.id) {
    const attrs = {
      metadata: {
        _private: { cart: cartToSave }
      }
    }

    await dispatch('updateUser', { userId: currentUser.id, attrs })
  }

  return dispatch('verifyCart')
}

export async function previewCartTransactions ({ commit, rootGetters }) {
  const {
    shoppingCart,
  } = rootGetters

  let previewedTransactions = []
  let owner

  if (shoppingCart.lines.length) {
    previewedTransactions = await pMap(shoppingCart.lines, async (cartLine) => {
      let preview

      try {
        preview = await stelace.transactions.preview(getTransactionParams({
          assetId: cartLine.assetId,
          quantity: cartLine.quantity,
          startDate: cartLine.startDate,
          endDate: cartLine.endDate,
        }))
      } catch (err) {
        if (err.message.includes('does not have enough quantity')) {
          const quantity = get(err, 'data.quantity') || 1

          preview = await stelace.transactions.preview(getTransactionParams({
            assetId: cartLine.assetId,
            quantity,
            startDate: cartLine.startDate,
            endDate: cartLine.endDate,
          }))
        } else {
          throw err
        }
      }

      return preview
    }, { concurrency: 5 })

    const ownerId = previewedTransactions[0].ownerId

    owner = await stelace.users.read(ownerId)
    populateUser(owner)
  }

  commit({
    type: types.CART__SET_PREVIEWED_TRANSACTIONS,
    previewedTransactions,
  })

  commit({
    type: types.CART__SET_OWNER,
    owner,
  })
}

export async function createOrderFromCart ({ state, getters, rootGetters, dispatch }) {
  const { shoppingCart } = getters
  const { currentUser, paymentActive } = rootGetters

  if (!currentUser.id) throw new Error('Cannot create an order for non-connected user')

  // preview transactions again to have fresh information for transactions and owner
  await dispatch('previewCartTransactions')

  const { owner } = state

  const transactions = await pMap(shoppingCart.lines, cartLine => {
    return stelace.transactions.create(getTransactionParams({
      assetId: cartLine.assetId,
      quantity: cartLine.quantity,
      startDate: cartLine.startDate,
      endDate: cartLine.endDate,
    }))
  }, { concurrency: 5 })

  const url = paymentsApi.createOrder

  const order = await stelace.forward.post(url, {
    transactionIds: transactions.map(t => t.id)
  })

  if (paymentActive) return { order }

  // create a message if payment isn't enabled
  // so the current user is directly redirected to conversation
  const message = await stelace.messages.create({
    content: ' ',
    topicId: order.id,
    receiverId: owner.id,
    metadata: {
      isHiddenMessage: true
    }
  })

  return { order, message }
}

export async function removeAssetsFromOrder ({ state, getters, rootGetters, dispatch }, { orderId }) {
  const order = await stelace.orders.read(orderId)

  const assetIds = order.lines.reduce((ids, l) => {
    const assetId = get(l, 'metadata.assetId')
    if (assetId) return ids.concat([assetId])
    else return ids
  }, [])

  await dispatch('removeFromCart', { assetIds })
}

export async function verifyCart ({ state, getters, rootGetters, dispatch }) {
  const { shoppingCart } = getters
  const { currentUser } = rootGetters

  const assetIds = shoppingCart.lines.map(l => l.assetId)
  if (!assetIds) return

  const fetchAssetsRequest = (...args) => stelace.assets.list(...args)
  const fetchAllAssets = fetchAllResults(fetchAssetsRequest, { id: assetIds })

  const assets = await fetchAllAssets

  const isOwnerOfAsset = asset => currentUser.id && asset.ownerId === currentUser.id

  const assetsById = keyBy(assets, 'id')
  const shoppingCartLinesByAssetId = keyBy(shoppingCart.lines, 'assetId')

  const removedIds = []
  const ownershipIds = []
  const availabilityChanges = []

  assetIds.forEach(assetId => {
    const asset = assetsById[assetId]
    if (!asset) removedIds.push(assetId)
    if (isOwnerOfAsset(asset)) ownershipIds.push(assetId)
  })

  const assetIdsToRemove = removedIds
    .concat(ownershipIds)

  if (assetIdsToRemove.length) {
    await dispatch('removeFromCart', { assetIds: assetIdsToRemove })
  }

  await dispatch('previewCartTransactions')

  const { previewedTransactions } = state

  const previewedTransactionsByAssetId = keyBy(previewedTransactions, 'assetId')

  assetIds.forEach(assetId => {
    const asset = assetsById[assetId]
    const previewedTransaction = previewedTransactionsByAssetId[assetId]
    const shoppingCartLine = shoppingCartLinesByAssetId[assetId]

    if (previewedTransaction && previewedTransaction.quantity < shoppingCartLine.quantity) {
      availabilityChanges.push({
        asset,
        quantity: previewedTransaction.quantity,
        startDate: previewedTransaction.startDate,
        endDate: previewedTransaction.endDate,
      })
    }
  })

  if (availabilityChanges.length) {
    for (const change of availabilityChanges) {
      const { asset, quantity, startDate, endDate } = change
      await dispatch('updateCart', { asset, quantity, startDate, endDate })
    }
  }

  const cartChanges = (removedIds.length ||
    ownershipIds.length ||
    availabilityChanges.length
  )
    ? {
      removedIds,
      ownershipIds,
      availabilityChanges,
    }
    : null

  return { cartChanges }
}

function getTransactionParams (params) {
  if (isNil(params.startDate) || isNil(params.endDate)) {
    return omit(params, ['startDate', 'endDate'])
  } else {
    return params
  }
}
