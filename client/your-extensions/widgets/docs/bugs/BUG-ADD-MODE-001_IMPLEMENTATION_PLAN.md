# BUG-ADD-MODE-001: Implementation Plan

**Bug:** Accumulated Results Change Format When Switching Queries  
**Status:** 🐛 Confirmed - Not Fixed  
**Target Version:** r020.0+ (New branch recommended)  
**Estimated Effort:** 1-2 days  
**Complexity:** 5-6 out of 10  
**Created:** 2026-01-12

---

## Quick Summary

**Problem:** In ADD mode, switching between queries causes ALL accumulated results to adopt the current query's display configuration instead of maintaining their original configuration.

**Solution:** Change accumulated records from a flat array to grouped sets, where each set stores its original query configuration and is rendered independently.

---

## Implementation Overview

### Phase 1: Data Structure Changes (4 hours)
Change how accumulated records are stored to preserve original query metadata.

### Phase 2: Merge & Remove Logic (4 hours)
Update utilities to work with record sets instead of flat arrays.

### Phase 3: Rendering Changes (2 hours)
Update UI to render each record set with its original configuration.

### Phase 4: Testing & Verification (4 hours)
Manual testing, E2E tests, and edge case validation.

### Phase 5: Documentation & Cleanup (2 hours)
Update docs, remove BUG logging, add CHANGELOG entry.

---

## Data Structure Changes

### Current Structure (Flat Array)

```typescript
// In query-task.tsx state
const [accumulatedRecords, setAccumulatedRecords] = useState<FeatureDataRecord[]>([])

// Passed to results component
<QueryTaskResult
  records={effectiveRecords}
  queryItem={queryItem}  // Current query config used for ALL records!
  accumulatedRecords={accumulatedRecords}
/>
```

**Problem:** `queryItem` is the CURRENTLY selected query, so all records (old and new) render with current config.

---

### New Structure (Grouped Sets)

```typescript
// Define new interface
interface AccumulatedRecordSet {
  // Unique identifier for this record set
  queryConfigId: string
  
  // Full query configuration (CRITICAL - stores display settings)
  queryConfig: ImmutableObject<QueryItemType>
  
  // Human-readable name for UI display
  queryName: string
  
  // Search alias if different from name
  searchAlias?: string
  
  // The actual records
  records: FeatureDataRecord[]
  
  // Metadata
  addedTimestamp: number
  recordIds: string[]  // For quick lookup
}

interface AccumulatedRecordsState {
  // Array of record sets (one per query execution in ADD mode)
  recordSets: AccumulatedRecordSet[]
  
  // Flattened data for compatibility/quick access
  totalCount: number
  allRecordIds: string[]  // Flat list for duplicate checking
  allRecords: FeatureDataRecord[]  // Flat list for selections
}

// In query-task.tsx state
const [accumulatedRecordsState, setAccumulatedRecordsState] = 
  useState<AccumulatedRecordsState>({
    recordSets: [],
    totalCount: 0,
    allRecordIds: [],
    allRecords: []
  })
```

---

## Step-by-Step Implementation

### Step 1: Create New Type Definitions

**File:** `query-simple/src/runtime/types/accumulated-records.ts` (NEW FILE)

```typescript
import type { ImmutableObject, FeatureDataRecord } from 'jimu-core'
import type { QueryItemType } from '../../config'

/**
 * A set of records accumulated from a single query execution.
 * Preserves the original query configuration for proper display.
 */
export interface AccumulatedRecordSet {
  /** Unique identifier for the query that produced these records */
  queryConfigId: string
  
  /** Full query configuration including display settings */
  queryConfig: ImmutableObject<QueryItemType>
  
  /** Human-readable name for display */
  queryName: string
  
  /** Search alias if different from name */
  searchAlias?: string
  
  /** Records from this query execution */
  records: FeatureDataRecord[]
  
  /** Record IDs for quick duplicate checking */
  recordIds: string[]
  
  /** When this set was added (for sorting/ordering) */
  addedTimestamp: number
}

/**
 * Complete state for accumulated records in ADD/REMOVE mode.
 * Maintains both grouped sets (for rendering) and flat lists (for compatibility).
 */
export interface AccumulatedRecordsState {
  /** Array of record sets, one per query execution */
  recordSets: AccumulatedRecordSet[]
  
  /** Total count across all sets */
  totalCount: number
  
  /** Flattened list of all record IDs (for duplicate checking) */
  allRecordIds: string[]
  
  /** Flattened list of all records (for selections/actions) */
  allRecords: FeatureDataRecord[]
}

/**
 * Creates an empty accumulated records state.
 */
export function createEmptyAccumulatedState(): AccumulatedRecordsState {
  return {
    recordSets: [],
    totalCount: 0,
    allRecordIds: [],
    allRecords: []
  }
}

/**
 * Flattens record sets into a single array (for compatibility).
 */
export function flattenRecordSets(recordSets: AccumulatedRecordSet[]): FeatureDataRecord[] {
  return recordSets.flatMap(set => set.records)
}

/**
 * Flattens record IDs from all sets (for duplicate checking).
 */
export function flattenRecordIds(recordSets: AccumulatedRecordSet[]): string[] {
  return recordSets.flatMap(set => set.recordIds)
}
```

---

### Step 2: Update State Management in QueryTask

**File:** `query-simple/src/runtime/query-task.tsx`

#### 2a. Import New Types

```typescript
// Add to existing imports
import { 
  type AccumulatedRecordSet, 
  type AccumulatedRecordsState,
  createEmptyAccumulatedState,
  flattenRecordSets,
  flattenRecordIds
} from './types/accumulated-records'
```

#### 2b. Replace State Declaration (line ~336)

```typescript
// BEFORE:
const [accumulatedRecords, setAccumulatedRecords] = 
  useState<FeatureDataRecord[]>([])

// AFTER:
const [accumulatedRecordsState, setAccumulatedRecordsState] = 
  useState<AccumulatedRecordsState>(createEmptyAccumulatedState())

// Add helper to get flat list for compatibility
const accumulatedRecords = React.useMemo(
  () => accumulatedRecordsState.allRecords,
  [accumulatedRecordsState.allRecords]
)
```

#### 2c. Update Clear Function (line ~475)

```typescript
// BEFORE:
const handleClearResult = () => {
  setAccumulatedRecords([])
  // ... rest of logic
}

// AFTER:
const handleClearResult = () => {
  setAccumulatedRecordsState(createEmptyAccumulatedState())
  // ... rest of logic
}
```

#### 2d. Update Result Count Calculation (line ~503)

```typescript
// BEFORE:
const effectiveResultCount = isAccumulationMode 
  ? accumulatedRecords.length 
  : records?.length || 0

// AFTER:
const effectiveResultCount = isAccumulationMode 
  ? accumulatedRecordsState.totalCount
  : records?.length || 0
```

---

### Step 3: Update Merge Logic

**File:** `query-simple/src/runtime/results-management-utils.ts`

#### 3a. Add New Function: `addRecordSetToAccumulated`

```typescript
import type { AccumulatedRecordsState, AccumulatedRecordSet } from './types/accumulated-records'
import type { ImmutableObject, FeatureDataRecord } from 'jimu-core'
import type { QueryItemType } from '../config'

/**
 * Adds a new record set to accumulated records.
 * Handles duplicate detection within and across sets.
 * 
 * @param currentState - Current accumulated records state
 * @param newRecords - New records to add
 * @param queryConfig - Query configuration that produced these records
 * @returns Updated accumulated records state
 */
export function addRecordSetToAccumulated(
  currentState: AccumulatedRecordsState,
  newRecords: FeatureDataRecord[],
  queryConfig: ImmutableObject<QueryItemType>
): AccumulatedRecordsState {
  if (!newRecords || newRecords.length === 0) {
    return currentState
  }
  
  // Extract record IDs from new records
  const newRecordIds = newRecords.map(r => r.getId())
  
  // Check for duplicates across ALL existing sets
  const existingIds = new Set(currentState.allRecordIds)
  const duplicateIds = new Set<string>()
  const uniqueNewRecords: FeatureDataRecord[] = []
  const uniqueNewRecordIds: string[] = []
  
  newRecords.forEach(record => {
    const recordId = record.getId()
    if (existingIds.has(recordId)) {
      duplicateIds.add(recordId)
    } else {
      uniqueNewRecords.push(record)
      uniqueNewRecordIds.push(recordId)
    }
  })
  
  // Log duplicate detection
  if (duplicateIds.size > 0) {
    console.log('[RESULTS-MODE] Skipped duplicates when adding record set:', {
      queryConfigId: queryConfig.configId,
      totalNewRecords: newRecords.length,
      duplicatesSkipped: duplicateIds.size,
      uniqueRecordsAdded: uniqueNewRecords.length,
      duplicateIds: Array.from(duplicateIds).slice(0, 10)
    })
  }
  
  // If no unique records, don't add a set
  if (uniqueNewRecords.length === 0) {
    return currentState
  }
  
  // Create new record set
  const newSet: AccumulatedRecordSet = {
    queryConfigId: queryConfig.configId,
    queryConfig: queryConfig,
    queryName: queryConfig.name || 'Unnamed Query',
    searchAlias: queryConfig.searchAlias,
    records: uniqueNewRecords,
    recordIds: uniqueNewRecordIds,
    addedTimestamp: Date.now()
  }
  
  // Add to record sets array
  const updatedRecordSets = [...currentState.recordSets, newSet]
  
  // Recalculate flattened lists
  const allRecords = flattenRecordSets(updatedRecordSets)
  const allRecordIds = flattenRecordIds(updatedRecordSets)
  
  return {
    recordSets: updatedRecordSets,
    totalCount: allRecords.length,
    allRecordIds,
    allRecords
  }
}
```

#### 3b. Add New Function: `removeRecordsFromAccumulated`

```typescript
/**
 * Removes specific records from accumulated state.
 * Removes empty sets after removal.
 * 
 * @param currentState - Current accumulated records state
 * @param recordsToRemove - Records to remove
 * @returns Updated accumulated records state
 */
export function removeRecordsFromAccumulated(
  currentState: AccumulatedRecordsState,
  recordsToRemove: FeatureDataRecord[]
): AccumulatedRecordsState {
  if (!recordsToRemove || recordsToRemove.length === 0) {
    return currentState
  }
  
  const idsToRemove = new Set(recordsToRemove.map(r => r.getId()))
  
  // Filter records from each set
  const updatedRecordSets = currentState.recordSets
    .map(set => {
      const filteredRecords = set.records.filter(r => !idsToRemove.has(r.getId()))
      const filteredRecordIds = filteredRecords.map(r => r.getId())
      
      return {
        ...set,
        records: filteredRecords,
        recordIds: filteredRecordIds
      }
    })
    .filter(set => set.records.length > 0)  // Remove empty sets
  
  // Recalculate flattened lists
  const allRecords = flattenRecordSets(updatedRecordSets)
  const allRecordIds = flattenRecordIds(updatedRecordSets)
  
  return {
    recordSets: updatedRecordSets,
    totalCount: allRecords.length,
    allRecordIds,
    allRecords
  }
}
```

---

### Step 4: Update Query Execution Logic

**File:** `query-simple/src/runtime/query-task.tsx`

#### 4a. Update `handleFormSubmitInternal` - NEW_SELECTION Mode (line ~1447)

```typescript
// Inside executeQuery().then() callback
// When resultsMode === NEW_SELECTION

// BEFORE:
if (resultsMode === SelectionType.NewSelection) {
  setAccumulatedRecords([])  // Clear accumulated
}

// AFTER:
if (resultsMode === SelectionType.NewSelection) {
  setAccumulatedRecordsState(createEmptyAccumulatedState())  // Clear accumulated
}
```

#### 4b. Update `handleFormSubmitInternal` - ADD Mode (line ~1570)

```typescript
// Inside executeQuery().then() callback
// When resultsMode === ADD_TO_SELECTION

// BEFORE:
const updatedAccumulated = mergeResultsIntoAccumulated(
  accumulatedRecords,
  result.records
)
setAccumulatedRecords(updatedAccumulated)

// AFTER:
const updatedAccumulatedState = addRecordSetToAccumulated(
  accumulatedRecordsState,
  result.records,
  queryItem  // Pass full query config!
)
setAccumulatedRecordsState(updatedAccumulatedState)

debugLogger.log('RESULTS-MODE', {
  event: 'record-set-added-to-accumulated',
  widgetId: props.widgetId,
  queryConfigId: queryItem.configId,
  queryName: queryItem.name,
  newRecordsCount: result.records.length,
  totalSetsCount: updatedAccumulatedState.recordSets.length,
  totalRecordsCount: updatedAccumulatedState.totalCount
})
```

#### 4c. Update `handleFormSubmitInternal` - REMOVE Mode (line ~1625)

```typescript
// Inside executeQuery().then() callback
// When resultsMode === REMOVE_FROM_SELECTION

// BEFORE:
const updatedAccumulated = removeResultsFromAccumulated(
  accumulatedRecords,
  result.records
)
setAccumulatedRecords(updatedAccumulated)

// AFTER:
const updatedAccumulatedState = removeRecordsFromAccumulated(
  accumulatedRecordsState,
  result.records
)
setAccumulatedRecordsState(updatedAccumulatedState)

debugLogger.log('RESULTS-MODE', {
  event: 'records-removed-from-accumulated',
  widgetId: props.widgetId,
  recordsRemovedCount: result.records.length,
  totalSetsCount: updatedAccumulatedState.recordSets.length,
  totalRecordsCount: updatedAccumulatedState.totalCount
})
```

---

### Step 5: Update Rendering Logic

**File:** `query-simple/src/runtime/query-result.tsx`

#### 5a. Update Props Interface (line ~94)

```typescript
// BEFORE:
export interface QueryTaskResultProps {
  // ... existing props
  accumulatedRecords?: FeatureDataRecord[]
  onAccumulatedRecordsChange?: (records: FeatureDataRecord[]) => void
}

// AFTER:
import type { AccumulatedRecordsState } from './types/accumulated-records'

export interface QueryTaskResultProps {
  // ... existing props
  accumulatedRecordsState?: AccumulatedRecordsState
  onAccumulatedRecordsStateChange?: (state: AccumulatedRecordsState) => void
}
```

#### 5b. Update Component Logic (line ~143)

```typescript
export function QueryTaskResult (props: QueryTaskResultProps) {
  const { 
    queryItem, 
    records, 
    resultsMode, 
    accumulatedRecordsState,  // Changed from accumulatedRecords
    onAccumulatedRecordsStateChange,  // Changed from onAccumulatedRecordsChange
    // ... other props
  } = props
  
  // ... existing logic
}
```

#### 5c. Create New Component: `ResultSetGroup`

```typescript
/**
 * Renders a group of results from a single query execution.
 * Each group maintains its original query configuration.
 */
interface ResultSetGroupProps {
  recordSet: AccumulatedRecordSet
  widgetId: string
  outputDS: DataSource
  useGraphicsLayerForHighlight: boolean
  graphicsLayer: __esri.GraphicsLayer
  mapView: __esri.MapView | __esri.SceneView
  onRecordRemove: (recordId: string) => void
  selectedRecords: DataRecord[]
  expandAll: boolean
  itemExpandStates: Map<string, boolean>
  onItemExpandToggle: (recordId: string) => void
}

function ResultSetGroup(props: ResultSetGroupProps) {
  const { recordSet, widgetId, outputDS, useGraphicsLayerForHighlight, 
          graphicsLayer, mapView, onRecordRemove, selectedRecords, 
          expandAll, itemExpandStates, onItemExpandToggle } = props
  
  const getI18nMessage = hooks.useTranslation(defaultMessage)
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  
  return (
    <div 
      className="result-set-group"
      css={css`
        margin-bottom: 16px;
        border: 1px solid var(--sys-color-divider-secondary);
        border-radius: 4px;
        overflow: hidden;
      `}
    >
      {/* Header showing query name and count */}
      <div 
        className="result-set-header"
        onClick={() => setIsCollapsed(!isCollapsed)}
        css={css`
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background-color: var(--sys-color-surface-secondary);
          cursor: pointer;
          user-select: none;
          
          &:hover {
            background-color: var(--sys-color-surface-tertiary);
          }
          
          .header-left {
            display: flex;
            align-items: center;
            gap: 8px;
            flex: 1;
          }
          
          .query-name {
            font-weight: 500;
            color: var(--sys-color-surface-paper-text);
          }
          
          .record-count {
            color: var(--sys-color-on-surface-variant);
            font-size: 0.875rem;
          }
          
          .collapse-icon {
            color: var(--sys-color-on-surface-variant);
            transition: transform 0.2s;
            transform: ${isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'};
          }
        `}
      >
        <div className="header-left">
          <span className="collapse-icon">▼</span>
          <span className="query-name">
            {recordSet.searchAlias || recordSet.queryName}
          </span>
          <span className="record-count">
            ({recordSet.records.length} {recordSet.records.length === 1 ? 'item' : 'items'})
          </span>
        </div>
      </div>
      
      {/* Results list (using original query config!) */}
      {!isCollapsed && (
        <div className="result-set-content">
          <QueryTaskResult
            widgetId={widgetId}
            queryItem={recordSet.queryConfig}  // CRITICAL: Use original config!
            records={recordSet.records}
            outputDS={outputDS}
            resultsMode="NEW_SELECTION"  // Treat each set independently
            useGraphicsLayerForHighlight={useGraphicsLayerForHighlight}
            graphicsLayer={graphicsLayer}
            mapView={mapView}
            // Don't pass accumulated props - each set is independent
          />
        </div>
      )}
    </div>
  )
}
```

#### 5d. Update Main Rendering Logic (line ~1200+)

```typescript
// Inside QueryTaskResult component

// For accumulated mode, render grouped sets
if (resultsMode !== SelectionType.NewSelection && 
    accumulatedRecordsState && 
    accumulatedRecordsState.recordSets.length > 0) {
  
  return (
    <div className="query-result-accumulated">
      <div className="query-result__header">
        <span>{getI18nMessage('accumulatedResults')}</span>
        <span> ({accumulatedRecordsState.totalCount})</span>
      </div>
      
      {/* Render each record set with its original config */}
      {accumulatedRecordsState.recordSets.map((recordSet, index) => (
        <ResultSetGroup
          key={`${recordSet.queryConfigId}-${recordSet.addedTimestamp}-${index}`}
          recordSet={recordSet}
          widgetId={widgetId}
          outputDS={outputDS}
          useGraphicsLayerForHighlight={useGraphicsLayerForHighlight}
          graphicsLayer={graphicsLayer}
          mapView={mapView}
          onRecordRemove={handleRecordRemove}
          selectedRecords={selectedRecords}
          expandAll={expandAll}
          itemExpandStates={itemExpandStates}
          onItemExpandToggle={(recordId) => {
            setItemExpandStates(prev => {
              const newMap = new Map(prev)
              newMap.set(recordId, !prev.get(recordId))
              return newMap
            })
          }}
        />
      ))}
    </div>
  )
}

// For NEW mode, render normally (existing logic)
// ... existing render code
```

---

### Step 6: Update Props Passing in QueryTask

**File:** `query-simple/src/runtime/query-task.tsx` (line ~2917)

```typescript
// BEFORE:
<QueryTaskResult
  key={`${queryItem.configId}-${queryExecutionKeyRef.current}`}
  widgetId={props.widgetId}
  queryItem={queryItem}
  // ... other props
  accumulatedRecords={accumulatedRecords}
  onAccumulatedRecordsChange={onAccumulatedRecordsChange}
/>

// AFTER:
<QueryTaskResult
  key={`${queryItem.configId}-${queryExecutionKeyRef.current}`}
  widgetId={props.widgetId}
  queryItem={queryItem}
  // ... other props
  accumulatedRecordsState={accumulatedRecordsState}
  onAccumulatedRecordsStateChange={setAccumulatedRecordsState}
/>
```

---

### Step 7: Remove BUG Logging

**File:** `query-simple/src/runtime/query-task.tsx` (line ~653)

```typescript
// REMOVE this block (added in r019.31):
// BUG LOGGING: Accumulated results format switch bug
if (accumulatedRecords && accumulatedRecords.length > 0) {
  debugLogger.log('BUG', {
    bugId: 'BUG-ADD-MODE-001',
    // ... rest of bug logging
  })
}

// REPLACE with success logging:
debugLogger.log('RESULTS-MODE', {
  event: 'query-switch-with-accumulated-sets',
  widgetId: props.widgetId,
  oldQueryConfigId: oldConfigId,
  newQueryConfigId: queryItem.configId,
  recordSetsCount: accumulatedRecordsState.recordSets.length,
  totalRecordsCount: accumulatedRecordsState.totalCount,
  note: 'BUG-ADD-MODE-001 RESOLVED: Each set maintains original query config'
})
```

---

## Testing Strategy

### Manual Test Cases

#### Test 1: Basic Format Preservation
1. Open QuerySimple widget
2. Select "Full address" query (Simple List format)
3. Search "201 S Jackson" → 5 results
4. Switch Results Mode to "Add to selection"
5. Switch to "Parcel Number" query (different format)
6. **Verify:** "Full address" results still display in original format
7. Search "2223059013" → 1 result
8. **Verify:** "Parcel Number" result displays in its format
9. **Verify:** Both sets are visually grouped with labels

#### Test 2: Field Mismatch Handling
1. Query A: Has fields ADDR_FULL, OBJECTID (shows addresses)
2. Query B: Has fields PARCEL_ID, OWNER_NAME (shows parcels)
3. Run Query A → ADD mode → Run Query B
4. **Verify:** Query A results show ADDR_FULL, OBJECTID
5. **Verify:** Query B results show PARCEL_ID, OWNER_NAME
6. **Verify:** No field name collisions or wrong data

#### Test 3: Duplicate Detection
1. Run Query A → Get 5 results → ADD mode
2. Run Query A again with same search
3. **Verify:** No duplicate records added
4. **Verify:** Console shows "Skipped duplicates" message
5. Switch to Query B → Run it
6. Run Query A again
7. **Verify:** Still no duplicates across sets

#### Test 4: Remove Mode
1. Accumulate Query A (5 results) and Query B (3 results)
2. Switch to "Remove from selection" mode
3. Run Query A again (same search)
4. **Verify:** Query A set is removed completely
5. **Verify:** Query B set remains intact

#### Test 5: Record Removal (X button)
1. Accumulate Query A (5 results) and Query B (3 results)
2. Click X on 2 records from Query A set
3. **Verify:** Query A set now shows 3 records
4. **Verify:** Query B set unchanged
5. Remove all records from Query A
6. **Verify:** Query A set disappears completely

#### Test 6: Collapse/Expand Groups
1. Accumulate multiple query sets
2. Click header of Query A set
3. **Verify:** Query A results collapse (count still visible)
4. Click header again
5. **Verify:** Query A results expand
6. **Verify:** Each set can be collapsed independently

#### Test 7: Switch to NEW Mode
1. Accumulate Query A and Query B
2. Switch to "Create new selection" mode
3. Run Query C
4. **Verify:** Previous accumulated sets are cleared
5. **Verify:** Only Query C results displayed

#### Test 8: Clear All Results
1. Accumulate Query A and Query B
2. Click "Clear all results" button
3. **Verify:** All sets cleared
4. **Verify:** accumulatedRecordsState reset to empty

---

### E2E Test Cases

**File:** `tests/e2e/query-simple/accumulated-format-preservation.spec.ts` (NEW FILE)

```typescript
import { test, expect } from '@playwright/test'
import * as helpers from '../fixtures/test-helpers'

test.describe('Accumulated Results Format Preservation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/')
    await helpers.openWidget(page, 'Query Simple')
  })

  test('should preserve display format when accumulating from different queries', async ({ page }) => {
    const WIDGET_ID = 'widget_63'
    
    // Run Query A (Address Points - Simple List)
    await helpers.selectQuery(page, WIDGET_ID, 'Full address')
    await helpers.enterQueryValue(page, WIDGET_ID, '201 S Jackson')
    await helpers.clickApplyQuery(page, WIDGET_ID)
    await helpers.waitForResults(page, WIDGET_ID)
    
    // Verify Query A format (Simple List with specific fields)
    const queryAResults = await page.locator('.result-set-group').first()
    await expect(queryAResults.locator('.query-name')).toContainText('Full address')
    await expect(queryAResults.locator('.record-count')).toContainText('5 items')
    
    // Switch to ADD mode
    await helpers.setResultsMode(page, WIDGET_ID, 'ADD_TO_SELECTION')
    
    // Switch to Query B (Parcel Number - different format)
    await helpers.selectQuery(page, WIDGET_ID, 'Parcel Number')
    await helpers.enterQueryValue(page, WIDGET_ID, '2223059013')
    await helpers.clickApplyQuery(page, WIDGET_ID)
    await helpers.waitForResults(page, WIDGET_ID)
    
    // Verify both sets exist and are separate
    const allSets = await page.locator('.result-set-group')
    await expect(allSets).toHaveCount(2)
    
    // Verify Query A still shows original format
    const queryASet = allSets.first()
    await expect(queryASet.locator('.query-name')).toContainText('Full address')
    await expect(queryASet.locator('.record-count')).toContainText('5 items')
    
    // Verify Query B shows its format
    const queryBSet = allSets.last()
    await expect(queryBSet.locator('.query-name')).toContainText('Parcel Number')
    await expect(queryBSet.locator('.record-count')).toContainText('1 item')
  })

  test('should handle collapse/expand of record sets', async ({ page }) => {
    const WIDGET_ID = 'widget_63'
    
    // Accumulate two query sets
    await helpers.selectQuery(page, WIDGET_ID, 'Full address')
    await helpers.enterQueryValue(page, WIDGET_ID, '201 S Jackson')
    await helpers.clickApplyQuery(page, WIDGET_ID)
    await helpers.setResultsMode(page, WIDGET_ID, 'ADD_TO_SELECTION')
    
    await helpers.selectQuery(page, WIDGET_ID, 'Parcel Number')
    await helpers.enterQueryValue(page, WIDGET_ID, '2223059013')
    await helpers.clickApplyQuery(page, WIDGET_ID)
    
    // Collapse first set
    const firstSetHeader = await page.locator('.result-set-header').first()
    await firstSetHeader.click()
    
    // Verify first set is collapsed
    const firstSetContent = await page.locator('.result-set-group').first().locator('.result-set-content')
    await expect(firstSetContent).not.toBeVisible()
    
    // Verify second set is still expanded
    const secondSetContent = await page.locator('.result-set-group').last().locator('.result-set-content')
    await expect(secondSetContent).toBeVisible()
    
    // Expand first set again
    await firstSetHeader.click()
    await expect(firstSetContent).toBeVisible()
  })

  test('should remove empty sets when all records are removed', async ({ page }) => {
    const WIDGET_ID = 'widget_63'
    
    // Accumulate Query A with 2 results
    await helpers.selectQuery(page, WIDGET_ID, 'Street name')
    await helpers.enterQueryValue(page, WIDGET_ID, 'Jackson')
    await helpers.clickApplyQuery(page, WIDGET_ID)
    await helpers.setResultsMode(page, WIDGET_ID, 'ADD_TO_SELECTION')
    
    // Verify set exists
    await expect(page.locator('.result-set-group')).toHaveCount(1)
    
    // Remove all records from set (click X on each)
    const removeButtons = await page.locator('.result-set-group .remove-button')
    const count = await removeButtons.count()
    for (let i = 0; i < count; i++) {
      await removeButtons.first().click()  // Always click first since list updates
      await page.waitForTimeout(100)
    }
    
    // Verify set is removed when empty
    await expect(page.locator('.result-set-group')).toHaveCount(0)
  })

  test('should not add duplicate records across sets', async ({ page }) => {
    const WIDGET_ID = 'widget_63'
    
    // Run Query A
    await helpers.selectQuery(page, WIDGET_ID, 'Full address')
    await helpers.enterQueryValue(page, WIDGET_ID, '201 S Jackson')
    await helpers.clickApplyQuery(page, WIDGET_ID)
    await helpers.setResultsMode(page, WIDGET_ID, 'ADD_TO_SELECTION')
    
    // Get initial count
    const initialCount = await page.locator('.result-set-group').first().locator('.record-count').textContent()
    
    // Run same Query A again
    await helpers.clickApplyQuery(page, WIDGET_ID)
    await page.waitForTimeout(500)
    
    // Verify count didn't change (no duplicates added)
    const finalCount = await page.locator('.result-set-group').first().locator('.record-count').textContent()
    expect(initialCount).toBe(finalCount)
    
    // Verify still only one set (didn't create duplicate set)
    await expect(page.locator('.result-set-group')).toHaveCount(1)
  })
})
```

---

## Rollback Plan

### If Issues Found During Development

**Option 1: Revert Commit**
```bash
git log --oneline  # Find commit hash
git revert <commit-hash>
git push origin <branch-name>
```

**Option 2: Reset Branch (if not shared)**
```bash
git reset --hard <previous-commit-hash>
git push --force origin <branch-name>
```

### If Issues Found After Merge

**Option 1: Revert Merge Commit**
```bash
git revert -m 1 <merge-commit-hash>
git push origin main
```

**Option 2: Hot Fix**
- Cherry-pick specific fixes from main
- Deploy hot fix
- Continue work on separate branch

---

## Success Criteria

### Functional Requirements
- [ ] Accumulated results maintain original query's display format
- [ ] Each record set shows query name and record count
- [ ] Sets can be collapsed/expanded independently
- [ ] Duplicate records are not added (within or across sets)
- [ ] Empty sets are removed automatically
- [ ] Clear all results clears all sets
- [ ] Switch to NEW mode clears accumulated sets
- [ ] REMOVE mode removes entire matching sets
- [ ] X button removes individual records from sets

### Technical Requirements
- [ ] No TypeScript errors
- [ ] No linter warnings
- [ ] All existing E2E tests pass
- [ ] New E2E tests pass
- [ ] No console errors during testing
- [ ] Performance: No noticeable slowdown with 10+ sets

### User Experience Requirements
- [ ] Visual grouping is clear and intuitive
- [ ] Query names are displayed properly
- [ ] Record counts are accurate
- [ ] Collapse/expand is smooth
- [ ] No visual glitches when switching queries
- [ ] Format differences are clearly visible

---

## Files Summary

### New Files to Create
1. `query-simple/src/runtime/types/accumulated-records.ts` - Type definitions
2. `tests/e2e/query-simple/accumulated-format-preservation.spec.ts` - E2E tests
3. `docs/features/ACCUMULATED_RESULTS_GROUPING.md` - User documentation

### Files to Modify
1. `query-simple/src/runtime/query-task.tsx` - State management
2. `query-simple/src/runtime/query-result.tsx` - Rendering logic
3. `query-simple/src/runtime/results-management-utils.ts` - Merge/remove logic
4. `query-simple/src/version.ts` - Version bump
5. `CHANGELOG.md` - Release notes
6. `TODO.md` - Mark as complete
7. `docs/bugs/ACCUMULATED_RESULTS_FORMAT_SWITCH.md` - Mark as resolved

---

## Branch Strategy

### Recommended Approach

```bash
# Start from latest feature/chunk-rock
git checkout feature/chunk-rock
git pull origin feature/chunk-rock

# Create new feature branch
git checkout -b feature/bug-add-mode-001
```

**Commit Strategy:**
1. Commit: "feat: Add AccumulatedRecordsState types and utilities"
2. Commit: "refactor: Update query-task state to use record sets"
3. Commit: "refactor: Update merge/remove logic for record sets"
4. Commit: "feat: Add ResultSetGroup component with collapse/expand"
5. Commit: "refactor: Update rendering to use grouped sets"
6. Commit: "fix: Remove BUG-ADD-MODE-001 logging (issue resolved)"
7. Commit: "test: Add E2E tests for format preservation"
8. Commit: "docs: Update documentation and mark bug as resolved"

**Merge Strategy:**
```bash
# After testing complete
git checkout feature/chunk-rock
git merge feature/bug-add-mode-001
git push origin feature/chunk-rock

# Delete feature branch
git branch -d feature/bug-add-mode-001
git push origin --delete feature/bug-add-mode-001
```

---

## Notes & Considerations

### Performance
- **Concern:** Rendering multiple QueryTaskResult components
- **Mitigation:** Each set is independent, so React can optimize
- **Worst case:** 10 query sets with 50 records each = 500 records
- **Expected:** Most users will have 2-3 sets max

### Edge Cases
1. **Same query, different values**: Creates separate sets (by timestamp)
2. **Empty query results**: Don't create a set
3. **All records removed**: Set is deleted
4. **Query config changes**: Use config from when set was created

### Future Enhancements
1. **Drag to reorder sets**: Allow users to reorder accumulated sets
2. **Set naming**: Allow users to rename sets
3. **Export sets separately**: Export each set to its own file
4. **Merge sets**: Combine multiple sets from same query
5. **Set metadata**: Show timestamp, spatial extent, etc.

---

## Questions to Resolve Before Implementation

1. **Should collapsed state persist across query switches?**
   - Recommendation: Reset all to expanded on query execution

2. **Should we show timestamp on each set?**
   - Recommendation: Add as optional tooltip (not default)

3. **Should empty sets show a placeholder?**
   - Recommendation: Remove empty sets immediately

4. **How to handle very long query names?**
   - Recommendation: Truncate with tooltip on hover

5. **Should sets be sortable by user?**
   - Recommendation: Not in initial implementation (FUTURE)

---

## Estimated Timeline

### Day 1 (8 hours)
- Morning: Create types, update state management (Steps 1-2)
- Afternoon: Update merge logic, query execution (Steps 3-4)

### Day 2 (8 hours)
- Morning: Update rendering, create ResultSetGroup (Step 5)
- Afternoon: Testing, bug fixes, E2E tests (manual + automated)

### Buffer (2-4 hours)
- Edge case handling
- Performance optimization
- Documentation updates

**Total: 1-2 days** (depending on complexity encountered)

---

## Success Metrics

**Before Fix:**
- Bug warning appears in console on query switch
- All accumulated results change format
- User confusion reported

**After Fix:**
- No bug warning (removed)
- Each set maintains original format
- Visual grouping makes it clear which query produced which results
- E2E tests verify behavior
- Zero regression in existing functionality

---

**Ready to implement when needed!** 🚀

This plan provides everything needed to successfully fix BUG-ADD-MODE-001 with confidence.
