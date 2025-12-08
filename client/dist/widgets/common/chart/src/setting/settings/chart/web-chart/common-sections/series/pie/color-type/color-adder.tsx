/**@jsx jsx */
import { React, jsx, css, classNames, hooks, focusElementInKeyboardMode } from 'jimu-core'
import { Button, Label, TextInput, type ValidityResult, defaultMessages as jimuDefaultMessages, Tooltip } from 'jimu-ui'
import { MinusCircleOutlined } from 'jimu-icons/outlined/editor/minus-circle'
import { PlusCircleOutlined } from 'jimu-icons/outlined/editor/plus-circle'
import defaultMessages from '../../../../../../../translations/default'

interface ColorAdderProps {
  className?: string
  validity?: (text: string) => ValidityResult
  onChange?: (text: string | number) => void
}

const style = css`
  width: 100%;
  display: flex;
  justify-content: flex-end;
  > .editor {
    width: 100%;
    > .top-part {
      width: 100%;
      display: flex;
      justify-content: space-between;
      > .jimu-input {
        width: 88%;
      }
      > .jimu-btn {
        align-self: flex-start;
      }
    }
    > .info-msg {
      color: var(--ref-palette-neutral-1000);
      width: 88%;
    }
  }
`

export const ColorAdder = (props: ColorAdderProps): React.ReactElement => {
  const { className, validity, onChange } = props
  const translate = hooks.useTranslation(jimuDefaultMessages, defaultMessages)
  const ref = React.useRef<HTMLInputElement>(null)
  const [editable, setEditable] = React.useState(false)
  const [value, setValue] = React.useState<string>('')

  const handleAddClick = () => {
    setEditable(!editable)
    setTimeout(() => {
      focusElementInKeyboardMode(ref?.current)
    })
  }

  const handleKeyDown = (evt: React.KeyboardEvent<HTMLInputElement>) => {
    if (evt.key === 'Enter') {
      const valid = validity(value).valid
      if (value && valid) {
        setValue('')
        onChange?.(value)
        setEditable(false)
      }
    }
  }

  const handleCancelClick = () => {
    setValue('')
    setEditable(false)
  }

  return (
    <div className={classNames('color-adder', className)} css={style}>
      {!editable && <Label check>
        {translate('addCategory')}
        <Tooltip title={translate('addCategoryTip')} showArrow enterDelay={300}>
          <Button type='tertiary' icon className='add' size='sm' onClick={handleAddClick}><PlusCircleOutlined size='m' /></Button>
        </Tooltip>
      </Label>}
      {editable && <div className='editor' role='group' aria-label={translate('addCategory')}>
        <div className='top-part'>
          <TextInput
            ref={ref}
            size='sm'
            aria-describedby='color-adder-tip'
            placeholder={translate('categoryName')}
            value={value}
            onKeyDown={handleKeyDown}
            onChange={(e) => { setValue(e.target.value) }}
            checkValidityOnAccept={validity as any} />
          <Button aria-label={translate('commonModalCancel')} icon type='tertiary' size='sm' onClick={handleCancelClick} title={translate('commonModalCancel')}><MinusCircleOutlined size='m' /></Button>
        </div>
        <div id='color-adder-tip' className='info-msg mt-1'>{translate('pressEnter')}</div>
      </div>}
    </div>
  )
}
