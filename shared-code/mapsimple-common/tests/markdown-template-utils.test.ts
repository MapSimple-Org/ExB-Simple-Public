/**
 * Unit tests for shared markdown-template-utils.ts — Markdown-to-HTML converter.
 *
 * All functions under test are pure string transforms (no DOM, no JSAPI).
 * Widget-specific functions (renderPreview, extractFieldTokens) are tested
 * in each widget's own test file.
 */

import {
  convertTemplateToHtml,
  applyInlineFormatting
} from '../markdown-template-utils'

// ── convertTemplateToHtml — headings ──────────────────────────────

describe('convertTemplateToHtml — headings', () => {
  it('should convert # to h3', () => {
    expect(convertTemplateToHtml('# Title')).toBe('<h3>Title</h3>')
  })

  it('should convert ## to h4', () => {
    expect(convertTemplateToHtml('## Subtitle')).toBe('<h4>Subtitle</h4>')
  })

  it('should convert ### to h5', () => {
    expect(convertTemplateToHtml('### Small')).toBe('<h5>Small</h5>')
  })

  it('should convert #### to h6', () => {
    expect(convertTemplateToHtml('#### Tiny')).toBe('<h6>Tiny</h6>')
  })

  it('should apply inline formatting within headings', () => {
    expect(convertTemplateToHtml('# **Bold Title**')).toBe('<h3><strong>Bold Title</strong></h3>')
  })
})

// ── convertTemplateToHtml — inline formatting ─────────────────────

describe('convertTemplateToHtml — inline formatting', () => {
  it('should convert **text** to strong', () => {
    expect(convertTemplateToHtml('**bold**')).toBe('<p><strong>bold</strong></p>')
  })

  it('should convert __text__ to strong', () => {
    expect(convertTemplateToHtml('__bold__')).toBe('<p><strong>bold</strong></p>')
  })

  it('should convert *text* to em', () => {
    expect(convertTemplateToHtml('*italic*')).toBe('<p><em>italic</em></p>')
  })

  it('should convert _text_ to em', () => {
    expect(convertTemplateToHtml('_italic_')).toBe('<p><em>italic</em></p>')
  })

  it('should handle bold and italic together', () => {
    const result = convertTemplateToHtml('**bold** and *italic*')
    expect(result).toContain('<strong>bold</strong>')
    expect(result).toContain('<em>italic</em>')
  })

  it('should not italicize underscores inside double-brace field tokens', () => {
    const result = convertTemplateToHtml('{{field_name}} is ok')
    expect(result).not.toContain('<em>')
    expect(result).toContain('{{field_name}}')
  })

  it('should not italicize underscores inside single-brace field tokens', () => {
    const result = convertTemplateToHtml('{SOME_FIELD} is ok')
    expect(result).not.toContain('<em>')
    expect(result).toContain('{SOME_FIELD}')
  })
})

// ── convertTemplateToHtml — links and images ──────────────────────

describe('convertTemplateToHtml — links and images', () => {
  it('should convert [text](url) to anchor with new tab', () => {
    const result = convertTemplateToHtml('[Click here](https://example.com)')
    expect(result).toContain('<a href="https://example.com" target="_blank" rel="noopener">Click here</a>')
  })

  it('should convert ![alt](url) to img', () => {
    const result = convertTemplateToHtml('![Photo](https://example.com/img.jpg)')
    expect(result).toContain('<img src="https://example.com/img.jpg" alt="Photo"')
    expect(result).toContain('max-width:100%')
  })

  it('should handle image before link in same line', () => {
    const result = convertTemplateToHtml('![img](a.png) [link](b.html)')
    expect(result).toContain('<img')
    expect(result).toContain('<a href')
  })

  it('should preserve underscores in image URLs (not convert to italic)', () => {
    const result = convertTemplateToHtml('![Trail](https://example.com/images/TH_SM_AT.jpg)')
    expect(result).toContain('src="https://example.com/images/TH_SM_AT.jpg"')
    expect(result).not.toContain('<em>')
  })

  it('should preserve underscores in link URLs (not convert to italic)', () => {
    const result = convertTemplateToHtml('[Report](https://example.com/docs/annual_report_2026.pdf)')
    expect(result).toContain('href="https://example.com/docs/annual_report_2026.pdf"')
    expect(result).not.toContain('<em>')
  })

  it('should preserve underscores in image URLs with token substitution', () => {
    // Simulates the case where {{Popup_Photo}} resolves to TH_SM_AT.jpg
    const result = convertTemplateToHtml('![Trail image](https://example.org/images/trail.jpg)')
    expect(result).toContain('src="https://example.org/images/trail.jpg"')
    expect(result).not.toContain('<em>')
  })
})

// ── convertTemplateToHtml — lists ─────────────────────────────────

describe('convertTemplateToHtml — lists', () => {
  it('should convert - items to unordered list', () => {
    const md = '- First\n- Second\n- Third'
    const result = convertTemplateToHtml(md)
    expect(result).toContain('<ul>')
    expect(result).toContain('<li>First</li>')
    expect(result).toContain('<li>Second</li>')
    expect(result).toContain('<li>Third</li>')
    expect(result).toContain('</ul>')
  })

  it('should convert * items to unordered list', () => {
    const md = '* Alpha\n* Beta'
    const result = convertTemplateToHtml(md)
    expect(result).toContain('<li>Alpha</li>')
    expect(result).toContain('<li>Beta</li>')
  })

  it('should close list when followed by blank line and text', () => {
    const md = '- Item\n\nParagraph'
    const result = convertTemplateToHtml(md)
    expect(result).toContain('</ul>')
    expect(result).toContain('<p>Paragraph</p>')
  })
})

// ── convertTemplateToHtml — horizontal rule ───────────────────────

describe('convertTemplateToHtml — horizontal rule', () => {
  it('should convert --- to hr', () => {
    const md = 'Above\n\n---\n\nBelow'
    const result = convertTemplateToHtml(md)
    expect(result).toContain('<hr/>')
  })

  it('should convert more than 3 dashes', () => {
    expect(convertTemplateToHtml('-----')).toContain('<hr/>')
  })
})

// ── convertTemplateToHtml — paragraphs and line breaks ────────────

describe('convertTemplateToHtml — paragraphs and line breaks', () => {
  it('should wrap plain text in a paragraph', () => {
    expect(convertTemplateToHtml('Hello world')).toBe('<p>Hello world</p>')
  })

  it('should join consecutive lines with br', () => {
    const md = 'Line 1\nLine 2\nLine 3'
    const result = convertTemplateToHtml(md)
    expect(result).toBe('<p>Line 1<br/>Line 2<br/>Line 3</p>')
  })

  it('should create separate paragraphs on blank lines', () => {
    const md = 'Paragraph 1\n\nParagraph 2'
    const result = convertTemplateToHtml(md)
    expect(result).toContain('<p>Paragraph 1</p>')
    expect(result).toContain('<p>Paragraph 2</p>')
  })
})

// ── convertTemplateToHtml — indentation ───────────────────────────

describe('convertTemplateToHtml — leading space indentation', () => {
  it('should indent lines with 2+ leading spaces', () => {
    const md = '  Indented text'
    const result = convertTemplateToHtml(md)
    expect(result).toContain('padding-left:1em')
    expect(result).toContain('Indented text')
  })

  it('should increase indent per 2 spaces', () => {
    const md = '    Double indent'
    const result = convertTemplateToHtml(md)
    expect(result).toContain('padding-left:2em')
  })

  it('should not indent lines with fewer than 2 leading spaces', () => {
    const md = ' Not indented enough'
    const result = convertTemplateToHtml(md)
    expect(result).not.toContain('padding-left')
  })
})

// ── convertTemplateToHtml — empty/null input ──────────────────────

describe('convertTemplateToHtml — empty input', () => {
  it('should return empty string for empty input', () => {
    expect(convertTemplateToHtml('')).toBe('')
  })

  it('should return empty string for null/undefined', () => {
    expect(convertTemplateToHtml(null as any)).toBe('')
    expect(convertTemplateToHtml(undefined as any)).toBe('')
  })
})

// ── convertTemplateToHtml — token passthrough ─────────────────────

describe('convertTemplateToHtml — field tokens', () => {
  it('should preserve {{fieldName}} tokens for runtime substitution', () => {
    const result = convertTemplateToHtml('Status: {{status}}')
    expect(result).toContain('{{status}}')
  })

  it('should preserve tokens with filters', () => {
    const result = convertTemplateToHtml('Date: {{pubDate | "MMM D, YYYY"}}')
    expect(result).toContain('{{pubDate | "MMM D, YYYY"}}')
  })

  it('should preserve single-brace {fieldName} tokens', () => {
    const result = convertTemplateToHtml('Owner: {OWNER}')
    expect(result).toContain('{OWNER}')
  })
})

// ── convertTemplateToHtml — complex template ──────────────────────

describe('convertTemplateToHtml — complex template', () => {
  it('should handle a realistic multi-element template', () => {
    const md = [
      '# {{title}}',
      '**Status:** {{status}}',
      '*Updated:* {{updated | "MMM D, YYYY"}}',
      '',
      '---',
      '',
      '{{description}}',
      '',
      '- [Details]({{link}})',
      '- {{category}}'
    ].join('\n')
    const result = convertTemplateToHtml(md)

    expect(result).toContain('<h3>')
    expect(result).toContain('<strong>Status:</strong>')
    expect(result).toContain('<em>Updated:</em>')
    expect(result).toContain('<hr/>')
    expect(result).toContain('<ul>')
    expect(result).toContain('<li>')
  })
})

// ── applyInlineFormatting — direct tests ──────────────────────────

describe('applyInlineFormatting', () => {
  it('should be exported for direct use', () => {
    expect(typeof applyInlineFormatting).toBe('function')
  })

  it('should apply bold formatting', () => {
    expect(applyInlineFormatting('**bold**')).toBe('<strong>bold</strong>')
  })

  it('should apply italic formatting', () => {
    expect(applyInlineFormatting('*italic*')).toBe('<em>italic</em>')
  })

  it('should protect single-brace tokens from italic', () => {
    const result = applyInlineFormatting('{FIELD_NAME}')
    expect(result).not.toContain('<em>')
  })

  it('should protect double-brace tokens from italic', () => {
    const result = applyInlineFormatting('{{field_name}}')
    expect(result).not.toContain('<em>')
  })
})

// r026.014: Table support tests
describe('convertTemplateToHtml — tables', () => {
  it('should render a simple 2-column table', () => {
    const md = '| Name | Value |\n| --- | --- |\n| foo | bar |'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('<table')
    expect(html).toContain('<th')
    expect(html).toContain('Name')
    expect(html).toContain('Value')
    expect(html).toContain('<td')
    expect(html).toContain('foo')
    expect(html).toContain('bar')
  })

  it('should render thead and tbody sections', () => {
    const md = '| A | B |\n| --- | --- |\n| 1 | 2 |'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('<thead>')
    expect(html).toContain('</thead>')
    expect(html).toContain('<tbody>')
    expect(html).toContain('</tbody>')
  })

  it('should apply left alignment by default', () => {
    const md = '| Col |\n| --- |\n| val |'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('text-align:left')
  })

  it('should apply center alignment from :---:', () => {
    const md = '| Col |\n| :---: |\n| val |'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('text-align:center')
  })

  it('should apply right alignment from ---:', () => {
    const md = '| Col |\n| ---: |\n| val |'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('text-align:right')
  })

  it('should apply mixed alignments across columns', () => {
    const md = '| Left | Center | Right |\n| :--- | :---: | ---: |\n| a | b | c |'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('text-align:left')
    expect(html).toContain('text-align:center')
    expect(html).toContain('text-align:right')
  })

  it('should apply bold and italic inside table cells', () => {
    const md = '| **Bold** | *Italic* |\n| --- | --- |\n| normal | text |'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('<strong>Bold</strong>')
    expect(html).toContain('<em>Italic</em>')
  })

  it('should apply links inside table cells', () => {
    const md = '| Link |\n| --- |\n| [click](https://example.com) |'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('<a href="https://example.com"')
    expect(html).toContain('click')
  })

  it('should preserve {{field}} tokens in table cells', () => {
    const md = '| Field | Value |\n| --- | --- |\n| Name | {{name}} |'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('{{name}}')
    expect(html).toContain('<td')
  })

  it('should handle multiple data rows', () => {
    const md = '| A | B |\n| --- | --- |\n| 1 | 2 |\n| 3 | 4 |\n| 5 | 6 |'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('1')
    expect(html).toContain('4')
    expect(html).toContain('6')
    // Should have 3 <tr> in tbody (tr tags may have style attributes)
    const tbodyMatch = html.match(/<tbody>([\s\S]*)<\/tbody>/)
    const trCount = (tbodyMatch?.[1] || '').split(/<tr[\s>]/).length - 1
    expect(trCount).toBe(3)
  })

  it('should treat pipe lines without separator as regular text', () => {
    const md = '| Not a table |\n| Just pipes |'
    const html = convertTemplateToHtml(md)
    expect(html).not.toContain('<table')
  })

  it('should handle table between paragraphs', () => {
    const md = 'Before\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n\nAfter'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('<p>Before</p>')
    expect(html).toContain('<table')
    expect(html).toContain('<p>After</p>')
  })

  it('should handle header-only table (no data rows)', () => {
    const md = '| H1 | H2 |\n| --- | --- |'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('<table')
    expect(html).toContain('<th')
    expect(html).toContain('H1')
    // No tbody since no data rows
    expect(html).not.toContain('<tbody>')
  })

  it('should wrap table in overflow-x:auto div', () => {
    const md = '| A | B |\n| --- | --- |\n| 1 | 2 |'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('overflow-x:auto')
  })

  it('should handle empty cells gracefully', () => {
    const md = '| A | B |\n| --- | --- |\n|  | value |'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('<td')
    expect(html).toContain('value')
  })

  it('should apply header background styling', () => {
    const md = '| Header |\n| --- |\n| data |'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('font-weight:600')
  })

  // ── Headerless tables (separator as first row) ──

  it('should render headerless table when separator is first row', () => {
    const md = '| --- | --- |\n| Alice | 90 |\n| Bob | 85 |'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('<table')
    expect(html).not.toContain('<thead>')
    expect(html).toContain('<tbody>')
    expect(html).toContain('Alice')
    expect(html).toContain('Bob')
  })

  it('should apply alignment in headerless table', () => {
    const md = '| :--- | :---: | ---: |\n| left | center | right |'
    const html = convertTemplateToHtml(md)
    expect(html).not.toContain('<thead>')
    expect(html).toContain('text-align:left')
    expect(html).toContain('text-align:center')
    expect(html).toContain('text-align:right')
  })

  it('should support inline formatting in headerless table cells', () => {
    const md = '| --- | --- |\n| **bold** | *italic* |'
    const html = convertTemplateToHtml(md)
    expect(html).not.toContain('<thead>')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<em>italic</em>')
  })

  it('should preserve tokens in headerless table cells', () => {
    const md = '| --- | --- |\n| {{name}} | {{score}} |'
    const html = convertTemplateToHtml(md)
    expect(html).not.toContain('<thead>')
    expect(html).toContain('{{name}}')
    expect(html).toContain('{{score}}')
  })

  it('should fallback separator-only table (no data rows) to paragraph', () => {
    const md = '| --- | --- |'
    const html = convertTemplateToHtml(md)
    // A lone separator with no data rows is not useful as a table — fallback
    expect(html).not.toContain('<table')
    expect(html).toContain('<p>')
  })

  // ── Table styling ──

  it('should use compact font size on tables', () => {
    const md = '| A | B |\n| --- | --- |\n| 1 | 2 |'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('font-size:0.85em')
  })

  it('should apply alternating row backgrounds on data rows (striped default)', () => {
    const md = '| H1 | H2 |\n| --- | --- |\n| row1 | a |\n| row2 | b |\n| row3 | c |'
    const html = convertTemplateToHtml(md)
    // Striped default: odd rows = neutral-200, even rows = neutral-300
    expect(html).toContain('ref-palette-neutral-200')
    expect(html).toContain('ref-palette-neutral-300')
  })

  it('should apply alternating row backgrounds on headerless tables', () => {
    const md = '| --- | --- |\n| row1 | a |\n| row2 | b |'
    const html = convertTemplateToHtml(md)
    expect(html).toContain('ref-palette-neutral-200')
    expect(html).toContain('ref-palette-neutral-300')
  })

  // ── Style hint tests ──

  it('should apply plain style when hint comment is present', () => {
    const md = '<!-- table:plain -->\n| H |\n| --- |\n| data1 |\n| data2 |'
    const html = convertTemplateToHtml(md)
    // Plain style: no alternating row backgrounds on <tr>
    expect(html).toContain('<table')
    expect(html).toContain('<thead>')
    // Data rows should not have row-level background
    const tbodyMatch = html.match(/<tbody>([\s\S]*)<\/tbody>/)
    const tbodyHtml = tbodyMatch?.[1] || ''
    expect(tbodyHtml).not.toContain('background:var(--ref-palette-neutral-200,#f0f0f0)')
  })

  it('should apply bordered style when hint comment is present', () => {
    const md = '<!-- table:bordered -->\n| H |\n| --- |\n| data |'
    const html = convertTemplateToHtml(md)
    // Bordered style uses 2px borders
    expect(html).toContain('border:2px solid')
    expect(html).toContain('<table')
  })

  it('should ignore unknown style hints and use default', () => {
    const md = '<!-- table:fancy -->\n| H |\n| --- |\n| data |'
    const html = convertTemplateToHtml(md)
    // Unknown style falls through — default striped is applied
    expect(html).toContain('<table')
    expect(html).toContain('ref-palette-neutral-200')
  })
})

// ── r027.093: Dangerous URL scheme blocking ─────────────────────

describe('applyInlineFormatting — dangerous URL blocking in links', () => {
  // Note: markdown link regex [text](url) captures url as ([^)]+), so test
  // URLs avoid literal ')' to isolate the security check from regex parsing.

  it('should block javascript: in link href and render plain text', () => {
    const result = applyInlineFormatting('[Click me](javascript:void)')
    expect(result).not.toContain('<a ')
    expect(result).not.toContain('javascript:')
    expect(result).toBe('Click me')
  })

  it('should block case-insensitive JAVASCRIPT:', () => {
    const result = applyInlineFormatting('[Click](JAVASCRIPT:void)')
    expect(result).not.toContain('<a ')
    expect(result).toBe('Click')
  })

  it('should block whitespace-obfuscated java\\nscript:', () => {
    const result = applyInlineFormatting('[Click](java\nscript:void)')
    expect(result).not.toContain('<a ')
    expect(result).toBe('Click')
  })

  it('should block data: URLs in links', () => {
    const result = applyInlineFormatting('[Click](data:text/html,xss)')
    expect(result).not.toContain('<a ')
    expect(result).toBe('Click')
  })

  it('should block vbscript: URLs in links', () => {
    const result = applyInlineFormatting('[Click](vbscript:run)')
    expect(result).not.toContain('<a ')
    expect(result).toBe('Click')
  })

  it('should allow https: URLs in links', () => {
    const result = applyInlineFormatting('[Safe](https://example.com)')
    expect(result).toContain('<a href="https://example.com"')
    expect(result).toContain('Safe</a>')
  })

  it('should allow http: URLs in links', () => {
    const result = applyInlineFormatting('[Link](http://example.com)')
    expect(result).toContain('<a href="http://example.com"')
  })

  it('should allow relative URLs in links', () => {
    const result = applyInlineFormatting('[Relative](./page.html)')
    expect(result).toContain('<a href="./page.html"')
  })

  it('should allow mailto: URLs in links', () => {
    const result = applyInlineFormatting('[Email](mailto:user@example.com)')
    expect(result).toContain('<a href="mailto:user@example.com"')
  })
})

describe('applyInlineFormatting — dangerous URL blocking in images', () => {
  it('should block javascript: in image src and render alt text', () => {
    const result = applyInlineFormatting('![Photo](javascript:void)')
    expect(result).not.toContain('<img')
    expect(result).not.toContain('javascript:')
    expect(result).toBe('Photo')
  })

  it('should block data: URLs in images', () => {
    const result = applyInlineFormatting('![Pic](data:text/html,xss)')
    expect(result).not.toContain('<img')
    expect(result).toBe('Pic')
  })

  it('should allow https: URLs in images', () => {
    const result = applyInlineFormatting('![Photo](https://example.com/img.jpg)')
    expect(result).toContain('<img src="https://example.com/img.jpg"')
    expect(result).toContain('alt="Photo"')
  })
})
