# PokéBinder Proposal

## Core Features
PokéBinder is a web application for managing a personal Pokémon card collection. Users can add, view, edit, and delete cards, search and filter their collection, and view collection statistics.

## Hosting
- **Frontend:** GitHub Pages
- **Backend:** Express.js, running locally
- **Database:** PostgreSQL, running locally

The local application saves cards to PostgreSQL, while the public website uses demo mode.

## Demo Mode
Demo mode is currently enabled on the public website through `VITE_USE_MOCK_API=true`. No date has been set for disabling it.

## Risks
- The public website cannot connect to the local backend.
- The public website uses mock data instead of saving cards to PostgreSQL.
- Deploying the backend and database online may be considered in the future.