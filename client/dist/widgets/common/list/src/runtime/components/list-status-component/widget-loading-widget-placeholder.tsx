/** @jsx jsx */
import { jsx, React, hooks, defaultMessages as jimuCoreDefaultMessages} from 'jimu-core'
import type { ImmutableArray, UseDataSource } from 'jimu-core'
import { WidgetPlaceholder, Alert } from 'jimu-ui'
import { useListRuntimeState, useListRuntimeDispatch } from '../../state'
import widgetPrintOutlined from 'jimu-icons/svg/outlined/brand/widget-list.svg'
import defaultMessages from '../../translations/default'
const { useEffect } = React
interface Props {
  id: string
  useDataSources: ImmutableArray<UseDataSource>
  createDataSourceFailed: boolean
}
const WidgetLoadingAndWidgetPlaceholder = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessages, jimuCoreDefaultMessages)
  const listRuntimeDispatch = useListRuntimeDispatch()

  const { useDataSources, createDataSourceFailed } = props
  const { dataSource, showWidgetLoading } = useListRuntimeState()

  useEffect(() => {
    checkIsShowLoading(dataSource, useDataSources, createDataSourceFailed)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource, useDataSources, createDataSourceFailed])

  const checkIsShowLoading = (dataSource, useDataSources, createDataSourceFailed) => {
    if (!useDataSources || useDataSources?.length === 0) {
      listRuntimeDispatch({type: 'SET_SHOW_WIDGET_LOADING', value: false})
    } else {
      if (dataSource && !createDataSourceFailed) {
        listRuntimeDispatch({type: 'SET_SHOW_WIDGET_LOADING', value: false})
      }
    }
  }

  return (
    <React.Fragment>
      {
        (showWidgetLoading && !createDataSourceFailed) && (<div className='list-loading-con w-100 h-100'>
          <div className='jimu-secondary-loading'></div>
        </div>)
      }
      {
        createDataSourceFailed && <div className='list-error-con position-relative w-100 h-100'>
          <WidgetPlaceholder icon={widgetPrintOutlined} name={nls('_widgetLabel')} message={''} />
          <Alert
            className='position-absolute alert-panel-of-list'
            type='warning'
            withIcon
            text={nls('dataSourceCreateError')}
          />
        </div>
      }
    </React.Fragment>
  )
}
export default WidgetLoadingAndWidgetPlaceholder