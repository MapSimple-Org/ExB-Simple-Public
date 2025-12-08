/** @jsx jsx */
import {
  React,
  jsx,
  type DataRecordSet,
  MutableStoreManager, DataLevel,
  hooks,
  type IMState,
  urlUtils,
  type QueriableDataSource,
  type FeatureLayerDataSource,
  type SqlQueryParams,
  AllDataSourceTypes,
  ReactRedux,
  type ImmutableObject,
  type DataSource,
  defaultMessages as jimuCoreDefaultMessages,
  css,
  type IntlShape,
  getAppStore,
  focusElementInKeyboardMode,
  type FieldSchema,
  type DataRecord
} from 'jimu-core'
import { Button, Select, FloatingPanel } from 'jimu-ui'
import { type ToolConfig, type IMConfig, ToolType, type CustomToolConfig } from '../config'
import type { AnalysisToolUI, AnalysisToolInfo, AnalysisToolParam, AnalysisToolUIParam, LocaleItem, FeatureCollection } from '@arcgis/analysis-ui-schema'
import { featureUtils } from 'jimu-arcgis'
import { getDisplayedCustomToolName, getDisplayedStandardToolName, localizeStandardToolParamLabel, useCommonStringsByLocale, useToolInfoStringsByLocale } from '../utils/shared-utils'
import defaultMessages from '../runtime/translations/default'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'
import type { IField } from '@esri/arcgis-rest-feature-service'
import type { IDomain } from '@esri/arcgis-rest-request'

export const isAnalysisSupportedImagery = (dataSource: DataSource) => {
  return dataSource.type === AllDataSourceTypes.ImageryLayer || dataSource.type === AllDataSourceTypes.ImageryTileLayer
}

export const isFeatureLayer = (dataSource: DataSource) => {
  return dataSource.type === AllDataSourceTypes.FeatureLayer || (dataSource as FeatureLayerDataSource).layer?.type === 'feature'
}

const MIN_SIZE = { width: 320, height: 280 }
const DEFAULT_SIZE = { width: 320, height: 280 }

interface Props {
  activeRef: HTMLElement
  widgetId: string
  dataSet: DataRecordSet
  dataLevel: DataLevel
  version: string
  intl: IntlShape
}

type AnalysisParam = AnalysisToolParam & AnalysisToolUIParam

const useAnalysisSharedUtils = () => {
  const [analysisSharedUtils, setAnalysisSharedUtils] = React.useState<any>()
  React.useEffect(() => {
    import('@arcgis/analysis-shared-utils').then((res) => {
      setAnalysisSharedUtils(res)
    })
  }, [])
  return analysisSharedUtils
}

const useGetDisplayedName = (analysisSharedUtils) => {
  const utilitiesState = ReactRedux.useSelector((state: IMState) => {
    if (window.jimuConfig.isBuilder) {
      return state.appStateInBuilder.appConfig.utilities
    }
    return state.appConfig.utilities
  })
  const locale = analysisSharedUtils?.getLocaleInfo()?.locale
  const commonStrings = useCommonStringsByLocale(locale)
  const toolInfoStrings = useToolInfoStringsByLocale(locale)

  return {
    getDisplayedToolName: (toolInfo: ImmutableObject<ToolConfig> | ToolConfig) => {
      if (!toolInfo || !analysisSharedUtils) {
        return ''
      }

      if (toolInfo.type === ToolType.Standard) {
        return getDisplayedStandardToolName(toolInfo.toolName, toolInfo.analysisEngine, toolInfoStrings, analysisSharedUtils.formatAnalysisEngineSuffix, analysisSharedUtils.toCamelToolName)
      }

      return getDisplayedCustomToolName(toolInfo, utilitiesState)
    },
    getDisplayedParameterName: (p: AnalysisParam) => {
      return localizeStandardToolParamLabel(p.label, commonStrings) || p.displayName
    }
  }
}

interface SelectToolAndParameterProps {
  translate: (id: string) => string
  analysisSharedUtils: any
  toolList: ToolConfig[]
  selectedTool?: ToolConfig
  onSelectedToolChange: (e) => void
  validParameters: AnalysisParam[]
  selectedParameter?: AnalysisParam
  onSelectedParameterChange: (e) => void
}
const SelectToolAndParameter = (props: SelectToolAndParameterProps) => {
  const { translate, analysisSharedUtils, toolList, selectedTool, onSelectedToolChange, validParameters, selectedParameter, onSelectedParameterChange } = props
  const { getDisplayedToolName, getDisplayedParameterName } = useGetDisplayedName(analysisSharedUtils)
  return <div>
    <div>
      <div className='mb-1 form-item-label'>{translate('selectTool')}</div>
      <div>
        <Select value={selectedTool?.id} onChange={onSelectedToolChange}>
          {toolList.map(t => <option key={t.id} value={t.id}>{getDisplayedToolName(t)}</option>)}
        </Select>
      </div>
    </div>
    {selectedTool && <div className='mt-4'>
      <div className='mb-1 form-item-label'>{translate('selectParameter')}</div>
      <div>
        <Select value={selectedParameter?.name} onChange={onSelectedParameterChange} disabled={!validParameters.length}>
          {validParameters.map(p => <option key={p.name} value={p.name}>{getDisplayedParameterName(p)}</option>)}
        </Select>
        {!validParameters.length && <div className='mt-2 warning-msg'><WarningOutlined className='mr-2' color='var(--sys-color-warning-dark)' />{translate('noApplicableParameter')}</div>}
      </div>
    </div>}
  </div>
}

const style = css`
  flex-direction: column;
  justify-content: space-between;
  .form-item-label {
    line-height: 18px;
    font-weight: 500;
    color: var(--sys-color-surface-paper-text);
  }
  .warning-msg {
    display: flex;
    align-items: center;
    line-height: 24px;
  }
  .footer{
    text-align: right;
    .btn {
      min-width: 75px;
      font-weight: 500;
    }
  }
`

export const SelectParameterPopper = (props: Props) => {
  const { activeRef, widgetId, dataSet, dataLevel, version, intl } = props
  const { dataSource } = dataSet
  const [size, setSize] = React.useState(DEFAULT_SIZE)
  const [isOpen, setIsOpen] = React.useState(true)

  const analysisSharedUtils = useAnalysisSharedUtils()

  const locale = React.useMemo(() => analysisSharedUtils?.getLocaleInfo()?.locale || '', [analysisSharedUtils])

  const translate = (id: string) => {
    return intl.formatMessage({ id: id, defaultMessage: { ...defaultMessages, ...jimuCoreDefaultMessages }[id] })
  }

  React.useEffect(() => {
    setIsOpen(true)
    setSelectedTool(null)
    setSelectedParameter(null)
  }, [version, dataSource.id, widgetId])

  const handleToggle = () => {
    setIsOpen(false)
    setTimeout(() => {
      focusElementInKeyboardMode(activeRef)
    }, 10)
  }

  const handleResize = (size) => {
    setSize(size)
  }

  const [toolList, setToolList] = React.useState<ToolConfig[]>([])

  React.useEffect(() => {
    if (!isOpen) {
      return
    }
    const appState = getAppStore().getState()?.appStateInBuilder ?? getAppStore().getState()
    const widgetConfig = appState?.appConfig?.widgets?.[widgetId]?.config as IMConfig
    if (!Array.isArray(widgetConfig?.toolList)) {
      return
    }
    // raster function cannot support this data action
    setToolList(widgetConfig.toolList.asMutable({ deep: true }).filter((t) => t.type !== ToolType.RasterFunction))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const [selectedTool, setSelectedTool] = React.useState<ToolConfig>()

  const [parameters, setParameters] = React.useState<AnalysisParam[]>([])
  const [selectedParameter, setSelectedParameter] = React.useState<AnalysisParam>()

  const getParameterFilterTypes = (parameter: AnalysisToolParam) => {
    const { filter, defaultValue } = parameter
    if (filter?.type === 'featureClass' && filter?.list?.length) {
      return filter.list
    }
    if (Array.isArray(defaultValue)) {
      return defaultValue.filter((v: { geometryType: string }) => !!v.geometryType).map((v: { geometryType: string }) => v.geometryType)
    }
    const gType = (defaultValue as { geometryType: string })?.geometryType
    return gType ? [gType] : []
  }

  const validParameters = React.useMemo(() => {
    const geometryType = dataSource.getGeometryType()
    const isFeatureLayerDs = isFeatureLayer(dataSource)
    const isSupportedImagery = isAnalysisSupportedImagery(dataSource)

    return parameters.filter((p) => {
      if (p.direction === 'esriGPParameterDirectionOutput') {
        return false
      }
      if (isFeatureLayerDs && (p.dataType === 'GPRecordSet' || p.dataType === 'GPMultiValue:GPRecordSet')) {
        return true
      }
      const hasFeatures = (dataLevel === DataLevel.DataSource && isFeatureLayerDs) || dataLevel === DataLevel.Records
      if (geometryType && hasFeatures && (p.dataType === 'GPFeatureRecordSetLayer' || p.dataType === 'GPMultiValue:GPFeatureRecordSetLayer')) {
        const filterTypes = getParameterFilterTypes(p)
        return filterTypes.length ? filterTypes.includes(geometryType) : true
      }
      if (dataLevel === DataLevel.DataSource && isSupportedImagery && (p.dataType === 'GPRasterDataLayer' || p.dataType === 'GPMultiValue:GPRasterDataLayer')) {
        return true
      }
      return false
    })
  }, [dataLevel, dataSource, parameters])

  hooks.useUpdateEffect(() => {
    if (!selectedTool || !locale) {
      return
    }
    if (selectedTool.type === ToolType.Standard) {
      const widgetUrl = `${window.location.protocol}//${window.location.host}${urlUtils.getFixedRootPath()}widgets/arcgis/analysis/`
      const lowercaseToolName = `${selectedTool.toolName.toLowerCase()}${analysisSharedUtils?.formatAnalysisEngineSuffix(selectedTool.analysisEngine)}`
      const toolJsonPath = `${widgetUrl}dist/assets/arcgis-analysis-assets/assets/tool-json/${lowercaseToolName}.tool.json`
      const toolUIJsonPath = `${widgetUrl}dist/assets/arcgis-analysis-assets/assets/tool-ui-json/${lowercaseToolName}.tool.ui.json`
      const t9nPath = `${widgetUrl}dist/assets/arcgis-analysis-assets/assets/t9n/${lowercaseToolName}/${lowercaseToolName}.t9n.${locale}.json`
      Promise.all([
        fetch(toolJsonPath).then((value) => value.json()),
        fetch(toolUIJsonPath).then((value) => value.json()),
        fetch(t9nPath).then((value) => value.json())
      ]).then(([toolJSON, toolUIJson, toolT9n]: [AnalysisToolInfo, AnalysisToolUI, LocaleItem]) => {
        const parameters = toolJSON.parameters
        const uiParameters = toolUIJson.UIparameters.map((p) => p.UIparameters || []).flat()
        const combinedParams = parameters
          .filter((param) => param.direction !== 'esriGPParameterDirectionOutput')
          ?.map((param) => {
            const matchingParam = uiParameters.find((uiParam) => uiParam.name === param.name)
            const cParam = { ...matchingParam, ...param }
            const localizedLabel = localizeStandardToolParamLabel(cParam.label, toolT9n)
            if (localizedLabel) {
              cParam.label = localizedLabel
            }
            return cParam
          })
        setParameters(combinedParams)
      })
    } else if (selectedTool.type === ToolType.Custom) {
      setParameters((selectedTool.config as CustomToolConfig).toolInfo.parameters as any)
    }
    setSelectedParameter(null)
  }, [selectedTool, locale])

  const getJobParamValue = (parameter: AnalysisParam, value: { url: string } | FeatureCollection) => {
    const isMulti = parameter.dataType.startsWith('GPMultiValue')
    let retValue = { ...value } as any
    if (parameter.dataType === 'GPRasterDataLayer' || parameter.dataType === 'GPMultiValue:GPRasterDataLayer') {
      retValue.inputType = 'layer'
    }
    if (isMulti) {
      retValue = [retValue]
    }
    return retValue
  }

  const getFieldDomain = (field: FieldSchema | IField, dataSource: DataSource, records: DataRecord[]) => {
    if ((field as IField).domain) {
      return (field as IField).domain
    }
    const codedValues = (dataSource as FeatureLayerDataSource)?.getFieldCodedValueList(field?.name)
    if (!codedValues?.length) {
      return
    }
    // only get the coded value for used field value since the codedValues array may be very large
    const fieldValuesUsed = records.map((r) => r.getFieldValue((field as FieldSchema).jimuName || field.name) as string | number)
    return {
      codedValues: codedValues.filter((cv) => fieldValuesUsed.includes(cv.value)).map((cv) => ({ code: cv.value, name: cv.label })),
      type: 'codedValue'
    } as IDomain
  }

  const getFieldForLayerDefinition = (field: FieldSchema | IField, dataSource: DataSource, records: DataRecord[]) => {
    return {
      name: field.name,
      type: (field as FieldSchema).esriType,
      alias: field.alias,
      format: (field as FieldSchema).format,
      // domain for coded value
      domain: getFieldDomain(field, dataSource, records)
    } as IField
  }

  const handleConfirm = async () => {
    const { records, fields, name } = dataSet
    // const dataSource = dataSet?.dataSource as DataSource & JSAPILayerMixin

    const hasUrl = !!(dataSource as QueriableDataSource).url
    const isDsLevel = dataLevel === DataLevel.DataSource
    const isOutputFromWidget = dataSource.getDataSourceJson()?.isOutputFromWidget

    const jobParams = MutableStoreManager.getInstance().readStateValue(widgetId, 'input') || {}

    let newInputFromOtherWidgets

    const ds = dataSource as FeatureLayerDataSource

    if (isDsLevel && hasUrl && !isOutputFromWidget) {
      const { url } = ds
      newInputFromOtherWidgets = { url }

      const filter = ds.getCurrentQueryParams?.()?.where
      if (filter) {
        newInputFromOtherWidgets.filter = filter
      }
    } else if (isDsLevel) {
      try {
        const featureLayer = await ds.createJSAPILayerByDataSource() as __esri.FeatureLayer
        newInputFromOtherWidgets = await analysisSharedUtils.getGPFeatureRecordSetLayerValue(featureLayer)
        // title of output dataSource with url maybe different from original dataSource, change the title here
        if (hasUrl && isOutputFromWidget) {
          newInputFromOtherWidgets.title = name
        }
      } catch (error) {
        console.error('create feature set error', error)
      }
    } else {
      try {
        const schema = dataSource.getSchema()
        const fieldNames = fields?.length ? fields : Object.keys(schema?.fields) || []
        const geometryType = dataSource.getGeometryType()
        const dsLayerDefinition = (dataSource as FeatureLayerDataSource).getLayerDefinition?.()
        const layerDefinition: any = {
          name: `${schema.label || dataSource.getLabel()}${dataLevel === DataLevel.Records ? ' - Selection' : ''}`,
          type: geometryType ? 'Feature Layer' : 'Table',
          geometryType,
          fields: fieldNames.map(fieldName => {
            const field = { ...(schema.fields[fieldName]?.asMutable({ deep: true}) || {} as FieldSchema), ...(dsLayerDefinition?.fields?.find?.(i => i.name === fieldName) || {} as IField) }
            return getFieldForLayerDefinition(field, dataSource, records)
          }),
          objectIdField: schema.idField,
        }

        const featureSet = await featureUtils.convertDataRecordSetToFeatureSet({ dataSource, records, fields: layerDefinition.fields.map((f) => f.name), name })

        layerDefinition.spatialReference = featureSet.spatialReference?.toJSON()

        const queryParams = (dataSource as QueriableDataSource).getCurrentQueryParams?.() as SqlQueryParams
        if (queryParams?.where) {
          layerDefinition.definitionExpression = queryParams.where
          layerDefinition.defaultVisibility = true
        }
        newInputFromOtherWidgets = {
          layerDefinition: layerDefinition,
          featureSet: featureSet.toJSON()
        }
      } catch (error) {
        console.error('create feature set error', error)
      }
    }
    MutableStoreManager.getInstance().updateStateValue(widgetId, 'toolId', selectedTool.id)
    MutableStoreManager.getInstance().updateStateValue(widgetId, 'input', {
      ...jobParams,
      [selectedParameter.name]: getJobParamValue(selectedParameter, newInputFromOtherWidgets)
    })
    handleToggle()
  }

  const onSelectedToolChange = (e) => {
    const tool = toolList.find((t) => t.id === e.target.value)
    setSelectedTool(tool)
  }
  const onSelectedParameterChange = (e) => {
    const parameter = validParameters.find((p) => p.name === e.target.value)
    setSelectedParameter(parameter)
  }

  return <FloatingPanel
    open={isOpen}
    headerTitle={translate('_action_setAsAnalysisInput_label')}
    onHeaderClose={handleToggle}
    minSize={MIN_SIZE}
    onResize={handleResize}
    dragBounds="body"
    defaultSize={size}
    reference={activeRef}
    toggle={(evt, type) => { type !== 'clickOutside' && handleToggle() }}
  >
    <div className="h-100 p-4 d-flex" css={style}>
      {analysisSharedUtils && <SelectToolAndParameter
        translate={translate}
        analysisSharedUtils={analysisSharedUtils}
        toolList={toolList}
        selectedTool={selectedTool}
        onSelectedToolChange={onSelectedToolChange}
        validParameters={validParameters}
        selectedParameter={selectedParameter}
        onSelectedParameterChange={onSelectedParameterChange}
      />}
      <div className='footer'>
        <Button type='primary' disabled={!selectedTool || !selectedParameter} onClick={handleConfirm}>{translate('ok')}</Button>
        <Button className='ml-2' onClick={handleToggle}>{translate('cancel')}</Button>
      </div>
    </div>
  </FloatingPanel>
}
