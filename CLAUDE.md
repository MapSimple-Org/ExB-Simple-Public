# Claude Code Instructions for MapSimple ExB Widgets

## Project Context

This project contains custom ArcGIS Experience Builder (ExB) widgets:

- **query-simple/** - Search and query widget with multi-mode results (New, Add, Remove), map highlighting, spatial operations, typeahead/suggest, markdown templates, and deep linking via URL hash parameters
- **helper-simple/** - URL monitoring orchestrator that detects hash parameters and coordinates widget opening/query execution
- **feed-simple/** - XML feed consumer widget with markdown card templates, color coding, map layer sync, and responsive mobile support. Requires `shared-code/`
- **shared-code/** - Common utilities, components, template engine, and debug logging shared between all widgets

**Stack:** Experience Builder 1.20, ArcGIS Maps SDK for JavaScript 5.0.4, Calcite 5.0.2, React 19, TypeScript

## Key Documentation

Read these files for context before making changes:

1. **Architecture Guide**: `docs/query-simple/` and `docs/feed-simple/`
   - Widget architecture patterns (Hook & Shell, lifecycle, component hierarchy)
   - Tab architecture (Query tab, Spatial tab, shared components)
   - Handler extraction pattern (typed context interfaces)
   - Spatial query architecture (Operations + Draw modes, buffer preview, multi-layer execution)
   - Typeahead/suggest architecture (companion hook pattern, capture-phase listeners)
   - Shared code patterns and import conventions

2. **Process Flows**: `docs/query-simple/process-flows/README.md` and `docs/feed-simple/process-flows/README.md`
   - End-to-end flow documents describing how the widgets work
   - When changing code that affects a documented flow, update the corresponding FLOW document

3. **Changelog**: `docs/query-simple/CHANGELOG.md` and `docs/feed-simple/CHANGELOG.md`
   - Detailed version history

4. **Release Notes**: `docs/releases/`
   - Per-release summaries

## Technical Rules

- **React imports**: Import React from `jimu-core`, never from `'react'` directly
- **Logging**: Never use `console.log()`. Use `debugLogger` from `widgets/shared-code/mapsimple-common`
- **Versioning**: Increment `MINOR_VERSION` in `version.ts` for every code change. When `shared-code/` is modified, bump ALL consuming widgets (query-simple, helper-simple, feed-simple)
- **Architecture**: Follow Esri's Hook & Shell pattern (Setting.tsx = config, Widget.tsx = runtime)
- **Shared code first**: Check `shared-code/` before creating new utility functions. If code is used by multiple widgets, it belongs in shared-code
- **Process flows**: When modifying code that affects a documented flow, update the corresponding `FLOW-XX.md`. When adding a feature with a distinct new flow, create a new FLOW document

## Widget Structure

```
query-simple/
  src/
    config.ts              # TypeScript config interfaces
    version.ts             # Widget version number
    runtime/
      widget.tsx           # Main widget shell (class component)
      query-task.tsx        # Query orchestrator + spatial query handler
      query-task-form.tsx   # Query form UI + suggest integration
      query-result.tsx      # Results display and record management
      query-utils.ts        # SQL Optimizer, field resolution
      selection-utils.ts    # Selection propagation across data sources
      zoom-utils.ts         # Zoom-to-results with SR validation
      graphics-layer-utils.ts  # Map highlight graphics management
      execute-spatial-query.ts # Multi-layer spatial query engine
      suggest-utils.ts      # Typeahead detection, fetch, inject
      useSuggest.ts         # Suggest hook with state machine
      SuggestPopover.tsx    # Suggest dropdown component
      tabs/                 # Tab components (Query, Spatial)
      components/           # Shared UI components (ResultsModeControl)
      managers/             # Manager classes, hooks (buffer preview, etc.)
    setting/
      setting.tsx           # Widget configuration UI
      ds-conflict-guard.tsx # Output DS conflict detection + one-click fix
helper-simple/
  src/
    runtime/widget.tsx      # URL hash monitoring and widget orchestration
feed-simple/
  src/
    runtime/widget.tsx      # Feed consumer, card rendering, map sync
    setting/setting.tsx     # Feed configuration UI
    utils/                  # Feed pipeline, map interaction, layer management
shared-code/
  mapsimple-common/        # Shared components, utilities, debug logger
    token-renderer.ts       # {{field | filter}} substitution engine
    markdown-template-utils.ts  # Markdown to HTML converter, table support
    widget-config-manager.ts    # Singleton config manager
```
