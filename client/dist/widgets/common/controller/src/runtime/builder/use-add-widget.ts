import { type LayoutInfo, React, appActions, getAppStore, type LayoutItemConstructorProps, ReactRedux, type IMState } from 'jimu-core'
import { BASE_LAYOUT_NAME } from '../../common/consts'
import { getWidgetChildLayoutJson } from '../common/layout-utils'
import { insertWidgetToLayout } from './utils'

const useAddWidget = (controllerId: string, afterAddWidget: (layoutInfo: LayoutInfo) => void) => {
  const onItemSelect = React.useCallback(async (item: LayoutItemConstructorProps) => {
    const layout = getWidgetChildLayoutJson(controllerId, BASE_LAYOUT_NAME)
    const insertIndex = layout.order?.length ?? 0
    try {
      const layoutInfo = await insertWidgetToLayout(layout, item, insertIndex)
      afterAddWidget(layoutInfo)
    } catch (e) {
      console.error('Failed to add widget')
    }
  }, [controllerId, afterAddWidget])

  const itemToAdd = ReactRedux.useSelector((state: IMState) => state.widgetsState[controllerId]?.itemToAdd)
  React.useEffect(() => {
    if (itemToAdd) {
      onItemSelect(itemToAdd)
      getAppStore().dispatch(appActions.widgetStatePropChange(controllerId, 'itemToAdd', null))
    }
  }, [controllerId, itemToAdd, onItemSelect])
}

export default useAddWidget
