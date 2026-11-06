# LINIE

**Network operations / infrastructure atlas.**

A working React template that turns an engineering drawing into a network management interface. Warm paper, teal ink, coordinate rulers, hairline frames and six compact operational panels, inside a closable workspace sidebar with an optional operations companion.

![The Linie infrastructure atlas](docs/preview.png)

[View the operations companion](docs/companion.png)

## Capabilities

- **Server inventory:** 1,248 deterministic hosts, hostname/IP/role search, region and status filters, CPU sorting, pagination and endpoint inspection.
- **Network topology:** nine inspectable components spanning ingress, security, compute, storage and recovery.
- **Regional infrastructure:** four regions with derived health summaries and quick inventory scoping.
- **Incidents:** acknowledgement with an audit entry, without pretending to resolve the underlying condition.
- **Traffic and resources:** simulated 1-hour, 6-hour and 24-hour traffic, resampling and fleet utilization.
- **Operations journal:** session activity, server registration, maintenance state and downloadable JSON snapshots.

The sidebar starts expanded and can close. The right-hand companion starts folded and supports simulated multi-turn conversations based on the current fleet, including hostname inspection and regional comparisons. It never calls an AI service or executes commands.

This is a **simulated infrastructure template**, not a production monitoring service. A Cloudflare Worker serves the web app and `/api/live`; no infrastructure credentials or real management backend are required. Changes last for the current session; reloading restores the reference data. A telemetry refresh preserves edits.

## Stack

React 19 · TypeScript · Vite · Radix Themes · Lucide · Biome · Vitest · Playwright · axe-core

Radix provides the standard controls, including accessible selects, dialogs, tables and form fields. Custom SVG is limited to the specialized topology and telemetry drawings. Colors, typography and spacing originate in shared design tokens.

## Run locally

Use a supported Node.js version (22.23+, 24.22+ or 26.12+ in the manifest's ranges), npm and an installed Google Chrome for browser tests.

```sh
npm ci
npm run dev
```

Open **https://linie.dev.hexly.ai** through the configured local Caddy proxy. The internal dev endpoint is `http://127.0.0.1:7064`. In a registry-restricted environment, pass your permitted mirror explicitly to `npm ci`.

```sh
npm run check          # Biome, strict TypeScript and coverage tests
npm run test           # Model/ViewModel unit tests
npm run test:coverage  # Four enforced coverage floors: 95% each
npm run build          # Cloudflare build output in .cloudflare/output/v0/
npm run test:e2e       # Requires the local dev server to be running
npm run format         # Apply Biome formatting and safe fixes
npm run deploy:dry-run # Validate the Cloudflare deployment without uploading
npm run deploy         # Authorized publication to linie.hexly.ai
```

Inside Herdr, run the development server in the project's `dev server` tab rather than as a background process.

## MVVM structure

```text
src/
  models/       Domain types, fixtures, validation and pure operations
  viewmodels/   Application state, derived summaries and commands
  views/        Six panels, header, footer and dialog composition
  components/   Drawing frame, numbered panels, status and dialog mechanics
  styles/       Design tokens and responsive presentation
```

Views consume the ViewModel; they do not own infrastructure business rules. Replace the local Model/ViewModel data boundary when a real API is defined. Keep permission checks and production operations out of the presentation layer.

See [architecture and data semantics](docs/architecture.md) for the visual contract, extension points and deliberate demo boundaries.

## Verification

The current version has 59 Model/ViewModel/Worker unit tests and 26 desktop/mobile browser checks covering main workflows, focus restoration, 360–2048px viewport reflow and automated WCAG A/AA checks on the atlas and registration dialog. Coverage excludes presentation and build configuration; browser checks verify assembled Views. Automated checks do not replace manual accessibility testing.

There is no automatic pre-commit gate or L1 certification claim. Versioning is sourced from `package.json` for the sidebar, drawing footer and `/api/live`. See [deployment and version management](docs/deployment.md) and the [changelog](CHANGELOG.md).

Production: **https://linie.hexly.ai** · Health: **https://linie.hexly.ai/api/live**. The health endpoint reports Worker liveness, not the health of simulated infrastructure.

## License

[MIT](LICENSE).
