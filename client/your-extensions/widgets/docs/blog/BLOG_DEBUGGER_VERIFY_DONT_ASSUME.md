# The Debugger: Verify, Don't Assume

**Status:** ✅ Complete  
**Date:** December 2024  
**Widget:** QuerySimple for ArcGIS Experience Builder  
**Version:** v1.19.0-r018.22

---

## The Problem with Assumptions

You're refactoring code. You move logic from one place to another. You test it. It seems to work. You commit. Two weeks later, a bug appears. You trace it back to your refactor. What went wrong?

**You assumed it was correct.** You didn't verify.

In our chunk migration (moving 1,600+ lines of widget logic into manager classes), we could have assumed correctness. We could have moved code, tested the happy path, and called it done. But we didn't. We verified. Every step. Every comparison. Every result.

**Result:** We've completed Chunks 1, 2, and 6 without introducing bugs. Not because we're perfect. Because we verify.

---

## The Debug System: Production-Safe, Developer-Powerful

### How It Works

The debug system is **production-safe** by default. No logs appear unless explicitly requested:

```
?debug=HASH,TASK
```

This enables only the `HASH` and `TASK` debug features. Want everything?

```
?debug=all
```

Want nothing?

```
?debug=false
```

### Available Debug Features

| Feature | What It Tracks |
|---------|----------------|
| `HASH` | Deep link consumption and URL parameter parsing |
| `TASK` | Query execution, performance metrics, data source status |
| `SELECTION` | Selection detection and identify popup tracking |
| `RESTORE` | Selection restoration when widget opens |
| `WIDGET-STATE` | Widget lifecycle events (open/close handshake) |
| `GRAPHICS-LAYER` | Graphics layer highlighting logic |
| `ZOOM` | Zoom behavior and extent calculations |
| `RESULTS-MODE` | Transitions between New, Add, and Remove modes |
| `all` | Enable every single log (Warning: High volume) |

### Structured Logging

Every log entry is structured JSON:

```json
{
  "feature": "HASH",
  "timestamp": "2025-12-24T13:40:59.684Z",
  "event": "url-param-detected",
  "widgetId": "widget_12",
  "shortId": "pin",
  "value": "2223059013",
  "foundIn": "hash"
}
```

This makes logs:
- **Searchable**: Filter by feature, event, widgetId, etc.
- **Parseable**: Easy to extract data for analysis
- **Consistent**: Same format across all features

---

## The Verification Process: Parallel Implementation

### The Strategy

When migrating code to a manager class, we don't just replace it. We run **both implementations in parallel** and compare results:

1. **Step 1**: Add manager class (no integration)
2. **Step 2**: Run both old and new implementations, compare via logging
3. **Step 3**: Switch to manager only after verification
4. **Step 4**: Clean up old code and temporary logs

### Comparison Logging

During Step 2 (parallel execution), we log both implementations:

```typescript
// Old implementation
const oldResult = checkUrlParametersOldWay()
debugLogger.log('CHUNK-1-COMPARE', {
  event: 'old-implementation-result',
  oldImplementation: oldResult
})

// New implementation
const newResult = urlConsumptionManager.checkUrlParameters()
debugLogger.log('CHUNK-1-COMPARE', {
  event: 'new-implementation-result',
  newImplementation: newResult
})

// Compare
debugLogger.log('CHUNK-1-COMPARE', {
  event: 'comparison',
  oldImplementation: oldResult,
  newImplementation: newResult,
  match: JSON.stringify(oldResult) === JSON.stringify(newResult)
})
```

### What You See in the Console

```
[QUERYSIMPLE-CHUNK-1-COMPARE] {
  "event": "old-implementation-result",
  "oldImplementation": {
    "shortId": "pin",
    "value": "2223059013",
    "foundIn": "hash"
  }
}

[QUERYSIMPLE-CHUNK-1-COMPARE] {
  "event": "new-implementation-result",
  "newImplementation": {
    "shortId": "pin",
    "value": "2223059013",
    "foundIn": "hash"
  }
}

[QUERYSIMPLE-CHUNK-1-COMPARE] {
  "event": "comparison",
  "oldImplementation": { "shortId": "pin", "value": "2223059013" },
  "newImplementation": { "shortId": "pin", "value": "2223059013" },
  "match": true
}
```

**Green light:** `match: true` means both implementations agree. Proceed to Step 3.

**Red light:** `match: false` means something's wrong. **STOP.** Investigate. Fix. Re-verify.

---

## Real Example: Chunk 1 (URL Parameter Consumption)

### The Migration

We migrated URL parameter detection from inline code in `widget.tsx` to `UrlConsumptionManager`. This handles:
- Hash parameters (`#pin=123`)
- Query string parameters (`?pin=123`)
- Priority (hash overrides query string)
- Consumption (removing hash when switching modes)

### The Verification Process

**Step 1.2 (Parallel Execution):** We ran both implementations side-by-side for **6 versions** (r018.2 through r018.7), logging every comparison.

**What We Found:**

1. **Timing Mismatch (r018.3)**: Old implementation updated state asynchronously (`setState`), new implementation called callback synchronously. **Fixed** by capturing state updates before they complete.

2. **Hash Change Detection (r018.4)**: When URL hash changed dynamically, old implementation's result was stale. **Fixed** by tracking old implementation's result in a class property.

3. **Query String Detection (r018.5)**: Query strings weren't detected when hash was empty. **Fixed** by modifying the skip-check logic.

4. **Race Condition (r018.9)**: Query could execute with empty SQL if React state hadn't synchronized with DOM. **Fixed** by verifying both DOM and React state before triggering query.

**Every issue was caught during verification.** Not in production. Not weeks later. During the parallel execution phase.

### Success Criteria

We only proceeded to Step 1.3 (switch to manager) when:
- ✅ All comparison logs showed `match: true`
- ✅ **NO** logs with `match: false`
- ✅ All test scenarios passed
- ✅ Existing functionality unchanged

**Result:** Chunk 1 completed successfully. No bugs introduced.

---

## Real Example: Chunk 6 (Map View Management)

### The Migration

We migrated map view reference management from state-based (`this.state.jimuMapView`) to `MapViewManager` class.

### The Verification Process

**Step 6.2 (Parallel Execution):** We logged both implementations when map view changed:

```typescript
// Old implementation
const oldJimuMapView = this.state.jimuMapView
const oldMapView = this.mapViewRef.current
debugLogger.log('CHUNK-6-COMPARE', {
  event: 'old-implementation-map-view-change',
  oldImplementation: {
    hasJimuMapView: !!oldJimuMapView,
    hasMapView: !!oldMapView
  }
})

// New implementation
this.mapViewManager.handleJimuMapViewChanged(jimuMapView, props, callbacks)
const newJimuMapView = this.mapViewManager.getJimuMapView()
const newMapView = this.mapViewManager.getMapView()
debugLogger.log('CHUNK-6-COMPARE', {
  event: 'new-implementation-map-view-change',
  newImplementation: {
    hasJimuMapView: !!newJimuMapView,
    hasMapView: !!newMapView
  }
})

// Compare
debugLogger.log('CHUNK-6-COMPARE', {
  event: 'map-view-change-comparison',
  oldImplementation: { hasJimuMapView: !!oldJimuMapView, hasMapView: !!oldMapView },
  newImplementation: { hasJimuMapView: !!newJimuMapView, hasMapView: !!newMapView },
  jimuMapViewMatch: !!oldJimuMapView === !!newJimuMapView,
  mapViewMatch: !!oldMapView === !!newMapView,
  match: (!!oldJimuMapView === !!newJimuMapView) && (!!oldMapView === !!newMapView)
})
```

**What We Verified:**

- ✅ Both implementations detect map view correctly
- ✅ `mapViewRef.current` is set correctly in both
- ✅ Graphics layer initializes correctly (if enabled)
- ✅ Comparison logs show `jimuMapViewMatch: true` and `mapViewMatch: true`
- ✅ **NO** `CHUNK-6-MISMATCH` logs

**Result:** Chunk 6 completed successfully. No bugs introduced.

---

## The Philosophy: Verify, Don't Assume

### Why This Matters

**Assumptions lead to bugs.** Verification prevents them.

When you refactor code, you're making changes. Those changes can introduce subtle bugs that don't show up in happy-path testing. But if you verify every result, you catch issues before they become problems.

### The Process

1. **Add new implementation** (don't remove old code yet)
2. **Run both in parallel** (log everything)
3. **Compare results** (look for mismatches)
4. **Fix mismatches** (don't proceed until they match)
5. **Switch to new implementation** (only after verification)
6. **Clean up** (remove old code and temporary logs)

### What We've Learned

- **Comparison logging catches timing issues**: Old code updates state asynchronously, new code calls callbacks synchronously? Comparison logs reveal the mismatch.

- **Comparison logging catches edge cases**: Query string detection fails when hash is empty? Comparison logs show the difference.

- **Comparison logging catches race conditions**: Query executes before React state syncs? Comparison logs show the race.

- **Verification prevents production bugs**: Every issue we've found has been during verification, not in production.

---

## Debug Switches for Chunk Migration

### Temporary Migration Features

During chunk migration, we use temporary debug features:

- **`CHUNK-1-COMPARE`**: URL parameter comparison logs
- **`CHUNK-2-COMPARE`**: Visibility comparison logs
- **`CHUNK-6-COMPARE`**: Map view comparison logs
- **`CHUNK-X-MISMATCH`**: Mismatch warnings (red flags)

These are **temporary** and will be removed after migration is complete.

### How to Use

**For Chunk Migration Testing:**

```
?debug=CHUNK-1-COMPARE,HASH
```

This enables:
- Comparison logs between old/new implementations
- Regular HASH feature logs

**Watch for:**

- ✅ `match: true` in comparison logs → Good, proceed
- ❌ `match: false` in comparison logs → **STOP**, investigate
- ❌ `CHUNK-X-MISMATCH` logs → **STOP**, something's wrong

---

## Real-World Impact

### Chunk 1: 6 Versions of Verification

We spent **6 versions** (r018.2 through r018.7) verifying Chunk 1 before switching. That's:
- 6 versions of comparison logging
- 6 versions of fixing mismatches
- 6 versions of re-verification

**Was it worth it?** Absolutely. We caught 4 issues during verification that would have become production bugs.

### Chunk 2: Smooth Sailing

Chunk 2 (Widget Visibility) was verified in **1 version** (r018.12). Comparison logs showed `match: true` immediately. No issues found.

**Why?** The logic was simpler, and we'd learned from Chunk 1 how to structure the comparison logging.

### Chunk 6: One-Time Verification

Chunk 6 (Map View Management) was verified in **1 version** (r018.15). Map view changes are infrequent (typically once per widget load), so we saw comparison logs once and they matched.

**Result:** Clean migration, no bugs.

---

## The Debug System Architecture

### Production-Safe by Default

No logs appear unless explicitly requested. This means:
- **Production apps**: No performance impact, no console clutter
- **Development**: Enable only what you need
- **Debugging**: Enable everything with `?debug=all`

### Iframe-Aware

The debug system checks both the current window and parent window for `?debug` parameters. This handles Experience Builder's iframe architecture where widgets run in iframes.

### Structured JSON Logging

Every log entry is structured JSON, making it:
- **Searchable**: Filter by feature, event, widgetId
- **Parseable**: Extract data for analysis
- **Consistent**: Same format across all features

### Bug-Level Logging

Known bugs are logged automatically (even with `?debug=false`) using `console.warn()` with emoji formatting. See `BLOG_KNOWN_BUGS_LOGGING.md` for details.

---

## Technical Blueprint: Implementing Verification Yourself

This section provides everything you need to implement the verification system in your own Experience Builder widgets. The upfront investment saves time by catching bugs during refactoring, not weeks later in production.

### The Core Pattern: ParallelVerifier Function

Here's a reusable TypeScript function that compares old and new implementations:

```typescript
/**
 * Compares results from old and new implementations during refactoring.
 * Logs comparison results only when debug feature is enabled.
 * 
 * @param oldFn - Function that executes the old implementation
 * @param newFn - Function that executes the new implementation
 * @param context - String identifier for this comparison (e.g., 'URL-PARAM-CHECK')
 * @param debugLogger - Your debug logger instance
 * @param debugFeature - Debug feature name to check (e.g., 'CHUNK-1-COMPARE')
 * @returns Object with oldResult, newResult, and match boolean
 */
function parallelVerifier<T>(
  oldFn: () => T,
  newFn: () => T,
  context: string,
  debugLogger: any,
  debugFeature: string
): { oldResult: T, newResult: T, match: boolean } {
  // Execute both implementations
  const oldResult = oldFn()
  const newResult = newFn()
  
  // Compare results using JSON.stringify for deep equality
  const match = JSON.stringify(oldResult) === JSON.stringify(newResult)
  
  // Log only if debug feature is enabled
  if (debugLogger.isEnabled(debugFeature)) {
    debugLogger.log(debugFeature, {
      event: 'comparison',
      context,
      oldImplementation: oldResult,
      newImplementation: newResult,
      match
    })
    
    // Log mismatch warnings
    if (!match) {
      debugLogger.log(`${debugFeature}-MISMATCH` as any, {
        event: 'mismatch-detected',
        context,
        oldImplementation: oldResult,
        newImplementation: newResult,
        warning: 'Old and new implementations produce different results'
      })
    }
  }
  
  return { oldResult, newResult, match }
}
```

### Production-Safe Logic: URL Parameter Gating

The debug logger checks URL parameters to determine if logging should occur. Here's the core logic:

```typescript
/**
 * Checks if a debug feature is enabled via URL parameter.
 * Production-safe: Returns false if no debug parameter is present.
 */
function isDebugFeatureEnabled(feature: string): boolean {
  // Check current window URL
  const urlParams = new URLSearchParams(window.location.search)
  let debugValue = urlParams.get('debug')
  
  // If in iframe (Experience Builder), check parent window
  if (debugValue === null && window.parent !== window) {
    try {
      const parentParams = new URLSearchParams(window.parent.location.search)
      debugValue = parentParams.get('debug')
    } catch (e) {
      // Cross-origin restriction might prevent access
    }
  }
  
  // Explicitly disabled
  if (debugValue === 'false') {
    return false
  }
  
  // Enable all features
  if (debugValue === 'all') {
    return true
  }
  
  // Check for specific feature in comma-separated list
  if (debugValue !== null) {
    const features = debugValue.split(',').map(f => f.trim().toUpperCase())
    return features.includes(feature.toUpperCase()) || features.includes('ALL')
  }
  
  // Default: disabled (production-safe)
  return false
}
```

**Usage in your code:**

```typescript
// Only logs if ?debug=CHUNK-1-COMPARE is in URL
if (isDebugFeatureEnabled('CHUNK-1-COMPARE')) {
  console.log('[COMPARE]', comparisonData)
}
```

### URL Parameter Examples

Here are concrete examples of how to use debug parameters in your Experience Builder URLs:

**Enable comparison logging for Chunk 1:**

```
https://localhost:3001/experience/0?debug=CHUNK-1-COMPARE
```

**Enable multiple debug features:**

```
https://localhost:3001/experience/0?debug=CHUNK-1-COMPARE,HASH
```

This enables both comparison logging and hash parameter processing logs.

**Enable all debug features:**

```
https://localhost:3001/experience/0?debug=all
```

**Disable all debug logging:**

```
https://localhost:3001/experience/0?debug=false
```

**Combine with hash parameters (for testing deep linking):**

```
https://localhost:3001/experience/0?debug=CHUNK-1-COMPARE,HASH#pin=2223059013
```

This enables comparison logging while also testing URL parameter detection with a hash parameter.

**Multiple comparison features:**

```
https://localhost:3001/experience/0?debug=CHUNK-1-COMPARE,CHUNK-2-COMPARE,CHUNK-6-COMPARE
```

**Production URL (no debug parameters):**

```
https://yourdomain.com/experience/0
```

No debug parameters means no logging. Production-safe by default.

**Key Points:**

- Debug parameters are added to the query string (`?debug=FEATURE`)
- Multiple features are comma-separated (`?debug=FEATURE1,FEATURE2`)
- Hash parameters (`#pin=123`) are separate and used for widget functionality
- If no `debug` parameter is present, no logging occurs (production-safe)
- Use `?debug=false` to explicitly disable logging even if defaults would enable it

### The "Exploration" AI Prompt for Cursor

When refactoring code, use this prompt with Cursor to set up comparison logging:

```
I'm refactoring the [FUNCTION_NAME] function to move it into a [MANAGER_CLASS] class. 

IMPORTANT: Do NOT remove the old implementation yet. Instead:

1. Create the new implementation in [MANAGER_CLASS] as a method
2. Keep the old implementation in place (don't delete it)
3. Add comparison logging that:
   - Executes both old and new implementations
   - Logs results from both using debugLogger.log('CHUNK-X-COMPARE', ...)
   - Compares results using JSON.stringify and logs match: true/false
   - Only logs when ?debug=CHUNK-X-COMPARE is in the URL (production-safe)
4. Call the old implementation first, then the new implementation, then compare
5. Use the old implementation's result for actual functionality (don't switch yet)

The comparison logging should include:
- event: 'old-implementation-result' for old code
- event: 'new-implementation-result' for new code  
- event: 'comparison' with oldImplementation, newImplementation, and match boolean

This allows me to verify correctness before switching implementations.
```

**Example for URL parameter checking:**

```
I'm refactoring the checkUrlParameters function to move it into UrlConsumptionManager.

IMPORTANT: Do NOT remove the old implementation yet. Instead:

1. Create checkUrlParameters() method in UrlConsumptionManager
2. Keep the existing checkUrlParameters logic in widget.tsx (don't delete it)
3. Add comparison logging that:
   - Executes both old and new implementations
   - Logs results from both using debugLogger.log('CHUNK-1-COMPARE', ...)
   - Compares results using JSON.stringify and logs match: true/false
   - Only logs when ?debug=CHUNK-1-COMPARE is in the URL (production-safe)
4. Call the old implementation first, then the new implementation, then compare
5. Use the old implementation's result for actual functionality (don't switch yet)

The comparison logging should include:
- event: 'old-implementation-result' for old code
- event: 'new-implementation-result' for new code  
- event: 'comparison' with oldImplementation, newImplementation, and match boolean

This allows me to verify correctness before switching implementations.
```

### Real-World Example: URL Parameter Check

Here's a complete example showing how to verify URL parameter detection:

**Step 1: Old Implementation (Keep This)**

```typescript
// In widget.tsx - OLD implementation (keep this)
private checkUrlParametersOldWay(): { shortId: string, value: string } | null {
  const hash = window.location.hash
  const query = new URLSearchParams(window.location.search)
  
  // Check hash first (priority)
  if (hash) {
    const hashParams = new URLSearchParams(hash.substring(1))
    for (const [key, value] of hashParams.entries()) {
      const queryItem = this.props.config.queryItems.find(q => q.shortId === key)
      if (queryItem) {
        return { shortId: key, value }
      }
    }
  }
  
  // Check query string
  for (const [key, value] of query.entries()) {
    const queryItem = this.props.config.queryItems.find(q => q.shortId === key)
    if (queryItem) {
      return { shortId: key, value }
    }
  }
  
  return null
}
```

**Step 2: New Implementation (Add This)**

```typescript
// In UrlConsumptionManager class - NEW implementation
checkUrlParameters(config: IMConfig): { shortId: string, value: string } | null {
  const hash = window.location.hash
  const query = new URLSearchParams(window.location.search)
  
  // Same logic as old implementation
  if (hash) {
    const hashParams = new URLSearchParams(hash.substring(1))
    for (const [key, value] of hashParams.entries()) {
      const queryItem = config.queryItems.find(q => q.shortId === key)
      if (queryItem) {
        return { shortId: key, value }
      }
    }
  }
  
  for (const [key, value] of query.entries()) {
    const queryItem = config.queryItems.find(q => q.shortId === key)
    if (queryItem) {
      return { shortId: key, value }
    }
  }
  
  return null
}
```

**Step 3: Comparison Logging (Add This)**

```typescript
// In widget.tsx - Add comparison logging
componentDidMount() {
  // Old implementation
  const oldResult = this.checkUrlParametersOldWay()
  debugLogger.log('CHUNK-1-COMPARE', {
    event: 'old-implementation-result',
    oldImplementation: oldResult
  })
  
  // New implementation
  const newResult = this.urlConsumptionManager.checkUrlParameters(this.props.config)
  debugLogger.log('CHUNK-1-COMPARE', {
    event: 'new-implementation-result',
    newImplementation: newResult
  })
  
  // Compare
  const match = JSON.stringify(oldResult) === JSON.stringify(newResult)
  debugLogger.log('CHUNK-1-COMPARE', {
    event: 'comparison',
    oldImplementation: oldResult,
    newImplementation: newResult,
    match
  })
  
  // Log mismatch if detected
  if (!match) {
    debugLogger.log('CHUNK-1-MISMATCH', {
      event: 'mismatch-detected',
      oldImplementation: oldResult,
      newImplementation: newResult,
      warning: 'URL parameter detection mismatch'
    })
  }
  
  // Use old implementation for now (don't switch yet)
  if (oldResult) {
    this.handleUrlParameter(oldResult)
  }
}
```

**Step 4: What You See in Console**

With `?debug=CHUNK-1-COMPARE` in the URL:

```
[QUERYSIMPLE-CHUNK-1-COMPARE] {
  "event": "old-implementation-result",
  "oldImplementation": {
    "shortId": "pin",
    "value": "2223059013"
  }
}

[QUERYSIMPLE-CHUNK-1-COMPARE] {
  "event": "new-implementation-result",
  "newImplementation": {
    "shortId": "pin",
    "value": "2223059013"
  }
}

[QUERYSIMPLE-CHUNK-1-COMPARE] {
  "event": "comparison",
  "oldImplementation": { "shortId": "pin", "value": "2223059013" },
  "newImplementation": { "shortId": "pin", "value": "2223059013" },
  "match": true
}
```

**If there's a mismatch:**

```
[QUERYSIMPLE-CHUNK-1-COMPARE] {
  "event": "comparison",
  "oldImplementation": { "shortId": "pin", "value": "2223059013" },
  "newImplementation": null,
  "match": false
}

[QUERYSIMPLE-CHUNK-1-MISMATCH] {
  "event": "mismatch-detected",
  "oldImplementation": { "shortId": "pin", "value": "2223059013" },
  "newImplementation": null,
  "warning": "URL parameter detection mismatch"
}
```

**Step 5: Verification Complete, Switch Implementation**

Only after seeing `match: true` consistently across all test scenarios:

```typescript
// Remove old implementation and comparison logging
// Switch to new implementation
componentDidMount() {
  const result = this.urlConsumptionManager.checkUrlParameters(this.props.config)
  if (result) {
    this.handleUrlParameter(result)
  }
}
```

### Why This Saves Time

**Without verification:**
1. Refactor code (30 minutes)
2. Test happy path (10 minutes)
3. Commit and deploy
4. Bug appears in production (2 weeks later)
5. Debug production issue (4 hours)
6. Fix and redeploy (1 hour)
7. **Total: 5+ hours, plus production impact**

**With verification:**
1. Refactor code (30 minutes)
2. Add comparison logging (15 minutes)
3. Run parallel implementations (1 hour of testing)
4. Fix mismatches during verification (1 hour)
5. Switch after verification (10 minutes)
6. **Total: 3 hours, zero production impact**

The upfront investment pays off by catching issues during development, not in production.

---

## Best Practices

### When Refactoring

1. **Add comparison logging** before removing old code
2. **Run both implementations** in parallel
3. **Verify every result** via comparison logs
4. **Fix mismatches** before proceeding
5. **Only switch** after verification is complete

### When Debugging

1. **Enable relevant debug features** (`?debug=FEATURE`)
2. **Watch structured logs** for patterns
3. **Use comparison logs** to verify fixes
4. **Don't assume** - verify with logs

### When Testing

1. **Enable debug switches** for the feature you're testing
2. **Watch comparison logs** during parallel execution
3. **Look for mismatches** - they indicate issues
4. **Verify functionality** matches expected behavior

---

## The Bottom Line

**We don't assume. We verify.**

The debug system isn't just for debugging. It's for **verification**. It's how we ensure correctness before introducing bugs that are hard to track down after the fact.

**Result:** We've completed Chunks 1, 2, and 6 without introducing bugs. Not because we're perfect. Because we verify.

---

## Related Documentation

- `COMPLETE_MIGRATION_PLAN.md` - Complete chunk migration strategy
- `CHUNK_TESTING_GUIDE.md` - Testing instructions for each chunk
- `BLOG_KNOWN_BUGS_LOGGING.md` - Bug-level logging system
- `shared-code/common/debug-logger.ts` - Implementation details
- `README.md` - Quick reference for debug switches

---

**The debugger isn't just a tool. It's a philosophy: Verify, don't assume.**




