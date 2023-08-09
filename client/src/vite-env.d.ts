/* eslint-disable @typescript-eslint/triple-slash-reference */
/* eslint-disable @typescript-eslint/consistent-type-imports */

/// <reference types="vite/client" />

declare interface Window {
  viewName: string
  playerID: string
  room?: import('../../share/src/game/Room').Room
  routeTo: (viewName: string) => void
  csController: import('./controller/CSController').CSController
  msgHandler: (msg: Msg) => void
}
