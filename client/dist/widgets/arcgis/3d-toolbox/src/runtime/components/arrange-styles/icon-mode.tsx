/** @jsx jsx */
import { React, jsx, type ImmutableObject, type ImmutableArray, type AppMode, hooks, focusElementInKeyboardMode } from 'jimu-core'
import { Button, Popper, Label, FOCUSABLE_CONTAINER_CLASS, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { useTheme } from 'jimu-theme'
import type { JimuMapView } from 'jimu-arcgis'
import defaultMessages from '../../translations/default'

import { type Tool3D, ToolsID, ArrangementDirection } from '../../../constraints'
import { ToolPanel } from '../tool-panel/index'
import { getPopperStyle } from './style'

import { DaylightOutlined } from 'jimu-icons/outlined/gis/daylight'
import { WeatherOutlined } from 'jimu-icons/outlined/gis/weather'
import { ShadowCastOutlined } from 'jimu-icons/outlined/gis/shadow-cast'
import { LineOfSightOutlined } from 'jimu-icons/outlined/gis/line-of-sight'
import { SliceOutlined } from 'jimu-icons/outlined/application/slice'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'

export interface Props {
  direction: ArrangementDirection
  toolsConfig: ImmutableArray<Tool3D>
  findToolConfigById: (toolID: ToolsID) => ImmutableObject<Tool3D>
  useMapWidgetId: string
  jimuMapView: JimuMapView
  appMode: AppMode
}

export const IconMode = React.memo((props: Props) => {
  const theme = useTheme()
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)
  const popperPositionRef = React.useRef(null)
  const [shownModeState, setPopperModeState] = React.useState<ImmutableObject<Tool3D>>(null)
  const [popupVisibleState, setPopupVisibleState] = React.useState(false)
  // a11y
  const btnRefFor508 = React.useRef<HTMLElement>(null)

  // const togglePopup = React.useCallback((isOpenFlag: boolean/*, forceCloseFlag: boolean*/) => {
  //   const isOpen = isOpenFlag
  //   //let isChange = (popupVisibleState !== isOpen)
  //   // if (forceCloseFlag) { //forceCloseFlag, e.g. page change / unmount
  //   //   isChange = true
  //   //   isOpen = false
  //   // }
  //   setPopupVisibleState(isOpen)
  //   // if (typeof props.onPopperToggle === 'function' && isChange) {
  //   //   props.onPopperToggle(isOpen)
  //   // }
  // }, [/*props, popupVisibleState*/])

  // change ui by appMode ,#11482
  hooks.useUpdateEffect(() => {
    _closePopup()
  }, [props.appMode])

  const _closePopup = React.useCallback(() => {
    setPopperModeState(null)
    focusElementInKeyboardMode(btnRefFor508?.current) // 508 focus on PreviewBtn

    setPopupVisibleState(false)
  }, [])
  // unmount // hooks.useUnmount(() => {
  React.useEffect(() => {
    btnRefFor508.current = null
    return () => {
      _closePopup()
    }
  }, [props.toolsConfig, _closePopup])

  // const _currentActiveToolChanged = props.currentActiveToolChanged
  const handlePopupToggle = React.useCallback((evt, type) => {
    let closePopper = false
    const isSwitchExbPage = (type === 'pageOrSizeMode')
    // if (isSwitchExbPage) {
    //   _currentActiveToolChanged(null)
    // }
    if (isSwitchExbPage || (evt && evt.key && evt?.key === 'Escape')) {
      closePopper = true
    }
    // if (!evt.key) {
    // TODO mouse click do not hide, like bookmark
    // }

    //const forceCloseFlag = isSwitchExbPage
    if (closePopper) {
      _closePopup()
    }
  }, [_closePopup/*togglePopup*/])

  // popperVersion for UI update ,#13159
  const [popperVersion, setPopperVersion] = React.useState(0)
  const handlePopperVersionUpdate = React.useCallback(() => {
    setPopperVersion((_currentPopperVersion) => _currentPopperVersion + 1)
  }, [setPopperVersion])
  React.useEffect(() => {
    handlePopperVersionUpdate()
  }, [popupVisibleState, handlePopperVersionUpdate])

  // icons
  const _findToolConfigById = props.findToolConfigById
  const _getIconItem = React.useCallback((tool: ImmutableObject<Tool3D>) => {
    if (!tool.enable) {
      return null //disable
    }

    const name = translate('' + tool.id)
    let icon = null
    switch (tool.id) {
      case ToolsID.Daylight: {
        icon = <DaylightOutlined />
        break
      }
      case ToolsID.Weather: {
        icon = <WeatherOutlined />
        break
      }
      case ToolsID.ShadowCast: {
        icon = <ShadowCastOutlined />
        break
      }
      case ToolsID.LineOfSight: {
        icon = <LineOfSightOutlined />
        break
      }
      case ToolsID.Slice: {
        icon = <SliceOutlined />
        break
      }
    }

    return <div className='icon-item d-flex' key={tool.id}>
      <Button variant='text' color='inherit' className='w-100' size='sm' icon={true}
        active={shownModeState?.id === tool.id} title={name} data-id={tool.id}
        onClick={(evt) => {
          const target = (evt.currentTarget as HTMLElement)
          const btn = target.dataset.id ? target : target.parentElement
          popperPositionRef.current = btn //click on the icon-resizer

          const id = (popperPositionRef.current.dataset.id) as ToolsID
          setPopperModeState(_findToolConfigById(id))
          btnRefFor508.current = btn
          setPopupVisibleState(!!id)
          //togglePopup(id)
        }}>
        {icon}
      </Button>
    </div>
  }, [shownModeState, translate, _findToolConfigById])

  // Avoid the z-index change of popper in widget controller ,#9895
  const keepPopperZIndex = React.useCallback((evt: React.MouseEvent) => {
    evt?.stopPropagation()
    evt?.nativeEvent?.stopPropagation()
  }, [])

  const directionClass = props.direction === ArrangementDirection.Horizontal ? 'flex-row' : 'flex-column'
  return (
    <React.Fragment>
      <div className={'icon-item-container border-0 d-flex p-1 ' + directionClass} onClick={keepPopperZIndex}>
        {
          props.toolsConfig.map((tool) => {
            return _getIconItem(tool)
          })
        }
      </div>

      <Popper
        reference={popperPositionRef.current}
        placement={(props.direction === ArrangementDirection.Vertical) ? 'right' : 'bottom'}
        //className='surface-2 border-0'
        offsetOptions={12}
        arrowOptions={true}
        open={popupVisibleState}
        keepMount={true}
        version={popperVersion}
        toggle={handlePopupToggle}
        autoFocus={true}
        autoUpdate={true}
        forceLatestFocusElements={true}
        //css={popperStyles()}
      >
        <div className={'content-container'} css={getPopperStyle(theme)}>
          {/* header */}
          <div className={'popper-header d-flex px-4 pt-2 align-items-center justify-content-between ' + FOCUSABLE_CONTAINER_CLASS}>
            <Label className="popper-title mt-0 py-1">{translate(shownModeState?.id ? shownModeState.id : '_widgetLabel')}</Label>
            <Button className='print-button p-0' type='tertiary' size='sm' icon onClick={_closePopup}>
              <CloseOutlined />
            </Button>
          </div>
          {/* content */}
          <div className={'popper-content'}>
            {/* Daylight */}
            <ToolPanel
              mode={ToolsID.Daylight}
              toolConfig={props.findToolConfigById(ToolsID.Daylight)}
              useMapWidgetId={props.useMapWidgetId}
              jimuMapView={props.jimuMapView}

              shownModeState={shownModeState}
              onBackBtnClick={_closePopup}
              appMode={props.appMode}

              onPopperVersionUpdate={handlePopperVersionUpdate}
            ></ToolPanel>

            {/* Weather */}
            <ToolPanel
              mode={ToolsID.Weather}
              toolConfig={props.findToolConfigById(ToolsID.Weather)}
              useMapWidgetId={props.useMapWidgetId}
              jimuMapView={props.jimuMapView}

              shownModeState={shownModeState}
              onBackBtnClick={_closePopup}
              appMode={props.appMode}

              onPopperVersionUpdate={handlePopperVersionUpdate}
            ></ToolPanel>

            {/* ShadowCast */}
            <ToolPanel
              mode={ToolsID.ShadowCast}
              toolConfig={props.findToolConfigById(ToolsID.ShadowCast)}
              useMapWidgetId={props.useMapWidgetId}
              jimuMapView={props.jimuMapView}

              shownModeState={shownModeState}
              onBackBtnClick={_closePopup}
              appMode={props.appMode}

              onPopperVersionUpdate={handlePopperVersionUpdate}
            ></ToolPanel>

            {/* LineOfSight */}
            <ToolPanel
              mode={ToolsID.LineOfSight}
              toolConfig={props.findToolConfigById(ToolsID.LineOfSight)}
              useMapWidgetId={props.useMapWidgetId}
              jimuMapView={props.jimuMapView}

              shownModeState={shownModeState}
              onBackBtnClick={_closePopup}
              appMode={props.appMode}

              onPopperVersionUpdate={handlePopperVersionUpdate}
            ></ToolPanel>

            {/* Slice */}
            <ToolPanel
              mode={ToolsID.Slice}
              toolConfig={props.findToolConfigById(ToolsID.Slice)}
              useMapWidgetId={props.useMapWidgetId}
              jimuMapView={props.jimuMapView}

              shownModeState={shownModeState}
              onBackBtnClick={_closePopup}
              appMode={props.appMode}

              onPopperVersionUpdate={handlePopperVersionUpdate}
            ></ToolPanel>
          </div>
        </div>
      </Popper>
    </React.Fragment>
  )
})
