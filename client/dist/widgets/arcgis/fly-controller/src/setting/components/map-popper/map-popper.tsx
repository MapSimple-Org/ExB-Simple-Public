// 0. jimuMap
// 1. container for draw panel
// 2. ConfirmWindow for popup

/** @jsx jsx */
import {
  type UseDataSource, React, jsx, type ImmutableArray, APP_FRAME_NAME_IN_BUILDER, Immutable,
  type IMThemeVariables, css, polished, getAppStore, type IntlShape, type SerializedStyles
} from 'jimu-core'
import { Button, TextInput, FloatingPanel, PanelHeader } from 'jimu-ui'
import { type JimuMapView, loadArcGISJSAPIModules, type JimuMapViewGroup } from 'jimu-arcgis'
import { JimuMap } from 'jimu-ui/advanced/map'
import type { IMConfig } from '../../../config'
import { PageMode, type NewFeatureMode } from '../../setting'
import ActionPanel from './action-panel'
import nls from '../../translations/default'
// fly
import type { FlyIds } from '../../../common/fly-facade/fly-manager'
import * as utils from '../../../common/utils/utils'
import type { GraphicsInfo, Record, RecordConfig, RouteConfig } from '../../../common/constraints'
// graphics
import type GraphicInteractionManager from '../../../common/components/graphic-interaction-manager'
// resources
import closeIconOutlined from 'jimu-icons/svg/outlined/editor/close.svg'

interface Props {
  specifiedJimuMapId: string
  theme: IMThemeVariables
  intl: IntlShape
  useMapWidgetIds: ImmutableArray<string>
  useDataSources?: ImmutableArray<UseDataSource>
  jimuMapView: JimuMapView
  // loading
  onRefGraphicInteractionManager: (ref: GraphicInteractionManager) => void
  isTerrainLoaded: boolean

  config?: IMConfig
  activedRouteConfig: RouteConfig

  isShowMapPopper?: boolean
  pageMode: PageMode
  onShowMapPopperChange: (isShow: boolean, mode?: PageMode) => void

  newFeatureMode: NewFeatureMode
  onNewFeatureModeChange: (mode: NewFeatureMode) => void

  onMapPopperJimuMapViewUpdate: (jimuMapView: JimuMapView) => void
  onMapPopperViewGroupUpdate: (viewGroup: JimuMapViewGroup) => void

  onRecordAdd: (record: RecordConfig) => void
  onRecordAddAndEdit: (record: RecordConfig) => Promise<boolean>

  buildTemporaryRecordConfig: (graphicsInfo: GraphicsInfo, cameraInfo: __esri.Camera, jimuMapView: JimuMapView) => RecordConfig
  buildDefaultRecord: (recordConfig: RecordConfig, graphicsInfoRef: GraphicsInfo) => Promise<Record>
  getPopperJimuMapId: () => string

  playingInfo: FlyIds
  isPreviewRouteBtnPlaying: boolean

  onRemoveGraphics: (graphics: __esri.Graphic[]) => void

  stopFly: () => void
}

interface States {
  jimuMapView: JimuMapView
  jimuMapViews: { [id: string]: JimuMapView }
  apiLoaded: boolean
  mapSize: SizeObj
  is3DView: boolean
  isTerrainLoaded: boolean
  // mapRatio: number;
  // confirm window
  isShowConfirmWin: boolean
  isConfirmBtnsDisabled: boolean
}

interface SizeObj {
  width: number
  height: number
}

export class MapPopper extends React.PureComponent<Props, States> {
  Graphic: typeof __esri.Graphic = null
  GraphicsLayer: typeof __esri.GraphicsLayer = null
  graphicInteractionManagerRef: GraphicInteractionManager

  tmpRecordForConfirm: Record// for ConfirmWindow temporary save

  constructor (props) {
    super(props)

    this.state = {
      jimuMapView: null,
      jimuMapViews: null,
      apiLoaded: false,
      is3DView: false,
      isTerrainLoaded: false,
      // viewGroup: undefined,
      mapSize: this.getDefaultSize().innerSize,
      // mapRatio: 1,//this.getMapRatio(),
      // confirm window
      isShowConfirmWin: false,
      isConfirmBtnsDisabled: false
    }
  }

  // componentDidUpdate(prevProps: Props, prevState: States): void {
  // }

  componentDidMount (): void {
    if (!this.state.apiLoaded) {
      loadArcGISJSAPIModules([
        'esri/Graphic'
      ]).then(modules => {
        [this.Graphic] = modules
        this.setState({ apiLoaded: true })
      })
    }
  }

  componentWillUnmount (): void {
    // update follow API 10.2: must unmount sketch before unmont map ,#10323
    this.graphicInteractionManagerRef?.drawHelperRef?.jimuDrawToolsRef?.completeOperation()
    this.graphicInteractionManagerRef?.drawHelperRef?.jimuDrawToolsRef?.sketch?.destroy()
  }

  getPoperStyle = (theme: IMThemeVariables): SerializedStyles => {
    return css`
        .popper-content {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;

          .popper-header {
            width: 100%;
            flex-shrink: 0;
            flex-grow: 0;
            cursor: move;
          }
          .map-container {
            width: 800px;
            height: 800px;
            background-color: gray;
            display: contents;
          }
          .popper-footer {
            display: flex;
            background:${theme.ref.palette.neutral[400]};
            color:${theme.ref.palette.neutral[1000]};
            padding: ${polished.rem(10)} ${polished.rem(20)};

            .left-tool {
              min-height: 32px;
            }
          }
        }
    `
  }

  handleClickClose = (): void => {
    this.props.onShowMapPopperChange(false, PageMode.Common)
  }

  // resizeRatio = (size) => {
  //   const maxElem = this.querySelector('body');
  //   const maxClientRect = maxElem.getBoundingClientRect();
  //   const { mapRatio } = this.state;
  //   let { width } = size;
  //   if (width > 1080) width = 1080;
  //   let height = width / mapRatio + 111;
  //   if (height > maxClientRect.height) {
  //     height = maxClientRect.height;
  //     width = (maxClientRect.height - 111) * mapRatio;
  //   }
  //   this.setState({ mapSize: { width, height } });
  // }
  querySelector (selector: string): HTMLElement {
    const appFrame: HTMLIFrameElement = document.querySelector(`iframe[name="${APP_FRAME_NAME_IN_BUILDER}"]`)
    if (utils.isDefined(appFrame)) {
      const appFrameDoc = appFrame.contentDocument ?? appFrame.contentWindow.document
      return appFrameDoc.querySelector(selector)
    }
    return null
  }

  getDefaultSize = (): any => {
    const layoutElem = this.querySelector(`div.widget-renderer[data-widgetid="${this.props.useMapWidgetIds[0]}"]`)
    const maxHeight = utils.isDefined(document.querySelector('#default')) ? document.querySelector('#default').clientHeight - 20 : 1080
    let innerSize: SizeObj = { width: 770, height: 850 }
    let innerMapSize: SizeObj = { width: 770, height: 770 }
    if (utils.isDefined(layoutElem)) {
      const clientRect = layoutElem.getBoundingClientRect()
      let ratio = (clientRect.width / clientRect.height)
      ratio = ratio > 0 ? ratio : 1 // for lint: || 1
      let defaultExpandWidth = clientRect.width * 1.1
      let defaultExpandHeight = clientRect.height * 1.1 + 111
      let defaultMapWidth = clientRect.width * 1.1
      let defaultMapHeight = clientRect.height * 1.1
      // width
      if (defaultExpandWidth < 770) {
        defaultExpandWidth = 770
        defaultExpandHeight = 770 / ratio + 111
        defaultMapWidth = 770
        defaultMapHeight = 770 / ratio
      } else if (defaultExpandWidth > 1080) {
        defaultExpandWidth = 1080
        defaultExpandHeight = 1080 / ratio + 111
        defaultMapWidth = 1080
        defaultMapHeight = 1080 / ratio
      }
      // height
      if (defaultExpandHeight > maxHeight) {
        defaultExpandHeight = maxHeight
        defaultExpandWidth = (maxHeight - 111) * ratio > 770 ? (maxHeight - 111) * ratio : 770
      }
      if (defaultMapHeight > (maxHeight - 111)) {
        defaultMapHeight = maxHeight - 111
        defaultMapWidth = (maxHeight - 111) * ratio
      }
      innerSize = {
        width: defaultExpandWidth,
        height: defaultExpandHeight
      }
      innerMapSize = {
        width: defaultMapWidth - 2,
        height: defaultMapHeight
      }
    }
    return { innerSize, innerMapSize }
  }

  getWidgetPosition = (): any => {
    const isRTL = getAppStore().getState().appStateInBuilder.appContext.isRTL
    let pos = { x: 500, y: 50 }
    const { innerSize } = this.getDefaultSize()
    const width = isRTL
      ? 260
      : document.body.clientWidth - innerSize.width - 260
    pos = { x: width, y: 50 }
    return pos
  }

  handleActiveViewChange = (jimuMapView: JimuMapView): void => {
    this.props.onMapPopperJimuMapViewUpdate(jimuMapView)

    if (jimuMapView !== this.state.jimuMapView) {
      if (jimuMapView.view?.type === '3d') {
        this.setState({ is3DView: true })
      } else {
        this.setState({ is3DView: false })
      }
    }

    this.setState({ jimuMapView: jimuMapView })
  }

  handleViewGroupCreate = (viewGroup: JimuMapViewGroup): void => {
    this.props.onMapPopperViewGroupUpdate(viewGroup)
  }

  handleRefGraphicInteractionManager = (ref: GraphicInteractionManager): void => {
    this.graphicInteractionManagerRef = ref
    this.props.onRefGraphicInteractionManager(ref)
  }

  render (): React.ReactElement {
    const { mapSize } = this.state
    const { activedRouteConfig, theme, isShowMapPopper } = this.props

    const useMapWidget = utils.isDefined(this.props.useMapWidgetIds) && this.props.useMapWidgetIds[0]
    const config = getAppStore().getState().appStateInBuilder.appConfig
    // const isRTL = getAppStore().getState().appStateInBuilder.appContext.isRTL;
    if (!utils.isDefined(config.widgets[useMapWidget])) {
      return null
    }

    const useDataSource = config.widgets[useMapWidget].useDataSources
    const toolConfig = {
      canZoom: true,
      canHome: true,
      // canSearch: true,
      canCompass: true,
      canLayers: true
    }
    let jimuMapConfig
    if (utils.isDefined(this.props.jimuMapView?.dataSourceId)) {
      const initialMapDataSourceID = this.props.jimuMapView?.dataSourceId
      jimuMapConfig = Immutable({} as any).set('initialMapDataSourceID', initialMapDataSourceID).set('toolConfig', toolConfig)
    }

    const panelHeader = css`.panel-header{
          background:${theme.ref.palette.neutral[400]};
          color:${theme.ref.palette.neutral[1000]};
          height: 50px;
          flex-shrink: 0;
          font-size: 1rem;
          font-weight: 500;
        }`
    const floatingPanel = (
      <FloatingPanel
        onHeaderClose={this.handleClickClose}
        defaultPosition={this.getWidgetPosition()}
        headerTitle={activedRouteConfig.displayName}
        size={mapSize}
        minSize={{ width: 770, height: 850 }}
        disableResize
        css={panelHeader}
        className='surface-2'
        disableActivateOverlay
        dragBounds='body'
        //508
        autoFocus={false}
      >
        <div className='rounded-1 w-100 h-100' css={this.getPoperStyle(theme)}>
          <div className='popper-content'>
            <div className='map-container' style={{ height: '600px', width: '700px' }}>
              <JimuMap
                id={this.props.specifiedJimuMapId}// `fly__${this.props.useMapWidgetIds[0]}`
                useDataSources={useDataSource}
                jimuMapConfig={jimuMapConfig}
                onActiveViewChange={this.handleActiveViewChange}
                onViewGroupCreate={this.handleViewGroupCreate}
              />
            </div>

            {/* ConfirmWindow */}
            {this.state.isShowConfirmWin && this._getConfirmWindow()}

            <div className='popper-footer'>
              <div className='left-tool'>
                <ActionPanel
                  specifiedJimuMapId={this.props.specifiedJimuMapId}
                  theme={theme}
                  intl={this.props.intl}
                  jimuMapView={this.state.jimuMapView}

                  isDisableDraw={!this.state.is3DView || (this.props.pageMode === PageMode.RecordLoading || this.props.pageMode === PageMode.RecordDetails)}
                  isTerrainLoaded={this.props.isTerrainLoaded}

                  getPopperJimuMapId={this.props.getPopperJimuMapId}
                  onRefGraphicInteractionManager={this.handleRefGraphicInteractionManager}
                  //
                  newFeatureMode={this.props.newFeatureMode}
                  onNewFeatureModeChange={this.props.onNewFeatureModeChange}
                  //
                  buildTemporaryRecordConfig={this.props.buildTemporaryRecordConfig}
                  buildDefaultRecord={this.props.buildDefaultRecord}
                  onDrawFinish={this.handleDrawFinish}
                  //
                  activedRouteConfig={this.props.activedRouteConfig}
                  //
                  playingInfo={this.props.playingInfo}
                  isPreviewRouteBtnPlaying={this.props.isPreviewRouteBtnPlaying}
                  //
                  stopFly={this.props.stopFly}
                />
              </div>

              <div className='float-right'>
                {/* 'newFeatureMode:' + {this.props.newFeatureMode} */}
              </div>
            </div>
          </div>
        </div>
      </FloatingPanel>
    )

    return (
      <div className='w-100'>
        {
          /* <Button className="w-100 text-dark map-popper-btn" type="primary" disabled={!viewEditable} onClick={() => this.handleNewOrEdit()}>
           {this.props.buttonLabel}
           </Button> */
        }
        {isShowMapPopper && floatingPanel}
      </div>
    )
  }

  // draw
  handleDrawFinish = (record: Record): void => {
    this.tmpRecordForConfirm = record
    this._toggleConfirmWindow(true)
  }

  /// ////////////////////////////////////////////////////////////////////
  // Confirm window
  _toggleConfirmWindow = (cmd?: boolean): void => {
    let isShowConfirmWin: boolean
    if (typeof cmd !== 'undefined') {
      isShowConfirmWin = cmd
    } else {
      isShowConfirmWin = !this.state.isShowConfirmWin
    }

    this.setState({
      isShowConfirmWin: isShowConfirmWin,
      isConfirmBtnsDisabled: false //reset ConfirmBtnsDisabled flag
    }, () => {
      if (!isShowConfirmWin && utils.isDefined(this.tmpRecordForConfirm)) {
        this.tmpRecordForConfirm = null// clean
      }
    })
  }

  getRecordName = (): string => {
    return this.tmpRecordForConfirm?.getConfig().displayName
  }

  _getConfirmWindow = (): React.ReactElement => {
    const { innerSize } = this.getDefaultSize()
    const { theme } = this.props

    const saveToLabel = this.props.intl.formatMessage({ id: 'saveTo', defaultMessage: nls.saveTo })
    const closePopupLabel = this.props.intl.formatMessage({ id: 'closePopup', defaultMessage: nls.closePopup })
    const editElementLabel = this.props.intl.formatMessage({ id: 'editElement', defaultMessage: nls.editElement })
    const saveLabel = this.props.intl.formatMessage({ id: 'save', defaultMessage: nls.save })
    return (
      <div css={css`
        position: absolute;
        z-index: 11;
        top: 0;
        left: 0;
        background-color: ${polished.rgba(theme.sys.color.secondary.main, 0.65)};
        width: ${innerSize.width}px;
        height: ${innerSize.height}px;
        .real-container{
          background-color: ${theme.sys.color.surface.background};
          border: 1px solid ${theme.sys.color.secondary.dark};
          background-clip: padding-box;
          width: 480px;
          position: relative;
          top: 50%;
          margin: -60px auto 0;
        }
        .confirm-header {
          border-bottom: 1px solid ${theme.ref.palette.neutral[700]};
          padding: 16px 20px;
        }
        .confirm-context {
          padding: ${polished.rem(20)} ${polished.rem(20)} 0 ${polished.rem(20)};
        }
        .confirm-footer {
          display: flex;
          justify-content: flex-end;
          padding: ${polished.rem(20)};
          button {
            cursor: pointer;
            margin-left: ${polished.rem(8)};
            min-width: ${polished.rem(100)};
          }
        }
      `}
      >
        <div className='real-container'>
          <PanelHeader
            title={saveToLabel + ' ' + this.props.activedRouteConfig.displayName} moveable={false} className='confirm-header'
            actions={[{
              name: 'close',
              label: closePopupLabel,
              icon: closeIconOutlined,
              onClick: this.handleConfirmWinClose
            }]}
          />
          <div className='confirm-context'>
            <TextInput className='w-100' size='sm' required
              defaultValue={this.getRecordName() ?? ''}
              onChange={evt => { this.handleConfirmWinNameChange(evt.target.value) }} />
          </div>
          <div className='confirm-footer'>
            <Button type='primary' title={saveLabel} aria-label={saveLabel}
              onClick={this.handleConfirmWinSave} disabled={this.state.isConfirmBtnsDisabled}>
              {saveLabel}
            </Button>
            <Button type='secondary' title={editElementLabel} aria-label={editElementLabel}
              onClick={this.handleConfirmWinEdit} disabled={this.state.isConfirmBtnsDisabled}>
              {editElementLabel}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  handleConfirmWinClose = (): void => {
    this.props.onRemoveGraphics(this.tmpRecordForConfirm.cachingGraphicsInfo.getGraphics())
    this._toggleConfirmWindow(false)
  }

  handleConfirmWinNameChange = (name: string): void => {
    if (!name) { // empty name is not allowed ,#6563
      this.setState({ isConfirmBtnsDisabled: true })
    } else {
      this.setState({ isConfirmBtnsDisabled: false })
    }

    this.tmpRecordForConfirm.getConfig().displayName = name
  }

  handleConfirmWinEdit = (): void => {
    if (utils.isDefined(this.tmpRecordForConfirm)) {
      this.props.onRecordAddAndEdit(this.tmpRecordForConfirm.getConfig()).then(() => {
        this._toggleConfirmWindow(false)
      })
    }
  }

  handleConfirmWinSave = (): void => {
    if (utils.isDefined(this.tmpRecordForConfirm)) {
      this.props.onRecordAdd(this.tmpRecordForConfirm.getConfig())
    }
    this._toggleConfirmWindow(false)
  }
}
