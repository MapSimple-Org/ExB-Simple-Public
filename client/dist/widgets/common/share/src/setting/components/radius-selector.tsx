/** @jsx jsx */
import { React, jsx, css, type IMThemeVariables, polished } from 'jimu-core'
import { IconRadius } from '../../config'

export interface RadiusSelectorProps {
  radius: IconRadius
  btnRad: IconRadius

  title?: string
  className?: string
  theme: IMThemeVariables
  onClick: (IconRadius) => void
}

export class RadiusSelector extends React.PureComponent<RadiusSelectorProps> {
  getStyle (theme) {
    const white = theme ? theme.ref.palette.white : ''
    const cyan500 = theme ? theme.sys.color.info.main : ''
    const gray900 = theme ? theme.sys.color.secondary.main : ''
    return css`
      background-color: ${white};
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      width: ${polished.rem(28)};
      height: ${polished.rem(28)};
      margin: 2px;
      &.active{
        outline: 2px ${cyan500} solid;
      }
      .inner {
        width: 66%;
        height: 66%;
        border: 1px ${gray900} solid;
        border-radius: 2px;
        /*&.circle {
          border-radius: 50%;
        }*/
      }
    `
  }

  _getBorderRadius4Setting = (radius) => {
    let r
    if (IconRadius.Rad00 === radius) {
      r = 0
    } else if (IconRadius.Rad20 === radius) {
      r = '4px'
    } else if (IconRadius.Rad50 === radius) {
      r = '50%'
    }

    return r
  }

  _isActive = () => {
    if (this.props.radius === this.props.btnRad) {
      return 'active'
    } else {
      return ''
    }
  }

  render () {
    const borderRadius = this._getBorderRadius4Setting(this.props.radius)

    return (
      <div
        css={this.getStyle(this.props.theme)} onClick={this.props.onClick} title={'border radius: ' + borderRadius}
        className={'choose-shape ' + this._isActive()}
      >
        <div className='inner' style={{ borderRadius: borderRadius }} />
      </div>
    )
  }
}
