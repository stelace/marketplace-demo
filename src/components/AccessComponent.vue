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
      canCreateAsset,
    } = getters

    const mapActionToAccess = {
      createAsset: canCreateAsset,
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
