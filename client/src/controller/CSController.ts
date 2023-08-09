import { socket } from './ws'
import type { LobbyNoticeMsg, LobbyReqMsg, LobbyResMsg } from '../../../share/src/types/Msg'
import { uid } from 'uid'
import { EventEmitter } from '@billjs/event-emitter'

interface CSControllerOptions {
  isLocal?: boolean
}

class CSController {
  constructor (opts?: CSControllerOptions) {
    this.isLocal = opts?.isLocal ?? false
  }

  isLocal: boolean

  emitter = new EventEmitter()

  async socketConnect (): Promise<void> {
    let resolveFn = (): void => {}
    let rejectFn = (): void => {}
    const promise = new Promise<void>((resolve, reject) => { resolveFn = resolve; rejectFn = reject })
    socket.on('connect', resolveFn)
    socket.on('connect_error', rejectFn)
    socket.on('lobbyres', (e: LobbyResMsg) => {
      this.emitter.fire('lobbyres', e)
    })
    socket.on('lobbynotice', (e: LobbyNoticeMsg) => {
      this.emitter.fire('lobbynotice', e)
    })
    socket.connect()
    await promise
  }

  sendLobbyReq (msg: LobbyReqMsg): string {
    msg.data._id = uid(8)
    socket.emit('lobbyreq', msg)
    return msg.data._id
  }

  sendLobbyNotice (msg: LobbyNoticeMsg): void {
    socket.emit('lobbynotice', msg)
  }
}

export { CSController }
