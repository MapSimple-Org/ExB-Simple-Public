/** @jsx jsx */
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { React, jsx, Immutable, hooks, ImmutableObject, css } from 'jimu-core'
import { AnalysisToolParamDataType, type GPLinearUnit, type AnalysisToolDataItem, type AnalysisServiceInfo } from '@arcgis/analysis-ui-schema'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import { Checkbox, defaultMessages as jimuiDefaultMessage, Label, Radio } from 'jimu-ui'
import LayerInputTypeConfig, { type LayerInputType } from './layer-input-type-config'
import type { AnalysisValueTableCustomEvent, AnalysisLinearUnitInputCustomEvent, AnalysisNumberInputCustomEvent, AnalysisStringInputCustomEvent } from '@arcgis/analysis-components'
import type { CustomToolParam } from '../../config'
import { DatePicker } from 'jimu-ui/basic/date-picker'
import CustomToolConfigCollapsablePanel from './custom-tool-config-collapsable-panel'
import { useWebToolsUnits } from '../../utils/strings'
import { serviceSupportUpload } from '../../utils/util'
import type { JSX } from 'react'

const { useState, useEffect } = React

interface GPTypeConfigProps {
  serviceInfo?: AnalysisServiceInfo
  parameter: Immutable.ImmutableObject<CustomToolParam>
  translate: ReturnType<typeof hooks.useTranslation>
  onChange: (parameter: Immutable.ImmutableObject<CustomToolParam>) => void
}

const GPFeatureRecordSetLayerInputConfig = (props: GPTypeConfigProps) => {
  const { parameter, translate, onChange } = props

  const handleLayerInputTypeConfigChange = (key: LayerInputType, checked: boolean) => {
    if (key === 'allowBrowserLayers') {
      onChange(parameter.set('hideBrowseButton', !checked))
    }
    if (key === 'selectFromMapLayer') {
      onChange(parameter.set('selectFromMapLayer', checked))
    }
    if (key === 'allowDrawingOnTheMap') {
      onChange(parameter.set('enableSketch', checked))
    }
  }

  const { hideBrowseButton, enableSketch, dataType, useFeatureCollection } = parameter as ImmutableObject<CustomToolParam>

  const showUseFeatureCollection = dataType === AnalysisToolParamDataType.GPFeatureRecordSetLayer

  return (
    <React.Fragment>
      <SettingRow className='mt-2 label-dark-400 last-setting-row' label={translate('inputBy')} flow='wrap' role='group' aria-label={translate('inputBy')}>
        <LayerInputTypeConfig
          show={{ allowLocalFileUpload: false, allowServiceUrl: false, selectFromOtherWidget: false, selectFromMapLayer: false }}
          checked={{
            allowBrowserLayers: !hideBrowseButton,
            allowDrawingOnTheMap: enableSketch || enableSketch === undefined
          }}
          onChange={handleLayerInputTypeConfigChange} />
        {showUseFeatureCollection && <Label className='label-for-checkbox'>
          <Checkbox checked={useFeatureCollection} onChange={(e, checked) => { onChange(checked ? parameter.set('useFeatureCollection', checked) : parameter.without('useFeatureCollection')) }}/>
          {translate('useFeatureCollection')}
        </Label>}
      </SettingRow>
    </React.Fragment>
  )
}

const GPBooleanConfig = (props: GPTypeConfigProps) => {
  const { parameter, translate, onChange } = props

  return (
    <React.Fragment>
      <SettingRow className='mt-2 label-dark-400 last-setting-row' label={translate('defaultValue')} flow='wrap' role='group' aria-label={translate('defaultValue')}>
        <Label className='d-flex align-items-center w-100'>
          <Radio className='mr-2' onChange={() => { onChange(parameter.set('defaultValue', true)) }} checked={parameter.defaultValue === true} />
          {translate('trueKey')}
        </Label>
        <Label className='d-flex align-items-center w-100'>
          <Radio className='mr-2' onChange={() => { onChange(parameter.set('defaultValue', false)) }} checked={parameter.defaultValue === false} />
          {translate('falseKey')}
        </Label>
      </SettingRow>
    </React.Fragment>
  )
}

const GPStringConfig = (props: GPTypeConfigProps) => {
  const { parameter, translate, onChange } = props


  const [stringInputRef, setStringInputRef] = useState<HTMLAnalysisStringInputElement>()
  const [inputEvent, setInputEvent] = useState<AnalysisStringInputCustomEvent<any>>()

  useEffect(() => {
    if (inputEvent) {
      onChange(parameter.set('defaultValue', inputEvent.target.value))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputEvent])

  const updateStringInputProps = () => {
    if (stringInputRef) {
      const mutableParameter = parameter.asMutable({ deep: true })
      stringInputRef.value = mutableParameter.defaultValue as string | string[]
      stringInputRef.selectionMode = mutableParameter.dataType === AnalysisToolParamDataType.GPMultiValueString ? 'multi' : 'single'
      stringInputRef.choiceList = mutableParameter.choiceList as unknown as string[]
    }
  }

  useEffect(() => {
    updateStringInputProps()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameter])

  useEffect(() => {
    if (stringInputRef) {
      stringInputRef.label = ''
      stringInputRef.addEventListener('analysisStringInputChange', (e: AnalysisStringInputCustomEvent<any>) => {
        setInputEvent(e)
      })
      updateStringInputProps()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stringInputRef])

  return (
    <React.Fragment>
      <SettingRow className='mt-2 label-dark-400 last-setting-row' label={translate('defaultValue')} flow='wrap' role='group' aria-label={translate('defaultValue')}>
        <analysis-string-input ref={setStringInputRef} {...parameter.asMutable({ deep: true })}></analysis-string-input>
      </SettingRow>
    </React.Fragment>
  )
}

const GPNumberConfig = (props: GPTypeConfigProps) => {
  const { parameter, translate, onChange } = props

  const [numberInputRef, setNumberInputRef] = useState<HTMLAnalysisNumberInputElement>()
  const [inputEvent, setInputEvent] = useState<AnalysisNumberInputCustomEvent<any>>()

  useEffect(() => {
    if (inputEvent) {
      onChange(parameter.set('defaultValue', inputEvent.target.value))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputEvent])

  const updateNumberInputProps = () => {
    if (numberInputRef) {
      const mutableParameter = parameter.asMutable({ deep: true })
      numberInputRef.numberType =
        mutableParameter.dataType === AnalysisToolParamDataType.GPLong ||
        mutableParameter.dataType === AnalysisToolParamDataType.GPMultiValueLong
          ? 'integer'
          : 'float'
      numberInputRef.choiceList = mutableParameter.choiceList?.map(parseFloat)?.filter(isFinite)
      numberInputRef.selectionMode =
        mutableParameter.dataType === AnalysisToolParamDataType.GPMultiValueDouble ||
        mutableParameter.dataType === AnalysisToolParamDataType.GPMultiValueLong
          ? 'multi'
          : 'single'
      numberInputRef.value = mutableParameter.defaultValue as number | number[]
    }
  }

  useEffect(() => {
    updateNumberInputProps()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameter])

  useEffect(() => {
    if (numberInputRef) {
      numberInputRef.label = ''
      numberInputRef.addEventListener('analysisNumberInputChange', (e: AnalysisNumberInputCustomEvent<any>) => {
        setInputEvent(e)
      })
      updateNumberInputProps()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numberInputRef])

  return (
    <React.Fragment>
      <SettingRow className='mt-2 label-dark-400 last-setting-row' label={translate('defaultValue')} flow='wrap' role='group' aria-label={translate('defaultValue')}>
        <analysis-number-input ref={setNumberInputRef} {...(parameter.without('choiceList').asMutable({ deep: true }) as Omit<CustomToolParam, 'choiceList'>)}></analysis-number-input>
      </SettingRow>
    </React.Fragment>
  )
}

const GPDateConfig = (props: GPTypeConfigProps) => {
  const { parameter, translate, onChange } = props
  return (
    <React.Fragment>
      <SettingRow className='mt-2 label-dark-400 last-setting-row' label={translate('defaultValue')} flow='wrap' role='group' aria-label={translate('defaultValue')}>
        <DatePicker css={css`flex: 1;`} format="shortDateLongTime" isLongTime
          showTimeInput strategy="absolute" runtime={false} showDoneButton
          onChange={(value) => { onChange(parameter.set('defaultValue', value)) }}
          selectedDate={parameter.defaultValue ? new Date(parameter.defaultValue as number) : undefined}
        />
      </SettingRow>
    </React.Fragment>
  )
}

const GPLinearUnitConfig = (props: GPTypeConfigProps) => {
  const { parameter, translate, onChange } = props


  const [linearUnitInputRef, setLinearUnitInputRef] = useState<HTMLAnalysisLinearUnitInputElement>()
  const [inputEvent, setInputEvent] = useState<AnalysisLinearUnitInputCustomEvent<any>>()

  useEffect(() => {
    if (inputEvent) {
      onChange(parameter.set('defaultValue', inputEvent.target.value))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputEvent])

  const webToolsUnits = useWebToolsUnits()

  const updateLinearUnitInputProps = () => {
    if (!linearUnitInputRef) {
      return
    }
    const mutableParameter = parameter.asMutable({ deep: true })
    linearUnitInputRef.value = mutableParameter.defaultValue as Partial<GPLinearUnit>

    linearUnitInputRef.unitChoiceList = mutableParameter.choiceList || Object.keys(webToolsUnits)
    linearUnitInputRef.choiceListLabels = webToolsUnits
  }

  useEffect(() => {
    updateLinearUnitInputProps()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameter, webToolsUnits])

  useEffect(() => {
    if (linearUnitInputRef) {
      linearUnitInputRef.label = ''
      linearUnitInputRef.addEventListener('analysisLinearUnitInputChange', (e: AnalysisLinearUnitInputCustomEvent<any>) => {
        setInputEvent(e)
      })
      updateLinearUnitInputProps()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linearUnitInputRef])
  return (
    <React.Fragment>

      <SettingRow className='mt-2 label-dark-400 last-setting-row' label={translate('defaultValue')} flow='wrap' role='group' aria-label={translate('defaultValue')}>
        <analysis-linear-unit-input ref={setLinearUnitInputRef} {...parameter} />
      </SettingRow>
    </React.Fragment>
  )
}

const GPDataFileInputConfig = (props: GPTypeConfigProps) => {
  const { serviceInfo, parameter, translate, onChange } = props

  const handleInputTypeConfigChange = (key: LayerInputType, checked: boolean) => {
    if (key === 'allowLocalFileUpload') {
      onChange(parameter.set('hideUpload', !checked))
    }
  }

  const supportUpload = serviceSupportUpload(serviceInfo)
  const { hideUpload } = parameter as ImmutableObject<CustomToolParam>

  return (
    <React.Fragment>
      <SettingRow className='mt-2 label-dark-400 last-setting-row' label={translate('inputBy')} flow='wrap' role='group' aria-label={translate('inputBy')}>
        <LayerInputTypeConfig
          show={{ allowBrowserLayers: false, allowDrawingOnTheMap: false, allowServiceUrl: false, selectFromOtherWidget: false, selectFromMapLayer: false }}
          checked={{
            allowLocalFileUpload: !hideUpload && supportUpload
          }}
          disabled={{
            allowLocalFileUpload: !supportUpload
          }}
          onChange={handleInputTypeConfigChange} />
      </SettingRow>
    </React.Fragment>
  )
}

const GenericMultiValue = (props: GPTypeConfigProps) => {
  const { parameter, translate, onChange } = props


  const [valueTableRef, setValueTableRef] = useState<HTMLAnalysisValueTableElement>()
  const [valueChangeEvent, setValueChangeEvent] = useState<AnalysisValueTableCustomEvent<any>>()

  useEffect(() => {
    if (valueChangeEvent) {
      onChange(parameter.set('defaultValue', valueChangeEvent.target.value))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueChangeEvent])

  const webToolsUnits = useWebToolsUnits()

  const updateValueTableProps = () => {
    if (!valueTableRef) {
      return
    }
    const mutableParameter = parameter.asMutable({ deep: true })
    valueTableRef.value = mutableParameter.defaultValue as AnalysisToolDataItem[] | undefined
    valueTableRef.parameterInfos = mutableParameter.parameterInfos

    if (mutableParameter.dataType === AnalysisToolParamDataType.GPMultiValueLinearUnit) {
      valueTableRef.UIparameterInfos = [
        {
          choiceList: mutableParameter.choiceList || Object.keys(webToolsUnits),
          choiceListLabels: webToolsUnits as { [key: string]: string },
          name: ''
        }
      ]
    }
  }

  useEffect(() => {
    updateValueTableProps()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parameter, webToolsUnits])

  useEffect(() => {
    if (valueTableRef) {
      valueTableRef.label = ''
      valueTableRef.valueWithoutKey = true
      valueTableRef.addEventListener('analysisValueTableChange', (e: AnalysisValueTableCustomEvent<any>) => {
        setValueChangeEvent(e)
      })
      updateValueTableProps()

      // since value table content is rendered asynchronously, need to observe the content rendering and then hide the label
      const observerCallback: MutationCallback = (mutationList, observer) => {
        for (const mutation of mutationList) {
          if (mutation.type === 'childList') {
            const labelEle = valueTableRef.shadowRoot.querySelector('analysis-label')
            if (labelEle) {
              labelEle.style.display = 'none'
              observer.disconnect()
              return
            }
          }
        }
      }
      const observer = new MutationObserver(observerCallback)
      observer.observe(valueTableRef.shadowRoot, { childList: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [valueTableRef])
  return (
    <SettingRow className='mt-2 label-dark-400 last-setting-row' label={translate('defaultValue')} flow='wrap' role='group' aria-label={translate('defaultValue')}>
      <analysis-value-table ref={setValueTableRef} {...parameter.asMutable({ deep: true })} />
    </SettingRow>
  )
}

const GPTypeConfigByGPType = new Map<AnalysisToolParamDataType, (props: GPTypeConfigProps) => JSX.Element>([
  [AnalysisToolParamDataType.GPFeatureRecordSetLayer, GPFeatureRecordSetLayerInputConfig],
  [AnalysisToolParamDataType.GPMultiValueFeatureRecordSetLayer, GPFeatureRecordSetLayerInputConfig],
  [AnalysisToolParamDataType.GPRecordSet, GPFeatureRecordSetLayerInputConfig],
  [AnalysisToolParamDataType.GPBoolean, GPBooleanConfig],
  [AnalysisToolParamDataType.GPString, GPStringConfig],
  [AnalysisToolParamDataType.GPMultiValueString, GPStringConfig],
  [AnalysisToolParamDataType.GPLong, GPNumberConfig],
  [AnalysisToolParamDataType.GPMultiValueLong, GPNumberConfig],
  [AnalysisToolParamDataType.GPDouble, GPNumberConfig],
  [AnalysisToolParamDataType.GPMultiValueDouble, GPNumberConfig],
  [AnalysisToolParamDataType.GPDate, GPDateConfig],
  [AnalysisToolParamDataType.GPLinearUnit, GPLinearUnitConfig],
  [AnalysisToolParamDataType.GPDataFile, GPDataFileInputConfig],
  [AnalysisToolParamDataType.GPRasterDataLayer, GPDataFileInputConfig],
  [AnalysisToolParamDataType.GPMultiValueDate, GenericMultiValue],
  [AnalysisToolParamDataType.GPMultiValueLinearUnit, GenericMultiValue]
])

interface Props {
  className?: string
  serviceInfo?: AnalysisServiceInfo
  parameters: Immutable.ImmutableArray<CustomToolParam>
  onChange: (parameters: CustomToolParam[]) => void
}

const style = css`
  --calcite-font-size--2: 0.8125rem;

  --analysis-ui-border-input: var(--ref-palette-neutral-300);

  --calcite-ui-foreground-1: var(--ref-palette-neutral-300);
  --calcite-ui-brand: var(--sys-color-primary-dark);
  --calcite-ui-text-3: var(--ref-palette-neutral-1100);
  --calcite-ui-focus-color: var(--sys-color-primary-dark);

  --calcite-color-foreground-1: var(--ref-palette-neutral-300);
  --calcite-color-brand: var(--sys-color-primary-dark);
  --calcite-color-text-3: var(--ref-palette-neutral-1100);
  --calcite-color-focus-color: var(--sys-color-primary-dark);
`

const CustomToolInputConfig = (props: Props) => {
  const { className, parameters, serviceInfo, onChange } = props
  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessage)

  const handleParameterChange = (parameter: Immutable.ImmutableObject<CustomToolParam>, index: number) => {
    const newParameters = [...parameters]
    newParameters[index] = parameter.asMutable({ deep: true })
    onChange(newParameters)
  }
  return (
    <div className={className} css={style}>
      {parameters.map((parameter, index) => {
        const ConfigComponent = GPTypeConfigByGPType.get(parameter.dataType)
        return parameter.direction === 'esriGPParameterDirectionInput'
          ? <CustomToolConfigCollapsablePanel
              key={parameter.name} parameter={parameter}
              onParameterChange={(newParameter) => { handleParameterChange(newParameter, index) }}>
              {ConfigComponent && <ConfigComponent parameter={parameter} serviceInfo={serviceInfo} translate={translate} onChange={(newParameter) => { handleParameterChange(newParameter, index) }}></ConfigComponent>}
            </CustomToolConfigCollapsablePanel>
          : null
      })}
    </div>
  )
}

export default CustomToolInputConfig
