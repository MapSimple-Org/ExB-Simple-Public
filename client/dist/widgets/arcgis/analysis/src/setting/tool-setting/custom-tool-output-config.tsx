/** @jsx jsx */
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { React, jsx, Immutable, hooks, useIntl, dateUtils, EsriDateFormats, css, loadArcGISJSAPIModule } from 'jimu-core'
import { type AnalysisToolDataItem, AnalysisToolParamDataType, type AnalysisToolParam } from '@arcgis/analysis-ui-schema'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import { Checkbox, defaultMessages as jimuiDefaultMessage, Label, NumericInput, Option, Select, Switch } from 'jimu-ui'
import type { CustomToolOutput } from '../../config'
import CustomToolConfigCollapsablePanel from './custom-tool-config-collapsable-panel'
import { getNeedHideOutputParams } from '../../utils/util'
import { getMapServiceLayerParameter, getResultMapServerNameByToolUrl } from '../utils'
import { type JimuPointSymbol, type JimuPolygonSymbol, type JimuPolylineSymbol, JimuSymbolType, SymbolList, type JimuSymbol } from 'jimu-ui/advanced/map'
import type { JSX } from 'react'

export const dateFormats = [
  { format: 'shortDate', hasTimeFormat: true },
  { format: 'longMonthDayYear', hasTimeFormat: true },
  { format: 'dayShortMonthYear', hasTimeFormat: true },
  { format: 'longDate', hasTimeFormat: true },
  { format: 'longMonthYear', hasTimeFormat: false },
  { format: 'shortMonthYear', hasTimeFormat: false },
  { format: 'year', hasTimeFormat: false }
] as Array<{ format: EsriDateFormats, hasTimeFormat: boolean }>

export const timeFormats = ['ShortTime', 'LongTime', 'ShortTime24', 'LongTime24']

interface GPTypeConfigProps {
  parameterName: string
  parameterDefaultValue?: AnalysisToolDataItem
  output: Immutable.ImmutableObject<CustomToolOutput>
  translate: ReturnType<typeof hooks.useTranslation>
  onChange: (output: Immutable.ImmutableObject<CustomToolOutput>) => void
}

const GPFeatureRecordSetLayerConfig = (props: GPTypeConfigProps) => {
  const { parameterName, parameterDefaultValue, output, onChange } = props

  const jimuSymbolTypeByGeometryType = new Map([
    ['esriGeometryPoint', JimuSymbolType.Point],
    ['esriGeometryPolyline', JimuSymbolType.Polyline],
    ['esriGeometryPolygon', JimuSymbolType.Polygon]
  ])

  const jimuSymbolType = React.useMemo(() => (
    !!(parameterDefaultValue &&
    (parameterDefaultValue as any).geometryType) &&
    jimuSymbolTypeByGeometryType.get((parameterDefaultValue as any).geometryType)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [parameterDefaultValue])

  const onSymbolChanged = (symbol: JimuPointSymbol | JimuPolylineSymbol | JimuPolygonSymbol) => {
    onChange(output.setIn(['symbol', parameterName], symbol.toJSON()))
  }

  const [symbolsJsonUtils, setSymbolsJsonUtils] = React.useState<__esri.symbolsSupportJsonUtils>()
  React.useEffect(() => {
    loadArcGISJSAPIModule('esri/symbols/support/jsonUtils').then(setSymbolsJsonUtils)
  }, [])

  const jimuSymbol = React.useMemo(() => (
    symbolsJsonUtils && output?.symbol?.[parameterName]
      ? symbolsJsonUtils.fromJSON(output.symbol[parameterName]) as JimuSymbol
      : undefined
  ), [output?.symbol, parameterName, symbolsJsonUtils])

  return jimuSymbolType
    ? <SymbolList
        css={css`position: relative; padding: 0 !important;`}
        symbol={jimuSymbol}
        jimuSymbolType={jimuSymbolType}
        isShow
        onPointSymbolChanged={onSymbolChanged}
        onPolylineSymbolChanged={onSymbolChanged}
        onPolygonSymbolChanged={onSymbolChanged}
        onA11yFocus={() => null}
      />
    : null
}

const GPNumberConfig = (props: GPTypeConfigProps) => {
  const { parameterName, output, translate, onChange } = props
  const handleDecimalPlaceChange = (value: number) => {
    onChange(value !== undefined ? output.setIn(['decimalPlace', parameterName], value) : output.without('decimalPlace'))
  }
  return (
    <React.Fragment>
      <SettingRow className='mt-2 label-dark-400 last-setting-row' label={translate('decimalPlace')} flow='wrap' role='group' aria-label={translate('decimalPlace')}>
        <NumericInput className='w-100' min={0} value={output.decimalPlace[parameterName]} onChange={handleDecimalPlaceChange} />
      </SettingRow>
    </React.Fragment>
  )
}

const GPDateConfig = (props: GPTypeConfigProps) => {
  const { parameterName, output, translate, onChange } = props
  const handleFormatChange = (e: React.ChangeEvent<HTMLSelectElement>, name: 'dateFormat' | 'timeFormat') => {
    const value = e.target.value
    let newOutput = value ? output.setIn([name, parameterName], value) : output.set(name, output[name]?.without(parameterName))
    if (name === 'dateFormat' && !dateFormats.find((format) => format.format === value)?.hasTimeFormat) {
      newOutput = newOutput.set('timeFormat', newOutput.timeFormat?.without(parameterName))
    }
    onChange(newOutput)
  }

  const intl = useIntl()

  const dateFormatOptions = React.useMemo(() => {
    const date = new Date('December 31, 1969 18:00:00')
    return dateFormats.map((format) => ({ ...format, label: dateUtils.formatDateValueByEsriFormat(date, format.format, intl) }))
  }, [intl])

  const timeFormatOptions = React.useMemo(() => (timeFormats.map((format) => ({ label: translate(format), format }))), [translate])

  const displayShowTimeSwitch = React.useMemo(() => {
    if (!output.dateFormat?.[parameterName]) {
      return true
    }
    return dateFormats.find((format) => format.format === output.dateFormat?.[parameterName])?.hasTimeFormat
  }, [output.dateFormat, parameterName])

  const handleShowTimeChange = (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    onChange(checked ? output.setIn(['timeFormat', parameterName], 'ShortTime') : output.set('timeFormat', output.timeFormat?.without(parameterName)))
  }

  return (
    <React.Fragment>
      <SettingRow className={`mt-2 label-dark-400 ${displayShowTimeSwitch ? '' : 'last-setting-row'}`} label={translate('dateFormat')} flow='wrap' role='group' aria-label={translate('dateFormat')}>
        <Select onChange={(e) => { handleFormatChange(e, 'dateFormat') }} value={output.dateFormat?.[parameterName] || 'shortDate'}>
          {dateFormatOptions.map((option) => {
            return <Option value={option.format} key={option.format}>{option.label}</Option>
          })}
        </Select>
      </SettingRow>
      {displayShowTimeSwitch && <SettingRow className={`mt-2 ${output.timeFormat?.[parameterName] ? '' : 'last-setting-row'}`} tag='label' label={translate('showTime')} flow='no-wrap'>
        <Switch checked={!!output.timeFormat?.[parameterName]} onChange={handleShowTimeChange}/>
      </SettingRow>}
      {output.timeFormat?.[parameterName] && <SettingRow className='mt-2 label-dark-400 last-setting-row' label={translate('timeFormat')} flow='wrap' role='group' aria-label={translate('timeFormat')}>
        <Select onChange={(e) => { handleFormatChange(e, 'timeFormat') }} value={output.timeFormat?.[parameterName]}>
          {timeFormatOptions.map((option) => {
            return <Option value={option.format} key={option.format}>{option.label}</Option>
          })}
        </Select>
      </SettingRow>}
    </React.Fragment>
  )
}

const GPTypeConfigByGPType = new Map<AnalysisToolParamDataType, (props: GPTypeConfigProps) => JSX.Element>([
  [AnalysisToolParamDataType.GPFeatureRecordSetLayer, GPFeatureRecordSetLayerConfig],
  [AnalysisToolParamDataType.GPDouble, GPNumberConfig],
  [AnalysisToolParamDataType.GPMultiValueDouble, GPNumberConfig],
  [AnalysisToolParamDataType.GPDate, GPDateConfig]
])

interface Props {
  className?: string
  parameters: Immutable.ImmutableArray<AnalysisToolParam>
  output: Immutable.ImmutableObject<CustomToolOutput>
  toolUrl: string
  onParameterChange: (parameters: AnalysisToolParam[]) => void
  onOutputChange: (output: CustomToolOutput) => void
}

const CustomToolOutputConfig = (props: Props) => {
  const { className, parameters, output, toolUrl, onParameterChange, onOutputChange } = props
  const { ignoreResultMapServer } = output
  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessage)

  const handleParameterChange = (parameter: Immutable.ImmutableObject<AnalysisToolParam>, index: number) => {
    const newParameters = [...parameters]
    newParameters[index] = parameter.asMutable({ deep: true })
    onParameterChange(newParameters)
  }

  const handleOutputChange = (output: Immutable.ImmutableObject<CustomToolOutput>) => {
    onOutputChange(output.asMutable({ deep: true }))
  }

  const shouldShowAllowExportResults = (parameterType: AnalysisToolParamDataType) => {
    return ([
      AnalysisToolParamDataType.GPFeatureRecordSetLayer,
      AnalysisToolParamDataType.GPMultiValueFeatureRecordSetLayer,
      AnalysisToolParamDataType.GPRecordSet,
      AnalysisToolParamDataType.GPMultiValueRecordSet
    ] as AnalysisToolParamDataType[]).includes(parameterType)
  }

  const shouldShowAddResultLayersToMapAuto = (parameterType: AnalysisToolParamDataType) => {
    return ([
      AnalysisToolParamDataType.GPFeatureRecordSetLayer,
      AnalysisToolParamDataType.GPMultiValueFeatureRecordSetLayer,
      'MapServiceLayer'
    ] as AnalysisToolParamDataType[]).includes(parameterType)
  }

  const needHideOutputParams = React.useMemo(() => getNeedHideOutputParams(parameters, ignoreResultMapServer), [parameters, ignoreResultMapServer])

  const [canViewResultAsMapService, setCanViewResultAsMapService] = React.useState(false)
  const updateMapServiceLayerParameter = async () => {
    const resultMapServerName = await getResultMapServerNameByToolUrl(toolUrl)
    setCanViewResultAsMapService(!!resultMapServerName)
    const mapServiceLayerParameterIndex = parameters.findIndex((p) => (p.dataType as string) === 'MapServiceLayer')
    if (resultMapServerName && mapServiceLayerParameterIndex === -1) {
      // for case: old added custom tools
      // no MapServiceLayer parameter, should add it into parameters
      onParameterChange([...parameters, getMapServiceLayerParameter(resultMapServerName)])
    } else if (!resultMapServerName && mapServiceLayerParameterIndex !== -1) {
      // for case: gp server info was updated and uncheck "View output in map image layer"
      // delete MapServiceLayer parameter
      onParameterChange([...parameters].filter((p, i) => i !== mapServiceLayerParameterIndex))
    }
  }

  React.useEffect(() => {
    // need to check if resultMapServerName changed and update parameters accordingly
    updateMapServiceLayerParameter()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={className}>
      {canViewResultAsMapService && <SettingRow className='mt-2 label-dark-400'>
        <Label className='mb-2'>
          <Checkbox className='mr-2' checked={!ignoreResultMapServer} onChange={(e, checked) => { handleOutputChange(checked ? output.without('ignoreResultMapServer') : output.set('ignoreResultMapServer', true)) }} />
          {translate('viewResultAsMapService')}
        </Label>
      </SettingRow>}
      {parameters.map((parameter, index) => {
        const ConfigComponent = GPTypeConfigByGPType.get(parameter.dataType)
        const showAllowExportResults = shouldShowAllowExportResults(parameter.dataType)
        const showAddResultLayersToMapAuto = shouldShowAddResultLayersToMapAuto(parameter.dataType)
        const allowExport = output.allowExport[parameter.name] === undefined ? true : output.allowExport[parameter.name]
        const addResultLayersToMapAuto = !!output.addResultLayersToMapAuto?.[parameter.name]
        const parameterNeedHide = needHideOutputParams.includes(parameter.name)

        return parameter.direction === 'esriGPParameterDirectionOutput' && !parameterNeedHide
          ? <CustomToolConfigCollapsablePanel key={parameter.name} parameter={parameter} onParameterChange={(newParameter) => { handleParameterChange(newParameter, index) }}>
              <SettingRow className={`mt-2 label-dark-400 ${ConfigComponent || showAllowExportResults ? '' : 'last-setting-row'}`}>
                <Label>
                  <Checkbox className='mr-2' checked={output.ignored[parameter.name]} onChange={(e, checked) => { handleOutputChange(output.setIn(['ignored', parameter.name], checked)) }} />
                  {translate('ignoreThisOutput')}
                </Label>
              </SettingRow>
              {ConfigComponent && <ConfigComponent parameterName={parameter.name} parameterDefaultValue={parameter.asMutable({ deep: true }).defaultValue} output={output} translate={translate} onChange={handleOutputChange}></ConfigComponent>}
              {showAllowExportResults && <SettingRow className='mt-2 last-setting-row' tag='label' label={translate('allowToExportResults')} flow='no-wrap'>
                <Switch checked={allowExport} onChange={(e, checked) => { handleOutputChange(output.setIn(['allowExport', parameter.name], checked)) }} />
              </SettingRow>}
              {showAddResultLayersToMapAuto && <SettingRow className='mt-2 last-setting-row' tag='label' label={translate('addResultLayersToMapAuto')} flow='no-wrap'>
                <Switch checked={addResultLayersToMapAuto} onChange={(e, checked) => { handleOutputChange(output.setIn(['addResultLayersToMapAuto', parameter.name], checked)) }} />
              </SettingRow>}
            </CustomToolConfigCollapsablePanel>
          : null
      })}
    </div>
  )
}

export default CustomToolOutputConfig
