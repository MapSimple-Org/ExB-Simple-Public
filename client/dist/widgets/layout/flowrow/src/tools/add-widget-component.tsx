/**@jsx jsx */
import { React, css, jsx, type LayoutItemConstructorProps } from 'jimu-core'
import { WidgetList } from 'jimu-ui/advanced/setting-components'
import type { ToolSettingPanelProps } from 'jimu-layouts/layout-runtime'
import { isLayoutItemAccepted, addItemToFlowRow, widgetToolbarStateChange } from './utils'

const styles = css`
  height: 600px;
  width: 405px;
  >.content {
    height: 100%;
    margin-top: 0 !important;
    padding-top: var(--sys-spacing-4);
    .list-container {
      height: calc(100% - 100px);
    }
  }
`

export const AddWidgetComponent = (props: ToolSettingPanelProps) => {
  const { widgetId } = props

  const handleItemSelect = React.useCallback((item: LayoutItemConstructorProps) => {
    addItemToFlowRow(widgetId, item).then(() => {
      widgetToolbarStateChange(widgetId, ['flowrow-manage-widgets'])
    })
  }, [widgetId])

  return <div css={styles}>
    <WidgetList
      isAccepted={isLayoutItemAccepted}
      onSelect={handleItemSelect}
    />
  </div>
}

