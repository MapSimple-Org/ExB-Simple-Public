/** @jsx jsx */
import {
  React, jsx, css, type ImmutableObject, Immutable, hooks, type IMThemeVariables,
} from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { Alert, Button, Checkbox, CollapsablePanel, defaultMessages as jimuiDefaultMessages, Label, Tooltip } from 'jimu-ui'
import { SettingSection, MapWidgetSelector, SidePopper, SettingRow } from 'jimu-ui/advanced/setting-components'
import { type ToolConfig, type IMConfig, ToolType, type CustomToolConfig, type CustomToolAdded } from '../config'
import defaultMessages from './translations/default'
import StandardAnalysisToolSelector from './tool-selector/standard-tool-selector'
import ToolList from './components/tool-list'
import { customToolHasLayerInputParameter, getDefaultCustomToolConfig, getDefaultRFxConfig, getDefaultStandardToolConfig, usePreviousLength } from './utils'
import CustomAnalysisToolSelector from './tool-selector/custom-tool-selector'
import 'calcite-components' // Needed to pull calcite in for ArcGis* components
import { ClickOutlined } from 'jimu-icons/outlined/application/click'
import { getRFxNameFromHistoryItem, isSameToolAsHistoryItem, outputParameterNeedAddToMapAuto, useAnalysisEnginesAccess, useGetDisplayedToolName, wait } from '../utils/util'
import StandardToolConfigPopperContent from './tool-setting/standard-tool-config'
import CustomToolConfigPopperContent from './tool-setting/custom-tool-config'
import { loadAnalysisHistoryResourceItemsFromMap, useParsedHistoryResourceFromMap } from '../utils/history'
import { type JimuMapView, JimuMapViewComponent, loadArcGISJSAPIModules } from 'jimu-arcgis'
import { getAnalysisAssetPath, useToolInfoStrings } from '../utils/strings'
import '@arcgis/analysis-components/dist/analysis-components/analysis-components.css'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { ImportOutlined } from 'jimu-icons/outlined/editor/import'
import RFxToolSelector from './tool-selector/rfx-tool-selector'
import { AnalysisType, type AnalysisEngine } from '@arcgis/analysis-ui-schema'
import CustomToolNameEdit from './tool-setting/custom-tool-name-edit'

type SettingProps = AllWidgetSettingProps<IMConfig>

const { useEffect, useState, useMemo, useRef } = React

const useStyle = (theme: IMThemeVariables, hasTools: boolean) => {
  return useMemo(() => {
    return css`
      padding-bottom: ${hasTools ? '3.125rem' : '0'};
      flex-direction: column;
      .first-section {
        .jimu-widget-setting--section-header +* {
          margin-top: 0.75rem;
        }
        .label-for-checkbox {
          line-height: 1.625rem;
          margin-bottom: 0;
          margin-top: 0.5rem;
        }
      }
      .no-border {
        border: none;
      }
      .tool-list-placeholder {
        flex-direction: column;
        padding-top: 11rem;
        font-size: 0.875rem;
        text-align: center;
        color: var(--ref-palette-neutral-800);
        span {
          padding: 0 1rem;
        }
      }
      .no-map-alert {
        margin-top: 0.75rem;
      }

      .bottom-checkbox {
        position: absolute;
        bottom: 0;
        background: ${theme?.sys.color.surface?.background};
        left: 0;
        right: 0;
        margin-bottom: 0;
        padding: 1rem;
      }
      .no-map-history-tip {
        margin-top: 0.75rem;
        line-height: 1rem;
        font-size: 0.75rem;
        color: ${theme?.sys.color?.error.main}
      }
      .import-history-tooltip {
        width: 14.125rem;
      }
      .select-map-text {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    `
  }, [hasTools, theme])
}

const toolConfigPopperStyle = css`
  .popper-box > div {
    overflow: auto;
  }
  .collapse {
    label {
      color: var(--ref-palette-neutral-1100) !important;
    }
    .feature-input-setting-row label::first-of-type {
      color: var(--ref-palette-neutral-1000) !important;
    }
  }
  .jimu-widget-setting--row:not(.form-inline) .jimu-widget-setting--row-label {
    margin-bottom: 0.25rem;
  }
  .label-for-checkbox {
    display: flex;
    align-items: center;
    padding: 0.375rem 0;
    margin-bottom: 0.25rem;
    .jimu-checkbox {
      margin-right: 0.5rem;
    }
  }
`

const Setting = (props: SettingProps) => {
  const {
    id,
    theme,
    config,
    onSettingChange,
    useMapWidgetIds,
    portalSelf,
    portalUrl,
    useUtilities,
    locale,
  } = props

  useEffect(() => {
    import('@arcgis/analysis-components/dist/loader').then(({ defineCustomElements}) => {
      defineCustomElements(window, { resourcesUrl: getAnalysisAssetPath() })
    })
  }, [])

  const { toolList, displayToolHistoryFromMap } = config

  const translate = hooks.useTranslation(defaultMessages, jimuiDefaultMessages)

  const onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    onSettingChange({ id, useMapWidgetIds })
  }

  const onImportHistoryFromMapChange = (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    onSettingChange({
      id,
      config: checked ? config.set('displayToolHistoryFromMap', checked) : config.without('displayToolHistoryFromMap')
    })
  }

  const onAddNewStandardTool = (toolName: string, analysisEngine: AnalysisEngine) => {
    const toolConfig = getDefaultStandardToolConfig(toolName, analysisEngine)
    onSettingChange({ id, config: config.set('toolList', [...toolList, toolConfig]) })
  }

  const onAddNewRFx = (toolName: string) => {
    const toolConfig = getDefaultRFxConfig(toolName)
    onSettingChange({ id, config: config.set('toolList', [...toolList, toolConfig]) })
  }

  const onToolListSort = (newToolList: Array<ImmutableObject<ToolConfig>>) => {
    onSettingChange({ id, config: config.set('toolList', newToolList) })
  }

  const onConfigChange = (index: number, setInArray: string[], value) => {
    const tool = toolList[index].setIn(setInArray, value)
    const newToolList = [...toolList.asMutable()]
    newToolList[index] = tool
    onSettingChange({ id, config: config.set('toolList', newToolList) })
  }

  const onDeleteTool = (toolId: string) => {
    const newToolList = toolList.filter((t) => t.id !== toolId)
    const toolInfo = toolList.find((tool) => tool.id === toolId)
    const currentUseUtilities = useUtilities ? useUtilities.asMutable({ deep: true }) : []
    if (toolInfo.type === ToolType.Custom) {
      const toolConfig = (toolInfo.config as CustomToolConfig)
      if (toolConfig.utility) {
        const { utilityId, task } = toolConfig.utility
        const noOtherToolUseSameUtility = !newToolList.find((tool) => {
          if (tool.type !== ToolType.Custom) {
            return false
          }
          const tConfig = (tool.config as CustomToolConfig)
          const toolUtilityId = tConfig.utility?.utilityId
          const toolTask = tConfig.utility?.task
          return toolUtilityId === utilityId && toolTask === task
        })
        const utilityIndexInUseUtilities = currentUseUtilities.findIndex((u) => u.utilityId === utilityId && u.task === task)
        if (noOtherToolUseSameUtility && utilityIndexInUseUtilities > -1) {
          currentUseUtilities.splice(utilityIndexInUseUtilities, 1)
        }
      }
    }
    onSettingChange({ id, config: config.set('toolList', newToolList), useUtilities: currentUseUtilities })
    if (toolId === currentEditToolId) {
      setCurrentEditToolId('')
    }
  }

  const [openNoMapWarning, setOpenNoMapWarning] = useState(false)

  useEffect(() => {
    if (useMapWidgetIds?.[0] && openNoMapWarning) {
      setOpenNoMapWarning(false)
    }
    if (!useMapWidgetIds?.[0] && !openNoMapWarning) {
      // check if has standard tool or custom tool with layer input parameter
      const hasNeedMapTool = toolList.some((t) => t.type !== ToolType.Custom || (t.type === ToolType.Custom && customToolHasLayerInputParameter((t.config as CustomToolConfig).toolInfo)))
      if (hasNeedMapTool) {
        setOpenNoMapWarning(true)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [useMapWidgetIds])

  const getCustomToolAddResultLayersToMapAutoInfo = (toolConfig: CustomToolConfig, needOpenAddResultLayersToMapAuto: boolean) => {
    const addResultLayersToMapAuto = toolConfig.output.addResultLayersToMapAuto
    const parameters = toolConfig.toolInfo?.parameters
    const parametersNeedToUpdated = parameters?.filter((p) => {
      return outputParameterNeedAddToMapAuto(p) && (needOpenAddResultLayersToMapAuto ? addResultLayersToMapAuto[p.name] === undefined : addResultLayersToMapAuto[p.name])
    })
    if (parametersNeedToUpdated?.length) {
      const updatedAddResultLayersToMapAuto = { ...toolConfig.output.addResultLayersToMapAuto }
      parametersNeedToUpdated.forEach((p) => {
        if (needOpenAddResultLayersToMapAuto) {
          updatedAddResultLayersToMapAuto[p.name] = true
        } else {
          Reflect.deleteProperty(updatedAddResultLayersToMapAuto, p.name)
        }
      })
      return updatedAddResultLayersToMapAuto
    }
    return null
  }

  // if user select map, turn on "add result layers to map automatically" by default, if unselect map, turn off
  hooks.useUpdateEffect(() => {
    if (!toolList.find((tool) => tool.type === ToolType.Custom)) {
      return
    }
    const addResultLayersToMapAuto = !!useMapWidgetIds?.[0]
    const newToolList = toolList.map((tool) => {
      if (tool.type === ToolType.Custom) {
        const toolConfig = (tool.config as ImmutableObject<CustomToolConfig>)
        const addResultLayersToMapAutoInfo = getCustomToolAddResultLayersToMapAutoInfo(toolConfig.asMutable({ deep: true }), addResultLayersToMapAuto)
        if (addResultLayersToMapAutoInfo) {
          return tool.setIn(['config', 'output', 'addResultLayersToMapAuto'], addResultLayersToMapAutoInfo)
        }
      }
      return tool
    })
    if (toolList.some((tool, index) => tool !== newToolList[index])) {
      onSettingChange({ id, config: config.set('toolList', newToolList) })
    }
  }, [useMapWidgetIds])

  /**
   * custom tool start
   */
  const onAddNewCustomTool = (data: CustomToolAdded) => {
    const { utility, toolInfo, toolUrl } = data
    const toolConfig = getDefaultCustomToolConfig(utility, toolInfo, toolUrl)
    if (customToolHasLayerInputParameter(toolInfo) && !useMapWidgetIds?.[0]) {
      setOpenNoMapWarning(true)
    }
    // if map was selected, turn on "Add result layers to map automatically"
    if (useMapWidgetIds?.[0]) {
      const addResultLayersToMapAutoInfo = getCustomToolAddResultLayersToMapAutoInfo(toolConfig.config, true)
      if (addResultLayersToMapAutoInfo) {
        toolConfig.config.output.addResultLayersToMapAuto = addResultLayersToMapAutoInfo
      }
    }

    const currentUseUtilities = useUtilities ? useUtilities.asMutable({ deep: true }) : []
    if (!currentUseUtilities.find(utility.task ? (u) => u.utilityId === utility.utilityId && u.task === utility.task : (u) => u.utilityId === utility.utilityId)) {
      currentUseUtilities.push(utility)
    }
    onSettingChange({ id, config: config.set('toolList', [...toolList, toolConfig]), useUtilities: currentUseUtilities })
  }
  /**
   * custom tool end
   */

  const [currentEditToolId, setCurrentEditToolId] = useState('')

  const currentEditToolInfo = useMemo(() => {
    if (!currentEditToolId) {
      return null
    }
    return Immutable(toolList.find((t) => t.id === currentEditToolId))
  }, [currentEditToolId, toolList])

  const currentEditButtonRef = useRef<HTMLDivElement>(null)

  const prevToolListLength = usePreviousLength(toolList.length)
  hooks.useUpdateEffect(() => {
    if (toolList.length - prevToolListLength === 1) {
      // after added a new tool, the tool select popper will be closed and will focus the trigger element(tool select button) automatically
      // use timeout to confirm focus the close button in tool config popper after tool select button is focused
      setTimeout(() => {
        setCurrentEditToolId(toolList[toolList.length - 1].id)
      }, 200)
    }
  }, [toolList.length])

  const onToolConfigChange = (setInArray: string[], value) => {
    const index = toolList.findIndex((t) => t.id === currentEditToolId)
    onConfigChange(index, setInArray, value)
  }

  const [currentJimuMapView, setCurrentJimuMapView] = useState<JimuMapView>(null)

  useEffect(() => {
    if (!useMapWidgetIds?.[0]) {
      setCurrentJimuMapView(null)
    }
  }, [useMapWidgetIds])

  const [portal, setPortal] = useState<__esri.Portal>()
  useEffect(() => {
    loadArcGISJSAPIModules([
      'esri/portal/Portal'
    ]).then(modules => {
      const [Portal] = modules as [typeof __esri.Portal]

      const portal = new Portal({
        url: portalUrl,
        sourceJSON: portalSelf
      })
      portal.load().then(() => {
        setPortal(portal)
      })
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const toolInfoStrings = useToolInfoStrings()

  const [noMapHistory, setNoMapHistory] = useState(false)
  const handleNoMapHistory = async () => {
    onSettingChange({
      id,
      config: config.without('historyResourceItemsFromMap')
    })

    setNoMapHistory(true)
    await wait(3000)
    setNoMapHistory(false)
  }

  const canAccessAnalysisEngines = useAnalysisEnginesAccess(portal)

  const importHistoryFromMap = async () => {
    if (!currentJimuMapView) {
      setOpenNoMapWarning(true)
      return
    }
    const historyResourceItems = await loadAnalysisHistoryResourceItemsFromMap(currentJimuMapView, portal)
    if (!historyResourceItems?.length) {
      handleNoMapHistory()
      return
    }

    // if historyResourceItems has new standard tool or raster tool, add it to toolList
    const newToolList: ToolConfig[] = []
    historyResourceItems.forEach((item) => {
      // user can't perform the tool of history item
      if (!canAccessAnalysisEngines(item.analysisEngine)) {
        return
      }
      const matchedTool = [...toolList, ...newToolList].find((tool) => isSameToolAsHistoryItem(tool, item))
      if (!matchedTool) {
        const isRFx = item.analysisType === AnalysisType.RasterFunction
        const newTool = isRFx ? getDefaultRFxConfig(getRFxNameFromHistoryItem(item)) : getDefaultStandardToolConfig(item.toolName, item.analysisEngine)
        newToolList.push(newTool)
      }
    })

    onSettingChange({
      id,
      config: config
        .set('toolList', [...toolList, ...newToolList])
        .set('historyResourceItemsFromMap', historyResourceItems)
        .set('displayToolHistoryFromMap', true)
    })
  }

  // for number show in tool list and preset tool from history in standard tool setting panel
  const parsedHistoryResourceFromMap = useParsedHistoryResourceFromMap(config)

  const style = useStyle(theme, toolList.length > 0)

  const getDisplayedToolName = useGetDisplayedToolName()

  const mapWarningMessage = useMemo(() => openNoMapWarning ? translate('selectMapTip') : noMapHistory ? translate('noMapHistoryError') : '', [openNoMapWarning, translate, noMapHistory])

  const onMapWarningAlertClose = () => {
    if (openNoMapWarning) {
      setOpenNoMapWarning(false)
    }
    if (noMapHistory) {
      setNoMapHistory(false)
    }
  }

  const getToolSettingTitle = () => {
    if (!currentEditToolInfo) {
      return ''
    }
    const toolDisplayName = getDisplayedToolName(currentEditToolInfo)
    if (currentEditToolInfo.type !== ToolType.Custom) {
      return toolDisplayName
    }
    return <CustomToolNameEdit displayName={toolDisplayName} onChange={(newToolDisplayName) => {
      if (newToolDisplayName) {
        onToolConfigChange(['config', 'option', 'toolDisplayName'], newToolDisplayName)
      } else {
        onToolConfigChange(['config', 'option'], (currentEditToolInfo.config as ImmutableObject<CustomToolConfig>).option.without('toolDisplayName'))
      }
    }} />
  }

  return (
    <div className='widget-setting-analysis jimu-widget-setting' css={style}>
      <SettingSection className='first-section' role='group' aria-label={translate('selectMapWidget')}
        title={<div className='d-flex align-items-center'>
          <span className='select-map-text' title={translate('selectMapWidget')}>{translate('selectMapWidget')}</span>
          <Tooltip placement="top" title={translate('selectMapWidgetTooltip')} css={css`width: 15.125rem`}>
            <Button icon type='tertiary' className='jimu-outline-inside'>
              <InfoOutlined />
            </Button>
          </Tooltip>
        </div>}
      >
        <SettingRow>
          <MapWidgetSelector onSelect={onMapWidgetSelected} useMapWidgetIds={useMapWidgetIds} />
          <Tooltip placement="top" title={translate('importMapHistoryTooltip')} css={css`width: 14.125rem`}>
            <Button icon size='sm' type='default' onClick={importHistoryFromMap} className='ml-1' aria-label={translate('importMapHistoryTooltip')}>
              <ImportOutlined />
            </Button>
          </Tooltip>
        </SettingRow>

        <Alert className='w-100 no-map-alert' closable withIcon form="basic" buttonType='tertiary' size='small' text={mapWarningMessage} type="warning" open={!!mapWarningMessage} onClose={onMapWarningAlertClose} />
      </SettingSection>
      <SettingSection className={toolList.length === 0 ? 'no-border' : ''} title={translate('addTools')} role='group' aria-label={translate('addTools')}>
        <StandardAnalysisToolSelector disabled={!useMapWidgetIds?.[0]} toolList={toolList} portal={portal} toolInfoStrings={toolInfoStrings} onWarningNoMap={() => { setOpenNoMapWarning(true) }} onChange={onAddNewStandardTool} />
        <RFxToolSelector disabled={!useMapWidgetIds?.[0]} toolList={toolList} portal={portal} locale={locale} onWarningNoMap={() => { setOpenNoMapWarning(true) }} onChange={onAddNewRFx} />
        <CustomAnalysisToolSelector onChange={onAddNewCustomTool} />
      </SettingSection>
      {toolList.length
        ? <SettingSection className='border-0'>
            <CollapsablePanel label={translate('tools')} type="default" defaultIsOpen aria-label={translate('tools')}>
              {toolInfoStrings && <ToolList
                editId={currentEditToolId} toolList={toolList} historyListFromMap={parsedHistoryResourceFromMap}
                onSort={onToolListSort} onDelete={onDeleteTool} onOpenEdit={setCurrentEditToolId}
                onTriggerRefChange={(ref) => { currentEditButtonRef.current = ref }} />}
            </CollapsablePanel>
          </SettingSection>
        : <div className='tool-list-placeholder d-flex align-items-center'>
            <ClickOutlined size={48} className='mb-5' />
            <span>{translate('toolListPlaceholder')}</span>
          </div>}

      {!!toolList.length && <Label className='d-flex align-items-center label-for-checkbox bottom-checkbox'>
        <Checkbox className='mr-2' checked={displayToolHistoryFromMap} onChange={onImportHistoryFromMapChange} />
        {translate('displayToolHistoryFromMap')}
      </Label>}

      <SidePopper
        css={toolConfigPopperStyle}
        isOpen={!!currentEditToolInfo} position="right"
        toggle={() => { setCurrentEditToolId('') }} trigger={currentEditButtonRef?.current}
        backToFocusNode={currentEditButtonRef?.current}
        title={getToolSettingTitle()}>
        {
          currentEditToolInfo?.type !== ToolType.Custom
            ? <StandardToolConfigPopperContent toolConfig={currentEditToolInfo} historyListFromMap={parsedHistoryResourceFromMap} onConfigChange={onToolConfigChange} />
            : <CustomToolConfigPopperContent toolConfig={currentEditToolInfo} onConfigChange={onToolConfigChange} />
        }
      </SidePopper>

      <JimuMapViewComponent
        useMapWidgetId={useMapWidgetIds?.[0]}
        onActiveViewChange={setCurrentJimuMapView}
      />
    </div>
  )
}

export default Setting
