import { React, hooks, css, Immutable, classNames } from 'jimu-core'
import { Switch, Label, Radio, NumericInput, Checkbox, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import mapDefaultMessages from '../translations/default'
import type { ScalebarOptions, IMScalebarOptions } from '../../config'

export interface ScalebarSettingProps {
  // null/undefined means automatic
  scalebarOptions: IMScalebarOptions
  onChange: (scaleBarOptions: IMScalebarOptions) => void
}

export default function ScalebarSetting(props: ScalebarSettingProps) {
  const rawScalebarOptions = props.scalebarOptions
  const onChangeProp = props.onChange
  const notEmptyScalebarOptions: IMScalebarOptions = React.useMemo(() => {
    let result = rawScalebarOptions

    if (!result) {
      result = getDefaultNotEmptyScalebarOptions()
    }

    return result
  }, [rawScalebarOptions])

  const isAutomatic = !rawScalebarOptions
  const style = rawScalebarOptions?.style
  const unit = rawScalebarOptions?.unit
  const decimalPlace = rawScalebarOptions?.decimalPlace
  const thousandSeparator = rawScalebarOptions?.thousandSeparator

  const translate = hooks.useTranslation(jimuUIMessages, mapDefaultMessages)
  const automaticLabel = translate('mapZoomToAction_Automatic')
  const autoScalebarOptionsTip = translate('autoScalebarOptionsTip')
  const styleLabel = translate('style')
  const scaleBarLineLabel = translate('scaleBarLine')
  const scaleBarRulerLabel = translate('scaleBarRuler')
  const scaleBarNumberLabel = translate('scaleBarNumber')
  const unitLabel = translate('unit')
  const metricLabel = translate('metric')
  const imperialLabel = translate('imperial')
  const dualLabel = translate('dual')
  const decimalPlaceCountLabel = translate('decimalPlaceCount')
  const showThousandSeparatorsLabel = translate('showThousandSeparator')

  const updateScalebarOptions = React.useCallback((newScalebarOptions: IMScalebarOptions) => {
    if (onChangeProp) {
      onChangeProp(newScalebarOptions)
    }
  }, [onChangeProp])

  const onAutomaticSwitchChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const newScalebarOptions = checked ? null : getDefaultNotEmptyScalebarOptions()
    updateScalebarOptions(newScalebarOptions)
  }, [updateScalebarOptions])

  const onScalebarLineStyleClick = React.useCallback(() => {
    let newScalebarOptions = notEmptyScalebarOptions.set('style', 'line').set('decimalPlace', 0).set('thousandSeparator', false)

    // when style is line, valid units: metric, imperial and dual
    if (!newScalebarOptions.unit) {
      newScalebarOptions = newScalebarOptions.set('unit', 'metric')
    }

    updateScalebarOptions(newScalebarOptions)
  }, [notEmptyScalebarOptions, updateScalebarOptions])

  const onScalebarRulerStyleClick = React.useCallback(() => {
    let newScalebarOptions = notEmptyScalebarOptions.set('style', 'ruler').set('decimalPlace', 0).set('thousandSeparator', false)

    // when style is ruler, valid units: metric and imperial
    if (newScalebarOptions.unit !== 'metric' && newScalebarOptions.unit !== 'imperial') {
      newScalebarOptions = newScalebarOptions.set('unit', 'metric')
    }

    updateScalebarOptions(newScalebarOptions)
  }, [notEmptyScalebarOptions, updateScalebarOptions])

  const onScalebarNumberStyleClick = React.useCallback(() => {
    // when style is number, unit is null
    const newScalebarOptions = notEmptyScalebarOptions.set('style', 'number').set('unit', null).set('decimalPlace', 0).set('thousandSeparator', false)
    updateScalebarOptions(newScalebarOptions)
  }, [notEmptyScalebarOptions, updateScalebarOptions])

  const onMetricUnitClick = React.useCallback(() => {
    const newScalebarOptions = notEmptyScalebarOptions.set('unit', 'metric')
    updateScalebarOptions(newScalebarOptions)
  }, [notEmptyScalebarOptions, updateScalebarOptions])

  const onImperialUnitClick = React.useCallback(() => {
    const newScalebarOptions = notEmptyScalebarOptions.set('unit', 'imperial')
    updateScalebarOptions(newScalebarOptions)
  }, [notEmptyScalebarOptions, updateScalebarOptions])

  const onDualUnitClick = React.useCallback(() => {
    const newScalebarOptions = notEmptyScalebarOptions.set('unit', 'dual')
    updateScalebarOptions(newScalebarOptions)
  }, [notEmptyScalebarOptions, updateScalebarOptions])

  const onDecimalPlaceChange = React.useCallback((value: number) => {
    if (value >= 0) {
      const newScalebarOptions = notEmptyScalebarOptions.set('decimalPlace', Math.floor(value))
      updateScalebarOptions(newScalebarOptions)
    }
  }, [notEmptyScalebarOptions, updateScalebarOptions])

  const onThousandSeparatorCheckboxChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const newScalebarOptions = notEmptyScalebarOptions.set('thousandSeparator', !!checked)
    updateScalebarOptions(newScalebarOptions)
  }, [notEmptyScalebarOptions, updateScalebarOptions])

  const domStyle = css`
  padding: 0 16px 16px 16px;

  .auto-scalebar-options-tip-row .jimu-widget-setting--row-label {
    margin-right: 0;
    max-width: 100%;
  }

  .scale-bar-styles {
    flex-direction: column;
  }

  .scale-bar-style {
    height: 42px;
    padding: 16px;
    cursor: pointer;
    text-align: center;
    background-color: var(--sys-color-action-input-field);
    border: 2px solid transparent;
  }

  .scale-bar-style.selected {
    border-color: var(--sys-color-action-selected);
  }

  .units {
    flex-direction: column;
  }
  `

  const scalebarStyleClassName = 'd-flex w-100 justify-content-center align-items-center scale-bar-style'


  return (
    <div className='scalebar-setting' css={domStyle}>
      <SettingRow level={1} tag='label' label={automaticLabel}>
        <Switch
          checked={isAutomatic}
          onChange={onAutomaticSwitchChange}
        />
      </SettingRow>

      {
        !rawScalebarOptions &&
        <SettingRow className='auto-scalebar-options-tip-row' label={autoScalebarOptionsTip} ></SettingRow>
      }

      {
        rawScalebarOptions &&
        <React.Fragment>
          <SettingRow tag='label' label={styleLabel} flow='wrap'>
            <div className='scale-bar-styles d-flex w-100'>
              <div className={classNames(scalebarStyleClassName, 'scale-bar-line-style', { selected: style === 'line' })} title={scaleBarLineLabel} onClick={onScalebarLineStyleClick}>
                <img src={require('../assets/scalebar_line.svg')} />
              </div>
              <div className={classNames(scalebarStyleClassName, 'scale-bar-ruler-style mt-2', { selected: style === 'ruler' })} title={scaleBarRulerLabel} onClick={onScalebarRulerStyleClick}>
                <img src={require('../assets/scalebar_ruler.svg')} />
              </div>
              <div className={classNames(scalebarStyleClassName, 'scale-bar-number-style mt-2', { selected: style === 'number' })} title={scaleBarNumberLabel} onClick={onScalebarNumberStyleClick}>
                <span>1:1000</span>
              </div>
            </div>
          </SettingRow>

          {
            (style === 'line' || style === 'ruler') &&
            <SettingRow tag='label' label={unitLabel} flow='wrap'>
              <div className='units d-flex' role='radiogroup' aria-label={unitLabel}>
                <Label className='metric-unit d-flex' title={metricLabel}>
                  <Radio
                    className='mr-2'
                    style={{ cursor: 'pointer' }}
                    onChange={onMetricUnitClick}
                    checked={unit === 'metric'}
                  />
                  {metricLabel}
                </Label>
                <Label className='imperial-unit d-flex' title={imperialLabel}>
                  <Radio
                    className='mr-2'
                    style={{ cursor: 'pointer' }}
                    checked={unit === 'imperial'}
                    onChange={onImperialUnitClick}
                  />
                  {imperialLabel}
                </Label>
                {
                  (style === 'line') && (
                    <Label className='dual-unit d-flex' title={dualLabel}>
                      <Radio
                        className='mr-2'
                        style={{ cursor: 'pointer' }}
                        checked={unit === 'dual'}
                        onChange={onDualUnitClick}
                      />
                      {dualLabel}
                    </Label>
                  )
                }
              </div>
            </SettingRow>
          }

          {
            (style === 'number') &&
            <React.Fragment>
              <SettingRow tag='label' label={decimalPlaceCountLabel} flow='wrap'>
                <NumericInput
                  className='w-100'
                  size='sm'
                  min={0}
                  max={10}
                  step={1}
                  value={typeof decimalPlace === 'number' ? decimalPlace : 0}
                  onChange={onDecimalPlaceChange}
                />
              </SettingRow>
              <Label className='d-flex mt-4'>
                <Checkbox
                  className='mr-2'
                  style={{ cursor: 'pointer' }}
                  checked={!!thousandSeparator}
                  onChange={onThousandSeparatorCheckboxChange}
                />
                {showThousandSeparatorsLabel}
              </Label>
            </React.Fragment>
          }
        </React.Fragment>
      }
    </div>
  )
}

function getDefaultNotEmptyScalebarOptions(): IMScalebarOptions {
  const scaleBarOptions: ScalebarOptions = {
    style: 'line',
    unit: 'metric',
    decimalPlace: 0,
    thousandSeparator: false
  }

  const result = Immutable(scaleBarOptions)
  return result
}