/** @jsx jsx */
import { jsx, React, type IMThemeVariables, type IntlShape } from 'jimu-core'
import { Switch } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import type { HighlightInfo } from '../../config'
import { ColorPicker } from './color-picker'
// nls
import nls from '../translations/default'
interface Props {
  highlightInfo: HighlightInfo
  onHighlightInfoChange?: (HighlightInfo) => void
  intl: IntlShape
  theme: IMThemeVariables
}

export const HighlightInfoSettings = React.memo((props: (Props)) => {
  const symbolColorTips = props.intl.formatMessage({ id: 'symbolColorTips', defaultMessage: nls.symbolColorTips })
  const compassOrientationTips = props.intl.formatMessage({ id: 'compassOrientationTips', defaultMessage: nls.compassOrientationTips })
  const locationAccuracyTips = props.intl.formatMessage({ id: 'locationAccuracyTips', defaultMessage: nls.locationAccuracyTips })

  const {
    symbolColor,
    showCompassOrientation,
    showLocationAccuracy
  } = props.highlightInfo

  const handleSymbolColorChange = (color) => {
    props.onHighlightInfoChange({ ...props.highlightInfo, symbolColor: color })
  }
  const handleCompassOrientationChange = () => {
    props.onHighlightInfoChange({ ...props.highlightInfo, showCompassOrientation: !showCompassOrientation })
  }
  const handleLocationAccuracyChange = (bl) => {
    props.onHighlightInfoChange({ ...props.highlightInfo, showLocationAccuracy: !showLocationAccuracy })
  }
  return (
    <React.Fragment>
      <div className='highlight-info-section' role='group' >
        {/* Symbol Color */}
        <SettingRow label={symbolColorTips} className='bold-font-label' >
          <ColorPicker
            className=''
            color={symbolColor}
            aria-label={symbolColorTips}
            onChange={handleSymbolColorChange}
          />
        </SettingRow>
        {/* Compass  Orientation */}
        <SettingRow tag='label' label={compassOrientationTips} className='bold-font-label' >
          <Switch checked={showCompassOrientation} onChange={handleCompassOrientationChange} />
        </SettingRow>
        <SettingRow tag='label' label={locationAccuracyTips} className='bold-font-label'>
          <Switch checked={showLocationAccuracy} onChange={handleLocationAccuracyChange} />
        </SettingRow>
      </div>
    </React.Fragment>
  )
})
