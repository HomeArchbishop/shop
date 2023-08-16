interface SystemNoticeServerError {
  name: 'SystemNoticeServerError'
  data: { err: number }
}

interface LobbyReqLogin {
  name: 'LobbyReqLogin'
  data: { playerID: string, _id?: string }
}

interface LobbyReqCreateRoom {
  name: 'LobbyReqCreateRoom'
  data: { playerID: string, _id?: string }
}

interface LobbyReqEnterRoom {
  name: 'LobbyReqEnterRoom'
  data: { playerID: string, roomID: string, _id?: string }
}

interface LobbyReqSyncPrepareRoom {
  name: 'LobbyReqSyncPrepareRoom'
  data: { playerID: string, roomID: string, _id?: string }
}

interface LobbyResLogin {
  name: 'LobbyResLogin'
  data: { playerID: string, state: boolean, _id: string }
}

interface LobbyResCreateRoom {
  name: 'LobbyResCreateRoom'
  data: { playerID: string, roomID: string, state: boolean, _id?: string }
}

interface LobbyResEnterRoom {
  name: 'LobbyResEnterRoom'
  data: { playerID: string, roomID: string, state: boolean, _id?: string }
}

interface LobbyResSyncPrepareRoom {
  name: 'LobbyResSyncPrepareRoom'
  data: { playerID: string, state: boolean, players: Array<{ isHost: boolean, isBot: boolean, playerID: string }>, _id?: string }
}

interface LobbyNoticeLeaveRoom { /* someone leave (can be me) */
  name: 'LobbyNoticeLeaveRoom'
  data: { playerID: string, roomID: string, newHostPlayerID?: string }
}

interface LobbyNoticeRoomDismiss {
  name: 'LobbyNoticeRoomDismiss'
  data: { roomID: string }
}

interface LobbyNoticeAddBot {
  name: 'LobbyNoticeAddBot'
  data: { roomID: string, playerID?: string }
}

interface LobbyNoticeAddPlayer {
  name: 'LobbyNoticeAddPlayer'
  data: { roomID: string, playerID: string }
}

interface LobbyNoticeGameStart {
  name: 'LobbyNoticeGameStart'
  data: { roomID: string }
}

interface GameNoticeAny {
  name: 'GameNoticeAny'
  data: any
}

type SystemNoticeMsg = SystemNoticeServerError
type LobbyReqMsg = LobbyReqLogin | LobbyReqCreateRoom | LobbyReqSyncPrepareRoom | LobbyReqEnterRoom
type LobbyResMsg = LobbyResLogin | LobbyResCreateRoom | LobbyResSyncPrepareRoom | LobbyResEnterRoom
type LobbyNoticeMsg = LobbyNoticeLeaveRoom | LobbyNoticeAddBot | LobbyNoticeAddPlayer | LobbyNoticeGameStart
| LobbyNoticeRoomDismiss
type GameNoticeMsg = GameNoticeAny

type Msg = LobbyReqMsg | LobbyResMsg | LobbyNoticeMsg | GameNoticeMsg

export type { Msg, LobbyReqMsg, LobbyResMsg, LobbyNoticeMsg, SystemNoticeMsg }
