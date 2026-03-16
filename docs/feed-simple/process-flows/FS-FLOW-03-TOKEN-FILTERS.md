# FS-FLOW-03: Template Token Substitution and Filter Chain

## Overview

Describes the token substitution pipeline that transforms Markdown templates with
`{{fieldName}}` tokens into rendered HTML card content. Includes the chainable
pipe filter system (math, formatting, date, autolink, externalLink) and the
Markdown-to-HTML converter.

**Key files:**
- `feed-simple/src/utils/token-renderer.ts` -- Token substitution + chainable pipe filter pipeline (~320 lines)
- `feed-simple/src/utils/markdown-template-utils.ts` -- Markdown-to-HTML converter (200 lines)
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
      |   |   substituteTokens(template, item, ctx)   |  <- token-renderer.ts:41
      |   |        |                                  |
      |   |        v                                  |
      |   |   convertTemplateToHtml(substituted)      |  <- markdown-template-utils.ts:33
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

`substituteTokens()` (token-renderer.ts:54-81) replaces `{{token}}` placeholders
with values from the FeedItem. Supports chainable pipe filters processed left-to-right.

### Token Regex

```
TOKEN_REGEX = /\{\{((?:(?!\}\}).)+)\}\}/g
```

Captures everything between `{{` and `}}`. The inner content is then split by
`|` (pipe) respecting quoted strings via `splitPipes()`.

### Token Resolution Flow

```
 substituteTokens(template, item, ctx)       <- token-renderer.ts:54
      |
      +-- Guard: empty template → ''         :59
      |
      +-- template.replace(TOKEN_REGEX, ...)  :61
          |
          +-- splitPipes(inner)               :63
          |   Splits by | respecting quoted strings
          |   e.g., 'field | "MMM D" | round:1'
          |   → ['field', '"MMM D"', 'round:1']
          |
          +-- key = segments[0].trim()        :67
          +-- value = item[key] ?? ''         :68
          |
          +-- No filters? (segments.length===1) :71
          |   → return value (plain substitution)
          |
          +-- For each filter (segments 1..N): :74-78
              value = applyFilter(value, filter, item, ctx)
              (left-to-right chaining)
```

### Filter Router

```
 applyFilter(value, filter, item, ctx)       <- token-renderer.ts:116
      |
      +-- Quoted arg? (e.g., "MMM D, YYYY")  :123
      |   → applyDateFilter(value, format)
      |
      +-- Math operator? (/N, *N, +N, -N)    :129
      |   → applyMathOp(value, op, operand)
      |
      +-- Parameterized? (name:arg)           :135
      |   → applyNamedFilter(value, name, arg)
      |
      +-- Simple named filter                 :143
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
 applyDateFilter(value, formatString)        <- token-renderer.ts:233
      |
      +-- Guard: empty value → ''            :234
      |
      +-- Date.parse(value)                  :235
      |   if NaN → return raw value (not a date)
      |
      +-- Build timezone offset string       :247-252
      |   d.getTimezoneOffset() → minutes
      |   Positive = west of UTC (sign inverted for display)
      |   → e.g., "-07:00", "+05:30", "+00:00"
      |
      +-- Slot-based replacement             :264-279
          (prevents cascading regex matches)
          |
          +-- YYYY → full year               :264
          +-- YY   → 2-digit year            :265
          +-- MMM  → abbreviated month name  :266
          +-- MM   → zero-padded month       :267
          +-- M    → month (no padding)      :268
          +-- DD   → zero-padded day         :269
          +-- D    → day (no padding)        :270
          +-- HH   → zero-padded 24-hour     :271  (r002.025)
          +-- H    → 24-hour (no padding)    :272  (r002.025)
          +-- hh   → zero-padded 12-hour     :273
          +-- h    → 12-hour (no padding)    :274
          +-- mm   → zero-padded minutes     :275
          +-- ss   → zero-padded seconds     :276
          +-- A    → AM/PM uppercase         :277
          +-- a    → am/pm lowercase         :278
          +-- Z    → timezone offset         :279  (r002.025)
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
 applyAutolinkFilter(value)                  <- token-renderer.ts:128
      |
      +-- Guard: empty → ''                 :129
      |
      +-- Regex: match URLs                 :131-132
      |   Pattern: (?:https?://|www.)[^\s<>"']+
      |
      +-- For each URL match:               :133-136
          www. prefix? → prepend https://
          Wrap in <a href="..." target="_blank" rel="noopener">
```

### External Link Filter

Syntax: `{{fieldName | externalLink}}`

```
 applyExternalLinkFilter(value, item, template) <- token-renderer.ts:145
      |
      +-- Guard: no externalLinkTemplate     :150
      |   → return raw value
      |
      +-- Substitute tokens in URL template  :153-156
      |   externalLinkTemplate.replace(/\{\{...\}\}/g, ...)
      |   (plain substitution only, no nested filters)
      |
      +-- Return <a> tag                     :158
          <a href="{url}" target="_blank" rel="noopener">View ↗</a>
```

---

## Markdown-to-HTML Conversion

`convertTemplateToHtml()` (markdown-template-utils.ts:33-133) converts the
token-substituted Markdown into HTML. The conversion happens AFTER token substitution
so that pipe (`|`) and quote (`"`) characters in token syntax are not consumed by
Markdown parsing.

### Supported Markdown Syntax

| Syntax | HTML Output | Line Reference |
|--------|-------------|----------------|
| `# Heading` | `<h3>` | :89-93 |
| `## Subheading` | `<h4>` | :83-87 |
| `### Small` | `<h5>` | :77-81 |
| `#### Tiny` | `<h6>` | :71-75 |
| `**bold**` or `__bold__` | `<strong>` | :155-156 |
| `*italic*` or `_italic_` | `<em>` | :159-160 |
| `- item` or `* item` | `<ul><li>` | :97-106 |
| `---` | `<hr/>` | :63-67 |
| `[text](url)` | `<a>` (new tab) | :149-152 |
| `![alt](url)` | `<img>` (responsive) | :143-146 |
| Blank line | New `<p>` | :53-59 |
| Single newline | `<br/>` | :44-46 |
| Leading spaces | `padding-left` indent | :115-121 |

### Inline Formatting Order

Processing order matters to avoid consuming partial matches:

```
 applyInlineFormatting(text)                 <- markdown-template-utils.ts:141
      |
      1. Images: ![alt](url)                :143-146
      |  (must be before links due to ! prefix)
      |
      2. Links: [text](url)                 :149-152
      |
      3. Bold: **text** and __text__         :155-156
      |  (must be before italic)
      |
      4. Italic: *text* and _text_           :159-160
         (_text_ skips {{field_name}} tokens)
```

### Paragraph Buffering

```
 convertTemplateToHtml()                     <- markdown-template-utils.ts:33
      |
      +-- Split into lines                  :36
      |
      +-- For each line:
      |   +-- Blank line?    → flushParagraph()
      |   +-- Heading?       → flushParagraph(), emit <hN>
      |   +-- HR?            → flushParagraph(), emit <hr/>
      |   +-- List item?     → flushParagraph(), open <ul> if needed
      |   +-- Regular text?  → accumulate in paraBuffer
      |
      +-- flushParagraph()                   :43-47
          Join buffered lines with <br/>
          Wrap in single <p> tag
```

---

## Settings Preview Renderer

`renderPreview()` (markdown-template-utils.ts:170-186) renders the template in the
settings panel with styled token badges instead of substituted values:

```
 renderPreview(markdown)                     <- markdown-template-utils.ts:170
      |
      +-- convertTemplateToHtml(markdown)    :174
      |
      +-- Replace {{tokens}} with badges    :177-184
          Each token becomes a styled <span>:
          - Monospace font
          - Primary color background
          - Shows field name + filter info
```

---

## FilterContext

The `FilterContext` interface (token-renderer.ts:17-22) passes widget config values
to the renderer so it remains pure (no config imports):

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

*Last updated: r002.030 (2026-03-14)*
