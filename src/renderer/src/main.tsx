import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './app/router'
import { Providers } from './app/providers'
import { startThemeBridge } from './app/theme-bridge'
import { DetachedLayout } from './layouts/detached-layout'
import './styles/globals.css'

startThemeBridge()

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found in index.html')
}

const detachedInstanceId = new URLSearchParams(window.location.search).get(
  'detachedInstanceId',
)

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Providers>
      {detachedInstanceId ? (
        <DetachedLayout instanceId={detachedInstanceId} />
      ) : (
        <RouterProvider router={router} />
      )}
    </Providers>
  </React.StrictMode>,
)
