/** @jsx jsx */
import { React, jsx, css, polished, hooks } from 'jimu-core'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { Button, Loading, CollapsablePanel, LoadingType, defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import { SettingSection } from 'jimu-ui/advanced/setting-components'
import type { JimuMapView } from 'jimu-arcgis'
import TemplateList from '../template-list'
import defaultMessage from '../../translations/default'
import { checkIsCustomTemplate } from '../../../utils/utils'
import { initNewTemplateItem } from '../../../utils/service-util'
import { getNewTemplateId } from '../../util/util'
import { type IMConfig, PrintTemplateType, type PrintTemplateProperties } from '../../../config'
import { PlusOutlined } from 'jimu-icons/outlined/editor/plus'
import CustomSetting from './template-custom-setting'
import PrintServiceSelect from '../print-service-select'
const { useState, useRef } = React
interface Props {
  id: string
  config: IMConfig
  portalUrl: string
  jimuMapView: JimuMapView
  showLoading: boolean
  className?: string
  onSettingChange: SettingChangeFunction
  handlePropertyChange: (key: string, value) => void
  toggleRemindPopper: (open?: boolean) => void
  toggleLoading: (isShow?: boolean) => void
}

const TemplateSetting = (props: Props) => {
  const templateListRef = useRef<HTMLDivElement>(null)
  const newTemplateButtonRef = useRef<HTMLButtonElement>(null)
  const { config, id, jimuMapView, showLoading, className, onSettingChange, handlePropertyChange, toggleRemindPopper, toggleLoading } = props

  const nls = hooks.useTranslation(defaultMessage, jimuUiDefaultMessage)
  const STYLE = css`
    .radio-con {
      cursor: pointer;
    }
    .loading-con {
      height: ${polished.rem(100)};
    }
  `

  const [activeTemplateId, setActiveTemplateId] = useState(null)
  const [popperFocusNode, setPopperFocusNode] = useState(null)
  const [isOpenCollapsablePanel, setIsOpenCollapsablePanel] = useState(true)

  const handelActiveTemplateIdChange = (templateId: string, index?: number) => {
    if (templateId === activeTemplateId) {
      setActiveTemplateId(null)
    } else {
      const node = templateListRef.current?.getElementsByClassName('jimu-tree-item__body')?.[index]
      setActiveTemplateId(templateId)
      node && setPopperFocusNode(node)
    }
  }

  const handelTemplateListChange = (newTemplate: PrintTemplateProperties[]) => {
    const isCustomTemplate = checkIsCustomTemplate(config?.printServiceType, config?.printTemplateType)
    if (isCustomTemplate) {
      handlePropertyChange('printCustomTemplate', newTemplate)
    } else {
      handlePropertyChange('printOrgTemplate', newTemplate)
    }
  }

  const newCustomTemplate = async () => {
    let newPrintCustomTemplate = config?.printCustomTemplate?.[0]?.asMutable({ deep: true }) || {} as PrintTemplateProperties
    const newCustomTemplate = config?.printCustomTemplate?.asMutable({ deep: true }) || []

    const newTemplateId = getNewTemplateId(newCustomTemplate, config?.printServiceType, PrintTemplateType.Customize)
    newPrintCustomTemplate = await initNewTemplateItem(config, newPrintCustomTemplate, newTemplateId, nls('untitledTemplate'))
    newCustomTemplate.push(newPrintCustomTemplate)

    handlePropertyChange('printCustomTemplate', newCustomTemplate)

    setPopperFocusNode(newTemplateButtonRef.current)
    setActiveTemplateId(newTemplateId)
  }

  const toggleOpenCollapsablePanel = () => {
    setIsOpenCollapsablePanel(!isOpenCollapsablePanel)
  }

  return (
    <SettingSection className={className} css={STYLE} role='group' aria-label={nls('configurePrintTemplate')}>
      <CollapsablePanel
        label={nls('configurePrintTemplate')}
        isOpen={isOpenCollapsablePanel}
        onRequestOpen={toggleOpenCollapsablePanel}
        onRequestClose={toggleOpenCollapsablePanel}
        aria-label={nls('configurePrintTemplate')}
        className='custom-setting-collapse'
      >
        <PrintServiceSelect
          id={id}
          config={config}
          showLoading={showLoading}
          onSettingChange={onSettingChange}
          toggleLoading={toggleLoading}
          toggleRemindPopper={toggleRemindPopper}
        />
        {showLoading && <div className='loading-con position-relative'><Loading type={LoadingType.Secondary}/></div>}
        {(config?.useUtility && !showLoading) && <div>

          {config?.printTemplateType === PrintTemplateType.Customize && <Button className='w-100 mt-2' ref={newTemplateButtonRef} type='primary' aria-label={nls('newTemplate')} onClick={newCustomTemplate}>
            {/* If the org template is empty, you need to re-get the template according to the orgUrl. By default, the first org template is used as the template, and png32 is used instead of pdf. */}
            <PlusOutlined className='mr-1'/>
            {nls('newTemplate')}
          </Button>}

          <div ref={templateListRef}>
            {!showLoading && <TemplateList
              id={id}
              handelActiveTemplateIdChange={handelActiveTemplateIdChange}
              handelTemplateListChange={handelTemplateListChange}
              showNewTemplateItem={false}
              activeTemplateId={activeTemplateId}
              config={config}
            />}
          </div>

          <CustomSetting
            id={id}
            isOpen={activeTemplateId}
            config={config}
            activeTemplateId={activeTemplateId}
            toggle={() => { handelActiveTemplateIdChange(null) }}
            handelTemplateListChange={handelTemplateListChange}
            jimuMapView={jimuMapView}
            trigger={templateListRef.current}
            popperFocusNode={popperFocusNode}
            onSettingChange={onSettingChange}
          />
        </div>}
      </CollapsablePanel>
    </SettingSection>
  )
}

export default TemplateSetting
