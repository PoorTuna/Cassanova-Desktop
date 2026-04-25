import type { ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from '@/components/ui/sonner'
import { TrustPromptDialog } from '@/features/certs/trust-prompt-dialog'
import { ErrorBoundary } from './error-boundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider delayDuration={200}>
          {children}
          <TrustPromptDialog />
          <Toaster position="bottom-right" />
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}
