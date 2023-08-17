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

  states: {
    house: 'center' | 'shop' | 'iron' | 'machine' | 'magic'
    life: number
    step: number
  } = {
      house: 'center',
      life: 1,
      step: 1
    }
}

export { Player }
