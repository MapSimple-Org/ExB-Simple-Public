# MapSimple Widget Development Guide

## Overview

This guide documents the architecture, best practices, and development patterns for the MapSimple organization's Experience Builder widgets: **QuerySimple** and **HelperSimple**.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Widget Architecture](#widget-architecture)
3. [Shared Code Pattern](#shared-code-pattern)
4. [Component Libraries](#component-libraries)
5. [Data Sources & Actions](#data-sources--actions)
6. [Widget Communication](#widget-communication)
7. [Testing Strategy](#testing-strategy)
8. [Best Practices](#best-practices)
9. [Common Patterns](#common-patterns)
10. [References](#references)
11. [Test-Driven Development (TDD) Workflow](#test-driven-development-tdd-workflow)

---

## ⚠️ Development Environment Safety

### 1. Protecting Local Configuration
ArcGIS Experience Builder stores critical app configurations and portal login information outside of the `client/` source tree. These files are often untracked or ignored by Git:
*   **App Config**: `server/public/apps/0/config.json`
*   **App Info**: `server/public/apps/0/info.json`
*   **Login Info**: `server/public/signin-info.json`

**MANDATORY RULE**: Never run destructive Git commands like `git reset --hard` or `git clean -fd` without verifying the state of these files. They represent your active "MapSimple Portal" environment. If they are lost, you lose your connected layers and search configurations.

### 2. The "Scalpel" Rule (Surgeon vs. Construction Worker)
Always use the smallest possible tool for the job. Avoid "Hammer" commands that destroy global state to fix a local issue.
*   **BAD**: Using `rm -rf` on a directory to clear experimental files.
*   **GOOD**: Surgically deleting only the specific files you created. 
*   **BAD**: Using `git reset --hard` to undo a few lines of code.
*   **GOOD**: Using `git checkout path/to/file` or `git stash` to revert specific changes.

### 3. Surgical Progress (Incremental Excellence)
Never build a "giant piece of crap" that won't stand the test of time. Complexity is the enemy of stability.
*   **Small Steps**: Break every feature into the smallest possible functional units.
*   **Test-Driven Development (TDD)**: Whenever possible, write your tests *before* you implement the feature or fix. This defines the "Win Condition" upfront and prevents scope creep.
*   **Solid & Understood**: Never commit code you don't fully understand. If a logic change feels like a guess, it is.
*   **Well Documented**: Update the `CHANGELOG.md`, `CURRENT_WORK.md`, and relevant `.md` files after every significant step.
*   **Well Tested**: Every small step must be verified—either via unit tests, the "Mega-Journey" E2E suite, or manual verification—before moving to the next.
*   **Parity First**: Focus on replicating WAB functionality reliably before adding "shiny" new features that might introduce instability.

### 4. The "Save Game" Milestone (Checkpointing)
Before starting a high-risk structural refactor (e.g., Class-to-Hooks migration):
1.  **Verify Stability**: Ensure the current build is functional and passing E2E tests.
2.  **Commit Baseline**: Commit all active changes with a descriptive baseline message (e.g., `Baseline: Stable r017.41 before Hooks refactor`).
3.  **Push to GitHub**: Immediately push the commit to the remote repository. This creates an immutable "Save Game" that survives local filesystem errors.

### 5. Branching Strategy (CRITICAL - NEVER DEVELOP ON DEVELOP)

**MANDATORY RULE**: **NEVER develop features directly on `develop` branch. `develop` is for stable releases ONLY.**

#### Branch Purposes

- **`develop`**: 
  - **ONLY** contains stable, tested, production-ready code
  - **ONLY** receives merges from feature branches after complete testing
  - **NEVER** receives direct commits for feature development
  - Current stable version: r017.x (e.g., r017.60)

- **`feature/*` branches** (e.g., `feature/chunk-rock`):
  - **ALL** feature development happens here
  - **ALL** experimental work, migrations, and new functionality
  - Version increments (e.g., r018.x) happen on feature branches
  - Only merged to `develop` when feature is complete and stable

#### Workflow Rules

1. **Always create/use a feature branch for development:**
   ```bash
   git checkout -b feature/my-feature-name
   # OR switch to existing feature branch
   git checkout feature/chunk-rock
   ```

2. **Never commit directly to `develop`:**
   - If you find yourself on `develop`, immediately switch to a feature branch
   - If you accidentally commit to `develop`, move commits to feature branch immediately

3. **Before pushing, verify your branch:**
   ```bash
   git branch --show-current  # Should show feature/*, NOT develop
   ```

4. **When feature is complete:**
   - Test thoroughly on feature branch
   - Merge feature branch into `develop` (via PR or direct merge)
   - Tag stable release on `develop`

#### Version Numbering

- **r017.x**: Stable releases on `develop` branch
- **r018.x+**: Development versions on feature branches (e.g., `feature/chunk-rock`)

**Remember**: If you're writing code, you should be on a feature branch. `develop` is read-only for active development.

---

## Project Structure

### Directory Layout

```
client/your-extensions/
├── manifest.json                    # Extension repo manifest
├── widgets/
│   ├── README.md                    # Widget overview and features
│   ├── TODO.md                      # Pending tasks and improvements
│   ├── DEVELOPMENT_GUIDE.md         # This file
│   ├── PRESENTATION_SUMMARY.md      # Features summary for presentations
│   ├── CURRENT_WORK.md              # Active status and hard-won lessons
│   ├── query-simple/               # QuerySimple widget
│   │   ├── manifest.json           # Widget manifest (name, version, properties)
│   │   ├── config.json             # Default widget configuration
│   │   ├── icon.svg                # Widget icon
│   │   └── src/
│   │       ├── config.ts           # TypeScript config interfaces
│   │       ├── version-manager.ts  # Version migration logic
│   │       ├── default-query-item.ts # Default query item template
│   │       ├── actions/            # Message actions
│   │       ├── common/             # Widget-specific common code
│   │       ├── data-actions/        # Custom data actions
│   │       ├── runtime/            # Runtime widget code
│   │       │   ├── widget.tsx      # Main widget component (Class)
│   │       │   ├── widget-context.tsx # React context for widget state
│   │       │   ├── widget-config.ts   # Runtime configuration helpers
│   │       │   ├── translations/   # i18n translation files
│   │       │   └── assets/         # Widget assets (icons, etc.)
│   │       └── setting/            # Setting page UI
│   │           ├── setting.tsx    # Main setting component
│   │           ├── setting-config.ts # Setting configuration types
│   │           └── translations/   # Setting page translations
│   ├── helper-simple/              # HelperSimple widget
│   │   └── [similar structure]
│   └── shared-code/                # Shared code between widgets (CRITICAL)
│       └── common/
│           ├── common-components.tsx # Shared React components
│           ├── data-source-tip.tsx  # Data source status component
│           ├── use-ds-exists.tsx    # Data source existence hook
│           └── utils.tsx            # Shared utility functions
│           └── debug-logger.ts      # Centralized logging logic
└── themes/                         # Custom themes (if any)
```

### Key Files

- **`manifest.json`**: Defines widget metadata, properties, message actions, and data actions
- **`config.ts`**: TypeScript interfaces for widget configuration
- **`widget.tsx`**: Main runtime widget component (class or function component)
- **`setting.tsx`**: Widget configuration UI in builder mode
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

#### Function Component Pattern (Alternative)

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

## Shared Code Pattern

### Location

Shared code lives in `widgets/shared-code/common/` and is exported via `shared-code/common.ts`.

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
} from 'widgets/shared-code/common'
```

### Adding New Shared Code

1. Add file to `shared-code/common/`
2. Export from `shared-code/common.ts`
3. Import in widgets using the pattern above

**CRITICAL: Do Not Duplicate Code**

- **Always check `shared-code/common/` first** before creating new utility functions or components
- **If code is shared or similar across widgets**, place it in `shared-code/common/` rather than duplicating it in each widget
- **If code needs widget-specific tweaks**, refactor to accept parameters or use composition rather than duplicating with small changes
- **When in doubt, share it** - It's easier to extract shared code later than to merge duplicated code

Example: If both QuerySimple and HelperSimple need similar logging functionality, create `shared-code/common/debug-logger.ts` and import it in both widgets, rather than creating separate debug loggers with slight variations.

### Shared Components

- **`DataSourceTip`**: Displays data source status and errors
- **`StatusIndicator`**: Animated loading/status indicator
- **`DialogPanel`**: Reusable modal/dialog component
- **`StateHolder`**: Component for managing common state

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
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'
import type { FeatureDataRecord } from 'jimu-core'

const debugLogger = createQuerySimpleDebugLogger()

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
 * @param queryItem - Optional query item configuration
 * @param runtimeZoomToSelected - Optional runtime zoom override from the query form
 * @returns Array of custom DataAction objects (empty if conditions not met)
 */
export function getExtraActions(
  widgetId: string,
  outputDS: DataSource | null | undefined,
  mapView: __esri.MapView | __esri.SceneView | undefined,
  intl: IntlShape,
  queryItem?: QueryItemType,
  runtimeZoomToSelected?: boolean
): DataAction[] {
  const actions: DataAction[] = []
  
  // Add "Zoom To" action if we have mapView and intl
  if (mapView && intl) {
    actions.push(createZoomToAction(widgetId, mapView, intl))
  }
  
  // Add "Add to Map" action if we have outputDS and intl
  if (outputDS && intl) {
    actions.push(createAddToMapAction(widgetId, outputDS, intl, queryItem, runtimeZoomToSelected))
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
  const { widgetId, outputDS, mapView, queryItem, runtimeZoomToSelected } = props
  const intl = hooks.useIntl()
  
  // Memoize extra actions to prevent unnecessary re-creation
  const extraActions = React.useMemo(() => {
    return getExtraActions(widgetId, outputDS, mapView, intl, queryItem, runtimeZoomToSelected)
  }, [widgetId, outputDS, mapView, intl, queryItem, runtimeZoomToSelected])
  
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

**Use Case**: Query widget outputs results → List widget displays those results → Chart widget visualizes the data.

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

### Query Performance Optimizations (r017.37+)
- **Universal SQL Optimizer (r017.39+)**: Automatically detects and fixes `LOWER()` index killers on **any** database field. It upper-cases the user's input in the code and unwraps the database field, ensuring speed AND case-insensitivity regardless of field names.
- **Attribute Stripping (FORCED)**: Requests only the fields required for the result title and list. Prevents "Field Bloat" (fetching `*` or `all`) which is a major server-side bottleneck.
- **Geometry Generalization (FORCED)**: All display queries use `maxAllowableOffset: 0.1` to ensure fast network transfers.
    - *CRITICAL*: Analysis modules must bypass this for full precision.
- **Instant UI**: Spinner hides immediately after data arrives, decoupling UI responsiveness from map animations.
- **SQL Index Preservation**: Detects and fixes `LOWER()` index killers on `PIN` and `MAJOR`.

### Structural Refactor (r018.0+)
- **Hybrid Architecture**: Keep `BaseWidget` as a Class component (for ExB compatibility) but move all complex logic (Hash handling, Visibility, Restoration) into **Functional Custom Hooks**.
- **Hook-First Logic**: Prefer `useHashConsumption`, `useWidgetState`, etc., over large class methods.
- **Async/Await over Timeouts**: Replace brittle `setTimeout` calls with robust Promise-based workflows.
- **Modular ESM**: Eliminate `require()` calls by resolving circular dependencies.

---

## Testing Strategy

The MapSimple project follows a **Unified Methodical Testing** strategy. Because ArcGIS Experience Builder is a heavy framework with complex state interdependencies, we prioritize long-running "User Journey" sessions over isolated unit tests for critical functionality.

### E2E Tests with Playwright

All E2E tests are located in `client/tests/e2e/`.

#### The "Mega-Journey" Pattern

Instead of separate files for every feature, we use a single comprehensive session in `session.spec.ts`. This mimics a real user session and is the only reliable way to catch "state leaks" where one action (like a hash change) impacts a future action (like a manual search).

**Core Coverage in `session.spec.ts`:**
- **URL Parameters**: Both Query (`?shortId=`) and Hash (`#shortId=`).
- **State Cleanup**: Verifying form values clear when switching between URL parameters (The "Dirty Hash" fix).
- **UI Reset**: Verifying expansion state resets when switching query types (The "Sticky Expansion" fix).
- **Graphics**: The "Add to Map" data action and graphics layer management.
- **Isolation**: Running searches in one widget and ensuring it doesn't impact the other.
- **Persistence**: Closing and reopening widgets to verify state restoration ("Save Game").

#### Running Tests

```bash
cd client

# 1. Setup Authentication (SSO/MFA)
# Run this once per day to save your session to tests/.auth/user.json
npm run test:e2e:auth-setup

# 2. Execute the Unified Mega-Journey
# Always run with --headed to verify visual state and --project=chromium
npx playwright test tests/e2e/query-simple/session.spec.ts --project=chromium --headed

# 3. View Results
npx playwright show-report
```

### Test Helpers

Reusable logic is centralized in `client/tests/e2e/fixtures/test-helpers.ts`. Always add new UI interaction logic here rather than in the spec file to keep tests readable.

**Key Helpers:**
- `openWidget(label)`: Opens a widget from the controller.
- `executeAction(widgetId, actionName)`: Triggers a data action (e.g., "Add to Map").
- `setResultsMode(mode, widgetId)`: Switches between New, Add, and Remove modes.
- `clickExpandAll(widgetId)` / `clickCollapseAll(widgetId)`: Manages results list state.

---

### Unit Tests

Unit tests use Jest and are co-located with components:

```typescript
// widget.test.tsx
import { render } from '@testing-library/react'
import Widget from './widget'

test('renders widget', () => {
  const { container } = render(<Widget {...mockProps} />)
  expect(container).toBeTruthy()
})
```

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
- `1.19.0-r017.41` - Current stable state
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

#### Version Increment Process

**CRITICAL ROUTINE**: After **every code change**, you must increment the version and rebuild. This ensures the user always knows which version they are testing.

**Standard Workflow (MANDATORY):**
1. Make code changes
2. **Increment version** in `query-simple/src/version.ts`:
   - **For Major Changes** (new features, significant refactoring, breaking changes):
     - Increment `RELEASE_NUMBER` (e.g., `'015'` → `'016'`)
     - Reset `MINOR_VERSION` to `'0'`
   - **For Minor Fixes/Iterations** (bug fixes, small improvements, new approaches, any change):
     - Keep `RELEASE_NUMBER` the same
     - Increment `MINOR_VERSION` (e.g., `'1'` → `'2'`)
3. **Rebuild** the project: `npm run build:dev` (or `npm run build:prod` for production)
4. **Report** the new version number to the user (e.g., "Version incremented to r017.2 and rebuilt successfully")

**Why This Matters:**
- The version number helps with browser cache busting. Each build gets a unique version string, ensuring browsers load fresh files instead of cached ones.
- Using minor versions allows tracking smaller fixes without incrementing the major release number.
- **The user needs to know which version they are testing**, especially when debugging or iterating on fixes. Always increment and rebuild after changes, even if it's just a small fix or a new approach to solving a problem.

**Example Routine:**
```bash
# 1. Make code changes
# 2. Edit query-simple/src/version.ts
const MINOR_VERSION = '2' // Increment from '1' to '2'

# 3. Rebuild
npm run build:dev

# 4. Report: "Version incremented to r017.2 and rebuilt successfully"
```

**Note**: This is not optional. Every code change requires a version increment and rebuild. Don't wait for the user to ask.

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
  console.error('Operation failed:', err)
}

{error && <DataSourceTip error={error} />}
```

### 6. Debug Logging

**CRITICAL RULE: ALWAYS use `debugLogger`, NEVER use `console.log()` directly.**

All console logging must respect `?debug=false`. **Never use `console.log()`, `console.error()`, or `console.warn()` directly** - always use the shared debug logger instead.

#### Debug Logger Pattern

**ALWAYS use the centralized shared debug logger for ALL logging:**

```typescript
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

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

**IMPORTANT**: 
- **Always import `createQuerySimpleDebugLogger` from `widgets/shared-code/common`**, not from widget-specific locations
- **Create a logger instance** using `const debugLogger = createQuerySimpleDebugLogger()` at the top of your file
- **Use `debugLogger.log(feature, data)` for ALL logging** - this automatically respects debug gates
- The shared debug logger is the single source of truth for all debug logging across all widgets

#### Available Debug Features

- `HASH` - Hash parameter processing
- `FORM` - Query form interactions
- `TASK` - Query task management
- `ZOOM` - Zoom behavior
- `MAP-EXTENT` - Map extent changes
- `DATA-ACTION` - Data action execution
- `UI` - UI interactions (tab switching, etc.)
- `ERROR` - Error logging (console.error/warn calls)

#### Control via URL

- **No `debug` parameter** - **All debug logging DISABLED** (default for production)
- `?debug=all` - Enable all debug logs
- `?debug=HASH,FORM` - Enable specific features
- `?debug=false` - Explicitly disable all logging (same as no parameter)

#### Rules for Console Logging

**CRITICAL: ALWAYS use `debugLogger.log()`, NEVER use `console.log()` directly.**

**MANDATORY RULE**: For ALL code (new and existing), you MUST use the shared debug logger. Using `console.log()`, `console.error()`, or `console.warn()` directly is NOT ALLOWED.

1. **NEVER use `console.log()` directly** - ALWAYS use `debugLogger.log(feature, data)` instead
2. **NEVER use `console.error()` directly** - ALWAYS use `debugLogger.log(feature, data)` with error information
3. **NEVER use `console.warn()` directly** - ALWAYS use `debugLogger.log(feature, data)` with warning information
4. **Always respect `?debug=false`** - When debug=false, NO console output should appear (debugLogger handles this automatically)
5. **ALWAYS use the shared debug logger** - Import from `widgets/shared-code/common`:
   ```typescript
   import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'
   const debugLogger = createQuerySimpleDebugLogger()
   ```
   Do not create widget-specific debug loggers or use `console.log()` for ANY functionality.
6. **If you see `console.log()` in existing code, replace it** - Update it to use `debugLogger.log()` instead

#### Example: Proper Error Handling

```typescript
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()

try {
  await performOperation()
} catch (error) {
  // ALWAYS log via debugLogger - this automatically respects debug gates
  debugLogger.log('TASK', {
    event: 'operation-failed',
    error: error instanceof Error ? error.message : String(error),
    errorStack: error instanceof Error ? error.stack : undefined
  })
  
  // Set user-facing error state
  setError(error.message)
}
```

**Note**: The debugLogger automatically handles debug gates - you don't need to check `isFeatureEnabled()` or use `console.error()` separately. Just use `debugLogger.log()` and it will only output when the appropriate debug feature is enabled.

#### Adding New Debug Features

When adding new debug features:

1. Add feature name to `DebugFeature` type in `shared-code/common/debug-logger.ts`
2. Add feature to initialization logic in the shared debug logger
3. Use `debugLogger.log('NEW_FEATURE', data)` in your code (importing from `widgets/shared-code/common`)
4. Document in this guide

**Remember**: All debug features are managed in the shared debug logger. Do not create widget-specific debug loggers.

---

## Common Patterns

### Debugging and Problem Solving

**The "Log-First" Rule (CRITICAL)**: When investigating a bug or unexpected behavior, **never implement a fix based on a guess.**

1.  **Augment Logs**: First, add detailed `debugLogger` calls to capture the state of variables, data sources, and timings *immediately before* and *after* the suspected issue.
2.  **State Capture**: Always log the `configId` and any `initialValue` during transitions. If a bug only happens during a hash-switch, it's almost always a state-synchronization issue between `QueryTaskList` and `QueryTask`.
3.  **Verify Theory**: Run the scenario and examine the logs to confirm the theory.
4.  **Implement Fix**: Only once the logs prove the root cause should a fix be implemented.
5.  **Clean Up**: Retain the logs if they are valuable for long-term monitoring, otherwise remove them after the fix is verified.

### 🔬 Hard-Won Lessons: Component State & Transitions

#### 1. The "Persistence Trap"
When switching between queries (e.g., via hash params), React may re-use component instances. This causes local state (like `useState`) to persist from the *previous* query into the *new* one.
*   **Solution**: Always use a unique React `key` (e.g., `key={configId}`) or a `useEffect` keyed to the `configId` to manually flush and reset state during transitions.

#### 2. SARGable SQL Queries
Esri's default `LOWER(FIELD) = 'value'` generates non-SARGable SQL, which kills database performance on large datasets.
*   **Solution**: Normalize the search input to uppercase in code and rewrite the SQL to `FIELD = 'UPPER_VALUE'`. This preserves the database's ability to use its attribute indexes.

### URL Parameters & Deep Linking

The MapSimple widgets support advanced automation via URL parameters. Both **Hash fragments (`#`)** and **Query strings (`?`)** are supported across all features.

#### 1. Automation Parameters

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `shortId=value` | Logic | Automatically opens the widget, selects the matching query, populates the input, and executes the search. Examples: `pin`, `major`, `owner`, `trail`. (e.g., `#pin=123` or `?major=456`) |
| `qsopen=true` | Control | Forces the QuerySimple widget to open even if no search parameters are present. |
| `debug=all` | Debug | Enables all diagnostic logging features in the browser console. |
| `debug=FEATURE` | Debug | Enables specific logging (e.g., `debug=HASH,TASK,ZOOM`). |

#### 2. Format Comparison: `#` (Hash) vs. `?` (Query String)

MapSimple widgets support both formats, but choosing the right one depends on your deployment scenario:

| Feature | Hash Fragment (`#`) | Query String (`?`) |
| :--- | :--- | :--- |
| **Server Visibility** | Client-side only. Never sent to the server. | Sent to the server with every request. |
| **Page Reloads** | Changing a hash NEVER triggers a page reload. | Changing a query string MAY trigger a full page refresh. |
| **ExB Compatibility** | **Recommended.** ExB is a Single Page App; hashes are the native way to manage state. | Supported, but can occasionally conflict with server-side redirects or proxies. |
| **Browser History** | Standard behavior; creates a new history entry. | Standard behavior; creates a new history entry. |
| **Deep Link Safety** | Safest for interactive tools. URL stays clean after "Consumption." | Standard for "Static" links (e.g., a link from an email). |

**Recommendation**: Use **Hash (`#`)** for interactive automation where you want the fastest UI response without any server-side overhead. Use **Query String (`?`)** if your application is being linked to from a system that only supports standard URL parameters.

#### 3. Deep Link Consumption Pattern
To prevent "initialization loops" and ensure a clean UX during multi-step workflows:
1.  **One-Time Trigger**: When a `shortId` is detected, it is consumed (selected and executed once).
2.  **State Shift**: If the user interactively changes the "Results Management Mode" (to Add or Remove), the widget **strips** the hash parameter from the URL. This prevents the page from resetting your accumulated results if you refresh or trigger a re-render.
3.  **Dirty Hash Protection**: When switching from one parameter to another (e.g., `#pin=1` to `#pin=2`), the widget uses a unique React `key` strategy to force-flush all internal state.

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

Selection should always be handled via the centralized utilities in `selection-utils.ts` to ensure that both the Map's native highlight (blue boxes) and our custom Graphics Layer highlights stay in sync.

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

Zoom functionality is centralized in `zoom-utils.ts` to ensure consistent zoom behavior with padding across all zoom operations (hooks, data actions, and direct calls).

**Shared Utility Function:**

```typescript
// zoom-utils.ts
import { zoomToRecords } from './zoom-utils'

// Pure function - can be used anywhere
await zoomToRecords(mapView, records, {
  padding: {
    left: 50,
    right: 50,
    top: 50,
    bottom: 50
  }
})
```

**React Hook Pattern:**

```typescript
// hooks/use-zoom-to-records.ts
import { useZoomToRecords } from './hooks/use-zoom-to-records'

export function MyComponent({ mapView, records }) {
  const zoomToRecords = useZoomToRecords(mapView)
  
  // Use in event handlers
  const handleClick = () => {
    zoomToRecords(records).catch(error => {
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
- **Consistent Padding**: Default 50px padding on all sides ensures features are visible
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

## 11. Test-Driven Development (TDD) Workflow

To ensure the long-term stability of the MapSimple widgets, we adhere to a **Test-First** philosophy.

### The Cycle
1.  **Red**: Write a failing test (Unit or E2E) that defines the expected behavior of the new feature or the reproduction of a bug.
2.  **Green**: Implement the minimal amount of code required to make the test pass.
3.  **Refactor**: Clean up the implementation while ensuring the tests stay green.

### Why TDD?
-   **Win Conditions**: It forces us to define exactly what "done" looks like before we touch the source code.
-   **Framework Realism (CRITICAL)**: Unit tests for functions that handle framework data (like `IMSqlExpression`) MUST simulate actual Experience Builder data structures (Immutable objects, arrays of objects, etc.). Testing only simple strings leads to regressions (e.g., the `asMutable` crash).
-   **Regression Safety**: Tests written first provide an immediate safety net for the next "Surgical Step."
-   **Documentation**: Tests serve as live documentation of how the system is intended to behave.

*Note: While not everything can be perfectly tested (e.g., complex framework-level UI races), we strive for maximum coverage on all logic and core user journeys.*

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

- [Add Experience Builder Custom Widgets In ArcGIS Enterprise](https://www.esri.com/arcgis-blog/products/arcgis-enterprise/developers/add-experience-builder-custom-widgets-in-arcgis-enterprise) - Step-by-step guide for hosting and registering custom widgets in ArcGIS Enterprise (11.0+). Covers compilation, hosting, portal registration, and sharing custom widgets.

### Project-Specific Documentation

- `widgets/README.md` - Widget overview and features
- `widgets/TODO.md` - Pending tasks and improvements
- `tests/README.md` - Testing documentation

### Key Concepts

- **Jimu**: Experience Builder's JavaScript framework
- **Data Sources**: Abstraction layer for accessing feature layers, maps, etc.
- **Message System**: Pub/sub pattern for widget communication
- **Immutable Config**: Widget configs are immutable objects
- **Version Manager**: Handles config migration between ExB versions

---

## Quick Reference

### Creating a New Widget

1. Create folder in `widgets/`
2. Add `manifest.json` with required properties
3. Create `src/config.ts` with TypeScript interfaces
4. Create `src/runtime/widget.tsx` with main component
5. Create `src/setting/setting.tsx` for configuration UI
6. Add `version-manager.ts` for version handling
7. Add translations in `runtime/translations/` and `setting/translations/`
8. Add icon.svg
9. Update `tsconfig.json` if needed

### Common Imports

```typescript
// Core
import { React, jsx, css, hooks, type AllWidgetProps } from 'jimu-core'

// UI Components
import { Button, Select, Checkbox, Tooltip } from 'jimu-ui'

// Data Sources
import { DataSourceManager, MessageManager } from 'jimu-core'

// ArcGIS Modules
import { loadArcGISJSAPIModules } from 'jimu-arcgis'

// Shared Code
import { DataSourceTip, useDataSourceExists } from 'widgets/shared-code/common'
```

---

*Last Updated: December 2025*
*Maintained by: MapSimple Organization (Adam Cabrera)*

