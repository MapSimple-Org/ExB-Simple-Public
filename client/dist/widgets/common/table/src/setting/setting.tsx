import { React, hooks, Immutable } from 'jimu-core'
import { defaultMessages as jimuUIMessages, Radio, Label, ConfirmDialog } from 'jimu-ui'
import { SettingSection } from 'jimu-ui/advanced/setting-components'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { type IMConfig, TableModeType } from '../config'
import defaultMessages from './translations/default'
import LayerModeSetting from './components/layer-mode-setting'
import MapModeSetting from './components/map-mode-setting'
import ArrangementStyle from './components/arrangement-style'
import GeneralSettings from './components/general-settings'
import EmptyPlaceholder from './components/empty-placeholder'

export interface JimuMapViews {
  [viewId: string]: JimuMapView
}

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
  const { id: widgetId, config, useDataSources, useMapWidgetIds, onSettingChange } = props
  const { tableMode, layersConfig = Immutable([]), mapViewsConfig = Immutable({}) } = config
  const [changeModeConfirmOpen, setChangeModeConfirmOpen] = React.useState(false)
  const [mapEmpty, setMapEmpty] = React.useState(false)
  const [jimuMapViews, setJimuMapViews] = React.useState<JimuMapView[]>([])
  const [activeMapView, setActiveMapView] = React.useState<JimuMapView>()
  const toBeChangeMode = React.useRef<TableModeType>(null)

  const isExpressBuilder = window.isExpressBuilder
  const isMapMode = tableMode === TableModeType.Map
  const isLayerMode = tableMode === TableModeType.Layer
  const hasMap = useMapWidgetIds?.length > 0
  const hasConfig = (isLayerMode && layersConfig.length > 0) || (isMapMode && mapViewsConfig && Object.keys(mapViewsConfig).length > 0)
  const layerModeEmptyConfig = isLayerMode && !hasConfig && !isExpressBuilder
  const mapModeEmptyConfig = isMapMode && !hasMap && !isExpressBuilder
  const showGeneralSetting = (isMapMode && !mapModeEmptyConfig) || (isLayerMode && !layerModeEmptyConfig)

  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const onPropertyChange = React.useCallback((name: string, value: any) => {
    if (value === config[name]) {
      return
    }
    const newConfig = config.set(name, value)
    const alterProps = {
      id: widgetId,
      config: newConfig
    }
    onSettingChange(alterProps)
  }, [config, onSettingChange, widgetId])

  const handleChangeModeOk = React.useCallback(() => {
    const toBeIsMapMode = toBeChangeMode.current === TableModeType.Map
    onSettingChange({
      id: widgetId,
      config: config.set('tableMode', toBeChangeMode.current).set('layersConfig', []).set('mapViewsConfig', {})
        .set('enableMapExtentFilter', toBeIsMapMode).set('defaultExtentFilterEnabled', false)
        .set('enableHighlightOnHover', false),
      ...(toBeIsMapMode ? {} : { useMapWidgetIds: [] }),
      useDataSources: toBeIsMapMode ? undefined : []
    })
    toBeChangeMode.current = null
    setChangeModeConfirmOpen(false)
  }, [config, onSettingChange, widgetId])

  const handleChangeModeClose = () => {
    setChangeModeConfirmOpen(false)
  }

  const onTableModeChange = React.useCallback((mode: TableModeType) => {
    if (tableMode === mode) return
    toBeChangeMode.current = mode
    if (hasConfig) {
      setChangeModeConfirmOpen(true)
    } else {
      handleChangeModeOk()
    }
  }, [tableMode, handleChangeModeOk, hasConfig])

  const onViewsCreate = React.useCallback((views: { [viewId: string]: JimuMapView }) => {
    setJimuMapViews([])
    const viewArr = Object.values(views)
    if (Object.keys(viewArr).length === 1 && !Object.values(viewArr)[0].dataSourceId) {
      setMapEmpty(true)
    } else {
      setMapEmpty(false)
    }
    const promises = Object.values(views).map(async (jimuMapView) => {
      await jimuMapView.whenJimuMapViewLoaded()
      await jimuMapView.whenAllJimuLayerViewLoaded()
    })
    Promise.allSettled(promises).then(() => {
      setJimuMapViews(viewArr)
    })
  }, [setMapEmpty])

  const onActiveViewChange = (jimuMapView: JimuMapView) => {
    setActiveMapView(jimuMapView)
  }

  return (
    <div className='jimu-widget-setting widget-setting-table'>
      <SettingSection role='group' title={translate('mode')}>
        <div role='radiogroup' className='mb-4'>
          <Label className='d-flex align-items-center'>
            <Radio
              style={{ cursor: 'pointer' }}
              name='editModeType'
              className='mr-2'
              checked={!isMapMode}
              onChange={() => { onTableModeChange(TableModeType.Layer) }}
            />
            {translate('selectLayers')}
          </Label>
          <Label className='d-flex align-items-center'>
            <Radio
              style={{ cursor: 'pointer' }}
              name='editModeType'
              className='mr-2'
              checked={isMapMode}
              onChange={() => { onTableModeChange(TableModeType.Map) }}
            />
            {translate('interactWithMap')}
          </Label>
        </div>
        {isLayerMode &&
          <LayerModeSetting
            widgetId={widgetId}
            config={config}
            useDataSources={useDataSources}
            onSettingChange={onSettingChange}
          />
        }
        {isMapMode &&
          <MapModeSetting
            widgetId={widgetId}
            config={config}
            useMapWidgetIds={useMapWidgetIds}
            mapEmpty={mapEmpty}
            jimuMapViews={jimuMapViews}
            activeMapView={activeMapView}
            useDataSources={useDataSources}
            onSettingChange={onSettingChange}
            onPropertyChange={onPropertyChange}
          />
        }
      </SettingSection>
      <ArrangementStyle config={config} onPropertyChange={onPropertyChange} />
      {showGeneralSetting &&
        <GeneralSettings isMapMode={isMapMode} level={'widget'} config={config} onPropertyChange={onPropertyChange} />
      }
      {layerModeEmptyConfig &&
        <EmptyPlaceholder isMapMode={false} />
      }
      {mapModeEmptyConfig &&
        <EmptyPlaceholder isMapMode={true} />
      }
      {isMapMode &&
        <JimuMapViewComponent
          useMapWidgetId={useMapWidgetIds?.[0]}
          onViewsCreate={onViewsCreate}
          onActiveViewChange={onActiveViewChange}
        />
      }
      {changeModeConfirmOpen &&
        <ConfirmDialog
          level='warning'
          title={translate('changeModeConfirmTitle')}
          hasNotShowAgainOption={false}
          content={translate('changeModeConfirmTips')}
          onConfirm={handleChangeModeOk}
          onClose={handleChangeModeClose}
        />
      }
    </div>
  )
}

export default Setting
