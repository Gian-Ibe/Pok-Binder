# Security checklist template

Copy this into your workspace `project/SECURITY-CHECKLIST.md` and fill
it in before you make your project repository public.

Every row gets one of **Yes**, **No** or **N/A**, and one line of
evidence in your own words: what you checked, where, and what you found.
"N/A" is a correct answer when it is true, but it needs its reason. A
blank row scores nothing, and a Yes your repository contradicts scores
nothing either.

Replace the example evidence with your own.

## Secrets and credentials

  -------------------------------------------------------------------------------
  \#                Check             Yes / No / N/A    Evidence
  ----------------- ----------------- ----------------- -------------------------
  1                 `.env` is         Yes               `git ls-files` showed no
                    gitignored and is                   tracked actual `.env`
                    not in the                          files; only
                    repository                          `.env.example` files are
                                                        tracked. The user
                                                        previously checked
                                                        `.gitignore` and
                                                        confirmed local `.env`
                                                        paths are ignored.

  2                 A `.env.example`  Yes               `git ls-files` listed the
                    with placeholder                    root, client, and server
                    values only is                      example files.
                    committed                           `server/.env.example`
                                                        uses placeholder values
                                                        such as `your_password`,
                                                        `your_username`, and
                                                        `your_strong_password`;
                                                        sample URLs in comments
                                                        are examples, not live
                                                        credentials.

  3                 No connection     Yes               Reviewed the targeted
                    string, key,                        source/config searches
                    token or password                   and `.env.example`;
                    is hardcoded in                     matches were
                    source, comments                    environment-variable
                    or commented-out                    references and
                    code                                placeholder/example URLs,
                                                        not a confirmed live
                                                        credential. This was a
                                                        targeted review, not a
                                                        guarantee against every
                                                        possible secret pattern.

  4                 Git history is    Yes               Ran `git log -p --all -G`
                    clean: I searched                   searches for `password`,
                    `git log -p` for                    `secret`, `api.key`, and
                    password, secret,                   `postgres://` against
                    api key and                         `client`, `server`, and
                    `postgres://`                       `.github`. The reviewed
                                                        matches showed example
                                                        configuration/workflow
                                                        comments; no confirmed
                                                        live credential was
                                                        identified.

  5                 Any credential    N/A               The reviewed history
                    that was ever                       searches did not identify
                    committed has                       a real credential that
                    been rotated                        had been committed, only
                                                        placeholders and
                                                        examples; therefore no
                                                        exposed credential was
                                                        identified for rotation.
                                                        If you know a real
                                                        credential was ever
                                                        committed, change this to
                                                        Yes only after rotating
                                                        it.

  6                 Production        N/A               The current setup is
                    credentials live                    local/self-hosted, with
                    only in my                          no separate hosted
                    hosting                             production environment
                    provider's                          reported. Local real
                    environment                         credentials should remain
                    settings                            in ignored `.env` files,
                                                        not committed files.
  -------------------------------------------------------------------------------

## GitHub Actions

If your project has no workflows, mark every row N/A and say so once.

  ---------------------------------------------------------------------------------------------------
  \#                Check                   Yes / No / N/A    Evidence
  ----------------- ----------------------- ----------------- ---------------------------------------
  7                 No secret value is      Yes               Reviewed
                    written literally in                      `.github/workflows/deploy-pages.yml`;
                    any workflow YAML file                    it uses repository variables for public
                                                              Vite build settings and pinned actions.
                                                              No literal secret value was observed.

  8                 Secrets are stored in   N/A               The deployment workflow does not
                    repository Actions                        consume GitHub Actions secrets; it uses
                    secrets and read with                     public repository variables for
                    `${{ secrets.NAME }}`                     frontend build configuration.

  9                 No workflow step        Yes               Opened the successful
                    echoes, dumps or                          `Fix client dependency vulnerability`
                    debug-prints a secret,                    run and inspected the visible `npm ci`
                    and I opened a recent                     and build logs. They showed the build
                    run's log to confirm                      output and zero reported
                                                              vulnerabilities, with no secret values
                                                              or environment dump in the inspected
                                                              logs.

  10                Uploaded build          Yes               Downloaded and inspected the successful
                    artifacts contain no                      GitHub Pages artifact listing; it
                    `.env`, key file or                       contained the site assets,
                    generated config                          `index.html`, `404.html`, and logo,
                                                              with no `.env` or key file visible.

  11                Third-party actions are Yes               Reviewed
                    pinned to a commit SHA,                   `.github/workflows/deploy-pages.yml`;
                    not a moveable tag                        third-party action references use full
                                                              commit SHAs rather than version tags.

  12                Secret scanning and     Yes               Checked the repository security
                    push protection are                       settings screenshot; both Secret
                    enabled on the                            Protection and Push protection show a
                    repository                                "Disable" button, indicating they are
                                                              enabled.
  ---------------------------------------------------------------------------------------------------

## Database

  -----------------------------------------------------------------------------------------
  \#                Check             Yes / No / N/A    Evidence
  ----------------- ----------------- ----------------- -----------------------------------
  13                Every query       Yes               Reviewed `server/cardsRepo.js`;
                    taking user input                   queries pass values as parameters
                    uses parameters,                    rather than concatenating user
                    never string                        input into SQL.
                    concatenation

  14                The database is   Yes               In `compose.yml`, the database
                    not open to the                     service publishes no host port, and
                    whole internet,                     the API port is bound to
                    or is reachable                     `127.0.0.1:3000`. This verifies the
                    only by the app                     supplied self-hosted Compose
                                                        configuration, not any separate
                                                        network setup outside it.

  15                The database user No                `compose.yml` sets `DATABASE_URL`
                    the app connects                    to connect as PostgreSQL's
                    as has only the                     `postgres` superuser. Configure a
                    permissions it                      dedicated application role with
                    needs                               only the required permissions
                                                        before treating this as complete.

  16                Seed and sample   Yes               The obsolete sightings
                    data is invented,                   fixture in
                    not real people's                   `client/src/api/seed.json`
                    data                                has been cleared; no
                                                        sample reports remain.

  17                Debug, seed and   Yes               `git ls-files server/db/seed.sql`
                    reset routes are                    returned no result, and
                    removed before                      `server/package.json` contains only
                    going public                        `start`, `dev`, and `db:schema`
                                                        scripts; no seed/reset scripts were
                                                        present. The server search also
                                                        found no seed/reset route
                                                        references.
  -----------------------------------------------------------------------------------------

## Access control

  -----------------------------------------------------------------------------------
  \#                Check                 Yes / No / N/A    Evidence
  ----------------- --------------------- ----------------- -------------------------
  18                The app has an access Yes               `server/server.js`
                    layer: Cloudflare                       applies Basic
                    Zero Trust, an                          Authentication when
                    app-level password,                     `NODE_ENV` is
                    or a real login                         `production`; the
                                                            supplied Compose
                                                            configuration sets
                                                            `NODE_ENV: production`.

  19                If Supabase or        N/A               The reviewed project uses
                    Firebase: Row Level                     a PostgreSQL database
                    Security or security                    through the `pg` package,
                    rules are on, and I                     not Supabase or Firebase.
                    tested it signed out

  20                If Zero Trust:        No                The app uses
                    authorized account                      environment-based Basic
                    is on the access                        Authentication in
                    policy. If an app                       production, but I have
                    password: the                           not verified that the
                    credentials are in my                   credentials are recorded
                    private workspace                       in the private workspace
                    `project/README.md`                     `project/README.md`. Do
                                                            not put real credentials
                                                            in the public repository
                                                            README.

  21                The gate covers every Yes               In `server/server.js`,
                    route, including the                    the production Basic
                    ones that only change                   Authentication middleware
                    data                                    is registered with
                                                            `app.use(basicAuth)`
                                                            before the API routes.

  22                The credentials for   Yes               `server/server.js` reads
                    the gate are                            `BASIC_AUTH_USERNAME` and
                    environment                             `BASIC_AUTH_PASSWORD`
                    variables, not in                       from environment
                    source                                  variables;
                                                            `server/.env.example`
                                                            contains placeholders
                                                            only.
  -----------------------------------------------------------------------------------

## Input and output

  ---------------------------------------------------------------------------------
  \#                Check             Yes / No / N/A    Evidence
  ----------------- ----------------- ----------------- ---------------------------
  23                Input from the    Yes               `server/server.js`
                    user is validated                   validates request bodies on
                    on the server,                      the server before card
                    not only in the                     create/update operations.
                    browser

  24                User-supplied     Yes               The React client renders
                    text is escaped                     text through standard React
                    when rendered, so                   rendering; the targeted
                    it cannot inject                    search found no
                    markup or script                    `dangerouslySetInnerHTML`
                                                        usage in the reviewed
                                                        client/server source.

  25                Error responses   Yes               `server/server.js` returns
                    do not expose                       generic error responses to
                    stack traces,                       clients; detailed database
                    file paths or                       maintenance errors in
                    connection                          `server/db/run.js` are
                    details                             written to the local
                                                        terminal, not exposed
                                                        through an API route.

  26                CORS is not a     Yes               `server/server.js` builds
                    wildcard on                         the allowed-origin list
                    routes that                         from `CORS_ORIGINS`; the
                    change data                         example uses
                                                        `http://localhost:5173`,
                                                        not a wildcard.
  ---------------------------------------------------------------------------------

## Repository and privacy

  ---------------------------------------------------------------------------------
  \#                Check             Yes / No / N/A    Evidence
  ----------------- ----------------- ----------------- ---------------------------
  27                No student        Yes               Rewrote the five-commit
                    number, personal                    `main` history to replace
                    email, phone                        the reported personal
                    address in the                      email in author and
                    repository or in                    committer metadata. A
                    commit messages                     targeted check found no
                                                        match in reachable
                                                        history; review for other
                                                        personal data separately.

  28                No classmate's    No                A full review of all
                    personal data in                    tracked files and
                    the repository                      historical versions for
                                                        classmates' personal data
                                                        has not been completed.
                                                        The legacy seed file is
                                                        now empty.

  29                Dependencies come Yes               The client lockfile
                    from official                       resolves packages from
                    registries, and                     `registry.npmjs.org`;
                    `node_modules` is                   `git ls-files` found no
                    gitignored                          tracked `node_modules`
                                                        paths.

  30                Images, fonts and No                Asset ownership/licensing
                    other assets are                    has not been verified for
                    mine, licensed,                     every image, font, and
                    or credited                         other asset in the
                                                        repository.

  31                Repository        Yes               Confirmed the GitHub
                    visibility is                       repository is Public after
                    deliberate, and I                   the latest successful
                    checked it after                    push/deployment, and the
                    my last push                        user confirmed this
                                                        visibility is intentional.
  ---------------------------------------------------------------------------------

## Anything I found and fixed

The review confirmed that GitHub Secret Protection and push protection
are enabled, the latest Pages deployment succeeded, and the visible
build logs showed no secret values or environment dumps. The dependency
vulnerability was fixed in the latest commit, and the deployment's
`npm ci` log reported zero vulnerabilities. The remaining issues are the
database's use of the PostgreSQL superuser, the unreviewed legacy
Haunted Sightings sample data, and checks that still need direct
confirmation; those are marked No rather than claimed as complete.
