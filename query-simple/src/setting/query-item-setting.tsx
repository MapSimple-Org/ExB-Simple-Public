/** @jsx jsx */
import { React, jsx, type ImmutableObject } from 'jimu-core'
import type { QueryItemType, QueryArrangeType } from '../config'
import { QueryItemSettingMain } from './query-item-main-mode'
import { QueryItemSettingMapMode } from './query-item-map-mode'
import { QueryItemSettingDataMode } from './query-item-data-mode'

interface Props {
  widgetId: string
  arrangeType: QueryArrangeType
  total: number
  index: number
  queryItem?: ImmutableObject<QueryItemType>
  onQueryItemChanged: (index: number, item: ImmutableObject<QueryItemType>, dsUpdateRequired?: boolean) => void
  onQueryItemAdded: (item: ImmutableObject<QueryItemType>) => void
}

export function QueryItemSetting (props: Props) {
  const { widgetId, index, queryItem, onQueryItemChanged } = props
  const [viewStage, setViewStage] = React.useState(0)

  React.useEffect(() => {
    if (!queryItem?.useDataSource) {
      setViewStage(0)
    }
  }, [queryItem?.useDataSource])

  const handleStageChange = (id: number) => {
    if (id >= 0) {
      setViewStage(id)
    }
  }

  return (
    <div className='h-100'>
      <QueryItemSettingMain {...props} visible={viewStage === 0} handleStageChange={handleStageChange} />
      {queryItem && (
        <QueryItemSettingMapMode
          index={index}
          queryItem={queryItem}
          visible={viewStage === 1}
          onQueryItemChanged={onQueryItemChanged}
          handleStageChange={handleStageChange}
        />
      )}
      {queryItem && (
        <QueryItemSettingDataMode
          index={index}
          widgetId={widgetId}
          queryItem={queryItem}
          visible={viewStage === 2}
          onQueryItemChanged={onQueryItemChanged}
          handleStageChange={handleStageChange}
        />
      )}
    </div>
  )
}
