/** @jsx jsx */
import { jsx, React, hooks, lodash, Immutable } from 'jimu-core'
import type { ImmutableArray, UseDataSource } from 'jimu-core'
import { defaultMessages as jimuLayoutsDefaultMessages } from 'jimu-layouts/layout-runtime'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { BackgroundSetting, BorderSetting, BorderRadiusSetting, type BorderSide } from 'jimu-ui/advanced/style-setting-components'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { type BorderStyle, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import type { IMConfig, Status } from '../../../config'
import DynamicStyleSetting from './list-dynamic-style-setting'
import { colorUtils, getTheme2 } from 'jimu-theme'

import defaultMessages from '../../translations/default'

const { Fragment } = React

interface Props {
  id: string
  config: IMConfig
  isClearBorder?: boolean
  showCardSetting: Status
  useDataSources: ImmutableArray<UseDataSource>
  onSettingChange: SettingChangeFunction
  onSettingChangeAndUpdateUsedFieldsOfDs: (config?: IMConfig) => void
}

const CardBackgroundSetting = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessages, jimuUIDefaultMessages, jimuLayoutsDefaultMessages)
  const { isClearBorder, id, config, showCardSetting, useDataSources } = props
  const { onSettingChange, onSettingChangeAndUpdateUsedFieldsOfDs } = props

  const onBackgroundStyleChange = hooks.useEventCallback((status: Status, key, value) => {
    const newConfig = config.setIn(
      ['cardConfigs', status, 'backgroundStyle', key],
      value
    )
    onSettingChange({
      id: id,
      config: newConfig
    })
  })

  const onBorderStyleChange = hooks.useEventCallback((status: Status, value: BorderStyle) => {
    const borderStyle = {
      border: value
    }
    const newConfig = config.setIn(['cardConfigs', status, 'backgroundStyle', 'border'], borderStyle)
    const options = {
      id: id,
      config: newConfig
    }
    onSettingChange(options)
  })

  const updateSideBorder = (side: BorderSide, border: BorderStyle, status: Status) => {
    let borderStyle = config.cardConfigs[status].backgroundStyle?.border || Immutable({})
    borderStyle = (borderStyle as any).set(lodash.camelCase(`border-${side}`), border).without('border').without('color').without('type').without('width')
    const newConfig = config.setIn(['cardConfigs', status, 'backgroundStyle', 'border'], borderStyle)
    const options = {
      id: id,
      config: newConfig
    }
    onSettingChange(options)
  }

  const borderStyle = React.useMemo(() => {
    return config.cardConfigs?.[showCardSetting]?.backgroundStyle?.border?.asMutable({ deep: true })
  }, [config.cardConfigs, showCardSetting])

  const handleForegroundChange = React.useCallback((foreground: string) => {
    onBackgroundStyleChange(showCardSetting, 'textColor', foreground)
  }, [onBackgroundStyleChange, showCardSetting])

  const handleBackgroundChange = React.useCallback((status: Status, background) => {
    const fg = colorUtils.getReadableThemeColor(background.color, getTheme2())
    const newConfig = config
      .setIn(['cardConfigs', status, 'backgroundStyle', 'background'], background)
      .setIn(['cardConfigs', status, 'backgroundStyle', 'textColor'], fg)

    onSettingChange({
      id: id,
      config: newConfig
    })
  }, [config, id, onSettingChange])

  return (
    <Fragment>
      <SettingSection className={`clear-padding ${isClearBorder && 'clear-border clear-padding-bottom'}`}>
        <SettingRow label={nls('background')} flow='wrap' role='group' aria-label={nls('background')}>
          <BackgroundSetting
            background={
              config.cardConfigs[showCardSetting].backgroundStyle.background
            }
            hasForeground
            onForegroundChange={handleForegroundChange}
            foreground={config.cardConfigs[showCardSetting].backgroundStyle?.textColor}
            onChange={value => { handleBackgroundChange(showCardSetting, value) }}
          />
        </SettingRow>
      </SettingSection>
      <SettingSection className={`clear-padding ${isClearBorder && 'clear-border clear-padding-bottom'}`}>
        <SettingRow label={nls('border')} flow='wrap' role='group' aria-label={nls('border')}>
          <BorderSetting
            value={((borderStyle as any)?.width ? borderStyle as any : borderStyle?.border) || null}
            top={borderStyle?.borderTop || null}
            left={borderStyle?.borderLeft || null}
            right={borderStyle?.borderRight || null}
            bottom={borderStyle?.borderBottom || null}
            applyDefaultValue
            onChange={value => { onBorderStyleChange(showCardSetting, value) }}
            onSideChange={(side, border) => { updateSideBorder(side, border, showCardSetting) }}
          />
        </SettingRow>
        <SettingRow label={nls('borderRadius')} flow='wrap' role='group' aria-label={nls('borderRadius')}>
          <BorderRadiusSetting
            applyDefaultValue={false}
            value={
              config.cardConfigs[showCardSetting].backgroundStyle.borderRadius
            }
            onChange={value => {
              onBackgroundStyleChange(showCardSetting, 'borderRadius', value)
            }}
          />
        </SettingRow>
      </SettingSection>
      <SettingSection className={`clear-padding ${isClearBorder && 'clear-border'}`}>
        <SettingRow>
          <DynamicStyleSetting
            id={id}
            useDataSources={useDataSources}
            status={showCardSetting}
            config={config}
            onSettingChange={onSettingChange}
            onSettingChangeAndUpdateUsedFieldsOfDs={onSettingChangeAndUpdateUsedFieldsOfDs}
          />
        </SettingRow>
      </SettingSection>
      {/* <SettingRow label="Box shadow" flow="wrap">
        <BoxShadowSetting
          value={config.cardConfigs[showCardSetting].backgroundStyle.boxShadow}
          onChange={value => this.onBackgroundStyleChange(showCardSetting, 'boxShadow', value)} />
      </SettingRow> */}
    </Fragment>
  )
}
export default CardBackgroundSetting