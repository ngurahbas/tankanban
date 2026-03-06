import { createFileRoute, redirect } from '@tanstack/react-router'
import { handleGoogleCallback } from '../../../lib/auth.ts'

export const Route = createFileRoute('/auth/callback/google')({
  component: CallbackPage,
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

    try {
      await handleGoogleCallback({ data: { code, state } })
      throw redirect({ to: '/kanban' })
    } catch (err) {
      console.error('OAuth callback failed:', err)
      throw redirect({ to: '/login' })
    }
  },
})

function CallbackPage() {
  // This component won't render because the loader redirects
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
        <p className="mt-4">Completing sign in...</p>
      </div>
    </div>
  )
}
