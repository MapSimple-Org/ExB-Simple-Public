import { React, classNames } from 'jimu-core'
import { TextInput } from 'jimu-ui'
import { styled } from 'jimu-theme'

interface EditableTextProps {
  className?: string
  value?: string
  editable?: boolean
  onChange: (value: string) => void
}

const Root = styled('div')((props) => ({
  width: '100%',
  '.input-wrapper': {
    height: '100%',
    backgroundColor: 'transparent'
  },
  '.disabled': {
    '.input-wrapper': {
      background: 'unset',
      borderColor: 'unset',
      WebkitTextFillColor: 'var(--ref-palette-black)',
      '&:hover': {
        outline: 'none !important'
      }
    }
  }
}))

export const EditableText = (props: EditableTextProps): React.ReactElement => {
  const { className, editable = true, value, onChange } = props

  const ref = React.useRef<HTMLInputElement>(null)
  const [text, setText] = React.useState(value || '')

  const handleKeydown = (e: any) => {
    if (e.key === 'Enter' && ref.current) {
      ref.current.blur()
    }
  }

  return (
    <Root className={classNames(className, 'editable-text')} title={value}>
      <TextInput
        ref={ref}
        className='w-100'
        size='sm'
        disabled={!editable}
        title={text}
        value={text}
        required={true}
        onChange={(e) => { setText(e.target.value) }}
        onAcceptValue={onChange}
        onKeyDown={handleKeydown}
        borderless
      />
    </Root>
  )
}
