/** @jsx jsx */
import { jsx, React, hooks, appConfigUtils, getAppStore, DataSourceStatus, defaultMessages as jimuCoreDefaultMessage } from 'jimu-core'
import type { UseDataSource } from 'jimu-core'
import type { IMConfig } from '../../../config'
import { Alert, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'
import { useListRuntimeState } from '../../state'

const { useEffect, useState, Fragment } = React
interface Props {
  config: IMConfig
  useDataSources: UseDataSource[]
}
const EmptyAndNotReadyTipsElement = (props: Props) => {
  const nls = hooks.useTranslation(jimuUIDefaultMessages, jimuCoreDefaultMessage)
  const { records, dataSource, dsInfo, showLoading, hasDsLoadedRecord } = useListRuntimeState()

  const { config, useDataSources } = props

  const [widgetLabel, setWidgetLabel] = useState(null as string)

  useEffect(() => {
    const outputDsWidgetId = appConfigUtils?.getWidgetIdByOutputDataSource(useDataSources?.[0])
    const appConfig = getAppStore().getState()?.appConfig
    const widgetLabel = appConfig?.widgets?.[outputDsWidgetId]?.label
    setWidgetLabel(widgetLabel)
  }, [useDataSources])

  const outputDataIsNotGenerated = (dsInfo?.status === DataSourceStatus.NotReady && dataSource)
  return (
    <Fragment>
      {(!showLoading && (!records || records.length < 1) && (hasDsLoadedRecord || outputDataIsNotGenerated)) && (
        <div className='empty-con text-center'>
          <WarningOutlined size={16}/>
          <div className="discribtion">{config?.noDataMessage || nls('noData')}</div>
        </div>
      )}
      {outputDataIsNotGenerated && <div className='placeholder-alert-con'>
        <Alert
          form='tooltip'
          size='small'
          type='warning'
          text={nls('outputDataIsNotGenerated', { outputDsLabel: dataSource?.getLabel(), sourceWidgetName: widgetLabel })}
        />
      </div>
      }
    </Fragment>
  )
}
export default EmptyAndNotReadyTipsElement