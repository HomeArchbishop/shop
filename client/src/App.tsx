import React from 'react'
import './App.less'
import HomeView from './views/HomeView'
import CreateRoomView from './views/CreateRoomView'
import LoginView from './views/LoginView'
import EnterRoomView from './views/EnterRoomView'
import SystemErrorView from './views/SystemErrorView'
import GameView from './views/GameView'

function App (): React.ReactNode {
  const [viewName, setViewName] = React.useState('LoginView')
  window.viewName = viewName
  window.routeTo = setViewName

  return (
    <>
      {window.viewName === 'SystemErrorView' ? <SystemErrorView /> : null}
      {window.viewName === 'LoginView' ? <LoginView /> : null}
      {window.viewName === 'HomeView' ? <HomeView /> : null}
      {window.viewName === 'EnterRoomView' ? <EnterRoomView /> : null}
      {window.viewName === 'CreateRoomView' ? <CreateRoomView /> : null}
      {window.viewName === 'GameView' ? <GameView /> : null}
    </>
  )
}

export default App
