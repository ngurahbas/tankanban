import { createFileRoute, lazyRouteComponent, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '../lib/auth.ts'

export const Route = createFileRoute('/login')({
  component: lazyRouteComponent(() => import('./-login-component'), 'LoginPage'),
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (user) {
      throw redirect({ to: '/kanban' })
    }
  },
})
