/** @jsx jsx */
import { React, css, jsx, esri, polished, classNames, moduleLoader, defaultMessages as jimuCoreDefaultMessage, hooks } from 'jimu-core'
import { TextInput, Radio, Button, Checkbox, NumericInput, CollapsablePanel, Tooltip, defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import type { JimuMapView } from 'jimu-arcgis'
import type * as jimuCoreWkid from 'jimu-core/wkid'
import defaultMessages from '../translations/default'
import { PrintExtentType, ModeType, type IMPrintTemplateProperties, WKID_LINK } from '../../config'
import { ResetOutlined } from 'jimu-icons/outlined/editor/reset'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
const EditIcon = require('jimu-icons/svg/outlined/editor/edit.svg')
const Sanitizer = esri.Sanitizer
const sanitizer = new Sanitizer()
const { useRef } = React
interface Props {
  id: string
  modeType: ModeType
  printTemplateProperties: IMPrintTemplateProperties
  jimuMapView: JimuMapView
  handleTemplatePropertyChange: (printTemplateProperties: IMPrintTemplateProperties) => void
}

enum SettingCollapseType {
  Title = 'TITLE',
  Extents = 'EXTENTS',
  SpatialReference = 'SPATIAL REFERENCE',
  Feature = 'FEATURE ATTRIBUTION',
  Quality = 'QUALITY',
}

const CommonTemplateSetting = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessages, jimuCoreDefaultMessage, jimuUiDefaultMessage)
  const wkidUtilsRef = useRef(null)
  const oldWkid = useRef(null)
  const modulesLoadedRef = useRef(false)

  const STYLE = css`
    .dpi-input .input-wrapper{
      padding-right: 0;
    }
    .radio-con {
      cursor: pointer;
    }
    .use-current-map-scale svg{
      margin: 0 auto;
    }
    .enable-setting-con .jimu-widget-setting--row-label{
      margin-bottom: 0;
    }
    .wkid-describtion {
      font-size: ${polished.rem(12)};
      color: var(--ref-palette-neutral-900);
    }
    .wkid-describtion-invalid {
      color: var(--sys-color-error-dark)
    }
    .check-box-con, .radio-con {
      color: var(--ref-palette-neutral-900);
      font-size: ${polished.rem(14)};
      line-height: ${polished.rem(22)};
      margin: ${polished.rem(4)} 0 ${polished.rem(8)} 0;
    }
  `

  const { printTemplateProperties, modeType, jimuMapView, id, handleTemplatePropertyChange } = props
  const [settingCollapse, setSettingCollapse] = React.useState(null as SettingCollapseType)
  const [titleText, setTitleText] = React.useState(printTemplateProperties.layoutOptions?.titleText || '')
  const [wkid, setWkid] = React.useState(printTemplateProperties?.wkid)
  const [dpi, setDpi] = React.useState(printTemplateProperties?.exportOptions?.dpi)
  const [outScale, setOutScale] = React.useState(printTemplateProperties?.outScale)
  const [descriptionOfWkid, setDescriptionOfWkid] = React.useState(null)
  const [descriptionOfMapsWkid, setDescriptionOfMapsWkid] = React.useState(null)

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

  const initDescriptionOfMapsWkid = React.useCallback(async (jimuMapView) => {
    if (jimuMapView) {
      const wkid = jimuMapView?.view?.spatialReference?.wkid
      const wkidLabel = wkid ? await getSRLabelDynamic(wkid) : ''
      setDescriptionOfMapsWkid(wkidLabel)
    }
  }, [getSRLabelDynamic])

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

  const openSettingCollapse = async (settingCollapseType: SettingCollapseType) => {
    if (settingCollapseType === SettingCollapseType.SpatialReference && !printTemplateProperties?.wkidLabel) {
      //When expanding the Output spatial reference, if the WKID util has not been loaded, you need to load the WKID util first.
      const wkidLabel = await getSRLabelDynamic(printTemplateProperties?.wkid as number)
      setDescriptionOfWkid(wkidLabel)
    }
    setSettingCollapse(settingCollapseType)
  }

  const closeSettingCollapse = () => {
    setSettingCollapse(null)
  }

  const handlePrintTitleChange = (event) => {
    const value = event?.target?.value
    setTitleText(value)
  }

  const handlePrintTitleAccept = (value) => {
    const newPrintTemplateProperties = printTemplateProperties.setIn(['layoutOptions', 'titleText'], value)
    handleTemplatePropertyChange(newPrintTemplateProperties)
  }

  const handleWKIDChange = async (event) => {
    const value = event?.target?.value
    setWkid(value)
    const isValid = value ? await isValidWkidDynamic(value) : true
    if (isValid) {
      const wkidLabel = value ? await getSRLabelDynamic(value) : ''
      setDescriptionOfWkid(wkidLabel)
    } else {
      setDescriptionOfWkid(nls('invalidWKID'))
    }
  }

  const handleWKIDAccept = async (value) => {
    const isValid = value ? await isValidWkidDynamic(value) : true
    if (!isValid) {
      setWkid(oldWkid.current)
      const oldWkidLabel = await getSRLabelDynamic(oldWkid.current)
      setDescriptionOfWkid(oldWkidLabel)
      return false
    }
    const wkidLabel = value ? await getSRLabelDynamic(value) : ''
    setDescriptionOfWkid(wkidLabel)
    const newPrintTemplateProperties = printTemplateProperties.setIn(['wkid'], value).set('wkidLabel', wkidLabel)
    handleTemplatePropertyChange(newPrintTemplateProperties)
  }

  const handleDPIChange = (value) => {
    if (value < 1) return false
    setDpi(parseInt(value))
  }

  const handleDPIAccept = (value) => {
    if (value < 1) return false
    const newPrintTemplateProperties = printTemplateProperties.setIn(['exportOptions', 'dpi'], parseInt(value))
    handleTemplatePropertyChange(newPrintTemplateProperties)
  }

  const handleScaleChange = (value) => {
    setOutScale(value)
  }

  const setScaleByCurrentMapScale = () => {
    if (!jimuMapView) return
    const scale = jimuMapView?.view?.scale
    const newPrintTemplateProperties = printTemplateProperties.setIn(['outScale'], scale)
    handleTemplatePropertyChange(newPrintTemplateProperties)
  }

  const handleScaleAccept = (value) => {
    const newPrintTemplateProperties = printTemplateProperties.setIn(['outScale'], value)
    handleTemplatePropertyChange(newPrintTemplateProperties)
  }

  const handlePrintExtentTypeChange = (printExtentType: PrintExtentType) => {
    let newPrintTemplateProperties = printTemplateProperties.setIn(['printExtentType'], printExtentType)
    const scale = jimuMapView ? jimuMapView?.view?.scale : 36978595.474472
    switch (printExtentType) {
      case PrintExtentType.CurrentMapExtent:
        newPrintTemplateProperties = newPrintTemplateProperties.setIn(['scalePreserved'], false)
        break
      case PrintExtentType.CurrentMapScale:
        newPrintTemplateProperties = newPrintTemplateProperties.setIn(['scalePreserved'], true)
        break
      case PrintExtentType.SetMapScale:
        newPrintTemplateProperties = newPrintTemplateProperties.setIn(['scalePreserved'], true)
        newPrintTemplateProperties = newPrintTemplateProperties.setIn(['outScale'], scale)
        break
    }
    handleTemplatePropertyChange(newPrintTemplateProperties)
  }

  const handleCheckBoxChange = (key: string) => {
    const newPrintTemplateProperties = printTemplateProperties.setIn([key], !printTemplateProperties?.[key])
    handleTemplatePropertyChange(newPrintTemplateProperties)
  }

  const handleEnableTitleChange = () => {
    const newPrintTemplateProperties = printTemplateProperties.setIn(['enableTitle'], !printTemplateProperties?.enableTitle)
    handleTemplatePropertyChange(newPrintTemplateProperties)
  }

  const getWKIDElement = () => {
    return sanitizer.sanitize(
      nls('wellKnownId', { wkid: `<a target="_blank" href="${WKID_LINK}">WKID</a>` })
    )
  }

  const checkIsValidWkid = (wkid) => {
    if (wkidUtilsRef.current) {
      const { isValidWkid } = wkidUtilsRef.current
      return wkid ? isValidWkid(wkid) : true
    } else {
      return true
    }
  }

  const getDescriptionOfWkid = React.useCallback((wkid) => {
    return wkid ? descriptionOfWkid : descriptionOfMapsWkid
  }, [descriptionOfMapsWkid, descriptionOfWkid])

  React.useEffect(() => {
    initDescriptionOfMapsWkid(jimuMapView)
  }, [jimuMapView, initDescriptionOfMapsWkid])

  React.useEffect(() => {
    setTitleText(printTemplateProperties.layoutOptions?.titleText || '')
    setWkid(printTemplateProperties?.wkid)
    setDpi(printTemplateProperties?.exportOptions?.dpi)
    setOutScale(printTemplateProperties?.outScale)
    oldWkid.current = printTemplateProperties?.wkid
    if (printTemplateProperties?.wkidLabel) {
      setDescriptionOfWkid(printTemplateProperties?.wkidLabel)
    } else {
      if (wkidUtilsRef.current && printTemplateProperties?.wkid) {
        getSRLabelDynamic(printTemplateProperties?.wkid as number).then(label => {
          setDescriptionOfWkid(label)
        })
      }
    }
  }, [getSRLabelDynamic, printTemplateProperties])

  return (
    <div css={STYLE}>
      <div role='group' aria-label={nls('setDefaults')}>
        <SettingRow label={nls('setDefaults')} flow='wrap'/>
        {/* Print title */}
        <CollapsablePanel
          label={nls('printTitle')}
          isOpen={settingCollapse === SettingCollapseType.Title}
          onRequestOpen={() => { openSettingCollapse(SettingCollapseType.Title) }}
          onRequestClose={closeSettingCollapse}
          role='group'
          aria-label={nls('printTitle')}
          rightIcon={EditIcon}
          type='primary'
          className={settingCollapse === SettingCollapseType.Title && 'active-collapse'}
        >
          <SettingRow className='mt-2'>
            <TextInput
              size='sm'
              className='search-placeholder w-100'
              placeholder={nls('printTitle')}
              value={titleText}
              onAcceptValue={handlePrintTitleAccept}
              onChange={handlePrintTitleChange}
              aria-label={nls('printTitle')}
            />
          </SettingRow>
        </CollapsablePanel>

        {/* Map print extents */}
        <CollapsablePanel
          label={nls('mapPrintingExtents')}
          isOpen={settingCollapse === SettingCollapseType.Extents}
          onRequestOpen={() => { openSettingCollapse(SettingCollapseType.Extents) }}
          onRequestClose={closeSettingCollapse}
          role='group'
          aria-label={nls('mapPrintingExtents')}
          rightIcon={EditIcon}
          type='primary'
          className={settingCollapse === SettingCollapseType.Extents && 'active-collapse'}
        >
          <SettingRow className='mt-2'>
            <div className='w-100' role='radiogroup'>
              <div title={nls('currentMapExtent')} aria-label={nls('currentMapExtent')} className='d-flex align-items-center radio-con' onClick={() => { handlePrintExtentTypeChange(PrintExtentType.CurrentMapExtent) }}>
                <Radio title={nls('currentMapExtent')} checked={printTemplateProperties?.printExtentType === PrintExtentType.CurrentMapExtent} className='mr-2'/> {nls('currentMapExtent')}
              </div>
              <div title={nls('currentMapScale')} aria-label={nls('currentMapScale')} className='d-flex align-items-center radio-con' onClick={() => { handlePrintExtentTypeChange(PrintExtentType.CurrentMapScale) }}>
                <Radio title={nls('currentMapScale')} checked={printTemplateProperties?.printExtentType === PrintExtentType.CurrentMapScale} className='mr-2'/> {nls('currentMapScale')}
              </div>
              <div title={nls('setMapScale')} aria-label={nls('setMapScale')} className='d-flex align-items-center radio-con' onClick={() => { handlePrintExtentTypeChange(PrintExtentType.SetMapScale) }}>
                <Radio title={nls('setMapScale')} checked={printTemplateProperties?.printExtentType === PrintExtentType.SetMapScale} className='mr-2'/> {nls('setMapScale')}
              </div>
              {printTemplateProperties?.printExtentType === PrintExtentType.SetMapScale && <div className='d-flex mt-1 align-items-center'>
                <NumericInput
                  size='sm'
                  className='search-placeholder flex-grow-1 dpi-input'
                  value={outScale}
                  onAcceptValue={handleScaleAccept}
                  onChange={handleScaleChange}
                  showHandlers={false}
                />
                <Button className='use-current-map-scale' size='sm' title={nls('useCurrentScale')} disabled={!jimuMapView} onClick={setScaleByCurrentMapScale}><ResetOutlined /></Button>
              </div>}
            </div>
          </SettingRow>
        </CollapsablePanel>

        {/* Output spatial reference */}
        <CollapsablePanel
          label={nls('outputSpatialReference')}
          isOpen={settingCollapse === SettingCollapseType.SpatialReference}
          onRequestOpen={() => { openSettingCollapse(SettingCollapseType.SpatialReference) }}
          onRequestClose={closeSettingCollapse}
          role='group'
          type='primary'
          aria-label={nls('outputSpatialReference')}
          rightIcon={EditIcon}
          className={settingCollapse === SettingCollapseType.SpatialReference && 'active-collapse'}
        >
          <SettingRow flow='wrap' label={<div className='flex-grow-1' dangerouslySetInnerHTML={{ __html: getWKIDElement() }}></div>} className='mt-2'>
            <TextInput
              size='sm'
              className='search-placeholder w-100'
              value={wkid || ''}
              onAcceptValue={handleWKIDAccept}
              onChange={handleWKIDChange}
              suffix={<Tooltip title={nls('wkidRemind')} id={`wkidRemind${id}`} describeChild enterDelay={0} aria-live='off' placement='top'>
                <Button className='wkid-info-icon p-0' icon type='tertiary' aria-label={nls('additionalInformation')} aria-describedby={`wkidRemind${id}`}>
                  <InfoOutlined />
                </Button>
              </Tooltip>}
              placeholder={nls('wkidSettingPlaceholder', { wkid: jimuMapView?.view?.spatialReference?.wkid || null })}
              aria-label={nls('wellKnownId', { wkid: 'WKID' })}
              aria-describedby='print-wkid-describtion'
            />
            <div id='print-wkid-describtion'
              className={classNames('text-truncate mt-1 wkid-describtion', { 'wkid-describtion-invalid': !checkIsValidWkid(Number(wkid)) })}
              title={getDescriptionOfWkid(wkid)}
              aria-label={getDescriptionOfWkid(wkid)}
            >
              {getDescriptionOfWkid(wkid)}
            </div>
          </SettingRow>
        </CollapsablePanel>

        {/* Print quality */}
        <CollapsablePanel
          label={nls('printQuality')}
          isOpen={settingCollapse === SettingCollapseType.Quality}
          onRequestOpen={() => { openSettingCollapse(SettingCollapseType.Quality) }}
          onRequestClose={closeSettingCollapse}
          role='group'
          aria-label={nls('printQuality')}
          type='primary'
          rightIcon={EditIcon}
          className={settingCollapse === SettingCollapseType.Quality && 'active-collapse'}
        >
          <SettingRow className='mt-2'>
            <div className='d-flex align-items-center w-100'>
              <NumericInput
                size='sm'
                className='search-placeholder flex-grow-1 dpi-input'
                placeholder={nls('printQuality')}
                value={dpi}
                onAcceptValue={handleDPIAccept}
                onChange={handleDPIChange}
                showHandlers={false}
                aria-label={nls('printQuality')}
                aria-describedby={`describeElement${id}`}
              />
              <Button disabled size='sm' title='DPI'>DPI</Button>
              <div className='sr-only' id={`describeElement${id}`}>{dpi}DPI</div>
            </div>
          </SettingRow>
        </CollapsablePanel>

        {/* Print quality */}
        <CollapsablePanel
          label={nls('featureAttributes')}
          isOpen={settingCollapse === SettingCollapseType.Feature}
          onRequestOpen={() => { openSettingCollapse(SettingCollapseType.Feature) }}
          onRequestClose={closeSettingCollapse}
          role='group'
          type='primary'
          aria-label={nls('featureAttributes')}
          rightIcon={EditIcon}
          className={settingCollapse === SettingCollapseType.Feature && 'active-collapse'}
        >
          <SettingRow className='mt-2'>
            <div
              title={nls('includeAttributes')}
              className='d-flex w-100 align-items-center check-box-con'
              aria-label={nls('includeAttributes')}
              onClick={() => { handleCheckBoxChange('forceFeatureAttributes') }}
            >
              <Checkbox
                title={nls('includeAttributes')}
                className='lock-item-ratio'
                data-field='forceFeatureAttributes'
                checked={printTemplateProperties?.forceFeatureAttributes || false}
              />
              <div className='lock-item-ratio-label text-left ml-2'>
                {nls('includeAttributes')}
              </div>
            </div>
          </SettingRow>
        </CollapsablePanel>
      </div>

      {/* Select editable setting */}
      {modeType === ModeType.Classic && <SettingRow className='mt-4 enable-setting-con' flow='wrap' role='group' aria-label={nls('selectEditableSettings')} label={nls('selectEditableSettings')}>
        <div className='w-100'>
          <div
            title={nls('printTitle')}
            aria-label={nls('printTitle')}
            className='d-flex w-100 align-items-center check-box-con'
            onClick={() => { handleEnableTitleChange() }}
          >
            <Checkbox
              title={nls('printTitle')}
              className='lock-item-ratio'
              data-field='enableTitle'
              checked={printTemplateProperties?.enableTitle || false}
            />
            <div className='lock-item-ratio-label text-left ml-2'>
              {nls('printTitle')}
            </div>
          </div>
          <div
            title={nls('mapPrintingExtents')}
            aria-label={nls('mapPrintingExtents')}
            className='d-flex w-100 align-items-center check-box-con'
            onClick={() => { handleCheckBoxChange('enableMapPrintExtents') }}
          >
            <Checkbox
              title={nls('mapPrintingExtents')}
              className='lock-item-ratio'
              data-field='enableMapPrintExtents'
              checked={printTemplateProperties?.enableMapPrintExtents || false}
            />
            <div className='lock-item-ratio-label text-left ml-2'>
              {nls('mapPrintingExtents')}
            </div>
          </div>
          <div
            title={nls('outputSpatialReference')}
            aria-label={nls('outputSpatialReference')}
            className='d-flex w-100 align-items-center check-box-con'
            onClick={() => { handleCheckBoxChange('enableOutputSpatialReference') }}
          >
            <Checkbox
              title={nls('outputSpatialReference')}
              className='lock-item-ratio'
              data-field='enableOutputSpatialReference'
              checked={printTemplateProperties?.enableOutputSpatialReference || false}
            />
            <div className='lock-item-ratio-label text-left ml-2'>
              {nls('outputSpatialReference')}
            </div>
          </div>
          <div
            title={nls('printQuality')}
            aria-label={nls('printQuality')}
            className='d-flex w-100 align-items-center check-box-con'
            onClick={() => { handleCheckBoxChange('enableQuality') }}
          >
            <Checkbox
              title={nls('printQuality')}
              className='lock-item-ratio'
              data-field='enableQuality'
              checked={printTemplateProperties?.enableQuality || false}
            />
            <div className='lock-item-ratio-label text-left ml-2'>
              {nls('printQuality')}
            </div>
          </div>
          <div
            title={nls('featureAttributes')}
            aria-label={nls('featureAttributes')}
            className='d-flex w-100 align-items-center check-box-con'
            onClick={() => { handleCheckBoxChange('enableFeatureAttribution') }}
          >
            <Checkbox
              title={nls('featureAttributes')}
              className='lock-item-ratio'
              data-field='enableFeatureAttribution'
              checked={printTemplateProperties?.enableFeatureAttribution || false}
            />
            <div className='lock-item-ratio-label text-left ml-2'>
              {nls('featureAttributes')}
            </div>
          </div>
        </div>
      </SettingRow>}
    </div>
  )
}

export default CommonTemplateSetting
