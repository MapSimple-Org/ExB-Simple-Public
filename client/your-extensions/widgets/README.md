# Custom Experience Builder Widgets

This directory contains custom widgets for ArcGIS Experience Builder.

## Widgets

### QuerySimple (`query-simple/`)
A query widget that allows users to query feature layers with support for attribute filters, spatial filters, and result display customization.

**Widget Footer:**
- Displays "QuerySimple by MapSimple.org v1.19.0" at the bottom of the widget
- Appears in all arrangement modes (Popper, Dialog/Default, Inline)
- Includes version number for reference
- Stationary footer that stays at the bottom when content scrolls

### HelperSimple (`helper-simple/`)
A helper widget that manages opening other widgets via hash parameters.

## Shared Code

Common utilities and components are shared between widgets using Experience Builder's [shared entry pattern](https://developers.arcgis.com/experience-builder/guide/share-code-between-widgets/).

### Location
`shared-code/common/` - Contains shared utilities and components

### Usage
Import shared code using standard ES6 imports:

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

### Available Shared Components

- **`common-components.tsx`**: 
  - `StateHolder` - Component for managing common state
  - `DialogPanel` - Reusable dialog/modal component
  - `EntityStatusType` - Enum for entity status types
  - `StatusIndicator` - Animated status indicator component

- **`utils.tsx`**: 
  - `toggleItemInArray` - Toggle items in an array
  - `createGetI18nMessage` - Factory for creating i18n message functions
  - `getFieldInfosInPopupContent` - Extract field info from popup content

- **`use-ds-exists.tsx`**: 
  - `useDataSourceExists` - React hook to check if a data source exists

- **`data-source-tip.tsx`**: 
  - `DataSourceTip` - Component for displaying data source status and errors

## Hash Parameters

### QuerySimple Hash Parameters

QuerySimple supports hash parameters for deep linking and automated query execution:

- `#major=value` - Execute query with configId "major" and set the specified value
- `#minor=value` - Execute query with configId "minor" and set the specified value
- Any `#configId=value` - Execute query matching the configId

**Note**: When a query is triggered via hash parameter, it will:
- Force zoom to results (overrides widget's `zoomToSelected` setting)
- Clear previous results before executing the new query

### HelperSimple Hash Parameters

- `#qsopen=true` - Forces QuerySimple widget to open without requiring a specific query parameter

## Debug Logging

Debug logging can be controlled via URL query parameters:

- `?debug=all` - Enable all debug logs
- `?debug=HASH,FORM` - Enable specific feature logs (comma-separated)
- `?debug=false` - Disable all debug logs

### Available Debug Features

- `HASH` - Hash parameter processing events
- `FORM` - Query form interactions
- `TASK` - Query task management
- `ZOOM` - Zoom behavior
- `MAP-EXTENT` - Map extent changes

### Example Usage

```
https://yourapp.com/?debug=HASH,FORM#major=12345
```

This will enable debug logging for hash and form events, and execute the "major" query with value "12345".

## Development

### Adding New Shared Code

1. Add your shared code to `shared-code/common/`
2. Export it from `shared-code/common/index.ts`
3. Import in widgets using: `import { ... } from 'widgets/shared-code/common'`

### Testing

E2E tests are located in `client/tests/e2e/`:
- `query-simple/query-tests.spec.ts` - QuerySimple widget tests
- `helper-simple/hash-tests.spec.ts` - HelperSimple widget tests

Run tests with:
```bash
cd client/tests
npx playwright test
```

## References

- [ArcGIS Experience Builder Widget Development Guide](https://developers.arcgis.com/experience-builder/guide/)
- [Share Code Between Widgets](https://developers.arcgis.com/experience-builder/guide/share-code-between-widgets/)



