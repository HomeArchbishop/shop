import React from 'react'
import './NormalButton.less'

class NormalButton extends React.Component<{
  text: string
  onClick: () => void
  width?: string
  height?: string
}> {
  name = 'NormalButton'

  render (): React.ReactNode {
    return (
      <button className="normal-btn" onClick={this.props.onClick} style={ { width: this.props.width ?? 'auto', height: this.props.height ?? 'auto' } }>
        { this.props.text }
      </button>
    )
  }
}

export default NormalButton
