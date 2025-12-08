/** @jsx jsx */
import { React, jsx, css, hooks, defaultMessages as jimuCoreMessages, focusElementInKeyboardMode, type SerializedStyles } from 'jimu-core'
import { TextInput, Button, Tooltip, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { EditOutlined } from 'jimu-icons/outlined/editor/edit'
import { CheckOutlined } from 'jimu-icons/outlined/application/check'
import { SettingOutlined } from 'jimu-icons/outlined/application/setting'
import { VisibleOutlined } from 'jimu-icons/outlined/application/visible'
import { InvisibleOutlined } from 'jimu-icons/outlined/application/invisible'
import { Fragment } from 'react'
import defaultMessages from '../translations/default'

const { useState, useRef, useEffect } = React

const allDefaultMessages = Object.assign({}, defaultMessages, jimuCoreMessages, jimuUIMessages)

interface ConfigItemProps extends React.HTMLAttributes<HTMLDivElement> {

  label: string
  defaultLabel?: string
  onValueChange?: (newVal: string) => void
  onBlur?: () => void
  onEdit?: () => void
  checked?: boolean
  hideSwitcher?: boolean
  showSettingButton?: boolean
  onSettingBtnClick?: any
  tooltipLabel?: string
  onCheckedChange?: (checked: boolean) => void
}

export const ConfigItem = React.forwardRef((props: ConfigItemProps, innerButtonRef: any): React.ReactElement => {
  const { defaultLabel, showSettingButton, onSettingBtnClick, label, checked, onValueChange, onCheckedChange, tooltipLabel, hideSwitcher } = props
const getStyle = (): SerializedStyles => {
    return css`
      .option-setting-item {
        height: 20px;
      }
      .input-wrapper {
        height: 20px
      }`
  }
  const translate = hooks.useTranslation(allDefaultMessages)

  const editInputRef = useRef<HTMLInputElement>(undefined)
  const [isEditing, setIsEditing] = useState(false)
  // fix the issue "For the newly added widget, click edit component name, the input box disappears immediately" in https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/pull/19814#issue-1790034
  const [isBurEventFrozen, setIsBurEventFrozen] = useState(false)

  const startEdit = () => {
    if (!isEditing) {
      if ((!editingLabel || !(editingLabel + '').trim()) && defaultLabel) {
        setEditingLabel(defaultLabel)
      }
      setIsEditing(true)

      setIsBurEventFrozen(true)
      setTimeout(() => {
        setIsBurEventFrozen(false)
      }, 10)
    }
  }

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      focusElementInKeyboardMode(editInputRef.current)
    }
  }, [isEditing])

  const [editingLabel, setEditingLabel] = useState(label)
  useEffect(() => {
    setEditingLabel(label)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleLabelChange = (value: string) => {
    setIsEditing(false)
    if (value === defaultLabel) {
      value = ''
    }
    onValueChange(value)
  }

  const handleEditingLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingLabel(e.target.value)
  }

  const onInputBlur = (evt: any) => {
    if (isBurEventFrozen) {
      return
    }
    handleLabelChange(evt.target.value)
  }

  return (
  <Fragment>
    <div className='option-setting-item' css={getStyle()}>
      <div className='d-flex align-items-center mb-0 flex-grow-1' css={css`padding-left: 0.125rem`}>
        <div className='flex-grow-1 text-truncate' onDoubleClick={startEdit} css={!isEditing ? (showSettingButton ? css`max-width: 8.825rem;` : (hideSwitcher ? css`max-width: 11.25rem;` : css`max-width: 10.125rem;`)) : (hideSwitcher ? css`max-width: 12.25rem;` : css`max-width: 11.125rem;`)}>
          {
            isEditing
              ? <TextInput
                  size='sm'
                  className='jimu-tree-item__editing-input'
                  value={editingLabel}
                  onAcceptValue={handleLabelChange}
                  onChange={handleEditingLabelChange}
                  onBlur={evt => { onInputBlur(evt) }}
                  ref={editInputRef}
                  aria-label={defaultLabel}
                  placeholder={defaultLabel}
                />
              : <span title={editingLabel || defaultLabel}>{editingLabel || defaultLabel}</span>
          }
        </div>
      </div>
        {!isEditing &&
        <Tooltip title={translate('editLabel')} interactive={true} leaveDelay={100}>
          <Button
            tabIndex={0} role="button"
            className='p-0 mx-1'
            size='sm'
            type='tertiary'
            icon
            onClick={startEdit}
            // aria-label={translate('rename')}
          >
            <span><EditOutlined size='m'/></span>
          </Button>
        </Tooltip>}

        {isEditing && <Button
          tabIndex={0} role="button"
          className='p-0 mx-1'
          size='sm'
          type='tertiary'
          icon
          aria-label={translate('done')}
          onClick={() => { setIsEditing(false) }}
          // aria-label={translate('done')}
        >
          <CheckOutlined size='m'/>
        </Button>}
        {/* <span className='text-break' style={{ width: '80%' }}>
          { !isEditing
            ? label
            : <TextInput size='sm'
              // ref={ref => { inputRef = ref }}
              className='jimu-tree-item__editing-input'
              value={label}
              onChange={evt => { onValueChange(evt.target.value) }}
              onBlur={evt => { onValueChange(evt.target.value) }}
            />
          }
          </span> */}
          {showSettingButton && !isEditing
            ? <span>
              <Tooltip title={translate('settings')} interactive={true} leaveDelay={100}>
                <Button
                  ref={innerButtonRef}
                  className='mr-1 p-0 border-0'
                  // disabled={!isLayersAndDataSourcesLoaded}
                  type='tertiary'
                  icon={true}
                  size='sm'
                  onClick={onSettingBtnClick}
                >
                  <SettingOutlined
                    size={16}
                  />
                </Button>
              </Tooltip>
            </span>
            : ''}
        {hideSwitcher || isEditing
          ? ''
          : (checked
              ? <Tooltip title={<span>{tooltipLabel || translate('invisible')}</span>} interactive={true} leaveDelay={100}>
                 <Button
                  className='mr-1 p-0 border-0'
                  type='tertiary'
                  icon={true}
                  size='sm'
                  aria-label={translate('visible') + (tooltipLabel ? '. ' + tooltipLabel : '')}
                  onClick={() => { onCheckedChange(false) }}>
                  <VisibleOutlined size={16} />
                </Button>
                  {/* <span style={{ cursor: 'pointer' }} ><VisibleOutlined onClick={() => { onCheckedChange(false) }} /></span> */}
                </Tooltip>
              : <Tooltip title={<span>{tooltipLabel || translate('ininvisible')}</span>} interactive={true} leaveDelay={100}>
                  <Button
                    className='mr-1 p-0 border-0'
                    type='tertiary'
                    icon={true}
                    size='sm'
                    aria-label={translate('invisible') + (tooltipLabel ? '. ' + tooltipLabel : '')}
                    onClick={() => { onCheckedChange(true) }}>
                    <InvisibleOutlined size={16} />
                  </Button>
                </Tooltip>
            )
        }
      </div>
      {
        props.children
          ? <div className='w-100' css={css`margin-top: 0.5rem;`}>
          {props.children}
        </div>
          : ''
      }
    </Fragment>
  )
})
