import React from 'react'
import './EnterRoomView.less'
import NormalButton from '../components/NormalButton'
import type { LobbyResMsg } from '../../../share/src/types/Msg'
import { Room } from '../../../share/src/game/Room'

function EnterRoomView (): React.ReactNode {
  const [roomID, setRoomID] = React.useState('')
  function enterRoom (): void {
    window.csController.sendLobbyReq({ name: 'LobbyReqEnterRoom', data: { playerID: window.playerID, roomID } })
  }

  React.useEffect(() => {
    window.csController.emitter.on('lobbyres', ({ data }) => {
      const msg: LobbyResMsg = data
      if (msg.name === 'LobbyResEnterRoom') {
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
    <div id="EnterRoomViewContainer">
      <div className="back-btn-list">
        <NormalButton
          text="⬅" width="68px" height='68px'
          onClick={ () => { window.routeTo('HomeView') } }
        />
      </div>
      <div id="inputTipArea">ROOM ID HERE</div>
      <div id="inputArea">
        <input type="text" value={roomID} onChange={e => { setRoomID(e.target.value) }}/>
        <button
          onClick={() => { enterRoom() }}
          className={roomID.length < 1 ? 'disable' : ''}
        >&#10148;</button>
      </div>
    </div>
  )
}

export default EnterRoomView
