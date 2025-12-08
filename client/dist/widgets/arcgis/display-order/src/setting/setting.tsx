/** @jsx jsx */
import { React, jsx, hooks } from 'jimu-core'
import { defaultMessages as jimuUIMessages, Alert } from 'jimu-ui'
import { MapWidgetSelector, SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import type { AllWidgetSettingProps } from 'jimu-for-builder'

import { isMapWidgetDataSourceEmpty, getJimuMapViewId } from '../utils'
import type { IMConfig } from '../config'

import CustomizeLayerPopper from './components/customize-layer-popper'
import MultipleMapConfig from './components/multiple-map-config'
import Placeholder from './components/placeholder'

import defaultMessages from './translations/default'

export type WidgetSettingProps = AllWidgetSettingProps<IMConfig>

const Setting = (props: WidgetSettingProps): React.ReactElement => {
  const {
    id,
    useMapWidgetIds,
    onSettingChange
  } = props

  const [dataSourceId, setDataSourceId] = React.useState('')

  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)

  const onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    onSettingChange({ id, useMapWidgetIds })
  }

  const onDataSourceClick = (dataSourceId: string) => {
    setDataSourceId(dataSourceId)
  }

  const hasMapWidgetSelected = useMapWidgetIds?.length > 0
  const mapWidgetId = useMapWidgetIds?.[0] ?? ''
  const isEmptyDataSource = isMapWidgetDataSourceEmpty(mapWidgetId)
  const jimuMapViewId = getJimuMapViewId(mapWidgetId, dataSourceId)

  return (
    <SettingSection className='h-100' title={translate('selectMapWidget')}>
        <SettingRow className='w-100' aria-label={translate('selectMapWidget')}>
            <MapWidgetSelector
                onSelect={onMapWidgetSelected}
                useMapWidgetIds={useMapWidgetIds}
            />
        </SettingRow>
        {hasMapWidgetSelected ? (
            <SettingRow className='w-100 mt-4' aria-label={translate('selectLayers')}>
                {isEmptyDataSource
                  ? (
                        <Alert
                            type='warning'
                            text={translate('noDataSourceWarning')}
                            closable={false}
                            withIcon={false}
                            aria-label={translate('noDataSourceWarning')}
                        />
                    )
                  : (
                        <MultipleMapConfig
                            mapWidgetId={useMapWidgetIds?.[0]}
                            sidePopperContent={
                                <CustomizeLayerPopper
                                    jimuMapViewId={jimuMapViewId}
                                    dataSourceId={dataSourceId}
                                    settingProps={props}
                                />
                            }
                            onClick={onDataSourceClick}
                            aria-label={translate('selectLayers')}
                        />
                    )}
            </SettingRow>
        ) : (
          <Placeholder
            text={translate('selectMapHint')}
            style={{ height: 'calc(100% - 6rem' }}
          />
        )}
    </SettingSection>
  )
}

export default Setting
