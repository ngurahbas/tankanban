export const DATABASE_URL = process.env.DATABASE_URL!

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET


export const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'

export const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_BASE_URL || 'http://localhost:8080/realms/tankanban'
export const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'tankanban'
export const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || 'tankanban-client-secret-12345'

export const NODE_ENV = process.env.NODE_ENV
export const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export const CI = process.env.CI

function isSet(value: string | undefined): boolean {
  return value !== undefined && value.length > 0
}

export function isGoogleConfigured(): boolean {
  return isSet(GOOGLE_CLIENT_ID)
}

export function isKeycloakConfigured(): boolean {
  return isSet(KEYCLOAK_BASE_URL) && isSet(KEYCLOAK_CLIENT_ID)
}

if (typeof window === 'undefined') {
  console.log('[CONFIG] App starting...')
  console.log(`[CONFIG] APP_BASE_URL: ${APP_BASE_URL}`)
  console.log(`[CONFIG] NODE_ENV: ${NODE_ENV ?? 'undefined'}`)
  console.log(`[CONFIG] IS_PRODUCTION: ${IS_PRODUCTION}`)
  console.log(`[CONFIG] KEYCLOAK_BASE_URL: ${KEYCLOAK_BASE_URL}`)
  console.log(`[CONFIG] KEYCLOAK_CLIENT_ID: ${isSet(KEYCLOAK_CLIENT_ID) ? '✅ Set' : '❌ Not set'}`)
  console.log(`[CONFIG] DATABASE_URL: ${isSet(DATABASE_URL) ? '✅ Set' : '❌ Not set'}`)
  console.log(`[CONFIG] GOOGLE_CLIENT_ID: ${isSet(GOOGLE_CLIENT_ID) ? '✅ Set' : '❌ Not set'}`)
  console.log(`[CONFIG] GOOGLE_CLIENT_SECRET: ${isSet(GOOGLE_CLIENT_SECRET) ? '✅ Set' : '❌ Not set'}`)
  console.log(`[CONFIG] KEYCLOAK_CLIENT_SECRET: ${isSet(KEYCLOAK_CLIENT_SECRET) ? '✅ Set' : '❌ Not set'}`)
  console.log(`[CONFIG] CI: ${CI ?? 'undefined'}`)
}
