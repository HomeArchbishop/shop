import React from 'react'
import './GameView.less'
import type { LobbyNoticeMsg } from '../../../share/src/types/Msg'
import { alertsm } from '../utils/swal'
import { initial } from 'lodash'
import NormalButton from '../components/NormalButton'
import type { Player } from '../../../share/src/game/Player'

function GameView (): React.ReactNode {
  if (window.room === undefined) { window.routeTo('ClientErrorView'); return }

  const tipAreaRef = React.useRef<HTMLDivElement>(null)

  const [players, setPlayers] = React.useState(window.room.players)
  const [msg, setMsg] = React.useState([] as Array<{ type: 'tip', text: string }>)

  function PlayerChess (p: Player, i: number): React.ReactNode {
    const [isShowDetails, setIsShowDetails] = React.useState(false)
    return <div className="player-chess" key={i} onMouseEnter={() => { setIsShowDetails(true) }} onMouseLeave={() => { setIsShowDetails(false) }}>
      <span className="chess-name">{p.playerID[0]}</span>
      {
        isShowDetails
          ? (<div className="detail-card">
            <div className="playerID">{p.playerID}{p.isBot && <span className='bot'>[BOT]</span>}</div>
            <div className="life line"><span className="title">LIFE</span><span className="content">{p.states.life}</span></div>
            <div className="step line"><span className="title">STEP</span><span className="content">{p.states.step}</span></div>
          </div>)
          : undefined
      }
    </div>
  }

  function removePlayer (playerID?: string): void {
    if (window.room === undefined) { return }
    if (playerID === undefined) {
      window.room.players.pop()
      setPlayers(initial)
    } else {
      window.room.players = window.room.players.filter(p => p.playerID !== playerID)
      setPlayers(players => players.filter(p => p.playerID !== playerID))
    }
  }

  function changeHostPlayer (nextHostPlayerID: string): void {
    if (window.room === undefined) { return }
    const windowHost = window.room.players.find(p => p.playerID === nextHostPlayerID)
    if (windowHost !== undefined) { windowHost.isHost = true }
    setPlayers(players => {
      const host = players.find(p => p.playerID === nextHostPlayerID)
      if (host !== undefined) { host.isHost = true }
      return players
    })
  }

  function leaveRoom (): void {
    if (window.room !== undefined) {
      window.csController.sendLobbyNotice({ name: 'LobbyNoticeLeaveRoom', data: { playerID: window.playerID, roomID: window.room.roomID } })
    }
  }

  function postMsgOnScreen (type: 'tip', text: string): void {
    setMsg(msg => [...msg, { type, text }])
  }

  React.useEffect(() => {
    tipAreaRef.current?.scrollTo(0, tipAreaRef.current.scrollHeight)
  }, [msg])

  React.useEffect(() => {
    window.csController.emitter.on('lobbynotice', ({ data }) => {
      const msg: LobbyNoticeMsg = data
      console.log(msg)
      if (msg.name === 'LobbyNoticeLeaveRoom') {
        if (msg.data.playerID === window.playerID) {
          window.room = undefined
          window.routeTo('HomeView')
        } else {
          if (msg.data.newHostPlayerID !== undefined) { changeHostPlayer(msg.data.newHostPlayerID) }
          removePlayer(msg.data.playerID)
        }
      }
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
      <div className="back-btn-list">
        <NormalButton
          text="&#11164;" width="40px" height='40px'
          onClick={ () => { leaveRoom() } }
        />
        <div className="roomInfo">
          <div>RM:&ensp;{window.room.roomID}</div>
          <div>PLAYER:&ensp;{players.length}</div>
        </div>
      </div>
      <div className="tip-area" ref={tipAreaRef}>
        <div className="tip-msg"><span className="playerID">111</span> killed <span className="playerID">222</span>.</div>
        { msg.map((msg, i) => msg.type === 'tip' ? <div className="tip-msg" key={i}>{ msg.text }</div> : undefined) }
      </div>
      <div className="map-area">
        <div className="house" id="centerHS">
          <div className="chess-layer">{ players.filter(p => p.states.house === 'center').map(PlayerChess) }</div>
        </div>
        <div className="house" id="shopHS">
          <div className="chess-layer">{ players.filter(p => p.states.house === 'shop').map(PlayerChess) }</div>
          <div className="hs-name">SHOP</div>
        </div>
        <div className="house" id="machineHS">
          <div className="chess-layer">{ players.filter(p => p.states.house === 'machine').map(PlayerChess) }</div>
          <div className="hs-name">MACHINE</div>
        </div>
        <div className="house" id="ironHS">
          <div className="chess-layer">{ players.filter(p => p.states.house === 'iron').map(PlayerChess) }</div>
          <div className="hs-name">IRON</div>
        </div>
        <div className="house" id="magicHS">
          <div className="chess-layer">{ players.filter(p => p.states.house === 'magic').map(PlayerChess) }</div>
          <div className="hs-name">MAGIC</div>
        </div>
      </div>
      <div className="operation-area"></div>
    </div>
  )
}

export default GameView
