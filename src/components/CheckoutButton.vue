<script>
import { mapState, mapGetters } from 'vuex'
import { values } from 'lodash'

export default {
  data () {
    return {}
  },
  computed: {
    ...mapState([
      'style',
      'common',
    ]),
    ...mapGetters([
      'activeAsset',
    ]),
    assetTypes () {
      return values(this.common.assetTypesById)
    },
    timeBased () {
      if (!this.activeAsset) return true
      const assetType = this.common.assetTypesById[this.activeAsset.assetTypeId]
      if (!assetType) return true
      return assetType.timeBased
    },
  },
}
</script>

<template>
  <QBtn
    :rounded="style.roundedTheme"
    :label="$t({ id: 'asset.checkout_action' }, { timeBased })"
    color="secondary"
    v-on="$listeners"
  />
</template>

<style>
</style>
