/// <reference lib="dom" />
import { ipcRenderer } from 'electron'

const RELAYED_KEYS = new Set([
  'k',
  'b',
  'r',
  'i',
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

function relay(key: string, event: KeyboardEvent) {
  event.preventDefault()
  event.stopPropagation()
  ipcRenderer.sendToHost('shortcut', {
    key,
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
  })
}

document.addEventListener(
  'keydown',
  (event: KeyboardEvent) => {
    if (event.key === 'F12') {
      relay('i', event)
      return
    }
    if (!(event.ctrlKey || event.metaKey)) return
    const key = event.key.toLowerCase()
    if (!RELAYED_KEYS.has(key)) return
    relay(key, event)
  },
  true,
)
