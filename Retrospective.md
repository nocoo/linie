# Retrospective

## 2026-11-07 - Identity adoption and Hexly site entry

- Source commit: `959255d1425ef46116164c702bc6d6782be7d7ef`; the application identity change is `21dc59c`.
- CI run: https://github.com/nocoo/linie/actions/runs/42328435959 - successful for that exact source SHA.
- Deployment run: https://github.com/nocoo/linie/actions/runs/42328558624 - successful, custom domain `linie.hexly.ai`.
- Cloudflare version ID: `a157e2a7-31a1-408b-a0c8-0c6219dd1473`.
- Public `/api/live` returned HTTP 200, version `0.3.1`, `Cache-Control: no-store` and no body on HEAD.
- The deployed entry assets matched the local production build: JS SHA-256 `1d6ad78cc144603de97bfa2f56677846b2edefd25d6b256a2063eb926b83e8ec`, CSS SHA-256 `6dfcf81e133c9f6de4d9190098c8a7ba279fc9617f63f1607d8524ac5342382d`.
- All 30 desktop and mobile browser checks passed against the public origin, including the approved brand mark and the Hexly entry.
- The artwork was copied byte for byte from the Hexly study `artwork/logo-family/linie/2026-11-07-01/finishing/01`. No pixel was regenerated or edited; `assets/brand/README.md` records the SHA-256 values and the source provenance.
- The Hexly entry points at the canonical catalogue route `https://hexly.ai/projects/linie` as a real anchor with `target="_blank"` and `rel="noopener noreferrer"`.
- No Git tag or GitHub Release was created, and no Cloudflare credential, certificate or trust store was touched.

An icon-only link needs a text alternative, not only an SVG: the accessible name
lives in a visually hidden label inside the anchor, and the tooltip stays a short
description. The Hexly entry and the companion control now share one action
container, because the old rule that pushed the last button to the right with
`margin-left: auto` would have split the pair at narrower widths. Keep the
product mark a plain transparent image next to the wordmark, and give it an
empty alternative instead of a tile, a glow or a mask.

## 2026-11-07 — README review must distinguish browser lanes

Independent review of the bilingual README caught a missing clean-CI Chromium
installation prerequisite and an overbroad claim that there was no backend.
Both language versions now distinguish local Chrome from Playwright-managed
Chromium and limit the backend statement to real infrastructure management;
the Worker still owns the health endpoint. These were corrected before push.
When documenting multiple execution modes, check each mode's prerequisites
against its configuration instead of applying the local setup to CI.

## 2026-11-07 — First successful automatic v0.3.0 deployment

- Proven source: `6345ec37286dd9b34f161627f543d306c4103b0a`.
- CI: https://github.com/nocoo/linie/actions/runs/42315130501 — successful, including 76 unit/configuration tests, 26 isolated Chromium browser checks, Gitleaks, OSV, workflow lint and Cloudflare build validation. Coverage: statements 99.62%, branches 99.23%, functions 100%, lines 100%.
- Automatic deployment: https://github.com/nocoo/linie/actions/runs/42315282752 — successful. Source proof, explicit production-secret propagation, fresh-main check, cf upload and post-deploy verification all passed.
- Cloudflare version ID: `d017a96d-036b-4ab4-8ac7-0c6a5fd702d7`.
- Public `/api/live` returned HTTP 200, version `0.3.0` and `Cache-Control: no-store`. All 26 browser checks passed again against `https://linie.hexly.ai` after deployment.
- The local and runner-built entry assets matched production: JS SHA-256 `f98f3b000abddedc7e5438e20863707ee2da5f7384255de19928ac2342f257a3`; CSS SHA-256 `675c32200ea6b091107923f647a2fa7ab06e1c14cb9f5a20724dcd5a5c8259c5`.
- The owner supplied environment secrets. No stored secret was read back, changed or copied into source. No manual Cloudflare deployment, Git tag or GitHub Release was used for this publication.
- This record documents the first successful automatic release; subsequent documentation commits run through the same pipeline without changing the application version.

## 2026-11-07 — Explicit reusable-workflow secret propagation

CI run `42314053437` passed for `e5557c9`, including 75 unit/configuration tests, 26 Chromium browser tests, Gitleaks, OSV, build dry-run and workflow lint. Deployment run `42314220024` proved the same source and rebuilt it, but correctly stopped because both credential values were empty. The `production` environment and both secret names had been confirmed; the caller omitted explicit secret mappings.

GitHub's current reusable-workflow documentation requires the caller to pass a secret by name even when it exists only in the environment. The callee's `environment` setting does not replace that permission boundary. Added only the two named mappings and a regression test, without broad secret inheritance, changing stored credentials or bypassing source verification. Reference: https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows#using-inputs-and-secrets-in-a-reusable-workflow.

The first Git push returned a server error. Checking the remote ref showed no update; a single retry through the machine's explicitly configured HTTPS proxy succeeded. Always inspect the remote before retrying an uncertain push.

## 2026-11-07 — base-ci integration boundaries

The current provider revision `af9a2b3f82c367d6eb6def5c3583ac717e0868ad` supports cf directly. Use its maintained input contract, not the older Wrangler-only research snapshot. Production deployment must prove a completed main-push CI run before checking out source, and must not inherit credentials into test jobs.

Local verification covers actionlint 1.7.12, shared-workflow input names, 75 unit/configuration tests, deployment dry-run and 26 browser checks against both local Caddy HTTPS and the production build preview. The temporary preview pane was task-owned; the normal development server remains separate. GitHub run/deployment evidence is pending authorization to push the local commits and configure production secrets. Do not describe workflow files as an activated deployment pipeline.

## 2026-11-07 — One sidebar control

The workspace exposed both a sidebar-header close button and a toolbar toggle for the same action. Keep ownership in the persistent toolbar so opening and closing use one stable position. The regression test now requires exactly one sidebar control in both states and verifies keyboard reopening and focus retention.

## 2026-11-07 — Verify current tool contracts

The first scaffold check caught a missing accessible title in the standalone SVG favicon and an outdated Biome `recommended` configuration key. Both were corrected before committing. For new projects, inspect the installed schema and include accessible SVG titles from the start; do not assume familiar configuration keys remain current.

## 2026-11-07 — Validate the assembled design, not just controls

Browser review caught coordinate labels wrapping, undersized supporting text and insufficient contrast on tinted table rows and badges. The visual tokens were darkened, body typography made explicit, and operational text raised to 11px. Automated axe checks now cover the atlas and registration dialog alongside interaction tests. Test contrast against every actual surface, not only the page background.

The initial standalone axe probe used Playwright's convenience `browser.newPage()` API. Axe needs an explicit BrowserContext for its aggregation page. Follow the library's documented context setup and close the browser in `finally`; do not use legacy mode to hide a test-harness mistake.

The registry's Playwright `latest` tag pointed to an alpha while axe resolved stable `playwright-core`, creating duplicate incompatible Page types. Pin the verified stable test release and inspect `npm ls playwright-core` after adding browser tooling. Do not silence the conflict with casts or typecheck exclusions.

## 2026-11-07 — Workspace and deployment extension

The shell requires container queries, not viewport-only media queries: opening a sidebar and chat reduces the atlas width even on a large display. The existing media-query layout was converted before extending browser coverage.

The maintained Caddy skill's OpenSSL path was not installed on this machine. Resolve the installed executable rather than assuming a Homebrew formula layout. The existing public certificate SAN and expiry were sufficient to verify the requested domain; no CA or Keychain writes were needed. Caddy validation reports an existing formatting warning at line 11; this task preserves unrelated configuration instead of globally reformatting it.

Cloudflare's `cf deploy --dry-run` can automatically rewrite an unconfigured project. Read the current programmatic configuration and plugin types, create the explicit configuration first, and validate prebuilt output before a production upload.

Chrome and curl trusted local HTTPS, but Playwright's Node-based API request client did not. Enabling Node's system-CA option alone did not resolve this machine's trust path. Passing the existing public `$(mkcert -CAROOT)/rootCA.pem` through `NODE_EXTRA_CA_CERTS` verified the full certificate chain without altering trust stores or disabling TLS verification. Document the exact working command rather than equating browser trust with Node request-client trust.

## 2026-11-07 — v0.2.0 deployment verification

- Source commit: `cda256b0279e1c3fc18c2c2bbe30aa367eeadb6d`.
- Cloudflare Worker: `linie`; deployed through the pinned `cf` CLI using the production Build Output.
- Cloudflare version ID: `63226e70-d20c-4265-9390-065671c8afc4`.
- Public origin: `https://linie.hexly.ai`; homepage and anonymous `/api/live` returned HTTP 200. Health returned version `0.2.0`, `scope: worker-liveness`, `dataMode: simulation` and `Cache-Control: no-store`.
- All 59 unit tests passed. Coverage: statements 99.57%, branches 99.20%, functions 100%, lines 100% across Models, ViewModels and Worker routing. Biome and TypeScript passed without warnings/errors.
- All 26 desktop/mobile browser checks passed through local Caddy HTTPS and again against the public origin. TLS verification remained enabled.
- Public HTML referenced the exact locally built JS/CSS files. SHA-256 matched: JS `042998205a4102421fb5a0fb5587203498a7049b185ca74cf5c6e12bbd03b798`; CSS `41e3d7a7c65fcf6ff6a15e3a03f613d12ef064db2a742d6a23551c50fab85bc4`.
- The local Caddy mapping was synchronized in the workflow repository at `92cdbf9d`; only that mapping was changed. Existing certificates were reused.
- Cloudflare's public DNS-over-HTTPS resolved the production domain to edge addresses. The machine's UDP DNS path still returned a negative cached answer during verification, while normal Chrome and curl HTTPS requests passed. No resolver, hosts-file or network-policy change was made.
- No Git push, GitHub tag or Release was requested or performed. This repository has no GitHub CI workflow, so remote CI is not claimed. This verification log is a documentation-only commit after the deployed source commit above.
