# MapSimple Widgets for ArcGIS Experience Builder

Custom widgets for ArcGIS Experience Builder Developer Edition (1.19.0+). Built for performance, deep-linking, and advanced result management.

**Current Version**: `1.19.0-r019.31`  
**License**: MIT  
**Compatibility**: ArcGIS Experience Builder 1.19.0+

---

## 📦 What's Included

This repository contains three components designed to work together:

- **`query-simple/`** - Advanced search widget with SQL optimization and deep-linking
- **`helper-simple/`** - Background orchestrator widget for URL monitoring and state management
- **`shared-code/`** - Common utilities and components shared between widgets

---

## 🎯 Why These Widgets?

### QuerySimple solves real-world pain points:

**1. Performance at Scale**
- **93% latency reduction** through automatic SQL query optimization
- Intelligent attribute stripping to minimize network payloads
- Handles hundreds of results without UI lag

**2. Deep Linking & Automation**
- Support for both hash (`#pin=123`) and query string (`?pin=123`) URL parameters
- Automatic query execution from external links (CRM, email campaigns, etc.)
- Interactive "Info Button" shows users exactly how to link to any search

**3. Advanced Result Management**
- **Accumulation mode**: Add results from multiple searches (unlike standard widget that clears on each search)
- **Removal mode**: Remove specific items from accumulated results
- **Persistent selections**: Maintains selections even when using map identify tools

**4. Enterprise-Ready Organization**
- Group dozens of searches into clean two-dropdown hierarchy
- Control display order via config (no manual reordering needed)
- Production-safe debug system (no logs unless explicitly requested)

---

## 🏗️ Architecture Overview

### How They Work Together

#### QuerySimple: The User-Facing Search Engine

**Core Responsibilities:**
- Render query UI with dropdowns, input fields, and spatial controls
- Execute searches against ArcGIS feature layers
- Display results with configurable formatting
- Manage map selections and highlighting
- Support accumulation modes (New/Add/Remove)

**Key Features:**
- **SQL Optimizer**: Automatically unwraps `LOWER()` from WHERE clauses to ensure database index usage
- **Query Grouping**: Two-level dropdown system (Group → Search) for complex search requirements
- **Display Order Control**: `order` property forces searches to top of list regardless of creation order
- **Spatial Filtering**: Buffer, draw, and extent-based filtering
- **Result Persistence**: Maintains selections across widget open/close cycles

#### HelperSimple: The Background Orchestrator

**Core Responsibilities:**
- Monitor URL changes (hash and query string parameters)
- Trigger QuerySimple automation when deep-link parameters are detected
- Restore QuerySimple selections after map identify popup closes
- Manage widget visibility handshake (close QuerySimple when identify opens)

**Why It's Separate:**
HelperSimple handles "background" logic that shouldn't be tied to QuerySimple's UI lifecycle. This separation ensures:
- URL monitoring continues even when QuerySimple is closed
- Selection restoration works reliably across widget state changes
- Clean separation of concerns (UI vs. orchestration)

#### Shared Code: The Common Foundation

**Purpose:**
Eliminate code duplication and ensure consistency across widgets.

**Contents:**
- **`common-components.tsx`**: Reusable UI components (StatusIndicator, etc.)
- **`debug-logger.ts`**: Production-safe logging system with URL-based activation
- **`data-source-tip.tsx`**: Helper for data source selection in settings
- **`use-ds-exists.tsx`**: Hook to check data source availability
- **`utils.tsx`**: Common utility functions

---

## 🚀 Installation

### Quick Start

1. **Copy the widgets into your Experience Builder installation:**
   ```bash
   # Navigate to your ExB widgets directory
   cd /path/to/ArcGISExperienceBuilder/client/your-extensions/widgets
   
   # Copy the three directories
   cp -r /path/to/download/query-simple ./
   cp -r /path/to/download/helper-simple ./
   cp -r /path/to/download/shared-code ./
   ```

2. **Build the widgets:**
   ```bash
   # From the ExB client directory
   cd /path/to/ArcGISExperienceBuilder/client
   npm run build
   ```

3. **Restart Experience Builder server:**
   ```bash
   # Stop the server (Ctrl+C)
   # Start it again
   npm start
   ```

4. **Add widgets to your app:**
   - Open Experience Builder
   - Create or edit an app
   - Add **HelperSimple** widget (add to controller - it has no UI)
   - Add **QuerySimple** widget to your layout
   - Configure QuerySimple with your data sources and queries

---

## ⚙️ Configuration Guide

### QuerySimple Configuration

#### Basic Query Setup

1. **Add a data source** (your feature layer)
2. **Create a query item:**
   - **Query Name**: User-facing name (e.g., "Search by Parcel PIN")
   - **Short ID**: For deep-linking (e.g., "pin")
   - **Fields**: Configure search fields and operators
   - **Result Display**: Choose which fields to show in results

#### Advanced: Query Grouping

For complex applications with many searches:

```javascript
// Query 1: Search by PIN
{
  "groupId": "parcels",
  "searchAlias": "Search by PIN",
  "order": 1,
  "shortId": "pin"
}

// Query 2: Search by Address
{
  "groupId": "parcels",
  "searchAlias": "Search by Address",
  "order": 2,
  "shortId": "address"
}

// Query 3: Search by Owner
{
  "groupId": "parcels",
  "searchAlias": "Search by Owner",
  "order": 3,
  "shortId": "owner"
}
```

This creates a two-level dropdown:
```
[Parcels ▼]  →  [Search by PIN ▼]
                [Search by Address]
                [Search by Owner]
```

#### Display Order Control

Use the `order` property to force important searches to the top:

```javascript
// Even if added last, will appear first due to order: 1
{
  "searchAlias": "Quick PIN Search",
  "order": 1
}

// Without order property, appears in creation order
{
  "searchAlias": "Advanced Search"
}
```

### HelperSimple Configuration

HelperSimple is a controller widget (no UI) and requires minimal configuration:

1. Add it to your app (typically in the app's controller)
2. It will automatically detect and work with any QuerySimple widgets in the app
3. No additional configuration needed - it works out of the box

---

## 🔗 Deep Linking (URL Parameters)

### Automatic Query Execution

Configure a `shortId` for any query to enable automatic execution from URL parameters.

**Hash Parameters (Recommended for UX):**
```
https://yoursite.com/app/#pin=123456
```
- No page reload when parameter changes
- Snappy, responsive feel
- Ideal for interactive applications

**Query String Parameters (External Links):**
```
https://yoursite.com/app/?pin=123456
```
- Standard URL format
- Works in emails, CRM systems, external links
- Ideal for integrations

### Multiple Parameters

Execute multiple queries simultaneously:
```
https://yoursite.com/app/#pin=123456&owner=Smith
```

### Info Button

QuerySimple includes an interactive "ℹ️ Info Button" that appears after searches. Click it to see:
- The exact URL for the current search
- Instructions for sharing or bookmarking
- Technical details about the query

---

## 🐛 Debugging & Troubleshooting

### Debug System

QuerySimple and HelperSimple include a production-safe debug system. Logs are **disabled by default** and only appear when explicitly requested.

**Activate debugging:**
```
https://yoursite.com/app/?debug=HASH,TASK
```

**Available debug flags:**

| Flag | What it logs |
|------|--------------|
| `all` | Everything (high volume!) |
| `HASH` | URL parameter parsing and deep-link execution |
| `TASK` | Query execution, performance metrics |
| `RESULTS-MODE` | Selection mode transitions (New/Add/Remove) |
| `SELECTION` | Map selection sync and identify popup tracking |
| `RESTORE` | Selection restoration logic |
| `WIDGET-STATE` | HelperSimple ↔ QuerySimple handshake |
| `GRAPHICS-LAYER` | Graphics highlighting logic |

**Example:**
```javascript
// Enable hash and task debugging
?debug=HASH,TASK

// Console output:
[QUERYSIMPLE] HASH: Consuming URL parameter: pin=123456
[QUERYSIMPLE] TASK: Executing query 'Search by PIN'
[QUERYSIMPLE] TASK: Query completed in 234ms (15 results)
```

### Known Issues

**Automatic Bug Logging:**
Known issues are logged automatically in the console (even when debug is disabled) with the format `[QUERYSIMPLE ⚠️ BUG]` to help developers understand expected behavior.

Each bug log includes:
- **Bug ID**: Unique identifier (e.g., `BUG-ADD-MODE-001`)
- **Category**: Bug type (SELECTION, UI, URL, DATA, GRAPHICS, PERFORMANCE, GENERAL)
- **Description**: What the issue is and why it's happening
- **Workaround**: How to avoid or work around the issue
- **Target Resolution**: When the issue will be fixed

**Current Known Issues:**

1. **BUG-ADD-MODE-001: Accumulated Results Format Switch**
   - **Issue**: When using ADD or REMOVE mode with accumulated results from multiple queries, switching to a different query changes all accumulated results to match the new query's display format
   - **Workaround**: Use NEW_SELECTION mode instead of ADD_TO_SELECTION when switching between different query configurations
   - **Status**: Under investigation - requires storing original query config with each result set

---

## 🧪 Testing

### Unit Tests

The widgets include unit tests for core utilities:

```bash
# From the widgets directory
cd /path/to/your-extensions/widgets
npm test
```

Tests cover:
- `query-simple/tests/` - Query result handling, utilities, and results management
- `shared-code/common/tests/` - Common components and utilities

---

## 🛠️ Extending & Customizing

### Component Hierarchy

**QuerySimple:**
```
Widget.tsx (Main Entry Point)
├── QueryTask.tsx (Search UI & Logic)
│   ├── QuerySelector.tsx (Dropdown controls)
│   ├── SqlExpressionRuntime (Query builder)
│   ├── QueryResult.tsx (Results display)
│   │   └── ResultItem.tsx (Individual result)
│   └── hooks/
│       ├── use-selection-manager.ts (Selection logic)
│       ├── use-graphics-manager.ts (Map highlighting)
│       └── use-results-manager.ts (Result state)
└── Settings.tsx (Configuration UI)
```

**HelperSimple:**
```
Widget.tsx (Main Entry Point)
├── hooks/
│   ├── use-url-monitor.ts (URL change detection)
│   ├── use-widget-visibility.ts (Handshake logic)
│   └── use-selection-restoration.ts (Selection recovery)
└── Settings.tsx (Minimal config UI)
```

### Key Extension Points

**Custom Data Actions:**
See `query-simple/src/data-actions/` for examples:
- `add-to-map-action.tsx` - Add query results to map
- `zoom-to-action.tsx` - Zoom to selected features

**Custom Result Display:**
Modify `query-simple/src/runtime/query-result.tsx` to customize how results appear.

**Custom URL Parameters:**
Extend `helper-simple` URL monitoring to support additional automation scenarios.

### Coding Standards

**Key Principles:**
1. **Zero Duplication**: Shared code goes in `shared-code/`
2. **Production-Safe Logging**: Use `debugLogger`, never `console.log`
3. **TypeScript Strict Mode**: All code is fully typed
4. **Component Keys**: Use `key={configId}` to force remounts on config changes

**Debug Logger Usage:**
```typescript
import { debugLogger } from '../../../shared-code/common'

// In your component
debugLogger.log('HASH', 'Processing parameter', { shortId, value })
```

### The Persistence Trap

**Problem**: Experience Builder reuses React component instances when switching between queries, causing state leaks.

**Solution**: Use React `key` prop with `configId`:

```typescript
// BAD: Component instance reused, state persists
<MyComponent queryConfig={config} />

// GOOD: New instance created, clean state
<MyComponent key={config.configId} queryConfig={config} />
```

This is critical for:
- Query selector components
- Result display components
- Any component that holds query-specific state

---

## 📚 Additional Resources

### AI Coding Assistant Support

This repository includes `.cursor/rules/` files for AI-powered IDEs (Cursor, GitHub Copilot, etc.):

- `architecture.mdc` - Architectural patterns and standards
- `deployment.mdc` - Export and distribution guidelines
- `governance.mdc` - Project governance and tone
- `technical-standards.mdc` - Versioning, logging, and performance standards

**These files are optional** and document development standards. They can be safely ignored if you're not using an AI assistant.

### Version Management

Each widget includes `version.ts` with structured versioning:

```typescript
export const MAJOR_VERSION = 1
export const MINOR_VERSION = 19
export const PATCH_VERSION = 0
export const RELEASE_VERSION = 'r019.31'
```

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**:
   ```bash
   git checkout -b feature/my-feature
   ```
3. **Make your changes** following the coding standards
4. **Write tests** for new functionality
5. **Update CHANGELOG.md** with your changes
6. **Submit a pull request**

### Testing Before PR

Ensure your changes pass:
- Unit tests: `npm test`
- Build: `npm run build` (from ExB client directory)
- Manual testing in Experience Builder

---

## 📄 License

MIT License - See LICENSE file for details

---

## 🙏 Acknowledgments

Built for the King County Parcel Viewer ecosystem by the MapSimple organization.

Special thanks to the Esri Experience Builder team for creating an extensible platform.

---

## 📞 Support

- **Issues**: Report bugs via GitHub Issues
- **Questions**: Open a GitHub Discussion
- **Documentation**: See inline code documentation and comments

---

**Last Updated**: 2026-01-13  
**Version**: 1.19.0-r019.31
