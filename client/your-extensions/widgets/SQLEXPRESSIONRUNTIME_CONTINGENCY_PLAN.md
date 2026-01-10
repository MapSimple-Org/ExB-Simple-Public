# SqlExpressionRuntime Contingency Plan
## "Break Glass" Strategy for DOM Workaround Failures

**Purpose:** Define detection mechanisms, escalation paths, and replacement strategies if the `SqlExpressionRuntime` DOM manipulation workaround becomes unstable or breaks in future Experience Builder versions.

**Status:** ✅ Current workaround is stable (r018.125)  
**Last Verified:** January 2026 (ExB 1.19)  
**Risk Level:** 🟡 Medium (fragile but working)

---

## 🔍 **Detection: How We Know It's Breaking**

### Automatic Detection (E2E Tests)

Our Playwright tests in `tests/e2e/query-simple/hash-reexecution.spec.ts` will catch failures:

```typescript
// Test: "should auto-execute query from hash parameter"
// Failure indicators:
- Hash value appears in URL but query doesn't execute
- Console logs show "DOM-INJECT-ATTEMPT" but no "query-applied"
- Results tab doesn't activate after hash execution
- Zero records returned when records are expected
```

**Monitor These Logs:**
```javascript
debugLogger.log('HASH-EXEC', {
  event: 'dom-manipulation-attempt',
  foundInputField: !!inputField,
  timestamp: Date.now()
})

debugLogger.log('HASH-EXEC', {
  event: 'dom-manipulation-success',
  valueSet: inputField.value,
  timestamp: Date.now()
})
```

**Red Flags:**
- ✅ `dom-manipulation-attempt` logged but ❌ no `dom-manipulation-success`
- ✅ `dom-manipulation-success` logged but ❌ no query execution
- ❌ Console errors about "Cannot read properties of null" on input field
- ❌ `MutationObserver` never fires (input field selector changed)

### Manual Detection (User Reports)

**Symptoms users will report:**
1. "Hash links don't work anymore"
2. "Query value appears but doesn't run automatically"
3. "Apply button is enabled but nothing happens"
4. "First query works, second one doesn't"
5. "Widget works in Chrome but not Safari/Firefox" (browser-specific DOM timing)

---

## 🚨 **Breakage Scenarios & Root Causes**

| Scenario | Likely Cause | Severity | Detection Method |
|----------|--------------|----------|------------------|
| **Input field selector changes** | Esri refactors `SqlExpressionRuntime` internals | 🔴 **Critical** | E2E test fails + console errors |
| **React event handlers detach** | Esri changes event binding timing | 🟠 **High** | Value populates but `onChange` doesn't fire |
| **MutationObserver never triggers** | Esri lazy-loads SQL component differently | 🟠 **High** | Hash value appears in URL but no DOM injection attempt |
| **Double RAF insufficient** | Browser changes `requestAnimationFrame` behavior | 🟡 **Medium** | Works in some browsers, fails in others |
| **Input field becomes read-only** | Esri locks down the component | 🔴 **Critical** | DOM manipulation silently fails |
| **New ExB version (1.20+)** | Breaking changes in Jimu UI library | 🟠 **High** | Upgrade triggers E2E test failures |

---

## 📋 **Escalation Ladder: Response Strategies**

### **Level 1: Quick Fixes (1-4 hours)**
*Try these first - low effort, might resolve the issue*

#### 1A. Update Input Field Selector
**If:** Console shows "Cannot find input field"

```typescript
// Current selector (r018.125)
const inputField = inputContainer.querySelector('input[type="text"]') as HTMLInputElement

// Try these alternatives:
const alternatives = [
  'input[type="text"]',           // Current
  'textarea',                      // Old selector (pre-r018.120)
  'input.jimu-input',             // Class-based
  '[data-testid="sql-input"]',    // Test ID (if Esri adds it)
  '.sql-expression-input',        // Potential new class
  'input[aria-label*="expression"]' // ARIA-based
]
```

**Action:** Add a **fallback chain** in `query-task-form.tsx`:

```typescript
const findInputField = (container: HTMLElement): HTMLInputElement | null => {
  const selectors = [
    'input[type="text"]',
    'textarea',
    'input.jimu-input',
    '.sql-expression-input'
  ]
  
  for (const selector of selectors) {
    const field = container.querySelector(selector) as HTMLInputElement
    if (field) {
      debugLogger.log('HASH-EXEC', { event: 'found-input-with-selector', selector })
      return field
    }
  }
  
  debugLogger.log('HASH-EXEC', { event: 'input-field-not-found', attemptedSelectors: selectors })
  return null
}
```

#### 1B. Increase RAF Depth
**If:** Timing issues (value sets but `onChange` doesn't fire)

```typescript
// Current: Double RAF (r018.125)
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    // DOM manipulation
  })
})

// Try: Triple RAF
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // DOM manipulation
    })
  })
})

// Or: RAF + setTimeout hybrid
requestAnimationFrame(() => {
  setTimeout(() => {
    // DOM manipulation
  }, 10)
})
```

#### 1C. Force React Re-render
**If:** `SqlExpressionRuntime` internal state is stale

```typescript
// Add a force-remount mechanism using `key` prop
const [sqlExpressionKey, setSqlExpressionKey] = React.useState(0)

// In the hash consumption useEffect:
if (props.initialInputValue) {
  // Force SqlExpressionRuntime to remount
  setSqlExpressionKey(prev => prev + 1)
}

// In the JSX:
<SqlExpressionRuntime
  key={`sql-expr-${sqlExpressionKey}`}
  // ... other props
/>
```

---

### **Level 2: Workaround Improvements (1-2 days)**
*More robust approaches, still using DOM manipulation*

#### 2A. Polling-Based Detection
**If:** `MutationObserver` becomes unreliable

```typescript
const pollForInputField = (
  container: HTMLElement,
  callback: (field: HTMLInputElement) => void,
  maxAttempts = 10
) => {
  let attempts = 0
  
  const poll = () => {
    const inputField = findInputField(container)
    
    if (inputField) {
      debugLogger.log('HASH-EXEC', { event: 'poll-found-input', attempts })
      callback(inputField)
    } else if (attempts < maxAttempts) {
      attempts++
      requestAnimationFrame(poll)
    } else {
      debugLogger.log('HASH-EXEC', { event: 'poll-timeout', attempts })
    }
  }
  
  poll()
}
```

#### 2B. Native Event Dispatch
**If:** Focus/blur cycle stops triggering `onChange`

```typescript
// Current approach: focus() → set value → blur()
// Alternative: Dispatch native events explicitly

const setInputValueWithEvents = (inputField: HTMLInputElement, value: string) => {
  // Set the value using native setter
  const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
  nativeSetter?.call(inputField, value)
  
  // Dispatch all relevant events
  const events = [
    new Event('input', { bubbles: true }),
    new Event('change', { bubbles: true }),
    new KeyboardEvent('keyup', { bubbles: true }),
    new FocusEvent('blur', { bubbles: true })
  ]
  
  events.forEach(event => inputField.dispatchEvent(event))
  
  debugLogger.log('HASH-EXEC', { event: 'native-events-dispatched', value })
}
```

#### 2C. Intercept SqlExpressionRuntime Props
**If:** We can access the component's internal methods

```typescript
// Use React's ref system to access SqlExpressionRuntime internals
const sqlExpressionRef = React.useRef<any>(null)

React.useEffect(() => {
  if (props.initialInputValue && sqlExpressionRef.current) {
    // Try to call internal methods directly (if exposed)
    if (typeof sqlExpressionRef.current.updateExpression === 'function') {
      sqlExpressionRef.current.updateExpression(props.initialInputValue)
      debugLogger.log('HASH-EXEC', { event: 'called-internal-method' })
    }
  }
}, [props.initialInputValue])

// In JSX:
<SqlExpressionRuntime
  ref={sqlExpressionRef}
  // ... other props
/>
```

---

### **Level 3: Hybrid Approach (3-5 days)**
*Build a thin wrapper around SqlExpressionRuntime*

#### 3A. Controlled Wrapper Component

Create `src/runtime/controlled-sql-expression.tsx`:

```typescript
/**
 * ControlledSqlExpression
 * 
 * A thin wrapper around SqlExpressionRuntime that makes it behave like
 * a controlled React component. Handles prop updates predictably without
 * DOM manipulation.
 */
export const ControlledSqlExpression: React.FC<{
  dataSourceId: string
  expression: string
  onChange: (expression: string) => void
  useDataSources: UseDataSource[]
}> = (props) => {
  const [internalExpression, setInternalExpression] = React.useState(props.expression)
  const [key, setKey] = React.useState(0)
  const isExternalUpdate = React.useRef(false)
  
  // When expression prop changes externally, force remount
  React.useEffect(() => {
    if (props.expression !== internalExpression && !isExternalUpdate.current) {
      debugLogger.log('SQL-WRAPPER', { event: 'external-update-detected', newExpression: props.expression })
      setInternalExpression(props.expression)
      setKey(prev => prev + 1) // Force remount
    }
    isExternalUpdate.current = false
  }, [props.expression, internalExpression])
  
  const handleChange = (newExpression: string) => {
    isExternalUpdate.current = true
    setInternalExpression(newExpression)
    props.onChange(newExpression)
  }
  
  return (
    <SqlExpressionRuntime
      key={`sql-expr-${key}`}
      dataSourceId={props.dataSourceId}
      expression={internalExpression}
      onChange={handleChange}
      useDataSources={props.useDataSources}
    />
  )
}
```

**Benefits:**
- ✅ No DOM manipulation
- ✅ Predictable prop updates
- ✅ Still uses Esri's SQL generation
- ✅ Quick to implement (3-5 days)

**Drawbacks:**
- ⚠️ Remounting might cause UI flicker
- ⚠️ Loses focus on remount
- ⚠️ Still dependent on Esri's component

---

### **Level 4: Minimal SimpleQEngine (1-2 weeks)**
*Build our own replacement - ONLY if Levels 1-3 fail*

#### 4A. Minimal Viable Replacement Spec

**Goal:** Match our CURRENT feature set, not the full SQL Expression Builder

**Features to Implement:**

1. **Text Input Field** (controlled React component)
   ```typescript
   <input
     type="text"
     value={expression}
     onChange={(e) => props.onChange(e.target.value)}
     placeholder="Enter SQL expression (e.g., PARCELID = '123456')"
   />
   ```

2. **Field Picker Button** (reuse existing Jimu components)
   ```typescript
   import { FieldSelector } from 'jimu-ui/advanced/data-source-selector'
   
   <FieldSelector
     dataSourceId={props.dataSourceId}
     useDataSources={props.useDataSources}
     onChange={(fieldName) => insertFieldAtCursor(fieldName)}
   />
   ```

3. **Basic SQL Validation** (client-side)
   ```typescript
   const validateSQL = (expression: string): { valid: boolean, error?: string } => {
     if (!expression.trim()) return { valid: true }
     
     // Basic SQL injection prevention
     const dangerousPatterns = [
       /;\s*DROP/i,
       /;\s*DELETE/i,
       /;\s*INSERT/i,
       /--/,
       /\/\*/
     ]
     
     for (const pattern of dangerousPatterns) {
       if (pattern.test(expression)) {
         return { valid: false, error: 'Invalid SQL expression' }
       }
     }
     
     return { valid: true }
   }
   ```

4. **Apply Button** (same as now)
   ```typescript
   <Button
     disabled={!expression.trim() || !validateSQL(expression).valid}
     onClick={() => props.onApply(expression)}
   >
     Apply
   </Button>
   ```

**What We DON'T Build:**
- ❌ Operator dropdowns
- ❌ Unique value lists
- ❌ Clause sets
- ❌ Visual field type indicators
- ❌ Advanced SQL builder UI

**Estimated Effort:**
- Component shell: 4 hours
- Field picker integration: 4 hours
- SQL validation: 4 hours
- Styling + accessibility: 8 hours
- Unit tests: 8 hours
- E2E tests: 8 hours
- **Total: ~5 days** for one developer

#### 4B. Implementation Checklist

```markdown
## SimpleQEngine Minimal Implementation

### Phase 1: Core Component (Day 1-2)
- [ ] Create `src/runtime/simple-qengine.tsx`
- [ ] Controlled input field with value/onChange props
- [ ] Apply button with disabled state logic
- [ ] Clear button to reset expression
- [ ] Basic styling (match QuerySimple theme)
- [ ] Accessibility (ARIA labels, keyboard nav)

### Phase 2: Field Picker Integration (Day 2-3)
- [ ] Add Field Selector button
- [ ] Insert field name at cursor position
- [ ] Handle field name escaping (spaces, special chars)
- [ ] Show field type icons (reuse from Esri)

### Phase 3: Validation & Polish (Day 3-4)
- [ ] Client-side SQL validation
- [ ] Error message display
- [ ] Loading state during query execution
- [ ] Prevent SQL injection patterns
- [ ] Character limit (e.g., 1000 chars)

### Phase 4: Testing (Day 4-5)
- [ ] Unit tests for validation logic
- [ ] Unit tests for field insertion
- [ ] E2E test: Hash parameter population
- [ ] E2E test: Manual input + apply
- [ ] E2E test: Field picker usage
- [ ] Cross-browser testing (Chrome, Firefox, Safari, Edge)

### Phase 5: Feature Flag & Rollout (Day 5)
- [ ] Add feature flag: `USE_SIMPLE_QENGINE`
- [ ] Toggle in `widget-config.ts`
- [ ] Conditional rendering in `query-task-form.tsx`
- [ ] Update documentation
- [ ] Deploy to staging for team testing
```

---

## 🔄 **Migration Path: Old → New**

### Feature Flag Strategy

```typescript
// src/runtime/widget-config.ts
export const FEATURE_FLAGS = {
  USE_SIMPLE_QENGINE: false // Default: false (use SqlExpressionRuntime)
}

// src/runtime/query-task-form.tsx
import { FEATURE_FLAGS } from './widget-config'

const QueryTaskForm = (props) => {
  // ...
  
  return (
    <div>
      {FEATURE_FLAGS.USE_SIMPLE_QENGINE ? (
        <SimpleQEngine
          dataSourceId={props.dataSourceId}
          expression={expression}
          onChange={setExpression}
          onApply={applyQuery}
        />
      ) : (
        <SqlExpressionRuntime
          dataSourceId={props.dataSourceId}
          expression={expression}
          onChange={handleSqlExprObjChange}
          // ... DOM manipulation workaround still active
        />
      )}
    </div>
  )
}
```

### Gradual Rollout Plan

1. **Week 1:** Deploy with `USE_SIMPLE_QENGINE: false` (current behavior)
2. **Week 2:** Enable for internal testing only (staging environment)
3. **Week 3:** A/B test with subset of users (50/50 split)
4. **Week 4:** Analyze feedback, fix bugs, adjust
5. **Week 5:** Full rollout with `USE_SIMPLE_QENGINE: true`
6. **Week 6:** Remove `SqlExpressionRuntime` and feature flag

---

## 📊 **Decision Matrix: When to Escalate**

| Breakage Severity | User Impact | Response Level | Time to Fix |
|-------------------|-------------|----------------|-------------|
| **Console warning only** | None | Monitor only | - |
| **Works in Chrome, fails in Safari** | Low (browser-specific) | Level 1: Quick fix | 1-4 hours |
| **First hash works, second fails** | Medium (inconsistent) | Level 2: Workaround improvement | 1-2 days |
| **Hash execution completely broken** | High (primary feature down) | Level 3: Hybrid wrapper | 3-5 days |
| **DOM manipulation impossible** | Critical (cannot fix workaround) | Level 4: SimpleQEngine | 1-2 weeks |
| **New ExB version breaks everything** | Critical (upgrade blocker) | Level 4: SimpleQEngine | 1-2 weeks |

---

## 🧪 **Continuous Monitoring**

### Add to E2E Test Suite

```typescript
// tests/e2e/query-simple/dom-workaround-health.spec.ts

test('DOM workaround health check', async ({ page }) => {
  await page.goto('http://localhost:3000/...')
  
  // Set up console log monitoring
  const consoleErrors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text())
    }
  })
  
  // Open widget
  await helpers.openWidget(WIDGET_ID)
  
  // Navigate to a hash URL
  await page.goto('?query=PARCELID%3D%27123456%27')
  
  // Wait for DOM manipulation to complete
  await page.waitForTimeout(2000)
  
  // Verify no console errors
  expect(consoleErrors).toHaveLength(0)
  
  // Verify hash value was populated
  const inputValue = await page.evaluate(() => {
    const input = document.querySelector('input[type="text"]') as HTMLInputElement
    return input?.value || ''
  })
  
  expect(inputValue).toBe("PARCELID='123456'")
  
  // Verify query executed
  const resultsVisible = await helpers.isResultsTabVisible(WIDGET_ID)
  expect(resultsVisible).toBe(true)
})
```

### Weekly Health Check Script

```bash
#!/bin/bash
# scripts/dom-workaround-health-check.sh

echo "Running DOM Workaround Health Check..."

# Run specific E2E tests
npm run test:e2e -- hash-reexecution.spec.ts

# Check for console errors in logs
if grep -q "Cannot find input field" last_500_lines.txt; then
  echo "⚠️  WARNING: DOM selector issues detected"
  exit 1
fi

# Check for timing issues
if grep -q "dom-manipulation-attempt" last_500_lines.txt && ! grep -q "dom-manipulation-success" last_500_lines.txt; then
  echo "⚠️  WARNING: DOM manipulation failing"
  exit 1
fi

echo "✅ DOM workaround healthy"
exit 0
```

---

## 📝 **Documentation Updates**

### Update SQLEXPRESSION_RUNTIME_DOM_WORKAROUND.md

Add a "Health Check" section:

```markdown
## Health Check: Is the Workaround Still Working?

### Signs of a Healthy Workaround
✅ Hash URLs execute queries automatically
✅ No console errors about "Cannot find input field"
✅ Logs show both "dom-manipulation-attempt" AND "dom-manipulation-success"
✅ E2E tests pass consistently

### Signs of Trouble
🔴 Hash value appears in URL but no query executes
🔴 Console errors: "Cannot read properties of null"
🔴 Browser-specific failures (works in Chrome, fails in Safari)
🔴 E2E tests flaky or failing

### If Trouble Detected
1. Check the contingency plan: SQLEXPRESSIONRUNTIME_CONTINGENCY_PLAN.md
2. Review recent ExB version changes
3. Check browser console for specific errors
4. Run: `npm run test:e2e -- hash-reexecution.spec.ts`
5. Escalate using the decision matrix
```

---

## 🎯 **Summary: Your "Break Glass" Strategy**

### **Current State** (January 2026)
- ✅ DOM workaround is **stable** (r018.125)
- ✅ Thoroughly **documented** (SQLEXPRESSIONRUNTIME_DOM_WORKAROUND.md)
- ✅ **E2E tested** (hash-reexecution.spec.ts)
- 🟡 **Fragile** but monitored

### **If It Breaks**
1. **Try Level 1 fixes first** (1-4 hours) - selector updates, RAF tweaks
2. **Escalate to Level 2** (1-2 days) - polling, native events
3. **Escalate to Level 3** (3-5 days) - controlled wrapper
4. **Last resort: Level 4** (1-2 weeks) - SimpleQEngine minimal implementation

### **Detection Mechanisms**
- ✅ E2E tests catch breakage automatically
- ✅ Console log monitoring via `debugLogger`
- ✅ User reports follow predictable patterns
- ✅ Weekly health check script

### **Confidence Level**
- 🟢 **High confidence** we can fix most issues in 1-4 hours (Level 1)
- 🟡 **Medium confidence** Level 2/3 workarounds will suffice
- 🔴 **Low probability** we'll need SimpleQEngine (but we're prepared)

---

## 🚀 **Next Steps**

1. ✅ **This document exists** - you have a strategy
2. ⏳ **Complete Chunk 3** - finish Section 3.2
3. ⏳ **Deploy to staging** - let your team test
4. ⏳ **Monitor for 2 weeks** - watch E2E tests and user reports
5. ⏳ **If issues arise** - follow escalation ladder
6. ⏳ **Only build SimpleQEngine** - if Levels 1-3 fail

---

**You're covered.** If the DOM hack breaks, you have a clear path forward with escalating effort levels. Most likely scenario: a quick Level 1 fix resolves it. Worst case: 1-2 weeks to build a minimal replacement. **Let your team test it. We'll deal with issues if and when they arise.** 🛡️

**Ready to proceed with Chunk 3 Section 3.2?** Or do you want to add anything to this contingency plan?
