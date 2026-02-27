# MapSimple Widgets v1.19.0-r022.104

**Release Date**: February 8, 2026  
**Type**: Feature Enhancement + Critical Fixes

## 🎨 Graphics Symbology v2

**Fully configurable graphics layer styling** - customize colors, opacity, and sizing for both fill and outline.

### New Configuration Options

Configure in widget settings panel:
- **Fill Color**: Hex color picker (default: #DF00FF magenta)
- **Fill Opacity**: 0-1 slider (default: 0.25)
- **Outline Color**: Hex color picker (default: #DF00FF magenta)
- **Outline Width**: 1-5px (default: 2px)
- **Point Marker Size**: 8-24px (default: 12px)

### Centralized Management

- **HighlightConfigManager**: New singleton for consistent graphics configuration across all QuerySimple widgets
- **Per-Widget Customization**: Each QuerySimple widget can have its own color scheme
- **New Default Color**: Magenta (#DF00FF) - brighter and more visible than previous purple

---

## 🎯 UX Improvements

### Zoom to Results Button

**Moved from hidden Actions menu to prominent Results tab header.**

- **Location**: Right of the Clear (trash) button
- **Why**: Users requested more discoverable placement - no longer buried in dropdown
- **Accessibility**: 36x36px touch-friendly target (WCAG/Apple HIG compliant)
- **Consistent Icon**: Same zoom-to icon as used in Actions menu

### Touch Target Optimization

All action buttons now meet accessibility standards:
- **Size**: 36x36px minimum touch targets
- **Standard**: Aligns with WCAG 2.1 Level AAA and Apple Human Interface Guidelines
- **Impact**: Better usability on tablets and touch devices

---

## 🐛 Critical Fixes

### Un-Minimize Restoration Fix (r022.104)

**Fixed**: Widget un-minimize triggering duplicate restoration logic.

**The Problem**:
- Un-minimizing widget was triggering `handleVisibilityChange(true)` via DOM visibility detection
- This happened even though `props.state` stayed `'OPENED'` the entire time (widget was never actually closed)
- Result: Unnecessary restoration events, duplicate logic execution

**The Solution**:
- Track first open with `hasOpenedOnce` flag
- Use DOM detection (IntersectionObserver) **only** for first widget open
- After first open, rely solely on `props.state` transitions in `componentDidUpdate`
- Un-minimize now correctly ignored (widget was already open)

**Logic Flow**:
```
First widget open: Use DOM detection ✅
Minimize: No action (props.state stays 'OPENED') ✅
Un-minimize: Ignore DOM visibility (already opened once) ✅
Close → Re-open: props.state transition handles it ✅
```

**Impact**: ✅ Clean widget lifecycle - no duplicate restoration on un-minimize

### Selection Count Bug (High Priority)

**Fixed**: "3 selections with 2 results" issue causing incorrect selection counts.

**Root Cause**:
- Faulty r022.96 "optimization" was disabling intelligent selection checks
- Forced duplicate `selectRecordsByIds()` calls on every render
- Resulted in additive selection behavior

**Solution**:
- Removed the problematic r022.96 "fix"
- Restored correct selection logic
- Selection counts now accurate in all modes (New/Add/Remove)

**Impact**: ✅ Selection counts match displayed results in all scenarios

### Popup Multi-Click Issue

**Fixed**: Popups now open on first click (no longer require 2-3 clicks).

**Root Cause**:
- `[esri.widgets.Features]` warning: "Features can only be focused when currently active"
- Premature focus on Features widget prevented popup from opening

**Solution**:
- Set `shouldFocus: false` in `mapView.openPopup()`
- Prevents Features widget from intercepting focus

**Impact**: ✅ Consistent single-click popup behavior across all interactions

### Graphics Z-Order Optimization

**Fixed**: Purple graphics now consistently render on top of native blue selection outline.

**Why It Matters**:
- Provides visual confirmation that both graphics (purple) and native selection (blue) are active
- Users can see both colors: purple fill + blue outline

**Implementation**:
- Graphics layer repositioned to absolute end of layer stack
- Repositioning occurs in `addHighlightGraphics()` after native selection creates highlight layers
- Ensures purple graphics always draw last (on top)

**Impact**: ✅ Both colors visible - purple fill + blue outline (no more obscured selection)

---

## 📊 Version Comparison

| Feature | r022.87 | r022.104 |
|---------|---------|----------|
| Configurable Graphics Symbology | ❌ | ✅ NEW |
| Zoom Button on Results Header | ❌ | ✅ NEW |
| Touch-Friendly Buttons (36px) | ❌ | ✅ NEW |
| Default Color | Cyan | Magenta ✅ |
| Accurate Selection Counts | ✅ | ✅ IMPROVED |
| Single-Click Popups | ❌ | ✅ FIXED |
| Graphics Z-Order | Inconsistent | ✅ FIXED |
| Un-Minimize Restoration | Issues | ✅ FIXED |

---

## 🔧 Technical Details

### Architecture Improvements

**HighlightConfigManager** (NEW):
- Centralized singleton for graphics configuration
- Per-widget color scheme support
- Hot-swappable configuration without widget restart
- RGB color conversion with fallback defaults

**Z-Order Management**:
- Dynamic layer stack repositioning
- Detects Experience Builder's `-highlight` layers
- Ensures custom graphics always render above native selection
- Performance: < 1ms overhead per render

**Widget Lifecycle Management** (r022.104):
- Hybrid detection strategy: DOM for first open, props.state thereafter
- Track first open with `hasOpenedOnce` flag
- No duplicate restoration on un-minimize
- Clean event logs and debugging

**Selection Logic Refinement**:
- Removed r022.96 optimization (was causing bugs)
- Restored intelligent `alreadySelected` checks
- Eliminated duplicate selection calls
- Cross-layer selection accuracy maintained

### Files Modified (11 files)

- `query-simple/src/config.ts` - Graphics symbology config properties
- `query-simple/src/setting/setting.tsx` - Settings UI for colors/sizes
- `query-simple/src/runtime/query-result.tsx` - Zoom button, popup fix
- `query-simple/src/runtime/graphics-layer-utils.ts` - Z-order management
- `query-simple/src/runtime/hooks/use-widget-visibility.ts` - Un-minimize fix (r022.104)
- `shared-code/mapsimple-common/highlight-config-manager.ts` - NEW centralized config
- `shared-code/mapsimple-common.ts` - Barrel export update
- `query-simple/src/version.ts` - r022.87 → r022.104

### Testing Status

✅ All features tested and verified:
- Configurable colors (fill and outline)
- Configurable opacity and sizes
- Zoom button placement and functionality
- Touch target sizing (36x36px)
- Selection count accuracy (all modes)
- Popup single-click behavior
- Graphics z-order (purple on top)
- Cross-layer selection accuracy
- Widget minimize/maximize/close/open
- **Un-minimize: No duplicate restoration** ✅
- Hash URL parameter handling

---

## 📥 Installation

### New Installation

```bash
# 1. Copy widgets to your ExB installation
cd /path/to/experience-builder/client/your-extensions/widgets
cp -r query-simple helper-simple shared-code ./

# 2. Rebuild Experience Builder
cd /path/to/experience-builder/client
npm run build

# 3. Restart the server and add widgets to your app
```

### Upgrade from r022.87 or Earlier

1. **Backup your existing installation**
2. **Replace widget files** with new versions
3. **Rebuild Experience Builder**: `npm run build`
4. **No configuration changes required** - All existing configs compatible
5. **Test new features**: Graphics configuration, zoom button, minimize/un-minimize behavior

**Breaking Changes**: None - fully backward compatible

---

## 🎓 Debug Logging

Enable debug logging by adding `?debug=` parameter to your URL:

```
?debug=all                          - Enable all debug logs
?debug=GRAPHICS-LAYER,WIDGET-STATE  - Enable specific features
?debug=false                        - Disable all (default)
```

**Relevant Features**: `GRAPHICS-LAYER`, `CONFIG`, `WIDGET-STATE`, `RESTORE`, `POPUP`

**New in r022.104**: Enhanced logging for first-open detection and un-minimize events

---

## 🙏 Acknowledgments

Built by the MapSimple organization as a modern replacement for Robert Scheitlin's Enhanced Search widget for ArcGIS Web App Builder.

**Special Thanks**:
- Robert Scheitlin for the original WAB Enhanced Search widget
- The ArcGIS Experience Builder team for the excellent framework
- Community testers for feedback on graphics configuration and widget lifecycle behavior

---

## 📄 License

MIT License - See [LICENSE](LICENSE) file for details

Copyright (c) 2025-2026 MapSimple Organization

---

## 🔗 Links

- **Documentation**: [README.md](README.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)
- **Issues**: [Report a bug](https://github.com/MapSimple-Org/ExB-Simple-Public/issues)
- **Previous Release**: [v1.19.0-r022.87](https://github.com/MapSimple-Org/ExB-Simple-Public/releases/tag/v1.19.0-r022.87)

---

© 2025-2026 MapSimple Organization
