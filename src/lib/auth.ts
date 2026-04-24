import { createServerFn } from '@tanstack/react-start'
import { db } from '../db/index.ts'
import { userAuth, session } from '../db/schema.ts'
import { eq, and } from 'drizzle-orm'
import { Google, OAuth2Client, generateCodeVerifier, generateState, CodeChallengeMethod } from 'arctic'
import { encodeBase32LowerCase } from '@oslojs/encoding'
import { getCookie, setCookie, deleteCookie } from '@tanstack/react-start/server'
import { APP_BASE_URL, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, KEYCLOAK_BASE_URL, KEYCLOAK_CLIENT_ID, KEYCLOAK_CLIENT_SECRET, IS_PRODUCTION } from '../config.ts'
import { SessionCache } from './session-cache.ts'

const google = new Google(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  `${APP_BASE_URL}/auth/callback/google`
)

const keycloak = new OAuth2Client(
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_CLIENT_SECRET,
  `${APP_BASE_URL}/auth/callback/keycloak`
)

const keycloakEndpoints = {
  authorize: `${KEYCLOAK_BASE_URL}/protocol/openid-connect/auth`,
  token: `${KEYCLOAK_BASE_URL}/protocol/openid-connect/token`,
  userinfo: `${KEYCLOAK_BASE_URL}/protocol/openid-connect/userinfo`,
}

// Session configuration
const SESSION_COOKIE_NAME = 'auth_session'
const SESSION_DURATION_MS = 1000 * 60 * 60 * 24 * 7 // 7 days
const SESSION_CACHE_TTL_MS = 60 * 1000 // 1 minute

const sessionCache = new SessionCache<typeof userAuth.$inferSelect>()

// Generate a random ID using Web Crypto API
function generateId(length: number = 20): string {
  const bytes = new Uint8Array(length)
  crypto.getRandomValues(bytes)
  return encodeBase32LowerCase(bytes)
}

// Internal function to validate session (not a server function)
async function validateSessionInternal(): Promise<typeof userAuth.$inferSelect | null> {
  const sessionId = getCookie(SESSION_COOKIE_NAME)
  
  if (!sessionId) {
    return null
  }

  const cached = sessionCache.get(sessionId)
  if (cached) {
    return cached
  }

  const [sessionData] = await db
    .select()
    .from(session)
    .where(eq(session.id, sessionId))
    .limit(1)

  if (!sessionData) {
    sessionCache.delete(sessionId)
    deleteCookie(SESSION_COOKIE_NAME)
    return null
  }

  if (sessionData.expiresAt.getTime() < Date.now()) {
    sessionCache.delete(sessionId)
    await db.delete(session).where(eq(session.id, sessionId))
    deleteCookie(SESSION_COOKIE_NAME)
    return null
  }

  const [user] = await db
    .select()
    .from(userAuth)
    .where(eq(userAuth.id, sessionData.userId))
    .limit(1)

  if (!user) {
    sessionCache.delete(sessionId)
    deleteCookie(SESSION_COOKIE_NAME)
    return null
  }

  sessionCache.set(sessionId, user, SESSION_CACHE_TTL_MS)

  return user
}

// Server function wrapper for validateSession
export const validateSession = createServerFn({ method: 'GET' })
  .handler(async () => {
    return validateSessionInternal()
  })

// Generate Google OAuth authorization URL
export const getGoogleAuthUrl = createServerFn({ method: 'GET' })
  .handler(async () => {
    const state = generateId(15)
    const codeVerifier = generateId(32)
    const url = await google.createAuthorizationURL(state, codeVerifier, ['openid', 'email', 'profile'])

    setCookie('oauth_state', state, {
      maxAge: 600,
      path: '/',
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
    })

    setCookie('oauth_code_verifier', codeVerifier, {
      maxAge: 600,
      path: '/',
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
    })

    return url.toString()
  })

export const getKeycloakAuthUrl = createServerFn({ method: 'GET' })
  .handler(async () => {
    const state = generateState()
    const codeVerifier = generateCodeVerifier()
    const url = keycloak.createAuthorizationURLWithPKCE(
      keycloakEndpoints.authorize,
      state,
      CodeChallengeMethod.S256,
      codeVerifier,
      ['openid', 'email', 'profile']
    )

    setCookie('oauth_state_keycloak', state, {
      maxAge: 600,
      path: '/',
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
    })

    setCookie('oauth_code_verifier_keycloak', codeVerifier, {
      maxAge: 600,
      path: '/',
      httpOnly: true,
      secure: IS_PRODUCTION,
      sameSite: 'lax',
    })

    return url.toString()
  })

// Handle Google OAuth callback
export const handleGoogleCallback = createServerFn({ method: 'GET' })
  .inputValidator((data: { code: string; state: string }) => data)
  .handler(async (ctx) => {
    try {
      const { code, state } = ctx.data

      // Validate state
      const storedState = getCookie('oauth_state')
      const storedCodeVerifier = getCookie('oauth_code_verifier')

      if (!storedState || !storedCodeVerifier || storedState !== state) {
        console.error('OAuth state mismatch:', { storedState, state })
        throw new Error('Invalid OAuth state')
      }

      // Clear OAuth cookies
      deleteCookie('oauth_state')
      deleteCookie('oauth_code_verifier')

      // Exchange code for tokens
      let tokens
      try {
        tokens = await google.validateAuthorizationCode(code, storedCodeVerifier)
      } catch (err) {
        console.error('Failed to validate authorization code:', err)
        throw new Error('Failed to validate authorization code', { cause: err })
      }

      // Fetch user info from Google
      const googleUserResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      })

      if (!googleUserResponse.ok) {
        const errorText = await googleUserResponse.text()
        console.error('Failed to fetch user info:', errorText)
        throw new Error('Failed to fetch user info from Google')
      }

      const googleUser: {
        sub: string
        email: string
        email_verified: boolean
        name?: string
        picture?: string
      } = await googleUserResponse.json()

      if (!googleUser.email_verified) {
        throw new Error('Email not verified')
      }

      // Find or create user
      let [user] = await db
        .select()
        .from(userAuth)
        .where(
          and(
            eq(userAuth.authType, 'OAUTH2'),
            eq(userAuth.authProvider, 'GOOGLE'),
            eq(userAuth.authValue, googleUser.email)
          )
        )
        .limit(1)

      if (!user) {
        // Create new user
        const [newUser] = await db
          .insert(userAuth)
          .values({
            authType: 'OAUTH2',
            authProvider: 'GOOGLE',
            authValue: googleUser.email,
            lastUsedAt: new Date(),
          })
          .returning()
        user = newUser
      } else {
        // Update last used timestamp
        await db
          .update(userAuth)
          .set({ lastUsedAt: new Date() })
          .where(eq(userAuth.id, user.id))
      }

      // Create session
      const sessionId = generateId()
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

      await db.insert(session).values({
        id: sessionId,
        userId: user.id,
        expiresAt,
      })

      // Set session cookie
      setCookie(SESSION_COOKIE_NAME, sessionId, {
        expires: expiresAt,
        path: '/',
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'lax',
      })

      return { success: true }
    } catch (error) {
      console.error('OAuth callback error:', error)
      throw error
    }
  })

export const handleKeycloakCallback = createServerFn({ method: 'GET' })
  .inputValidator((data: { code: string; state: string }) => data)
  .handler(async (ctx) => {
    try {
      const { code, state } = ctx.data

      const storedState = getCookie('oauth_state_keycloak')
      const storedCodeVerifier = getCookie('oauth_code_verifier_keycloak')

      if (!storedState || !storedCodeVerifier || storedState !== state) {
        console.error('OAuth state mismatch:', { storedState, state })
        throw new Error('Invalid OAuth state')
      }

      deleteCookie('oauth_state_keycloak')
      deleteCookie('oauth_code_verifier_keycloak')

      let tokens
      try {
        tokens = await keycloak.validateAuthorizationCode(
          keycloakEndpoints.token,
          code,
          storedCodeVerifier
        )
      } catch (err) {
        console.error('Failed to validate authorization code:', err)
        throw new Error('Failed to validate authorization code', { cause: err })
      }

      const keycloakUserResponse = await fetch(keycloakEndpoints.userinfo, {
        headers: {
          Authorization: `Bearer ${tokens.accessToken()}`,
        },
      })

      if (!keycloakUserResponse.ok) {
        const errorText = await keycloakUserResponse.text()
        console.error('Failed to fetch user info:', errorText)
        throw new Error('Failed to fetch user info from Keycloak')
      }

      const keycloakUser: {
        sub: string
        email: string
        email_verified: boolean
        name?: string
        preferred_username?: string
      } = await keycloakUserResponse.json()

      if (!keycloakUser.email) {
        throw new Error('Email not provided by Keycloak')
      }

      let [user] = await db
        .select()
        .from(userAuth)
        .where(
          and(
            eq(userAuth.authType, 'OAUTH2'),
            eq(userAuth.authProvider, 'KEYCLOAK'),
            eq(userAuth.authValue, keycloakUser.email)
          )
        )
        .limit(1)

      if (!user) {
        const [newUser] = await db
          .insert(userAuth)
          .values({
            authType: 'OAUTH2',
            authProvider: 'KEYCLOAK',
            authValue: keycloakUser.email,
            lastUsedAt: new Date(),
          })
          .returning()
        user = newUser
      } else {
        await db
          .update(userAuth)
          .set({ lastUsedAt: new Date() })
          .where(eq(userAuth.id, user.id))
      }

      const sessionId = generateId()
      const expiresAt = new Date(Date.now() + SESSION_DURATION_MS)

      await db.insert(session).values({
        id: sessionId,
        userId: user.id,
        expiresAt,
      })

      setCookie(SESSION_COOKIE_NAME, sessionId, {
        expires: expiresAt,
        path: '/',
        httpOnly: true,
        secure: IS_PRODUCTION,
        sameSite: 'lax',
      })

      return { success: true }
    } catch (error) {
      console.error('Keycloak OAuth callback error:', error)
      throw error
    }
  })

export const logout = createServerFn({ method: 'POST' })
  .handler(async () => {
    const sessionId = getCookie(SESSION_COOKIE_NAME)

    if (sessionId) {
      sessionCache.delete(sessionId)
      await db.delete(session).where(eq(session.id, sessionId))
      deleteCookie(SESSION_COOKIE_NAME)
    }

    return { success: true }
  })

// Get current user - uses internal function directly
export const getCurrentUser = createServerFn({ method: 'GET' })
  .handler(async () => {
    return validateSessionInternal()
  })
