# Retrospective

## 2026-11-07 — Verify current tool contracts

The first scaffold check caught a missing accessible title in the standalone SVG favicon and an outdated Biome `recommended` configuration key. Both were corrected before committing. For new projects, inspect the installed schema and include accessible SVG titles from the start; do not assume familiar configuration keys remain current.
