import io from 'socket.io-client'

const signalWebsocketEndpoint = 'https://api.stelace.com/signal'

const connection = process.env.STELACE_API_URL ? `${process.env.STELACE_API_URL}/signal`
  : signalWebsocketEndpoint

const socket = io(connection, {
  path: '/signal',
  autoConnect: false, // waiting for Vue app to authenticate properly
  transports: ['websocket']
})

export default socket
