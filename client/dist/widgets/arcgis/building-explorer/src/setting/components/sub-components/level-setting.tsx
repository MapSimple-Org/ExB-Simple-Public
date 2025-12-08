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

  isEnableLevel: boolean
  isMultipleMode: boolean
  handEnableChanged: (type: 'enableLevel', evt: React.ChangeEvent<HTMLInputElement>) => void
  onMapSettingsChanged: (mapSettings: ImmutableObject<MapsSettings>) => void
}

export const LevelSetting = React.memo((props: Props) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)
  const {
    config, viewModelResult, isEnableLevel, isMultipleMode, currentDSIdState,
    getCurrentSetting, handEnableChanged, onMapSettingsChanged
  } = props

  const getLevelConfig = React.useCallback((): NumericRange => {
    const { currentSetting } = getCurrentSetting()
    const congMin = currentSetting.level?.min
    const congMax = currentSetting.level?.max
    let defaultValue = (currentSetting.level?.defaultValue ?? viewModelResult?.level?.defaultValue)
    if (typeof defaultValue === 'undefined') {
      defaultValue = ''
    }

    return {
      min: congMin,
      max: congMax,
      allowedValuesLimit: (viewModelResult?.level?.allowedValuesLimit) || null,
      defaultValue: defaultValue
    }
  }, [viewModelResult, getCurrentSetting])

  const getLevelAllowedValues = React.useCallback((levelSetting?: NumericRange) => {
    const minValue = Math.max((levelSetting?.min || getLevelConfig().min) ?? 0, (viewModelResult?.level?.min ?? 0))
    const maxValue = Math.min((levelSetting?.max || getLevelConfig().max) ?? 0, (viewModelResult?.level?.max ?? 0))
    const allowedValuesLimit = viewModelResult?.level?.allowedValuesLimit

    const allowedValues: number[] = []
    for (let i = minValue; i <= maxValue; i++) {
      const isIncludesFlag = (allowedValuesLimit === null) || (allowedValuesLimit?.includes(i))
      if (isIncludesFlag) {
        allowedValues.push(i)
      }
    }

    return allowedValues
  }, [viewModelResult?.level,
    getLevelConfig])

  function generateLevelOptions () {
    const options = []
    //1. default option: None
    options.push(<Option key={''} value={''}>{translate('none')}</Option>)
    //2. others option
    getLevelAllowedValues().forEach((value: number) => {
      options.push(<Option key={value} value={value}>{value}</Option>)
    })

    return options
  }

  const onLevelSettingChanged = React.useCallback((levelSetting: NumericRange) => {
    let mapSettings = config.getIn(['mapSettings'])
    let _setting = mapSettings[currentDSIdState]
    if (!_setting) {
      _setting = Immutable({})
    }
    //const level = _setting.getIn(['level'])
    // // min/max
    // const _currentLevel = Object.assign(level?.asMutable() ?? {}, levelSetting)
    // _setting = _setting.setIn(['level'], _currentLevel)
    // // defaultValue
    // const minValueLimit = Math.max(_currentLevel.min, (viewModelResult?.level?.min ?? 0))
    // const maxValueLimit = Math.min(_currentLevel.max, (viewModelResult?.level?.max ?? 0))
    // if (_setting.level.defaultValue !== '' && (_setting.level.defaultValue > maxValueLimit || _setting.level.defaultValue < minValueLimit)) {
    //   _setting = _setting.setIn(['level', 'defaultValue'], '') // set defaultValue to '', when out of range
    // }
    // // allowedValues
    // const _allowedValues = getLevelAllowedValues(levelSetting)
    // if (_allowedValues && _allowedValues.length > 0) {
    //   _setting = _setting.setIn(['level', 'allowedValues'], _allowedValues)
    // }
    mapSettings = mapSettings.setIn([currentDSIdState], _setting)
    onMapSettingsChanged(mapSettings)
  }, [config, /*viewModelResult,*/ currentDSIdState,
    onMapSettingsChanged/*, getLevelAllowedValues*/])

  return (
    <SettingSection>
      {/* 2.1 */}
      <SettingRow tag='label' label={translate('level')}>
        <Switch
          checked={isEnableLevel}
          onChange={(evt) => { handEnableChanged('enableLevel', evt) }}
        />
      </SettingRow>

      {isMultipleMode && isEnableLevel && <React.Fragment>
        {/* 2.2 */}
        <SettingRow label={translate('levelRange')} className='mt-4'></SettingRow>
        <SettingRow>
          <MultiRangeSlider
            aria-label={translate('levelRange')} tooltip={true}
            defaultMinValue={viewModelResult?.level?.min} defaultMaxValue={viewModelResult?.level?.max}
            min={viewModelResult?.level?.min} max={viewModelResult?.level?.max}
            minValue={getLevelConfig().min} maxValue={getLevelConfig().max}
            step={1}
            onChange={ (minValue: number, maxValue: number) => { onLevelSettingChanged({ min: minValue, max: maxValue }) } }
            disabled={!viewModelResult}
          ></MultiRangeSlider>
        </SettingRow>
        {/* 2.3 */}
        <SettingRow label={translate('defaultLevel')}></SettingRow>
        <SettingRow>
          <Select size='sm'
            value={getLevelConfig().defaultValue} placeholder={translate('none')}
            disabled={!viewModelResult}
            onChange={(evt) => { onLevelSettingChanged({ defaultValue: evt.target.value }) }}>
            {
              generateLevelOptions()
            }
          </Select>
        </SettingRow>
      </React.Fragment>}
    </SettingSection>
  )
})
