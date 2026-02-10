# Release Notes: v1.19.0-r022.107

**Release Date**: February 9, 2026  
**Type**: Feature Enhancement  
**Focus**: Configurable Hover Preview Pin Color + Settings UI Improvements

---

## 🎨 New Feature: Configurable Hover Preview Pin Color

### Overview
The hover preview pin color is now fully configurable through widget settings, allowing you to match your organization's branding or color scheme.

### What's New
- **Color Picker in Settings**: New "Hover Preview Pin" section with color picker
- **Default Color**: Yellow (#FFC107) - matches Google Maps style
- **Auto-Generated Lighter Center**: Inner circle automatically rendered 20% lighter than selected color
- **Instant Preview**: Changes apply immediately when hovering over result items

### How to Use
1. Open widget settings
2. Scroll to "Hover Preview Pin" section
3. Click the color picker to select your preferred color
4. Hover over result items to see the pin in the new color
5. The center circle will automatically be a lighter shade

### Examples
- **Red Pin**: `#FF0000` → Center: `#FF3333` (lighter)
- **Blue Pin**: `#0000FF` → Center: `#3333FF` (lighter)
- **Green Pin**: `#00FF00` → Center: `#33FF33` (lighter)
- **Yellow (Default)**: `#FFC107` → Center: `#FFEB3B` (lighter)

---

## 📋 Settings UI Improvements

### Enhanced Text Readability
**Problem**: Description text in settings was too light and difficult to read.

**Solution**:
- Removed low-contrast `text-secondary` class
- Applied `opacity: 0.8` for better visibility
- Maintained visual hierarchy while improving readability

**Affected Areas**:
- "Hover Preview Pin" description text
- "Result Click Behavior" description text

### Fixed Text Spacing
**Problem**: Negative margin (`-8px`) caused description text to clash with controls above.

**Solution**:
- Changed margin from `-8px` to `4px`
- Proper spacing between controls and descriptions
- Cleaner, more professional appearance

---

## 🔧 Technical Details

### Configuration
```typescript
interface SettingConfig {
  // ... existing properties
  hoverPinColor?: string  // Hex color (e.g., '#FFC107') - default: '#FFC107'
}
```

### Color Conversion
```typescript
// Convert hex to RGB for CIM symbol
function hexToRgb(hex: string, alpha: number = 230): [number, number, number, number] {
  const cleanHex = hex.replace('#', '')
  const r = parseInt(cleanHex.substring(0, 2), 16)
  const g = parseInt(cleanHex.substring(2, 4), 16)
  const b = parseInt(cleanHex.substring(4, 6), 16)
  return [r, g, b, alpha]
}
```

### Lighter Color Generation
```typescript
// Create lighter variant for center circle
const lighterColor: [number, number, number, number] = [
  Math.min(255, Math.round(baseColor[0] * 1.2)), // +20% brightness
  Math.min(255, Math.round(baseColor[1] * 1.2)),
  Math.min(255, Math.round(baseColor[2] * 1.2)),
  255 // Full opacity
]
```

### Props Threading
Color flows through component hierarchy:
```
widget.tsx (config.hoverPinColor)
  ↓
QueryTaskList (hoverPinColor)
  ↓
QueryTask (hoverPinColor)
  ↓
QueryTaskResult (hoverPinColor)
  ↓
SimpleList (hoverPinColor)
  ↓
QueryResultItem (hoverPinColor)
  ↓
CIM Symbol (baseColor, lighterColor)
```

---

## 📦 Files Changed

### Configuration & Settings
- `config.ts`: Added `hoverPinColor?: string` property
- `setting/setting.tsx`: Added "Hover Preview Pin" section, improved text contrast
- `setting/translations/default.ts`: Added i18n strings

### Runtime Components
- `query-result-item.tsx`: Added `hexToRgb()` helper, dynamic color application
- `simple-list.tsx`: Added `hoverPinColor` prop
- `query-result.tsx`: Added `hoverPinColor` prop
- `query-task.tsx`: Added `hoverPinColor` prop
- `query-task-list.tsx`: Added `hoverPinColor` prop
- `widget.tsx`: Passed `config.hoverPinColor` to QueryTaskList

### Version
- `version.ts`: Incremented to r022.107

---

## ✅ Testing Checklist

- [ ] Open widget settings → "Hover Preview Pin" section visible
- [ ] Color picker displays default yellow color
- [ ] Selecting red color → pin renders in red
- [ ] Selecting blue color → pin renders in blue
- [ ] Selecting green color → pin renders in green
- [ ] Center circle is lighter shade than outer pin
- [ ] Description text is readable (not too light)
- [ ] Proper spacing between controls and description text
- [ ] No text overlap or collision
- [ ] Color persists after page refresh

---

## 🔄 Backward Compatibility

✅ **Fully Compatible**
- Default color is yellow (`#FFC107`) - matches existing behavior
- Existing configurations without `hoverPinColor` will use default
- No breaking changes to API or existing features

---

## 📝 Related Issues

- **Feature Request**: Configurable hover pin color
- **Bug Fix**: Low-contrast settings description text
- **Bug Fix**: Negative margin causing text collision

---

## 🚀 What's Next?

Future enhancements for hover preview:
- [ ] Configurable pin size
- [ ] Configurable pin shape (teardrop, circle, square)
- [ ] Animation options (fade in/out, bounce)
- [ ] Configurable debounce delay
- [ ] Touch device behavior options

---

## 📚 Documentation

For complete documentation, see:
- `CHANGELOG.md` - Full version history
- `README.md` - Widget overview and features
- `docs/development/DEVELOPMENT_GUIDE.md` - Development guidelines

---

**Version**: 1.19.0-r022.107  
**Git Tag**: `v1.19.0-r022.107`  
**Branch**: `main`
