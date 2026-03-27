export const DATABASE_URL = process.env.DATABASE_URL!

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!

export const APP_BASE_URL = process.env.APP_BASE_URL || 'http://localhost:3000'

export const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_BASE_URL || 'http://localhost:8080/realms/tankanban'
export const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || 'tankanban'
export const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET || 'tankanban-client-secret-12345'

export const NODE_ENV = process.env.NODE_ENV
export const IS_PRODUCTION = process.env.NODE_ENV === 'production'

export const CI = process.env.CI
