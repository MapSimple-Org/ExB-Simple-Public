# Spatial Relationships Reference

> **Added**: r025.037–r025.040 | **Updated**: r025.069
> **Source file**: `runtime/tabs/SpatialTabContent.tsx`

This document explains the Spatial tab's two modes, the spatial relationships available in Operations mode, how they interact with different geometry types and buffer distances, and what warnings and help text the widget displays.

> **Visual Reference**: Geometry pair diagrams in this document are sourced from the [ArcGIS Spatial Relationship documentation](https://developers.arcgis.com/documentation/spatial-analysis-services/geometry-analysis/spatial-relationship/). See also the classic [ArcSDE Spatial Predicates reference](https://help.arcgis.com/en/geodatabase/10.0/sdk/arcsde/concepts/geometry/shapes/spatial_relations/predicates.htm) for DE-9IM pattern matrices.

---

## Spatial Tab Overview

The Spatial tab provides two modes for selecting features by location, controlled by an Operations/Draw toggle at the top of the panel.

### Operations Mode

Select features from accumulated query results using spatial geometry operations (e.g., intersects, overlaps). This mode requires existing results from a prior Query tab search -- the accumulated result geometries serve as the input for the spatial operation.

**Layout:** Source indicator, Buffer distance, Mode toggle, Relationship selector, Target layers, Apply/Reset buttons.

**Mode help text** (r025.061): A contextual description appears below the toggle -- "Select features using spatial geometry operations, e.g., intersects, overlaps." Styled with surface background, text-secondary color, primary-main left border accent, 0.8rem font.

### Draw Mode

Select features using graphics drawn directly on the map. Supports point, polyline, polygon, rectangle, and circle tools with continuous multi-shape drawing and geometry accumulation.

**Layout:** Draw tools, Buffer distance, Mode toggle, Relationship selector, Target layers, Apply/Reset buttons.

**Mode help text** (r025.061): "Select features using graphics drawn on the map." Same styling as Operations mode help text.

### Toggle Tooltips

Short tooltips appear on the Operations and Draw toggle buttons: "Spatial operations" and "Draw graphics" respectively (r025.062).

### Disabled State and Hint Callout

When the Spatial tab is in Operations mode but no query results are accumulated, the controls are disabled and a hint callout appears: "Run a query first to load features for spatial operations."

**Styling** (r025.064): The hint is displayed as a firebrick red (#b22222) callout box with a left border accent, surface background, text-secondary color, and 0.8rem font. This matches the mode help text layout pattern but uses a visually prominent color to explain why controls are disabled. The styling was changed from a subtle italic gray to this callout box for better visibility.

---

## Quick Guide: Which Relationship Should I Use?

| I want to find features that... | Use |
|---|---|
| Touch, overlap, or fall inside my search area | **Intersects** |
| Are completely inside my search area | **Within** |
| Are near my search area (approximate) | **Envelope intersects** |
| Share an edge or boundary with my search area | **Touches** |
| Partially overlap my search area (same geometry type) | **Overlaps** |
| Are large enough to completely surround my search area | **Encloses search area** |
| Are crossed by my search area (line through polygon) | **Crosses** |

> **Most common choices**: Intersects (broadest results) and Within (strictest — features must be fully contained).

---

## Relationship Details

### Within

**JSAPI value**: `contains`
**Description**: Find features completely inside your search area.

The target feature's entire geometry must fall inside the search area. A parcel partially outside the buffer would not be returned — only parcels fully enclosed.

![Contains — Esri Spatial Relationship](https://developers.arcgis.com/documentation/f24402126259837eff0f0f95606062b6/Contains.svg)

*Source: [ArcGIS Spatial Relationship — Contains](https://developers.arcgis.com/documentation/spatial-analysis-services/geometry-analysis/spatial-relationship/)*

| Source Geometry | Buffer | Result | Notes |
|---|---|---|---|
| Point | No | Valid but strict | Contains works — target must be at the exact same location. Unlikely to return results in practice. |
| Point | Yes | Yes | Buffer creates a polygon search area. Features fully inside the buffer are returned. |
| Polyline | No | Valid but strict | Target points on the line or target lines that are a subset of the source line are returned. Target polygons cannot be contained by a line. |
| Polyline | Yes | Yes | Buffer creates a polygon search area. |
| Polygon | No | Yes | Features entirely inside the polygon are returned. Most common usage. |
| Polygon | Yes | Yes | Features entirely inside the buffered polygon are returned. |

**Tip**: Point and line sources without a buffer are geometrically valid but rarely return results. Add a buffer distance to create an area, or switch to Intersects.

---

### Intersects

**JSAPI value**: `intersects`
**Description**: Find features that share any part of your search area.

The broadest spatial relationship. Returns any feature that touches, overlaps, or falls inside the search area. This is the most commonly used relationship and works with all geometry types.

![Intersects — Esri Spatial Relationship](https://developers.arcgis.com/documentation/c87dcd3aaf735f86cc70c297a4e3e254/Intersects.svg)

*Source: [ArcGIS Spatial Relationship — Intersects](https://developers.arcgis.com/documentation/spatial-analysis-services/geometry-analysis/spatial-relationship/)*

| Source Geometry | Buffer | Result | Notes |
|---|---|---|---|
| Point | No | Yes | Finds the feature at that exact location. |
| Point | Yes | Yes | Finds all features touching or inside the buffer. |
| Polyline | No | Yes | Finds features along the line. |
| Polyline | Yes | Yes | Finds features along or near the line. |
| Polygon | No | Yes | Finds features inside or touching the polygon. |
| Polygon | Yes | Yes | Finds features inside or touching the buffered polygon. |

Intersects works with all geometry combinations — no warnings needed.

---

### Envelope Intersects

**JSAPI value**: `envelope-intersects`
**Description**: Find features within the bounding rectangle of your search area.

Uses the minimum bounding rectangle (envelope) of the search geometry rather than the geometry itself. Faster but less precise than Intersects — may return features that fall within the bounding box but not within the actual geometry shape.

<!-- No Esri SVG available — Envelope Intersects is JSAPI-specific, not a standard DE-9IM predicate -->

| Source Geometry | Buffer | Result | Notes |
|---|---|---|---|
| Point | No | Yes | Bounding box of a point is the point itself — same as Intersects. |
| Point | Yes | Yes | Bounding box of the buffer circle/polygon. |
| Polyline | No | Yes | Rectangle enclosing the line. |
| Polyline | Yes | Yes | Rectangle enclosing the buffered line. |
| Polygon | No | Yes | Rectangle enclosing the polygon. |
| Polygon | Yes | Yes | Rectangle enclosing the buffered polygon. |

Envelope Intersects works with all geometry combinations — no warnings needed.

---

### Overlaps

**JSAPI value**: `overlaps`
**Description**: Find features that partially cover your search area (same geometry type only).

Requires the source and target to be the **same dimension** (e.g., polygon-polygon or line-line). Returns features that partially — but not fully — overlap the search area. A feature entirely inside or entirely outside would not be returned.

![Overlaps — Esri Spatial Relationship](https://developers.arcgis.com/documentation/602cae52467b10c80eb7e844afcad249/Overlaps.svg)

*Source: [ArcGIS Spatial Relationship — Overlaps](https://developers.arcgis.com/documentation/spatial-analysis-services/geometry-analysis/spatial-relationship/)*

| Source Geometry | Buffer | Target Type | Result | Notes |
|---|---|---|---|---|
| Point | No | Polygon | Incompatible | Different dimensions — point (0D) vs polygon (2D). Compatibility note displayed. |
| Point | Yes | Polygon | Yes | Buffer converts point to polygon — same dimension. |
| Polyline | No | Polygon | Incompatible | Different dimensions — line (1D) vs polygon (2D). Compatibility note displayed. |
| Polyline | Yes | Polygon | Yes | Buffer converts line to polygon — same dimension. |
| Polygon | No | Polygon | Yes | Same dimension — partial overlaps returned. |
| Polygon | Yes | Polygon | Yes | Same dimension — partial overlaps returned. |
| Polyline | No | Polyline | Yes | Same dimension — works correctly. |

**Dimension constraint**: When the source and target dimensions don't match, a compatibility note is displayed. Adding a buffer can resolve this because the buffer converts the search area into a polygon (2D).

---

### Encloses Search Area

**JSAPI value**: `within`
**Description**: Find features large enough to completely surround your search area.

The inverse of "Within." The target feature must completely contain the search geometry. For example, finding a county polygon that fully encloses a parcel polygon.

![Within — Esri Spatial Relationship](https://developers.arcgis.com/documentation/632b13b682e290076de0033140041087/Within.svg)

*Source: [ArcGIS Spatial Relationship — Within](https://developers.arcgis.com/documentation/spatial-analysis-services/geometry-analysis/spatial-relationship/)*

| Source Geometry | Buffer | Result | Notes |
|---|---|---|---|
| Point | No | Yes | Finds any polygon or line that contains that point. Common and effective. |
| Point | Yes | Yes | Target must fully contain the entire buffer polygon. Matches become less likely with larger buffers. |
| Polyline | No | Yes | Target must fully contain the entire line. |
| Polyline | Yes | Yes | Target must fully contain the buffered polygon. Larger buffers reduce matches. |
| Polygon | No | Yes | Target must fully contain the polygon. |
| Polygon | Yes | Yes | Target must fully contain the buffered polygon — requires very large target features. |

All combinations are geometrically valid. Larger buffers make matches less likely since the target must enclose the entire search area.

---

### Touches

**JSAPI value**: `touches`
**Description**: Find features that share a boundary but do not overlap.

The source and target geometries must meet at a boundary without any interior overlap. Two polygons sharing an edge (e.g., adjacent parcels) is the most common use case.

![Touches — Esri Spatial Relationship](https://developers.arcgis.com/documentation/b5438bf93351ac08630fd156ed1b16d3/Touches.svg)

*Source: [ArcGIS Spatial Relationship — Touches](https://developers.arcgis.com/documentation/spatial-analysis-services/geometry-analysis/spatial-relationship/)*

| Source Geometry | Buffer | Result | Notes |
|---|---|---|---|
| Point | No | Valid but strict | Point must land exactly on a feature's boundary — not inside it. Precise placement required. |
| Point | Yes | Valid but unlikely | Buffer creates a filled area, which tends to overlap rather than just touch. Results are unlikely. |
| Polyline | No | Yes | Line endpoint or segment touching a polygon boundary without crossing it. |
| Polyline | Yes | Valid but unlikely | Buffer creates overlap rather than boundary contact in most cases. |
| Polygon | No | Yes | Two polygons sharing an edge — e.g., adjacent parcels. Best use case. |
| Polygon | Yes | Valid but unlikely | Buffer expands the polygon, typically causing overlap instead of boundary-only contact. |

**Tip**: Touches works best with polygon-to-polygon queries without a buffer, where features share a boundary (e.g., adjacent parcels or lots). Adding a buffer generally converts a boundary touch into an overlap.

---

### Crosses

**JSAPI value**: `crosses`
**Description**: Find features that pass through your search area (different dimension types).

Requires the source and target to have **different dimensions** — the intersection must produce a geometry of lower dimension than the maximum of the two inputs. Most commonly: a line crossing through a polygon.

<!-- No specific Crosses SVG on the Esri developers page — Crosses is covered under the general spatial relationship docs -->

| Source Geometry | Buffer | Target Type | Result | Notes |
|---|---|---|---|---|
| Point | No | Line | Valid but strict | Point must be exactly on the line interior (not an endpoint). Rarely practical. |
| Point | No | Polygon | Valid but strict | Point must be exactly on the polygon interior. At that point, Intersects is more appropriate. |
| Point | Yes | Any | Incompatible | Buffer creates a polygon — same dimension issues arise. |
| Polyline | No | Polygon | Yes | Correct usage — line crossing through a polygon (e.g., "which parcels does this road cross?"). |
| Polyline | No | Polyline | Yes | Two lines that cross each other (intersect at a point but are not collinear). |
| Polyline | Yes | Polygon | Incompatible | Buffer converts line to polygon — same dimension, can't cross. Compatibility note displayed. |
| Polygon | No | Polygon | Incompatible | Same dimension — can't cross. Compatibility note displayed. |
| Polygon | Yes | Polygon | Incompatible | Same dimension — can't cross. Compatibility note displayed. |

**Tip**: Crosses is designed for line-through-polygon or line-through-line queries. It requires a line source without a buffer. If you need a buffer, use Intersects instead.

---

## Warning System

The widget displays contextual notes above the Execute button when a geometry/relationship combination may not produce expected results. These are informational — they do not block execution.

### 1. Relationship Note (`relationshipWarning`)

Context-aware notes based on the combination of spatial relationship + source geometry type + buffer. These inform the user when a query is geometrically unlikely to return results.

**Conditions**:
- Within + point or line without buffer → valid but strict, rarely returns results
- Touches + any geometry with buffer → buffer tends to create overlap instead of boundary contact
- Touches + point without buffer → requires exact boundary placement
- Crosses + point → requires exact placement on line/polygon interior
- Crosses + any source with buffer → buffer changes dimension, breaks cross requirement

### 2. Compatibility Note (`compatibilityWarning`)

Dimension-based notes for relationships that require same or different geometry dimensions (Overlaps and Crosses). When a buffer is active, the effective source dimension is treated as polygon (2D), which can resolve or create incompatibilities.

**Conditions**:
- Overlaps with different source/target geometry dimensions (when no buffer resolves it)
- Crosses with same source/target geometry dimensions

---

## JSAPI Label Mapping

The widget uses user-friendly labels that differ from the raw ArcGIS JSAPI `spatialRelationship` values:

| Widget Label | JSAPI Value | Why the difference |
|---|---|---|
| **Within** | `contains` | Users expect "within" to mean "features inside my area." JSAPI's `contains` does exactly this. |
| **Encloses search area** | `within` | JSAPI's `within` means the query geometry is inside the target — the reverse of what users expect from the word "within." |

All other labels map directly to their JSAPI values (`intersects`, `envelope-intersects`, `overlaps`, `touches`, `crosses`).

---

## Buffer Behavior

When a buffer distance is set:

1. The buffer is computed **client-side** using geodesic buffering (`geometryEngine.geodesicBuffer`)
2. The buffered polygon is used as the query geometry (`query.geometry`)
3. Server-side `query.distance` / `query.units` are **not** used (set to 0)
4. This ensures spatial relationships evaluate against the actual visible buffer shape on the map
5. The effective source geometry type becomes **polygon** regardless of the original click geometry

See also: [FLOW-09-BUFFER-PREVIEW.md](../query-simple/process-flows/FLOW-09-BUFFER-PREVIEW.md)

---

## Visual Reference (ArcGIS Spatial Predicate Diagrams)

Esri provides diagrams illustrating each spatial predicate:

- **[ArcGIS Spatial Relationship](https://developers.arcgis.com/documentation/spatial-analysis-services/geometry-analysis/spatial-relationship/)** — Modern developer docs with SVG diagrams for Contains, Within, Intersects, Overlaps, Touches, Disjoint, and Relate.
- **[ArcSDE Spatial Predicates](https://help.arcgis.com/en/geodatabase/10.0/sdk/arcsde/concepts/geometry/shapes/spatial_relations/predicates.htm)** — Classic reference with DE-9IM pattern matrices and geometry pair combination diagrams.

**Esri predicate → Widget label mapping:**

| Esri Predicate Name | Our Widget Label | Notes |
|---|---|---|
| **Contains** | **Within** | Esri: "The second geometry is completely contained by the first." We label it "Within" because users think "features within my area." |
| **Intersects** | **Intersects** | Esri: "The intersection does not result in an empty set." |
| *(no Esri equivalent)* | **Envelope intersects** | JSAPI-specific — uses the bounding rectangle, not in the DE-9IM standard. |
| **Overlap** | **Overlaps** | Esri: "Same dimension, intersection results in a geometry of the same dimension." |
| **Within** | **Encloses search area** | Esri: "The first geometry is completely within the second." We relabel to avoid confusion with our "Within" (which is JSAPI `contains`). |
| **Touch** | **Touches** | Esri: "Common points do not intersect the interiors of both geometries." |
| **Cross** | **Crosses** | Esri: "Intersection dimension is one less than maximum source dimension." |

> **Key insight**: Esri's `Contains` and `Within` are exact inverses. Our "Within" label maps to Esri's `Contains` because users intuitively think "find things within my area" — which is the `Contains` predicate (the search area contains the target).
