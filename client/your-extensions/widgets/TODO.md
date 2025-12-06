# QuerySimple Widget TODOs

## High Priority - Code Quality & Best Practices

### 1. Standardize Error Handling Pattern
**Status:** ✅ Completed  
**Priority:** High  
**Source:** Code Review - Development Guide Compliance  
**Date Completed:** 2025-12-06

**Issue:** Error handling is inconsistent across components. Some use try-catch with console.error, some silently catch, some use debug logging. Need consistent pattern that follows Development Guide.

**Current State:**
- `query-task.tsx`: Uses try-catch with console.warn for race conditions
- `query-result.tsx`: Uses try-catch with console.error, some silent catches
- `add-to-map-action.tsx`: Uses try-catch with debugLogger.log + console.error
- No error state management or user-facing error display in most components

**Desired Behavior:**
- Consistent error handling pattern following Development Guide
- Use error state with `React.useState<string>(null)`
- Display errors using `DataSourceTip` component
- Use debug logger for development debugging
- Proper error boundaries where appropriate

**Implementation Plan:**
1. Review all error handling locations:
   - `query-task.tsx` (lines 296-302, 448-450, 485-486)
   - `query-result.tsx` (lines 179-181, 236-238, 347-348)
   - `add-to-map-action.tsx` (lines 201-210)
   - `helper-simple/src/runtime/widget.tsx` (lines 129-135)
2. Create error state management pattern:
   ```typescript
   const [error, setError] = React.useState<string>(null)
   try {
     await performOperation()
   } catch (err) {
     setError(err.message)
     debugLogger.log('FEATURE', { error: err.message })
     console.error('Operation failed:', err)
   }
   {error && <DataSourceTip error={error} />}
   ```
3. Update each component to use consistent pattern
4. Consider error boundaries for widget-level error handling
5. Test error scenarios to ensure user-friendly error messages

**Files Updated:**
- ✅ `query-simple/src/runtime/query-task.tsx` - Uses error state, ErrorMessage component, debugLogger
- ✅ `query-simple/src/runtime/query-result.tsx` - Uses error state, ErrorMessage component, debugLogger
- ✅ `query-simple/src/data-actions/add-to-map-action.tsx` - Uses debugLogger, returns false on error (see code comments for rationale)
- ✅ `helper-simple/src/runtime/widget.tsx` - Uses console.error with debug gate (see code comments for rationale)

**Implementation Notes:**
- Main components (`query-task.tsx`, `query-result.tsx`) follow full standardized pattern:
  - Error state with `React.useState<string>(null)`
  - User-facing error display using `ErrorMessage` component
  - Debug logging with `debugLogger` and gated console output
- Data action (`add-to-map-action.tsx`) returns false on error rather than displaying errors:
  - Acceptable because data actions are called from dropdowns where error display would be intrusive
  - Debug logging provides sufficient information for development
  - See code comments for future improvement suggestions
- Helper widget (`helper-simple/widget.tsx`) uses console.error with debug gate:
  - Acceptable because helper widget is designed to fail silently
  - Error is gated by debug parameter check
  - See code comments for migration to debugLogger suggestion

**Related:**
- Development Guide: Best Practices > Error Handling
- Uses shared `DataSourceTip` component from `widgets/shared-code/common`
- Uses shared `ErrorMessage` component from `widgets/shared-code/common`

---

### 2. Expand Test Coverage
**Status:** Pending  
**Priority:** High  
**Source:** Code Review - Development Guide Compliance

**Issue:** Limited test coverage. Only one E2E test exists, no unit tests found. Development Guide recommends comprehensive testing strategy.

**Current State:**
- Only E2E test: `tests/e2e/query-simple/add-to-map.spec.ts`
- No unit tests in widget directories
- No tests for HelperSimple widget
- No tests for core query functionality, hash parameters, selection, etc.

**Desired Behavior:**
- Unit tests co-located with components (e.g., `widget.test.tsx`)
- E2E tests for major workflows:
  - Query execution
  - Hash parameter handling
  - Selection management
  - HelperSimple widget opening behavior
  - Multiple widget interactions
- Test helpers in `tests/e2e/fixtures/test-helpers.ts`

**Implementation Plan:**
1. **Unit Tests** (co-located with components):
   - `query-simple/src/runtime/widget.test.tsx` - Test hash parameter handling, widget lifecycle
   - `query-simple/src/runtime/query-task.test.tsx` - Test query execution, state management
   - `query-simple/src/runtime/selection-utils.test.tsx` - Test selection utilities
   - `query-simple/src/runtime/debug-logger.test.tsx` - Test debug logging
   - `helper-simple/src/runtime/widget.test.tsx` - Test hash monitoring, widget opening

2. **E2E Tests** (in `tests/e2e/`):
   - `query-simple/query-execution.spec.ts` - Test query form, execution, results display
   - `query-simple/hash-parameters.spec.ts` - Test hash parameter detection and removal
   - `query-simple/selection-management.spec.ts` - Test selection, clear, multiple widgets
   - `helper-simple/hash-tests.spec.ts` - Test HelperSimple hash monitoring and widget opening
   - Expand `add-to-map.spec.ts` with more scenarios

3. **Test Helpers** (enhance `tests/e2e/fixtures/test-helpers.ts`):
   - Add methods for common test operations
   - Standardize widget interaction patterns
   - Add helper methods for hash parameter testing

**Files to Create:**
- `query-simple/src/runtime/widget.test.tsx`
- `query-simple/src/runtime/query-task.test.tsx`
- `query-simple/src/runtime/selection-utils.test.tsx`
- `query-simple/src/runtime/debug-logger.test.tsx`
- `helper-simple/src/runtime/widget.test.tsx`
- `tests/e2e/query-simple/query-execution.spec.ts`
- `tests/e2e/query-simple/hash-parameters.spec.ts`
- `tests/e2e/query-simple/selection-management.spec.ts`
- `tests/e2e/helper-simple/hash-tests.spec.ts`

**Related:**
- Development Guide: Testing Strategy
- Existing test: `tests/e2e/query-simple/add-to-map.spec.ts`
- Test helpers: `tests/e2e/fixtures/test-helpers.ts`

---

## Medium Priority - Code Quality Improvements

### 3. Update Version Managers
**Status:** Pending  
**Priority:** Medium  
**Source:** Code Review - Development Guide Compliance

**Issue:** Version managers are placeholder implementations. They should match manifest.json version (1.19.0) and include proper migration logic.

**Current State:**
- `query-simple/src/version-manager.ts`: Version `1.0.0`, just returns oldConfig
- `helper-simple/src/version-manager.ts`: Version `1.0.0`, just returns oldConfig
- Both manifest.json files specify version `1.19.0`

**Desired Behavior:**
- Version managers should match manifest.json version
- Include proper migration logic if config structure changes
- Document what changed in each version
- Follow Development Guide pattern

**Implementation Plan:**
1. Update both version managers to version `1.19.0`
2. Review config structure changes since initial version
3. Add migration logic if needed (check for config property changes)
4. Document version history in comments
5. Test version migration with old configs

**Files to Update:**
- `query-simple/src/version-manager.ts`
- `helper-simple/src/version-manager.ts`

**Example Pattern:**
```typescript
class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.19.0',
    description: 'Initial release version',
    upgrader: (oldConfig) => {
      // Migration logic if needed
      return oldConfig
    }
  }]
}
```

**Related:**
- Development Guide: Best Practices > Version Management
- Manifest files: `query-simple/manifest.json`, `helper-simple/manifest.json`

---

### 4. Add React.memo() to Function Components
**Status:** Pending  
**Priority:** Medium  
**Source:** Code Review - Development Guide Compliance

**Issue:** Many function components don't use `React.memo()` for performance optimization. Development Guide recommends this for expensive components.

**Current State:**
- Function components without memoization:
  - `QueryTask` (query-task.tsx)
  - `QueryTaskResult` (query-result.tsx)
  - `QueryTaskList` (query-task-list.tsx)
  - `QueryTaskForm` (query-task-form.tsx)
  - `QueryTaskListItem` (query-task-list-item.tsx)
  - `PagingList` (paging-list.tsx)
  - `LazyList` (lazy-list.tsx)
  - `InteractiveDraw` (interactive-draw-tool.tsx)

**Desired Behavior:**
- Wrap function components with `React.memo()` when they receive complex props
- Use memoization for components that re-render frequently
- Follow Development Guide performance recommendations

**Implementation Plan:**
1. Review each function component for memoization needs
2. Add `React.memo()` wrapper to components that:
   - Receive complex object/array props
   - Are rendered in lists
   - Have expensive render logic
3. Use custom comparison function if needed for complex props
4. Test performance impact

**Files to Update:**
- `query-simple/src/runtime/query-task.tsx`
- `query-simple/src/runtime/query-result.tsx`
- `query-simple/src/runtime/query-task-list.tsx`
- `query-simple/src/runtime/query-task-form.tsx`
- `query-simple/src/runtime/query-task-list-item.tsx`
- `query-simple/src/runtime/paging-list.tsx`
- `query-simple/src/runtime/lazy-list.tsx`
- `query-simple/src/runtime/interactive-draw-tool.tsx`

**Example Pattern:**
```typescript
export const QueryTask = React.memo((props: QueryTaskProps) => {
  // Component implementation
})
```

**Related:**
- Development Guide: Best Practices > Performance

---

### 5. Add Marker.io for User Feedback
**Status:** Pending  
**Priority:** Medium  
**Source:** User Request - Production Deployment

**Issue:** Need a mechanism for users to provide recorded feedback (screenshots, annotations, bug reports) when the application is deployed to production.

**Desired Behavior:**
- Integrate Marker.io widget/script into Experience Builder pages
- Users can click feedback button to annotate screenshots and submit feedback
- Feedback should be captured with context (URL, browser info, etc.)
- Only show in production/deployed environments, not in development

**Implementation Plan:**
1. Sign up for Marker.io account and get project ID/API key
2. Add Marker.io script to Experience Builder app configuration
3. Configure Marker.io settings:
   - Set up project workspace
   - Configure feedback collection settings
   - Set up integrations (email, Slack, Jira, etc.) if needed
4. Add conditional loading (only in production, not localhost)
5. Test feedback submission flow
6. Document Marker.io setup in deployment guide

**Files to Update/Create:**
- Experience Builder app configuration (where scripts are injected)
- Deployment documentation (marker-io-setup.md or similar)

**Resources:**
- Marker.io documentation: https://marker.io/docs
- Marker.io integration guide: https://marker.io/docs/integration

**Related:**
- Production deployment checklist
- User feedback collection strategy

---

## Low Priority - Code Consistency

### 6. Standardize i18n Pattern
**Status:** Pending  
**Priority:** Low  
**Source:** Code Review - Development Guide Compliance

**Issue:** Mixed i18n patterns. Some use `hooks.useTranslation()`, some use `intl.formatMessage()`. Both work, but consistency would be better.

**Current State:**
- `query-task.tsx`: Uses `hooks.useTranslation(defaultMessage)`
- `query-result.tsx`: Uses `hooks.useTranslation(defaultMessage)` + `useIntl()`
- `widget.tsx`: Uses `this.props.intl.formatMessage()`

**Desired Behavior:**
- Standardize on one pattern (recommend `hooks.useTranslation()` as it's more common)
- Update all components to use consistent pattern
- Document preferred pattern in Development Guide if needed

**Implementation Plan:**
1. Choose preferred pattern (recommend `hooks.useTranslation()`)
2. Update `widget.tsx` to use `hooks.useTranslation()` pattern
3. Review and standardize `query-result.tsx` usage
4. Update Development Guide if pattern differs from current recommendation

**Files to Update:**
- `query-simple/src/runtime/widget.tsx`
- `query-simple/src/runtime/query-result.tsx` (if needed)

**Related:**
- Development Guide: Best Practices > Internationalization

---

### 7. Enhance Widget Context Structure
**Status:** Pending  
**Priority:** Low  
**Source:** Code Review - Development Guide Compliance

**Issue:** Widget context is minimal (just a string). Could be more structured with TypeScript interface if more state is needed.

**Current State:**
```typescript
export const QueryWidgetContext = React.createContext<string>(null)
```

**Desired Behavior:**
- More structured context value if needed
- TypeScript interface for context value
- Better type safety

**Implementation Plan:**
1. Assess if context needs more than just layout identifier
2. If yes, create TypeScript interface for context value
3. Update context provider and consumers
4. If current simple string is sufficient, document why

**Files to Review:**
- `query-simple/src/runtime/widget-context.tsx`
- All context consumers (search for `QueryWidgetContext`)

**Related:**
- Development Guide: Widget Architecture > Widget Context Pattern

---

## Pending Tasks

### 1. Multiple QS Widgets Results Interference
**Status:** Pending

**Issue:** When searching on one QuerySimple widget removes records from another widget's search results, but the other widget doesn't realize those results are gone.

**Notes:** Need to explore usability implications and determine the best approach before implementing a fix.

---

### 2. HelperSimple Widget Display Selected Features
**Status:** Pending

**Issue:** Explore using HelperSimple widget to display selected features on screen (similar to map widget behavior) when select options are not shown.

**Notes:** May require HS widget to match map size or be positioned where rendering should occur.

---

### 3. Grouping - Simplify Single Group UI
**Status:** Pending

**Current State:**
- When groups exist, first dropdown shows all groups + '--- Ungrouped Queries ---' option
- Second dropdown shows queries within selected group (only if group has >1 query)
- Separate dropdown shows ungrouped queries when 'Ungrouped Queries' is selected

**Desired Behavior:**

1. **Single Group Scenario** (all queries belong to one group):
   - First dropdown ('Search Layer') should show only the single group option (still a dropdown for consistency)
   - Second dropdown ('Search Alias') should always be visible showing all queries in that group (e.g., 'Parcel Number', 'Major Number')

2. **Multiple Groups Scenario:**
   - First dropdown shows all groups + '--- Ungrouped Queries ---' if ungrouped queries exist
   - Second dropdown ('Search Alias') only shows when:
     * A group is selected (not 'Ungrouped Queries')
     * AND that group has multiple queries
   - When 'Ungrouped Queries' is selected: skip second dropdown, go directly to query form

3. **No Groups Scenario:**
   - Single dropdown showing all queries (current behavior is fine)

**Implementation Plan:**
- Modify `query-task-list.tsx` logic:
  1. Detect if all queries belong to single group (`groupOrder.length === 1 && ungrouped.length === 0`)
  2. In single group case: always show second dropdown with all queries in that group
  3. When 'Ungrouped Queries' selected: don't show second dropdown, directly show query form
  4. Ensure `selectedGroupId` state properly handles single group scenario
  5. Update `getSelectedQueryItem()` to handle single group case correctly

---

### 4. Replace "Show on Map" Action with Custom Feature Selection Process
**Status:** Completed

**Current State:**
- 'Show on map' data action is excluded in manifest.json but still exists in framework
- Uses different selection mechanism than QuerySimple widget's search process
- Hard to clear/navigate when used
- Creates inconsistent behavior between search results and manually added features
- Current search process uses `selectRecordsAndPublish()` from `selection-utils.ts` which selects on origin layer and publishes messages

**Desired Behavior:**
- Replace 'Show on map' with custom action that uses QuerySimple's selection process
- Use `selectRecordsAndPublish()` from `selection-utils.ts` (selects on origin layer and publishes messages)
- Validate/search that values don't already exist before adding features
- This could help resolve the 2 QS widgets interference issue by using consistent selection logic
- Consider renaming action to something more meaningful than 'Show on map'

**Implementation Plan:**
1. ✅ Create custom data action (or modify existing) that:
   - ✅ Uses `selectRecordsAndPublish()` to add features to map with proper highlighting
   - ✅ Handles zoom behavior consistently with search results (respects zoomToSelected setting)
   - ✅ Supports runtime zoom override from form
2. ✅ Exclude 'arcgis-map.showOnMap' properly in manifest.json (fixed format: widgetName.actionName)
3. ✅ Action works with multiple QS widgets (each widget manages its own selection)
4. ✅ Named action 'Add to Map' (lowercase 'm')
5. ✅ Clearing behavior works - features removed via Clear Results button
6. ✅ Icon matches Show on Map icon (copied show-on-map.svg to widget assets)
7. ✅ Action appears in dropdown (at end, which is acceptable)

**Related:**
- Addresses "multiple-qs-widgets-results-interference" TODO by using consistent selection logic
- May require coordination with HelperSimple widget if displaying selected features

---

### 5. Fix Playwright E2E Test Authentication
**Status:** Pending

**Issue:** When running Playwright E2E tests (e.g., `test:e2e:add-to-map`), the authentication setup window still pops up even though `storageState: 'tests/.auth/user.json'` is configured in `playwright.config.ts`. The saved authentication state should be used automatically.

**Current State:**
- Auth setup creates `tests/.auth/user.json` successfully
- `playwright.config.ts` has `storageState: 'tests/.auth/user.json'` configured for chromium project
- Tests still prompt for authentication instead of using saved state

**Desired Behavior:**
- Tests should automatically use saved authentication state
- No authentication popup should appear when running tests
- Tests should run seamlessly after initial auth setup

**Investigation Needed:**
- Verify `storageState` path is correct and file is accessible
- Check if Playwright is loading the storage state correctly
- Verify the auth state file format is correct
- Check if there are any environment variables or config overrides preventing storage state from being used
- Consider if the storage state needs to be refreshed periodically

**Files:**
- `playwright.config.ts` - Configuration file
- `tests/e2e/auth-setup.ts` - Auth setup script
- `tests/e2e/query-simple/add-to-map.spec.ts` - Test that's failing


