import { mapGetters } from 'vuex'
import { get } from 'lodash'
import NotifyMixin from 'src/mixins/notify'

export default {
  mixings: [
    NotifyMixin,
  ],
  data () {
    return {
      addingToCart: false,
      updatingCart: false,
      emptyingCart: false,
      syncingCart: false,
    }
  },
  computed: {
    ...mapGetters([
      'shoppingCart',
    ]),
  },
  methods: {
    async addToCart (asset, incrementQuantityBy, { startDate, endDate } = {}) {
      this.addingToCart = true
      let error

      try {
        const timeBased = get(asset, 'assetType.timeBased')

        let replacingCartLine = false

        if (timeBased) {
          const cartLine = this.shoppingCart.lines.find(l => l.assetId === asset.id)
          if (cartLine) {
            const sameDates = startDate === cartLine.startDate && endDate === cartLine.endDate

            if (!sameDates) {
              await this.$store.dispatch('removeFromCart', { assetIds: [asset.id] })
              replacingCartLine = true
            }
          }
        }

        const { cartChanges } = await this.$store.dispatch('addToCart', {
          asset,
          incrementQuantityBy,
          startDate,
          endDate,
        })
        if (!replacingCartLine) {
          this.notifySuccess('cart.notification.added_to_cart')
        } else {
          this.notifyInfo('cart.notification.replaced_quantity')
        }
        this.displayCartChangesNotification(cartChanges)
      } catch (err) {
        this.notifyCartError(err)
        error = err
      } finally {
        this.addingToCart = false
      }

      return {
        success: !error,
        error
      }
    },

    async updateCart (asset, quantity) {
      this.updatingCart = true
      let error

      try {
        const { cartChanges } = await this.$store.dispatch('updateCart', { asset, quantity })
        this.notifySuccess('notification.saved')
        this.displayCartChangesNotification(cartChanges)
      } catch (err) {
        this.notifyCartError(err)
        error = err
      } finally {
        this.updatingCart = false
      }

      return {
        success: !error,
        error
      }
    },

    async emptyCart () {
      this.emptyingCart = true
      let error

      try {
        await this.$store.dispatch('emptyCart')
      } catch (err) {
        this.notifyWarning('error.unknown_happened_header')
        error = err
      } finally {
        this.emptyingCart = false
      }

      return {
        success: !error,
        error
      }
    },

    async syncCart () {
      this.syncingCart = true
      let error

      try {
        const { cartChanges } = await this.$store.dispatch('syncCart')
        this.displayCartChangesNotification(cartChanges)
      } catch (err) {
        this.notifyCartError(err)
        error = err
      } finally {
        this.syncingCart = false
      }

      return {
        success: !error,
        error
      }
    },

    displayCartChangesNotification (cartChanges) {
      if (!cartChanges) return

      const { removedIds, ownershipIds, availabilityChanges } = cartChanges

      if (removedIds.length) {
        this.notifyInfo('cart.notification.removed_from_cart.not_found')
      } else if (ownershipIds.length) {
        this.notifyInfo('cart.notification.removed_from_cart.ownership')
      } else if (availabilityChanges.length) {
        this.notifyInfo('cart.notification.removed_from_cart.availability_update')
      }
    },

    notifyCartError (err) {
      if (err.code === 'MAX_QUANTITY_EXCEEDED') {
        this.notifyWarning('cart.error.max_quantity_exceeded')
      } else if (err.code === 'CART_MULTIPLE_OWNERS') {
        this.notifyWarning('cart.error.multi_owner_cart_not_allowed')
      } else {
        this.notifyWarning('error.unknown_happened_header')
      }
    },
  },
}
