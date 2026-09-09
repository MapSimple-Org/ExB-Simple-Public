/**
 * Unit tests for FeedSimple-specific template utilities (renderPreview, extractFieldTokens).
 *
 * Tests for the shared convertTemplateToHtml function are in
 * shared-code/mapsimple-common/tests/markdown-template-utils.test.ts
 */

import {
  renderPreview,
  extractFieldTokens
} from '../src/utils/markdown-template-utils'

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
