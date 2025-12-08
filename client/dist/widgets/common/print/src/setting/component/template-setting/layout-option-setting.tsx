/** @jsx jsx */
import { React, jsx, css, AllDataSourceTypes, defaultMessages as jimuCoreDefaultMessage, type ImmutableArray, Immutable, hooks, type ImmutableObject, type UseDataSource } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { TextInput, Select, Option, Checkbox, CollapsablePanel, TextArea, defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import { type IMPrintTemplateProperties, type IMConfig, ModeType, type ElementOverrideOptions, type MapSurroundInfo, type MapSurroundInfoItemType } from '../../../config'
import defaultMessages from '../../translations/default'
import { getScaleBarList, getKeyOfNorthArrow, getElementOverridesOptions, checkDsIsOutputDs, getNewConfigWidthNewTemplateItem } from '../../../utils/utils'
import { shouldHideDataSource, handleDsChange } from '../../util/util'
import { SettingCollapseType } from '../../type/type'
import ElementOverridesOptionsLabel from './element-overrides-options-label'
const { useEffect, useState, useRef } = React
const EditIcon = require('jimu-icons/svg/outlined/editor/edit.svg')

interface Props {
  id: string
  templateIndex: number
  config: IMConfig
  template: IMPrintTemplateProperties
  handelCustomSettingChange?: (key: string[], value) => void
}

const STYLE = css`
  .warning-icon-con {
    color: var(--sys-color-warning-main) !important;
  }
`

interface ElementOverridesOptionsOpenType {
  [key: string]: boolean
}
interface ElementOverridesOptionsOpenList {
  northArrow: ElementOverridesOptionsOpenType
  scaleBar: ElementOverridesOptionsOpenType
  legend: ElementOverridesOptionsOpenType
  dynamicText: ElementOverridesOptionsOpenType
  table: ElementOverridesOptionsOpenType
  chart: ElementOverridesOptionsOpenType
}

type IMElementOverridesOptionsOpenList = ImmutableObject<ElementOverridesOptionsOpenList>

interface CustomTextElementsOpenType {
  [key: string]: boolean
}

type IMCustomTextElementsOpenList = ImmutableArray<CustomTextElementsOpenType>

const LayoutOptionSetting = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage, jimuCoreDefaultMessage)
  const { id, config, templateIndex, template, handelCustomSettingChange } = props
  const templateRef = useRef(null as IMPrintTemplateProperties)

  const hasInitElementOverridesOptionsOpenList = useRef(false)

  const [authorText, setAuthorText] = useState(template?.layoutOptions?.authorText || '')
  const [copyrightText, setCopyrightText] = useState(template?.layoutOptions?.copyrightText || '')
  const [openCollapseType, setOpenCollapseType] = useState(null as SettingCollapseType)
  const [customTextElements, setCustomTextElements] = useState(template?.layoutOptions?.customTextElements)
  const [customTextElementsOpenList, setCustomTextElementsOpenList] = useState(null as IMCustomTextElementsOpenList)
  const [northArrowKey, setNorthArrowKey] = useState(null)

  const [elementOverridesOptions, setElementOverridesOptions] = useState(null as ElementOverrideOptions)
  const [elementOverridesOptionsOpenList , setElementOverridesOptionsOpenList ] = useState(null as IMElementOverridesOptionsOpenList)

  useEffect(() => {
    setNorthArrowKey(getKeyOfNorthArrow(template?.layoutOptions?.elementOverrides))
    setAuthorText(template?.layoutOptions?.authorText || '')
    setCopyrightText(template?.layoutOptions?.copyrightText || '')
    setCustomTextElements(template?.layoutOptions?.customTextElements)

    const newElementOverridesOptions = getElementOverridesOptions(template?.layoutOptions?.elementOverrides)
    setElementOverridesOptions(newElementOverridesOptions)
    templateRef.current = template
  }, [template])

  useEffect(() => {
    initCustomTextElementsOpenList()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (checkIsUpdateCustomTextElementsOpenList()) {
      initCustomTextElementsOpenList()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customTextElements])

  useEffect(() => {
    initElementOverridesOptionsOpenList(elementOverridesOptions)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [elementOverridesOptions])

  const initElementOverridesOptionsOpenList = (elementOverridesOptions: ElementOverrideOptions) => {
    const hasElementOverridesOptions = checkNeedShowElementOverridesOptionsSetting(elementOverridesOptions)
    if (hasInitElementOverridesOptionsOpenList.current || !hasElementOverridesOptions) return
    const options = {} as ElementOverridesOptionsOpenList
    for(const key in elementOverridesOptions) {
      const mapSurroundInfo = elementOverridesOptions[key] as MapSurroundInfo[]
      if (!options[key]) {
        options[key] = {}
      }
      mapSurroundInfo.forEach(elementOverridesOption => {
        options[key][elementOverridesOption.name] = false
      })
    }
    setElementOverridesOptionsOpenList(Immutable(options))
    hasInitElementOverridesOptionsOpenList.current = true
  }

  const checkIsUpdateCustomTextElementsOpenList = () => {
    if (!customTextElements) return false
    if (customTextElements?.length !== customTextElementsOpenList?.length) {
      return true
    } else {
      let isUpdate = false
      customTextElements?.forEach((item, index) => {
        for (const key in item) {
          if (!Object.prototype.hasOwnProperty.call(customTextElementsOpenList[index], key)) {
            isUpdate = true
          }
        }
      })
      return isUpdate
    }
  }

  const initCustomTextElementsOpenList = () => {
    const enableList = customTextElements?.map((info, index) => {
      const enable = {} as CustomTextElementsOpenType
      for (const key in info) {
        enable[key] = false
      }
      return enable
    })
    setCustomTextElementsOpenList(Immutable(enableList || []))
  }

  const handleAuthorTextChange = (event) => {
    const value = event?.target?.value
    setAuthorText(value)
  }

  const handleAuthorTextAccept = (value) => {
    handelCustomSettingChange(['layoutOptions', 'authorText'], value)
  }

  const handleCopyrightTextChange = (event) => {
    const value = event?.target?.value
    setCopyrightText(value)
  }

  const handleCopyrightTextAccept = (value) => {
    handelCustomSettingChange(['layoutOptions', 'copyrightText'], value)
  }

  const openSettingCollapse = (openCollapseType: SettingCollapseType) => {
    closeCustomTextElementCollapse()
    closeElementOverridesSetting()
    setOpenCollapseType(openCollapseType)
  }

  const closeSettingCollapse = () => {
    closeCustomTextElementCollapse()
    setOpenCollapseType(null)
    closeElementOverridesSetting()
  }

  const closeCustomTextElementCollapse = () => {
    //close Collapse of custom text elements
    const newCustomTextElementsOpenList = customTextElementsOpenList?.map(item => {
      const enable = {} as CustomTextElementsOpenType
      for (const key in item) {
        enable[key] = false
      }
      return enable
    })
    setCustomTextElementsOpenList(newCustomTextElementsOpenList)
  }

  const handleScalebarUnitChange = (e) => {
    const format = e.target.value
    handelCustomSettingChange(['layoutOptions', 'scalebarUnit'], format)
  }

  const handleCheckBoxChange = (key: string) => {
    handelCustomSettingChange([key], !template?.[key])
  }

  const handleLegendChanged = (e) => {
    const legendEnabled = checkIsLegendEnabled()
    const legendLayers = !legendEnabled ? [] : null
    handelCustomSettingChange(['layoutOptions', 'legendLayers'], legendLayers)
  }

  const checkIsLegendEnabled = () => {
    return !!template?.layoutOptions?.legendLayers
  }

  const openCustomTextElementSetting = (key: string, index: number) => {
    const newCustomTextElementsOpenList = customTextElementsOpenList?.map((item, idx) => {
      const enable = {} as CustomTextElementsOpenType
      for (const k in item) {
        if (index === idx && k === key) {
          enable[k] = !customTextElementsOpenList[index][key]
        } else {
          enable[k] = false
        }
      }
      return enable
    })
    setOpenCollapseType(null)
    closeElementOverridesSetting()
    setCustomTextElementsOpenList(newCustomTextElementsOpenList)
  }

  const openElementOverridesSetting = (type: string, name: string) => {
    let newCustomTextElementsOpenList = elementOverridesOptionsOpenList
    for (const optionType in elementOverridesOptionsOpenList) {
      const openOption = elementOverridesOptionsOpenList[optionType]
      for(const optionName in openOption) {
        const open = (optionName === name && optionType === type) ? !elementOverridesOptionsOpenList?.[type]?.[name] : false
        newCustomTextElementsOpenList = newCustomTextElementsOpenList.setIn([optionType, optionName], open)
      }
    }
    setOpenCollapseType(null)
    closeCustomTextElementCollapse()
    setElementOverridesOptionsOpenList(newCustomTextElementsOpenList)
  }

  const closeElementOverridesSetting = () => {
    let newCustomTextElementsOpenList = elementOverridesOptionsOpenList
    for (const type in elementOverridesOptionsOpenList) {
      const openOption = elementOverridesOptionsOpenList[type]
      for(const name in openOption) {
        newCustomTextElementsOpenList = newCustomTextElementsOpenList.setIn([type, name], false)
      }
    }
    setElementOverridesOptionsOpenList(newCustomTextElementsOpenList)
  }

  const handleElementOverridesOptionsChange = (elementOverridesName: string, key: string, value: any, needDsSelector = false) => {
    if(needDsSelector && !value) {
      const newTemplate = template.setIn(['layoutOptions', 'elementOverrides', elementOverridesName, 'exbDataSource'], [])
        .setIn(['layoutOptions', 'elementOverrides', elementOverridesName, 'isDsOutputDs'], false)
        .setIn(['layoutOptions', 'elementOverrides', elementOverridesName, key], value)
      const newConfig = getNewConfigWidthNewTemplateItem(config, templateIndex, newTemplate?.asMutable({ deep: true }))
      handleDsChange(id, newConfig)
    } else {
      handelCustomSettingChange(['layoutOptions', 'elementOverrides', elementOverridesName, key], value)
    }
  }

  const handleElementOverridesDsChange = (useDataSources: UseDataSource[], name: string) => {
    const isDsOutputDs = checkDsIsOutputDs(useDataSources[0]?.dataSourceId)
    const newTemplate = template.setIn(['layoutOptions', 'elementOverrides', name, 'exbDataSource'], useDataSources).setIn(['layoutOptions', 'elementOverrides', name, 'isDsOutputDs'], isDsOutputDs)
    const newConfig = getNewConfigWidthNewTemplateItem(config, templateIndex, newTemplate?.asMutable({ deep: true }))
    handleDsChange(id, newConfig)
  }

  const renderCustomTextElementsSetting = (customTextElementsOpenList) => {
    const settingItem = []
    customTextElements?.forEach((info, index) => {
      for (const key in info) {
        const elementItem = (<CollapsablePanel
          label={key}
          key={`${key}_${index}`}
          isOpen={customTextElementsOpenList?.[index]?.[key] || false}
          onRequestOpen={() => { openCustomTextElementSetting(key, index) }}
          onRequestClose={closeSettingCollapse}
          role='group'
          aria-label={key}
          rightIcon={EditIcon}
          type='primary'
          className={customTextElementsOpenList?.[key] && 'active-collapse'}
        >
          <SettingRow flow='wrap' className='align-item-center mt-2'>
            <TextArea
              className='flex-grow-1'
              value={info[key] || ''}
              aria-label={key}
              onAcceptValue={value => { handelCustomTextElementsAccept(index, key, value) }}
              onChange={e => { handelCustomTextElementsChange(index, key, e) }}
            />
          </SettingRow>
        </CollapsablePanel>)
        settingItem.push(elementItem)
      }
    })
    return settingItem
  }

  const renderElementOverridesOptionsSetting = () => {
    const settingItem = []
    for(const elementType in elementOverridesOptions) {
      const mapSurroundInfo = elementOverridesOptions[elementType] as MapSurroundInfo[]
      mapSurroundInfo.forEach((elementOverridesOption, index) => {
        const elementItem = renderElementOverridesOptionsSettingItem(elementOverridesOption, elementType, index)
        settingItem.push(elementItem)
      })
    }
    return settingItem
  }


  const renderElementOverridesOptionsSettingItem = (elementOverridesOption, elementType: string, index: number) => {
    const needDsSelector = checkIsElementOverridesNeedDsSelector(elementOverridesOption.type)
    const name = elementOverridesOption.name
    const isOpen = elementOverridesOptionsOpenList?.[elementType]?.[name] || false
    return (<CollapsablePanel
      label={<ElementOverridesOptionsLabel elementOverridesOption={elementOverridesOption} needDsSelector={needDsSelector}/>}
      key={`${name}_${index}`}
      isOpen={isOpen}
      onRequestOpen={() => { openElementOverridesSetting(elementType, name) }}
      onRequestClose={closeSettingCollapse}
      role='group'
      aria-label={name}
      rightIcon={EditIcon}
      type='primary'
      className={elementOverridesOptionsOpenList?.[elementType]?.[name] && 'active-collapse'}
    >
      <SettingRow flow='wrap' className='align-item-center mt-2'>
        <div
          title={name}
          aria-label={nls('includeElementOverrides', { name: name })}
          className='d-flex w-100 align-items-center check-box-con'
          onClick={() => { handleElementOverridesOptionsChange(name, 'visible', !elementOverridesOption.visible, needDsSelector) }}
        >
          <Checkbox
            title={name}
            className='lock-item-ratio'
            aria-label={nls('includeElementOverrides', { name: name })}
            checked={elementOverridesOption.visible || false}
          />
          <div className='lock-item-ratio-label text-left ml-2'>
            {nls('includeElementOverrides', { name: name })}
          </div>
        </div>
      </SettingRow>
      {
        (needDsSelector && elementOverridesOption.visible) && <SettingRow flow='wrap' className='align-item-center mt-2'>
          <DataSourceSelector
            types={Immutable([AllDataSourceTypes.FeatureLayer, AllDataSourceTypes.ImageryLayer, AllDataSourceTypes.OrientedImageryLayer])}
            useDataSources={elementOverridesOption?.exbDataSource}
            mustUseDataSource
            onChange={ds => { handleElementOverridesDsChange(ds, name) }}
            widgetId={id}
            closeDataSourceListOnChange
            aria-describedby='list-empty-tip'
            hideDataView
            hideDs={shouldHideDataSource}
          />
      </SettingRow>
      }
    </CollapsablePanel>)
  }

  const checkIsElementOverridesNeedDsSelector = (elementOverridesType: MapSurroundInfoItemType) => {
    const needDsSelector = elementOverridesType === 'CIMChartFrame' || elementOverridesType === 'CIMGraphicElement' || elementOverridesType === 'CIMTableFrame'
    return needDsSelector
  }

  const checkNeedShowElementOverridesOptionsSetting = (elementOverridesOptions: ElementOverrideOptions) => {
    let length = 0
    for(const elementType in elementOverridesOptions) {
      const mapSurroundInfo = elementOverridesOptions[elementType] as MapSurroundInfo[] || []
      length = length + mapSurroundInfo.length
    }
    return length > 0
  }

  const renderCustomTextElementsEnableSetting = () => {
    const settingItem = []
    customTextElements?.forEach((info, index) => {
      for (const key in info) {
        const elementItem = (<div
          key={`${key}_${index}`}
          title={key}
          aria-label={key}
          className='d-flex w-100 align-items-center check-box-con'
          onClick={() => { handleCustomTextElementEnableChange(key, index) }}
        >
          <Checkbox
            title={key}
            className='lock-item-ratio'
            checked={template?.customTextElementEnableList?.[index]?.[key] || false}
          />
          <div className='lock-item-ratio-label text-left ml-2'>
            {key}
          </div>
        </div>)
        settingItem.push(elementItem)
      }
    })
    return settingItem
  }

  const handleCustomTextElementEnableChange = (key: string, index: number) => {
    const enableItem = template?.customTextElementEnableList?.[index]
    const newItem = enableItem.set(key, !enableItem?.[key])
    const newCustomTextElementEnableList = template?.customTextElementEnableList?.asMutable({ deep: true })
    newCustomTextElementEnableList.splice(index, 1, newItem)
    handelCustomSettingChange(['customTextElementEnableList'], newCustomTextElementEnableList)
  }

  const handelCustomTextElementsAccept = (index: number, key: string, value) => {
    const newItem = customTextElements[index].set(key, value)
    const newCustomTextElements = customTextElements?.asMutable({ deep: true })
    newCustomTextElements.splice(index, 1, newItem)
    handelCustomSettingChange(['layoutOptions', 'customTextElements'], newCustomTextElements)
  }

  const handelCustomTextElementsChange = (index: number, key: string, event) => {
    const value = event?.target?.value
    const newItem = customTextElements[index].set(key, value)
    const newCustomTextElements = customTextElements?.asMutable({ deep: true })
    newCustomTextElements.splice(index, 1, newItem)
    setCustomTextElements(Immutable(newCustomTextElements))
  }

  return (
    <SettingSection title={nls('LayoutOptions')} role='group' aria-label={nls('LayoutOptions')} css={STYLE}>
      <div role='group' aria-label={nls('setDefaults')}>
        <SettingRow label={nls('setDefaults')} flow='wrap'/>
        {template?.hasAuthorText && <CollapsablePanel
          label={nls('printTemplateAuthor')}
          isOpen={openCollapseType === SettingCollapseType.Author}
          onRequestOpen={() => { openSettingCollapse(SettingCollapseType.Author) }}
          onRequestClose={closeSettingCollapse}
          role='group'
          aria-label={nls('printTemplateAuthor')}
          type='primary'
          rightIcon={EditIcon}
          className='mb-2'
        >
          <SettingRow flow='wrap' className='mt-2'>
            <TextInput
              size='sm'
              className='w-100'
              value={authorText}
              onAcceptValue={handleAuthorTextAccept}
              onChange={handleAuthorTextChange}
              aria-label={nls('printTemplateAuthor')}
            />
          </SettingRow>
        </CollapsablePanel>}
        {template?.hasCopyrightText && <CollapsablePanel
          label={nls('copyright')}
          isOpen={openCollapseType === SettingCollapseType.Copyright}
          onRequestOpen={() => { openSettingCollapse(SettingCollapseType.Copyright) }}
          onRequestClose={closeSettingCollapse}
          role='group'
          aria-label={nls('copyright')}
          rightIcon={EditIcon}
          type='primary'
          className='mb-2'
        >
          <SettingRow flow='wrap' className='mt-2'>
            <TextInput
              size='sm'
              className='w-100'
              value={copyrightText}
              onAcceptValue={handleCopyrightTextAccept}
              onChange={handleCopyrightTextChange}
              aria-label={nls('copyright')}
            />
          </SettingRow>
        </CollapsablePanel>}
        {template?.hasLegend && <CollapsablePanel
          label={nls('legend')}
          isOpen={openCollapseType === SettingCollapseType.Legend}
          onRequestOpen={() => { openSettingCollapse(SettingCollapseType.Legend) }}
          onRequestClose={closeSettingCollapse}
          role='group'
          type='primary'
          aria-label={nls('legend')}
          rightIcon={EditIcon}
          className='mb-2'
        >
          <SettingRow flow='wrap' className='mt-2'>
            <div
              title={nls('includeLegend')}
              aria-label={nls('includeLegend')}
              className='d-flex w-100 align-items-center check-box-con'
              onClick={handleLegendChanged}
            >
              <Checkbox
                title={nls('includeLegend')}
                className='lock-item-ratio'
                checked={checkIsLegendEnabled()}
              />
              <div className='lock-item-ratio-label text-left ml-2'>
                {nls('includeLegend')}
              </div>
            </div>
          </SettingRow>
        </CollapsablePanel>}
        <CollapsablePanel
          label={nls('scaleBarUnit')}
          isOpen={openCollapseType === SettingCollapseType.ScaleBarUnit}
          onRequestOpen={() => { openSettingCollapse(SettingCollapseType.ScaleBarUnit) }}
          onRequestClose={closeSettingCollapse}
          role='group'
          aria-label={nls('scaleBarUnit')}
          rightIcon={EditIcon}
          type='primary'
          className={openCollapseType === SettingCollapseType.ScaleBarUnit && 'active-collapse'}
        >
          <SettingRow flow='wrap' className='mt-2'>
            <Select
              value={template?.layoutOptions?.scalebarUnit || ''}
              onChange={handleScalebarUnitChange}
              size='sm'
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
          </SettingRow>
        </CollapsablePanel>
        {template?.layoutOptions?.customTextElements?.length > 0 && renderCustomTextElementsSetting(customTextElementsOpenList)}
        {checkNeedShowElementOverridesOptionsSetting(elementOverridesOptions) && renderElementOverridesOptionsSetting()}
      </div>

      {config.modeType === ModeType.Classic && <SettingRow className='mt-2' flow='wrap' role='group' aria-label={nls('selectEditableSettings')} label={nls('selectEditableSettings')}>
        <div className='w-100'>
          {template?.hasAuthorText && <div
            title={nls('printTemplateAuthor')}
            aria-label={nls('printTemplateAuthor')}
            className='d-flex w-100 align-items-center check-box-con'
            onClick={() => { handleCheckBoxChange('enableAuthor') }}
          >
            <Checkbox
              title={nls('printTemplateAuthor')}
              className='lock-item-ratio'
              checked={template?.enableAuthor || false}
            />
            <div className='lock-item-ratio-label text-left ml-2'>
              {nls('printTemplateAuthor')}
            </div>
          </div>}
          {template?.hasCopyrightText && <div
            title={nls('copyright')}
            aria-label={nls('copyright')}
            className='d-flex w-100 align-items-center check-box-con'
            onClick={() => { handleCheckBoxChange('enableCopyright') }}
          >
            <Checkbox
              title={nls('copyright')}
              className='lock-item-ratio'
              checked={template?.enableCopyright || false}
            />
            <div className='lock-item-ratio-label text-left ml-2'>
              {nls('copyright')}
            </div>
          </div>}
          {template?.hasLegend && <div
            title={nls('legend')}
            aria-label={nls('legend')}
            className='d-flex w-100 align-items-center check-box-con'
            onClick={() => { handleCheckBoxChange('enableLegend') }}
          >
            <Checkbox
              title={nls('legend')}
              className='lock-item-ratio'
              checked={template?.enableLegend || false}
            />
            <div className='lock-item-ratio-label text-left ml-2'>
              {nls('legend')}
            </div>
          </div>}
          <div
            title={nls('scaleBarUnit')}
            aria-label={nls('scaleBarUnit')}
            className='d-flex w-100 align-items-center check-box-con'
            onClick={() => { handleCheckBoxChange('enableScalebarUnit') }}
          >
            <Checkbox
              title={nls('scaleBarUnit')}
              className='lock-item-ratio'
              checked={template?.enableScalebarUnit || false}
            />
            <div className='lock-item-ratio-label text-left ml-2'>
              {nls('scaleBarUnit')}
            </div>
          </div>
          {template?.layoutOptions?.customTextElements?.length > 0 && renderCustomTextElementsEnableSetting()}
          {northArrowKey && <div
            title={nls('northArrow')}
            aria-label={nls('northArrow')}
            className='d-flex w-100 align-items-center check-box-con'
            onClick={() => { handleCheckBoxChange('enableNorthArrow') }}
          >
            <Checkbox
              title={nls('northArrow')}
              className='lock-item-ratio'
              checked={template?.enableNorthArrow || false}
            />
            <div className='lock-item-ratio-label text-left ml-2'>
              {nls('northArrow')}
            </div>
          </div>}
        </div>
      </SettingRow>}
    </SettingSection>
  )
}

export default LayoutOptionSetting
