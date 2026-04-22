import { Minus, Square, X, Copy } from 'lucide-react'
import { cassanova } from '@/lib/ipc'
import { useIsMaximized } from '@/hooks/use-window-state'
import { Logo } from '@/components/logo'

export function TitleBarWinLinux() {
  const maximized = useIsMaximized()

  return (
    <div className="drag-region flex h-titlebar items-center bg-cass-app">
      <div className="flex items-center gap-2 px-3">
        <Logo className="h-4 w-4" />
        <span className="font-display text-xs font-medium text-cass-text-secondary">
          Cassanova Desktop
        </span>
      </div>
      <div className="flex-1" />
      <div className="no-drag flex h-titlebar">
        <button
          aria-label="Minimize"
          onClick={() => cassanova().window.minimize()}
          className="flex h-titlebar w-11 items-center justify-center text-cass-text-secondary hover:bg-cass-hover"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <button
          aria-label={maximized ? 'Restore' : 'Maximize'}
          onClick={() => cassanova().window.maximize()}
          className="flex h-titlebar w-11 items-center justify-center text-cass-text-secondary hover:bg-cass-hover"
        >
          {maximized ? <Copy className="h-3 w-3" /> : <Square className="h-3 w-3" />}
        </button>
        <button
          aria-label="Close"
          onClick={() => cassanova().window.close()}
          className="flex h-titlebar w-11 items-center justify-center text-cass-text-secondary hover:bg-cass-danger hover:text-white"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}
