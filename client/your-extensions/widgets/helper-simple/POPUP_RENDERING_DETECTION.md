# Identify Popup Rendering Detection - Options

**Issue:** We're restoring selection too early, before the identify popup is fully rendered. This causes identify to change the selection back, creating a race condition.

**Goal:** Detect when the identify popup is fully rendered before restoring selection.

---

## Option 1: Watch for Mutations to Stop (CURRENT IMPLEMENTATION)

**Approach:** Use MutationObserver to watch the popup element. When mutations stop for a brief period (e.g., 100-200ms), consider the popup fully rendered.

**Pros:**
- Event-driven (no fixed delays)
- Adapts to different rendering speeds
- Works regardless of popup content structure

**Cons:**
- Still uses a small timeout to detect "no mutations"
- May miss very rapid mutations
- Requires tuning the "stability" timeout

**Implementation:**
- Watch `.esri-popup[role="dialog"]` element for mutations
- Track last mutation time
- When mutations stop for X ms, consider popup stable
- Then start selection monitoring and restore

**Status:** ✅ Implemented

---

## Option 2: Check for Specific Content Elements

**Approach:** Watch for specific DOM elements that indicate popup is fully rendered (e.g., `.esri-features__content`, `.esri-popup__content`, `.esri-features__list-item`).

**Pros:**
- True event-driven (no timeouts)
- Very specific - only restores when content is actually there
- No timing dependencies

**Cons:**
- Depends on specific DOM structure (may break if ArcGIS updates popup HTML)
- May need to check multiple selectors
- Might miss if content structure changes

**Implementation:**
```typescript
function isIdentifyPopupFullyRendered(): boolean {
  const popup = document.querySelector('.esri-popup[role="dialog"]')
  if (!popup) return false
  
  // Check for key content elements
  const hasContent = popup.querySelector('.esri-features__content') || 
                     popup.querySelector('.esri-popup__content') ||
                     popup.querySelector('.esri-features__list-item')
  
  return !!hasContent && popup.getAttribute('aria-hidden') !== 'true'
}
```

**Status:** ⏸️ Not implemented (fallback option)

---

## Option 3: Watch Selection + Popup Content Together

**Approach:** Combine both approaches - wait for selection to be 1 AND popup content to be present.

**Pros:**
- Most reliable - ensures both conditions are met
- Reduces false positives

**Cons:**
- More complex logic
- Still may need small timeout for content check

**Status:** ⏸️ Not implemented (future option)

---

## Current Implementation Details

**File:** `helper-simple/src/runtime/widget.tsx`

**Key Components:**
- `popupStabilityObserver`: MutationObserver watching popup element
- `popupMutationTimeout`: Timeout to detect when mutations stop
- `POPUP_STABILITY_MS`: Time to wait after last mutation (currently 150ms)

**Flow:**
1. Identify popup opens → Start watching popup element for mutations
2. Track last mutation time
3. When mutations stop for 150ms → Popup is stable
4. Start selection monitoring
5. When selection changes to 1 → Restore

**To Switch to Option 2:**
1. Replace `popupStabilityObserver` logic with `isIdentifyPopupFullyRendered()` checks
2. Remove mutation timeout logic
3. Check for content elements in selection monitoring loop

---

## Testing Notes

- Test with slow network connections (popup may render slower)
- Test with fast clicks (rapid identify clicks)
- Test with different popup content types
- Monitor console logs for "Popup stable" vs "Popup content detected"

---

## Future Improvements

- Consider combining Option 1 + Option 2 for maximum reliability
- Add fallback timeout if mutations never stop (edge case)
- Monitor for popup content changes after initial render

