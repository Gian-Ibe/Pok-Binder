// Data-access layer for the cards table.
//
// Every query is parameterised: values go in the array, never directly
// into the SQL string. This protects the database from SQL injection.

export async function getAll(pool) {
  const result = await pool.query(
    `SELECT *
     FROM cards
     ORDER BY id DESC`
  )

  return result.rows
}

export async function getById(pool, id) {
  const result = await pool.query(
    'SELECT * FROM cards WHERE id = $1',
    [id]
  )

  return result.rows[0] ?? null
}

export async function create(
  pool,
  { name, set, cardNumber, rarity, condition, quantity, image }
) {
  const result = await pool.query(
    `INSERT INTO cards
      (name, set, card_number, rarity, condition, quantity, image)
     VALUES
      ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      name,
      set,
      cardNumber,
      rarity,
      condition,
      quantity,
      image ?? ''
    ]
  )

  return result.rows[0]
}

export async function update(
  pool,
  id,
  { name, set, cardNumber, rarity, condition, quantity, image }
) {
  const result = await pool.query(
    `UPDATE cards
     SET
       name = $1,
       set = $2,
       card_number = $3,
       rarity = $4,
       condition = $5,
       quantity = $6,
       image = $7
     WHERE id = $8
     RETURNING *`,
    [
      name,
      set,
      cardNumber,
      rarity,
      condition,
      quantity,
      image ?? '',
      id
    ]
  )

  return result.rows[0] ?? null
}

export async function remove(pool, id) {
  const result = await pool.query(
    'DELETE FROM cards WHERE id = $1 RETURNING id',
    [id]
  )

  return result.rowCount > 0
}