/** @jsx jsx */
import { React, ReactRedux, type IMState } from 'jimu-core'
import { LayoutItemSizeModes } from 'jimu-layouts/layout-runtime'
import { QueryWidgetContext } from './widget-context'

export function useAutoHeight () {
  const layoutInfo = React.useContext(QueryWidgetContext)
  let layoutId
  let layoutItemId
  if (layoutInfo.includes(':')) {
    const r = layoutInfo.split(':')
    layoutId = r[0]
    layoutItemId = r[1]
  }
  const isAuto = ReactRedux.useSelector((state: IMState) => {
    const layoutItem = state.appConfig.layouts[layoutId]?.content?.[layoutItemId]
    return layoutItem?.setting?.autoProps?.height === LayoutItemSizeModes.Auto
  })

  return isAuto
}
