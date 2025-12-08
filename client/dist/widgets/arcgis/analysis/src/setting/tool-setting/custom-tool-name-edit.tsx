/** @jsx jsx */
import { React, css, focusElementInKeyboardMode, hooks, jsx } from 'jimu-core'
import { Button, defaultMessages, TextInput } from 'jimu-ui'
import { EditOutlined } from 'jimu-icons/outlined/editor/edit'

interface Props {
  displayName: string
  onChange: (newToolDisplayName: string) => void
}

const CustomToolNameEdit = (props: Props) => {
  const { displayName, onChange } = props

  const translate = hooks.useTranslation(defaultMessages)

  const editInputRef = React.useRef<HTMLInputElement>(null)
  const [isEditing, setIsEditing] = React.useState(false)
  const startEdit = () => {
    if (!isEditing) {
      setIsEditing(true)
    }
  }

  React.useEffect(() => {
    if (isEditing && editInputRef.current) {
      focusElementInKeyboardMode(editInputRef.current)
    }
  }, [isEditing])

  const handleLabelChange = (value: string) => {
    setIsEditing(false)
    onChange(value)
  }

  const [editingLabel, setEditingLabel] = React.useState(displayName)
  React.useEffect(() => {
    setEditingLabel(displayName)
  }, [displayName])

  const handleEditingLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingLabel(e.target.value)
  }

  return <span className='d-flex w-100 mr-2' css={css`
    min-width: 0;
    .title {
      flex: 1;
    }
  `}>
    {isEditing
      ? <TextInput
          className='w-100'
          size='sm'
          ref={editInputRef}
          value={editingLabel}
          onAcceptValue={handleLabelChange}
          onChange={handleEditingLabelChange}
        />
      : <span className='title text-truncate' title={displayName}>{displayName}</span>
      }
    {!isEditing && <Button icon type='tertiary' size='sm' className='ml-2 p-0 border-0' onClick={startEdit} aria-label={translate('rename')} title={translate('rename')}><EditOutlined size='m'/></Button>}
  </span>
}

export default CustomToolNameEdit
