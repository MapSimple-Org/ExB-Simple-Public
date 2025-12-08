/** @jsx jsx */
import { React, jsx, hooks, Immutable, type ImmutableObject } from 'jimu-core'
import { Switch, Option, MultiRangeSlider, Select, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../../translations/default'
import type { IMConfig, MapsSettings, NumericRange, ViewModelResult } from '../../../config'

export interface Props {
  config: IMConfig
  getCurrentSetting: () => any
  viewModelResult: ViewModelResult
  currentDSIdState: string

  isEnablePhase: boolean
  isShowPhaseSetting: boolean
  isMultipleMode: boolean
  handEnableChanged: (type: 'enablePhase', evt: React.ChangeEvent<HTMLInputElement>) => void
  onMapSettingsChanged: (mapSettings: ImmutableObject<MapsSettings>) => void
}

export const PhaseSetting = React.memo((props: Props) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)
  const {
    config, viewModelResult, isEnablePhase, isShowPhaseSetting, isMultipleMode, currentDSIdState,
    getCurrentSetting, handEnableChanged, onMapSettingsChanged
  } = props

  const getPhaseConfig = React.useCallback((): NumericRange => {
    const { currentSetting } = getCurrentSetting()
    const congMin = currentSetting.phase?.min
    const congMax = currentSetting.phase?.max
    let defaultValue = (currentSetting.phase?.defaultValue ?? viewModelResult?.phase?.defaultValue)
    if (typeof defaultValue === 'undefined') {
      defaultValue = ''
    }

    return {
      min: congMin,
      max: congMax,
      allowedValuesLimit: (viewModelResult?.phase?.allowedValuesLimit) || null,
      defaultValue: defaultValue
    }
  }, [viewModelResult, getCurrentSetting])

  const getPhaseAllowedValues = React.useCallback((phaseSetting?: NumericRange) => {
    const minValue = Math.max((phaseSetting?.min || getPhaseConfig().min) ?? 0, (viewModelResult?.phase?.min ?? 0))
    const maxValue = Math.min((phaseSetting?.max || getPhaseConfig().max) ?? 0, (viewModelResult?.phase?.max ?? 0))
    const allowedValuesLimit = viewModelResult?.phase?.allowedValuesLimit

    const allowedValues: number[] = []
    for (let i = minValue; i <= maxValue; i++) {
      const isIncludesFlag = (allowedValuesLimit === null) || (allowedValuesLimit?.includes(i))
      if (isIncludesFlag) {
        allowedValues.push(i)
      }
    }

    return allowedValues
  }, [viewModelResult?.phase,
    getPhaseConfig])

  function generatePhaseOptions () {
    const options = []
    //1. default option: None
    options.push(<Option key={''} value={''}>{translate('none')}</Option>)
    //2. others option
    getPhaseAllowedValues().forEach((value: number) => {
      options.push(<Option key={value} value={value}>{value}</Option>)
    })

    return options
  }

  const onPhaseSettingChanged = React.useCallback((phaseSetting: NumericRange) => {
    let mapSettings = config.getIn(['mapSettings'])
    let _setting = mapSettings[currentDSIdState]
    if (!_setting) {
      _setting = Immutable({})
    }
    // const phase = _setting.getIn(['phase'])
    // // min/max
    // const _currentPhase = Object.assign(phase?.asMutable() ?? {}, phaseSetting)
    // _setting = _setting.setIn(['phase'], _currentPhase)
    // // defaultValue
    // const minValueLimit = Math.max(_currentPhase.min, (viewModelResult?.phase?.min ?? 0))
    // const maxValueLimit = Math.min(_currentPhase.max, (viewModelResult?.phase?.max ?? 0))
    // if (_setting.phase.defaultValue !== '' && (_setting.phase.defaultValue > maxValueLimit || _setting.phase.defaultValue < minValueLimit)) {
    //   _setting = _setting.setIn(['phase', 'defaultValue'], '') // set defaultValue to '', when out of range
    // }
    // // allowedValues
    // const _allowedValues = getPhaseAllowedValues(phaseSetting)
    // if (_allowedValues && _allowedValues.length > 0) {
    //   _setting = _setting.setIn(['phase', 'allowedValues'], _allowedValues)
    // }
    mapSettings = mapSettings.setIn([currentDSIdState], _setting)
    onMapSettingsChanged(mapSettings)
  }, [config, /*viewModelResult,*/ currentDSIdState,
    onMapSettingsChanged/*, getPhaseAllowedValues*/])

  return (
    <SettingSection>
      {/* 3.1 */}
      <SettingRow tag='label' label={translate('buildingPhase')}>
        <Switch
          checked={isEnablePhase}
          onChange={(evt) => { handEnableChanged('enablePhase', evt) }}
        />
      </SettingRow>

      {isMultipleMode && isEnablePhase && <div className={isShowPhaseSetting ? 'd-block' : 'd-none'}>
        {/* 3.2 */}
        <SettingRow label={translate('phaseRange')} className='mt-4'></SettingRow>
          <SettingRow>
            <MultiRangeSlider
              disabled={!viewModelResult && !isShowPhaseSetting}
              aria-label={translate('phaseRange')} tooltip={true}
              defaultMinValue={viewModelResult?.phase?.min} defaultMaxValue={viewModelResult?.phase?.max}
              min={viewModelResult?.phase?.min} max={viewModelResult?.phase?.max}
              minValue={getPhaseConfig().min} maxValue={getPhaseConfig().max}
              step={1}
              onChange={ (minValue: number, maxValue: number) => { onPhaseSettingChanged({ min: minValue, max: maxValue }) } }
            ></MultiRangeSlider>
          </SettingRow>
          {/* 3.3 */}
          <SettingRow label={translate('defaultPhase')}></SettingRow>
          <SettingRow>
            <Select size='sm'
              value={getPhaseConfig().defaultValue} placeholder={translate('none')}
              onChange={(evt) => { onPhaseSettingChanged({ defaultValue: evt.target.value }) }}
              disabled={!viewModelResult}>
              {
                generatePhaseOptions()
              }
            </Select>
          </SettingRow>
      </div>}
    </SettingSection>
  )
})
