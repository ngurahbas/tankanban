import { HeadContent, Scripts, createRootRoute, Link } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { ForbiddenError } from '../lib/errors'

import appCss from '../styles.css?url'

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Tankanban',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  notFoundComponent: NotFound,
  errorComponent: ErrorComponent,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <HeadContent />
      </head>
      <body className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[rgba(79,184,178,0.24)]">
        {children}
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}

function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-[var(--sea-ink)]">404 - Page Not Found</h1>
      <p className="mt-4 text-[var(--sea-ink-soft)]">The page you're looking for doesn't exist.</p>
      <Link to="/kanban" className="mt-6 rounded-lg bg-[var(--sea-foam)] px-6 py-2 text-white transition hover:opacity-90">
        Go to Kanban
      </Link>
    </div>
  )
}

function ErrorComponent({ error }: { error: Error }) {
  if (error instanceof ForbiddenError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
        <h1 className="text-4xl font-bold text-[var(--sea-ink)]">403 - Forbidden</h1>
        <p className="mt-4 text-[var(--sea-ink-soft)]">You don't have permission to access this resource.</p>
        <Link to="/kanban" className="mt-6 rounded-lg bg-[var(--sea-foam)] px-6 py-2 text-white transition hover:opacity-90">
          Go to Kanban
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4">
      <h1 className="text-4xl font-bold text-[var(--sea-ink)]">Something went wrong</h1>
      <p className="mt-4 text-[var(--sea-ink-soft)]">{error.message}</p>
      <Link to="/kanban" className="mt-6 rounded-lg bg-[var(--sea-foam)] px-6 py-2 text-white transition hover:opacity-90">
        Go to Kanban
      </Link>
    </div>
  )
}
