import { classNames, React } from 'jimu-core'
import { styled } from 'jimu-theme'
import { TextInput } from 'jimu-ui'

interface EditInputProps {
  value: string
  className?: string
  onChange: (value: string) => void
}

const Root = styled(TextInput)`
  width: 73%;
  .input-wrapper {
    border: 1px solid transparent;
  }
`

const EditInput = (props: EditInputProps) => {
  const { className, value, onChange } = props

  const ref = React.useRef<HTMLInputElement>(null)

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      ref.current.blur()
    }
  }

  return (<Root
    className={classNames('edit-input', className)}
    size='sm'
    ref={ref}
    defaultValue={value}
    onAcceptValue={onChange}
    onKeyDown={handleKeyDown}
  />)
}

export default EditInput
