/// <reference lib="dom" />
import { ipcRenderer } from 'electron'

const RELAYED_KEYS = new Set([
  'k',
  'b',
  'r',
  ',',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '[',
  ']',
])

document.addEventListener(
  'keydown',
  (event: KeyboardEvent) => {
    if (!(event.ctrlKey || event.metaKey)) return
    const key = event.key.toLowerCase()
    if (!RELAYED_KEYS.has(key)) return
    event.preventDefault()
    event.stopPropagation()
    ipcRenderer.sendToHost('shortcut', {
      key,
      ctrlKey: event.ctrlKey,
      metaKey: event.metaKey,
      shiftKey: event.shiftKey,
      altKey: event.altKey,
    })
  },
  true,
)
