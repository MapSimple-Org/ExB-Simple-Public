import { React } from 'jimu-core'

export const MockNumericInput = (props) => {
  const { onAcceptValue, ...others } = props
  const [value, setValue] = React.useState('')
  const handleChange = (e): void => {
    setValue(e.target.value)
  }
  const handleKeydown = (e): void => {
    if (e?.key === 'Enter') {
      onAcceptValue?.(+value)
    }
  }
  const handleBlur = (): void => {
    onAcceptValue?.(+value)
  }
  return (
    <input
      type='number'
      onChange={handleChange}
      onKeyDown={handleKeydown}
      onBlur={handleBlur}
      className='jimu-input jimu-input-sm jimu-numeric-input jimu-numeric-input-input'
      {...others}
    />
  )
}
