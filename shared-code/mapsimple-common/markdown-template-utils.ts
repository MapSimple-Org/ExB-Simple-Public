/**
 * Shared Markdown-to-HTML converter for MapSimple widget templates.
 * Used by QuerySimple, FeedSimple, and future widgets.
 *
 * Supports a deliberate subset of Markdown:
 *
 *   **bold**          Bold text
 *   *italic*          Italic text
 *   # Heading         Large heading (h3)
 *   ## Subheading     Medium heading (h4)
 *   ### Small heading  Small heading (h5)
 *   #### Tiny heading  Tiny heading (h6)
 *   - item            Unordered list item
 *   ---               Horizontal rule
 *   [text](url)       Clickable link (opens in new tab)
 *   ![alt](url)       Image (responsive, max-width 100%)
 *   | H | H |         Table header row (optional)
 *   | --- | --- |      Table separator (required — marks it as a table)
 *   | C | C |         Table data row
 *   (separator first)  Headerless table (no <thead>)
 *   (blank line)      Paragraph break
 *   (leading spaces)  Visual indentation (2 spaces = 1 level)
 *
 * Single line breaks (Enter) produce <br/> within the same paragraph.
 * Field tokens ({fieldName} and {{fieldName}}) pass through untouched
 * for widget-specific substitution engines.
 *
 * r026.001 / r004.001: Extracted from QS + FS into shared-code
 * r026.014 / r004.002: Added markdown table support with alignment
 */

// ── Regex (hoisted to module scope for performance) ──────────────

const RE_HR = /^-{3,}\s*$/
const RE_LIST_ITEM = /^\s*[-*]\s+/
const RE_LEADING_SPACES = /^( +)/
const RE_IMAGE = /!\[([^\]]*)\]\(([^)]+)\)/g
const RE_LINK = /\[([^\]]+)\]\(([^)]+)\)/g
const RE_BOLD_STAR = /\*\*(.+?)\*\*/g
const RE_BOLD_UNDER = /__(.+?)__/g
const RE_ITALIC_STAR = /\*(.+?)\*/g
// Token-agnostic: protects both {field_name} and {{field_name}} from italic
const RE_ITALIC_UNDER = /(?<!\{[\w]*)_(.+?)_(?![\w]*\})/g

// Table detection: line starts and ends with pipe
const RE_TABLE_ROW = /^\|(.+)\|$/
// Table separator: | --- | :---: | ---: | (dashes with optional colons for alignment)
const RE_TABLE_SEPARATOR = /^\|[\s:|-]+\|$/
// Table style hint: <!-- table:STYLE --> (e.g. plain, striped, bordered)
const RE_TABLE_STYLE = /^<!--\s*table:(\w+)\s*-->$/

/** Table style presets — colors for alternating rows and header */
type TableStyleName = 'plain' | 'striped' | 'bordered'
interface TableStyleDef {
  /** Background for odd data rows (0-indexed: 0, 2, 4...) */
  oddRowBg: string
  /** Background for even data rows (1, 3, 5...) */
  evenRowBg: string
  /** Header background + font weight */
  thBg: string
  /** Cell border style */
  border: string
}
const TABLE_STYLES: Record<TableStyleName, TableStyleDef> = {
  // plain: no striping, light borders
  plain: {
    oddRowBg: '',
    evenRowBg: '',
    thBg: 'font-weight:600;background:var(--ref-palette-neutral-200,#f0f0f0)',
    border: 'border:1px solid var(--ref-palette-neutral-400,#d4d4d4)'
  },
  // striped: visible alternating grey rows (matches Esri default table)
  striped: {
    oddRowBg: 'background:var(--ref-palette-neutral-200,#f0f0f0)',
    evenRowBg: 'background:var(--ref-palette-neutral-300,#e2e2e2)',
    thBg: 'font-weight:600;background:var(--ref-palette-neutral-400,#d4d4d4)',
    border: 'border:1px solid var(--ref-palette-neutral-400,#d4d4d4)'
  },
  // bordered: no striping, heavier borders
  bordered: {
    oddRowBg: '',
    evenRowBg: '',
    thBg: 'font-weight:600;background:var(--ref-palette-neutral-200,#f0f0f0)',
    border: 'border:2px solid var(--ref-palette-neutral-500,#bbb)'
  }
}
const DEFAULT_TABLE_STYLE: TableStyleName = 'striped'

/**
 * Convert a Markdown template string to HTML.
 * Field tokens are preserved for widget-specific substitution.
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
  // r026.014: Buffer for consecutive table rows (| ... |)
  const tableBuffer: string[] = []
  // r026.016: Optional style hint preceding a table (<!-- table:style -->)
  let pendingTableStyle: TableStyleName | null = null

  /** Flush the paragraph buffer as a single <p> with <br/> separators */
  function flushParagraph (): void {
    if (paraBuffer.length === 0) return
    htmlLines.push(`<p>${paraBuffer.join('<br/>')}</p>`)
    paraBuffer.length = 0
  }

  /** r026.014: Flush accumulated table rows — parse and emit <table> HTML */
  function flushTable (): void {
    if (tableBuffer.length === 0) {
      pendingTableStyle = null
      return
    }
    htmlLines.push(parseTableBlock(tableBuffer.slice(), pendingTableStyle ?? DEFAULT_TABLE_STYLE))
    tableBuffer.length = 0
    pendingTableStyle = null
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    // Blank line: flush paragraph/table, close list, start new paragraph on next content
    if (line.trim() === '') {
      flushParagraph()
      flushTable()
      if (inList) {
        htmlLines.push('</ul>')
        inList = false
      }
      continue
    }

    // r026.016: Table style hint — <!-- table:STYLE --> preceding a table
    const styleMatch = line.trim().match(RE_TABLE_STYLE)
    if (styleMatch) {
      const styleName = styleMatch[1].toLowerCase() as TableStyleName
      if (TABLE_STYLES[styleName]) {
        pendingTableStyle = styleName
      }
      continue
    }

    // r026.014: Table row detection — accumulate consecutive | ... | lines
    if (RE_TABLE_ROW.test(line.trim())) {
      flushParagraph()
      if (inList) { htmlLines.push('</ul>'); inList = false }
      tableBuffer.push(line.trim())
      continue
    }

    // Non-table line encountered — flush any accumulated table rows
    flushTable()

    // Horizontal rule (--- or more)
    if (RE_HR.test(line.trim())) {
      flushParagraph()
      if (inList) { htmlLines.push('</ul>'); inList = false }
      htmlLines.push('<hr/>')
      continue
    }

    // Headings: #### before ### before ## before # (match longest prefix first)
    if (line.startsWith('#### ')) {
      flushParagraph()
      if (inList) { htmlLines.push('</ul>'); inList = false }
      htmlLines.push(`<h6>${applyInlineFormatting(line.slice(5).trim())}</h6>`)
      continue
    }
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
    if (RE_LIST_ITEM.test(line)) {
      flushParagraph()
      if (!inList) {
        htmlLines.push('<ul>')
        inList = true
      }
      const content = line.replace(RE_LIST_ITEM, '')
      htmlLines.push(`<li>${applyInlineFormatting(content)}</li>`)
      continue
    }

    // Regular text line: accumulate into paragraph buffer
    if (inList) {
      htmlLines.push('</ul>')
      inList = false
    }

    // Detect leading spaces for indentation (2 spaces = 1em)
    const leadingSpaces = line.match(RE_LEADING_SPACES)?.[1]?.length || 0
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
  flushTable()
  if (inList) {
    htmlLines.push('</ul>')
  }

  return htmlLines.join('\n')
}

/**
 * Apply inline formatting: **bold**, *italic*, ![alt](url) images, and [text](url) links.
 * Processes bold first so **text** isn't partially consumed by the italic pass.
 * Images must be processed before links (![...] vs [...] syntax).
 * Field tokens ({fieldName} and {{fieldName}}) are left untouched.
 */
export function applyInlineFormatting (text: string): string {
  // Images: ![alt](url) -> <img> (must be before links due to similar syntax)
  text = text.replace(
    RE_IMAGE,
    '<img src="$2" alt="$1" style="max-width:100%; height:auto; display:block; margin:4px 0;">'
  )

  // Links: [text](url) -> <a> with new-tab behavior
  text = text.replace(
    RE_LINK,
    '<a href="$2" target="_blank" rel="noopener">$1</a>'
  )

  // Bold: **text** or __text__
  text = text.replace(RE_BOLD_STAR, '<strong>$1</strong>')
  text = text.replace(RE_BOLD_UNDER, '<strong>$1</strong>')

  // Italic: *text* or _text_ (but not inside field tokens like {field_name} or {{field_name}})
  text = text.replace(RE_ITALIC_STAR, '<em>$1</em>')
  text = text.replace(RE_ITALIC_UNDER, '<em>$1</em>')

  return text
}

/**
 * r026.014: Parse accumulated table rows into HTML <table>.
 *
 * Two formats supported:
 *   With header:    [headerRow, separatorRow, ...dataRows]
 *   Without header: [separatorRow, ...dataRows]  (separator is first row → no thead)
 *
 * If no valid separator row is found, falls back to rendering rows as
 * plain paragraphs (pipe characters and all).
 *
 * Alignment is derived from the separator row:
 *   :--- or ---  → left (default)
 *   :---:        → center
 *   ---:         → right
 */
function parseTableBlock (rows: string[], styleName: TableStyleName = DEFAULT_TABLE_STYLE): string {
  if (rows.length < 1) {
    return ''
  }

  /** Split a table row into cell contents (strip outer pipes, trim each cell) */
  const splitCells = (row: string): string[] => {
    const inner = row.replace(/^\|/, '').replace(/\|$/, '')
    return inner.split('|').map(c => c.trim())
  }

  // Resolve style preset
  const style = TABLE_STYLES[styleName] || TABLE_STYLES[DEFAULT_TABLE_STYLE]
  const cellPadding = 'padding:4px 8px'
  // Compact font — slightly smaller than parent to match Esri's default table rendering
  const tableFontStyle = 'border-collapse:collapse;width:100%;font-size:0.85em;line-height:1.4;'

  // ── Headerless table: separator is the first row ──
  if (RE_TABLE_SEPARATOR.test(rows[0])) {
    const separatorCells = splitCells(rows[0])
    const alignments = separatorCells.map(cell => {
      const trimmed = cell.trim()
      if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center'
      if (trimmed.endsWith(':')) return 'right'
      return 'left'
    })

    const dataRows = rows.slice(1).map(splitCells)
    if (dataRows.length === 0) {
      return rows.map(r => `<p>${applyInlineFormatting(r)}</p>`).join('\n')
    }

    const html: string[] = []
    html.push('<div style="max-width:100%;overflow-x:auto;">')
    html.push(`<table style="${tableFontStyle}">`)
    html.push('<tbody>')
    dataRows.forEach((cells, rowIdx) => {
      const rowBg = rowIdx % 2 === 0 ? style.oddRowBg : style.evenRowBg
      html.push(`<tr${rowBg ? ` style="${rowBg}"` : ''}>`)
      cells.forEach((cell, idx) => {
        const align = alignments[idx] || 'left'
        html.push(`<td style="${style.border};${cellPadding};text-align:${align};">${applyInlineFormatting(cell)}</td>`)
      })
      html.push('</tr>')
    })
    html.push('</tbody>')
    html.push('</table>')
    html.push('</div>')
    return html.join('')
  }

  // ── Standard table: need header + separator ──
  if (rows.length < 2) {
    return rows.map(r => `<p>${applyInlineFormatting(r)}</p>`).join('\n')
  }

  if (!RE_TABLE_SEPARATOR.test(rows[1])) {
    return rows.map(r => `<p>${applyInlineFormatting(r)}</p>`).join('\n')
  }

  // Parse alignment from separator row
  const separatorCells = splitCells(rows[1])
  const alignments: string[] = separatorCells.map(cell => {
    const trimmed = cell.trim()
    if (trimmed.startsWith(':') && trimmed.endsWith(':')) return 'center'
    if (trimmed.endsWith(':')) return 'right'
    return 'left'
  })

  // Parse header cells
  const headerCells = splitCells(rows[0])

  // Parse data rows (skip header and separator)
  const dataRows = rows.slice(2).map(splitCells)

  // Build HTML
  const html: string[] = []
  html.push('<div style="max-width:100%;overflow-x:auto;">')
  html.push(`<table style="${tableFontStyle}">`)

  // Header
  html.push('<thead><tr>')
  headerCells.forEach((cell, idx) => {
    const align = alignments[idx] || 'left'
    html.push(`<th style="${style.border};${cellPadding};text-align:${align};${style.thBg}">${applyInlineFormatting(cell)}</th>`)
  })
  html.push('</tr></thead>')

  // Body with alternating row colors
  if (dataRows.length > 0) {
    html.push('<tbody>')
    dataRows.forEach((cells, rowIdx) => {
      const rowBg = rowIdx % 2 === 0 ? style.oddRowBg : style.evenRowBg
      html.push(`<tr${rowBg ? ` style="${rowBg}"` : ''}>`)
      cells.forEach((cell, idx) => {
        const align = alignments[idx] || 'left'
        html.push(`<td style="${style.border};${cellPadding};text-align:${align};">${applyInlineFormatting(cell)}</td>`)
      })
      html.push('</tr>')
    })
    html.push('</tbody>')
  }

  html.push('</table>')
  html.push('</div>')

  return html.join('')
}
