/** @jsx jsx */
import { React, type AllWidgetProps, jsx } from 'jimu-core'
import type { IMConfig } from '../config'
import defaultMessages from './translations/default'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import DsFilter from './ds-filter'
import FloorFilter from 'esri/widgets/FloorFilter'
import './style.css'
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils.js'
import { createTask } from '@arcgis/core/core/asyncUtils.js'
// @ts-expect-error
import { throwIfAborted } from '@arcgis/core/core/promiseUtils.js' // not public
import { WidgetPlaceholder } from 'jimu-ui'
import widgetFloorFilterOutlined from 'jimu-icons/svg/outlined/brand/widget-floor-filter.svg'

interface State {
  hadMap: boolean
  jimuMapView: JimuMapView
  wasMounted: boolean
}

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, State> {
  coreWidget: FloorFilter
  coreContainer: HTMLElement
  dsFilter: DsFilter
  vwOriginalFloors: __esri.Collection<string>
  vwHeightHandle: any
  vwWidthHandle: any
  gdbVersionHandle: any

  constructor (props: any) {
    super(props)
    this.dsFilter = new DsFilter()
    this.state = {
      hadMap: false,
      jimuMapView: null,
      wasMounted: false
    }
  }

  clearHandles = (handles): void => {
    if (Array.isArray(handles)) {
      handles.forEach((h) => {
        try {
          if (h) h.remove()
        } catch (ex) {
          console.error(ex)
        }
      })
    }
  }

  componentDidMount () {
    this.setState({
      wasMounted: true
    })
  }

  componentDidUpdate (prevProps: AllWidgetProps<IMConfig>, prevState: State): void {
    const state: State = this.state
    const props: AllWidgetProps<IMConfig> = this.props
    if (state.wasMounted && !prevState.wasMounted) {
      this.loadCoreWidget()
    } else if (state.jimuMapView !== prevState.jimuMapView) {
      if (state.wasMounted) this.loadCoreWidget()
    } else if (props.config.filterDataSources !== prevProps.config.filterDataSources) {
      if (state.wasMounted) this.loadCoreWidget()
    } else if (props.config.filterByActiveFloorOnly !== prevProps.config.filterByActiveFloorOnly) {
      if (state.wasMounted) this.loadCoreWidget()
    } else if (props.config.autoSetOnFeatureSelection !== prevProps.config.autoSetOnFeatureSelection) {
      if (state.wasMounted) this.loadCoreWidget()
    } else if (props.config.zoomOnAutoSet !== prevProps.config.zoomOnAutoSet) {
      if (state.wasMounted) this.loadCoreWidget()
    } else if (props.config.longNames !== prevProps.config.longNames) {
      if (this.coreWidget) {
        this.coreWidget.longNames = !!props.config.longNames
      }
    } else if (props.config.position !== prevProps.config.position) {
      if (this.coreWidget) {
        this.coreWidget.scheduleRender()
      }
    }
  }

  componentWillUnmount (): void {
    this.destroyCoreWidget()
  }

  destroyCoreWidget () {
    this.dsFilter.clear()
    if (this.coreWidget) {
      const view = this.coreWidget.view
      this.coreWidget.destroy()
      this.coreWidget = null
      if (view) {
        view.floors = this.vwOriginalFloors || null
      }
    }
    if (this.vwHeightHandle) {
      this.clearHandles([this.vwHeightHandle])
      this.vwHeightHandle = null
    }
    if (this.vwWidthHandle) {
      this.clearHandles([this.vwWidthHandle])
      this.vwWidthHandle = null
    }
    if (this.gdbVersionHandle) {
      this.clearHandles([this.gdbVersionHandle])
      this.gdbVersionHandle = null
    }
  }

  fixBreakpoints (type: string) {
    // the core widget is expecting to be within the view.ui,
    // it's watching the view size to determine if it can be expanded (longNames),
    // we need to work around that

    // ExB html element class names: size-mode-LARGE size-mode-MEDIUM size-mode-SMALL
    // view beakpoint sizes: xsmall small medium large xlarge

    setTimeout(() => {
      const vm: any = this.coreWidget?.viewModel
      let size = 'large'
      try {
        if (document.documentElement.classList.contains('size-mode-MEDIUM')) {
          size = 'medium'
        } else if (document.documentElement.classList.contains('size-mode-SMALL')) {
          size = 'xsmall'
        }
      } catch (ex) {
        console.error(ex)
      }
      if (vm && (type === 'both' || type === 'widthBreakpoint')) {
        vm._viewWidthBreakpoint = size
      }
      if (vm && (type === 'both' || type === 'heightBreakpoint')) {
        vm._viewHeightBreakpoint = size
      }
    }, 100)
  }

  handleActiveViewChange = (jimuMapView: JimuMapView): void => {
    this.setState({
      hadMap: !!(this.state.hadMap || jimuMapView?.view?.map),
      jimuMapView: jimuMapView
    })
  }

  hasFloorInfo = (): boolean => {
    return !!((this.state.jimuMapView?.view?.map as any)?.floorInfo)
  }

  hasMap = (): boolean => {
    return !!(this.state.jimuMapView?.view?.map)
  }

  loadCoreWidget () {
    if (this.coreContainer) {
      const hasFloorInfo = this.hasFloorInfo()
      if (hasFloorInfo) {
        this.destroyCoreWidget()
        const coreNode = document.createElement('div')
        //coreNode.setAttribute('class', 'w-100 h-100')
        this.coreContainer.appendChild(coreNode)
        const longNames = !!this.props.config.longNames
        const view = this.state.jimuMapView.view
        this.coreWidget = new FloorFilter({
          container: coreNode,
          longNames: longNames,
          view: view
        })

        // wait for the floor filter to load level data before initializing the data source filter
        let initDS = true
        const ffHandle = reactiveUtils.watch(
          // @ts-expect-error
          () => this.coreWidget.viewModel.filterFeatures,
          () => {
            if (initDS) {
              initDS = false
              this.dsFilter.init(this.state.jimuMapView, this, this.coreWidget)

              // @ts-expect-error
              const levelLayer = this.coreWidget?.viewModel?.filterLayers?.levelLayer
              if (levelLayer) {
                this.gdbVersionHandle = reactiveUtils.watch(() => levelLayer.gdbVersion, (v): any => {
                  // refresh floor filter data if the underlying branch version changes
                  this.refreshFloorFilterData(view,true)
                })
              }
            }
            ffHandle.remove()
          }
        )

        // the core widget is expecting to be part of the view-ui,
        // we need to override this function
        // @ts-expect-error
        this.coreWidget._getComponentPosition = () => {
          return this.props.config.position || 'top-left'
        }

        this.vwOriginalFloors = (view.floors && view.floors.clone())
        this.fixBreakpoints('both')
        this.vwWidthHandle = reactiveUtils.watch(
          () => view.widthBreakpoint,
          () => {
            this.fixBreakpoints('widthBreakpoint')
          }
        )
        this.vwHeightHandle = reactiveUtils.watch(
          () => view.heightBreakpoint,
          () => {
            this.fixBreakpoints('heightBreakpoint')
          }
        )
      } else {
        this.destroyCoreWidget()
      }
    }
  }

  nls = (id: string, values?: any): string => {
    if (this.props.intl) {
      return this.props.intl.formatMessage({
        id: id,
        defaultMessage: defaultMessages[id]
      }, values)
    }
    return id
  }

  refreshFloorFilterData(view?: __esri.MapView | __esri.SceneView, maintainLevel?: boolean) {
    if (!view) view = this.state.jimuMapView.view
    const map = view?.map
    const wgt = this.coreWidget
    const vm: any = wgt?.viewModel
    if (vm && map) {
      if (vm._updateFloorFilterTask != null) {
        vm._updateFloorFilterTask.abort()
        vm._updateFloorFilterTask = null
      }
      vm._updateFloorFilterTask = createTask(async (signal) => {
        await vm._updateFloorFilterFromMap(map)
        throwIfAborted(signal)
        if (!vm.original_isOverridden) vm.original_isOverridden = vm._isOverridden
        try {
          const level = wgt.level
          vm.filterFeatures = null
          vm._isOverridden = (name) => {
            if (name === "filterFeatures") return false
            if (name === "filterLayers" && !!maintainLevel) return false
            return vm.original_isOverridden(name)
          }
          const currentMenu = vm.filterMenuType
          const currentMenuOpen = vm.filterMenuOpen
          await vm._setInitialViewState(map)
          vm._isOverridden = vm.original_isOverridden

          if (level) {
            let found = false
            const list = vm.filterFeatures?.levels?.levelsInfo
            if (Array.isArray(list)) {
              found = list.some(o => {
                if (o.id === level) {
                  wgt.level = level
                  return true
                }
                return false
              })
            }
            if (!found) {
              wgt.site = null
              wgt.facility = null
              wgt.level = null
            }
          }
          vm.filterMenuType = currentMenu
          vm.filterMenuOpen = currentMenuOpen
        } finally {
          vm._isOverridden = vm.original_isOverridden
        }
      })
      return vm._updateFloorFilterTask.promise
    } else {
      return Promise.resolve()
    }
  }

  render (): any {
    const lbl = this.props.config.displayLabel ? this.props.label : null
    const hasMap = this.hasMap()
    const hasFloorInfo = this.hasFloorInfo()
    const showWidgetPlaceholder = !hasFloorInfo

    let msg: string
    const msgClass = 'widget-floorfilter-msg'
    if (!hasMap) {
      msg = this.nls('floorfilter_noMap')
    } else if (!hasFloorInfo) {
      msg = this.nls('floorfilter_notFloorAware')
    }

    let className = 'jimu-widget widget-floorfilter'
    if (msg) className += ' widget-floorfilter-nomap'

    return (
      <div className={className}>
        {!showWidgetPlaceholder &&
          <React.Fragment>
            <h4 className='widget-floorfilter-header' style={{ display: lbl ? 'block' : 'none' }}>
              {lbl}
            </h4>
            <div className={msgClass} style={{ display: msg ? 'block' : 'none' }}>
              <span className='esri-icon esri-icon-urban-model'></span>
              <span style={{ margin: '0 8px' }}>{msg}</span>
            </div>
            <div className='widget-floorfilter-container'
              ref={ref => { this.coreContainer = ref }}>
            </div>
          </React.Fragment>
        }
        <JimuMapViewComponent
          useMapWidgetId={this.props.useMapWidgetIds?.[0]}
          onActiveViewChange={this.handleActiveViewChange}
        />
        {showWidgetPlaceholder && this.renderWidgetPlaceholder()}
      </div>
    )
  }

  renderWidgetPlaceholder (): React.ReactElement {
    const hasMap = this.hasMap()
    const hasFloorInfo = this.hasFloorInfo()
    const name = this.nls('_widgetLabel')
    let msg: string = undefined
    if (!hasMap) {
      // @todo this string needs to be added to runtime/translations/default.ts
      // msg = this.nls('floorfilter_selectMap') // 'Select a floor aware map'
    } else if (!hasFloorInfo) {
      msg = this.nls('floorfilter_notFloorAware')
    }
    return (
      <WidgetPlaceholder
        direction='vertical'
        iconSize='small'
        icon={widgetFloorFilterOutlined}
        aria-label={name}
        name={name}
        message={msg}
      />
    )
  }
}
