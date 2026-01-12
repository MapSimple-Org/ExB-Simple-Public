# Bug: Accumulated Results Change Format When Switching Queries

**Bug ID:** `ACCUMULATED_RESULTS_FORMAT_SWITCH`  
**Discovered:** 2026-01-12 (Demo Site Testing)  
**Status:** 🐛 **CONFIRMED** - Not Fixed  
**Priority:** High (Affects ADD mode user experience)  
**Affects Versions:** r019.30 and earlier  
**Reporter:** User (Demo Site Testing)

---

## Problem Description

When accumulating results from multiple queries (ADD_TO_SELECTION mode), switching to a different query causes **all existing results to change their display format** to match the newly selected query's configuration.

---

## Steps to Reproduce

1. **Setup:**
   - Create Query A with display configuration (e.g., Simple List, fields: Name, Address)
   - Create Query B with different display configuration (e.g., Table, fields: ID, Type, Status)

2. **Execute:**
   - Run Query A → Get 5 results displayed in Simple List format
   - Switch Results Mode to "Add to selection"
   - Switch to Query B (via dropdown)

3. **Observe Bug:**
   - The 5 existing results from Query A now display in Query B's format (Table, showing ID/Type/Status fields)
   - Expected: Query A results should stay in Simple List format with Name/Address fields

4. **Further Impact:**
   - Run Query B → Get 3 new results
   - All 8 results (5 from A + 3 from B) now display in Query B's format
   - Query A's original format is lost

---

## Expected Behavior

In ADD mode, each set of accumulated results should maintain the display configuration from the query that produced them:

```
Results Tab (ADD mode):
┌─────────────────────────────────────────┐
│ Query A Results (5 items) - Simple List│
│ ├─ Item 1 (Name, Address)              │
│ ├─ Item 2 (Name, Address)              │
│ └─ ...                                  │
│                                         │
│ Query B Results (3 items) - Table      │
│ ├─ ID  | Type    | Status              │
│ ├─ 101 | Parcel  | Active              │
│ └─ ...                                  │
└─────────────────────────────────────────┘
```

---

## Actual Behavior

All results adopt the currently selected query's configuration:

```
Results Tab (ADD mode - after switching to Query B):
┌─────────────────────────────────────────┐
│ All Results (8 items) - Table          │
│ ├─ ID  | Type    | Status              │
│ ├─ ??? | ???     | ???   (Query A data)│
│ ├─ ??? | ???     | ???   (Query A data)│
│ ├─ 101 | Parcel  | Active (Query B)    │
│ └─ ...                                  │
└─────────────────────────────────────────┘
```

Query A results may show missing/incorrect data because they're being rendered with Query B's field configuration.

---

## Root Cause (Hypothesis)

The results display component likely uses the **currently selected query's configuration** to render ALL accumulated records, rather than storing and using the **original query configuration** for each record set.

**Likely Location:** `query-result.tsx` or `query-task.tsx`

**Current Logic (Suspected):**
```typescript
// Pseudo-code
function renderResults(accumulatedRecords, currentQueryConfig) {
  // BUG: Uses currentQueryConfig for ALL records
  return accumulatedRecords.map(record => 
    <ResultItem record={record} config={currentQueryConfig} />
  )
}
```

**Should Be:**
```typescript
// Pseudo-code
function renderResults(accumulatedRecordsWithMetadata) {
  // Each record set remembers its original query config
  return accumulatedRecordsWithMetadata.map(recordSet => 
    <ResultGroup 
      records={recordSet.records} 
      config={recordSet.originalQueryConfig}  // Use original!
      queryName={recordSet.queryName}
    />
  )
}
```

---

## Technical Details

**Accumulated Records Structure (Current):**
```typescript
// In AccumulatedRecordsManager or similar
{
  records: FeatureDataRecord[],  // Just the records
  recordIds: string[]
}
```

**Accumulated Records Structure (Needed):**
```typescript
{
  recordSets: [
    {
      queryItemConfigId: '8390785603784936',
      queryName: 'Full address',
      queryConfig: ImmutableObject<QueryItemType>,  // Store original config!
      records: FeatureDataRecord[],
      recordIds: string[],
      timestamp: Date
    },
    {
      queryItemConfigId: '06367134367377913',
      queryName: 'Parcel Number',
      queryConfig: ImmutableObject<QueryItemType>,  // Different config
      records: FeatureDataRecord[],
      recordIds: string[],
      timestamp: Date
    }
  ]
}
```

---

## Impact

**Severity:** High

**User Experience Issues:**
1. ❌ Confusing - Results change format unexpectedly
2. ❌ Data Loss - Fields from Query A may not exist in Query B's schema
3. ❌ Misleading - Users see wrong field names/values for old results
4. ❌ Unusable - Cannot meaningfully compare results from different queries

**Workaround:**
- Stay in NEW_SELECTION mode (don't use ADD mode)
- Only accumulate results from the same query
- These are not real solutions for multi-query workflows

---

## Related Code Locations

**Files to Investigate:**
1. `query-simple/src/runtime/query-result.tsx` - How results are rendered
2. `query-simple/src/runtime/query-task.tsx` - How accumulated records are managed
3. `query-simple/src/runtime/managers/AccumulatedRecordsManager.ts` - Record storage structure
4. `query-simple/src/runtime/results-management-utils.ts` - Record merging logic

**Relevant State:**
- `accumulatedRecords` in QueryTask state
- `selectedQueryItem` (currently selected query config)
- Results mode (`NEW_SELECTION` vs `ADD_TO_SELECTION`)

---

## Proposed Solution

### Phase 1: Store Original Query Config with Records

**In `AccumulatedRecordsManager` or equivalent:**
```typescript
interface AccumulatedRecordSet {
  queryItemConfigId: string
  queryName: string
  queryConfig: ImmutableObject<QueryItemType>  // NEW: Store config
  records: FeatureDataRecord[]
  recordIds: string[]
  addedTimestamp: number
}

interface AccumulatedRecordsState {
  recordSets: AccumulatedRecordSet[]  // NEW: Array of sets
  totalCount: number
  allRecordIds: string[]  // Flat list for quick lookup
}
```

**When Adding Records:**
```typescript
// In handleFormSubmitInternal or similar
accumulatedRecordsManager.addRecordSet({
  queryItemConfigId: queryItem.configId,
  queryName: queryItem.name,
  queryConfig: queryItem,  // Store the FULL config
  records: result.records,
  recordIds: result.records.map(r => r.getId()),
  addedTimestamp: Date.now()
})
```

### Phase 2: Render Each Set with Original Config

**In Results Display Component:**
```typescript
// query-result.tsx or similar
{accumulatedRecords.recordSets.map((recordSet, index) => (
  <ResultSetGroup key={recordSet.queryItemConfigId + index}>
    <ResultSetHeader>
      {recordSet.queryName} ({recordSet.records.length} items)
    </ResultSetHeader>
    
    <QueryTaskResult
      records={recordSet.records}
      queryItem={recordSet.queryConfig}  // Use original config!
      // ... other props
    />
  </ResultSetGroup>
))}
```

### Phase 3: UI Enhancements (Optional)

- Group results by source query visually
- Show timestamp for each set
- Allow collapsing/expanding each query's results
- Show query name/description above each set

---

## Testing Strategy

### Manual Test Cases

**Test 1: Basic Format Preservation**
1. Query A (Simple List) → 5 results
2. Switch to ADD mode
3. Switch to Query B (Table view)
4. Verify Query A results still display in Simple List format
5. Run Query B → 3 results
6. Verify Query B results display in Table format
7. Verify Query A results STILL in Simple List format

**Test 2: Field Mismatch**
1. Query A has fields: ADDR_FULL, OBJECTID
2. Query B has fields: PARCEL_ID, OWNER_NAME
3. Accumulate results from both
4. Verify each set shows correct fields

**Test 3: Multiple Accumulations**
1. Run Query A → ADD mode → Run Query B → Run Query C
2. Verify each maintains its format
3. Switch to Query A, then Query B, then Query C
4. Verify format doesn't change when switching

### E2E Test Scenarios

```typescript
// tests/e2e/query-simple/accumulated-results-format.spec.ts

test('should preserve display format when accumulating results', async ({ page }) => {
  // Run Query A (Simple List)
  await helpers.enterQueryValue(page, 'WIDGET_ID', '201 S Jackson')
  await helpers.clickApplyQuery(page, 'WIDGET_ID')
  
  // Verify Simple List format
  const resultItems = await page.locator('.result-item-simple-list')
  await expect(resultItems).toHaveCount(5)
  
  // Switch to ADD mode
  await helpers.setResultsMode(page, 'WIDGET_ID', 'ADD_TO_SELECTION')
  
  // Switch to Query B (Table format)
  await helpers.selectQuery(page, 'WIDGET_ID', 'Parcel Number')
  
  // Verify Query A results STILL in Simple List format
  await expect(resultItems.first()).toBeVisible()
  
  // Run Query B
  await helpers.enterQueryValue(page, 'WIDGET_ID', '2223059013')
  await helpers.clickApplyQuery(page, 'WIDGET_ID')
  
  // Verify mixed formats
  const simpleListItems = await page.locator('.result-item-simple-list')
  const tableItems = await page.locator('.result-item-table')
  await expect(simpleListItems).toHaveCount(5)  // Query A
  await expect(tableItems).toHaveCount(1)  // Query B
})
```

---

## Related Issues

- **Selection Restoration:** May need to track which query each record came from
- **Results Mode Toggle:** Clearing accumulated records when switching to NEW mode
- **Data Actions:** Should data actions (zoom, export) work on entire accumulated set or per-query-set?

---

## Documentation Updates Needed

- Update `docs/features/RESULTS_MODE_GUIDE.md` with expected ADD mode behavior
- Add section in `docs/development/DEVELOPMENT_GUIDE.md` about accumulated records architecture
- Update `CHANGELOG.md` when fixed

---

## Estimated Effort

**Complexity:** Medium  
**Estimated Time:** 1-2 days  
**Risk:** Medium (affects core results display logic)

**Breakdown:**
- 4 hours: Update AccumulatedRecordsManager structure
- 4 hours: Modify results display to use per-set configs
- 2 hours: Add UI grouping/headers
- 2 hours: Manual testing
- 2 hours: E2E test creation
- 2 hours: Documentation updates

---

## References

- **Discovery:** Demo Site Testing (2026-01-12)
- **Related Files:** 
  - `query-result.tsx`
  - `query-task.tsx`
  - `AccumulatedRecordsManager.ts`
  - `results-management-utils.ts`
- **Related TODO:** Section 1 (Hook & Shell Migration) - Complete before major refactor

---

## Notes

This bug becomes more critical as users create more complex multi-query workflows. The current behavior makes ADD mode nearly unusable for queries with different configurations.

**Priority Recommendation:** Fix before team deployment if possible, or clearly document the limitation in user-facing documentation.
