import { createFileRoute, redirect } from '@tanstack/react-router'
import { handleGoogleCallback } from '../../../lib/auth.ts'
import { GoogleCallbackPage } from './-google-component'

export const Route = createFileRoute('/auth/callback/google')({
  component: GoogleCallbackPage,
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

    await handleGoogleCallback({ data: { code, state } })
      .catch((err) => {
        console.error('OAuth callback failed:', err)
        throw redirect({ to: '/login' })
      })
    throw redirect({ to: '/kanban' })
  },
})
