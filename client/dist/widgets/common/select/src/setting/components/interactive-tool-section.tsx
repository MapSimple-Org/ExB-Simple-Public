/** @jsx jsx */
import { type InteractiveTools, getDefaultInteractiveTools, InteractiveToolType } from '../../config'
import { React, jsx, css, hooks, Immutable, type ImmutableObject } from 'jimu-core'
import defaultMessages from '../translations/default'
import { defaultMessages as jimuUIMessages, Alert, Switch, Label, Radio, CollapsablePanel } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import type { RootSettingProps } from '../utils'

export interface InteractiveToolSectionProps {
  rootSettingProps: RootSettingProps
  imInteractiveTools: ImmutableObject<InteractiveTools>
  onInteractiveToolSectionUpdate: (newImInteractiveTools: ImmutableObject<InteractiveTools>) => void
}

interface InteractiveToolItem {
  value: InteractiveToolType
  label: string
}

const style = css`
  .jimu-widget-setting--section.interactive-tools-setting-section,
  .jimu-widget-setting--section.interactive-selection-mode-setting-section {
    border-bottom: none;

    .jimu-widget-setting--section-header > * {
      font-size: 0.8125rem !important;
    }

    label.jimu-widget-setting--row:first-of-type {
      margin-top: 8px !important;
    }
  }

  .tool-alert-container {
    position: relative;
    min-height: 0.1px;

    .tool-alert {
      position: absolute;
      left: 0;
      top: 0;
      z-index: 1;
    }
  }
`

/**
 * Configure interactive tools when source radio 'Interact with a Map widget' is checked.
 */
export default function InteractiveToolSection (props: InteractiveToolSectionProps): React.ReactElement {
  const {
    onInteractiveToolSectionUpdate
  } = props

  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)
  const [isToolAlertVisible, setIsToolAlertVisible] = React.useState<boolean>(false)
  const closeToolAlertTimerRef = React.useRef<NodeJS.Timeout>(null)

  const cancelCloseToolAlertTimer = () => {
    if (closeToolAlertTimerRef.current) {
      clearTimeout(closeToolAlertTimerRef.current)
      closeToolAlertTimerRef.current = null
    }
  }

  const showToolAlert = () => {
    setIsToolAlertVisible(true)
    cancelCloseToolAlertTimer()
    closeToolAlertTimerRef.current = setTimeout(() => {
      setIsToolAlertVisible(false)
    }, 5000)
  }

  const hideToolAlert = () => {
    cancelCloseToolAlertTimer()
    setIsToolAlertVisible(false)
  }

  // clear timer when unmounted
  React.useEffect(() => {
    return () => {
      if (closeToolAlertTimerRef.current) {
        clearTimeout(closeToolAlertTimerRef.current)
        closeToolAlertTimerRef.current = null
      }
    }
  }, [])

  // make sure imInteractiveTools has full structure
  const imInteractiveTools = React.useMemo(() => {
    let tempImInteractiveTools = props.imInteractiveTools

    if (!tempImInteractiveTools) {
      tempImInteractiveTools = Immutable(getDefaultInteractiveTools())
    }

    if (!tempImInteractiveTools.tools) {
      tempImInteractiveTools = tempImInteractiveTools.set('tools', [InteractiveToolType.Rectangle])
    }

    if (typeof tempImInteractiveTools.partiallyWithin !== 'boolean') {
      tempImInteractiveTools = tempImInteractiveTools.set('partiallyWithin', true)
    }

    return tempImInteractiveTools
  }, [props])

  const selectedTools = imInteractiveTools.tools

  const allInteractiveToolItems: InteractiveToolItem[] = React.useMemo(() => ([
    {
      value: InteractiveToolType.Rectangle,
      label: translate('SelectionByRectangle')
    },
    {
      value: InteractiveToolType.Polygon,
      label: translate('SelectionByLasso')
    },
    {
      value: InteractiveToolType.Circle,
      label: translate('SelectionByCircle')
    },
    {
      value: InteractiveToolType.Polyline,
      label: translate('SelectionByLine')
    },
    {
      value: InteractiveToolType.Point,
      label: translate('SelectionByPoint')
    }
  ]), [translate])

  const onToolSwitchChange = (toolName: InteractiveToolType, checked: boolean) => {
    let newSelectedTools = selectedTools.asMutable()

    if (checked) {
      if (!newSelectedTools.includes(toolName)) {
        newSelectedTools.push(toolName)
      }
    } else {
      newSelectedTools = newSelectedTools.filter(item => item !== toolName)

      if (newSelectedTools.length === 0) {
        // make sure have one tool at least
        showToolAlert()
        return
      }
    }

    const newImInteractiveTools = imInteractiveTools.set('tools', newSelectedTools)
    onInteractiveToolSectionUpdate(newImInteractiveTools)
  }

  const onPartiallyWithinRadioChanged = React.useCallback((evt, checked: boolean) => {
    if (checked) {
      const newImInteractiveTools = imInteractiveTools.set('partiallyWithin', true)
      onInteractiveToolSectionUpdate(newImInteractiveTools)
    }
  }, [imInteractiveTools, onInteractiveToolSectionUpdate])

  const onWhollyWithinRadioChanged = React.useCallback((evt, checked: boolean) => {
    if (checked) {
      const newImInteractiveTools = imInteractiveTools.set('partiallyWithin', false)
      onInteractiveToolSectionUpdate(newImInteractiveTools)
    }
  }, [imInteractiveTools, onInteractiveToolSectionUpdate])

  return (
    <SettingSection
      role='group'
      aria-label={translate('interactiveSelection')}
      title=''
      css={style}
    >
      <CollapsablePanel
        label={translate('interactiveSelection')}
        level={1}
        type="default"
      >
        <SettingSection role='group' aria-label={translate('tools')} title={translate('tools')} className='pl-0 pr-0 pt-4 pb-0 interactive-tools-setting-section'>
          {
            allInteractiveToolItems.map(item => (
              <SettingRow
                key={item.value}
                tag='label'
                label={item.label}
                level={3}
                className='mt-3'
              >
                <Switch checked={selectedTools.includes(item.value)} onChange={(evt, checked: boolean) => { onToolSwitchChange(item.value, checked) }} />
              </SettingRow>
            ))
          }
        </SettingSection>

        <div className='tool-alert-container mt-2 mb-2'>
          <Alert
            closable
            className='tool-alert w-100'
            form='basic'
            onClose={hideToolAlert}
            open={isToolAlertVisible}
            text={translate('atLeastOneToolTip')}
            type='warning'
            withIcon
          />
        </div>

        <SettingSection role='radiogroup' aria-label={translate('interactiveSelectionMode')} title={translate('interactiveSelectionMode')} className='p-0 interactive-selection-mode-setting-section'>
          <Label className='w-100 d-flex align-items-center mt-2'>
            <Radio
              name='select-widget-interactive-selection-mode'
              className='mr-2'
              checked={imInteractiveTools.partiallyWithin}
              onChange={onPartiallyWithinRadioChanged}
            />
            {translate('partiallyWithin')}
          </Label>
          <Label className='w-100 d-flex align-items-center'>
            <Radio
              name='select-widget-interactive-selection-mode'
              className='mr-2'
              checked={!imInteractiveTools.partiallyWithin}
              onChange={onWhollyWithinRadioChanged}
            />
            {translate('whollyWithin')}
          </Label>
        </SettingSection>
      </CollapsablePanel>
    </SettingSection>
  )
}
