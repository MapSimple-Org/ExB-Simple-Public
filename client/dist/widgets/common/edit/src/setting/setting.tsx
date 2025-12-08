import { React, hooks, Immutable, type ImmutableObject } from 'jimu-core'
import { defaultMessages as jimuUIMessages, Radio, Label, ConfirmDialog } from 'jimu-ui'
import { SettingSection } from 'jimu-ui/advanced/setting-components'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { type IMConfig, EditModeType, type MapViewsConfig, type MapViewConfig } from '../config'
import defaultMessages from './translations/default'
import FeatureFormGeneral from './components/feature-form-general'
import FeatureFormSetting from './components/feature-form-setting'
import EditorGeneral from './components/editor-general'
import EditorMapSelector from './components/editor-map-selector'
import EditorMap from './components/editor-map'
import EditorSnapping from './components/editor-snapping'
import EmptyPlaceholder from './components/empty-placeholder'

export interface JimuMapViews {
  [viewId: string]: JimuMapView
}

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
  const { id: widgetId, config, useDataSources, useMapWidgetIds, onSettingChange } = props
  const { editMode, layersConfig = Immutable([]), mapViewsConfig = Immutable({}) as ImmutableObject<MapViewsConfig>, batchEditing = false } = config

  const [changeModeConfirmOpen, setChangeModeConfirmOpen] = React.useState(false)
  const [mapEmpty, setMapEmpty] = React.useState(true)
  const [jimuMapViews, setJimuMapViews] = React.useState<JimuMapView[]>([])
  const [isActiveScene, setIsActiveScene] = React.useState(false)

  const toBeChangeMode = React.useRef<EditModeType>(null)
  const isAttrMode = editMode === EditModeType.Attribute
  const isGeoMode = editMode === EditModeType.Geometry
  const hasMap = useMapWidgetIds?.length > 0
  const hasConfig = (isAttrMode && layersConfig.length > 0) || (isGeoMode && Object.keys(mapViewsConfig).length > 0)

  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const onPropertyChange = React.useCallback((name: string, value: string | number | boolean | object) => {
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

  const onMultiplePropertyChange = React.useCallback((changeArr: Array<{ name: string, value: string | number | boolean | object }>) => {
    let newConfig = config
    changeArr.forEach(item => {
      if (item.value === config[item.name]) return
      newConfig = newConfig.set(item.name, item.value)
    })
    onSettingChange({
      id: widgetId,
      config: newConfig
    })
  }, [config, onSettingChange, widgetId])

  const handleChangeModeOk = React.useCallback(() => {
    onSettingChange({
      id: widgetId,
      config: config.set('editMode', toBeChangeMode.current).set('layersConfig', []).set('mapViewsConfig', {}),
      useDataSources: [],
      useMapWidgetIds: []
    })
    toBeChangeMode.current = null
    setChangeModeConfirmOpen(false)
  }, [config, onSettingChange, widgetId])

  const handleChangeModeClose = () => {
    setChangeModeConfirmOpen(false)
  }

  const onEditModeChange = React.useCallback((mode: EditModeType) => {
    if (editMode === mode) return
    toBeChangeMode.current = mode
    if (hasConfig) {
      setChangeModeConfirmOpen(true)
    } else {
      handleChangeModeOk()
    }
  }, [editMode, handleChangeModeOk, hasConfig])

  const onViewsCreate = React.useCallback((views: { [viewId: string]: JimuMapView }) => {
    setJimuMapViews([])
    const viewArr = Object.values(views)
    if (Object.keys(viewArr).length === 1 && !Object.values(viewArr)[0].dataSourceId) {
      setMapEmpty(true)
    } else {
      setMapEmpty(false)
    }
    setJimuMapViews(viewArr)
  }, [setMapEmpty])

  const onActiveViewChange = React.useCallback((activeView: JimuMapView) => {
    if (!activeView) return
    setIsActiveScene(activeView.view.type === '3d')
  }, [])

  const handleMapViewConfigChange = React.useCallback((mapViewId: string, mapViewConfig: ImmutableObject<MapViewConfig>) => {
    onSettingChange({
      id: widgetId,
      config: config.setIn(['mapViewsConfig', mapViewId], mapViewConfig)
    })
  }, [config, onSettingChange, widgetId])

  return (
    <div className='h-100'>
      <div className='jimu-widget-setting widget-setting-edit h-100'>
        <SettingSection role='group' title={translate('mode')}>
          <div role='radiogroup' className='mb-4'>
            <Label className='d-flex align-items-center'>
              <Radio
                style={{ cursor: 'pointer' }}
                name='editModeType'
                className='mr-2'
                checked={isAttrMode}
                onChange={() => { onEditModeChange(EditModeType.Attribute) }}
              />
              {translate('attrMode')}
            </Label>
            <Label className='d-flex align-items-center'>
              <Radio
                style={{ cursor: 'pointer' }}
                name='editModeType'
                className='mr-2'
                checked={isGeoMode}
                onChange={() => { onEditModeChange(EditModeType.Geometry) }}
              />
              {translate('interactWithMap')}
            </Label>
          </div>
          {isAttrMode && <FeatureFormSetting
            widgetId={widgetId}
            config={config}
            useDataSources={useDataSources}
            onSettingChange={onSettingChange}
          />}
          {isGeoMode &&
            <EditorMapSelector
              widgetId={widgetId}
              config={config}
              useMapWidgetIds={useMapWidgetIds}
              onSettingChange={onSettingChange}
            />
          }
          {isGeoMode && hasMap &&
            <EditorMap
              useMapWidgetIds={useMapWidgetIds}
              mapEmpty={mapEmpty}
              jimuMapViews={jimuMapViews}
              mapViewsConfig={mapViewsConfig}
              batchEditing={batchEditing}
              onChange={handleMapViewConfigChange}
            />
          }
        </SettingSection>
        {isAttrMode && hasConfig &&
          <FeatureFormGeneral config={config} onPropertyChange={onPropertyChange} onMultiplePropertyChange={onMultiplePropertyChange} />
        }
        {isAttrMode && !hasConfig &&
          <EmptyPlaceholder isGeoMode={false} />
        }
        {isGeoMode && hasMap &&
          <EditorSnapping
            config={config}
            jimuMapViews={jimuMapViews}
            onPropertyChange={onPropertyChange}
          />
        }
        {isGeoMode && hasMap &&
          <EditorGeneral config={config} isActiveScene={isActiveScene} onPropertyChange={onPropertyChange} onMultiplePropertyChange={onMultiplePropertyChange} />
        }
        {isGeoMode && !hasMap &&
          <EmptyPlaceholder isGeoMode={true} />
        }
        {isGeoMode &&
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
    </div>
  )
}

export default Setting
