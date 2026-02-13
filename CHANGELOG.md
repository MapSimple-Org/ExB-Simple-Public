# Changelog

All notable changes to MapSimple Experience Builder widgets will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Archive**: For releases r001-r021, see [CHANGELOG_ARCHIVE_r001-r021.md](docs/archive/CHANGELOG_ARCHIVE_r001-r021.md)

## [1.19.0-r023.28-30] - 2026-02-13 - Cross-layer selection removal fixes

### Fixed (r023.28)
**Native selection not clearing on single-item removal.** When removing a record via the X button after using "Select on Map", the blue outline persisted. The `removeRecordsFromOriginSelections` function used composite keys (`recordId__queryConfigId`) for matching, but origin DS records from "Select on Map" don't have `__queryConfigId`. Now falls back to simple `recordId` matching when composite key matching removes nothing.

### Fixed (r023.29)
**Expand/collapse state resetting on mode switches.** When switching between New/Add/Remove modes, all expanded result items collapsed back to default. The `QueryTaskResult` component had a `key` prop that changed based on `resultsMode`, forcing React to remount and reset local state. Now uses a stable key that only changes on new query execution.

### Fixed (r023.30)
**Cross-layer removal failing for accumulated results.** When accumulating results from multiple layers (e.g., Regional Trails + Address Points) and removing a record, the native selection for records from "non-current" layers wasn't cleared. The origin DS lookup fell back to `outputDS.getOriginDataSources()[0]` which only returned one layer.

**Solution:** Records now get stamped with `__originDSId` attribute (alongside existing `__queryConfigId`) when added to results. The removal function looks up the correct origin DS via `DataSourceManager.getInstance().getDataSource(originDSId)`, enabling proper cross-layer removal.

### Removed (r023.28)
**Dead `useEffect` in query-result.tsx.** A `useEffect` that cleared selection when `resultSelectMode` changed was removed. It was dead code since r023.5-12 (we only use graphics layer now), had incorrect arguments, and was causing URL hash flashing on mode switches.

### Files Modified
- `query-simple/src/runtime/results-management-utils.ts`: Cross-layer origin DS lookup via `__originDSId`, recordId fallback
- `query-simple/src/runtime/query-task.tsx`: Stamp `__originDSId` on records, stable component key
- `query-simple/src/runtime/query-result.tsx`: Removed dead `useEffect`
- `query-simple/src/runtime/tabs/QueryTabContent.tsx`: Stamp `__originDSId` on mode switch captures
- `query-simple/src/version.ts`: Incremented through r023.30

---

## [1.19.0-r023.22-26] - 2026-02-12 - Results Mode UX overhaul and polish

### Changed (r023.22-23)
**Results Mode selector redesigned.** The New/Add/Remove mode buttons were restyled to make it clear these are modes, not action buttons. Users were confusing "Remove" for an action that should do something immediately.

- **Segmented control**: Buttons sit inside a unified tray with subtle background
- **Per-mode colors**: New (blue), Add (green), Remove (muted red), hardcoded so ExB theme cannot override
- **Per-mode icons**: Star, plus, minus for visual differentiation
- **Logic summary bar**: Colored banner below buttons confirms active mode in plain language
- **"Results Mode" label**: Replaces ambiguous "Results:" label
- **r023.23 polish**: Removed "LOGIC:" prefix, font size 0.8rem, opacity tuning

### Changed (r023.24)
- Results Mode button font size: 0.75rem → 0.8125rem

### Changed (r023.25)
- Removed Results Mode info (i) hover button; logic bar below provides the same guidance
- Button horizontal padding: 8px → 10px for more width

### Changed (r023.26)
- Reverted button height to original (padding 2px vertical, min-height 26px); kept width increase

### Files Modified
- `query-simple/src/runtime/tabs/QueryTabContent.tsx`: Results Mode UI overhaul, removed Tooltip/InfoOutlined
- `query-simple/src/runtime/translations/default.ts`: Added resultsModeLogicNew, resultsModeLogicAdd, resultsModeLogicRemove
- `query-simple/src/version.ts`: Incremented through r023.26

---

## [1.19.0-r023.19-21] - 2026-02-12 - FeatureInfo detached DOM leak fix

### Fixed
**Detached DOM accumulation from FeatureInfo component.** Each `FeatureInfo` unmount (clear results, query switch, record removal) orphaned the manually-created Esri Feature widget, its container div, and all internal calcite-loader/SVG elements as detached DOM nodes. Heap snapshots showed +6,641 detached divs per heavy cycle before the fix.

**Root cause:** `feature-info.tsx` (originally copied from Esri's stock query widget) had two missing cleanup paths:
1. No `componentWillUnmount` lifecycle method (Leak Path A: unmount). Esri Feature widget and container div were never cleaned up when React unmounted the component.
2. Incomplete `destroyFeature()` (Leak Path B: prop updates). Only called `this.feature.destroy()` without removing the container div or nulling the reference. On each `componentDidUpdate` prop change, a new container was appended while the old one was orphaned.

**Fix progression:**
- r023.19: Upgraded `destroyFeature()` to null the feature ref and clear all child DOM from container
- r023.20: Fixed call order in `createFeature()` (must destroy before appending new container, not after)
- r023.21: Added `componentWillUnmount` lifecycle method that calls `destroyFeature()`

**Results (heap snapshot comparison):**
- Detached `<div>`: +6,641/cycle reduced to +1,183/cycle (82% reduction)
- Detached `<button>`: +1,142/cycle eliminated from top entries
- Remaining detached DOM (calcite-loader, ShadowRoot, SVG elements) is Esri SDK internal and not addressable from application code

**Note:** Esri's stock `dist/widgets/arcgis/query/` feature-info.tsx has the same bug. This fix is our improvement on top of their code.

### Files Modified
- `query-simple/src/runtime/components/feature-info.tsx`: Added `componentWillUnmount`, upgraded `destroyFeature()`, reordered cleanup in `createFeature()`
- `query-simple/src/version.ts`: Incremented through r023.21

---

## [1.19.0-r023.18] - 2026-02-12 - Custom Template mode with Markdown editor

### Added
**Custom Template result display mode.** A third option alongside "Popup setting" and "Select attributes" in the Results configuration. Users author a Markdown template with `{fieldName}` tokens that gets converted to styled HTML at runtime via Esri PopupTemplate text content.

**Settings UI:**
- "Custom template" option in the result fields dropdown
- Monospace content editor with field picker button (same ExpressionBuilder pattern as title)
- `(?)` InfoOutlined hover tooltip with full syntax cheat sheet
- Live preview panel with badge-styled field tokens
- Title expression editor shared between SelectAttributes and CustomTemplate modes

**Supported Markdown syntax:**
- `**bold**` / `__bold__` and `*italic*` / `_italic_`
- `#` Heading (h3), `##` Subheading (h4), `###` Small heading (h5)
- `- item` unordered list items
- `---` horizontal rule
- `[text](url)` clickable links (opens in new tab)
- Leading spaces for visual indentation (2 spaces = 1em)
- Single Enter = `<br/>` (line break within paragraph)
- Blank line (double Enter) = new `<p>` (paragraph break)

**Architecture:**
- Zero-dependency lightweight Markdown parser (`markdown-template-utils.ts`)
- Runs through the existing PopupTemplate pipeline (text content type)
- `extractFieldTokens()` ensures query fetches all referenced fields
- `combineFields()` extended to parse `resultContentExpression`
- Paragraph buffer pattern groups consecutive plain lines into single `<p>` with `<br/>` separators

### Files Added
- `query-simple/src/runtime/markdown-template-utils.ts`: `convertTemplateToHtml`, `renderPreview`, `extractFieldTokens`

### Files Modified
- `query-simple/src/config.ts`: Added `CustomTemplate` to `FieldsType` enum, `resultContentExpression` to `QueryItemType`
- `query-simple/src/default-query-item.ts`: Default empty string for `resultContentExpression`
- `query-simple/src/runtime/query-utils.ts`: CustomTemplate branch in `getPopupTemplate`, extended `combineFields`
- `query-simple/src/runtime/query-result.tsx`: CustomTemplate branch in field extraction for action data sets
- `query-simple/src/setting/results.tsx`: Full Custom Template settings UI with editor, field picker, tooltip, and preview
- `query-simple/src/setting/translations/default.ts`: `field_CustomTemplate`, `contentTemplate`, `contentTemplateTip`, `templatePreview`
- `query-simple/src/version.ts`: Incremented to r023.18

---

## [1.19.0-r023.14-17] - 2026-02-12 - Zombie records, cross-query popup template fixes

### Bug Fixed (r023.14-16): Zombie records reappearing after X-button removal
**Records removed via the X-button would reappear when switching from Add mode to New mode.**

**Root cause:** `recordsRef.current` in `query-task.tsx` was set from `accumulatedRecords` during query switches but was never updated when individual records were removed via the X-button. The `effectiveRecords` fallback would read stale data from `recordsRef.current`.

**Fix progression:**
- r023.14: Improved `outputDS` selection filtering in `query-result.tsx` `removeRecord` callback to correctly deselect records even when `__queryConfigId` was inconsistent
- r023.15: Attempted `effectiveRecords` change (overcorrection, caused regression: premature clearing of results panel on mode switch)
- r023.16: Reverted r023.15. Added `useEffect` to `query-task.tsx` that syncs `recordsRef.current` with `accumulatedRecords` when removals are detected (length decreases)

### Bug Fixed (r023.17): Cross-query popup template using wrong origin DS
**Parcel record lost its formatting when accumulated with a park record in Add mode.**

**Root cause:** The `__queryConfigId` stamping logic in `QueryTabContent.tsx` was blindly applying the current query's `configId` to all "added" records, even if they already had a `__queryConfigId` from a prior query. This caused `getPopupTemplate` to resolve the wrong origin data source.

**Fix (3 files):**
- `QueryTabContent.tsx`: Conditional stamping, only if `__queryConfigId` not already set
- `query-utils.ts`: `getPopupTemplate` accepts optional `originDSOverride` parameter
- `simple-list.tsx`: Resolves correct `originDSForConfig` per record via `DataSourceManager`

### Files Modified
- `query-simple/src/runtime/query-task.tsx`: r023.16 `useEffect` for `recordsRef` sync
- `query-simple/src/runtime/query-result.tsx`: r023.14 improved `outputDS` selection filter
- `query-simple/src/runtime/tabs/QueryTabContent.tsx`: r023.17 conditional `__queryConfigId` stamping
- `query-simple/src/runtime/query-utils.ts`: r023.17 `originDSOverride` parameter
- `query-simple/src/runtime/simple-list.tsx`: r023.17 resolve correct origin DS per config
- `query-simple/src/version.ts`: Incremented through r023.17
- `docs/testing/EDGE-CASE-TEST-PLAN.md`: Added Sections J (Zombie Records) and K (Cross-Query Popup Template)

---

## [1.19.0-r023.13] - 2026-01-25 - Settings: Map widget required warning

### Changed
**Map widget selection now shows a validation warning.** When no map widget is selected under Highlight Options, a red warning message appears below the selector: "A map widget is required. Query results will not display on the map without one." The warning disappears once a map widget is selected.

### Files Modified
- `query-simple/src/setting/setting.tsx`: Added conditional warning below `MapWidgetSelector`
- `query-simple/src/setting/translations/default.ts`: Added `mapWidgetRequired` translation string
- `query-simple/src/version.ts`: Incremented to r023.13

---

## [1.19.0-r023.12] - 2026-02-11 - FIX: Clean data_s hash on panel close

### Bug Fixed
**Dirty hash persisting after widget panel close.** When `clearAccumulatedRecords` was removed from panel close (r023.11) to preserve explicit "Select on Map" blue outlines, the `clearDataSParameterFromHash()` call was also lost as a side effect. Experience Builder adds `data_s` to the URL hash when selections are made but never removes it, leaving stale selection state in the URL after closing the widget.

### Fix
Added a direct `clearDataSParameterFromHash()` call to `clearSelectionFromMap`, independent of origin DS clearing. The hash is cleaned without touching the origin DS selection.

### Selection Audit (r023.5-12 Complete)

All automatic origin DS selection paths are now blocked. Only explicit user actions trigger blue outlines:

| Path | Status |
|---|---|
| Query execution (auto-select) | Blocked (r023.5) |
| Query switch reselection | Output DS only (r023.9) |
| Cross-layer grouping loops | Removed (r023.5) |
| Panel reopen restoration | Origin DS loop removed (r023.10) |
| Popup close restoration | Same fix (r023.10) |
| Panel close clearing | Origin DS clear removed (r023.11) |
| Record click (user action) | Intentional, kept |
| Remove X (user action) | Intentional, kept |
| Clear All (user action) | Intentional, kept |
| "Select on Map" (user action) | Intentional, kept |

**Files Modified:**
- `query-simple/src/runtime/hooks/use-selection-restoration.ts`: Added `clearDataSParameterFromHash()` import and call
- `query-simple/src/version.ts`: Incremented to r023.12

---

## [1.19.0-r023.11] - 2026-02-11 - BUGFIX: Blue outlines on panel close/reopen and popup close

### Bug Fixed
**Blue outlines appearing on widget panel reopen and identify popup close.** The `restoreAccumulatedRecords` method in `use-selection-restoration.ts` passed `originDS` as the `outputDS` parameter to `selectRecordsAndPublish`. Even with `skipOriginDSSelection: true` (added in r023.5), two leak paths remained:

1. `outputDS.selectRecordsByIds()` (line 210 in `selectRecordsInDataSources`) was actually calling `originDS.selectRecordsByIds()` since the origin DS was passed as the output DS parameter
2. `publishSelectionMessage()` published a `DataRecordsSelectionChangeMessage` for the origin DS, which the framework reacted to by creating blue outlines

### Changes

**r023.10: Remove origin DS selection from restoration path**
- Removed the origin DS loop from `restoreAccumulatedRecords` (lines 411-442)
- Graphics are already restored separately (lines 362-409)
- Output DS selection is handled by `handleOutputDataSourceCreated` on widget re-render
- Removed unused `selectRecordsAndPublish` dynamic import

**r023.11: Preserve explicit "Select on Map" blue outlines through panel close**
- Removed `clearAccumulatedRecords()` call from `clearSelectionFromMap`
- Previously, closing the widget panel cleared origin DS selection (blue outlines from "Select on Map")
- Since r023.10 removed origin DS restoration on reopen, this meant explicit user selections were permanently destroyed on panel close
- Now only (X) remove and Clear All clear origin DS selection (explicit user actions only)

**Files Modified:**
- `query-simple/src/runtime/hooks/use-selection-restoration.ts`: Restoration and clearing paths
- `query-simple/src/version.ts`: Incremented to r023.11

### Known Issues
- **Intermittent hash query non-execution:** Value populates in textbox but `SqlExpressionRuntime.onChange` never fires. Appears to be a timing race unrelated to r023.5-11 selection changes. Under investigation.

---

## [1.19.0-r023.9] - 2026-02-11 - ARCHITECTURE: Simplify Reselection Block (Step 3/3)

### Architectural Changes
**Simplified 372-line reselection block to ~30 lines (query-task.tsx):** The reselection block that ran during query switches in Add/Remove mode was massively over-engineered. With automatic blue outlines removed (r023.5-7) and the destructive sync block removed (r023.8), most of this code was dead weight.

**What was removed (~340 lines):**
- Graphics layer clearing (already neutered in r022.29, just logged)
- Origin layer filtering of accumulated records (not needed for output DS, which is widget-owned)
- `selectRecordsAndPublish` call (with both `skipOriginDSSelection` and `useGraphicsLayer` false, it was just a wrapper around `selectRecordsByIds`)
- URL hash `data_s` duplicate cleanup (~120 lines of hash parsing)
- Verbose diagnostic/verification logging (6+ log calls)
- Verification setTimeout that polled DS state after 200ms
- rootDataSource map inspection diagnostic block (~60 lines)

**What remains (the essential core):**
1. `isQuerySwitchInProgressRef.current = true` (set early, before block)
2. `featureDS.selectRecordsByIds(allRecordIds, accumulatedRecords)` - updates new output DS
3. `recordsRef.current = accumulatedRecords` - updates Results tab records
4. `setResultCount(accumulatedRecords.length)` - updates count display
5. `isQuerySwitchInProgressRef.current = false` - clears flag
6. One diagnostic log summarizing the update

**Why this is safe:**
- Output DS update is now a direct `selectRecordsByIds` call (same end result as the `selectRecordsAndPublish` wrapper)
- Origin layer filtering was only needed for origin DS selection (now disabled)
- URL hash cleanup addressed a side effect of `publishSelectionMessage` which is no longer called here
- All removed logging was diagnostic, not behavioral

**Files Modified:**
- `query-simple/src/runtime/query-task.tsx`: Lines 836-882 replace lines 836-1302
- `query-simple/src/version.ts`: Incremented to `r023.9`

---

## [1.19.0-r023.8] - 2026-02-11 - CLEANUP: Remove Destructive Sync Block (Step 2/3)

### Code Cleanup
**Removed dead code block (query-task.tsx lines 1379-1442):** This block was neutered in r022.29 to fix query switch purging. It computed `syncedRecords` by filtering `accumulatedRecords` against `outputDS.getSelectedRecords()`, logged diagnostic info, but never called `onAccumulatedRecordsChange(syncedRecords)` to actually sync. With automatic selection removed, this entire block is dead code.

**What was removed:**
- Condition check: `if (actuallySelectedRecords.length > 0 && actuallySelectedRecords.length < accumulatedRecords.length)`
- Set construction for fast lookup
- Filter operation to compute `syncedRecords`
- Two diagnostic log calls with computed values
- Else branch that logged "already-in-sync"

**What was kept:**
- `preserving-accumulated-records-on-query-switch` log (line 1445)
- `previousConfigIdRef.current` update (line 1456)
- Surrounding accumulation mode guards

**Why this is safe:** The sync call was already removed in r022.29. This block only computed values and logged them. No functionality depends on these logs. Removal has zero behavioral impact.

**Test Result (2026-02-11):** Query switching in Add mode verified. All accumulated records remain in Results tab with blue borders. Graphics persist through switches. No behavioral change from r023.7.

**Files Modified:**
- `query-simple/src/runtime/query-task.tsx`: Lines 1379-1442 removed
- `query-simple/src/version.ts`: Incremented to `r023.8`

---

## [1.19.0-r023.7] - 2026-02-11 - BUGFIX + UI: Layer-selection branch skip flag + "Select on map" rename

### Bug Fixed
**Blue outlines still appearing on query switch (r023.6):** The `selectRecordsInDataSources` function in `selection-utils.ts` has two branches: a graphics-layer branch and a layer-selection (else) branch. The `skipOriginDSSelection` flag was only checked in the graphics-layer branch. Query switch calls used `useGraphicsLayer: false`, falling into the else branch which called `originDS.selectRecordsByIds()` unconditionally.

**Fix:** Added `!skipOriginDSSelection &&` guard to the layer-selection branch (line 177), matching the graphics-layer branch pattern. Also added `skipOriginDSSelection` to the diagnostic log and a skip-event log for traceability.

### UI Change
**Renamed "Add to map" action to "Select on map":** The action label now better reflects its purpose since automatic selection has been removed. Users explicitly choose to select features on the map.

**Files Modified:**
- `query-simple/src/runtime/selection-utils.ts`: Line 177 (skip guard in else branch)
- `query-simple/src/runtime/translations/default.ts`: `addToMap` label
- `query-simple/src/data-actions/add-to-map-action.tsx`: Default label
- `query-simple/src/version.ts`: Incremented to `r023.7`

### Known Issues / Future Work
- **Map Identify popup path:** Closing an Identify popup still triggers native selection (blue outlines). This is a separate code path not yet addressed.
- **Dead code: layer-selection else branch:** With selection disabled, `useGraphicsLayer` is effectively always `true`. The else branch in `selectRecordsInDataSources` is dead code and should be considered for removal as a cleanup task.
- **Config remnant:** The `useGraphicsLayer` toggle may have been removed from the settings UI, but the code branch persists. Should be cleaned up to avoid confusion.

---

## [1.19.0-r023.5] - 2026-02-11 - ARCHITECTURE: Remove Automatic Blue Map Outlines (Step 1/3 COMPLETE)

### 🏗️ Architectural Changes
**Remove automatic blue map outlines from query execution**: Query results no longer create blue selection outlines on the map automatically. Purple graphics (highlights) still render. Blue outlines only appear when user explicitly uses "Add to Map" action.

**Initial implementation (query-result.tsx line 470) only covered one of four paths. Full implementation addresses all automatic selection paths:**

**Path 1 - Automatic selection useEffect (query-result.tsx line 470):**
- Changed `alreadySelected` to `true`
- Skips origin DS selection in `selectRecordsAndPublish`

**Path 2 - Cross-layer grouping (query-task.tsx lines 2157-2178):**
- REMOVED two loops that called `originDS.selectRecordsByIds()` directly
- These loops cleared then re-selected each origin DS during query result processing
- Output DS selection retained (line 2182) for Results tab borders

**Path 3 - Query switch reselection (query-task.tsx line 1067):**
- Added `skipOriginDSSelection: true` (9th parameter) to `selectRecordsAndPublish`
- Prevents blue outlines when switching between queries in Add/Remove modes

**Path 4 - Panel reopen restoration (use-selection-restoration.ts line 424):**
- Added `skipOriginDSSelection: true` to `selectRecordsAndPublish`
- Prevents blue outlines when reopening widget panel

**What this achieves:**
- Query execution → Purple graphics YES, blue map outlines NO
- Query switching → Purple graphics YES, blue map outlines NO
- Panel reopen → Purple graphics YES, blue map outlines NO
- Results tab blue borders → YES (via output DS)
- "Add to Map" action → YES (explicitly calls origin DS selection)

**Why this is safe:**
- Purple graphics provide visual feedback during query
- Results tab provides selection state
- User retains full control via "Add to Map" for blue outlines
- No loss of functionality, just shift from automatic to explicit

**Testing priorities:**
1. Query execution shows purple graphics, no blue outlines
2. Results tab blue borders render correctly
3. "Add to Map" creates blue outlines as expected
4. Query switching preserves graphics and Results tab state
5. Panel close/reopen preserves graphics, no blue outlines

**Files Modified:**
- `query-simple/src/runtime/query-result.tsx`: Line 470
- `query-simple/src/runtime/query-task.tsx`: Lines 1067, 2157-2178
- `query-simple/src/runtime/hooks/use-selection-restoration.ts`: Line 424
- `query-simple/src/version.ts`: Incremented to `r023.5`

**Next Steps:** Step 2 (remove destructive sync block), Step 3 (remove reselection block)

---

## [1.19.0-r023.4] - 2026-02-11 - BUGFIX: Query Switch Results Tab Deselection

### 🐛 Bug Fixed
**Results Tab Losing Blue Borders on Query Switch**: When switching queries in Add mode, results from other layers would lose their blue border highlighting in the Results tab.

**Root Cause:**
- Query switch reselection block (query-task.tsx lines 997-1022) filtered accumulated records to only the current query's layer
- Passed filtered subset to `selectRecordsAndPublish` (line 1055-1064)
- Output DS selection updated with partial set (e.g., 1 of 2 records)
- `handleDataSourceInfoChange` reads partial selection, updates `selectedRecords` state
- Cross-layer results lose blue border in Results tab

**The Fix:**
- Line 1037: Changed `recordsToReselect.map(...)` to `accumulatedRecords.map(...)`
- Line 1059: Changed `recordsToReselect` to `accumulatedRecords`
- Output DS now gets ALL accumulated records selected (not filtered subset)
- Results tab blue borders persist across query switches

**Why this is safe:** The output DS is widget-owned and can hold records from any layer. Only origin DS selection (blue map outlines) needs layer filtering, which is handled separately.

**Test Result:** Query parcel + park in Add mode. Switch between queries. Both keep blue border in Results tab.

**Files Modified:**
- `query-simple/src/runtime/query-task.tsx`: Lines 1037, 1059
- `query-simple/src/version.ts`: Incremented to `r023.4`

---

## [1.19.0-r023.3] - 2026-02-11 - ARCHITECTURE: Isolate Add to Map Selection (Phase 1)

### 🏗️ Architectural Changes
- **Isolated Add to Map selection logic** from shared selection utilities
- Created dedicated `selectRecordsForAddToMap` function with multi-layer support
- Add to Map now interrogates graphics layer to determine record-to-layer mapping
- Preparation for removing all automatic selection logic in Phase 2

### ✨ Enhanced
- **Multi-layer selection via graphics interrogation**:
  - Graphics layer stores `queryConfigId` in attributes
  - Function maps `queryConfigId` → query config → data source → origin layer
  - Groups records by origin layer
  - Selects records in each layer independently
  - Supports unlimited layers in accumulation mode

### 🔧 Technical Details
**Implementation:**
- `add-to-map-action.tsx`: Added dedicated `selectRecordsForAddToMap` function (isolated, self-contained)
- `index.tsx`: Pass `graphicsLayer` and `queries` through action creation chain
- `query-result.tsx`: Pass `graphicsLayer` and `queries` to `getExtraActions`
- Graphics interrogation:
  1. Read `recordId` and `queryConfigId` from graphic attributes
  2. Map `queryConfigId` to data source via query configs
  3. Get origin data source from data source manager
  4. Group records by origin layer
  5. Call `selectRecordsByIds` on each layer

**Files Modified:**
- `query-simple/src/data-actions/add-to-map-action.tsx`: Created dedicated selection function
- `query-simple/src/data-actions/index.tsx`: Updated action creation signature
- `query-simple/src/runtime/query-result.tsx`: Pass graphics and queries to actions
- `query-simple/src/version.ts`: Incremented to `r023.3`

**Why This Matters:**
- Add to Map is now independent of automatic selection logic
- When we remove automatic selection in Phase 2, Add to Map will continue working
- Multi-layer selection properly supported via graphics layer interrogation

**Phase 1 Complete** ✅
- Add to Map isolated and tested
- Multi-layer selection working
- Ready for Phase 2: Remove all automatic selection logic

---

## [1.19.0-r022.109] - 2026-01-25 - ENHANCEMENT: Adjust Spring Drop Animation Timing

### Changed
- **Spring Drop Starting Position**: Adjusted initial Y position from `-2.0` to `-1.2` for snappier animation
  - Shorter drop distance creates quicker, more responsive feel
  - Maintains same physics (stiffness: 0.15, damping: 0.8)
  - Final resting position unchanged at `-0.5`

### Technical Details
**Implementation:**
- Updated `initialY` constant in both animation paths (create and reuse)
- Updated initial `anchorPoint.y` on CIM symbol creation
- Animation duration naturally shorter due to reduced travel distance

**Files Modified:**
- `query-simple/src/runtime/query-result-item.tsx`: Updated `initialY` from `-2.0` to `-1.2` in both animation loops
- `query-simple/src/version.ts`: Incremented to `r022.109`

---

## [1.19.0-r022.108] - 2026-01-25 - FEATURE: Animated Spring Drop for Hover Preview Pin

### Added
- **Google Maps-Style Drop Animation**: Hover preview pin now animates with spring physics when appearing
  - **Starting Position**: Pin suspended at `y: -2.0` (relative anchor point)
  - **Final Position**: Settles at `y: -0.5` (current resting tip position)
  - **Physics**: Spring simulation with stiffness `0.15` and damping `0.8`
  - **Animation**: Smooth bounce effect using `requestAnimationFrame`

### Technical Details
**Implementation:**
- Added `animationRef` useRef to track `requestAnimationFrame` ID for proper cleanup
- Created spring physics loop with force and velocity calculations
- Animation updates CIM symbol's `anchorPoint.y` property each frame
- Proper lifecycle management:
  - Animation cancelled on mouse leave
  - Animation cancelled on result item click
  - Animation cancelled on component unmount
  - Animation restarts when hovering different results (graphic reused)

**Code Structure:**
```typescript
// Spring physics loop
let currentY = initialY
let velocity = 0

const animate = (timestamp: number) => {
  // Spring physics calculation
  const force = (targetY - currentY) * 0.15  // Stiffness
  velocity = (velocity + force) * 0.8         // Damping
  currentY += velocity
  
  // Update graphic symbol anchor
  const newSymbol = currentSymbol.clone()
  newSymbol.data.symbol.symbolLayers[0].anchorPoint = { x: 0, y: currentY }
  hoverGraphicRef.current.symbol = newSymbol
  
  // Continue until settled
  if (Math.abs(velocity) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
    animationRef.current = requestAnimationFrame(animate)
  }
}
```

**Safety:**
- `cancelAnimationFrame()` called in:
  - `handleMouseLeave` (hide pin)
  - `handleClickResultItem` (hide pin on click)
  - `useEffect` cleanup (component unmount)
- Animation ID stored in `animationRef.current` for all cancellation points

**Files Modified:**
- `query-simple/src/runtime/query-result-item.tsx`: Added animation logic, refs, and cleanup
- `query-simple/src/version.ts`: Incremented to `r022.108`

**Debug Logging:**
- `HOVER-PREVIEW` events: `animation-complete`, `animation-update-error`
- Logs final Y position when animation settles

---

## [1.19.0-r022.107] - 2026-02-10 - FEATURE: Configurable Hover Preview Pin Color

### Added
- **Configurable Hover Pin Color**: Widget setting to customize the color of the hover preview pin
  - **New Setting**: "Hover Preview Pin" section with color picker in widget settings
  - **Default**: Yellow (#FFC107) - matches Google Maps style
  - **Feature**: Pin appears on map when hovering over result items in the list
  - **Auto-Generated Lighter Center**: Inner circle automatically rendered 20% lighter than selected color
  - **Config Property**: `hoverPinColor?: string`

### Changed
- **Settings UI Improvements**: Enhanced readability of description text
  - Removed low-contrast `text-secondary` class
  - Applied `opacity: 0.8` for better visibility while maintaining visual hierarchy
  - Fixed negative margin (`-8px` → `4px`) that caused text to clash with controls above

### Technical Details
**Implementation:**
- Added `hoverPinColor` config property with hex color string
- Created `hexToRgb()` helper function to convert hex to RGBA array for CIM symbols
- Threaded color prop through component hierarchy: `widget.tsx` → `QueryTaskList` → `QueryTask` → `QueryTaskResult` → `SimpleList` → `QueryResultItem`
- CIM symbol dynamically applies configured color:
  - **Base color**: Used for outer teardrop pin shape
  - **Lighter variant**: Calculated by multiplying RGB values by 1.2 (capped at 255)
- Updated debug logging to include actual color values used

**Code Structure:**
```typescript
// Convert hex to RGB for CIM symbol
function hexToRgb(hex: string, alpha: number = 230): [number, number, number, number] {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return [r, g, b, alpha]
}

// In handleMouseEnter callback
const baseColor = hexToRgb(hoverPinColor || '#FFC107', 230)
const lighterColor = [
  Math.min(255, Math.round(baseColor[0] * 1.2)),
  Math.min(255, Math.round(baseColor[1] * 1.2)),
  Math.min(255, Math.round(baseColor[2] * 1.2)),
  255
]
```

**Files Changed:**
- `config.ts`: Added `hoverPinColor?: string` property
- `setting/setting.tsx`: Added "Hover Preview Pin" section with ThemeColorPicker, improved text contrast
- `setting/translations/default.ts`: Added i18n strings for hover pin color
- `query-result-item.tsx`: Added `hexToRgb()` helper, dynamic color application in CIM symbol
- `simple-list.tsx`: Added `hoverPinColor` prop
- `query-result.tsx`: Added `hoverPinColor` prop
- `query-task.tsx`: Added `hoverPinColor` prop
- `query-task-list.tsx`: Added `hoverPinColor` prop
- `widget.tsx`: Passed `config.hoverPinColor` to QueryTaskList components
- `version.ts`: Incremented to r022.107

**Testing:**
1. Open widget settings → "Hover Preview Pin" section
2. Select different colors (red, blue, green, etc.)
3. Hover over result items to see pin in new color
4. Verify center circle is lighter shade of selected color
5. Verify description text is readable with proper spacing

**Memory Safety:**
- Single Graphic object per result item (reused across hovers) ✅
- Point geometry objects properly replaced and garbage collected ✅
- No object accumulation ✅

## [1.19.0-r022.105] - 2026-02-09 - FEATURE: Configurable Zoom on Result Click

### Added
- **Configurable Zoom Behavior**: Widget setting to control zoom behavior when clicking results in the panel
  - **New Setting**: "Zoom to record when clicked" toggle in "Result Click Behavior" section
  - **Default**: Enabled (maintains current behavior)
  - **When Enabled**: Click result → Zoom to record → Open popup
  - **When Disabled**: Click result → Open popup only (no zoom)
  - **Use Case**: Allows users to disable zoom for workflows where automatic zooming is disruptive
  - **Config Property**: `zoomOnResultClick?: boolean`

### Technical Details
**Implementation:**
- Added `zoomOnResultClick` config property (defaults to `true` for backward compatibility)
- New settings UI section: "Result Click Behavior" with Switch control
- Extracted `openPopupForRecord()` helper function to eliminate code duplication
- Conditional zoom logic in `toggleSelection()` callback
- Props threading: `widget.tsx` → `QueryTaskList` → `QueryTask` → `QueryTaskResult`

**Code Structure:**
```typescript
// In query-result.tsx
const openPopupForRecord = React.useCallback((data: FeatureDataRecord) => {
  // Calculate popup location using labelPointOperator
  // Open popup at calculated location
}, [mapView])

const toggleSelection = React.useCallback((data: FeatureDataRecord) => {
  const shouldZoom = zoomOnResultClick !== false
  
  if (shouldZoom) {
    zoomToRecords([data]).then(() => openPopupForRecord(data))
  } else {
    openPopupForRecord(data) // Popup only, no zoom
  }
}, [zoomOnResultClick, openPopupForRecord])
```

**Files Changed:**
- `config.ts`: Added `zoomOnResultClick?: boolean` property
- `setting/setting.tsx`: Added "Result Click Behavior" section with Switch
- `setting/translations/default.ts`: Added i18n strings
- `query-result.tsx`: Extracted helper, conditional zoom logic
- `query-task.tsx`: Pass prop through
- `query-task-list.tsx`: Pass prop through
- `widget.tsx`: Pass `config.zoomOnResultClick` to components
- `version.ts`: Incremented to r022.105

**Benefits:**
- ✅ Backward compatible (defaults to current behavior)
- ✅ User choice for different workflow needs
- ✅ Popup always opens regardless of zoom setting
- ✅ Clean separation of zoom and popup logic
- ✅ Reuses labelPoint calculation for popup location

### Changed
- Refactored popup opening logic into dedicated `openPopupForRecord()` helper function

## [1.19.0-r022.104] - 2026-02-08 - FIX: Un-Minimize Triggering Open Logic

### Fixed
- **Un-Minimize Triggering Restoration**: Fixed widget un-minimize triggering open/restoration logic unnecessarily
  - **Bug**: Un-minimizing widget ran restoration logic via DOM visibility detection, even though widget was already open (`props.state` stayed `'OPENED'`)
  - **Manifestation**: Visible as duplicate restoration events and unnecessary re-execution of open logic
  - **Root Cause**: IntersectionObserver detected DOM visibility change (minimize → un-minimize) and fired `onVisibilityStateChange(true)`
  - **Solution**: Track first open with `hasOpenedOnce` flag - use DOM detection only for first open, rely on `props.state` thereafter

### Technical Details
**Widget Open Detection Strategy (r022.104):**

**Problem:**
- r022.77 fixed minimize/close distinction using `props.state`
- But DOM visibility detection (IntersectionObserver) was still firing on un-minimize
- Un-minimize makes widget DOM visible again → triggers open logic → unnecessary restoration

**Solution - Hybrid Approach:**
1. **First Open**: Use DOM visibility detection (IntersectionObserver/periodic check)
   - Reason: ExB doesn't immediately populate `props.state` on initial mount
   - Reliable detection of initial widget open
2. **After First Open**: Use only `props.state` transitions in `componentDidUpdate`
   - Minimize: `props.state` stays `'OPENED'` → no action
   - Un-minimize: `props.state` stays `'OPENED'` → no action (DOM visibility change ignored)
   - Close then re-open: `props.state` changes `'CLOSED'` → `'OPENED'` → restoration

**Implementation:**
```typescript
// In WidgetVisibilityManager
private hasOpenedOnce: boolean = false

// In IntersectionObserver callback
if (isVisible) {
  if (!this.hasOpenedOnce) {
    // First open - use DOM detection
    this.hasOpenedOnce = true
    this.logVisibilityChange(isVisible, 'IntersectionObserver', id, callbacks)
    onVisibilityStateChange(isVisible)
  } else {
    // Already opened once - ignore DOM visibility (un-minimize)
    // Log but don't trigger open logic
  }
}
```

**Logic Flow:**
```
First widget open (CLOSED → DOM visible):
  ↓
  hasOpenedOnce = false → Use DOM detection ✅
  ↓ Trigger restoration
  ↓ Set hasOpenedOnce = true

User minimizes:
  ↓ props.state stays 'OPENED' → No action ✅

User un-minimizes:
  ↓ DOM becomes visible → hasOpenedOnce = true → Ignore DOM ✅
  ↓ props.state still 'OPENED' → No action ✅

User closes then re-opens:
  ↓ props.state: 'CLOSED' → 'OPENED'
  ↓ componentDidUpdate detects transition ✅
  ↓ Trigger restoration
```

**Enhanced Logging:**
- `first-open-detected` - Initial widget open via DOM detection
- `panel-visible-ignored` - Un-minimize ignored (already opened once)

**Impact:**
- ✅ First open: DOM detection works correctly (ExB state not yet available)
- ✅ Minimize: No action (props.state stays `'OPENED'`)
- ✅ Un-minimize: No action (DOM visibility ignored after first open)
- ✅ Close then re-open: `props.state` transition handles correctly
- ✅ No duplicate restoration on un-minimize
- ✅ Cleaner logs (no spurious open events)

**Files Modified:**
- `query-simple/src/runtime/hooks/use-widget-visibility.ts` - Add `hasOpenedOnce` flag, conditional DOM detection
- `query-simple/src/version.ts` - r022.103 → r022.104

**Testing:**
- ✅ First widget open triggers restoration (DOM detection)
- ✅ Minimize → Un-minimize: No duplicate restoration
- ✅ Close → Re-open: Restoration triggered correctly (props.state)
- ✅ Multiple minimize/un-minimize cycles: No spurious events

---

## [1.19.0-r022.87] - 2026-02-07 - Infrastructure: Namespace Migration Complete

### Changed
- **Shared Code Namespace Migration**: Renamed `shared-code/common` to `shared-code/mapsimple-common` to prevent module conflicts in multi-vendor deployments
  - **Why**: Generic `common` namespace risked collision with other custom widgets in shared ExB runtime
  - **Strategy**: Incremental side-by-side migration - both old and new paths coexisted during transition
  - **Result**: 47 files migrated across 8 groups with zero regressions detected

### Technical Details
**Migration Approach:**
- Phase 1 (r022.78): Created `shared-code/mapsimple-common/` alongside existing `common/`, dual barrel exports
- Phase 2 (r022.79-86): Migrated imports incrementally - core runtime → forms → hooks → settings → data actions
- Phase 3 (r022.87): Removed old `shared-code/common/` folder after all references migrated

**Files Updated:**
- All query-simple imports (35 files)
- All helper-simple imports (1 file)
- Preserved chunks (2 files)
- Unit tests included in distribution

**Impact:**
- ✅ Collision-proof namespace ensures safe deployment in any environment
- ✅ No breaking changes for existing implementations (handled internally)
- ✅ Foundation established for public distribution and multi-vendor compatibility
- ✅ Full test coverage maintained throughout 10-commit migration process

**Files Modified:**
- `shared-code/mapsimple-common/` - New namespace directory (all modules)
- `shared-code/mapsimple-common.ts` - New barrel export file
- `query-simple/src/**/*.tsx` - Updated imports (35 files)
- `helper-simple/src/runtime/widget.tsx` - Updated imports
- `preserved/r018-chunks/**/*.ts` - Updated imports

**Testing:**
- User tested after each group (8 test cycles)
- Zero regressions detected
- Clean compilation verified after each commit

---

## [1.19.0-r022.77] - 2026-02-05 - CRITICAL FIX: Widget Minimize vs Close Detection

### Fixed
- **Widget Minimize Incorrectly Clearing Selections**: Fixed widget minimize triggering close logic which cleared selections from map
  - **Bug**: Minimizing widget cleared selections; users expected minimize to preserve selections (visual collapse)
  - **Root Cause**: DOM visibility detection (IntersectionObserver) couldn't distinguish minimize from close
  - **Solution**: Now uses Experience Builder's `props.state` property (`'OPENED'` vs `'CLOSED'`)

- **Cross-Layer Selection Count**: Fixed high-priority bug where adding records from multiple layers showed incorrect selection counts
  - **Bug**: Selection counts wrong when accumulating from different layers (e.g., 6 selected instead of 4)
  - **Root Cause**: All record IDs selected on current query's single origin data source, causing cross-layer pollution
  - **Solution**: Records grouped by `__queryConfigId` and selected on correct origin data sources

### Technical Details
**Minimize/Close Detection (r022.77):**
- **Old Behavior**: IntersectionObserver detected both minimize and close as "hidden" → triggered clear
- **New Behavior**: 
  - Close detection: `props.state` transitions from `'OPENED'` to `'CLOSED'`
  - Minimize: `props.state` stays `'OPENED'` → no state change → selections preserved
  - Open detection: IntersectionObserver still handles correctly

**Cross-Layer Selection (r022.71-74):**
- Intelligent Selection Check: useEffect detects when records already correctly selected
- Cross-Layer Grouping: Records grouped by `__queryConfigId`, selected on correct origin DS
- Remove Mode Fix: Composite key matching looks up `__queryConfigId` from accumulated records

**Impact:**
- ✅ Minimize preserves selections (bug fixed)
- ✅ Maximize shows selections still there
- ✅ Close still clears selections correctly
- ✅ Open still restores selections correctly
- ✅ HelperSimple receives accurate widget state events
- ✅ Selection counts accurate across all layer combinations
- ✅ Graphics display correctly in all modes
- ✅ Remove mode works properly (via query execution or X button)

**Files Modified:**
- `query-simple/src/runtime/hooks/use-widget-visibility.ts` - Added `props.state` detection
- `query-simple/src/runtime/query-result.tsx` - Cross-layer selection logic
- `query-simple/src/runtime/selection-utils.ts` - Grouped selection by configId
- `query-simple/src/version.ts` - r022.76 → r022.77

---

## [1.19.0-r022.35] - 2026-02-03 - FIX: Graphics Fill Missing (Outline Only)

### Fixed
- **Graphics Rendering Independence**: Hardcoded widget-specific symbology to prevent external widgets from affecting graphics rendering
  - **Bug**: Advanced Draw widget sets `mapView.highlightOptions.fillOpacity = 0`, causing QuerySimple graphics to render without fill (outline only)
  - **Reproduction**: Select item → Close widget → Open Draw widget → Reopen QuerySimple → Graphics have no fill
  - **Solution**: Replaced runtime `highlightOptions` lookup with hardcoded constants

### Technical Details
**Root Cause:**
- `getDefaultHighlightSymbol()` was reading `mapView.highlightOptions.fillOpacity` at runtime
- Advanced Draw widget modifies `fillOpacity` to `0` for its sketch graphics
- QuerySimple graphics created after Draw opens inherit `fillOpacity = 0`
- Result: Fill color becomes `[0, 255, 255, 0]` (fully transparent)

**Fix (r022.35):**
Added `QUERYSIMPLE_HIGHLIGHT_SYMBOLOGY` constants:
```typescript
const QUERYSIMPLE_HIGHLIGHT_SYMBOLOGY = {
  color: [0, 255, 255],      // Cyan
  fillOpacity: 0.25,         // 25% transparent fill
  outlineOpacity: 1.0,       // 100% opaque outline
  lineOpacity: 1.0,          // 100% opaque lines
  outlineWidth: 2,
  lineWidth: 4,
  markerSize: 12
}
```

Modified `getDefaultHighlightSymbol()` to use constants instead of `mapView.highlightOptions`.

**Impact:**
- ✅ Graphics always render with fill regardless of external widget state
- ✅ Widget independence - no external dependencies
- ✅ Consistent symbology across all operations
- ✅ Future-ready - constants can be exposed as widget settings

**Files Modified:**
- `query-simple/src/runtime/graphics-layer-utils.ts` - Hardcoded symbology constants
- `query-simple/src/version.ts` - r022.34 → r022.35

**Investigation:**
- r022.34: Added diagnostic logging to capture `highlightOptions` values
- User confirmed reproduction: Advanced Draw widget was the culprit

**Documentation:**
- Complete bug report: `docs/bugs/BUG-GRAPHICS-FILL-MISSING.md`

---

## [1.19.0-r022.33] - 2026-02-03 - FIX: Cross-Layer X Button Removal

### Fixed
- **CRITICAL: Cross-Layer Record Removal**: Fixed bug where removing a record via X button failed to clear the selection from its origin data source when the record was added from a different query layer
  - **Bug Scenario**: Hash query (Parcels) → Add mode → Switch to Parks query → Add Park record → Remove original Parcel record
  - **Symptom**: Record removed from UI and graphics, but selection remained in Parcels layer (invisible desync)
  - **Root Cause**: Removal utility used `record.getDataSource()` method which returns `null` for accumulated records, falling back to current query's origin DS (Parks instead of Parcels)
  - **Fix**: Changed to use `record.dataSource` property which persists correctly through accumulation

### Technical Details
**Investigation:**
- r022.31: Enhanced diagnostic logging added (6 new log events)
- r022.32: Fixed undefined variable in diagnostic logging
- r022.33: Implemented 1-line fix using `.dataSource` property

**File Changed:**
- `results-management-utils.ts` (line 442): `record.getDataSource?.()` → `(record as any).dataSource`

**Why It Works:**
- `.getDataSource()` method returns `null` for records in accumulated state
- `.dataSource` property persists on record object through merging/state updates
- Pattern already proven in X button handler (`query-result.tsx`)

**Impact:**
- ✅ Cross-layer removals now clear selection from correct origin layer
- ✅ No more "ghost selections" on widget close/reopen
- ✅ Simple fix (1 line) vs. complex stamping approach (multi-file changes)
- ✅ Uses existing proven pattern
- ✅ Diagnostic logging preserved for future debugging

**Documentation:**
- Complete bug report: `docs/bugs/BUG-CROSS-LAYER-X-BUTTON-REMOVAL.md`
- Root cause analysis, fix implementation, testing protocol documented

---

## [1.19.0-r022.30] - 2026-02-01 - FIX: Graphics Flash on Query Switch

### Fixed
- **CRITICAL: Graphics Layer Flash in Add/Remove Mode**: When switching queries in Add or Remove mode with accumulated results visible, graphics would briefly disappear and reappear, causing visual flash

---

## [1.19.0-r022.27] - 2026-02-01 - Orphaned Code Cleanup

### Removed
- **Dead Code Cleanup (87 lines)**: Removed all `useGraphicsLayerForHighlight` references
  - Config property was disabled in earlier version but code paths remained
  - 63 references across 10 files checking a config option users couldn't set
  - Surgical removal on dedicated feature branch

### Implementation Details
**Branch:** `feature/remove-graphics-layer-orphaned-code`

**Files Modified (10):**
1. `config.ts` - Removed property from interface
2. `setting/setting.tsx` - Removed UI labels
3. `setting/translations/default.ts` - Removed i18n strings
4. `runtime/widget.tsx` - Removed conditionals, prop passing, logging
5. `runtime/query-task.tsx` - Removed from props and conditionals
6. `runtime/query-result.tsx` - Removed from props and selection calls
7. `runtime/query-task-list.tsx` - Removed from props
8. `data-actions/zoom-to-action.tsx` - Removed bug logging
9. `runtime/hooks/use-selection-restoration.ts` - Removed from dependencies
10. `runtime/hooks/use-graphics-layer.ts` - Removed from initialization

**Impact:**
- ✅ 63 orphaned references removed
- ✅ 87 net lines deleted
- ✅ Cleaner architecture
- ✅ No dead code paths to maintain
- ✅ Build successful, all functionality working

### Related
- TODO Section 3a: Remove Non-Graphics Layer Implementation (Complete)

### Root Cause
During query switches in Add/Remove mode, three unnecessary operations were occurring:
1. Graphics layer was being cleared via `onClearGraphicsLayer()`
2. Graphics were being cleared and re-added via `selectRecordsAndPublish(useGraphicsLayer: true)`
3. Accumulated records sync logic was incorrectly purging records

These operations were unnecessary because:
- Graphics already correctly reflected `accumulatedRecords` 
- Only output DS selection needed updating for Results panel
- Sync logic is only for manual deletions (X buttons), not query switches

### Solution (r022.30)
Three surgical fixes in `query-task.tsx`:

1. **Skip clearing graphics layer** (line 957)
   - Removed `onClearGraphicsLayer()` call in Add/Remove mode during query switch
   - Graphics already match `accumulatedRecords` - no need to clear

2. **Update output DS without touching graphics** (line 1044)
   - Changed `selectRecordsAndPublish(useGraphicsLayer: true)` → `useGraphicsLayer: false`
   - Updates output DS selection (fixes Results panel)
   - Skips all graphics operations (eliminates flash)

3. **Skip sync logic during query switches** (line 1374)
   - Commented out `onAccumulatedRecordsChange(syncedRecords)` during query switches
   - Sync only needed for manual deletions (X button clicks)
   - Prevents incorrect purging of accumulated records

### Impact
- ✅ Zero graphics flash when switching queries in Add/Remove mode
- ✅ Results panel stays perfectly in sync with accumulated records
- ✅ Manual deletions (X buttons) continue working correctly
- ✅ Performance improvement (eliminated unnecessary clear/re-add cycles)

### Testing
Verified across multiple scenarios:
- Query switches between 3 different queries with 2-122 accumulated records
- Add mode: Smooth transitions, no flash, correct counts
- Remove mode: Smooth transitions, no flash, correct counts
- Manual deletions: Graphics removed correctly, counts update properly
- Results panel: Always shows correct accumulated records

### Files Modified
- `query-simple/src/runtime/query-task.tsx` (3 surgical fixes)
- `query-simple/src/version.ts` (r022.28 → r022.30)

### Investigation Path
- r022.28: Surgically commented out `onClearGraphicsLayer()` and `selectRecordsAndPublish()` → graphics fixed, Results broken
- r022.29: Changed approach to call `selectRecordsAndPublish(useGraphicsLayer: false)` → both fixed
- r022.30: Cleaned up test comments, production-ready code

---

## [1.19.0-r022.14] - 2026-01-30 - No-Results Popover Complete

### Added
- **UX Enhancement**: Calcite Popover appears when query returns zero results
- **User Feedback**: Clear messaging for empty query results with dismissible popover
- **Smart Detection**: Automatically triggers on zero-result queries and reappears on each occurrence

### Implementation Summary (r022.3-r022.14)
**Iterative refinement for optimal placement and behavior:**

- **r022.3-r022.8**: Initial Alert → Popover switch, width/positioning iterations, timestamp-based re-triggering
- **r022.9**: Added `key={timestamp}` to force React remount on each zero-result query
- **r022.10-r022.12**: Anchor height experiments (80px → 1px) with `flipDisabled` for control
- **r022.13**: Added `overlayPositioning="fixed"` for stable viewport-relative positioning
- **r022.14**: Removed anchor margin for tighter placement

**Final Configuration:**
```tsx
<calcite-popover 
  key={`no-results-${noResultsAlert.timestamp}`}  // Force remount
  referenceElement="query-feedback-anchor"         // Minimal 1px anchor
  placement="bottom"                                // Below content
  flipDisabled={true}                               // No auto-flip
  overlayPositioning="fixed"                        // Viewport-relative
  autoClose                                         // Dismissible
  closable                                          // X button
  open={noResultsAlert.show}
/>
```

**User Experience:**
- Query with no results → Popover appears immediately below form
- Displays record count requested and query value
- Dismissible via X button or click outside
- Reappears on each new zero-result query (not sticky)
- 320px max width, constrains to panel width

### Technical Details
- State management: `noResultsAlert` with `timestamp` for unique keys
- Detection: Query execution callback checks `queryResultCount === 0`
- i18n strings: `noResultsAlertLabel`, `noResultsAlertTitle`, `noResultsAlertMessage`
- Component: Integrated into `QueryTabContent.tsx`

### Files Modified
- `query-simple/src/runtime/query-task.tsx` - Detection logic, state management
- `query-simple/src/runtime/tabs/QueryTabContent.tsx` - Popover component integration
- `query-simple/src/runtime/translations/default.ts` - i18n strings
- `query-simple/src/version.ts` - Bumped to r022.14

### Related
- TODO Section 2c: UX Enhancements - Results Mode Feedback (Complete)
- 12 iterations (r022.3-r022.14) to refine placement and behavior

---

## [1.19.0-r022.2] - 2026-01-30 - Complete lastSelection Removal

### Removed
- **Dead Code Cleanup (126+ lines)**: Completed r021.110 intent by removing all unused lastSelection code
  - Removed `restoreLastSelection()` method (~70 lines)
  - Removed `clearLastSelection()` method (~60 lines)
  - Removed `lastSelection` from `SelectionRestorationState` interface
  - Removed `lastSelection` assignment in `handleSelectionChange`
  - Removed `lastSelection` from all logs and fallback conditions
  - Updated JSDoc comments to reflect r022.2 cleanup

### Why Safe to Remove
- r022.1 made `accumulatedRecords` the universal restoration source for ALL modes
- `restoreLastSelection()` and `clearLastSelection()` methods never called after r022.1
- `lastSelection` state was never updated when records removed (source of r021.108 bug)
- All functionality now uses `accumulatedRecords` (reflects removals correctly)

### Impact
- ✅ 180 lines of dead/risky fallback code removed
- ✅ Simpler architecture - one source of truth (`accumulatedRecords`)
- ✅ Widget bundle size reduced: 2.31 MiB → 2.29 MiB
- ✅ Zero functional changes (r022.1 already fixed behavior)

### Files Modified
- `query-simple/src/runtime/hooks/use-selection-restoration.ts` - Removed lastSelection state, methods, logs
- `query-simple/src/runtime/hooks/use-event-handling.ts` - Updated JSDoc comments
- `query-simple/src/version.ts` - Bumped to r022.2

### Related
- r022.1: Functional fix (restoration priority)
- r021.110: Original cleanup intent (never implemented in source)

---

## [1.19.0-r022.1] - 2026-01-30 - FIX: Zombie Graphics on Widget Reopen

### Fixed
- **CRITICAL: Removed Records Reappear After Close/Reopen**: In NEW mode, when records were removed and the widget was closed/reopened, the removed records would reappear as graphics on the map (but correctly excluded from Results panel).

### Root Cause
- Restoration logic used `lastSelection` (stale, 121 records) for NEW mode instead of `accumulatedRecords` (current, 118 records)
- `lastSelection` was never updated when records removed via X button
- `accumulatedRecords` correctly reflected removals (121 → 118)
- Result: Close/reopen restored all 121 graphics, including 3 removed "zombies"

### Log Evidence
```json
"panel-closed-cleared-origin-ds" recordCount: 118 ✅
"panel-opened-restoring-lastSelection" recordIdsCount: 121 ❌
"addHighlightGraphics-complete" addedCount: 121 ❌ (should be 118)
```

### Solution
- Changed restoration condition from `isAccumulationMode && accumulatedRecords` to just `accumulatedRecords`
- Now uses `accumulatedRecords` for **ALL modes** (New/Add/Remove), not just Add/Remove
- `lastSelection` only as emergency fallback (should never happen)
- `accumulatedRecords` is universal source of truth (reflects removals in NEW mode)

### Why This Was Missed
- r021.110 documented `lastSelection` removal in CHANGELOG
- Fix was implemented, built (r021.128.js), deployed, and tested by team
- But source code change (.ts files) never committed to git
- Bug rediscovered during r022.0 edge case testing

### Impact
- ✅ Removed records stay removed after close/reopen
- ✅ Works correctly in all modes (NEW, ADD, REMOVE)
- ✅ Closes r021.108 functional gap that was documented but not in source

### Files Modified
- `query-simple/src/runtime/hooks/use-selection-restoration.ts` - Changed restoration condition (line 274), added r022.1 comment and fallback warning log
- `query-simple/src/version.ts` - Bumped to r022.1

### Testing
Reproduce bug scenario:
1. Query 121 records (NEW mode)
2. Remove 3 records → 118 in panel ✅
3. Close widget → Graphics clear ✅
4. Open widget → Should restore 118, NOT 121 ✅

---

## [1.19.0-r022.0] - 2026-01-30 - Tab Extraction: Query Tab → QueryTabContent.tsx

### Changed
- **Architectural Refactor**: Extracted Query tab content into separate component to prepare for Graphics tab addition
  - Created `query-simple/src/runtime/tabs/QueryTabContent.tsx` (598 lines)
  - Reduced `query-simple/src/runtime/query-task.tsx` from 3456 → 2982 lines (474 lines removed, 13.7% reduction)
  - Positioned for Graphics tab addition without creating 4000+ line "god component"

### What Moved to QueryTabContent.tsx
- Results Mode button group (New/Add/Remove selection modes)
- Form wrapper and QueryTaskForm component
- DataSourceTip component
- All Query tab-specific UI and logic

### What Stayed in query-task.tsx (Shared by All Tabs)
- Header (back button, query label, hash info, Clear Results button)
- Search Layer dropdown (+ Search Alias when grouped)
- Tab bar and orchestration
- Query execution logic

### Architecture
```
query-task.tsx (2982 lines - orchestration + shared UI)
├─ tabs/QueryTabContent.tsx (598 lines - Query tab)
├─ tabs/ResultsTabContent.tsx (query-result.tsx - Results tab)
└─ tabs/GraphicsTabContent.tsx (FUTURE)
```

### Approach
- **Pure code relocation** - No behavior changes, no new hooks
- **Minimal approach** - Kept Query tab logic consolidated in one component (no over-normalization)
- **Props-based** - QueryTabContent receives all needed state/callbacks from parent

### Impact
- ✅ `query-task.tsx` manageable size (under 3000 lines)
- ✅ Ready for Graphics tab addition
- ✅ Each tab independently readable
- ✅ Zero functional changes (pure relocation)
- ✅ Build successful, no linter errors

### Files Modified
- `query-simple/src/runtime/tabs/QueryTabContent.tsx` (NEW) - 598 lines
- `query-simple/src/runtime/query-task.tsx` - Reduced 474 lines, imports QueryTabContent
- `query-simple/src/version.ts` - Bumped to r022.0

### Documentation
- Implementation plan: `docs/development/TAB_EXTRACTION_IMPLEMENTATION_PLAN.md`
- TODO updated: Section 2b marked Phase 1 complete

---

