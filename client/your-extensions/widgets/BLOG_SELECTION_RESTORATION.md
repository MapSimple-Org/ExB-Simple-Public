# Maintaining Query Context: Selection Restoration in ArcGIS Experience Builder

## The Problem

When building interactive map applications in ArcGIS Experience Builder, users often need to query features and then inspect individual features using the identify tool. However, there's a common frustration: when you click identify on a feature, the identify popup clears your query selection, forcing you to re-query if you want to continue working with your original results.

This breaks the user's workflow and creates unnecessary friction. Users lose their query context and have to start over, which is especially frustrating when working with complex queries or large result sets.

## The Solution

We implemented an automatic selection restoration feature in our QuerySimple widget that maintains query context when users interact with the identify tool. When the identify popup closes, the widget automatically restores the original query selection—but only if the widget panel is open, ensuring a clean user experience.

## Architecture Overview

The solution is self-contained within the QuerySimple widget, using an event-driven architecture:

1. **Selection Tracking**: The widget tracks its own selection state internally
2. **Identify Detection**: Polling detects when the identify popup opens/closes
3. **Restoration Trigger**: When identify closes and selection was cleared, a restore event is dispatched
4. **Smart Restoration**: Selection is restored only if the widget panel is open
5. **Clean UX**: Selection is cleared from map when widget closes, but restored when it reopens

## Implementation Details

### Selection State Management

The widget maintains selection state in its component state:

```typescript
state: {
  hasSelection?: boolean,
  selectionRecordCount?: number,
  lastSelection?: {
    recordIds: string[],
    outputDsId: string,
    queryItemConfigId: string
  }
}
```

This state is updated whenever selection changes via a custom event listener:

```typescript
handleSelectionChange = (event: Event) => {
  const customEvent = event as CustomEvent<{...}>
  // Update state with selection details
}
```

### Identify Popup Detection

The `query-result.tsx` component monitors the identify popup state by:

1. Checking the DOM for the identify popup element
2. Polling the origin data source for selection changes
3. Detecting when the popup closes and selection was cleared

```typescript
// Detect identify popup state
const identifyPopupIsOpen = isIdentifyPopupOpen()
const identifyPopupJustClosed = identifyPopupWasOpen && !identifyPopupIsOpen

// If popup closed and selection was cleared, dispatch restore event
if (identifyPopupJustClosed && wasCleared && hasOurSelection) {
  window.dispatchEvent(new CustomEvent(RESTORE_ON_IDENTIFY_CLOSE_EVENT, {...}))
}
```

### Widget Visibility Detection

To ensure restoration only happens when the widget is open, we use `IntersectionObserver` with a fallback to periodic checking:

```typescript
setupVisibilityDetection = () => {
  if ('IntersectionObserver' in window) {
    this.visibilityObserver = new IntersectionObserver((entries) => {
      const isVisible = entries[0].isIntersecting
      this.setState({ isPanelVisible: isVisible })
    })
    this.visibilityObserver.observe(this.widgetRef.current)
  } else {
    // Fallback to periodic checking
  }
}
```

### Restoration Logic

When the restore event is received, the widget:

1. Verifies the widget panel is open
2. Validates selection state matches
3. Restores selection using existing "Add to Map" logic (without zoom)

```typescript
private handleRestoreOnIdentifyClose = (event: Event) => {
  // Only restore if widget is open
  if (!this.state.isPanelVisible) {
    return
  }
  
  // Validate selection state
  if (!this.state.hasSelection || !this.state.lastSelection) {
    return
  }
  
  // Restore selection (reuses addSelectionToMap logic)
  this.addSelectionToMap()
}
```

### Clean UX: Clear on Close

When the widget panel closes, we clear the selection from the map (but keep it in widget state):

```typescript
private clearSelectionFromMap = () => {
  // Clear selection from originDS (map) only
  originDS.selectRecordsByIds([], [])
  
  // Publish clear message
  MessageManager.getInstance().publishMessage(
    new DataRecordsSelectionChangeMessage(id, [], [originDS.id])
  )
}
```

This ensures that when users close the widget, the map is clean, but when they reopen it, their selection is still available.

### Restore on Open

When the widget panel opens, if it has a selection, we restore it to the map:

```typescript
logVisibilityChange = (isVisible: boolean, method: string) => {
  if (isVisible) {
    // When panel opens, restore selection if we have one
    if (this.state.hasSelection) {
      this.addSelectionToMap()
    }
  } else {
    // When panel closes, clear selection from map
    if (this.state.hasSelection) {
      this.clearSelectionFromMap()
    }
  }
}
```

## Key Design Decisions

### 1. Self-Contained Implementation

We chose to keep the restoration logic within QuerySimple rather than using HelperSimple because:
- Simpler architecture (no inter-widget communication needed)
- More reliable (no dependency on another widget)
- Easier to maintain and debug

### 2. Widget-Aware Restoration

Restoration only happens when the widget panel is open because:
- Users can't see the restored selection if the widget is closed
- Prevents unnecessary map updates
- Cleaner user experience

### 3. Event-Driven Architecture

Using custom events provides:
- Loose coupling between components
- Easy to extend or modify
- Clear separation of concerns

### 4. No Zoom on Restoration

When restoring selection, we don't zoom because:
- Users may have panned/zoomed to inspect features
- Preserves user's current map view
- Less jarring user experience

### 5. Clear on Close, Restore on Open

This pattern ensures:
- Clean map when widget is closed
- Selection context preserved when widget reopens
- Intuitive user experience

## Debug Logging

Comprehensive debug logging helps troubleshoot issues:

```typescript
debugLogger.log('RESTORE', {
  event: 'identify-popup-closed-restoring-selection',
  widgetId: id,
  recordCount: customEvent.detail.recordIds.length
})
```

Enable with `?debug=RESTORE` or `?debug=all`.

### Available Debug Tags

- `RESTORE` - See restoration attempts and results
- `SELECTION` - See selection tracking events and identify popup detection
- `WIDGET-STATE` - See widget open/close state and visibility detection
- `all` - See all debug logs

## HelperSimple's Role

**Important**: HelperSimple does NOT perform restoration. Its role is limited to:

1. **Logging/Debugging**: Tracks selection events and identify popup state for debugging purposes
2. **Hash Parameter Monitoring**: Monitors URL hash and opens QuerySimple widget (separate feature)
3. **Widget Opening**: Opens QuerySimple widget based on hash parameters (separate feature)

Restoration is entirely self-contained within QuerySimple widget. HelperSimple is optional and only provides additional visibility into the system for debugging.

## Results

The implementation provides:
- ✅ Seamless workflow: Query → Identify → Continue with query results
- ✅ Widget-aware: Only restores when widget is open
- ✅ Clean UX: Clears selection when widget closes, restores when it reopens
- ✅ Reliable: Works for single and multiple record queries
- ✅ Maintainable: Self-contained, well-logged, event-driven

## Lessons Learned

1. **Widget State Detection**: Using `IntersectionObserver` provides reliable visibility detection
2. **Event-Driven Design**: Custom events enable clean component communication
3. **Reuse Existing Logic**: Leveraging `addSelectionToMap()` reduces code duplication
4. **Comprehensive Logging**: Debug logging is essential for troubleshooting
5. **Self-Contained Design**: Keeping restoration within QuerySimple simplifies the architecture

## Future Enhancements

Potential improvements:
- E2E tests for restoration scenarios
- Visual feedback when restoration occurs
- Performance optimization for very large selections
- Configuration option to disable restoration

## Conclusion

This feature significantly improves the user experience by maintaining query context when using the identify tool. The self-contained, event-driven architecture makes it reliable and maintainable, while comprehensive logging ensures we can troubleshoot any issues that arise.

The implementation demonstrates how thoughtful design decisions—widget-aware restoration, clean UX patterns, and event-driven architecture—can create a seamless user experience while keeping the code maintainable.

