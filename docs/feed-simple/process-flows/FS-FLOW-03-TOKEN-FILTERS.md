# FS-FLOW-03: Template Token Substitution and Filter Chain

## Overview

Describes the token substitution pipeline that transforms Markdown templates with
`{{fieldName}}` tokens into rendered HTML card content. Includes the chainable
pipe filter system (math, formatting, date, autolink, externalLink) and the
Markdown-to-HTML converter.

**Key files:**
- `feed-simple/src/utils/token-renderer.ts` -- Thin re-export wrapper (r004.001: engine extracted to shared-code)
- `feed-simple/src/utils/markdown-template-utils.ts` -- Thin wrapper: re-exports `convertTemplateToHtml` from shared-code; keeps FS-specific `renderPreview()` and `extractFieldTokens()` locally (r004.001)
- `shared-code/mapsimple-common/token-renderer.ts` -- Shared `substituteTokens` engine + 16 pipe filters (~364 lines)
- `shared-code/mapsimple-common/markdown-template-utils.ts` -- Shared Markdown-to-HTML converter with table support (~424 lines)
- `feed-simple/src/runtime/feed-card.tsx` -- FeedCard component that invokes the pipeline (~330 lines)

---

## Rendering Pipeline

```
 FeedCard render                             <- feed-card.tsx:33
      |
      +-- Has cardTemplate?                  :55
      |   |
      |   +-- YES ────────────────────────────────────┐
      |   |                                           |
      |   |   substituteTokens(template, item, ctx)   |  <- token-renderer.ts (wrapper)
      |   |        |                                  |     → shared-code token-renderer.ts:81
      |   |        v                                  |
      |   |   convertTemplateToHtml(substituted)      |  <- markdown-template-utils.ts (wrapper)
      |   |        |                                  |     → shared-code markdown-template-utils.ts:98
      |   |        |                                  |
      |   |        v                                  |
      |   |   dangerouslySetInnerHTML={{ __html }}    |  <- feed-card.tsx:69
      |   |                                           |
      |   +-- NO  ────────────────────────────────────┐
      |       Render raw fields:                      |
      |       Object.entries(item).map(...)           |  <- feed-card.tsx:76-83
      |       key: value for each field               |
      |
      +-- Status-driven background color     :41-48
      |   statusColorMap[item[statusField]]
      |
      +-- Highlight animation overlay        :126-135
      |   (yellow flash, fades out)
      |
      +-- Selected state border              :102
          isSelected → 2px solid blue
```

---

## Token Substitution (r002.023 — Chainable Pipes)

`substituteTokens()` (shared-code token-renderer.ts:81) replaces `{{token}}`
placeholders with values from the FeedItem. Supports chainable pipe filters
processed left-to-right. The FS local `token-renderer.ts` is a thin re-export
wrapper added in r004.001.

### Token Regex

```
TOKEN_REGEX = /\{\{((?:(?!\}\}).)+)\}\}/g
```

Captures everything between `{{` and `}}`. The inner content is then split by
`|` (pipe) respecting quoted strings via `splitPipes()`.

### Token Resolution Flow

```
 substituteTokens(template, item, ctx)       <- shared-code token-renderer.ts:81
      |
      +-- Guard: empty template → ''         :86
      |
      +-- template.replace(TOKEN_REGEX, ...)  :88
          |
          +-- splitPipes(inner)               :90
          |   Splits by | respecting quoted strings
          |   e.g., 'field | "MMM D" | round:1'
          |   → ['field', '"MMM D"', 'round:1']
          |
          +-- key = segments[0].trim()        :94
          +-- value = item[key] ?? ''         :96
          |
          +-- No filters? (segments.length===1) :99
          |   → return value (plain substitution)
          |
          +-- For each filter (segments 1..N): :102-105
              value = applyFilter(value, filter, item, ctx)
              (left-to-right chaining)
```

### Filter Router

```
 applyFilter(value, filter, item, ctx)       <- shared-code token-renderer.ts:144
      |
      +-- Quoted arg? (e.g., "MMM D, YYYY")  :151
      |   → applyDateFilter(value, format)
      |
      +-- Math operator? (/N, *N, +N, -N)    :157
      |   → applyMathOp(value, op, operand)
      |
      +-- Parameterized? (name:arg)           :163
      |   → applyNamedFilter(value, name, arg)
      |
      +-- Simple named filter                 :171
          → applyNamedFilter(value, name, undefined)
```

### Named Filters (r002.023)

| Filter | Syntax | Example | Description |
|--------|--------|---------|-------------|
| `autolink` | `{{field \| autolink}}` | URLs → `<a>` tags | Convert plain-text URLs to links |
| `externalLink` | `{{field \| externalLink}}` | "View ↗" link | Uses `externalLinkTemplate` config |
| `round` | `{{field \| round:N}}` | `round:1` → 1 decimal | Round to N decimal places (default 0) |
| `prefix` | `{{field \| prefix:$}}` | `$42` | Prepend text |
| `suffix` | `{{field \| suffix: km}}` | `2.4 km` | Append text (leading space preserved) |
| `abs` | `{{field \| abs}}` | `-5` → `5` | Absolute value |
| `toFixed` | `{{field \| toFixed:N}}` | Alias for `round` | Same as round |
| `upper` | `{{field \| upper}}` | `hello` → `HELLO` | Uppercase |
| `lower` | `{{field \| lower}}` | `HELLO` → `hello` | Lowercase |

### Math Operations

| Operator | Syntax | Example |
|----------|--------|---------|
| Divide | `{{field \| /1000}}` | 2400 → 2.4 |
| Multiply | `{{field \| *0.001}}` | 2400 → 2.4 |
| Add | `{{field \| +10}}` | 5 → 15 |
| Subtract | `{{field \| -5}}` | 15 → 10 |

### Chaining Example

```
{{distanceMeters | /1000 | round:1 | suffix: km}}
     2400.0000953674
  → /1000 → 2.4000000953674
  → round:1 → 2.4
  → suffix: km → "2.4 km"
```

---

## Filter Implementations

### Date Filter

Syntax: `{{fieldName | "MMM D, YYYY"}}` or `{{fieldName | "YYYY-MM-DD HH:mm:ss (UTCZ)"}}`

```
 applyDateFilter(value, formatString)        <- shared-code token-renderer.ts:261
      |
      +-- Guard: empty value → ''            :262
      |
      +-- Date.parse(value)                  :263
      |   if NaN → return raw value (not a date)
      |
      +-- Build timezone offset string       :275-280
      |   d.getTimezoneOffset() → minutes
      |   Positive = west of UTC (sign inverted for display)
      |   → e.g., "-07:00", "+05:30", "+00:00"
      |
      +-- Slot-based replacement             :292-307
          (prevents cascading regex matches)
          |
          +-- YYYY → full year               :292
          +-- YY   → 2-digit year            :293
          +-- MMM  → abbreviated month name  :294
          +-- MM   → zero-padded month       :295
          +-- M    → month (no padding)      :296
          +-- DD   → zero-padded day         :297
          +-- D    → day (no padding)        :298
          +-- HH   → zero-padded 24-hour     :299  (r002.025)
          +-- H    → 24-hour (no padding)    :300  (r002.025)
          +-- hh   → zero-padded 12-hour     :301
          +-- h    → 12-hour (no padding)    :302
          +-- mm   → zero-padded minutes     :303
          +-- ss   → zero-padded seconds     :304
          +-- A    → AM/PM uppercase         :305
          +-- a    → am/pm lowercase         :306
          +-- Z    → timezone offset         :307  (r002.025)
```

**Slot mechanism:** Each replaced token is temporarily stored as `\x00{index}\x00`
to prevent subsequent regex passes from consuming characters in already-replaced text
(e.g., "Mar" from MMM contains "M" which would be matched by the single-M pattern).

**Timezone offset (r002.025):** `Date.getTimezoneOffset()` returns minutes offset
from UTC. Positive values mean west of UTC. The sign is inverted for display:
`getTimezoneOffset() = 420` → `-07:00` (Pacific time).

### Autolink Filter

Syntax: `{{fieldName | autolink}}`

```
 applyAutolinkFilter(value)                  <- shared-code token-renderer.ts:319
      |
      +-- Guard: empty → ''                 :320
      |
      +-- Regex: match URLs                 :322-323
      |   Pattern: (?:https?://|www.)[^\s<>"']+
      |
      +-- For each URL match:               :324-327
          www. prefix? → prepend https://
          Wrap in <a href="..." target="_blank" rel="noopener">
```

### External Link Filter

Syntax: `{{fieldName | externalLink}}`

```
 applyExternalLinkFilter(value, item, template) <- shared-code token-renderer.ts:355
      |
      +-- Guard: no externalLinkTemplate     :360-361
      |   → resolveExternalLinkUrl() returns undefined
      |
      +-- Substitute tokens in URL template  (resolveExternalLinkUrl :336-348)
      |   template.replace(/\{\{...\}\}/g, ...)
      |   (plain substitution only, no nested filters)
      |
      +-- Return <a> tag                     :362
          <a href="{url}" target="_blank" rel="noopener">View ↗</a>
```

---

## Markdown-to-HTML Conversion

`convertTemplateToHtml()` (shared-code markdown-template-utils.ts:98) converts the
token-substituted Markdown into HTML. The conversion happens AFTER token substitution
so that pipe (`|`) and quote (`"`) characters in token syntax are not consumed by
Markdown parsing. The FS local `markdown-template-utils.ts` is a thin re-export
wrapper added in r004.001.

### Supported Markdown Syntax

All line references below are in `shared-code/mapsimple-common/markdown-template-utils.ts`.

| Syntax | HTML Output | Line Reference |
|--------|-------------|----------------|
| `# Heading` | `<h3>` | :195-199 |
| `## Subheading` | `<h4>` | :189-193 |
| `### Small` | `<h5>` | :183-187 |
| `#### Tiny` | `<h6>` | :177-181 |
| `**bold**` or `__bold__` | `<strong>` | :273-274 |
| `*italic*` or `_italic_` | `<em>` | :277-278 |
| `- item` or `* item` | `<ul><li>` | :203-211 |
| `---` | `<hr/>` | :169-173 |
| `[text](url)` | `<a>` (new tab) | :256-259 |
| `![alt](url)` | `<img>` (responsive) | :250-253 |
| `\| H \| H \|` | `<table>` with alignment | :158-163 (r026.014/r004.002) |
| Blank line | New `<p>` | :136-143 |
| Single newline | `<br/>` | :113-116 |
| Leading spaces | `padding-left` indent | :220-229 |

### Table Support (r026.014 / r004.002)

Pipe-delimited Markdown tables are parsed into styled `<table>` HTML.

```
 parseTableBlock(rows, styleName, customStripeColor)  <- shared-code markdown-template-utils.ts:309
      |
      +-- Style presets: 'striped', 'plain', 'bordered'
      |   Configured via <!-- table:STYLE --> comment   :147-155
      |   Optional custom stripe color: <!-- table:striped:#aabbcc -->
      |
      +-- Custom stripe color logic (r005.004):         :322-328
      |   customStripeColor sets evenRowBg (dark row)
      |   lightenHex(customStripeColor, 20) sets oddRowBg (light row)
      |
      +-- lightenHex(hex, amount)                       :287-292
      |   Increases each RGB channel by `amount` (0–255)
      |   Renamed from darkenHex in r005.004
      |
      +-- Alignment from separator row:
      |   :--- or ---  → left (default)
      |   :---:        → center
      |   ---:         → right
      |
      +-- Headerless tables supported
          (separator as first row → no <thead>)
```

### Inline Formatting Order

Processing order matters to avoid consuming partial matches:

```
 applyInlineFormatting(text)                 <- shared-code markdown-template-utils.ts:248
      |
      1. Images: ![alt](url)                :250-253
      |  (must be before links due to ! prefix)
      |
      2. Links: [text](url)                 :256-259
      |
      3. URL stash (r027.004)               :267-270
      |  Protects src/href attributes from bold/italic
      |
      4. Bold: **text** and __text__         :273-274
      |  (must be before italic)
      |
      5. Italic: *text* and _text_           :277-278
      |  (_text_ skips {{field_name}} tokens)
      |
      6. URL restore                         :281
```

### Paragraph Buffering

```
 convertTemplateToHtml()                     <- shared-code markdown-template-utils.ts:98
      |
      +-- Split into lines                  :101
      |
      +-- For each line:                     :132-230
      |   +-- Blank line?    → flushParagraph(), flushTable()
      |   +-- Table style?   → capture pending style hint
      |   +-- Table row?     → accumulate in tableBuffer
      |   +-- Heading?       → flushParagraph(), emit <hN>
      |   +-- HR?            → flushParagraph(), emit <hr/>
      |   +-- List item?     → flushParagraph(), open <ul> if needed
      |   +-- Regular text?  → accumulate in paraBuffer
      |
      +-- flushParagraph()                   :113-117
      |   Join buffered lines with <br/>
      |   Wrap in single <p> tag
      |
      +-- flushTable()                       :120-130
          Parse tableBuffer via parseTableBlock()
          Apply pending style/stripe color
```

---

## Settings Preview Renderer

`renderPreview()` (feed-simple markdown-template-utils.ts:26-42) is an FS-specific
function that stays in the local file. It renders the template in the settings panel
with styled token badges instead of substituted values:

```
 renderPreview(markdown)                     <- feed-simple markdown-template-utils.ts:26
      |
      +-- convertTemplateToHtml(markdown)    :30  (from shared-code)
      |
      +-- Replace {{tokens}} with badges    :33-41
          Each token becomes a styled <span>:
          - Monospace font
          - Primary color background
          - Shows field name + filter info
```

---

## FilterContext

The `FilterContext` interface (shared-code token-renderer.ts:30-35) passes widget
config values to the renderer so it remains pure (no config imports). The FS
wrapper re-exports the type:

```typescript
interface FilterContext {
  externalLinkTemplate?: string   // URL template for externalLink filter
  dateFormatString?: string       // Global date format fallback
}
```

Built in widget.tsx render() at line 679-682:
```
const filterCtx: FilterContext = {
  externalLinkTemplate: config.externalLinkTemplate,
  dateFormatString: config.dateFormatString
}
```

---

*Last updated: r005.004 (2026-04-06)*
