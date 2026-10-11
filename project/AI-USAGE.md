# AI Usage

This file documents how I used AI as a development assistant while building PokéBinder. I used AI to help with implementation, debugging, database integration, deployment, and documentation. I reviewed the suggestions, tested the application, and made changes when the proposed solutions did not match the actual behavior of the system.

## 1. How I used AI

### 2026-09-24 - Express API implementation

- **Tool:** ChatGPT
- **What I asked for:** Help implementing an Express backend for PokéBinder, including API routes, request validation, database operations, and health-check endpoints.
- **What it gave back:** A backend implementation with routes for handling card records, input validation, parameterized database queries, and health and readiness endpoints.
- **What I kept, what I changed, and why:** I used the suggested backend structure as a starting point and tested the API locally. I adjusted the configuration and integration as I connected the backend to the frontend and PostgreSQL.
- **Commit:** https://github.com/Gian-Ibe/Pok-Binder/commit/19895d3

### 2026-09-26 - React application and card management

- **Tool:** ChatGPT
- **What I asked for:** Help building the React interface for managing a Pokémon card collection.
- **What it gave back:** An implementation for displaying cards, adding and editing records, deleting cards, searching and filtering the collection, viewing details, and showing collection statistics.
- **What I kept, what I changed, and why:** I used the proposed components and functionality as a foundation, then worked on connecting the interface to the API and checking that the card-management features behaved correctly.
- **Commit:** https://github.com/Gian-Ibe/Pok-Binder/commit/8073c27

### 2026-09-26 - PostgreSQL database integration

- **Tool:** ChatGPT
- **What I asked for:** Help creating the database schema and connecting the Express backend to PostgreSQL.
- **What it gave back:** Guidance for creating the cards table, defining its fields, and using a repository layer to perform database queries.
- **What I kept, what I changed, and why:** I used the schema and repository approach to separate database operations from the API routes. I tested the connection and database operations to verify that card records could be stored and retrieved.
- **Commit:** https://github.com/Gian-Ibe/Pok-Binder/commit/7700c6f

### 2026-09-26 - Environment configuration and API security

- **Tool:** ChatGPT
- **What I asked for:** Help configuring environment variables, CORS, and backend access controls without hardcoding credentials.
- **What it gave back:** Suggestions for using environment variables, restricting allowed frontend origins, validating requests, and protecting the API with Basic Authentication.
- **What I kept, what I changed, and why:** I kept the separation between configuration and source code and used environment variables for deployment settings. I later had to reconsider the authentication setup because the public frontend did not send the credentials required by the middleware.
- **Commit:** https://github.com/Gian-Ibe/Pok-Binder/commit/42423ec

### 2026-10-10 - Public API and deployed database

- **Tool:** ChatGPT
- **What I asked for:** Help troubleshooting the deployed backend and connecting the public GitHub Pages frontend to the Render API and PostgreSQL database.
- **What it gave back:** Deployment and configuration guidance involving the API base URL, CORS origins, environment variables, database connectivity, and readiness checks.
- **What I kept, what I changed, and why:** I applied and tested the configuration changes until the frontend could communicate with the backend. I verified that card requests succeeded and that newly added records remained after refreshing the deployed application.
- **Commit:** https://github.com/Gian-Ibe/Pok-Binder/commit/2e85efd

### 2026-10-11 - Card number field mapping

- **Tool:** ChatGPT
- **What I asked for:** Help investigating why card numbers appeared not to be saved or displayed correctly.
- **What it gave back:** Guidance to inspect the frontend form data, API response, and database field names. The investigation identified a mismatch between the backend's `card_number` field and the frontend's `cardNumber` property.
- **What I kept, what I changed, and why:** I used the field-mapping approach to make the frontend handle the response consistently. This was necessary because the database could contain the correct card number even when the frontend did not read the returned property correctly.
- **Commit:** https://github.com/Gian-Ibe/Pok-Binder/commit/42423ec

### 2026-10-11 - Demo documentation

- **Tool:** ChatGPT
- **What I asked for:** Help preparing the demo documentation and explaining the application's features, technology stack, challenges, and possible improvements.
- **What it gave back:** A proposed demonstration flow and explanations of the React frontend, Express API, PostgreSQL persistence, deployment, and future improvements.
- **What I kept, what I changed, and why:** I used the suggestions as a guide and adapted the documentation to reflect the actual features and deployment status of my project.
- **Commit:** https://github.com/Gian-Ibe/Pok-Binder/commit/d14dd8c

## 2. Where the AI got it wrong

### Case 1 - Authentication did not match the public frontend

- **What it gave me:** A backend setup that protected API routes using Basic Authentication credentials stored in environment variables.
- **What was wrong with it:** The deployed frontend did not send the required authentication credentials. As a result, the authentication setup was incompatible with the way the public application was making API requests.
- **What I did instead:** I changed the authentication setup for the public demonstration so the frontend could use the API. This made the demo functional, but it also meant the public API could be writable without authentication. A production version would need proper access controls.
- **Commit:** https://github.com/Gian-Ibe/Pok-Binder/commit/2e85efd

### Case 2 - Incorrect handling of card number property names

- **What it gave me:** An initial implementation that did not consistently account for the difference between the database/API field `card_number` and the frontend property `cardNumber`.
- **What was wrong with it:** The database could save a card number successfully, but the frontend could fail to display or populate it because it expected a different property name.
- **What I did instead:** I checked the API response and compared it with the frontend's state and form fields. I then used a normalization approach so the frontend could read the card number consistently.
- **Commit:** https://github.com/Gian-Ibe/Pok-Binder/commit/42423ec

### Case 3 - Database connection troubleshooting and TLS

- **What it gave me:** Database connection troubleshooting that led to setting `rejectUnauthorized: false` in the PostgreSQL connection configuration.
- **What was wrong with it:** Although this change helped the deployed connection work, disabling certificate verification weakens TLS security because the server certificate is no longer properly verified.
- **What I did instead:** I confirmed that the database connection and application requests worked after the change. I recognize that this is a deployment workaround rather than the ideal production configuration; a more secure setup should verify the database certificate using the appropriate trusted certificate configuration.
- **Commit:** https://github.com/Gian-Ibe/Pok-Binder/commit/2e85efd

## 3. Who wrote what

### Gian-Ibe

#### Written by me

- **File:** `client/src/App.jsx`
- **Commit:** https://github.com/Gian-Ibe/Pok-Binder/commit/d14dd8c
- **What it does and why it is built this way:** I worked on integrating and testing the card-management interface with the deployed API. The application needs to load card records, submit changes, and update the displayed collection based on API responses. I checked that the records persisted after refreshing the page and investigated the card-number display issue when the returned field did not match the frontend property name.

#### The AI-written part I understand best

- **File:** `server/cardsRepo.js`
- **Commit:** https://github.com/Gian-Ibe/Pok-Binder/commit/7700c6f
- **What it does and why we kept it:** The repository layer handles database operations for card records, including retrieving, creating, and updating cards. It keeps SQL queries separate from the Express route handlers, making the backend easier to organize and maintain. Parameterized queries also help prevent SQL injection by treating supplied values as data rather than executable SQL.
