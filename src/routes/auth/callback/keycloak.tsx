import { createFileRoute, lazyRouteComponent, redirect } from '@tanstack/react-router'
import { handleKeycloakCallback } from '../../../lib/auth.ts'

export const Route = createFileRoute('/auth/callback/keycloak')({
  component: lazyRouteComponent(() => import('./-keycloak-component'), 'KeycloakCallbackPage'),
  loader: async ({ location }) => {
    const searchParams = new URLSearchParams(location.search)
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')

    if (error) {
      throw new Error(`OAuth error: ${error}`)
    }

    if (!code || !state) {
      throw new Error('Missing authorization code or state')
    }

    await handleKeycloakCallback({ data: { code, state } })
      .catch((err) => {
        console.error('Keycloak OAuth callback failed:', err)
        throw redirect({ to: '/login' })
      })
    throw redirect({ to: '/kanban' })
  },
})
