import React from 'react'
import './ClientErrorView.less'

function ClientErrorView (): React.ReactNode {
  React.useEffect(() => {
    window.csController.socketDisconnect().catch(() => null)
  }, [])

  return (
    <div id="clientErrorViewContainer">
      <div id="tipArea">OOPS! CLIENT BREAKS DOWN...</div>
      <div id="subTipArea">PLEASE REFRESH THE PAGE</div>
    </div>
  )
}

export default ClientErrorView
