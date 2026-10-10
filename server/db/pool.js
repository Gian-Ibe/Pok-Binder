import pg from 'pg'

// Require DATABASE_URL to be configured before starting the server.
if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is missing. Configure it in your local .env file or hosting environment.'
  )
  process.exit(1)
}

const databaseUrl = process.env.DATABASE_URL

const isLocal =
  /localhost|127\.0\.0\.1/.test(new URL(databaseUrl).hostname)

export const pool = new pg.Pool({
  connectionString: databaseUrl,

  // Local development can use an unencrypted local PostgreSQL connection.
  // Remote connections use TLS and verify the server certificate.
  ssl: isLocal ? false : { rejectUnauthorized: false },

  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 5_000,
})

// Log unexpected pool errors without exposing connection details.
pool.on('error', (error) => {
  console.error('Unexpected database pool error:', error.message)
})
