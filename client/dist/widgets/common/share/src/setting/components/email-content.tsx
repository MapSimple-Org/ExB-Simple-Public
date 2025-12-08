/** @jsx jsx */
import type { IMThemeVariables, IntlShape } from "jimu-core"
import { Label, Switch, TextArea } from 'jimu-ui'
import { SettingRow, SettingSection } from "jimu-ui/advanced/setting-components"
// import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { css, jsx, focusElementInKeyboardMode, React } from 'jimu-core'
import nls from '../translations/default'
import { getDefaultEmailContent } from "../utils"
import type { emailContent } from "../../config"
interface Props {
  intl: IntlShape
  theme: IMThemeVariables
  email: emailContent
  handleCustomizeChange: (emailContent) => void
}

const EmailContent = (props: Props) => {
  const {
    intl,
    email,
    handleCustomizeChange,
  } = props
  const { useRef, useEffect } = React
  const { isCustomize, content } = email
  const defaultEmailContent = getDefaultEmailContent(props.intl)
  const backBtnRefFor508 = useRef<HTMLInputElement>(null)
  const customizeLabel = intl.formatMessage({ id: 'customizeLabel', defaultMessage: nls.customizeLabel })
  // const customizeTip = intl.formatMessage({ id: 'customizeTip', defaultMessage: nls.customizeTip })

  const [customizeChecked, setCustomizeChecked] = React.useState(isCustomize)
  const [templateContent, setTemplateContent] = React.useState(isCustomize ? content : defaultEmailContent)

  useEffect(() => {
    if (backBtnRefFor508.current) {
      focusElementInKeyboardMode(backBtnRefFor508.current) //508
    }
  }, [])

  useEffect(() => {
    if (customizeChecked) {
      if (content !== templateContent) {
        setTemplateContent(content)
      }
    } else {
      if (defaultEmailContent !== templateContent) {
        setTemplateContent(defaultEmailContent)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, defaultEmailContent, customizeChecked])


  const handleSwitchCustomize = (_: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    const newContent = checked ? content : defaultEmailContent
    setCustomizeChecked(checked)
    setTemplateContent(newContent)
    handleCustomizeChange({
      isCustomize: checked,
      content: newContent
    })
  }

  const handleTextAreaChange = (value: string) => {
    setTemplateContent(value)
    if (customizeChecked) {
      handleCustomizeChange({
        isCustomize: true,
        content: value
      })
    }
  }

  const getStyle = () => {
    const theme = props.theme
    return css`
     .customize-title{
      color: ${theme.ref.palette.neutral[1000]};
      font-weight: 500;
      font-size: 13px;
      svg {
        color: ${theme.ref.palette.neutral[1100]};
      }
     }
      `
  }

  return (
    <div className='w-100 h-100' css={getStyle()}>
      <SettingSection className='mb-2 pt-2'>
        <SettingRow role='group' aria-label={customizeLabel} >
          <Label className='d-flex w-100 align-items-center justify-content-between'>
            <div className="d-flex align-items-center justify-content-start customize-title">
              {customizeLabel}
              {/* <Tooltip
                placement="top"
                role="tooltip"
                title={customizeTip}
              >
                <Button
                  icon
                  variant="text"
                  disableHoverEffect
                  aria-label={customizeTip}
                >
                  <InfoOutlined />
                </Button>
              </Tooltip> */}
            </div>
            <Switch checked={customizeChecked} onChange={handleSwitchCustomize} aria-label={customizeLabel} />
          </Label>
        </SettingRow>
        <SettingRow>
          <TextArea
            ref={backBtnRefFor508}
            aria-label={customizeLabel}
            className='w-100'
            spellCheck={false}
            disabled={!customizeChecked}
            value={templateContent}
            onAcceptValue={handleTextAreaChange}
            onChange={(evt) => { setTemplateContent(evt.target.value) }}
            height={445}
          />
        </SettingRow>
      </SettingSection>

    </div>
  )
}

export default EmailContent
