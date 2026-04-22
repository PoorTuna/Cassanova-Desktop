import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from '@tanstack/react-router'
import { ShellLayout } from '@/layouts/shell-layout'
import { Welcome } from '@/routes/welcome'
import { Settings } from '@/routes/settings'
import { InstanceDetail } from '@/routes/instance-detail'

const rootRoute = createRootRoute({
  component: ShellLayout,
})

const welcomeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Welcome,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
})

const instanceDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/instances/$instanceId',
  component: InstanceDetail,
})

const routeTree = rootRoute.addChildren([
  welcomeRoute,
  settingsRoute,
  instanceDetailRoute,
])

const memoryHistory = createMemoryHistory({ initialEntries: ['/'] })

export const router = createRouter({
  routeTree,
  history: memoryHistory,
  defaultPreload: 'intent',
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
