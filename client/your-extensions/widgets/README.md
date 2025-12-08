# MapSimple Experience Builder Widgets

Custom widgets for ArcGIS Experience Builder Developer Edition.

## Widgets

### QuerySimple (`query-simple/`)

A powerful query widget that allows users to query feature layers with support for attribute filters, spatial filters, result display customization, and query grouping.

**Features:**
- Attribute filtering (text, number, date)
- Spatial filtering (buffer, draw, map extent)
- Query grouping for organized query management
- Hash parameter support for deep linking
- Result pagination (multi-page or lazy load)
- Selection management and map integration
- Custom data actions (Add to Map)
- Debug logging for troubleshooting

**Version:** 1.19.0

### HelperSimple (`helper-simple/`)

A helper widget that manages opening other widgets via hash parameters. Useful for deep linking and automated widget opening.

**Features:**
- Monitors URL hash changes
- Automatically opens widgets based on hash parameters
- Supports `#qsopen=true` for QuerySimple widget

## Installation

### Prerequisites

- ArcGIS Experience Builder Developer Edition 1.19.0 or later
- Node.js and npm installed
- Access to Experience Builder source code

### Installation Steps

1. **Copy Widgets to Extensions Directory**

   Copy the widget directories to your Experience Builder extensions folder:
   ```bash
   cp -r query-simple /path/to/experience-builder/client/your-extensions/widgets/
   cp -r helper-simple /path/to/experience-builder/client/your-extensions/widgets/
   cp -r shared-code /path/to/experience-builder/client/your-extensions/widgets/
   ```

2. **Rebuild Experience Builder**

   ```bash
   cd /path/to/experience-builder/client
   npm run build
   ```

3. **Restart Experience Builder Server**

   Restart your Experience Builder server to load the new widgets.

4. **Add Widgets in Builder**

   - Open Experience Builder Builder
   - Navigate to Widgets panel
   - Find "QuerySimple" and "HelperSimple" in the widget list
   - Drag widgets onto your experience

## Configuration

### QuerySimple Configuration

#### Basic Query Setup

1. **Add Data Source**
   - Click the widget in the builder
   - Go to the "Data" tab
   - Select a feature layer data source

2. **Configure Query Items**
   - Go to the "Query" tab
   - Click "Add Query Item"
   - Configure:
     - **Name**: Display name for the query
     - **Field**: Select the field to query
     - **Operator**: Choose operator (equals, contains, starts with, etc.)
     - **Label**: Input label shown to users
     - **Hint**: Placeholder text or hint

#### Query Grouping

Group related queries together for better organization:

1. **Create a Group**
   - Add multiple query items
   - Set the same `groupId` for queries that belong together
   - Set `groupDisplayName` to the name shown in the first dropdown
   - Set `searchAlias` for each query in the group (shown in second dropdown)

2. **Group Configuration Example**
   ```
   Query 1:
   - Name: "Parcel Number"
   - groupId: "parcels"
   - groupDisplayName: "King County Parcels"
   - searchAlias: "Parcel Number"
   - shortId: "pin"
   
   Query 2:
   - Name: "Major Number"
   - groupId: "parcels"
   - groupDisplayName: "King County Parcels"
   - searchAlias: "Major Number"
   - shortId: "major"
   ```

3. **Ungrouped Queries**
   - Queries without `groupId` appear individually in the first dropdown
   - Use `item.name` for display name

#### Hash Parameters

Configure hash parameters for deep linking:

1. **Set Short ID**
   - In query configuration, set `shortId` (e.g., "pin", "major")
   - This becomes the hash parameter identifier

2. **Usage**
   - `#pin=2223059013` - Execute query with shortId "pin" and value "2223059013"
   - `#major=12345` - Execute query with shortId "major" and value "12345"

#### Result Display Options

- **Pagination Style**: Choose MultiPage or LazyLoad
- **Default Page Size**: Number of results per page
- **Lazy Load Initial Size**: Initial number of results for lazy load mode
- **List Direction**: Horizontal or Vertical
- **Zoom to Selected**: Automatically zoom to results when query executes

### HelperSimple Configuration

1. **Set Managed Widget**
   - In HelperSimple settings, select the widget to manage (e.g., QuerySimple)
   - HelperSimple will monitor hash parameters and open the widget when needed

## Usage Examples

### Basic Query

1. Add QuerySimple widget to your experience
2. Configure a query item for "Parcel Number"
3. Users enter a parcel number and click "Apply"
4. Results display in the Results tab
5. Click results to select features on the map

### Grouped Queries

1. Configure multiple queries with the same `groupId`
2. Users see:
   - First dropdown: Group name (e.g., "King County Parcels")
   - Second dropdown: Individual queries (e.g., "Parcel Number", "Major Number")
3. Selecting a group shows the second dropdown
4. Selecting a query from the second dropdown switches to that query

### Deep Linking with Hash Parameters

1. Configure queries with `shortId` values
2. Use URLs like: `https://yourapp.com/#pin=2223059013`
3. QuerySimple automatically:
   - Opens (if closed)
   - Selects the correct query
   - Populates the input field
   - Executes the query
   - Zooms to results

### HelperSimple Integration

1. Add HelperSimple widget to your experience
2. Set it to manage QuerySimple widget
3. HelperSimple monitors hash parameters and opens QuerySimple automatically
4. Useful for deep linking from external sources

## Hash Parameters

### QuerySimple Hash Parameters

Format: `#shortId=value`

**Examples:**
- `#pin=2223059013` - Execute "pin" query with value "2223059013"
- `#major=12345` - Execute "major" query with value "12345"

**Behavior:**
- Automatically opens widget if closed
- Clears previous results
- Populates input field
- Executes query
- Forces zoom to results (overrides widget setting)

### HelperSimple Hash Parameters

- `#qsopen=true` - Forces QuerySimple widget to open without requiring a specific query parameter

## Debug Logging

Debug logging helps troubleshoot issues during development and testing.

### Enable Debug Logging

Add `?debug=` parameter to your URL:

- `?debug=all` - Enable all debug logs
- `?debug=HASH,FORM` - Enable specific feature logs (comma-separated)
- `?debug=false` - Disable all debug logs (default)

### Available Debug Features

- `HASH` - Hash parameter processing events
- `FORM` - Query form interactions
- `TASK` - Query task management
- `ZOOM` - Zoom behavior
- `MAP-EXTENT` - Map extent changes
- `DATA-ACTION` - Data action execution
- `UI` - UI state changes
- `ERROR` - Error events

### Example

```
https://yourapp.com/?debug=HASH,FORM#pin=2223059013
```

This enables debug logging for hash and form events, and executes the "pin" query with value "2223059013".

## Troubleshooting

### Widget Not Appearing

**Problem:** Widget doesn't appear in Experience Builder Builder.

**Solutions:**
1. Verify widgets are in `client/your-extensions/widgets/`
2. Rebuild Experience Builder: `npm run build`
3. Restart Experience Builder server
4. Clear browser cache
5. Check browser console for errors

### Hash Parameters Not Working

**Problem:** Hash parameters don't trigger queries.

**Solutions:**
1. Verify `shortId` is configured in query settings
2. Check URL format: `#shortId=value` (not `?shortId=value`)
3. Enable debug logging: `?debug=HASH`
4. Check browser console for errors
5. Verify widget is configured correctly

### Query Results Not Displaying

**Problem:** Query executes but no results appear.

**Solutions:**
1. Check data source is configured correctly
2. Verify query criteria matches data
3. Check Results tab is visible
4. Enable debug logging: `?debug=TASK`
5. Check browser console for errors

### Grouping Not Working

**Problem:** Queries don't group correctly.

**Solutions:**
1. Verify all queries in group have same `groupId`
2. Check `groupDisplayName` is set
3. Verify `searchAlias` is set for grouped queries
4. Check first dropdown shows group name
5. Verify second dropdown appears when group is selected

### Selection Not Highlighting on Map

**Problem:** Query results don't highlight on map.

**Solutions:**
1. Verify map widget is configured
2. Check data source is connected to map layer
3. Verify selection is enabled in map widget
4. Check browser console for errors
5. Try clearing results and re-running query

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

## Development

### Adding New Shared Code

1. Add your shared code to `shared-code/common/`
2. Export it from `shared-code/common/index.ts`
3. Import in widgets using: `import { ... } from 'widgets/shared-code/common'`

### Testing

E2E tests are located in `client/tests/e2e/`:
- `query-simple/query-execution.spec.ts` - Query execution tests
- `query-simple/selection-management.spec.ts` - Selection management tests
- `query-simple/add-to-map.spec.ts` - Add to Map action tests

Run tests with:
```bash
cd client/tests
npx playwright test
```

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history and changes.

## Support

For issues, questions, or contributions, please refer to the repository's issue tracker or contact the MapSimple organization.

## References

- [ArcGIS Experience Builder Widget Development Guide](https://developers.arcgis.com/experience-builder/guide/)
- [Share Code Between Widgets](https://developers.arcgis.com/experience-builder/guide/share-code-between-widgets/)
- [Experience Builder Developer Edition](https://developers.arcgis.com/experience-builder/)
