import { React, type ImmutableArray, type ImmutableObject, hooks, type UseDataSource, Immutable } from 'jimu-core'
import { Alert, Checkbox, defaultMessages as jimuUIMessages, Label, Switch } from 'jimu-ui'
import { MapWidgetSelector, SettingRow } from 'jimu-ui/advanced/setting-components'
import type { SettingChangeFunction } from 'jimu-for-builder'
import type { JimuMapView } from 'jimu-arcgis'
import type { IMConfig, MapViewConfig, MapViewsConfig } from '../../config'
import TableMapLayers from './table-map-layers'
import defaultMessages from '../translations/default'

interface MapModeSettingProps {
  widgetId: string
  config: IMConfig
  useMapWidgetIds: ImmutableArray<string>
  mapEmpty: boolean
  jimuMapViews: JimuMapView[]
  activeMapView: JimuMapView
  useDataSources: ImmutableArray<UseDataSource>
  onSettingChange: SettingChangeFunction
  onPropertyChange: (name: string, value: any) => void
}

const MapModeSetting = (props: MapModeSettingProps) => {
  const { widgetId, config, useMapWidgetIds, mapEmpty, jimuMapViews, useDataSources, onSettingChange, onPropertyChange } = props
  const defaultMapViewsConfig = Immutable({}) as ImmutableObject<MapViewsConfig>
  const { mapViewsConfig = defaultMapViewsConfig, respectMapRange, enableMapExtentFilter, defaultExtentFilterEnabled } = config
  const hasMap = useMapWidgetIds?.length > 0
  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)

  const onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    const newConfig = config.set('mapViewsConfig', {})
    onSettingChange({
      id: widgetId,
      config: newConfig,
      useMapWidgetIds
    })
  }

  const handleMapViewConfigChange = React.useCallback((mapViewId: string, mapViewConfig: ImmutableObject<MapViewConfig>, useDs?: UseDataSource[]) => {
    onSettingChange({
      id: widgetId,
      config: config.setIn(['mapViewsConfig', mapViewId], mapViewConfig),
      useDataSources: useDs
    })
  }, [config, onSettingChange, widgetId])

  return <React.Fragment>
    <SettingRow>
      <MapWidgetSelector
        useMapWidgetIds={useMapWidgetIds}
        onSelect={onMapWidgetSelected}
      />
    </SettingRow>
    {hasMap && !mapEmpty &&
      <TableMapLayers
        widgetId={widgetId}
        config={config}
        useMapWidgetIds={useMapWidgetIds}
        mapEmpty={mapEmpty}
        mapViewsConfig={mapViewsConfig || defaultMapViewsConfig}
        jimuMapViews={jimuMapViews}
        useDataSources={useDataSources}
        onChange={handleMapViewConfigChange}
      />
    }
    {hasMap && mapEmpty &&
      <SettingRow>
        <Alert tabIndex={0} type='warning' className='warningMsg' open text={translate('noWebMapWebSceneTip')} />
      </SettingRow>
    }
    <SettingRow tag='label' label={translate('respectMapRangeLabel')}>
      <Switch
        className='can-x-switch'
        checked={respectMapRange}
        onChange={(evt) => { onPropertyChange('respectMapRange', evt.target.checked) }}
        aria-label={translate('respectMapRangeLabel')}
      />
    </SettingRow>
    <SettingRow tag='label' label={translate('enableMapExtentFilter')}>
      <Switch
        className='can-x-switch'
        checked={enableMapExtentFilter}
        onChange={evt => { onPropertyChange('enableMapExtentFilter', evt.target.checked) }}
        aria-label={translate('enableMapExtentFilter')}
      />
    </SettingRow>
    {enableMapExtentFilter &&
      <SettingRow>
        <Label className='d-flex align-items-center ml-2'>
          <Checkbox
            checked={defaultExtentFilterEnabled}
            className='mr-1'
            onChange={evt => { onPropertyChange('defaultExtentFilterEnabled', evt.target.checked) }}
          />
          {translate('defaultEnabled')}
        </Label>
      </SettingRow>
    }
  </React.Fragment>
}

export default MapModeSetting
