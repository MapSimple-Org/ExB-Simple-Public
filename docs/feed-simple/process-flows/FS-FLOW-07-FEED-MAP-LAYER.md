# FS-FLOW-07: Feed Map Layer (Mode C)

## Overview

Describes the client-side FeatureLayer generated from feed item coordinates,
including layer creation, poll-cycle sync, bidirectional card-map click behavior,
and CustomContent popup rendering.

**Key files:**
- `feed-simple/src/runtime/widget.tsx` -- layer lifecycle orchestration (1612 lines)
- `feed-simple/src/utils/feed-layer-manager.ts` -- layer creation, sync, destroy, popups, navigation (800 lines)

---

## Configuration Requirements

Feed Map Layer requires four config values (checked by `isFeedMapLayerConfigured`):

| Requirement | Config Field | Example |
|-------------|-------------|---------|
| Feature enabled | `enableFeedMapLayer` | `true` |
| Latitude field | `latitudeField` | `origin.latitude.value` |
| Longitude field | `longitudeField` | `origin.longitude.value` |
| Map widget | `mapWidgetId` | `widget_3` |

```
 isFeedMapLayerConfigured(config)             <- feed-layer-manager.ts:79
      |
      +-- config.enableFeedMapLayer?
      +-- config.latitudeField?
      +-- config.longitudeField?
      +-- config.mapWidgetId?
      --> All four must be truthy
```

---

## Layer Creation

Triggered when `mapView`, config, and parsed items are all available. In r002,
layer creation also happens in the `setState` callback after items arrive from
`loadFeed()`, fixing a race condition where the layer could be created before
state was committed.

```
 componentDidUpdate / onActiveViewChange /    <- widget.tsx
 setState callback (r002)                     (race condition fix)
      |
      +-- isFeedMapLayerConfigured(config)?
      |   +-- NO --> skip
      |   +-- YES --> continue
      |
      +-- mapView available?
      |   +-- NO --> skip
      |   +-- YES --> continue
      |
      +-- initFeedLayer(items, fieldNames)       <- widget.tsx:485
      |
      +-- createFeedFeatureLayer(                <- feed-layer-manager.ts:94
      |     widgetId, config, fieldNames)
      |
      +-- Build field mapping                    :101
      |   buildFieldMapping(fieldNames)
      |   original.key -> sanitized_key
      |   (dots, @, [] replaced with _)
      |   Cached by fieldNames reference (r003.005)
      |
      +-- Define FeatureLayer fields             :110-121
      |   All fields as type 'string'
      |   + OBJECTID as oid
      |   + FEED_ITEM_ID as string
      |   (statusField stored as 'double' when ClassBreaksRenderer active)
      |
      +-- Build renderer                         :124
      |   buildRenderer(config)
      |   ClassBreaksRenderer when colorMode='range' + rangeColorBreaks
      |   SimpleRenderer otherwise (color, size, style from config)
      |
      +-- new FeatureLayer({                     :126-138
      |     id: LAYER_ID_PREFIX + widgetId,
      |     source: [],
      |     objectIdField: 'OBJECTID',
      |     listMode: 'show',
      |     renderer
      |   })
      |
      +-- mapView.map.add(layer)                 <- widget.tsx:498
      |
      +-- Build + assign PopupTemplate           <- widget.tsx:502-509
      |   buildPopupTemplate(config, fieldNames,  <- feed-layer-manager.ts:155
      |     filterCtx, fieldMapping)
      |
      +-- syncFeedItemsToLayer(layer, items,     <- widget.tsx:512-518
      |     config, fieldNames, getItemId)
      |   (initial population)
      |
      +-- setupFeedLayerClickHandler()           <- widget.tsx:521
```

---

## Poll-Cycle Sync

After each successful feed fetch, items are synced to the existing layer.
Sync happens inside the `setState` callback to ensure committed state
is used. `syncFeedLayerWithProcessedItems` syncs the layer with
pipeline output (post filter/search/sort) rather than raw items.

As of r003.005, sync uses a **diff-based** approach: it compares
`FEED_ITEM_ID` values between the existing layer features and the
incoming items to determine targeted adds, updates, and deletes —
instead of the previous delete-all/add-all full-replace strategy.

Items are stamped with `_feedItemId` at fetch time in `loadFeed()`
(widget.tsx:801-804) via `computeItemId()`, which uses `joinFieldFeed`
if configured or hashes all field values as a fallback. This cached
stamp is read by `getItemId()` (widget.tsx:360) and passed as the
`getItemId` callback to `syncFeedItemsToLayer`.

```
 loadFeed() setState callback                 <- widget.tsx:833-842
      |
      +-- feedLayer exists?
      |   +-- NO --> syncFeedLayer() (creates layer if needed)
      |   +-- YES --> continue
      |
      +-- syncFeedLayerWithProcessedItems()      <- widget.tsx:552
      |   reads from getProcessedItems().allProcessed
      |   (syncs post-pipeline items, not raw items)
      |
      +-- syncFeedItemsToLayer(                  <- feed-layer-manager.ts:384
      |     layer, items, config, fieldNames, getItemId)
      |
      +-- buildFieldMapping(fieldNames)          :391  (cached by reference)
      |
      +-- Build new Graphics                     buildGraphicFromItem() :287
      |   For each item:
      |     Parse lat/lon, skip invalid
      |     Sanitize field names for attributes
      |     Store FEED_ITEM_ID from getItemId()
      |     new Graphic({ Point, attributes })
      |
      +-- Query existing features                :447 layer.queryFeatures()
      |   outFields: [OBJECTID, FEED_ITEM_ID]
      |
      +-- Diff by FEED_ITEM_ID                   :458-488
      |   +-- existingIdMap: FEED_ITEM_ID -> OBJECTID
      |   +-- toAdd:    new IDs not on layer
      |   +-- toUpdate: IDs in both (reuse OBJECTID)
      |   +-- toDelete: old IDs not in incoming
      |
      +-- Debug log: sync-diff                   :490 (counts for each)
      |
      +-- Apply targeted edits                   :504-512
      |   +-- batchApplyEdits(deleteFeatures)    (if toDelete > 0)
      |   +-- batchApplyEdits(updateFeatures)    (if toUpdate > 0)
      |   +-- batchApplyEdits(addFeatures)       (if toAdd > 0)
      |   Each batched in groups of 500          :344
      |
      +-- Debug log: sync-complete               :515
          added, updated, deleted, errors, skippedCoords
```

### Diff-Based Sync Performance (r003.005)

On a typical poll cycle where most items are unchanged:
- **Delete**: 0 (no items removed from feed)
- **Update**: N (all existing items refreshed in-place)
- **Add**: 0 (no new items)

This avoids the expensive delete-all + add-all pattern which caused
visible flicker and unnecessary OBJECTID churn. The `FEED_ITEM_ID`
attribute (stamped on items at fetch time via `_feedItemId`) is the
stable key used for diffing.

---

## CustomContent Popup

Popups use JSAPI's `CustomContent` for reliable HTML from both programmatic
opens and native map clicks.

```
 buildPopupTemplate(config, fieldNames,       <- feed-layer-manager.ts:155
   filterContext, fieldMapping)
      |
      +-- Determine template                     :161
      |   config.feedMapLayerPopupTemplate
      |   || config.cardTemplate
      |
      +-- Build dynamic title function           :168-187
      |   Uses popupTitleTemplate / popupTitleTemplateMobile
      |   Picks mobile vs desktop based on mapView.width
      |
      +-- No template? Return fields-only        :189-201
      |   PopupTemplate with 'fields' content
      |   (first 20 fields)
      |
      +-- new CustomContent({                    :208-256
      |     creator: (event) => {
      |       graphic = event.graphic
      |       attrs = graphic.attributes
      |
      |       reconstructFeedItem(attrs,          :218
      |         fieldMapping.toOriginal)
      |       Reverse-map sanitized field names
      |       back to original dot-path keys
      |
      |       substituteTokens(template, item)    :219
      |       convertTemplateToHtml(result)        :220
      |
      |       Mobile responsive: if mobileTemplate :230-245
      |       differs, render both with CSS media
      |       query toggle at 600px
      |
      |       Return div element
      |     }
      |   })
      |
      +-- new PopupTemplate({                    :258-262
          title (dynamic or static),
          content: [customContent]
        })
```

---

## Bidirectional Click Sync

### Card Click --> Map

```
 onCardClick(item, evt)                       <- widget.tsx:889
      |
      +-- Feed Map Layer configured?             :897
      |   +-- NO --> fall through to spatial join / external link
      |   +-- YES --> continue
      |
      +-- Same card already selected?            :899
      |   +-- YES --> close popup, deselect      :900-906
      |   +-- NO  --> continue
      |
      +-- ensureFeedLayerVisible()               :909  (r001.039)
      |   if layer.visible === false:
      |     layer.visible = true
      |     log 'layer-visibility-restored'
      |
      +-- Determine mode from config             :912-915
      |   enableCenterOnClick → 'pan'
      |   enableZoomOnClick   → 'zoom' (default)
      |   both false          → 'select'
      |
      +-- navigateToFeedPoint(mapView, item,     :916
      |     config, mode)
      |                                          <- feed-layer-manager.ts:731
      |
      +-- Parse lat/lon from item                :737-743
      |
      +-- Navigate (conditional on mode)         :753-758
      |   'zoom': mapView.goTo({ target: point, zoom })
      |   'pan':  mapView.goTo({ center: point })
      |   'select': skip navigation
      |
      +-- Popup (always)                         :762-783
      |   Lazy-init popup if needed
      |   Query feed layer for nearby feature
      |   applyMobilePopupBehavior()             :781
      |   popup.open({ features, location })
      |
      +-- setState({ selectedItemId })           :920
```

### Toolbar Zoom / Pan --> Map

Both toolbar buttons delegate to `handleMapNavigation(item, mode)`,
which consolidates zoom/pan logic. The old `onCardZoom` / `onCardPan`
remain as one-liner delegates for JSX callback compatibility:

```
 onCardZoom(item)                             <- widget.tsx:1107
 onCardPan(item)                              <- widget.tsx:1110
      |  (one-liner delegates)
      v
 handleMapNavigation(item, mode)              <- widget.tsx:1061
      |
      +-- Feed Map Layer configured?             :1066
      |   +-- NO --> fall through to spatial join
      |   +-- YES --> continue
      |
      +-- ensureFeedLayerVisible()               :1067  (r001.039)
      |
      +-- navigateToFeedPoint(mapView, item,     :1068
      |     config, mode)
      |                                          <- feed-layer-manager.ts:731
      |
      +-- setState({ selectedItemId })           :1072
```

### Map Click --> Card

```
 setupFeedLayerClickHandler()                 <- widget.tsx:610
      |
      +-- mapView.on('click', async (event))     :613
      |
      +-- hitTest(event)                         :616
      |   Filter to feed layer only
      |
      +-- Hit found?                             :624
      |   +-- NO --> return
      |   +-- YES --> extract FEED_ITEM_ID       :626
      |
      +-- setState({ selectedItemId })           :628
      |
      +-- Find matching card DOM element         :633
      |   querySelector(`[data-feed-item-id="${id}"]`)
      |
      +-- scrollIntoView({ behavior: 'smooth' }) :635
```

---

## Layer Destruction

```
 destroyFeedFeatureLayer(mapView, widgetId)   <- feed-layer-manager.ts:534
      |
      +-- Find layer by LAYER_ID_PREFIX + widgetId :538-539
      +-- mapView.map.remove(layer)              :541
      +-- layer.destroy()                        :542
      +-- Debug log: layer-destroyed             :543
```

Called from widget.tsx `cleanupFeedLayer()` (:646-655) in three scenarios:
- Widget unmount (`componentWillUnmount`)      :252
- Config disable (enableFeedMapLayer -> false)
- Map view change (old layer cleaned up before new one created)

---

## Field Name Sanitization

JSAPI FeatureLayer field names cannot contain `.`, `@`, or `[]`.

```
 buildFieldMapping(fieldNames)               <- feed-layer-manager.ts:54
      |
      +-- Cache check: same fieldNames ref?      :58
      |   +-- YES --> return cached result (r003.005)
      |   +-- NO  --> rebuild maps
      |
      +-- For each field name:                   :64-68
      |   sanitized = name
      |     .replace(/@/g, '_at_')
      |     .replace(/\./g, '_')
      |     .replace(/\[/g, '_')
      |     .replace(/\]/g, '')
      |
      +-- Cache result + fieldNames ref          :69-71
      |
      +-- Return { toSanitized, toOriginal } maps
          toSanitized: original --> sanitized
          toOriginal:  sanitized --> original
```

The `toOriginal` map is used by `CustomContent` popup creators to
reconstruct the original FeedItem from sanitized feature attributes.
The cache avoids rebuilding two Maps + n iterations on every poll cycle
when field names haven't changed (r003.005).

---

## Mobile Popup Behavior

`getMobilePopupParams()` (widget.tsx:1047) extracts mobile popup config
into a plain object shared by all map navigation paths (card click,
toolbar zoom/pan, spatial join identify). This avoids passing the full
`IMConfig` to map-interaction utilities.

`applyMobilePopupBehavior()` (feed-layer-manager.ts:665) sets dock
position, hides the action bar, and manages collapsed state based on
viewport width vs `MOBILE_BREAKPOINT_PX`.

---

*Last updated: r003.005 (2026-03-16)*
