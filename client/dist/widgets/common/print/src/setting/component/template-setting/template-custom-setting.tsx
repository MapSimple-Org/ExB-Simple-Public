/** @jsx jsx */
import { React, css, jsx, defaultMessages as jimuCoreDefaultMessage, type ImmutableArray, Immutable, polished, hooks } from 'jimu-core'
import { SettingSection, SettingRow, SidePopper } from 'jimu-ui/advanced/setting-components'
import { TextInput, Switch, MultiSelect, AlertPopup, Loading, defaultMessages as jimuUiDefaultMessage, MultiSelectItem } from 'jimu-ui'
import type { SettingChangeFunction } from 'jimu-for-builder'
import type { JimuMapView } from 'jimu-arcgis'
import { type IMPrintTemplateProperties, type PrintTemplateProperties, type IMConfig, PrintTemplateType, type ReportTypes, LayoutTypes, type ActiveItem } from '../../../config'
import defaultMessages from '../../translations/default'
import { getIndexByTemplateId, checkIsCustomTemplate, checkIsMapOnly, mergeTemplateSetting, checkIsReportsTemplateAvailable } from '../../../utils/utils'
import CommonTemplateSetting from '../template-common-setting'
import LayoutTemplateSetting from './layout-template-setting'
import ReportTemplateSetting from './report-template-setting'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'
import { getNewLayoutTemplateByLayoutName } from '../../util/util'
import LayoutOptionSetting from './layout-option-setting'
import MapOnlyCustomSetting from './map-only-custom-setting'
const { useEffect, useState, useRef } = React

interface Props {
  id: string
  isOpen: boolean
  config: IMConfig
  trigger?: HTMLElement
  popperFocusNode?: HTMLElement
  activeTemplateId: string
  jimuMapView: JimuMapView
  toggle: () => void
  handelTemplateListChange?: (newTemplate: PrintTemplateProperties[]) => void
  onSettingChange?: SettingChangeFunction
}

interface AvailableReportTemplateInfo {
  reportOptions: any
  reportTypes?: ReportTypes
  customReportItem?: ActiveItem
  report?: string
  templateIndex?: number
  templateId?: string
}

interface TemplateItemUpdateTypes {
  isTemplateChange: boolean
  newTemplateItem?: PrintTemplateProperties
}

const CustomSetting = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage, jimuCoreDefaultMessage)
  const { id, isOpen, trigger, popperFocusNode, config, activeTemplateId, jimuMapView, toggle, handelTemplateListChange, onSettingChange } = props
  const preTemplateIndexRef = useRef<number>(null)
  const preAvailableReportRef = useRef(null as AvailableReportTemplateInfo)
  const templateListRef = useRef(null as ImmutableArray<PrintTemplateProperties>)
  useEffect(() => {
    getCurrentTemplate()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, activeTemplateId])

  const [template, setTemplate] = useState(null as IMPrintTemplateProperties)
  const [templateIndex, setTemplateIndex] = useState(null as number)
  const [templateList, setTemplateList] = useState(null as ImmutableArray<PrintTemplateProperties>)
  const [templateName, setTemplateName] = useState(template?.label || '')
  const [isOpenRemind, setIsOpenRemind] = useState(false)
  const [showLoading, setShowLoading] = useState(false)

  useEffect(() => {
    checkAndResetAvailableTemplate(preTemplateIndexRef.current)
    preAvailableReportRef.current = null
    typeof templateIndex === 'number' && (preTemplateIndexRef.current = templateIndex)
    return () => {
      checkAndResetAvailableTemplate(preTemplateIndexRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateIndex])

  useEffect(() => {
    setTemplateName(template?.label || '')
    initPreAvailableReport(template)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template])

  const initPreAvailableReport = (template: IMPrintTemplateProperties) => {
    const { defaultCustomReportItem, defaultReportTemplate, supportCustomReport, supportReport } = config
    if (!template) return
    const option = {
      defaultCustomReportItem,
      defaultReportTemplate,
      supportCustomReport,
      supportReport,
      reportOptions: template?.reportOptions,
      reportTypes: template?.reportTypes
    }
    const isReportTemplateAvailable = checkIsReportsTemplateAvailable(option)
    if (isReportTemplateAvailable) {
      const preAvailableReport = {
        reportOptions: template?.reportOptions,
        reportTypes: template?.reportTypes,
        customReportItem: template?.customReportItem,
        report: template?.report,
        templateIndex: templateIndex,
        templateId: template.templateId
      }
      preAvailableReportRef.current = preAvailableReport
    }
  }

  const toggleLoading = (showLoading = false) => {
    setShowLoading(showLoading)
  }

  const getCurrentTemplate = () => {
    const isCustomTemplate = checkIsCustomTemplate(config?.printServiceType, config?.printTemplateType)
    const templateList = isCustomTemplate ? config?.printCustomTemplate : config?.printOrgTemplate
    const index = getIndexByTemplateId(templateList?.asMutable({ deep: true }), activeTemplateId)
    setTemplateIndex(index)
    setTemplateList(templateList)
    setTemplate(templateList?.[index] || null)
    templateListRef.current = templateList
  }

  const handelCustomSettingChange = (key: string[], value) => {
    const newTemplate = template.setIn(key, value)
    const newTemplateList = templateList?.asMutable({ deep: true })
    newTemplateList[templateIndex] = newTemplate?.asMutable({ deep: true })
    handelTemplateListChange(newTemplateList)
  }

  const handleTemplateNameAccept = (value) => {
    if (!value) {
      setTemplateName(template?.label)
      return false
    }
    handelCustomSettingChange(['label'], value)
  }

  const handleTemplateNameChange = (event) => {
    const value = event?.target?.value
    setTemplateName(value)
  }

  const handleTemplatePropertyChange = (templateProperty: IMPrintTemplateProperties) => {
    const newTemplateList = templateList?.asMutable({ deep: true })
    newTemplateList[templateIndex] = templateProperty?.asMutable({ deep: true })
    handelTemplateListChange(newTemplateList)
  }

  const handleOverrideCommonSettingsChanged = () => {
    const overrideCommonSetting = !template?.overrideCommonSetting
    if (overrideCommonSetting) {
      let newTemplate = template.setIn(['overrideCommonSetting'], overrideCommonSetting)
      newTemplate = mergeTemplateSetting(newTemplate, config?.commonSetting)
      const newTemplateList = templateList?.asMutable({ deep: true })
      newTemplateList[templateIndex] = newTemplate?.asMutable({ deep: true })
      handelTemplateListChange(newTemplateList)
    } else {
      handelCustomSettingChange(['overrideCommonSetting'], overrideCommonSetting)
    }
  }

  const checkAndResetAvailableTemplate = (index?: number) => {
    const itemIndex = typeof index === 'number' ? index : templateIndex
    const newTemplateList = templateListRef.current?.asMutable({ deep: true })
    let preTemplate = newTemplateList?.[itemIndex]
    if (!preTemplate) return

    let isResetTemplate = false

    const layoutTemplateCheckRes = checkAndResetLayoutTemplate(preTemplate)
    if (layoutTemplateCheckRes.isTemplateChange) {
      isResetTemplate = true
      preTemplate = layoutTemplateCheckRes.newTemplateItem
    }

    const reportTemplateCheckRes = checkAndResetReportTemplate(preTemplate)
    if (reportTemplateCheckRes.isTemplateChange) {
      isResetTemplate = true
      preTemplate = reportTemplateCheckRes.newTemplateItem
    }

    if (isResetTemplate) {
      newTemplateList[itemIndex] = preTemplate
      handelTemplateListChange(newTemplateList)
    }
  }

  const checkAndResetLayoutTemplate = (templateItem: PrintTemplateProperties): TemplateItemUpdateTypes => {
    if (!templateItem) {
      return {
        isTemplateChange: false
      }
    }

    let isTemplateChange = false
    if (templateItem?.layoutTypes === LayoutTypes.CustomLayout && !templateItem.customLayoutItem?.id && config?.layoutChoiceList?.length > 0) {
      templateItem = getNewLayoutTemplateByLayoutName(templateItem, templateItem.layout, config?.layoutChoiceList?.asMutable({ deep: true }))
      isTemplateChange = true
    }
    return {
      isTemplateChange: isTemplateChange,
      newTemplateItem: templateItem
    }
  }

  const checkAndResetReportTemplate = hooks.useEventCallback((templateItem: PrintTemplateProperties): TemplateItemUpdateTypes => {
    if (!templateItem) {
      return {
        isTemplateChange: false
      }
    }

    const { defaultCustomReportItem, defaultReportTemplate, supportCustomReport, supportReport } = config
    let isTemplateChange = false
    let newTemplate = Immutable(templateItem)

    const option = {
      defaultCustomReportItem,
      defaultReportTemplate,
      supportCustomReport,
      supportReport,
      reportOptions: templateItem?.reportOptions,
      reportTypes: templateItem?.reportTypes
    }
    const isReportTemplateAvailable = checkIsReportsTemplateAvailable(option)

    if (!isReportTemplateAvailable && preAvailableReportRef.current && preAvailableReportRef.current?.templateId === templateItem.templateId) {
      const { reportOptions, reportTypes, customReportItem, report } = preAvailableReportRef.current
      newTemplate = newTemplate.set('reportOptions', reportOptions).set('reportTypes', reportTypes).set('customReportItem', customReportItem).set('report', report).set('report', report)
      isTemplateChange = true
    }

    return {
      isTemplateChange: isTemplateChange,
      newTemplateItem: newTemplate?.asMutable({ deep: true })
    }
  })

  const handleLayoutChange = (layoutTemplate: string, index?: number) => {
    const itemIndex = typeof index === 'number' ? index : templateIndex
    const newTemplate = getNewLayoutTemplateByLayoutName(template?.asMutable({ deep: true }), layoutTemplate, config?.layoutChoiceList?.asMutable({ deep: true }))
    const newTemplateList = templateList?.asMutable({ deep: true })
    newTemplateList[itemIndex] = newTemplate
    handelTemplateListChange(newTemplateList)
  }

  const getFormatValue = (template: IMPrintTemplateProperties) => {
    const format = template?.format
    const selectedFormatList = template?.selectedFormatList?.asMutable({ deep: true })
    if (!format || config.formatList?.includes(format)) {
      return selectedFormatList ?? []
    } else {
      return selectedFormatList?.filter(formatItem => formatItem !== format) ?? []
    }
  }

  const renderBaseSetting = () => {
    return (
      <SettingSection>
        <SettingRow flow='wrap' label={nls('templateName')}>
          <TextInput
            size='sm'
            className='w-100'
            value={templateName}
            onAcceptValue={handleTemplateNameAccept}
            onChange={handleTemplateNameChange}
            aria-label={nls('templateName')}
            disabled={config?.printTemplateType === PrintTemplateType.OrganizationTemplate}
          />
        </SettingRow>
        <SettingRow flow='wrap' label={nls('fileFormat')} role='group' aria-label={nls('fileFormat')}>
          <MultiSelect
            aria-label={nls('fileFormat')}
            onChange={handleSelectFormatChange}
            values={Immutable(getFormatValue(template))}
            size='sm'
          >
            {
              config?.formatList.map((format) => {
                return (<MultiSelectItem key={format} value={format} label={format}/>)
              })
            }
          </MultiSelect>
        </SettingRow>

        <LayoutTemplateSetting
          id={id}
          config={config}
          template={template}
          templateIndex={templateIndex}
          handleLayoutChange={handleLayoutChange}
          onSettingChange={onSettingChange}
          toggleLoading={toggleLoading}
        />

        {(config?.supportCustomReport || config?.supportReport) && <ReportTemplateSetting
          id={id}
          config={config}
          template={template}
          templateIndex={templateIndex}
          onSettingChange={onSettingChange}
        />}

        {showLoading && <div className='layout-loading-con position-absolute w-100'>
          <Loading/>
        </div>}
      </SettingSection>
    )
  }

  const handleSelectFormatChange = (value, values: string[]) => {
    if (values?.length === 0) return false
    let newTemplate = template.set('selectedFormatList', values)
    if (!values?.includes(newTemplate.format)) {
      const pdfFormat = config.formatList?.filter(format => (format.toLocaleLowerCase().includes('pdf') && values.includes(format)))
      newTemplate = newTemplate.set('format', pdfFormat[0] || values[0])
    }
    const newTemplateList = templateList?.asMutable({ deep: true })
    newTemplateList[templateIndex] = newTemplate?.asMutable({ deep: true })
    handelTemplateListChange(newTemplateList)
  }

  const handleToggleRemindModel = () => {
    setIsOpenRemind(!isOpenRemind)
  }

  const REMIND_MODEL_STYLE = css`
    .remind-con {
      padding-left: ${polished.rem(25)};
      color: var(--ref-palette-neutral-1100);
      margin-bottom: ${polished.rem(60)};
      margin-top: ${polished.rem(19)};
      font-size: ${polished.rem(13)};
    }
    .modal-body {
      padding: ${polished.rem(30)} ${polished.rem(30)} 0 ${polished.rem(30)};
    }
    .modal-footer {
      padding: 0 ${polished.rem(30)} ${polished.rem(30)} ${polished.rem(30)};
    }
    .remind-title {
      font-size: ${polished.rem(16)};
      font-weight: 500;
    }
  `
  const renderRemindModel = () => {
    return (
      <AlertPopup
        isOpen={isOpenRemind}
        toggle={handleToggleRemindModel}
        hideHeader={true}
        onClickOk={handleOverrideCommonSettingsChanged}
        onClickClose={handleToggleRemindModel}
        css={REMIND_MODEL_STYLE}
      >
        <div className='align-middle pt-2 remind-title d-flex align-items-center' aria-label={nls('overrideSettingsTitle')}>
          <div className='mr-1'>
            <WarningOutlined className='align-middle' size='l' color={'var(--sys-color-warning-main)'} />
          </div>
          <span className='align-middle flex-grow-1'>{nls('overrideSettingsTitle')}</span>
        </div>
        <div className='remind-con'>{nls('overrideSettingsRemind')}</div>
      </AlertPopup>
    )
  }

  const clickOverrideCommonSetting = (e) => {
    const value = e.target.checked
    if (value) {
      handleOverrideCommonSettingsChanged()
    } else {
      handleToggleRemindModel()
    }
  }

  const renderCommonSetting = () => {
    return (
      <SettingSection>
        <SettingRow className='mb-4' tag='label' aria-label={nls('overrideCommonSettings')} label={nls('overrideCommonSettings')}>
          <Switch
            checked={template?.overrideCommonSetting || false}
            onChange={clickOverrideCommonSetting}
          />
        </SettingRow>
        {template?.overrideCommonSetting && <CommonTemplateSetting
          id={id}
          printTemplateProperties={template}
          handleTemplatePropertyChange={handleTemplatePropertyChange}
          modeType={config?.modeType}
          jimuMapView={jimuMapView}
        />}
        {renderRemindModel()}
      </SettingSection>
    )
  }

  const STYLE = css`
    & {
      overflow: auto;
    }
    .text-wrap {
      overflow: hidden;
      white-space: pre-wrap;
    }
    .map-size-input {
      width: ${polished.rem(80)};
    }
    .setting-collapse {
      & {
        margin-bottom: ${polished.rem(8)};
      }
      .collapse-header {
        line-height: 2.2;
      }
    }
    .check-box-con {
      color: var(--ref-palette-neutral-900);
      font-size: ${polished.rem(14)};
      line-height: ${polished.rem(22)};
      margin: ${polished.rem(4)} 0 ${polished.rem(8)} 0;
    }
    .layout-loading-con {
      left: 0;
      height: ${polished.rem(100)};
    }
  `

  const checkIsShowSetting = hooks.useEventCallback((showLoading: boolean, template: IMPrintTemplateProperties) => {
    const useServiceLayout = !template?.layoutTypes || template?.layoutTypes === LayoutTypes.ServiceLayout
    if (showLoading) {
      return false
    }

    if (!useServiceLayout && !template.customLayoutItem?.id) {
      return false
    } else {
      return true
    }
  })

  return (
    <SidePopper isOpen={isOpen} position='right' toggle={toggle} trigger={trigger} title={nls('templateConfiguration')} backToFocusNode={popperFocusNode}>
      <div className='w-100 h-100' css={STYLE}>
        {renderBaseSetting()}
        {checkIsShowSetting(showLoading, template) && <div>
          {/* Render map only setting */}
          {checkIsMapOnly(template?.layout) &&
            <MapOnlyCustomSetting
              id={id}
              config={config}
              template={template}
              handelCustomSettingChange={handelCustomSettingChange}
            />
          }

          {/* Render layout option setting */}
          {!checkIsMapOnly(template?.layout) &&
            <LayoutOptionSetting
              id={id}
              config={config}
              template={template}
              templateIndex={templateIndex}
              handelCustomSettingChange={handelCustomSettingChange}
            />
          }

          {renderCommonSetting()}
        </div>}
      </div>
    </SidePopper>
  )
}

export default CustomSetting
