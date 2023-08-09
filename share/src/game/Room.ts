import { type Player } from './Player'

interface RoomSetting {
  roomID: string
}

class Room {
  constructor (roomSetting: RoomSetting) {
    this.roomID = roomSetting.roomID
    this.settings = roomSetting
  }

  roomID: string

  settings: RoomSetting

  players: Player[] = []
}

export { Room }
