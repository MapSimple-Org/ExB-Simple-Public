/** @jsx jsx */
import { React, jsx, css, type ImmutableObject } from 'jimu-core'
import { Button, Icon } from 'jimu-ui'
import type { QueryItemType } from '../config'
import { getWidgetRuntimeDataMap } from './widget-config'
import { DataSourceTip } from '../common/data-source-tip'
import { QueryTaskLabel } from './query-task-label'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'

const { iconMap } = getWidgetRuntimeDataMap()

export interface QueryTaskItemProps {
  index: number
  widgetId: string
  queryItem: ImmutableObject<QueryItemType>
  onStatusChange: (enabled: boolean) => void
}

const style = css`
  height: 32px;
  .jimu-btn {
    min-width: 26px;
  }
`

export function QueryTaskListItem (props: QueryTaskItemProps) {
  const { widgetId, queryItem, onStatusChange } = props
  const [enabled, setEnabled] = React.useState(true)
  const currentItem = Object.assign({}, DEFAULT_QUERY_ITEM, queryItem)
  const { icon, name, useDataSource } = currentItem

  const handleStatusChange = (enabled: boolean) => {
    setEnabled(enabled)
    onStatusChange(enabled)
  }

  return (
    <div className='d-flex align-items-center pl-2 pr-1 w-100' css={style}>
      <QueryTaskLabel icon={icon} name={name} />
      <div className='ml-auto'>
        <DataSourceTip widgetId={widgetId} useDataSource={useDataSource} onStatusChange={handleStatusChange} />
      </div>
      <Button aria-label={name} className='ml-2' size='sm' type='tertiary' disabled={!enabled} icon>
        <Icon size={16} icon={iconMap.arrowRight} autoFlip />
      </Button>
    </div>
  )
}
