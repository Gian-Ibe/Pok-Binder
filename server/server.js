import express from 'express'
import cors from 'cors'
import { pool } from './db/pool.js'
import * as cards from './cardsRepo.js'

const app = express()

// Basic Authentication protects the API.
function basicAuth(request, response, next) {
  const configuredUsername = process.env.BASIC_AUTH_USERNAME
  const configuredPassword = process.env.BASIC_AUTH_PASSWORD
  const authorization = request.headers.authorization

  if (!configuredUsername || !configuredPassword) {
    console.error('Basic Authentication credentials are not configured')
    return response
      .status(500)
      .json({ error: 'Server authentication is not configured' })
  }

  if (!authorization || !authorization.startsWith('Basic ')) {
    response.setHeader('WWW-Authenticate', 'Basic realm="Pok-Binder"')
    return response.status(401).json({ error: 'Authentication required' })
  }

  const encodedCredentials = authorization.slice('Basic '.length)
  const decodedCredentials = Buffer.from(
    encodedCredentials,
    'base64'
  ).toString('utf8')

  const separator = decodedCredentials.indexOf(':')

  if (separator === -1) {
    response.setHeader('WWW-Authenticate', 'Basic realm="Pok-Binder"')
    return response.status(401).json({ error: 'Invalid authentication' })
  }

  const username = decodedCredentials.slice(0, separator)
  const password = decodedCredentials.slice(separator + 1)

  if (
    username !== configuredUsername ||
    password !== configuredPassword
  ) {
    response.setHeader('WWW-Authenticate', 'Basic realm="Pok-Binder"')
    return response.status(401).json({ error: 'Invalid credentials' })
  }

  next()
}

// CORS
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: '100kb' }))
app.use(basicAuth)

// Health check
app.get('/healthz', (request, response) => {
  response.json({ ok: true })
})

// Database readiness check
app.get('/readyz', async (request, response) => {
  try {
    await pool.query('SELECT 1')
    response.json({ ok: true, db: 'up' })
  } catch (error) {
    console.error('readyz failed:', error.message)
    response.status(503).json({ ok: false, db: 'down' })
  }
})

// Validate card data
function validate(body) {
  const errors = []

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const set = typeof body.set === 'string' ? body.set.trim() : ''
  const cardNumber =
    typeof body.cardNumber === 'string'
      ? body.cardNumber.trim()
      : ''
  const rarity =
    typeof body.rarity === 'string'
      ? body.rarity.trim()
      : ''
  const condition =
    typeof body.condition === 'string'
      ? body.condition.trim()
      : ''
  const quantity = Number(body.quantity)
  const image =
    typeof body.image === 'string'
      ? body.image.trim()
      : ''

  if (!name) errors.push('name is required')
  if (!set) errors.push('set is required')
  if (!cardNumber) errors.push('cardNumber is required')
  if (!rarity) errors.push('rarity is required')
  if (!condition) errors.push('condition is required')

  if (
    !Number.isInteger(quantity) ||
    quantity < 1
  ) {
    errors.push('quantity must be a whole number greater than 0')
  }

  if (name.length > 120) {
    errors.push('name must be 120 characters or fewer')
  }

  if (set.length > 120) {
    errors.push('set must be 120 characters or fewer')
  }

  if (cardNumber.length > 50) {
    errors.push('cardNumber must be 50 characters or fewer')
  }

  if (rarity.length > 80) {
    errors.push('rarity must be 80 characters or fewer')
  }

  if (condition.length > 80) {
    errors.push('condition must be 80 characters or fewer')
  }

  return {
    errors,
    value: {
      name,
      set,
      cardNumber,
      rarity,
      condition,
      quantity,
      image
    }
  }
}

// Get all cards
app.get('/api/cards', async (request, response, next) => {
  try {
    response.json(await cards.getAll(pool))
  } catch (error) {
    next(error)
  }
})

// Get one card
app.get('/api/cards/:id', async (request, response, next) => {
  try {
    const row = await cards.getById(pool, request.params.id)

    if (!row) {
      return response.status(404).json({ error: 'Not found' })
    }

    response.json(row)
  } catch (error) {
    next(error)
  }
})

// Add a card
app.post('/api/cards', async (request, response, next) => {
  const { errors, value } = validate(request.body ?? {})

  if (errors.length > 0) {
    return response.status(400).json({
      error: errors.join('; ')
    })
  }

  try {
    response.status(201).json(
      await cards.create(pool, value)
    )
  } catch (error) {
    next(error)
  }
})

// Update a card
app.put('/api/cards/:id', async (request, response, next) => {
  const { errors, value } = validate(request.body ?? {})

  if (errors.length > 0) {
    return response.status(400).json({
      error: errors.join('; ')
    })
  }

  try {
    const row = await cards.update(
      pool,
      request.params.id,
      value
    )

    if (!row) {
      return response.status(404).json({
        error: 'Not found'
      })
    }

    response.json(row)
  } catch (error) {
    next(error)
  }
})

// Delete a card
app.delete('/api/cards/:id', async (request, response, next) => {
  try {
    const removed = await cards.remove(
      pool,
      request.params.id
    )

    if (!removed) {
      return response.status(404).json({
        error: 'Not found'
      })
    }

    response.status(204).end()
  } catch (error) {
    next(error)
  }
})

// Unknown route
app.use((request, response) => {
  response.status(404).json({
    error: 'No such route'
  })
})

// Safe server error
app.use((error, request, response, next) => {
  console.error(error)
  response.status(500).json({
    error: 'Something went wrong on the server'
  })
})

// Start server
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`)
  console.log(`CORS allows: ${allowedOrigins.join(', ')}`)
})