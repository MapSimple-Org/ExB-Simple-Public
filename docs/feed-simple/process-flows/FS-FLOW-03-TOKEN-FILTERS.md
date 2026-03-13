# FS-FLOW-03: Template Token Substitution and Filter Chain

## Overview

Describes the token substitution pipeline that transforms Markdown templates with
`{{fieldName}}` tokens into rendered HTML card content. Includes the filter chain
(date formatting, autolink, externalLink) and the Markdown-to-HTML converter.

**Key files:**
- `feed-simple/src/utils/token-renderer.ts` -- Token substitution + filter pipeline (159 lines)
- `feed-simple/src/utils/markdown-template-utils.ts` -- Markdown-to-HTML converter (200 lines)
- `feed-simple/src/runtime/feed-card.tsx` -- FeedCard component that invokes the pipeline (139 lines)

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

## Token Substitution

`substituteTokens()` (token-renderer.ts:41-71) replaces `{{token}}` placeholders
with values from the FeedItem. Tokens support optional filters via pipe syntax.

### Token Regex

```
TOKEN_REGEX = /\{\{(\s*[\w.]+\s*)(?:\|\s*(?:"([^"]+)"|(\w+))\s*)?\}\}/g
```

| Capture Group | Content | Example |
|---------------|---------|---------|
| Group 1 | Field name | `location` |
| Group 2 | Quoted filter argument | `MMM D, YYYY` |
| Group 3 | Named filter | `autolink` |

### Token Resolution Flow

```
 substituteTokens(template, item, ctx)       <- token-renderer.ts:41
      |
      +-- Guard: empty template → ''         :46
      |
      +-- template.replace(TOKEN_REGEX, ...)  :48
          |
          +-- Extract key = rawField.trim()   :49
          +-- value = item[key] ?? ''         :50
          |
          +-- Decision: which filter?
              |
              +-- No filter (plain token)    :53
              |   → return value
              |
              +-- Quoted arg (date format)   :57
              |   → applyDateFilter(value, quotedArg)
              |
              +-- Named filter               :61-69
                  switch (filterName):
                    'autolink'     → applyAutolinkFilter(value)
                    'externalLink' → applyExternalLinkFilter(value, item, template)
                    default        → return value (unknown filter)
```

---

## Filter Implementations

### Date Filter

Syntax: `{{fieldName | "MMM D, YYYY"}}` or `{{fieldName | "MMM D, YYYY h:mm A"}}`

```
 applyDateFilter(value, formatString)        <- token-renderer.ts:81
      |
      +-- Guard: empty value → ''            :82
      |
      +-- Date.parse(value)                  :83
      |   if NaN → return raw value (not a date)
      |
      +-- Slot-based replacement             :96-119
          (prevents cascading regex matches)
          |
          +-- YYYY → full year               :104
          +-- YY   → 2-digit year            :105
          +-- MMM  → abbreviated month name  :106
          +-- MM   → zero-padded month       :107
          +-- M    → month (no padding)      :108
          +-- DD   → zero-padded day         :109
          +-- D    → day (no padding)        :110
          +-- hh   → zero-padded 12-hour     :111
          +-- h    → 12-hour (no padding)    :112
          +-- mm   → zero-padded minutes     :113
          +-- ss   → zero-padded seconds     :114
          +-- A    → AM/PM uppercase         :115
          +-- a    → am/pm lowercase         :116
```

**Slot mechanism:** Each replaced token is temporarily stored as `\x00{index}\x00`
to prevent subsequent regex passes from consuming characters in already-replaced text
(e.g., "Mar" from MMM contains "M" which would be matched by the single-M pattern).

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

*Last updated: r001.031 (2026-03-13)*
