<script>
import { mapState, mapGetters } from 'vuex'
import { matArchive, matDrafts, matMoreVert, matSearch, matUnarchive } from '@quasar/extras/material-icons'
import { keyBy } from 'lodash'

import * as mutationTypes from 'src/store/mutation-types'

import CartMixin from 'src/modules/ecommerce/mixins/cart'
import PageComponentMixin from 'src/mixins/pageComponent'

import ProductsList from 'src/modules/ecommerce/components/ProductsList'

import { getDeliveryAddressFromLocalStorage, setDeliveryAddressInLocalStorage } from 'src/modules/ecommerce/store/cart/localStorage'

export default {
  components: {
    ProductsList,
  },
  mixins: [
    CartMixin,
    PageComponentMixin,
  ],
  data () {
    return {
      shoppingCartSynchronized: false,
      localDeliveryAddress: getDeliveryAddressFromLocalStorage(),
      deliveryFee: 0,
      subTotalPrice: 0,
      totalPrice: 0,
    }
  },
  computed: {
    deliveryAddress () {
      return this.currentUser.id
        ? this.currentUser.deliveryAddress || this.localDeliveryAddress
        : this.localDeliveryAddress
    },
    previewedTransactions () {
      return this.cart.previewedTransactions
    },
    ownerDeliveryFee () {
      return (this.cart.owner && this.cart.owner.deliveryFee) || 0
    },
    ...mapState([
      'style',
      'auth',
      'cart',
    ]),
    ...mapGetters([
      'currentUser',
      'conversations',
      'ratingsActive',
      'shoppingCart',
    ]),
  },
  watch: {
    shoppingCart (current) {
      // synchronize only once
      // cannot do it in lifecycle `mounted` function
      // because the getter `shoppingCart` may not be ready yet
      if (this.shoppingCartSynchronized) return

      const previewedTransactions = this.cart.previewedTransactions
      const previewedTransactionsByAssetId = keyBy(previewedTransactions, 'assetId')

      const changed = current.lines.reduce((changed, l) => {
        const previewed = previewedTransactionsByAssetId[l.assetId]
        return !!(!previewed || l.quantity !== previewed.quantity) || changed
      }, false)

      if (changed) {
        this.$store.dispatch('previewCartTransactions')
        this.shoppingCartSynchronized = true
      }
    },
  },
  created () {
    this.icons = {
      matArchive,
      matDrafts,
      matMoreVert,
      matUnarchive,
      matSearch
    }
  },
  methods: {
    async updateDeliveryAddress (value) {
      if (!this.currentUser.id) {
        setDeliveryAddressInLocalStorage(value)
        this.localDeliveryAddress = value
      }

      if (this.currentUser.id) {
        await this.$store.dispatch('updateUser', {
          userId: this.currentUser.id,
          attrs: {
            deliveryAddress: value
          }
        })
      }

      this.notifySuccess('notification.saved')
    },
    updatePrice (prices) {
      this.$store.commit(mutationTypes.CART__SET_PRICES, prices)
    },
  }
}
</script>

<template>
  <QPage
    class="stl-footer--bottom"
    padding
  >
    <div class="row justify-center">
      <div class="gt-md">
        <QPageSticky position="top-right" :offset="[50, 20]">
          <div class="order-price-card q-ma-md q-pa-md text-right">
            <div class="row q-py-sm justify-between">
              <AppContent
                tag="div"
                entry="pricing"
                field="price_label"
              />

              <AppContent
                tag="div"
                entry="pricing"
                field="price_with_currency"
                :options="{ price: $fx(cart.subTotalPrice) }"
              />
            </div>

            <QSeparator />

            <div class="row q-py-sm justify-between">
              <div>
                <AppContent
                  entry="asset"
                  field="delivery_fee_label"
                />
              </div>

              <div>
                <AppContent
                  v-show="$fx(cart.deliveryFee) !== 0"
                  entry="pricing"
                  field="price_with_currency"
                  :options="{ price: $fx(cart.deliveryFee) }"
                />
                <AppContent
                  v-show="$fx(cart.deliveryFee) === 0"
                  entry="pricing"
                  field="free"
                />
              </div>
            </div>

            <QSeparator />

            <div class="row q-py-sm justify-between text-weight-medium text-h6">
              <div>
                <AppContent
                  entry="pricing"
                  field="total"
                />
              </div>

              <div>
                <AppContent
                  v-show="$fx(cart.totalPrice) !== 0"
                  entry="pricing"
                  field="price_with_currency"
                  :options="{ price: $fx(cart.totalPrice) }"
                />
                <AppContent
                  v-show="$fx(cart.totalPrice) === 0"
                  entry="pricing"
                  field="free"
                />
              </div>
            </div>

            <AppCheckoutButton class="q-mt-md" />
          </div>
        </QPageSticky>
      </div>

      <div class="full-width stl-content-container q-pb-xl">
        <AppContent
          tag="h1"
          class="text-h4 text-weight-medium"
          entry="pages"
          field="cart.cart_header"
        />

        <div class="q-pb-md">
          <div class="box shadow-2 q-px-md q-py-md">
            <AppContent
              v-show="deliveryAddress"
              class="text-h6 q-mb-sm"
              tag="div"
              entry="pages"
              field="cart.delivery_address"
            />
            <AppSwitchableEditor
              tag="p"
              class="text-body1 text-justify"
              :value="deliveryAddress"
              active
              :custom-save="updateDeliveryAddress"
              :input-label="$t({ id: 'pages.cart.delivery_address' })"
              input-type="textarea"
            />
          </div>

          <div class="q-mt-lg">
            <div v-show="shoppingCart.lines.length > 1" class="text-right q-mb-md">
              <QBtn
                :rounded="style.roundedTheme"
                :loading="emptyingCart"
                :label="$t({ id: 'pages.cart.delete_cart' })"
                color="grey"
                @click="emptyCart"
              />
            </div>

            <ProductsList
              v-show="previewedTransactions"
              :previewed-transactions="previewedTransactions"
              :delivery-fee="ownerDeliveryFee"
              @change="({ asset, quantity }) => updateCart(asset, quantity)"
              @updatePrice="updatePrice"
            />
            <div v-show="!previewedTransactions.length" class="shadow-2 q-py-lg text-center">
              <AppContent
                class="text-center"
                entry="pages"
                field="cart.empty_cart"
              />
            </div>
          </div>
        </div>
      </div>

      <AppFooter />
    </div>
  </QPage>
</template>

<style lang="stylus" scoped>
.box
  border-radius: $generic-border-radius

.order-price-card
  width: 300px
  border: 1px solid $grey-3

</style>
