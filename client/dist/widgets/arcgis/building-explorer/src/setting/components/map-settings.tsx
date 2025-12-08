/** @jsx jsx */
import { React, jsx, hooks, Immutable, type ImmutableObject, type ImmutableArray } from 'jimu-core'
import type { JimuMapView, JimuLayerView } from 'jimu-arcgis'
import { useTheme } from 'jimu-theme'
import { Alert, Switch, Select, Option, /*Label, Radio, */defaultMessages as jimuUIMessages } from 'jimu-ui'
import { SettingRow, SettingSection, MultipleJimuMapConfig, type MultipleJimuMapValidateResult } from 'jimu-ui/advanced/setting-components'
import { getTargetJimuMapView, isMapContainWebScene, getBuildingLayerViews, getBuildingLayerViewsByLayerViewIds, isLayerConfigNone, filterRuntimeAddedLayerViews } from '../../common/utils'
import defaultMessages from '../translations/default'
import { type IMConfig, type MapsSettings, LayerMode, type ViewModelResult } from '../../config'
import { getStyle } from './style'
import { LevelSetting } from './sub-components/level-setting'
import { PhaseSetting } from './sub-components/phase-setting'

export interface Props {
  widgetId: string
  useMapWidgetIds?: ImmutableArray<string>
  activatedJimuMapView: JimuMapView
  config: IMConfig
  onMapSettingsChanged: (mapSettings: ImmutableObject<MapsSettings>) => void
  viewModelResult: ViewModelResult
}

export const MapSettings = React.memo((props: Props) => {
  const theme = useTheme()
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)
  const { onMapSettingsChanged, config } = props
  const noneTipNls = translate('none')

  // sidePopper
  const [currentDSIdState, setCurrentDSIdState] = React.useState('')
  const handleMultipleJimuMapConfigClick = (dataSourceId: string) => {
    setCurrentDSIdState(dataSourceId)
  }

  // current setting
  const getCurrentSetting = React.useCallback(() => {
    const mapSettings = props.config.getIn(['mapSettings'])
    const _setting = mapSettings.getIn([currentDSIdState])

    return {
      currentSetting: _setting,
      mapsSettings: mapSettings
    }
  }, [props.config, currentDSIdState])

  // vm Result
  const viewModelResult = props.viewModelResult

  ///////////////////////////////////////////////////////////////////
  // layers
  const getLayerSetting = React.useCallback((): LayerMode => {
    const { currentSetting } = getCurrentSetting()
    const layerMode = currentSetting?.layerMode

    return layerMode ?? LayerMode.Single
  }, [getCurrentSetting])

  // const _onLayerModeChanged = React.useCallback((layerMode: LayerMode, checked: boolean) => {
  //   if (!checked) {
  //     return
  //   }

  //   let mapSettings = config.getIn(['mapSettings'])
  //   let _setting = mapSettings[currentDSIdState]
  //   if (!_setting) {
  //     _setting = Immutable({})
  //   }
  //   _setting = _setting.setIn(['layerMode'], layerMode)

  //   // clear states, when change layer type
  //   if (layerMode === LayerMode.Single && viewModelResult) {
  //     // level
  //     _setting = _setting.setIn(['level', 'allowedValues'], viewModelResult?.level.allowedValuesLimit)
  //     _setting = _setting.setIn(['level', 'defaultValue'], viewModelResult?.level.defaultValue)
  //     _setting = _setting.setIn(['level', 'min'], viewModelResult?.level.min)
  //     _setting = _setting.setIn(['level', 'max'], viewModelResult?.level.max)
  //     // phase
  //     _setting = _setting.setIn(['phase', 'allowedValues'], viewModelResult?.phase.allowedValuesLimit)
  //     _setting = _setting.setIn(['phase', 'defaultValue'], viewModelResult?.phase.defaultValue)
  //     _setting = _setting.setIn(['phase', 'min'], viewModelResult?.phase.min)
  //     _setting = _setting.setIn(['phase', 'max'], viewModelResult?.phase.max)
  //   }

  //   mapSettings = mapSettings.setIn([currentDSIdState], _setting)
  //   onMapSettingsChanged(mapSettings)
  // }, [config, currentDSIdState, viewModelResult,
  //   onMapSettingsChanged/*, getCurrentSetting*/])

  // building layers
  const getAllLayerViewsByDsId = React.useCallback((specifyDsId?: string): JimuLayerView[] => {
    const targetDsId = specifyDsId ?? currentDSIdState
    if (!targetDsId) {
      return [] // no target DsID
    }

    //const map = getCurrentMap(props.useMapWidgetIds, targetDsId)
    const targetJimuMapView = getTargetJimuMapView(props.useMapWidgetIds, targetDsId)

    //props.activatedJimuMapView
    // get buildingLayers
    const buildingLayerViews = getBuildingLayerViews(targetJimuMapView)
    return buildingLayerViews
  }, [currentDSIdState, props.useMapWidgetIds])

  // isValid
  const isDataSourceValid = (_dataSourceId: string): MultipleJimuMapValidateResult => {
    if (!_is3DMap(_dataSourceId)) {
      return { // 2D maps
        isValid: false,
        invalidMessage: translate('mapNotSupportedTips')
      }
    } else if (!_hasBuildingLayer(_dataSourceId)) {
      return { // 3D maps, but no building layers
        isValid: false,
        invalidMessage: translate('noBuildingLayerTips')
      }
    } else {
      return {
        isValid: true
      }
    }
  }
  const _hasBuildingLayer = (_dataSourceId: string): boolean => {
    let buildingLayerViews = getAllLayerViewsByDsId(_dataSourceId)
    // filter runtime added layers, #19024
    //const layerViews = props.activatedJimuMapView?.getAllJimuLayerViews()
    buildingLayerViews = filterRuntimeAddedLayerViews(buildingLayerViews)

    return (buildingLayerViews?.length > 0)
  }
  const _is3DMap = (_dataSourceId: string): boolean => {
    const targetJimuMapView = getTargetJimuMapView(props.useMapWidgetIds, _dataSourceId)
    return (targetJimuMapView.view?.type === '3d')
  }

  const getBuildingLayersForSelectOptions = React.useCallback(() => {
    let buildingLayerViews = getAllLayerViewsByDsId()
    // filter runtime added layers, #19024
    // const layerViews = props.activatedJimuMapView?.getAllJimuLayerViews()
    // layers = filterRuntimeAddedLayers(layers, layerViews)
    buildingLayerViews = filterRuntimeAddedLayerViews(buildingLayerViews)

    if (buildingLayerViews) {
      buildingLayerViews.unshift({ id: '', layer: { title: noneTipNls } } as any) //default option: None
      return buildingLayerViews
    } else {
      return null
    }
  }, [noneTipNls, getAllLayerViewsByDsId])

  const buildingLayersForSelectOptions = getBuildingLayersForSelectOptions()
  const getCurrentLayerViews = React.useCallback((): JimuLayerView[] => {
    const { currentSetting } = getCurrentSetting()
    // empty config / value is None
    if (isLayerConfigNone(currentSetting?.layersOnLoad)) {
      return getBuildingLayersForSelectOptions()
    }

    //const map = getCurrentMap(props.useMapWidgetIds, currentDSIdState)
    return getBuildingLayerViewsByLayerViewIds(currentSetting.layersOnLoad ?? Immutable[''], props.activatedJimuMapView)
  }, [props.activatedJimuMapView, //currentDSIdState,
    getCurrentSetting, getBuildingLayersForSelectOptions])

  const getSelectedLayerView = React.useCallback((): JimuLayerView => {
    const layers = getCurrentLayerViews()
    const layer = layers.at(0)
    return layer
  }, [getCurrentLayerViews])

  const handleSelectedLayer = React.useCallback((evt: React.ChangeEvent<HTMLInputElement>): void => {
    const selectedId = evt.target.value

    let mapSettings = config.getIn(['mapSettings'])
    let _setting = mapSettings[currentDSIdState]
    if (!_setting) {
      _setting = Immutable({})
    }
    _setting = _setting.setIn(['layersOnLoad'], [selectedId])
    mapSettings = mapSettings.setIn([currentDSIdState], _setting)

    onMapSettingsChanged(mapSettings)
  }, [config, currentDSIdState, onMapSettingsChanged])

  // enable
  const getEnable = React.useCallback((type: 'enableLevel' | 'enablePhase' | 'enableCtegories') => {
    const { currentSetting } = getCurrentSetting()

    const isEnable = (currentSetting && currentSetting[type])
    return isEnable ?? true
  }, [getCurrentSetting])

  const handEnableChanged = (type: 'enableLevel' | 'enablePhase' | 'enableCtegories', evt: React.ChangeEvent<HTMLInputElement>) => {
    let mapSettings = config.getIn(['mapSettings'])
    let _setting = mapSettings[currentDSIdState]
    if (!_setting) {
      _setting = Immutable({})
    }
    _setting = _setting.setIn([type], evt.target.checked)
    mapSettings = mapSettings.setIn([currentDSIdState], _setting)

    props.onMapSettingsChanged(mapSettings)
  }

  const isMultipleMode = (getLayerSetting() !== LayerMode.Single)
  const isEnableLevel = (getEnable('enableLevel'))
  const isEnablePhase = (getEnable('enablePhase'))
  const isShowPhaseSetting = !(viewModelResult?.phase?.min === viewModelResult?.phase?.max)
  return (

    <SettingSection title={translate('mapSettings')} aria-label={translate('mapSettings') + ' ' + translate('mapSettingsTip')} role='group'>
    {isMapContainWebScene(props.useMapWidgetIds) && <React.Fragment>
      {/* 1. title */}
        <SettingRow label={translate('mapSettingsTip')} className='mapSettingsTip d-block' css={getStyle(theme)} flow='wrap'>
          {/* 2. map setting list */}
          <MultipleJimuMapConfig
            mapWidgetId={props.useMapWidgetIds?.[0]}
            onClick={handleMultipleJimuMapConfigClick}
            isDataSourceValid={isDataSourceValid}
            keepLastTimeMap
            sidePopperContent={
              <div className='side-popper-container'>
                {/* 1. Options */}
                <SettingSection>
                  {/* <SettingRow label={translate('layerMode')}></SettingRow>
                  <div className='layer-mode-selector my-3'>
                    <Label className='d-flex'>
                      <Radio
                        name='layerMode' className='mr-2'
                        checked={(getLayerSetting() === LayerMode.Single)}
                        onChange={(evt, checked) => { _onLayerModeChanged(LayerMode.Single, checked) }}
                      />
                      {translate('single')}
                    </Label>
                    <Label className='d-flex'>
                      <Radio
                        name='layerMode' className='mr-2'
                        checked={(getLayerSetting() === LayerMode.Multiple)}
                        onChange={(evt, checked) => { _onLayerModeChanged(LayerMode.Multiple, checked) }}
                      />
                      {translate('multiple')}
                    </Label>
                  </div> */}

                  <SettingRow label={translate('layerOnLoading')} aria-label={translate('layerOnLoading')} flow='wrap'>
                    {
                      (props.activatedJimuMapView) && <Select value={getSelectedLayerView()?.id} onChange={handleSelectedLayer}
                        size='sm' placeholder={noneTipNls}>
                        {buildingLayersForSelectOptions && buildingLayersForSelectOptions.map((buildingLayer, index) => {
                          return <Option tabIndex={0} role={'option'} aria-label={buildingLayer.layer?.title} key={index}
                            value={buildingLayer.id}>{buildingLayer.layer?.title}
                          </Option>
                        })}
                      </Select>
                    }
                  </SettingRow>
                </SettingSection>

                {/* 2. Level */}
                <LevelSetting
                  config={config}
                  getCurrentSetting={getCurrentSetting}
                  viewModelResult={viewModelResult}
                  currentDSIdState={currentDSIdState}

                  isEnableLevel={isEnableLevel}
                  isMultipleMode={isMultipleMode}
                  onMapSettingsChanged={onMapSettingsChanged}
                  handEnableChanged={handEnableChanged}
                ></LevelSetting>

                {/* 3. Building phase */}
                <PhaseSetting
                  config={config}
                  getCurrentSetting={getCurrentSetting}
                  viewModelResult={viewModelResult}
                  currentDSIdState={currentDSIdState}

                  isEnablePhase={isEnablePhase}
                  isShowPhaseSetting={isShowPhaseSetting}
                  isMultipleMode={isMultipleMode}
                  onMapSettingsChanged={onMapSettingsChanged}
                  handEnableChanged={handEnableChanged}
                ></PhaseSetting>

                {/* 4. Disciplines and Categories */}
                <SettingSection>
                  <SettingRow tag='label' label={translate('disciplinesCategories')}>
                    <Switch
                      checked={getEnable('enableCtegories')}
                      onChange={(evt) => { handEnableChanged('enableCtegories', evt) }}
                    />
                  </SettingRow>
                </SettingSection>
              </div>
            }
          />
      </SettingRow>
    </React.Fragment>}

    {/* 3. no map tips */}
    {!isMapContainWebScene(props.useMapWidgetIds) &&
      <SettingRow>
        <Alert tabIndex={0} className={'warningMsg'} type={'warning'} withIcon
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onClose={function noRefCheck () {}}
          open={true} text={translate('noMapTips')}
        />
      </SettingRow>
    }
  </SettingSection>
  )
})
