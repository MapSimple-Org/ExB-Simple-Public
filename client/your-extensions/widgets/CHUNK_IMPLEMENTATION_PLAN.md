# Safe Incremental Implementation Plan: Chunks 1 & 2

**Created:** 2025-12-23  
**Current Version:** r017.60  
**Status:** Planning Phase

---

## Overview

This document outlines a **safe, incremental approach** to implementing Chunks 1 & 2 (URL Parameter Consumption and Widget Visibility Engine) without breaking existing functionality. The strategy uses **parallel implementation** with **feature flags** and **comprehensive testing** at each step.

---

## Current State Analysis

### Existing Implementation

**URL Parameter Detection (`widget.tsx`):**
- Method: `checkQueryStringForShortIds()` (lines ~1446-1585)
- Called from: `componentDidMount()` and `handleHashParameterUsed()`
- Logic: Inline hash/query string parsing with priority (hash > query)
- State tracking: `lastProcessedHash` class property

**Visibility Detection (`widget.tsx`):**
- Method: `setupVisibilityDetection()` (lines ~188-246)
- Called from: `componentDidMount()`
- Logic: IntersectionObserver with periodic fallback
- State tracking: `visibilityObserver` and `visibilityCheckInterval` class properties

### Target Implementation (Preserved)

**Chunk 1: `UrlConsumptionManager`**
- Class-based utility (not a hook - works with class components)
- Centralized URL parameter detection and consumption
- Atomic consumption prevents infinite loops
- Mode reset on hash detection

**Chunk 2: `WidgetVisibilityManager`**
- Class-based utility (not a hook - works with class components)
- DOM-level visibility detection using IntersectionObserver
- Custom event notifications to HelperSimple
- Selection restore/clear triggers

---

## Implementation Strategy: "Parallel Path" Approach

Instead of replacing code immediately, we'll run **both implementations in parallel** and compare behavior. This allows us to:

1. **Verify correctness** before removing old code
2. **Catch edge cases** through comparison logging
3. **Roll back instantly** if issues arise
4. **Test incrementally** without breaking existing functionality

---

## Phase 1: Chunk 1 (URL Parameter Consumption) - SAFE MODE

### Step 1.1: Add Manager Class (No Integration)

**Goal:** Add the manager class file without touching existing code.

**Actions:**
1. Copy `preserved/r018-chunks/use-url-consumption.ts` → `query-simple/src/runtime/hooks/use-url-consumption.ts`
2. Add import to `widget.tsx` (commented out initially)
3. Add class property (commented out initially)
4. **Test:** Build should succeed, no runtime changes

**Success Criteria:**
- ✅ Code compiles
- ✅ No runtime errors
- ✅ Existing functionality unchanged

**Version:** r017.61 (increment after each step)

---

### Step 1.2: Parallel Execution (Comparison Mode)

**Goal:** Run both implementations side-by-side and compare results.

**Actions:**
1. Uncomment manager class property
2. Call `urlConsumptionManager.checkUrlParameters()` **in addition to** existing `checkQueryStringForShortIds()`
3. Log comparison results (both implementations should produce same results)
4. **Do NOT** remove old code yet

**Code Pattern:**
```typescript
componentDidMount() {
  // OLD: Existing implementation (keep this)
  this.checkQueryStringForShortIds()
  
  // NEW: Manager implementation (add this)
  this.urlConsumptionManager.setup(
    this.props,
    this.state.resultsMode,
    {
      onInitialValueFound: (value) => {
        // Log comparison
        debugLogger.log('CHUNK-1-COMPARE', {
          oldValue: this.state.initialQueryValue,
          newValue: value,
          match: JSON.stringify(this.state.initialQueryValue) === JSON.stringify(value)
        })
        
        // Only update if different (shouldn't happen if both work correctly)
        if (JSON.stringify(this.state.initialQueryValue) !== JSON.stringify(value)) {
          debugLogger.log('CHUNK-1-MISMATCH', {
            oldValue: this.state.initialQueryValue,
            newValue: value
          })
        }
      },
      onModeResetNeeded: () => {
        // Log mode reset comparison
        debugLogger.log('CHUNK-1-MODE-RESET', {
          currentMode: this.state.resultsMode
        })
      }
    }
  )
}
```

**Success Criteria:**
- ✅ Both implementations produce identical results
- ✅ No mismatches in comparison logs
- ✅ Existing functionality unchanged
- ✅ Manager correctly detects hash/query parameters

**Version:** r017.62

---

### Step 1.3: Switch to Manager (Remove Old Code)

**Goal:** Replace old implementation with manager, keeping old code commented for easy rollback.

**Actions:**
1. Comment out `this.checkQueryStringForShortIds()` call
2. Use manager's `onInitialValueFound` callback to update state
3. Update `handleHashParameterUsed` to use manager's `removeHashParameter`
4. Keep old code commented with `// OLD: [description]` markers

**Code Pattern:**
```typescript
componentDidMount() {
  // OLD: this.checkQueryStringForShortIds() // Replaced by UrlConsumptionManager
  
  // NEW: Manager implementation
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
}

handleHashParameterUsed = (shortId: string) => {
  // OLD: Old hash removal logic // Replaced by UrlConsumptionManager
  this.urlConsumptionManager.removeHashParameter(shortId, this.props.id)
}
```

**Success Criteria:**
- ✅ All URL parameter detection works correctly
- ✅ Hash consumption works correctly
- ✅ Mode reset on hash detection works correctly
- ✅ No regressions in existing functionality

**Version:** r017.63

---

### Step 1.4: Cleanup (Remove Old Code)

**Goal:** Remove commented old code after confirming stability.

**Actions:**
1. Remove `checkQueryStringForShortIds()` method (or keep as fallback initially)
2. Remove `lastProcessedHash` class property
3. Remove commented code blocks
4. Update `componentDidUpdate` to use manager's `checkUrlParameters`

**Success Criteria:**
- ✅ Code is clean (no commented blocks)
- ✅ All functionality verified
- ✅ No regressions

**Version:** r017.64

---

## Phase 2: Chunk 2 (Widget Visibility Engine) - SAFE MODE

### Step 2.1: Add Manager Class (No Integration)

**Goal:** Add the manager class file without touching existing code.

**Actions:**
1. Copy `preserved/r018-chunks/use-widget-visibility.ts` → `query-simple/src/runtime/hooks/use-widget-visibility.ts`
2. Add import to `widget.tsx` (commented out initially)
3. Add class property (commented out initially)
4. **Test:** Build should succeed, no runtime changes

**Success Criteria:**
- ✅ Code compiles
- ✅ No runtime errors
- ✅ Existing functionality unchanged

**Version:** r017.65

---

### Step 2.2: Parallel Execution (Comparison Mode)

**Goal:** Run both implementations side-by-side and compare results.

**Actions:**
1. Uncomment manager class property
2. Call `visibilityManager.setup()` **in addition to** existing `setupVisibilityDetection()`
3. Log comparison results (both implementations should produce same visibility state)
4. **Do NOT** remove old code yet

**Code Pattern:**
```typescript
componentDidMount() {
  // OLD: Existing visibility detection (keep this)
  this.setupVisibilityDetection()
  
  // NEW: Manager implementation (add this)
  setTimeout(() => {
    if (this.widgetRef.current) {
      this.visibilityManager.setup(
        this.widgetRef.current,
        this.props,
        {
          onVisibilityChange: (isVisible) => {
            // Log comparison
            debugLogger.log('CHUNK-2-COMPARE', {
              oldState: this.state.isPanelVisible,
              newState: isVisible,
              match: this.state.isPanelVisible === isVisible
            })
            
            // Update state (both implementations should agree)
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
}
```

**Success Criteria:**
- ✅ Both implementations produce identical visibility state
- ✅ No mismatches in comparison logs
- ✅ Existing functionality unchanged
- ✅ Manager correctly detects panel open/close

**Version:** r017.66

---

### Step 2.3: Switch to Manager (Remove Old Code)

**Goal:** Replace old implementation with manager, keeping old code commented for easy rollback.

**Actions:**
1. Comment out `this.setupVisibilityDetection()` call
2. Use manager's `onVisibilityChange` callback to update state
3. Update `componentWillUnmount` to use manager's `cleanup()` and `notifyUnmount()`
4. Keep old code commented with `// OLD: [description]` markers

**Code Pattern:**
```typescript
componentDidMount() {
  // OLD: this.setupVisibilityDetection() // Replaced by WidgetVisibilityManager
  
  // NEW: Manager implementation
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
  
  this.visibilityManager.notifyMount(this.props.id)
}

componentWillUnmount() {
  // OLD: this.cleanupVisibilityDetection() // Replaced by WidgetVisibilityManager
  this.visibilityManager.cleanup()
  this.visibilityManager.notifyUnmount(this.props.id)
}
```

**Success Criteria:**
- ✅ Panel visibility detection works correctly
- ✅ Selection restore/clear on open/close works correctly
- ✅ HelperSimple notifications work correctly
- ✅ No regressions in existing functionality

**Version:** r017.67

---

### Step 2.4: Cleanup (Remove Old Code)

**Goal:** Remove commented old code after confirming stability.

**Actions:**
1. Remove `setupVisibilityDetection()` method
2. Remove `cleanupVisibilityDetection()` method
3. Remove `checkVisibility()` method
4. Remove `visibilityObserver` and `visibilityCheckInterval` class properties
5. Remove commented code blocks

**Success Criteria:**
- ✅ Code is clean (no commented blocks)
- ✅ All functionality verified
- ✅ No regressions

**Version:** r017.68

---

## Testing Strategy

### After Each Step

1. **Manual Testing:**
   - Test URL parameter detection (hash and query string)
   - Test panel open/close detection
   - Test selection restore/clear
   - Test HelperSimple notifications

2. **Debug Logging:**
   - Enable `debug=HASH,WIDGET-STATE,RESTORE,SELECTION`
   - Verify comparison logs show matches
   - Check for any mismatches or errors

3. **Regression Testing:**
   - Test all existing functionality
   - Verify no breaking changes
   - Check for performance regressions

### Comparison Mode Testing (Steps 1.2 & 2.2)

**Critical:** During comparison mode, both implementations should produce **identical results**. If they don't:

1. **Stop immediately**
2. **Investigate the mismatch** (check logs)
3. **Fix the manager implementation** to match old behavior
4. **Re-test** before proceeding

---

## Rollback Plan

If issues arise at any step:

1. **Immediate Rollback:** Comment out new code, uncomment old code
2. **Git Rollback:** `git revert [commit-hash]` for the problematic step
3. **Investigation:** Review comparison logs to identify root cause
4. **Fix:** Address issue before re-attempting

---

## Success Metrics

### Chunk 1 Success:
- ✅ URL parameter detection works (hash and query string)
- ✅ Hash priority over query string maintained
- ✅ Mode reset on hash detection works
- ✅ Hash consumption on mode switch works
- ✅ No infinite loops or race conditions

### Chunk 2 Success:
- ✅ Panel visibility detection works (open/close)
- ✅ Selection restore on panel open works
- ✅ Selection clear on panel close works
- ✅ HelperSimple notifications work
- ✅ Identify popup restore works

---

## Version Tracking

Each step increments the minor version:
- Step 1.1: r017.61
- Step 1.2: r017.62
- Step 1.3: r017.63
- Step 1.4: r017.64
- Step 2.1: r017.65
- Step 2.2: r017.66
- Step 2.3: r017.67
- Step 2.4: r017.68

---

## Key Principles

1. **Never break existing functionality** - Always test before removing old code
2. **Compare before replacing** - Run both implementations in parallel first
3. **Incremental steps** - One small change at a time
4. **Easy rollback** - Keep old code commented until fully verified
5. **Comprehensive testing** - Test all scenarios at each step
6. **Version increment** - Increment version after each step for tracking

---

## Next Steps

1. Review this plan
2. Start with Step 1.1 (add manager class, no integration)
3. Test thoroughly before proceeding to next step
4. Only proceed when current step is 100% verified

---

**End of Implementation Plan**




