import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './main.less'

const stageDiv = document.querySelector<HTMLDivElement>('#stage')

const resizeStage = (): void => {
  // 1240 * 700
  const scale = Math.min(window.innerWidth / 1240, window.innerHeight / 700)
  if (stageDiv !== null) {
    stageDiv.style.transform = `scale(${scale}, ${scale})`
    console.log(window.innerWidth, stageDiv.getBoundingClientRect().width)
    stageDiv.style.top = String(`${~~((window.innerHeight - stageDiv.getBoundingClientRect().height) / 2)}px`)
    stageDiv.style.left = String(`${~~((window.innerWidth - stageDiv.getBoundingClientRect().width) / 2)}px`)
  }
}
resizeStage()
window.addEventListener('resize', resizeStage)

stageDiv !== null && ReactDOM.createRoot(stageDiv).render(
  // <React.Component>
    <App /> as React.ReactNode
  // </React.Component>
)
