# LINIE

**Network operations / infrastructure atlas.**

An engineering-drawing-inspired React template for infrastructure management. Warm paper, hairline rules, tabular metrics and compact numbered panels, rather than conventional dashboard chrome.

## Development

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:5173.

```sh
npm run check
npm run build
```

## Architecture

React + TypeScript + Vite, Radix Themes standard controls, Lucide icons and Biome. The application follows MVVM, separating domain data, stateful ViewModels and presentational Views. Design decisions belong in `docs/`; stable project instructions belong in `AGENTS.md`.

This is a local frontend demo. It does not connect to production infrastructure.

## License

MIT.
