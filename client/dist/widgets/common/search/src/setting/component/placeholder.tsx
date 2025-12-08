/** @jsx jsx */
import { React, jsx, css, polished, hooks, ReactRedux, classNames } from 'jimu-core'
import { defaultMessages as jimuiDefaultMessage } from 'jimu-ui'
import { ClickOutlined } from 'jimu-icons/outlined/application/click'
import defaultMessages from '../translations/default'
const Placeholder = () => {
  const nls = hooks.useTranslation(defaultMessages, jimuiDefaultMessage)
  const enableA11yForWidgetSettings = ReactRedux.useSelector((state: any) => state.appStateInBuilder?.appConfig?.attributes?.enableA11yForWidgetSettings)

  const STYLE = css`
    & {
      & {
        color: var(--ref-palette-neutral-800);
      }
      &.search-placeholder-con {
        height: calc(100vh - 550px);
        overflow: hidden;
        display: flex;
        align-items: center;
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
    <div className={classNames('w-100 mt-4 text-center utility-placeholder', { 'search-placeholder-con': enableA11yForWidgetSettings })} css={STYLE}>
      <div className="text-center w-100">
        <ClickOutlined size={48}/>
        <p className='text-Secondary' id='list-empty-tip' title={nls('searchPlaceholder')}>
          {nls('searchPlaceholder')}
        </p>
      </div>
    </div>
  )
}

export default Placeholder
