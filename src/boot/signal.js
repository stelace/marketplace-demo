import io from 'socket.io-client'
import VueSocketIO from 'vue-socket.io-extended'

const signalWebsocketEndpoint = 'https://api.stelace.com/signal'

export default async ({ store, Vue }) => {
  const connection = process.env.VUE_APP_STELACE_SIGNAL_URL || signalWebsocketEndpoint

  Vue.use(
    VueSocketIO,
    io(connection, {
      path: '/signal',
      autoConnect: false, // waiting for Vue app to authenticate properly
      transports: ['websocket']
    }),
    {
      // https://github.com/probil/vue-socket.io-extended#evergreen_tree-vuex-store-integration
      store,
      actionPrefix: 'signal_',
      mutationPrefix: 'SIGNAL_'
    }
  )
}
