<script>
import { mapState, mapGetters } from 'vuex'
import * as mutationTypes from 'src/store/mutation-types'

import MainLayoutHeader from 'src/layouts/MainLayoutHeader'

import AppUpdateDialog from 'src/components/AppUpdateDialog'
import AuthDialog from 'src/components/AuthDialog'
import EmailValidationDialog from 'src/components/EmailValidationDialog'
import TransactionCard from 'src/components/TransactionCard'

import AuthDialogMixin from 'src/mixins/authDialog'

export default {
  components: {
    MainLayoutHeader,

    AppUpdateDialog,
    AuthDialog,
    EmailValidationDialog,
    TransactionCard,
  },
  mixins: [
    AuthDialogMixin,
  ],
  data () {
    return {
      routeTransitionName: '',
      transactionCardOpened: false,
      hasLoadingBar: false,
      loadingBarRouteGuard: _ => _,
    }
  },
  computed: {
    isOwnerCurrentUser () {
      return this.currentUser.id === this.asset.activeAsset.ownerId
    },
    redirectUrl () {
      const { redirect } = this.$route.query
      return (this.isHome && redirect) || null
    },
    isHome () {
      return this.route.name === 'home'
    },
    isAssetPage () {
      return this.route.name === 'asset'
    },
    isProfilePage () {
      return this.route.name === 'publicProfile'
    },
    isCartPage () {
      return this.route.name === 'cart'
    },
    hasLeftDrawer () {
      return this.route.meta.hasLeftDrawer
    },
    isFooterDrawerOpened () {
      const showOnAssetPage = (this.isAssetPage && !this.$q.screen.gt.md && !this.isOwnerCurrentUser) ||
        (this.isCartPage && !this.$q.screen.gt.md)
      return showOnAssetPage
    },
    blurredPage () {
      return (this.auth.authDialogOpened && this.auth.authDialogPersistent) ||
        this.layout.isPageBlurred
    },
    timeBased () {
      if (!this.activeAsset) return true
      const assetType = this.common.assetTypesById[this.activeAsset.assetTypeId]
      if (!assetType) return true
      return assetType.timeBased
    },
    ...mapState([
      'asset',
      'auth',
      'layout',
      'route',
      'style',
      'cart',
      'common',
    ]),
    ...mapGetters([
      'currentUser',
      'selectedUser',
      'activeAsset',
      'isActiveAssetAvailable',
      'isSelectedUserNatural',
      'shoppingCart',
      'maxAvailableQuantity',
      'isEcommerceMarketplace',
      'marketplaceType',
    ]),
  },
  watch: {
    '$route' (to, from) {
      const toDepth = to.path.split('/').length
      const fromDepth = from.path.split('/').length

      this.routeTransitionName =
        (!this.style.pageTransitions || ['home', 'search'].includes(to.name)) ? ''
          : toDepth < fromDepth ? 'fadeInLeft' : 'fadeInRight'
    },
  },
  mounted () {
    // Don’t show AjaxBar before first navigation for consistency
    this.loadingBarRouteGuard = this.$router.afterEach(this.showLoadingBar)
  },
  methods: {
    toggleLeftDrawer (visible = !this.isLeftDrawerOpened) {
      this.$store.commit(mutationTypes.LAYOUT__TOGGLE_LEFT_DRAWER, { visible })
    },
    openTransactionCard () {
      this.transactionCardOpened = true
    },
    showLoadingBar () {
      this.hasLoadingBar = true
      this.loadingBarRouteGuard() // unregister
    }
  },
}
</script>

<template>
  <QLayout
    :class="blurredPage ? 'app--blur' : ''"
    view="hhr LpR fFr"
  >
    <MainLayoutHeader />
    <QAjaxBar
      v-if="hasLoadingBar"
      ref="loadingBar"
      position="top"
      color="secondary"
      size="3px"
    />

    <!-- <QDrawer v-model="right" side="right" elevated content-class="bg-accent">
    </QDrawer> -->

    <QFooter
      :value="isFooterDrawerOpened"
      elevated
      class="bg-white text-default-color"
    >
      <div
        v-if="isAssetPage"
        class="q-pa-md row items-center"
      >
        <div class="col-1 gt-xs" />
        <div class="col-6 col-sm-5">
          <div>
            {{ activeAsset.name || activeAsset.categoryName }}
          </div>
          <div>
            <AppContent
              entry="pricing"
              field="price_label"
            />:&nbsp;
            <AppContent
              v-if="activeAsset.assetType && activeAsset.assetType.timeBased"
              entry="pricing"
              field="price_per_time_unit_label"
              :options="{
                price: $fx(activeAsset.price),
                timeUnit: activeAsset.timeUnit
              }"
            />
            <AppContent
              v-else
              entry="pricing"
              field="price_with_currency"
              :options="{ price: $fx(activeAsset.price) }"
            />
          </div>
          <div v-if="isEcommerceMarketplace">
            <AppContent
              entry="asset"
              field="delivery_fee_with_price"
              :options="{ price: $fx(activeAsset.owner ? activeAsset.owner.deliveryFee : 0) }"
            />
          </div>
        </div>
        <div
          v-if="!isOwnerCurrentUser"
          class="col-6 col-sm-5 text-right"
        >
          <QBtn
            :disabled="isOwnerCurrentUser || maxAvailableQuantity === 0"
            :rounded="style.roundedTheme"
            :label="
              isEcommerceMarketplace
                ? $t({ id: 'cart.prompt.add_to_cart' })
                : $t({ id: 'asset.checkout_action' }, { timeBased, marketplaceType })
            "
            color="secondary"
            @click="openTransactionCard"
          />
        </div>
        <div class="col-1 gt-xs" />
      </div>
      <div
        v-if="isCartPage"
        class="q-pa-md row items-center"
      >
        <div class="col-1 col-md-2 gt-xs" />
        <div class="col-5 col-md-4 q-pr-md">
          <div
            :class="[
              'row justify-between',
              !cart.previewedTransactions.length ? 'invisible' : ''
            ]"
          >
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

          <div
            :class="[
              'row justify-between',
              !cart.previewedTransactions.length ? 'invisible' : ''
            ]"
          >
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

          <div
            :class="[
              'row justify-between text-weight-medium text-h6',
              !cart.previewedTransactions.length ? 'invisible' : ''
            ]"
          >
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
        </div>
        <div class="col-7 col-sm-5 col-md-4 text-right">
          <AppCheckoutButton />
        </div>
      </div>
    </QFooter>

    <QPageContainer :class="{ 'header--overlay': isHome }">
      <transition :enter-active-class="`animated ${routeTransitionName}`">
        <router-view />
      </transition>
    </QPageContainer>

    <AuthDialog :redirect-url="redirectUrl" />
    <AppUpdateDialog />

    <template v-if="currentUser.id">
      <EmailValidationDialog />
    </template>

    <QDialog
      :value="transactionCardOpened"
      @hide="transactionCardOpened = false"
    >
      <TransactionCard class="bg-white" />
    </QDialog>
  </QLayout>
</template>

<style lang="stylus" scoped>
.header--overlay
  padding-top: 0 !important

</style>
