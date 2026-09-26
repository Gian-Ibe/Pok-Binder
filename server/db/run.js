// Run a .sql file against DATABASE_URL.
//
//   node --env-file=.env db/run.js db/schema.sql
//
// This works on Windows, macOS, Linux, and Codespaces without
// requiring the PostgreSQL client tools.

import { readFileSync } from 'node:fs'
import { pool } from './pool.js'

const file = process.argv[2]

if (!file) {
  console.error('usage: node --env-file=.env db/run.js <file.sql>')
  process.exit(1)
}

try {
  await pool.query(readFileSync(file, 'utf8'))
  console.log(`ran ${file}`)
} catch (error) {
  console.error(`failed on ${file}`)
  console.error('name:', error.name)
  console.error('message:', error.message)
  console.error('code:', error.code)
  console.error('detail:', error.detail)
  console.error('hint:', error.hint)
  console.error('stack:', error.stack)
  process.exitCode = 1
} finally {
  await pool.end()
}