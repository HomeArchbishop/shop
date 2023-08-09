import React from 'react'
import './HomeView.less'
import HomeMainButton from '../components/HomeMainButton'
import { type LobbyResMsg } from '../../../share/src/types/Msg'
import { Room } from '../../../share/src/game/Room'

function HomeView (): React.ReactNode {
  function createRoom (): void {
    window.csController.sendLobbyReq({ name: 'LobbyReqCreateRoom', data: { playerID: window.playerID } })
  }

  React.useEffect(() => {
    window.csController.emitter.on('lobbyres', ({ data }) => {
      const msg: LobbyResMsg = data
      if (msg.name === 'LobbyResCreateRoom') {
        if (!msg.data.state) { return }
        window.room = new Room({ roomID: msg.data.roomID })
        window.routeTo('CreateRoomView')
      }
    })
    return () => {
      window.csController.emitter.off('lobbyres')
    }
  }, [])

  return (
    <div id="HomeViewComtainer">
      <div className="main-btn-list">
        <HomeMainButton
          text="CREATE ROOM"
          onClick={ () => { createRoom() } }
        />
        <HomeMainButton
          text="ENTER ROOM"
          onClick={ () => { window.routeTo('EnterRoomView') } }
        />
      </div>
    </div>
  )
}

export default HomeView
