# HelperSimple & QuerySimple Interaction Architecture

**Last Updated:** 2026-01-07 (Release 018.56)  
**Status:** Production Architecture Documentation

---

## Overview

This document describes the **complete interaction architecture** between HelperSimple (HS) and QuerySimple (QS) widgets, including event-driven communication, state management, flags, and control flow. This is critical documentation for understanding how hash parameters are processed and how the widgets coordinate.

**Key Principle:** QuerySimple should **NOT** autonomously process hash parameters. HelperSimple is the **orchestrator** that explicitly triggers QuerySimple's hash processing via events.

---

## Architecture Pattern: Event-Driven Orchestration

### Core Design Principle

**HelperSimple controls when QuerySimple processes hash parameters.**

QuerySimple does **NOT** autonomously check URL parameters on mount or update. Instead:
1. HelperSimple detects hash/query string parameters
2. HelperSimple opens QuerySimple widget (if not already open)
3. HelperSimple dispatches `OPEN_WIDGET_EVENT` to notify QuerySimple
4. QuerySimple **only then** processes hash parameters

This prevents:
- Race conditions
- Duplicate processing
- Autonomous re-execution when switching queries
- State synchronization issues

---

## Events

### 1. `helpersimple-open-widget` Event

**Dispatched By:** HelperSimple  
**Dispatched When:** After HelperSimple opens a managed widget (QuerySimple)  
**Purpose:** Notify QuerySimple to process hash parameters  
**Event Name:** `'helpersimple-open-widget'`  
**Event Detail:**
```typescript
{
  widgetId: string  // The widget ID that was opened
}
```

**Listener:** QuerySimple's `handleOpenWidgetEvent` method  
**Action:** QuerySimple calls `urlConsumptionManager.checkUrlParameters()` only if the event is for its widget ID

**Code Location:**
- **Dispatcher:** `helper-simple/src/runtime/widget.tsx` - `openWidget()` method
- **Listener:** `query-simple/src/runtime/widget.tsx` - `handleOpenWidgetEvent()` method

### 2. `querysimple-hash-query-executed` Event

**Dispatched By:** QuerySimple  
**Dispatched When:** After a hash-triggered query successfully executes  
**Purpose:** Notify HelperSimple that a hash parameter has been processed  
**Event Name:** `'querysimple-hash-query-executed'`  
**Event Detail:**
```typescript
{
  widgetId: string,
  shortId: string,
  value: string,
  hashParam: string  // Format: "shortId=value"
}
```

**Listener:** HelperSimple's `handleHashQueryExecuted` method  
**Action:** HelperSimple tracks `lastExecutedHash` to prevent re-opening widget for the same hash

**Code Location:**
- **Dispatcher:** `query-simple/src/runtime/query-task.tsx` - After `onHashParameterUsed` callback
- **Listener:** `helper-simple/src/runtime/widget.tsx` - `handleHashQueryExecuted()` method

---

## State Management: Flags and Tracking

### QuerySimple State Flags

#### `shouldUseInitialQueryValueForSelection`

**Type:** `boolean | undefined` (React state, NOT ref)  
**Purpose:** Controls whether `query-task-list.tsx` should use `initialQueryValue` to select a query  
**Set To `true`:** When `OPEN_WIDGET_EVENT` is received and hash parameter detected  
**Set To `false`:** After hash query executes successfully (via `handleHashParameterUsed`)  
**Critical:** Must be React state (not ref) to trigger re-renders in child components

**Code Location:**
- **State Definition:** `query-simple/src/runtime/widget.tsx` - Widget state interface
- **Set To True:** `query-simple/src/runtime/widget.tsx` - `handleOpenWidgetEvent()` method
- **Set To False:** `query-simple/src/runtime/widget.tsx` - `handleHashParameterUsed()` method
- **Used By:** `query-simple/src/runtime/query-task-list.tsx` - `effectiveInitialQueryValue` calculation

#### `initialQueryValue`

**Type:** `{ shortId: string, value: string } | undefined`  
**Purpose:** Stores the hash parameter value to be used for query selection and form population  
**Set:** When hash parameter is detected via `onInitialValueFound` callback  
**Cleared:** After hash query executes successfully (via `handleHashParameterUsed`)  
**Critical:** Must be cleared atomically with `shouldUseInitialQueryValueForSelection` to prevent re-execution

**Code Location:**
- **State Definition:** `query-simple/src/runtime/widget.tsx` - Widget state interface
- **Set:** `query-simple/src/runtime/widget.tsx` - `onInitialValueFound` callback
- **Cleared:** `query-simple/src/runtime/widget.tsx` - `handleHashParameterUsed()` method

#### `processedHashParamsRef`

**Type:** `Set<string>` (React ref)  
**Purpose:** Tracks which `shortId:value` pairs have already been processed  
**Format:** Stores strings like `"pin:2223059013"`  
**Used:** In `onInitialValueFound` to prevent re-processing the same parameter when switching queries  
**Critical:** Uses `shortId:value` format (not entire hash) to handle cases where hash contains multiple parameters

**Code Location:**
- **Definition:** `query-simple/src/runtime/widget.tsx` - Class property
- **Updated:** `query-simple/src/runtime/widget.tsx` - `handleHashParameterUsed()` method
- **Checked:** `query-simple/src/runtime/widget.tsx` - `onInitialValueFound` callback

### HelperSimple State Flags

#### `lastExecutedHash`

**Type:** `string | null`  
**Purpose:** Tracks the last hash parameter that successfully triggered a query  
**Format:** Stores strings like `"pin=2223059013"`  
**Set:** When `querysimple-hash-query-executed` event is received  
**Used:** In `checkUrlParameters` to skip opening widget if hash was already executed

**Code Location:**
- **Definition:** `helper-simple/src/runtime/widget.tsx` - Class property
- **Updated:** `helper-simple/src/runtime/widget.tsx` - `handleHashQueryExecuted()` method
- **Checked:** `helper-simple/src/runtime/widget.tsx` - `checkUrlParameters()` method

---

## Control Flow: Hash Parameter Processing

### Step-by-Step Flow

#### 1. User Enters Hash Parameter

**Action:** User navigates to URL with hash: `#pin=2223059013`

**What Happens:**
- Browser fires `hashchange` event
- HelperSimple's `handleHashChange` listener fires

#### 2. HelperSimple Detects Hash Parameter

**Code:** `helper-simple/src/runtime/widget.tsx` - `handleHashChange()` → `checkUrlParameters()`

**Process:**
1. Parse hash for `shortId` values
2. Check if `shortId` matches any configured managed widget
3. Check if hash was already executed (`currentHash === this.lastExecutedHash`)
4. If not executed, proceed to open widget

**Logging:**
```typescript
debugLogger.log('HASH-EXEC', {
  event: 'helpersimple-handlehashchange-fired',
  currentUrlHash: hash,
  lastExecutedHash: this.lastExecutedHash
})
```

#### 3. HelperSimple Opens QuerySimple Widget

**Code:** `helper-simple/src/runtime/widget.tsx` - `openWidget()` method

**Process:**
1. Dispatch action to open widget panel
2. Wait for widget to open
3. Dispatch `OPEN_WIDGET_EVENT` with widget ID

**Logging:**
```typescript
debugLogger.log('HASH-EXEC', {
  event: 'helpersimple-open-widget-start',
  widgetId: managedWidgetId
})
```

#### 4. QuerySimple Receives `OPEN_WIDGET_EVENT`

**Code:** `query-simple/src/runtime/widget.tsx` - `handleOpenWidgetEvent()` method

**Process:**
1. Verify event is for this widget (`event.detail.widgetId === this.props.id`)
2. Set `shouldUseInitialQueryValueForSelection` to `true`
3. Call `urlConsumptionManager.checkUrlParameters()`

**Logging:**
```typescript
debugLogger.log('HASH-EXEC', {
  event: 'querysimple-handleopenwidgetevent-called',
  widgetId: id,
  eventWidgetId: event.detail.widgetId,
  willProcess: event.detail.widgetId === id
})
```

#### 5. QuerySimple Processes Hash Parameter

**Code:** `query-simple/src/runtime/hooks/use-url-consumption.ts` - `UrlConsumptionManager.checkUrlParameters()`

**Process:**
1. Parse hash/query string for `shortId` values
2. Find matching query item by `shortId`
3. Call `onInitialValueFound` callback with `{ shortId, value }`

**Logging:**
```typescript
debugLogger.log('HASH', {
  event: 'url-param-detected',
  shortId,
  value,
  foundIn: 'hash' | 'query'
})
```

#### 6. QuerySimple Sets Initial Value

**Code:** `query-simple/src/runtime/widget.tsx` - `onInitialValueFound` callback

**Process:**
1. Check if `shortId:value` was already processed (`processedHashParamsRef.has(paramKey)`)
2. If already processed, return early (prevent re-execution)
3. Set `initialQueryValue` state
4. Set `shouldUseInitialQueryValueForSelection` to `true` (if not already set)

**Logging:**
```typescript
debugLogger.log('HASH-EXEC', {
  event: 'querysimple-oninitialvaluefound-called',
  shortId,
  value,
  alreadyProcessed: processedHashParamsRef.has(paramKey)
})
```

#### 7. QuerySimple Selects Query and Populates Form

**Code:** `query-simple/src/runtime/query-task-list.tsx` - `effectiveInitialQueryValue` calculation

**Process:**
1. Check `shouldUseInitialQueryValueForSelection` flag
2. If `true`, use `initialQueryValue` to select matching query
3. Pass `initialInputValue` prop to `QueryTaskForm`
4. Form sets value in input field

**Logging:**
```typescript
debugLogger.log('GROUP', {
  event: 'effectiveInitialQueryValue-calculated',
  shouldUseInitialQueryValueForSelection,
  hasInitialQueryValue: !!initialQueryValue
})
```

#### 8. QuerySimple Executes Query

**Code:** `query-simple/src/runtime/query-task-form.tsx` - Hash value setting and conversion

**Process:**
1. Ensure Query tab is active (switch if needed)
2. Set hash value in React state (`attributeFilterSqlExprObj`)
3. Set value in DOM input element (for `SqlExpressionRuntime`)
4. Wait for `SqlExpressionRuntime` to convert value (string → array format)
5. Execute query via `applyQuery()`

**Logging:**
```typescript
debugLogger.log('FORM', {
  event: 'hash-value-setting-start',
  initialInputValue,
  activeTab
})
```

#### 9. QuerySimple Completes Query Execution

**Code:** `query-simple/src/runtime/query-task.tsx` - `handleFormSubmitInternal()` method

**Process:**
1. Execute query
2. Update result count
3. Set stage to 1 (show results)
4. Zoom to records (if enabled)
5. **THEN** call `onHashParameterUsed(queryItem.shortId)` callback

**Critical:** `onHashParameterUsed` is called **AFTER** all UI updates and async operations complete to prevent parent re-render from interrupting the promise chain.

**Logging:**
```typescript
debugLogger.log('TASK', {
  event: 'hash-query-executed-notifying-parent',
  queryItemShortId: queryItem.shortId
})
```

#### 10. QuerySimple Clears Hash State

**Code:** `query-simple/src/runtime/widget.tsx` - `handleHashParameterUsed()` method

**Process:**
1. Track `shortId:value` pair in `processedHashParamsRef`
2. **Atomically** clear both `shouldUseInitialQueryValueForSelection` and `initialQueryValue`
3. Dispatch `querysimple-hash-query-executed` event

**Critical:** Both state values must be cleared atomically in a single `setState` call to prevent race conditions.

**Logging:**
```typescript
debugLogger.log('HASH-EXEC', {
  event: 'querysimple-handlehashparameterused-state-cleared',
  shortId,
  newState: {
    shouldUseInitialQueryValueForSelection: false,
    hasInitialQueryValue: false
  }
})
```

#### 11. HelperSimple Tracks Executed Hash

**Code:** `helper-simple/src/runtime/widget.tsx` - `handleHashQueryExecuted()` method

**Process:**
1. Verify event is for managed widget
2. Update `lastExecutedHash` with `hashParam` from event
3. This prevents HelperSimple from re-opening widget for the same hash

**Logging:**
```typescript
debugLogger.log('HASH-EXEC', {
  event: 'helpersimple-last-executed-hash-updated',
  lastExecutedHash: this.lastExecutedHash
})
```

---

## Preventing Re-Execution: Multi-Layer Defense

### Problem: Hash Parameters Re-Execute When Switching Queries

**Scenario:** User executes `#pin=123`, switches to "major" query, then switches back to "pin" query. The hash value re-pops into the form and re-executes.

### Solution: Three-Layer Defense

#### Layer 1: HelperSimple Tracking (`lastExecutedHash`)

**Purpose:** Prevent HelperSimple from re-opening widget for already-executed hash  
**Implementation:** `helper-simple/src/runtime/widget.tsx` - `checkUrlParameters()`  
**Check:** `if (currentHash === this.lastExecutedHash) return`

**Limitation:** Only prevents HelperSimple from re-triggering. Doesn't prevent QuerySimple from autonomous processing.

#### Layer 2: QuerySimple Parameter Tracking (`processedHashParamsRef`)

**Purpose:** Prevent QuerySimple from re-processing the same `shortId:value` pair  
**Implementation:** `query-simple/src/runtime/widget.tsx` - `onInitialValueFound` callback  
**Check:** `if (processedHashParamsRef.has(paramKey)) return`

**Format:** Stores `"shortId:value"` pairs (e.g., `"pin:2223059013"`)  
**Why:** Hash string can change even if relevant parameter remains (e.g., `#pin=123&other=value` → `#pin=123`)

**Limitation:** Only prevents re-processing in `onInitialValueFound`. Doesn't prevent state-based re-selection.

#### Layer 3: QuerySimple State Clearing (`shouldUseInitialQueryValueForSelection` + `initialQueryValue`)

**Purpose:** Prevent QuerySimple from using stale hash state to re-select query  
**Implementation:** `query-simple/src/runtime/widget.tsx` - `handleHashParameterUsed()` method  
**Action:** Atomically clear both state values after hash query executes

**Critical:** Must be cleared atomically in single `setState` call:
```typescript
this.setState({ 
  shouldUseInitialQueryValueForSelection: false,
  initialQueryValue: undefined
})
```

**Why:** If cleared separately, React might re-render between clears, causing `query-task-list.tsx` to see `shouldUseInitialQueryValueForSelection: true` with `initialQueryValue: undefined`, leading to incorrect behavior.

---

## Key Failures and Lessons Learned

### Failure 1: React Ref Instead of State (r018.43)

**Problem:** `shouldUseInitialQueryValueForSelectionRef` was implemented as a React ref  
**Why It Failed:** Refs don't trigger re-renders. When `handleHashParameterUsed` set `.current = false`, React didn't re-render, so `query-task-list.tsx` never saw the flag change.  
**Fix:** Convert to React state variable  
**Lesson:** Use refs for mutable values that don't affect rendering. Use state for values that affect component rendering or prop passing.

### Failure 2: Missing Callback (r018.46)

**Problem:** `onHashParameterUsed` callback was never called after hash query execution  
**Why It Failed:** Without the callback, `handleHashParameterUsed` never ran, so state was never cleared.  
**Fix:** Call `onHashParameterUsed(queryItem.shortId)` after query completes successfully  
**Lesson:** Always verify callbacks are actually called. Log callback invocation to verify.

### Failure 3: Callback Called Too Early (r018.47)

**Problem:** `onHashParameterUsed` was called before `setResultCount` and `setStage(1)`  
**Why It Failed:** Parent re-render interrupted the promise chain, preventing zoom and results display  
**Fix:** Move callback to AFTER all UI updates and async operations complete  
**Lesson:** Callbacks that trigger parent re-renders should be called AFTER all child operations complete.

### Failure 4: Hash State Not Cleared Atomically (r018.52)

**Problem:** `shouldUseInitialQueryValueForSelection` and `initialQueryValue` were cleared separately  
**Why It Failed:** React might re-render between clears, causing race conditions  
**Fix:** Clear both values atomically in single `setState` call  
**Lesson:** Related state updates should be atomic to prevent intermediate states.

### Failure 5: Input Value Cleared After Execution (r018.54-55)

**Problem:** Input field value was cleared after hash/user query execution  
**Why It Failed:** When `initialInputValue` became `undefined`, condition `!initialInputValue` caused form to reset  
**Fix:** Only update `attributeFilterSqlExprObj` if no value is set yet OR configId changed  
**Lesson:** Preserve user-entered values unless explicitly resetting (Reset button, query switch, etc.)

### Failure 6: Remove Mode Not Resetting (r018.56)

**Problem:** Mode stayed on "Remove" when all accumulated records cleared  
**Why It Failed:** `handleAccumulatedRecordsChange` didn't check if mode should reset  
**Fix:** Check if in Remove mode and records cleared, reset to NewSelection  
**Lesson:** Mode state should reflect current capability. Remove mode requires accumulated records to function.

---

## Debug Switches

### For Hash Parameter Testing

**Enable All Hash-Related Logging:**
```
?debug=HASH-EXEC,HASH,GROUP,FORM
```

**Individual Switches:**
- **`HASH-EXEC`** - Hash execution flow logs (HelperSimple → QuerySimple → execution)
- **`HASH`** - Hash parameter detection logs
- **`GROUP`** - Query selection logs (query-task-list.tsx)
- **`FORM`** - Form value setting logs (query-task-form.tsx)

### For Chunk 5 Testing

**Enable Chunk 5 Comparison Logging:**
```
?debug=CHUNK-5-COMPARE,RESULTS-MODE,FORM
```

**Individual Switches:**
- **`CHUNK-5-COMPARE`** - Accumulated records comparison logs (old vs new implementation)
- **`RESULTS-MODE`** - Results mode state change logs
- **`FORM`** - Form value setting logs

---

## Code Locations Reference

### HelperSimple

- **Event Dispatch:** `helper-simple/src/runtime/widget.tsx` - `openWidget()` method
- **Hash Detection:** `helper-simple/src/runtime/widget.tsx` - `checkUrlParameters()` method
- **Hash Change Listener:** `helper-simple/src/runtime/widget.tsx` - `handleHashChange()` method
- **Executed Hash Tracking:** `helper-simple/src/runtime/widget.tsx` - `handleHashQueryExecuted()` method

### QuerySimple

- **Event Listener:** `query-simple/src/runtime/widget.tsx` - `handleOpenWidgetEvent()` method
- **Hash State Management:** `query-simple/src/runtime/widget.tsx` - `onInitialValueFound` callback, `handleHashParameterUsed()` method
- **Hash Processing:** `query-simple/src/runtime/hooks/use-url-consumption.ts` - `UrlConsumptionManager.checkUrlParameters()`
- **Query Selection:** `query-simple/src/runtime/query-task-list.tsx` - `effectiveInitialQueryValue` calculation
- **Form Value Setting:** `query-simple/src/runtime/query-task-form.tsx` - Hash value `useEffect`
- **Query Execution:** `query-simple/src/runtime/query-task.tsx` - `handleFormSubmitInternal()` method
- **Event Dispatch:** `query-simple/src/runtime/query-task.tsx` - After `onHashParameterUsed` callback

---

## Testing Scenarios

### Scenario 1: Initial Hash Query Execution

**Steps:**
1. Navigate to `#pin=2223059013`
2. Verify HelperSimple opens QuerySimple
3. Verify QuerySimple selects "pin" query
4. Verify input field populated with value
5. Verify query executes automatically
6. Verify results display and zoom works

**Expected Logs:**
- `helpersimple-handlehashchange-fired`
- `helpersimple-checkurl-opening-widget-shortid-match`
- `helpersimple-open-widget-start`
- `querysimple-handleopenwidgetevent-called`
- `querysimple-oninitialvaluefound-called`
- `hash-value-setting-start`
- `query-execution-complete`
- `querysimple-handlehashparameterused-state-cleared`
- `helpersimple-last-executed-hash-updated`

### Scenario 2: Hash Re-Execution Prevention

**Steps:**
1. Execute `#pin=2223059013` (Scenario 1)
2. Switch to "major" query
3. Switch back to "pin" query
4. Verify hash does NOT re-execute
5. Verify input field still shows value (visual record)

**Expected Behavior:**
- Hash does NOT re-execute
- Input field shows value (preserved as visual record)
- No results appear automatically
- User can manually execute if desired

**Expected Logs:**
- `helpersimple-checkurl-skipping-already-executed-hash` (Layer 1 defense)
- OR `querysimple-oninitialvaluefound-already-processed` (Layer 2 defense)
- OR `effectiveInitialQueryValue-calculated` with `shouldUseInitialQueryValueForSelection: false` (Layer 3 defense)

### Scenario 3: New Hash Parameter

**Steps:**
1. Execute `#pin=2223059013`
2. Change hash to `#pin=5568900000` (different value)
3. Verify new hash executes

**Expected Behavior:**
- New hash executes (different value = new query)
- Old value cleared, new value set
- Query executes automatically

---

## Summary: Who Controls What

### HelperSimple Controls:
- ✅ **When** QuerySimple processes hash parameters (via `OPEN_WIDGET_EVENT`)
- ✅ **Which** hash parameters trigger widget opening (`checkUrlParameters`)
- ✅ **Tracking** executed hashes (`lastExecutedHash`)

### QuerySimple Controls:
- ✅ **How** hash parameters are processed (form population, query selection)
- ✅ **When** hash state is cleared (after successful execution)
- ✅ **Tracking** processed parameters (`processedHashParamsRef`)
- ✅ **Preserving** input values as visual records

### Neither Controls:
- ❌ QuerySimple does NOT autonomously check URL parameters
- ❌ QuerySimple does NOT process hash parameters without HelperSimple's explicit trigger
- ❌ HelperSimple does NOT populate QuerySimple's form (QuerySimple handles that)

---

## Critical Rules

1. **QuerySimple Never Autonomously Processes Hash Parameters**
   - QuerySimple only processes hash when `OPEN_WIDGET_EVENT` is received
   - QuerySimple does NOT check URL parameters on mount or update

2. **Hash State Must Be Cleared Atomically**
   - Both `shouldUseInitialQueryValueForSelection` and `initialQueryValue` must be cleared in single `setState` call
   - Prevents race conditions and intermediate states

3. **Input Values Are Visual Records**
   - Input values persist after query execution (both hash and user-entered)
   - Only cleared by: Reset button, query switch, or manual clearing

4. **Mode State Reflects Capability**
   - Remove mode resets to NewSelection when all accumulated records cleared
   - Mode state should always reflect current functionality

5. **Events Are One-Way Communication**
   - HelperSimple → QuerySimple: `OPEN_WIDGET_EVENT`
   - QuerySimple → HelperSimple: `querysimple-hash-query-executed`
   - No circular dependencies or bidirectional communication

---

**End of Document**


