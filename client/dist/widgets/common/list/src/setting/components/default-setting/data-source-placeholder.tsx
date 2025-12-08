/** @jsx jsx */
import { jsx, hooks, ReactRedux, classNames, css } from 'jimu-core'
import type { DataSource } from 'jimu-core'
import { defaultMessages as jimuLayoutsDefaultMessages } from 'jimu-layouts/layout-runtime'
import { defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import defaultMessages from '../../translations/default'
import { Fragment } from 'react'
import { ClickOutlined } from 'jimu-icons/outlined/application/click'

interface Props {
  datasource: DataSource
}

const STYLE = css`
  &.datasource-placeholder-a11y-setting {
    height: calc(100vh - 550px);
    overflow: hidden;
  }
`

const DataSourcePlaceholder = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessages, jimuUIDefaultMessages, jimuLayoutsDefaultMessages)
  const enableA11yForWidgetSettings = ReactRedux.useSelector((state: any) => state.appStateInBuilder?.appConfig?.attributes?.enableA11yForWidgetSettings)
  const { datasource } = props
  return (
    <Fragment>
      {!datasource && <div
        css={STYLE}
        className={classNames('w-100 text-center datasource-placeholder flex-grow-1 d-flex flex-column justify-content-center align-items-center', { 'datasource-placeholder-a11y-setting': enableA11yForWidgetSettings })}
      >
        <div className="w-100">
          <ClickOutlined size={48}/>
          <p className='text-Secondary' id='list-empty-tip'>
            {nls('listBlankStatus', {
              ButtonString: nls('setDataSource')
            })}
          </p>
        </div>
      </div>}
    </Fragment>
  )
}
export default DataSourcePlaceholder