# PokéBinder Security Checklist

## Secrets and credentials

| # | Check | Yes / No / N/A | Evidence |
|---|---|---|---|
| 1 | `.env` is gitignored and is not in the repository | Yes | `git check-ignore -v .env server/.env client/.env` confirmed all three are ignored; `git ls-files` returned no tracked environment files. |
| 2 | A `.env.example` with placeholder values only is committed | Yes | `git ls-files "*env.example"` listed the root, client, and server example files. The reviewed server example uses placeholder credentials. |
| 3 | No connection string, key, token or password is hardcoded in source, comments or commented-out code | No | Targeted searches found no confirmed live credentials, but a complete review of all files and secret patterns has not been performed. |
| 4 | Git history is clean: I searched `git log -p` for password, secret, API key and `postgres://` | No | A history search found example configuration changes, but the full history and all file types have not been verified as free of real secrets. |
| 5 | Any credential that was ever committed has been rotated | No | Credential exposure and rotation history have not been fully verified. |
| 6 | Production credentials live only in my hosting provider's environment settings | No | The example configuration recommends environment variables, but the production hosting settings have not been inspected. |

## GitHub Actions

| # | Check | Yes / No / N/A | Evidence |
|---|---|---|---|
| 7 | No secret value is written literally in any workflow YAML file | Yes | Reviewed `.github/workflows/deploy-pages.yml`; no literal credentials were observed. |
| 8 | Secrets are stored in repository Actions secrets and read with `${{ secrets.NAME }}` | N/A | The reviewed Pages workflow uses public frontend configuration variables and does not require an Actions secret. |
| 9 | No workflow step echoes, dumps or debug-prints a secret, and I opened a recent run's log to confirm | No | The workflow source contains no apparent secret-printing step, but the complete recent run logs have not been reviewed for exposure. |
| 10 | Uploaded build artifacts contain no `.env`, key file or generated config | No | The workflow uploads `client/dist`; the artifact contents have not been inspected for sensitive files or values. |
| 11 | Third-party actions are pinned to a commit SHA, not a movable tag | Yes | The reviewed workflow pins checkout, setup-node, upload-pages-artifact, and deploy-pages actions to commit SHAs. |
| 12 | Secret scanning and push protection are enabled on the repository | Yes | GitHub repository settings showed Secret Protection and Push Protection enabled. |

## Database

| # | Check | Yes / No / N/A | Evidence |
|---|---|---|---|
| 13 | Every query taking user input uses parameters, never string concatenation | Yes | Reviewed `server/cardsRepo.js`; card values and IDs use PostgreSQL query parameters. |
| 14 | The database is not open to the whole internet, or is reachable only by the app | No | The Docker Compose configuration keeps the database port unpublished and binds the API to localhost, but the actual deployed database network and firewall settings have not been verified. |
| 15 | The database user the app connects as has only the permissions it needs | No | The database role's privileges have not been inspected. |
| 16 | Seed and sample data is invented, not real people's data | No | The obsolete Haunted Sightings SQL seed file was removed and the seed/reset scripts were removed from `server/package.json`. The old client mock-data files remain and have not been fully reviewed or cleaned up. |
| 17 | Debug, seed and reset routes are removed before going public | Yes | No matching debug, seed, or reset API routes were found in the searched server JavaScript files. The obsolete SQL seed file and related package scripts were removed. |

## Access control

| # | Check | Yes / No / N/A | Evidence |
|---|---|---|---|
| 18 | The app has an access layer: Cloudflare Zero Trust, an app-level password, or a real login | Yes | `server/server.js` defines Basic Authentication middleware for production. |
| 19 | If Supabase or Firebase: Row Level Security or security rules are on, and I tested it signed out | N/A | The project uses PostgreSQL through the `pg` package rather than Supabase or Firebase. |
| 20 | If Zero Trust: the specified email is on the access policy. If an app password: the credentials are in my private workspace `project/README.md` | N/A | The project uses environment-configured Basic Authentication, not Zero Trust. Production credential storage has not been verified. |
| 21 | The gate covers every route, including the ones that only change data | Yes | In production, `app.use(basicAuth)` is registered before the health, readiness, and card routes. |
| 22 | The credentials for the gate are environment variables, not in source | Yes | The server reads `BASIC_AUTH_USERNAME` and `BASIC_AUTH_PASSWORD` from `process.env`. |

## Input and output

| # | Check | Yes / No / N/A | Evidence |
|---|---|---|---|
| 23 | Input from the user is validated on the server, not only in the browser | Yes | `server/server.js` validates required card fields, text lengths, and quantity before creating or updating cards. Additional validation for image values and identifiers could improve robustness. |
| 24 | User-supplied text is escaped when rendered, so it cannot inject markup or script | Yes | No `dangerouslySetInnerHTML` matches were found in the searched frontend JavaScript and JSX files; React JSX text rendering escapes text by default. |
| 25 | Error responses do not expose stack traces, file paths or connection details | Yes | The server error middleware logs errors server-side and returns a generic message to clients. The separate database maintenance script prints detailed diagnostic information to its terminal. |
| 26 | CORS is not a wildcard on routes that change data | No | The server configures CORS from an explicit `CORS_ORIGINS` allowlist rather than a wildcard. The actual production origins still need confirmation. |

## Repository and privacy

| # | Check | Yes / No / N/A | Evidence |
|---|---|---|---|
| 27 | No student number, personal email, phone number or home address in the repository or in commit messages | No | The tracked-file search found no confirmed personal details beyond false positives, but the existing Git commit history contains the author's personal email address. |
| 28 | No classmate's personal data in the repository | No | Repository contents have not been comprehensively checked for classmates' personal information. |
| 29 | Dependencies come from official registries, and `node_modules` is gitignored | No | The workflow uses `npm ci`, and `git check-ignore -v client/node_modules server/node_modules` confirmed both dependency folders are ignored. The dependency registry configuration and sources have not been fully verified. |
| 30 | Images, fonts and other assets are mine, licensed, or credited | No | Ownership, licensing, and attribution of all project assets have not been verified. |
| 31 | Repository visibility is deliberate, and I checked it after my last push | Yes | GitHub repository settings were checked and the repository was confirmed to be public. |

## Anything I found and fixed

I verified that environment files are ignored by Git, that the reviewed database queries use parameterized values, and that the deployment workflow pins its actions to commit SHAs. I enabled GitHub Secret Protection and Push Protection and resolved the GitHub Pages configuration issue so the deployment succeeded. I also removed the obsolete Haunted Sightings SQL seed file and its seed/reset scripts from the working tree. Remaining concerns include reviewing old client mock data, verifying production credentials and database permissions, reviewing the complete Git history and build artifacts, checking asset licenses, and addressing remote database TLS certificate verification. The existing Git history also contains the author's personal email address.