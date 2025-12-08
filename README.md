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
- Hash parameter support for deep linking
- Result pagination (multi-page or lazy load)
- Selection management and map integration
- Custom data actions (Add to Map)
- Debug logging for troubleshooting

**Version:** 1.19.0

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
   cp -r client/your-extensions/widgets/query-simple /path/to/experience-builder/client/your-extensions/widgets/
   cp -r client/your-extensions/widgets/helper-simple /path/to/experience-builder/client/your-extensions/widgets/
   cp -r client/your-extensions/widgets/shared-code /path/to/experience-builder/client/your-extensions/widgets/
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

## Documentation

For detailed documentation, including:
- Complete installation instructions
- Configuration guide (including query grouping)
- Usage examples
- Hash parameter reference
- Debug logging guide
- Troubleshooting

See: **[Widget Documentation](./client/your-extensions/widgets/README.md)**

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

Available debug features: `HASH`, `FORM`, `TASK`, `ZOOM`, `MAP-EXTENT`, `DATA-ACTION`, `UI`, `ERROR`

## Version History

See [CHANGELOG.md](./client/your-extensions/widgets/CHANGELOG.md) for detailed version history and changes.

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

