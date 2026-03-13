# FS-FLOW-05: Map Integration (Mode B)

## Overview

Describes the spatial join between feed items and a feature service, including
geometry querying, card click behavior (zoom + popup), and the ID-based skip
optimization that prevents redundant feature service requests.

**Key files:**
- `feed-simple/src/runtime/widget.tsx` -- map integration orchestration (widget.tsx:283-558)
- `feed-simple/src/utils/map-interaction.ts` -- pure utility functions (209 lines)
- `feed-simple/src/utils/feature-join.ts` -- feature service REST queries (157 lines)
- `feed-simple/src/utils/data-source-builder.ts` -- output DS JSON for settings (54 lines)

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

Triggered after every successful feed fetch (widget.tsx:449) and on DS creation
(widget.tsx:294-296).

```
 loadFeed() success                          <- widget.tsx:449
      |
      +-- isMapIntegrationConfigured()?      :449
      |   +-- YES → runQueryGeometries(sortedItems)
      |   +-- NO  → log and skip
      |
      v
 runQueryGeometries(items)                   <- widget.tsx:303
      |
      +-- Guard: missing joinFieldFeed,      :306
      |   joinFieldService, or dataSourceId
      |   → return
      |
      +-- queryGeometries({...params})       :308-314
      |                                      <- map-interaction.ts:164
      |
      v
 queryGeometries(params)                     <- map-interaction.ts:164
      |
      +-- Get DataSource from DSManager      :168
      |   → bail if null
      |
      +-- Get feature service URL from DS    :173-174
      |   dsJson.url → bail if empty
      |
      +-- Collect join values from items     :181-183
      |   items.map(item => item[joinFieldFeed])
      |   filter(Boolean)
      |   → bail if empty
      |
      +-- Skip optimization:                 :190-197
      |   newJoinIds === previousJoinIds?
      |   (same size + every ID matches)
      |   +-- YES → return { skipped: true }
      |   +-- NO  → continue to query
      |
      +-- queryFeatureServiceByIds()         :200
      |   (see Feature Service Query below)
      |
      +-- Return { geometryMap, newJoinIds } :208
      |
      v
 Back in runQueryGeometries()                <- widget.tsx:316-319
      |
      +-- if (!result.skipped)
          this.previousJoinIds = result.newJoinIds
          setState({ geometryMap: result.geometryMap })
```

---

## Feature Service Query

`queryFeatureServiceByIds()` (feature-join.ts:50-99) queries the ArcGIS REST API
with batched WHERE IN clauses.

```
 queryFeatureServiceByIds(url, joinField, ids) <- feature-join.ts:50
      |
      +-- Guard: empty url/field/ids         :57-59
      |   → return empty Map
      |
      +-- Deduplicate IDs                    :62
      |
      +-- Batch into groups of 500           :73
      |   (BATCH_SIZE constant)
      |
      +-- For each batch:                    :73-89
      |   queryBatch(url, joinField, batch)
      |   → merge results into geometryMap
      |   → catch: log error, continue
      |   (partial results are acceptable)
      |
      v
 queryBatch(url, joinField, ids)             <- feature-join.ts:105
      |
      +-- Build WHERE clause                 :115-122
      |   allNumeric? → joinField IN (1,2,3)
      |   strings?    → joinField IN ('a','b','c')
      |   (escapes single quotes with '')
      |
      +-- esriRequest(url + '/query')        :126-134
      |   query: {
      |     where: whereClause,
      |     outFields: joinField,
      |     returnGeometry: true,
      |     f: 'json'
      |   }
      |   (esriRequest auto-attaches portal/AGOL auth)
      |
      +-- Check for REST error               :138-139
      |   data.error → throw
      |
      +-- Extract geometries                 :142-153
          For each feature:
            joinValue = String(feature.attributes[joinField])
            if geometry exists:
              Attach response-level spatialReference
              result.set(joinValue, geometry)
```

---

## Card Click Flow

When a user clicks a feed card, the click handler routes to one of three behaviors:

```
 onCardClick(item, evt)                      <- widget.tsx:487
      |
      +-- Link inside card? (evt.target <a>) :489
      |   → return (don't intercept)
      |
      +-- Decision: Map Integration configured?
      |   |
      |   +-- YES ──────────────────────────────────────┐
      |   |                                             |
      |   |   +-- Same card already selected?          :499
      |   |   |   → close popup                       :500-501
      |   |   |   → setState({ selectedItemId: null }) :503
      |   |   |   → return (toggle off)
      |   |   |
      |   |   +-- Has geometry for this item?          :508
      |   |   |   |
      |   |   |   +-- YES ────────────────────────┐
      |   |   |   |                               |
      |   |   |   |   inferGeometryType()        :510
      |   |   |   |   new Graphic({ attrs, geom }) :511-514
      |   |   |   |   buildGoToTarget()           :520
      |   |   |   |   mapView.goTo(target)        :522
      |   |   |   |   .then() → identifyFeatureOnMap() :523-528
      |   |   |   |   setState({ selectedItemId }) :535
      |   |   |   |
      |   |   |   +-- NO → log 'no-geometry'      :538
      |   |   |
      |   |   +-- return                          :540
      |   |
      |   +-- NO: External Link?                      :544
      |       externalLinkTemplate?
      |       +-- YES → substitute tokens in URL     :546-549
      |       |   window.open(url, '_blank')          :552
      |       +-- NO  → no-op
```

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
      +-- Point geometry?                    :66-67
      |   → { target: graphic, zoom: zoomFactorPoint }
      |
      +-- Line/Polygon geometry?             :69
          → geometry.extent.expand(zoomFactorPoly)
```

| Config | Default | Purpose |
|--------|---------|---------|
| `zoomFactorPoint` | 15 | Map zoom level for point features (1-23 scale) |
| `zoomFactorPoly` | 1.5 | Extent expansion factor (1.0 = tight, 2.0 = double) |

---

## Feature Identification (Popup)

After zoom animation completes, the widget identifies the feature on the map
layer and opens its configured popup:

```
 identifyFeatureOnMap(params)                <- map-interaction.ts:86
      |
      +-- Get origin DS from DataSourceManager :91
      |   → extract DS URL
      |
      +-- Find matching FeatureLayer on map  :96-98
      |   mapView.map.allLayers.find(layer =>
      |     layer.type === 'feature' &&
      |     dsUrl.includes(layer.url))
      |
      +-- Guard: no layer found?             :100-103
      |   → log and return
      |
      +-- featureLayer.queryFeatures()       :112-116
      |   where: joinField = joinValue
      |   outFields: ['*']
      |   returnGeometry: true
      |
      +-- ExB popup lazy-init workaround     :122-124
      |   if (!mapView.popup?.open)
      |   → mapView.popup = new Popup({ view })
      |
      +-- mapView.popup.open({               :126-131
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
 DataSourceComponent                         <- widget.tsx:709-714
      |
      +-- Rendered if: isMapIntegrationConfigured()
      +-- useDataSource: props.useDataSources[0]
      +-- onDataSourceCreated → onOriginDsCreated()
          → triggers initial geometry query if items exist

 JimuMapViewComponent                        <- widget.tsx:716-721
      |
      +-- Rendered if: config.mapWidgetId is set
      +-- useMapWidgetId: config.mapWidgetId
      +-- onActiveViewChange → stores mapView ref
```

---

## Two Click Behaviors

| Config State | Card Click Behavior |
|-------------|---------------------|
| Map integration configured | Zoom to feature + open popup; toggle off on re-click |
| externalLinkTemplate only | Open substituted URL in new browser tab |
| Neither configured | Cards are not interactive (no pointer cursor) |

`isCardClickable()` (widget.tsx:556-558) returns true if either behavior is available.

---

*Last updated: r001.031 (2026-03-13)*
