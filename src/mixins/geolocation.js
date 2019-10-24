import * as mutationTypes from 'src/store/mutation-types'

export default {
  computed: {
    geolocationSupported () { // not reactive but it gets the right value the first time though
      return !!navigator.geolocation
    },
  },
  methods: {
    async getGeolocationPermissionState () {
      // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/permissions
      // if Permissions API isn't supported, behave like the permission needs to be asked again
      if (!navigator.permissions) return 'prompt'

      // https://developer.mozilla.org/en-US/docs/Web/API/PermissionStatus
      const permissionStatus = await navigator.permissions.query({ name: 'geolocation' })
      return permissionStatus.state
    },
    async getUserGeolocation ({ silentError = false } = {}) {
      // https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/getCurrentPosition
      const options = {
        maximumAge: 10 * 60 * 1000 // 10 minutes of caching to save GPS calls (especially for mobile battery)
      }

      if (!navigator.geolocation) throw new Error('This browser does not support Geolocation API')

      try {
        const userLocation = await new Promise((resolve, reject) => {
          const onSuccess = (position) => {
            resolve({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            })
          }
          const onError = (error) => {
            const err = new Error(error.message)
            err.code = error.code
            reject(err)
          }

          navigator.geolocation.getCurrentPosition(onSuccess, onError, options)
        })

        this.$store.commit(mutationTypes.SET_USER_LOCATION, { location: userLocation })

        return userLocation
      } catch (err) {
        if (silentError) return

        const errorType = this.getGeolocationErrorType(err.code)
        switch (errorType) {
          case 'UNKNOWN_ERROR':
          case 'TIMED_OUT':
            return this.notifyWarning('error.unknown_happened_header')

          case 'PERMISSION_DENIED':
            return this.notifyWarning('places.geolocation_errors.permission_denied')

          case 'POSITION_UNAVAILABLE':
            return this.notifyWarning('places.geolocation_errors.position_unavailable')

          default:
            return this.notifyWarning('error.unknown_happened_header')
        }
      }
    },
    getGeolocationErrorType (code) {
      // https://developer.mozilla.org/en-US/docs/Web/API/PositionError
      const errorTypes = {
        0: 'UNKNOWN_ERROR',
        1: 'PERMISSION_DENIED',
        2: 'POSITION_UNAVAILABLE',
        3: 'TIMED_OUT'
      }

      return errorTypes[code] || errorTypes['0']
    },
  }
}
