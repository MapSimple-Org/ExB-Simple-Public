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
- ✅ **Chunk 3 Complete (r019.22)**: Selection & Restoration migrated to `SelectionRestorationManager` class
- ✅ **Chunk 4 Complete (r018.25)**: Graphics Layer Management migrated to `GraphicsLayerManager` class
- ✅ **Chunk 5 Complete (r018.58)**: Accumulated Records Management migrated to `AccumulatedRecordsManager` class
- ✅ **Chunk 6 Complete (r018.18)**: Map View Management migrated to `MapViewManager` class
- ✅ **Chunk 7 Complete (r018.111)**: Event Handling migrated to `EventManager` class

**Implementation Plan:**
1. **De-bloat `widget.tsx`**: Move orchestrator logic into manager classes and custom hooks (using manager pattern for class component compatibility).
2. **Remove Brittle Timeouts**: Replace `setTimeout(..., 50)` calls with robust Promise chaining or framework hooks (e.g., `useUpdateEffect`).
3. **Event-Driven UI**: Replace polling for identify popups with native framework events if available.
4. **ESM Imports**: Resolve circular dependencies to allow standard `import` syntax instead of `require()`.
5. **Deduplication Logic**: Standardize composite record keys (`${dsId}_${objectId}`) earlier in the data pipeline.

**Reference:** See [`docs/architecture/COMPLETE_MIGRATION_PLAN.md`](docs/architecture/COMPLETE_MIGRATION_PLAN.md) for detailed chunk-by-chunk migration strategy and [`docs/architecture/CHUNK_TESTING_GUIDE.md`](docs/architecture/CHUNK_TESTING_GUIDE.md) for testing instructions.

**Status:** ✅ **COMPLETE** - All 7 chunks migrated successfully (r019.22)

---

### 2a. Esri Standards Alignment for Submission
**Status:** 📋 **TODO** (Pre-submission)  
**Priority:** Medium  
**Source:** Esri Standards Review (2026-01-10)  
**Reference:** See [`docs/development/ESRI_STANDARDS_ALIGNMENT.md`](docs/development/ESRI_STANDARDS_ALIGNMENT.md) for full analysis

**Action Items:**

**HIGH Priority:**
1. **Version Management Documentation**
   - [ ] Add comment in `version.ts` explaining it's for **internal development tracking** (not config migration)
   - [ ] Document that `version-manager.ts` is for config schema upgrades (currently empty - no breaking changes yet)
   - [ ] Clarify in README that `v1.19.0-r019.22` format is internal, public version is `1.19.0`

**MEDIUM Priority (Optional - if Esri requests):**
2. **Code Comments Simplification**
   - [ ] Review JSDoc comments and simplify to Esri style (remove `@since`, `@see`, `@example`)
   - [ ] Keep "what/why" comments, remove "how" comments
   - [ ] Focus on public API documentation only

3. **Public Distribution Verification**
   - [ ] Verify GitHub remote branch has clean widget folders (no .md files)
   - [ ] Confirm only these files in public distribution:
     - `README.md` (root)
     - Widget folders with `src/`, `manifest.json`, `config.json`, `icon.svg`
     - `shared-code/` (if included)
     - No development artifacts

**LOW Priority (Nice to Have):**
4. **Companion Widget Documentation**
   - [ ] Add "Companion Widgets" section to README explaining the suite concept
   - [ ] Clarify that QuerySimple + HelperSimple work together (not separate widgets)

**Current Assessment:** 95%+ Esri-compliant. Public distribution structure matches Esri patterns perfectly.

---

### 2b. Tab-Level Component Extraction (Pre-Graphics Tab Development)
**Status:** 📋 **TODO** (Post-Team Deployment)  
**Priority:** Critical (Architectural Foundation)  
**Source:** Architecture Planning (2026-01-10)  
**Goal:** Extract Query and Results tab logic into separate components BEFORE building Graphics tab to prevent `query-task.tsx` from growing beyond 3000 lines.

**Problem:** 
- Current `query-task.tsx`: 2999 lines (already a "God Component")
- Future Graphics tab would add ~600-1000 lines → 4000+ lines in one file
- Unmaintainable, untestable, merge-conflict nightmare

**Architecture Target:**
```
query-task.tsx (800 lines - orchestration only)
├─ tabs/QueryTabContent.tsx (800 lines - extracted)
├─ tabs/ResultsTabContent.tsx (1664 lines - already separate as query-result.tsx)
└─ tabs/GraphicsTabContent.tsx (600 lines - FUTURE)
```

**Phase 1: Extract Query Tab (Week 1-2 post-deployment)**
1. **Create `QueryTabContent.tsx`**
   - [ ] Extract all Query tab UI logic from `query-task.tsx`
   - [ ] Move SqlExpressionRuntime, AttributeFilter, SpatialFilter to new component
   - [ ] Create `use-sql-expression.ts` hook
   - [ ] Create `use-attribute-filter.ts` hook
   - [ ] Create `use-spatial-filter.ts` hook
   - [ ] Test query tab works identically
   - Target: `query-task.tsx` → ~1200 lines

2. **Simplify QueryTask to Tab Orchestrator**
   - [ ] Refactor `query-task.tsx` to ONLY handle tab switching and data flow
   - [ ] Extract shared data source logic to hooks
   - [ ] Extract query submission logic to `use-query-submission.ts`
   - [ ] Test all existing features (E2E regression)
   - Target: `query-task.tsx` → ~800 lines

**Phase 2: Graphics Tab Development (Week 3-4)**
3. **Create Graphics Tab Component (AFTER Phase 1)**
   - [ ] Create `tabs/GraphicsTabContent.tsx`
   - [ ] Implement `use-draw-tools.ts` (Sketch widget integration)
   - [ ] Implement `use-shape-selection.ts` (spatial query logic)
   - [ ] Implement `use-spatial-operators.ts` (intersects, contains, within)
   - [ ] Add buffer/distance options
   - [ ] E2E testing for shape-based selection
   - Target: `GraphicsTabContent.tsx` → ~600 lines

4. **Integration**
   - [ ] Add Graphics tab to QueryTask orchestrator (~10 lines)
   - [ ] Update tab bar UI
   - [ ] E2E testing (all tabs)
   - [ ] Documentation
   - Final: `query-task.tsx` remains ~800 lines

**Benefits:**
- ✅ Each tab independently testable
- ✅ Parallel development possible (multiple devs)
- ✅ Graphics tab can be feature-flagged
- ✅ Draw tools can be reused in other widgets
- ✅ Clear separation of concerns
- ✅ Future tabs easy to add (Search, Bookmarks, etc.)

**Files to Create:**
```
query-simple/src/runtime/
├── tabs/
│   ├── QueryTabContent.tsx (NEW - Phase 1)
│   ├── ResultsTabContent.tsx (rename query-result.tsx)
│   └── GraphicsTabContent.tsx (NEW - Phase 2)
│
└── hooks/
    ├── query-tab/
    │   ├── use-sql-expression.ts (NEW - Phase 1)
    │   ├── use-attribute-filter.ts (NEW - Phase 1)
    │   └── use-spatial-filter.ts (NEW - Phase 1)
    │
    ├── graphics-tab/
    │   ├── use-draw-tools.ts (NEW - Phase 2)
    │   ├── use-shape-selection.ts (NEW - Phase 2)
    │   └── use-spatial-operators.ts (NEW - Phase 2)
    │
    └── shared/
        ├── use-query-submission.ts (NEW - Phase 1)
        └── use-data-sources.ts (NEW - Phase 1)
```

**Critical Rule:** 
🚨 **DO NOT build Graphics tab inline** in current `query-task.tsx`. Extract Query tab FIRST.

**Estimated Effort:**
- Phase 1 (Query tab extraction): 1-2 weeks
- Phase 2 (Graphics tab development): 1-2 weeks
- **Total:** 2-4 weeks

**Target Release:** r020.0+ (Post team feedback)

**Documentation:**
- [ ] Create [`docs/architecture/GRAPHICS_TAB_ARCHITECTURE.md`](docs/architecture/GRAPHICS_TAB_ARCHITECTURE.md) with detailed implementation plan
- [ ] Add extraction guidelines to [`docs/development/DEVELOPMENT_GUIDE.md`](docs/development/DEVELOPMENT_GUIDE.md)
- [ ] Update architecture docs with tab-level refactoring strategy

---

### 2c. Configurable Point Zoom Buffer
**Status:** 📋 **TODO** (Post-Team Deployment)  
**Priority:** Low (Enhancement)  
**Source:** Demo Site Testing (2026-01-12)  
**Core Implementation:** ✅ **COMPLETE** (r019.29-30)  
**Goal:** Expose point zoom buffer distance in widget settings to allow authors to customize zoom level for point features.

**Problem (RESOLVED):** 
- Single points or overlapping points have zero-area extents (width=0, height=0)
- Without expansion, `mapView.goTo()` zooms to unusable scale
- **✅ FIXED in r019.29-30:** On-the-fly extent calculation with 300ft default buffer

**Current Implementation (r019.29-30):**
- `zoomToRecords()` creates extents on-the-fly for point geometries (read-only `.extent` property workaround)
- Detects zero-area extents and expands by 300 feet
- Buffer is automatically converted based on spatial reference:
  - Web Mercator (3857/102100): 300ft → ~91.44m
  - State Plane (feet-based): 300ft directly
- **✅ VERIFIED WORKING:** Single points (1) and multiple points (220+) zoom correctly
- Configurable via `ZoomToRecordsOptions.zeroAreaBufferFeet` parameter (not exposed in UI yet)

**Future Enhancement:**
1. **Add Widget Setting (Results page)**
   - [ ] Add `pointZoomBufferFeet?: number` to `QueryItemType` config interface (default: 300)
   - [ ] Add numeric input in `setting/results.tsx`:
     ```tsx
     <SettingRow label="Point zoom buffer (feet)">
       <NumericInput
         value={currentItem.pointZoomBufferFeet ?? 300}
         min={50}
         max={5000}
         step={50}
         onChange={(value) => onPropertyChanged('pointZoomBufferFeet', value)}
       />
     </SettingRow>
     ```
   - [ ] Add help text: "Buffer distance for zooming to single points (e.g., addresses, parcels)"

2. **Pass Through to Zoom Functions**
   - [ ] Update `getExtraActions()` in `query-result.tsx` to pass `pointZoomBufferFeet` to data actions
   - [ ] Update `createZoomToAction()` to accept and pass buffer to `zoomToRecords()`
   - [ ] Update `handleFormSubmitInternal()` in `query-task.tsx` to pass buffer during query result zoom
   - [ ] Update `toggleSelection()` in `query-result.tsx` to pass buffer during result click zoom

3. **Translation Strings**
   - [ ] Add to `runtime/translations/default.ts`:
     ```typescript
     pointZoomBuffer: 'Point zoom buffer (feet)',
     pointZoomBufferHelp: 'Buffer distance when zooming to single points or addresses',
     ```
   - [ ] Add to `setting/translations/default.ts`

4. **Testing**
   - [ ] Manual testing: Adjust buffer and verify zoom level changes
   - [ ] E2E test: Verify different buffer values produce different zoom levels
   - [ ] Test with both Web Mercator and State Plane coordinate systems

**Estimated Effort:** 2-4 hours

**Target Release:** r020.0+ (Post team feedback)

**Files to Modify:**
- `query-simple/src/config.ts` (add config property)
- `query-simple/src/setting/results.tsx` (add UI control)
- `query-simple/src/runtime/query-task.tsx` (pass buffer to zoom calls)
- `query-simple/src/runtime/query-result.tsx` (pass buffer to zoom calls)
- `query-simple/src/data-actions/zoom-to-action.tsx` (pass buffer)
- `query-simple/src/data-actions/index.tsx` (pass buffer from config)
- `query-simple/src/runtime/translations/default.ts` (add strings)
- `query-simple/src/setting/translations/default.ts` (add strings)

**Benefits:**
- ✅ Authors can optimize zoom level for their specific use case
- ✅ Addresses with large lots can use larger buffer (500-1000ft)
- ✅ Dense urban parcels can use smaller buffer (100-200ft)
- ✅ One setting controls all zoom behaviors (query results, result clicks, data actions)

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

### 8. Add BugHerd for User Feedback (Post-Export)
**Status:** Pending  
**Priority:** Medium  
**Timing:** After site export, before team deployment

**Workflow:**
1. ✅ Test configured page with all required searches
2. ✅ Export site via ExB (flattens to HTML/JS)
3. 🔲 Add BugHerd script to exported `index.html`
4. 🔲 Deploy to team for testing with visual feedback tool

**Integration:** Add BugHerd widget code to the **exported site's `index.html`**, not the widget source code. This allows team members to pin feedback directly on the page, and provides built-in Kanban board for issue tracking.

**Benefits:**
- Visual feedback (pin comments directly on page)
- Built-in Kanban board (no need for separate PM tool)
- Automatic screenshots and browser info
- Task assignment and workflow management

**Reference:** https://bugherd.com

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
- **Documentation**: See [`docs/features/MAP_IDENTIFY_INTEGRATION.md`](docs/features/MAP_IDENTIFY_INTEGRATION.md) for the full architecture.

---

## Feature Requests & Pending Tasks

### 0. REST API Network Monitoring
**Status:** 📌 **TODO** (Post-Chunk 3)  
**Priority:** Medium  
**Source:** Strategic Planning (r019.8)  
**Goal:** Add network interception to monitor ArcGIS REST API calls for debugging and validation.  

**Rationale:**  
- Provides early warning if SQL expression translation changes in future ExB versions
- Allows validation that our queries match Esri's query construction
- Critical fallback if `SqlExpressionRuntime` DOM workaround breaks
- Can be used to reverse-engineer query patterns for potential SimpleQEngine replacement

**Implementation Plan:**
1. Add `network-monitor.ts` utility class for programmatic fetch interception
2. Enable monitoring via debug flag or development mode
3. Add E2E tests with Playwright network interception
4. Log query URLs, WHERE clauses, performance metrics
5. Create comparison reports (our queries vs. Esri's queries)

**Files to Create/Modify:**
- `query-simple/src/runtime/network-monitor.ts` (new)
- `query-simple/src/runtime/widget.tsx` (integrate monitoring)
- `tests/e2e/query-simple/network-monitoring.spec.ts` (new)
- `shared-code/common/debug-logger.ts` (add NETWORK feature)

**Documentation:**
- ✅ [`docs/technical/REST_ENDPOINT_MONITORING.md`](docs/technical/REST_ENDPOINT_MONITORING.md) - Implementation guide (complete)
- ✅ [`docs/technical/SQLEXPRESSIONRUNTIME_CONTINGENCY_PLAN.md`](docs/technical/SQLEXPRESSIONRUNTIME_CONTINGENCY_PLAN.md) - Updated with monitoring strategy
- ✅ [`docs/technical/SQLEXPRESSIONRUNTIME_FEATURE_ANALYSIS.md`](docs/technical/SQLEXPRESSIONRUNTIME_FEATURE_ANALYSIS.md) - Feature inventory

**Estimated Effort:** 1-2 days
**Target Release:** r020.0+ (after Chunk 3 complete)

---

### 1. Multiple QS Widgets Results Interference
**Status:** Pending

### 2. HelperSimple Widget Display Selected Features
**Status:** Pending

### 3. No Results Feedback - Missing User Notification
**Status:** Pending  

### 4. Update Paging Configuration Options in Settings UI
**Status:** Pending  
