/** @jsx jsx */
import { React, jsx, css, polished, type ImmutableArray, classNames, esri, Immutable, moduleLoader, defaultMessages as jimuCoreDefaultMessage, loadArcGISJSAPIModule, hooks } from 'jimu-core'
import { Checkbox, Button, TextInput, Select, Option, Radio, NumericInput, TextArea, defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import type * as jimuCoreWkid from 'jimu-core/wkid'
import type { JimuMapView } from 'jimu-arcgis'
import { type IMConfig, type IMPrintTemplateProperties, type PrintTemplateProperties, PrintExtentType, WKID_LINK, Views, type OutputDataSourceWarningOption } from '../../../config'
import { getIndexByTemplateId, getScaleBarList, checkIsMapOnly, getKeyOfNorthArrow } from '../../../utils/utils'
import defaultMessage from '../../translations/default'
import { DownOutlined } from 'jimu-icons/outlined/directional/down'
import { UpOutlined } from 'jimu-icons/outlined/directional/up'
import { ResetOutlined } from 'jimu-icons/outlined/editor/reset'
import PrintPreview from '../print-preview'
import SettingRow from '../setting-row'
import DsRemind from '../ds-remind'
const Sanitizer = esri.Sanitizer
const sanitizer = new Sanitizer()
const { useState, useEffect, useRef } = React

interface Props {
  id: string
  config: IMConfig
  templateList: ImmutableArray<PrintTemplateProperties>
  jimuMapView: JimuMapView
  views: Views
  outputDataSourceWarning: OutputDataSourceWarningOption
  confirmPrint: (printTemplateProperties: IMPrintTemplateProperties) => void
  selectedTemplate: IMPrintTemplateProperties
  handleSelectedTemplateChange: (template: IMPrintTemplateProperties) => void
  setSelectedTemplateByIndex: (index: number) => void
  updatePreviewOverlayItem: (overlayItem: any) => void
}

const TemplateSetting = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessage, jimuUiDefaultMessage, jimuCoreDefaultMessage)
  const oldWkid = useRef(null)
  const wkidUtilsRef = useRef(null)
  const reactiveUtilsRef = useRef(null as __esri.reactiveUtils)
  const modulesLoadedRef = useRef(false)
  const watchSpatialReferenceOfBasemapChangeHandle = useRef(null)

  const STYLE = css`
    padding-bottom: ${polished.rem(16)};
    padding-top: ${polished.rem(16)};
    .setting-con {
      overflow-y: auto;
      padding-left: ${polished.rem(16)};
      padding-right: ${polished.rem(16)};
    }
    .button-radius {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-top-right-radius: var(--sys-shape-input-field);
      border-bottom-right-radius: var(--sys-shape-input-field);
    }
    .print-button-con {
      padding-left: ${polished.rem(16)};
      padding-right: ${polished.rem(16)};
    }
    .collapse-button {
      color: var(--sys-color-surface-paper-text);
    }
    .no-right-padding .jimu-interactive-node{
      padding-right: 0;
    }
    .scalebar-unit {
      width: ${polished.rem(160)};
    }
    .map-size-con input {
      width: 100%;
    }
    .wkid-describtion {
      font-size: ${polished.rem(12)};
      color: var(--sys-color-surface-paper-tex);
    }
    .wkid-describtion-invalid {
      color: var(--sys-color-error-dark)
    }
    .outscale-con, .dpi-con {
      input {
        border-right: 0;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
      button {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        height: ${polished.rem(26)};
        svg {
          margin-right: 0;
        }
      }
    }
    .radio-con, .checkbox-con {
      color: var(--sys-color-surface-paper-tex);
      font-size: ${polished.rem(14)};
      line-height: ${polished.rem(22)};
      margin: ${polished.rem(4)} 0 ${polished.rem(8)} 0;
    }
  `
  const { templateList, jimuMapView, selectedTemplate, id, config, outputDataSourceWarning, confirmPrint, views, updatePreviewOverlayItem, handleSelectedTemplateChange, setSelectedTemplateByIndex } = props

  const [title, setTitle] = useState(selectedTemplate?.layoutOptions?.titleText || '')
  const [wkid, setWkid] = useState(selectedTemplate?.wkid || '')
  const [scale, setScale] = useState(selectedTemplate?.outScale)
  const [author, setAuthor] = useState(selectedTemplate?.layoutOptions?.authorText || '')
  const [copyright, setCopyright] = useState(selectedTemplate?.layoutOptions?.copyrightText || '')
  const [customTextElements, setCustomTextElements] = useState(selectedTemplate?.layoutOptions?.customTextElements)
  const [dpi, setDpi] = React.useState(selectedTemplate?.exportOptions?.dpi)
  const [mapWidth, setMapWidth] = React.useState(selectedTemplate?.exportOptions?.width)
  const [mapHeight, setMapHeight] = React.useState(selectedTemplate?.exportOptions?.height)
  const [isOpenCollapse, setIsOpenCollapse] = useState(false)
  const [descriptionOfWkid, setDescriptionOfWkid] = React.useState(null)
  const [northArrowKey, setNorthArrowKey] = useState(null)
  const [legendEnabled, setLegendEnabled] = useState(false)
  const [includeNorthArrow, setIncludeNorthArrow] = useState(false)
  const [descriptionOfMapsWkid, setDescriptionOfMapsWkid] = useState(false)

  useEffect(() => {
    const newNorthArrowKey = getKeyOfNorthArrow(selectedTemplate?.layoutOptions?.elementOverrides)
    setTitle(selectedTemplate?.layoutOptions?.titleText || '')
    setAuthor(selectedTemplate?.layoutOptions?.authorText || '')
    setCopyright(selectedTemplate?.layoutOptions?.copyrightText || '')
    setCustomTextElements(selectedTemplate?.layoutOptions?.customTextElements)
    setWkid(selectedTemplate?.wkid)
    setScale(selectedTemplate?.outScale)
    setDpi(selectedTemplate?.exportOptions?.dpi)
    setMapWidth(selectedTemplate?.exportOptions?.width)
    setMapHeight(selectedTemplate?.exportOptions?.height)
    setNorthArrowKey(newNorthArrowKey)
    checkAndInitDescriptionOfWkid(isOpenCollapse)
    setLegendEnabled(!!selectedTemplate?.layoutOptions?.legendLayers)
    setIncludeNorthArrow(!!selectedTemplate?.layoutOptions?.elementOverrides?.[newNorthArrowKey]?.visible)
    oldWkid.current = selectedTemplate?.wkid
    if (selectedTemplate?.wkidLabel) {
      setDescriptionOfWkid(selectedTemplate?.wkidLabel)
    } else {
      if (wkidUtilsRef.current) {
        getSRLabelDynamic(selectedTemplate?.wkid as number).then(label => {
          setDescriptionOfWkid(label)
        })
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTemplate])

  const initDescriptionOfWkid = async () => {
    const wkidLabel = await getSRLabelDynamic(selectedTemplate?.wkid as number)
    setDescriptionOfWkid(wkidLabel)
  }

  const getSRLabelDynamic = React.useCallback(async (wkid: number) => {
    if (!modulesLoadedRef.current) {
      return moduleLoader.loadModule<typeof jimuCoreWkid>('jimu-core/wkid').then(module => {
        wkidUtilsRef.current = module
        modulesLoadedRef.current = true
        const { getSRLabel } = wkidUtilsRef.current
        return Promise.resolve(getSRLabel(wkid))
      })
    } else {
      const { getSRLabel } = wkidUtilsRef.current
      return Promise.resolve(getSRLabel(wkid))
    }
  }, [])

  const getDescriptionOfWkid = React.useCallback((wkid) => {
    return wkid ? descriptionOfWkid : descriptionOfMapsWkid
  }, [descriptionOfMapsWkid, descriptionOfWkid])

  const isValidWkidDynamic = async (wkid: number) => {
    if (!modulesLoadedRef.current) {
      return moduleLoader.loadModule<typeof jimuCoreWkid>('jimu-core/wkid').then(module => {
        wkidUtilsRef.current = module
        modulesLoadedRef.current = true
        const { isValidWkid } = wkidUtilsRef.current
        return Promise.resolve(isValidWkid(wkid))
      })
    } else {
      const { isValidWkid } = wkidUtilsRef.current
      return Promise.resolve(isValidWkid(wkid))
    }
  }

  const handelSelectedTemplateChange = (e) => {
    const templateId = e?.target?.value
    const index = getIndexByTemplateId(templateList?.asMutable({ deep: true }), templateId)
    setSelectedTemplateByIndex(index)
  }

  const handleSelectedTemplateSettingChange = React.useCallback((key: string[], value) => {
    const newTemplate = selectedTemplate.setIn(key, value)
    handleSelectedTemplateChange(newTemplate)
  }, [handleSelectedTemplateChange, selectedTemplate])

  const handleAttributionVisibleChange = () => {
    handleSelectedTemplateSettingChange(['forceFeatureAttributes'], !selectedTemplate?.forceFeatureAttributes)
  }

  const handleMapAttributionChange = () => {
    handleSelectedTemplateSettingChange(['attributionVisible'], !selectedTemplate?.attributionVisible)
  }

  const handleLegendChanged = (e) => {
    const legendLayers = !legendEnabled ? [] : null
    handleSelectedTemplateSettingChange(['layoutOptions', 'legendLayers'], legendLayers)
    setLegendEnabled(!legendEnabled)
  }

  const handleNorthArrowChange = () => {
    const northArrowVisible = selectedTemplate?.layoutOptions?.elementOverrides?.[northArrowKey]?.visible
    handleSelectedTemplateSettingChange(['layoutOptions', 'elementOverrides', northArrowKey, 'visible'], !northArrowVisible)
  }

  const handleTitleAccept = (value) => {
    handleSelectedTemplateSettingChange(['layoutOptions', 'titleText'], value)
  }

  const handleTitleChange = (event) => {
    const value = event?.target?.value
    setTitle(value)
  }

  useEffect(() => {
    if (selectedTemplate) {
      jimuMapView && handleWkidAccept('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jimuMapView])

  const handleWkidAccept = async (value) => {
    const isValid = value ? await isValidWkidDynamic(value) : true
    if (!isValid) {
      setWkid(oldWkid.current)
      const oldWkidLabel = await getSRLabelDynamic(oldWkid.current)
      setDescriptionOfWkid(oldWkidLabel)
      return false
    }
    oldWkid.current = value
    const wkidLabel = value ? await getSRLabelDynamic(value) : ''
    setDescriptionOfWkid(wkidLabel)
    setWkid(value)
    const newTemplate = selectedTemplate.set('wkid', value || '').set('wkidLabel', wkidLabel || '')
    handleSelectedTemplateChange(newTemplate)
  }

  const handleWkidChange = async (value) => {
    const isValid = value ? await isValidWkidDynamic(value) : true
    if (isValid) {
      const wkidLabel = await getSRLabelDynamic(value)
      setDescriptionOfWkid(wkidLabel)
    } else {
      setDescriptionOfWkid(nls('invalidWKID'))
    }
    setWkid(value)
  }

  const handleScaleAccept = (value) => {
    handleSelectedTemplateSettingChange(['outScale'], value)
  }

  const useCurrentMapScale = () => {
    const scale = jimuMapView?.view?.scale
    setScale(scale)
    handleSelectedTemplateSettingChange(['outScale'], scale)
  }

  const handleScaleChange = (value) => {
    setScale(value)
  }

  const handleAuthorAccept = (value) => {
    handleSelectedTemplateSettingChange(['layoutOptions', 'authorText'], value)
  }

  const handleDPIChange = (value) => {
    if (value < 1) return false
    setDpi(parseInt(value))
  }

  const handleDPIAccept = (value) => {
    if (value < 1) return false
    handleSelectedTemplateSettingChange(['exportOptions', 'dpi'], parseInt(value))
  }

  const handleAuthorChange = (event) => {
    const value = event?.target?.value
    setAuthor(value)
  }

  const handleCopyrightAccept = (value) => {
    handleSelectedTemplateSettingChange(['layoutOptions', 'copyrightText'], value)
  }

  const handleCopyrightChange = (event) => {
    const value = event?.target?.value
    setCopyright(value)
  }

  const handleMapWidthAccept = (value) => {
    if (!value || Number(value) < 1) {
      setMapWidth(selectedTemplate?.exportOptions?.width)
      return false
    }
    handleSelectedTemplateSettingChange(['exportOptions', 'width'], value)
  }

  const handleMapWidthChange = (value) => {
    setMapWidth(value)
  }

  const handleMapHeightAccept = (value) => {
    if (!value || Number(value) < 1) {
      setMapHeight(selectedTemplate?.exportOptions?.height)
      return false
    }
    handleSelectedTemplateSettingChange(['exportOptions', 'height'], value)
  }

  const handleMapHeightChange = (value) => {
    setMapHeight(value)
  }

  const handleFormatChange = (e) => {
    const format = e.target.value
    handleSelectedTemplateSettingChange(['format'], format)
  }

  const handleScaleUnitChange = (e) => {
    const format = e.target.value
    handleSelectedTemplateSettingChange(['layoutOptions', 'scalebarUnit'], format)
  }

  const checkAndInitDescriptionOfWkid = (isOpenAdvanceCollapse: boolean) => {
    const showList = getShowList()
    const { showOutputSpatialReference } = showList
    if (isOpenAdvanceCollapse && showOutputSpatialReference && !selectedTemplate?.wkidLabel) {
      //If the setting contains Output spatial reference, when opening Advanced, if the WKID util has not been loaded, you need to load the WKID util first.
      initDescriptionOfWkid()
      initDescriptionOfMapsWkid(jimuMapView)
    }
  }

  const toggleCollapse = () => {
    checkAndInitDescriptionOfWkid(!isOpenCollapse)
    setIsOpenCollapse(!isOpenCollapse)
  }

  const handelConfirmPrint = () => {
    confirmPrint(selectedTemplate)
  }

  const handelMapExtentChange = (printExtentType: PrintExtentType) => {
    if (printExtentType === PrintExtentType.SetMapScale) {
      const scale = jimuMapView?.view?.scale
      setScale(scale)
      handleSelectedTemplateSettingChange(['outScale'], scale)
      const newTemplate = selectedTemplate.set('outScale', scale).set('printExtentType', printExtentType)
      handleSelectedTemplateChange(newTemplate)
    } else {
      handleSelectedTemplateSettingChange(['printExtentType'], printExtentType)
    }
  }

  const checkIsValidWkid = (wkid) => {
    if (wkidUtilsRef.current) {
      const { isValidWkid } = wkidUtilsRef.current
      return wkid ? isValidWkid(wkid) : true
    } else {
      return true
    }
  }

  const initDescriptionOfMapsWkid = React.useCallback(async (jimuMapView) => {
    if (jimuMapView) {
      const wkid = jimuMapView?.view?.spatialReference?.wkid
      const wkidLabel = wkid ? await getSRLabelDynamic(wkid) : ''
      setDescriptionOfMapsWkid(wkidLabel)
    }
  }, [getSRLabelDynamic])

  const getReactiveUtils = async () => {
    if (!reactiveUtilsRef.current) {
      reactiveUtilsRef.current = await loadArcGISJSAPIModule('esri/core/reactiveUtils')
    }
    return reactiveUtilsRef.current
  }

  useEffect(() => {
    initDescriptionOfMapsWkid(jimuMapView)
    if (jimuMapView) {
      getReactiveUtils().then(() => {
        watchSpatialReferenceOfBasemapChangeHandle.current = reactiveUtilsRef.current?.watch(() => jimuMapView?.view?.spatialReference?.wkid, () => {
          initDescriptionOfMapsWkid(jimuMapView)
        })
      })
    }
    return () => {
      watchSpatialReferenceOfBasemapChangeHandle.current?.remove && (watchSpatialReferenceOfBasemapChangeHandle.current?.remove?.())
    }
  }, [jimuMapView, initDescriptionOfMapsWkid])

  const getPlaceholderOfWkidInput = (jimuMapView) => {
    return nls('wkidPlaceholder', { wkid: jimuMapView?.view?.spatialReference?.wkid || null })
  }

  const renderAdvancedSetting = () => {
    const isMapOnly = checkIsMapOnly(selectedTemplate?.layout)
    const showList = getShowList()
    const { showLayoutOption, showFeatureAttribution, showMapAttribution, showQuality, showMapSize, showMapPrintExtents, showScalebarUnit, showOutputSpatialReference } = showList
    const showAdvance = showLayoutOption || showFeatureAttribution || showMapAttribution || showQuality || showMapSize || showMapPrintExtents || showScalebarUnit || showOutputSpatialReference
    return (
      <div>
        {showAdvance && <div className='d-flex align-items-center' role='group' aria-label={nls('advance')} onClick={toggleCollapse}>
          <div className='flex-grow-1'>{nls('advance')}</div>
          <Button icon
            className='collapse-button'
            size='sm'
            type='tertiary'
            title={isOpenCollapse ? nls('collapse') : nls('expand')}
            aria-label={isOpenCollapse ? nls('collapse') : nls('expand')}
            aria-expanded={isOpenCollapse}
          >
            {isOpenCollapse ? <UpOutlined/> : <DownOutlined/>}
          </Button>
        </div>}

        {isOpenCollapse && <div>
          {showMapPrintExtents && <SettingRow flowWrap label={nls('mapPrintingExtents')} >
            <div role='group' aria-label={nls('mapPrintingExtents')}>
              <div
                title={nls('currentMapExtent')}
                aria-label={nls('currentMapExtent')}
                className='d-flex align-items-center radio-con mt-1 checkbox-con'
                onClick={() => { handelMapExtentChange(PrintExtentType.CurrentMapExtent) }}
              >
                <Radio aria-label={nls('currentMapExtent')} title={nls('currentMapExtent')} checked={selectedTemplate?.printExtentType === PrintExtentType.CurrentMapExtent} className='mr-2'/> {nls('currentMapExtent')}
              </div>
              <div
                title={nls('currentMapScale')}
                aria-label={nls('currentMapScale')}
                className='d-flex align-items-center radio-con checkbox-con'
                onClick={() => { handelMapExtentChange(PrintExtentType.CurrentMapScale) }}
              >
                <Radio aria-label={nls('currentMapScale')} title={nls('currentMapScale')} checked={selectedTemplate?.printExtentType === PrintExtentType.CurrentMapScale} className='mr-2'/> {nls('currentMapScale')}
              </div>
              <div
                title={nls('setMapScale')}
                aria-label={nls('setMapScale')}
                className='d-flex align-items-center radio-con checkbox-con'
                onClick={() => { handelMapExtentChange(PrintExtentType.SetMapScale) }}
              >
                <Radio aria-label={nls('setMapScale')} title={nls('setMapScale')} checked={selectedTemplate?.printExtentType === PrintExtentType.SetMapScale} className='mr-2'/> {nls('setMapScale')}
              </div>
              {selectedTemplate?.printExtentType === PrintExtentType.SetMapScale && <div className='w-100 d-flex align-items-center outscale-con'>
                <NumericInput
                  size='sm'
                  className='flex-grow-1 dpi-input no-right-padding'
                  value={scale}
                  onAcceptValue={handleScaleAccept}
                  onChange={handleScaleChange}
                  showHandlers={false}
                  aria-label={nls('setMapScale')}
                />
                <Button className='button-radius' size='sm' onClick={useCurrentMapScale} title={nls('useCurrentScale')}><ResetOutlined/></Button>
              </div>}
            </div>
          </SettingRow>}

          {showOutputSpatialReference && <SettingRow flowWrap label={<div dangerouslySetInnerHTML={{ __html: getWKIDElement() }}></div>}>
            <NumericInput
              size='sm'
              className='w-100 dpi-input no-right-padding'
              value={wkid || ''}
              onAcceptValue={handleWkidAccept}
              onChange={handleWkidChange}
              showHandlers={false}
              placeholder={getPlaceholderOfWkidInput(jimuMapView)}
              aria-label={nls('spatialReference', { WKID: '' })}
              aria-describedby='print-wkid-describtion'
            />
            <div
              id='print-wkid-describtion'
              title={getDescriptionOfWkid(wkid)}
              aria-label={getDescriptionOfWkid(wkid)}
              className={classNames('text-truncate mt-1 wkid-describtion', { 'wkid-describtion-invalid': !checkIsValidWkid(Number(wkid)) })}
            >
              {getDescriptionOfWkid(wkid)}
            </div>
          </SettingRow>}

          {!isMapOnly && renderLayoutOptionSetting()}
          {isMapOnly && renderMapOnlyAdvanceSetting()}
        </div>}
      </div>
    )
  }

  const getShowList = () => {
    const isMapOnly = checkIsMapOnly(selectedTemplate?.layout)
    const showAuthor = selectedTemplate?.hasAuthorText && selectedTemplate?.enableAuthor && !isMapOnly
    const showCopyright = selectedTemplate?.hasCopyrightText && selectedTemplate?.enableCopyright && !isMapOnly
    const showLegend = selectedTemplate?.hasLegend && selectedTemplate?.enableLegend && !isMapOnly
    const showCustomTextElements = checkIsShowCustomTextElements() && !isMapOnly
    const showLayoutOption = showAuthor || showCopyright || showLegend || showCustomTextElements || selectedTemplate?.enableScalebarUnit
    return {
      showLayoutOption: showLayoutOption,
      showAuthor: showAuthor,
      showCopyright: showCopyright,
      showLegend: showLegend,
      showCustomTextElements: showCustomTextElements,
      showTitle: selectedTemplate?.enableTitle,
      showFeatureAttribution: selectedTemplate?.enableFeatureAttribution,
      showMapAttribution: selectedTemplate?.enableMapAttribution && isMapOnly,
      showQuality: selectedTemplate?.enableQuality,
      showMapSize: selectedTemplate?.enableMapSize && isMapOnly,
      showMapPrintExtents: selectedTemplate?.enableMapPrintExtents,
      showScalebarUnit: selectedTemplate?.enableScalebarUnit && !isMapOnly,
      showOutputSpatialReference: selectedTemplate?.enableOutputSpatialReference,
      showNorthArrow: selectedTemplate?.enableNorthArrow
    }
  }

  const checkIsShowCustomTextElements = () => {
    const enableList = []
    selectedTemplate?.customTextElementEnableList?.forEach(item => {
      for (const key in item) {
        enableList.push(item[key])
      }
    })
    return enableList?.filter(enable => enable)?.length > 0
  }

  const renderLayoutOptionSetting = () => {
    const showList = getShowList()
    const { showAuthor, showCopyright, showLegend, showLayoutOption, showFeatureAttribution, showQuality, showScalebarUnit, showNorthArrow } = showList
    return (
      <div role='group' aria-label={nls('LayoutOptions')}>
        {showLayoutOption && <div className='mb-2'>{nls('LayoutOptions')}</div>}

        {showAuthor && <SettingRow flowWrap label={nls('printAuthor')}>
          <TextInput
            size='sm'
            className='w-100 dpi-input'
            value={author}
            onAcceptValue={handleAuthorAccept}
            onChange={handleAuthorChange}
            aria-label={nls('printAuthor')}
          />
        </SettingRow>}
        {showCopyright && <SettingRow flowWrap label={nls('printCopyright')}>
          <TextInput
            size='sm'
            className='w-100 dpi-input'
            value={copyright}
            onAcceptValue={handleCopyrightAccept}
            onChange={handleCopyrightChange}
            aria-label={nls('printCopyright')}
          />
        </SettingRow>}
        {renderCustomTextElementsSetting()}
        {showLegend && <SettingRow>
          <div
            title={nls('includeLegend')}
            aria-label={nls('includeLegend')}
            className='w-100 align-items-center d-flex checkbox-con'
            onClick={handleLegendChanged}
          >
            <Checkbox
              title={nls('includeLegend')}
              className='lock-item-ratio'
              checked={legendEnabled}
            />
            <div className='text-left ml-2 f-grow-1'>
              {nls('includeLegend')}
            </div>
          </div>
        </SettingRow>}
        {showNorthArrow && <SettingRow>
          <div
            title={nls('includeNorthArrow')}
            aria-label={nls('includeNorthArrow')}
            className='w-100 align-items-center d-flex checkbox-con'
            onClick={handleNorthArrowChange}
          >
            <Checkbox
              title={nls('includeNorthArrow')}
              className='lock-item-ratio'
              checked={includeNorthArrow}
            />
            <div className='text-left ml-2 f-grow-1'>
              {nls('includeNorthArrow')}
            </div>
          </div>
        </SettingRow>}
        {showScalebarUnit && <SettingRow label={nls('scaleBarUnit')} flowWrap={false}>
          <Select
            value={selectedTemplate?.layoutOptions?.scalebarUnit}
            onChange={handleScaleUnitChange}
            size='sm'
            className='scalebar-unit'
            aria-label={nls('scaleBarUnit')}
          >
            {getScaleBarList(nls).map((item, index) => {
              return (<Option
                key={`unit${index}`}
                value={item.value}
                title={item.label}
              >
                {item.label}
              </Option>)
            })}
          </Select>
        </SettingRow>}
        {showQuality && <SettingRow label={nls('printQuality')} flowWrap>
          <div className='d-flex align-items-center w-100 dpi-con'>
            <NumericInput
              size='sm'
              className='flex-grow-1 no-right-padding'
              value={dpi}
              min={1}
              onAcceptValue={handleDPIAccept}
              onChange={handleDPIChange}
              showHandlers={false}
              aria-label={nls('printQuality')}
            />
            <Button className='button-radius' disabled size='sm' title='DPI'>DPI</Button>
          </div>
        </SettingRow>}
        {showFeatureAttribution && <SettingRow>
          <div
            title={nls('includeAttributes')}
            aria-label={nls('includeAttributes')}
            className='w-100 align-items-center d-flex checkbox-con'
            onClick={handleAttributionVisibleChange}
          >
            <Checkbox
              title={nls('includeAttributes')}
              className='lock-item-ratio'
              data-field='mapSize'
              checked={selectedTemplate?.forceFeatureAttributes}
            />
            <div className='text-left ml-2 f-grow-1'>
              {nls('includeAttributes')}
            </div>
          </div>
        </SettingRow>}

      </div>
    )
  }

  const renderCustomTextElementsSetting = () => {
    const settingItem = []
    customTextElements?.forEach((info, index) => {
      for (const key in info) {
        if (!selectedTemplate?.customTextElementEnableList?.[index]?.[key]) continue
        const elementItem = (<SettingRow flowWrap className='align-item-center' label={key} key={`${key}_${index}`}>
          <TextArea
            className='flex-grow-1'
            value={info[key] || ''}
            onAcceptValue={value => { handelCustomTextElementsAccept(index, key, value) }}
            onChange={e => { handelCustomTextElementsChange(index, key, e) }}
            aria-label={key}
          />
        </SettingRow>)
        settingItem.push(elementItem)
      }
    })
    return settingItem
  }

  const handelCustomTextElementsAccept = (index: number, key: string, value) => {
    const newItem = customTextElements[index].set(key, value)
    const newCustomTextElements = customTextElements?.asMutable({ deep: true })
    newCustomTextElements.splice(index, 1, newItem)
    handleSelectedTemplateSettingChange(['layoutOptions', 'customTextElements'], newCustomTextElements)
  }

  const handelCustomTextElementsChange = (index: number, key: string, event) => {
    const value = event?.target?.value
    const newItem = customTextElements[index].set(key, value)
    const newCustomTextElements = customTextElements?.asMutable({ deep: true })
    newCustomTextElements.splice(index, 1, newItem)
    setCustomTextElements(Immutable(newCustomTextElements))
  }

  const renderBaseSetting = () => {
    const showList = getShowList()
    const { showTitle } = showList
    return (
      <div className='base-setting-con'>
        <SettingRow flowWrap label={nls('template')} >
          <Select
            value={selectedTemplate?.templateId || ''}
            onChange={handelSelectedTemplateChange}
            size='sm'
            aria-label={nls('template')}
          >
            {templateList?.map((template, index) => {
              return (<Option
                key={template?.templateId}
                value={template?.templateId}
                title={template?.label}
              >
                {template?.label}
              </Option>)
            })}
          </Select>
        </SettingRow>
        <DsRemind
          supportCustomReport={config?.supportCustomReport}
          supportReport={config?.supportReport}
          outputDataSourceWarning={outputDataSourceWarning}
        />

        {showTitle && <SettingRow flowWrap label={nls('title')}>
          <TextInput
            size='sm'
            className='w-100'
            value={title}
            aria-label={nls('title')}
            onAcceptValue={handleTitleAccept}
            onChange={handleTitleChange}
          />
        </SettingRow>}
        {selectedTemplate?.selectedFormatList?.length > 1 && <SettingRow flowWrap label={nls('fileFormat')} >
          <Select
            value={selectedTemplate?.format?.toLowerCase() || ''}
            onChange={handleFormatChange}
            size='sm'
            aria-label={nls('fileFormat')}
          >
            {!(selectedTemplate?.selectedFormatList?.includes(selectedTemplate?.format)) && <Option
                className='sr-only'
                key={`${selectedTemplate?.format}0`}
                value={selectedTemplate?.format?.toLowerCase()}
                title={selectedTemplate?.format}
            >{selectedTemplate?.format}</Option>}
            {selectedTemplate?.selectedFormatList?.map((format, index) => {
              return (<Option
                key={`format${index}`}
                value={format}
                title={format}
              >
                {format}
              </Option>)
            })}
          </Select>
        </SettingRow>}
      </div>
    )
  }

  const renderMapOnlyAdvanceSetting = () => {
    const showList = getShowList()
    const { showFeatureAttribution, showMapAttribution, showQuality } = showList
    return (
      <div>
        {showFeatureAttribution && <SettingRow className='mb-1'>
          <div
            title={nls('includeAttributes')}
            aria-label={nls('includeAttributes')}
            className='w-100 align-items-center mt-1 d-flex checkbox-con'
            onClick={handleAttributionVisibleChange}
          >
            <Checkbox
              title={nls('includeAttributes')}
              className='lock-item-ratio'
              data-field='mapSize'
              checked={selectedTemplate?.forceFeatureAttributes}
            />
            <div className='text-left ml-2 f-grow-1'>
              {nls('includeAttributes')}
            </div>
          </div>
        </SettingRow>}
        {showMapAttribution && <SettingRow>
          <div
            title={nls('includeAttribution')}
            aria-label={nls('includeAttribution')}
            className='w-100 align-items-center d-flex checkbox-con'
            onClick={handleMapAttributionChange}
          >
            <Checkbox
              title={nls('includeAttribution')}
              className='lock-item-ratio'
              data-field='mapSize'
              checked={selectedTemplate?.attributionVisible}
            />
            <div className='text-left ml-2 f-grow-1'>
              {nls('includeAttribution')}
            </div>
          </div>
        </SettingRow>}
        {showQuality && <SettingRow label={nls('printQuality')} flowWrap>
          <div className='d-flex align-items-center w-100 dpi-con'>
            <NumericInput
              size='sm'
              className='flex-grow-1 no-right-padding'
              value={dpi}
              onAcceptValue={handleDPIAccept}
              onChange={handleDPIChange}
              showHandlers={false}
              min={1}
              aria-label={nls('printQuality')}
            />
            <Button className='button-radius' disabled size='sm' title='DPI'>DPI</Button>
          </div>
        </SettingRow>}

      </div>
    )
  }

  const renderMapOnlyBaseSetting = () => {
    const showList = getShowList()
    const { showMapSize } = showList
    return (
      <div>
        {showMapSize && <div className='d-flex align-items-center'>
          <div className='flex-grow-1'>
            <div className='mb-1'>{nls('width')}</div>
            <NumericInput
              size='sm'
              className='w-100 map-size-con'
              value={mapWidth}
              onAcceptValue={handleMapWidthAccept}
              onChange={handleMapWidthChange}
              showHandlers={false}
              aria-label={nls('width')}
            />
          </div>
          <div className='flex-grow-1 ml-2'>
            <div className='mb-1'>{nls('height')}</div>
            <NumericInput
              size='sm'
              className='w-100 map-size-con'
              value={mapHeight}
              onAcceptValue={handleMapHeightAccept}
              onChange={handleMapHeightChange}
              showHandlers={false}
              aria-label={nls('height')}
            />
          </div>
        </div>}
      </div>
    )
  }

  const renderSetting = () => {
    return (
      <div className='w-100'>
        {renderBaseSetting()}
        <div>
          {checkIsMapOnly(selectedTemplate?.layout) && renderMapOnlyBaseSetting()}
          {renderAdvancedSetting()}
        </div>
      </div>
    )
  }

  const getWKIDElement = () => {
    return sanitizer.sanitize(
      nls('spatialReference', { WKID: `<a target="_blank" href="${WKID_LINK}">WKID</a>` })
    )
  }

  return (
    <div className={classNames('w-100 h-100', { invisible: (views !== Views.PrintTemplate) })} css={STYLE}>
      <div className='w-100 h-100 d-flex flex-column'>
        <div className='flex-grow-1 w-100 setting-con'>
          {renderSetting()}
        </div>
        <div className='print-button-con'>
          <PrintPreview
            id={id}
            jimuMapView={jimuMapView}
            className='w-100'
            scale={scale}
            selectedTemplate={selectedTemplate}
            printExtentType={selectedTemplate?.printExtentType}
            config={config}
            updatePreviewOverlayItem={updatePreviewOverlayItem}
          />
          <Button className='w-100 mt-2' type='primary' onClick={handelConfirmPrint} title={nls('_widgetLabel')}>{nls('_widgetLabel')}</Button>
        </div>
      </div>
    </div>
  )
}

export default TemplateSetting
