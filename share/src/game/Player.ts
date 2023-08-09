import { type Room } from './Room'

interface PlayerSettings {
  room: Room
  playerID: string
  isHost?: boolean
  isBot?: boolean
}

class Player {
  constructor ({ room, playerID, isHost = false, isBot = false }: PlayerSettings) {
    this.room = room
    this.playerID = playerID
    this.isHost = isHost
    this.isBot = isBot
  }

  playerID: string

  isHost: boolean
  isBot: boolean

  room: Room
}

export { Player }
