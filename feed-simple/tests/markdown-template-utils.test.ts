/**
 * Unit tests for markdown-template-utils.ts — FeedSimple Markdown-to-HTML converter.
 *
 * All functions under test are pure string transforms (no DOM, no JSAPI).
 */

import {
  convertTemplateToHtml,
  renderPreview,
  extractFieldTokens
} from '../src/utils/markdown-template-utils'

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

  it('should not italicize underscores inside field tokens', () => {
    const result = convertTemplateToHtml('{{field_name}} is ok')
    // The _name part should NOT be wrapped in <em>
    expect(result).not.toContain('<em>')
    expect(result).toContain('{{field_name}}')
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

// ── renderPreview ─────────────────────────────────────────────────

describe('renderPreview', () => {
  it('should replace tokens with styled badge spans', () => {
    const result = renderPreview('Status: {{status}}')
    expect(result).toContain('<span')
    expect(result).toContain('status')
    expect(result).toContain('monospace')
    expect(result).not.toContain('{{status}}')
  })

  it('should show filter in badge for date-filtered tokens', () => {
    const result = renderPreview('{{date | "MMM D"}}')
    expect(result).toContain('date')
    expect(result).toContain('| "MMM D"')
  })

  it('should show filter in badge for named filters', () => {
    const result = renderPreview('{{link | autolink}}')
    expect(result).toContain('link')
    expect(result).toContain('| autolink')
  })

  it('should return placeholder message for empty input', () => {
    const result = renderPreview('')
    expect(result).toContain('Enter a template')
    expect(result).toContain('italic')
  })

  it('should return placeholder for null/undefined', () => {
    expect(renderPreview(null as any)).toContain('Enter a template')
    expect(renderPreview(undefined as any)).toContain('Enter a template')
  })
})

// ── extractFieldTokens ────────────────────────────────────────────

describe('extractFieldTokens', () => {
  it('should extract simple field names', () => {
    const fields = extractFieldTokens('{{title}} and {{status}}')
    expect(fields).toEqual(['title', 'status'])
  })

  it('should extract dot-path field names', () => {
    const fields = extractFieldTokens('{{origin.time.value}}')
    expect(fields).toEqual(['origin.time.value'])
  })

  it('should extract field names from filtered tokens', () => {
    const fields = extractFieldTokens('{{pubDate | "MMM D"}} {{link | autolink}}')
    expect(fields).toEqual(['pubDate', 'link'])
  })

  it('should return empty array for no tokens', () => {
    expect(extractFieldTokens('No tokens here')).toEqual([])
  })

  it('should return empty array for empty/null input', () => {
    expect(extractFieldTokens('')).toEqual([])
    expect(extractFieldTokens(null as any)).toEqual([])
  })

  it('should handle attribute and array tokens', () => {
    const fields = extractFieldTokens('{{link.@href}} {{category[0]}}')
    expect(fields).toEqual(['link.@href', 'category[0]'])
  })

  it('should trim whitespace from extracted names', () => {
    const fields = extractFieldTokens('{{ title }} and {{  status  }}')
    expect(fields).toEqual(['title', 'status'])
  })
})
