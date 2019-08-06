<script>
import { mapState, mapGetters } from 'vuex'
import * as mutationTypes from 'src/store/mutation-types'

import MainLayoutHeader from 'src/layouts/MainLayoutHeader'

import AppUpdateDialog from 'src/components/AppUpdateDialog'
import AuthDialog from 'src/components/AuthDialog'
import CheckoutButton from 'src/components/CheckoutButton'
import EmailValidationDialog from 'src/components/EmailValidationDialog'
import TransactionCard from 'src/components/TransactionCard'

import AuthDialogMixin from 'src/mixins/authDialog'

export default {
  components: {
    MainLayoutHeader,

    AppUpdateDialog,
    AuthDialog,
    CheckoutButton,
    EmailValidationDialog,
    TransactionCard,
  },
  mixins: [
    AuthDialogMixin,
  ],
  data () {
    return {
      routeTransitionName: '',
      checkoutOpenedDialog: false,
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
    hasLeftDrawer () {
      return this.route.meta.hasLeftDrawer
    },
    isFooterDrawerOpened () {
      const showOnAssetPage = this.isAssetPage && !this.$q.screen.gt.md && !this.isOwnerCurrentUser
      return showOnAssetPage
    },
    blurredPage () {
      return (this.auth.authDialogOpened && this.auth.authDialogPersistent) ||
        this.layout.isPageBlurred
    },
    ...mapState([
      'asset',
      'auth',
      'layout',
      'route',
      'style',
    ]),
    ...mapGetters([
      'currentUser',
      'selectedUser',
      'activeAsset',
      'isActiveAssetAvailable',
      'isSelectedUserNatural',
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
  methods: {
    toggleLeftDrawer (visible = !this.isLeftDrawerOpened) {
      this.$store.commit(mutationTypes.LAYOUT__TOGGLE_LEFT_DRAWER, { visible })
    },
    checkout () {
      this.checkoutOpenedDialog = true
    },
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
        class="q-pa-md row"
      >
        <div class="col-1 gt-xs" />
        <div class="col-6 col-sm-5">
          <div>
            {{ activeAsset.name || activeAsset.categoryName }}
          </div>
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
        <div
          v-if="!isOwnerCurrentUser"
          class="col-6 col-sm-5 text-right"
        >
          <CheckoutButton
            :disabled="!isActiveAssetAvailable"
            @click="checkout"
          />
        </div>
        <div class="col-1 gt-xs" />
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
      :value="checkoutOpenedDialog"
      @hide="checkoutOpenedDialog = false"
    >
      <TransactionCard class="bg-white" />
    </QDialog>
  </QLayout>
</template>

<style lang="stylus" scoped>
.header--overlay
  padding-top: 0 !important

</style>
