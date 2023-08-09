import { createServer } from 'http'
import { Server as IO } from 'socket.io'
import { msgHandler } from './msgHandler'

const server = createServer((_, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' })
  res.write('it works!')
  res.end()
})

const io = new IO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
})

;(io as any).on('connection', (socket) => {
  console.log(socket.id)
  socket.on('disconnect', () => { msgHandler.handleDisconnection(socket).catch(err => { console.log(err) }) })
  socket.on('lobbyreq', (msg) => { msgHandler.handleLoobyReqAndNotice(socket, msg).catch(err => { console.log(err) }) })
  socket.on('lobbynotice', (msg) => { msgHandler.handleLoobyReqAndNotice(socket, msg).catch(err => { console.log(err) }) })
})

server.listen(24334, () => {
  console.log('listening at 24334')
})
