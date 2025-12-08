/** @jsx jsx */
import { React, Immutable, jsx, type IntlShape, type ImmutableObject, lodash } from 'jimu-core'
import { CollapsableResetPanel, SettingRow } from 'jimu-ui/advanced/setting-components'
import { type StyleSettings, defaultMessages as jimuUIMessages, type BackgroundStyle, type BorderStyle, type FourSidesUnit } from 'jimu-ui'
import { BoxShadowSetting, BorderSetting, BorderRadiusSetting, BackgroundSetting, type BorderSide } from 'jimu-ui/advanced/style-setting-components'
import { isObjectEmpty } from '../index'

interface Props {
  onChange: (style: ImmutableObject<StyleSettings>) => void
  style: ImmutableObject<StyleSettings>
  intl: IntlShape
  disableBorderRadius?: boolean
}

const isValueEmpty = (v) => v === null || v === undefined || v === ''

export const isBackgroundEmpty = (background: ImmutableObject<BackgroundStyle>) => {
  if (!background) return true
  const isEmpty = isValueEmpty(background.color) && isObjectEmpty(background.image)
  return isEmpty
}

export default class CommonStyleSetting extends React.PureComponent<Props> {
  getStyleSettings (): ImmutableObject<StyleSettings> {
    return this.props.style ? this.props.style : Immutable({} as StyleSettings)
  }

  onBackgroundStyleChange = bg => {
    let background = Immutable(this.props.style?.background ?? {} as BackgroundStyle)
    for (const key in bg) {
      switch (key) {
        case 'fillType':
          if (background.fillType !== bg[key]) {
            background = background.set('fillType', bg[key])
          }
          break
        case 'color':
          background = background.set('color', bg[key])
          break
        case 'image':
          background = background.set('image', bg[key])
          break
      }
    }

    this.props.onChange(this.getStyleSettings().set('background', background))
  }

  resetBackground = () => {
    this.props.onChange(this.getStyleSettings().without('background'))
  }

  updateBorder = (border: BorderStyle) => {
    this.props.onChange(this.getStyleSettings()
      .set('border', border)
      .without('borderTop')
      .without('borderLeft')
      .without('borderRight')
      .without('borderBottom')
    )
  }

  updateSideBorder = (side: BorderSide, border: BorderStyle) => {
    this.props.onChange(this.getStyleSettings().set(lodash.camelCase(`border-${side}`), border).without('border'))
  }

  resetBorder = () => {
    this.props.onChange(this.getStyleSettings()
      .without('border')
      .without('borderTop')
      .without('borderLeft')
      .without('borderRight')
      .without('borderBottom')
    )
  }

  updateRadius = (radius: ImmutableObject<FourSidesUnit>) => {
    if (!radius.number[0] && !radius.number[1] && !radius.number[2] && !radius.number[3]) {
      this.resetRadius()
    } else {
      this.props.onChange(this.getStyleSettings().set('borderRadius', radius))
    }
  }

  resetRadius = () => {
    this.props.onChange(this.getStyleSettings().without('borderRadius'))
  }

  updateShadow = shadow => {
    this.props.onChange(this.getStyleSettings().set('boxShadow', shadow))
  }

  render () {
    const style = this.props.style || Immutable({} as StyleSettings)
    const { intl, disableBorderRadius } = this.props

    const backgroundString = intl.formatMessage({ id: 'background', defaultMessage: jimuUIMessages.background })
    const borderString = intl.formatMessage({ id: 'border', defaultMessage: jimuUIMessages.border })
    const borderRadiusString = intl.formatMessage({ id: 'borderRadius', defaultMessage: jimuUIMessages.borderRadius })
    const shadowString = intl.formatMessage({ id: 'shadow', defaultMessage: jimuUIMessages.shadow })

    const isBorderEmpty = isObjectEmpty(style.border) &&
      isObjectEmpty(style.borderTop) &&
      isObjectEmpty(style.borderLeft) &&
      isObjectEmpty(style.borderRight) &&
      isObjectEmpty(style.borderBottom)
    const isBorderRadiusEmpty = isObjectEmpty(style.borderRadius)

    return (
      <React.Fragment>
        <SettingRow>
          <CollapsableResetPanel label={backgroundString} isEmpty={isBackgroundEmpty(style.background)} bottomLine keepMount onReset={this.resetBackground}>
            <BackgroundSetting background={style.background} applyDefaultValue={false} onChange={this.onBackgroundStyleChange} />
          </CollapsableResetPanel>
        </SettingRow>
        <SettingRow>
          <CollapsableResetPanel
            label={borderString}
            isEmpty={isBorderEmpty}
            bottomLine
            keepMount
            onReset={this.resetBorder}
          >
            <BorderSetting
              value={style.border}
              top={style.borderTop}
              left={style.borderLeft}
              right={style.borderRight}
              bottom={style.borderBottom}
              applyDefaultValue={false}
              onChange={this.updateBorder}
              onSideChange={this.updateSideBorder}
            />
          </CollapsableResetPanel>
        </SettingRow>
        {!disableBorderRadius && <SettingRow>
          <CollapsableResetPanel label={borderRadiusString} isEmpty={isBorderRadiusEmpty} bottomLine keepMount onReset={ this.resetRadius}>
            <BorderRadiusSetting
              value={style.borderRadius}
              applyDefaultValue={false}
              onChange={this.updateRadius}
            />
          </CollapsableResetPanel>
        </SettingRow>}
        <SettingRow>
          <CollapsableResetPanel label={shadowString} isEmpty={isObjectEmpty(style.boxShadow)} keepMount onReset={() => { this.updateShadow(null) }}>
            <BoxShadowSetting value={style.boxShadow} applyDefaultValue={false} onChange={this.updateShadow} />
          </CollapsableResetPanel>
        </SettingRow>
      </React.Fragment>
    )
  }
}
