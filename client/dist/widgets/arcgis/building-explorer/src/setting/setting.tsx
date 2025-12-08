/** @jsx jsx */
import { jsx, React, classNames, hooks, type ImmutableObject } from 'jimu-core'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import { useTheme } from 'jimu-theme'
import { defaultMessages as jimuUIMessages } from 'jimu-ui'
import type { AllWidgetSettingProps/*, getAppConfigAction*/ } from 'jimu-for-builder'
import { MapWidgetSelector, SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from './translations/default'
import type { IMConfig, MapsSettings, GeneralConfig, ViewModelResult } from '../config'
import { getStyle } from './style'

//import { CalculateForSetting } from './components/calculate-for-setting'
import { MapSettings } from './components/map-settings'
import { GeneralSetting } from './components/general-setting'

import { ClickOutlined } from 'jimu-icons/outlined/application/click'

const Setting = (props: AllWidgetSettingProps<IMConfig>) => {
  const theme = useTheme()
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)
  const useMapWidgetId = props.useMapWidgetIds?.[0]

  // Map
  const selectedMap = React.useMemo(() => props.useMapWidgetIds?.length > 0, [props.useMapWidgetIds])
  const onMapWidgetSelected = (ids: string[]) => {
    props.onSettingChange({
      id: props.id,
      useMapWidgetIds: ids
    })
  }
  const [activatedJimuMapViewState, setActivatedJimuMapViewState] = React.useState<JimuMapView>(null)
  const onActiveMapViewChange = React.useCallback(async (activeView) => {
    if (activeView?.view?.type === '3d') {
      // async load jimuMapView info
      await activeView.whenJimuMapViewLoaded()

      setActivatedJimuMapViewState(activeView)
    } else {
      setActivatedJimuMapViewState(null)
    }
  }, [])

  const [viewModelResultState/*, setViewModelResultState*/] = React.useState<ViewModelResult>(null)

  // 2.1 MapSettings
  const onMapSettingsChanged = (mapSettings: ImmutableObject<MapsSettings>) => {
    props.onSettingChange({
      id: props.id,
      config: props.config.setIn(['mapSettings'], mapSettings)
    })
  }

  // 2.2 GeneralSetting
  const onGeneralSettingChanged = (generalConfig: GeneralConfig) => {
    props.onSettingChange({
      id: props.id,
      config: props.config.setIn(['general'], generalConfig)
    })
  }

  return (
    <div className='widget-setting-directions jimu-widget-setting' css={getStyle(theme)}>
      <SettingSection title={translate('ds')} aria-label={translate('ds')} className={classNames({ 'border-0': !selectedMap })}>
        {/* 1.MapWidgetSelector */}
        <SettingRow label={translate('selectMapWidget')} className='mb-2'></SettingRow>
        <div>
          <MapWidgetSelector
            onSelect={onMapWidgetSelected}
            useMapWidgetIds={props.useMapWidgetIds}
          />
        </div>
        {useMapWidgetId &&
          <JimuMapViewComponent useMapWidgetId={useMapWidgetId} onActiveViewChange={onActiveMapViewChange} />
        }
        {/* {useMapWidgetId && <CalculateForSetting
          widgetId={props.widgetId}
          jimuMapView={activatedJimuMapViewState}
          onViewModelResultChange={setViewModelResultState}
        ></CalculateForSetting>} */}

      </SettingSection>
      {/* 1.2 placeholder */}
      {(!selectedMap) && <div className='d-flex justify-content-center align-items-center placeholder-container'>
        <div className='text-center'>
          <ClickOutlined size={48} className='d-inline-block placeholder-icon mb-2' />
          <p className='placeholder-hint'>{translate('selectMapHint')}</p>
        </div>
      </div>}

      {/* 2.setting */}
      {(selectedMap) &&
        <React.Fragment>
          {/* 2.1 mapSettings */}
          <MapSettings
            widgetId={props.id}
            useMapWidgetIds={props.useMapWidgetIds}
            activatedJimuMapView={activatedJimuMapViewState}
            config={props.config}
            onMapSettingsChanged={onMapSettingsChanged}
            viewModelResult={viewModelResultState}
          ></MapSettings>

          {/* 2.2 General settings */}
          <GeneralSetting
            config={props.config}
            onGeneralSettingChanged={onGeneralSettingChanged}
          ></GeneralSetting>
        </React.Fragment>
      }
    </div>
  )
}

export default Setting
