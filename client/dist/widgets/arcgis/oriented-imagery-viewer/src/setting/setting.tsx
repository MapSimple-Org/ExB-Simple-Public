import type GroupLayer from '@arcgis/core/layers/GroupLayer'
import type Layer from '@arcgis/core/layers/Layer'
import type OrientedImageryLayer from '@arcgis/core/layers/OrientedImageryLayer'
import type MapView from '@arcgis/core/views/MapView'
import type SceneView from '@arcgis/core/views/SceneView'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import { React } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { Switch } from 'jimu-ui'
import { MapWidgetSelector, SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { memo, useRef, useState } from 'react'
import type { IMConfig, SettingInfo } from '../config'
import { extentSettingsInfo, toolSettingsInfo } from './constants'
import defaultI18nMessages from './translations/default'

function Setting(props: AllWidgetSettingProps<IMConfig>) {
  const { config, id: widgetId, intl } = props
  const [view, setView] = useState<MapView | SceneView | null>(null)
  const [oiLayers, setOiLayers] = useState<OrientedImageryLayer[]>([])
  const oiLayerListHandle = useRef<__esri.Handle>(null)

  const nls = (id: keyof typeof defaultI18nMessages) => {
    return intl ? intl.formatMessage({ id: id, defaultMessage: defaultI18nMessages[id] }) : id
  }

  const onMapWidgetSelected = (ids: string[]) => {
    props.onSettingChange({
      id: widgetId,
      useMapWidgetIds: ids
    })
  }

  const updateConfig = (property: keyof typeof config, value: unknown) => {
    props.onSettingChange({
      id: widgetId,
      config: config.set(property, value)
    })
  }

  const handleConfigToggle = (event: any) => {
    updateConfig(event.currentTarget.name, event.currentTarget.checked)
  }

  const onActiveViewChange = async (jimuMapView: JimuMapView) => {
    if (oiLayerListHandle.current) {
      oiLayerListHandle.current.remove()
      oiLayerListHandle.current = null
    }
    if (jimuMapView) {
      setView(jimuMapView.view)
      setOiLayers(getOiLayers(jimuMapView.view.map?.allLayers))
      oiLayerListHandle.current = await getOiLayerChangeHandle(jimuMapView)
    } else {
      setView(null)
      setOiLayers([])
    }
  }

  const getOiLayerChangeHandle = (jimuMapView: JimuMapView) => {
    return jimuMapView.watch(
      () =>
        jimuMapView.view.map?.allLayers?.filter((layer) => layer.type === 'oriented-imagery' && layer.loaded).length,
      () => {
        setOiLayers(getOiLayers(jimuMapView.view.map.allLayers))
      }
    )
  }

  const getOiLayers = (layerList: __esri.ReadonlyCollection<Layer>) => {
    return layerList.reduce((finalList, currLayer) => {
      if (currLayer.type === 'oriented-imagery') {
        finalList.push(currLayer as OrientedImageryLayer)
      } else if (currLayer.type === 'group') {
        finalList.push(...getOiLayers((currLayer as GroupLayer).layers))
      }

      return finalList
    }, [] as OrientedImageryLayer[])
  }

  const renderSettings = (toolsInfo: SettingInfo[]) => {
    return (
      <>
        {toolsInfo.map((toolInfo) => {
          const toolLabel = nls(toolInfo.labelKey)
          const showSubTools = toolInfo.subTools?.length && config[toolInfo.name]
          return (
            <>
              <SettingRow role={'group'} aria-label={toolLabel} tag='label' label={toolLabel} key={toolInfo.name}>
                <Switch name={toolInfo.name} checked={config[toolInfo.name]} onChange={handleConfigToggle}></Switch>
              </SettingRow>
              {showSubTools ? renderSettings(toolInfo.subTools) : null}
            </>
          )
        })}
      </>
    )
  }

  const isWidgetError = () => {
    return !view || !oiLayers?.length
  }

  const renderWidgetError = () => {
    let errorMessage = nls('defaultError')
    if (!view) {
      errorMessage = nls('noMapSelectedError')
    } else if (!oiLayers?.length) {
      errorMessage = nls('noOiLayersError')
    }
    return (
      <SettingSection className='d-flex justify-content-center' style={{ color: props.theme.ref.palette.neutral[900] }}>
        <div className='text-center'>{errorMessage}</div>
      </SettingSection>
    )
  }

  const renderViewerSettings = () => {
    if (isWidgetError()) {
      return renderWidgetError()
    }

    return (
      <>
        {renderToolsConfig()}
        {renderExtentSettingsConfig()}
      </>
    )
  }

  const renderToolsConfig = () => {
    return <SettingSection title={nls('configureToolsSectionTitle')}>{renderSettings(toolSettingsInfo)}</SettingSection>
  }

  const renderExtentSettingsConfig = () => {
    return <SettingSection title={nls('configureExtentsLabel')}>{renderSettings(extentSettingsInfo)}</SettingSection>
  }

  return (
    <div className='widget-setting-demo'>
      <JimuMapViewComponent useMapWidgetId={props.useMapWidgetIds?.[0]} onActiveViewChange={onActiveViewChange} />
      <SettingSection className='map-selector-section' title={nls('mapWidgetSelectionSectionTitle')}>
        <SettingRow>
          <MapWidgetSelector onSelect={onMapWidgetSelected} useMapWidgetIds={props.useMapWidgetIds} />
        </SettingRow>
      </SettingSection>
      {renderViewerSettings()}
    </div>
  )
}

export default memo(Setting)
