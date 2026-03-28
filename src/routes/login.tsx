import { createFileRoute, redirect } from '@tanstack/react-router'
import { getCurrentUser } from '../lib/auth.ts'
import { LoginPage } from './-login-component'

export const Route = createFileRoute('/login')({
  component: LoginPage,
  beforeLoad: async () => {
    const user = await getCurrentUser()
    if (user) {
      throw redirect({ to: '/kanban' })
    }
  },
})
