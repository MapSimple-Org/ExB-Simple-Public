/** @jsx jsx */
import { css, jsx, React, useIntl } from 'jimu-core'
import { NumericInput, defaultMessages } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import type { MDecimalPlaces } from 'jimu-ui/advanced/map'

interface Props {
  decimalPlaces: MDecimalPlaces
  onDecimalPlacesChange: (mDecimalPlaces: MDecimalPlaces) => void
}

export const MeasurementsDecimalPlaces = React.memo((props: (Props)) => {
  const handleMDecimalChange = (value: number, mode: string): void => {
    let res
    switch (mode) {
      case 'point': {
        res = { ...props.decimalPlaces, ...{ point: value } }
        break
      }
      case 'line': {
        res = { ...props.decimalPlaces, ...{ line: value } }
        break
      }
      case 'area': {
        res = { ...props.decimalPlaces, ...{ area: value } }
        break
      }

      default: {
        throw new Error()
      }
    }

    props.onDecimalPlacesChange(res)
  }

  const getStyle = () => {
    return css`
      .decimal-title {
        .jimu-widget-setting--row-label{
          max-width: 100%;
        }
      }

      .inputs {
        .jimu-widget-setting--row-label{
          width: auto !important;
          margin-bottom: 0;
        }
        .numeric-input {
          width: 56px;
        }
      }
    `
  }

  const decimalPlacesTips = useIntl().formatMessage({ id: 'decimalPlaces', defaultMessage: defaultMessages.decimalPlaces })
  const pointTips = useIntl().formatMessage({ id: 'drawModePoint', defaultMessage: defaultMessages.drawModePoint })
  const lineTips = useIntl().formatMessage({ id: 'drawModeLine', defaultMessage: defaultMessages.drawModeLine })
  const areaTips = useIntl().formatMessage({ id: 'drawToolAreaTip', defaultMessage: defaultMessages.drawToolAreaTip })
  return (<div css={getStyle()} className='d-block w-100' role='group' aria-label={decimalPlacesTips}>
    <SettingRow label={decimalPlacesTips} className='w-100 mb-2 mt-2 decimal-title bold-font-label'></SettingRow>
    <div className='inputs'>
      {/* 1.point */}
      <SettingRow flow='wrap' label={pointTips} className='w-100'>
        <NumericInput size='sm' className='numeric-input'
          aria-label={pointTips}
          precision={0} min={0} max={10}
          value={props.decimalPlaces.point}
          onChange={val => { handleMDecimalChange(val, 'point') }}
        />
      </SettingRow>
      {/* 2.line */}
      <SettingRow flow='wrap' label={lineTips} className='w-100 mt-2'>
        <NumericInput size='sm' className='numeric-input'
          aria-label={lineTips}
          precision={0} min={0} max={10}
          value={props.decimalPlaces.line}
          onChange={val => { handleMDecimalChange(val, 'line') }}
        />
      </SettingRow>
      {/* 1.area */}
      <SettingRow flow='wrap' label={areaTips} className='w-100 mt-2'>
        <NumericInput size='sm' className='numeric-input'
          aria-label={areaTips}
          precision={0} min={0} max={10}
          value={props.decimalPlaces.area}
          onChange={val => { handleMDecimalChange(val, 'area') }}
        />
      </SettingRow>
    </div>
  </div>)
})
