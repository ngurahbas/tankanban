# User Table and OAuth2
This section covers the implementation of a user table and OAuth2 authentication.
## User Table
table name: user_auth fiels:
- id: primary key
- auth_type: (OAUTH2, MAGIC_LINK, OTP)
- auth_provider: (GOOGLE, GITHUB, APPLE)
- auth_value: (something@somewhere.com, +6232344232)
- last_used_at
- created_at
- updated_at
- unique constraint: (auth_type, auth_provider, auth_value)

## OAuth2 Configuration
For now we only support google oauth2.
Google client id and secret shall be set to environment variables `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.