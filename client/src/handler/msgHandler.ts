import { Player } from '../../../share/src/game/Player'
import { Room } from '../../../share/src/game/Room'
import { type LobbyResMsg } from '../../../share/src/types/Msg'

const msgHandler = {
  async handleLoobyRes (msg: LobbyResMsg): Promise<void> {
    if (msg.name === 'LobbyResLogin') {
      if (msg.data.state === true) {
        window.playerID = msg.data.playerID
        window.routeTo('HomeView')
      }
    }
    if (msg.name === 'LobbyResCreateRoom') {
      window.room = new Room({ roomID: msg.data.roomID })
      window.routeTo('CreateRoomView')
    }
    if (msg.name === 'LobbyResLeavePrepareRoom') {
      if (msg.data.state === true) {
        window.room = undefined
        window.routeTo('HomeView')
      }
    }
    if (msg.name === 'LobbyResSyncPrepareRoom') {
      if (window.room !== undefined) {
        window.room.players.push(new Player())
      }
    }
  }
}

export { msgHandler }
