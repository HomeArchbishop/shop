import { createServer } from 'http'
import { Server as IO } from 'socket.io'
import { msgHandler } from './msgHandler'
import { type SystemNoticeMsg } from '../../share/src/types/Msg'
import { db, dbClear } from './levelDB'

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

io.on('connection', (socket) => {
  console.log(socket.id)
  socket.on('disconnect', () => { msgHandler.handleDisconnection(socket).catch(err => { console.log(err) }) })
  socket.on('lobbyreq', (msg) => { msgHandler.handleLoobyReqAndNotice(socket, msg).catch(err => { console.log(err) }) })
  socket.on('lobbynotice', (msg) => { msgHandler.handleLoobyReqAndNotice(socket, msg).catch(err => { console.log(err) }) })
})

server.listen(24334, () => {
  console.log('listening at 24334')
})

process.on('SIGINT', () => {
  console.log('SIGINT')
  io.emit('systemnotice', { name: 'SystemNoticeServerError', data: { err: 900 } } satisfies SystemNoticeMsg)
  io.disconnectSockets(true)
  io.close(() => {
    dbClear(() => {
      db.close(() => {
        process.exit(0)
      })
    })
  })
})
