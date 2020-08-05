import { get, uniq, keyBy } from 'lodash'

// merge remote cart (stored in current user) and local cart (loaded from local storage at app startup)
// take the most recent one
export function shoppingCart (state, getters, rootState, rootGetters) {
  const { currentUser } = rootGetters

  const localCart = state.localCart || {}
  const remoteCart = get(currentUser, 'metadata._private.cart') || {}

  let cart

  if (localCart.ownerId && remoteCart.ownerId) {
    if (localCart.ownerId !== remoteCart.ownerId) {
      cart = remoteCart
    } else {
      const ownerId = remoteCart.ownerId

      const assetIds = uniq(
        (remoteCart.lines || []).map(l => l.assetId)
          .concat((
            localCart.lines || []).map(l => l.assetId)
          )
      )

      const remoteCartAssetsById = keyBy(remoteCart.lines || [], 'assetId')
      const localCartAssetsById = keyBy(localCart.lines || [], 'assetId')

      const lines = []

      assetIds.forEach(assetId => {
        const remoteCart = get(remoteCartAssetsById, assetId) || {}
        const localCart = get(localCartAssetsById, assetId) || {}

        const cartToUse = (remoteCart.quantity || 0) > (localCart.quantity || 0)
          ? remoteCart
          : localCart

        lines.push({
          ownerId,
          assetId,
          quantity: cartToUse.quantity || 0,
          startDate: cartToUse.startDate,
          endDate: cartToUse.endDate,
        })
      })

      cart = {
        ownerId: remoteCart.ownerId,
        lines,
      }

      cart = {
        ownerId: remoteCart.ownerId,
        lines,
      }
    }
  } else if (remoteCart.ownerId) {
    cart = remoteCart
  } else if (localCart.ownerId) {
    cart = localCart
  } else {
    cart = {}
  }

  if (!cart.lines) cart.lines = []
  if (!cart.lines.length) cart.ownerId = null

  return cart
}
