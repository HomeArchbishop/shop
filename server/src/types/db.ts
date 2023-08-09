interface PlayerInRoomState {
  isHost: boolean
  isBot: boolean
  socketID?: string
  playerID: string
}

interface PlayerDB {
  online: boolean
  roomID?: string
  socketID: string
  playerID: string
}

interface SocketDB {
  socketID: string
  playerID: string
}

interface RoomDB {
  roomID: string
  isLocked: boolean
  hostPlayerID: string
  hostSocketID: string
  players: PlayerInRoomState[]
}

export type { PlayerDB, SocketDB, RoomDB, PlayerInRoomState }
