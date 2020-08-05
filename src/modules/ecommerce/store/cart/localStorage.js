const cartKey = 'stelaceCart'
const deliveryAddressKey = 'stelaceDeliveryAddress'

export function getCartFromLocalStorage () {
  if (typeof window !== 'object') return {}

  try {
    return JSON.parse(localStorage.getItem(cartKey))
  } catch (err) {
    return {}
  }
}

export function setCartInLocalStorage (cart) {
  if (typeof window !== 'object') return

  localStorage.setItem(cartKey, JSON.stringify(cart))
}

export function removeCartFromLocalStorage () {
  if (typeof window !== 'object') return

  localStorage.removeItem(cartKey)
}

export function getDeliveryAddressFromLocalStorage () {
  if (typeof window !== 'object') return ''

  return localStorage.getItem(deliveryAddressKey)
}

export function setDeliveryAddressInLocalStorage (address) {
  if (typeof window !== 'object') return

  localStorage.setItem(deliveryAddressKey, address)
}

export function removeDeliveryAddressFromLocalStorage () {
  if (typeof window !== 'object') return

  localStorage.removeItem(deliveryAddressKey)
}
