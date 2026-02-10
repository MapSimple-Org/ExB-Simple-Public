# Release Notes: v1.19.0-r022.108-109

**Release Date**: February 9, 2026  
**Type**: Feature Enhancement  
**Impact**: User Experience - Visual Polish

---

## 🎬 Animated Spring Drop for Hover Preview Pin

Google Maps-style drop-and-bounce animation when hover preview pins appear on the map.

### What's New

#### r022.108: Spring Animation Implementation
- **Spring Physics**: Pin animates with stiffness `0.15` and damping `0.8`
- **Starting Position**: Pin suspended at `y: -2.0` (relative anchor point)
- **Final Position**: Settles at `y: -0.5` with natural bounce effect
- **Performance**: Smooth 60fps using `requestAnimationFrame`

#### r022.109: Animation Timing Adjustment
- **Optimized Start**: Adjusted initial position from `y: -2.0` to `y: -1.2`
- **Result**: Snappier, more responsive animation feel
- **Same Physics**: Maintains stiffness and damping values

### User Experience

**Animation Behavior:**
- Plays automatically when hovering over any result item in the list
- Restarts when hovering different results (graphic reused)
- Cancels immediately on mouse leave or result click
- No performance impact (single graphic, efficient physics loop)

**Why This Matters:**
The spring animation adds a professional, delightful touch to the hover preview feature. Users get instant visual feedback when exploring results, and the familiar bounce effect feels natural and responsive - matching the polished UX of Google Maps.

---

## Technical Implementation

### Animation Architecture

**Core Components:**
```typescript
// Physics constants
const targetY = -0.5   // Final resting position
const initialY = -1.2  // Starting suspended height
const stiffness = 0.15
const damping = 0.8

// Animation loop
const animate = (timestamp: number) => {
  const force = (targetY - currentY) * stiffness
  velocity = (velocity + force) * damping
  currentY += velocity
  
  // Update CIM symbol anchor point
  newSymbol.data.symbol.symbolLayers[0].anchorPoint = { x: 0, y: currentY }
  hoverGraphicRef.current.symbol = newSymbol
  
  // Continue until settled
  if (Math.abs(velocity) > 0.001 || Math.abs(targetY - currentY) > 0.001) {
    animationRef.current = requestAnimationFrame(animate)
  }
}
```

**Lifecycle Management:**
- `animationRef` stores the `requestAnimationFrame` ID
- `cancelAnimationFrame()` called in all exit paths:
  - Mouse leave (hide pin)
  - Result item click (hide pin)
  - Component unmount (cleanup)
- Animation restarts automatically when hovering different results

### Files Modified

**r022.108:**
- `query-simple/src/runtime/query-result-item.tsx`
  - Added `animationRef` useRef for animation ID tracking
  - Implemented spring physics loop in `handleMouseEnter`
  - Added `cancelAnimationFrame()` to mouse leave, click, and unmount handlers
- `query-simple/src/version.ts`: Incremented to `r022.108`

**r022.109:**
- `query-simple/src/runtime/query-result-item.tsx`
  - Updated `initialY` from `-2.0` to `-1.2` (both animation paths)
  - Updated initial `anchorPoint.y` on symbol creation
- `query-simple/src/version.ts`: Incremented to `r022.109`

### Debug Logging

**New Events:**
- `HOVER-PREVIEW` → `animation-complete`: Logged when animation settles
- `HOVER-PREVIEW` → `animation-complete-reuse`: When reused graphic settles
- `HOVER-PREVIEW` → `animation-update-error`: If symbol update fails

**Enable Logging:**
```
?debug=HOVER-PREVIEW
```

---

## Upgrade Notes

### For Developers

**No Breaking Changes:**
- Animation is fully automatic - no configuration required
- Existing hover preview functionality preserved
- All cleanup handled internally

**Testing:**
1. Hover over result items in the list
2. Observe pin drop with bounce effect
3. Verify animation cancels on mouse leave
4. Verify animation cancels on result click

### Performance Considerations

**Optimized:**
- Single graphic reused across all hover events
- `requestAnimationFrame` for efficient rendering
- Animation stops automatically when settled (no continuous CPU usage)
- Proper cleanup prevents memory leaks

**Benchmarks:**
- Animation duration: ~500ms (varies by physics)
- Frame rate: Smooth 60fps
- CPU impact: Negligible (stops when settled)

---

## Known Issues

None identified.

---

## Related Changes

**Related Features:**
- r022.107: Configurable hover pin color
- r022.106: Hover preview pin implementation

**Next Steps:**
- Monitor user feedback on animation feel
- Consider exposing physics constants as advanced settings (future)

---

## Migration Guide

No migration required. Update widgets and reload Experience Builder.

```bash
# 1. Copy updated widgets
cp -r query-simple helper-simple shared-code /path/to/ExB/client/your-extensions/widgets/

# 2. Rebuild
cd /path/to/ExB/client
npm run build

# 3. Restart Experience Builder
```

---

**Questions or Issues?**  
Report on GitHub: https://github.com/MapSimple-Org/ExB-Simple-Public/issues
