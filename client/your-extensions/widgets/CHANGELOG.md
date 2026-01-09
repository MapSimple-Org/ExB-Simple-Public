# Changelog

All notable changes to MapSimple Experience Builder widgets will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.19.0-r018.110] - 2025-01-08

### Fixed
- **Intermittent First-Load Hash Execution Bug**: Fixed race condition where hash parameters would sometimes populate the form but not execute on first page load. The issue occurred when `datasourceReady` became true before `outputDS` was available, causing the hash value to be set but execution to fail silently.

### Changed
- **Hash Value Setting Logic**: Added `outputDS` check to `shouldSetValue` condition and `outputDS` to the useEffect dependency array in `query-task-form.tsx`. Hash values are now only set when ALL required conditions are met: `datasourceReady`, `outputDS`, and `sqlExprObj`.
- **Hash Re-Execution Support**: Modified `UrlConsumptionManager` to track only the `shortId=value` portion of hash parameters (not entire hash), allowing the same query to be re-executed after navigating away and back.
- **Removed Hash Processing Blocker**: Eliminated `processedHashParamsRef` from `widget.tsx` that was preventing hash parameters from re-executing.

### Added
- **HASH-FIRST-LOAD Debug Logging**: Added comprehensive diagnostic logging throughout the hash execution path in `query-task-form.tsx` and `query-task-list.tsx` to track condition states, execution decision points, and identify race conditions.
- **HASH-EXEC Debug Feature**: Added `HASH-EXEC` debug feature to both QuerySimple and HelperSimple loggers for tracking hash execution flow.

### Technical Details
- **r018.98-102**: Fixed hash re-execution by removing redundant tracking in both HelperSimple and QuerySimple
- **r018.105-107**: Added extensive diagnostic logging with new `HASH-FIRST-LOAD` debug tag
- **r018.108**: Fixed circular reference error in logging (outputDS object being stringified)
- **r018.109**: Added `outputDS` check to `shouldSetValue` condition to prevent setting hash before execution can occur
- **r018.110**: Added `outputDS` to useEffect dependency array to ensure hash is set when all conditions are met

## [1.19.0-r018.97] - 2025-01-08

### Fixed
- **Tab Count in New Mode**: Tab count now updates correctly when records are removed via X button in New mode. Previously, the count remained static (e.g., 121/121) even after removing records.
- **Clear Results Button**: Fixed `ReferenceError: setRemovedRecordIds is not defined` when clicking Clear Results button on Results tab.
- **Universal Tab Count Architecture**: `accumulatedRecords` is now the single source of truth for displayed records across ALL modes (New, Add, Remove), ensuring consistent tab count behavior.

### Changed
- **Simplified Clear Results Logic**: Refactored `clearResults()` in `query-result.tsx` to delegate directly to parent's `clearResult()` method, eliminating redundant local state cleanup.
- **Universal accumulatedRecords Sync**: Removed mode-specific checks - `accumulatedRecords` now syncs in all modes for universal tab count tracking.

## [1.19.0-r018.96] - 2025-01-08

### Removed
- **Manual Removal Tracking**: Eliminated `manuallyRemovedRecordIds` state and all related filtering logic across `widget.tsx`, `query-task.tsx`, `query-result.tsx`, and `query-task-list.tsx`.

### Changed
- **Simplified Architecture**: Removed unnecessary complexity by relying on `mergeResultsIntoAccumulated`'s composite key duplicate detection. Running the same query after removing records now correctly re-adds those records in Add mode.
- **Cleaner Code**: Removed over 200 lines of tracking logic that was made obsolete by the r018.94 architectural refactoring.

## [1.19.0-r017.60] - 2025-12-23

### Added
- **Custom Zoom To Action**: Created custom "Zoom To" data action that replaces the framework's default zoom action, ensuring consistent zoom behavior with 50px padding across all zoom operations.
- **Shared Zoom Utility**: Extracted zoom logic into `zoom-utils.ts` as a shared utility function, eliminating code duplication between the React hook and data action implementations.

### Changed
- **Zoom Implementation**: Refactored `useZoomToRecords` hook to use shared `zoomToRecords` utility function, maintaining backward compatibility while centralizing zoom logic.
- **Data Actions**: Updated `getExtraActions` to include custom "Zoom To" action alongside "Add to Map" action, both using QuerySimple's internal processes.

### Fixed
- **Framework Action Suppression**: Excluded framework's `zoomToFeature` and `arcgis-map.zoomToFeature` actions from appearing in DataActionList, ensuring only custom actions are shown.

## [1.19.0-r017.59] - 2025-12-23

### Changed
- **Action Name**: Changed custom zoom action name from `zoomToFeature` to `querySimpleZoomTo` to avoid conflicts with framework action.

## [1.19.0-r017.58] - 2025-12-23

### Added
- **Custom Zoom To Data Action**: Initial implementation of custom "Zoom To" data action using shared zoom utility.

## [1.19.0-r017.57] - 2025-12-23

### Added
- **Shared Zoom Utility**: Created `zoom-utils.ts` with pure `zoomToRecords` function for reuse across hooks and data actions.

### Changed
- **Hook Refactoring**: Refactored `useZoomToRecords` hook to wrap shared utility function instead of duplicating logic.

## [1.19.0-r017.48] - 2025-12-22

### Fixed
- **Priority URL Parsing**: Unified URL parameter handling between `widget.tsx` and `QueryTaskList.tsx`. Hash parameters now correctly override query string parameters across all query items, resolving the "Dirty Hash" bug when pivoting between deep links.
- **State Mismatch**: Fixed a race condition where `QueryTaskList` could fallback to stale query string values after a hash parameter was consumed.

### Added
- **Documentation**: Created `TESTING_WALKTHROUGH.md` providing a step-by-step guide for manual verification of all QuerySimple features.
- **Architectural Roadmap**: Added "Esri Standards & Architectural Hardening" to `TODO.md` for future refactoring into a "Thin Shell" pattern.

## [1.19.0-r017.47] - 2025-12-21

### Fixed
- **Circular Structure Crash**: Resolved "Converting circular structure to JSON" error when clicking the clear results (trash can) button by properly handling the React event object in `clearResult`.
- **External Widget Fix (draw-advanced)**: Patched the `draw-advanced` widget's `style.ts` to remove an incompatible theme reference (`theme.surfaces[1]`) that was preventing the widget from rendering in Experience Builder 1.19.

## [1.19.0-r017.46] - 2025-12-21

### Changed
- **Smarter Input Validation**: Refined the "Empty String Prevention" rule to exempt list-based selections (Unique Values, Field Values). This allows users to interact with Regional Trails and other dropdown-style searches without being blocked by the mandatory text requirement.

## [1.19.0-r017.45] - 2025-12-21

### Fixed
- **Immutable Structure Preservation**: Fixed `TypeError: asMutable is not a function` by properly handling "Value List" structures (arrays of objects). The sanitizer now surgically updates string values within these structures while preserving the overall object architecture required by the framework.

## [1.19.0-r017.44] - 2025-12-21

### Fixed
- **Instant Validation**: Resolved bug where the "Apply" button remained disabled during typing until the input lost focus. Added real-time validation via DOM event listeners.

## [1.19.0-r017.43] - 2025-12-21

### Added
- **TDD Workflow**: Adopted Test-Driven Development (TDD) as requested, adding unit tests for SQL sanitization and input validation.
- **Input Validation**: Added `isQueryInputValid` and `sanitizeQueryInput` to prevent empty string submittals and provide basic SQL injection protection.
- **Form Debugging**: Added granular focus and typing logs in `QueryTaskForm` to monitor input behavior and validation state.

## [1.19.0-r017.42] - 2025-12-21

### Fixed
- **Logging Compliance**: Replaced direct `console.log` calls in `query-utils.ts` with the centralized `debugLogger` to adhere to the MapSimple Development Guide.

## [1.19.0-r017.41] - 2025-12-20

### Fixed
- **Sticky Expansion State**: Resolved bug where expansion icons "remembered" the state of the previous query during rapid hash switching.
- **Dirty Hash Support**: Fixed form values persisting across hash transitions by implementing unique React keys for query forms.
- **Query Parameter Support**: Added official support for `?shortid=value` alongside the existing `#shortid=value` format in both HelperSimple and QuerySimple.

## [1.19.0-r017.40] - 2025-12-20

### Added
- **Diagnostic Regression Suite**: Created `repro-bugs.spec.ts` to explicitly test for state-flushing issues during rapid hash transitions.

## [1.19.0-r017.39] - 2025-12-19

### Added
- **Universal SQL Optimizer**: Upgraded the performance logic to automatically unwrap `LOWER()` from *any* database field while normalizing user input to uppercase. This ensures maximum query speed (index usage) across all configurable search fields while maintaining case-insensitivity.

## [1.19.0-r017.38] - 2025-12-19

### Added
- **Performance Optimizations**: Significantly reduced query execution time and browser overhead
  - **Eliminated Sequential Count Query**: Removed redundant `executeCountQuery` round-trip. Widget now fetches data immediately and uses `records.length`, cutting latency by ~50%.
  - **SQL Index Optimization**: Implemented manual SQL bypass for core fields (`MAJOR`, `PIN`) to prevent Experience Builder's `LOWER()` function from disabling database indexes.
  - **Geometry Generalization**: Added `maxAllowableOffset: 0.1` to query parameters, reducing geometry payload size for bulk fetches (100+ records).
  - **Iframe-Aware Debugging**: Updated `debugLogger` to correctly detect `?debug=all` parameters even when the widget is running inside an Experience Builder iframe.

### Fixed
- **Test Reliability**: Enhanced Playwright `waitForResults` helper to correctly differentiate between "New" and "Stale" results, preventing false-positive successes during fast-paced methodical sessions.

## [1.19.0-r017.31] - 2025-12-19

### Fixed
- **Add Mode Stability**: Further improved record capture and display consistency in accumulation modes
  - UI now strictly prefers the accumulated record set over the map's current selection in Add/Remove modes
  - Added "Humanized" delays to E2E tests to match user interaction speed and allow React state to settle
- **Dual-Widget Session Testing**: Expanded methodical testing suite to verify both widget instances (HS-connected and Isolated)

## [1.19.0-r017.30] - 2025-12-19

### Fixed
- **Deep Link Consumption**: Fixed bug where hash parameters re-triggered a "New Selection" reset when switching to accumulation modes (Add/Remove)
  - Hash parameters are now automatically cleared from the URL when entering Add or Remove modes
  - Prevents "Initialization loops" during re-renders while building a selection set
- **Add Mode Capture**: Fixed race condition where current results were sometimes lost when clicking the "Add" button
  - Implemented dual-source capture strategy (React state + Data Source selection)
- **Log Noise**: Disabled high-frequency `MAP-EXTENT` logs in `log-extent-action.ts` to improve testability and terminal clarity

## [1.19.0-r017.29] - 2025-12-18

### Fixed
- **Graphics Layer Clearing**: Resolved deep race condition where graphics from previous queries persisted on the map
  - Implemented "Virtual Clear" render guard to immediately hide stale results
  - Centralized selection dispatching to ensure all components sync simultaneously
  - Ensured graphics layer cleanup is fully awaited before new queries execute
- **Sticky Selection**: Fixed bug where widget would reset to the default query as soon as a hash parameter was removed from the URL
  - Modified `QueryTaskList.tsx` to preserve active query after hash consumption
  - Stabilized restoration logic for hash-triggered queries when closing/reopening the panel
- **Map Selection Sync**: Fixed persisting blue highlight boxes when clearing results or closing the widget
  - Updated `selection-utils.ts` to explicitly publish empty selection messages
  - Improved `getOriginDataSource` robustness to handle varied data source hierarchies
- **Footer Text**: Updated brand name to "by MapSimple" across all widget footers

### Changed
- **Centralized Selection**: Standardized selection handling via `dispatchSelectionEvent` and `clearSelectionInDataSources` utilities
- **Version Tracking**: Incremented to r017.29 for production stability

## [1.19.0-r016.8] - 2025-12-16

### Fixed
- **Debug Logging**: Fixed all console.log statements that were bypassing debug gates
  - Replaced all direct `console.log()` calls with `debugLogger.log()` in:
    - `feature-info.tsx` (constructor, componentDidUpdate, expandByDefault changes)
    - `query-result-item.tsx` (render logging)
    - `simple-list.tsx` (onRenderDone logging)
    - `query-result.tsx` (handleRenderDone logging)
    - `lazy-list.tsx` (records changed, onRenderDone logging)
  - Removed redundant `console.error()` statements that already had debugLogger.log equivalents
  - All debug logging now properly respects `?debug=` URL parameters
  - No console output will appear unless explicitly enabled via debug switches

### Changed
- **Development Guide**: Updated to mandate ALWAYS using `debugLogger`, NEVER using `console.log()` directly
  - Added clear rules emphasizing debugLogger usage
  - Updated examples to show correct pattern
  - Added requirement to replace any existing `console.log()` statements found in code

## [1.19.0] - 2025-01-XX

### Added

#### QuerySimple
- **Query Grouping**: Organize related queries into groups with two-dropdown interface
  - First dropdown shows groups and ungrouped queries
  - Second dropdown shows queries within selected group
  - Supports `groupId`, `groupDisplayName`, and `searchAlias` configuration
- **Hash Parameter Support**: Deep linking and automated query execution via URL hash parameters
  - Format: `#shortId=value` (e.g., `#pin=2223059013`)
  - Automatically opens widget, selects query, populates input, and executes
  - Forces zoom to results for hash-triggered queries
- **Tab Navigation**: Moved tabs to top of widget for better organization
  - Query tab: Contains search layer dropdown and query form
  - Results tab: Displays query results
- **Custom Data Action**: "Add to Map" action replaces framework's "Show on Map"
  - Consistent selection behavior with query results
  - Properly integrates with "Clear results" functionality
  - Respects zoom preferences
- **Debug Logging System**: Production-safe debug logging controlled via URL parameters
  - `?debug=all` - Enable all logs
  - `?debug=HASH,FORM,SELECTION,RESTORE` - Enable specific features
  - `?debug=false` - Disable all logs (default)
  - Features: HASH, FORM, TASK, ZOOM, MAP-EXTENT, DATA-ACTION, GROUP, SELECTION, WIDGET-STATE, RESTORE
- **Result Pagination**: Support for multi-page and lazy load pagination styles
- **Widget Footer**: Displays "QuerySimple by MapSimple v1.19.0" in all arrangement modes
- **Selection Restoration**: Automatically restores map selection when identify popup closes
  - Only restores when widget panel is open
  - Maintains query context after using identify tool
  - Clears selection from map when widget closes (clean UX)
  - Restores selection to map when widget reopens (if it has selection)
  - Comprehensive debug logging for troubleshooting
- **Results Management Modes**: Three modes for managing query results
  - **New Selection** (default): Clears previous results and starts fresh
  - **Add to Current Selection**: Merges new query results with existing accumulated results
    - Preserves accumulated records when switching queries
    - Groups records by origin data source for proper DataActionList recognition
    - Uses composite key (`${originDSId}_${objectId}`) for deduplication
  - **Remove from Current Selection**: Removes matching records from accumulated results
    - Auto-clears when all records removed
    - Preserves remaining records when switching queries
  - Selection restoration works correctly for accumulated records
  - Hash parameters automatically reset to "New" mode to avoid bugs

#### HelperSimple
- **Hash Parameter Monitoring**: Monitors URL hash changes and opens managed widgets
- **Widget Opening**: Automatically opens QuerySimple widget based on hash parameters
- **Deep Linking Support**: Enables deep linking from external sources
- **Debug Logging**: Tracks selection events and identify popup state for debugging (does not perform restoration)

#### Shared Code
- **Shared Components**: Common utilities and components shared between widgets
  - `DataSourceTip` - Data source status and error display
  - `useDataSourceExists` - React hook for data source existence checking
  - `StatusIndicator` - Animated status indicator
  - `DialogPanel` - Reusable dialog component
- **Shared Utilities**: Common utility functions
  - `createGetI18nMessage` - i18n message factory
  - `toggleItemInArray` - Array manipulation
  - `getFieldInfosInPopupContent` - Field info extraction

### Changed

#### QuerySimple
- **Tab Layout**: Tabs moved to top of widget panel
- **Header Height**: Reduced header padding for more compact design
- **Selection Management**: Improved selection handling with origin and output data sources
- **Error Handling**: Standardized error display patterns using `DataSourceTip` component

### Fixed

#### QuerySimple
- **Data Source Lifecycle**: Fixed race condition where queries executed before data source was ready
  - Removed manual data source destruction
  - Let `DataSourceComponent` handle lifecycle automatically
- **Hash Parameter Race Condition**: Fixed issue where hash-triggered queries failed when widget was on Results tab
  - Added tab switching logic for hash-triggered queries
  - Ensured form is visible before executing query
- **Dropdown Synchronization**: Fixed dropdowns not synchronizing with hash parameters for grouped queries
  - Prioritized hash-matched queries in selection logic
  - Added verification for dropdown synchronization
- **Input Value Setting**: Enhanced form verification to ensure input values are set before executing queries
  - Added retry logic for hash-triggered queries
  - Verified input value matches hash parameter value
- **Ungrouped Query Display**: Fixed first dropdown showing field name instead of item name for ungrouped queries
- **Tab Content Rendering**: Fixed query form not rendering after tab re-positioning
  - Improved flex container layout
  - Fixed height and overflow issues
- **Results Tab Scrolling**: Fixed results not scrolling when content exceeds tab height
- **Scroll Position Reset**: Fixed scroll position resetting to top when removing records from lazy-loaded results
  - Preserves scroll position when records are filtered/removed
  - Only resets scroll on new query (resultCount change)
  - Clamps scroll position to valid range to prevent browser resets
  - Uses useLayoutEffect for synchronous scroll restoration before paint
- **SimpleList Implementation (v1.19.0-r016)**: Switched from lazy loading to simple list rendering
  - Forces `PagingType.Simple` everywhere (ignores config)
  - Removed lazy loading complexity and edge cases
  - Query execution fetches all records (up to maxRecordCount) instead of paginated
  - Much more stable and easier to maintain
- **Race Condition Fix (v1.19.0-r016.1)**: Fixed `feature-info.tsx` error when component unmounts during async module loading
  - Added null check before appending DOM elements
  - Prevents `Cannot read properties of null` errors
- **UI Improvements (v1.19.0-r016.2-016.4)**:
  - **Remove Button**: Changed from X icon (20x20px) to trash icon (32x32px) for better touch targets
  - **Expand/Collapse Button**: Increased size to 32x32px with larger icons for better usability
  - **Reduced Padding**: Changed feature-info component from 8px to 4px padding for more compact design
- **Hash Parameter Info Button (v1.19.0-r016.5-016.6)**: Added info button next to layer title showing hash parameter search options
  - Displays info button when queries from the same layer have shortIds configured
  - Tooltip shows all available shortIds for that layer with usage examples
  - Format: "This layer can be searched using the shortIds pin and major using #shortId=value in the URL"
  - Lists each query with its shortId: "Parcel number: #pin=value"
  - Makes hash parameter search capability discoverable to end users
- **Display Order Feature (v1.19.0-r016.6-016.7)**: Added optional display order field for query items
  - Optional `order` number field in query item settings
  - Lower numbers appear first (e.g., order: 1, 2, 3...)
  - Queries without order maintain their original relative positions
  - Default selection respects display order (selects query with lowest order value)
  - Solves the problem of having to manually reorder queries in config or recreate them when you want a new query at the top
  - Particularly valuable when managing 15-20+ queries

### Technical Details

#### Architecture
- Uses Experience Builder's shared entry pattern for code reuse
- Follows Experience Builder widget development best practices
- Implements proper data source lifecycle management
- Uses React hooks and functional components throughout

#### Data Source Management
- `DataSourceComponent` automatically manages data source lifecycle
- No manual data source destruction required
- Proper status management (NotReady → Unloaded → Loaded)
- Handles data source creation race conditions

#### State Management
- Priority-based query selection (hash parameters > UI state)
- Manual tab switch tracking to prevent auto-switch conflicts
- Query execution key for forcing component remounts
- Proper cleanup when switching between queries

#### Hash Parameter Handling
- Detects hash parameters in `componentDidMount` and `hashchange` events
- Matches hash parameters to queries by `shortId`
- Automatically removes hash parameters after use
- Handles multiple hash parameters gracefully

#### Grouping Implementation
- Two-dropdown architecture for clear hierarchy
- Groups displayed by `groupDisplayName` in first dropdown
- Ungrouped queries displayed by `item.name` in first dropdown
- Group queries displayed by `searchAlias` (or `jimuFieldName`) in second dropdown
- Conditional rendering of second dropdown (only for grouped queries)

## [Unreleased]

### Planned
- Enhanced keyboard navigation for dropdowns
- Search/filter functionality for queries within groups
- Nested group support
- Group icons and descriptions
- Drag-and-drop query reordering

---

## Version Format

- **Major**: Breaking changes or major feature additions
- **Minor**: New features, enhancements, or significant improvements
- **Patch**: Bug fixes, minor improvements, or documentation updates

## Release Notes

For detailed release notes and migration guides, see the [GitHub Releases](https://github.com/MapSimple-Org/ExB-Simple/releases) page.

