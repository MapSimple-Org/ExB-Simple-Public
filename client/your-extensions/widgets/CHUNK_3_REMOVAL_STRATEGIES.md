# Chunk 3 Code Removal Strategies
## 5 Proposed Approaches with Supporting Data

---

## 🚨 CRITICAL ISSUE DISCOVERED

**Current State (r019.14):** `handleRestoreOnIdentifyClose` is calling `this.addSelectionToMap()` (lines 873, 932), but that method is commented out (lines 1017-1259). **This is a production bug.**

**Affected Feature:** Map Identify Restoration (Chunk 3 Section 3.3) - when user closes the identify popup after clicking a map feature, the widget should restore the previous selection to the map.

**Impact:** This feature is currently broken. Users who use Map Identify will lose their query results selection.

---

## Strategy 1: Complete Section 3.3 FIRST, Then Remove
**Approach:** Migrate `handleRestoreOnIdentifyClose` to use the manager before removing old methods.

### Steps:
1. Add `handleRestoreOnIdentifyClose()` to `SelectionRestorationManager`
2. Update `widget.tsx` to call manager method instead of old `addSelectionToMap()`
3. Test with E2E scenarios (open identify, close identify, verify selection restored)
4. THEN remove old commented methods (now truly dead code)

### Pros:
- ✅ Fixes production bug immediately
- ✅ Completes Section 3.3 (part of original plan)
- ✅ Old methods become truly dead code after migration
- ✅ Clean removal with no active references

### Cons:
- ⏱️ Requires implementing Section 3.3 first (~2-3 hours)
- ⏱️ Requires new E2E tests for Map Identify feature

### Risk: LOW
**Data Supporting This:** Section 3.3 is the last user of old methods. Once migrated, removal is trivial.

---

## Strategy 2: Uncomment Old Methods Temporarily, Remove After 3.3
**Approach:** Uncomment the old methods NOW to unblock Section 3.3, migrate 3.3, then remove.

### Steps:
1. Uncomment `addSelectionToMap` (lines 1017-1259)
2. Uncomment `clearSelectionFromMap` (lines 1427-1755)
3. Test that `handleRestoreOnIdentifyClose` works again
4. Proceed with Section 3.3 migration (as in Strategy 1)
5. Remove old methods after 3.3 complete

### Pros:
- ✅ Fixes production bug immediately
- ✅ Unblocks current work
- ✅ Gives us time to test Map Identify feature

### Cons:
- ⚠️ Reintroduces 572 lines of old code temporarily
- ⚠️ Creates confusion ("why are these uncommented?")
- ⏱️ Still requires completing Section 3.3

### Risk: MEDIUM
**Data Supporting This:** Simple find/replace on lines 1017 and 1427 to remove `/*` and line 1259 and 1755 to remove `*/`.

---

## Strategy 3: Stub Out Old Methods, Complete 3.3 Later
**Approach:** Replace commented methods with minimal stubs that call the manager, defer Section 3.3.

### Steps:
1. Replace commented `addSelectionToMap` with:
   ```typescript
   private addSelectionToMap = () => {
     // r019.15: Stub - calls manager until Section 3.3 migration complete
     const deps = { graphicsLayerRef: this.graphicsLayerRef, mapViewRef: this.mapViewRef, graphicsLayerManager: this.graphicsLayerManager, config: this.props.config }
     ;(async () => { await this.selectionRestorationManager.addSelectionToMap(deps) })()
   }
   ```
2. Same for `clearSelectionFromMap`
3. Test that Map Identify works
4. Defer Section 3.3 to later
5. Remove stubs when Section 3.3 complete

### Pros:
- ✅ Fixes production bug quickly (~15 min)
- ✅ Removes 572 lines of commented code immediately
- ✅ Minimal new code (10 lines total)
- ✅ Allows us to move forward without completing 3.3

### Cons:
- ⚠️ Defers Section 3.3 completion
- ⚠️ Stubs are a band-aid, not a real solution

### Risk: MEDIUM-LOW
**Data Supporting This:** Manager methods already exist and work for panel open/close. Stub just delegates to them.

---

## Strategy 4: Remove Blocks with Script, Not Manually
**Approach:** Write a Node.js script to remove blocks by line number ranges.

### Steps:
1. Write `remove-commented-blocks.js`:
   ```javascript
   const fs = require('fs');
   const lines = fs.readFileSync('widget.tsx', 'utf-8').split('\n');
   const filtered = lines.filter((_, i) => {
     const lineNum = i + 1;
     // Remove lines 1017-1259 (addSelectionToMap)
     if (lineNum >= 1017 && lineNum <= 1259) return false;
     // Remove lines 1427-1755 (clearSelectionFromMap) - adjusted after first removal
     if (lineNum >= 1170 && lineNum <= 1498) return false;
     return true;
   });
   fs.writeFileSync('widget.tsx', filtered.join('\n'));
   ```
2. Run script
3. Fix broken references to old methods (lines 873, 932)
4. Test

### Pros:
- ✅ Precise line-based removal (no whitespace issues)
- ✅ Removes blocks in one shot

### Cons:
- ❌ Still leaves broken references (lines 873, 932)
- ❌ Doesn't fix production bug
- ❌ Requires manual cleanup after script

### Risk: HIGH
**Data Supporting This:** This doesn't solve the root problem (active references). Just automates a failing strategy.

---

## Strategy 5: Use Git to Rewrite History, Remove Before Section 3.2
**Approach:** Rewind to before Section 3.2, remove methods then, complete 3.2 without them.

### Steps:
1. Create new branch from r019.8 (before Section 3.2)
2. Remove old methods (no references exist yet)
3. Re-implement Section 3.2 clean (no parallel execution needed)
4. Cherry-pick Section 3.2 tests

### Pros:
- ✅ Clean slate - no commented code baggage
- ✅ Would have avoided all these issues

### Cons:
- ❌ Throws away working Section 3.2 implementation
- ❌ Throws away passing E2E tests
- ❌ Hours of work lost
- ❌ Violates "Scalpel Rule" - too aggressive

### Risk: VERY HIGH
**Data Supporting This:** We have working code. Rewriting history is a last resort.

---

## Recommendation: Strategy 3 (Stub Out, Complete 3.3 Later)

### Why Strategy 3 Wins:

#### Time to Working State:
- Strategy 1: ~3 hours (implement 3.3 + tests)
- **Strategy 3: ~15 minutes (stub methods)**
- Strategy 2: ~3 hours (uncomment + implement 3.3)

#### Code Cleanliness:
- Strategy 1: ✅ Perfect (complete migration)
- **Strategy 3: ✅ Good (stubs documented, minimal)**
- Strategy 2: ⚠️ Poor (572 lines uncommented temporarily)

#### Risk:
- Strategy 1: LOW
- **Strategy 3: MEDIUM-LOW**
- Strategy 4: HIGH
- Strategy 5: VERY HIGH

#### Production Bug Fix:
- Strategy 1: ✅ Fixed after 3.3 complete
- **Strategy 3: ✅ Fixed immediately**
- Strategy 2: ✅ Fixed immediately
- Strategy 4: ❌ Not fixed
- Strategy 5: ❌ Throws away working code

### Implementation Plan for Strategy 3:

```typescript
// r019.15: Replace lines 1017-1259 with:
/**
 * Stub method - delegates to SelectionRestorationManager.
 * Called by handleRestoreOnIdentifyClose (Section 3.3 - not yet migrated).
 * TODO: Remove this stub when Section 3.3 migration complete.
 * @since 1.19.0-r019.15
 */
private addSelectionToMap = () => {
  const deps = {
    graphicsLayerRef: this.graphicsLayerRef,
    mapViewRef: this.mapViewRef,
    graphicsLayerManager: this.graphicsLayerManager,
    config: this.props.config
  }
  ;(async () => {
    await this.selectionRestorationManager.addSelectionToMap(deps)
  })()
}

// r019.15: Replace lines 1427-1755 with:
/**
 * Stub method - delegates to SelectionRestorationManager.
 * Called by handleRestoreOnIdentifyClose (Section 3.3 - not yet migrated).
 * TODO: Remove this stub when Section 3.3 migration complete.
 * @since 1.19.0-r019.15
 */
private clearSelectionFromMap = () => {
  const deps = {
    graphicsLayerRef: this.graphicsLayerRef,
    mapViewRef: this.mapViewRef,
    graphicsLayerManager: this.graphicsLayerManager,
    config: this.props.config
  }
  ;(async () => {
    await this.selectionRestorationManager.clearSelectionFromMap(deps)
  })()
}
```

### Net Change:
- **Remove:** 572 lines of commented code
- **Add:** 26 lines of stub methods (well-documented)
- **Result:** -546 lines, production bug fixed, Section 3.2 complete

---

## Adam's Approval Required

Please review these 5 strategies and confirm if you approve **Strategy 3** or prefer a different approach.

**My recommendation:** Strategy 3 fixes the bug fast, removes the problematic commented code, and gives us a clean checkpoint before tackling Section 3.3.
