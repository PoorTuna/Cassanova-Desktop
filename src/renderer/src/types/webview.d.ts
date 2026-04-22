import type { DetailedHTMLProps, HTMLAttributes, RefAttributes } from 'react'
import type { WebviewTag } from 'electron'

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      webview: DetailedHTMLProps<
        HTMLAttributes<WebviewTag> &
          RefAttributes<WebviewTag> & {
            src?: string
            partition?: string
            allowpopups?: string
            webpreferences?: string
            preload?: string
            useragent?: string
            httpreferrer?: string
            disablewebsecurity?: string
            nodeintegration?: string
            plugins?: string
          },
        WebviewTag
      >
    }
  }
}
