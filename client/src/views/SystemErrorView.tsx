import React from 'react'
import './SystemErrorView.less'

function SystemErrorView (): React.ReactNode {
  return (
    <div id="systemErrorViewContainer">
      <div id="tipArea">SERVER WENT WRONG</div>
      <div id="subTipArea">PLEASE REFRESH THE PAGE</div>
    </div>
  )
}

export default SystemErrorView
