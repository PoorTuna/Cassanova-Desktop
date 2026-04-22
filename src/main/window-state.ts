import windowStateKeeper from 'electron-window-state'

export interface WindowStateOptions {
  defaultWidth: number
  defaultHeight: number
}

export function createWindowState(opts: WindowStateOptions) {
  return windowStateKeeper({
    defaultWidth: opts.defaultWidth,
    defaultHeight: opts.defaultHeight,
  })
}
