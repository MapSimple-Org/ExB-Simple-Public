/** @jsx jsx */
import { React, jsx, css } from 'jimu-core'
import type { ThemeProps } from 'jimu-ui'
import { withTheme } from 'jimu-theme'

export enum StatusType {
  None = '',
  Init = 'init',
  Loading = 'loading',
  Loaded = 'loaded',
  Warning = 'warning',
  Error = 'error',
}

export interface StatusIndicatorProps {
  className?: string
  statusType?: StatusType
  title?: string
}

/**
 * An animatable icon representing status
 */
export const StatusIndicator = withTheme((props: StatusIndicatorProps & ThemeProps) => {
  const { theme, className, title, statusType } = props
  const getStyle = () => css`
    &.ui-unit-status-indicator {
      display: flex;
      &.ui-unit-status-indicator_status-type-loading {
        &:before {
          @keyframes loading {
            0% {transform: rotate(0deg); };
            100% {transform: rotate(360deg)};
          }
          content: '';
          width: 1rem;
          height: 1rem;
          display: block;
          border: 1px solid ${theme?.ref.palette?.neutral?.[500]};
          border-radius: 50%;
          border-top: 1px solid ${theme?.sys.color?.primary?.main};
          box-sizing: border-box;
          animation: loading 2s infinite linear;
          margin-right: .25rem;
        }
      }
    }
  `
  return (
    statusType &&
      <div className={`${className ?? ''} ui-unit-status-indicator ui-unit-status-indicator_status-type-${statusType}`} title={title} css={getStyle()} />
  )
})
