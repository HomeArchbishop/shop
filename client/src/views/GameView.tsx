import React from 'react'
import './GameView.less'
import type { LobbyNoticeMsg } from '../../../share/src/types/Msg'
import { alertsm } from '../utils/swal'

function GameView (): React.ReactNode {
  React.useEffect(() => {
    window.csController.emitter.on('lobbynotice', ({ data }) => {
      const msg: LobbyNoticeMsg = data
      console.log(msg)
      if (msg.name === 'LobbyNoticeRoomDismiss') {
        if (window.room?.roomID === msg.data.roomID) {
          window.room = undefined
          window.routeTo('HomeView')
          alertsm('ROOM IS DISMISSED')
        }
      }
    })
    return () => {
      window.csController.emitter.off('lobbynotice')
    }
  }, [])
  return (
    <div id="gameViewContainer">
      <div id="tipArea">GAME</div>
    </div>
  )
}

export default GameView
