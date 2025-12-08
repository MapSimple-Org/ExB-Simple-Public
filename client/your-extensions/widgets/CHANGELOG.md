# Changelog

All notable changes to MapSimple Experience Builder widgets will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
  - `?debug=HASH,FORM` - Enable specific features
  - `?debug=false` - Disable all logs (default)
- **Result Pagination**: Support for multi-page and lazy load pagination styles
- **Widget Footer**: Displays "QuerySimple by MapSimple.org v1.19.0" in all arrangement modes

#### HelperSimple
- **Hash Parameter Monitoring**: Monitors URL hash changes and opens managed widgets
- **Widget Opening**: Automatically opens QuerySimple widget based on hash parameters
- **Deep Linking Support**: Enables deep linking from external sources

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

