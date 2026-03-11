# Claude Code Instructions for MapSimple ExB Widgets

## Project Context

This project contains three custom ArcGIS Experience Builder (ExB) widgets:

- **query-simple/** - Search and query widget with multi-mode results (New, Add, Remove), map highlighting, and deep linking via URL hash parameters
- **helper-simple/** - URL monitoring orchestrator that detects hash parameters and coordinates widget opening/query execution
- **shared-code/** - Common utilities, components, and debug logging shared between widgets

**Stack:** Experience Builder 1.19, ArcGIS Maps SDK for JavaScript 4.34, React 19, TypeScript

## Key Documentation

Read these files for context before making changes:

1. **Architecture Guide**: `docs/ARCHITECTURE.md`
   - Compatibility matrix (ExB 1.19, JSAPI 4.34, React 19)
   - Widget architecture patterns (Hook & Shell, lifecycle, component hierarchy)
   - Tab architecture (Query tab, Spatial tab, shared components)
   - Handler extraction pattern (typed context interfaces)
   - Spatial query architecture (Operations + Draw modes, buffer preview, multi-layer execution)
   - Typeahead/suggest architecture (companion hook pattern, capture-phase listeners)
   - Shared code patterns and import conventions
   - Component libraries (jimu-ui, Emotion CSS-in-JS styling)
   - Data sources, custom data actions, and record grouping
   - Common errors and JSAPI deprecation notes

2. **Process Flows**: `docs/process-flows/README.md`
   - 11 end-to-end flow documents describing how the widgets work
   - Initialization, query execution, results accumulation, zoom, selection, URL hash, settings, data sources, buffer preview, spatial query execution, spatial draw mode
   - When changing code that affects a documented flow, update the corresponding FLOW-XX document

3. **Project Rules**: `.cursor/rules/`
   - Architecture patterns, technical standards, governance

4. **Changelog**: `CHANGELOG.md`
   - Detailed version history

## Technical Rules

- **React imports**: Import React from `jimu-core`, never from `'react'` directly
- **Logging**: Never use `console.log()`. Use `debugLogger` from `widgets/shared-code/mapsimple-common`
- **Versioning**: Increment `MINOR_VERSION` in `version.ts` for every code change
- **Architecture**: Follow Esri's Hook & Shell pattern (Setting.tsx = config, Widget.tsx = runtime)
- **Shared code first**: Check `shared-code/` before creating new utility functions. If code is used by multiple widgets, it belongs in shared-code
- **Process flows**: When modifying code that affects a documented flow, update the corresponding `docs/process-flows/FLOW-XX.md`. When adding a feature with a distinct new flow, create a new FLOW-XX doc

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
helper-simple/
  src/
    runtime/widget.tsx      # URL hash monitoring and widget orchestration
shared-code/
  mapsimple-common/        # Shared components, utilities, debug logger
```
