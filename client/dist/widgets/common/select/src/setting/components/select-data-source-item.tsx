import { React, hooks, uuidv1, type UseDataSource } from 'jimu-core'
import defaultMessages from '../translations/default'
import { defaultMessages as jimuUIMessages } from 'jimu-ui'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import type { DataSourceItem } from '../../config'
import { type RootSettingProps, getUseDataSourcesByConfig, checkIsValidNewUseDataSourceForDataAttributeInfo } from '../utils'
import { IM_SUPPORTED_DATA_SOURCE_TYPES } from '../../utils'

export interface SelectDataSourceItemProps {
  rootSettingProps: RootSettingProps
  onSelectNewDataSourceItem: (dataSourceItemUid: string) => void
}

export default function SelectDataSourceItem (props: SelectDataSourceItemProps): React.ReactElement {
  const rootSettingProps = props.rootSettingProps

  const {
    id: widgetId,
    config
  } = rootSettingProps

  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)

  // select new data source
  const onDataSourceChange = React.useCallback((evtUseDataSources: UseDataSource[]) => {
    const selectedUseDataSource = evtUseDataSources && evtUseDataSources[0]

    if (!selectedUseDataSource) {
      return
    }

    const isValidNewUseDataSource = checkIsValidNewUseDataSourceForDataAttributeInfo(config.dataAttributeInfo.dataSourceItems, selectedUseDataSource)

    if (!isValidNewUseDataSource) {
      return
    }

    const uid = uuidv1()
    const newDataSourceItem: DataSourceItem = {
      uid,
      sqlHint: '',
      useDataSource: selectedUseDataSource
    }

    const newDataSourceItems = config.dataAttributeInfo.dataSourceItems.concat(newDataSourceItem)
    const newConfig = config.setIn(['dataAttributeInfo', 'dataSourceItems'], newDataSourceItems)
    const useDataSources = getUseDataSourcesByConfig(newConfig)

    rootSettingProps.onSettingChange({
      id: widgetId,
      config: newConfig,
      useDataSources
    })

    props.onSelectNewDataSourceItem(uid)
  }, [config, props, rootSettingProps, widgetId])

  return (
    <SettingSection title={translate('sourceLabel')}>
      <SettingRow aria-label={translate('sourceLabel')} role='group'>
        <DataSourceSelector
          widgetId={widgetId}
          isMultiple={false}
          mustUseDataSource
          types={IM_SUPPORTED_DATA_SOURCE_TYPES}
          hideDataView={true}
          hideCreateViewButton={true}
          onChange={onDataSourceChange}
        />
      </SettingRow>
    </SettingSection>
  )
}
