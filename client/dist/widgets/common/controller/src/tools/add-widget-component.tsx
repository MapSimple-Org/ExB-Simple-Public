import { React, css, type LayoutItemConstructorProps } from 'jimu-core'
import { WidgetList } from 'jimu-ui/advanced/setting-components'
import type { ToolSettingPanelProps } from 'jimu-layouts/layout-runtime'
import { getIsItemAccepted, widgetStatePropChange } from '../runtime/builder/utils'

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
  const controllerId = props.widgetId

  const handleItemSelect = React.useCallback((item: LayoutItemConstructorProps) => {
    widgetStatePropChange(controllerId, 'itemToAdd', item)
  }, [controllerId])
  const isItemAccepted = getIsItemAccepted(controllerId)

  return <div css={styles}>
    <WidgetList
      isAccepted={isItemAccepted}
      onSelect={handleItemSelect}
    />
  </div>
}
