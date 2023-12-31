import { type Socket } from 'socket.io'
import type { LobbyNoticeMsg, LobbyReqMsg, LobbyResMsg } from '../../share/src/types/Msg'
import { db, dbGet } from './levelDB'
import type { SocketDB, PlayerDB, RoomDB } from './types/db'

const msgHandler = {
  async handleDisconnection (socket: Socket): Promise<void> {
    if (global.isServerDownDisconnection === true) { return }
    const socketDB: SocketDB = await dbGet(`socket:${socket.id}`)
    if (socketDB === undefined) { return }
    const playerID = socketDB.playerID
    if (playerID === undefined) { return }
    const playerDB: PlayerDB = await dbGet(`player:${playerID}`)
    await db.del(`player:${playerID}`)
    await db.del(`socket:${socket.id}`)
    if (playerDB?.roomID === undefined) { return } /* the player is not in a room */
    const roomID = playerDB.roomID
    const roomDB: RoomDB = await dbGet(`room:${roomID}`)
    if (roomDB !== undefined) {
      const index = roomDB.players.findIndex(p => p.playerID === playerID)
      if (index !== -1) { roomDB.players.splice(index, 1) }
      if (roomDB.players.filter(p => !p.isBot).length === 0) { // no player left in room, delete room
        await db.del(`room:${roomID}`)
      } else if (roomDB.players.length === 1 && roomDB.isLocked) {
        /* change every rest player's room */
        const playerDB: PlayerDB = await dbGet(`player:${roomDB.players[0].playerID}`)
        if (playerDB?.roomID === roomID) {
          playerDB.roomID = undefined
          await db.put(`player:${roomDB.players[0].playerID}`, playerDB)
        }
        /* send msg */
        socket.to(roomID).emit('lobbynotice', { name: 'LobbyNoticeRoomDismiss', data: { roomID } } satisfies LobbyNoticeMsg)
        await db.del(`room:${roomID}`)
        return
      } else if (roomDB.hostPlayerID === playerID) { // remains player in room, modify players and host
        const nextHost = roomDB.players.find(p => !p.isBot)
        if (nextHost !== undefined) {
          roomDB.hostPlayerID = nextHost.playerID
          roomDB.hostSocketID = nextHost.socketID as string
          nextHost.isHost = true
        }
        await db.put(`room:${roomID}`, roomDB)
      }
      socket.emit('lobbynotice', { name: 'LobbyNoticeLeaveRoom', data: { playerID, roomID } } satisfies LobbyNoticeMsg)
    }
  },
  async handleLoobyReqAndNotice (socket: Socket, msg: LobbyReqMsg | LobbyNoticeMsg): Promise<void> {
    console.log(msg)
    if (msg.name === 'LobbyReqLogin') {
      const playerID: string = msg.data.playerID
      if (playerID === undefined) {
        socket.emit('lobbyres', { name: 'LobbyResLogin', data: { playerID: msg.data.playerID, state: false, err: 100, _id: msg.data._id } })
        return
      }
      const playerDB: PlayerDB = await dbGet(`player:${playerID}`)
      if (playerDB !== undefined) {
        socket.emit('lobbyres', { name: 'LobbyResLogin', data: { playerID: msg.data.playerID, state: false, err: 100, _id: msg.data._id } })
        return
      }
      await db.put(`player:${playerID}`, { online: true, socketID: socket.id, playerID } satisfies PlayerDB)
      await db.put(`socket:${socket.id}`, { socketID: socket.id, playerID } satisfies SocketDB)
      socket.emit('lobbyres', { name: 'LobbyResLogin', data: { playerID: msg.data.playerID, state: true, _id: msg.data._id } })
    }
    if (msg.name === 'LobbyReqCreateRoom') {
      const playerID: string = msg.data.playerID
      if (playerID === undefined) {
        socket.emit('lobbyres', { name: 'LobbyResCreateRoom', data: { playerID: msg.data.playerID, roomID: '', state: false, _id: msg.data._id } } satisfies LobbyResMsg)
        return
      }
      const playerDB: PlayerDB = await dbGet(`player:${playerID}`)
      if (playerDB === undefined) {
        socket.emit('lobbyres', { name: 'LobbyResCreateRoom', data: { playerID: msg.data.playerID, roomID: '', state: false, _id: msg.data._id } } satisfies LobbyResMsg)
        return
      }
      let roomID: string = String(~~(Math.random() * 100000)).padEnd(5, String(~~(Math.random() * 100000)))
      while (await dbGet(`room:${roomID}`) !== undefined) {
        roomID = String(~~(Math.random() * 100000)).padEnd(5, String(~~(Math.random() * 100000)))
      }
      await db.put(`room:${roomID}`, {
        hostPlayerID: playerID, roomID, hostSocketID: socket.id, isLocked: false, players: [{ isHost: true, isBot: false, socketID: socket.id, playerID }]
      } satisfies RoomDB)
      playerDB.roomID = roomID
      await db.put(`player:${playerID}`, playerDB)
      await socket.join(roomID)
      socket.emit('lobbyres', { name: 'LobbyResCreateRoom', data: { playerID: msg.data.playerID, roomID, state: true, _id: msg.data._id } } satisfies LobbyResMsg)
    }
    if (msg.name === 'LobbyReqEnterRoom') {
      const playerID: string = msg.data.playerID
      const roomID: string = msg.data.roomID
      const roomDB: RoomDB = await dbGet(`room:${roomID}`)
      if (playerID === undefined) {
        socket.emit('lobbyres', { name: 'LobbyResEnterRoom', data: { playerID: msg.data.playerID, roomID, _id: msg.data._id, state: false } } satisfies LobbyResMsg)
        return
      }
      if (roomID === undefined) {
        socket.emit('lobbyres', { name: 'LobbyResEnterRoom', data: { playerID: msg.data.playerID, roomID, _id: msg.data._id, state: false } } satisfies LobbyResMsg)
        return
      }
      if (roomDB === undefined) {
        socket.emit('lobbyres', { name: 'LobbyResEnterRoom', data: { playerID: msg.data.playerID, roomID, _id: msg.data._id, state: false } } satisfies LobbyResMsg)
        return
      }
      if (roomDB.isLocked) {
        socket.emit('lobbyres', { name: 'LobbyResEnterRoom', data: { playerID: msg.data.playerID, roomID, _id: msg.data._id, state: false } } satisfies LobbyResMsg)
        return
      }
      if (roomDB.players.find(p => p.playerID === playerID) !== undefined) {
        socket.emit('lobbyres', { name: 'LobbyResEnterRoom', data: { playerID: msg.data.playerID, roomID, _id: msg.data._id, state: false } } satisfies LobbyResMsg)
        return
      }
      const playerDB: PlayerDB = await dbGet(`player:${playerID}`)
      if (playerDB === undefined) {
        socket.emit('lobbyres', { name: 'LobbyResEnterRoom', data: { playerID: msg.data.playerID, roomID, _id: msg.data._id, state: false } } satisfies LobbyResMsg)
        return
      }
      if (playerDB.roomID !== undefined) {
        socket.emit('lobbyres', { name: 'LobbyResEnterRoom', data: { playerID: msg.data.playerID, roomID, _id: msg.data._id, state: false } } satisfies LobbyResMsg)
        return
      }
      roomDB.players.push({ isHost: false, isBot: false, socketID: socket.id, playerID })
      await db.put(`room:${roomID}`, roomDB)
      playerDB.roomID = roomID
      await db.put(`player:${playerID}`, roomDB)
      await socket.join(roomID)
      socket.to(roomID).emit('lobbynotice', { name: 'LobbyNoticeAddPlayer', data: { playerID: msg.data.playerID, roomID } } satisfies LobbyNoticeMsg)
      socket.emit('lobbyres', { name: 'LobbyResEnterRoom', data: { playerID: msg.data.playerID, roomID, _id: msg.data._id, state: true } } satisfies LobbyResMsg)
    }
    if (msg.name === 'LobbyReqSyncPrepareRoom') {
      const roomDB: RoomDB = await dbGet(`room:${msg.data.roomID}`)
      if (roomDB === undefined) {
        // TODO
        socket.emit('lobbyres', { name: 'LobbyResSyncPrepareRoom', data: { playerID: msg.data.playerID, _id: msg.data._id, players: [], state: false } } satisfies LobbyResMsg)
        return
      }
      const players = roomDB.players
      socket.emit('lobbyres', { name: 'LobbyResSyncPrepareRoom', data: { playerID: msg.data.playerID, _id: msg.data._id, players, state: true } } satisfies LobbyResMsg)
    }
    if (msg.name === 'LobbyNoticeLeaveRoom') {
      const playerID: string = msg.data.playerID
      const roomID: string = msg.data.roomID
      const roomDB: RoomDB = await dbGet(`room:${roomID}`)
      if (playerID === undefined || roomID === undefined || roomDB === undefined) { return }
      const socketDB: SocketDB = await dbGet(`socket:${socket.id}`)
      if (socketDB === undefined) { return }
      if (socketDB.playerID !== playerID && roomDB.players.length <= 2 && roomDB.isLocked) { return }
      const targetPlayerStateIndex = roomDB.players.findIndex(p => p.playerID === playerID)
      const targetPlayerState = roomDB.players[targetPlayerStateIndex]
      if (targetPlayerStateIndex === -1) { return }
      if (!targetPlayerState.isBot) { /* not a bot, is in room */
        const playerDB: PlayerDB = await dbGet(`player:${playerID}`)
        if (playerDB?.roomID === roomID) {
          playerDB.roomID = undefined
          await db.put(`player:${playerID}`, playerDB)
          ;(await socket.to(playerDB.socketID).fetchSockets()).forEach(s => { s.leave(roomID) })
        }
      }
      roomDB.players.splice(targetPlayerStateIndex, 1)
      if (roomDB.players.filter(p => !p.isBot).length === 0) {
        await db.del(`room:${roomID}`)
      } else if (roomDB.players.length === 1 && roomDB.isLocked) {
        /* change every rest player's room */
        const playerDB: PlayerDB = await dbGet(`player:${roomDB.players[0].playerID}`)
        if (playerDB?.roomID === roomID) {
          playerDB.roomID = undefined
          await db.put(`player:${roomDB.players[0].playerID}`, playerDB)
        }
        /* send msg & leave socket room */
        socket.to(roomID).emit('lobbynotice', { name: 'LobbyNoticeRoomDismiss', data: { roomID } } satisfies LobbyNoticeMsg)
        socket.emit('lobbynotice', msg)
        ;(await socket.to(playerDB.socketID).fetchSockets()).forEach(s => { s.leave(roomID) })
        await db.del(`room:${roomID}`)
        return
      } else {
        if (roomDB.hostPlayerID === playerID) {
          const nextHost = roomDB.players.find(p => !p.isBot)
          if (nextHost !== undefined) {
            roomDB.hostPlayerID = nextHost.playerID
            roomDB.hostSocketID = nextHost.socketID as string
            nextHost.isHost = true
            msg.data.newHostPlayerID = nextHost.playerID
          }
        }
        await db.put(`room:${roomID}`, roomDB)
      }
      socket.emit('lobbynotice', msg)
      socket.to(roomID).emit('lobbynotice', msg)
    }
    if (msg.name === 'LobbyNoticeAddBot') {
      const roomID: string = msg.data.roomID
      const roomDB: RoomDB = await dbGet(`room:${roomID}`)
      if (roomDB === undefined || roomID === undefined) { return }
      if (roomDB.isLocked) { return }
      if (roomDB.hostSocketID !== socket.id) { return }
      let playerID: string = 'BOT' + String(~~(Math.random() * 10000)).padEnd(4, String(~~(Math.random() * 10000)))
      while (roomDB.players.find(p => p.playerID === playerID) !== undefined) {
        playerID = 'BOT' + String(~~(Math.random() * 10000)).padEnd(4, String(~~(Math.random() * 10000)))
      }
      roomDB.players.push({ isHost: false, isBot: true, socketID: '', playerID })
      await db.put(`room:${roomID}`, roomDB)
      socket.to(roomID).emit('lobbynotice', { name: 'LobbyNoticeAddBot', data: { roomID, playerID } })
      socket.emit('lobbynotice', { name: 'LobbyNoticeAddBot', data: { roomID, playerID } })
    }
    if (msg.name === 'LobbyNoticeGameStart') {
      const roomID: string = msg.data.roomID
      const roomDB: RoomDB = await dbGet(`room:${roomID}`)
      if (roomID === undefined || roomDB === undefined) { return }
      if (roomDB.hostSocketID !== socket.id) { return }
      if (roomDB.isLocked) { return }
      if (roomDB.players.length < 2) { return }
      roomDB.isLocked = true
      await db.put(`room:${roomID}`, roomDB)
      socket.to(roomID).emit('lobbynotice', { name: 'LobbyNoticeGameStart', data: { roomID } })
      socket.emit('lobbynotice', { name: 'LobbyNoticeGameStart', data: { roomID } })
    }
  }
}

export { msgHandler }
