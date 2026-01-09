# SqlExpressionRuntime DOM Manipulation Workaround

**Created:** 2026-01-09  
**Versions:** r018.108-128 (hash execution fixes)  
**File:** `query-simple/src/runtime/query-task-form.tsx`  
**Lines:** ~1114-1300

---

## 🚨 Problem Statement

`SqlExpressionRuntime` is an Experience Builder component that provides a text input field for SQL expressions. However, it does **NOT** support programmatic value population, which breaks hash parameter execution (e.g., `#pin=2223059013`).

### What We Need

When a hash parameter arrives:
1. Populate the `SqlExpressionRuntime` text field with the hash value
2. Trigger the component's internal `onChange` handler
3. Allow it to convert the value from string → array format
4. Execute the query with the correctly formatted array

### What Doesn't Work

#### ❌ Attempt 1: Set `expression` Prop
```typescript
<SqlExpressionRuntime
  expression={updatedExpression}  // ❌ Component ignores this
  onChange={handleChange}
/>
```
**Result:** Text field remains empty, `onChange` never fires.

#### ❌ Attempt 2: Force Remount with `key` Prop
```typescript
<SqlExpressionRuntime
  key={`${configId}-${hashValue}`}  // ❌ Still doesn't populate
  expression={updatedExpression}
  onChange={handleChange}
/>
```
**Result:** Component remounts but text field still empty.

#### ❌ Attempt 3: Direct `applyQuery()` Call
```typescript
setExpression(hashValue)
applyQuery()  // ❌ Wrong format - sends string instead of array
```
**Result:** Query executes with blank value (returns 1000 records).

---

## ✅ Solution: DOM Manipulation

Since `SqlExpressionRuntime` only responds to actual user interactions, we simulate user input by directly manipulating the DOM.

### Implementation Flow

```
1. Hash parameter arrives (#pin=2223059013)
   ↓
2. MutationObserver detects input[type="text"] appears in DOM
   ↓
3. Double requestAnimationFrame (ensures React handlers attached)
   ↓
4. inputField.focus()
   ↓
5. inputField.value = "2223059013"
   ↓
6. Dispatch input/change events
   ↓
7. inputField.blur() ← CRITICAL: Triggers SqlExpressionRuntime.onChange
   ↓
8. SqlExpressionRuntime converts "2223059013" → [{value: "2223059013", label: "2223059013"}]
   ↓
9. handleSqlExprObjChange detects conversion
   ↓
10. Fires QUERYSIMPLE_HASH_VALUE_CONVERTED_EVENT
   ↓
11. Query executes with correct array format ✅
```

### Key Technical Details

#### 1. MutationObserver (Event-Driven)

```typescript
const observer = new MutationObserver((mutationsList, observer) => {
  const inputField = container.querySelector('input[type="text"]') as HTMLInputElement
  if (inputField) {
    populateInputField(inputField)
    observer.disconnect()
  }
})
observer.observe(container, { childList: true, subtree: true })
```

**Why:** Detects when `SqlExpressionRuntime` renders its input field. No polling, no setTimeout.

#### 2. Double requestAnimationFrame

```typescript
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    // NOW it's safe to manipulate
  })
})
```

**Why:** 
- First RAF: Waits for browser paint
- Second RAF: Ensures React commit phase completes
- Result: SqlExpressionRuntime's `onChange` handler is attached

Without this, the blur() happens before the handler is attached, and `onChange` never fires.

#### 3. Focus/Blur Cycle

```typescript
inputField.focus()
inputField.value = hashValue
// ... dispatch events ...
inputField.blur()  // ← CRITICAL
```

**Why:** `SqlExpressionRuntime` only converts string→array format **on blur**. The blur event triggers its internal validation and conversion logic.

#### 4. Event Dispatching

```typescript
// Standard DOM event
const inputEvent = new Event('input', { bubbles: true })
inputField.dispatchEvent(inputEvent)

// React synthetic event
const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
  window.HTMLInputElement.prototype, 
  'value'
)?.set
nativeInputValueSetter.call(inputField, hashValue)
```

**Why:** Covers both standard DOM listeners and React synthetic event system.

---

## 🧪 Testing Evidence

### Test Iterations (r018.108-128)

| Version | Approach | Result |
|---------|----------|--------|
| r018.108 | `setTimeout` + DOM manipulation | ✅ Works but uses setTimeout |
| r018.109-110 | Wait for `outputDS` ready | ❌ Race condition |
| r018.112-113 | Remove `setTimeout`, pure React | ❌ No execution |
| r018.114 | Direct `applyQuery()` call | ❌ Wrong format (1000 records) |
| r018.115-117 | Preserve values, key-based remount | ❌ Text field empty |
| r018.118-121 | MutationObserver + direct call | ❌ Wrong format |
| r018.122 | MutationObserver + focus/blur | ✅ Works! |
| r018.123-125 | Fix subsequent queries | ✅ Works! |
| r018.128 | Fix tab switching loop | ✅ All 3 queries work! |

### Test Scenarios Verified

1. ✅ First hash query: `#pin=2223059013` → Executes correctly
2. ✅ Second hash query: `#major=222305` → Executes correctly
3. ✅ Third hash query: `#pin=2223059013` (repeat) → Executes correctly
4. ✅ Tab auto-switches to Results after execution
5. ✅ No infinite loops or race conditions

---

## 📝 Maintenance Guidelines

### When Can This Be Removed?

**IF** Esri updates `SqlExpressionRuntime` to support programmatic value population via the `expression` prop, this workaround can be removed.

**Test by:**
1. Remove DOM manipulation code
2. Try: `<SqlExpressionRuntime expression={updatedExpression} />`
3. Verify hash query populates text field and executes

### If Issues Arise

**Common symptoms:**
- Hash queries don't execute
- Text field stays empty
- Query returns 1000 records (blank query)
- Only first query works, subsequent fail

**Debug steps:**
1. Enable `debug=FORM` in URL
2. Check logs for:
   - `hash-dom-input-found`
   - `hash-dom-value-populated`
   - `form-conversion-check`
   - `form-WILL-EXECUTE-applyQuery`
3. Verify `hashTriggeredRef` is being set/reset correctly
4. Check MutationObserver is finding the input field
5. Ensure double RAF is running (not removed for performance)

### Related Code

**Files:**
- `query-task-form.tsx`: DOM manipulation logic
- `query-task.tsx`: Tab switching logic (r018.128)
- `shared-code/common/debug-logger.ts`: FORM feature flag

**Events:**
- `QUERYSIMPLE_HASH_VALUE_CONVERTED_EVENT`: Fired after string→array conversion
- `querysimple-apply-query-event`: Fired to trigger query execution

**Debug Switches:**
- `debug=FORM`: Shows form-level events
- `debug=HASH-EXEC`: Shows hash execution flow

---

## 🔗 References

**Development History:**
- See `CURRENT_WORK.md` → r018.108-128 for detailed iteration notes
- See Git commit messages for r018.108-128 for specific fixes

**Related Issues:**
- Hash re-execution (r018.101-102): Prevented by widget state, not SqlExpressionRuntime
- Tab switching loop (r018.128): Separate issue, but related to hash execution flow

**ExB Documentation:**
- SqlExpressionRuntime: Limited official documentation
- Component source: ExB framework (not modifiable)

---

## 💡 Lessons Learned

1. **Black-box components require workarounds** - When a framework component doesn't expose needed APIs, DOM manipulation may be the only option.

2. **Event-driven > setTimeout** - MutationObserver is cleaner and more reliable than polling or arbitrary delays.

3. **Double RAF is not overkill** - React's commit phase timing matters. The first RAF isn't always enough.

4. **Test edge cases** - Sequential hash queries revealed issues that single queries didn't.

5. **Document thoroughly** - Future developers (including us) will question this approach. Clear documentation prevents regression.

---

**Last Updated:** 2026-01-09  
**Maintained By:** Adam Cabrera  
**Status:** ✅ Production-ready, extensively tested
