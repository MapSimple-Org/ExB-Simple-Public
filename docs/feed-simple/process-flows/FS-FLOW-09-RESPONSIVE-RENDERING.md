# FS-FLOW-09: RESPONSIVE RENDERING

Responsive card template, toolbar position, and popup template rendering for
mobile viewports. Uses CSS `@media` queries at 600px breakpoint — no JavaScript
viewport detection needed.

## Key Files

| File | Role |
|------|------|
| `config.ts` | `cardTemplateMobile`, `toolbarPositionMobile`, `feedMapLayerPopupTemplateMobile`, `mobilePopupCollapsed`, `mobilePopupDockPosition`, `mobilePopupHideDockButton` fields |
| `feed-card.tsx` | Responsive card content + toolbar rendering with CSS media query toggle |
| `feed-layer-manager.ts` | Responsive popup template rendering in `buildPopupTemplate()`; `applyMobilePopupBehavior()` for dock/collapsed |
| `map-interaction.ts` | Mobile popup behavior in `identifyFeatureOnMap()` for spatial join popups |
| `widget.tsx` | Passes mobile config props; popup change detection in `componentDidUpdate` |
| `setting.tsx` | "Card Template (Mobile)", "Toolbar Position (Mobile)", "Popup Template (Mobile)", "Mobile Popup Behavior" UI |

## Overview

Three independent responsive overrides, each following the same pattern:

1. **Mobile Card Template** (`cardTemplateMobile`) — simplified card content at ≤ 600px
2. **Mobile Toolbar Position** (`toolbarPositionMobile`) — different toolbar layout at ≤ 600px
3. **Mobile Popup Template** (`feedMapLayerPopupTemplateMobile`) — simplified popup at ≤ 600px

All three are optional. When empty, the desktop setting is used on all screen
sizes and no responsive wrapper divs are emitted.

---

## Flow 1: Card Rendering (feed-card.tsx)

```
FeedCard render
  |
  +-- Compute desktopPos, mobilePos, hasMobileContent, hasMobileToolbarOverride
  |
  +-- needsResponsive = hasMobileContent || hasMobileToolbarOverride ?
  |     |
  |     NO --> renderCardLayout() — simple path
  |     |       Single flex container, single content, single toolbar
  |     |       No media query wrappers
  |     |
  |     YES --> renderCardLayout() — responsive path
  |              |
  |              +-- Desktop layout div (hidden at ≤ 600px)
  |              |     flex-direction: row (right/menu) or column (bottom)
  |              |     Desktop content + renderToolbarForPosition(desktopPos)
  |              |
  |              +-- Mobile layout div (hidden at > 600px)
  |                    flex-direction: row (right/menu) or column (bottom)
  |                    Mobile content + renderToolbarForPosition(mobilePos)
```

### Toolbar Position Dispatch (renderToolbarForPosition)

```
renderToolbarForPosition(pos)
  |
  +-- pos === 'menu'   --> renderKebabMenu()
  |                          jimu-ui Dropdown (portal-based, no clipping)
  |                          DropdownButton with KebabIcon (three dots)
  |                          DropdownItems for zoom/pan/link/expand
  |
  +-- pos === 'right'  --> renderButtonToolbar(vertical=true)
  |                          Vertical strip with left border
  |
  +-- pos === 'bottom' --> renderButtonToolbar(vertical=false)
                             Horizontal row with top border
```

### CSS Media Query Pattern

```html
<!-- Desktop layout -->
<div style="display: flex; @media(max-width:600px){display:none !important}">
  <div>...desktop content...</div>
  ...desktop toolbar...
</div>

<!-- Mobile layout -->
<div style="display: none; @media(max-width:600px){display:flex !important}">
  <div>...mobile content...</div>
  ...mobile toolbar...
</div>
```

---

## Flow 2: Popup Template (feed-layer-manager.ts)

```
buildPopupTemplate()
  |
  +-- template = feedMapLayerPopupTemplate || cardTemplate       (desktop)
  +-- mobileTemplate = feedMapLayerPopupTemplateMobile
  |                     || cardTemplateMobile                    (cascade)
  |                     || ''                                    (empty = no mobile)
  |
  +-- CustomContent creator (runs per popup open)
        |
        +-- Reconstruct FeedItem from sanitized JSAPI attributes
        +-- substituteTokens(template) → desktop HTML
        |
        +-- mobileTemplate && mobileTemplate !== template ?
              |
              NO --> Single template, no wrapper divs
              |
              YES --> Both templates with CSS media query toggle
                       .feed-popup-desktop / .feed-popup-mobile
                       @media(max-width:600px) toggle display
```

### Mobile Popup Cascade

Priority order (first non-empty wins):

```
1. feedMapLayerPopupTemplateMobile   (explicit mobile popup)
2. cardTemplateMobile                (mobile card template)
3. feedMapLayerPopupTemplate         (desktop popup — same as desktop, no toggle)
4. cardTemplate                     (desktop card template — same as desktop)
```

If the resolved mobile template matches the desktop template, no responsive
wrapper is emitted — identical to non-responsive behavior.

---

## Flow 3: Config Change Detection (widget.tsx)

```
componentDidUpdate()
  |
  +-- feedMapLayerPopupTemplate changed?     ─┐
  +-- feedMapLayerPopupTemplateMobile changed? ├── popupChanged
  +-- feedMapLayerPopupTitle changed?         ─┘
  |
  +-- popupChanged || styleChanged || rangeRendererChanged ?
        |
        YES --> cleanupFeedLayer() + initFeedLayer()
                Rebuilds PopupTemplate with current config
```

**Note (r002.039 fix):** Prior to this release, popup template and title
changes did NOT trigger layer recreation. The popup was only built during
initial layer creation.

---

## Flow 4: Settings UI (setting.tsx)

### Card Template Section

```
Card Template (desktop)        ← textarea, monospace
Card Template (Mobile)         ← textarea, "(Desktop template used on all screens if empty)"
Preview                        ← rendered preview of desktop template
```

### Card Options Section

```
Toolbar Position               ← Select: Bottom / Right / Menu (⋮)
Toolbar Position (Mobile)      ← Select: Default / Bottom / Right / Menu (⋮)
```

### Feed Map Layer Section

```
Popup Title                    ← TextInput with {{token}} support
Popup Template                 ← textarea with markdown help
Popup Template (Mobile)        ← textarea, "(Desktop template used on all screens if empty)"
```

---

## Configuration Fields

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `cardTemplateMobile` | `string` | `''` | Mobile card template (≤ 600px) |
| `toolbarPositionMobile` | `'' \| 'bottom' \| 'right' \| 'menu'` | `''` | Mobile toolbar override |
| `feedMapLayerPopupTemplateMobile` | `string` | `''` | Mobile popup template (≤ 600px) |
| `mobilePopupCollapsed` | `boolean` | `false` | Open popup collapsed on mobile |
| `mobilePopupDockPosition` | `'' \| 'top-center' \| 'bottom-center'` | `''` | Dock popup position on mobile |
| `mobilePopupHideDockButton` | `boolean` | `false` | Hide dock toggle on mobile |

---

## Flow 5: Mobile Popup Behavior (feed-layer-manager.ts, map-interaction.ts)

```
popup.open() called (zoom, pan, or identify)
  |
  +-- applyMobilePopupBehavior(mapView, config)
  |     |
  |     +-- mapView.width <= 600 ?
  |     |     |
  |     |     YES + mobilePopupDockPosition set?
  |     |     |     |
  |     |     |     YES --> popup.dockEnabled = true
  |     |     |     |       popup.dockOptions.position = config value
  |     |     |     |       popup.dockOptions.buttonEnabled = !hideDockButton
  |     |     |     |
  |     |     |     NO --> No dock changes
  |     |     |
  |     |     NO (desktop) --> Restore defaults
  |     |           popup.dockEnabled = false
  |     |           popup.dockOptions = { buttonEnabled: true, position: 'auto' }
  |
  +-- Build open options
  |     |
  |     +-- mobilePopupCollapsed && mapView.width <= 600 ?
  |           |
  |           YES --> openOptions.collapsed = true
  |           NO  --> collapsed not set (JSAPI default = expanded)
  |
  +-- popup.open(openOptions)
```

### Where Applied

| Call site | File | Purpose |
|-----------|------|---------|
| `zoomToFeedPoint()` | feed-layer-manager.ts | Card click → zoom + popup (Feed Map Layer) |
| `panToFeedPoint()` | feed-layer-manager.ts | Card click → pan + popup (Feed Map Layer) |
| `identifyFeatureOnMap()` | map-interaction.ts | Card click → identify + popup (Spatial Join) |

### Config Change Detection (widget.tsx)

Mobile popup behavior fields are included in the `popupFields` change detection
array. Changing any of the three settings triggers `cleanupFeedLayer()` +
`initFeedLayer()` to rebuild the layer with updated popup behavior.

---

## Design Decisions

1. **CSS media queries over JS detection**: The `@media` approach works
   dynamically on resize (e.g., rotating a tablet), requires no event listeners,
   and has zero performance overhead. ExB's `useCheckSmallBrowserSizeMode()`
   hook was considered but would only detect at build time.

2. **Dual-render pattern**: Both desktop and mobile variants are rendered in the
   DOM simultaneously. Only one is visible at a time. This avoids re-rendering
   on resize and ensures instant switching.

3. **600px breakpoint**: Chosen to match common mobile breakpoints. JSAPI popup
   docking also defaults to similar breakpoints.

4. **Kebab over hamburger**: Material Design 3 and Apple HIG reserve hamburger
   for app-level navigation. Kebab (three dots) is the standard for item-level
   contextual actions.

5. **jimu-ui Dropdown**: Portal-based rendering via `appendToBody` (default)
   prevents menu clipping inside scrollable containers. Already used in
   query-simple's `results-menu.tsx`.

6. **`mapView.width` over CSS for popup behavior**: Unlike card/template
   rendering (CSS media queries), popup collapsed/dock settings are imperative
   JSAPI Popup properties — they must be set via JavaScript before
   `popup.open()`. `mapView.width` provides the viewport width at call time.

---

*Last updated: r002.042 (2026-03-14)*
