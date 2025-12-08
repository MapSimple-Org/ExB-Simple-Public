/** @jsx jsx */
import {
  React,
  jsx,
  css,
  polished,
  hooks
} from 'jimu-core'
import defaultMessages from '../translations/default'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'

const STYLE = css`
  &.warning-info {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    .warning-icon {
      color: var(--sys-color-warning-dark);
      width: ${polished.rem(22)};
      height: ${polished.rem(22)};
      margin-bottom: ${polished.rem(10)};
    }
    .warning-text {
      font-size: ${polished.rem(13)};
      line-height: ${polished.rem(18)};
    }
  }
`

export function WebScenePanel () {
  const translate = hooks.useTranslation(defaultMessages)
  return (
    <div className='w-100 d-flex flex-column align-items-center warning-info' css={STYLE}>
      <WarningOutlined className='warning-icon'/>
      <div className='warning-text'>{translate('webSceneNotSupported')}</div>
    </div>
  )
}
