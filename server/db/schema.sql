-- The database structure for PokéBinder.
-- This table stores the cards belonging to the application's single user.

CREATE TABLE IF NOT EXISTS cards (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  set         TEXT NOT NULL,
  card_number TEXT NOT NULL,
  rarity      TEXT NOT NULL,
  condition   TEXT NOT NULL,
  quantity    INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  image       TEXT NOT NULL DEFAULT ''
);