# FS-FLOW-07: Feed Map Layer (Mode C)

## Overview

Describes the client-side FeatureLayer generated from feed item coordinates,
including layer creation, poll-cycle sync, bidirectional card-map click behavior,
and CustomContent popup rendering.

**Key files:**
- `feed-simple/src/runtime/widget.tsx` -- layer lifecycle orchestration
- `feed-simple/src/utils/feed-layer-manager.ts` -- layer creation, sync, destroy, popups, zoom (418 lines)

---

## Configuration Requirements

Feed Map Layer requires three config values (checked by `isFeedMapLayerConfigured`):

| Requirement | Config Field | Example |
|-------------|-------------|---------|
| Feature enabled | `enableFeedMapLayer` | `true` |
| Latitude field | `latitudeField` | `origin.latitude.value` |
| Longitude field | `longitudeField` | `origin.longitude.value` |

A map widget (`mapWidgetId`) is also needed for the layer to appear on a map.

```
 isFeedMapLayerConfigured(config)             <- feed-layer-manager.ts:68
      |
      +-- config.enableFeedMapLayer?
      +-- config.latitudeField?
      +-- config.longitudeField?
      --> All three must be truthy
```

---

## Layer Creation

Triggered when `mapView`, config, and parsed items are all available.

```
 componentDidUpdate / onActiveViewChange      <- widget.tsx:388
      |
      +-- isFeedMapLayerConfigured(config)?
      |   +-- NO --> skip
      |   +-- YES --> continue
      |
      +-- mapView available?
      |   +-- NO --> skip
      |   +-- YES --> continue
      |
      +-- createFeedFeatureLayer(              <- feed-layer-manager.ts:83
      |     mapView, items, config, filterCtx)
      |
      +-- Build field mapping                  :91
      |   buildFieldMapping(items)
      |   original.key -> sanitized_key
      |   (dots, @, [] replaced with _)
      |
      +-- Define FeatureLayer fields           :97-110
      |   All fields as type 'string'
      |   + __FEED_ITEM_ID as ObjectID
      |
      +-- Build SimpleRenderer                 :112-120
      |   color: config.feedMapLayerColor
      |   size: config.feedMapLayerSize
      |   style: config.feedMapLayerMarkerStyle
      |
      +-- Build PopupTemplate                  :121
      |   buildPopupTemplate(config, filterCtx)
      |   --> CustomContent with token rendering
      |
      +-- new FeatureLayer({                   :123-133
      |     id: LAYER_ID_PREFIX + timestamp,
      |     source: [],
      |     objectIdField: '__FEED_ITEM_ID',
      |     listMode: 'show',
      |     renderer, popupTemplate
      |   })
      |
      +-- mapView.map.add(layer)               :135
      |
      +-- syncFeedItemsToLayer(layer, items)   :137
      |   (initial population)
      |
      +-- Return { layer, fieldMapping }
```

---

## Poll-Cycle Sync

After each successful feed fetch, items are synced to the existing layer.

```
 loadFeed() success                           <- widget.tsx:403
      |
      +-- feedLayer exists?
      |   +-- NO --> skip
      |   +-- YES --> continue
      |
      +-- syncFeedItemsToLayer(               <- feed-layer-manager.ts:223
      |     layer, items, config, fieldMapping)
      |
      +-- Parse lat/lon from each item         :240-252
      |   parseFloat(item[latField])
      |   parseFloat(item[lonField])
      |   Invalid/missing --> skip with debug log
      |
      +-- Build Graphics array                 :254-270
      |   For each valid item:
      |     new Point({ longitude, latitude })
      |     Sanitize field names for attributes
      |     new Graphic({ geometry, attributes })
      |
      +-- Full replace via applyEdits          :272-290
      |   Step 1: query all existing OIDs
      |   Step 2: deleteFeatures (all existing)
      |   Step 3: addFeatures (new graphics)
      |   Batched in groups of 500
      |
      +-- Debug log: sync-complete             :295
          itemCount, skippedCount
```

---

## CustomContent Popup

Popups use JSAPI's `CustomContent` for reliable HTML from both programmatic
opens and native map clicks.

```
 buildPopupTemplate(config, filterCtx)        <- feed-layer-manager.ts:135
      |
      +-- Determine template                   :140
      |   config.feedMapLayerPopupTemplate
      |   || config.cardTemplate
      |   || '{all fields}'
      |
      +-- new CustomContent({                  :145-175
      |     creator: (event) => {
      |       feature = event.graphic
      |       attrs = feature.attributes
      |
      |       Reverse-map sanitized field names :155
      |       back to original dot-path keys
      |
      |       Reconstruct FeedItem object       :160
      |
      |       substituteTokens(template, item)  :165
      |       convertTemplateToHtml(result)      :166
      |
      |       Create <div> with innerHTML        :170
      |       Return div element
      |     }
      |   })
      |
      +-- new PopupTemplate({                  :180
          title: config.feedMapLayerTitle,
          content: [customContent]
        })
```

---

## Bidirectional Click Sync

### Card Click --> Map

```
 onCardClick(item)                            <- widget.tsx:656
      |
      +-- Feed Map Layer configured?           :670
      |   +-- NO --> fall through to spatial join / external link
      |   +-- YES --> continue
      |
      +-- Same card already selected?          :671
      |   +-- YES --> close popup, deselect   :672-674
      |   +-- NO  --> continue
      |
      +-- ensureFeedLayerVisible()             :697  (r001.039)
      |   if layer.visible === false:
      |     layer.visible = true
      |     log 'layer-visibility-restored'
      |
      +-- skipZoom = enableZoomOnClick === false :700
      |
      +-- zoomToFeedPoint(mapView, item, config, { skipZoom })
      |                                       <- feed-layer-manager.ts:352
      |
      +-- Parse lat/lon from item              :360-368
      |
      +-- Zoom (conditional)                   :374-376
      |   if (!options.skipZoom):
      |     mapView.goTo({ target: point, zoom })
      |
      +-- Popup (always)                       :380-403
      |   Lazy-init popup if needed
      |   Query feed layer for nearby feature
      |   popup.open({ features, location })
      |
      +-- setState({ selectedItemId })         :703
```

### Toolbar Zoom / Pan --> Map

Both toolbar handlers follow the same pattern:

```
 onCardZoom(item) / onCardPan(item)           <- widget.tsx:814 / :858
      |
      +-- Feed Map Layer configured?
      |   +-- NO --> fall through to spatial join
      |   +-- YES --> continue
      |
      +-- ensureFeedLayerVisible()             (r001.039)
      |
      +-- zoomToFeedPoint() / panToFeedPoint()
      |                                       <- feed-layer-manager.ts
      +-- setState({ selectedItemId })
```

### Map Click --> Card

```
 setupFeedLayerClickHandler()                 <- widget.tsx:442
      |
      +-- mapView.on('click', async (event))   :443
      |
      +-- hitTest(event)                       :445
      |   Filter to feed layer only
      |
      +-- Hit found?                           :450
      |   +-- NO --> return
      |   +-- YES --> extract __FEED_ITEM_ID
      |
      +-- Find matching card DOM element       :455
      |   querySelector(`[data-feed-item-id="${id}"]`)
      |
      +-- scrollIntoView({ behavior: 'smooth' }) :460
      |
      +-- setState({ selectedItemId: id })     :462
```

---

## Layer Destruction

```
 destroyFeedFeatureLayer(mapView, layer)      <- feed-layer-manager.ts:312
      |
      +-- mapView.map.remove(layer)            :318
      +-- layer.destroy()                      :319
      +-- Debug log: layer-destroyed           :320
```

Called from widget.tsx in three scenarios:
- Widget unmount (`componentWillUnmount`)       :481
- Config disable (enableFeedMapLayer → false)
- Map view change (old layer cleaned up before new one created)

---

## Field Name Sanitization

JSAPI FeatureLayer field names cannot contain `.`, `@`, or `[]`.

```
 buildFieldMapping(items)                     <- feed-layer-manager.ts:49
      |
      +-- Collect all unique field names
      |   from items[0] (or first available)
      |
      +-- For each field name:
      |   sanitized = name
      |     .replace(/\./g, '_')
      |     .replace(/@/g, '_')
      |     .replace(/\[/g, '_')
      |     .replace(/\]/g, '')
      |
      +-- Return { forward, reverse } maps
          forward: original --> sanitized
          reverse: sanitized --> original
```

The reverse map is used by `CustomContent` popup creators to reconstruct
the original FeedItem from sanitized feature attributes.

---

*Last updated: r001.039 (2026-03-13)*
