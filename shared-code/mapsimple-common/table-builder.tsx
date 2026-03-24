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

export interface TableBuilderProps {
  /** Called with the generated markdown table string when user clicks Insert */
  onInsert: (markdown: string) => void
  /** Called when user cancels the builder */
  onCancel: () => void
}

// ── Constraints ──────────────────────────────────────────────────
const MIN_COLS = 2
const MAX_COLS = 6
const MIN_ROWS = 1   // Data rows (header row is optional via toggle)
const MAX_ROWS = 10
const DEFAULT_COLS = 2
const DEFAULT_ROWS = 2

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
  const { onInsert, onCancel } = props

  const [cols, setCols] = React.useState(DEFAULT_COLS)
  const [rows, setRows] = React.useState(DEFAULT_ROWS)
  const [includeHeader, setIncludeHeader] = React.useState(true)
  const [tableStyle, setTableStyle] = React.useState<'striped' | 'plain' | 'bordered'>('striped')

  // Grid data: headers[col] and cells[row][col]
  const [headers, setHeaders] = React.useState<string[]>(() =>
    Array.from({ length: DEFAULT_COLS }, (_, i) => `Header ${i + 1}`)
  )
  const [cells, setCells] = React.useState<string[][]>(() =>
    Array.from({ length: DEFAULT_ROWS }, () =>
      Array.from({ length: DEFAULT_COLS }, () => '')
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
    if (tableStyle !== 'striped') {
      // Only emit hint for non-default styles (striped is the default)
      parts.push(`<!-- table:${tableStyle} -->`)
    }

    if (includeHeader) {
      parts.push(`|${headers.map(pad).join('|')}|`)
    }
    parts.push(separatorLine)
    parts.push(...dataLines)

    onInsert(parts.join('\n'))
  }, [headers, cells, cols, includeHeader, tableStyle, onInsert])

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
          Insert Table
        </button>
      </div>
    </div>
  )
}
