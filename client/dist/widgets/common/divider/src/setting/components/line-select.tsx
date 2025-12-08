/** @jsx jsx */
import { React, css, jsx, classNames, type IntlShape, polished } from 'jimu-core'
import { Select, Option } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { LineStyle, Direction } from '../../config'
import { getStrokeStyle } from '../../common/template-style'
export interface LineStyleProps {
  value: LineStyle
  onChange?: (value: LineStyle) => void
  className?: string
  style?: any
}

interface ExtraProps {
  intl: IntlShape
}
interface SelectionOption {
  style: any
  value: LineStyle
}

interface LineTitle {
  [key: string]: string
}

export class LineStyleSelector extends React.PureComponent<
LineStyleProps & ExtraProps
> {
  lineTitle: LineTitle

  constructor (props) {
    super(props)
    this.lineTitle = {
      Style0: this.nls('strokeSolid'),
      Style1: this.nls('strokeDashed'),
      Style2: this.nls('strokeDotted'),
      Style3: this.nls('strokeDashdotted'),
      Style6: this.nls('strokeLongDashed'),
      Style7: this.nls('strokeDouble'),
      Style8: this.nls('strokeThinThick'),
      Style9: this.nls('strokeThickThin'),
      Style10: this.nls('strokeTriple')
    }
  }

  static defaultProps: Partial<LineStyleProps & ExtraProps> = {
    value: LineStyle.Style0,
    onChange: () => null
  }

  _onLineStyleChange (e) {
    const value = e.target.value
    this.props.onChange(value)
  }

  nls = (id: string) => {
    return this.props.intl
      ? this.props.intl.formatMessage({
        id: id,
        defaultMessage: defaultMessages[id]
      })
      : id
  }

  getLineStyles = (): SelectionOption[] => {
    const styleData: SelectionOption[] = []
    const strokeStyle = getStrokeStyle(
      '2px',
      '#fff',
      Direction.Horizontal,
      true
    )
    for (const key in strokeStyle) {
      styleData.push({
        style: strokeStyle[key],
        value: key as LineStyle
      })
    }
    return styleData
  }

  getStyle = () => {
    return css`
      & {
        width: ${polished.rem(84)};
      }
    `
  }

  render () {
    const { value, className, style } = this.props
    const commonOptionCss = css`
      width: 100%;
      margin: 6px 0;
    `
    return (
      <div
        className={classNames(className, 'style-setting--line-style-selector')}
        style={style}
        css={this.getStyle()}
      >
        <Select
          size='sm'
          name='lineType'
          value={value}
          title={this.lineTitle[value]}
          onChange={this._onLineStyleChange.bind(this)}
          aria-label={this.lineTitle[value]}
        >
          {this.getLineStyles().map((ls, index) => (
            <Option
              aria-label={ls.value}
              tabIndex={index}
              role='option'
              key={index}
              value={ls.value}
              title={this.lineTitle[ls.value]}
            >
              <div css={[ls.style, commonOptionCss]} />
            </Option>
          ))}
        </Select>
      </div>
    )
  }
}
