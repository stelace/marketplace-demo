<script>
import { mapState, mapGetters } from 'vuex'

export default {
  data () {
    return {}
  },
  computed: {
    ...mapState([
      'style',
    ]),
    ...mapGetters([
      'isSelectedUserNatural', // Button text depends on selectedUser who is owner of current asset
    ]),
  },
}
</script>

<template>
  <QBtn
    :rounded="style.roundedTheme"
    :label="$t({ id: 'asset.checkout_action' }, { timeBased: !isSelectedUserNatural })"
    color="secondary"
    v-on="$listeners"
  />
</template>

<style>
</style>
