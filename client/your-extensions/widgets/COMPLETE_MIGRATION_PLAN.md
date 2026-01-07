# Complete Hook & Shell Migration Plan: r018.0+

**Created:** 2025-12-23  
**Starting Version:** r018.0  
**Status:** Planning Phase - Complete Migration Strategy

---

## Overview

This document outlines a **complete, safe migration** of all widget logic from `widget.tsx` into a "Hook & Shell" architecture using manager classes. The strategy uses **parallel implementation**, **incremental testing**, and **extensive logging** for verification. **Extra caution** is applied to Chunk 3 (Selection & Restoration) where previous attempts failed.

**Key Principle:** Migrate ALL code to managers/hooks, leaving `widget.tsx` as a thin orchestrator.

**Critical Requirement:** Extensive logging at every step for comparison and verification. Some logging may be temporary but is **necessary** to ensure correctness - we don't assume, we verify.

---

## Version Strategy

**Starting Version:** r018.0 (major release for architectural migration)

**Versioning Pattern:**
- **Major Release:** r018.0 (architectural milestone)
- **Minor Versions:** r018.1, r018.2, etc. (each step increments)
- **Chunk Completion:** r018.10, r018.20, etc. (milestone versions)

---

## Logging Strategy: "Verify, Don't Assume"

### Core Logging Principles

1. **Comparison Logging:** When running parallel implementations, log both old and new results for comparison
2. **Decision Point Logging:** Log every decision point, especially in Chunk 3 (selection/restoration)
3. **State Transition Logging:** Log all state changes with before/after values
4. **Error Path Logging:** Log all error conditions and fallback logic execution
5. **Performance Logging:** Log timing information for performance verification

### Logging Categories

- **`CHUNK-1-COMPARE`:** URL parameter comparison logs
- **`CHUNK-2-COMPARE`:** Visibility comparison logs
- **`CHUNK-3-COMPARE`:** Selection/restoration comparison logs ⚠️ **EXTENSIVE**
- **`CHUNK-3-DECISION`:** Selection decision point logs
- **`CHUNK-3-FALLBACK`:** Fallback logic execution logs
- **`CHUNK-4-COMPARE`:** Graphics layer comparison logs
- **`CHUNK-5-COMPARE`:** Accumulated records comparison logs
- **`CHUNK-6-COMPARE`:** Map view comparison logs
- **`CHUNK-7-COMPARE`:** Event handling comparison logs

### Temporary vs Permanent Logging

**Temporary Logging (Remove after verification):**
- Comparison logs between old/new implementations
- Detailed step-by-step execution logs
- Debug logs for edge cases being verified

**Permanent Logging (Keep for production):**
- Error condition logs
- Fallback logic execution logs
- Critical decision point logs (especially Chunk 3)
- Performance metrics

**Note:** When in doubt, keep the logging. It's better to have too much logging than to assume correctness.

---

## Complete Chunk Inventory

### Chunk 1: URL Parameter Consumption
**Status:** ✅ **COMPLETE** (r018.10)  
**Complexity:** Low  
**Risk:** Low  
**Methods:** `UrlConsumptionManager.checkUrlParameters()`, `UrlConsumptionManager.removeHashParameter()`  
**Implementation:** Manager class in `query-simple/src/runtime/hooks/use-url-consumption.ts`  
**Completed Steps:**
- ✅ Step 1.1: Manager class added (r018.1)
- ✅ Step 1.2: Parallel execution with comparison logging (r018.2-r018.7)
- ✅ Step 1.3: Switched to manager, removed old code (r018.8)
- ✅ Step 1.4: Cleanup - removed unused `checkQueryStringForShortIds()` method (r018.10)
**Additional Fixes:**
- ✅ Fixed race condition: Verify both DOM input and React state before query execution (r018.9)
**Logging:** Parameter detection logs (`HASH` feature), mode reset logs

### Chunk 2: Widget Visibility Engine  
**Status:** ✅ **COMPLETE** (r018.13)  
**Complexity:** Low  
**Risk:** Low  
**Methods:** `WidgetVisibilityManager.setup()`, `WidgetVisibilityManager.cleanup()`, `WidgetVisibilityManager.getIsPanelVisible()`  
**Implementation:** Manager class in `query-simple/src/runtime/hooks/use-widget-visibility.ts`  
**Completed Steps:**
- ✅ Step 2.1: Manager class added (r018.11)
- ✅ Step 2.2: Parallel execution with comparison logging (r018.12)
- ✅ Step 2.3: Switched to manager, removed old code (r018.13)
- ⏳ Step 2.4: Cleanup - remove temporary comparison logs (optional)
**Logging:** Visibility state change logs (`WIDGET-STATE` feature), HelperSimple notification logs

### Chunk 3: Selection & Restoration ⚠️ **HIGH RISK** (Deferred to Last)
**Status:** ❌ Previous attempt failed - needs careful re-implementation  
**Complexity:** High  
**Risk:** **CRITICAL** - This is where things broke before  
**Note:** Deferred to last to build momentum with lower-risk chunks first  
**Methods:** 
- `handleSelectionChange()` - Selection state management
- `addSelectionToMap()` - Restore selection on panel open
- `clearSelectionFromMap()` - Clear selection on panel close
- `handleRestoreOnIdentifyClose()` - Restore after identify popup

**Previous Failure Points:**
- Records not selecting in data source when graphics layer enabled
- Filtering logic failed when `r.getDataSource()` returned null
- Empty arrays passed to `selectRecordsByIds()` cleared selection instead of selecting

**Logging Required:** ⚠️ **EXTENSIVE**
- Every decision point in selection logic
- Record filtering results (before/after)
- Data source resolution attempts
- Fallback logic execution
- Selection state transitions
- Restoration attempts and results
- Comparison logs between old/new implementations

### Chunk 4: Graphics Layer Management
**Status:** ✅ **COMPLETE** (r018.25)  
**Complexity:** Medium  
**Risk:** Medium  
**Methods:** `handleJimuMapViewChanged()`, graphics layer initialization/cleanup  
**Implementation:** Manager class in `query-simple/src/runtime/hooks/use-graphics-layer.ts`  
**Completed Steps:**
- ✅ Step 4.1: Manager class added (r018.19)
- ✅ Step 4.2: Parallel execution with comparison logging (r018.20-r018.24)
- ✅ Step 4.3: Switched to manager, removed old code (r018.25)
- ✅ Step 4.4: Cleanup - removed non-graphics layer implementation (r018.25)
**Breaking Change:** Removed `useGraphicsLayerForHighlight` config option - graphics layer is now required when map widget is configured
**Logging:** Graphics layer initialization logs (`GRAPHICS-LAYER` feature), comparison logs removed after verification

### Chunk 5: Accumulated Records Management
**Status:** ✅ **COMPLETE** (r018.58)  
**Complexity:** Medium  
**Risk:** Medium  
**Methods:** `handleAccumulatedRecordsChange()`, accumulated records state management  
**Implementation:** Manager class in `query-simple/src/runtime/hooks/use-accumulated-records.ts`  
**Completed Steps:**
- ✅ Step 5.1: Manager class added (r018.26)
- ✅ Step 5.2: Parallel execution with comparison logging (r018.27-r018.56)
- ✅ Step 5.3: Switch to manager, remove old code (r018.57-r018.58)
- ⏳ Step 5.4: Cleanup - remove temporary comparison logs (optional - already removed in r018.58)
**Debug Switches:** `CHUNK-5-COMPARE,RESULTS-MODE,FORM`
**Recent Fixes:**
- ✅ Fixed hash parameter re-execution when switching queries (r018.43-r018.53)
  - Multi-part fix: ref→state conversion, callback timing, atomic state clearing, undefined variable fix
- ✅ Fixed input value cleared after query execution (r018.54-r018.55)
  - Preserve input values as visual records after execution
- ✅ Fixed Remove mode not resetting when all records cleared (r018.56)
  - Mode resets to NewSelection when all accumulated records cleared
- ✅ Fixed hash parameter race condition: Ensure Query tab is active before setting hash values (r018.39)
**Logging:** Comparison logs (`CHUNK-5-COMPARE`), state change logs (`RESULTS-MODE` feature), form logs (`FORM` feature)
**Documentation:** 
- `HELPER_QUERY_INTERACTION.md` - Comprehensive HS/QS interaction architecture
- `query-simple/BUGS.md` - All fixes documented with root causes and solutions

### Chunk 6: Map View Management (Next)
**Status:** 🔄 Ready to implement  
**Complexity:** Low  
**Risk:** Low  
**Methods:** Map view ref management, view change handlers  
**Logging Required:** View change logs, ref update logs  
**Note:** Good next step - low risk, independent, builds momentum before tackling Chunk 3

### Chunk 7: Event Handling
**Status:** 🔄 Needs extraction  
**Complexity:** Medium  
**Risk:** Medium  
**Methods:** Event listener setup/cleanup, custom event dispatching  
**Logging Required:** Event setup logs, event dispatch logs, listener registration logs

---

## Implementation Strategy: "Parallel Path" with Incremental Tests

### Core Principles

1. **Parallel Execution First:** Run old and new code side-by-side, compare results via logging
2. **Incremental Tests:** Build tests for each chunk, then roll up into longer sessions
3. **Extensive Logging:** Log everything during comparison phase - verify, don't assume
4. **Extra Caution for Chunk 3:** Double verification, extensive logging, fallback logic
5. **Version Tracking:** Increment version after each verified step
6. **Easy Rollback:** Keep old code commented until fully verified

---

## Phase 1: Chunk 1 (URL Parameter Consumption) - r018.1-018.4

### Step 1.1: Add Manager Class (r018.1)
**Goal:** Add manager without integration  
**Test:** Build succeeds, no runtime changes  
**Test File:** `tests/unit/chunk-1-url-consumption.test.ts` (create new)  
**Logging:** None yet (no integration)

### Step 1.2: Parallel Execution (r018.2)
**Goal:** Run both implementations, compare results via logging  
**Test:** Comparison logs show identical results  
**Test File:** Expand unit tests, add comparison test  

**Logging Pattern:**
```typescript
// Log both implementations
debugLogger.log('CHUNK-1-COMPARE', {
  event: 'url-param-detection',
  oldImplementation: {
    shortId: oldResult?.shortId,
    value: oldResult?.value,
    foundIn: oldFoundIn
  },
  newImplementation: {
    shortId: newResult?.shortId,
    value: newResult?.value,
    foundIn: newFoundIn
  },
  match: JSON.stringify(oldResult) === JSON.stringify(newResult),
  timestamp: Date.now()
})

// Log mismatches immediately
if (JSON.stringify(oldResult) !== JSON.stringify(newResult)) {
  debugLogger.log('CHUNK-1-MISMATCH', {
    event: 'url-param-mismatch',
    oldResult,
    newResult,
    warning: 'IMPLEMENTATIONS DO NOT MATCH'
  })
}
```

### Step 1.3: Switch to Manager (r018.3)
**Goal:** Replace old code with manager  
**Test:** All URL parameter scenarios work correctly  
**Test File:** Full unit test suite + integration test  
**Logging:** Keep comparison logs temporarily, add verification logs

### Step 1.4: Cleanup (r018.4)
**Goal:** Remove old code, clean up temporary comparison logs  
**Test:** Code is clean, all tests pass  
**Test File:** Final verification test  
**Logging:** Remove comparison logs, keep essential logs

**Milestone:** r018.10 - Chunk 1 Complete

---

## Phase 2: Chunk 2 (Widget Visibility Engine) - r018.11-018.13

### Step 2.1: Add Manager Class (r018.11) ✅
**Goal:** Add manager without integration  
**Test:** Build succeeds, no runtime changes  
**Test File:** `tests/unit/chunk-2-visibility.test.ts` (create new)  
**Logging:** None yet (no integration)
**Status:** ✅ Complete

### Step 2.2: Parallel Execution (r018.12) ✅
**Goal:** Run both implementations, compare results via logging  
**Test:** Comparison logs show identical visibility state
**Status:** ✅ Complete - Comparison logs confirmed match: true  
**Test File:** Expand unit tests, add comparison test  

**Logging Pattern:**
```typescript
debugLogger.log('CHUNK-2-COMPARE', {
  event: 'visibility-change',
  oldImplementation: {
    isVisible: oldIsVisible,
    method: 'old-setupVisibilityDetection'
  },
  newImplementation: {
    isVisible: newIsVisible,
    method: 'new-visibility-manager'
  },
  match: oldIsVisible === newIsVisible,
  timestamp: Date.now()
})

if (oldIsVisible !== newIsVisible) {
  debugLogger.log('CHUNK-2-MISMATCH', {
    event: 'visibility-mismatch',
    oldIsVisible,
    newIsVisible,
    warning: 'VISIBILITY STATE MISMATCH'
  })
}
```

### Step 2.3: Switch to Manager (r018.13)
**Goal:** Replace old code with manager  
**Test:** Panel open/close detection works correctly  
**Test File:** Full unit test suite + integration test  
**Logging:** Keep comparison logs temporarily, add verification logs

### Step 2.4: Cleanup (r018.14)
**Goal:** Remove old code, clean up temporary comparison logs  
**Test:** Code is clean, all tests pass  
**Test File:** Final verification test  
**Logging:** Remove comparison logs, keep essential logs

**Milestone:** r018.20 - Chunk 2 Complete

---

## Phase 3: Chunk 3 (Selection & Restoration) ⚠️ **EXTRA CAUTION** - r018.21-018.30

### Step 3.1: Create Selection Manager Class (r018.21)
**Goal:** Create manager class with extensive logging and fallback logic  
**Test:** Build succeeds, no runtime changes  
**Test File:** `tests/unit/chunk-3-selection.test.ts` (create new)  

**Critical Requirements:**
- Fallback logic for `r.getDataSource()` returning null
- Never pass empty arrays to `selectRecordsByIds()`
- Extensive logging at every decision point
- Unit tests for all edge cases

**Logging Requirements:**
```typescript
// Log every record filtering attempt
debugLogger.log('CHUNK-3-DECISION', {
  event: 'filter-records-by-origin-ds',
  recordId: record.getId(),
  recordHasDataSource: !!record.getDataSource?.(),
  recordDataSourceId: record.getDataSource?.()?.id || 'null',
  originDSId: originDS.id,
  matches: /* result */,
  willUseFallback: /* if filtering fails */
})

// Log fallback execution
debugLogger.log('CHUNK-3-FALLBACK', {
  event: 'using-fallback-logic',
  reason: 'filtering-returned-empty',
  recordIdsCount: recordIds.length,
  willUseAllRecordIds: true
})
```

### Step 3.2: Extract Selection State Management (r018.22)
**Goal:** Move `handleSelectionChange()` logic to manager  
**Test:** Selection state updates correctly  
**Test File:** Unit tests for selection state management  

**Logging Pattern:**
```typescript
debugLogger.log('CHUNK-3-DECISION', {
  event: 'selection-state-update',
  before: {
    hasSelection: this.state.hasSelection,
    selectionCount: this.state.selectionRecordCount,
    accumulatedCount: this.state.accumulatedRecords?.length || 0
  },
  after: {
    hasSelection: newHasSelection,
    selectionCount: newSelectionCount,
    accumulatedCount: newAccumulatedCount
  },
  reason: 'handleSelectionChange-called',
  timestamp: Date.now()
})
```

### Step 3.3: Extract Restoration Logic (r018.23)
**Goal:** Move `addSelectionToMap()` logic to manager  
**Test:** Selection restores correctly on panel open  
**Test File:** Unit tests for restoration logic  

**Critical Test Cases:**
- Accumulated records restoration
- Last selection restoration
- Graphics layer enabled/disabled
- Multiple origin data sources
- Records without `getDataSource()` attached

**Logging Pattern:**
```typescript
debugLogger.log('CHUNK-3-DECISION', {
  event: 'restoration-attempt',
  restorationType: 'panel-open',
  hasAccumulatedRecords: !!accumulatedRecords?.length,
  accumulatedRecordsCount: accumulatedRecords?.length || 0,
  hasLastSelection: !!lastSelection,
  resultsMode,
  willUseAccumulated: isAccumulationMode && accumulatedRecords?.length > 0,
  willUseLastSelection: !isAccumulationMode && !!lastSelection
})

// Log each origin data source restoration
debugLogger.log('CHUNK-3-DECISION', {
  event: 'restore-origin-ds',
  originDSId: originDS.id,
  recordCount: records.length,
  recordIds: recordIds,
  useGraphicsLayer,
  hasGraphicsLayer: !!graphicsLayer,
  hasMapView: !!mapView
})
```

### Step 3.4: Extract Clear Logic (r018.24)
**Goal:** Move `clearSelectionFromMap()` logic to manager  
**Test:** Selection clears correctly on panel close  
**Test File:** Unit tests for clear logic  

**Logging Pattern:**
```typescript
debugLogger.log('CHUNK-3-DECISION', {
  event: 'clear-selection-attempt',
  restorationType: 'panel-close',
  hasAccumulatedRecords: !!accumulatedRecords?.length,
  hasLastSelection: !!lastSelection,
  resultsMode,
  willClearAccumulated: isAccumulationMode && accumulatedRecords?.length > 0,
  willClearLastSelection: !isAccumulationMode && !!lastSelection
})
```

### Step 3.5: Extract Identify Popup Restoration (r018.25)
**Goal:** Move `handleRestoreOnIdentifyClose()` logic to manager  
**Test:** Selection restores after identify popup closes  
**Test File:** Unit tests for identify popup restoration  

**Logging Pattern:**
```typescript
debugLogger.log('CHUNK-3-DECISION', {
  event: 'identify-popup-restore',
  isWidgetOpen: /* check visibility */,
  hasSelectionToRestore: /* check state */,
  willRestore: isWidgetOpen && hasSelectionToRestore,
  reason: isWidgetOpen ? 'widget-open-restore' : 'widget-closed-skip'
})
```

### Step 3.6: Parallel Execution - Selection (r018.26)
**Goal:** Run both implementations side-by-side  
**Test:** Both produce identical selection results  
**Test File:** Comparison tests, extensive logging  

**Logging Pattern:**
```typescript
debugLogger.log('CHUNK-3-COMPARE', {
  event: 'selection-comparison',
  oldImplementation: {
    selectedRecordIds: oldSelectedIds,
    selectedRecordsCount: oldSelectedCount,
    originDSCount: oldOriginDSCount
  },
  newImplementation: {
    selectedRecordIds: newSelectedIds,
    selectedRecordsCount: newSelectedCount,
    originDSCount: newOriginDSCount
  },
  match: JSON.stringify(oldSelectedIds.sort()) === JSON.stringify(newSelectedIds.sort()),
  timestamp: Date.now()
})

if (JSON.stringify(oldSelectedIds.sort()) !== JSON.stringify(newSelectedIds.sort())) {
  debugLogger.log('CHUNK-3-MISMATCH', {
    event: 'selection-mismatch',
    oldSelectedIds,
    newSelectedIds,
    warning: 'SELECTION MISMATCH - INVESTIGATE IMMEDIATELY'
  })
}
```

### Step 3.7: Switch to Manager - Selection (r018.27)
**Goal:** Replace old selection code with manager  
**Test:** All selection scenarios work correctly  
**Test File:** Full integration test suite  

**Critical Verification:**
- ✅ Records select in data source (not just graphics layer)
- ✅ "Add to Map" action selects records
- ✅ Selection restores on panel open
- ✅ Selection clears on panel close
- ✅ Identify popup restoration works
- ✅ Graphics layer highlighting works
- ✅ Multiple origin data sources work

**Logging:** Keep all decision point logs, remove comparison logs

### Step 3.8: Parallel Execution - Restoration (r018.28)
**Goal:** Run both restoration implementations side-by-side  
**Test:** Both produce identical restoration results  
**Test File:** Comparison tests for restoration  

**Logging:** Same comparison pattern as Step 3.6

### Step 3.9: Switch to Manager - Restoration (r018.29)
**Goal:** Replace old restoration code with manager  
**Test:** All restoration scenarios work correctly  
**Test File:** Full restoration test suite  

**Logging:** Keep all decision point logs, remove comparison logs

### Step 3.10: Cleanup (r018.30)
**Goal:** Remove old code, clean up temporary comparison logs  
**Test:** Code is clean, all tests pass  
**Test File:** Final verification test  

**Logging:** Remove comparison logs, keep essential decision point logs and fallback logs

**Milestone:** r018.30 - Chunk 3 Complete (CRITICAL MILESTONE)

---

## Phase 4: Chunk 4 (Graphics Layer Management) - r018.19-018.25

### Step 4.1: Create Graphics Layer Manager (r018.19) ✅
**Goal:** Extract graphics layer logic to manager  
**Test:** Graphics layer initializes correctly  
**Test File:** `tests/unit/chunk-4-graphics-layer.test.ts`  
**Logging:** Initialization logs, comparison logs  
**Status:** ✅ Complete

### Step 4.2: Parallel Execution (r018.20-r018.24) ✅
**Goal:** Run both implementations side-by-side, compare results  
**Test:** Comparison logs show identical graphics layer state  
**Status:** ✅ Complete - Comparison logs confirmed match: true  
**Test File:** Expand unit tests, add comparison test  
**Logging:** Comparison logs (`CHUNK-4-COMPARE`, `GRAPHICS-LAYER`)

### Step 4.3: Switch to Manager (r018.25) ✅
**Goal:** Replace old code with manager, remove non-graphics layer implementation  
**Test:** Graphics layer management works correctly  
**Status:** ✅ Complete  
**Test File:** Full unit test suite + integration test  
**Logging:** Removed comparison logs, kept essential GRAPHICS-LAYER logs

### Step 4.4: Cleanup (r018.25) ✅
**Goal:** Remove old code, remove non-graphics layer implementation  
**Test:** Code is clean, all tests pass  
**Status:** ✅ Complete  
**Test File:** Final verification test  
**Logging:** Removed comparison logs, kept essential GRAPHICS-LAYER logs

**Breaking Change:** Removed `useGraphicsLayerForHighlight` config option - graphics layer is now required when map widget is configured. This simplifies the codebase by removing ~150+ lines of duplicate/legacy code.

**Milestone:** r018.25 - Chunk 4 Complete ✅

---

## Phase 5: Chunk 5 (Accumulated Records Management) - r018.41-018.44

### Step 5.1: Create Accumulated Records Manager (r018.41)
**Goal:** Extract accumulated records logic to manager  
**Test:** Accumulated records state managed correctly  
**Test File:** `tests/unit/chunk-5-accumulated-records.test.ts`  
**Logging:** State change logs, comparison logs

### Step 5.2: Extract State Management (r018.42)
**Goal:** Move accumulated records state to manager  
**Test:** Records accumulate correctly  
**Test File:** Unit tests for accumulation  
**Logging:** Accumulation logs, deduplication logs

### Step 5.3: Extract Mode Reset Logic (r018.43)
**Goal:** Move mode reset logic to manager  
**Test:** Mode resets correctly when needed  
**Test File:** Unit tests for mode reset  
**Logging:** Mode reset logs

### Step 5.4: Cleanup (r018.44)
**Goal:** Remove old code, clean up temporary logs  
**Test:** Code is clean, all tests pass  
**Test File:** Final verification test  
**Logging:** Remove comparison logs, keep essential logs

**Milestone:** r018.50 - Chunk 5 Complete

---

## Phase 6: Chunk 6 (Map View Management) - r018.51-018.54

### Step 6.1: Add Manager Class (r018.14) ✅
**Goal:** Add manager without integration  
**Test:** Build succeeds, no runtime changes  
**Test File:** `tests/unit/chunk-6-map-view.test.ts`  
**Logging:** None yet (no integration)  
**Status:** ✅ Complete

### Step 6.2: Parallel Execution (r018.15) ✅
**Goal:** Run both implementations, compare results via logging  
**Test:** Comparison logs show identical map view state  
**Status:** ✅ Complete - Comparison logs confirmed match: true  
**Test File:** Expand unit tests, add comparison test  
**Logging:** Comparison logs (`CHUNK-6-COMPARE`, `CHUNK-6-MISMATCH`)

### Step 6.3: Switch to Manager (r018.16) ✅
**Goal:** Replace old code with manager  
**Test:** All map view scenarios work correctly  
**Status:** ✅ Complete  
**Test File:** Full unit test suite + integration test  
**Logging:** Keep simplified verification logs temporarily

### Step 6.4: Cleanup (r018.18) ✅
**Goal:** Remove old code, clean up temporary logs  
**Test:** Code is clean, all tests pass  
**Status:** ✅ Complete  
**Test File:** Final verification test  
**Logging:** Removed temporary verification logs, kept essential MAP-EXTENT logs

**Milestone:** r018.18 - Chunk 6 Complete ✅

---

## Phase 7: Chunk 7 (Event Handling) - r018.61-018.64

### Step 7.1: Create Event Manager (r018.61)
**Goal:** Extract event handling logic to manager  
**Test:** Events set up correctly  
**Test File:** `tests/unit/chunk-7-events.test.ts`  
**Logging:** Event setup logs, comparison logs

### Step 7.2: Extract Event Listeners (r018.62)
**Goal:** Move event listener setup to manager  
**Test:** Event listeners work correctly  
**Test File:** Unit tests for event listeners  
**Logging:** Listener registration logs

### Step 7.3: Extract Custom Events (r018.63)
**Goal:** Move custom event dispatching to manager  
**Test:** Custom events dispatched correctly  
**Test File:** Unit tests for custom events  
**Logging:** Event dispatch logs

### Step 7.4: Cleanup (r018.64)
**Goal:** Remove old code, clean up temporary logs  
**Test:** Code is clean, all tests pass  
**Test File:** Final verification test  
**Logging:** Remove comparison logs, keep essential logs

**Milestone:** r018.70 - Chunk 7 Complete (Complete Migration)

---

## Testing Strategy

### Unit Tests (Per Chunk)

Each chunk gets its own unit test file:
- `tests/unit/chunk-1-url-consumption.test.ts`
- `tests/unit/chunk-2-visibility.test.ts`
- `tests/unit/chunk-3-selection.test.ts` ⚠️ **EXTENSIVE**
- `tests/unit/chunk-4-graphics-layer.test.ts`
- `tests/unit/chunk-5-accumulated-records.test.ts`
- `tests/unit/chunk-6-map-view.test.ts`
- `tests/unit/chunk-7-events.test.ts`

**Test Requirements:**
- Test all edge cases
- Test fallback logic (especially Chunk 3)
- Test error conditions
- Verify logging output

### Integration Tests (Rolled Up)

**After Chunk 1:** `tests/integration/chunks-1.test.ts`  
**After Chunk 2:** `tests/integration/chunks-1-2.test.ts`  
**After Chunk 3:** `tests/integration/chunks-1-3.test.ts` ⚠️ **CRITICAL**  
**After Chunk 4:** `tests/integration/chunks-1-4.test.ts`  
**After Chunk 5:** `tests/integration/chunks-1-5.test.ts`  
**After Chunk 6:** `tests/integration/chunks-1-6.test.ts`  
**After Chunk 7:** `tests/integration/chunks-1-7.test.ts` (Complete Migration Test)

**Integration Test Requirements:**
- Test interactions between chunks
- Verify no regressions
- Check logging output for consistency
- Performance verification

### E2E Tests (Session-Based)

**After Chunk 3:** `tests/e2e/chunks-1-3-session.spec.ts` - Full user session with selection/restoration  
**After Chunk 7:** `tests/e2e/complete-migration-session.spec.ts` - Complete migration verification

**E2E Test Requirements:**
- Simulate real user workflows
- Verify all functionality works together
- Check for performance regressions
- Verify logging doesn't impact performance

---

## Chunk 3 Special Considerations ⚠️

### Critical Test Cases

1. **Selection with Graphics Layer Enabled**
   - Records must select in data source (not just graphics layer)
   - "Add to Map" action must select records
   - Fallback logic for `r.getDataSource()` returning null
   - **Logging:** Log every filtering attempt, every fallback execution

2. **Restoration Scenarios**
   - Accumulated records restoration
   - Last selection restoration
   - Multiple origin data sources
   - Graphics layer enabled/disabled
   - **Logging:** Log every restoration attempt, every decision point

3. **Edge Cases**
   - Records without `getDataSource()` attached
   - Empty record arrays
   - Null/undefined data sources
   - Race conditions
   - **Logging:** Log all edge cases, all fallback executions

### Fallback Logic Requirements

```typescript
// CRITICAL: Never pass empty arrays to selectRecordsByIds()
const recordsForThisDS = records.filter(r => {
  const ds = r.getDataSource?.()
  const origin = ds?.getOriginDataSources()?.[0] || ds
  
  // LOG: Every filtering attempt
  debugLogger.log('CHUNK-3-DECISION', {
    event: 'filter-record-by-origin-ds',
    recordId: r.getId(),
    recordHasDataSource: !!ds,
    recordDataSourceId: ds?.id || 'null',
    originDSId: originDS.id,
    originId: origin?.id || 'null',
    matches: origin?.id === originDS.id
  })
  
  return origin?.id === originDS.id
})
const idsForThisDS = recordsForThisDS.map(r => r.getId())

// FALLBACK: Use all recordIds if filtering fails
const finalIds = recordsForThisDS.length > 0 ? idsForThisDS : recordIds
const finalRecords = recordsForThisDS.length > 0 ? recordsForThisDS : records

// LOG: Fallback execution
if (recordsForThisDS.length === 0 && recordIds.length > 0) {
  debugLogger.log('CHUNK-3-FALLBACK', {
    event: 'using-fallback-for-empty-filter',
    reason: 'filtering-returned-empty-array',
    recordIdsCount: recordIds.length,
    recordsCount: records.length,
    willUseAllRecordIds: true,
    warning: 'Using fallback logic - filtering failed'
  })
}

// Only call if we have records
if (finalIds.length > 0 && finalRecords.length > 0) {
  debugLogger.log('CHUNK-3-DECISION', {
    event: 'calling-selectRecordsByIds',
    originDSId: originDS.id,
    recordIdsCount: finalIds.length,
    recordsCount: finalRecords.length,
    useGraphicsLayer,
    hasGraphicsLayer: !!graphicsLayer,
    hasMapView: !!mapView
  })
  
  originDS.selectRecordsByIds(finalIds, finalRecords)
} else {
  debugLogger.log('CHUNK-3-FALLBACK', {
    event: 'skipping-selectRecordsByIds',
    reason: 'no-records-to-select',
    finalIdsCount: finalIds.length,
    finalRecordsCount: finalRecords.length,
    warning: 'Skipping selection - no records available'
  })
}
```

---

## Success Metrics

### Chunk 1 Success:
- ✅ URL parameter detection works (hash and query string)
- ✅ Hash priority over query string maintained
- ✅ Mode reset on hash detection works
- ✅ Hash consumption on mode switch works
- ✅ Comparison logs show identical results

### Chunk 2 Success:
- ✅ Panel visibility detection works (open/close)
- ✅ HelperSimple notifications work
- ✅ Selection restore/clear triggers work
- ✅ Comparison logs show identical visibility state

### Chunk 3 Success: ⚠️ **CRITICAL**
- ✅ Records select in data source (not just graphics layer)
- ✅ "Add to Map" action selects records
- ✅ Selection restores on panel open
- ✅ Selection clears on panel close
- ✅ Identify popup restoration works
- ✅ Graphics layer highlighting works
- ✅ Multiple origin data sources work
- ✅ Fallback logic works for records without `getDataSource()`
- ✅ Comparison logs show identical selection results
- ✅ Decision point logs show correct logic execution
- ✅ Fallback logs show fallback execution when needed

### Chunks 4-7 Success:
- ✅ Each manager handles its responsibility correctly
- ✅ No regressions in existing functionality
- ✅ All tests pass
- ✅ Comparison logs show identical results (where applicable)

---

## Rollback Plan

If issues arise at any step:

1. **Immediate Rollback:** Comment out new code, uncomment old code
2. **Git Rollback:** `git revert [commit-hash]` for the problematic step
3. **Investigation:** Review comparison logs to identify root cause
4. **Fix:** Address issue before re-attempting
5. **Re-test:** Verify fix with extensive logging before proceeding

**Special Rollback for Chunk 3:**
- If selection breaks, immediately roll back to r018.20
- Investigate root cause with extensive logging
- Review all decision point logs and fallback logs
- Fix fallback logic before re-attempting
- Add additional logging if needed

---

## Logging Cleanup Strategy

### During Migration (Temporary Logs)
- Keep all comparison logs active
- Keep all decision point logs active
- Keep all fallback logs active
- Log extensively to verify correctness

### After Migration (Permanent Logs)
- Remove comparison logs (no longer needed)
- Keep critical decision point logs (especially Chunk 3)
- Keep fallback execution logs (important for debugging)
- Keep error condition logs
- Remove verbose step-by-step logs

### Logging Guidelines
- **When in doubt, keep the log** - Better to have too much logging than to assume correctness
- **Log all fallback executions** - Critical for understanding edge cases
- **Log all decision points in Chunk 3** - Essential for debugging selection issues
- **Remove comparison logs after verification** - Clean up temporary logs
- **Keep error logs permanently** - Always useful for production debugging

---

## Next Steps

1. Review this comprehensive plan
2. Start with Chunk 1, Step 1.1 (r018.1)
3. Build tests incrementally
4. Add extensive logging at every step
5. Only proceed when current step is 100% verified via logging
6. **Extra caution** when reaching Chunk 3
7. Clean up temporary logs after verification

---

## Key Reminders

- **Verify, don't assume** - Use logging to verify correctness
- **Small, solid steps** - One step at a time, verify before proceeding
- **Extensive logging** - Better too much than too little during migration
- **Extra caution for Chunk 3** - This is where things broke before
- **Test incrementally** - Build tests as you go, roll up into longer sessions
- **Easy rollback** - Keep old code commented until fully verified

---

**End of Complete Migration Plan**

