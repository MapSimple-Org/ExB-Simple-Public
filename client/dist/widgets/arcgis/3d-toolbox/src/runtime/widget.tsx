/** @jsx jsx */
import { React, jsx, type AllWidgetProps, appActions, hooks } from 'jimu-core'
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'
import { ArrangeStyles } from './components/arrange-styles'
import { PlaceHolder } from './components/place-holder'

import type { IMConfig } from '../config'
import { versionManager } from '../version-manager'

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const useMapWidgetId = props.useMapWidgetIds?.[0]

  hooks.useEffectOnce(() => {
    const { layoutId, layoutItemId, id, dispatch } = props
    dispatch(appActions.widgetStatePropChange(id, 'layoutInfo', { layoutId, layoutItemId }))
  })

  const [activedJimuMapViewState, setActivedJimuMapViewState] = React.useState<JimuMapView>(null)
  const onActiveMapViewChange = React.useCallback(activeView => {
    if (activeView?.view?.type === '3d') {
      setActivedJimuMapViewState(activeView)
    } else {
      setActivedJimuMapViewState(null) //reset
    }
  }, [])

  const isShowPlaceHolderFlag = !useMapWidgetId || !(activedJimuMapViewState?.view?.type === '3d')
  return (
    <div className='widget-3d-toolbox jimu-widget h-100'>
      { /* 1.placeholder */}
      {isShowPlaceHolderFlag &&
        <PlaceHolder
          widgetId={props.id}
          arrangement={props.config.arrangement}
          isInController={!!props.controllerWidgetId}
        ></PlaceHolder>
      }
      { /* 2.widgets */}
      {!isShowPlaceHolderFlag && activedJimuMapViewState &&
        <ArrangeStyles
          config={props.config}
          useMapWidgetId={useMapWidgetId}
          jimuMapView={activedJimuMapViewState}
        ></ArrangeStyles>
      }

      {
        useMapWidgetId &&
          <JimuMapViewComponent useMapWidgetId={useMapWidgetId} onActiveViewChange={onActiveMapViewChange} />
      }
    </div>
  )
}
Widget.versionManager = versionManager

export default Widget
