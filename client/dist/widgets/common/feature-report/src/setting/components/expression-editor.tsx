/** @jsx jsx */
import { React, jsx, css, defaultMessages as jimuCoreMessages, type IMThemeVariables, hooks, type SerializedStyles } from 'jimu-core'
import { defaultMessages as jimuUIMessages, TextInput, Button, Icon } from 'jimu-ui'
import defaultMessages from '../translations/default'
import BracesOutlined from 'jimu-icons/svg/outlined/data/braces.svg'
import { FieldSelector } from 'jimu-ui/advanced/data-source-selector'
const { useState, useRef, useEffect } = React


const allDefaultMessages = Object.assign({}, defaultMessages, jimuCoreMessages, jimuUIMessages)
interface ExpressionEditorProps extends React.HTMLAttributes<HTMLDivElement> {
  dataSources: any
  theme?: any
  value?: string
  onChange?: any
  onBlur?: any
  prefix?: string
}

export const ExpressionEditor = React.forwardRef((props: ExpressionEditorProps, innerButtonRef: any): React.ReactElement => {
  const { theme, dataSources, value, prefix, onChange, onBlur } = props
  const curRef: React.RefObject<HTMLDivElement> = React.createRef<HTMLDivElement>()
  const inputRef = useRef(null)

  const getStyle = (theme?: IMThemeVariables): SerializedStyles => {
    return css`
      .expression-builder-trigger {
        position: relative;
        cursor: pointer;
        height: 26px;
        padding: 0;

        .trigger-dropdown-toggle {
          background: ${theme.sys.color.secondary.dark};
          border-radius: 2px 0 0 2px;
          border-color: ${theme.sys.color.secondary.dark};
          width: 26px;
          height: 26px;
        }
      }

      .custom-field-selector {
        height: 26px !important;
        position: absolute;
        top: 0;
        left: 0;
        visibility: hidden;
        // button.jimu-dropdown-button {
        //   width: 1px;
        //   height 0;
        // }
      }
      .expression-input {
        position: absolute;
        top: 0;
        left: 26px;
        right: 0;
        height: 1.625rem;
        // width: calc(100% - 26px);
        span {
          height: 1.625rem;
          padding-top: 0;
          padding-bottom: 0;
        }
      }
       `
  }

  const translate = hooks.useTranslation(allDefaultMessages)
  const [inputValue, setInputValue] = useState(value)
  const [cursorPosition, setCursorPosition] = useState(null)
  useEffect(() => {
    setInputValue(value)
  }, [value])
  const onInputChange = (e) => {
    setInputValue(e.target.value)
    if (onChange) {
      onChange(e.target.value)
    }
  }

  const onFieldSelect = (fields) => {
    const prefixStr = prefix || '{'
    const fieldName = (fields || []).length ? fields[0].name : ''
    if (fieldName) {
      let newVal = ''
      const curVal = inputValue || ''
      if (inputRef.current && cursorPosition !== null) {
        newVal = curVal.substring(0, cursorPosition) + prefixStr + fieldName + '}' + curVal.substring(cursorPosition)
      } else {
        newVal = curVal + '{' + fieldName + '}'
      }
      setInputValue(newVal)
      if (onChange) {
        onChange(newVal)
      }
      if (onBlur) {
        onBlur(newVal)
      }
    }
  }

  const onInputBlur = (e) => {
    //the cursor position
    if (inputRef.current) {
      setCursorPosition(inputRef.current.selectionStart)
    }
    if (onBlur) {
      onBlur(inputValue)
    }
  }

  const clickDropdown = () => {
    const ele: any = curRef.current.querySelector('button.jimu-dropdown-button')
    ele?.click()
  }
  return (
    <div className='w-100 h-100' css={getStyle(theme)}>
      <div className='expression-builder-trigger' ref={curRef}>
        <Button icon
          title={translate('attribute')}
          aria-label={translate('attribute')}
          onClick={clickDropdown}
          className='text-truncate d-flex justify-content-center align-items-center trigger-dropdown-toggle p-0 jimu-outline-inside'
        >
          <Icon icon={BracesOutlined} className='m-0 p-0' />
        </Button>

        <FieldSelector
          className='custom-field-selector'
          dataSources={[dataSources]}
          dropdownProps={{ size: 'sm', icon: true }}
          isDataSourceDropDownHidden={true}
          onChange={onFieldSelect}
          useDefault={false}
          useDropdown={true}
        />
          <div className='expression-input'>
            <TextInput
              ref={inputRef}
              aria-label={translate('attribute')}
              className='w-100 h-100 ' value={inputValue}
              onChange={onInputChange} onBlur={onInputBlur}
            />
          </div>
        </div>
    </div>
  )
})
