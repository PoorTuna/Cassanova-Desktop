import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cassanova } from '@/lib/ipc'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

const ISSUES_URL = 'https://github.com/PoorTuna/Cassanova-Desktop/issues'

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught:', error, info)
  }

  private handleReport = () => {
    cassanova()
      .app.openExternal(ISSUES_URL)
      .catch(() => {
        window.open(ISSUES_URL, '_blank', 'noopener')
      })
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex h-screen items-center justify-center bg-background p-8 text-foreground">
          <div className="max-w-md text-center">
            <h1 className="mb-2 font-display text-2xl font-semibold">
              Something broke.
            </h1>
            <p className="mb-6 text-sm text-cass-text-secondary">
              {this.state.error.message}
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button onClick={() => window.location.reload()}>Reload</Button>
              <Button variant="outline" onClick={this.handleReport}>
                Report issue
              </Button>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
