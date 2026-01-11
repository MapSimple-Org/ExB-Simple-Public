# Chunk 3 Code Removal Analysis
## Failed Attempts & Root Cause

### Attempt 1 (r019.14 → broken)
**Strategy:** Remove parallel wrapper methods, then remove old implementations  
**Result:** FAILED - Removed active code, broke widget  
**Root Cause:** Assumed parallel wrappers were dead code, but they were still being called by `handleVisibilityChange`

### Attempt 2 (r019.14 → broken)
**Strategy:** Add safety markers, remove blocks surgically  
**Result:** FAILED - File structure corrupted, JSDoc comments misaligned  
**Root Cause:** Complex nested comment structure (`/* /** ... */ */`) confused removal logic

## Critical Discovery: The Old Methods Are STILL ACTIVE

### Active Call Sites (r019.14 state):
```
Line 594:  this.addSelectionToMapParallel()      ← handleVisibilityChange (panel open)
Line 642:  this.clearSelectionFromMapParallel()  ← handleVisibilityChange (panel close)
Line 873:  this.addSelectionToMap()              ← handleRestoreOnIdentifyClose  ⚠️
Line 932:  this.addSelectionToMap()              ← handleRestoreOnIdentifyClose  ⚠️
```

### Method Definitions:
```
Line 939:  private addSelectionToMapParallel    ← ACTIVE (calls manager)
Line 967:  private clearSelectionFromMapParallel ← ACTIVE (calls manager)
Line 1018: private addSelectionToMap            ← COMMENTED OUT (243 lines: 1017-1259)
Line 1428: private clearSelectionFromMap        ← COMMENTED OUT (329 lines: 1427-1755)
```

### The Problem:
**`handleRestoreOnIdentifyClose` (Chunk 3 Section 3.3) is calling the OLD commented-out `addSelectionToMap()` method directly.**

This means:
1. The old methods are NOT dead code
2. Section 3.3 (Map Identify Restoration) must be migrated BEFORE removing old methods
3. Current state is "legacy method commented out but still being called" (likely broken in production)

## Code Block Structure Analysis

### Block 1: addSelectionToMap (Lines 1017-1259, 243 lines)
```
Line 997:  // ============================================================================
Line 998:  // OLD IMPLEMENTATION - COMMENTED OUT (r019.11 - Chunk 3 Section 3.2.5)
Line 999:  // This method is now handled by SelectionRestorationManager
Line 1000: // Will be removed after verification period (Step 3.2.7)
Line 1001: // ============================================================================
Line 1002: /*
Line 1003: /**
Line 1004:  * Restores selection to the map when widget panel opens.
Line 1005:  * ... [JSDoc continues]
Line 1017: */
Line 1018: private addSelectionToMap = () => {
Line 1019:   ... [method body: 240 lines]
Line 1258: }
Line 1259: */
Line 1260: // ============================================================================
Line 1261: // END OLD addSelectionToMap - Now handled by SelectionRestorationManager
Line 1262: // ============================================================================
```

**Structure:** `/* /** [JSDoc] */ [method body] */`  
**Complexity:** Nested block comment with JSDoc inside

### Block 2: clearSelectionFromMap (Lines 1427-1755, 329 lines)
```
Line 1406: // ============================================================================
Line 1407: // OLD IMPLEMENTATION - COMMENTED OUT (r019.11 - Chunk 3 Section 3.2.5)
Line 1408: // This method is now handled by SelectionRestorationManager
Line 1409: // Will be removed after verification period (Step 3.2.7)
Line 1410: // ============================================================================
Line 1411: /*
Line 1412: /**
Line 1413:  * Clears selection from the map while preserving widget's internal state.
Line 1414:  * ... [JSDoc continues]
Line 1426: */
Line 1427: private clearSelectionFromMap = () => {
Line 1428:   ... [method body: 327 lines]
Line 1754: }
Line 1755: */
Line 1756: // ============================================================================
Line 1757: // END OLD clearSelectionFromMap - Now handled by SelectionRestorationManager
Line 1758: // ============================================================================
```

**Structure:** `/* /** [JSDoc] */ [method body] */`  
**Complexity:** Nested block comment with JSDoc inside

## Why Removal Failed

### Complexity Factors:
1. **Nested Comments:** `/* /** ... */ ... */` structure is hard to match precisely
2. **Large Blocks:** 243 and 329 lines each, spanning multiple screens
3. **Active References:** Methods still called by `handleRestoreOnIdentifyClose`
4. **No Clear Markers:** Original blocks lack unique identifiers for safe removal

### What Doesn't Work:
- ❌ String replacement on large multi-line blocks (whitespace sensitivity)
- ❌ Marker-based removal without knowing block boundaries first
- ❌ Assuming methods are dead code without checking all call sites

## Proposed Strategies (Next Section)
See below for 5 proposed strategies with supporting data.
