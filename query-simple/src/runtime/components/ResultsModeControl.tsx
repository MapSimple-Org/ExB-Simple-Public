/** @jsx jsx */
// ResultsModeControl — shared segmented control for New/Add/Remove results mode (r025.008)
import { React, css, jsx } from 'jimu-core'
import { Button } from 'jimu-ui'

// ─── Types ──────────────────────────────────────────────────────────

export type ResultsModeValue = 'new' | 'add' | 'remove'

interface ResultsModeControlProps {
  value: ResultsModeValue
  onChange: (mode: ResultsModeValue) => void
  removeDisabled?: boolean
  getI18nMessage: (id: string) => string
}

// ─── Color Config ───────────────────────────────────────────────────

const MODE_COLORS = {
  new: { active: '#3b82f6', hover: '#2563eb', border: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)', text: '#1e40af' },
  add: { active: '#059669', hover: '#047857', border: '#059669', bg: 'rgba(5, 150, 105, 0.15)', text: '#065f46' },
  remove: { active: '#be123c', hover: '#9f1239', border: '#be123c', bg: 'rgba(225, 29, 72, 0.15)', text: '#9f1239' }
} as const

const MODE_ICONS: Record<ResultsModeValue, { char: string; size: string }> = {
  new: { char: '★', size: '0.6rem' },
  add: { char: '+', size: '0.7rem' },
  remove: { char: '\u2212', size: '0.7rem' }
}

const MODE_I18N: Record<ResultsModeValue, { label: string; title: string; logic: string }> = {
  new: { label: 'resultsModeNew', title: 'createNewResults', logic: 'resultsModeLogicNew' },
  add: { label: 'resultsModeAdd', title: 'addToCurrentResults', logic: 'resultsModeLogicAdd' },
  remove: { label: 'resultsModeRemove', title: 'removeFromCurrentResults', logic: 'resultsModeLogicRemove' }
}

// ─── Styles ─────────────────────────────────────────────────────────

const groupStyle = css`
  display: flex;
  align-items: stretch;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 2px;
  gap: 2px;
`

const buttonBase = css`
  flex: 1;
  font-size: 0.8125rem;
  font-weight: 600;
  padding: 2px 10px;
  min-height: 26px;
  white-space: nowrap;
  overflow: hidden;
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 3px;
  border: none !important;
  border-radius: 3px !important;
  transition: all 0.15s ease;
  cursor: pointer;
`

const summaryBarBase = css`
  margin-top: 4px;
  padding: 3px 8px;
  border-radius: 3px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  line-height: 1.3;
  transition: all 0.15s ease;
`

// ─── Component ──────────────────────────────────────────────────────

export function ResultsModeControl ({ value, onChange, removeDisabled, getI18nMessage }: ResultsModeControlProps): JSX.Element {
  const modes: ResultsModeValue[] = ['new', 'add', 'remove']
  const colors = MODE_COLORS[value]

  return (
    <React.Fragment>
      <div css={groupStyle} role='radiogroup' aria-label={getI18nMessage('resultsMode')}>
        {modes.map((mode) => {
          const isActive = value === mode
          const mc = MODE_COLORS[mode]
          const icon = MODE_ICONS[mode]
          const i18n = MODE_I18N[mode]
          const isDisabled = mode === 'remove' && removeDisabled

          return (
            <Button
              key={mode}
              size='sm'
              disabled={isDisabled}
              onClick={() => onChange(mode)}
              aria-pressed={isActive}
              title={getI18nMessage(i18n.title)}
              css={css`
                ${buttonBase};
                background: ${isActive ? mc.active : 'transparent'} !important;
                color: ${isActive ? '#fff' : '#64748b'} !important;
                box-shadow: ${isActive ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'} !important;
                &:hover:not(:disabled) {
                  background: ${isActive ? mc.hover : '#e2e8f0'} !important;
                }
                &:disabled {
                  opacity: 0.4;
                  cursor: not-allowed;
                }
              `}
            >
              <span css={css`font-size: ${icon.size};`}>{icon.char}</span>
              {getI18nMessage(i18n.label)}
            </Button>
          )
        })}
      </div>

      {/* Logic summary bar */}
      <div css={css`
        ${summaryBarBase};
        border-left: 2px solid ${colors.border};
        background: ${colors.bg};
        color: ${colors.text};
      `}>
        <span css={css`font-weight: 500; letter-spacing: -0.01em; opacity: 0.8;`}>
          {getI18nMessage(MODE_I18N[value].logic)}
        </span>
      </div>
    </React.Fragment>
  )
}
