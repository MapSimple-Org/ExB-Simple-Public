/** @jsx jsx */
import { React, css, jsx, type IMThemeVariables, polished } from 'jimu-core'
import type { PointStyle } from '../../config'
import { TextInput, Slider, Button } from 'jimu-ui'
export interface Props {
  value?: number
  onChange?: (value: number) => void
  className?: string
  theme: IMThemeVariables
  pointStyle: PointStyle
  intl: (key: string) => string
}

interface State {
  value: number
  rangeValue: number
}

const STEP = 1
const MIN = 0
const MAX = 100
const AMOUNT = MAX / STEP - 1
const MIN_RATIO = 3 //Minimum 3 times the width of the line
const MAX_RATIO = 5 //Maximum to 3 times the width of the line
export class RangeInput extends React.PureComponent<Props, State> {
  updateConfigTimeout: any
  preRangeValue: number
  constructor (props) {
    super(props)
    this.state = {
      value: props?.value || 0,
      rangeValue: this.getRangeValue(props?.value || 0)
    }
  }

  componentWillUnmount () {
    clearTimeout(this.updateConfigTimeout)
  }

  componentDidUpdate(prevProps: Readonly<Props>, prevState: Readonly<State>): void {
    const rangeValue = this.getRangeValue(this.props.value || 0)
    if (rangeValue !== this.state.rangeValue && prevState.rangeValue === this.state.rangeValue) {
      this.setState({
        value: this.props.value,
        rangeValue: this.getRangeValue(this.props.value)
      })
    }
  }

  getStyle = () => {
    const { theme } = this.props
    return css`
      .scale-con {
        & {
          width: 100%;
          top: ${polished.rem(-2)};
        }
        span {
          height: ${polished.rem(3)};
          width: 1px;
          background: ${theme?.ref.palette?.neutral[700]};
        }
      }
      .range-number-inp {
        width: ${polished.rem(46)};
      }
      .style-setting--unit-selector {
        height: 26px;
        min-width: 0;
        padding: 0;
        margin-left: 0;
        font-size: 12px;

        border-top-right-radius: 2px;
        border-bottom-right-radius: 2px;

        border-top-left-radius: 0px;
        border-bottom-left-radius: 0px;

        width: 26px;
      }
    `
  }

  getScale = () => {
    const scaleData = []
    for (let i = 0; i < AMOUNT; i++) {
      scaleData.push(
        <span
          className='position-absolute'
          key={i}
          style={{ left: `${(i + 1) * STEP}%` }}
        />
      )
    }
    return (
      <div className='scale-con position-absolute left-0 right-0'>
        {scaleData}
      </div>
    )
  }

  onChange = (e) => {
    const val = e.target.value
    if (!this.checkNumber(val) || val === this.preRangeValue) return false
    if (Number(val) < 0 || Number(val) > 100) return false
    const value = val / 100
    const pointSize = value * (MAX_RATIO - MIN_RATIO) + MIN_RATIO
    const rangeValue = this.getRangeValue(pointSize)
    this.setState({
      value: pointSize,
      rangeValue: rangeValue
    })
    this.preRangeValue = val
    clearTimeout(this.updateConfigTimeout)
    this.updateConfigTimeout = setTimeout(() => {
      this?.props?.onChange(pointSize)
    }, 100)
  }

  getRangeValue = (value) => {
    const rangeValue = ((value - MIN_RATIO) * 100) / (MAX_RATIO - MIN_RATIO)
    return rangeValue > 0 ? rangeValue : 0
  }

  checkNumber = (value, minimum: number = 0): boolean => {
    if (value?.length === 0) return true
    if (isNaN(Number(value))) {
      return false
    } else {
      const numberVal = Number(value)
      return Number.isInteger(numberVal) && numberVal >= minimum
    }
  }

  render () {
    const { intl } = this.props
    const { rangeValue } = this.state
    return (
      <div className='range-input w-100 position-relative d-flex align-items-center' css={this.getStyle()}>
        {/* {this.getScale()} */}
        <div className='flex-grow-1'>
          <Slider
            title={intl('dividerSize')}
            value={rangeValue}
            min={MIN}
            max={MAX}
            step={STEP}
            aria-valuemin={MIN}
            aria-valuemax={MAX}
            aria-valuenow={rangeValue}
            className='slider mr-2'
            onChange={this.onChange}
          />
        </div>
        <div className='d-flex align-items-center'>
          <TextInput
            size='sm'
            className='ml-4 range-number-inp flex-grow-1'
            value={rangeValue.toFixed()}
            onChange={this.onChange}
          />
          <Button disabled className='d-flex align-items-center justify-content-center style-setting--unit-selector'>%</Button>
        </div>
      </div>
    )
  }
}
