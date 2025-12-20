# MapSimple Experience Builder Widgets

Custom widgets for ArcGIS Experience Builder Developer Edition.

## Widgets

### QuerySimple (`query-simple/`)

A powerful query widget that allows users to query feature layers with support for attribute filters, spatial filters, result display customization, and query grouping.

**Features:**
- **Performance Engine**: 93% latency reduction via Universal SQL Optimization and Attribute Stripping.
- **Dual-Mode Deep Linking**: Full support for both `#shortId=value` and `?shortId=value`.
- **Results Management**: Build complex selection sets with "Add to" and "Remove from" modes.
- Attribute filtering (text, number, date)
- Spatial filtering (buffer, draw, map extent)
- Query grouping for organized query management
- Hash parameter info button (discoverable deep linking)
- Display order for query prioritization
- Result pagination (multi-page or lazy load)
- Selection management and map integration
- Custom data actions (Add to Map)
- Debug logging for troubleshooting

**Version:** 1.19.0-r017.41

### HelperSimple (`helper-simple/`)

A helper widget that manages opening other widgets via URL parameters and maintains QuerySimple widget selections when identify tool is used.

**Features:**
- Monitors URL hash changes (`#`) and query strings (`?`)
- Automatically opens widgets based on detected `shortId` parameters
- Supports `#qsopen=true` or `?qsopen=true` to force QuerySimple open
- **Selection Restoration**: Automatically restores QuerySimple selections when identify popup closes (configurable)

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

#### URL Parameters & Deep Linking

Configure parameters for automated search and navigation. Both **Hash Fragments (`#`)** and **Query Strings (`?`)** are supported.

1. **Set Short ID**
   - In query configuration, set `shortId` (e.g., "pin", "major")
   - This becomes the parameter identifier

2. **Usage**
   - `#pin=2223059013` or `?pin=2223059013` - Execute query with shortId "pin" and value "2223059013"
   - `#major=12345` or `?major=12345` - Execute query with shortId "major" and value "12345"

3. **Choosing Your Format: `#` vs `?`**

| Feature | Hash Fragment (`#`) | Query String (`?`) |
| :--- | :--- | :--- |
| **Recommendation** | **Best for Interactive UX** | **Best for External Linking** |
| **Page Reloads** | Never triggers a reload. | May trigger a full page refresh. |
| **Server Logs** | **Private.** Stays in the browser only. | **Public.** Logged by web servers/proxies. |
| **"Consumption"** | URL cleans up instantly without flicker. | URL cleanup requires a state change. |

**Pro Tip**: Use **Hash (`#`)** whenever possible. It is the native way Single Page Apps (like Experience Builder) handle state, ensuring the snappiest response for your users.

4. **Automation Info Button**
   - An info button (ℹ️) appears next to layer titles when queries have shortIds configured
   - Hovering shows a tooltip with all available shortIds and examples for both `#` and `?` formats.

#### Display Order

Prioritize queries without manually reordering or recreating them:

1. **Set Display Order**
   - In query configuration, set `order` (e.g., 1, 2, 3...)
   - Lower numbers appear first
   - Leave empty to maintain default order

2. **Use Cases**
   - **New Query at Top**: Set `order: 1` on a new query to make it appear first
   - **Featured Queries**: Prioritize important queries with lower order numbers
   - **Managing Many Queries**: When you have 15-20+ queries, easily reorder without config editing

3. **Behavior**
   - Queries with order values are sorted by order (lower numbers first)
   - Queries without order maintain their original relative positions
   - Default selection respects display order (selects query with lowest order value)

**Example:**
- Recent Sales: `order: 1` ← appears first and selected by default
- Popular Trails: `order: 2` ← appears second
- Parcels by PIN (no order) ← maintains original position
- Parcels by Major (no order) ← maintains original position

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

2. **Selection Restoration** (Optional)
   - **Maintain selected set when identify occurs**: Enable/disable automatic restoration of QuerySimple selections when identify popup closes
   - Default: Enabled
   - When enabled: If identify clears QuerySimple selection, HelperSimple will restore it when the identify popup closes
   - See `helper-simple/SELECTION_RESTORATION.md` for detailed documentation

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

### URL Parameters Not Working

**Problem:** Parameters don't trigger queries.

**Solutions:**
1. Verify `shortId` is configured in query settings
2. Ensure you are using the correct format: `#shortId=value` or `?shortId=value`.
3. Enable debug logging: `?debug=HASH`
4. Check browser console for "Deep Link Consumption" logs.

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

## Testing & Quality Assurance

The widgets use a **Unified Testing Strategy** powered by Playwright. Instead of many small, isolated tests, we use a "Mega-Journey" session that mimics real user behavior to detect state leaks and persistence bugs.

### Test Structure

- **`auth-setup.ts`**: Handles manual SSO/MFA login and saves the session state. Run this once per day (or if your session expires).
- **`session.spec.ts`**: The "Mega-Journey" test. A single, continuous session covering:
    - Deep Linking (`?pin=`) and Hash Fragments (`#major=`).
    - Bug Regression: Sticky Expansion and Dirty Hash fixes.
    - Graphics Layer actions (Add to Map).
    - Multi-widget isolation and state persistence (Save Game).
    - Accumulation logic (Add/Remove modes).
    - Manual UI interactions (Trash icons, Expand/Collapse tools).

### How to Run Tests

1.  **Auth Setup** (Manual):
    ```bash
    cd client
    npm run test:e2e:auth-setup
    ```
    *Complete the login in the browser window that opens.*

2.  **Execute Unified Session**:
    ```bash
    cd client
    npx playwright test tests/e2e/query-simple/session.spec.ts --project=chromium --headed
    ```

3.  **View Reports**:
    ```bash
    cd client
    npx playwright show-report
    ```

*Note: Redundant isolated tests are archived in `tests/e2e/query-simple/legacy/` for reference but should not be run in normal development cycles.*

## Version History

See [CHANGELOG.md](./CHANGELOG.md) for detailed version history and changes.

## Support

For issues, questions, or contributions, please refer to the repository's issue tracker or contact the MapSimple organization.

## References

- [ArcGIS Experience Builder Widget Development Guide](https://developers.arcgis.com/experience-builder/guide/)
- [Share Code Between Widgets](https://developers.arcgis.com/experience-builder/guide/share-code-between-widgets/)
- [Experience Builder Developer Edition](https://developers.arcgis.com/experience-builder/)
