# Architecture and visual contract

## Intent

Linie is a local, extensible frontend template for network operations. Its source reference is `~/Downloads/linie.jpeg`, an engineering verification drawing. The application preserves the reference's double frame, coordinate rulers, seven-metric strip, three-column / six-panel composition, technical title block, teal ink, warm paper, outlined regions and dense information hierarchy. The content is replaced with infrastructure operations. It is not a production monitoring product.

Radix Themes was selected for accessible standard inputs, buttons, selects, dialogs, tables, progress bars, segmented choices and tooltips while retaining the drawing's square geometry. A conventional sidebar shell would conflict with the reference. Domain-specific topology and traffic diagrams are SVG; they are not replacements for standard form controls.

## Layers

```text
src/models/infrastructure.ts
  Types, deterministic fixtures, filtering, validation, summaries, export schema
           ↓
src/viewmodels/useAtlasViewModel.ts
  Session state, filters, pagination, selection, registration, maintenance,
  incident acknowledgement, telemetry resampling, export and journal commands
           ↓
src/views/*
  Six panels, application composition, header, footer and form bindings
           ↓
src/components/* + src/styles/*
  Reusable drawing frame, numbered panel, status, focus-restoring dialog,
  semantic design tokens and responsive presentation
```

Business rules stay in Models and ViewModels. View-only focus restoration, DOM navigation and chart coordinate projection stay in presentation. There is one ViewModel instance per application. No global store or routing abstraction is necessary for this one-screen template.

## Data semantics

- The deterministic reference fleet contains 1,248 unique hosts across four regions: 1,224 healthy, 18 degraded and six offline.
- Fleet metrics are derived from the full inventory. Search and region/status filters affect only the asset register; they do not silently change global metrics.
- Reachability is `(online + degraded) / total`. Maintenance hosts count toward attention, not reachability.
- Topology capacity, network throughput and service-plane metrics describe the reference architecture. Traffic charts are labeled simulated and use deterministic samples.
- New servers are immediately visible at the start of the inventory. Registration validates hostname, IPv4, region, role and duplicate identity before mutation.
- Maintenance is limited to online or maintenance hosts. The action never contacts infrastructure.
- Acknowledgement claims ownership; it does not resolve or delete an incident.
- Changes are session-only. Refresh resamples traffic and preserves session edits; browser reload resets the demo. Export downloads the full current fleet and incident state with explicit demo provenance.
- There is no backend, authentication, deployment, external font dependency, remote analytics or real infrastructure connection.

## Extending the template

Replace fixtures and commands in the Model/ViewModel boundary with a typed service when a real API is defined. Introduce loading, transport failures, authorization and server-side pagination at that point. Keep Views independent of transport. Do not treat demo maintenance or acknowledgement as permission-checked production actions.

`package.json` is the authoritative version; Vite injects it into the title block at build time.

## Verification

- `npm run check`: strict Biome, strict TypeScript and Model/ViewModel unit tests with four coverage floors of 95%.
- `npm run build`: production compilation.
- `npm run test:e2e`: Chrome desktop and mobile interaction tests against the running local dev server.
- Coverage deliberately excludes pure presentation and build configuration. Browser tests cover the assembled Views.
- No L1 certification or automatic pre-commit gate is claimed.

Biome's descending-specificity heuristic is disabled only for the application stylesheet because separately named component selectors do not compete, even when their final element selectors match. Reduced-motion overrides deliberately outrank Radix component animations. Other recommended checks and warning rejection remain enabled.
