import { React, hooks } from 'jimu-core'
import { Select, defaultMessages as jimuUiDefaultMessages, DistanceUnits, type LinearUnit, type ButtonProps } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { InputUnit } from 'jimu-ui/advanced/style-setting-components'
import type { SettingChangeFunction } from 'jimu-for-builder'
import type { IMConfig, AvatarProps } from '../config'
import { DEFAULT_ICON_SIZE, WIDGET_BUTTON_SIZES } from '../common/consts'
import defaultMessages from './translations/default'

interface SettingSizeProps {
  id: string
  config: IMConfig
  onSettingChange: SettingChangeFunction
}


const SettingSize = (props: SettingSizeProps) => {
  const { id, config, onSettingChange } = props
  const size = config?.appearance.card?.avatar?.size
  const iconSize = config?.appearance.card?.avatar?.iconSize
  const buttonSize = config?.appearance.card?.avatar?.buttonSize

  const translate = hooks.useTranslation(jimuUiDefaultMessages, defaultMessages)

  const handleSizeChange = (evt: any, value?: AvatarProps['size']) => {
    let newConfig = config.setIn(['appearance', 'card', 'avatar', 'size'], value)
    if (value === 'custom') {
      const prevSize = size as ButtonProps['size']
      newConfig = newConfig.setIn(['appearance', 'card', 'avatar', 'buttonSize'], WIDGET_BUTTON_SIZES[prevSize])
      newConfig = newConfig.setIn(['appearance', 'card', 'avatar', 'iconSize'], DEFAULT_ICON_SIZE)
    } else {
      newConfig = newConfig.setIn(['appearance', 'card', 'avatar', 'buttonSize'], null)
      newConfig = newConfig.setIn(['appearance', 'card', 'avatar', 'iconSize'], null)
    }
    onSettingChange({
      id,
      config: newConfig
    })
  }

  const handleIconSizeChange = (value: LinearUnit) => {
    onSettingChange({
      id,
      config: config.setIn(['appearance', 'card', 'avatar', 'iconSize'], value.distance)
    })
  }

  const handleButtonSizeChange = (value: LinearUnit) => {
    onSettingChange({
      id,
      config: config.setIn(['appearance', 'card', 'avatar', 'buttonSize'], value.distance)
    })
  }

  return (<React.Fragment>
    <SettingRow flow='no-wrap' label={translate('iconSizeOverride')} truncateLabel>
      <Select
        size='sm'
        aria-label={translate('iconSizeOverride')}
        value={size}
        onChange={handleSizeChange}
        className='w-50'
      >
        <option value='sm'>{translate('small')}</option>
        <option value='default'>{translate('medium')}</option>
        <option value='lg'>{translate('large')}</option>
        <option value='custom'>{translate('custom')}</option>
      </Select>
    </SettingRow>
    {size === 'custom' && <React.Fragment>
      <SettingRow label={translate('iconSize')} flow='no-wrap' truncateLabel>
        <InputUnit
          aria-label={translate('iconSize')}
          precision={0}
          applyDefaultValue={false}
          className='w-50'
          min={0}
          value={{ distance: iconSize, unit: DistanceUnits.PIXEL }}
          onChange={handleIconSizeChange}
        />
      </SettingRow>
      <SettingRow label={translate('buttonSize')} flow='no-wrap' truncateLabel>
        <InputUnit
          aria-label={translate('buttonSize')}
          precision={0}
          applyDefaultValue={false}
          className='w-50'
          min={10}
          value={{ distance: buttonSize, unit: DistanceUnits.PIXEL }}
          onChange={handleButtonSizeChange}
        />
      </SettingRow>
    </React.Fragment>}
  </React.Fragment>)
}

export default SettingSize
