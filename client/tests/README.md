# QuerySimple Widget - Debug Logging and Hash Parameters

## Debug Logging

The QuerySimple widget includes configurable debug logging that can be controlled via URL query parameters.

### Usage

Add `?debug=` to your URL with one of the following options:

- **No `debug` parameter** - **All debug logging DISABLED** (default for production)
- `?debug=all` - Enable all debug logs
- `?debug=HASH,FORM` - Enable specific feature logs (comma-separated)
- `?debug=false` - Explicitly disable all debug logs (same as no parameter)

### Available Debug Features

- **HASH** - Hash parameter processing (detection, removal, clearing)
- **FORM** - Query form interactions
- **TASK** - Query task management
- **ZOOM** - Zoom behavior
- **MAP-EXTENT** - Map extent changes
- **DATA-ACTION** - Data action execution (Add to Map, etc.)
- **UI** - UI interactions (tab switching, etc.)
- **ERROR** - Error logging (console.error/warn calls)

**Important**: When `?debug=false` is set, **ALL** console logging is disabled, including error logs.

### Examples

```
# Enable all debug logs
https://yoursite.com/app?debug=all

# Enable only hash and form logs
https://yoursite.com/app?debug=HASH,FORM

# Enable only map extent logs
https://yoursite.com/app?debug=MAP-EXTENT

# Disable all debug logs
https://yoursite.com/app?debug=false

# Combine with hash parameters (query parameters come before hash)
https://yoursite.com/app?debug=HASH#pin=123456
```

### Log Format

All debug logs are prefixed with `[QUERYSIMPLE-FEATURE]` and output as formatted JSON:

```json
[QUERYSIMPLE-HASH] {
  "feature": "HASH",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "event": "hash-detected",
  "widgetId": "widget_12",
  "shortId": "pin",
  "value": "123456"
}
```

## Hash Parameters

The QuerySimple widget supports URL hash parameters for triggering queries programmatically.

### Hash Parameter Format

Hash parameters use the format: `#shortId=value`

Where `shortId` is the unique identifier configured for a query item in the widget settings.

### Special Hash Parameters

#### `#qsopen=true`

Forces the widget to open without requiring a query parameter match. Useful for:
- Playwright E2E tests that need the widget open
- Opening the widget without executing a query
- Can be combined with query parameters: `#qsopen=true&pin=123456`

#### Query Parameters

Hash parameters can be combined with query parameters. The `?` (query) comes before the `#` (hash):

```
https://yoursite.com/app?debug=HASH#pin=123456
```

### Examples

```
# Trigger PIN query with value 2223059013
https://yoursite.com/app#pin=2223059013

# Trigger Major query with value 123456
https://yoursite.com/app#major=123456

# Open widget without query (for testing)
https://yoursite.com/app#qsopen=true

# Open widget and trigger query
https://yoursite.com/app#qsopen=true&pin=2223059013

# Combine debug logging with hash parameters
https://yoursite.com/app?debug=HASH,FORM#pin=2223059013
```

### How It Works

1. When a hash parameter matches a `shortId` configured in a query item, the widget:
   - Automatically selects that query
   - Populates the input field with the value
   - Executes the query (if `qsopen` is not the only parameter)

2. After processing, the hash parameter is removed from the URL to prevent re-execution

3. The HelperSimple widget can automatically open QuerySimple widgets when hash parameters are detected

### HelperSimple Integration

The HelperSimple widget monitors hash parameters and automatically opens the configured QuerySimple widget when matching `shortId` values are detected in the URL hash.




