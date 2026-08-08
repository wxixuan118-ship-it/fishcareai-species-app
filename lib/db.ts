import postgres from 'postgres'

// Strip pooler-only query params (e.g. `pgbouncer=true`) that AnySites injects —
// postgres.js forwards unrecognized params as startup parameters which PostgreSQL rejects.
const rawUrl = process.env.DATABASE_URL
let connectionString = rawUrl
if (rawUrl) {
  const url = new URL(rawUrl)
  url.searchParams.delete('pgbouncer')
  connectionString = url.toString()
}

const sql = postgres(connectionString!, {
  ssl: 'require',
  max: 5,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
})

export default sql
