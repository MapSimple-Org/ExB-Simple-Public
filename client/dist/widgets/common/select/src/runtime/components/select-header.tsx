/** @jsx jsx */
import {
  React, jsx, css, hooks, type ImmutableArray, loadArcGISJSAPIModules, dataSourceUtils, classNames, DataSourceSelectionMode, getAppStore, appActions, geometryUtils, WidgetState
} from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import { defaultMessages as jimuUIMessages, Button, SVG, Dropdown, DropdownButton, DropdownMenu, DropdownItem } from 'jimu-ui'
import { type IMConfig, type DataSourceItem, InteractiveToolType } from '../../config'
import {
  getReadyToDisplayRuntimeInfos, getCheckedReadyToDisplayNotSelectingRuntimeInfos,
  type DataSourceItemRuntimeInfo, type DataSourceItemRuntimeInfoMap, type GeometryInfo
} from '../utils'
import { getFinalEnableAttributeSelectionForMap } from '../../utils'
import type { SpatialRelationship } from '@esri/arcgis-rest-feature-service'
import SelectRectangleOutlined from 'jimu-icons/svg/outlined/gis/select-rectangle.svg'
import SelectPolygonOutlined from 'jimu-icons/svg/outlined/gis/select-polygon.svg'
import SelectCircleOutlined from 'jimu-icons/svg/outlined/gis/select-circle.svg'
import SelectLineOutlined from 'jimu-icons/svg/outlined/gis/select-line.svg'
import SelectPointOutlined from 'jimu-icons/svg/outlined/gis/select-point.svg'
import SelectByDataIcon from '../assets/select-by-data.svg'
import defaultMessages from '../translations/default'

interface SelectHeaderProps {
  config: IMConfig
  widgetId: string
  mapWidgetId: string
  autoControlWidgetId: string
  widgetState?: WidgetState
  activeJimuMapView: JimuMapView
  setSelectByLocationVisible: React.Dispatch<React.SetStateAction<boolean>>
  // imDataSourceItemsFromMap + configDataSourceItems
  allImDataSourceItems: ImmutableArray<DataSourceItem>
  dataSourceItemRuntimeInfoMap: DataSourceItemRuntimeInfoMap
}

const style = css`
  overflow: hidden;
  border-bottom: 1px solid var(--sys-color-divider-secondary);

  .dropdown-btn-container {
    position: relative;
    float: left;

    .api-modules-loading-progress {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 2px;
      width: 100%;
      background-color: rgba(110,110,110,0.3);
      animation: esri-fade-in 500ms ease-in-out;
    }

    .api-modules-loading-progress:after {
      position: absolute;
      width: 20%;
      height: 2px;
      top: 0;
      content: "";
      opacity: 1;
      z-index: 0;
      background-color: var(--sys-color-primary-main);
      animation: looping-progresss-bar-ani 1500ms linear infinite;
      transition: opacity 500ms ease-in-out;
    }
  }

  .render-dropdown {
    .selected-tool-btn {
      border-right: 0;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }

    .select-dropdown-btn {
      font-size: 14px;
      border-left: 0;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      padding-left: 6px;
      padding-right: 6px;
    }
  }

  .clear-all-btn {
    float: right;
  }
`

const SELECT_BY_DATA = 'data'

type AllSelectToolType = InteractiveToolType | 'data'

interface SelectToolItemInfo {
  order: number
  label: string
  iconSrc: string
}

interface SelectToolItemInfoMapping {
  [toolType: string]: SelectToolItemInfo
}

interface ApiModules {
  SketchViewModel: typeof __esri.SketchViewModel
  GraphicsLayer: typeof __esri.GraphicsLayer
  jsonUtils: typeof __esri.jsonUtils
}
interface SketchCreateOptions {
  [tool: string]: __esri.SketchViewModelCreateCreateOptions
}

interface LastKeyEventInfo {
  eventDate: Date
  isKeyDown: boolean // true means keydown, false means keyup
}

interface SketchViewModelExtension extends __esri.SketchViewModel {
  viewKeyDownHandle?: __esri.Handle
  viewKeyUpHandle?: __esri.Handle
}

const SKETCH_CREATE_OPTIONS: SketchCreateOptions = {
  polygon: {
    mode: 'hybrid'
  }
}

const defaultPointSymbol = {
  style: 'esriSMSCircle',
  color: [0, 0, 128, 128],
  name: 'Circle',
  outline: {
    color: [0, 0, 128, 255],
    width: 1
  },
  type: 'esriSMS',
  size: 18
}

const defaultPolylineSymbol = {
  tags: ['solid'],
  title: 'Blue Thin',
  style: 'esriSLSSolid',
  color: [79, 129, 189, 255],
  width: 3,
  name: 'Blue 1',
  type: 'esriSLS'
}

const defaultPolygonSymbol = {
  style: 'esriSFSSolid',
  color: [79, 129, 189, 77],
  type: 'esriSFS',
  outline: {
    style: 'esriSLSSolid',
    color: [54, 93, 141, 255],
    width: 1.5,
    type: 'esriSLS'
  }
}

/**
 * SelectHeader includes two parts: select tools and clear button.
 */
export default function SelectHeader (props: SelectHeaderProps) {
  const {
    config,
    widgetId,
    mapWidgetId, // empty if use data attribute source
    autoControlWidgetId,
    widgetState,
    activeJimuMapView: jimuMapViewProp,
    setSelectByLocationVisible,
    allImDataSourceItems,
    dataSourceItemRuntimeInfoMap
  } = props

  const {
    useMap,
    interactiveTools,
    spatialSelection
  } = config

  const isLocationEnabled = spatialSelection?.enable

  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)

  const isLoadingApiModulesRef = React.useRef<boolean>(false)
  const [apiModules, setApiModules] = React.useState<ApiModules>(null)
  const jimuMapViewRef = React.useRef<JimuMapView>(null)
  jimuMapViewRef.current = jimuMapViewProp
  const [loadedActiveJimuMapView, setLoadedActiveJimuMapView] = React.useState<JimuMapView>(null)
  const loadedActiveView = React.useMemo(() => loadedActiveJimuMapView?.view || null, [loadedActiveJimuMapView])
  const sketchViewModelRef = React.useRef<SketchViewModelExtension>(null)
  const [isSelectedBtnActive, setSelectedBtnActive] = React.useState<boolean>(false)
  const isSelectedBtnActiveRef = React.useRef<boolean>(false)
  isSelectedBtnActiveRef.current = isSelectedBtnActive
  const [isDropdownOpened, setIsDropdownOpened] = React.useState<boolean>(false)
  const appliedBatchRuntimeInfosRef = React.useRef<DataSourceItemRuntimeInfo[]>([]) // runtimeInfo array for applying the new geometry
  const lastShiftKeyEventInfoRef = React.useRef<LastKeyEventInfo>(null)
  const lastCtrlKeyEventInfoRef = React.useRef<LastKeyEventInfo>(null)
  const isMacRef = React.useRef<boolean>(window.jimuUA?.os?.name === 'macOS')
  const isReadyToCreateSketchViewModel = !!(apiModules && loadedActiveView)
  const configMapInfo = config?.mapInfo
  const jimuLayerViewIdByProp = jimuMapViewProp?.id
  // calculate the final enableAttributeSelectionForMap
  const enableAttributeSelectionForMap = React.useMemo(() => {
    let newEnableAttributeSelectionForMap = false

    if (jimuLayerViewIdByProp && configMapInfo) {
      const jimuMapViewConfigInfo = configMapInfo[jimuLayerViewIdByProp]

      if (jimuMapViewConfigInfo) {
        // configure options for jimuLayerViewId
        newEnableAttributeSelectionForMap = getFinalEnableAttributeSelectionForMap(jimuMapViewConfigInfo.syncWithMap, jimuMapViewConfigInfo.enableAttributeSelection)
      } else {
        // doesn't configure options for jimuLayerViewId, the default value is false
        newEnableAttributeSelectionForMap = false
      }
    }

    return newEnableAttributeSelectionForMap
  }, [configMapInfo, jimuLayerViewIdByProp])

  const apiSpatialRel = React.useMemo(() => {
    let resultSpatialRelationship: SpatialRelationship = 'esriSpatialRelIntersects'
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-boolean-literal-compare
    if (interactiveTools && interactiveTools.partiallyWithin === false) {
      resultSpatialRelationship = 'esriSpatialRelContains'
    }

    return resultSpatialRelationship
  }, [interactiveTools])

  // DataSourceItemRuntimeInfo array that items are ready to display on the UI.
  const readyRuntimeInfos: DataSourceItemRuntimeInfo[] = React.useMemo(() => {
    return getReadyToDisplayRuntimeInfos(allImDataSourceItems, dataSourceItemRuntimeInfoMap)
  }, [allImDataSourceItems, dataSourceItemRuntimeInfoMap])

  // DataSourceItemRuntimeInfo array that items are checked, ready to display on the UI and not in selecting status.
  const availableRuntimeInfosForBatch = React.useMemo(() => {
    return getCheckedReadyToDisplayNotSelectingRuntimeInfos(allImDataSourceItems, dataSourceItemRuntimeInfoMap)
  }, [allImDataSourceItems, dataSourceItemRuntimeInfoMap])

  // tool order: rectangle, polygon, circle, line, point, data
  const selectToolItemInfoMapping = React.useMemo((): SelectToolItemInfoMapping => {
    return {
      [InteractiveToolType.Rectangle]: {
        order: 1,
        label: translate('SelectionByRectangle'),
        iconSrc: SelectRectangleOutlined
      },
      [InteractiveToolType.Polygon]: {
        order: 2,
        label: translate('SelectionByLasso'),
        iconSrc: SelectPolygonOutlined
      },
      [InteractiveToolType.Circle]: {
        order: 3,
        label: translate('SelectionByCircle'),
        iconSrc: SelectCircleOutlined
      },
      [InteractiveToolType.Polyline]: {
        order: 4,
        label: translate('SelectionByLine'),
        iconSrc: SelectLineOutlined
      },
      [InteractiveToolType.Point]: {
        order: 5,
        label: translate('SelectionByPoint'),
        iconSrc: SelectPointOutlined
      },
      [SELECT_BY_DATA]: {
        order: 6,
        label: translate('selectByData'),
        iconSrc: SelectByDataIcon
      }
    }
  }, [translate])

  // allSelectToolTypes = interactiveTools.tools + selectByData
  const allSelectToolTypes = React.useMemo((): AllSelectToolType[] => {
    const resultAllSelectToolTypes: AllSelectToolType[] = []

    // interactiveTools is only valid when useMap is true
    if (useMap && interactiveTools) {
      if (interactiveTools.tools && interactiveTools.tools.length > 0) {
        interactiveTools.tools.forEach(toolType => {
          resultAllSelectToolTypes.push(toolType)
        })
      }
    }

    // selectByData
    if (isLocationEnabled) {
      resultAllSelectToolTypes.push(SELECT_BY_DATA)
    }

    // sort tool by ascending order
    resultAllSelectToolTypes.sort((toolType1, toolType2) => {
      const order1 = selectToolItemInfoMapping[toolType1].order
      const order2 = selectToolItemInfoMapping[toolType2].order
      return order1 - order2
    })

    return resultAllSelectToolTypes
  }, [interactiveTools, isLocationEnabled, selectToolItemInfoMapping, useMap])

  // selectedToolType maybe undefined
  const [selectedToolType, setSelectedToolType] = React.useState<AllSelectToolType>(allSelectToolTypes[0])
  const selectedToolTypeRef = React.useRef<AllSelectToolType>(null)
  selectedToolTypeRef.current = selectedToolType

  const needInteractiveAPIModules = React.useMemo((): boolean => {
    const interactiveToolTypes = allSelectToolTypes.filter(toolType => toolType !== SELECT_BY_DATA)
    return interactiveToolTypes.length > 0
  }, [allSelectToolTypes])

  const shouldShowProgressForAPIModules = needInteractiveAPIModules && !apiModules

  const selectedToolIconSrc = React.useMemo((): string => {
    let iconSrc: string = ''

    if (selectedToolType) {
      const selectedToolItemInfo = selectToolItemInfoMapping[selectedToolType]

      if (selectedToolItemInfo) {
        iconSrc = selectedToolItemInfo.iconSrc
      }
    }

    return iconSrc
  }, [selectToolItemInfoMapping, selectedToolType])

  const isToolTypeDisabled = React.useCallback((toolType: string) => {
    const disabled = toolType !== SELECT_BY_DATA && !isReadyToCreateSketchViewModel
    return disabled
  }, [isReadyToCreateSketchViewModel])

  const dropdownItems = React.useMemo(() => {
    const resultDropdownItems = []

    allSelectToolTypes.forEach(toolType => {
      if (toolType === SELECT_BY_DATA && allSelectToolTypes.length >= 2) {
        resultDropdownItems.push(
          <DropdownItem
            key='divider'
            divider
          />
        )
      }

      const active = toolType === selectedToolType
      const iconSrc = selectToolItemInfoMapping[toolType].iconSrc
      const disabled = isToolTypeDisabled(toolType)

      const dropdownItem = (
        <DropdownItem
          key={toolType}
          active={active}
          disabled={disabled}
          onClick={() => {
            setSelectedToolType(toolType)
          }}
        >
          <SVG
            src={iconSrc}
            className='mr-2'
          />
          { selectToolItemInfoMapping[toolType].label }
        </DropdownItem>
      )

      resultDropdownItems.push(dropdownItem)
    })

    return resultDropdownItems
  }, [allSelectToolTypes, selectedToolType, selectToolItemInfoMapping, isToolTypeDisabled])

  // bind shift/ctrl keys event listeners
  React.useEffect(() => {
    const isMac = isMacRef.current

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        lastShiftKeyEventInfoRef.current = {
          eventDate: new Date(),
          isKeyDown: true
        }
      } else if ((isMac && event.key === 'Meta') || (!isMac && event.key === 'Control')) {
        lastCtrlKeyEventInfoRef.current = {
          eventDate: new Date(),
          isKeyDown: true
        }
      }
    }

    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        lastShiftKeyEventInfoRef.current = {
          eventDate: new Date(),
          isKeyDown: false
        }
      } else if ((isMac && event.key === 'Meta') || (!isMac && event.key === 'Control')) {
        lastCtrlKeyEventInfoRef.current = {
          eventDate: new Date(),
          isKeyDown: false
        }
      }
    }

    document.addEventListener('keydown', onKeyDown, true)
    document.addEventListener('keyup', onKeyUp, true)

    return () => {
      document.removeEventListener('keydown', onKeyDown, true)
      document.removeEventListener('keyup', onKeyUp, true)
    }
  }, [])

  // update loadedActiveJimuMapView when jimuMapView is loaded
  React.useEffect(() => {
    const jimuMapView = jimuMapViewRef.current

    if (jimuMapView && (jimuMapView !== loadedActiveJimuMapView)) {
      jimuMapView.whenJimuMapViewLoaded().then(() => {
        // whenJimuMapViewLoaded is an async method, so need to check if active jimuMapView is changed during this period
        if (jimuMapView === jimuMapViewRef.current) {
          setLoadedActiveJimuMapView(jimuMapView)
        }
      })
    }
  }, [jimuMapViewProp, loadedActiveJimuMapView])

  // load api modules
  React.useEffect(() => {
    if (needInteractiveAPIModules && !apiModules && !isLoadingApiModulesRef.current) {
      isLoadingApiModulesRef.current = true
      loadArcGISJSAPIModules([
        'esri/widgets/Sketch/SketchViewModel',
        'esri/layers/GraphicsLayer',
        'esri/symbols/support/jsonUtils',
        // When you first click to enable the interactive tools, like the rectangle, for a couple of seconds, there is no cursor on the map, and you cannot do anything - which looks like a bug.
        // To fix the above issue, we need to preload the following API modules for SketchViewModel.
        'esri/views/2d/interactive/editingTools',
        'esri/views/3d/interactive/editingTools',
        'esri/views/2d/layers/GraphicsLayerView2D',
        'esri/views/3d/layers/GraphicsLayerView3D'
      ]).then((modules) => {
        const [SketchViewModel, GraphicsLayer, jsonUtils] = modules as [typeof __esri.SketchViewModel, typeof __esri.GraphicsLayer, typeof __esri.jsonUtils]

        setApiModules({
          SketchViewModel,
          GraphicsLayer,
          jsonUtils,
        })
      }).catch(err => {
        console.error('select widget loads api error', err)
      })
    }
  }, [apiModules, isLoadingApiModulesRef, needInteractiveAPIModules])

  const interactiveTool = React.useMemo(() => {
    if (selectedToolType && selectedToolType !== SELECT_BY_DATA) {
      return selectedToolType
    }

    return null
  }, [selectedToolType])

  const activeInteractiveTool = React.useMemo(() => {
    if (isSelectedBtnActive && selectedToolType && selectedToolType !== SELECT_BY_DATA) {
      return selectedToolType
    }

    return null
  }, [isSelectedBtnActive, selectedToolType])

  // When widget state becomes CLOSED (close by widget controller), we need to deactivate map control.
  React.useEffect(() => {
    if (widgetState === WidgetState.Closed) {
      const currSelectedTool = selectedToolTypeRef.current

      if (isSelectedBtnActiveRef.current && currSelectedTool && currSelectedTool !== 'data') {
        setSelectedBtnActive(false)
      }
    }
  }, [widgetState]) // only use widgetState as the dependency

  // handle map widget control
  hooks.useEffectWithPreviousValues((preValues) => {
    const [preActiveInteractiveTool, preAutoControlWidgetId] = preValues

    if (!widgetId) {
      return
    }

    // handle cases that user enables/disables interactive tool
    if (activeInteractiveTool !== preActiveInteractiveTool) {
      // activeInteractiveTool changed
      if (mapWidgetId) {
        if (activeInteractiveTool && autoControlWidgetId !== widgetId) {
          // select gets control of map because user enables interactive tool
          const action = appActions.requestAutoControlMapWidget(mapWidgetId, widgetId)
          getAppStore().dispatch(action)
        } else if (!activeInteractiveTool && autoControlWidgetId === widgetId) {
          // select releases control of map because user disables interactive tool
          const action = appActions.releaseAutoControlMapWidget(mapWidgetId)
          getAppStore().dispatch(action)
        }
      }
    }

    // handle the case that select widget loses control of map because another widget gets control of map
    if (autoControlWidgetId !== preAutoControlWidgetId) {
      // autoControlWidgetId changed
      if (autoControlWidgetId !== widgetId && activeInteractiveTool) {
        setSelectedBtnActive(false)
      }
    }
  }, [activeInteractiveTool, autoControlWidgetId, widgetId])

  // reset selectedToolType to a valid one if selectedToolType is not in allSelectToolTypes when user updates config
  React.useEffect(() => {
    if (selectedToolType && !allSelectToolTypes.includes(selectedToolType)) {
      // user removes the selectedToolType from config
      const newSelectedToolType = allSelectToolTypes.length > 0 ? allSelectToolTypes[0] : null
      setSelectedToolType(newSelectedToolType)
      setSelectedBtnActive(false)
    } else if (!selectedToolType && allSelectToolTypes.length > 0) {
      // user turns on 'Select by data' option for 'Select by attributes'
      const newSelectedToolType = allSelectToolTypes[0]
      setSelectedToolType(newSelectedToolType)
      setSelectedBtnActive(false)
    }
  }, [allSelectToolTypes, selectedToolType])

  // selectionMode will only be enabled if the following all conditions are met
  // 1. Select widget connects to a Map widget (useMap is true).
  // 2. The global attribute selection option is disabled.
  // 3. Current selected tool is interactive tool, not SelectByLocation.
  const isSelectionModeEnabled = !!(useMap && !enableAttributeSelectionForMap && interactiveTool)

  const preActiveInteractiveTool = hooks.usePrevious(activeInteractiveTool)

  const onSketchViewModelCompleteRef = React.useRef<(apiView: __esri.MapView | __esri.SceneView, graphic: __esri.Graphic, selectionMode: DataSourceSelectionMode) => void>(null)
  const onSketchViewModelComplete = React.useCallback((apiView: __esri.MapView | __esri.SceneView, graphic: __esri.Graphic, selectionMode: DataSourceSelectionMode) => {
    // graphic is null when double click 3D map
    if (!graphic) {
      console.log('sketch graphic is null')
      return
    }

    // graphic.geometry is null when double click map
    if (!graphic.geometry) {
      console.log('sketch graphic.geometry is null')
      return
    }

    if (!isSelectionModeEnabled) {
      // If selection mode is not supported, set selectionMode to DataSourceSelectionMode.New
      selectionMode = DataSourceSelectionMode.New
    }

    async function asyncJob() {
      let geometry = graphic.geometry

      try {
        if (geometry.type === 'point' || geometry.type === 'polyline') {
          // If geometry is point, it can't select point features and polyline features.
          // If geometry is polyline, it can't select polyline features sometimes.
          // To solve the above issues, we need to buffer the geometry if it is point or polyline.
          // The following code uses the same logic of JimuMapView.selectFeaturesByGraphic().
          // Use 10 pixels as buffer
          const tolerance = apiView?.resolution * 10

          if (tolerance > 0) {
            const bufferGeometry = await geometryUtils.createBuffer(geometry, [tolerance], 'meters') as __esri.GeometryUnion

            if (bufferGeometry) {
              geometry = bufferGeometry
            }
          }
        }
      } catch (e) {
        console.error('geometryUtils.createBuffer() error of Select widget', e)
      }

      const geometryType = dataSourceUtils.changeJSAPIGeometryTypeToRestAPIGeometryType(geometry.type as any)
      const geometryInfo: GeometryInfo = {
        geometry: geometry.toJSON(),
        geometryType,
        spatialRel: apiSpatialRel
      }

      appliedBatchRuntimeInfosRef.current = availableRuntimeInfosForBatch
      const appliedBatchRuntimeInfos = appliedBatchRuntimeInfosRef.current || []

      appliedBatchRuntimeInfos.forEach(runtimeInfo => {
        runtimeInfo.tryExecuteSelectingByGeometryInfoAndSqlUI(selectionMode, geometryInfo)
      })
    }

    asyncJob()
  }, [isSelectionModeEnabled, apiSpatialRel, availableRuntimeInfosForBatch])
  onSketchViewModelCompleteRef.current = onSketchViewModelComplete

  // auto update sketch view model if dependencies changed
  // only create sketchViewModel when apiModules loaded, view loaded and has active interactive tool
  React.useEffect(() => {
    const currSketchViewModel = sketchViewModelRef.current

    let newSketchViewModel = currSketchViewModel

    if (currSketchViewModel) {
      // sketchViewModel already created
      let shouldDestroy = false

      if (activeInteractiveTool) {
        // has active interactive tool

        if (preActiveInteractiveTool === activeInteractiveTool) {
          // activeInteractiveTool not change
          // then check view changed or not
          const newView = loadedActiveView || null
          const sketchView = currSketchViewModel.view || null

          if (newView) {
            if (newView === sketchView) {
              // view not changed, don't need update sketchViewModel
              shouldDestroy = false
            } else {
              // need to destroy current sketchViewModel and recreate it, don't change sketchViewModel.view,
              // because we need to bind view keydown/keyup events before init sketchViewModel
              shouldDestroy = true
            }
          } else {
            // destroy sketchViewModel if no jimuMapView
            shouldDestroy = true
          }
        } else {
          // activeInteractiveTool changed
          // destroy sketchViewMode if activeInteractiveTool changed, otherwise the 'complete' event saves the previous activeInteractiveTool
          shouldDestroy = true
        }
      } else {
        // doesn't have active interactive tool
        // destroy sketchViewModel if no interactive tool
        shouldDestroy = true
      }

      if (shouldDestroy) {
        if (currSketchViewModel) {
          destroySketchViewModel(currSketchViewModel)
        }

        newSketchViewModel = null
      }
    }

    const trySetActiveToolForSketchViewModel = () => {
      const currentSketchViewModel = sketchViewModelRef.current

      if (currentSketchViewModel && activeInteractiveTool) {
        // console.log(`sketchViewModel create ${activeInteractiveTool}`)
        const createOptions = SKETCH_CREATE_OPTIONS[activeInteractiveTool]

        if (createOptions) {
          currentSketchViewModel.create(activeInteractiveTool as any, createOptions)
        } else {
          currentSketchViewModel.create(activeInteractiveTool as any)
        }
      }
    }

    // create new SketchViewModel
    if (apiModules && loadedActiveView && activeInteractiveTool && !newSketchViewModel) {
      // console.log('create SketchViewModel')

      // When draw rectangle, it always draw square if shift key is pressed, need to override this behavior.
      // Bind key-down/key-up events on view before we create SketchViewModel,
      // so that we can call event.stopPropagation(), then sketchViewModel will not get shift key events.
      const viewKeyDownHandle = loadedActiveView.on('key-down', (event) => {
        if (event.key === 'Shift') {
          event.stopPropagation()
        }
      })

      const viewKeyUpHandle = loadedActiveView.on('key-up', (event) => {
        if (event.key === 'Shift') {
          event.stopPropagation()
        }
      })

      const {
        SketchViewModel,
        GraphicsLayer,
        jsonUtils
      } = apiModules

      const graphicsLayer = new GraphicsLayer()
      newSketchViewModel = new SketchViewModel({
        view: loadedActiveView,
        layer: graphicsLayer,
        pointSymbol: jsonUtils.fromJSON(defaultPointSymbol) as any,
        polylineSymbol: jsonUtils.fromJSON(defaultPolylineSymbol) as any,
        polygonSymbol: jsonUtils.fromJSON(defaultPolygonSymbol) as any
      }) as SketchViewModelExtension

      newSketchViewModel.viewKeyDownHandle = viewKeyDownHandle
      newSketchViewModel.viewKeyUpHandle = viewKeyUpHandle

      newSketchViewModel.on('create', (event) => {
        if (event.state === 'complete') {
          // console.log('sketchViewModel complete')
          trySetActiveToolForSketchViewModel()

          if (onSketchViewModelCompleteRef.current) {
            const graphic = event.graphic
            const isShiftKey = isKeyUsed(lastShiftKeyEventInfoRef.current)
            const isCtrlKey = isKeyUsed(lastCtrlKeyEventInfoRef.current)

            let selectionMode = DataSourceSelectionMode.New

            if (isShiftKey) {
              if (isCtrlKey) {
                selectionMode = DataSourceSelectionMode.SelectFromCurrent
              } else {
                selectionMode = DataSourceSelectionMode.AddToCurrent
              }
            } else {
              if (isCtrlKey) {
                selectionMode = DataSourceSelectionMode.RemoveFromCurrent
              } else {
                selectionMode = DataSourceSelectionMode.New
              }
            }

            onSketchViewModelCompleteRef.current(newSketchViewModel.view, graphic, selectionMode)
          }
        }
      })
    }

    sketchViewModelRef.current = newSketchViewModel

    trySetActiveToolForSketchViewModel()
  }, [activeInteractiveTool, apiModules, loadedActiveView, preActiveInteractiveTool])

  // auto update isSelectByLocationVisible
  React.useEffect(() => {
    const isSelectByLocationVisible = isSelectedBtnActive && selectedToolType === SELECT_BY_DATA
    setSelectByLocationVisible(isSelectByLocationVisible)
  }, [isSelectedBtnActive, selectedToolType, setSelectByLocationVisible])

  // destroy sketchViewModel when unmounted
  hooks.useUnmount(() => {
    const currSketchViewModel = sketchViewModelRef.current

    if (currSketchViewModel) {
      destroySketchViewModel(currSketchViewModel)
      sketchViewModelRef.current = null
    }
  })

  const selectIconTitle = React.useMemo((): string => {
    let finalTitle: string = ''

    if (selectedToolType) {
      if (selectedToolType === SELECT_BY_DATA) {
        finalTitle = translate('selectByData')
      } else {
        let topTitle: string = ''

        if (selectedToolType === InteractiveToolType.Point) {
          topTitle = translate('SelectionByPoint')
        } else if (selectedToolType === InteractiveToolType.Rectangle) {
          topTitle = translate('SelectionByRectangle')
        } else if (selectedToolType === InteractiveToolType.Polygon) {
          topTitle = translate('SelectionByLasso')
        } else if (selectedToolType === InteractiveToolType.Circle) {
          topTitle = translate('SelectionByCircle')
        } else if (selectedToolType === InteractiveToolType.Polyline) {
          topTitle = translate('SelectionByLine')
        } else {
          topTitle = translate('SelectLabel')
        }

        const newSelection = translate('newSelection')
        const addToCurrentSelection = translate('addToCurrentSelection')
        const removeFromCurrentSelection = translate('removeFromCurrentSelection')
        const selectFromCurrentSelection = translate('selectFromCurrentSelection')
        const drawShape = translate('drawShape')
        const draw = translate('draw')
        const ctrlKey = isMacRef.current ? 'Cmd' : 'Ctrl'

        const newSelectionTip = `∙ ${newSelection} (${drawShape})`
        const addToCurrentSelectionTip = `∙ ${addToCurrentSelection} (Shift + ${draw})`
        const removeFromCurrentSelectionTip = `∙ ${removeFromCurrentSelection} (${ctrlKey} + ${draw})`
        const selectFromCurrentSelectionTip = `∙ ${selectFromCurrentSelection} (Shift + ${ctrlKey} + ${draw})`

        if (isSelectionModeEnabled) {
          finalTitle =
    `${topTitle}
${newSelectionTip}
${addToCurrentSelectionTip}
${removeFromCurrentSelectionTip}
${selectFromCurrentSelectionTip}`
        } else {
          finalTitle =
    `${topTitle}
${newSelectionTip}`
        }
      }
    }

    return finalTitle
  }, [isSelectionModeEnabled, selectedToolType, translate])

  const onDropdownToggle = React.useCallback(() => {
    setIsDropdownOpened(opened => !opened)
  }, [setIsDropdownOpened])

  const onToggleToolBtnActive = React.useCallback(() => {
    const newIsBtnActive = !isSelectedBtnActive
    setSelectedBtnActive(newIsBtnActive)
  }, [isSelectedBtnActive])

  // clear selection for all data sources, ignore runtimeInfo.checked
  const onClickClearBtn = React.useCallback(() => {
    readyRuntimeInfos.forEach(runtimeInfo => {
      if (runtimeInfo.clearSelection) {
        runtimeInfo.clearSelection()
      }
    })
  }, [readyRuntimeInfos])

  const shouldRenderDropDown = dropdownItems.length >= 2

  return (
    <div className='w-100 p-4' css={style}>
      <div className={classNames(['d-flex align-items-center dropdown-btn-container', { 'render-dropdown': shouldRenderDropDown }])}>
        {
          selectedToolType &&
          <Button
            className='selected-tool-btn'
            icon={true}
            disabled={ isToolTypeDisabled(selectedToolType) }
            type='default'
            selected={isSelectedBtnActive}
            title={selectIconTitle}
            aria-label={selectIconTitle}
            aria-pressed={isSelectedBtnActive}
            onClick={onToggleToolBtnActive}
          >
            <SVG
              src={selectedToolIconSrc}
            />
          </Button>
        }

        {
          shouldRenderDropDown &&
          <Dropdown
            activeIcon
            isOpen={isDropdownOpened}
            toggle={onDropdownToggle}
            aria-label={translate('moreSelectionTools')}
            menuItemCheckMode='singleCheck'
          >
            <DropdownButton
              className='select-dropdown-btn'
              type='default'
              selected={isDropdownOpened}
            />
            <DropdownMenu
              alignment="start"
              offsetOptions={4}
            >
              {
                dropdownItems
              }
            </DropdownMenu>
          </Dropdown>
        }

        {
          shouldShowProgressForAPIModules &&
          <div className='api-modules-loading-progress'></div>
        }
      </div>

      <Button
        title={translate('drawToolClearBtn')}
        className='pl-4 pr-4 nowrap clear-all-btn'
        type='default'
        icon={true}
        onClick={onClickClearBtn}
      >
        <span className='nowrap'>{ translate('drawToolClearBtn') }</span>
      </Button>
    </div>
  )
}

function isKeyUsed (lastKeyEventInfo: LastKeyEventInfo): boolean {
  const toleranceMs: number = 500

  if (lastKeyEventInfo) {
    if (lastKeyEventInfo.isKeyDown) {
      // key is still down and not up, return true
      return true
    } else {
      // key is up, we use toleranceMs to determine the return value
      const deltaTime = Date.now() - lastKeyEventInfo.eventDate.getTime()

      if (deltaTime <= toleranceMs) {
        // keyup time is not too long from now
        return true
      } else {
        // keyup time is too long from nows
        return false
      }
    }
  } else {
    // key never down, return false
    return false
  }
}

// destroy sketchViewModel
function destroySketchViewModel (sketchViewModel: SketchViewModelExtension): void {
  if (!sketchViewModel) {
    return
  }

  if (sketchViewModel.viewKeyDownHandle) {
    sketchViewModel.viewKeyDownHandle.remove()
    sketchViewModel.viewKeyDownHandle = null
  }

  if (sketchViewModel.viewKeyUpHandle) {
    sketchViewModel.viewKeyUpHandle.remove()
    sketchViewModel.viewKeyUpHandle = null
  }

  if (!sketchViewModel.destroyed) {
    sketchViewModel.destroy()
  }
}
