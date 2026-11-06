# CI and continuous deployment

## Shared workflow version

Linie pins `nocoo/base-ci` at `af9a2b3f82c367d6eb6def5c3583ac717e0868ad`. The provider's workflow input definitions, integration guide and pinned setup/release-source actions were inspected before adoption. No provider source is copied into this repository.

Node 26.13.0, npm 11.20.0 and the project-locked `cf` 1.0.0-beta.26 are used explicitly. Dependency installation is frozen with lifecycle scripts blocked. No production credentials are passed to CI.

## CI

`.github/workflows/ci.yml` runs on pull requests targeting `main` and pushes to `main`:

- `quality.yml`: strict TypeScript, Biome with warning rejection, unit tests with four 95% coverage floors, Gitleaks, OSV and a Cloudflare build/deployment dry run.
- `test-job.yml`: desktop/mobile Playwright tests using the installed Chromium build. Playwright builds the app, starts the Worker-aware production preview at `127.0.0.1:17064`, waits for `/api/live`, and shuts down its process group afterward. It refuses an already occupied server port. A public `PLAYWRIGHT_BASE_URL` cannot redirect CI tests away from this local build.
- `workflow-lint.yml`: actionlint, YAML style and immutable shared-workflow references. It also checks that the shared Worker deployment workflow is present.

Coverage and browser HTML reports are retained for seven days. CI can cancel superseded runs. Browser tests have no retries and reject focused tests. Normal local browser tests continue to use Chrome and an already running Herdr-managed server; they do not start a background server.

## Deployment

`.github/workflows/deploy.yml` runs only after the complete `CI` workflow succeeds for a push from this repository's `main` branch. PR/fork evidence is rejected. The pinned shared `deploy-worker.yml`:

1. Validates the CI run ID, repository, event, canonical workflow, branch and exact source SHA using GitHub's API.
2. Checks out and rebuilds that proven SHA with frozen dependencies.
3. Checks main-branch freshness again before publishing.
4. Holds a non-cancelling production concurrency lock.
5. Runs the locked `cf deploy --prebuilt --mode production` against the existing Worker and custom domain. No Wrangler configuration or D1 migrations are introduced.
6. Runs `npm run verify:deployment` with at most six attempts, ten seconds apart.

This is a verified-source rebuild, not CI artifact promotion. The post-deploy verifier rejects redirects, wrong status/content type, cached health responses, wrong versions, stale HTML and differing JS/CSS bytes. Every network request has a ten-second timeout. The verification function has unit tests for success and failure cases.

A CI failure, missing credential, stale source or failed verification blocks the corresponding step; nothing converts these failures into a green result. Publication does not automatically create a Git tag, GitHub Release or version-bump commit. Follow the separate [version lifecycle](deployment.md#version-lifecycle).

## Production credentials

Create the exact GitHub environment `production` in `nocoo/linie`. Restrict deployment branches to `main`; no manual reviewer is required for the requested automatic deployment. Store these environment secrets:

| Secret                  | Value                                                                                                                    |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `CLOUDFLARE_API_TOKEN`  | A dedicated CI API token with the necessary Workers deployment and custom-domain permissions for the target account/zone |
| `CLOUDFLARE_ACCOUNT_ID` | The account ID already declared in `cloudflare.config.ts`                                                                |

The called deployment job selects this environment and reads only the two named secrets. The caller does not use `secrets: inherit`. Never commit a token, paste it into a command argument/history, or copy the local OAuth profile into GitHub. Set token values through GitHub's secret UI or an interactive `gh secret set` prompt.

GitHub settings: https://github.com/nocoo/linie/settings/environments

## Activation and evidence

The owner configured both required secrets in `production` and authorized the first application/workflow push on 2026-11-07. The environment has no additional reviewer or branch protection rule; the workflow's source and branch checks remain mandatory.

Inspect the `CI` and `Deploy` runs for the exact pushed SHA. Record both run URLs, the deployed Worker version and the production verification result in `Retrospective.md`. Local actionlint, unit tests and preview acceptance do not establish that GitHub CI or CD ran successfully. No branch-protection rules or required status checks are configured by this change.
