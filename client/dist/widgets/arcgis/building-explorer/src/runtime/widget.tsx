/** @jsx jsx */
import { React, jsx, css, type AllWidgetProps } from 'jimu-core'
import { type JimuMapView, JimuMapViewComponent } from 'jimu-arcgis'
import { MainPanel } from './components/main-panel'
import { PlaceHolder } from './components/place-holder'
import type { IMConfig } from '../config'
import { Paper } from 'jimu-ui'

const Widget = (props: AllWidgetProps<IMConfig>) => {
  const useMapWidgetId = props.useMapWidgetIds?.[0]

  const [activatedJimuMapViewState, setActivatedJimuMapViewState] = React.useState<JimuMapView>(null)
  const onActiveMapViewChange = React.useCallback(async (activeView) => {
    if (activeView?.view?.type === '3d') {
      // async load jimuMapView info
      await activeView.whenJimuMapViewLoaded()
      setActivatedJimuMapViewState(activeView)
    } else {
      setActivatedJimuMapViewState(null)
    }
  }, [])

  const getStyle = () => {
    return css`
      background-color: var(--sys-color-surface-paper);
      overflow: auto;
    `
  }

  const isShowPlaceHolderFlag = !useMapWidgetId || !(activatedJimuMapViewState?.view?.type === '3d')
  const isShowMainPanel = (activatedJimuMapViewState && !isShowPlaceHolderFlag)
  return (
    <Paper variant='flat' className='widget-building-explorer jimu-widget' css={getStyle()} shape='none'>
      { /* 1.placeholder */}
      {isShowPlaceHolderFlag &&
        <PlaceHolder
          widgetId={props.id}
        ></PlaceHolder>
      }

      { /* 2.widgets panel*/}
      <div className={(isShowMainPanel ? 'd-flex h-100 ' : 'd-none')}>
        <MainPanel
          widgetId={props.id}
          config={props.config}
          jimuMapView={activatedJimuMapViewState}
        ></MainPanel>
      </div>

      { /* 3.map */}
      {useMapWidgetId &&
        <JimuMapViewComponent useMapWidgetId={useMapWidgetId} onActiveViewChange={onActiveMapViewChange} />
      }
    </Paper>
  )
}

export default Widget
