import React, { useEffect, useState } from 'react'
import './LoginView.less'

function SystemErrorView (): React.ReactNode {
  useEffect(() => {
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

export default SystemErrorView
