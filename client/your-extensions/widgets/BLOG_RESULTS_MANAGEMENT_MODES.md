# Building Results Management Modes: Adding and Removing Records Across Multiple Data Sources

**Status:** ✅ Complete  
**Date:** December 2025  
**Widget:** QuerySimple for ArcGIS Experience Builder

## The Challenge

Users wanted to build up a collection of features from multiple searches. For example:
- Search for a parcel by PIN number
- Search for another parcel by PIN number  
- Search for parcels by Major number
- Then export or perform actions on the combined set

The challenge: How do you accumulate query results from potentially different origin data sources, maintain selection on the map, and ensure data actions work correctly?

## The Solution: Results Management Modes

We implemented three modes for managing query results:

1. **New Selection** (default): Clears previous results and starts fresh
2. **Add to Current Selection**: Merges new query results with existing accumulated results
3. **Remove from Current Selection**: Removes matching records from accumulated results

### Key Design Decisions

#### 1. Composite Key for Deduplication

**Problem:** ObjectID is only unique within a layer, not globally. Different layers can have the same ObjectID.

**Solution:** Use composite key: `${originDSId}_${objectId}`

```typescript
export function getRecordKey(
  record: FeatureDataRecord,
  outputDS: FeatureLayerDataSource
): string {
  const originDS = outputDS.getOriginDataSources()?.[0] as FeatureLayerDataSource
  const originDSId = originDS?.id || outputDS.id
  const objectId = record.getId()
  return `${originDSId}_${objectId}`
}
```

This ensures records from different layers are treated as unique even if they share ObjectIDs.

**Example:**
- `layer01` with `objectId=123` → key: `"layer01_123"`
- `layer02` with `objectId=123` → key: `"layer02_123"`
- These are correctly treated as different records

#### 2. Widget-Level State Management

Instead of trying to create a new data source at runtime (which isn't possible in Experience Builder), we manage accumulated records in widget-level state:

```typescript
state: {
  resultsMode?: SelectionType,
  accumulatedRecords?: FeatureDataRecord[]
}
```

**Why This Works:**
- No need to create new data sources at runtime
- Works with existing ExB patterns
- Simpler implementation
- Records are managed in memory/refs

**Trade-offs:**
- Accumulated records are stored in component state, not persisted in DS
- Need to handle record merging on each query execution
- Clear results clears accumulated records (expected behavior)

#### 3. Preserving Records Across Query Switches

When switching queries in "Add to" or "Remove from" mode, we preserve accumulated records:

```typescript
// In query-task.tsx - handleDataSourceCreated
if (resultsMode === SelectionType.AddToSelection || 
    resultsMode === SelectionType.RemoveFromSelection) {
  if (accumulatedRecords && accumulatedRecords.length > 0) {
    // Re-select accumulated records on map after query switch
    setTimeout(() => {
      selectRecordsAndPublish(widgetId, outputDS, recordIds, accumulatedRecords, true)
    }, 100)
  }
}
```

This ensures users can switch between different queries while maintaining their accumulated selection.

#### 4. Grouping Records by Origin Data Source for DataActionList

**Problem:** When accumulating records from multiple queries (potentially different origin data sources), `DataActionList` doesn't recognize the records and only shows custom actions.

**Root Cause:** 
- Records are selected in origin data sources (correct for map highlighting)
- But `DataActionList` receives single `DataRecordSet` with current `outputDS` as dataSource
- `DataActionList` validates records against dataSource and doesn't recognize mismatched records

**Solution:** Group records by their origin data source and create multiple `DataRecordSet`s:

```typescript
// Group accumulated records by origin data source
const recordsByOriginDS = new Map<FeatureLayerDataSource, FeatureDataRecord[]>()

accumulatedRecords.forEach(record => {
  const recordDS = record.getDataSource?.() as FeatureLayerDataSource
  const originDS = recordDS?.getOriginDataSources()?.[0] as FeatureLayerDataSource || recordDS
  
  if (originDS) {
    if (!recordsByOriginDS.has(originDS)) {
      recordsByOriginDS.set(originDS, [])
    }
    recordsByOriginDS.get(originDS)!.push(record)
  }
})

// Create DataRecordSet for each origin data source
const actionDataSets: DataRecordSet[] = []
recordsByOriginDS.forEach((records, originDS) => {
  actionDataSets.push({
    dataSource: originDS, // Use origin DS, not outputDS
    records: records,
    type: 'selected',
    name: originDS.getLabel()
  })
})

// Pass array to DataActionList
<DataActionList dataSets={actionDataSets} ... />
```

**Why This Works:**
- Records stay selected in their origin data sources (map highlighting works)
- Each `DataRecordSet` matches its records' origin data source
- `DataActionList` recognizes records and enables appropriate actions
- Works when records come from different origin data sources

#### 5. Selection Restoration for Accumulated Records

**Challenge:** When the widget closes and reopens, or when an identify popup closes, we need to restore accumulated records to the map.

**Solution:** Group records by origin data source and restore each group separately:

```typescript
// In widget.tsx - addSelectionToMap
if (isAccumulationMode && accumulatedRecords && accumulatedRecords.length > 0) {
  const recordsByOriginDS = new Map<FeatureLayerDataSource, FeatureDataRecord[]>()
  
  // Group records by origin data source
  accumulatedRecords.forEach(record => {
    // Find origin DS (try multiple methods)
    const recordDS = record.getDataSource?.() as FeatureLayerDataSource
    let originDS = recordDS?.getOriginDataSources()?.[0] as FeatureLayerDataSource || recordDS
    
    // If that failed, search all data sources for a record with matching ID
    if (!originDS) {
      const dsMap = DataSourceManager.getInstance().getDataSources()
      const allDataSources = Object.values(dsMap)
      
      for (const ds of allDataSources) {
        if (ds && typeof (ds as any).getAllLoadedRecords === 'function') {
          const allRecords = (ds as any).getAllLoadedRecords() || []
          const matchingRecord = allRecords.find((r: FeatureDataRecord) => 
            r.getId() === record.getId()
          )
          
          if (matchingRecord) {
            originDS = (ds as any).getOriginDataSources()?.[0] as FeatureLayerDataSource || ds as FeatureLayerDataSource
            break
          }
        }
      }
    }
    
    if (originDS) {
      if (!recordsByOriginDS.has(originDS)) {
        recordsByOriginDS.set(originDS, [])
      }
      recordsByOriginDS.get(originDS)!.push(record)
    }
  })
  
  // Restore selection for each origin data source
  recordsByOriginDS.forEach((records, originDS) => {
    const recordIds = records.map(r => r.getId())
    selectRecordsAndPublish(id, originDS, recordIds, records, true)
  })
}
```

**Key Insight:** When `record.getDataSource()` returns null (which can happen after query switches), we need to search through all data sources to find which one contains the record.

#### 6. Clearing Selection When Widget Closes

When the widget closes, we clear accumulated records from the map:

```typescript
// In widget.tsx - clearSelectionFromMap
if (accumulatedRecords && accumulatedRecords.length > 0) {
  // Group by origin DS and clear each one
  recordsByOriginDS.forEach((records, originDS) => {
    originDS.selectRecordsByIds([], [])
    MessageManager.getInstance().publishMessage(
      new DataRecordsSelectionChangeMessage(id, [], [originDS.id])
    )
  })
}
```

This ensures the map is clean when the widget is closed, but selection can be restored when the widget reopens.

#### 7. Hash Parameter Handling

When a hash parameter is detected (e.g., `#pin=2223059013`), we reset to "New" mode to avoid bugs:

```typescript
// In widget.tsx - checkQueryStringForShortIds
if (hash parameter detected) {
  const needsModeReset = this.state.resultsMode !== SelectionType.NewSelection
  
  this.setState({ 
    initialQueryValue: { shortId, value },
    ...(needsModeReset ? { 
      resultsMode: SelectionType.NewSelection,
      accumulatedRecords: []
    } : {})
  })
}
```

This ensures hash-triggered queries start fresh, preventing confusion.

## What Didn't Work

### Attempt 1: Create Accumulated Results Data Source at Runtime

**Problem:** Tried to create a new data source (`widget_XX_accumulated_results`) at runtime using `DataSourceManager.createDataSourceByDataSourceJson()`.

**Error:** `dsManager.createDataSourceByDataSourceJson is not a function`

**Root Cause:** Output data sources are created in the **setting phase** and added to app config. At runtime, we can only:
- Get existing data sources via `getDataSource()`
- Use `createDataSourceByUseDataSource()` (but this creates origin DS, not output DS)
- Cannot create new output data sources programmatically at runtime

**Lesson Learned:** Experience Builder's data source architecture separates configuration-time (setting) from runtime. Output data sources must be defined in app config.

### Attempt 2: Load Accumulated Records into OutputDS When Switching Queries

**Problem:** When switching queries in "Add to" mode, accumulated records are selected on the map but `DataActionList` doesn't recognize them. Tried to load accumulated records into the new outputDS.

**Why This Won't Work:**
- Would require querying the server to load records (slow)
- Doesn't work when records come from different origin data sources
- Creates inconsistency: records scattered across multiple outputDS instances
- Each query switch would accumulate more records in different outputDS instances, making it messy

**Lesson Learned:** Can't load records directly into outputDS without querying. Need a different approach.

### Attempt 3: Use OutputDS in actionDataSet with Accumulated Records

**Problem:** `DataActionList` receives `actionDataSet` with `outputDS` as dataSource but records from different origin data sources. DataActionList doesn't recognize records that don't match the dataSource's origin.

**Why This Doesn't Work:**
- DataActionList validates records against the dataSource
- Accumulated records may come from different origin data sources than current outputDS
- Records are selected in origin data sources, not loaded in outputDS
- DataActionList needs records to match the dataSource's origin

**Solution:** Group by origin data source (see above)

## Code Organization: DRY Principle

All shared logic is extracted into reusable utility functions:

**`results-management-utils.ts`:**
- `getRecordKey()` - Composite key generation
- `mergeResultsIntoAccumulated()` - Merge with deduplication
- `removeResultsFromAccumulated()` - Remove matching records
- `removeRecordsFromOriginSelections()` - Clear records from map
- `clearAccumulatedResults()` - Clear accumulated records

**Pattern:**
- `handleFormSubmit` orchestrates - calls utilities based on mode
- All query execution logic extracted to utilities
- No duplication between "New", "Add", "Remove" modes

## Key Takeaways

1. **Composite Keys Matter:** When dealing with multiple data sources, objectId alone isn't unique. Use `${originDSId}_${objectId}` for deduplication.

2. **Work With Framework Patterns:** Don't try to create output data sources at runtime. Use widget-level state instead.

3. **Group by Origin:** When records come from different origin data sources, group them for proper handling by framework components like `DataActionList`.

4. **Search for Origin DS:** When `record.getDataSource()` returns null, search through all data sources to find the origin.

5. **Preserve State Across Query Switches:** Users expect accumulated records to persist when switching queries in accumulation modes.

6. **Clear on Close, Restore on Open:** Clean UX means clearing selection when widget closes, but restoring it when widget reopens.

7. **Hash Parameters Reset Mode:** When hash parameters trigger queries, reset to "New" mode to avoid confusion.

## Related Files

- `query-simple/src/runtime/results-management-utils.ts` - Utility functions
- `query-simple/src/runtime/widget.tsx` - Widget-level state and selection restoration
- `query-simple/src/runtime/query-task.tsx` - Query execution and mode handling
- `query-simple/src/runtime/query-result.tsx` - Results display and DataActionList grouping
- `CURRENT_WORK.md` - Implementation documentation

## Future Enhancements

- Consider persisting accumulated records across page reloads (localStorage?)
- Add visual indicator showing how many records are accumulated
- Consider export functionality specifically for accumulated results
- Add "Clear accumulated results" button separate from "Clear results"

---

*This blog post documents the implementation of Results Management Modes in QuerySimple widget for ArcGIS Experience Builder Developer Edition 1.19.*

