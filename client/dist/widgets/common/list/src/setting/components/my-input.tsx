import { React, classNames } from 'jimu-core'
import { NumericInput } from 'jimu-ui'

interface Props {
  value?: number
  disabled?: boolean
  min?: number
  max?: number
  onAcceptValue?: (value: number) => void
  onChange?: (value: number) => void
  className?: string
  style?: any
  title?: string
}

interface State {
  value?: number
}

export class MyNumericInput extends React.PureComponent<Props, State> {
  onChangeTimeout = null
  constructor (props) {
    super(props)

    this.state = {
      value: props.value
    }
  }

  componentDidUpdate (preProps) {
    if (this.props.value !== preProps.value) {
      const { value } = this.props
      this.setState({
        value: value
      })
    }
  }

  onChange = (value) => {
    this.setState({ value: value })
    if (this.props.onChange) {
      clearTimeout(this.onChangeTimeout)
      this.onChangeTimeout = setTimeout(() => {
        this.props.onChange(value)
      }, 200)
    }
  }

  onTextInputChange = () => {
    const { onAcceptValue } = this.props
    onAcceptValue && onAcceptValue(this.state.value)
  }

  render () {
    const { min, max, className, style, disabled, title } = this.props
    return (
      <NumericInput
        className={classNames(className, 'my-input')}
        value={this.state.value}
        min={min}
        max={max}
        title={title}
        style={style}
        disabled={disabled}
        precision={0}
        type='number'
        size='sm'
        onChange={this.onChange}
        onAcceptValue={value => { this.onTextInputChange() }}
      />
    )
  }
}
