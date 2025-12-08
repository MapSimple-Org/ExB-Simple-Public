/** @jsx jsx */
import {
  css, jsx, classNames, React, polished, getAppStore, appActions, type IMThemeVariables,
  type FeatureLayerQueryParams, type IntlShape, DataSourceSelectionMode,
  focusElementInKeyboardMode
} from 'jimu-core'
import { Icon, Popper, defaultMessages, Radio } from 'jimu-ui'
import { loadArcGISJSAPIModules, type JimuMapView } from 'jimu-arcgis'
import type { ActiveToolInfo } from '../../layout/base/base-tool'
import SelectProgress from './select-progress'

interface Props {
  mapWidgetId: string
  autoControlWidgetId: string
  theme: IMThemeVariables
  intl: IntlShape

  jimuMapView?: JimuMapView
  toolName: string
  activeToolInfo: ActiveToolInfo

  // toggle props.activeToolInfo.activeToolName
  // props._onIconClick() will set props.activeToolInfo.activeToolName to select tool if props.activeToolInfo.activeToolName is not select tool.
  // props._onIconClick() will set props.activeToolInfo.activeToolName to null if props.activeToolInfo.activeToolName select tool.
  // _onIconClick is a quick way to call props.onActiveToolInfoChange
  _onIconClick: () => void

  onActiveToolInfoChange: (activeToolInfo: ActiveToolInfo) => void
}

interface States {
  sketchInitialed: boolean
  isActive: boolean // the button is active or not
  isShowSelectTypePopup: boolean // show mobile panel or not

  currentSelectType: 'Point' | 'Rectangle' | 'Lasso' | 'Circle' | 'Line'
  spatialRelationship: 'intersects' | 'contains'
  selectProgress: number
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

const IconArrowDown = require('jimu-ui/lib/icons/arrow-down-header.svg')

const SelectRectangleIcon = require('../../assets/icons/select-tool/select-rectangle.svg')
const SelectLassoIcon = require('../../assets/icons/select-tool/select-lasso.svg')
const SelectCircleIcon = require('../../assets/icons/select-tool/select-circle.svg')
const SelectLineIcon = require('../../assets/icons/select-tool/select-line.svg')
const SelectPointIcon = require('../../assets/icons/select-tool/select-point.svg')
const SelectClearIcon = require('jimu-icons/svg/outlined/editor/clear-selection-general.svg')

interface SketchCreateOptions {
  [tool: string]: __esri.SketchViewModelCreateCreateOptions
}

interface LastKeyEventInfo {
  eventDate: Date
  isKeyDown: boolean // true means keydown, false means keyup
}

export class SelectPCTool extends React.PureComponent<Props, States> {
  btnContainer: HTMLElement
  btnSelectTypeContainer: HTMLElement
  selectResultContainer: HTMLElement
  SketchViewModel: typeof __esri.SketchViewModel
  GraphicsLayer: typeof __esri.GraphicsLayer
  Query: typeof __esri.Query
  sketchViewModel: __esri.SketchViewModel
  currentActiveTool: string = 'rectangle'
  query: FeatureLayerQueryParams
  jsonUtils: typeof __esri.jsonUtils = null
  resultGraphics: __esri.Graphic[] = []
  sketChCreateOptions: SketchCreateOptions
  viewKeyDownHandle: __esri.Handle
  viewKeyUpHandle: __esri.Handle
  lastShiftKeyEventInfo: LastKeyEventInfo
  lastCtrlKeyEventInfo: LastKeyEventInfo
  isMac: boolean
  activeJimuMapView: JimuMapView
  id: string

  constructor (props: Props) {
    super(props)

    this.isMac = window.jimuUA?.os?.name === 'macOS'
    this.id = `${this.props.mapWidgetId}-select-tool`

    this.sketChCreateOptions = {
      polygon: {
        mode: 'hybrid'
      }
    }

    this.state = {
      sketchInitialed: false,
      isActive: false,
      isShowSelectTypePopup: false,
      currentSelectType: 'Rectangle',
      spatialRelationship: 'intersects',
      selectProgress: 0
    }

    this.bindShiftCtrlKeysEventListeners()
  }

  getCSSStyle () {
    const theme = this.props.theme

    return css`
      .select-tool-btn {
        width: 32px;
        height: 32px;
      }

      .content-title {
        font-size: ${polished.rem(13)};
        font-weight: bold;
      }

      .select-tool-type-mobile-container-shell {
        overflow-x: auto;
      }

      .select-tool-type-mobile-container-shell::-webkit-scrollbar {
        height: 0 !important;
        display: none;
      }

      .select-tool-type-mobile-container {
        width: 400px;
      }

      .select-tool-type {
        width: 64px;
        height: 64px;
        border: 1px solid ${theme.sys.color.divider.secondary};
        cursor: pointer;
      }

      .select-tool-type-choosed {
        border: 1px solid ${theme.sys.color.primary.main};
        position: relative;
      }

      .select-tool-type-choosed:after {
        width: 0;
        height: 0;
        border-top: 8px solid ${theme.sys.color.primary.main};
        border-left: 8px solid transparent;
        position: absolute;
        top: 0;
        right: 0;
        content: "";
      }

      .select-tool-type-text {
        font-size: ${polished.rem(12)};
      }

      .select-tool-loader {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        width: 100%;
        animation: esri-fade-in 500ms ease-in-out;
      }

      .select-tool-loader:before {
        background-color: rgba(110,110,110,0.3);
        width: 100%;
        z-index: 0;
        content: "";
        opacity: 1;
        position: absolute;
        height: 2px;
        top: 0;
        transition: opacity 500ms ease-in-out;
      }

      .select-tool-loader:after {
        background-color: ${theme.sys.color.primary.main};
        width: 20%;
        z-index: 0;
        animation: looping-progresss-bar-ani 1500ms linear infinite;
        content: "";
        opacity: 1;
        position: absolute;
        height: 2px;
        top: 0;
        transition: opacity 500ms ease-in-out;
      }
    `
  }

  componentDidMount () {
    if (!this.state.sketchInitialed) {
      loadArcGISJSAPIModules([
        'esri/widgets/Sketch/SketchViewModel',
        'esri/layers/GraphicsLayer',
        'esri/rest/support/Query',
        'esri/symbols/support/jsonUtils',
        // When you first click to enable the interactive tools, like the rectangle, for a couple of seconds, there is no cursor on the map, and you cannot do anything - which looks like a bug.
        // To fix the above issue, we need to preload the following API modules for SketchViewModel.
        'esri/views/2d/interactive/editingTools',
        'esri/views/3d/interactive/editingTools',
        'esri/views/2d/layers/GraphicsLayerView2D',
        'esri/views/3d/layers/GraphicsLayerView3D'
      ]).then(modules => {
        [this.SketchViewModel, this.GraphicsLayer, this.Query, this.jsonUtils] = modules
        this.props.jimuMapView.view.when(() => {
          this.initialSketchTool()

          this.setState({
            sketchInitialed: true
          })
        })
      })
    }
  }

  componentDidUpdate (prevProps: Props, prevState: States) {
    if (prevState.sketchInitialed !== this.state.sketchInitialed && this.state.sketchInitialed) {
      // state.sketchInitialed changed from false to true
      this.initialSketchTool()

      if (this.state.isActive && this.currentActiveTool) {
        this.setActiveToolForSketchViewModel(this.currentActiveTool)
      }
      return
    }

    if (prevProps.jimuMapView && this.props.jimuMapView && (prevProps.jimuMapView.id !== this.props.jimuMapView.id) && this.state.sketchInitialed) {
      // active JimuMapView changed
      // need to destroy current this.sketchViewModel and recreate it, dont't change this.sketchViewModel.view, because we need to bind view keydown/keyup events before init sketchViewModel
      this.destroySketchViewModelAndReleaseHandles()
      this.initialSketchTool()

      if (this.state.isActive && this.currentActiveTool) {
        this.setActiveToolForSketchViewModel(this.currentActiveTool)
      }
      return
    }

    if (prevState.isActive !== this.state.isActive) {
      // active change
      this.initialSketchTool()

      if (this.state.isActive) {
        // change from inactive to active
        this.setActiveToolForSketchViewModel(this.currentActiveTool)
      } else {
        // change from active to inactive
        this.destroySketchViewModelAndReleaseHandles()
      }
    }

    this.tryUpdateActiveToolInfoWhenStateChange(prevState)

    this.tryUpdateActiveToolInfoWhenPropsChange(prevProps)
  }

  /**
   * Update props.activeToolName for the following cases:
   * case1: If select tool gets active from inactive, needs to set map.props.activeToolName to select tool by calling props.onActiveToolInfoChange().
   * case2: If select tool gets inactive from active, needs to set map.props.activeToolName to null by calling props.onActiveToolInfoChange().
   */
  tryUpdateActiveToolInfoWhenStateChange (prevState: States) {
    if (!prevState) {
      return
    }

    const prevSelectIsActiveTool = !!(prevState.isActive || prevState.isShowSelectTypePopup)
    const currentSelectIsActiveTool = !!(this.state.isActive || this.state.isShowSelectTypePopup)

    if (!prevSelectIsActiveTool && currentSelectIsActiveTool) {
      // select changes to active tool

      // Don't use props.onActiveToolInfoChange() to update props.activeToolInfo, we should use props._onIconClick() for compatibility.
      // Because props._onIconClick() will call this.onShowPanel() in base-tool.tsx, but props.onActiveToolInfoChange() doesn't.
      // this.props.onActiveToolInfoChange({
      //   activeToolName: this.props.toolName,
      //   activeToolTitle: this.props.toolName
      // })

      this.setCurrentToolAsActiveTool()
    } else if (prevSelectIsActiveTool && !currentSelectIsActiveTool) {
      // select changes to inactive tool
      this.setState({
        isActive: false,
        isShowSelectTypePopup: false
      })

      // Don't use props.onActiveToolInfoChange() to update props.activeToolInfo, we should use props._onIconClick() for compatibility.
      // Because props._onIconClick() will call this.onShowPanel() in base-tool.tsx, but props.onActiveToolInfoChange() doesn't.
      // this.props.onActiveToolInfoChange(null)

      this.setActiveToolToNull()
    }
  }

  /**
   * try to set state.isActive and state.isShowSelectTypePopup to false for the following cases:
   * case1: If select tool is originally active, but another map select tool gets active, then needs set state.isActive and state.isShowSelectTypePopup to false.
   * case2: If select tool is originally active, but another widget gets control of map, then needs set state.isActive and state.isShowSelectTypePopup to false.
   * @param prevProps
   */
  tryUpdateActiveToolInfoWhenPropsChange (prevProps: Props) {
    let shouldBeInactive = false

    const preActiveToolName = prevProps?.activeToolInfo?.activeToolName || ''
    const currentActiveToolName = this.props.activeToolInfo?.activeToolName || ''

    if (preActiveToolName !== currentActiveToolName) {
      // props.activeToolInfo.activeToolName changes
      const toolName = this.props.toolName
      const prevSelectIsActiveTool = preActiveToolName === toolName
      const currentSelectIsActiveTool = currentActiveToolName === toolName

      if (prevSelectIsActiveTool && !currentSelectIsActiveTool) {
        // select changes to inactive tool beacause another map tool gets active, e.g. map layers tool gets active
        shouldBeInactive = true
      }
    }

    // If we don't check this.props.autoControlWidgetId is empty or not, we will get the following wrong case
    // 1. Click measure tool, measure is the active tool and measure controls the map
    // 2. Then click select tool, select tool doesn't get active
    if (prevProps.autoControlWidgetId === this.id && this.props.autoControlWidgetId && this.props.autoControlWidgetId !== this.id) {
      // another widget gets control of map, select tool loses control of map
      shouldBeInactive = true
    }

    if (shouldBeInactive && (this.state.isActive || this.state.isShowSelectTypePopup)) {
      this.setState({
        isActive: false,
        isShowSelectTypePopup: false
      })
    }
  }

  componentWillUnmount () {
    this.destroySketchViewModelAndReleaseHandles()
    this.releaseShiftCtrlKeysEventListeners()
  }

  destroySketchViewModelAndReleaseHandles () {
    this.releaseViewHandles()

    if (this.sketchViewModel) {
      this.sketchViewModel.destroy()
      this.sketchViewModel = null
    }

    this.activeJimuMapView = null

    if (this.props.autoControlWidgetId === this.id) {
      // select tool releases the control of map
      const action = appActions.releaseAutoControlMapWidget(this.props.mapWidgetId)
      getAppStore().dispatch(action)
    }
  }

  releaseViewHandles () {
    if (this.activeJimuMapView) {
      this.activeJimuMapView.removeSelectByQueryProgressChangeListener(this.onJimuMapViewSelectProgressChange)
    }

    if (this.viewKeyDownHandle) {
      this.viewKeyDownHandle.remove()
      this.viewKeyDownHandle = null
    }

    if (this.viewKeyUpHandle) {
      this.viewKeyUpHandle.remove()
      this.viewKeyUpHandle = null
    }
  }

  toggleIsSelectActive = () => {
    this.setState({
      isActive: !this.state.isActive
    })
  }

  toggleSelectTypePopup = () => {
    this.setState({
      isShowSelectTypePopup: !this.state.isShowSelectTypePopup
    })
  }

  setCurrentToolAsActiveTool (): void {
    // Don't use props.onActiveToolInfoChange() to update props.activeToolInfo, we should use props._onIconClick() for compatibility.
    // Because props._onIconClick() will call this.onShowPanel() in base-tool.tsx, but props.onActiveToolInfoChange() doesn't.
    if (!this.isSelectIsActiveTool()) {
      this.props._onIconClick()
    }
  }

  setActiveToolToNull (): void {
    // Don't use props.onActiveToolInfoChange() to update props.activeToolInfo, we should use props._onIconClick() for compatibility.
    // Because props._onIconClick() will call this.onShowPanel() in base-tool.tsx, but props.onActiveToolInfoChange() doesn't.
    if (this.isSelectIsActiveTool()) {
      this.props._onIconClick()
    }
  }

  // this method is only used by setCurrentToolAsActiveTool and setActiveToolToNull
  isSelectIsActiveTool (): boolean {
    return this.props.toolName && this.props.toolName === this.props.activeToolInfo?.activeToolName
  }

  onClickLoadingProgress = () => {
    const jimuMapView = this.activeJimuMapView

    if (jimuMapView) {
      const updateSelection = true
      jimuMapView.cancelSelectByQuery(updateSelection)
    }
  }

  clearSelect = async () => {
    // Don't use this.activeJimuMapView here because this.activeJimuMapView is null if select tool is not pressed, see #18200 for more details.
    const jimuMapView = this.props.jimuMapView

    if (jimuMapView) {
      try {
        const updateSelection = false
        await jimuMapView.cancelSelectByQuery(updateSelection)
      } catch (e) {
        console.error(`jimuMapView.cancelSelectByQuery() error, jimuMapViewId: ${jimuMapView.id}`, e)
      }

      setTimeout(() => {
        jimuMapView.clearSelectedFeatures()
      }, 200)
    }
  }

  getSelectToolIcon = () => {
    if (this.state.currentSelectType === 'Point') {
      return SelectPointIcon
    } else if (this.state.currentSelectType === 'Rectangle') {
      return SelectRectangleIcon
    } else if (this.state.currentSelectType === 'Lasso') {
      return SelectLassoIcon
    } else if (this.state.currentSelectType === 'Circle') {
      return SelectCircleIcon
    } else if (this.state.currentSelectType === 'Line') {
      return SelectLineIcon
    } else {
      return SelectRectangleIcon
    }
  }

  getSelectIconTitle () {
    let topTitle: string = ''

    if (this.state.currentSelectType === 'Point') {
      topTitle = this.formatMessage('SelectionByPoint')
    } else if (this.state.currentSelectType === 'Rectangle') {
      topTitle = this.formatMessage('SelectionByRectangle')
    } else if (this.state.currentSelectType === 'Lasso') {
      topTitle = this.formatMessage('SelectionByLasso')
    } else if (this.state.currentSelectType === 'Circle') {
      topTitle = this.formatMessage('SelectionByCircle')
    } else if (this.state.currentSelectType === 'Line') {
      topTitle = this.formatMessage('SelectionByLine')
    } else {
      topTitle = this.formatMessage('SelectLabel')
    }

    const newSelection = this.formatMessage('newSelection')
    const addToCurrentSelection = this.formatMessage('addToCurrentSelection')
    const removeFromCurrentSelection = this.formatMessage('removeFromCurrentSelection')
    const selectFromCurrentSelection = this.formatMessage('selectFromCurrentSelection')
    const drawShape = this.formatMessage('drawShape')
    const draw = this.formatMessage('draw')
    const ctrlKey = this.isMac ? 'Cmd' : 'Ctrl'

    const newSelectionTip = `∙ ${newSelection} (${drawShape})`
    const addToCurrentSelectionTip = `∙ ${addToCurrentSelection} (Shift + ${draw})`
    const removeFromCurrentSelectionTip = `∙ ${removeFromCurrentSelection} (${ctrlKey} + ${draw})`
    const selectFromCurrentSelectionTip = `∙ ${selectFromCurrentSelection} (Shift + ${ctrlKey} + ${draw})`

    const finalTitle =
    `${topTitle}
${newSelectionTip}
${addToCurrentSelectionTip}
${removeFromCurrentSelectionTip}
${selectFromCurrentSelectionTip}
    `

    return finalTitle
  }

  formatMessage (strId: string) {
    return this.props.intl.formatMessage({ id: strId, defaultMessage: defaultMessages[strId] })
  }

  setCurrentSelectType = (currentSelectType: any) => {
    this.initialSketchTool()

    if (currentSelectType === 'Point') {
      this.setActiveToolForSketchViewModel('point')
      this.currentActiveTool = 'point'
    }

    if (currentSelectType === 'Rectangle') {
      this.setActiveToolForSketchViewModel('rectangle')
      this.currentActiveTool = 'rectangle'
    }

    if (currentSelectType === 'Lasso') {
      this.setActiveToolForSketchViewModel('polygon')
      this.currentActiveTool = 'polygon'
    }

    if (currentSelectType === 'Circle') {
      this.setActiveToolForSketchViewModel('circle')
      this.currentActiveTool = 'circle'
    }

    if (currentSelectType === 'Line') {
      this.setActiveToolForSketchViewModel('polyline')
      this.currentActiveTool = 'polyline'
    }

    this.setState({
      currentSelectType: currentSelectType,
      isShowSelectTypePopup: false,
      isActive: true
    })
  }

  onJimuMapViewSelectProgressChange = (progress) => {
    this.setState({
      selectProgress: progress
    })
  }

  useShiftKey (tolearnaceMs: number): boolean {
    return this.useKey(this.lastShiftKeyEventInfo, tolearnaceMs)
  }

  useCtrlKey (tolearnaceMs: number): boolean {
    return this.useKey(this.lastCtrlKeyEventInfo, tolearnaceMs)
  }

  useKey (lastKeyEventInfo: LastKeyEventInfo, tolearnaceMs: number): boolean {
    if (lastKeyEventInfo) {
      if (lastKeyEventInfo.isKeyDown) {
        // key is still down and not up, return true
        return true
      } else {
        // key is up, we use tolearnaceMs to deterine the return value
        const deltaTime = Date.now() - lastKeyEventInfo.eventDate.getTime()

        if (deltaTime <= tolearnaceMs) {
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

  bindShiftCtrlKeysEventListeners () {
    document.addEventListener('keydown', this.onKeyDown, true)
    document.addEventListener('keyup', this.onKeyUp, true)
  }

  releaseShiftCtrlKeysEventListeners () {
    document.removeEventListener('keydown', this.onKeyDown, true)
    document.removeEventListener('keyup', this.onKeyUp, true)
  }

  onKeyDown = (event) => {
    if (event.key === 'Shift') {
      this.lastShiftKeyEventInfo = {
        eventDate: new Date(),
        isKeyDown: true
      }
    } else if ((this.isMac && event.key === 'Meta') || (!this.isMac && event.key === 'Control')) {
      this.lastCtrlKeyEventInfo = {
        eventDate: new Date(),
        isKeyDown: true
      }
    }
  }

  onKeyUp = (event) => {
    if (event.key === 'Shift') {
      this.lastShiftKeyEventInfo = {
        eventDate: new Date(),
        isKeyDown: false
      }
    } else if ((this.isMac && event.key === 'Meta') || (!this.isMac && event.key === 'Control')) {
      this.lastCtrlKeyEventInfo = {
        eventDate: new Date(),
        isKeyDown: false
      }
    }
  }

  initialSketchTool () {
    if (!this.SketchViewModel) {
      return
    }

    if (!this.sketchViewModel) {
      this.releaseViewHandles()

      const jimuMapView = this.props.jimuMapView
      this.activeJimuMapView = jimuMapView
      this.activeJimuMapView.addSelectByQueryProgressChangeListener(this.onJimuMapViewSelectProgressChange)

      const view = jimuMapView.view

      this.viewKeyDownHandle = view.on('key-down', (event) => {
        if (event.key === 'Shift') {
          event.stopPropagation()
        }
      })

      this.viewKeyDownHandle = view.on('key-up', (event) => {
        if (event.key === 'Shift') {
          event.stopPropagation()
        }
      })

      this.sketchViewModel = new this.SketchViewModel({
        view: view,
        layer: new this.GraphicsLayer(),
        pointSymbol: this.jsonUtils.fromJSON(defaultPointSymbol) as any,
        polylineSymbol: this.jsonUtils.fromJSON(defaultPolylineSymbol) as any,
        polygonSymbol: this.jsonUtils.fromJSON(defaultPolygonSymbol) as any
      })

      this.sketchViewModel.on('create', (event) => {
        if (event.state === 'complete') {
          // keep continuous drawing for SketchViewModel
          this.setActiveToolForSketchViewModel(this.currentActiveTool)

          const jimuMapView = this.props.jimuMapView
          jimuMapView.view.closePopup()

          const graphic = event.graphic

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

          const useKeyToleranceMs = 500
          const isShiftKey = this.useShiftKey(useKeyToleranceMs)
          const isCtrlKey = this.useCtrlKey(useKeyToleranceMs)

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

          jimuMapView.selectFeaturesByGraphic(graphic, this.state.spatialRelationship, selectionMode)
        }
      })
    }
  }

  setActiveToolForSketchViewModel (activeTool: string) {
    if (this.sketchViewModel) {
      const createOptions = this.sketChCreateOptions[activeTool]

      if (createOptions) {
        this.sketchViewModel.create(activeTool as any, createOptions)
      } else {
        this.sketchViewModel.create(activeTool as any)
      }

      if (this.props.autoControlWidgetId !== this.id) {
        // select tool gets control of map
        const action = appActions.requestAutoControlMapWidget(this.props.mapWidgetId, this.id)
        getAppStore().dispatch(action)
      }
    }
  }

  onPopperToggle = (e: any) => {
    this.toggleSelectTypePopup()

    if (e) {
      if (e.type === 'keydown' && e.key === 'Escape') {
        focusElementInKeyboardMode(this.btnSelectTypeContainer)
      }
    }
  }

  handleKeyDown = (e: React.KeyboardEvent<any>, selectType: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      this.setCurrentSelectType(selectType)
    }
  }

  render () {
    const selectIconTitle = this.getSelectIconTitle()
    const clearSelectionTitle = this.props.intl.formatMessage({ id: 'clearSelection', defaultMessage: defaultMessages.clearSelection })
    const isSelecting = this.state.selectProgress > 0 && this.state.selectProgress < 1

    return (
      <div css={this.getCSSStyle()}>
        <div className='d-flex align-items-center justify-content-center select-tool-container' ref={ref => { this.btnContainer = ref }}>
          <div className='d-flex'>
            <div className='d-flex'>
              {
                !isSelecting &&
                <button
                  title={selectIconTitle}
                  aria-label={selectIconTitle}
                  onClick={this.toggleIsSelectActive}
                  className={classNames('esri-widget--button-like  border-0 select-tool-btn d-flex align-items-center justify-content-center',
                    { selected: this.state.isActive })}
                  disabled={!this.state.sketchInitialed}
                >
                  <Icon aria-hidden={true} width={16} height={16} icon={this.getSelectToolIcon()} />
                </button>
              }

              {
                isSelecting &&
                <SelectProgress
                  progress={this.state.selectProgress}
                  intl={this.props.intl}
                  theme={this.props.theme}
                  onClick={this.onClickLoadingProgress}
                />
              }

              <button
                aria-label={this.formatMessage('moreSelectionTools')}
                onClick={this.toggleSelectTypePopup} style={{ width: 18 }}
                className={classNames('esri-widget--button-like border-0 pl-1 pr-1 select-tool-btn d-flex align-items-center justify-content-center', { selected: this.state.isShowSelectTypePopup })}
                disabled={!this.state.sketchInitialed}
                ref={ref => { this.btnSelectTypeContainer = ref }}
              >
                <Icon aria-hidden={true} width={8} height={8} icon={IconArrowDown} />
              </button>
            </div>

            <button
              aria-label={clearSelectionTitle}
              title={clearSelectionTitle}
              className='select-tool-btn d-flex align-items-center justify-content-center select-tool-btn-hover esri-widget--button-like border-0'
              ref={ref => { this.selectResultContainer = ref }} onClick={this.clearSelect}
              disabled={!this.state.sketchInitialed}
            >
              <Icon width={16} height={16} icon={SelectClearIcon} />
            </button>
            <Popper className='map-tool-popper' css={this.getCSSStyle()} reference={this.btnContainer} open={this.state.isShowSelectTypePopup} placement='bottom-start' toggle={this.onPopperToggle}>
              <div className='p-4' style={{ display: 'flex', flexDirection: 'column' }}>
                <div className='content-title'>
                  {this.props.intl.formatMessage({ id: 'SelectionTool', defaultMessage: defaultMessages.SelectionTool })}
                </div>
                <div className='mt-2 mb-2'>
                  <div className='d-flex mb-2'>
                    <div
                      className={classNames('select-tool-type mr-2 d-flex flex-column align-items-center justify-content-center select-tool-btn-hover', {
                        'select-tool-type-choosed': this.state.currentSelectType === 'Rectangle'
                      })} onClick={() => { this.setCurrentSelectType('Rectangle') }} onKeyDown={e => { this.handleKeyDown(e, 'Rectangle') }} role='button' tabIndex={0}
                    >
                      <Icon width={16} height={16} icon={SelectRectangleIcon} />
                      <div
                        className='select-tool-type-text mt-1 w-100 text-truncate pl-1 pr-1 d-flex justify-content-center'
                        title={this.props.intl.formatMessage({ id: 'SelectionToolRectangle', defaultMessage: defaultMessages.SelectionToolRectangle })}
                      >
                        {this.props.intl.formatMessage({ id: 'SelectionToolRectangle', defaultMessage: defaultMessages.SelectionToolRectangle })}
                      </div>
                    </div>
                    <div
                      className={classNames('select-tool-type mr-2 d-flex flex-column align-items-center justify-content-center select-tool-btn-hover', {
                        'select-tool-type-choosed': this.state.currentSelectType === 'Lasso'
                      })} onClick={() => { this.setCurrentSelectType('Lasso') }} onKeyDown={e => { this.handleKeyDown(e, 'Lasso') }} role='button' tabIndex={0}
                    >
                      <Icon width={16} height={16} icon={SelectLassoIcon} />
                      <div
                        className='select-tool-type-text mt-1 w-100 text-truncate pl-1 pr-1 d-flex justify-content-center'
                        title={this.props.intl.formatMessage({ id: 'SelectionToolLasso', defaultMessage: defaultMessages.SelectionToolLasso })}
                      >
                        {this.props.intl.formatMessage({ id: 'SelectionToolLasso', defaultMessage: defaultMessages.SelectionToolLasso })}
                      </div>
                    </div>
                    <div
                      className={classNames('select-tool-type d-flex flex-column align-items-center justify-content-center select-tool-btn-hover', {
                        'select-tool-type-choosed': this.state.currentSelectType === 'Circle'
                      })} onClick={() => { this.setCurrentSelectType('Circle') }} onKeyDown={e => { this.handleKeyDown(e, 'Circle') }} role='button' tabIndex={0}
                    >
                      <Icon width={16} height={16} icon={SelectCircleIcon} />
                      <div
                        className='select-tool-type-text mt-1 w-100 text-truncate pl-1 pr-1 d-flex justify-content-center'
                        title={this.props.intl.formatMessage({ id: 'SelectionToolCircle', defaultMessage: defaultMessages.SelectionToolCircle })}
                      >
                        {this.props.intl.formatMessage({ id: 'SelectionToolCircle', defaultMessage: defaultMessages.SelectionToolCircle })}
                      </div>
                    </div>
                  </div>
                  <div className='d-flex'>
                    <div
                      className={classNames('select-tool-type mr-2 d-flex flex-column align-items-center justify-content-center select-tool-btn-hover', {
                        'select-tool-type-choosed': this.state.currentSelectType === 'Line'
                      })} onClick={() => { this.setCurrentSelectType('Line') }} onKeyDown={e => { this.handleKeyDown(e, 'Line') }} role='button' tabIndex={0}
                    >
                      <Icon width={16} height={16} icon={SelectLineIcon} />
                      <div
                        className='select-tool-type-text mt-1 w-100 text-truncate pl-1 pr-1 d-flex justify-content-center'
                        title={this.props.intl.formatMessage({ id: 'SelectionToolLine', defaultMessage: defaultMessages.SelectionToolLine })}
                      >
                        {this.props.intl.formatMessage({ id: 'SelectionToolLine', defaultMessage: defaultMessages.SelectionToolLine })}
                      </div>
                    </div>
                    <div
                      className={classNames('select-tool-type d-flex flex-column align-items-center justify-content-center select-tool-btn-hover', {
                        'select-tool-type-choosed': this.state.currentSelectType === 'Point'
                      })} onClick={() => { this.setCurrentSelectType('Point') }} onKeyDown={e => { this.handleKeyDown(e, 'Point') }} role='button' tabIndex={0}
                    >
                      <Icon width={16} height={16} icon={SelectPointIcon} />
                      <div
                        className='select-tool-type-text mt-1 w-100 text-truncate pl-1 pr-1 d-flex justify-content-center'
                        title={this.props.intl.formatMessage({ id: 'SelectionToolPoint', defaultMessage: defaultMessages.SelectionToolPoint })}
                      >
                        {this.props.intl.formatMessage({ id: 'SelectionToolPoint', defaultMessage: defaultMessages.SelectionToolPoint })}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='content-title'>
                  {this.props.intl.formatMessage({ id: 'SelectionMode', defaultMessage: defaultMessages.SelectionMode })}
                </div>
                <div>
                  <div className='d-flex align-items-center mt-2'>
                    <Radio
                      style={{ cursor: 'pointer' }} checked={this.state.spatialRelationship === 'intersects'}
                      onChange={() => { this.setState({ spatialRelationship: 'intersects' }) }}
                    />
                    <label className='m-0 ml-2 content-title' style={{ cursor: 'pointer' }} onClick={() => { this.setState({ spatialRelationship: 'intersects' }) }}>
                      {this.props.intl.formatMessage({ id: 'SelectionWithin', defaultMessage: defaultMessages.SelectionWithin })}
                    </label>
                  </div>
                  <div className='d-flex align-items-center mt-2'>
                    <Radio
                      style={{ cursor: 'pointer' }} checked={this.state.spatialRelationship === 'contains'}
                      onChange={() => { this.setState({ spatialRelationship: 'contains' }) }}
                    />
                    <label className='m-0 ml-2 content-title' style={{ cursor: 'pointer' }} onClick={() => { this.setState({ spatialRelationship: 'contains' }) }}>
                      {this.props.intl.formatMessage({ id: 'SelectionContain', defaultMessage: defaultMessages.SelectionContain })}
                    </label>
                  </div>
                </div>
              </div>
            </Popper>
          </div>
        </div>
      {(!this.state.sketchInitialed) && <div className='select-tool-loader' />}
      </div>
    )
  }
}
