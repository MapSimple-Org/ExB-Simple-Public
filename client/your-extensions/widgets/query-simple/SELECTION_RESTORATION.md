# Selection Restoration Feature

## Overview

The QuerySimple widget automatically restores map selections when the identify popup closes, maintaining query context for users. This feature ensures that when users query features and then use the map identify tool, their original query selection is restored after closing the identify popup—but only if the widget panel is open.

## How It Works

1. **Selection Tracking**: QuerySimple tracks its own selection state internally (`hasSelection`, `lastSelection`)
2. **Identify Detection**: QuerySimple detects when identify popup opens/closes via polling in `query-result.tsx`
3. **Restoration Trigger**: When identify popup closes and selection was cleared, QuerySimple dispatches a restore event
4. **Restoration Logic**: QuerySimple restores selection to the map (only if widget panel is open)
5. **Clean UX**: Selection is cleared from map when widget closes (but kept in widget state)

## Key Features

- **Widget-Aware**: Only restores when QuerySimple widget panel is open
- **Event-Driven**: Uses custom events for communication between components
- **Self-Contained**: All restoration logic is within QuerySimple widget
- **Comprehensive Logging**: Full debug logging for troubleshooting
- **Clean UX**: Clears selection from map when widget closes

## Architecture

### Components

- **QuerySimple Widget** (`query-simple/src/runtime/widget.tsx`):
  - Tracks selection state (`hasSelection`, `lastSelection`)
  - Detects widget panel visibility using `IntersectionObserver` with fallback
  - Listens for restore events (`RESTORE_ON_IDENTIFY_CLOSE_EVENT`)
  - Restores selection via `addSelectionToMap()` method (no zoom)
  - Clears selection from map when widget closes via `clearSelectionFromMap()`

- **QuerySimple Result** (`query-simple/src/runtime/query-result.tsx`):
  - Detects identify popup state changes via polling
  - Monitors selection changes on origin data source
  - Dispatches restore event when identify popup closes and selection was cleared

- **HelperSimple Widget** (`helper-simple/src/runtime/widget.tsx`):
  - **Role**: Logging and debugging only (does NOT perform restoration)
  - Tracks selection events from QuerySimple for debugging
  - Monitors identify popup state for logging purposes
  - Provides visibility into selection and identify popup interactions
  - HelperSimple is NOT required for restoration to work

### Data Flow

```
User executes query in QuerySimple
  ↓
QuerySimple selects records → Updates internal state (hasSelection, lastSelection)
  ↓
[User clicks identify on map]
  ↓
Identify clears selection → query-result.tsx detects selection cleared
  ↓
Identify popup closes → query-result.tsx detects popup closed
  ↓
query-result.tsx dispatches RESTORE_ON_IDENTIFY_CLOSE_EVENT
  ↓
widget.tsx receives event → Checks if widget panel is open
  ↓
If open: Restores selection via addSelectionToMap()
  ↓
Selection restored on map (no zoom)
```

## Configuration

No configuration required - this feature is always enabled.

## Current Implementation Status

### ✅ Working Scenarios

- **Widget Open**: When QuerySimple widget is open and identify popup closes, selection is restored
- **Single Record Queries**: Works reliably for queries returning 1 record
- **Multiple Record Queries**: Works reliably for queries returning multiple records
- **Widget Closed**: Selection is cleared from map when widget closes (clean UX)
- **Widget Reopened**: Selection is restored to map when widget reopens (if it has selection)

### Implementation Details

- **Widget State Detection**: Uses `IntersectionObserver` and periodic checking to detect panel visibility
- **Selection State**: Tracks `hasSelection`, `selectionRecordCount`, and `lastSelection` (recordIds, outputDsId, queryItemConfigId)
- **Restoration Method**: Reuses `addSelectionToMap()` logic without zoom
- **Clear on Close**: Clears selection from map (not widget state) when panel closes
- **Restore on Open**: Restores selection to map (without zoom) when panel opens

## Debug Logging

Enable debug logging to see restoration behavior:

### QuerySimple Debug Tags

- `?debug=RESTORE` - See restoration attempts and results
- `?debug=SELECTION` - See selection tracking events and identify popup detection
- `?debug=WIDGET-STATE` - See widget open/close state and visibility detection
- `?debug=all` - See all debug logs

### HelperSimple Debug Tags (for debugging/logging only)

- `?debug=SELECTION` - See selection tracking from QuerySimple (HelperSimple's perspective)
- `?debug=WIDGET-STATE` - See widget state handshake events
- `?debug=HASH` - See hash parameter monitoring

### Key Log Events

**QuerySimple RESTORE logs:**
- `identify-popup-closed-restore-requested` - Event received
- `identify-popup-closed-restore-skipped-widget-closed` - Widget not open
- `identify-popup-closed-restore-skipped-no-selection` - No selection to restore
- `identify-popup-closed-restore-skipped-ds-mismatch` - Data source mismatch
- `identify-popup-closed-restore-skipped-query-mismatch` - Query item mismatch
- `identify-popup-closed-restoring-selection` - Actually restoring
- `panel-opened-selection-added-to-map` - Selection added when widget opens
- `panel-closed-selection-cleared-from-map` - Selection cleared when widget closes

**QuerySimple SELECTION logs:**
- `selection-cleared` - Selection was cleared (possibly by identify)
- `selection-changed` - Selection changed
- `selection-added` - Selection was added
- `identify-popup-opened` - Identify popup opened
- `identify-popup-closed` - Identify popup closed
- `identify-popup-closed-restore-requested` - Restore event dispatched

**QuerySimple WIDGET-STATE logs:**
- `panel-opened` - Widget panel became visible
- `panel-closed` - Widget panel became hidden
- `widget-opened` - Widget mounted
- `widget-closed` - Widget unmounted

**HelperSimple SELECTION logs (debugging only):**
- `identify-popup-opened` - Identify popup opened (HelperSimple's view)
- `identify-popup-closed` - Identify popup closed (HelperSimple's view)
- `identify-popup-watching-started` - Started monitoring identify popup
- `identify-popup-watching-stopped` - Stopped monitoring identify popup

## Related Files

- `query-simple/src/runtime/widget.tsx` - Main widget, restoration handler, visibility detection
- `query-simple/src/runtime/query-result.tsx` - Identify detection, restore event dispatch
- `query-simple/src/runtime/selection-utils.ts` - Selection utilities
- `widgets/shared-code/common/debug-logger.ts` - Shared debug logging utility
- `helper-simple/src/runtime/widget.tsx` - Logging/debugging only (does NOT restore)

## HelperSimple's Role

**Important**: HelperSimple does NOT perform restoration. Its role is limited to:

1. **Logging/Debugging**: Tracks selection events and identify popup state for debugging purposes
2. **Hash Parameter Monitoring**: Monitors URL hash and opens QuerySimple widget (separate feature)
3. **Widget Opening**: Opens QuerySimple widget based on hash parameters (separate feature)

Restoration is entirely self-contained within QuerySimple widget. HelperSimple is optional and only provides additional visibility into the system for debugging.

## Future Improvements

1. **Testing**: Add E2E tests for restoration scenarios
2. **Performance**: Optimize for very large selections if needed
3. **User Feedback**: Consider visual feedback when restoration occurs (optional)
4. **Configuration**: Consider adding option to disable restoration if needed

