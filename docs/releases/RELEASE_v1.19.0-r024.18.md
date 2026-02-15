# Release v1.19.0-r024.18

**Release Date:** 2026-02-14  
**Experience Builder Version:** 1.19.0+

## Highlights

### LayerList Persistent Results (r024.0-r024.18)

This release introduces a major new feature: **LayerList integration** with persistent result layers. Query results can now be displayed as a `GroupLayer` visible in the LayerList (map table of contents) and Legend widgets, persisting even when the widget is closed.

#### Core Feature (r024.0-r024.11)

**Settings Toggle:**
- New "Show results in LayerList" toggle in widget settings (Graphics section)
- Optional custom layer title (defaults to "QuerySimple Results")
- Results persist on map when widget closes; no more clear/restore cycle

**Architecture:**
- Results render into a `GroupLayer` with 3 sublayers (Points, Lines, Polygons)
- Each geometry type automatically routes to the correct sublayer
- LayerList shows collapsible group with geometry-type sublayers
- Toggle layer or sublayers in LayerList to control visibility
- Multiple widgets each get their own GroupLayer (no conflicts)

**Lifecycle Management:**
- Widget close: Graphics persist (no clearing)
- Widget reopen: No duplicate graphics, no restoration flash
- Clear All: Removes GroupLayer from map entirely
- Next query: Creates fresh GroupLayer

**Bug Fixes:**
- **r024.4**: Toggle change detection - switching toggle after initialization now recreates layer with correct type
- **r024.5**: Config registration timing - moved to constructor to prevent race conditions
- **r024.9**: Restored 3-sublayer architecture with `visibilityMode: 'inherited'` for reliable LayerList integration
- **r024.10**: Fixed `clearGraphicsLayerRefs` to recreate correct layer type (GroupLayer vs GraphicsLayer)
- **r024.11**: Fixed Clear All to work with both layer types (`clearGraphicsLayerOrGroupLayer`)

#### Legend Support (r024.12-r024.15)

**Dynamic Legend Entries:**
- GraphicsLayers don't show in Legend (Esri limitation)
- Solution: Companion "controller" FeatureLayers with renderers show symbology in Legend
- Legend entries dynamically appear when graphics of that geometry type are added
- Legend entries automatically removed when last graphic of that type is cleared
- Toggling in Legend controls visibility of actual graphics

**Architecture:**
```
GroupLayer "Enhanced Search"
  ├── Points (GraphicsLayer) - actual graphics
  ├── Lines (GraphicsLayer) - actual graphics  
  ├── Polygons (GraphicsLayer) - actual graphics
  ├── point-legend (FeatureLayer) - shows in Legend when points exist
  ├── polyline-legend (FeatureLayer) - shows in Legend when lines exist
  └── polygon-legend (FeatureLayer) - shows in Legend when polygons exist
```

**User Experience:**
- Legend automatically reflects what's currently on the map
- No empty Legend entries cluttering the widget
- Legend FeatureLayers hidden from LayerList (`listMode: 'hide'`) to avoid confusion
- Full visibility control from both LayerList and Legend

#### Edge Case Fixes (r024.16-r024.18)

**r024.16 - Removal Protection:**
- Fixed: User can no longer accidentally remove the GroupLayer via LayerList's "Remove" action
- If removed, layer automatically re-adds itself
- Prevents breaking widget functionality

**r024.17 - Race Condition Fix:**
- Fixed: Hash query loads no longer create duplicate GroupLayers
- Root cause: Multiple concurrent calls to `createOrGetResultGroupLayer` during async initialization
- Solution: Promise-based creation lock ensures only one layer created per widgetId

**r024.18 - Auto-Enable Visibility:**
- Fixed: If GroupLayer is toggled off and user runs new query, layer automatically turns back on
- Prevents confusion when graphics don't appear because layer is hidden
- User-friendly: assumes user wants to see new results

## Installation

Copy the widget folders to your Experience Builder installation:

```
your-extensions/widgets/
  query-simple/
  helper-simple/
  shared-code/
```

## Compatibility

- ArcGIS Experience Builder 1.19.0 or later
- Tested with ArcGIS Online and ArcGIS Enterprise

## Backward Compatibility

- **Default behavior unchanged**: Toggle defaults to OFF
- Existing deployments see zero change unless toggle is explicitly enabled
- No migration required

## Documentation

- [README](../../README.md) - Installation and configuration
- [CHANGELOG](../../CHANGELOG.md) - Full change history
