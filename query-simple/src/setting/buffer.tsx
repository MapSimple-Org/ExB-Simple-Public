/** @jsx jsx */
import { React, jsx, css, hooks } from 'jimu-core'
import { Switch, NumericInput, Select, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from './translations/default'
import { UnitType } from '../config'

interface Props {
  enabled: boolean
  distance: number
  unit: UnitType
  onEnableChanged: (value: boolean) => void
  onDistanceChanged: (distance: number) => void
  onUnitChanged: (unit: UnitType) => void
}

export function BufferSetting (props: Props) {
  const { enabled, distance, unit, onEnableChanged, onDistanceChanged, onUnitChanged } = props
  const getI18nMessage = hooks.useTranslation(jimuUIMessages, defaultMessages)

  return (
    <React.Fragment>
      <SettingRow tag='label' label={getI18nMessage('enableBuffer')}>
        <Switch
          checked={enabled}
          onChange={(e) => { onEnableChanged(e.target.checked) }}
        />
      </SettingRow>
      {enabled && (
        <React.Fragment>
          <SettingRow label={getI18nMessage('defaultDistance')}>
            <NumericInput
              css={css`
                flex: 0 0 40%;
              `}
              aria-label={getI18nMessage('defaultDistance')}
              className='w-100'
              size='sm'
              value={distance}
              onChange={(value) => { onDistanceChanged(value) }}
            />
          </SettingRow>
          <SettingRow label={getI18nMessage('defaultUnit')}>
            <Select
              css={css`
                flex: 0 0 40%;
              `}
              size='sm'
              value={unit}
              aria-label={getI18nMessage('defaultUnit')}
              onChange={(e) => { onUnitChanged(e.target.value) }}
            >
              {Object.values(UnitType).map((value) => (
                <option key={value} value={value}>
                  {getI18nMessage(`unit_${value}`)}
                </option>
              ))}
            </Select>
          </SettingRow>
        </React.Fragment>
      )}
    </React.Fragment>
  )
}
