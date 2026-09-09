/**
 * stripMarkdownToText tests (r028.134, TAB_HELP_SPEC Phase 2)
 *
 * The helper flattens markdown help text to plain text for the tab-help
 * screen-reader description spans: convert through the real engine
 * (convertTemplateToHtml), strip tags, decode basic entities, collapse
 * whitespace. SR text must always track what the popover renders.
 */
import { stripMarkdownToText } from '../src/runtime/markdown-template-utils'

describe('stripMarkdownToText', () => {
  it('returns empty string for empty/undefined input', () => {
    expect(stripMarkdownToText('')).toBe('')
    expect(stripMarkdownToText(undefined as unknown as string)).toBe('')
  })

  it('passes plain text through unchanged', () => {
    expect(stripMarkdownToText('Search a layer by attributes.'))
      .toBe('Search a layer by attributes.')
  })

  it('strips bold and italic markers but keeps the words', () => {
    expect(stripMarkdownToText('Use **Operations** to apply a *buffer*.'))
      .toBe('Use Operations to apply a buffer.')
  })

  it('flattens a multi-line paragraph to one spaced line', () => {
    const md = 'First line\nsecond line\n\nNew paragraph'
    const out = stripMarkdownToText(md)
    expect(out).toContain('First line')
    expect(out).toContain('second line')
    expect(out).toContain('New paragraph')
    expect(out).not.toContain('\n')
    expect(out).not.toMatch(/\s{2,}/)
  })

  it('flattens list items to their text', () => {
    const out = stripMarkdownToText('- Pick a layer\n- Enter a value')
    expect(out).toContain('Pick a layer')
    expect(out).toContain('Enter a value')
    expect(out).not.toContain('<li>')
    expect(out).not.toContain('-')
  })

  it('leaves no HTML tags behind', () => {
    const out = stripMarkdownToText('## Heading\n\nBody **bold** text\n\n- item')
    expect(out).not.toMatch(/<[^>]*>/)
  })
})
