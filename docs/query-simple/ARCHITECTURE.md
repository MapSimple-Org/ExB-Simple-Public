# MapSimple Widget Architecture Guide

This guide documents the architecture, patterns, and conventions for the MapSimple Experience Builder widgets: QuerySimple, HelperSimple, and shared-code.

---

## Compatibility Matrix (ExB 1.19)

| Component | Version |
|-----------|---------|
| Experience Builder | 1.19 |
| ArcGIS Maps SDK for JavaScript | 4.34 |
| React | 19 |
| Node.js | 22 |
| Calcite Design System | 3.3.3 |
| TypeScript | Bundled with ExB |

Official reference: https://developers.arcgis.com/experience-builder/guide/release-versions/

---

## Enterprise Version Mapping

When deploying to ArcGIS Enterprise, the Enterprise version determines the ExB version:

| Enterprise Version | ExB Version | JSAPI Version | React Version |
|-------------------|-------------|---------------|---------------|
| 11.4 | 1.14 | 4.28 | 17 |
| 11.5 | 1.17 | 4.32 | 18 |
| 12.0 | 1.18 | 4.33 | 18 |

Set `exbVersion` in manifest.json to match or be LESS than Enterprise's ExB version. Example: if building with ExB Dev 1.19 but deploying to Enterprise 11.5 (ExB 1.17), set `"exbVersion": "1.17.0"`.

---

## Esri Standards

### 1. Hook and Shell Architecture Pattern

**THE** Esri standard pattern for widget development. All widgets MUST follow this pattern:

- **Setting.tsx (Hook)**: Configuration interface that "hooks into" the config
- **Widget.tsx (Shell)**: Runtime interface that "shells around" execution
- **Complete Separation**: Runtime never modifies config; Setting never handles runtime logic

### 2. Esri JSDoc Documentation Style

**Standard:** Concise, focused on "what" and "why", minimal tags.

**Esri Example:**
```typescript
/**
 * Toggle items in an array
 */
export const toggleItemInArray = (item, items = []) =>
  items.includes(item) ? items.filter(i => i !== item) : [...items, item]
```

**Guidelines:**
- Brief description of function purpose
- `@param` and `@returns` for public APIs only
- NO `@since`, `@example`, `@see` tags
- NO implementation details in comments

### 3. Esri Widget Structure

```
query-simple/
├── config.json
├── icon.svg
├── manifest.json
├── src/
│   ├── config.ts
│   ├── version-manager.ts
│   ├── runtime/
│   │   ├── widget.tsx
│   │   └── [runtime files]
│   └── setting/
│       ├── setting.tsx
│       └── [setting files]
└── tests/
```

---

## Table of Contents

1. [Compatibility Matrix](#compatibility-matrix-exb-119)
2. [Enterprise Version Mapping](#enterprise-version-mapping)
3. [Esri Standards](#esri-standards)
4. [Widget Architecture](#widget-architecture)
5. [Tab Architecture](#tab-architecture)
6. [Handler Extraction Pattern](#handler-extraction-pattern)
7. [Spatial Query Architecture](#spatial-query-architecture)
8. [Typeahead/Suggest Architecture](#typeaheadsuggest-architecture)
9. [Shared Code Pattern](#shared-code-pattern)
10. [Component Libraries](#component-libraries)
11. [Data Sources & Actions](#data-sources--actions)
12. [Widget Communication](#widget-communication)
13. [Best Practices](#best-practices)
14. [Common Patterns](#common-patterns)
15. [Common Errors Quick Reference](#common-errors-quick-reference)
16. [JSAPI Deprecation Notes](#jsapi-deprecation-notes-434)
17. [References](#references)

---

## Project Structure

```
├── query-simple/               # QuerySimple widget
│   ├── manifest.json
│   ├── config.json
│   ├── icon.svg
│   └── src/
│       ├── config.ts
│       ├── version.ts
│       ├── version-manager.ts
│       ├── runtime/
│       │   ├── widget.tsx                      # Main widget shell (class component)
│       │   ├── query-task.tsx                  # Query orchestrator + spatial query handler
│       │   ├── query-task-form.tsx             # Query form UI + suggest integration
│       │   ├── query-task-list.tsx             # Query list management
│       │   ├── query-task-reducer.ts           # useReducer state machine (12 actions)
│       │   ├── query-result.tsx                # Results display + record management
│       │   ├── query-utils.ts                  # SQL Optimizer, field resolution
│       │   ├── selection-utils.ts              # Selection propagation
│       │   ├── zoom-utils.ts                   # Zoom-to-results
│       │   ├── graphics-layer-utils.ts         # Map highlight graphics
│       │   ├── graphics-cleanup-utils.ts       # Graphics cleanup utilities
│       │   ├── graphics-state-manager.ts       # Singleton graphics state
│       │   ├── direct-query.ts                 # JSAPI bypass query + buildRecord()
│       │   ├── results-management-utils.ts     # Merge/remove/dedup utilities
│       │   ├── execute-spatial-query.ts        # Multi-layer spatial query engine
│       │   ├── query-execution-handler.ts      # Extracted query pipeline handler
│       │   ├── query-clear-handler.ts          # Extracted clear/reset handler
│       │   ├── query-submit-handler.ts         # Extracted form submit handler
│       │   ├── record-removal-handler.ts       # Extracted record removal handler
│       │   ├── suggest-utils.ts                # Typeahead detection, fetch, inject
│       │   ├── useSuggest.ts                   # Suggest hook with state machine
│       │   ├── SuggestPopover.tsx              # Suggest dropdown component
│       │   ├── tabs/
│       │   │   ├── QueryTabContent.tsx         # Query tab component
│       │   │   └── SpatialTabContent.tsx       # Spatial tab component
│       │   ├── components/
│       │   │   └── ResultsModeControl.tsx      # Shared New/Add/Remove control
│       │   ├── managers/
│       │   │   ├── map-view-manager.ts         # MapView lifecycle
│       │   │   ├── selection-restoration-manager.ts  # Selection restore after identify
│       │   │   └── use-buffer-preview.ts       # Geodesic buffer preview hook
│       │   └── translations/
│       └── setting/
│           ├── setting.tsx
│           ├── attribute-filter.tsx
│           ├── results.tsx
│           └── translations/
├── helper-simple/              # HelperSimple widget
│   └── [similar structure]
├── shared-code/                # Shared utilities
│   └── mapsimple-common/
│       ├── debug-logger.ts             # Debug logging framework
│       ├── highlight-config-manager.ts # Highlight/draw/buffer color config
│       ├── common-components.tsx
│       ├── data-source-tip.tsx
│       └── utils.tsx
├── docs/
│   ├── ARCHITECTURE.md         # This file
│   ├── process-flows/          # 11 end-to-end flow documents
│   └── releases/               # Release notes
├── CLAUDE.md
├── CHANGELOG.md
└── README.md
```

### Key Files

- **`manifest.json`**: Defines widget metadata, properties, message actions, and data actions
- **`config.ts`**: TypeScript interfaces for widget configuration
- **`widget.tsx`**: Main runtime widget component (class or function component)
- **`setting.tsx`**: Widget configuration UI in builder mode
- **`version.ts`**: Widget version number (BASE_VERSION-rRELEASE_NUMBER.MINOR_VERSION)
- **`version-manager.ts`**: Handles configuration migration between ExB versions

---

## Widget Architecture

### Widget Lifecycle

Experience Builder widgets follow a React component lifecycle with ExB-specific hooks:

1. **Mount**: Widget is added to the page
2. **Config Update**: Widget configuration changes
3. **DataSource Ready**: Data sources become available
4. **Runtime**: Widget renders and handles user interactions
5. **Unmount**: Widget is removed from page

### Widget Component Structure

#### Class Component Pattern (QuerySimple)

```typescript
/** @jsx jsx */
import { React, jsx, css, type AllWidgetProps } from 'jimu-core'
import { Paper, WidgetPlaceholder } from 'jimu-ui'
import { type IMConfig } from '../config'
import { versionManager } from '../version-manager'

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>> {
  static versionManager = versionManager

  componentDidMount() {
    // Initialize widget, set up listeners
  }

  componentDidUpdate(prevProps: AllWidgetProps<IMConfig>) {
    // Handle prop changes
  }

  componentWillUnmount() {
    // Clean up listeners
  }

  render() {
    const { config, id } = this.props
    // Render widget UI
  }
}
```

#### Function Component Pattern

```typescript
/** @jsx jsx */
import { React, jsx, hooks, type AllWidgetProps } from 'jimu-core'
import { type IMConfig } from '../config'

export default function Widget(props: AllWidgetProps<IMConfig>) {
  const { config, id } = props

  React.useEffect(() => {
    // Side effects
    return () => {
      // Cleanup
    }
  }, [config])

  return (
    // Render widget UI
  )
}
```

### Widget Context Pattern

For complex widgets with multiple child components, use React Context:

```typescript
// widget-context.tsx
export const QueryWidgetContext = React.createContext<WidgetContextValue>(null)

// In widget.tsx
<QueryWidgetContext.Provider value={contextValue}>
  {children}
</QueryWidgetContext.Provider>

// In child components
const context = React.useContext(QueryWidgetContext)
```

---

## Tab Architecture

The widget uses a tab-based architecture with the main orchestrator (`query-task.tsx`) delegating UI rendering to extracted tab components:

```
widget.tsx (Shell)
  └── query-task.tsx (Orchestrator)
        ├── QueryTabContent.tsx    # Query form, SQL expression, apply/clear
        ├── SpatialTabContent.tsx  # Spatial query: Operations + Draw modes
        └── query-result.tsx       # Results display (shared by both tabs)
```

### Tab Component Pattern

Each tab is a function component receiving orchestrator state via props:

```typescript
interface QueryTabContentProps {
  // State from orchestrator
  currentItem: QueryItemType
  accumulatedRecords: FeatureDataRecord[]
  resultsMode: string
  // Callbacks to orchestrator
  onFormSubmit: () => void
  onClearResult: () => void
  onResultsModeChange: (mode: string) => void
  // Shared refs
  sqlExprRuntimeContainerRef: React.RefObject<HTMLDivElement>
}
```

### Shared Components

Components used by both tabs are extracted to `components/`:

- **`ResultsModeControl`**: New (blue) / Add (green) / Remove (red) segmented control with data-driven color config map. Used by both `QueryTabContent` and `SpatialTabContent`

### Back-Button Navigation

A `lastQueryOriginTabRef` tracks which tab (`'query'` | `'spatial'`) initiated the current results, so the Results tab back-button returns to the correct originating tab.

---

## Handler Extraction Pattern

Complex functions from the main orchestrator (`query-task.tsx`) have been extracted into focused handler modules. Each handler follows a consistent pattern:

```typescript
// 1. Define a typed context interface
interface QueryExecutionContext {
  widgetId: string
  originDS: FeatureLayerDataSource
  outputDS: DataSource
  mapView: __esri.MapView
  // ... all dependencies explicitly listed
}

// 2. Export a single execute function
export async function executeQueryInternal(ctx: QueryExecutionContext): Promise<void> {
  // Full implementation with access to all context
}

// 3. Original function becomes a thin wrapper
const handleFormSubmitInternal = React.useCallback(async () => {
  const ctx: QueryExecutionContext = {
    widgetId, originDS, outputDS, mapView, // ... build context from component scope
  }
  return executeQueryInternal(ctx)
}, [deps])
```

### Extracted Handlers

| Handler | Lines | Responsibility |
|---------|-------|----------------|
| `query-execution-handler.ts` | 1,044 | Full query pipeline: params, fork, results processing, zoom |
| `query-clear-handler.ts` | 328 | Sovereign Reset: graphics cleanup, DS destruction |
| `query-submit-handler.ts` | 348 | Form submit: DS destroy/recreate, hash wait, retry guard |
| `record-removal-handler.ts` | 567 | X-button removal: composite-key matching, origin DS deselection |
| `query-task-reducer.ts` | 197 | State management: 12 useState → single useReducer |

This pattern keeps the orchestrator thin (~1,620 lines for the original functions → 10-16 line wrappers) while making each handler independently readable and testable.

---

## Spatial Query Architecture

The Spatial tab provides geometry-based querying through two modes:

### Operations Mode

Uses accumulated results from the Query tab as spatial input:

```
Source (from Results) → Buffer → Relationship → Target Layers → Execute
```

### Draw Mode

Direct geometry creation via JimuDraw integration:

```
Draw Tools (7 types) → Geometry Accumulation → Buffer → Relationship → Target → Execute
```

### Execution Pipeline

```
SpatialTabContent.tsx
  │
  ├── useBufferPreview()          # Real-time geodesic buffer on map
  │     ├── Group geometries by type
  │     ├── Union within each group
  │     ├── Buffer each geometry individually
  │     └── Union resulting polygons
  │
  └── onExecute → query-task.tsx handleExecuteSpatialQuery()
        │
        ├── execute-spatial-query.ts  # Multi-layer query
        │     ├── For each target layer:
        │     │   ├── Lazy DataSource creation (group layer children)
        │     │   ├── FeatureLayer.queryFeatures() with spatial filter
        │     │   └── Per-layer error handling
        │     └── Aggregate results across layers
        │
        └── Mode logic (New/Add/Remove)
              ├── Graphics rendering
              ├── State dispatch
              ├── Zoom to results
              └── Auto-tab-switch to Results
```

### Key Design Decisions

- **Client-side buffer geometry**: Buffer polygon sent as `query.geometry` (with `bufferDistance: 0`) instead of server-side `query.distance/units` — ensures spatial relationships evaluate against the actual visible buffer shape
- **Mixed geometry support**: Groups geometries by type before union to prevent `executeMany` crash on mixed point/polyline/polygon inputs
- **Spatial result default template**: Per-layer config flag (`isSpatialResultDefault`) designates one query's rendering settings for spatial results, using shared `combineFields()` for smart outFields
- **Context-aware warnings**: Warns when relationship + geometry combinations will produce misleading results
- **Spatial-only layers**: `spatialOnly` flag on `QueryItemType` allows reference layers (e.g., School Districts, Zoning) to participate in spatial queries without appearing in the Query tab dropdown. Builder settings panel conditionally hides query-specific sections (attribute filter, spatial filter, short ID, group ID, search alias, display order) for spatial-only items

---

## Typeahead/Suggest Architecture

Real-time value suggestions for free-form text inputs, implemented as a companion to SqlExpressionRuntime:

```
sqlExprRuntimeContainerRef (position: relative)
  ├── SqlExpressionRuntime (UNCHANGED — Esri component)
  │     └── input[type=text]  ← useSuggest discovers via MutationObserver
  └── SuggestPopover (position: absolute, below input)
```

### Component Responsibilities

| File | Lines | Responsibility |
|------|-------|----------------|
| `suggest-utils.ts` | ~390 | `detectFreeFormInput()`, `fetchSuggestions()`, `injectValueIntoInput()`, `filterCachedSuggestions()` |
| `useSuggest.ts` | ~540 | Hook with useReducer state machine, debounce, cache, keyboard nav |
| `SuggestPopover.tsx` | 210 | Dropdown UI with prefix highlighting, ARIA listbox pattern |

### Data Flow

```
User types → capture-phase input listener → SET_QUERY action
  → 300ms debounce → filterCachedSuggestions() check:
    → Cache hit? → FETCH_SUCCESS with filtered results (no server call)
    → Cache miss? → fetchSuggestions(limit=50) → FeatureLayer.queryFeatures()
      → Store in suggestCacheRef → FETCH_SUCCESS with results.slice(0, 10)
        → SuggestPopover renders suggestions
          → User selects → injectValueIntoInput() → SqlExpressionRuntime.onChange fires
```

### Client-Side Narrowing Cache (r025.058)

Fetch 50 results from server, display 10. Cache the full server response in a `useRef<SuggestCache>`. On subsequent keystrokes, if the cache is complete (server returned < 50) and the new query extends the cached prefix, filter locally instead of re-querying.

**Safety guarantee**: `filterCachedSuggestions()` returns `null` on any doubt (operator mismatch, backspace, truncated cache, CONTAINS/ENDS_WITH operators). `null` = fall through to existing server query path = zero regression risk.

### Key Design Decisions

- **Capture-phase listeners**: Attach to container ref, intercept events before SqlExpressionRuntime processes them — no modifications to Esri component
- **Multi-clause SQL support**: `detectFreeFormInput()` scans all expression parts, targets the first free-form USER_INPUT clause, extracts fixed clauses as `additionalWhere`
- **Operator-aware LIKE patterns**: Matches the SQL operator from the clause — `contains` → `%VALUE%`, `starts_with` → `VALUE%`, `ends_with` → `%VALUE%`
- **Operator-aware caching**: Only starts-with/is operators narrow monotonically, so CONTAINS/ENDS_WITH always bypass cache
- **Guard suppression**: `isHashInjecting` suppresses during hash parameter injection; `isSelectingRef` suppresses during self-injection

---

## Shared Code Pattern

### Import Pattern

```typescript
import {
  DataSourceTip,
  useDataSourceExists,
  EntityStatusType,
  StatusIndicator,
  createGetI18nMessage,
  toggleItemInArray,
  getFieldInfosInPopupContent
} from 'widgets/shared-code/mapsimple-common'
```

### Adding New Shared Code

1. Add file to `shared-code/mapsimple-common/`
2. Export from `shared-code/mapsimple-common` entry point
3. Import in widgets using the pattern above

### Always Check shared-code First

- **Always check `shared-code/mapsimple-common/` first** before creating new utility functions or components
- **If code is shared or similar across widgets**, place it in `shared-code/mapsimple-common/` rather than duplicating it in each widget
- **If code needs widget-specific tweaks**, refactor to accept parameters or use composition rather than duplicating with small changes
- **When in doubt, share it** - It's easier to extract shared code later than to merge duplicated code

### Shared Components

- **`DataSourceTip`**: Displays data source status and errors
- **`StatusIndicator`**: Animated loading/status indicator

### Shared Utilities

- **`useDataSourceExists`**: React hook to check data source existence
- **`createGetI18nMessage`**: Factory for i18n message functions
- **`toggleItemInArray`**: Array manipulation utility
- **`getFieldInfosInPopupContent`**: Extract field info from popup content

---

## Component Libraries

### Jimu UI Components

Experience Builder provides `jimu-ui` which wraps Calcite Components. Always use `jimu-ui` components, not Calcite directly.

#### Common Components

```typescript
import {
  Button,
  Select,
  Checkbox,
  Tooltip,
  Icon,
  Modal,
  ModalBody,
  ModalFooter,
  PanelHeader,
  Paper,
  WidgetPlaceholder,
  DataActionList
} from 'jimu-ui'
```

#### Advanced Components

```typescript
import type * as jimuMap from 'jimu-ui/advanced/map'
import { SqlExpressionRuntime } from 'jimu-ui/basic/sql-expression-runtime'
```

#### Usage Pattern

```typescript
<Button
  type="primary"
  onClick={handleClick}
  disabled={!isReady}
>
  <Icon icon={someIcon} />
  {getI18nMessage('buttonLabel')}
</Button>
```

### Styling

Use Emotion CSS-in-JS with the `css` template literal:

```typescript
const widgetStyle = css`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  .custom-class {
    padding: 1rem;
    background-color: var(--sys-color-surface-paper);
  }
`

// In render
<div css={widgetStyle} className="custom-class">
  {content}
</div>
```

### Theme Integration

```typescript
import { withTheme, type ThemeProps } from 'jimu-theme'

const Component = withTheme((props: ComponentProps & ThemeProps) => {
  const { theme } = props

  const style = css`
    color: ${theme.ref.palette.neutral[800]};
    background: ${theme.ref.palette.neutral[100]};
  `

  return <div css={style}>Content</div>
})
```

---

## Data Sources & Actions

### Using Data Sources

```typescript
import { hooks, DataSourceManager } from 'jimu-core'

// In component
const dataSource = hooks.useDataSource(config.useDataSources?.[0]?.dataSourceId)
const outputDataSource = hooks.useDataSource(config.outputDataSourceId)

// Check if ready
const isDataSourceReady = dataSource?.isDataSourceSet && dataSource?.isDataViewReady
```

### Data Actions

#### Excluding Framework Actions

In `manifest.json`, use `excludeDataActions` to prevent framework actions from appearing in your widget's `DataActionList`:

```json
{
  "excludeDataActions": [
    "arcgis-map.addToMap",
    "arcgis-map.showOnMap",
    "edit.edit",
    "query-select-loaded",
    "query-clear-selection"
  ]
}
```

#### Creating Custom Data Actions

Custom data actions are created using a **function-based pattern** that returns a `DataAction` object. This pattern allows you to pass widget-specific context (like `widgetId`, `outputDS`, `intl`) to the action.

**Step 1: Create the Action Function**

```typescript
// data-actions/add-to-map-action.tsx
import { type DataRecordSet, type DataAction, DataLevel, type IntlShape, type DataSource } from 'jimu-core'
import { selectRecordsAndPublish } from '../runtime/selection-utils'
import type { FeatureDataRecord } from 'jimu-core'

/**
 * Creates a custom "Add to Map" data action.
 *
 * @param widgetId - The widget ID that provides this action
 * @param outputDS - The output data source (used for selection on the origin layer)
 * @param intl - The Intl object for internationalization
 * @returns A DataAction object that can be used by DataActionList
 */
export function createAddToMapAction(
  widgetId: string,
  outputDS: DataSource,
  intl: IntlShape
): DataAction {
  return {
    id: `${widgetId}-addToMap`,
    name: 'addToMap',
    label: intl.formatMessage({ id: 'addToMap', defaultMessage: 'Add to map' }),
    icon: require('../runtime/assets/icons/show-on-map.svg').default,
    index: -100, // Controls display order (lower = earlier)
    widgetId,
    intl,
    supportProviderWidget: true,

    /**
     * Determines if this action can process the given data sets.
     * Must return a Promise<boolean>.
     */
    isSupported: async (
      dataSets: DataRecordSet[],
      dataLevel: DataLevel,
      actionWidgetId: string
    ): Promise<boolean> => {
      // Only support Records level actions
      if (dataLevel !== DataLevel.Records) {
        return false
      }

      // Need at least one data set with records
      if (!dataSets || dataSets.length === 0) {
        return false
      }

      // Check if we have records and output data source
      const hasRecords = dataSets.some(ds => ds.records && ds.records.length > 0)
      return hasRecords && !!outputDS
    },

    /**
     * Executes the action.
     * Must return a Promise<boolean> indicating success/failure.
     */
    onExecute: async (
      dataSets: DataRecordSet[],
      dataLevel: DataLevel,
      actionWidgetId: string
    ): Promise<boolean> => {
      if (!outputDS || dataLevel !== DataLevel.Records) {
        return false
      }

      // Collect all records from all data sets
      const allRecords: FeatureDataRecord[] = []
      dataSets.forEach(dataSet => {
        if (dataSet.records && dataSet.records.length > 0) {
          const featureRecords = dataSet.records.filter(
            (record): record is FeatureDataRecord => {
              return record && typeof (record as FeatureDataRecord).getGeometry === 'function'
            }
          )
          allRecords.push(...featureRecords)
        }
      })

      if (allRecords.length === 0) {
        return false
      }

      // Get record IDs
      const recordIds = allRecords.map(record => record.getId())

      // Use widget's selection process
      await selectRecordsAndPublish(
        widgetId,
        outputDS,
        recordIds,
        allRecords,
        true // alsoPublishToOutputDS
      )

      return true
    },

    /**
     * Cleanup method (required by DataAction interface)
     */
    destroy: (): void => {
      // No cleanup needed
    }
  }
}
```

**Step 2: Export Actions via `getExtraActions()`**

```typescript
// data-actions/index.tsx
import { type DataAction, type DataSource, type IntlShape } from 'jimu-core'
import { createAddToMapAction } from './add-to-map-action'
import { createZoomToAction } from './zoom-to-action'

/**
 * Returns custom data actions for the widget.
 *
 * @param widgetId - The widget ID
 * @param outputDS - The output data source (null/undefined if not available)
 * @param mapView - The map view (null/undefined if not available)
 * @param intl - The Intl object for internationalization
 * @returns Array of custom DataAction objects (empty if conditions not met)
 */
export function getExtraActions(
  widgetId: string,
  outputDS: DataSource | null | undefined,
  mapView: __esri.MapView | __esri.SceneView | undefined,
  intl: IntlShape
): DataAction[] {
  const actions: DataAction[] = []

  // Add "Zoom To" action if we have mapView and intl
  if (mapView && intl) {
    actions.push(createZoomToAction(widgetId, mapView, intl))
  }

  // Add "Add to Map" action if we have outputDS and intl
  if (outputDS && intl) {
    actions.push(createAddToMapAction(widgetId, outputDS, intl))
  }

  return actions
}
```

**Step 3: Use Actions in Your Component**

```typescript
// runtime/query-result.tsx
import { getExtraActions } from '../data-actions'
import { DataActionList, DataActionListStyle } from 'jimu-ui'

export function QueryTaskResult(props: QueryTaskResultProps) {
  const { widgetId, outputDS, mapView, queryItem } = props
  const intl = hooks.useIntl()

  // Memoize extra actions to prevent unnecessary re-creation
  const extraActions = React.useMemo(() => {
    return getExtraActions(widgetId, outputDS, mapView, intl)
  }, [widgetId, outputDS, mapView, intl])

  // Group records by origin data source for DataActionList
  const actionDataSets: DataRecordSet[] = React.useMemo(() => {
    // ... grouping logic ...
    return groupedDataSets
  }, [records, outputDS])

  return (
    <DataActionList
      widgetId={widgetId}
      dataSets={actionDataSets}
      listStyle={DataActionListStyle.Dropdown}
      buttonSize='sm'
      buttonType='tertiary'
      extraActions={extraActions} // Pass custom actions here
    />
  )
}
```

#### Grouping Records by Origin Data Source

When accumulating records from multiple queries (potentially different origin data sources), `DataActionList` requires records to be grouped by their origin data source. This ensures framework actions (like "Zoom to Feature") recognize the records correctly.

```typescript
// Group records by their origin data source
const actionDataSets: DataRecordSet[] = React.useMemo(() => {
  if (!records || records.length === 0) {
    // Return empty DataRecordSet if no records
    return [{
      dataSource: outputDS,
      type: 'loaded',
      records: [],
      name: outputDS?.id,
      label: outputDS?.getLabel()
    }]
  }

  // Group records by origin data source
  const recordsByOriginDS = new Map<FeatureLayerDataSource, FeatureDataRecord[]>()

  records.forEach(record => {
    const recordDS = (record as FeatureDataRecord).getDataSource?.() as FeatureLayerDataSource
    let originDS: FeatureLayerDataSource | null = null

    if (recordDS) {
      // Get the origin data source (the actual layer, not the output DS)
      originDS = recordDS.getOriginDataSources()?.[0] as FeatureLayerDataSource || recordDS
    } else if (outputDS) {
      // Fallback: use outputDS's origin if record doesn't have dataSource
      originDS = outputDS.getOriginDataSources()?.[0] as FeatureLayerDataSource || outputDS as FeatureLayerDataSource
    }

    if (originDS) {
      if (!recordsByOriginDS.has(originDS)) {
        recordsByOriginDS.set(originDS, [])
      }
      recordsByOriginDS.get(originDS).push(record as FeatureDataRecord)
    }
  })

  // Create a DataRecordSet for each origin data source
  const dataSets: DataRecordSet[] = Array.from(recordsByOriginDS.entries()).map(([originDS, originRecords]) => {
    return {
      dataSource: originDS, // Use origin DS, not outputDS
      type: 'selected',
      records: originRecords,
      name: originDS.id,
      label: originDS.getLabel()
    }
  })

  return dataSets
}, [records, outputDS])
```

**Why This Matters:**
- `DataActionList` validates records against the `dataSource` in each `DataRecordSet`
- Records must match their origin data source for framework actions to work
- Grouping ensures each `DataRecordSet` contains records from a single origin layer

#### Key Points

- **Function-Based Pattern**: Actions are created via functions (not classes) that return `DataAction` objects
- **Context Injection**: Pass widget-specific context (`widgetId`, `outputDS`, `intl`) when creating actions
- **`getExtraActions()`**: Export a function that returns an array of custom actions
- **`extraActions` Prop**: Pass custom actions to `DataActionList` via the `extraActions` prop
- **Memoization**: Use `React.useMemo()` to prevent unnecessary re-creation of action objects
- **Data Level**: Most actions operate at `DataLevel.Records` (individual records), not `DataLevel.DataSource`
- **Grouping**: When records come from multiple origin data sources, group them into separate `DataRecordSet` objects for proper `DataActionList` recognition

---

## Widget Communication

Experience Builder provides multiple ways for widgets to communicate with each other. Communication can be **configurable** (set up in the builder UI) or **programmatic** (implemented in code).

### Configurable Communication Methods

These methods can be configured by users in the Experience Builder builder UI:

#### 1.1 Use the Same Data Source/Data View

When multiple widgets use the same data source or data view, they automatically share:
- **Selection state**: Selecting records in one widget updates selection in all widgets using the same data source
- **Data records**: All widgets receive the same data records
- **Data source status**: All widgets see the same data source status (loading, ready, error, etc.)

**Use Case**: One widget handles selection, another displays details of selected records.

**See**: [Use data source in widget](https://developers.arcgis.com/experience-builder/guide/use-data-source-in-widget/)

#### 1.2 Use the Same Map Widget

When multiple widgets use the same map widget, they share the same `JimuMapView` instance. Widgets can:
- Listen to layer view creation/removal events
- Access the same `MapView` or `SceneView` instance
- Coordinate map interactions (zoom, pan, layer visibility)

**Use Case**: One widget controls map layers, another responds to map extent changes.

**See**: [Use map widget in widget](https://developers.arcgis.com/experience-builder/guide/use-map-widget-in-widget/)

#### 1.3 Use a Widget's Output Data Source

Widgets can use another widget's output data source as their input, creating a data flow pipeline.

**Use Case**: Query widget outputs results -> List widget displays those results -> Chart widget visualizes the data.

**See**: [Widget output data source](https://developers.arcgis.com/experience-builder/guide/widget-output-data-source/)

#### 1.4 Use Message/Actions

Widgets can publish messages that other widgets can listen to and respond to via message actions.

**Declaring Published Messages** (in `manifest.json`):

```json
{
  "publishMessages": [
    {
      "messageType": "DATA_RECORDS_SELECTION_CHANGE",
      "messageCarryData": "OUTPUT_DATA_SOURCE"
    }
  ]
}
```

**Publishing Messages**:

```typescript
import { MessageManager, type Message } from 'jimu-core'

const message: Message = {
  type: 'DATA_RECORDS_SELECTION_CHANGE',
  widgetId: id,
  data: {
    records: selectedRecords,
    dataSourceId: outputDataSourceId
  }
}

MessageManager.getInstance().publishMessage(message)
```

**See**: [Message action](https://developers.arcgis.com/experience-builder/guide/message-action/) for details.

#### 1.5 Use Data Actions

Data actions allow widgets to provide actions that can be executed on data records. These appear in `DataActionList` components.

**See**: [Data action](https://developers.arcgis.com/experience-builder/guide/data-action/) for details. Also see the [Data Actions](#data-actions) section above for custom implementation patterns.

### Programmatic Communication Methods

These methods require code implementation:

#### 2.1 Use Widget State to Share State Between Widgets

Experience Builder uses Redux to manage application state. Widgets can store plain JavaScript objects in a shared `widgetsState` that is accessible by all widgets.

**Storing Widget State**:

```typescript
import { appActions } from 'jimu-core'

/**
 * Store state in the shared widgetsState Redux store.
 *
 * @param widgetId - Your widget ID
 * @param propKey - Property key (supports dot notation like "a.b.c")
 * @param value - The value to store (must be plain JavaScript object, no functions)
 */
this.props.dispatch(appActions.widgetStatePropChange(widgetId, propKey, value))
```

**Example**:

```typescript
// Widget 1: Store state
this.props.dispatch(appActions.widgetStatePropChange("w1", "a.b1", "value1"))
this.props.dispatch(appActions.widgetStatePropChange("w1", "a.b2", "value2"))

// Results in Redux store:
// widgetsState: {
//   w1: {
//     a: {
//       b1: 'value1',
//       b2: 'value2'
//     }
//   }
// }
```

**Accessing Widget State** (in another widget):

```typescript
import { hooks } from 'jimu-core'

// Using useSelect hook
const widgetState = hooks.useSelect((state: IMState) => state.widgetsState?.[widgetId])

// Or using mapExtraStateProps in class components
mapExtraStateProps = (state: IMState) => {
  return {
    widgetState: state.widgetsState?.[widgetId]
  }
}
```

**Storing Complex Objects** (with functions or class instances):

For complex objects that can't be serialized (e.g., functions, class instances), use `widgetMutableStatePropChange`:

```typescript
import { appActions, MutableStoreManager } from 'jimu-core'

// Store mutable state
this.props.dispatch(appActions.widgetMutableStatePropChange(widgetId, propKey, value))

// Access mutable state
const value = MutableStoreManager.getInstance().getStateValue(widgetId, propKey)
```

**Limitations**:
- `widgetsState` can only store plain JavaScript objects (no functions, no class instances)
- Use `widgetMutableStatePropChange` for complex objects
- State is shared across all widgets, so use unique keys to avoid conflicts

**See**: [Widget communication](https://developers.arcgis.com/experience-builder/guide/widget-communication/) for official documentation.

#### 2.2 Provide Your Own Redux Store/Action/Reducer

For advanced state management needs, widgets can provide custom Redux extensions that integrate with Experience Builder's Redux store.

**Step 1: Create Extension Class**:

```typescript
// extensions/my-store.ts
import { extensionSpec } from 'jimu-core'

export default class MyReduxStoreExtension implements extensionSpec.ReduxStoreExtension {
  getActions() {
    // Return your Redux actions
    return {
      myAction: (payload: any) => ({
        type: 'MY_ACTION',
        payload
      })
    }
  }

  getInitLocalState() {
    // Return initial state
    return {
      myData: null
    }
  }

  getReducer() {
    // Return Redux reducer
    return (state: any, action: any) => {
      switch (action.type) {
        case 'MY_ACTION':
          return { ...state, myData: action.payload }
        default:
          return state
      }
    }
  }

  getStoreKey() {
    // Return unique key for this store
    return 'myWidgetStore'
  }
}
```

**Step 2: Declare Extension in `manifest.json`**:

```json
{
  "extensions": [
    {
      "name": "My Store",
      "point": "REDUX_STORE",
      "uri": "extensions/my-store"
    }
  ]
}
```

**Use Case**: Complex state management that requires custom Redux actions and reducers beyond simple key-value storage.

**See**: [Widget communication](https://developers.arcgis.com/experience-builder/guide/widget-communication/) for official documentation.

### Custom Events Pattern (Alternative Approach)

In addition to framework-provided communication methods, widgets can use browser `CustomEvent` API for direct widget-to-widget communication:

```typescript
// Widget 1: Dispatch custom event
const event = new CustomEvent('my-widget-event', {
  detail: { data: 'value' },
  bubbles: true,
  cancelable: true
})
window.dispatchEvent(event)

// Widget 2: Listen for custom event
window.addEventListener('my-widget-event', (event: CustomEvent) => {
  const data = event.detail.data
  // Handle event
})
```

**Use Case**: When widgets need to communicate but don't share data sources or maps, and message/action system is too heavy.

**Note**: Custom events are not managed by Experience Builder's framework, so they won't appear in the builder UI. Use this pattern for programmatic communication only.

---

## Best Practices

### 1. Type Safety

- Always use TypeScript interfaces from `config.ts`
- Use `ImmutableObject` and `ImmutableArray` for config props
- Leverage ExB type definitions from `jimu-core`

### 2. Internationalization (i18n)

```typescript
// translations/default.ts
export default {
  'queryLabel': 'Query',
  'applyLabel': 'Apply'
}

// In component
import defaultMessages from './translations/default'
const getI18nMessage = hooks.useIntl().formatMessage

<Button>{getI18nMessage('applyLabel')}</Button>
```

### 3. Version Management

#### Version Number Format

Widget versions follow the format: `{BASE_VERSION}-r{RELEASE_NUMBER}` or `{BASE_VERSION}-r{RELEASE_NUMBER}.{MINOR_VERSION}`

- **Base Version**: Matches Experience Builder version (e.g., `1.19.0`) for compatibility
- **Release Number**: Increments on major changes (e.g., `001`, `002`, `003`) for browser cache busting
- **Minor Version**: Increments on smaller fixes between major releases (e.g., `r017.1`, `r017.2`)

Examples:
- `1.19.0-r017` - Major release 017
- `1.19.0-r017.1` - Minor fix 1 for release 017
- `1.19.0-r018` - Next major release (minor resets)

#### Version File Structure

```typescript
// query-simple/src/version.ts
/**
 * Widget version number.
 * Base version matches Experience Builder version (1.19.0).
 * Release number increments on major changes (001, 002, 003, ...).
 * Minor version increments on smaller fixes between major releases (r015.1, r015.2, ...).
 *
 * To increment:
 * - Major change: Update RELEASE_NUMBER (e.g., 015 -> 016) and reset MINOR_VERSION to 0
 * - Minor fix: Increment MINOR_VERSION (e.g., 1 -> 2) while keeping same RELEASE_NUMBER
 */
const BASE_VERSION = '1.19.0'
const RELEASE_NUMBER = '015' // Increment on major changes (001, 002, 003, ...)
const MINOR_VERSION = '1' // Increment on minor fixes between major releases (1, 2, 3, ...)

export const WIDGET_VERSION = MINOR_VERSION && MINOR_VERSION !== '0'
  ? `${BASE_VERSION}-r${RELEASE_NUMBER}.${MINOR_VERSION}`
  : `${BASE_VERSION}-r${RELEASE_NUMBER}`
```

#### Version Manager for Config Migration

Always include version manager for config migration:

```typescript
// version-manager.ts
import { BaseVersionManager } from 'jimu-core'

export class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.19.0',
    description: 'Initial version',
    upgrader: (oldConfig) => {
      // Migration logic
      return oldConfig
    }
  }]
}

export const versionManager = new VersionManager()
```

**Note**: The version manager uses the base version (`1.19.0`), not the release number. Release numbers are for display and cache busting only.

### 4. Performance

- Use `React.PureComponent` or `React.memo()` for expensive components
- Lazy load heavy modules with `moduleLoader.loadModule()`
- Use `hooks.useMemo()` and `hooks.useCallback()` appropriately

### 5. Error Handling

```typescript
const [error, setError] = React.useState<string>(null)

try {
  await performOperation()
} catch (err) {
  setError(err.message)
}

{error && <DataSourceTip error={error} />}
```

### 6. Debug Logging

**Rule: Always use `debugLogger`, never use `console.log()` directly.**

All console logging must be gated behind the debug logger. Never use `console.log()`, `console.error()`, or `console.warn()` directly -- always use the shared debug logger instead.

#### Debug Logger Pattern

```typescript
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createQuerySimpleDebugLogger()

// For feature-specific logs
debugLogger.log('HASH', {
  event: 'hash-detected',
  shortId: 'pin',
  value: '123456'
})

// For error logging (automatically respects debug gates)
debugLogger.log('RESULTS-MODE', {
  event: 'error-occurred',
  error: error.message,
  errorStack: error.stack
})
```

**Usage:**
- **Always import `createQuerySimpleDebugLogger` from `widgets/shared-code/mapsimple-common`**
- **Create a logger instance** using `const debugLogger = createQuerySimpleDebugLogger()` at the top of your file
- **Use `debugLogger.log(feature, data)` for ALL logging** -- this automatically respects debug gates

#### Available Debug Features

**Always-On (no `?debug=` needed):**
- `BUG` - Known bug warnings (`[QUERYSIMPLE ⚠️ BUG]`) — always visible in console

**URL-Activated (`?debug=FEATURE`):**
- `HASH` - Hash parameter processing
- `HASH-EXEC` - Hash query execution
- `HASH-FIRST-LOAD` - First load hash handling
- `FORM` - Query form interactions
- `TASK` - Query task management
- `ZOOM` - Zoom behavior
- `MAP-EXTENT` - Map extent changes
- `DATA-ACTION` - Data action execution
- `GROUP` - Query grouping and dropdown
- `SELECTION` - Record selection management
- `SELECTION-STATE-AUDIT` - Detailed selection state auditing
- `WIDGET-STATE` - Widget lifecycle and state changes
- `RESTORE` - Selection restoration
- `RESULTS-MODE` - Results mode (NEW/ADD/REMOVE) switching
- `EXPAND-COLLAPSE` - Widget expand/collapse behavior
- `GRAPHICS-LAYER` - Graphics layer management
- `EVENTS` - Event dispatching and handling
- `POPUP` - Map popup interactions
- `QUERY-PATH` - Which query path is taken (DIRECT via buildRecord vs EXB legacy via outputDS.load)
- `DIRECT-QUERY` - Direct FeatureLayer.queryFeatures() bypass execution details (timing, record counts, field selection)
- `SPATIAL` - Spatial tab query execution (target layers, buffer, results)
- `CSV` - CSV export field schema and alias inspection
- `VIEW-TABLE` - View in Table display fields inspection
- `SUGGEST` - Typeahead/suggest feature (detection, fetch queries, inject)

#### Control via URL

- **No `debug` parameter** - All debug logging DISABLED (default for production)
- `?debug=all` - Enable all debug logs
- `?debug=HASH,FORM` - Enable specific features
- `?debug=false` - Explicitly disable all logging (same as no parameter)

#### Adding New Debug Features

When adding new debug features, follow these steps:

**Step 1: Register the Debug Tag**

Open `shared-code/mapsimple-common/debug-logger.ts` and add your new feature name to the `features` array in the appropriate widget's logger factory:

```typescript
export function createQuerySimpleDebugLogger() {
  return new DebugLogger({
    widgetName: 'QUERYSIMPLE',
    features: [
      'HASH', 'TASK', 'RESULTS-MODE', // ... existing features
      'YOUR-NEW-FEATURE', // Add here
    ]
  })
}
```

**Important**: Without registering the tag, `debugLogger.log('YOUR-NEW-FEATURE', ...)` calls will be silently ignored!

**Step 2: Use the Debug Tag in Code**

```typescript
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createQuerySimpleDebugLogger()

debugLogger.log('YOUR-NEW-FEATURE', {
  event: 'something-happened',
  data: someData,
  timestamp: Date.now()
})
```

**Step 3: Test with URL Parameter**

Navigate to: `?debug=YOUR-NEW-FEATURE` to see logs in console.

---

## Common Patterns

### The "Persistence Trap"

When switching between queries (e.g., via hash params), React may re-use component instances. This causes local state (like `useState`) to persist from the *previous* query into the *new* one.

**Solution**: Always use a unique React `key` (e.g., `key={configId}`) or a `useEffect` keyed to the `configId` to manually flush and reset state during transitions.

### SARGable SQL Queries

Esri's default `LOWER(FIELD) = 'value'` generates non-SARGable SQL, which kills database performance on large datasets.

**Solution**: Normalize the search input to uppercase in code and rewrite the SQL to `FIELD = 'UPPER_VALUE'`. This preserves the database's ability to use its attribute indexes.

### URL Parameters & Deep Linking

The MapSimple widgets support advanced automation via URL parameters. Both **Hash fragments (`#`)** and **Query strings (`?`)** are supported across all features.

#### Automation Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `shortId=value` | Logic | Automatically opens the widget, selects the matching query, populates the input, and executes the search. Examples: `pin`, `major`, `owner`, `trail`. (e.g., `#pin=123` or `?major=456`) |
| `qsopen=true` | Control | Forces the QuerySimple widget to open even if no search parameters are present. |
| `debug=all` | Debug | Enables all diagnostic logging features in the browser console. |
| `debug=FEATURE` | Debug | Enables specific logging (e.g., `debug=HASH,TASK,ZOOM`). |

#### Format Comparison: `#` (Hash) vs. `?` (Query String)

| Feature | Hash Fragment (`#`) | Query String (`?`) |
| :--- | :--- | :--- |
| **Server Visibility** | Client-side only. Never sent to the server. | Sent to the server with every request. |
| **Page Reloads** | Changing a hash NEVER triggers a page reload. | Changing a query string MAY trigger a full page refresh. |
| **ExB Compatibility** | **Recommended.** ExB is a Single Page App; hashes are the native way to manage state. | Supported, but can occasionally conflict with server-side redirects or proxies. |
| **Browser History** | Standard behavior; creates a new history entry. | Standard behavior; creates a new history entry. |
| **Deep Link Safety** | Safest for interactive tools. URL stays clean after "Consumption." | Standard for "Static" links (e.g., a link from an email). |

**Recommendation**: Use **Hash (`#`)** for interactive automation where you want the fastest UI response without any server-side overhead. Use **Query String (`?`)** if your application is being linked to from a system that only supports standard URL parameters.

#### Deep Link Consumption Pattern

To prevent "initialization loops" and ensure a clean UX during multi-step workflows:
1. **One-Time Trigger**: When a `shortId` is detected, it is consumed (selected and executed once).
2. **State Shift**: If the user interactively changes the "Results Management Mode" (to Add or Remove), the widget strips the hash parameter from the URL. This prevents the page from resetting your accumulated results if you refresh or trigger a re-render.
3. **Dirty Hash Protection**: When switching from one parameter to another (e.g., `#pin=1` to `#pin=2`), the widget uses a unique React `key` strategy to force-flush all internal state.

```typescript
// Example of consumption from widget.tsx
private handleResultsModeChange = (mode: SelectionType) => {
  // Clear hash when switching to accumulation modes to 'consume' the deep link
  if (mode === SelectionType.AddToSelection || mode === SelectionType.RemoveFromSelection) {
    this.removeHashParameter(this.state.initialQueryValue?.shortId)
  }
  // ... update state ...
}
```

### Selection Management

Selection should always be handled via the centralized utilities in `selection-utils.ts` to ensure that both the Map's native highlight (blue boxes) and custom Graphics Layer highlights stay in sync.

```typescript
// selection-utils.ts
import { selectRecordsAndPublish, clearSelectionInDataSources } from './selection-utils'

// 1. Selecting records (Standard Pattern)
await selectRecordsAndPublish(
  widgetId,
  outputDS,
  recordIds,
  records,
  alsoPublishToOutputDS, // false
  useGraphicsLayer,      // true
  graphicsLayer,
  mapView
)

// 2. Clearing selection
await clearSelectionInDataSources(
  widgetId,
  outputDS,
  useGraphicsLayer,      // true
  graphicsLayer
)
```

### Zoom to Records

Zoom functionality is centralized in `zoom-utils.ts`. The map zooms to an extent expanded by a factor in map coordinates (default 1.2 = 20% larger), then `mapView.goTo(extent)` is called with no padding. This is consistent across viewport size and zoom level.

**Shared Utility Function:**

```typescript
// zoom-utils.ts
import { zoomToRecords } from './zoom-utils'

// Default: 1.2 = 20% expansion
await zoomToRecords(mapView, records)

// Custom expansion factor (e.g. 30% expansion)
await zoomToRecords(mapView, records, { expansionFactor: 1.3 })
```

**React Hook Pattern:**

```typescript
// managers/use-zoom-to-records.ts
import { useZoomToRecords } from './managers/use-zoom-to-records'

export function MyComponent({ mapView, records }) {
  const zoomToRecords = useZoomToRecords(mapView)

  const handleClick = () => {
    zoomToRecords(records, { expansionFactor: 1.2 }).catch(error => {
      // Handle errors
    })
  }
}
```

**Data Action Pattern:**

```typescript
// data-actions/zoom-to-action.tsx
import { zoomToRecords } from '../runtime/zoom-utils'

export function createZoomToAction(widgetId, mapView, intl): DataAction {
  return {
    // ... action config ...
    onExecute: async (dataSets, dataLevel, actionWidgetId) => {
      const records = extractRecordsFromDataSets(dataSets)
      await zoomToRecords(mapView, records)
      return true
    }
  }
}
```

**Key Points:**
- **Single Source of Truth**: All zoom logic lives in `zoom-utils.ts`
- **Extent Expansion**: Default `expansionFactor` 1.2 expands extent by 20% in map coordinates; no pixel padding
- **Reusable**: Pure function can be used in hooks, data actions, or direct calls
- **Error Handling**: Utility logs errors via `debugLogger` and throws for caller handling

### Query Execution Pattern

```typescript
const executeQuery = async (
  sqlExpr: IMSqlExpression,
  spatialFilter: SpatialFilterObj
) => {
  if (!dataSource?.isDataSourceSet) return

  setLoading(true)
  setError(null)

  try {
    const queryParams: SqlQueryParams = {
      where: sqlExpr.sql,
      geometry: spatialFilter.geometry,
      spatialRelationship: spatialFilter.relation
    }

    const result = await dataSource.query(queryParams)
    setRecords(result.records)
    setOutputDataSource(result.outputDataSource)
  } catch (err) {
    setError(err.message)
  } finally {
    setLoading(false)
  }
}
```

---

## Common Errors Quick Reference

| Error | Cause | Fix |
|-------|-------|-----|
| `can't access property "default", t is null` | Importing hooks from `'react'` directly | Use `const { useState } = React` from jimu-core |
| `Unknown dependency: jimu-core` | jimu-core listed in manifest dependency array | Remove it - only `jimu-arcgis` belongs there |
| `Module not found: jimu-core/react` | Trying to import from `jimu-core/react` | Import from `jimu-core` only |
| Widget not in builder panel | Manifest error or client not restarted | Check manifest.json syntax, restart client |
| Settings panel doesn't show | Over-specified manifest properties | Use `"properties": {}` (empty), let ExB auto-detect |
| Map doesn't connect | Missing jimu-arcgis dependency | Add `"dependency": ["jimu-arcgis"]` to manifest |
| TypeScript errors on jimu imports | Extension not in tsconfig | Add folder to `client/tsconfig.json` include array |
| `__set_webpack_public_path__ is null` | Trying to build outside ExB | Always use ExB Dev Edition build system |
| 404 widget not found (Enterprise) | Widget hosted on server Portal can't reach | Host on HTTPS server with CORS enabled |

---

## JSAPI Deprecation Notes (4.34)

When using ArcGIS Maps SDK for JavaScript 4.34 (bundled with ExB 1.19), be aware of deprecated or removed APIs.

### QueryTask Removed (4.24+)

`QueryTask` was removed in JSAPI 4.24. Use REST helper functions instead:

```typescript
// OLD (removed in 4.24)
import QueryTask from 'esri/tasks/QueryTask'
import Query from 'esri/tasks/support/Query'
const task = new QueryTask({ url })
const results = await task.execute(query)

// NEW (4.24+)
import { executeQueryJSON } from 'esri/rest/query'
import Query from 'esri/rest/support/Query'
const query = new Query({ outFields: ['*'], returnGeometry: true })
const results = await executeQueryJSON(url, query)
```

### Available REST Helpers (esri/rest/query)

| REST Helper | Replaces | Returns |
|-------------|----------|---------|
| `executeQueryJSON` | `QueryTask.execute` | `FeatureSet` |
| `executeForCount` | `QueryTask.executeForCount` | `number` |
| `executeForExtent` | `QueryTask.executeForExtent` | `Extent` |
| `executeRelationshipQueryJSON` | `RelationshipQueryTask.execute` | `RelatedFeatureSet` |

### Other Deprecations to Watch

- Always check the [JSAPI Release Notes](https://developers.arcgis.com/javascript/latest/release-notes/) when using JSAPI classes
- If porting code from older ExB versions or WAB, verify all JSAPI imports still exist

---

## References

### Official Documentation

- [Getting Started with Widget Development](https://developers.arcgis.com/experience-builder/guide/getting-started-widget/)
- [Widget Manifest](https://developers.arcgis.com/experience-builder/guide/widget-manifest/)
- [Extend Base Widget](https://developers.arcgis.com/experience-builder/guide/extend-base-widget/)
- [Widget UI](https://developers.arcgis.com/experience-builder/guide/widget-ui/)
- [Use Data Source in Widget](https://developers.arcgis.com/experience-builder/guide/use-data-source-in-widget/)
- [Widget Communication](https://developers.arcgis.com/experience-builder/guide/widget-communication/)
- [Make Widgets Backward Compatible](https://developers.arcgis.com/experience-builder/guide/make-widgets-backward-compatible/)
- [Debugging Widget Development](https://developers.arcgis.com/experience-builder/guide/debugging-widget-development/)
- [Third-Party Libraries](https://developers.arcgis.com/experience-builder/guide/third-party-libraries/)
- [Unit Testing](https://developers.arcgis.com/experience-builder/guide/unit-testing/)
- [Use Assets](https://developers.arcgis.com/experience-builder/guide/use-assets/)
- [Code Linting](https://developers.arcgis.com/experience-builder/guide/linting/)
- [Override Webpack Config](https://developers.arcgis.com/experience-builder/guide/override-webpack-config/)
- [Copy Files to Dist Folder](https://developers.arcgis.com/experience-builder/guide/copy-files-to-dist-folder/)
- [Share Code Between Widgets](https://developers.arcgis.com/experience-builder/guide/share-code-between-widgets/)
- [Add Help to Your Widget](https://developers.arcgis.com/experience-builder/guide/add-help-to-your-widget/)
- [Upgrade to New Theme](https://developers.arcgis.com/experience-builder/guide/upgrade-to-new-theme/)

### Deployment & Distribution

- [Add Experience Builder Custom Widgets In ArcGIS Enterprise](https://www.esri.com/arcgis-blog/products/arcgis-enterprise/developers/add-experience-builder-custom-widgets-in-arcgis-enterprise) - Step-by-step guide for hosting and registering custom widgets in ArcGIS Enterprise (11.0+).

### Key Concepts

- **Jimu**: Experience Builder's JavaScript framework
- **Data Sources**: Abstraction layer for accessing feature layers, maps, etc.
- **Message System**: Pub/sub pattern for widget communication
- **Immutable Config**: Widget configs are immutable objects
- **Version Manager**: Handles config migration between ExB versions

---

*Maintained by MapSimple Organization*
