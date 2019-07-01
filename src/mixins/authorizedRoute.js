import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters([
      'canCreateAsset',
      'canSubscribeToPlan',
    ])
  },

  methods: {
    checkAccessOrRedirect (action) {
      let haveAccess = false

      switch (action) {
        case 'createAsset':
          haveAccess = this.canCreateAsset
          break

        case 'subscribeToPlan':
          haveAccess = this.canSubscribeToPlan
          break

        default:
          haveAccess = false
          break
      }

      if (!haveAccess) {
        this.notifyWarning('error.not_authorized_page')
        this.$router.push({ name: 'home' })
      }

      return haveAccess
    },
  }
}
