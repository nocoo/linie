# Retrospective

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
