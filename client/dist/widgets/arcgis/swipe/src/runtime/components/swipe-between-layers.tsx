import 'arcgis-map-components'
import type Collection from 'esri/core/Collection'
import type Layer from 'esri/layers/Layer'
import { React, type ImmutableArray, getAppStore } from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import { SwipeStyle } from '../../config'
import type { LinearUnit } from 'jimu-ui'
const { useEffect, useRef } = React

export interface SwipeBetweenLayersProps {
  widgetId: string
  activeMapView: JimuMapView
  leadingLayersId: ImmutableArray<string>
  trailingLayersId: ImmutableArray<string>
  swipeStyle: SwipeStyle
  sliderPosition: LinearUnit
  isDesignMode: boolean
}

export function SwipeBetweenLayers (props: SwipeBetweenLayersProps) {
  const { widgetId, activeMapView, leadingLayersId, trailingLayersId, swipeStyle, sliderPosition, isDesignMode } = props
  const isRTL = getAppStore().getState()?.appContext?.isRTL
  const mapId = activeMapView?.mapWidgetId

  const swipeRef = useRef<HTMLArcgisSwipeElement>(null)
  const rightStart = (swipeStyle === SwipeStyle.SimpleHorizontal) && isRTL
  const positionRef = useRef<number>(rightStart ? (100 - sliderPosition.distance) : sliderPosition.distance)
  const mapContainerRef = useRef<HTMLElement>(document.querySelector<HTMLElement>(`div[data-widgetid=${mapId}]`))
  const isUnmounted = useRef<boolean>(false)
  const sliderPositionRef = useRef<LinearUnit>(sliderPosition)

  useEffect(() => {
    const swipe = mapContainerRef.current?.querySelector<HTMLElement>('.arcgis-swipe')
    if (swipe) {
      swipe.style.pointerEvents = isDesignMode ? null : 'none'
    }
  }, [isDesignMode, mapContainerRef])

  const getJimuLayerViewById = async (jimuMapView: JimuMapView, jimuLayerViewId: string) => {
    const jimuLayerView = await jimuMapView.whenJimuLayerViewLoaded(jimuLayerViewId)
    return jimuLayerView
  }

  useEffect(() => {
    return () => {
      isUnmounted.current = true
    }
  }, [])

  useEffect(() => {
    /**
     * If have used map widget and the jimu map view is created, will update swipe widget.
     */
    if (activeMapView?.view) {
      updateSwipeWidget()
    }

    function updateSwipeWidget () {
      const leadingLayersPromiseArray = leadingLayersId?.asMutable()?.map(jimuLayerViewId => {
        return getJimuLayerViewById(activeMapView, jimuLayerViewId)
      })
      const trailingLayersPromiseArray = trailingLayersId?.asMutable()?.map(jimuLayerViewId => {
        return getJimuLayerViewById(activeMapView, jimuLayerViewId)
      })
      const swipeDirection = swipeStyle === SwipeStyle.SimpleVertical ? 'vertical' : 'horizontal'
      if (leadingLayersPromiseArray && trailingLayersPromiseArray) {
        Promise.all(leadingLayersPromiseArray.concat(trailingLayersPromiseArray)).then(async jimuLayerViews => {
          if (isUnmounted.current) {
            return
          }
          const leadingArray = leadingLayersId?.asMutable().map((id) => {
            const jimuLayerView = jimuLayerViews.filter(item => item.id === id)
            return jimuLayerView[0].layer
          })
          const trailingArray = trailingLayersId?.asMutable().map((id) => {
            const jimuLayerView = jimuLayerViews.filter(item => item.id === id)
            return jimuLayerView[0].layer
          })

          //Destroy method used for when mapView is changed, leadingLayersId and trailingLayersId props will be changed at two times, new Swipe and destroy Swipe twice which is not sync because of the Promise.
          await destroySwipeWidget()

          // When user changes the initial position of the slider in setting
          if ((sliderPosition !== sliderPositionRef.current) || !positionRef.current) {
            sliderPositionRef.current = sliderPosition
            positionRef.current = rightStart ? (100 - sliderPosition.distance) : sliderPosition.distance
          }

          if (!activeMapView?.view) return
          swipeRef.current = document.createElement('arcgis-swipe')
          swipeRef.current.classList.add(`exb-swipe-${widgetId}`)
          swipeRef.current.leadingLayers = leadingArray as unknown as Collection<Layer>
          swipeRef.current.trailingLayers = trailingArray as unknown as Collection<Layer>
          swipeRef.current.direction = swipeDirection
          swipeRef.current.swipePosition = positionRef.current
          swipeRef.current.autoDestroyDisabled = true

          // @ts-expect-error
          swipeRef.current.view = activeMapView?.view
          activeMapView?.view.ui.add(swipeRef.current)
        })
      }
    }

    async function destroySwipeWidget () {
      if (swipeRef.current) {
        positionRef.current = swipeRef.current.swipePosition
        activeMapView?.view?.ui.remove(swipeRef.current)
        await swipeRef.current.destroy()
        swipeRef.current = null
      }
    }

    return () => {
      destroySwipeWidget()
    }
  }, [widgetId, activeMapView, sliderPosition, leadingLayersId, trailingLayersId, swipeStyle, rightStart])

  return null
}
