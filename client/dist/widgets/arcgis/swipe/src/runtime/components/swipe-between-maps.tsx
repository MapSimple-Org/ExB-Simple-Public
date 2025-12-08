/** @jsx jsx */
import { React, type ImmutableArray, hooks, getAppStore } from 'jimu-core'
import type { JimuMapView, JimuMapViewGroup } from 'jimu-arcgis'
import { useTheme } from 'jimu-theme'
import { interact } from 'jimu-core/dnd'
import { type SwipeMode, SwipeStyle } from '../../config'
import { type LinearUnit, defaultMessages as jimuUIMessages } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { arraysEqual } from '../../utils/utils'
const { useRef, useEffect, useState } = React

const dividerStyle = `
  position: absolute;
  border: 1px solid rgba(110,110,110,.5);
`
const handlerStyle = `
  width: 32px;
  height: 32px;
  border: 1px solid rgba(110,110,110,.5);
  borderRadius: 2px;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
`

export interface SwipeBetweenMapsProps {
  widgetId: string
  activeMapView: JimuMapView
  inactiveMapView: JimuMapView
  jimuMapViewGroup: JimuMapViewGroup
  swipeMode: SwipeMode
  sliderPosition: LinearUnit
  swipeStyle: SwipeStyle
  mapUseDataSourcesOrderList: ImmutableArray<string>
  mapUseDataSources: ImmutableArray<string>
  dividerColor: string
  handlerColor: string
  isDesignMode: boolean
}
interface Position {
  x: number
  y: number
}

export function SwipeBetweenMaps (props: SwipeBetweenMapsProps) {
  const { activeMapView, inactiveMapView, jimuMapViewGroup, widgetId, swipeMode, swipeStyle, sliderPosition, mapUseDataSourcesOrderList, mapUseDataSources, dividerColor, handlerColor, isDesignMode } = props
  const isRTL = getAppStore().getState()?.appContext?.isRTL
  const mapId = activeMapView.mapWidgetId
  const mapViewWidthRef = useRef(activeMapView.view?.width)
  const mapViewHeightRef = useRef(activeMapView.view?.height)
  const sliderId = `jimu-widget-swipe-${widgetId}-handle-container`
  //If items in useDataSources of a map widget is the same as the in mapUseDataSourcesOrderList but they may be in different order, use mapUseDataSourcesOrderList. If they are not the same, use useDataSources of a map widget(May be a map view is added or deleted from a map widget while swipe is on).
  const mapViewList = arraysEqual(mapUseDataSources, mapUseDataSourcesOrderList) ? mapUseDataSourcesOrderList : mapUseDataSources
  const isLeadingMapActiveRef = useRef(mapViewList?.[0] === activeMapView?.dataSourceId)
  const isMapViewBindClickEventRef = useRef(false)
  const isHasClickInactiveMapRef = useRef(false)
  const isMouseDownOnInactiveMapRef = useRef(false)
  const isSwitchingMapRef = useRef(false)
  const defaultPosition = { x: 0, y: 0 } as Position
  const multiMapContainerRef = useRef<HTMLElement>(document.querySelector<HTMLElement>(`div[data-widgetid=${mapId}] .multi-map-container`))
  const activeMapDOMRef = useRef<HTMLDivElement>(multiMapContainerRef.current?.querySelector('.multisourcemap-item-appear-noanimate'))
  const inactiveMapDOMRef = useRef<HTMLDivElement>(multiMapContainerRef.current?.querySelector('.multisourcemap-item-disappear-noanimate'))
  if (swipeStyle === SwipeStyle.SimpleVertical) {
    defaultPosition.y = mapViewHeightRef.current * sliderPosition.distance * 0.01
  } else {
    const rtlPosition = isRTL ? (100 - sliderPosition.distance) : sliderPosition.distance
    defaultPosition.x = mapViewWidthRef.current * rtlPosition * 0.01
  }
  const [position, setPosition] = useState(defaultPosition)
  const interactableRef = useRef<Interact.Interactable>(null)
  const dividerDomRef = useRef<HTMLElement>(null)
  const activeMapViewPopupEnableStatusRef = useRef<boolean>(activeMapView.isClickOpenPopupEnabled())
  const activeMapViewHighlightEnableStatusRef = useRef<boolean>(activeMapView.isClickHighlightEnabled())
  const inactiveMapViewPopupEnableStatusRef = useRef<boolean>(inactiveMapView.isClickOpenPopupEnabled())
  const inactiveMapViewHighlightEnableStatusRef = useRef<boolean>(inactiveMapView.isClickHighlightEnabled())
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)
  const theme = useTheme()

  useEffect(() => {
    if (activeMapView.isCached()) {
      return
    }
    multiMapContainerRef.current.style.pointerEvents = isDesignMode ? 'none' : null
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDesignMode])

  useEffect(() => {
    return () => {
      if (multiMapContainerRef.current) {
        multiMapContainerRef.current.style.pointerEvents = null
      }
    }
  }, [])

  hooks.useUpdateEffect(() => {
    isLeadingMapActiveRef.current = !isLeadingMapActiveRef.current
  }, [activeMapView])

  useEffect(() => {
    if (activeMapView.isCached()) {
      return
    }
    activeMapDOMRef.current = multiMapContainerRef.current.querySelector('.multisourcemap-item-appear-noanimate')
    inactiveMapDOMRef.current = multiMapContainerRef.current.querySelector('.multisourcemap-item-disappear-noanimate')
    isHasClickInactiveMapRef.current = false
    isMapViewBindClickEventRef.current = false
    checkAndClosePopup()
    disablePopupAndHighlight()
    showInactiveMap()
    clipActiveMap()

    updateSwipeWidget()
    addClickEventForMapView()
    jimuMapViewGroup.hideMapTools()
    return () => {
      destroySwipeWidget()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMapView])

  useEffect(() => {
    const resizeHandle = activeMapView.view.on('resize', (evt) => {
      mapViewWidthRef.current = evt.width
      mapViewHeightRef.current = evt.height
      destroySwipeWidget()
      showInactiveMap()
      clipActiveMap()
      updateSwipeWidget()
      addClickEventForMapView()
      jimuMapViewGroup.hideMapTools()
    })
    return () => {
      resizeHandle.remove()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMapView])

  useEffect(() => {
    const cacheListener = () => {
      isMapViewBindClickEventRef.current = false
    }
    const restoreListener = () => {
      multiMapContainerRef.current = document.querySelector<HTMLElement>(`div[data-widgetid=${mapId}] .multi-map-container`)
      activeMapDOMRef.current = multiMapContainerRef.current.querySelector('.multisourcemap-item-appear-noanimate')
      inactiveMapDOMRef.current = multiMapContainerRef.current.querySelector('.multisourcemap-item-disappear-noanimate')
      showInactiveMap()
      clipActiveMap()
      updateSwipeWidget()
      addClickEventForMapView()
      jimuMapViewGroup.hideMapTools()
      disablePopupAndHighlight()
    }

    activeMapView.addCacheListener(cacheListener)
    activeMapView.addRestoreListener(restoreListener)

    return () => {
      activeMapView.removeCacheListener(cacheListener)
      activeMapView.removeRestoreListener(restoreListener)
      destroySwipeWidget()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMapView])

  //Update color
  useEffect(() => {
    if (activeMapView.isCached()) {
      return
    }
    dividerDomRef.current.style.backgroundColor = dividerColor
    const handler = dividerDomRef.current.querySelector<HTMLElement>('.handler')
    handler.style.backgroundColor = handlerColor
  }, [activeMapView, dividerColor, handlerColor])

  useEffect(() => {
    setPosition(defaultPosition)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swipeMode])

  //Clip the active map when mapViewList in setting is dragged.
  hooks.useUpdateEffect(() => {
    if (activeMapView.isCached()) {
      return
    }
    isLeadingMapActiveRef.current = !isLeadingMapActiveRef.current
    clipActiveMap(position)
  }, [mapViewList])

  useEffect(() => {
    if (activeMapView.isCached()) {
      return
    }
    const position = { x: 0, y: 0 } as Position
    const divider = document.querySelector<HTMLElement>(`.jimu-widget-swipe-${widgetId}-handle-container`)
    if (swipeStyle === SwipeStyle.SimpleVertical) {
      position.y = mapViewHeightRef.current * sliderPosition.distance * 0.01
      divider.style.transform = `translateY(${position.y}px)`
    } else {
      const rtlPosition = isRTL ? (100 - sliderPosition.distance) : sliderPosition.distance
      position.x = mapViewWidthRef.current * rtlPosition * 0.01
      const rtlPositionX = isRTL ? -(mapViewWidthRef.current - position.x) : position.x
      divider.style.transform = `translateX(${rtlPositionX}px)`
    }
    clipActiveMap(position)
    setPosition(position)
    jimuMapViewGroup.hideMapTools()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliderPosition, widgetId, swipeStyle, isRTL])

  //When turn swipe between maps mode on, the popups on map will be closed.
  const checkAndClosePopup = () => {
    if (activeMapView.view.popupEnabled) {
      activeMapView.view.closePopup()
    }
    if (inactiveMapView.view.popupEnabled) {
      inactiveMapView.view.closePopup()
    }
  }

  //When turn swipe between maps mode on, disable the popup and highlight of the map view.
  const disablePopupAndHighlight = () => {
    activeMapView.disableClickOpenPopup()
    activeMapView.disableClickHighlight()
    inactiveMapView.disableClickOpenPopup()
    inactiveMapView.disableClickHighlight()
  }

  //When turn swipe between maps mode off, reset the popup and highlight of the map view.
  const restorePopupAndHighlight = () => {
    //Check whether the JimuMapView has been destroyed before calling the method of JimuMapView.
    if (!activeMapView.isDestroyed()) {
      if (activeMapViewPopupEnableStatusRef.current) {
        activeMapView.enableClickOpenPopup()
      } else {
        activeMapView.disableClickOpenPopup()
      }

      if (activeMapViewHighlightEnableStatusRef.current) {
        activeMapView.enableClickHighlight()
      } else {
        activeMapView.disableClickHighlight()
      }
    }

    if (!inactiveMapView.isDestroyed()) {
      if (inactiveMapViewPopupEnableStatusRef.current) {
        inactiveMapView.enableClickOpenPopup()
      } else {
        inactiveMapView.disableClickOpenPopup()
      }

      if (inactiveMapViewHighlightEnableStatusRef.current) {
        inactiveMapView.enableClickHighlight()
      } else {
        inactiveMapView.disableClickHighlight()
      }
    }
  }
  /**
   * Use interact.js API to bind the drag divider.
   */
  const bindDragDivider = (swipeHandleRef: HTMLElement): Interact.Interactable => {
    if (swipeHandleRef && swipeStyle === SwipeStyle.SimpleVertical) {
      return interact(swipeHandleRef)
        ?.draggable({
          startAxis: 'y',
          lockAxis: 'y',
          listeners: {
            move (event) {
              position.y += event.dy
              position.y = position.y > mapViewHeightRef.current ? mapViewHeightRef.current : (position.y > 0 ? position.y : 0)
              setPosition(position)
              clipActiveMap(position)
              event.target.style.transform = `translateY(${position.y}px)`
              const value = position.y / mapViewHeightRef.current * 100
              dividerDomRef.current.ariaValueNow = value.toFixed(4).toString()
              dividerDomRef.current.ariaValueText = value.toFixed(4) + '%'
            }
          }
        })
    } else if (swipeHandleRef && swipeStyle === SwipeStyle.SimpleHorizontal) {
      return interact(swipeHandleRef)
        ?.draggable({
          startAxis: 'x',
          lockAxis: 'x',
          listeners: {
            move (event) {
              position.x += event.dx
              position.x = position.x > mapViewWidthRef.current ? mapViewWidthRef.current : (position.x > 0 ? position.x : 0)
              setPosition(position)
              clipActiveMap(position)
              const rtlPositionX = isRTL ? -(mapViewWidthRef.current - position.x) : position.x
              event.target.style.transform = `translateX(${rtlPositionX}px)`
              const value = position.x / mapViewWidthRef.current * 100
              dividerDomRef.current.ariaValueNow = value.toFixed(4).toString()
              dividerDomRef.current.ariaValueText = value.toFixed(4) + '%'
            }
          }
        })
    }
  }
  /**
   * Init the opacity of the invisible map to 1.
   */
  const showInactiveMap = () => {
    if (!inactiveMapDOMRef.current && !activeMapDOMRef.current) {
      return
    }
    inactiveMapDOMRef.current && (inactiveMapDOMRef.current.style.opacity = '1')
  }

  /**
   * Clear the opacity of the invisible map and clipPath of the visible map, and set the position of the divider to default.
   */
  const clearMapViewStyle = () => {
    jimuMapViewGroup.showMapTools()
    if (!inactiveMapDOMRef.current && !activeMapDOMRef.current) {
      return
    }

    //Clear style if the action is switching Swipe off.
    inactiveMapDOMRef.current && (inactiveMapDOMRef.current.style.opacity = null)
    activeMapDOMRef.current && (activeMapDOMRef.current.style.clipPath = null)

    //Clear style if the action is deleting an active map view from the map widget.
    inactiveMapDOMRef.current && (inactiveMapDOMRef.current.style.clipPath = null)
    activeMapDOMRef.current && (activeMapDOMRef.current.style.opacity = null)
  }

  /**
   * Change the clip position of activeMapDOMRef according to the position of the divider. It depends on whether the active map is on top or bottom of the container.
  */
  const clipActiveMap = (pos?: Position) => {
    const newPosition = pos || position
    let leadingClipPath = null
    let trailingClipPath = null
    if (swipeStyle === SwipeStyle.SimpleVertical) {
      const leadingClipPosition = mapViewHeightRef.current - newPosition.y
      const trailingClipPosition = newPosition.y
      leadingClipPath = `inset(0px 0px ${leadingClipPosition}px 0px)`
      trailingClipPath = `inset(${trailingClipPosition}px 0px 0px 0px)`
    } else if (swipeStyle === SwipeStyle.SimpleHorizontal) {
      const leadingClipPosition = mapViewWidthRef.current - newPosition.x
      const trailingClipPosition = newPosition.x
      leadingClipPath = `inset(0px ${leadingClipPosition}px 0px 0px)`
      trailingClipPath = `inset(0px 0px 0px ${trailingClipPosition}px)`
    }
    const leadingMap = isLeadingMapActiveRef.current ? activeMapDOMRef.current : inactiveMapDOMRef.current
    const trailingMap = isLeadingMapActiveRef.current ? inactiveMapDOMRef.current : activeMapDOMRef.current
    leadingMap && (leadingMap.style.clipPath = leadingClipPath)
    trailingMap && (trailingMap.style.clipPath = trailingClipPath)
  }

  const onKeyDown = (event) => {
    const key = event.key
    //The step and multipliedStep honor API
    const step = 0.5
    const multipliedStep = 5
    const stepValue = event.shiftKey ? multipliedStep : step

    const isVertical = swipeStyle === SwipeStyle.SimpleVertical

    const increaseKeys = isVertical
      ? key === 'ArrowDown' || key === 'ArrowRight'
      : key === 'ArrowUp' || key === 'ArrowRight'

    const decreaseKeys = isVertical
      ? key === 'ArrowUp' || key === 'ArrowLeft'
      : key === 'ArrowDown' || key === 'ArrowLeft'

    if (!increaseKeys && !decreaseKeys) return

    if (increaseKeys) {
      position.x = position.x + stepValue * mapViewWidthRef.current * 0.01
      position.y = position.y + stepValue * mapViewHeightRef.current * 0.01
    } else if (decreaseKeys) {
      position.x = position.x - stepValue * mapViewWidthRef.current * 0.01
      position.y = position.y - stepValue * mapViewHeightRef.current * 0.01
    }

    if (position.x || position.y) {
      position.x = position.x > mapViewWidthRef.current ? mapViewWidthRef.current : (position.x > 0 ? position.x : 0)
      position.y = position.y > mapViewHeightRef.current ? mapViewHeightRef.current : (position.y > 0 ? position.y : 0)
      setPosition(position)
      clipActiveMap(position)
      event.target.style.transform = isVertical ? `translateY(${position.y}px)` : `translateX(${position.x}px)`
      const value = isVertical ? (position.y / mapViewHeightRef.current * 100) : (position.x / mapViewWidthRef.current * 100)
      event.target.attributes['aria-valuenow'].value = value.toFixed(4).toString()
      event.target.attributes['aria-valuetext'].value = value.toFixed(4) + '%'
    }
  }
  /**
   * Create a divider of the swipe-map widget. Record its position and change it use transform property.
   */
  const createDivider = () => {
    //Create a divider
    dividerDomRef.current = document.createElement('div')
    // for issue #29601, map need a fixed className to determine if background is set
    dividerDomRef.current.className = `${sliderId} jimu-widget-swipe-handle-container`
    dividerDomRef.current.setAttribute('style', dividerStyle)
    dividerDomRef.current.style.backgroundColor = dividerColor
    dividerDomRef.current.style.zIndex = '1' //make sure the divider is on top of the activeMapViewDom(z-index: unset) as well as the inactiveMapViewDom(z-index: -1).

    //508 part
    const attributes = {
      ariaLabel: translate('dragToCompare'),
      title: translate('dragToCompare'),
      role: 'slider',
      tabIndex: 0,
      onkeydown: onKeyDown,
      ariaValueMax: '100',
      ariaValueMin: '0'
    }
    for (const attribute in attributes) {
      dividerDomRef.current[attribute] = attributes[attribute]
    }

    //Create a handler
    const handler = document.createElement('div')
    handler.setAttribute('style', handlerStyle)
    handler.style.backgroundColor = handlerColor

    if (swipeStyle === SwipeStyle.SimpleVertical) {
      dividerDomRef.current.style.top = '-2px'
      dividerDomRef.current.style.transform = `translateY(${position.y}px)`
      dividerDomRef.current.style.width = `${mapViewWidthRef.current}px`
      dividerDomRef.current.style.height = '4px'

      //508 part
      dividerDomRef.current.ariaOrientation = translate('vertical')
      const value = position.y / mapViewHeightRef.current * 100
      dividerDomRef.current.ariaValueNow = value.toFixed(4).toString()
      dividerDomRef.current.ariaValueText = value.toFixed(4) + '%'

      //handler
      handler.className = 'handler arcgis-swipe__handle-icon esri-icon-drag-horizontal'
      handler.style.top = '-15px'
      handler.style.left = '50%'
      handler.style.marginLeft = '-16px'
      handler.style.cursor = 'row-resize'
    } else {
      dividerDomRef.current.style.left = '-2px'
      const rtlPosition = isRTL ? -(mapViewWidthRef.current - position.x) : position.x
      dividerDomRef.current.style.transform = `translateX(${rtlPosition}px)`
      dividerDomRef.current.style.height = `${mapViewHeightRef.current}px`
      dividerDomRef.current.style.width = '4px'

      //508 part
      dividerDomRef.current.ariaOrientation = translate('horizontal')
      const value = position.x / mapViewWidthRef.current * 100
      dividerDomRef.current.ariaValueNow = value.toFixed(4).toString()
      dividerDomRef.current.ariaValueText = value.toFixed(4) + '%'

      //handler
      handler.className = 'handler arcgis-swipe__handle-icon esri-icon-drag-vertical'
      handler.style.left = '-15px'
      handler.style.top = '50%'
      handler.style.marginTop = '-16px'
      handler.style.cursor = 'col-resize'
    }

    dividerDomRef.current.appendChild(handler)

    //Set outline to handler when using keyboard navigation; set outline to divider when dragging it honors the API behavior of swipe between layers.
    dividerDomRef.current.onfocus = function () {
      dividerDomRef.current.style.outline = `2px solid ${theme.sys.color.primary.dark}`
      handler.style.outline = `2px solid ${theme.sys.color.primary.dark}`
    }
    dividerDomRef.current.onblur = function () {
      dividerDomRef.current.style.outline = 'unset'
      handler.style.outline = 'unset'
    }
  }

  /**
   * Update the swipe widget, create the divider , bind and append it to the container.
   */
  const updateSwipeWidget = () => {
    const isHasSwipeHandle = document.getElementsByClassName(sliderId)[0]
    if (isHasSwipeHandle) return false
    createDivider()
    multiMapContainerRef.current?.appendChild(dividerDomRef.current)
    interactableRef.current = bindDragDivider(dividerDomRef.current as any)
  }

  /**
   * Destroy the swipe-map widget when map is changed/ swipe type is changed.
   */
  const destroySwipeWidget = () => {
    isMapViewBindClickEventRef.current = false

    const isHasSwipeHandle = document.getElementsByClassName(sliderId)[0]
    if (isHasSwipeHandle) {
      (multiMapContainerRef.current && dividerDomRef.current) && (multiMapContainerRef.current.removeChild(dividerDomRef.current))
    }

    if (interactableRef.current) {
      interactableRef.current.unset()
    }

    clearMapViewStyle()

    //remove EventListener
    multiMapContainerRef.current.removeEventListener('mousedown', mousedownInactiveMap)
    multiMapContainerRef.current.removeEventListener('click', clickInactiveMap)
    multiMapContainerRef.current.removeEventListener('wheel', clickInactiveMap)

    //restore map view popup and highlight status
    restorePopupAndHighlight()
  }

  /**
   * Use switchMap API to change the active map.
   */
  const changeActiveMap = async () => {
    await jimuMapViewGroup.switchMap(true)
    isSwitchingMapRef.current = false
  }

  /**
   * Add a click event for the invisible map.
  */
  const addClickEventForMapView = () => {
    if (inactiveMapDOMRef.current && !isMapViewBindClickEventRef.current) {
      multiMapContainerRef.current.addEventListener('mousedown', mousedownInactiveMap)
      multiMapContainerRef.current.addEventListener('click', clickInactiveMap)
      multiMapContainerRef.current.addEventListener('wheel', clickInactiveMap)
      isMapViewBindClickEventRef.current = true
    }
  }

  const mousedownInactiveMap = (evt) => {
    if (evt.target.classList.contains('multi-map-container')) {
      isMouseDownOnInactiveMapRef.current = true
    } else {
      isMouseDownOnInactiveMapRef.current = false
    }
  }

  /**
   * Record click event on invisible map and change active map.
   * `isMouseDownOnInactiveMapRef` is used to avoid trigging the changeActiveMap() function when dragging the scroll bar.
   *
   */
  const clickInactiveMap = (evt) => {
    //If click on the activeMapView, the evt.target class contains 'esri-view-surface', if click on the inactiveMapView, the evt.target is 'multi-map-container'. This difference is caused by their z-index.
    if (evt.target.classList.contains('multi-map-container') && isMouseDownOnInactiveMapRef.current) {
      if (isHasClickInactiveMapRef.current || isSwitchingMapRef.current) return
      isHasClickInactiveMapRef.current = true
      isSwitchingMapRef.current = true
      changeActiveMap()
    }
  }
  return null
}
