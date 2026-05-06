/** @jsx jsx */
/**
 * r026.014 / r004.002: Table Builder — inline grid editor for markdown tables.
 *
 * Generates pipe-delimited markdown table syntax:
 *   | Header 1 | Header 2 |
 *   | --- | --- |
 *   | Cell 1 | Cell 2 |
 *
 * Used by QS settings (results.tsx) and FS settings (setting.tsx).
 * Pure UI component — no ExB dependencies beyond jimu-core for React/css.
 */
import { React, jsx, css } from 'jimu-core'

/**
 * State that can be passed to pre-populate the builder for edit mode.
 */
export interface TableBuilderState {
  headers: string[]
  cells: string[][]
  cols: number
  rows: number
  includeHeader: boolean
  tableStyle: 'striped' | 'plain' | 'bordered'
  stripeColor?: string
}

export interface TableBuilderProps {
  /** Called with the generated markdown table string when user clicks Insert/Update */
  onInsert: (markdown: string) => void
  /** Called when user cancels the builder */
  onCancel: () => void
  /** r027.015: Pre-populate builder with existing table data (edit mode) */
  initialState?: TableBuilderState
}

// ── Table reverse-parser ────────────────────────────────────────

/** Separator row regex: | --- | :---: | ---: | etc. */
const SEPARATOR_RE = /^\|[\s:|-]+\|$/

/** Style hint comment: <!-- table:plain --> or <!-- table:striped:#aabbcc --> */
const STYLE_HINT_RE = /^<!--\s*table:(\w+)(?::(#[0-9a-fA-F]{6}))?\s*-->$/

/**
 * r027.015: Reverse-parse a pipe-delimited markdown table back into TableBuilder state.
 * Returns null if the text doesn't contain a valid table.
 */
export function parseMarkdownToTableState (tableMarkdown: string): TableBuilderState | null {
  const lines = tableMarkdown.trim().split('\n').map(l => l.trim()).filter(l => l.length > 0)
  if (lines.length < 2) return null // Need at least separator + 1 data row

  let styleIdx = 0
  let tableStyle: 'striped' | 'plain' | 'bordered' = 'striped'
  let stripeColor: string | undefined

  // Check for style hint comment
  const styleMatch = STYLE_HINT_RE.exec(lines[0])
  if (styleMatch) {
    const s = styleMatch[1]
    if (s === 'plain' || s === 'bordered' || s === 'striped') tableStyle = s
    if (styleMatch[2]) stripeColor = styleMatch[2]
    styleIdx = 1
  }

  // Find the separator row
  let separatorIdx = -1
  for (let i = styleIdx; i < lines.length; i++) {
    if (SEPARATOR_RE.test(lines[i])) {
      separatorIdx = i
      break
    }
  }
  if (separatorIdx === -1) return null

  // Parse cells from a pipe-delimited line
  const parseCells = (line: string): string[] => {
    // Remove leading/trailing pipes, split by |, trim each cell
    return line.replace(/^\|/, '').replace(/\|$/, '').split('|').map(c => c.trim())
  }

  // Determine if there's a header row (line between style hint and separator)
  const hasHeader = separatorIdx > styleIdx
  let headers: string[] = []
  if (hasHeader) {
    headers = parseCells(lines[styleIdx])
  }

  // Data rows come after the separator
  const dataLines = lines.slice(separatorIdx + 1)
  const cells = dataLines.map(line => parseCells(line))

  // Determine column count from separator
  const cols = parseCells(lines[separatorIdx]).length

  // Normalize: pad headers/cells to match col count
  if (hasHeader) {
    while (headers.length < cols) headers.push('')
    headers = headers.slice(0, cols)
  } else {
    headers = Array.from({ length: cols }, (_, i) => `Header ${i + 1}`)
  }

  const normalizedCells = cells.map(row => {
    const padded = [...row]
    while (padded.length < cols) padded.push('')
    return padded.slice(0, cols)
  })

  if (normalizedCells.length === 0) return null

  return {
    headers,
    cells: normalizedCells,
    cols,
    rows: normalizedCells.length,
    includeHeader: hasHeader,
    tableStyle,
    stripeColor
  }
}

/**
 * r027.015: Find the table block surrounding the cursor position in a template string.
 * Returns the start/end character indices and the table text, or null if cursor isn't in a table.
 */
export function findTableBlockAtCursor (text: string, cursorPos: number): { start: number, end: number, tableText: string } | null {
  const lines = text.split('\n')
  let charOffset = 0
  let cursorLineIdx = -1

  // Find which line the cursor is on
  for (let i = 0; i < lines.length; i++) {
    const lineEnd = charOffset + lines[i].length
    if (cursorPos >= charOffset && cursorPos <= lineEnd) {
      cursorLineIdx = i
      break
    }
    charOffset += lines[i].length + 1 // +1 for \n
  }
  if (cursorLineIdx === -1) return null

  // Check if cursor line looks like part of a table (starts with |, or is a style hint/separator)
  const isTableLine = (line: string): boolean => {
    const trimmed = line.trim()
    return trimmed.startsWith('|') || STYLE_HINT_RE.test(trimmed)
  }

  if (!isTableLine(lines[cursorLineIdx])) return null

  // Walk backward to find table start
  let startLine = cursorLineIdx
  while (startLine > 0 && isTableLine(lines[startLine - 1])) {
    startLine--
  }

  // Walk forward to find table end
  let endLine = cursorLineIdx
  while (endLine < lines.length - 1 && isTableLine(lines[endLine + 1])) {
    endLine++
  }

  // Validate: the block must contain a separator row
  const blockLines = lines.slice(startLine, endLine + 1)
  const hasSeparator = blockLines.some(l => SEPARATOR_RE.test(l.trim()))
  if (!hasSeparator) return null

  // Calculate character offsets
  let startChar = 0
  for (let i = 0; i < startLine; i++) startChar += lines[i].length + 1
  let endChar = startChar
  for (let i = startLine; i <= endLine; i++) endChar += lines[i].length + (i < endLine ? 1 : 0)

  return {
    start: startChar,
    end: endChar,
    tableText: blockLines.join('\n')
  }
}

// ── Constraints ──────────────────────────────────────────────────
const MIN_COLS = 2
const MAX_COLS = 6
const MIN_ROWS = 1   // Data rows (header row is optional via toggle)
const MAX_ROWS = 10
const DEFAULT_COLS = 2
const DEFAULT_ROWS = 2
const DEFAULT_STRIPE_COLOR = '#e2e2e2'

// ── Styles ───────────────────────────────────────────────────────
const containerStyle = css`
  margin-top: 6px;
  padding: 10px;
  border: 1px solid var(--sys-color-divider-secondary, #e0e0e0);
  border-radius: 4px;
  background: var(--sys-color-surface-overlay, #f9f9f9);
  font-size: 12px;
`

const controlRowStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
`

const spinnerStyle = css`
  display: flex;
  align-items: center;
  gap: 4px;
  label {
    font-size: 11px;
    color: var(--sys-color-text-secondary, inherit);
  }
  input {
    width: 48px;
    padding: 2px 4px;
    border: 1px solid var(--sys-color-divider-secondary, #ccc);
    border-radius: 3px;
    text-align: center;
    font-size: 12px;
    background: var(--sys-color-surface-paper, #fff);
    color: var(--sys-color-text-primary, inherit);
  }
`

const gridStyle = css`
  display: grid;
  gap: 2px;
  margin-bottom: 8px;
`

const cellInputStyle = css`
  width: 100%;
  padding: 3px 6px;
  border: 1px solid var(--sys-color-divider-secondary, #ccc);
  border-radius: 2px;
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
  font-size: 11px;
  box-sizing: border-box;
  background: var(--sys-color-surface-paper, #fff);
  color: var(--sys-color-text-primary, inherit);

  &:focus {
    outline: 2px solid var(--sys-color-primary-main, #0079c1);
    outline-offset: -1px;
  }
`

const headerCellStyle = css`
  ${cellInputStyle};
  font-weight: 600;
  background: var(--ref-palette-neutral-200, #f0f0f0);
`

const buttonRowStyle = css`
  display: flex;
  gap: 6px;
  justify-content: flex-end;
`

const btnStyle = css`
  padding: 4px 12px;
  border-radius: 3px;
  font-size: 11px;
  cursor: pointer;
  border: 1px solid var(--sys-color-divider-secondary, #ccc);
  background: var(--ref-palette-neutral-100, #fff);
  color: var(--sys-color-text-primary, inherit);

  &:hover {
    background: var(--ref-palette-neutral-200, #f0f0f0);
  }
`

const insertBtnStyle = css`
  ${btnStyle};
  background: var(--sys-color-primary-main, #0079c1);
  color: #fff;
  border-color: var(--sys-color-primary-main, #0079c1);

  &:hover {
    background: var(--sys-color-primary-dark, #005e95);
  }
`

const headerLabelStyle = css`
  font-size: 10px;
  color: var(--sys-color-text-secondary, #666);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
`

// ── Component ────────────────────────────────────────────────────
export function TableBuilder (props: TableBuilderProps): React.ReactElement {
  const { onInsert, onCancel, initialState } = props
  const isEditMode = !!initialState

  const [cols, setCols] = React.useState(initialState?.cols ?? DEFAULT_COLS)
  const [rows, setRows] = React.useState(initialState?.rows ?? DEFAULT_ROWS)
  const [includeHeader, setIncludeHeader] = React.useState(initialState?.includeHeader ?? true)
  const [tableStyle, setTableStyle] = React.useState<'striped' | 'plain' | 'bordered'>(initialState?.tableStyle ?? 'striped')
  const [stripeColor, setStripeColor] = React.useState(initialState?.stripeColor ?? DEFAULT_STRIPE_COLOR)

  // Grid data: headers[col] and cells[row][col]
  const [headers, setHeaders] = React.useState<string[]>(() =>
    initialState?.headers ?? Array.from({ length: initialState?.cols ?? DEFAULT_COLS }, (_, i) => `Header ${i + 1}`)
  )
  const [cells, setCells] = React.useState<string[][]>(() =>
    initialState?.cells ?? Array.from({ length: initialState?.rows ?? DEFAULT_ROWS }, () =>
      Array.from({ length: initialState?.cols ?? DEFAULT_COLS }, () => '')
    )
  )

  // Resize grid when cols/rows change
  const handleColsChange = React.useCallback((newCols: number) => {
    const clamped = Math.max(MIN_COLS, Math.min(MAX_COLS, newCols))
    setCols(clamped)
    setHeaders(prev => {
      const next = Array.from({ length: clamped }, (_, i) => prev[i] ?? `Header ${i + 1}`)
      return next
    })
    setCells(prev => prev.map(row =>
      Array.from({ length: clamped }, (_, i) => row[i] ?? '')
    ))
  }, [])

  const handleRowsChange = React.useCallback((newRows: number) => {
    const clamped = Math.max(MIN_ROWS, Math.min(MAX_ROWS, newRows))
    setRows(clamped)
    setCells(prev => {
      const next = Array.from({ length: clamped }, (_, i) =>
        prev[i] ?? Array.from({ length: cols }, () => '')
      )
      return next
    })
  }, [cols])

  // Update a header cell
  const updateHeader = React.useCallback((colIdx: number, value: string) => {
    setHeaders(prev => {
      const next = [...prev]
      next[colIdx] = value
      return next
    })
  }, [])

  // Update a data cell
  const updateCell = React.useCallback((rowIdx: number, colIdx: number, value: string) => {
    setCells(prev => {
      const next = prev.map(r => [...r])
      next[rowIdx][colIdx] = value
      return next
    })
  }, [])

  // Generate markdown and call onInsert
  const handleInsert = React.useCallback(() => {
    const pad = (s: string) => ` ${s || ' '} `
    const separatorLine = `|${Array.from({ length: cols }, () => ' --- ').join('|')}|`
    const dataLines = cells.map(row => `|${row.map(pad).join('|')}|`)

    // Style hint comment — parser reads this to apply the visual style
    const parts: string[] = []
    const hasCustomColor = tableStyle === 'striped' && stripeColor && stripeColor !== DEFAULT_STRIPE_COLOR
    if (tableStyle !== 'striped' || hasCustomColor) {
      // Emit hint for non-default style OR custom stripe color
      const colorSuffix = hasCustomColor ? `:${stripeColor}` : ''
      parts.push(`<!-- table:${tableStyle}${colorSuffix} -->`)
    }

    if (includeHeader) {
      parts.push(`|${headers.map(pad).join('|')}|`)
    }
    parts.push(separatorLine)
    parts.push(...dataLines)

    onInsert(parts.join('\n'))
  }, [headers, cells, cols, includeHeader, tableStyle, stripeColor, onInsert])

  return (
    <div css={containerStyle}>
      {/* Column/Row controls */}
      <div css={controlRowStyle}>
        <div css={spinnerStyle}>
          <label htmlFor='table-cols'>Columns:</label>
          <input
            id='table-cols'
            type='number'
            min={MIN_COLS}
            max={MAX_COLS}
            value={cols}
            onChange={(e) => handleColsChange(parseInt(e.target.value, 10) || DEFAULT_COLS)}
          />
        </div>
        <div css={spinnerStyle}>
          <label htmlFor='table-rows'>Data rows:</label>
          <input
            id='table-rows'
            type='number'
            min={MIN_ROWS}
            max={MAX_ROWS}
            value={rows}
            onChange={(e) => handleRowsChange(parseInt(e.target.value, 10) || DEFAULT_ROWS)}
          />
        </div>
        <label css={css`
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: var(--sys-color-text-secondary, inherit);
          cursor: pointer;
          user-select: none;
        `}>
          <input
            type='checkbox'
            checked={includeHeader}
            onChange={(e) => setIncludeHeader(e.target.checked)}
          />
          Include header
        </label>
        <div css={spinnerStyle}>
          <label htmlFor='table-style'>Style:</label>
          <select
            id='table-style'
            value={tableStyle}
            onChange={(e) => setTableStyle(e.target.value as 'striped' | 'plain' | 'bordered')}
            css={css`
              padding: 2px 4px;
              border: 1px solid var(--sys-color-divider-secondary, #ccc);
              border-radius: 3px;
              font-size: 12px;
              background: var(--sys-color-surface-paper, #fff);
              color: var(--sys-color-text-primary, inherit);
            `}
          >
            <option value='striped'>Striped</option>
            <option value='plain'>Plain</option>
            <option value='bordered'>Bordered</option>
          </select>
        </div>
        {tableStyle === 'striped' && (
          <div css={spinnerStyle}>
            <label htmlFor='stripe-color'>Dark row:</label>
            <input
              id='stripe-color'
              type='color'
              value={stripeColor}
              onChange={(e) => setStripeColor(e.target.value)}
              css={css`
                width: 28px;
                height: 24px;
                padding: 1px;
                border: 1px solid var(--sys-color-divider-secondary, #ccc);
                border-radius: 3px;
                background: var(--sys-color-surface-paper, #fff);
                cursor: pointer;
              `}
              title={`Dark row color: ${stripeColor}`}
            />
            {stripeColor !== DEFAULT_STRIPE_COLOR && (
              <button
                type='button'
                onClick={() => setStripeColor(DEFAULT_STRIPE_COLOR)}
                css={css`
                  padding: 1px 5px;
                  border: 1px solid var(--sys-color-divider-secondary, #ccc);
                  border-radius: 3px;
                  background: var(--sys-color-surface-paper, #fff);
                  color: var(--sys-color-text-secondary, #666);
                  font-size: 10px;
                  cursor: pointer;
                  line-height: 1.4;
                  &:hover {
                    background: var(--sys-color-surface-background, #f5f5f5);
                  }
                `}
                title='Reset to default stripe color'
              >
                Reset
              </button>
            )}
          </div>
        )}
      </div>

      {/* Header row (shown only when includeHeader is true) */}
      {includeHeader && (
        <React.Fragment>
          <div css={headerLabelStyle}>Header row</div>
          <div css={gridStyle} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
            {headers.map((val, colIdx) => (
              <input
                key={`h-${colIdx}`}
                type='text'
                css={headerCellStyle}
                value={val}
                onChange={(e) => updateHeader(colIdx, e.target.value)}
                placeholder={`Header ${colIdx + 1}`}
                aria-label={`Header column ${colIdx + 1}`}
              />
            ))}
          </div>
        </React.Fragment>
      )}

      {/* Data rows */}
      <div css={headerLabelStyle}>Data rows</div>
      <div css={gridStyle} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {cells.map((row, rowIdx) =>
          row.map((val, colIdx) => (
            <input
              key={`c-${rowIdx}-${colIdx}`}
              type='text'
              css={cellInputStyle}
              value={val}
              onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
              placeholder={`Row ${rowIdx + 1}`}
              aria-label={`Row ${rowIdx + 1}, column ${colIdx + 1}`}
            />
          ))
        )}
      </div>

      {/* Action buttons */}
      <div css={buttonRowStyle}>
        <button type='button' css={btnStyle} onClick={onCancel}>
          Cancel
        </button>
        <button type='button' css={insertBtnStyle} onClick={handleInsert}>
          {isEditMode ? 'Update Table' : 'Insert Table'}
        </button>
      </div>
    </div>
  )
}
