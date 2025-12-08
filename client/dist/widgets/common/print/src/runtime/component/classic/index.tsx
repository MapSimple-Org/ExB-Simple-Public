/** @jsx jsx */
import { React, jsx, css, polished, Immutable, focusElementInKeyboardMode, type ImmutableArray, hooks } from 'jimu-core'
import { Loading, LoadingType, Tabs, Tab, defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import { type JimuMapView, MapViewManager } from 'jimu-arcgis'
import type { IMConfig, IMPrintTemplateProperties, PrintTemplateProperties, MapView, IMPrintResultList, PrintResultList, PrintResultListItemType, OutputDataSourceWarningOption } from '../../../config'
import { Views, PrintResultState } from '../../../config'
import TemplateSetting from './template-setting'
import Result from './result'
import defaultMessage from '../../translations/default'
import { print } from '../../utils/print-service'
import { getNewResultItemTitle, getNewResultId, initTemplateProperties } from '../../utils/utils'
import { getIndexByTemplateId, checkIsTemplateExist, mergeTemplateSetting } from '../../../utils/utils'
import UtilityErrorRemind from '../utility-remind'
const { useState, useRef, useEffect } = React

interface Props {
  id: string
  showUtilityErrorRemind: boolean
  locale: string
  config: IMConfig
  jimuMapView: JimuMapView
  useMapWidgetIds: ImmutableArray<string>
  templateList: ImmutableArray<PrintTemplateProperties>
  outputDataSourceWarning: OutputDataSourceWarningOption
  previewOverlayItem: any
  updatePreviewOverlayItem: (overlayItem: any) => void
  handleSelectedTemplateIndexChange: (index: number) => void
  toggleUtilityErrorRemind: (isShow?: boolean) => void
  handlePrintStatusMessageChange: (printStatus: PrintResultState) => void
}

const STYLE = css`
  .classic-setting-con {
    height: 0;
  }
  .jimu-tabs-tab-content {
    height: calc(100% - 40px);
  }
  .jimu-nav-type-underline {
    height: ${polished.rem(40)};
    border-bottom: 1px solid var(--sys-color-divider-secondary) !important;
    display: flex;
    align-items: center;
    &>li {
      flex: 1;
    }
    .loading-con {
      min-width: 16px;
      height: 16px;
      margin-top: -1px;
    }
    .badge-dot {
      top: ${polished.rem(4)};
      right: ${polished.rem(4)};
    }
  }

`

const Classic = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessage, jimuUiDefaultMessage)
  const printResultListRef = useRef([] as PrintResultList)
  const oldPrintResultListRef = useRef([] as PrintResultList)
  const preDefaultValueSelectedTemplate = useRef(null as IMPrintTemplateProperties)

  const settingTabRef = useRef(null)
  const resultTabRef = useRef(null)

  const { config, jimuMapView, templateList, id, locale, useMapWidgetIds, outputDataSourceWarning, showUtilityErrorRemind, previewOverlayItem } = props
  const { handlePrintStatusMessageChange, handleSelectedTemplateIndexChange, toggleUtilityErrorRemind } = props
  const [views, setViews] = useState(Views.PrintTemplate)
  const [printResultList, setPrintResultList] = useState(Immutable([]) as IMPrintResultList)
  const [selectedTemplate, setSelectedTemplate] = useState(null as IMPrintTemplateProperties)

  useEffect(() => {
    setSelectedTemplateByIndex(0)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (selectedTemplate && checkIsTemplateExist(templateList, selectedTemplate?.templateId)) {
      const index = getIndexByTemplateId(templateList?.asMutable({ deep: true }), selectedTemplate?.templateId)
      const templateInConfig = getNewTemplateWithCommonSetting(templateList?.[index])?.asMutable({ deep: true })
      getNewSelectedTempWhenConfigChange(templateInConfig)
      preDefaultValueSelectedTemplate.current = Immutable(templateInConfig)
    }
    if (!selectedTemplate || (!checkIsTemplateExist(templateList, selectedTemplate?.templateId))) {
      setSelectedTemplateByIndex(0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateList, config])

  const getNewSelectedTempWhenConfigChange = (templateInConfig: PrintTemplateProperties) => {
    let currentSelectedTemplate = selectedTemplate?.asMutable({ deep: true })
    for (const key in currentSelectedTemplate) {
      if (key.includes('enable')) {
        delete currentSelectedTemplate[key]
      }
    }

    //Reset diff item
    const diffKeys = getKeyChangedSettingItem(templateInConfig, preDefaultValueSelectedTemplate.current?.asMutable({ deep: true }))
    if (diffKeys.length > 0) {
      diffKeys.forEach(keys => {
        const diffValue = getValueFromPath(templateInConfig, keys)
        currentSelectedTemplate = Immutable(currentSelectedTemplate).setIn(keys.split('.'), diffValue).asMutable({ deep: true })
      })
    }

    currentSelectedTemplate.customTextElementEnableList = templateInConfig?.customTextElementEnableList
    currentSelectedTemplate.selectedFormatList = templateInConfig?.selectedFormatList
    const newSelectedTemplate = Immutable({
      ...templateInConfig,
      ...currentSelectedTemplate
    })
    handleSelectedTemplateChange(newSelectedTemplate)
  }

  /**
   * The return value is in the form of ['a.0.c', 'a.b.c']
  */
  const getKeyChangedSettingItem = (json1, json2): string[] => {
    const changedKeys = []

    const checkChanges = (obj1, obj2, currentKey) => {
      for (const key in obj1) {
        const value1 = obj1[key]
        const value2 = obj2?.[key]
        const newKey = currentKey ? `${currentKey}.${key}` : key
        const valueNotNull = (value1 !== null && value2 !== null)
        if (typeof value1 === 'object' && typeof value2 === 'object' && valueNotNull) {
          checkChanges(value1, value2, newKey)
        } else if (value1 !== value2) {
          changedKeys.push(newKey)
        }
      }
    }

    checkChanges(json1, json2, '')

    return changedKeys
  }

  /**
   *path is in the form of 'a.0.c'
  */
  const getValueFromPath = (obj: any, path: string) => {
    const keys = path.split('.')
    let value = obj
    for (const key of keys) {
      value = value?.[key]
    }
    return value
  }

  const setSelectedTemplateByIndex = (index: number) => {
    if (templateList?.length === 0) return false
    const template = getNewTemplateWithCommonSetting(templateList?.[index])
    preDefaultValueSelectedTemplate.current = template
    handleSelectedTemplateIndexChange(index)
    handleSelectedTemplateChange(template)
  }

  const getNewTemplateWithCommonSetting = (template: IMPrintTemplateProperties): IMPrintTemplateProperties => {
    if (!template) return null
    if (template?.overrideCommonSetting) {
      template = mergeTemplateSetting(Immutable(config?.commonSetting), Immutable(template))
    } else {
      template = template.set('wkid', null)
      template = mergeTemplateSetting(Immutable(template), Immutable(config?.commonSetting))
    }
    return template
  }

  const handleSelectedTemplateChange = (template: IMPrintTemplateProperties) => {
    setSelectedTemplate(template)
  }

  const toggleNav = (views: Views) => {
    setViews(views)
    if (views === Views.PrintResult) {
      oldPrintResultListRef.current = Immutable(printResultListRef.current).asMutable()
    }
  }

  //Confirm print
  const confirmPrint = async (printTemplateProperties: IMPrintTemplateProperties) => {
    const resultItem = {
      resultId: getNewResultId(Immutable(printResultListRef.current)),
      url: null,
      title: getNewResultItemTitle(printTemplateProperties?.layoutOptions?.titleText, Immutable(printResultListRef.current)),
      state: PrintResultState.Loading
    }
    const newPrintResultList = printResultListRef.current
    const isSupportReport = config?.supportCustomReport || config?.supportReport
    newPrintResultList.push(resultItem)
    printResultListRef.current = newPrintResultList
    setPrintResultList(Immutable(newPrintResultList))

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
      setNewPrintResultList(resultItem, PrintResultState.Error)
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
    }).then(printResult => {
      setNewPrintResultList(resultItem, PrintResultState.Success, printResult?.url)
    }, printError => {
      setNewPrintResultList(resultItem, PrintResultState.Error)
    })
  }

  //Update result list
  const setNewPrintResultList = (newPrintResultItem: PrintResultListItemType, state: PrintResultState, url?: string) => {
    handlePrintStatusMessageChange(state)
    url && (newPrintResultItem.url = url)
    newPrintResultItem.state = state

    let newResultItemIndex
    const newPrintResultList = printResultListRef.current
    newPrintResultList.forEach((item, index) => {
      if (item.resultId === newPrintResultItem.resultId) {
        newResultItemIndex = index
      }
    })

    if (newResultItemIndex || newResultItemIndex === 0) {
      newPrintResultList.splice(newResultItemIndex, 1, newPrintResultItem)
      setPrintResultList(Immutable(newPrintResultList))
      printResultListRef.current = newPrintResultList
    }
  }

  //Delete app item
  const deleteResultItem = (index) => {
    const newPrintResultList = printResultListRef.current
    newPrintResultList.splice(index, 1)
    setPrintResultList(Immutable(newPrintResultList))
    printResultListRef.current = Immutable(newPrintResultList)?.asMutable({ deep: true })
    oldPrintResultListRef.current = Immutable(newPrintResultList)?.asMutable({ deep: true })
  }

  const checkIsShowLoading = (): boolean => {
    return printResultListRef?.current?.filter(item => item.state === PrintResultState.Loading)?.length > 0
  }

  const getTabLabelOfResultTab = () => {
    const showLoading = checkIsShowLoading() && views === Views.PrintTemplate
    const resultLength = printResultListRef?.current?.length
    const resultNumberInText = (!showLoading && resultLength > 0) ? `(${resultLength})` : ''
    return(
      <div>
        <div className='d-inline-block'>{nls('resultsNumber', { number: resultNumberInText })}</div>
        {showLoading && <div className='loading-con position-relative ml-1 d-inline-block align-middle'>
          <Loading width={16} height={16} type={LoadingType.Donut}/>
        </div>}
      </div>
    )
  }

  const handleKeyUp = (e, isSetting = false) => {
    if (e.key === 'Escape') {
      const focusElement = isSetting ? settingTabRef.current : resultTabRef.current
      focusElementInKeyboardMode(focusElement)
      e.preventDefault()
    }
  }

  return (
    <div className='w-100 h-100 d-flex flex-column' css={STYLE}>
      <div className='flex-grow-1 w-100 classic-setting-con overflow-hidden'>
        <Tabs
          defaultValue={Views.PrintTemplate}
          keepMount
          onChange={toggleNav}
          type="underline"
          className='h-100 w-100'
        >
          <Tab innerRef={settingTabRef} id={Views.PrintTemplate} title={nls('printTemplate')} className='flex-grow-1 h-100'>
            <div className='w-100 h-100' onKeyUp={e => { handleKeyUp(e, true) }}>
              <TemplateSetting
                id={id}
                config={config}
                jimuMapView={jimuMapView}
                selectedTemplate={selectedTemplate}
                templateList={templateList}
                outputDataSourceWarning={outputDataSourceWarning}
                confirmPrint={confirmPrint}
                views={views}
                handleSelectedTemplateChange={handleSelectedTemplateChange}
                setSelectedTemplateByIndex={setSelectedTemplateByIndex}
                updatePreviewOverlayItem={props.updatePreviewOverlayItem}
              />
              {showUtilityErrorRemind && <UtilityErrorRemind utilityId={config?.useUtility?.utilityId} toggleUtilityErrorRemind={toggleUtilityErrorRemind}/>}
            </div>
          </Tab>
          <Tab id={Views.PrintResult} title={getTabLabelOfResultTab()} innerRef={resultTabRef} aria-describedby={printResultList?.length === 0 ? `resultEmptyMessage${id}` : ''} className='flex-grow-1 h-100'>
            <div className='w-100 h-100' onKeyUp={e => { handleKeyUp(e) }}>
              <Result id={id} config={config} printResultList={printResultList} deleteResultItem={deleteResultItem}/>
            </div>
          </Tab>
        </Tabs>
      </div>
    </div>
  )
}

export default Classic
