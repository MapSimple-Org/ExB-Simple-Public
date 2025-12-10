# Selection Restoration Feature

## Overview

The HelperSimple widget can automatically restore QuerySimple widget selections when the map identify tool clears them. This feature maintains query context for users, preventing the need to re-query after using identify.

## How It Works

1. **Selection Tracking**: QuerySimple dispatches custom events (`querysimple-selection-changed`) when selections are made or cleared
2. **Identify Detection**: HelperSimple uses a `MutationObserver` to detect when the identify popup opens/closes
3. **Restoration Trigger**: When the identify popup closes and selection was cleared (0 records), HelperSimple restores the previously tracked selection
4. **Data Source Access**: HelperSimple accesses the output data source to restore records by ID

## Configuration

Enable/disable this feature in HelperSimple widget settings:

- **Maintain selected set when identify occurs**: Toggle to enable/disable restoration (default: enabled)

## Current Implementation Status

### ✅ Working Scenarios

- **Single record queries**: Restoration works reliably
- **Identify popup closes**: When identify popup closes and selection was cleared, restoration triggers consistently
- **Event-driven tracking**: Selection tracking via custom events works reliably

### ⚠️ Known Limitations & Concerns

1. **Widget Open/Closed State**: 
   - **Current**: Restoration happens regardless of QuerySimple widget open/closed state
   - **Concern**: May restore selection even when widget is closed (user may not see restored selection)
   - **Why**: Widget open/closed detection via handshake events was inconsistent
   - **Future Improvement**: Explore more reliable widget state detection or accept this limitation

2. **Multiple Record Queries**:
   - **Current**: Works but may have edge cases with very large selections (>100 records)
   - **Future Improvement**: Test and optimize for large selections

3. **Handshake Events**:
   - **Current**: Handshake events are tracked but not used for restoration decisions
   - **Why**: Handshake was inconsistent, so we removed it from restoration logic
   - **Future Improvement**: Investigate why handshake events are inconsistent, or remove handshake code if not needed

## Architecture

### Components

- **HelperSimple** (`helper-simple/src/runtime/widget.tsx`):
  - Listens for `querysimple-selection-changed` events
  - Tracks selection state (`querySimpleSelection`, `previousHashEntry`)
  - Monitors identify popup via `MutationObserver`
  - Restores selection via `restoreSelection()` method

- **QuerySimple** (`query-simple/src/runtime/widget.tsx`, `query-result.tsx`):
  - Dispatches `querysimple-selection-changed` events when selection changes
  - Dispatches `querysimple-widget-state-changed` events (handshake - currently not used for restoration)

### Data Flow

```
QuerySimple Selection Change
  ↓
Dispatch querysimple-selection-changed event
  ↓
HelperSimple receives event
  ↓
Store selection state (recordIds, dataSourceId)
  ↓
Parse hash for output DS ID
  ↓
[User clicks identify on map]
  ↓
Identify popup opens (detected via MutationObserver)
  ↓
Identify clears selection
  ↓
Identify popup closes (detected via MutationObserver)
  ↓
HelperSimple checks: selection cleared? (0 records)
  ↓
If yes: Restore selection via restoreSelection()
  ↓
Restore records in origin DS and output DS
  ↓
Publish selection change message
```

## Testing Needed

### Test Scenarios to Add

1. **Basic Functionality**:
   - [ ] Query single record, identify, close popup → selection restored
   - [ ] Query multiple records (2-10), identify, close popup → selection restored
   - [ ] Query large selection (100+), identify, close popup → selection restored

2. **Edge Cases**:
   - [ ] Query, identify, close popup, then identify again → second identify doesn't interfere
   - [ ] Query, close QuerySimple widget, identify, close popup → verify behavior (may restore even when closed)
   - [ ] Multiple QuerySimple widgets, identify on one → verify correct widget's selection is tracked
   - [ ] Rapid identify clicks (open/close quickly) → verify no race conditions

3. **Configuration**:
   - [ ] Disable feature in settings → verify no restoration occurs
   - [ ] Enable feature in settings → verify restoration works

4. **Integration**:
   - [ ] Query, identify, then query again → verify new query replaces old selection
   - [ ] Query, identify, then clear results → verify clear works correctly

### Test Files to Create

- `tests/e2e/helper-simple/selection-restoration.spec.ts` - E2E tests for restoration feature
- `helper-simple/src/runtime/widget.test.tsx` - Unit tests for restoration logic

## Future Improvements

1. **Widget State Detection**:
   - Investigate why handshake events are inconsistent
   - Explore alternative methods for detecting widget open/closed state
   - Consider if restoration when widget is closed is acceptable behavior

2. **Performance**:
   - Optimize for large selections (100+ records)
   - Consider debouncing/throttling if needed

3. **User Experience**:
   - Add visual feedback when restoration occurs (optional)
   - Consider restoration timing (immediate vs. delayed)

4. **Code Cleanup**:
   - Remove unused handshake code if not needed (currently tracked but not used for restoration)
   - Remove `isQuerySimpleWidgetActuallyOpen` method (currently unused - was removed from restoration logic)
   - Simplify restoration logic if possible

## Dependencies

- **HelperSimple widget must be present**: This feature requires HelperSimple widget to be on the page
- **One-to-one relationship**: Each HelperSimple widget manages one QuerySimple widget (configured via `managedWidgetId`)
- **Shared debug logger**: Uses `widgets/shared-code/common` debug logger for consistent logging

## Debug Logging

Enable debug logging to see restoration behavior:

- `?debug=SELECTION` - See selection tracking events
- `?debug=RESTORE` - See restoration attempts and results
- `?debug=WIDGET-STATE` - See widget state handshake events (currently not used for restoration)
- `?debug=all` - See all debug logs

## Related Files

- `helper-simple/src/runtime/widget.tsx` - Main implementation
- `helper-simple/src/config.ts` - Configuration interface
- `query-simple/src/runtime/widget.tsx` - Dispatches selection events
- `query-simple/src/runtime/query-result.tsx` - Dispatches selection events
- `widgets/shared-code/common/debug-logger.ts` - Shared debug logging utility

