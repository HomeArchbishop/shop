import React, { useEffect, useState } from 'react'
import './LoginView.less'
import { CSController } from '../controller/CSController'
import { type SystemNoticeMsg, type LobbyResMsg } from '../../../share/src/types/Msg'

const csController = new CSController({ isLocal: false })
window.csController = csController

function LoginView (): React.ReactNode {
  const [playerID, setUsername] = useState('')
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(true)

  useEffect(() => {
    if (!csController.isLocal) {
      csController.socketConnect()
        .catch(() => {
          csController.isLocal = true
        })
        .finally(() => {
          setIsConnected(true)
          setIsConnecting(false)
        })
    }
    csController.emitter.on('systemnotice', ({ data }) => {
      const msg = data as SystemNoticeMsg
      if (msg.name === 'SystemNoticeServerError') {
        window.routeTo('SystemErrorView')
      }
    })
    csController.emitter.on('lobbyres', ({ data }) => {
      const msg = data as LobbyResMsg
      if (msg.name === 'LobbyResLogin') {
        if (msg.data.state) {
          window.playerID = msg.data.playerID
          window.routeTo('HomeView')
        }
      }
    })
    return () => {
      csController.emitter.off('lobbyres')
    }
  }, [])

  function login (): void {
    if (playerID.length < 1 || !isConnected) { return }
    csController.sendLobbyReq({ name: 'LobbyReqLogin', data: { playerID } })
  }

  return (
    <div id="LoginViewComtainer">
      <div id="serverStateArea">SERVER&ensp;{
        isConnecting ? 'CONNECTING...' : isConnected ? (csController.isLocal ? 'CONNECTED (LOCAL)' : 'CONNECTED') : 'DISCONNECTED'
      }</div>
      <div id="inputTipArea">YOUR NAME HERE</div>
      <div id="inputArea">
        <input type="text" value={playerID} onChange={e => { setUsername(e.target.value) }}/>
        <button
          onClick={() => { login() }}
          className={playerID.length < 1 ? 'disable' : ''}
        >&#10148;</button>
      </div>
    </div>
  )
}

export default LoginView
