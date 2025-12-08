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
│   │       │   ├── widget.tsx      # Main widget component
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
│   └── shared-code/                # Shared code between widgets
│       └── common/
│           ├── common-components.tsx # Shared React components
│           ├── data-source-tip.tsx  # Data source status component
│           ├── use-ds-exists.tsx    # Data source existence hook
│           └── utils.tsx            # Shared utility functions
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

In `manifest.json`:

```json
{
  "excludeDataActions": [
    "arcgis-map.addToMap",
    "arcgis-map.showOnMap",
    "edit.edit"
  ]
}
```

#### Creating Custom Data Actions

```typescript
// data-actions/add-to-map-action.tsx
import { DataActionBuilder, type DataAction } from 'jimu-core'

export default class AddToMapAction implements DataAction {
  id = 'add-to-map'
  label = 'Add to Map'
  icon = require('./assets/add-to-map.svg')
  
  isSupported(dataSource, records) {
    return true // or custom logic
  }
  
  onExecute(dataSource, records) {
    // Custom action logic
    selectRecordsAndPublish(dataSource, records)
  }
}
```

#### Registering Actions

```typescript
// data-actions/index.tsx
import { DataActionBuilder } from 'jimu-core'
import AddToMapAction from './add-to-map-action'

DataActionBuilder.getInstance().registerDataAction(AddToMapAction)
```

---

## Widget Communication

### Message Publishing

In `manifest.json`:

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

### Publishing Messages

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

### Message Actions

In `manifest.json`:

```json
{
  "messageActions": [
    {
      "name": "logExtentAction",
      "label": "Log Map Extent to Console",
      "uri": "actions/log-extent-action"
    }
  ]
}
```

### Implementing Message Actions

```typescript
// actions/log-extent-action.ts
import { AbstractMessageAction, type MessageAction } from 'jimu-core'

export default class LogExtentAction extends AbstractMessageAction {
  filterMessageType = 'EXTENT_CHANGE'
  
  onExecute(message: Message, actionConfig?: any) {
    console.log('Map extent:', message.data)
  }
}
```

---

## Testing Strategy

### E2E Tests with Playwright

Tests are located in `client/tests/e2e/`.

#### Test Structure

```typescript
import { test, expect } from '@playwright/test'
import { KCSearchHelpers } from '../fixtures/test-helpers'

test.describe('QuerySimple Widget', () => {
  let helpers: KCSearchHelpers

  test.beforeEach(async ({ page }) => {
    helpers = new KCSearchHelpers(page)
    await page.goto(`${baseURL}${APP_URL}#qsopen=true`)
    await helpers.waitForWidget()
  })

  test('should execute query', async ({ page }) => {
    await helpers.selectQueryItem('King County Parcels - PIN')
    await helpers.enterQueryValue('2223059013')
    await helpers.clickApply()
    await helpers.waitForResults()
    
    const count = await helpers.getResultCount()
    expect(count).toBeGreaterThan(0)
  })
})
```

#### Test Helpers

Create reusable helpers in `tests/e2e/fixtures/test-helpers.ts`:

```typescript
export class KCSearchHelpers {
  constructor(private page: Page) {}
  
  async waitForWidget() { /* ... */ }
  async selectQueryItem(name: string) { /* ... */ }
  async enterQueryValue(value: string) { /* ... */ }
  async clickApply() { /* ... */ }
  async waitForResults() { /* ... */ }
  async getResultCount(): Promise<number> { /* ... */ }
}
```

#### Running Tests

```bash
cd client
npx playwright test
npx playwright test query-simple/add-to-map.spec.ts
```

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

**CRITICAL**: All console logging must respect `?debug=false`. Never use `console.log()`, `console.error()`, or `console.warn()` directly without checking debug gates.

#### Debug Logger Pattern

Use the centralized debug logger for all logging:

```typescript
import { debugLogger } from './debug-logger'

// For feature-specific logs
debugLogger.log('HASH', {
  event: 'hash-detected',
  shortId: 'pin',
  value: '123456'
})

// For error logging (respects debug gates)
if (debugLogger.isFeatureEnabled('ERROR')) {
  console.error('Error message', error)
}

// Check if any debug is enabled
if (debugLogger.isDebugEnabled()) {
  console.log('Some debug info')
}
```

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

1. **Never use `console.log()` directly** - Use `debugLogger.log(feature, data)`
2. **Never use `console.error()` without gate** - Check `debugLogger.isFeatureEnabled('ERROR')`
3. **Never use `console.warn()` without gate** - Check `debugLogger.isFeatureEnabled('ERROR')`
4. **Always respect `?debug=false`** - When debug=false, NO console output should appear

#### Example: Proper Error Handling

```typescript
try {
  await performOperation()
} catch (error) {
  // Always log via debugLogger for feature tracking
  debugLogger.log('TASK', {
    event: 'operation-failed',
    error: error.message
  })
  
  // Only use console.error if ERROR feature is enabled
  if (debugLogger.isFeatureEnabled('ERROR')) {
    console.error('Operation failed:', error)
  }
  
  // Set user-facing error state
  setError(error.message)
}
```

#### Adding New Debug Features

When adding new debug features:

1. Add feature name to `DebugFeature` type in `debug-logger.ts`
2. Add feature to initialization logic
3. Use `debugLogger.log('NEW_FEATURE', data)` in your code
4. Document in this guide

---

## Common Patterns

### Hash Parameter Handling

```typescript
checkQueryStringForShortIds = () => {
  const hash = window.location.hash.substring(1)
  const urlParams = new URLSearchParams(hash)
  
  // Find matching shortId in queryItems
  const matchingItem = config.queryItems.find(item => 
    urlParams.has(item.shortId)
  )
  
  if (matchingItem) {
    const value = urlParams.get(matchingItem.shortId)
    // Use value to populate query
    this.removeHashParameter(matchingItem.shortId)
  }
}

removeHashParameter = (shortId: string) => {
  const hash = window.location.hash.substring(1)
  const urlParams = new URLSearchParams(hash)
  urlParams.delete(shortId)
  const newHash = urlParams.toString()
  window.history.replaceState(null, '', 
    newHash ? `#${newHash}` : window.location.pathname + window.location.search
  )
}
```

### Selection Management

```typescript
// selection-utils.ts
import { DataSourceManager, MessageManager } from 'jimu-core'

export function selectRecordsAndPublish(
  dataSource: DataSource,
  records: DataRecord[],
  zoomToSelected = false
) {
  // Select records on origin data source
  dataSource.selectRecords(records)
  
  // Publish selection change message
  MessageManager.getInstance().publishMessage({
    type: 'DATA_RECORDS_SELECTION_CHANGE',
    widgetId: widgetId,
    data: { records, dataSourceId: dataSource.id }
  })
  
  // Handle zoom if needed
  if (zoomToSelected) {
    zoomToRecords(records)
  }
}
```

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

*Last Updated: December 2024*
*Maintained by: MapSimple Organization*

