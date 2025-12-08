/** @jsx jsx */
import { jsx, css, hooks } from 'jimu-core'
import defaultMessages from '.././translations/default'
import { EmptyOutlined } from 'jimu-icons/outlined/application/empty'

export interface EmptyLayerMessageProps {
  swipeLayerMode: boolean
}

const style = css`
  .no-layer-placeholder-text, .no-layer-placeholder-icon{
    display: table;
    margin: 0 auto;
  }
  .no-layer-placeholder-text {
    color: var(--sys-color-surface-paper-hint);
    font-size: 13px;
    margin-top: 16px;
    text-align: center;
  }
  .no-layer-placeholder-icon {
    color: var(--sys-color-surface-overlay-hint);
  }
`

export const EmptyLayerMessage = (props: EmptyLayerMessageProps) => {
  const { swipeLayerMode } = props
  const translate = hooks.useTranslation(defaultMessages)
  return (
    <div css={style} className='no-layer-placeholder w-100'>
      <div className='no-layer-placeholder-icon'>
        <EmptyOutlined size={32} color='var(--sys-color-surface-paper-hint)' />
      </div>
      <div className='no-layer-placeholder-text'>
      <span>{swipeLayerMode ? translate('noConfiguredLayerText') : translate('noValidLayerText')}</span>
      </div>
    </div>
  )
}

