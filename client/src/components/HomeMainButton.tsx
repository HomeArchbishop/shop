import React from 'react'
import './HomeMainButton.less'

class HomeMainButton extends React.Component<{
  text: string
  onClick: () => void
}> {
  name = 'HomeMainButton'

  render (): React.ReactNode {
    return (
      <button className="home-main-btn" onClick={this.props.onClick}>
        { this.props.text }
      </button>
    )
  }
}

export default HomeMainButton
