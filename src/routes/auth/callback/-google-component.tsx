export function GoogleCallbackPage() {
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
