# MapSimple Experience Builder Widgets

Custom widgets for ArcGIS Experience Builder Developer Edition.

## Overview

This repository contains production-ready widgets for ArcGIS Experience Builder Developer Edition, designed for MapSimple.org and the broader ArcGIS community.

## Widgets

### QuerySimple

A powerful query widget that allows users to query feature layers with support for:
- Attribute filtering (text, number, date)
- Spatial filtering (buffer, draw, map extent)
- Query grouping for organized query management
- **Duplicate query button** for fast configuration (NEW in r020.0)
- **Auto-open popup on result click** with guaranteed interior location (NEW in r021.11)
- Hash parameter support for deep linking
- Result pagination (multi-page or lazy load)
- Selection management and map integration
- Custom data actions (Add to Map)
- Debug logging for troubleshooting

**Version:** 1.19.0-r021.11

### HelperSimple

A helper widget that manages opening other widgets via hash parameters. Useful for deep linking and automated widget opening.

**Features:**
- Monitors URL hash changes
- Automatically opens widgets based on hash parameters
- Supports `#qsopen=true` for QuerySimple widget

## Quick Start

### Installation

1. **Copy Widgets to Extensions Directory**
   ```bash
   cp -r query-simple /path/to/experience-builder/client/your-extensions/widgets/
   cp -r helper-simple /path/to/experience-builder/client/your-extensions/widgets/
   cp -r shared-code /path/to/experience-builder/client/your-extensions/widgets/
   ```

2. **Rebuild Experience Builder**
   ```bash
   cd /path/to/experience-builder/client
   npm run build
   ```

3. **Restart Experience Builder Server**

4. **Add Widgets in Builder**
   - Open Experience Builder Builder
   - Navigate to Widgets panel
   - Find "QuerySimple" and "HelperSimple" in the widget list
   - Drag widgets onto your experience

## Key Features

### Duplicate Query Button (r020.0)
Quickly clone existing queries with all settings preserved. Saves significant time when creating similar queries against the same layer - just duplicate and change the search field or value.

**Time Savings:** Configure 26 queries in ~8 minutes vs. ~50 minutes manual setup.

### Auto-Open Popup on Result Click (r021.11)
When you click a result in the results panel, the popup automatically opens showing feature attributes - matching the familiar WAB Enhanced Search behavior.

**Smart Location:** Uses ArcGIS `labelPointOperator` to guarantee popup appears on the interior of the geometry (perfect for L-shaped parcels or polygons with holes).

**Performance:** < 1ms calculation time using optimized ArcGIS API.

## Hash Parameters

### QuerySimple

Format: `#shortId=value`

**Examples:**
- `#pin=2223059013` - Execute "pin" query with value "2223059013"
- `#major=12345` - Execute "major" query with value "12345"

### HelperSimple

- `#qsopen=true` - Forces QuerySimple widget to open

## Debug Logging

Enable debug logging by adding `?debug=` parameter to your URL:

- `?debug=all` - Enable all debug logs
- `?debug=HASH,FORM` - Enable specific feature logs (comma-separated)
- `?debug=false` - Disable all debug logs (default)

Available debug features: `HASH`, `FORM`, `TASK`, `ZOOM`, `MAP-EXTENT`, `DATA-ACTION`, `POPUP`, `UI`, `ERROR`

## Recent Updates

### Version 1.19.0-r021.11 (January 2026)
- **NEW:** Auto-open popup on result click with guaranteed interior location
- **NEW:** Duplicate query button for fast configuration
- **FIXED:** Hash parameter persistence issue on widget reopen
- **IMPROVED:** Popup location calculation using ArcGIS labelPointOperator

### Version 1.19.0-r019.31
- Initial public release
- Query grouping support
- Enhanced selection management

## Requirements

- ArcGIS Experience Builder Developer Edition 1.19.0 or later
- Node.js and npm installed
- Access to Experience Builder source code

## Support

For issues, questions, or contributions, please refer to the repository's issue tracker or contact the MapSimple organization.

## License

[Add your license information here]

## References

- [ArcGIS Experience Builder Widget Development Guide](https://developers.arcgis.com/experience-builder/guide/)
- [Share Code Between Widgets](https://developers.arcgis.com/experience-builder/guide/share-code-between-widgets/)
- [Experience Builder Developer Edition](https://developers.arcgis.com/experience-builder/)

