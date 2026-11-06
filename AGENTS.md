# Linie

A frontend template for a large-scale network operations platform. The visual reference is `~/Downloads/linie.jpeg`: a technical drawing with a warm paper background, teal ink, coordinate rulers, dense tables and six numbered panels. Preserve this identity rather than introducing a sidebar dashboard.

## Stack

- React, TypeScript (strict), Vite, Radix Themes, Lucide icons, Biome.
- npm with a committed lockfile. Follow the machine's permitted registry rule.
- MVVM: `src/models` owns domain types, fixtures and pure operations; `src/viewmodels` owns application state and commands; `src/views` renders state; `src/components` owns reusable presentation; `src/styles` owns design tokens and layout.
- Use Radix standard controls. Domain-specific topology and telemetry drawings may use SVG. No backend, credentials, real infrastructure actions or external telemetry.
- The demo must be visibly labeled. Never imply fixture data is live production data.

## Commands

- `npm run dev`: local Vite server on `127.0.0.1:5173`.
- `npm run check`: Biome (warnings rejected) and TypeScript.
- `npm run build`: TypeScript and production Vite build.

Use a Herdr tab named `dev server` for the development server. Do not start background servers. Make verified atomic Conventional Commits; stage explicit paths and do not push unless requested.
