# Manual Testing Plan - MapSimple Widgets

Feature-focused testing plan for QuerySimple and HelperSimple widgets. Focus on verifying features work correctly, not exhaustive error scenarios.

## Prerequisites

- Experience Builder application running with MapSimple widgets configured
- Test data source configured (e.g., King County Parcels)
- Browser developer console open (optional, for debug logs)

---

## Feature Test 1: Query Execution

### 1.1 Basic Query
**Test**: Execute a simple query with attribute filter

**Steps**:
1. Open QuerySimple widget
2. Select a query (e.g., "Parcel Number")
3. Enter a valid value (e.g., PIN number)
4. Click "Apply" or press Enter

**Verify**:
- ✅ Query executes and returns results
- ✅ Results tab shows correct count
- ✅ Results display in list
- ✅ Features highlight on map
- ✅ Map zooms to results (if enabled)

---

### 1.2 Query with Spatial Filter
**Test**: Execute query with spatial geometry filter

**Steps**:
1. Select query with spatial filter enabled
2. Draw geometry on map (or select from map)
3. Execute query

**Verify**:
- ✅ Spatial filter geometry displays on map
- ✅ Results are within spatial boundary
- ✅ Can combine with attribute filter
- ✅ Can clear spatial filter

---

### 1.3 Query with No Results
**Test**: Handle empty result sets gracefully

**Steps**:
1. Enter search value that returns no results
2. Execute query

**Verify**:
- ✅ "No results" message displays
- ✅ Widget remains functional
- ✅ Can enter new query immediately

---

### 1.4 Multiple Query Items
**Test**: Switch between different query configurations

**Steps**:
1. Execute query with first query item
2. Switch to different query item
3. Execute new query
4. Switch back to first query

**Verify**:
- ✅ Previous results clear when switching
- ✅ New query form loads correctly
- ✅ Each query executes independently
- ✅ No stale data persists

---

## Feature Test 2: Results Display

### 2.1 Results Tab Navigation
**Test**: Navigate between Query and Results tabs

**Steps**:
1. Execute query with results
2. Verify auto-switch to Results tab
3. Click back to Query tab
4. Switch back to Results tab

**Verify**:
- ✅ Automatically switches to Results when results arrive
- ✅ Can manually switch between tabs
- ✅ Results persist when switching tabs
- ✅ Result count displays in tab label

---

### 2.2 Pagination (Multi-Page Mode)
**Test**: Navigate through paginated results

**Steps**:
1. Execute query with many results (> page size)
2. Navigate through pages using controls
3. Verify page numbers and navigation

**Verify**:
- ✅ Pagination controls appear
- ✅ Can navigate between pages
- ✅ Page numbers display correctly
- ✅ Results update when changing pages
- ✅ Selection persists across pages

---

### 2.3 Lazy Loading (Single-Page Mode)
**Test**: Scroll through lazy-loaded results

**Steps**:
1. Configure widget for lazy loading
2. Execute query with many results
3. Scroll through results list

**Verify**:
- ✅ Initial results load (default: 100 records)
- ✅ More results load as you scroll
- ✅ Loading indicator appears when loading
- ✅ Selection updates as records load
- ✅ Smooth scrolling performance

---

### 2.4 Result Field Display
**Test**: Verify configured fields display correctly

**Steps**:
1. Configure query with specific display fields
2. Execute query
3. Check result field display

**Verify**:
- ✅ Only configured fields display
- ✅ Field values are correct
- ✅ Field labels are readable
- ✅ Can expand to see all fields

---

## Feature Test 3: Selection and Map Interaction

### 3.1 Feature Selection
**Test**: Verify features are selected when query executes

**Steps**:
1. Execute query that returns results
2. Observe map highlighting

**Verify**:
- ✅ Features highlight on map automatically
- ✅ Selection matches query results
- ✅ Selection persists when switching tabs
- ✅ Selection clears when clearing results

---

### 3.2 Clear Results
**Test**: Clear query results and reset widget state

**Steps**:
1. Execute query with results
2. Click "Clear results" button (trash icon)

**Verify**:
- ✅ Results clear from list
- ✅ Selection clears from map
- ✅ Widget returns to Query tab
- ✅ Query form resets
- ✅ Can execute new query immediately

---

### 3.3 "Add to Map" Data Action
**Test**: Use custom Add to Map action on selected records

**Steps**:
1. Execute query with results
2. Select a record from results
3. Click data action dropdown
4. Select "Add to Map" action

**Verify**:
- ✅ "Add to Map" action appears in dropdown
- ✅ Action executes successfully
- ✅ Features are selected on map
- ✅ Zoom behavior respects `zoomToSelected` setting
- ✅ Clearing results removes added features

---

### 3.4 Record Selection in Results
**Test**: Select individual records from results list

**Steps**:
1. Execute query with multiple results
2. Click on individual records in results list
3. Observe map behavior

**Verify**:
- ✅ Clicking record highlights it on map
- ✅ Map zooms to clicked record
- ✅ Can select multiple records (if enabled)
- ✅ Selection updates map highlighting

---

## Feature Test 4: Hash Parameters

### 4.1 Hash Parameter Query Execution
**Test**: Execute query via URL hash parameter

**Steps**:
1. Navigate to app with hash: `#pin=2223059013`
2. Observe widget behavior

**Verify**:
- ✅ QuerySimple widget opens automatically (if HelperSimple configured)
- ✅ Query executes with hash parameter value
- ✅ Results display correctly
- ✅ Hash parameter removed from URL after use

---

### 4.2 HelperSimple Widget Opening
**Test**: HelperSimple opens widget via hash parameter

**Steps**:
1. Ensure QuerySimple widget is closed in controller
2. Navigate with hash: `#pin=2223059013`

**Verify**:
- ✅ HelperSimple detects hash parameter
- ✅ QuerySimple widget opens in controller
- ✅ Query executes automatically
- ✅ Works even when widget was closed

---

### 4.3 qsopen Parameter
**Test**: Force widget open with `#qsopen=true`

**Steps**:
1. Ensure QuerySimple widget is closed
2. Navigate with: `#qsopen=true`
3. Try with query: `#qsopen=true&pin=2223059013`

**Verify**:
- ✅ Widget opens when `qsopen=true` is present
- ✅ Widget opens even without query parameter
- ✅ If query parameter present, query executes after opening

---

### 4.4 Multiple Hash Parameters
**Test**: Handle multiple hash parameters

**Steps**:
1. Navigate with: `#pin=2223059013&major=12345`
2. Observe which query executes

**Verify**:
- ✅ First matching query executes (priority order)
- ✅ Other hash parameters remain in URL
- ✅ Only used parameter is removed

---

## Feature Test 5: Query Grouping

### 5.1 Grouped Queries
**Test**: Navigate queries organized in groups

**Steps**:
1. Configure queries with groups (e.g., "King County Parcels" group)
2. Open QuerySimple widget
3. Select group from first dropdown
4. Select query from second dropdown

**Verify**:
- ✅ Groups display in first dropdown
- ✅ Queries within group display in second dropdown
- ✅ Can select and execute queries from groups
- ✅ Ungrouped queries display separately

---

### 5.2 Single Group Scenario
**Test**: Handle single group with multiple queries

**Steps**:
1. Configure all queries in one group
2. Open QuerySimple widget

**Verify**:
- ✅ First dropdown shows the single group
- ✅ Second dropdown always visible with all queries
- ✅ Can select and execute any query

---

### 5.3 No Groups Scenario
**Test**: Handle queries without grouping

**Steps**:
1. Configure queries without groups
2. Open QuerySimple widget

**Verify**:
- ✅ Single dropdown shows all queries
- ✅ Can select and execute queries directly

---

## Feature Test 6: Widget Arrangements

### 6.1 Inline Arrangement
**Test**: Widget displayed inline (not in controller)

**Steps**:
1. Configure widget for inline arrangement
2. Use widget normally

**Verify**:
- ✅ Widget displays inline on page
- ✅ All features work correctly
- ✅ Results display properly

---

### 6.2 Popper Arrangement
**Test**: Widget displayed in popper/dialog

**Steps**:
1. Configure widget for popper arrangement
2. Open widget via controller
3. Use widget normally

**Verify**:
- ✅ Widget opens in popper/dialog
- ✅ All features work correctly
- ✅ Can close and reopen widget
- ✅ State persists appropriately

---

## Feature Test 7: Multiple Widgets

### 7.1 Multiple QuerySimple Widgets
**Test**: Multiple widgets operate independently

**Steps**:
1. Configure 2+ QuerySimple widgets on same page
2. Execute query in first widget
3. Execute query in second widget
4. Clear results in first widget

**Verify**:
- ✅ Each widget operates independently
- ✅ Results don't interfere between widgets
- ✅ Selection works independently
- ✅ Clearing one widget doesn't affect others

---

### 7.2 Widget Controller Integration
**Test**: Widget works in controller setup

**Steps**:
1. Configure QuerySimple in widget controller
2. Open widget via controller
3. Execute query
4. Close widget
5. Re-open widget

**Verify**:
- ✅ Widget opens/closes correctly
- ✅ Query state persists when closing
- ✅ Results clear appropriately
- ✅ Hash parameters trigger opening

---

## Feature Test 8: Zoom Behavior

### 8.1 Zoom to Selected (Enabled)
**Test**: Map zooms to results when enabled

**Steps**:
1. Configure query with `zoomToSelected: true`
2. Execute query with results

**Verify**:
- ✅ Map zooms to show all results
- ✅ All features are visible in view
- ✅ Zoom happens automatically

---

### 8.2 Zoom to Selected (Disabled)
**Test**: Map doesn't zoom when disabled

**Steps**:
1. Configure query with `zoomToSelected: false`
2. Execute query with results

**Verify**:
- ✅ Map does not zoom
- ✅ Current map extent maintained
- ✅ Features still highlight on map

---

### 8.3 Runtime Zoom Override
**Test**: Override zoom setting at runtime

**Steps**:
1. Configure query with `zoomToSelected: false`
2. Check "Zoom to selected" checkbox in form
3. Execute query

**Verify**:
- ✅ Runtime checkbox overrides config setting
- ✅ Map zooms when checkbox checked
- ✅ Setting persists for this query execution

---

## Feature Test 9: Debug Logging

### 9.1 Enable Debug Logging
**Test**: Debug logs appear when enabled

**Steps**:
1. Add `?debug=all` to URL
2. Execute various operations
3. Check console logs

**Verify**:
- ✅ Debug logs appear in console
- ✅ Logs formatted: `[QUERYSIMPLE-FEATURE]`
- ✅ Logs include relevant context
- ✅ Can enable specific features: `?debug=TASK,ZOOM`

---

### 9.2 Debug Log Features
**Test**: Different debug features log correctly

**Steps**:
1. Enable debug logging
2. Execute query with hash parameter
3. Check console for different log types

**Verify**:
- ✅ HASH logs show hash parameter events
- ✅ TASK logs show query execution details
- ✅ ZOOM logs show zoom behavior
- ✅ DATA-ACTION logs show action execution

---

## Feature Test 10: Error Display (New Feature)

### 10.1 Error Message Display
**Test**: User-facing errors display correctly

**Steps**:
1. Execute query normally (should work)
2. If error occurs, observe display

**Verify**:
- ✅ Error message appears below tabs (if error occurs)
- ✅ Error message has red styling
- ✅ Error message has dismiss button
- ✅ Error clears when dismissed
- ✅ Error clears on next successful operation

**Note**: Errors are rare in normal operation. This verifies the display mechanism works when errors do occur.

---

## Quick Smoke Test (5 minutes)

Run these critical features to verify basic functionality:

1. ✅ Execute basic query - verify results display
2. ✅ Clear results - verify clearing works
3. ✅ Hash parameter - verify `#pin=value` triggers query
4. ✅ Switch queries - verify switching works
5. ✅ Multiple widgets - verify independence

---

## Test Results Template

```
Date: [Date]
Tester: [Name]
Browser: [Browser/Version]

Feature Test | Status | Notes
-------------|--------|-------
1.1 Basic Query | ✅ Pass / ❌ Fail | [Notes]
1.2 Spatial Filter | ✅ Pass / ❌ Fail | [Notes]
...

Issues Found:
- [Issue description]
- [Issue description]

Overall Status: ✅ Pass / ❌ Fail / ⚠️ Partial
```

---

## Notes

- **Focus**: This plan tests features work correctly, not exhaustive error scenarios
- **Debug Logging**: Optional but helpful - add `?debug=all` to URL
- **Known Issues**: See `TODO.md` for known issues that may affect testing
- **Browser Testing**: Test in your primary browser(s)

---

## Reporting Issues

When reporting issues, include:
1. Feature test number and description
2. Steps to reproduce
3. Expected vs. actual results
4. Browser/version
5. Screenshots (if applicable)
