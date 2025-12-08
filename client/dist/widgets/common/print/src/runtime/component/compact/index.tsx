/** @jsx jsx */
import { React, jsx, css, polished, type ImmutableArray, Immutable, classNames, ReactRedux, type IMState, hooks, focusElementInKeyboardMode } from 'jimu-core'
import { Button, Popper, Select, Option, Icon, SVG, defaultMessages as jimuUiDefaultMessage, type ShiftOptions, type FlipOptions, Paper } from 'jimu-ui'
import { type JimuMapView, MapViewManager } from 'jimu-arcgis'
import { type IMConfig, type PrintTemplateProperties, type PrintResultListItemType, type IMPrintTemplateProperties, type IMPrintResultListItemType, PrintResultState, type MapView, type OutputDataSourceWarningOption } from '../../../config'
import defaultMessage from '../../translations/default'
import { WidgetPrintOutlined } from 'jimu-icons/outlined/brand/widget-print'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'
import { print } from '../../utils/print-service'
import { checkIsTemplateExist, getIndexByTemplateId, mergeTemplateSetting } from '../../../utils/utils'
import SettingRow from '../setting-row'
import PrintResult from './result'
import PrintPreview from '../print-preview'
import { initTemplateProperties } from '../../utils/utils'
import DsRemind from '../ds-remind'
import UtilityErrorRemind from '../utility-remind'
const { useState, useRef, useEffect } = React
const { useSelector } = ReactRedux

interface Props {
  id: string
  locale: string
  errorTip: string
  showPlaceholder: boolean
  useMapWidgetIds: ImmutableArray<string>
  config: IMConfig
  jimuMapView: JimuMapView
  templateList: ImmutableArray<PrintTemplateProperties>
  outputDataSourceWarning: OutputDataSourceWarningOption
  showUtilityErrorRemind: boolean
  controllerWidgetId: string
  previewOverlayItem: any
  toggleUtilityErrorRemind: (isShow?: boolean) => void
  updatePreviewOverlayItem: (overlayItem: any) => void
  handlePrintStatusMessageChange: (printStatus: PrintResultState) => void
}

const CompactPrint = (props: Props) => {
  const { config, templateList, jimuMapView, errorTip, id, locale, useMapWidgetIds, outputDataSourceWarning, previewOverlayItem, showPlaceholder, showUtilityErrorRemind, controllerWidgetId } = props
  const { handlePrintStatusMessageChange, toggleUtilityErrorRemind, updatePreviewOverlayItem } = props
  const nls = hooks.useTranslation(defaultMessage, jimuUiDefaultMessage)
  const printButtonRef = useRef<HTMLButtonElement>(null)
  const focusTimeoutRef = useRef(null)
  const widgetJson = useSelector((state: IMState) => state?.appConfig?.widgets?.[id])
  const STYLE = css`
    .compact-con {
      padding: 0;
      svg {
        margin: 0 auto;
      }
      .compact-icon {
        color: ${(widgetJson?.icon as any)?.properties?.color};
      }
    }
    .off-panel-con {
      min-height: 32px;
      min-width: 32px;
    }
    .operate-con-width-controller-widget {
      min-width: 295px;
      padding: 12px;
      .close-con button{
        padding: 0;
        svg {
          margin: 0 auto;
        }
      }
    }
  `

  const POPPER_STYLE = css`
    & {
      padding: ${polished.rem(12)};
      width: ${polished.rem(320)};
    }
    .select-con {
      min-height: ${polished.rem(107)};
    }
    .result-con {
      min-height: ${polished.rem(107)};
    }
    .close-con button{
      padding: 0;
      svg {
        margin: 0 auto;
      }
    }
    .result-list-con button {
      padding: 0;
    }
    .compact-preview-con {
      width: 0;
    }
    .close-button {
      color: inherit;
    }
  `

  const shiftOptions: ShiftOptions = {
    crossAxis: true
  }

  const flipOptions: FlipOptions = {
    fallbackPlacements: ['left-start', 'left-end']
  }

  const [openPopper, setOpenPopper] = useState(false)
  const [showResult, setShowResult] = useState(false)
  const [printResult, setPrintResult] = useState(null as IMPrintResultListItemType)
  const [selectedTemplate, setSelectedTemplate] = useState(null as IMPrintTemplateProperties)

  useEffect(() => {
    setSelectedTemplateByIndex(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedTemplate || (!checkIsTemplateExist(templateList, selectedTemplate?.templateId))) {
      setSelectedTemplateByIndex(0)
    }
    if (selectedTemplate && checkIsTemplateExist(templateList, selectedTemplate?.templateId)) {
      const index = getIndexByTemplateId(templateList?.asMutable({ deep: true }), selectedTemplate?.templateId)
      setSelectedTemplateByIndex(index)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateList, config])

  const setSelectedTemplateByIndex = (index: number) => {
    if (templateList?.length === 0) return false
    let template = templateList?.[index]
    if (template?.overrideCommonSetting) {
      template = mergeTemplateSetting(config?.commonSetting, template)
    } else {
      template = mergeTemplateSetting(template, config?.commonSetting)
    }
    setSelectedTemplate(template)
  }

  const togglePopper = (e, type?: any) => {
    const newOpenPopper = type === 'clickOutside' ? false : !openPopper
    setOpenPopper(newOpenPopper)
    clearTimeout(focusTimeoutRef.current)
    focusTimeoutRef.current = setTimeout(() => {
      !newOpenPopper && focusElementInKeyboardMode(printButtonRef.current)
    })
  }

  const toggleResultPanel = () => {
    setShowResult(!showResult)
  }

  const handleTemplateChange = (e) => {
    const templateId = e?.target?.value
    const index = getIndexByTemplateId(templateList?.asMutable({ deep: true }), templateId)
    setSelectedTemplateByIndex(index)
  }

  const restPrint = () => {
    setPrintResult(null)
    setShowResult(false)
  }

  const updatePrintResult = (newPrintResult: PrintResultListItemType, status: PrintResultState) => {
    newPrintResult.state = status
    handlePrintStatusMessageChange(status)
    setPrintResult(Immutable(newPrintResult))
  }

  const confirmPrint = async () => {
    const printResult = {
      resultId: selectedTemplate?.templateId,
      url: null,
      title: selectedTemplate?.layoutOptions?.titleText,
      state: PrintResultState.Loading
    }
    const isSupportReport = config?.supportCustomReport || config?.supportReport
    setPrintResult(Immutable(printResult))
    toggleResultPanel()

    const initTemplatePropertiesParams = {
      printTemplateProperties: selectedTemplate,
      mapView: jimuMapView,
      locale: locale,
      utility: config.useUtility,
      useMapWidgetIds: useMapWidgetIds,
      widgetId: id,
      isSupportReport: isSupportReport
    }
    const newPrintTemplateProperties = await initTemplateProperties(initTemplatePropertiesParams)

    if (!newPrintTemplateProperties) {
      updatePrintResult(printResult, PrintResultState.Error)
      return
    }

    let newJimuMapView
    if (isSupportReport) {
      newJimuMapView = MapViewManager.getInstance().getJimuMapViewById(jimuMapView.id)
    }
    const mapView = newJimuMapView || jimuMapView
    handlePrintStatusMessageChange(PrintResultState.Loading)
    print({
      useUtility: config?.useUtility,
      mapView: mapView?.view as MapView,
      printTemplateProperties: newPrintTemplateProperties,
      toggleUtilityErrorRemind: toggleUtilityErrorRemind,
      jimuMapView: jimuMapView,
      useMapWidgetIds: useMapWidgetIds,
      widgetId: id,
      isSupportReport: isSupportReport,
      reportOptions: selectedTemplate?.reportOptions,
      elementOverrides: selectedTemplate?.layoutOptions?.elementOverrides,
      previewOverlayItem: previewOverlayItem
    }).then(res => {
      printResult.url = res?.url
      updatePrintResult(printResult, PrintResultState.Success)
    }, printError => {
      updatePrintResult(printResult, PrintResultState.Error)
    })
  }

  const renderTemplateSelect = () => {
    return (
      <div className='d-flex flex-column'>
        <SettingRow flowWrap className='flex-grow-1' label={nls('template')}>
          <Select
            value={selectedTemplate?.templateId || ''}
            onChange={handleTemplateChange}
            size='sm'
            className='scalebar-unit'
            aria-label={nls('template')}
          >
            {templateList?.map((template, index) => {
              return (<Option
                key={template.templateId}
                value={template.templateId}
                title={template.label}
              >
                {template.label}
              </Option>)
            })}
          </Select>
        </SettingRow>
        <DsRemind
          supportCustomReport={config?.supportCustomReport}
          supportReport={config?.supportReport}
          outputDataSourceWarning={outputDataSourceWarning}
        />
        <div className='print-button-con d-flex align-items-center mt-2'>
          <PrintPreview
            className='flex-grow-1 compact-preview-con'
            id={id}
            jimuMapView={jimuMapView}
            scale={selectedTemplate?.outScale}
            selectedTemplate={selectedTemplate}
            printExtentType={selectedTemplate?.printExtentType}
            config={config}
            updatePreviewOverlayItem={updatePreviewOverlayItem}
          />
          <Button className='print-button text-truncate ml-1' type='primary' onClick={confirmPrint} title={nls('_widgetLabel')} aria-label={nls('_widgetLabel')}>{nls('_widgetLabel')}</Button>
        </div>
      </div>
    )
  }

  const renderPrintIcon = () => {
    const icon = widgetJson?.icon
    if (!icon) {
      return (<WidgetPrintOutlined/>)
    }
    if (typeof (icon) === 'string') {
      return (<SVG src={icon}/>)
    } else {
      return (<Icon className='compact-icon' icon={icon?.svg }/>)
    }
  }

  const renderPrintOperateElement = () => {
    return (
      <div className={classNames('w-100 h-100', { 'operate-con-width-controller-widget': controllerWidgetId })}>
        {!showPlaceholder && <div className='d-flex flex-column w-100 h-100'>
          {!controllerWidgetId && <div className='text-right close-con'>
            <Button className='print-button close-button' type='tertiary' aria-label={nls('closeTour')} title={nls('closeTour')} onClick={togglePopper}>
              <CloseOutlined/>
            </Button>
          </div>}
          <div className='flex-grow-1'>
            {!showResult && <div className={ classNames('w-100 h-100 select-con', { 'sr-only': showResult })}>
              {renderTemplateSelect()}
            </div>}
            {showResult && <PrintResult printResult={printResult} restPrint={restPrint} useUtility={config?.useUtility}/>}
          </div>
        </div>}
        {showPlaceholder && <div>{errorTip}</div>}
        {showUtilityErrorRemind && <UtilityErrorRemind utilityId={config?.useUtility?.utilityId} toggleUtilityErrorRemind={toggleUtilityErrorRemind}/>}
      </div>
    )
  }

  return (
    <div className='w-100 h-100' css={STYLE}>
      {controllerWidgetId && <Paper variant='flat' className='w-100 h-100'>{renderPrintOperateElement()}</Paper>}
      {!controllerWidgetId && <div className='w-100 h-100'>
        <Button
          className={classNames('w-100 h-100 compact-con', { 'off-panel-con': widgetJson?.offPanel })}
          type='tertiary'
          ref={printButtonRef}
          title={nls('_widgetLabel')}
          aria-label={nls('_widgetLabel')}
          onClick={togglePopper}
        >
          {renderPrintIcon()}
        </Button>
        <Popper
          open={openPopper}
          placement='bottom'
          reference={printButtonRef}
          shiftOptions={shiftOptions}
          flipOptions={flipOptions}
          arrowOptions
          toggle={togglePopper}
          css={POPPER_STYLE}
        >
          {renderPrintOperateElement()}
        </Popper>
      </div>}
    </div>
  )
}

export default CompactPrint
