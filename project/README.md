# PokéBinder

## My project repository

Public repository: https://github.com/Gian-Ibe/Pok-Binder

Live app: https://gian-ibe.github.io/Pok-Binder/

## What it is

PokéBinder is a web application for organizing a Pokémon card collection. Users can add, view, edit, search, filter, and delete card records, including details such as the card name, set, card number, rarity, condition, quantity, and image. The app uses an Express API and PostgreSQL to store card records so they remain available after refreshing the page.

## How to run it

### Requirements

- Node.js and npm
- PostgreSQL
- Git

### 1. Clone the repository

```bash
git clone https://github.com/Gian-Ibe/Pok-Binder.git
cd Pok-Binder
```

### 2. Set up the PostgreSQL database

Create a PostgreSQL database, for example `pokebinder`.

Then run the schema file from the repository to create the required tables. From the project root, use the command appropriate for your PostgreSQL setup, such as:

```bash
psql -U YOUR_DB_USER -d pokebinder -f server/db/schema.sql
```

Replace `YOUR_DB_USER` with your local PostgreSQL username. If `psql` is not available in your terminal, run the schema file through a PostgreSQL client such as pgAdmin.

### 3. Configure the backend

Move into the server folder and install its dependencies:

```bash
cd server
npm install
```

Copy `server/.env.example` to `server/.env` and update the values for your local environment. For example:

```env
DATABASE_URL=postgresql://YOUR_DB_USER:YOUR_DB_PASSWORD@localhost:5432/pokebinder
NODE_ENV=development
CORS_ORIGINS=http://localhost:5173
```

Use your own local database username and password. Do not commit the `.env` file or real credentials to the repository.

Start the backend:

```bash
npm run dev
```

The API should be available at `http://localhost:3000` if the server's default port is unchanged.

### 4. Configure the frontend

Open a second terminal at the project root:

```bash
cd client
npm install
```

Create `client/.env` based on `client/.env.example`, with these local development values:

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_USE_MOCK_API=false
```

Start the frontend:

```bash
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

### 5. Verify the app

Make sure the backend is running and connected to PostgreSQL. Add a sample card, refresh the page, and confirm that the record remains. Use sample data for testing.

## Presentation

- **Video (public Google Drive link):** ADD_YOUR_PUBLIC_VIDEO_LINK
- **Slides (link or PDF):** ADD_YOUR_SLIDES_LINK
- **Square image:** Add the project square logo image to this folder, or provide a public link to it.

Make sure the video and slides links are accessible to your instructor.

## AI usage

AI usage record: https://github.com/Gian-Ibe/Pok-Binder/blob/main/AI-usage.md
