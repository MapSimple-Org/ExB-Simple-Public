# FS-FLOW-05: Map Integration (Mode B)

## Overview

Describes the spatial join between feed items and a feature service, including
geometry querying via the JSAPI FeatureLayer (respects definitionExpression),
card click behavior (zoom + popup + no-geometry feedback), and the ID-based
skip optimization that prevents redundant feature service requests.

**Key files:**
- `feed-simple/src/runtime/widget.tsx` -- map integration orchestration
- `feed-simple/src/runtime/feed-card.tsx` -- card component with noGeometryMessage prop
- `feed-simple/src/utils/map-interaction.ts` -- pure utility functions
- `feed-simple/src/utils/feature-join.ts` -- JSAPI FeatureLayer queries (respects definitionExpression)
- `feed-simple/src/utils/data-source-builder.ts` -- output DS JSON for settings

---

## Configuration Requirements

Map integration requires three config values (checked by `isMapIntegrationConfigured`):

| Requirement | Source | Config Field |
|-------------|--------|--------------|
| Feature layer DataSource | `useDataSources[0]` | (widget useDataSources array) |
| Join field on service | `config.joinFieldService` | `joinFieldService` |
| Join field on feed | `config.joinFieldFeed` | `joinFieldFeed` |
| Map widget (for zoom/popup) | `config.mapWidgetId` | `mapWidgetId` |

```
 isMapIntegrationConfigured()                <- map-interaction.ts:23
      |
      +-- useDataSources?.length > 0?
      +-- config.joinFieldService?
      +-- config.joinFieldFeed?
      → All three must be truthy
```

---

## Geometry Query Pipeline

Triggered after every successful feed fetch (widget.tsx:619) and on DS creation
(widget.tsx:347-349).

```
 loadFeed() success                          <- widget.tsx:619
      |
      +-- isMapIntegrationConfigured()?
      |   +-- YES → runQueryGeometries(sortedItems)
      |   +-- NO  → log and skip
      |
      v
 runQueryGeometries(items)                   <- widget.tsx:356
      |
      +-- Guard: missing joinFieldFeed,
      |   joinFieldService, or dataSourceId
      |   → return
      |
      +-- queryGeometries({                  <- widget.tsx:361
      |     items, joinFieldFeed,
      |     joinFieldService, dataSourceId,
      |     mapView: this.mapView,           (r001.035)
      |     previousJoinIds
      |   })
      |
      v
 queryGeometries(params)                     <- map-interaction.ts:168
      |
      +-- Get DataSource from DSManager      :172
      |   → bail if null
      |
      +-- Get DS URL for layer matching      :177
      |   dsJson.url → bail if empty
      |
      +-- Guard: no mapView available?       :183
      |   → bail (r001.035)
      |
      +-- Find ACTUAL FeatureLayer on map    :191-193
      |   mapView.map.allLayers.find(        (r001.035)
      |     layer.type === 'feature' &&
      |     dsUrl.includes(layer.url))
      |   → This layer carries the web map's
      |     definitionExpression and filters
      |   → bail if not found
      |
      +-- Collect join values from items     :200-203
      |   items.map(item => item[joinFieldFeed])
      |   filter(Boolean)
      |   → bail if empty
      |
      +-- Skip optimization:                 :208-215
      |   newJoinIds === previousJoinIds?
      |   (same size + every ID matches)
      |   +-- YES → return { skipped: true }
      |   +-- NO  → continue to query
      |
      +-- queryFeatureLayerByIds()           :207
      |   (see Feature Layer Query below)
      |
      +-- Return { geometryMap, newJoinIds }
      |
      v
 Back in runQueryGeometries()                <- widget.tsx:369-372
      |
      +-- if (!result.skipped)
          this.previousJoinIds = result.newJoinIds
          setState({ geometryMap: result.geometryMap })
```

---

## Feature Layer Query (r001.035)

`queryFeatureLayerByIds()` (feature-join.ts:55-102) queries via the JSAPI
`FeatureLayer.queryFeatures()` API, which respects the layer's
`definitionExpression` and web map filters. This replaced the previous direct
`esriRequest` REST approach which bypassed all map-level filters.

```
 queryFeatureLayerByIds(featureLayer, joinField, ids) <- feature-join.ts:55
      |
      +-- Guard: empty layer/field/ids       :60-62
      |   → return empty Map
      |
      +-- Deduplicate IDs                    :65
      |
      +-- Log: layer title, joinField,       :68-76
      |   idCount, batch count,
      |   hasDefinitionExpression             (r001.035)
      |
      +-- Batch into groups of 500           :79
      |   (BATCH_SIZE constant)
      |
      +-- For each batch:                    :79-95
      |   queryBatch(featureLayer, joinField, batch)
      |   → merge results into geometryMap
      |   → catch: log error, continue
      |   (partial results are acceptable)
      |
      v
 queryBatch(featureLayer, joinField, ids)    <- feature-join.ts:110
      |
      +-- buildWhereClause()                 :117
      |   allNumeric? → joinField IN (1,2,3)
      |   strings?    → joinField IN ('a','b','c')
      |   (escapes single quotes with '')
      |
      +-- featureLayer.createQuery()         :121
      |   → Pre-populates query.where with
      |     the layer's definitionExpression
      |
      +-- Combine with IN clause:            :122-126
      |   if (query.where && != '1=1')
      |     query.where = (defExpr) AND (inClause)
      |   else
      |     query.where = inClause
      |
      +-- featureLayer.queryFeatures(query)  :130
      |   (JSAPI handles auth automatically)
      |
      +-- Extract geometries                 :132-137
          For each feature:
            joinValue = String(feature.attributes[joinField])
            if geometry exists:
              geom = feature.geometry.toJSON()
              result.set(joinValue, geom)
```

**Key design decision (r001.035):** We find the layer on `mapView.map.allLayers`
rather than using `ds.layer` from the DataSource. The DataSource's layer is a
separate instance that does NOT carry the web map's `definitionExpression`. The
map's layer does.

---

## Card Click Flow

When a user clicks a feed card, the click handler routes through a priority
chain: Feed Map Layer → Spatial Join → External Link.

```
 onCardClick(item, evt)                      <- widget.tsx:656
      |
      +-- Link inside card? (evt.target <a>) :658
      |   --> return (don't intercept)
      |
      +-- Priority 1: Feed Map Layer?        :664
      |   (isFeedMapLayerConfigured + mapView)
      |   +-- YES --> see FS-FLOW-07
      |   |   zoomToFeedPoint with skipZoom
      |   |   if returns false → showNoGeometryMessage()  (r001.035)
      |   +-- NO --> continue
      |
      +-- Priority 2: Spatial Join?          :684
      |   (isMapIntegrationConfigured)
      |   |
      |   +-- Same card already selected?    :688
      |   |   --> close popup, deselect
      |   |   --> return (toggle off)
      |   |
      |   +-- Has geometry for this item?    :697
      |   |   +-- YES --> zoom + identify
      |   |   |   inferGeometryType()
      |   |   |   new Graphic({ attrs, geom })
      |   |   |   |
      |   |   |   +-- enableZoomOnClick?
      |   |   |   |   YES → goTo().then(doIdentify)
      |   |   |   |   NO  → doIdentify() immediately
      |   |   |   |
      |   |   |   +-- setState({ selectedItemId })
      |   |   |
      |   |   +-- NO --> card click feedback  (r001.035)
      |   |       log 'card-click-no-geometry'
      |   |       setState({ selectedItemId })
      |   |       showNoGeometryMessage(itemId)
      |   |       → blue border + info banner
      |   |
      |   +-- return
      |
      +-- Priority 3: External Link?         :742
          externalLinkTemplate?
          +-- YES --> substitute tokens
          |   window.open(url, '_blank')
          +-- NO --> no-op
```

**Key design decision (r001.034):** Zoom and identify are independent.
`enableZoomOnClick` controls only the `goTo` animation. Popups and feature
identification always run, regardless of zoom setting.

---

## No-Geometry Card Feedback (r001.035)

When a card click fails to interact with the map, the widget shows a temporary
info banner below the card that auto-dismisses after 3 seconds.

```
 showNoGeometryMessage(itemId)               <- widget.tsx:757
      |
      +-- Clear any existing timer           :758
      +-- setState({ noGeometryItemId })     :759
      +-- setTimeout(3000)                   :760-763
          → setState({ noGeometryItemId: null })
```

The `noGeometryItemId` state is compared to each card's ID in the render loop.
When matched, the `noGeometryMessage` prop is passed to `FeedCard`:

```
 FeedCard render                             <- feed-card.tsx:137-158
      |
      +-- noGeometryMessage prop truthy?
          +-- YES → render info bar:
          |   - Light blue background (#e8f0fe)
          |   - ℹ icon + message text
          |   - fadeIn animation (0.2s)
          |   - "Feature not found on map" (spatial join)
          |   - "No valid coordinates" (feed map layer)
          +-- NO → nothing
```

| Path | Message (i18n key) | Trigger |
|------|-------------------|---------|
| Spatial join | `noGeometryOnMap` | `geometryMap` has no entry for join value |
| Feed Map Layer | `noValidCoordinates` | `zoomToFeedPoint` returns false (missing/NaN coords) |

---

## Geometry Type Inference

REST API JSON omits the `type` property that JSAPI requires for autocasting:

```
 inferGeometryType(restGeom)                 <- map-interaction.ts:40
      |
      +-- x + y defined?     → type = 'point'
      +-- rings defined?     → type = 'polygon'
      +-- paths defined?     → type = 'polyline'
      +-- points defined?    → type = 'multipoint'
```

---

## Zoom Target Computation

```
 buildGoToTarget(graphic, geomType, pointZoom, polyBuffer) <- map-interaction.ts:60
      |
      +-- Point geometry?
      |   → { target: graphic, zoom: zoomFactorPoint }
      |
      +-- Line/Polygon geometry?
          → geometry.extent.expand(zoomFactorPoly)
```

| Config | Default | Purpose |
|--------|---------|---------|
| `zoomFactorPoint` | 15 | Map zoom level for point features (no hard max — JSAPI clamps to basemap) |
| `zoomFactorPoly` | 1.5 | Extent expansion factor (1.0 = tight, 2.0 = double) |
| `enableZoomOnClick` | true | When false, zoom is skipped but identify/popup still runs |

---

## Feature Identification (Popup)

The widget identifies the feature on the map layer and opens its configured
popup. When zoom is enabled, this runs after the `goTo` animation completes.
When zoom is disabled (`enableZoomOnClick === false`), it runs immediately.

```
 identifyFeatureOnMap(params)                <- map-interaction.ts:86
      |
      +-- Get origin DS from DataSourceManager
      |   → extract DS URL
      |
      +-- Find matching FeatureLayer on map
      |   mapView.map.allLayers.find(layer =>
      |     layer.type === 'feature' &&
      |     dsUrl.includes(layer.url))
      |
      +-- Guard: no layer found?
      |   → log and return
      |
      +-- featureLayer.queryFeatures()
      |   where: joinField = joinValue
      |   outFields: ['*']
      |   returnGeometry: true
      |
      +-- ExB popup lazy-init workaround
      |   if (!mapView.popup?.open)
      |   → mapView.popup = new Popup({ view })
      |
      +-- mapView.popup.open({
          features: [feature],
          location: point or extent.center
        })
```

---

## Skip Optimization

The geometry query is expensive (network + REST API). The widget caches the set of
join IDs from the last query and skips re-querying if the IDs are identical:

```
previousJoinIds (instance variable)
      |
      +-- After loadFeed success:
      |   queryGeometries() compares newJoinIds vs previousJoinIds
      |   Same set? → skip query, return { skipped: true }
      |
      +-- On DS change (componentDidUpdate):
          previousJoinIds = new Set()  (force re-query)
```

This means polling cycles that return the same feed items with the same join
field values do NOT re-query the feature service.

---

## DataSourceComponent and JimuMapViewComponent

Both are rendered conditionally in the widget's render tree:

```
 DataSourceComponent                         <- widget.tsx:910-914
      |
      +-- Rendered if: isMapIntegrationConfigured()
      +-- useDataSource: props.useDataSources[0]
      +-- onDataSourceCreated → onOriginDsCreated()
          → triggers initial geometry query if items exist

 JimuMapViewComponent                        <- widget.tsx:917-920
      |
      +-- Rendered if: config.mapWidgetId is set
      +-- useMapWidgetId: config.mapWidgetId
      +-- onActiveViewChange → stores mapView ref
```

---

## Three Click Behaviors (Priority Order)

| Priority | Config State | Card Click Behavior |
|----------|-------------|---------------------|
| 1 | Feed Map Layer configured | Zoom to point (if enabled) + open popup; toggle off on re-click; info banner if no coords |
| 2 | Spatial Join configured | Zoom to feature (if enabled) + identify via popup; toggle off on re-click; info banner if no geometry |
| 3 | externalLinkTemplate only | Open substituted URL in new browser tab |
| -- | Neither configured | Cards are not interactive (no pointer cursor) |

`isCardClickable()` returns true if any click behavior is available.

---

## FeatureEffect on Joined Layer (r002.027)

When search or filter is active, non-matching features on the joined map layer
are dimmed using JSAPI's `FeatureEffect`. This provides visual feedback on the
map showing which features correspond to the currently visible cards.

### Effect Application Flow

```
 syncJoinedLayerFilterEffect()               <- widget.tsx
      |
      +-- Guard: no mapView or no DS?
      |   → return
      |
      +-- Collect filteredJoinValues from
      |   getProcessedItems().allProcessed
      |   (items after search/filter, before pagination)
      |
      +-- Collect allJoinValues from
      |   this.state.items (all items)
      |
      +-- applyFilterEffect({                 <- map-interaction.ts
      |     mapView, dataSourceId,
      |     joinField, filteredJoinValues,
      |     allJoinValues
      |   })
      |
      v
 applyFilterEffect(params)                   <- map-interaction.ts
      |
      +-- findJoinedFeatureLayer()
      |   mapView.map.allLayers.find(
      |     layer.type === 'feature' &&
      |     dsUrl.includes(layer.url))
      |   → bail if not found
      |
      +-- mapView.whenLayerView(layer)
      |   → get LayerView (async)
      |
      +-- No filter active?
      |   (filteredValues.length === allValues.length)
      |   → layerView.featureEffect = null
      |   → return (clear effect)
      |
      +-- Build WHERE clause:
      |   joinField IN ('val1','val2',...)
      |
      +-- layerView.featureEffect = new FeatureEffect({
          filter: new FeatureFilter({ where }),
          excludedEffect: 'grayscale(100%) opacity(30%)'
        })
```

### Effect Triggers

| Trigger | Location | Notes |
|---------|----------|-------|
| Search change | `onSearchChange` callback | After search query updates |
| Filter/maxItems change | `componentDidUpdate` | When config filtering changes |

### Effect Cleanup

| Trigger | Action |
|---------|--------|
| `componentWillUnmount` | `clearFilterEffect()` |
| `onActiveViewChange` | `clearFilterEffect()` (view switched) |
| DataSource change | `clearFilterEffect()` (DS reconfigured) |

```
 clearFilterEffect(mapView, dataSourceId)    <- map-interaction.ts
      |
      +-- findJoinedFeatureLayer()
      +-- mapView.whenLayerView(layer)
      +-- layerView.featureEffect = null
```

---

*Last updated: r002.030 (2026-03-14)*
