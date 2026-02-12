/**
 * Lightweight Markdown-to-HTML converter for Custom Template result display.
 * Supports a deliberate subset of Markdown:
 *
 *   **bold**          Bold text
 *   *italic*          Italic text
 *   # Heading         Large heading (h3)
 *   ## Subheading     Medium heading (h4)
 *   ### Small heading  Small heading (h5)
 *   - item            Unordered list item
 *   ---               Horizontal rule
 *   [text](url)       Clickable link (opens in new tab)
 *   (blank line)      Paragraph break
 *   (leading spaces)  Visual indentation (2 spaces = 1 level)
 *
 * Single line breaks (Enter) produce <br/> within the same paragraph.
 * {fieldName} tokens pass through untouched for Esri PopupTemplate substitution.
 *
 * r023.18: Initial implementation + paragraph buffer fix + indent/link/h3 support
 */

/**
 * Convert a Markdown template string to HTML.
 * Field tokens like {OWNER} are preserved for Esri Feature widget substitution.
 *
 * Line break behavior:
 *   - Single Enter = <br/> within the same <p>
 *   - Blank line (double Enter) = new <p>
 *   - Leading spaces = indented line via padding-left (2 spaces = 1em)
 */
export function convertTemplateToHtml (markdown: string): string {
  if (!markdown) return ''

  const lines = markdown.split('\n')
  const htmlLines: string[] = []
  let inList = false
  // Buffer for consecutive plain-text lines that belong in one <p>
  const paraBuffer: string[] = []

  /** Flush the paragraph buffer as a single <p> with <br/> separators */
  function flushParagraph (): void {
    if (paraBuffer.length === 0) return
    htmlLines.push(`<p>${paraBuffer.join('<br/>')}</p>`)
    paraBuffer.length = 0
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Blank line: flush paragraph, close list, start new paragraph on next content
    if (line.trim() === '') {
      flushParagraph()
      if (inList) {
        htmlLines.push('</ul>')
        inList = false
      }
      continue
    }

    // Horizontal rule (--- or more)
    if (/^-{3,}\s*$/.test(line.trim())) {
      flushParagraph()
      if (inList) { htmlLines.push('</ul>'); inList = false }
      htmlLines.push('<hr/>')
      continue
    }

    // Headings: ### before ## before # (match longest prefix first)
    if (line.startsWith('### ')) {
      flushParagraph()
      if (inList) { htmlLines.push('</ul>'); inList = false }
      htmlLines.push(`<h5>${applyInlineFormatting(line.slice(4).trim())}</h5>`)
      continue
    }
    if (line.startsWith('## ')) {
      flushParagraph()
      if (inList) { htmlLines.push('</ul>'); inList = false }
      htmlLines.push(`<h4>${applyInlineFormatting(line.slice(3).trim())}</h4>`)
      continue
    }
    if (line.startsWith('# ')) {
      flushParagraph()
      if (inList) { htmlLines.push('</ul>'); inList = false }
      htmlLines.push(`<h3>${applyInlineFormatting(line.slice(2).trim())}</h3>`)
      continue
    }

    // Unordered list items (- item or * item, with optional leading spaces)
    if (/^\s*[-*]\s+/.test(line)) {
      flushParagraph()
      if (!inList) {
        htmlLines.push('<ul>')
        inList = true
      }
      const content = line.replace(/^\s*[-*]\s+/, '')
      htmlLines.push(`<li>${applyInlineFormatting(content)}</li>`)
      continue
    }

    // Regular text line: accumulate into paragraph buffer
    if (inList) {
      htmlLines.push('</ul>')
      inList = false
    }

    // Detect leading spaces for indentation (2 spaces = 1em)
    const leadingSpaces = line.match(/^( +)/)?.[1]?.length || 0
    const trimmedContent = applyInlineFormatting(line.trimStart())

    if (leadingSpaces >= 2) {
      const indentEm = Math.floor(leadingSpaces / 2)
      paraBuffer.push(`<span style="display:inline-block;padding-left:${indentEm}em">${trimmedContent}</span>`)
    } else {
      paraBuffer.push(trimmedContent)
    }
  }

  // Flush remaining content
  flushParagraph()
  if (inList) {
    htmlLines.push('</ul>')
  }

  return htmlLines.join('\n')
}

/**
 * Apply inline formatting: **bold**, *italic*, and [text](url) links.
 * Processes bold first so **text** isn't partially consumed by the italic pass.
 * {fieldName} tokens are left untouched.
 */
function applyInlineFormatting (text: string): string {
  // Links: [text](url) -> <a> with new-tab behavior
  text = text.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener">$1</a>'
  )

  // Bold: **text** or __text__
  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  text = text.replace(/__(.+?)__/g, '<strong>$1</strong>')

  // Italic: *text* or _text_ (but not inside field tokens like {field_name})
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>')
  text = text.replace(/(?<!\{[\w]*)_(.+?)_(?![\w]*\})/g, '<em>$1</em>')

  return text
}

/**
 * Render a Markdown template as HTML for the settings preview panel.
 * Replaces {fieldName} tokens with styled badge spans instead of leaving them
 * for Esri substitution.
 */
export function renderPreview (markdown: string): string {
  if (!markdown) return '<p style="color: var(--ref-palette-neutral-700); font-style: italic;">Enter a template above to see a preview</p>'

  // First convert Markdown to HTML
  const html = convertTemplateToHtml(markdown)

  // Replace {fieldName} tokens with styled badges
  return html.replace(
    /\{(\w+)\}/g,
    '<span style="display: inline-block; padding: 1px 6px; margin: 0 2px; border-radius: 3px; background-color: var(--sys-color-primary-light); color: var(--sys-color-primary-dark); font-family: monospace; font-size: 0.85em;">$1</span>'
  )
}

/**
 * Extract field names referenced in a template string via {fieldName} tokens.
 * Used by combineFields to ensure the query requests all needed fields.
 */
export function extractFieldTokens (template: string): string[] {
  if (!template) return []
  const matches = template.match(/\{(\w+)\}/g)
  if (!matches) return []
  return matches.map(m => m.substring(1, m.length - 1))
}
