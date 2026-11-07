# Changelog

## v0.3.1 - 2026-11-07

- Adopt the approved Linie identity artwork as the product mark in the atlas header and the workspace sidebar, replacing the Lucide cube marks.
- Replace the authored SVG favicon with the approved PNG favicon set and apple touch icon.
- Add the Hexly project-detail link to the workspace toolbar with the canonical catalogue route, a real anchor target, an accessible name and a tooltip.
- Publish the approved logo in the Chinese and English README headers and record the brand asset manifest with SHA-256 values and source provenance.

The baseline is v0.3.0 at `518c554`. This is a patch identity and site-entry change.

## v0.3.0 — 2026-11-07

- Integrate immutable `nocoo/base-ci` quality, security, browser, workflow-lint and cf deployment workflows.
- Test built assets in an isolated CI preview and verify deployed health, version, HTML references and JS/CSS hashes.
- Keep a single sidebar toggle in the workspace toolbar; remove the duplicate sidebar close button and verify pointer/keyboard focus behavior.

The baseline is v0.2.0 at `cda256b`. The accumulated changes exceed 500 lines, so the minor version advances to v0.3.0.

## v0.2.0 — 2026-11-07

- Add a default-open, closable workspace sidebar with section navigation, quick actions and a manifest-derived version pill.
- Add a default-closed operations companion with simulated replies, follow-up questions, read-only host/region context and session-local history.
- Reflow the atlas with container queries so sidebar and chat layouts do not compress its content into overflowing panels.
- Introduce a Cloudflare Worker and static-assets deployment through the `cf` CLI and `cloudflare.config.ts`.
- Add anonymous `GET` / `HEAD /api/live`, no-store caching, authoritative version metadata and explicit simulation/liveness scope.
- Reject unsupported health methods and unknown API paths instead of serving an HTML success fallback.
- Configure local HTTPS at `linie.dev.hexly.ai` on port 7064 and the production custom domain `linie.hexly.ai`.
- Expand domain, session, routing, desktop/mobile and accessibility verification.

The version baseline is v0.1.0 at `8f61ede`. This change introduces new capabilities and exceeds 500 changed lines, so the minor version advances to v0.2.0. A Cloudflare deployment does not imply a GitHub tag or Release.

## v0.1.0 — 2026-11-07

- Create the React, TypeScript, Radix Themes, Vite and Biome foundation with MVVM separation.
- Reproduce the engineering-drawing visual language across six infrastructure panels.
- Add a deterministic 1,248-host inventory, topology inspection, regional summaries, incidents, telemetry and a journal.
- Support filtering, registration, maintenance status, acknowledgement and JSON snapshot export.
- Verify unit coverage, desktop/mobile workflows, focus restoration and automated accessibility checks.
