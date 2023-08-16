import React from 'react'
import './CreateRoomView.less'
import NormalButton from '../components/NormalButton'
import { Player } from '../../../share/src/game/Player'
import type { LobbyNoticeMsg, LobbyResMsg } from '../../../share/src/types/Msg'
import { uniqBy, initial, findLastIndex } from 'lodash'
import { alertsm } from '../utils/swal'

function CreateRoomView (): React.ReactNode {
  const [players, setPlayers] = React.useState([] as Player[])

  function addPlayer (player: Player): void {
    if (window.room !== undefined) {
      window.room.players = uniqBy([...window.room.players, player], 'playerID')
    }
    setPlayers(players => uniqBy([...players, player], 'playerID'))
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

  function noticeAddNewBot (): void {
    if (window.room !== undefined) {
      window.csController.sendLobbyNotice({ name: 'LobbyNoticeAddBot', data: { roomID: window.room.roomID } })
    }
  }

  function noticeRemoveBot (): void {
    const lastBotIndex = findLastIndex(players, p => p.isBot)
    if (lastBotIndex === -1) { return }
    const playerID = players[lastBotIndex].playerID
    if (window.room !== undefined) {
      window.csController.sendLobbyNotice({ name: 'LobbyNoticeLeaveRoom', data: { roomID: window.room.roomID, playerID } })
    }
  }

  function noticeGameStart (): void {
    if (window.room !== undefined) {
      window.csController.sendLobbyNotice({ name: 'LobbyNoticeGameStart', data: { roomID: window.room.roomID } })
    }
  }

  React.useEffect(() => {
    if (window.room !== undefined) {
      window.csController.sendLobbyReq({ name: 'LobbyReqSyncPrepareRoom', data: { playerID: window.playerID, roomID: window.room.roomID } })
    }
    window.csController.emitter.on('lobbyres', ({ data }) => {
      const msg: LobbyResMsg = data
      if (msg.name === 'LobbyResSyncPrepareRoom') {
        if (!msg.data.state) { return }
        msg.data.players.forEach(p => {
          if (window.room !== undefined) {
            const newPlayer = new Player({ room: window.room, playerID: p.playerID, isHost: p.isHost, isBot: p.isBot })
            addPlayer(newPlayer)
          }
        })
      }
    })
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
      if (msg.name === 'LobbyNoticeAddBot') {
        if (msg.data.playerID === undefined) { return }
        if (window.room?.roomID === msg.data.roomID) {
          addPlayer(new Player({ room: window.room, playerID: msg.data.playerID, isBot: true }))
        }
      }
      if (msg.name === 'LobbyNoticeAddPlayer') {
        if (window.room?.roomID === msg.data.roomID) {
          addPlayer(new Player({ room: window.room, playerID: msg.data.playerID }))
        }
      }
      if (msg.name === 'LobbyNoticeRoomDismiss') {
        if (window.room?.roomID === msg.data.roomID) {
          window.routeTo('HomeView')
          alertsm('ROOM IS DISMISSED')
        }
      }
    })
    return () => {
      window.csController.emitter.off('lobbyres')
      window.csController.emitter.off('lobbynotice')
    }
  }, [])

  return (
    <div id="CreateRoomViewContainer">
      <div className="back-btn-list">
        <NormalButton
          text="⬅" width="68px" height='68px'
          onClick={ () => { leaveRoom() } }
        />
      </div>
      <div className="room-id-bar">
        <span>ROOM ID:&ensp;</span>
        <span>{ window.room?.roomID }</span>
      </div>
      <div className="player-set-area">
        { players.map((p, i) => <div className="player-set-card" key={i}>
          { (p.isHost) && <span className="host">★</span> }
          <span className="name">{players[i].playerID}</span>
          <span className="ready"></span>
        </div>) }
      </div>
      <div className="host-config-area">
        { players.find(p => p.isHost)?.playerID === window.playerID
          ? <><div
            className="bar-btn"
            onClick={ () => { noticeAddNewBot() } }
          >ADD BOT</div>
          <div
            className="bar-btn"
            onClick={() => { noticeRemoveBot() }}
          >REMOVE BOT</div></>
          : undefined
        }
      </div>
      { players.find(p => p.isHost)?.playerID === window.playerID
        ? players.length > 1
          ? <div className="host-start-btn able" onClick={ () => { noticeGameStart() } }>
              <span>START</span>
            </div>
          : <div className="host-start-btn">
              <span>PLAYER NOT ENOUGH</span>
            </div>
        : <div className="wait-start-btn">
          <span>WAITING FOR START</span>
        </div>
      }
    </div>
  )
}

export default CreateRoomView
