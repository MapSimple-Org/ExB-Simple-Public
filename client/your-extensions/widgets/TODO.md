# QuerySimple Widget TODOs

## Bugs to Address (Presentation Discovery)

### 1. Expansion State Sticky on Hash Switch
**Status:** ✅ RESOLVED (r017.41)  
**Issue**: When switching between queries via URL hash (e.g., `#pin` to `#major`), the widget remembers the expansion state of the *previous* query instead of honoring the `resultExpandByDefault` config of the new query.
**Cause**: `QueryTaskResult` state persistence during rapid `configId` transitions.

### 2. "Dirty" Hash Switching
**Status:** ✅ RESOLVED (r017.41)  
**Issue**: Switching from one hash parameter to another (e.g., `#pin=123` to `#pin=456` or `#major=789`) sometimes "remembers" the first query's value or fails to fully refresh the form/results for the new parameter.
**Cause**: State persistence in `QueryTask` or `QueryTaskList` consumption logic.

### 3. HelperSimple URL Parameter Support
**Status:** ✅ RESOLVED (r017.41)  
**Feature**: HS should listen for both `#shortid=value` (hash) and `?shortid=value` (query string).
**Task**: Update HS listener logic and info discovery icon to reflect both supported formats.

---

## Future Considerations & Best Practices (Thinking Phase)

### 1. SQL Injection & Input Validation
**Status:** 💭 Thinking  
**Priority:** High  
**Source:** User Request (r17.41)  
**Goal:** Prevent "fool things" from being entered into search queries.
- **SQL Injection Protection**: Ensure user input is properly escaped/sanitized before being injected into `WHERE` clauses (beyond `DataSourceUtils`).
- **Input Sanitization**: Automatically strip leading/trailing whitespace from all query inputs.
- **Empty Query Prevention**: Block execution of queries with empty strings or whitespace-only inputs.
- **Configurable Validation Rules**: 
  - Add per-query config options for validation (e.g., `minCharacters`, `regexPattern`).
  - Example: A "Major" query might require exactly 6 digits.
  - Expose these settings in the Widget Setting page so authors can tailor them.
- **UI Feedback**: Show clear validation errors to the user before they click "Apply."

---

## High Priority - Immediate Next Steps

### 0. Esri Standards & Architectural Hardening
**Status:** Pending (Targeting Separate Branch)
**Priority:** Critical
**Source:** Architectural Review
**Goal:** Align codebase with official Esri patterns to ensure "human-readable" and "Esri-standard" code for external review.
- **Thin Shell Pattern**: Refactor `widget.tsx` (1,600+ lines) into a "dumb shell" by moving logic into custom hooks (`useUrlConsumption`, `useSelectionRestoration`, `useVisibility`).
- **Standardized JSDoc**: Apply consistent JSDoc headers to all exported functions and components to match `@esri` standards.
- **React Ref Migration**: Replace direct DOM selectors (`document.querySelector`) with React Refs in `QueryTaskForm` for cleaner component isolation.
- **Modular State Persistence**: Isolate the "Add/Remove Results" state management to prevent side effects in standard data source selection.

### 0. Adopt TDD Workflow
**Status:** ✅ IMPLEMENTED (r017.43)  
**Priority:** Critical  
**Source:** User Request  
**Goal:** Write tests *before* implementation to ensure stability and define clear win conditions.
- **Documentation**: Updated `DEVELOPMENT_GUIDE.md` with TDD section.
- **Execution**: Applied TDD to SQL sanitization hardening in r017.43.

### 1. SQL Injection & Input Validation
**Status:** ✅ INITIAL HARDENING (r017.47)  
**Priority:** High  
**Source:** Security/Stability  
- **Validation**: Added `isQueryInputValid` to prevent empty string submittals.
- **Sanitization**: Added `sanitizeQueryInput` to strip whitespace and escape single quotes.
- **Form Hardening**: Integrated validation into `QueryTaskForm` UI to disable "Apply" when input is invalid.
- **Smart Validation**: Exempted list-based selectors (Regional Trails) from mandatory text rules.
- **Stability**: Resolved circular structure crash in `clearResult` (r017.47).
- **TDD**: Verified logic with unit tests in `query-utils.test.ts`.

### 2. Solidify Playwright Testing & Auth
**Status:** ✅ Substantially Improved (r017.35+)  
**Priority:** High  
**Source:** User Request - Development Velocity

**Update**: Playwright tests have been "humanized" with intelligent delays and scoped locators. A "Fresh Data Key" system was implemented to ensure tests wait for new data to render before asserting. Methodical sessions are now reliable across multiple widgets.

---

### 2. Kill Query Performance Bottlenecks
**Status:** ✅ Completed (r017.39)  
**Priority:** Critical  
**Source:** User Feedback - Slowness

**Issues Resolved**: 21s queries reduced to 1.4s via Universal SQL Optimizer, Attribute Stripping, Geometry Generalization, and Instant UI response.

---

### 3. Structural Refactor (Hook & Shell Architecture) - r018.0+
**Status:** 🟢 **IN PROGRESS** (Chunk 1 Complete - r018.10)  
**Priority:** High  
**Source:** Code Review - "Simple is Key"  
**Branch:** `feature/chunk-rock`

**Update**: Migrating `widget.tsx` logic into Manager Classes and Custom Hooks using incremental, safe approach with extensive logging and testing.

**Progress:**
- ✅ **Chunk 1 Complete (r018.10)**: URL Parameter Consumption migrated to `UrlConsumptionManager` class
- ✅ **Chunk 2 Complete (r018.13)**: Widget Visibility Engine migrated to `WidgetVisibilityManager` class
- ⏳ **Chunk 3 Next**: Selection & Restoration (HIGH RISK - previous attempt failed)
- ⏳ **Chunks 4-7**: Graphics Layer, Accumulated Records, Map View, Events

**Implementation Plan:**
1. **De-bloat `widget.tsx`**: Move orchestrator logic into manager classes and custom hooks (using manager pattern for class component compatibility).
2. **Remove Brittle Timeouts**: Replace `setTimeout(..., 50)` calls with robust Promise chaining or framework hooks (e.g., `useUpdateEffect`).
3. **Event-Driven UI**: Replace polling for identify popups with native framework events if available.
4. **ESM Imports**: Resolve circular dependencies to allow standard `import` syntax instead of `require()`.
5. **Deduplication Logic**: Standardize composite record keys (`${dsId}_${objectId}`) earlier in the data pipeline.

**Reference:** See `COMPLETE_MIGRATION_PLAN.md` for detailed chunk-by-chunk migration strategy and `CHUNK_TESTING_GUIDE.md` for testing instructions.

---

### 3a. Remove Non-Graphics Layer Implementation (BREAKING CHANGE) - Post r018.0
**Status:** 📌 **DEFERRED** (After r018.0 complete)  
**Priority:** High (Code Simplification)  
**Source:** User Request (r018.13)  
**Target Release:** r019.0 (Breaking change requires major version bump)

**Problem:** The dual-path implementation (graphics layer vs. layer selection) adds complexity and causes issues:
- Zoom functionality breaks when graphics layer is disabled (mapView not available)
- ~44 conditional checks throughout codebase
- Inconsistent behavior between modes
- Graphics layer implementation is cleaner and more reliable

**Note:** As of r018.13, the non-graphics layer implementation is **not being tested or maintained**. It will be removed entirely in r019.0. Do not spend time debugging or fixing issues with `useGraphicsLayerForHighlight: false` mode.

**Solution:** Remove `useGraphicsLayerForHighlight` config option entirely. Always use graphics layer when `highlightMapWidgetId` is configured.

**Files to Modify (44 references across 7 files):**

1. **`query-simple/src/config.ts`**:
   - Remove `useGraphicsLayerForHighlight?: boolean` from `IMConfig` interface
   - Keep `highlightMapWidgetId?: string` (make it required or always check for it)

2. **`query-simple/src/setting/setting.tsx`**:
   - Remove the toggle switch for `useGraphicsLayerForHighlight` (lines ~299-307)
   - Remove conditional wrapper around map selector (line ~318)
   - Always show map selector if `highlightMapWidgetId` exists
   - Update translations to remove graphics layer toggle text

3. **`query-simple/src/runtime/widget.tsx`**:
   - Always render `JimuMapViewComponent` if `highlightMapWidgetId` is configured (remove `useGraphicsLayerForHighlight` check on line ~1486)
   - Always initialize graphics layer in `handleJimuMapViewChanged` (remove conditional on line ~406)
   - Remove all `config.useGraphicsLayerForHighlight` checks throughout
   - Remove `useGraphicsLayerForHighlight` prop passing to child components

4. **`query-simple/src/runtime/query-task.tsx`**:
   - Remove `useGraphicsLayerForHighlight` prop from `QueryTaskProps` interface
   - Remove all conditional logic based on `useGraphicsLayerForHighlight`
   - Always pass `graphicsLayer` and `mapView` when available
   - Remove conditional initialization checks (line ~610)

5. **`query-simple/src/runtime/query-result.tsx`**:
   - Remove `useGraphicsLayerForHighlight` prop from `QueryTaskResultProps` interface
   - Remove all conditional logic based on `useGraphicsLayerForHighlight`
   - Always pass `graphicsLayer` and `mapView` when available

6. **`query-simple/src/runtime/query-task-list.tsx`**:
   - Remove `useGraphicsLayerForHighlight` prop passing to `QueryTask`

7. **`query-simple/src/runtime/selection-utils.ts`**:
   - Remove `useGraphicsLayer: boolean` parameter from `selectRecordsInDataSources()` function signature
   - Always use graphics layer when `graphicsLayer` and `mapView` are provided
   - Remove conditional logic (lines ~110-158)
   - Update all call sites to remove `useGraphicsLayer` argument

**Migration Strategy:**
- **Version Manager**: Add migration in `version-manager.ts` to set `highlightMapWidgetId` from existing config if `useGraphicsLayerForHighlight` was true
- **Breaking Change**: Document in CHANGELOG.md that `useGraphicsLayerForHighlight` config option is removed
- **Testing**: Verify zoom works correctly, selection highlighting works, and graphics layer is always initialized when map widget is configured

**Benefits:**
- Removes ~44 conditional checks
- Fixes zoom issue (mapView always available)
- Consistent behavior across all implementations
- Simpler codebase to maintain
- Graphics layer is the cleaner, more reliable implementation

**Note:** This is a breaking change and should be implemented as r019.0 (major version bump). Do not implement until r018.0 migration is complete.

---

## High Priority - Best Practices

### 3. Standardize Error Handling Pattern
**Status:** ✅ Completed  
**Priority:** High  
**Date Completed:** 2025-12-06

---

### 4. Ensure WCAG 2.x Compliance
**Status:** Pending  
**Priority:** High  

---

### 5. Fix Graphics Layer Clearing and Sticky Selection (Bug #1 & #2)
**Status:** ✅ Completed  
**Priority:** High  
**Date Completed:** 2025-12-18

---

## Medium Priority - Code Quality Improvements

### 6. Update Version Managers
**Status:** Pending  
**Priority:** Medium  

---

### 7. Add React.memo() to Function Components
**Status:** Pending  
**Priority:** Medium  

---

### 8. Add Marker.io for User Feedback
**Status:** Pending  
**Priority:** Medium  

---

### 9. Set Up GitHub Actions CI/CD
**Status:** Pending  
**Priority:** Medium  

---

## Low Priority - Code Consistency

### 10. Standardize i18n Pattern
**Status:** Pending  
**Priority:** Low  

---

### 11. Enhance Widget Context Structure
**Status:** Pending  
**Priority:** Low  

---

## Feature Requests & Future Work

### 1. Map Identify to QS Integration (The "Add to Results" Action)
**Status:** 💭 Planned (r17/r18)  
**Priority:** Medium/High  
**Source:** User Request (Dec 2025)  
**Goal**: Allow users to identify features on the map and add them to the current QS result list.
- **Data Action**: Create a custom Data Action that appears in Map Popups.
- **Smart Visibility**: Action only appears if a QS widget is **Open** AND its **config allows it**.
- **Dynamic Toggle**: Automatically switches between "Add to" and "Remove from" based on current results.
- **Mode Evolution**: Automatically upgrades "New" mode to "Add" mode to prevent data loss.
- **Event Bus**: Use custom events to pass identified features to the active QS widget.
- **Documentation**: See [MAP_IDENTIFY_INTEGRATION.md](./MAP_IDENTIFY_INTEGRATION.md) for the full architecture.

---

## Feature Requests & Pending Tasks

### 1. Multiple QS Widgets Results Interference
**Status:** Pending

### 2. HelperSimple Widget Display Selected Features
**Status:** Pending

### 3. No Results Feedback - Missing User Notification
**Status:** Pending  

### 4. Update Paging Configuration Options in Settings UI
**Status:** Pending  
