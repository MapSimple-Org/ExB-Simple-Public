/** @jsx jsx */
import { jsx, type IMThemeSliderVariant, css, hooks, type ThemeSliderVariant, Immutable } from 'jimu-core'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { Tabs, Tab, defaultMessages } from 'jimu-ui'
import { useTheme2 } from 'jimu-theme'

export interface SliderStyleSettingProps {
  hideThumb?: boolean
  variant?: IMThemeSliderVariant
  onChange?: (variant: IMThemeSliderVariant) => void
}

const state = 'default'

const style = css`
  .tab-title-item{
    width: 33%;
  }
`

export const SliderStyleSetting = (props: SliderStyleSettingProps) => {
  const appTheme = useTheme2()
  const {
    hideThumb,
    variant = Immutable({}) as IMThemeSliderVariant,
    onChange
  } = props
  const translate = hooks.useTranslation(defaultMessages)
  const trackBg = variant?.track?.bg
  const progress = variant?.progress?.[state]
  const thumb = variant?.thumb?.[state]

  const onVariantChange = (variant: IMThemeSliderVariant) => {
    if (Object.keys(variant).length) {
      onChange(variant)
    } else {
      onChange(null)
    }
  }

  const onProgressTrackColorChange = (path: string[], rootKey: keyof ThemeSliderVariant, value: string) => {
    if (value) {
      onVariantChange(variant.setIn(path, value))
    } else {
      onVariantChange(variant.without(rootKey))
    }
  }

  const onThumbChange = (type: 'bg' | 'border', value: string) => {
    if (value) {
      onVariantChange(variant.setIn(type === 'bg' ? ['thumb', state, 'bg'] : ['thumb', state, 'border', 'color'], value))
    } else {
      const newState = variant?.thumb?.[state]?.without(type)
      if (Object.keys(newState).length) {
        onVariantChange(variant.setIn(['thumb', state], newState))
      } else {
        onVariantChange(variant.without('thumb'))
      }
    }
  }

  return <SettingRow>
    <Tabs type='pills' className="flex-grow-1 w-100 h-100" fill css={style} defaultValue='active' >
      <Tab id="active" title={translate('active')} className="tab-title-item">
        <SettingRow className="mt-2" label={translate('color')} aria-label={translate('color')} flow="no-wrap">
          <ThemeColorPicker specificTheme={appTheme} value={progress?.bg} onChange={(value) => { onProgressTrackColorChange(['progress', state, 'bg'], 'progress', value) }} />
        </SettingRow>
      </Tab>
      {!hideThumb && <Tab id="thumb" title={translate('thumb')} className="tab-title-item">
        <SettingRow className="mt-2" label={translate('fill')} aria-label={translate('fill')} flow="no-wrap">
          <ThemeColorPicker specificTheme={appTheme} value={thumb?.bg} onChange={(value) => { onThumbChange('bg', value) }} />
        </SettingRow>
        <SettingRow label={translate('border')} aria-label={translate('border')} flow="no-wrap">
          <ThemeColorPicker specificTheme={appTheme} value={thumb?.border?.color} onChange={(value) => { onThumbChange('border', value) }} />
        </SettingRow>
      </Tab>}
      <Tab id="inactive" title={translate('inactive')} className="tab-title-item">
        <SettingRow className="mt-2" label={translate('color')} aria-label={translate('color')} flow="no-wrap">
          <ThemeColorPicker specificTheme={appTheme} value={trackBg} onChange={(value) => { onProgressTrackColorChange(['track', 'bg'], 'track', value) }} />
        </SettingRow>
      </Tab>
    </Tabs>
  </SettingRow>
}
