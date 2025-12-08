/** @jsx jsx */
import { React, jsx, useIntl } from 'jimu-core'
import { Label, Select, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import { FlyItemMode, DefaultSpeedOptions } from '../../config'

export interface Props {
  mode: FlyItemMode
  speed: DefaultSpeedOptions
  onChange: (speed: number) => void
}

export const DefaultSpeedSelector = React.memo((props: Props) => {
  const intl = useIntl()

  const onSelectorChange = (e) => {
    const selectorVal = e.target.value

    props.onChange(selectorVal)
  }

  const rotateSpeed = intl.formatMessage({ id: 'rotateSpeed', defaultMessage: defaultMessages.rotateSpeed })
  const pathSpeed = intl.formatMessage({ id: 'pathSpeed', defaultMessage: defaultMessages.pathSpeed })

  const slowLabel = intl.formatMessage({ id: 'slow', defaultMessage: jimuUIMessages.slow })
  const defaultLabel = intl.formatMessage({ id: 'default', defaultMessage: jimuUIMessages.default })
  const fastLabel = intl.formatMessage({ id: 'fast', defaultMessage: jimuUIMessages.fast })

  const tipLabel = ((props.mode === FlyItemMode.Rotate) ? rotateSpeed : pathSpeed)

  return (
    <React.Fragment>

      <SettingRow>
        <Label className='fly-style-label'>{tipLabel}</Label>
      </SettingRow>
      <SettingRow className='mt-2 radio-wrapper'>
        <Select value={props.speed} onChange={onSelectorChange} size='sm' aria-label={tipLabel}>
          <option value={DefaultSpeedOptions.SLOW}>{slowLabel}</option>
          <option value={DefaultSpeedOptions.DEFAULT}>{defaultLabel}</option>
          <option value={DefaultSpeedOptions.FAST}>{fastLabel}</option>
        </Select>
      </SettingRow>

    </React.Fragment>
  )
})
