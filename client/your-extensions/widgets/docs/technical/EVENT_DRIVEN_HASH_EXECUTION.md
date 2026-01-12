# Event-Driven Hash Parameter Execution Pattern

## Overview

This document describes the **critical event-driven pattern** for executing hash-triggered queries in QuerySimple. This pattern ensures queries execute with the correct data format and prevents race conditions.

## The Problem

When a hash parameter is set in the URL (e.g., `#pin=5568900000`), the value must go through a conversion process:

1. **Initial State**: Value is set as a STRING (`"5568900000"`)
2. **Conversion Required**: `SqlExpressionRuntime` converts string → array format (`[{value: "5568900000", label: "5568900000"}]`)
3. **Query Execution**: Queries REQUIRE array format - executing with string format returns unfiltered results (1000 records instead of 1)

## The Solution: Event-Driven Flow

### Flow Diagram

```
Hash Parameter Detected
    ↓
Value Set in State (STRING format)
    ↓
DOM Manipulation Triggers SqlExpressionRuntime
    ↓
SqlExpressionRuntime Converts: string → array
    ↓
handleSqlExprObjChange Detects Conversion
    ↓
QUERYSIMPLE_HASH_VALUE_CONVERTED_EVENT Dispatched
    ↓
Query Executes (with correct array format)
```

### Code Flow

1. **Hash value set in state** (`query-task-form.tsx`):
   ```typescript
   setAttributeFilterSqlExprObj("5568900000") // STRING format
   ```

2. **DOM manipulation triggers conversion** (`query-task-form.tsx`):
   ```typescript
   // setTimeout manipulates DOM to trigger SqlExpressionRuntime
   // SqlExpressionRuntime processes the value and converts it
   ```

3. **Conversion detected** (`handleSqlExprObjChange` in `query-task-form.tsx`):
   ```typescript
   if (isArrayFormat && hasInitialValue && matchesHashValue) {
     // Dispatch event
     document.dispatchEvent(new CustomEvent(QUERYSIMPLE_HASH_VALUE_CONVERTED_EVENT, {...}))
     
     // Execute query (after event is dispatched)
     if (hashTriggeredRef.current && datasourceReady && outputDS) {
       applyQuery() // Executes with correct array format
     }
   }
   ```

4. **Event listener handles async case** (`query-task.tsx`):
   ```typescript
   document.addEventListener(QUERYSIMPLE_HASH_VALUE_CONVERTED_EVENT, (event) => {
     if (pendingHashQueryRef.current) {
       // Execute pending query now that value is converted
       handleFormSubmitInternal(sqlExpr, spatialFilter, runtimeZoomToSelected)
     }
   })
   ```

## Critical Rules

### ✅ DO: Use Event-Driven Flow

- **ONLY** execute queries after `QUERYSIMPLE_HASH_VALUE_CONVERTED_EVENT` is dispatched
- **ONLY** execute queries in `handleSqlExprObjChange` after conversion is detected
- **ONLY** execute queries in the event listener in `query-task.tsx`
- **ALWAYS** wait for conversion (string → array) before executing

### ❌ DON'T: Circumvent Event-Driven Flow

- **NEVER** add `useEffect` hooks that execute queries based on string values
- **NEVER** execute queries before `QUERYSIMPLE_HASH_VALUE_CONVERTED_EVENT` is dispatched
- **NEVER** check for string values and execute queries early
- **NEVER** bypass the conversion detection logic

## Anti-Pattern Example (REMOVED)

The following code was **removed** because it circumvented the event-driven flow:

```typescript
// ❌ WRONG: This executes queries BEFORE conversion happens
React.useEffect(() => {
  const currentValue = attributeFilterSqlExprObjRef.current?.parts?.[0]?.valueOptions?.value
  const isHashValue = hashTriggeredRef.current && 
                     typeof currentValue === 'string' && 
                     currentValue === initialInputValue
  
  if (isHashValue) {
    applyQuery() // ❌ Executes with STRING format → returns 1000 unfiltered records
  }
}, [attributeFilterSqlExprObj, hashTriggeredRef, initialInputValue, ...])
```

**Why this is wrong:**
- Executes queries when value is still in STRING format
- Queries require ARRAY format to filter correctly
- Results in 1000 unfiltered records instead of 1 filtered record
- Breaks the event-driven pattern

## Why This Pattern Exists

1. **SqlExpressionRuntime Behavior**: Only fires `onChange` when value is converted to array format
2. **Query Requirements**: Queries require array format - string format doesn't filter correctly
3. **Race Condition Prevention**: Ensures queries execute only after conversion is complete
4. **Single Source of Truth**: Event-driven flow is the ONLY execution path

## Debugging

When debugging hash-triggered queries, look for these log events in order:

1. `hash-value-setting-start` - Hash value being set in state
2. `hash-value-setting-react-state` - Value set as string
3. `SqlExpressionRuntime-props-changed` - Component receiving string value
4. `input-focused` / `input-typing` - DOM manipulation triggering conversion
5. `handleSqlExprObjChange-called` - Conversion detected
6. `hash-value-converted-to-array` - Conversion confirmed
7. `hash-value-converted-event-dispatched` - Event fired
8. `hash-value-converted-executing-query-directly` - Query executing (correct path)
9. `query-execution-complete` - Query completed with correct results

**Red Flag**: If you see `hash-value-ready-for-execution` before `hash-value-converted-to-array`, you're executing too early!

## Related Files

- `query-simple/src/runtime/query-task-form.tsx` - Conversion detection and event dispatch
- `query-simple/src/runtime/query-task.tsx` - Event listener and query execution
- `query-simple/FIXES_HASH_TAB_ACTIVE.md` - Related fix for tab switching

## Version History

- **r018.44**: Removed early-execution `useEffect` that circumvented event-driven flow
- **r018.43**: Fixed hash re-execution on query switch
- **r018.42**: Implemented event-driven waiting for hash conversion
- **r018.41**: Fixed hash queries not executing when Query tab wasn't active


