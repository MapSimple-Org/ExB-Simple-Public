/** @jsx jsx */
import { React, jsx, css, polished, hooks } from 'jimu-core'
import { defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import { ClickOutlined } from 'jimu-icons/outlined/application/click'
import defaultMessages from '../translations/default'
const UtilityPlaceholder = () => {
  const nls = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage)

  const STYLE = css`
    & {
      & {
        color: var(--ref-palette-neutral-800);
      }
      p {
        color: var(--ref-palette-neutral-1000);
        font-size: ${polished.rem(14)};
        margin: ${polished.rem(16)} auto 0;
        line-height: ${polished.rem(19)};
        width: ${polished.rem(228)};
      }
    }
  `
  return (
    <div className='w-100 mt-4 text-center utility-placeholder' css={STYLE}>
      <div className="text-center w-100">
        <ClickOutlined size={48}/>
        <p className='text-Secondary' id='list-empty-tip' aria-label={nls('utilityPlaceholder')} title={nls('utilityPlaceholder')}>
          {nls('utilityPlaceholder')}
        </p>
      </div>
    </div>
  )
}

export default UtilityPlaceholder
