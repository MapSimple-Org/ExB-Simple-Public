# R018 Chunks 1 & 2 Implementation Documentation

**Version:** r018.19  
**Date Preserved:** December 23, 2025  
**Status:** Rolled back due to selection bug - records not selecting in data source when using graphics layer

---

## Overview

This directory preserves the Chunk 1 (URL Parameter Consumption) and Chunk 2 (Widget Visibility Engine) implementations from r018.x. These were rolled back because they introduced a bug where records weren't being selected in the data source when using graphics layer highlighting.

---

## Files Preserved

- `use-url-consumption.ts` - UrlConsumptionManager class (Chunk 1)
- `use-widget-visibility.ts` - WidgetVisibilityManager class (Chunk 2)

---

## What Was Implemented

### Chunk 1: URL Parameter Consumption (`UrlConsumptionManager`)

**Purpose:** Centralized URL parameter detection and consumption for deep linking.

**Key Features:**
- Detects hash fragments (`#shortId=value`) and query strings (`?shortId=value`)
- Hash fragments take priority over query strings
- Atomic consumption prevents infinite loops
- Mode reset when hash parameters detected (prevents bugs with accumulation modes)
- Hash consumption when switching to accumulation modes

**Integration Points in `widget.tsx`:**
- **Class Property:** `private urlConsumptionManager = new UrlConsumptionManager()`
- **componentDidMount:** Calls `this.urlConsumptionManager.setup(...)`
- **componentWillUnmount:** Calls `this.urlConsumptionManager.cleanup()`
- **componentDidUpdate:** Calls `this.urlConsumptionManager.checkUrlParameters(...)` when query items change
- **handleHashParameterUsed:** Calls `this.urlConsumptionManager.removeHashParameter(...)`

### Chunk 2: Widget Visibility Engine (`WidgetVisibilityManager`)

**Purpose:** DOM-level visibility detection using IntersectionObserver for panel open/close detection.

**Key Features:**
- Uses IntersectionObserver for efficient visibility tracking
- Falls back to periodic checking if IntersectionObserver unavailable
- Notifies HelperSimple of widget state changes via custom events
- Triggers selection restore/clear when panel opens/closes

**Integration Points in `widget.tsx`:**
- **Class Property:** `private visibilityManager = new WidgetVisibilityManager()`
- **componentDidMount:** Calls `this.visibilityManager.setup(...)` with callbacks
- **componentWillUnmount:** Calls `this.visibilityManager.cleanup()` and `notifyUnmount()`
- **logVisibilityChange:** Method that handles restore/clear logic when visibility changes

---

## Integration Code Snippets

### widget.tsx - Imports

```typescript
import { UrlConsumptionManager } from './hooks/use-url-consumption'
import { WidgetVisibilityManager } from './hooks/use-widget-visibility'
```

### widget.tsx - Class Properties

```typescript
// Chunk 1 & 2: Managers for URL consumption and visibility
private urlConsumptionManager = new UrlConsumptionManager()
private visibilityManager = new WidgetVisibilityManager()
```

### widget.tsx - componentDidMount

```typescript
componentDidMount() {
  // Chunk 1: Set up URL parameter consumption
  this.urlConsumptionManager.setup(
    this.props,
    this.state.resultsMode,
    {
      onInitialValueFound: (value) => {
        const needsModeReset = this.state.resultsMode !== SelectionType.NewSelection
        this.setState({ 
          initialQueryValue: value,
          ...(needsModeReset ? { 
            resultsMode: SelectionType.NewSelection,
            accumulatedRecords: []
          } : {})
        })
      },
      onModeResetNeeded: () => {
        this.setState({ 
          resultsMode: SelectionType.NewSelection,
          accumulatedRecords: []
        })
      }
    }
  )
  
  // Chunk 2: Set up visibility detection (wait for ref to be set)
  setTimeout(() => {
    if (this.widgetRef.current) {
      this.visibilityManager.setup(
        this.widgetRef.current,
        this.props,
        {
          onVisibilityChange: (isVisible) => {
            this.setState(
              (prevState) => {
                if (prevState.isPanelVisible === isVisible) {
                  return null
                }
                return { isPanelVisible: isVisible }
              },
              () => {
                this.logVisibilityChange(isVisible, 'visibility-manager')
              }
            )
          }
        },
        (isVisible) => {
          // Compatibility callback
        }
      )
    }
  }, 100)
  
  // Notify HelperSimple on mount
  this.visibilityManager.notifyMount(this.props.id)
  
  // ... rest of componentDidMount
}
```

### widget.tsx - componentWillUnmount

```typescript
componentWillUnmount() {
  // Chunk 1: Clean up URL consumption
  this.urlConsumptionManager.cleanup()
  
  // Chunk 2: Clean up visibility detection
  this.visibilityManager.cleanup()
  this.visibilityManager.notifyUnmount(this.props.id)
  
  // ... rest of componentWillUnmount
}
```

### widget.tsx - componentDidUpdate

```typescript
componentDidUpdate(prevProps: AllWidgetProps<IMConfig>) {
  // Chunk 1: Re-check URL parameters when query items change
  if (prevProps.config.queryItems !== this.props.config.queryItems) {
    this.urlConsumptionManager.checkUrlParameters(
      this.props,
      this.state.resultsMode,
      {
        onInitialValueFound: (value) => {
          const needsModeReset = this.state.resultsMode !== SelectionType.NewSelection
          this.setState({ 
            initialQueryValue: value,
            ...(needsModeReset ? { 
              resultsMode: SelectionType.NewSelection,
              accumulatedRecords: []
            } : {})
          })
        },
        onModeResetNeeded: () => {
          this.setState({ 
            resultsMode: SelectionType.NewSelection,
            accumulatedRecords: []
          })
        }
      }
    )
  }
  
  // ... rest of componentDidUpdate
}
```

### widget.tsx - handleHashParameterUsed

```typescript
handleHashParameterUsed = (shortId: string) => {
  this.urlConsumptionManager.removeHashParameter(shortId, this.props.id)
}
```

### widget.tsx - logVisibilityChange (Chunk 2 Integration)

```typescript
logVisibilityChange = (isVisible: boolean, method: string) => {
  // Logs visibility change and handles restore/clear logic
  // Called from visibilityManager.onVisibilityChange callback
  if (isVisible) {
    // Restore selection when panel opens
    // ... restore logic
  } else {
    // Clear selection when panel closes
    // ... clear logic
  }
}
```

---

## Bugs Encountered

### Critical Bug: Selection Not Working with Graphics Layer

**Symptom:** Records populate in results, graphics layer highlights work, but records are NOT selected in the data source. "Add to Map" action also doesn't select records.

**Root Cause:** 
When `useGraphicsLayer` is true, the code filters records by origin data source using `r.getDataSource()`. However, records from `outputDS` don't have `getDataSource()` attached (returns `null`), so filtering returns empty arrays. The code then calls `selectRecordsByIds([], [])` which clears selection instead of selecting.

**Evidence from Logs:**
```
"selectRecordsInDataSources-filtering-failed-sample",
"sampleRecordId": "451243",
"sampleDSId": "null",
"sampleOriginId": "null",
"targetOriginDSId": "dataSource_1-19ae1ed5667-layer-2-2",
"matches": false

"selectRecordsInDataSources-selectRecordsByIds-called",
"idsCount": 0,
"recordsCount": 0
```

**Location:** `query-simple/src/runtime/selection-utils.ts` lines 137-148

**Fix Required:** When filtering fails (returns empty), fall back to using all `recordIds` instead of calling with empty arrays. The records come from `outputDS` which has the origin DS, so they can be trusted to belong to that origin DS.

---

## Why This Didn't Happen Before Chunks 1 & 2

**Hypothesis:** Before Chunks 1 & 2, the selection logic may have been different:
1. Records might have had their data sources attached differently
2. The filtering logic might not have been used when graphics layer was enabled
3. Selection might have been handled differently before the architectural refactor

**Investigation Needed:** Compare the selection logic in r017.48 (before Chunks) with r018.x (after Chunks) to understand what changed.

---

## How to Re-Implement

### Step 1: Copy Files Back

```bash
cp preserved/r018-chunks/use-url-consumption.ts query-simple/src/runtime/hooks/
cp preserved/r018-chunks/use-widget-visibility.ts query-simple/src/runtime/hooks/
```

### Step 2: Add Imports to widget.tsx

```typescript
import { UrlConsumptionManager } from './hooks/use-url-consumption'
import { WidgetVisibilityManager } from './hooks/use-widget-visibility'
```

### Step 3: Add Class Properties

```typescript
private urlConsumptionManager = new UrlConsumptionManager()
private visibilityManager = new WidgetVisibilityManager()
```

### Step 4: Integrate into Lifecycle Methods

See "Integration Code Snippets" section above for exact code.

### Step 5: Fix Selection Bug FIRST

**CRITICAL:** Before re-implementing, fix the selection bug in `selection-utils.ts`:

```typescript
// In selectRecordsInDataSources, when useGraphicsLayer is true:
const recordsForThisDS = records.filter(r => {
  const ds = r.getDataSource?.()
  const origin = ds?.getOriginDataSources()?.[0] || ds
  return origin?.id === originDS.id
})
const idsForThisDS = recordsForThisDS.map(r => r.getId())

// FIX: Fall back to all recordIds if filtering fails
const finalIds = idsForThisDS.length > 0 ? idsForThisDS : recordIds
const finalRecords = recordsForThisDS.length > 0 ? recordsForThisDS : records

originDS.selectRecordsByIds(finalIds, finalRecords)
```

### Step 6: Test Thoroughly

1. Test URL parameter detection (hash and query string)
2. Test visibility detection (panel open/close)
3. Test selection with graphics layer enabled
4. Test selection with graphics layer disabled
5. Test "Add to Map" action
6. Test selection restore on panel open
7. Test selection clear on panel close

---

## Known Issues

1. **Selection Bug:** Records not selecting when graphics layer enabled (see "Bugs Encountered" above)
2. **resultSelectMode useEffect:** May fire when graphicsLayer initializes, causing unwanted selection clears (needs ref-based change detection)

---

## Debug Switches

Use these debug switches to test Chunks 1 & 2:

```
?debug=HASH,WIDGET-STATE,RESTORE,SELECTION
```

- **HASH:** URL parameter detection and consumption
- **WIDGET-STATE:** Panel visibility changes
- **RESTORE:** Selection restore/clear logic
- **SELECTION:** Selection function calls and filtering

---

## Lessons Learned

1. **Test Selection First:** When refactoring selection logic, test selection BEFORE adding new features
2. **Records May Not Have Data Sources:** Records from `outputDS` may not have `getDataSource()` attached - always provide fallback logic
3. **useEffect Dependencies:** Be careful with dependency arrays - graphics layer initialization can trigger unwanted effects
4. **Incremental Testing:** Test each chunk independently before combining

---

## Future Considerations

1. **Fix Selection Bug:** Implement fallback logic in `selectRecordsInDataSources` before re-implementing
2. **Ref-Based Change Detection:** Use refs to track actual changes in `useEffect` dependencies
3. **Record Data Source Attachment:** Investigate why records don't have data sources attached and fix at source if possible
4. **Comprehensive Testing:** Create test suite specifically for selection with graphics layer enabled

---

**End of Documentation**




