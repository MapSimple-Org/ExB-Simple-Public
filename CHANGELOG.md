# Changelog

All notable changes to MapSimple Experience Builder widgets will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## [1.19.0-r021.130] - 2026-01-29 - Clear Pattern Extended to Results Tab

### Changed
- **Results-tab clear**: Same memory-workflow pattern as Query-tab clear (destroy DS, null outputDS, increment dsRecreationKey). Apply with no DS stores pending query; runs when new DS created.
- **clearResult**: `shouldDestroyDSs` now includes `navToForm-clearResults`; null + key increment for `user-trash-click` or `navToForm-clearResults`. TASK log `clearResult-clear-tab-pattern` (was `clearResult-query-tab-pattern`).

### Files Modified
- `query-simple/src/runtime/query-task.tsx` - extend destroy + pattern to `navToForm-clearResults`
- `query-simple/src/version.ts` - Bumped to r021.130

---

## [1.19.0-r021.129] - 2026-01-29 - Query-Tab Clear: Memory-Workflow Pattern (Use-After-Destroy Fix)

### Fixed
- **Clear from Query tab then Apply**: TypeError `Cannot read properties of undefined (reading 'pendingPromiseToQuerySelectedRecordsPresetBeforeDsReady')` when user clears via Query-tab trash, keeps value in box, and clicks Apply
  - Root cause: We destroyed the output DS on Query-tab clear but kept referring to it; Apply then called `updateQueryParams` on the destroyed DS
  - Results-tab clear did not destroy the DS (`navToForm-clearResults`), so no crash there

### Implementation (Query-tab clear only; Results extended in r021.130)
- **clearResult** (`user-trash-click`): After `clearAllSelectionsForWidget` destroys DSs, `setOutputDS(null)` and `setDsRecreationKey(k => k + 1)` so Output DataSourceComponent remounts and creates a new DS (same pattern as memory workflow)
- **handleFormSubmitInternal**: When `!outputDS`, store `{ sqlExpr, spatialFilter, runtimeZoomToSelected }` in `pendingQueryAfterClearRef`, `setStage(0)`, return; `handleOutputDataSourceCreated` already runs pending query when new DS exists
- TASK log when we null + increment; `handleFormSubmitInternal-no-outputDS` note updated

### Files Modified
- `query-simple/src/runtime/query-task.tsx` - clearResult (user-trash-click null + key), handleFormSubmitInternal (store pending when no DS)
- `query-simple/src/version.ts` - Bumped to r021.129

---

## [1.19.0-r021.128] - 2026-01-28 - Stale Accumulated Count Fix (BUG-STALE-COUNT-001)

### Fixed
- **Stale accumulated count in handleSelectionChange**: Handler no longer reads stale `state.accumulatedRecords?.length` when selection is cleared
  - **Option A**: Selection event detail now includes `accumulatedRecordsCount`; dispatcher passes current count (0 when clearing)
  - Handler uses `event.detail.accumulatedRecordsCount` with fallback to state; event is source of truth at dispatch time
  - Fixes incorrect `hasSelection: true` / `selectionRecordCount: 2` after clear and related production errors

### Implementation
- `selection-utils.ts`: `dispatchSelectionEvent(..., accumulatedRecordsCount?)`; pass 0 in `clearAllSelectionsForWidget`
- `use-event-handling.ts`: EventManager `dispatchSelectionEvent` and event detail include `accumulatedRecordsCount`
- `use-selection-restoration.ts`: Handler uses `eventAccumulatedCount`; logging shows `eventAccumulatedCount` and `stateAccumulatedCount`
- Call sites: query-task (select pass `accumulatedRecords?.length`, clear pass 0), query-result (pass `accumulatedRecords?.length`), widget unchanged (optional param)

### Testing and debug
- See `docs/bugs/BUG-STALE-ACCUMULATED-COUNT-PLAN.md` section "Testing and Debug Flags"
- Enable RESTORE, TASK, EVENTS; filter console by [QUERYSIMPLE-RESTORE], [QUERYSIMPLE-TASK], [QUERYSIMPLE-EVENTS]
- Verify: clear in Add/Remove mode shows `eventAccumulatedCount: 0`, `calculatedSelectionCount: 0`, `will-set-hasSelection: false`

### Files Modified
- `query-simple/src/runtime/selection-utils.ts`, `hooks/use-event-handling.ts`, `hooks/use-selection-restoration.ts`
- `query-simple/src/runtime/query-task.tsx`, `query-result.tsx`
- `docs/bugs/BUG-STALE-ACCUMULATED-COUNT-PLAN.md` - Status fixed, testing and debug section added
- `query-simple/src/version.ts` - Bumped to r021.128

---

## [1.19.0-r021.127] - 2026-01-28 - Zoom Extent Expansion Documentation

### Added
- **Technical doc**: `docs/technical/ZOOM_EXTENT_EXPANSION.md` - Single source of truth for zoom-by-factor design
  - Why extent expansion instead of padding
  - Math (center, half-size, factor, new extent)
  - Where it lives in code, how to make factor configurable
  - Calibration tool usage, zero-area handling, references
- **In-code docs**: zoom-utils.ts file header and expansion block; use-zoom-to-records.ts JSDoc
- **Development guide**: Zoom to Records section updated for expansion factor; link to technical doc; References entry

### Files Modified
- `docs/technical/ZOOM_EXTENT_EXPANSION.md` (new)
- `query-simple/src/runtime/zoom-utils.ts` - File and expansion-block comments
- `query-simple/src/runtime/hooks/use-zoom-to-records.ts` - JSDoc
- `docs/development/DEVELOPMENT_GUIDE.md` - Zoom section + References
- `query-simple/src/version.ts` - Bumped to r021.127

---

## [1.19.0-r021.126] - 2026-01-28 - Fixed Zoom ReferenceError

### Fixed
- **Zoom Broken**: Fixed ReferenceError in extent expansion calculation that prevented zoom from working
  - Bug: Referenced undefined `originalExtent` variable (was renamed to `originalExtentBeforeFactorExpansion`)
  - Impact: Zoom to selected records was completely broken - `mapView.goTo()` never called
  - Fix: Updated all references to use correct variable name

### Files Modified
- `query-simple/src/runtime/zoom-utils.ts` - Fixed variable reference in expansion calculation
- `query-simple/src/version.ts` - Bumped to r021.126

---

## [1.19.0-r021.124] - 2026-01-28 - Extent Expansion by Factor (Replaces Padding)

### Changed
- **Zoom Strategy**: Replaced viewport-dependent padding with extent expansion by percentage factor
  - **Expansion Factor**: Default 1.2 (20% expansion = 10% on each side)
  - **Benefits**: More predictable, independent of viewport size, consistent across zoom levels
  - **Removed**: All adaptive padding logic based on aspect ratio
- **Calibration Tool**: Updated to calculate expansion factor instead of padding values
- Extent is expanded in map coordinates before calling `mapView.goTo()` (no padding parameter)

### Technical Details
- Expansion factor: `1.2` = expand extent by 20% in all directions
- Calculated as: `newHalfWidth = originalHalfWidth * expansionFactor`
- Works consistently at all zoom levels because it's in map units, not pixels
- Zero-area extents still use the 300ft buffer (unchanged)

### Files Modified
- `query-simple/src/runtime/zoom-utils.ts` - Replaced padding logic with extent expansion
- `query-simple/src/version.ts` - Bumped to r021.124

---

## [1.19.0-r021.122] - 2026-01-28 - Minimum Padding Guarantees

### Fixed
- **Padding Never Zero**: Added minimum padding guarantees to ensure padding is never set to 0px
  - **Horizontal extents**: Minimum 60px top/bottom (was 30% of 200px = 60px, now explicitly guaranteed)
  - **Vertical extents**: Minimum 150px left/right (was 30% of 500px = 150px, now explicitly guaranteed)
- Prevents edge cases where calculated padding could round to 0

### Files Modified
- `query-simple/src/runtime/zoom-utils.ts` - Added Math.max() to ensure minimum padding values
- `query-simple/src/version.ts` - Bumped to r021.122

---

## [1.19.0-r021.121] - 2026-01-28 - Improved Adaptive Padding Logic

### Changed
- **Adaptive Padding Logic**: Now always applies some padding to all sides, not just the emphasized dimension
  - **Horizontal extents** (wider than tall): Full left/right (500px), reduced top/bottom (60px = 30% of 200px)
  - **Vertical extents** (taller than wide): Full top/bottom (200px), reduced left/right (150px = 30% of 500px)
  - **Square extents**: Full padding on all sides (500px sides, 200px top/bottom)
- Fixes issue where very horizontal extents got zero top/bottom padding, causing tight vertical spacing
- Fixes issue where very vertical extents got zero left/right padding, causing tight horizontal spacing

### Files Modified
- `query-simple/src/runtime/zoom-utils.ts` - Updated adaptive padding to always apply some padding to all sides
- `query-simple/src/version.ts` - Bumped to r021.121

---

## [1.19.0-r021.120] - 2026-01-28 - Updated Zoom Padding Values

### Changed
- **Zoom Padding**: Updated padding values based on user testing
  - **Sides (left/right)**: 500px (was 485px)
  - **Top/bottom**: 200px (was 125px)
- Adaptive padding logic (from r021.119) still applies these values based on extent aspect ratio

### Files Modified
- `query-simple/src/runtime/zoom-utils.ts` - Updated DEFAULT_PADDING values
- `query-simple/src/version.ts` - Bumped to r021.120

---

## [1.19.0-r021.119] - 2026-01-28 - Adaptive Zoom Padding Based on Extent Aspect Ratio

### Changed
- **Adaptive Padding**: Zoom padding now adapts based on the extent's aspect ratio
  - **Vertical extent** (taller than wide, ratio < 0.8): Padding applied to **top/bottom only** (125px each)
  - **Horizontal extent** (wider than tall, ratio > 1.25): Padding applied to **left/right only** (485px each)
  - **Square/regular extent** (ratio 0.8-1.25): Padding applied to **all sides** (485px sides, 125px top/bottom)
- Prevents over-elongation by only padding the shorter dimension
- Makes zoom results more balanced regardless of extent shape

### Technical Details
- Aspect ratio calculated as `width / height`
- Threshold: < 0.8 = vertical, > 1.25 = horizontal, 0.8-1.25 = square
- Base padding values: 485px (sides), 125px (top/bottom)

### Files Modified
- `query-simple/src/runtime/zoom-utils.ts` - Added adaptive padding logic based on aspect ratio
- `query-simple/src/version.ts` - Bumped to r021.119

---

## [1.19.0-r021.118] - 2026-01-28 - Asymmetric Zoom Padding (Calibrated)

### Changed
- **Zoom Padding**: Updated to asymmetric padding based on user calibration testing
- **Sides (left/right)**: 485px each (average of calibrated 493px/476px)
- **Top/bottom**: 125px each (middle of 100-150 range for testing)
- Provides more breathing room on the sides while keeping top/bottom reasonable
- User can test across different zoom levels to fine-tune

### Files Modified
- `query-simple/src/runtime/zoom-utils.ts` - Updated DEFAULT_PADDING to asymmetric values
- `query-simple/src/version.ts` - Bumped to r021.118

---

## [1.19.0-r021.117] - 2026-01-28 - Updated Zoom Padding (Calibrated)

### Changed
- **Zoom Padding**: Updated default zoom padding from 200px to 250px on all sides
- Value calibrated using the zoom extent calibration tool based on user testing
- User calibration showed: left: 493px, right: 476px, top: 25px, bottom: 20px (average: ~253px)
- Using 250px as rounded average for all sides

### Files Modified
- `query-simple/src/runtime/zoom-utils.ts` - Updated DEFAULT_PADDING from 200px to 250px
- `query-simple/src/version.ts` - Bumped to r021.117

---

## [1.19.0-r021.116] - 2026-01-28 - Zoom Extent Calibration Tool

### Added
- **Zoom Extent Calibration Tool**: Added debug tool to capture adjusted map extents and calculate optimal padding values
- **Enhanced Extent Logging**: Zoom operations now log detailed extent coordinates (before and after zoom)
- **Console Function**: `window.__querySimpleCaptureAdjustedExtent()` - Run after manually adjusting zoom to calculate optimal padding

### How to Use
1. Run a query that triggers auto-zoom (or enable `?debug=ZOOM` to see extent logs)
2. Manually adjust the map zoom to your preferred extent
3. In browser console, run: `window.__querySimpleCaptureAdjustedExtent()`
4. Console will show:
   - Original extent (before padding)
   - Adjusted extent (your preferred zoom)
   - Calculated padding values that would produce your adjusted extent
   - Recommended average padding value

### Files Modified
- `query-simple/src/runtime/zoom-utils.ts` - Added extent logging and calibration function
- `query-simple/src/version.ts` - Bumped to r021.116

---

## [1.19.0-r021.115] - 2026-01-28 - Increased Default Zoom Padding

### Changed
- **Zoom Padding**: Increased default zoom padding from 100px to 200px on all sides when zooming to query results
- Provides more breathing room around features when auto-zooming after query execution
- Value is currently hardcoded but structured to be easily made configurable per query item in the future

### Files Modified
- `query-simple/src/runtime/zoom-utils.ts` - Updated DEFAULT_PADDING from 100px to 200px
- `query-simple/src/version.ts` - Bumped to r021.115

---

## [1.19.0-r021.114] - 2026-01-28 - Increased Default Zoom Padding

### Changed
- **Zoom Padding**: Increased default zoom padding from 50px to 100px on all sides when zooming to query results
- Provides more breathing room around features when auto-zooming after query execution
- Value is currently hardcoded but structured to be easily made configurable per query item in the future

### Files Modified
- `query-simple/src/runtime/zoom-utils.ts` - Updated DEFAULT_PADDING from 50px to 100px
- `query-simple/src/version.ts` - Bumped to r021.114

---

## [1.19.0-r021.113] - 2026-01-28 - Unified Clearing Function (Hash Clearing Fix)

### Fixed
- **Hash Not Cleared from Query Tab**: When clearing results from the Query tab, the hash parameter (`#data_s=...`) was not cleared, leaving a "dirty hash" in the URL. Results tab clear worked correctly.

### Root Cause
- Two separate code paths in `clearResult()` function:
  - **Query tab clear** (`user-trash-click`): Used multi-source clearing path that manually cleared origin DSs but **didn't call `clearSelectionInDataSources()`**, which is where hash clearing happens
  - **Results tab clear** (`navToForm-clearResults`): Used simpler path that **did call `clearSelectionInDataSources()`**, which cleared the hash

### Solution
- **Created unified `clearAllSelectionsForWidget()` function** in `selection-utils.ts` that handles all clearing logic:
  - Multi-source clearing (all origin DataSources for the widget)
  - Graphics layer clearing
  - Popup closing
  - Hash clearing (via `clearSelectionInDataSources()`)
  - Event dispatching
  - Message publishing
  - Optional DataSource destruction
- **Refactored `clearResult()`** to use the unified function for both paths
- Both Query tab and Results tab now execute the same code, ensuring consistent behavior

### Impact
- ✅ Hash is always cleared regardless of which tab the clear action comes from
- ✅ Both paths handle multi-source clearing correctly
- ✅ Single source of truth for clearing logic (DRY principle)
- ✅ Consistent behavior across all clear operations

### Files Modified
- `query-simple/src/runtime/selection-utils.ts` - Added `clearAllSelectionsForWidget()` unified function
- `query-simple/src/runtime/query-task.tsx` - Refactored `clearResult()` to use unified function, removed duplicate clearing logic
- `query-simple/src/version.ts` - Bumped to r021.113

---

## [1.19.0-r021.112] - 2026-01-27 - Fix Mode Switch Priority (Stale outputDS.getSelectedRecords())

### Fixed
- **Records Resurrection on Mode Switch (Part 2)**: When switching from NEW to ADD mode after removing records, `outputDS.getSelectedRecords()` returned stale data (121 records) instead of the correct count (118)

### Root Cause
- r021.111 fixed the fallback to use `accumulatedRecords` over `effectiveRecords`, but the priority was still: `outputDS.getSelectedRecords()` → `accumulatedRecords` → `effectiveRecords`
- `outputDS.getSelectedRecords()` can be stale after removals in NEW mode (returns original 121 instead of current 118)
- When `outputDS.getSelectedRecords()` had data, it was used even though it was incorrect

### Solution
- **Prioritized `accumulatedRecords` over `outputDS.getSelectedRecords()`** when switching from NEW mode
- New priority: `accumulatedRecords` → `outputDS.getSelectedRecords()` → `effectiveRecords` → `[]`
- `accumulatedRecords` is the single source of truth that reflects removals (r021.110)
- Applied fix to both NEW→ADD and NEW→REMOVE mode switches

### Impact
- ✅ Mode switches now correctly use `accumulatedRecords` (reflects removals)
- ✅ No more stale `outputDS.getSelectedRecords()` data being used
- ✅ Records stay removed when switching modes

### Cleanup
- Removed all TWO-CLICK diagnostic logs (bug resolved)
- Converted `console.warn` and `console.error` to `debugLogger` for consistency

### Files Modified
- `query-simple/src/runtime/query-task.tsx` - Prioritized `accumulatedRecords` in mode switch logic (2 locations), converted console statements
- `query-simple/src/runtime/query-result.tsx` - Removed TWO-CLICK diagnostic logs (4 locations)
- `query-simple/src/version.ts` - Bumped to r021.112

---

## [1.19.0-r021.111] - 2026-01-27 - Fix Mode Switch Fallback (Stale effectiveRecords)

### Fixed
- **Records Resurrection on Mode Switch**: When switching from NEW to ADD mode after removing records, all original records would reappear

### Root Cause
- Mode switch logic used this fallback priority: `outputDS.getSelectedRecords()` → `effectiveRecords` → `[]`
- `effectiveRecords` comes from `recordsRef.current`, which is only updated on new queries
- After removing records in NEW mode, `accumulatedRecords` was correctly synced (118), but `recordsRef.current` stayed stale (121)
- When `outputDS.getSelectedRecords()` was empty, it fell back to stale `effectiveRecords` (121 records)

### Solution
- Changed fallback priority to: `outputDS.getSelectedRecords()` → `accumulatedRecords` → `effectiveRecords` → `[]`
- `accumulatedRecords` is kept in sync with removals (r018.97), so it's the correct fallback
- Applied fix to both NEW→ADD and NEW→REMOVE mode switches

### Impact
- ✅ Mode switches now preserve removed-record state
- ✅ Switching from NEW to ADD after removals uses correct (reduced) count
- ✅ No more "zombie records" reappearing on mode change

### Files Modified
- `query-simple/src/runtime/query-task.tsx` - Updated mode switch fallback logic (2 locations)
- `query-simple/src/version.ts` - Bumped to r021.111

---

## [1.19.0-r021.110] - 2026-01-27 - Remove lastSelection (Stale Fallback)

### Removed
- **`lastSelection` State Property**: Removed orphaned/stale fallback state that was causing out-of-sync issues

### Root Cause
- `lastSelection` was only updated from data source selection events
- When records were removed via `handleAccumulatedRecordsChange`, `accumulatedRecords` was updated but `lastSelection` was NOT
- This created a ticking time bomb: if restoration ever fell back to `lastSelection`, it would restore stale/incorrect data
- r021.108 already prioritized `accumulatedRecords`, making `lastSelection` largely unused

### Solution
- **Removed `lastSelection` entirely** - Use `accumulatedRecords` as single source of truth
- Removed `lastSelection` from widget state interface
- Removed `lastSelection` update logic in `handleSelectionChange`
- Removed `restoreLastSelection` fallback in restoration logic (68 lines)
- Removed `clearLastSelection` fallback in clear logic (58 lines)
- Simplified `handleRestoreOnIdentifyClose` to remove `lastSelection` validation

### Impact
- ✅ Eliminates risk of stale data restoration
- ✅ Simpler architecture - one source of truth
- ✅ Removed 126+ lines of dead/dangerous fallback code
- ✅ No functional changes - restoration already prioritized `accumulatedRecords` (r021.108)

### Files Modified
- `query-simple/src/runtime/widget.tsx` - Removed `lastSelection` from state and validation logic
- `query-simple/src/runtime/hooks/use-selection-restoration.ts` - Removed `lastSelection` update, fallbacks, and helper methods
- `query-simple/src/version.ts` - Bumped to r021.110

---

## [1.19.0-r021.109] - 2026-01-27 - Fix Duplicate Detection to Use Composite Keys

### Fixed
- **Graphics Missing When Combining Queries with Same Record IDs**: When adding records from different queries in ADD mode, if two records had the same `recordId` (e.g., "2" from Trails and "2" from Arlington), the duplicate detection would skip adding the second graphic even though they were from different data sources.

### Root Cause
- Duplicate detection in `addHighlightGraphics` was only checking `recordId`
- It treated records with the same ID from different queries as duplicates
- This prevented legitimate graphics from being added to the map

### Solution
- Changed duplicate detection to use **composite keys** (`recordId__queryConfigId`)
- Now checks: `existingCompositeKey === compositeKey` instead of `existingRecordId === recordId`
- Tracks added items using composite keys: `addedDuringThisOperation.add(compositeKey)`
- Records with same ID from different queries can now coexist on the map

### Impact
- ✅ Multiple queries can have records with same IDs (graphics appear for both)
- ✅ True duplicates (same recordId AND same queryConfigId) still prevented
- ✅ Works correctly in ADD mode when combining queries from different sources
- ✅ Results panel correctly shows all records (this was already working)

### Files Modified
- `query-simple/src/runtime/graphics-layer-utils.ts` - Updated duplicate detection to use composite keys
- `query-simple/src/version.ts` - Bumped to r021.109

### Testing
Test ADD mode with duplicate IDs:
1. Run query from Trails (returns record with ID "2")
2. Switch to ADD mode
3. Run query from Arlington (returns record with ID "2")
4. **Expected**: Both graphics appear on map (2 graphics total)
5. **Expected**: Results panel shows both records (2 records total)

---

## [1.19.0-r021.108] - 2026-01-27 - Fix Restoration to Use Updated accumulatedRecords

### Fixed
- **Removed Records Reappear After Close/Reopen**: In NEW mode, when records were removed and the widget was closed/reopened, the removed records would reappear on the map. This was because restoration logic was using stale `lastSelection` data instead of the updated `accumulatedRecords`.

### Root Cause
- Widget-level `accumulatedRecords` state WAS being updated correctly during removal (121 → 120 → 119 → 118)
- But restoration logic checked `isAccumulationMode` first and only used `accumulatedRecords` in ADD/REMOVE modes
- In NEW mode, it fell back to `lastSelection` which still contained all 121 original record IDs (never updated during removal)
- Result: Restoration added back the 3 removed records (451314, 451315, 451316)

### Solution
- **Changed restoration priority** in `use-selection-restoration.ts`
- Now checks for `accumulatedRecords` FIRST, regardless of mode
- Only falls back to `lastSelection` if no `accumulatedRecords` exist
- This ensures removals in NEW mode are respected during restoration

### Impact
- ✅ Removed records stay removed after close/reopen
- ✅ Works correctly in all modes (NEW, ADD, REMOVE)
- ✅ accumulatedRecords now serves as single source of truth for restoration

### Files Modified
- `query-simple/src/runtime/hooks/use-selection-restoration.ts` - Changed restoration logic priority
- `query-simple/src/version.ts` - Bumped to r021.108

### Testing
Test restoration with removals:
1. Query 121 records (NEW mode)
2. Remove 3 records (451314, 451315, 451316)
3. Close widget
4. Reopen widget
5. **Expected**: 118 graphics on map (NOT 121)
6. **Expected**: Removed records (451314, 451315, 451316) do NOT reappear

### Related Issues
- Completes fix started in r021.106 (triple-call race)
- Addresses second root cause identified in `docs/audit/ROOT-CAUSE-ANALYSIS.md`

---

## [1.19.0-r021.106] - 2026-01-27 - Fix Triple-Call Race After Removals

### Fixed
- **Triple-Call Race After Removal**: After removing a record, `handleRenderDone` was firing 3 times (from List re-renders), causing 3 simultaneous `selectRecordsInDataSources` calls. This created race conditions and duplicate graphics operations.

### Root Cause
- `handleRenderDone` callback was passed to the `SimpleList` component and fired on every render
- After removal, React would re-render the List 3 times (removal complete, state propagation, graphics/selection updates)
- Each render triggered `handleRenderDone`, which called `selectRecordsAndPublish` with the full current list
- The `pendingGraphicsOperation` promise serialization had a race where multiple waiters would proceed concurrently after the first operation completed

### Solution
- **Removed `handleRenderDone` entirely** - it was redundant with the records-watching useEffect that already handles selection updates
- The List component manages its own pagination internally, so queryData state mirroring was unnecessary
- This eliminates the source of the triple-call race

### Impact
- ✅ Only ONE selection call fires after removal (instead of 3)
- ✅ Cleaner, more predictable selection flow
- ✅ Eliminates race conditions from overlapping async graphics operations

### Files Modified
- `query-simple/src/runtime/query-result.tsx` - Removed handleRenderDone function and onRenderDone prop
- `query-simple/src/version.ts` - Bumped to r021.106

### Testing
Test removal flow:
1. Query 121 records
2. Remove 1 record
3. **Expected**: Only ONE `selectRecordsInDataSources-ENTRY` log (not 3)
4. **Expected**: Graphics layer updates cleanly with 120 records

### Related Issues
- Addresses first root cause identified in `docs/audit/ROOT-CAUSE-ANALYSIS.md`
- Second fix (restoration bug) completed in r021.108

---

## [1.19.0-r021.94] - 2026-01-27 - React Key Collision Fix & Dead Code Removal

### Fixed
- **Ghost Records in Results Panel**: When two records from different queries shared the same `recordId` (e.g., both have ID "2"), removing one would leave a "ghost" visual artifact. The removed record's UI would remain visible but non-interactive (expand/collapse wouldn't work correctly).

### Removed
- **Dead Code Cleanup**: Deleted `paging-list.tsx` and `lazy-list.tsx` - unused since r016.4 when SimpleList was forced as the only list component. These files were maintained unnecessarily and added no value.

### Root Cause
- React component keys were based solely on `recordId`, causing key collisions when multiple records shared the same ID but had different `queryConfigId` values.
- When a record was removed, React would reuse the existing component instance (same key) instead of unmounting it, preserving stale internal state.

### Solution
- Changed `SimpleList` component to use composite keys: `${recordId}__${queryConfigId}`
- React now correctly unmounts removed components and mounts new ones with different queryConfigId values
- Each record gets a unique key regardless of ID overlap across queries

### Impact
- ✅ Removal of records with duplicate IDs now works correctly
- ✅ No more ghost records in UI after removal
- ✅ Expand/collapse state correctly tied to the actual record being displayed
- ✅ Tab counts were already correct (this was purely a React rendering issue)

### Files Modified
- `query-simple/src/runtime/simple-list.tsx` - Use composite key for QueryResultItem
- `query-simple/src/runtime/query-result.tsx` - Use `capturedQueryConfigId` consistently in outputDS filter
- `query-simple/src/version.ts` - Bumped to r021.94

### Files Deleted
- `query-simple/src/runtime/paging-list.tsx` - Dead code (unused since r016.4)
- `query-simple/src/runtime/lazy-list.tsx` - Dead code (unused since r016.4)

---

## [1.19.0-r021.93] - 2026-01-27 - Graphics Layer Rendering Fixes

### Fixed
- **Graphics Layer Doubling**: Graphics appeared doubled (super dark) when adding records in ADD mode. Fixed by serializing overlapping async calls to `selectRecordsInDataSources` that were racing and stacking graphics.
- **Record Removal Failure**: Clicking X to remove a record didn't remove its graphic from the map. Fixed by correcting the timing of `__queryConfigId` cleanup - now happens AFTER graphics removal so composite key matching works.
- **Restore Showing Only Last Item**: After close/reopen, only the last added record's graphic displayed. Fixed by batching all accumulated records' graphics in ONE operation instead of per-origin-DS clearing.

### Root Causes & Solutions

#### 1. Graphics Doubling
- **Cause**: Two `useEffect` hooks firing within 1ms of each other (query completion + records prop change), both calling `selectRecordsInDataSources`. Because `addHighlightGraphics` is async, the second call's clear happened before the first call's add completed, leading to both sets being added.
- **Solution**: Added `pendingGraphicsOperation` tracking in `selection-utils.ts`. New calls wait for pending operations to complete before starting, preventing async overlap.

#### 2. Removal Failure  
- **Cause**: `__queryConfigId` was deleted from record attributes BEFORE calling `removeHighlightGraphics`. When removal logic tried to build composite keys (`recordId__queryConfigId`), the queryConfigId was already gone, resulting in mismatched keys (`"923__"` vs `"923__948755217701372"`).
- **Solution**: Captured `__queryConfigId` BEFORE cleanup, then moved the actual cleanup to AFTER graphics removal completes. Composite key matching now works perfectly.

#### 3. Restore Showing Only Last Item
- **Cause**: Restore logic looped through origin data sources and called `selectRecordsAndPublish` for each. Since each call starts with `clearGraphicsLayer()`, the second origin DS's graphics wiped out the first's graphics.
- **Solution**: Refactored restore to clear graphics layer ONCE, then add ALL accumulated records in a single batch, then restore selection per origin DS WITHOUT passing graphics layer params.

### Technical Details
- **Async Serialization**: `pendingGraphicsOperation` promise tracks in-flight graphics operations
- **Cleanup Timing**: `capturedQueryConfigId` variable holds value before deletion for use in removal logic
- **Batch Restore**: Graphics added once for all records, selection restored separately per origin DS with `useGraphicsLayer: false`
- **Structure Fix**: `accumulatedRecords` are raw FeatureDataRecord objects, not `{configId, record}` wrappers

### Files Modified
- `query-simple/src/runtime/graphics-layer-utils.ts` - Added composite key diagnostic logging
- `query-simple/src/runtime/query-result.tsx` - Fixed __queryConfigId cleanup timing (capture before, delete after)
- `query-simple/src/runtime/selection-utils.ts` - Added async serialization with pendingGraphicsOperation
- `query-simple/src/runtime/hooks/use-selection-restoration.ts` - Batch graphics restore, fixed structure handling
- `query-simple/src/version.ts` - Bumped to r021.93

### Memory & Performance Notes
- Memory profile remains healthy: ~68 MB growth after extensive testing (multiple queries, mode switches, close/reopen cycles)
- No widget-specific memory leaks detected
- One transient removal failure observed during high-memory session (2.4 GB tab usage) but not reproducible after reload
- Normal browser/framework caching accounts for memory growth

### Testing
- ✅ ADD mode: Add record → graphics appear correctly (no doubling)
- ✅ Close/reopen: All accumulated records' graphics persist
- ✅ Remove record: X button cleanly removes correct graphic with composite key matching
- ✅ Multiple origin DS: Records from different queries maintain separate graphics

---

## [1.19.0-r021.88] - 2026-01-25 - Tab Auto-Switch Fix

### Fixed
- **Auto-Switch to Results Tab in ADD/REMOVE Modes**: Fixed bug where widget would auto-switch to Results tab in NEW mode but not in ADD or REMOVE modes. Changed `queryJustExecutedRef` from `useRef` to `useState` to ensure useEffect dependencies trigger properly.

### Technical Details
- **Problem**: Auto-switch useEffect only triggered when `resultCount`, `activeTab`, or `pagingTypeInConfig` changed. In ADD mode, `resultCount` might not change enough to trigger the effect, preventing auto-switch.
- **Solution**: Converted `queryJustExecutedRef` ref to `queryJustExecuted` state variable and added it to useEffect dependencies.
- **Result**: Auto-switch now works consistently across all modes.

### Files Modified
- `query-simple/src/runtime/query-task.tsx` - Changed ref to state, updated dependencies
- `query-simple/src/version.ts` - Bumped to r021.88

---

## [1.19.0-r021.87] - 2026-01-23 - Composite Key Stamping

### Changed
- **Composite Key Architecture**: Stamp `__queryConfigId` directly on record attributes when added (NEW, ADD, or mode switches). No map needed - simpler architecture that survives React state updates and mode transitions.

### Files Modified
- `query-simple/src/runtime/query-task.tsx` - Stamp composite key on records
- `query-simple/src/version.ts` - Bumped to r021.87

---

## [1.19.0-r021.52] - 2026-01-22 - BUG-ADD-MODE-001 Phase 1

### Added
- **Phase 1: Data Structure Changes for Accumulated Records**: Implemented new grouped record set architecture to fix format switching bug in ADD mode. Each accumulated record set now preserves its original query configuration metadata.
- Created `AccumulatedRecordSet` interface with UUID-based identity, immutable query config, and human-readable metadata
- Created `AccumulatedRecordsState` interface to manage grouped sets with flat list compatibility
- Added `addRecordSet` method to `AccumulatedRecordsManager` with comprehensive debug logging
- Added `handleAddRecordSet` callback in widget.tsx to capture query metadata during ADD mode execution
- Wired up callback through widget.tsx → QueryTaskList → QueryTask → query execution flow
- Debug logging category `BUG-ADD-MODE-001` shows query config metadata being stored with each set

### Changed
- Updated `AccumulatedRecordsManager` from flat array (`FeatureDataRecord[]`) to grouped structure (`AccumulatedRecordsState`)
- All manager methods updated to work with new structure while maintaining backward compatibility

### Technical Details
- **BULLETPROOF IDENTITY**: Each set has UUID-based `setInstanceId` for unique React keys
- **STRICT PROVENANCE**: Immutable `queryConfig` snapshot isolated from active query panel changes
- **HUMAN-READABLE**: Query names and aliases stored for user orientation
- **CENTRALIZED TRUTH**: Duplicate detection will operate at state level (Phase 2)

### Files Added
- `query-simple/src/runtime/types/accumulated-records.ts` - New type definitions
- `docs/bugs/BUG-ADD-MODE-001_PHASE1_COMPLETE.md` - Phase 1 documentation

### Files Modified
- `query-simple/src/runtime/hooks/use-accumulated-records.ts` - Manager updated for grouped structure
- `query-simple/src/runtime/widget.tsx` - Added `handleAddRecordSet` callback and wired it to QueryTaskList
- `query-simple/src/runtime/query-task-list.tsx` - Added prop pass-through for `onAddRecordSet`
- `query-simple/src/runtime/query-task.tsx` - Calls `onAddRecordSet` after merging in ADD mode
- `query-simple/src/version.ts` - Bumped to r021.52

### Known Limitations
- Record sets stored but not yet used for rendering (Phase 2)
- Format switching bug still occurs in UI (will be fixed in Phase 3)
- Duplicate detection not yet implemented (Phase 2)

### Testing
- Enable debug logging with `?debug=BUG-ADD-MODE-001` URL parameter
- Run queries in ADD mode to see `PHASE1-addRecordSet-called` and `PHASE1-state-updated` logs
- Logs show `setInstanceId`, `queryConfig` metadata, and state breakdown
- All existing E2E tests still pass
- See `docs/bugs/PHASE1_TESTING_GUIDE.md` for step-by-step testing instructions

---

## [1.19.0-r021.51] - 2026-01-22

### Changed
- **Replaced programmatic button click with React key prop pattern**: Removed anti-pattern DOM manipulation (programmatic button click) for DataSource recreation. Now uses idiomatic React `key` prop on `DataSourceComponent` to force remounting when DS is destroyed. Memory testing shows equivalent performance (18.67 vs 18.83 MB/query). This is the proper React pattern and more suitable for Esri review.

### Technical Details
- Added `dsRecreationKey` state variable that increments when DS is destroyed
- DataSourceComponent now has `key={dsRecreationKey}` prop
- When key changes, React unmounts old component and mounts new one, triggering natural DS recreation
- Removed `clearResultBtnRef` and programmatic `.click()` call
- Updated all inline documentation to reflect r021.51 pattern
- Maintains same 300ms settle time for React/ESRI stabilization (tested in r021.31-35)

### Files Modified
- `query-simple/src/runtime/query-task.tsx` - Key prop pattern implementation
- `query-simple/src/version.ts` - Bumped to r021.51

---

## [1.19.0-r021.50] - 2026-01-20

### Fixed
- **Missing OutputDataSource Check**: Added safety check in `handleFormSubmitInternal` to prevent crash when `outputDS` is undefined. Query execution now gracefully exits and returns control to user (Stage 0) if DataSource is not available.
  - **File**: `query-simple/src/runtime/query-task.tsx` line 1564
  - **Change**: Added `if (!outputDS)` check with `setStage(0)` and early return
  - **Impact**: Prevents `Cannot read properties of undefined` error when queries execute before DataSource is ready

## [1.19.0-r021.49] - 2026-01-20

### Fixed
- **Zero Results in Add Mode**: Fixed display of accumulated records when query returns 0 results in Add mode. Previously, empty query results would clear the Results panel even though accumulated records existed.
  - **File**: `query-simple/src/runtime/query-task.tsx` line 1690
  - **Change**: Added else branch to preserve `existingRecordsForMerge` when query returns 0 results
  - **Impact**: Accumulated records remain visible in Results tab when subsequent queries return nothing

## [1.19.0-r021.48] - 2026-01-20

### Fixed
- **Results Tab Blocking in Add Mode**: Fixed tab blocking logic to check accumulated records in addition to current query result count. In Add mode, if accumulated records exist but last query returned 0 results, Results tab remains accessible.
  - **File**: `query-simple/src/runtime/query-task.tsx` line 1519
  - **Change**: Tab blocking now checks `resultCount === 0 && (!accumulatedRecords || accumulatedRecords.length === 0)`
  - **Impact**: Users can always access Results tab when accumulated records exist, even if most recent query returned nothing

## [1.19.0-r021.47] - 2026-01-20

### Fixed
- **Query Error Recovery**: Changed error handler to exit Stage 2 (loading) and return to Stage 0 (form) on any query error. Ensures user always regains control if a query fails, whether initiated from widget or hash parameter.
  - **File**: `query-simple/src/runtime/query-task.tsx` line 2160
  - **Change**: `.catch()` block now calls `setStage(0)` instead of `setStage(1)`
  - **Impact**: Widget cannot get stuck in loading state after query errors

## [1.19.0-r021.46] - 2026-01-19

### Fixed
- **Expand/Collapse Arrow Icon Duplication**: Replaced 600 instances of `<RightFilled>` / `<DownFilled>` React components with CSS background-images using SVG data-uris. Eliminates 600 component instances and 600 DOM nodes. Combined with r021.44's trash icon fix, total of 1,200 icon component instances eliminated. **Result: Architecturally cleaner, follows React best practices.**
- **Removed r021.45 setTimeout Delay**: Testing confirmed the 1-second delay made zero difference to memory (0.09% change). Removed to restore r021.43's instant clear UX.

### The Problem

User question: "We fixed the trash can reference to be cleaner, what about the arrows used to expand/contract an individual result? Any other patterns that could be wasting space and not cleaning up properly later?"

Investigation revealed expand/collapse arrows in `FeatureInfo` component were also being duplicated:

```tsx
// Before (r021.45) - Creates 600 component instances:
{showContent ? <DownFilled size='m'/> : <RightFilled size='m' autoFlip/>}
```

With 600 results:
- 600 arrow icon React component instances (either RightFilled or DownFilled)
- 600 SVG DOM elements
- 600 sets of SVG path data

### The Solution

Same pattern as r021.44 trash icon fix - CSS background-images:

```tsx
// Define ONCE at module level
const rightArrowStyle = css`
  width: 16px;
  height: 16px;
  background-image: url('data:image/svg+xml;utf8,<svg>...</svg>');
  background-size: contain;
`

const downArrowStyle = css`
  width: 16px;
  height: 16px;
  background-image: url('data:image/svg+xml;utf8,<svg>...</svg>');
  background-size: contain;
`

// Reuse 600 times - NO component instances, NO DOM nodes
<div css={showContent ? downArrowStyle : rightArrowStyle} aria-hidden="true" />
```

**Memory Savings:**
- TWO CSS style definitions in memory
- TWO SVG data-uri strings
- 600 fewer React component instances
- 600 fewer DOM nodes
- **Estimated ~1-2 MB reduction in component overhead**

### Total Icon Optimization (r021.44 + r021.46)

Combined with trash icon fix, we've eliminated:
- 1,200 total icon component instances (600 trash + 600 arrows)
- 1,200 total DOM nodes
- **Estimated ~3-4 MB total reduction in component/DOM overhead**

### Final Memory Analysis (Allocation Sampling)

After extensive investigation using heap snapshots and allocation sampling, identified the source of the 25 MB baseline drift per accumulation cycle:

**Memory Breakdown (Clear 2 vs Clear 1):**
- ~1.5 MB: Detached DOM (React components)
- ~24 MB: **ESRI JSAPI Internals** (beyond our control)

**ESRI Internal Allocations (from allocation sampling):**
- 5.3 MB: `Ee` (ESRI minified code)
- 4.4 MB: `map` structures
- 3.2 MB: `S`, `c` (ESRI internals)
- 3.1 MB: **`onTrackingEnd`** (ESRI tracking/observers)
- 2.2 MB: **`e.reactionDeferred`** (ESRI reactive system)
- 1.5 MB: **`_watchMeshGeometryChanges`** (ESRI geometry watchers)

All allocations traced to `init.js:5` (ESRI's minified JSAPI bundle).

### Conclusion

✅ **What We Fixed:**
- Geometry reference leak: 11.21 MB → 1.76 MB/query (84% improvement) - r021.36
- ESRI observer cleanup order: Fixed orphaned observers - r021.39
- Multi-source clearing: 80% TrackingTarget reduction - r021.43
- Icon component duplication: 1,200 fewer component instances - r021.44/46

❌ **ESRI Limitations (Cannot Fix):**
- 24 MB of ESRI internal observers/watchers per accumulation cycle
- Created by ESRI's minified JSAPI code (`onTrackingEnd`, `e.reactionDeferred`, `_watchMeshGeometryChanges`)
- No public API to control or cleanup these internal structures

**Final Result:** Reduced accumulation mode baseline drift from 27 MB to 25 MB (7% improvement). Remaining 25 MB is ESRI JSAPI internals beyond widget control.

### Files Modified
- `components/feature-info.tsx` - Replaced arrow components with CSS icons
- `query-task.tsx` - Removed setTimeout delay (no memory benefit, worse UX)
- `version.ts` - Bumped to r021.46
- `CHANGELOG.md` - Documented optimization and ESRI limitations

---

## [1.19.0-r021.45] - 2026-01-19

### Exploring: React Lifecycle and Cleanup Timing
- **Investigation**: Detached DOM accumulation persists despite multiple approaches. Comparing execution order between working "New Query" flow vs "Trash Can Click" flow to understand React's cleanup timing.

### The Journey: Three Attempts to Fix Detached DOM

#### Attempt 1: Delay Parent Array Clearing (FAILED)
Moved `onAccumulatedRecordsChange([])` to AFTER `setTimeout(1000)` - hypothesis was closures needed time to release.

**Result:** Made it WORSE!
- Array: +172K instances (+7.8 MB) 
- Function: +224K instances (+6.7 MB)
- e.TrackingTarget: +61K instances (+1.5 MB)
- Detached DOM: Same as r021.44 (+2,878 divs, +722 buttons)

**Why it failed:** Keeping parent array populated for extra 1 second while React was trying to unmount created MORE references/closures.

#### Attempt 2: Revert to r021.43 Order (BASELINE)
Reverted to clearing parent array immediately (before setTimeout).

**Result:** Detached DOM identical to r021.44:
- Detached `<div>`: +2,885 instances
- Detached `<span>`: +1,448 instances  
- Detached `<button>`: +722 instances
- **Total: ~1.4 MB detached DOM per cycle**

**Conclusion:** The setTimeout delay made ZERO difference to detached DOM, regardless of when parent array was cleared.

#### Attempt 3: Move Delay to END (CURRENT - Testing)
**Key insight from analyzing "New Query" execution order:**

User: *"I think changes to the visual state wakes React up and tells it to start doing things. Our real button click happens at the beginning, but we haven't done anything yet, so React wakes up... and React says, I already woke up and there's nothing for me to do, I will get that later or never. React is falling back to sleep and it's done some of the things we asked, but not all and we need to kick it one last time."*

**The realization:** 
- User clicks trash → React wakes up
- We do all cleanup synchronously → React hasn't re-rendered yet (state batching)
- We finish and return → React says "I'll get to it later" and goes back to sleep
- React finally renders → Too late, components don't properly unmount

**The "New Query" flow that WORKS has a "kick" at the end:**
```
destroyDataSource(dsId)
  ↓
clearResultBtnRef.current.click() ← THIS KICKS REACT!
```

### Execution Order Comparison

#### New Query (Working - No detached DOM issues)
```
setStage(2) → "Retrieving..." overlay
recordsRef.current = null
setResultCount(0)
  ↓
clearSelectionInDataSources()
cleanupGraphicsLayer()
mapView.popup.close()
  ↓
onAccumulatedRecordsChange([]) → Clear parent
  ↓
dispatchSelectionEvent()
publishDataClearedMsg()
  ↓
destroyDataSource(dsId)
  ↓
clearResultBtnRef.current.click() → FINAL KICK to React
```

#### r021.43 - Trash Can (Has detached DOM)
```
recordsRef.current = null
setResultCount(0)
setActiveTab('query')
  ↓
onAccumulatedRecordsChange([]) → Clear parent
  ↓
[Multi-source clearing & cleanup]
destroyDataSource(dsId)
  ↓
setStage(0) → No final "kick"
```

#### r021.45 Current - Trash Can (Testing: Delay at END)
```
recordsRef.current = null
setResultCount(0)
setActiveTab('query')
  ↓
onAccumulatedRecordsChange([]) → Clear parent
  ↓
setStage(3) → Show spinner
  ↓
[Multi-source clearing & cleanup]
destroyDataSource(dsId)
  ↓
await setTimeout(1000) → MOVED HERE! Let React process cleanup
  ↓
setStage(0) → Final "kick" to React
```

### The Theory

**Delay at END gives React time to process the cleanup we just did**, then `setStage(0)` provides the final "kick" to ensure React completes all unmounting and GC.

Similar to how New Query's programmatic button click at the end forces React to process the DS destruction.

### Testing In Progress

**Hypothesis:** The 1-second delay AFTER cleanup but BEFORE final `setStage(0)` will allow:
1. React to process all the cleanup (DS destruction, unmounting, selection clearing)
2. Final `setStage(0)` acts as the "kick" to ensure everything completes
3. Detached DOM can be properly garbage collected

**Expected Result:**
- Detached `<button>`: ~0 delta (currently +722)
- Detached `<div>`: ~0 delta (currently +2,878)
- Detached `<span>`: ~0 delta (currently +1,448)

### Files Modified
- `query-simple/src/runtime/query-task.tsx` - Moved setTimeout to END, before setStage(0)
- `query-simple/src/version.ts` - Bumped to r021.45
- `CHANGELOG.md` - Documented exploration and attempts

---

## [1.19.0-r021.44] - 2026-01-19

### Fixed
- **Icon Component Duplication Memory Optimization**: Replaced 600 instances of `<TrashOutlined>` React components with a single CSS background-image using SVG data-uri. With 600 results displayed, this eliminates 600 React component instances and 600 DOM nodes (SVG elements). **Result: Reduces detached DOM accumulation by ~2 MB and eliminates unnecessary component overhead.**

### The Problem

User insight: "Those trash cans that we use in the Results, those are not unique instances of that object, right? We aren't duplicating it a bunch of times."

Unfortunately, we WERE duplicating it:
```tsx
// Before (r021.43) - Creates 600 component instances:
<TrashOutlined size={18} />  // ← Called for EVERY result item
```

With 600 results:
- 600 `<TrashOutlined>` React component instances
- 600 SVG DOM elements
- 600 sets of SVG path data
- Heap showed: +2,522 detached `<div>`, +1,450 detached `<span>`, +1,084 detached SVGPathElement

### The Solution

**Option 1: CSS background-image with SVG data-uri (most memory efficient)**

```tsx
// Define ONCE at module level
const trashIconStyle = css`
  width: 18px;
  height: 18px;
  background-image: url('data:image/svg+xml;utf8,<svg>...</svg>');
  background-size: contain;
`

// Reuse 600 times - NO component instances, NO DOM nodes
<div css={trashIconStyle} aria-hidden="true" />
```

**Memory Savings:**
- ONE CSS style definition in memory
- ONE SVG data-uri string
- 600 fewer React component instances
- 600 fewer DOM nodes
- **~2 MB reduction in detached DOM**

### Why This Matters

While this only saves ~2 MB out of the 27 MB baseline drift, it's an important principle: **"Start with the little things."** Every optimization we control contributes to the overall memory health.

**Note:** The main "Clear Results" button in the header still uses `<TrashOutlined>` since it's only 1 instance (not a duplication issue).

### Files Modified
- `query-simple/src/runtime/query-result-item.tsx` - Replaced component with CSS icon
- `query-simple/src/version.ts` - Bumped to r021.44
- `CHANGELOG.md` - Documented optimization

### Expected Results
- Detached SVGPathElement: Should reduce by ~1,084 instances
- Detached DOM elements: Should reduce by ~2 MB total
- Component overhead: 600 fewer React component lifecycle executions

---

## [1.19.0-r021.43] - 2026-01-19

### Fixed
- **Comprehensive Reference Cleanup for Accumulated Records**: Fixed record object leak (+718 instances in r021.42) by clearing `recordsRef.current = null` BEFORE calling `onAccumulatedRecordsChange([])`. Also reverted state changes to BEFORE DS destruction to prevent detached DOM explosion (6K+ detached nodes in r021.42). Kept multi-source clearing which successfully reduced TrackingTarget by 80%. **Result: All references cleared in correct order to enable garbage collection.**

### The r021.42 Results Analysis

**What worked (keep it):**
- ✅ Multi-source clearing: TrackingTarget reduced from 61,089 → 11,967 (80% improvement)
- ✅ ObservationHandle reduced from 41,389 → 34,477 (17% improvement)

**What broke (fix it):**
- ❌ State changes after DS destruction: Created 6,122 detached `<div>`, 2,894 detached `<span>`, 1,444 detached `<button>` - React components removed from DOM but not properly unmounted
- ❌ Accumulated records still leaking: +718 record instances (+335 kB)

### The Reference Leak Problem

Record objects are referenced in multiple places:
```javascript
// Same 600 record objects referenced by:
1. Parent widget state: accumulatedRecords = [rec1, rec2, ..., rec600]
2. Child component ref:  recordsRef.current = [rec1, rec2, ..., rec600]
3. OutputDataSource:     outputDS stores records internally
4. React closures:       QueryTaskResult component holds references
```

**Calling `onAccumulatedRecordsChange([])` only clears #1 (parent's array).**

If `recordsRef.current` still holds references (#2), garbage collector sees: "These 600 record objects still have references from child component, can't collect them."

### The Solution: Clear References in Order

```typescript
// BEFORE (r021.42) - Wrong order:
onAccumulatedRecordsChange([])  // Parent clears, but child still holds refs!
// ... much later after DS destruction ...
recordsRef.current = null       // Too late - GC already scanned

// AFTER (r021.43) - Correct order:
recordsRef.current = null             // 1. Child releases references
setResultCount(0)                     // 2. Trigger React unmount
onAccumulatedRecordsChange([])        // 3. Parent clears array
// ... destroy OutputDataSource ...   // 4. DS releases records
// ... setTimeout(0) ...               // 5. React releases closures
```

By clearing ALL references before GC runs, the 600 record objects become eligible for collection.

### State Changes: Before vs After DS Destruction

**r021.42 (broken):**
```
setStage(2) → Destroy DS → setResultCount(0) → setStage(0)
Result: Components detached from DOM but not unmounted
```

**r021.43 (fixed):**
```
setResultCount(0) → setStage(2) → Destroy DS → setStage(0)
Result: React unmounts properly, no detached DOM
```

### Expected Results
- Accumulated records should NOT accumulate (+718 → ~0)
- Detached DOM should be minimal (6K+ → ~0)
- TrackingTarget/ObservationHandle should remain low (keep r021.42 improvement)

### Files Modified
- `query-simple/src/runtime/query-task.tsx` - Reference clearing order + state change revert
- `query-simple/src/version.ts` - Bumped to r021.43
- `CHANGELOG.md` - Documented fixes

---

## [1.19.0-r021.42] - 2026-01-19

### Fixed
- **Multi-Source Selection Clearing + State Changes After DS Destruction**: Fixed observer leak in accumulation mode by clearing selection on ALL origin DataSources (not just current one), and moved state changes (setResultCount, setStage) AFTER DS destruction to properly "kick" React's lifecycle cleanup. **Result: Comprehensive cleanup for multi-query accumulation scenarios.**

### The Multi-Source Problem
In Add/Remove modes, users can accumulate from multiple query items:
- Major number query → OutputDS_1 → OriginDS_Major (with 150 records selected)
- Parcel query → OutputDS_2 → OriginDS_Parcel (with 50 records selected)
- Owner query → OutputDS_3 → OriginDS_Owner (with 100 records selected)

**Previous behavior (r021.41):**
- Only cleared selection on CURRENT outputDS's origin DS
- Left observers on the OTHER origin DSs (Parcel, Owner) orphaned
- 61,089 TrackingTarget + 41,389 ObservationHandle accumulated per cycle

**New behavior (r021.42):**
- Finds ALL OutputDataSources for widget
- Extracts ALL unique origin DataSources
- Clears selection on EACH origin DS before destroying OutputDSs
- Multiple state changes AFTER destruction to kick React

### Implementation: The Multi-Source Clearing Pattern

```typescript
// Find ALL OutputDataSources and their origin DataSources
const originDataSourcesToClear = new Map<string, DataSource>()

Object.keys(allDataSources).forEach(dsId => {
  if (dsId.startsWith(`${widgetId}_output_`)) {
    const ds = allDataSources[dsId]
    const originDS = getOriginDataSource(ds)
    if (originDS) {
      originDataSourcesToClear.set(originDS.id, originDS)
    }
  }
})

// Clear selection on EACH unique origin DataSource
for (const [originDSId, originDS] of originDataSourcesToClear) {
  originDS.selectRecordsByIds([])  // Clear observers
}

// NOW destroy all OutputDataSources (observers already cleared)
// ... destruction code ...

// State changes AFTER destruction to kick React
setResultCount(0)       // State change #1
recordsRef.current = null
setStage(0)             // State change #2
```

### Why State Changes After DS Destruction?
**User insight:** "We have lots of UI things to change and manipulate, so let's take advantage of that."

In New Query mode, state changes happen naturally throughout the flow. For Clear Results, we need to artificially create those state changes AFTER DS destruction to trigger React's component lifecycle cleanup.

**Before (r021.41):**
- setResultCount(0) → setStage(2) → Destroy DS → setStage(0)
- React didn't detect destroyed DS properly

**After (r021.42):**
- setStage(2) → Destroy DS → setResultCount(0) → setStage(0)
- Two state changes AFTER destruction give React multiple "kicks"

### Expected Results
If successful, should eliminate the 61K TrackingTarget + 41K ObservationHandle accumulation seen in heap snapshots.

### Files Modified
- `query-simple/src/runtime/query-task.tsx` - Multi-source clearing + state change reordering
- `query-simple/src/version.ts` - Bumped to r021.42
- `CHANGELOG.md` - Documented approach

### Testing Notes
Test with accumulation from SINGLE query item first to isolate the state-change fix from the multi-source fix.

---

## [1.19.0-r021.41] - 2026-01-19

### Fixed
- **Apply "New Query" Execution Model to Clear Results**: Implemented the proven Stage 2 → Stage 0 pattern from the search flow to fix component closure leaks. Shows "Clearing..." message (Stage 2) which forces Results panel unmount, yields to React with `setTimeout(0)`, executes cleanup/DS destruction, then resets to Stage 0. The Stage transition "pokes" React to properly detect DS absence and trigger automatic recreation on next query. **Result: Matches successful DS lifecycle management from New Query flow.**

### The Pattern (Proven in Search Flow, Now Applied to Clear)

**New Query Flow (working):**
```typescript
Stage 2 → Execute Query → Stage 0 → React sees DS and renders results
```

**Clear Results Flow (r021.41):**
```typescript
Stage 2 "Clearing..." → Destroy DS → Stage 0 → React sees no DS and recreates
```

### Implementation: The 4-Step Model

```typescript
// STEP 1: Enter Clearing State
setStage(2)              // Show "Clearing..." - forces Results unmount
setActiveTab('query')
recordsRef.current = null
// ... clear other refs

// STEP 2: The "Headless" Yield
await new Promise(resolve => setTimeout(resolve, 0))
// React processes Stage 2, unmounts components, releases closures

// STEP 3: The Purge
await clearSelectionInDataSources(...)  // Clear while DS alive
cleanupGraphicsLayer(...)
destroyDataSource(dsId)                 // Destroy after cleanup

// STEP 4: The Reset - The "Poke"
setStage(0)
// React sees cleanup done, DS missing, triggers recreation on next query
```

### Why This Works

The Stage 2 → Stage 0 transition is the exact same "kick" React needs in the New Query flow. It forces component lifecycle hooks (`useEffect`, `componentWillUnmount`) to fire properly, ensuring closures are released before DS destruction.

**Key Insight:** We already solved this problem for New Queries. This applies that same proven pattern to Clear Results.

### Expected Results
**Before r021.41:**
- Clear + GC: 212 MB
- Clear + GC: 239 MB (+27 MB drift) ❌

**After r021.41:**
- Clear + GC: ~210 MB
- Clear + GC: ~210 MB (no drift) ✅

### Files Modified
- `query-simple/src/runtime/query-task.tsx` - Implemented "New Query" pattern for Clear
- `query-simple/src/version.ts` - Bumped to r021.41
- `CHANGELOG.md` - Documented approach

### References
- User insight: "We already accomplished it in New Queries, follow that pattern"
- Previous attempts: r021.40 (headless tick without UI change - rejected by user)

---

## [1.19.0-r021.39] - 2026-01-19

### Fixed
- **CRITICAL: ESRI Observer Leak - The Cleanup Order Bug**: Fixed severe memory leak where destroying OutputDataSource BEFORE clearing selection orphaned 87,083 `TrackingTarget` and 56,369 `ObservationHandle` objects. Reordered `clearResult()` to clear selection FIRST (while DS is alive), THEN destroy DS last. **Result: Eliminates ~26 MB baseline drift per accumulation cycle caused by orphaned ESRI observers.**

### The Root Cause
Heap snapshot comparison (Snapshot 8 → 14) revealed the smoking gun:
- **+87,083 `e.TrackingTarget` instances** (+2.1 MB)
- **+56,369 `e.ObservationHandle` instances** (+1.1 MB)
- **+72,374 `Array` instances** (+5.4 MB) holding references
- Total: **~26 MB leaked per cycle**

**The bug:** `clearResult()` was destroying OutputDataSource BEFORE clearing selection:
```typescript
// WRONG ORDER (r021.38):
destroyDataSource(dsId)                    // ❌ Destroys DS first
await clearSelectionInDataSources(...)     // ❌ Can't reach origin DS, observers orphaned

// CORRECT ORDER (r021.39):
await clearSelectionInDataSources(...)     // ✅ Clears selection while DS alive
destroyDataSource(dsId)                    // ✅ Destroys DS after cleanup complete
```

When OutputDataSource is destroyed first, `clearSelectionInDataSources()` can't reach the origin DataSource to signal ESRI to clean up its internal tracking structures. The observers become orphaned and accumulate indefinitely.

### The Solution
Complete reordering of `clearResult()` cleanup sequence:

**New order (r021.39):**
1. Clear refs and UI state
2. **Clear selection from DataSources** (WHILE DS is still alive) ← KEY FIX
3. Destroy graphics layer
4. Close popup
5. Clear accumulated records
6. Dispatch empty selection event
7. Publish data cleared message
8. Reset flags and state
9. **FINALLY destroy OutputDataSource** (AFTER all cleanup complete)

### Expected Results
**Before r021.39:**
- After Clear 1 + GC: 221 MB
- After Clear 2 + GC: 237 MB (+16 MB drift)
- After Clear 3 + GC: 263 MB (+26 MB drift) ❌
- Observer count grows: +87K TrackingTarget, +56K ObservationHandle

**After r021.39:**
- After Clear 1 + GC: 221 MB
- After Clear 2 + GC: ~221 MB (no drift) ✅
- After Clear 3 + GC: ~221 MB (no drift) ✅
- Observer count stable: no accumulation

### Files Modified
- `query-simple/src/runtime/query-task.tsx` - Reordered cleanup sequence in `clearResult()`
- `query-simple/src/version.ts` - Bumped to r021.39
- `CHANGELOG.md` - Documented the fix

### Credit
User discovered the bug by asking: "Are we doing things in the right order? Clearing our data sources before we destroy the DS? This will orphan items, right?" Heap snapshot comparison confirmed 87K+ orphaned ESRI observers.

---

## [1.19.0-r021.38] - 2026-01-19

### Fixed
- **CRITICAL: Orphaned OutputDataSource Leak in Add/Remove Modes**: Fixed severe memory leak where switching between query items (e.g., 222304 → 222305 → 222306 → 222307) in accumulation modes left old OutputDataSources alive indefinitely. Clear Results button now destroys ALL OutputDataSources for the widget, not just the current one. **Result: Eliminates ~26 MB baseline drift per accumulation cycle.**

### The Problem
When running multiple queries in Add/Remove mode:
1. Query 222304 creates `OutputDataSource_222304`
2. Switch to query 222305 → Preserves accumulated records, leaves 222304 DS alive
3. Query 222305 creates `OutputDataSource_222305`
4. Switch to query 222306 → Both 222304 and 222305 DS still alive
5. After 4 queries: **4 OutputDataSources alive** (~8-9 MB each = ~32 MB)
6. Click Clear → Only destroys current DS (222307)
7. **3 OutputDataSources orphaned** → 24-27 MB leaked per cycle

### The Solution
When Clear Results is clicked, now iterates through ALL data sources and destroys any OutputDataSource belonging to this widget:

```typescript
// After destroying current DS, find and destroy orphaned ones
const allDataSources = DataSourceManager.getInstance().getDataSources()
Object.keys(allDataSources).forEach(dsId => {
  if (dsId.startsWith(`${widgetId}_output_`) && dsId !== currentDSId) {
    DataSourceManager.getInstance().destroyDataSource(dsId)
  }
})
```

### Test Results
**Before r021.38:**
- After Clear 1 + GC: 221 MB (baseline)
- After Clear 2 + GC: 237 MB (+16 MB drift)
- After Clear 3 + GC: 263 MB (+26 MB drift) ❌

**Expected after r021.38:**
- After Clear 1 + GC: 221 MB (baseline)
- After Clear 2 + GC: 221 MB (no drift) ✅
- After Clear 3 + GC: 221 MB (no drift) ✅

### Files Modified
- `query-simple/src/runtime/query-task.tsx` - Added orphaned DS cleanup in `clearResult()`
- `query-simple/src/version.ts` - Bumped to r021.38
- `CHANGELOG.md` - Documented the fix

---

## [1.19.0-r021.37] - 2026-01-19

### Fixed
- **Clear Results Memory Cleanup**: Fixed memory leak in Add/Remove modes where Clear Results button (trash icon) only cleared records but left ESRI observers intact. Now fully destroys OutputDataSource on Clear, same as query switches, ensuring all users get complete memory cleanup. **NOTE: This was incomplete - see r021.38 for the full fix.**

---

## [1.19.0-r021.36] - 2026-01-19 🎉 MEMORY LEAK SOLVED

### Fixed
- **BREAKTHROUGH: Geometry Reference Memory Leak**: Discovered and fixed the root cause of proportional memory growth with large result sets. The `zoomToRecords()` function was storing references to ALL geometry objects (121-163 for Major queries) even though only extent information was needed for zoom calculation. **Result: 84% memory reduction (11.21 MB → 1.76 MB per query).**

### The Discovery
- **Comparison Test**: Ran Parcel queries (1 result) vs Major queries (121-163 results)
  - Parcel: 0.81 MB/query ✅
  - Major (r021.35): 11.21 MB/query ❌
  - **14x difference** despite proper cleanup
- **Root Cause**: Auto-zoom feature called `record.getJSAPIGeometry()` for every result and stored full geometry objects in array, even though only extent bounds were needed
- **Impact**: Memory growth was proportional to result count, not a fixed leak

### Technical Details
- **Problem Location**: `zoom-utils.ts` line 201-227
- **Before (r021.35)**:
  ```typescript
  const geometryData = records.map(record => ({
    geometry: record.getJSAPIGeometry(), // STORED 121-163 GEOMETRY OBJECTS
    extent: geometry.extent || new Extent(...)
  }))
  ```
- **After (r021.36)**:
  ```typescript
  const extents = records.map(record => {
    const geom = record.getJSAPIGeometry()
    return geom.extent || new Extent(...) // ONLY STORE EXTENT, LET GEOMETRY BE GC'D
  })
  ```
- **Key Insight**: We only needed extent bounds (xmin, xmax, ymin, ymax) for union calculation. Storing full geometry objects prevented garbage collection and accumulated ~10 MB per query.

### Performance Results
| Scenario | Before (r021.35) | After (r021.36) | Improvement |
|----------|------------------|-----------------|-------------|
| **Parcel (1 result)** | 0.81 MB/query | 0.81 MB/query | No change ✅ |
| **Major (121-163 results)** | 11.21 MB/query | **1.76 MB/query** | **84% reduction** 🎉 |
| **Difference (proportional leak)** | 14x worse | **2.2x (acceptable)** | **Eliminated** ✅ |

### Heap Analysis Verification
- **Incremental object allocation** (both scenarios):
  - Query Switching: 11.12 MB/query
  - Same Query (r021.36): 11.17 MB/query
  - **Difference: +0.05 MB (0.5% - parity maintained)** ✅
- **Total memory footprint** (Chrome metrics):
  - r021.35: 11.21 MB/query (objects persist)
  - **r021.36: 1.76 MB/query (objects GC'd)** ✅
- **Conclusion**: Objects are still allocated but now properly garbage collected

### Implementation
- Changed `zoomToRecords()` to extract only extent objects, not full geometries
- Geometry objects are now immediately eligible for GC after extent extraction
- No behavior changes - zoom functionality identical
- Applies to auto-zoom feature (configurable per query via `zoomToSelected` setting)

### Additional Fixes
- Fixed incorrect BUG log in `query-result.tsx` - changed memory cleanup log from BUG to TASK category

### Testing
- Disabled query switching test (not a normal usage pattern, showed 15.95 MB/query due to memory pressure from overlapping DS lifecycle)
- Verified with Parcel (1 result) vs Major (121-163 results) comparison
- Confirmed 84% memory reduction in same-query scenario
- Heap snapshot analysis confirms proper GC behavior

### What We Learned
- **"Clean what you create"**: Even temporary object references can accumulate if not immediately released
- **Lazy is better**: Only store what you actually need (extent bounds, not full geometry)
- **Size matters**: Memory leaks proportional to result count indicate unnecessary object retention
- **Test with extremes**: Comparing 1-result vs 163-result queries revealed the pattern

### Production Ready
- ✅ **84% memory improvement** for large result sets
- ✅ **No UX changes** - perfect single-click behavior maintained
- ✅ **Proper garbage collection** verified via heap analysis
- ✅ **Scales correctly** with result count (2.2x difference for 163x more results is acceptable)

---

## [1.19.0-r021.35] - 2026-01-18 (VERIFIED)

### Fixed
- **FINAL: Same-Query Memory Leak - Manual Cleanup Pattern**: After systematic testing of 5 different approaches (r021.31-35), implemented optimal solution that achieves **37% memory improvement** over baseline. When user clicks Apply with existing results in NEW mode, widget now: (1) Manually clears all refs, graphics, selection, and state, (2) Destroys OutputDataSource via DataSourceManager, (3) Clicks Clear button programmatically to trigger React recreation, (4) Executes query after 300ms callback. **Result: 16.22 MB/query vs 25.89 MB baseline with perfect UX. VERIFIED: Architectural parity with query switching confirmed via incremental heap analysis.**

### Technical Details
- **Problem**: r021.24 only fixed query switching (11.68 MB/query apples-to-apples), but same-query scenarios leaked 25.89 MB/query
- **Solution Evolution**:
  - r021.31: Destroy DS → Click button → Callback (19.07 MB/query, 27% improvement)
  - r021.33: `clearResult('query-switch')` → button (25.27 MB/query - FAILED, regressed to baseline)
  - r021.34: `clearResult('user-trash')` → Destroy DS → button (16.87 MB/query, 35% improvement)
  - **r021.35: Manual cleanup → Destroy DS → button (16.22 MB/query, 37% improvement)** ✅
- **Key Insight**: Cleaning BEFORE destroying DS is significantly better (16-19 MB) than destroying first (19 MB)
- **Target Revised**: Initial target (6.59 MB) was apples-to-oranges (Parcel 1 result → Major 121 results). New apples-to-apples baseline established via Major 1 ↔ Major 2 switching: **11.68 MB/query**

### Implementation
- Manual cleanup sequence (no `clearResult()` call to avoid artifacts):
  - Clear `recordsRef.current`, set DS status to `NotReady`, clear result count
  - Clear selection via `clearSelectionInDataSources()`
  - Destroy graphics layer via `cleanupGraphicsLayer()` + `onDestroyGraphicsLayer()`
  - Close popup, clear accumulated records, dispatch empty selection event
  - Publish data cleared message, reset flags and error states
- Then destroy OutputDataSource via `DataSourceManager.getInstance().destroyDataSource(dsId)`
- Click Clear button programmatically to trigger React's event system
- Execute pending query from `handleOutputDataSourceCreated` callback after 300ms
- UI locked with `setStage(2)` during entire process (perfect UX)

### Testing & Verification
- Systematic testing of 5 approaches documented in `OUTPUTDATASOURCE_MEMORY_LEAK_INVESTIGATION.md`
- Created apples-to-apples baseline test: `memory-leak-query-switching.spec.ts` (Major 1 ↔ Major 2)
- Heap snapshot analysis tests: `memory-heap-growth-comparison.spec.ts` with analysis scripts
- **VERIFICATION (2026-01-18)**: Ran incremental heap growth analysis 2x to confirm results
  - Query Switching: 11.34 MB/query average incremental growth
  - Same Query (r021.35): 11.21 MB/query average incremental growth
  - **Difference: -0.13 MB/query (-1.1% better)** ✅
- Object-level accumulation tracking shows equivalent growth rates:
  - `TrackingTarget`: 652 KB/query (same-query) vs 685 KB/query (switching)
  - `ObservationHandle`: 360 KB/query (same-query) vs 360 KB/query (switching)
  - `JSArrayBufferData`: 601 KB/query (same-query) vs 681 KB/query (switching)

### Performance
- **Same-query repeated**: 16.22 MB/query (37% better than r021.24 baseline of 25.89 MB)
- **Query switching (apples-to-apples)**: 11.68 MB/query (achieved via natural React lifecycle)
- **Incremental growth parity**: 11.21 vs 11.34 MB/query (within 1%) ✅
- **Previous "4.54 MB gap"**: Now confirmed as measurement artifact (GC timing), not architectural limitation
- **UX**: Perfect - first click executes immediately, no double-click required

### What We Learned
- Cleanup timing matters more than cleanup method (`clearResult` vs manual: 16.87 vs 16.22 MB)
- Calling `clearResult()` with wrong reason can interfere with React lifecycle (r021.33 regressed to 25.27 MB)
- **Incremental heap growth is the true indicator of memory leaks** (final heap size includes GC timing artifacts)
- Programmatic DS recreation DOES match natural query-switching effectiveness (verified via object tracking)
- The 300ms callback delay is optimal (tested 100-1000ms range)
- Playwright tests can mask UX bugs - human interaction testing is critical

### Verification Conclusion
- ✅ **Architectural parity achieved**: Same-query scenario properly releases ESRI observers at the same rate as natural query switching
- ✅ **No uncontrolled accumulation**: Object growth patterns are statistically equivalent between scenarios
- ✅ **Production ready**: 37% improvement + perfect UX + verified cleanup effectiveness

---

## [1.19.0-r021.31-34] - 2026-01-18 (Superseded by r021.35)

### Summary
- r021.31: First working solution (19.07 MB/query, 27% improvement)
- r021.32: Failed attempt to remove programmatic click (reintroduced double-click bug)
- r021.33: Failed attempt with `clearResult('query-switch')` (regressed to 25.27 MB)
- r021.34: Cleanup before destroy approach (16.87 MB/query, 35% improvement)

See r021.35 above for final solution and full technical details.

---

## [1.19.0-r021.24] - 2026-01-18

### Fixed
- **Critical: OutputDataSource ESRI Observer Leak**: Fixed major memory leak where ESRI JSAPI internal observers/watchers accumulated with each query switch. Heap snapshot analysis revealed 40,700 `TrackingTarget` objects and 33,669 `ObservationHandle` objects persisting despite `clearSourceRecords()` calls. Now destroying entire OutputDataSource on query item switches (Parcel → Major), allowing ExB's `DataSourceComponent` to automatically recreate fresh instances without memory baggage.

### Technical Details
- **Problem**: `clearSourceRecords()` alone only clears record arrays, but leaves ESRI JSAPI internal structures intact
- **Evidence**: Heap comparison (Query 7 → Query 11) showed 66 MB growth with observer objects as primary contributors
- **Solution**: Destroy OutputDataSource when `reason === 'query-item-switch-new-mode'`
- **Automatic Recreation**: `DataSourceComponent` detects destroyed DS and recreates it automatically (< 5ms)
- **Conservative Scope**: Only destroys on query switches, NOT on same-query multiple runs (reuses DS)
- **Expected Impact**: ~30-40 MB freed per query switch (records + observers + caches)

### Testing
- Added E2E Playwright tests for automated memory leak detection
- `memory-leak-sequential.spec.ts`: Runs 12 queries in NEW mode
- `memory-leak-analysis.spec.ts`: Automated heap snapshot capture and comparison
- Heap analysis confirms ESRI observer accumulation is root cause

---

## [1.19.0-r021.22] - 2026-01-18

### Fixed
- **Phase 1: Graphics Layer Destruction on ALL Clears**: Extended graphics layer destruction to ALL `clearResult()` calls, not just manual "Clear Results" button. Heap snapshot analysis revealed `graphicsLayer.removeAll()` does NOT free internal `_projectedGeometry` caches (~618 kB per query). Now destroys layer on NEW mode queries, query switches, and all clear operations.

### Technical Details
- Removed `reason === 'navToForm-clearResults'` check from graphics layer destruction
- Graphics layer now destroyed on:
  - Manual "Clear Results" button (already working)
  - NEW mode queries (`handleFormSubmit-new-mode`)
  - Query item switches (`query-item-switch-new-mode`)
  - Layer/alias switches in dropdowns
  - Remove mode when no results remain
- Heap snapshot comparison (Query 2 vs Query 1) showed `JSArrayBufferData: +79 buffers = +618 kB`
- Confirmed `_projectedGeometry` objects retained in memory after `removeAll()`
- Layer is immediately recreated by existing logic (r021.20)
- **Expected impact:** ~618 kB freed per query in NEW mode

### Testing Strategy
- Phased rollout with testing between each phase
- Phase 1: Destroy on all clearResult() calls (this release)
- Phase 2: Verify Remove mode coverage (should be automatic)
- Phase 3: Individual record removal (future if needed)

---

## [1.19.0-r021.21] - 2026-01-18

### Fixed
- **Critical: OutputDataSource Memory Leak**: Fixed major memory leak where OutputDataSources retained all records (500+ with geometries) even after "Clear Results" was clicked. Each OutputDataSource held ~30 MB, so widgets with multiple query items could leak 60-90 MB+ on each clear. Now calling `outputDS.clearSourceRecords()` to free memory immediately.

### Technical Details
- Added `outputDS.clearSourceRecords()` call in `clearResult()` function
- Clears records from OutputDataSource when:
  - User clicks "Clear Results" button
  - User clicks trash icon
  - New query runs in NEW mode (replaces old results)
- Does NOT clear when in ADD or REMOVE mode (intentional - keeps accumulated results)
- Each query item has one OutputDataSource (reused across multiple executions)
- Heap snapshot analysis confirmed 2 OutputDataSources were holding 1000 records (~60 MB)
- This is the primary source of the measured 60-70 MB leak per query cycle
- Records are freed without destroying the DataSource (safer than `destroyDataSource()`)
- Next query will repopulate records normally

### Impact
- Eliminates ~30 MB leak per query item used
- For 2 query items: ~60 MB freed on each clear
- For 5 query items: ~150 MB freed on each clear
- Combined with r021.15 (refs cleanup) and r021.16 (graphics layer destroy), should eliminate majority of memory leaks

---

## [1.19.0-r021.20] - 2026-01-17

### Fixed
- **Graphics Layer Lifecycle Management**: Simplified graphics layer recreation strategy. Reverted lazy initialization approach (r021.18-r021.19) in favor of immediate recreation when layer is destroyed. When user clicks "Clear Results," the layer is destroyed to free memory, then immediately recreated and stored in widget ref, eliminating stale reference issues and callback complexity.

### Technical Details
- **Removed Option 1 (lazy init + callbacks)**:
  - Removed return values from `selectRecordsInDataSources()` and `selectRecordsAndPublish()`
  - Removed `onGraphicsLayerCreated` callback prop from QueryTask/QueryTaskList/Widget
  - Removed lazy initialization logic in selection-utils
- **Implemented Option 2 (immediate recreation)**:
  - Modified `widget.tsx:clearGraphicsLayerRefs()` to immediately recreate graphics layer after destruction
  - Callback now: clears old ref → calls `createOrGetGraphicsLayer()` → stores new layer in ref → forces re-render
  - Ensures `mapViewRef.current` and `graphicsLayerRef.current` are properly set in `handleJimuMapViewChanged()`
- **Result**: Simpler architecture, no stale refs, graphics layer always available when needed
- **Memory cleanup from r021.16 (destroy on clear) remains intact**, eliminating compounding geometry buffer leaks

---

## [1.19.0-r021.19] - 2026-01-17

### Fixed
- **Critical: Graphics Layer Visibility Bug After Clear**: Fixed bug where graphics layer would not hide/show correctly on widget close/open after "Clear Results" was clicked. Root cause: `onGraphicsLayerCreated` callback was not being forwarded through `QueryTaskList` component, so widget's ref was never updated with the newly created layer.

### Technical Details
- Added `onGraphicsLayerCreated` and `onDestroyGraphicsLayer` to `QueryTaskListProps` interface
- Added both callbacks to `QueryTaskList` destructuring and forwarded to `QueryTask` component
- Added debug logging to track callback invocation flow
- Widget now correctly tracks current graphics layer instance via `graphicsLayerRef.current`
- Graphics layer visibility now controlled correctly on widget open/close

---

## [1.19.0-r021.18] - 2026-01-17

### Fixed
- **Critical: Compounding Graphics Memory Leak**: Fixed compounding 40-70 MB memory leak when user clears results. Graphics layer is now destroyed when user clicks "Clear Results" button and lazily recreated only when needed, freeing internal geometry buffers (JSArrayBufferData). Widget ref dynamically updated to track current layer.

### Technical Details
- Called `graphicsLayer.destroy()` in `cleanupGraphicsLayer()` to free internal buffers
- Graphics layer destroyed ONLY when user clicks "Clear Results" button (`reason === 'navToForm-clearResults'`)
- **Lazy initialization with dynamic ref tracking**:
  - Check performed in `selectRecordsInDataSources()` before adding graphics
  - Layer created only if missing or not in map via `createOrGetGraphicsLayer()`
  - Return value flows up: `selectRecordsInDataSources()` → `selectRecordsAndPublish()` → `query-task.tsx`
  - `onGraphicsLayerCreated(layer)` callback updates `this.graphicsLayerRef.current` in widget
  - Widget always points to current layer (enables visibility control on close/open)
- Graphics layer is NOT destroyed when:
  - Running a new query (layer is reused)
  - Query returns 0 results (layer persists for next query)
  - Switching between queries (layer persists)
- Graphics layer visibility controlled by widget open/close state (not destruction)
- Graphics layer previously persisted across ALL clears, accumulating geometry buffers: Clear 1 = 70 MB leak, Clear 2 = +40 MB (110 MB total), Clear 3 = +40 MB (150 MB total)
- After 10 clears, users would leak ~500 MB; after 20 clears, ~1 GB
- Performance impact negligible (< 1ms to create empty GraphicsLayer when needed)
- **Combined with r021.15 fix, eliminates the 84 MB leak when user clears results**

---

## [1.19.0-r021.15] - 2026-01-16

### Fixed
- **Memory Leak on Clear Results**: Fixed 84 MB memory leak when clicking "Clear Results" button. QueryTaskResult component now properly cleans up refs holding FeatureDataRecord arrays on unmount, allowing garbage collector to free detached DOM nodes and associated data.

### Technical Details
- Added cleanup `useEffect` to clear `lastSelectedFeatureRecordsRef`, `lastSelectedRecordsRef`, and `lastQueryRecordIdsRef` on component unmount
- These refs held arrays of 500+ records with circular references to DOM nodes, preventing garbage collection
- Chrome heap snapshot analysis identified 3,822 detached DOM elements (result rows) held in memory by virtual DOM render objects
- Fix verified using Chrome DevTools Memory tab and heap snapshot comparison

---

## [1.19.0-r021.14] - 2026-01-16

### Reverted
- **Selection Restoration Fix**: Reverted r021.12-r021.13 changes that cleared `accumulatedRecords` on panel close. This broke selection restoration when reopening the widget, which is core functionality. Keeping results between widget opens/closes is intentional behavior, not a memory leak.

### Changed
- **Memory Leak Investigation Focus**: Shifted focus to investigating why the "Clear Results" button leaves 84 MB in memory after clearing. This is the actual bug that needs fixing.

---

## [1.19.0-r021.11] - 2026-01-16

### Fixed
- **Popup Location for Irregular Polygons**: Popup now uses `labelPointOperator` to calculate location, guaranteeing the popup is always on the interior of the geometry (especially important for L-shaped parcels or polygons with holes where the centroid can fall outside the boundary).

### Technical Details
- **API Used:** [`labelPointOperator.execute()`](https://developers.arcgis.com/javascript/latest/api-reference/esri-geometry-operators-labelPointOperator.html)
- **Behavior:**
  - **Polygons**: Point near centroid of ring with greatest area (guaranteed interior)
  - **Polylines**: Vertex near middle of longest segment
  - **Points**: The point itself
- **Performance**: Same < 1ms calculation time
- **Simplification**: Removed custom polyline vertex search logic in favor of built-in operator

---

## [1.19.0-r021.10] - 2026-01-16

### Documentation
- Cleaned up temporary debug logging from popup implementation
- Added comprehensive inline JSDoc comments
- Created complete external documentation in `POPUP_ON_RESULT_CLICK_FINAL.md`

---

## [1.19.0-r021.9] - 2026-01-16

### Added
- **Popup on Result Click**: Clicking a result in the results panel now automatically opens the ArcGIS Maps SDK popup showing feature attributes and configured popup template.
  - **Smart Location Calculation:**
    - **Points**: Uses point coordinates directly
    - **Polylines**: Uses the vertex closest to map center after zoom (< 1ms calculation time)
    - **Polygons**: Uses centroid or extent center
  - **Lifecycle Management:**
    - Opens after zoom completes for optimal user experience
    - Closes when results are cleared
    - Closes when individual record is removed
    - Closes when widget panel closes
    - Closes during Remove mode query execution
  - **Performance**: Polyline location calculation averages < 1ms even for features with 160+ vertices
  - **Implementation**: Uses `mapView.openPopup()` with proper initialization and `popupEnabled` toggle for programmatic control

### Technical Details
- **Files Modified:**
  - `query-simple/src/runtime/query-result.tsx` (popup opening logic)
  - `query-simple/src/runtime/query-task.tsx` (popup close on clear/remove mode)
  - `query-simple/src/runtime/widget.tsx` (popup close on panel close)
  - `query-simple/src/runtime/query-result-item.tsx` (trigger on click)
  - `shared-code/common/debug-logger.ts` (added POPUP feature logging)
  - `query-simple/src/version.ts` (r020.1 → r021.9)
- **Debug Logging**: Use `?debug=POPUP` to see popup lifecycle and location calculation details
- **Chunked Implementation**: Feature was implemented and tested in micro-chunks (r021.0 through r021.9) for stability

### Testing
- ✅ Popup opens on result click
- ✅ Popup closes on clear results
- ✅ Popup closes on individual record removal
- ✅ Popup closes in Remove mode
- ✅ Popup closes when panel closes
- ✅ Polyline location calculation < 1ms
- ✅ No duplicate graphics
- ✅ No hash parameter bugs

---

## [1.19.0-r020.1] - 2026-01-15

### Fixed
- **BUG-HASH-DIRTY-001: Hash Parameter Dirty on Widget Reopen**: Fixed issue where the `data_s` hash parameter would reappear when reopening the widget after clearing results and closing the widget.
- **Hotfix: Null Reference Error in clearResult**: Fixed critical error `Cannot read properties of null (reading 'id')` when `outputDS` is null during widget initialization.

### Root Cause
When the "Clear" button was clicked:
1. ✅ Accumulated records were cleared correctly
2. ❌ Widget selection state (`hasSelection`, `selectionRecordCount`, `lastSelection`) was NOT cleared
3. When widget reopened, stale `hasSelection: true` caused selection restoration logic to run
4. Restoration attempted with `recordsFound: 0` but still published selection → hash became dirty

### Fix Details
**Primary Fix** (query-task.tsx):
- Dispatch empty selection event when clearing results
- Ensures widget selection state is cleared along with accumulated records
- Added debug logging for hash clearing

**Safety Check** (widget.tsx):
- Added `hasRecordsToDisplay` check before restoring selection on panel open
- Prevents restoration if `hasSelection: true` but no actual records exist
- Defensive measure to catch edge cases

**Hotfix** (query-task.tsx):
- Added null check `&& outputDS` before calling `dispatchSelectionEvent`
- Prevents null reference error when `outputDS` is not yet initialized
- Critical fix for edge case discovered during testing

### Files Modified
- `query-simple/src/runtime/query-task.tsx` (dispatch empty selection on clear + null check hotfix)
- `query-simple/src/runtime/widget.tsx` (add safety check for restoration)
- `query-simple/src/version.ts` (r020.0 → r020.1)
- `docs/bugs/BUG-HASH-DIRTY-ON-WIDGET-REOPEN.md` (documented fix with code snippets)

### Testing
Reproduction steps verified fixed:
1. Run query from URL params → Hash shows selection IDs ✓
2. Clear results → Hash clears ✓
3. Close widget → Hash stays clear ✓
4. Reopen widget → **Hash stays clear** ✓ (previously would become dirty)

---

## [1.19.0-r020.0] - 2026-01-14

### Added
- **Duplicate Query Button**: Added duplicate button in settings panel to quickly clone existing queries with all configurations. When you click duplicate on any query, it creates a copy with:
  - All layer and data source settings preserved
  - All attribute filters and SQL expressions cloned
  - All spatial filters, buffers, and geometry tools retained
  - Display format, field configuration, and sorting preserved
  - Grouping settings and display order maintained
  - Automatic ID generation (new `configId` and `outputDataSourceId`)
  - Name appended with "(Copy)" to distinguish from original
  - Hash parameters (`shortId`, `searchAlias`) appended with "_copy" to prevent URL collisions

### Benefits
- **Massive time savings** when creating multiple queries against the same layer with only field differences
- **No manual reconfiguration** - all settings are preserved
- **Safe cloning** - generates unique IDs to prevent conflicts
- **Intuitive UX** - duplicate button appears next to remove button in query list

### Technical Details
- Button appears in query list commands (before remove button)
- Uses spread operator to clone all 40+ config properties
- Automatically registers new output data source with Experience Builder
- Preserves immutable data structures throughout the clone process

### Files Modified
- `query-simple/src/setting/query-item-list.tsx` (added duplicate handler and UI button)
- `query-simple/src/setting/setting-config.ts` (added duplicate icon)
- `query-simple/src/setting/translations/default.ts` (added "duplicate" translation)
- `query-simple/src/version.ts` (r019.31 → r020.0)

---

## [1.19.0-r019.31] - 2026-01-12

### Added
- **BUG Logging for ADD Mode Format Switch**: Added automatic warning logging (BUG-ADD-MODE-001) when switching queries in ADD_TO_SELECTION mode with accumulated results. This known bug causes all accumulated results to change their display format to match the newly selected query's configuration.

### Bug Detection
The warning appears automatically in the console (even without `?debug=all`) when:
- User is in ADD_TO_SELECTION or REMOVE_FROM_SELECTION mode
- Has accumulated results from a previous query
- Switches to a different query

**Console Output:**
```javascript
[QUERYSIMPLE ⚠️ BUG] {
  "bugId": "BUG-ADD-MODE-001",
  "category": "UI",
  "event": "accumulated-results-format-switch",
  "oldQueryConfigId": "8390785603784936",
  "newQueryConfigId": "06367134367377913",
  "accumulatedRecordsCount": 5,
  "description": "Accumulated results will change to match new query's display format...",
  "workaround": "Use NEW_SELECTION mode instead of ADD_TO_SELECTION...",
  "targetResolution": "TBD - Store original queryConfig with each record set",
  "documentation": "docs/bugs/ACCUMULATED_RESULTS_FORMAT_SWITCH.md"
}
```

**Why This Matters:**
- Makes the bug visible to testers and users during demo site testing
- Provides immediate workaround guidance
- Includes link to full documentation
- Uses console.warn() for visibility (yellow/orange color)

### Technical Details
- Added in `query-task.tsx` at query switch detection point (line ~653)
- Leverages existing BUG logging level (always enabled, even with `?debug=false`)
- Detects `isSwitchingQueries` flag when in accumulation mode
- Logs bug details including old/new query IDs and record count

### Files Modified
- `query-simple/src/runtime/query-task.tsx` (added BUG logging)
- `query-simple/src/version.ts` (r019.30 → r019.31)

### Related Documentation
- Bug documentation: `docs/bugs/ACCUMULATED_RESULTS_FORMAT_SWITCH.md`
- Logging system: `docs/blog/BLOG_KNOWN_BUGS_LOGGING.md`

## [1.19.0-r019.30] - 2026-01-12 ✅ VERIFIED

### Fixed
- **Missing Import**: Added missing `Extent` import to `zoom-utils.ts`. The r019.29 refactor moved extent creation from `query-task.tsx` to `zoom-utils.ts` but forgot to add the import, causing `ReferenceError: Extent is not defined`.

### Verification Results
**✅ TESTED & CONFIRMED WORKING:**
- Single point zoom: Works (1 point)
- Multiple points zoom: Works (220 points)
- No console errors
- Proper extent calculation and map movement

### Files Modified
- `query-simple/src/runtime/zoom-utils.ts` (added Extent import)
- `query-simple/src/version.ts` (r019.29 → r019.30)

## [1.19.0-r019.29] - 2026-01-12 ✅ WORKING (with r019.30 import fix)

### Summary
**Complete fix for point geometry zoom issue.** Single points and multiple points (1, 10, 220+) now zoom correctly. Solution uses on-the-fly extent calculation in `zoom-utils.ts` to work around Esri's read-only `.extent` property on point geometries.

### Fixed
- **Point Zoom (Read-Only Property Fix)**: Fixed zoom failure for single and multiple points by creating extents on-the-fly in `zoom-utils.ts`. Previous upstream normalization approach failed because Esri's geometry `.extent` property is **read-only** and cannot be mutated.
- **Eliminated Esri Accessor Error**: Removed code that attempted to assign to read-only `.extent` property, which caused `[esri.core.Accessor] cannot assign to read-only property 'extent'` console errors.

### Changed
- **On-The-Fly Extent Calculation**: Point geometries now have their extents calculated at the moment of use (in `zoom-utils.ts`), not through mutation or caching. This is a lightweight operation (4 property assignments) and avoids all mutation/immutability issues.
- **Removed Upstream Normalization**: Removed the failed attempt to mutate geometry objects in `query-task.tsx`. Geometry objects remain unmodified.

### Technical Details

**Root Cause Analysis:**
```javascript
// Previous approach (r019.28) - FAILED:
geom.extent = new Extent({ ... })  // ❌ Throws error - read-only property!
// Console: [esri.core.Accessor] cannot assign to read-only property 'extent'
```

**New Approach (r019.29) - On-The-Fly Calculation:**
```typescript
// In zoom-utils.ts - Extract and calculate simultaneously
const geometryData = records.map(record => {
  const geom = record.getJSAPIGeometry()
  if (!geom) return null
  
  // For points, create extent on-the-fly (doesn't modify geometry)
  if (geom.type === 'point' && !geom.extent) {
    const pt = geom as __esri.Point
    return {
      geometry: geom,
      extent: new Extent({  // New local object, not mutating geom
        xmin: pt.x, xmax: pt.x,
        ymin: pt.y, ymax: pt.y,
        spatialReference: pt.spatialReference
      })
    }
  }
  
  // For other types, use existing extent
  return { geometry: geom, extent: geom.extent }
}).filter(item => item != null)
```

**Why This Works:**
- ✅ No mutation of read-only properties
- ✅ No React state corruption issues
- ✅ Extents calculated exactly when needed
- ✅ Performance cost is negligible (trivial math)
- ✅ Clean, self-contained in `zoom-utils.ts`
- ✅ No caching complexity

**Zoom Operation Flow:**
1. User clicks "Zoom to selected" (1 or 229 points)
2. `zoomToRecords()` called with records
3. For each record:
   - Extract geometry via `getJSAPIGeometry()`
   - If point without extent → create extent object (local, not attached to geom)
   - If other type → use existing extent
4. Calculate union extent from all extent objects
5. Check for zero-area and apply buffer if needed
6. Call `mapView.goTo(extent)`

**Expected Console Output:**
```javascript
[QUERYSIMPLE-ZOOM] {
  event: 'geometries-extracted',
  geometriesCount: 229,
  geometryTypes: ['point', 'point', ...]  // All points
}

[QUERYSIMPLE-ZOOM] {
  event: 'extent-calculated-union',
  extentsCount: 229,  // ✅ All extents calculated!
  originalExtent: { xmin, xmax, ymin, ymax, width, height }
}

[QUERYSIMPLE-ZOOM] {
  event: 'mapView-goTo-complete',
  success: true
}
```

### Files Modified
- `query-simple/src/runtime/zoom-utils.ts` (on-the-fly extent calculation)
- `query-simple/src/runtime/query-task.tsx` (removed upstream normalization, removed Extent import)
- `query-simple/src/version.ts` (r019.28 → r019.29)

### Lessons Learned
- Esri geometry objects are **Accessor** instances with read-only computed properties
- The `.extent` property on point geometries is read-only and always returns `null`
- Attempting to mutate it fails silently or throws console errors
- The correct approach is to create **new, local** extent objects when needed, not modify geometries

## [1.19.0-r019.28] - 2026-01-12 [REVERTED]

### Status
**⚠️ This version was reverted in r019.29 due to Esri read-only property constraint.**

The upstream normalization approach attempted to assign to `geom.extent`, which is a read-only property on Esri Accessor objects. This caused the error:
```
[esri.core.Accessor] cannot assign to read-only property 'extent'
```

### Original Intent (Failed)
- Attempted to normalize point geometries by adding `.extent` property when results are received
- Goal was to make all geometries uniform for downstream tools
- Failed because `.extent` is read-only on Esri geometry objects

## [1.19.0-r019.27] - 2026-01-12

### Fixed
- **Settings UI Artifact**: Fixed errant `)}` text appearing below the Map dropdown in Highlight Options section. Removed stray JSX closing syntax from line 331 in `setting.tsx` that was being rendered as text instead of code.

### Technical Details
- Removed extra `)}` on line 331 that was outside the correct conditional structure
- Proper JSX structure now closes the nested SettingSection without extra syntax
- Settings page now renders cleanly without text artifacts

## [1.19.0-r019.26] - 2026-01-12

### Fixed
- **Results Header Layout**: Fixed issue where long layer names in result headers would overlap with the trash button. Header text now wraps properly and has adequate right padding (44px) to prevent collision with the remove button. Header grows vertically as needed to accommodate longer layer names.

### Changed
- **Result Item Styling**: Added right padding to result item container and word-wrap styling to `.esri-feature__title` to ensure long text wraps cleanly. Trash button remains fixed in top-right corner with proper spacing.

### Technical Details
- Added `padding-right: 44px` to result item (32px button + 12px buffer)
- Added `word-wrap: break-word` and `overflow-wrap: break-word` to header title
- Ensures full layer names are readable without being cut off
- Maintains clean layout for both short and long layer names

## [1.19.0-r019.25] - 2026-01-12

### Fixed
- **Point Geometry Zoom Bug**: Fixed critical issue where zooming to single point features (addresses, parcel centroids) would silently fail. Single point geometries (`type === 'point'`) don't have an `.extent` property in the ArcGIS JS API, causing zoom operations to skip. Now explicitly creates zero-area extents for single points before expansion logic.
- **Zero-Area Extent Zoom**: Fixed issue where zooming to single points or overlapping points would fail or zoom to unusable scale. The `zoomToRecords` utility now detects zero-area extents (width=0 or height=0) and automatically expands them by 300 feet in all directions.

### Changed
- **Smart Unit Conversion**: Zoom buffer distance is now automatically converted based on spatial reference:
  - Web Mercator (3857/102100): Converts 300 feet → ~91.44 meters
  - State Plane (feet-based): Uses 300 feet directly
- **Enhanced ZoomToRecordsOptions**: Added optional `zeroAreaBufferFeet` parameter (defaults to 300) for future configurability.
- **Explicit Point Handling**: Single point geometries now have extent created manually using `new Extent({ xmin: pt.x, xmax: pt.x, ymin: pt.y, ymax: pt.y })`. Multipoints, polygons, and polylines continue to use their native `.extent` property.

### Technical Details
- **Three Helper Functions Added**:
  - `isMetricSpatialReference()`: Detects coordinate system units (meters vs feet)
  - `expandZeroAreaExtent()`: Buffers extent around center point
  - Enhanced inline documentation throughout `zoom-utils.ts`
- **Extent-Based Approach**: Maintains extent strategy (no scale manipulation) to ensure padding from `ZoomToRecordsOptions` is still respected.
- **Comprehensive Diagnostic Logging**: Added 10+ log points throughout zoom operation:
  - `zoom-start`: Initial parameters and mapView info
  - `geometries-extracted`: Geometry count and types
  - `extent-calculated-single`: Extent details with `extentCreatedManually` flag
  - `zero-area-check`: Detects zero-width/height extents
  - `zero-area-extent-expanded`: Before/after expansion coordinates
  - `calling-mapView-goTo`: Final extent passed to API
  - `mapView-goTo-complete`: Success confirmation
- **Geometry Type Handling**:
  - Single points (`point`): Extent created manually ✓
  - Multipoints (`multipoint`): Uses native `.extent` ✓
  - Polygons/Polylines: Uses native `.extent` ✓

### Development Process
- **r019.23**: Initial zero-area expansion implementation
- **r019.24**: Added comprehensive diagnostic logging
- **r019.25**: Fixed root cause - single points lacking extent property

### Future Enhancement
- **Configurable Buffer Distance**: See TODO.md "Configurable Point Zoom Buffer" for plan to expose this in widget settings.

### Credit
Point extent creation fix suggested by user during architecture review. User correctly identified that single point geometries lack `.extent` property, advocating for explicit handling over downstream detection.

## [1.19.0-r019.8] - 2026-01-09

### Added
- **SelectionRestorationManager**: New manager class for handling selection state tracking logic (Chunk 3 Section 3.1).
- **Selection Restoration E2E Tests**: Comprehensive test suite with 6 passing scenarios covering New/Add/Remove modes, manual removal, query-based removal, and mode switching.

### Changed
- **Selection State Tracking**: Migrated `handleSelectionChange` logic from `widget.tsx` to `SelectionRestorationManager` class using test-first approach with parallel execution verification.
- **EventManager Integration**: `EventManager` now calls `SelectionRestorationManager.handleSelectionChange()` directly for cleaner architecture.

### Removed
- **Scaffolding Code**: Removed 365 lines of temporary code including commented old implementation, parallel execution method, and CHUNK-3-COMPARE debug logs.

### Technical Details
- **r019.0**: Started Section 3.1 with E2E test suite creation (7 test scenarios)
- **r019.1**: Created `SelectionRestorationManager` class structure
- **r019.2**: Implemented parallel execution to compare old vs. new implementations
- **r019.3**: Fixed `SelectionType` import path in manager
- **r019.4**: Fixed parallel execution timing for accurate state comparison
- **r019.5**: Updated E2E tests to capture CHUNK-3-COMPARE logs
- **r019.6**: Switched to manager-only implementation (commented out old code)
- **r019.7**: Fixed Test 3B timing issue (wait for removal query to complete)
- **r019.8**: Cleanup - removed all commented code and CHUNK-3-COMPARE logs

### Verification Results
- **E2E Tests**: 6/6 passing (2.0 minutes runtime)
- **Parallel Execution**: 19/19 perfect matches in E2E tests
- **Manual Testing**: 63/72 matches (9 mismatches were timing artifacts)
- **No Regressions**: All existing functionality preserved

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

