<script>
export default {
  functional: true,
  props: {
    action: {
      type: String,
      required: true
    },
    tag: { // use it when you pass multiple children in AccessComponent (default to div)
      type: String,
      default: ''
    },
  },
  render (createElement, context) {
    const {
      parent,
      props,
      slots
    } = context

    const getters = parent.$store.getters

    const {
      canViewCreateAssetCta,
      canCreateAsset,
      canViewPlanPricing,
      canSubscribeToPlan,
      canBookAsset,
      canViewBookAssetCta,
      canContactUser,
      canViewContactUserCta
    } = getters

    const mapActionToAccess = {
      viewCreateAssetCta: canViewCreateAssetCta,
      createAsset: canCreateAsset,
      viewPlanPricing: canViewPlanPricing,
      subscribeToPlan: canSubscribeToPlan,
      viewBookAssetCta: canViewBookAssetCta,
      bookAsset: canBookAsset,
      viewContactUserCta: canViewContactUserCta,
      contactUser: canContactUser
    }

    const showComponent = mapActionToAccess[props.action] || false

    if (showComponent) {
      if (slots().default.length > 1) {
        return createElement(props.tag || 'div', slots().default)
      } else {
        return slots().default[0]
      }
    }

    return null
  }
}
</script>

<style lang="stylus" scoped>
</style>
