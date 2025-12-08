/** @jsx jsx */
import { css, jsx, hooks, classNames } from 'jimu-core'
import { defaultMessages, Dropdown, DropdownButton, DropdownItem, DropdownMenu, defaultMessages as jimuUiDefaultMessage, NumericInput } from 'jimu-ui'
import { CheckOutlined } from 'jimu-icons/outlined/application/check'

interface SizeEditorProps {
  className?: string
  'aria-label'?: string
  mode: 'auto' | 'custom'
  disabled?: boolean
  value: number
  onChange: (value: number) => void
  onModeChange?: (mode: 'auto' | 'custom') => void
}

const style = css`
  display: flex;
  background: var(--ref-palette-neutral-300);
  height: 26px;
  .prop-label {
    background-color: var(--ref-palette-neutral-500);
    font-size: 12px;
    line-height: 26px;
    color: var(--ref-palette-neutral-900);
  }
  .jimu-dropdown {
    z-index: 0;
    &:focus-within {
      z-index: 1;
    }
  }
  input {
    height: 100%;
    font-size: 12px;
    padding: 0;
    text-align: center;
  }
`

const dropdownMenuStyle = css`min-width: 5rem;`

const SizeModes: Array<'auto' | 'custom'> = ['auto', 'custom']

export const SizeEditor = (props: SizeEditorProps): React.ReactElement => {
  const { className, mode, value, disabled = false, 'aria-label': propAriaLabel, onModeChange, onChange } = props

  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage)
  const ariaLabel = propAriaLabel || translate(mode)

  const handleModeChange = (mode: 'auto' | 'custom'): void => {
    onModeChange(mode)
  }

  const handleValueChange = (number: number): void => {
    const val = Math.floor(+number)
    onChange(val)
  }

  return (
    <div className={classNames('size-editor', className)} css={style}>
      <Dropdown
        direction='down'
        size='sm'
        disabled={disabled}
        aria-label={ariaLabel}
        menuItemCheckMode='singleCheck'
      >
        <DropdownButton arrow icon size='sm' className='p-0' title={ariaLabel}/>
        <DropdownMenu className='p-0' css={dropdownMenuStyle}>
          {SizeModes.map((item, index) => (
            <DropdownItem active={item === mode} aria-label={translate(item)} key={index} onClick={() => { handleModeChange(item) }}>
              <div className='d-flex align-items-center justify-content-end w-100'>
                {item === mode && <CheckOutlined className='mr-2' />}
                {translate(item)}
              </div>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
      {mode !== 'custom' && (
        <div
          className='prop-label flex-grow-1 px-2 text-truncate text-center'
          title={translate(mode)}
        >
          {translate(mode)}
        </div>
      )}
      {mode === 'custom' && (
        <NumericInput
          size='sm'
          aria-label={ariaLabel}
          min={0}
          step={1}
          disabled={disabled}
          max={9999}
          showHandlers={false}
          value={value}
          onAcceptValue={handleValueChange}
        />
      )}
    </div>
  )
}
