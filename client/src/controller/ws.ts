import { io } from 'socket.io-client'

const socket = io('http://localhost:24334', {
  autoConnect: false,
  reconnection: false
})

export { socket }
