/** @jsx jsx */
import { React, jsx, css, type ImmutableArray, hooks, defaultMessages as jimuCoreMessages } from 'jimu-core'
import { Alert, defaultMessages as jimuUIMessage } from 'jimu-ui'
import { type _TreeItem, List, type TreeActionDataType, type TreeItemsType, type TreeRenderOverrideItemDataType, type UpdateTreeActionDataType } from 'jimu-ui/basic/list-tree'
import IconClose from 'jimu-icons/svg/outlined/editor/close.svg'
import type { LayersConfig } from '../../config'
import { advancedActionMap } from './utils'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { getDataSourceById } from '../../utils'

interface LayerListProps {
  layersConfig: ImmutableArray<LayersConfig>
  activeIndex: number
  failedDataSourceIds: string[]
  onRemove: (dsId: string) => void
  onSort: (dsIds: string[]) => void
  onClick: (dsId: string) => void
}

const getStyle = () => {
  return css`
    display: block !important;
    &.setting-ui-unit-list {
      width: 100%;
      .tree-item {
        justify-content: space-between;
        align-items: center;
        font-size: 13px;
        &.tree-item_level-1 {
        }
        .jimu-checkbox {
          margin-right: 8px;
        }
      }
      .setting-ui-unit-list-new {
        padding-top: 4px;
      }
    }
  `
}

const LayerList = (props: LayerListProps) => {
  const { layersConfig, activeIndex, failedDataSourceIds, onRemove, onSort, onClick } = props

  const translate = hooks.useTranslation(jimuUIMessage, jimuCoreMessages)

  const itemsLength = layersConfig.length
  const itemsJson = React.useMemo<TreeItemsType>(() => {
    const mutableLayersConfig = layersConfig.asMutable({ deep: true })
    return mutableLayersConfig.map((item, index) => ({
      itemStateDetailContent: item,
      itemKey: item.id,
      itemStateTitle: item.name,
      itemStateChecked: index === activeIndex,
      itemStateCommands: [{
        label: translate('remove'),
        iconProps: () => ({ icon: IconClose, size: 12 }),
        action: () => {
          onRemove(item.id)
        }
      }]
    }))
  }, [activeIndex, layersConfig, onRemove, translate])

  const alertIcon = React.useMemo(() => {
    return <Alert
      variant='text'
      form='tooltip'
      size='small'
      type='error'
      text={translate('dataSourceCreateError')}
    />
  }, [translate])

  const renderDetail = React.useCallback((actionData: TreeRenderOverrideItemDataType, refComponent: _TreeItem) => {
    const { itemJsons } = refComponent.props
    const [currentItemJson] = itemJsons
    const dsId = currentItemJson?.itemStateDetailContent?.useDataSource?.dataSourceId
    const failed = failedDataSourceIds.includes(dsId) || !getDataSourceById(dsId)
    return failed ? alertIcon : null
  }, [alertIcon, failedDataSourceIds])

  const handleSort = React.useCallback((actionData: UpdateTreeActionDataType, refComponent: _TreeItem) => {
    if (actionData.updateType === 'handleDidDrop') {
      const dsIds = actionData.targetDropItemChildren.map(item => item.itemKey)
      onSort(dsIds)
    }
  }, [onSort])

  const handleClick = React.useCallback((actionData: TreeActionDataType, refComponent: _TreeItem) => {
    const { itemJsons: [currentItemJson] } = refComponent.props
    onClick(currentItemJson.itemKey)
  }, [onClick])

  const itemPlaceholder = React.useMemo(() => [{
    itemStateDetailContent: '......',
    itemKey: `${activeIndex}`,
    itemStateTitle: '......',
    itemStateChecked: true,
    itemStateCommands: []
  }], [activeIndex])

  return <SettingRow className='setting-ui-unit-list' css={getStyle()}>
    {itemsLength > 0 &&
      <List
        className='w-100'
        itemsJson={itemsJson}
        dndEnabled
        renderOverrideItemDetailToggle={renderDetail}
        onUpdateItem={handleSort}
        onClickItemBody={handleClick}
        {...advancedActionMap}
      />
    }
    {itemsLength === activeIndex &&
      <List
        className='setting-ui-unit-list-new'
        itemsJson={itemPlaceholder}
        dndEnabled={false}
        renderOverrideItemDetailToggle={() => '' }
        {...advancedActionMap}
      />
    }
  </SettingRow>
}

export default LayerList
