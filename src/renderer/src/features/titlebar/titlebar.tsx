import { usePlatform } from '@/hooks/use-platform'
import { TitleBarMac } from './titlebar-mac'
import { TitleBarWinLinux } from './titlebar-winlinux'

export function TitleBar() {
  const platform = usePlatform()

  if (platform === null) {
    // Before platform resolves, render a blank drag region to avoid layout jank.
    return <div className="drag-region h-titlebar bg-cass-app" />
  }

  return platform === 'darwin' ? <TitleBarMac /> : <TitleBarWinLinux />
}
