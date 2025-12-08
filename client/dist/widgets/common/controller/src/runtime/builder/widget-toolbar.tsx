import { React, ReactRedux, type IMState, hooks, type IMLayoutItemJson } from 'jimu-core'
import type { FlipOptions, ShiftOptions } from 'jimu-ui'
import { getTheme2 } from 'jimu-theme'
import { shallowEqual } from 'react-redux'
import { getWidgetChildLayoutJson } from '../common/layout-utils'
import { BASE_LAYOUT_NAME } from '../../common/consts'
import { LayoutItemToolbar } from 'jimu-layouts/layout-builder'

interface WidgetToolbarProps {
  id: string
}

const shiftOptions: ShiftOptions = {
  rootBoundary: 'viewport',
  crossAxis: true
}

const flipOptions: FlipOptions = {
  boundary: document.body,
  fallbackPlacements: ['top-start', 'bottom-start']
}

export default function WidgetToolbar (props: WidgetToolbarProps) {
  const { id } = props

  const { layoutId, layoutItem } = ReactRedux.useSelector((state: IMState) => {
    const selection = state.appRuntimeInfo?.selection
    const layoutJson = getWidgetChildLayoutJson(id, BASE_LAYOUT_NAME)
    let layoutId: string, layoutItem: IMLayoutItemJson
    if (selection && selection.layoutId === layoutJson.id && layoutJson.content[selection.layoutItemId]) {
      layoutId = selection.layoutId
      layoutItem = layoutJson.content[selection.layoutItemId]
    }
    return { layoutId, layoutItem }
  }, shallowEqual)

  const [refElement, setRefElement] = React.useState<HTMLElement>(null)
  React.useEffect(() => {
    if (layoutId && layoutItem) {
      // widget loading could be very slow, try get refElement at most 20 times
      let tryCount = 0
      const updateInterval = setInterval(() => {
        tryCount++
        const newRefElement = (document.querySelector(`.single-widget-launcher:has(.widget-renderer[data-widgetid=${layoutItem?.widgetId}])`) ||
          document.querySelector(`.multiple-widget-launcher:has(.widget-renderer[data-widgetid=${layoutItem?.widgetId}])`) ||
          document.querySelector(`.mobile-panel-popper:has(.widget-renderer[data-widgetid=${layoutItem?.widgetId}])`)) ||
          document.querySelector(`.off-panel-widget-launcher:has(.widget-renderer[data-widgetid=${layoutItem?.widgetId}])`)
        setRefElement(newRefElement as HTMLElement)
        if (tryCount >= 20 || newRefElement) clearInterval(updateInterval)
      }, 100)
    } else {
      setRefElement(null)
    }
  }, [layoutId, layoutItem])

  const translate = hooks.useTranslation()

  return layoutId && layoutItem && refElement && <div onClick={(e) => { e.stopPropagation() }}>
      <LayoutItemToolbar
        key={layoutId + layoutItem.id}
        layoutId={layoutId}
        layoutItem={layoutItem}
        refElement={refElement}
        shiftOptions={shiftOptions}
        flipOptions={flipOptions}
        builderTheme={getTheme2()}
        formatMessage={translate}
        showDefaultTools={false}
      />
  </div>
}
