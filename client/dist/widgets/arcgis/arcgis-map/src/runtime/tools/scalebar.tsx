import { React, css, getAppStore, loadArcGISJSAPIModule, lodash, i18n } from 'jimu-core'
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool'
import type { IntlShape } from 'react-intl'
import type { JimuMapView } from 'jimu-arcgis'
import type { ToolShellProps } from '../layout/base/base-tool-shell'
import type { IMScalebarOptions, ScalebarUnit, ScalebarStyle } from '../../config'

const style = css`
/* scalebar should use static colors */
--calcite-color-foreground-1: white; /* used as --color-ruler-foreground */
--calcite-color-inverse: #363636; /* used as --color-ruler-background */
--calcite-color-text-1: black;
--calcite-font-size-sm: 12px;
--calcite-spacing-xs: 6px;
font-size: 12px;

.number-label {
  background-color: color-mix(in srgb,var(--calcite-color-foreground-1) 50%, transparent);
  color: var(--calcite-color-text-1);
  padding: 0 7px;
  font-weight: 600;
}
`

export default class ScaleBar extends BaseTool<BaseToolProps, unknown> {
  toolName = 'ScaleBar'

  getTitle () {
    return 'ScaleBar'
  }

  getIcon (): IconType {
    return null
  }

  getExpandPanel (): React.JSX.Element {
    const scalebarOptions = this.props.selfToolOptions as IMScalebarOptions
    return (
      <ScaleBarInner
        jimuMapView={this.props.jimuMapView}
        mapComponentsLoaded={this.props.mapComponentsLoaded}
        scalebarOptions={scalebarOptions}
      />
    )
  }

  /**
   * ScaleBar only supports map view, so ScaleBarTool.isAvailable() will return false if the map is scene view.
   */
  static isAvailable (toolShellProps: ToolShellProps): boolean {
    return toolShellProps.jimuMapView?.view?.type === '2d'
  }
}

interface ScaleBarInnerProps {
  jimuMapView: JimuMapView
  mapComponentsLoaded: boolean
  scalebarOptions: IMScalebarOptions
}

interface ScalebarInnerState {
  reactiveUtilsLoaded: boolean
  displayScale: string
}

class ScaleBarInner extends React.PureComponent<ScaleBarInnerProps, ScalebarInnerState> {
  scaleBarElement: HTMLArcgisScaleBarElement & { view: __esri.View }
  container: HTMLElement
  reactiveUtils: typeof __esri.reactiveUtils
  scaleHandle: __esri.Handle
  intl: IntlShape
  prevProps: ScaleBarInnerProps

  constructor (props) {
    super(props)
    this.state = {
      reactiveUtilsLoaded: false,
      displayScale: ''
    }

    this.intl = i18n.getIntl()

    this.debounceUpdateScale = lodash.debounce((view: __esri.MapView | __esri.SceneView) => {
      let displayScale: string = ''

      const scale = view?.scale

      if (typeof scale === 'number' && scale > 0 && this.intl) {
        const [thousandSeparator, decimalPlace] = this.getThousandSeparatorAndDecimalPlace(this.props)
        const str = this.intl.formatNumber(scale, {
          useGrouping: thousandSeparator,
          minimumFractionDigits: decimalPlace,
          maximumFractionDigits: decimalPlace
        })

        if (str) {
          displayScale = `1: ${str}`
        }
      }

      this.setState(() => {
        return {
          displayScale
        }
      })
    }, 500)
  }

  debounceUpdateScale = (view: __esri.MapView | __esri.SceneView): void => null

  onRef(ref) {
    // ref is set to null when switch active view, then set to original dom, we need to avoid this special case
    if (!ref) {
      return
    }

    if (ref !== this.container) {
      this.container = ref
      this.tryUpdateScaleBarElement()
    }
  }

  componentDidMount(): void {
    this.loadReactiveUtils()
  }

  async loadReactiveUtils () {
    this.reactiveUtils = await loadArcGISJSAPIModule('esri/core/reactiveUtils') as typeof __esri.reactiveUtils

    if (this.reactiveUtils) {
      this.setState({
        reactiveUtilsLoaded: true
      })
    }
  }

  componentDidUpdate (prevProps: ScaleBarInnerProps) {
    this.prevProps = prevProps
    this.tryUpdateScaleBarElement()
  }

  tryUpdateScaleBarElement() {
    // ref is set to null when switch active view, then set to original dom, we need to avoid this special case
    if (!this.container) {
      return
    }

    const preView = this.prevProps?.jimuMapView?.view || null
    const jimuMapView = this.props.jimuMapView
    const currView = jimuMapView?.view || null
    const scalebarStyle = this.getScalebarStyle() || 'line'

    if (currView !== preView) {
      this.releaseScaleHandle()
    }

    if (scalebarStyle === 'number') {
      if (this.scaleBarElement) {
        this.destroyScaleBarElement()
      }

      // watch scale
      if (!this.scaleHandle && currView && this.state.reactiveUtilsLoaded && this.reactiveUtils) {
        this.releaseScaleHandle()

        this.scaleHandle = this.reactiveUtils.watch(() => currView?.scale, () => {
          this.debounceUpdateScale(currView)
        })

        this.debounceUpdateScale(currView)
      }

      const preScalebarStyle = this.prevProps?.scalebarOptions?.style
      const [thousandSeparator, decimalPlace] = this.getThousandSeparatorAndDecimalPlace(this.props)
      const [preThousandSeparator, preDecimalPlace] = this.getThousandSeparatorAndDecimalPlace(this.prevProps)

      if (scalebarStyle !== preScalebarStyle || currView !== preView || thousandSeparator !== preThousandSeparator || decimalPlace !== preDecimalPlace) {
        this.debounceUpdateScale(currView)
      }
    } else {
      this.releaseScaleHandle()

      const scaleBarUnit = this.getScalebarUnit() || 'metric'

      // destroy current scaleBarElement when view, container, style or unit changed
      if (this.scaleBarElement) {
        if (this.scaleBarElement.view !== currView ||
           this.scaleBarElement.parentNode !== this.container ||
           this.scaleBarElement.barStyle !== scalebarStyle ||
           this.scaleBarElement.unit !== scaleBarUnit
        ) {
          this.destroyScaleBarElement()
        }
      }

      if (!this.scaleBarElement && this.props.mapComponentsLoaded && this.container && currView && currView.type === '2d') {
        this.scaleBarElement = document.createElement('arcgis-scale-bar') as HTMLArcgisScaleBarElement & { view: __esri.MapView }
        this.scaleBarElement.view = currView
        this.scaleBarElement.barStyle = scalebarStyle
        this.scaleBarElement.unit = scaleBarUnit
        this.container.appendChild(this.scaleBarElement)

        jimuMapView.deleteJimuMapTool('ScaleBar')
        jimuMapView.addJimuMapTool({
          name: 'ScaleBar',
          instance: this.scaleBarElement
        })
      }
    }
  }

  getScalebarStyle(): ScalebarStyle {
    let result: ScalebarStyle = null

    const scalebarOptions = this.props.scalebarOptions

    if (scalebarOptions) {
      result = scalebarOptions.style
    } else {
      result = 'line'
    }

    // make sure result is a valid style
    if (result !== 'line' && result !== 'ruler' && result !== 'number') {
      result = 'line'
    }

    return result
  }

  getScalebarUnit(): ScalebarUnit {
    let result: ScalebarUnit = null

    const scalebarOptions = this.props.scalebarOptions

    if (scalebarOptions) {
      // Customize
      result = scalebarOptions.unit
    } else {
      // Automatic
      result = this.getScalebarUnitByPortal()
    }

    // make sure result is a valid unit
    if (result !== 'metric' && result !== 'imperial' && result !== 'dual') {
      result = 'metric'
    }

    return result
  }

  getScalebarUnitByPortal(): ScalebarUnit {
    let portalUnit = ''

    const appState = getAppStore().getState()

    if (appState) {
      if (appState.user && appState.user.units) {
        portalUnit = appState.user.units
      } else if (appState.portalSelf && appState.portalSelf.units) {
        portalUnit = appState.portalSelf.units
      }
    }

    let scaleBarUnit: ScalebarUnit = null

    // metric => metric
    // english => imperial
    // '' => dual
    if (portalUnit === 'metric') {
      scaleBarUnit = 'metric'
    } else if (portalUnit === 'english') {
      scaleBarUnit = 'imperial'
    } else {
      scaleBarUnit = 'dual'
    }

    return scaleBarUnit
  }

  getThousandSeparatorAndDecimalPlace (props?: ScaleBarInnerProps): [boolean, number] {
    const scalebarOptions = props?.scalebarOptions
    const thousandSeparator = scalebarOptions?.thousandSeparator || false
    let decimalPlace = scalebarOptions?.decimalPlace || 0

    if (!(decimalPlace >= 0)) {
      decimalPlace = 0
    }

    return [thousandSeparator, decimalPlace]
  }

  destroyScaleBarElement() {
    if (this.scaleBarElement) {
      this.scaleBarElement.destroy()
      this.scaleBarElement = null
      const jimuMapView = this.props.jimuMapView

      if (jimuMapView) {
        jimuMapView.deleteJimuMapTool('ScaleBar')
      }
    }
  }

  releaseScaleHandle() {
    if (this.scaleHandle) {
      this.scaleHandle.remove()
      this.scaleHandle = null
    }
  }

  componentWillUnmount () {
    this.destroyScaleBarElement()
    this.releaseScaleHandle()
  }

  render () {
    const showScaleNumber = this.props.scalebarOptions?.style === 'number' && this.state.displayScale

    return (
      <div className='scalebar-map-tool' ref={ref => { this.onRef(ref) }} css={style}>
        {
          showScaleNumber && <span className='number-label'>{this.state.displayScale}</span>
        }
      </div>
    )
  }
}
