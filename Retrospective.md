# Retrospective

## 2026-11-07 — Verify current tool contracts

The first scaffold check caught a missing accessible title in the standalone SVG favicon and an outdated Biome `recommended` configuration key. Both were corrected before committing. For new projects, inspect the installed schema and include accessible SVG titles from the start; do not assume familiar configuration keys remain current.

## 2026-11-07 — Validate the assembled design, not just controls

Browser review caught coordinate labels wrapping, undersized supporting text and insufficient contrast on tinted table rows and badges. The visual tokens were darkened, body typography made explicit, and operational text raised to 11px. Automated axe checks now cover the atlas and registration dialog alongside interaction tests. Test contrast against every actual surface, not only the page background.

The initial standalone axe probe used Playwright's convenience `browser.newPage()` API. Axe needs an explicit BrowserContext for its aggregation page. Follow the library's documented context setup and close the browser in `finally`; do not use legacy mode to hide a test-harness mistake.

The registry's Playwright `latest` tag pointed to an alpha while axe resolved stable `playwright-core`, creating duplicate incompatible Page types. Pin the verified stable test release and inspect `npm ls playwright-core` after adding browser tooling. Do not silence the conflict with casts or typecheck exclusions.
