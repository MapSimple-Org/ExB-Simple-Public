import { React } from 'jimu-core'

export const MockNumericInput = (props) => {
  const { onAcceptValue, onChange, ...others } = props
  const [value, setValue] = React.useState()
  const handleChange = (e): void => {
    setValue(e.target.value)
    onChange?.(e.target.value)
  }
  const handleBlur = (): void => {
    onAcceptValue(value)
  }

  return (
    <input
      type='number'
      onChange={handleChange}
      onBlur={handleBlur}
      className='jimu-input jimu-input-sm jimu-numeric-input jimu-numeric-input-input'
      {...others}
    />
  )
}
