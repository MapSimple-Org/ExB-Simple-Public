/** @jsx jsx */
import { React, jsx, css, hooks, ReactRedux, type IMState, AppMode } from 'jimu-core'
import { defaultMessages as jimuUIMessages } from 'jimu-ui'
import { List } from 'jimu-ui/basic/list-tree'
import type { LayerInfo } from '../../config'
import VisibleOutlined from 'jimu-icons/svg/outlined/application/visible.svg'
import InvisibleOutlined from 'jimu-icons/svg/outlined/application/invisible.svg'

export interface LayerListProps {
  layerList: LayerInfo[]
  onChange?: (jimuLayerViewId: string) => void
  isAllowDeactivateLayers: boolean
  toggleLayerVisibility: boolean
  onToggleLayerVisibility?: (jimuLayerViewId: string) => void
  highlightIndex?: number
}

export const LayerList = (props: LayerListProps) => {
  const { layerList, onChange, isAllowDeactivateLayers, toggleLayerVisibility, highlightIndex } = props
  const translate = hooks.useTranslation(jimuUIMessages)
  const isExpressMode = ReactRedux.useSelector((state: IMState) => state.appRuntimeInfo.appMode === AppMode.Express)

  const getLayerCommands = React.useCallback((layerObj: LayerInfo) => [
    {
      label: translate('visibility'),
      buttonAriaPressed: layerObj?.visible,
      iconProps: { icon: layerObj?.visible ? VisibleOutlined : InvisibleOutlined, size: 16 },
      action: () => {
        props?.onToggleLayerVisibility?.(layerObj.layerId)
      }
    }
  ], [props, translate])

  const [itemsJson, setItemsJson] = React.useState(() => {
    const filteredList = isExpressMode ? layerList?.filter((layerObj: LayerInfo) => layerObj.visible) : layerList
    return filteredList?.map((layerObj: LayerInfo) => {
      return {
        itemKey: layerObj.layerId,
        itemStateTitle: layerObj.title,
        itemStateChecked: isAllowDeactivateLayers ? layerObj.selected : false,
        isCheckboxDisabled: !layerObj.visible,
        itemStateCommands: toggleLayerVisibility ? getLayerCommands(layerObj) : []
      }
    })
  })

  React.useEffect(() => {
    const filteredList = isExpressMode ? layerList?.filter((layerObj: LayerInfo) => layerObj.visible) : layerList
    const newList = filteredList?.map((layerObj: LayerInfo) => {
      return {
        itemKey: layerObj.layerId,
        itemStateTitle: layerObj.title,
        itemStateChecked: isAllowDeactivateLayers ? layerObj.selected : false,
        isCheckboxDisabled: !layerObj.visible,
        itemStateCommands: toggleLayerVisibility ? getLayerCommands(layerObj) : []
      }
    })
    setItemsJson(newList)
  }, [getLayerCommands, isAllowDeactivateLayers, isExpressMode, layerList, toggleLayerVisibility])

  const handleUpdateListItem = (actionData, refComponent) => {
    if (!isAllowDeactivateLayers) {
      return
    }
    const [currentItemJson, nextItemsJson] = actionData.itemJsons
    setItemsJson([...nextItemsJson])
    onChange(currentItemJson.itemKey)
  }

  return (
    <div className='layer-list' css={getStyle(highlightIndex)}>
      <List
        size='default'
        className='w-100'
        itemsJson={itemsJson}
        isMultiSelection={isAllowDeactivateLayers}
        dndEnabled={false}
        disableDoubleClickTitle={true}
        onUpdateItem={handleUpdateListItem}
      />
    </div>
  )
}

function getStyle (highlightIndex: number) {
  return css`
    .jimu-tree-item_template-card .jimu-tree-item__body:hover {
      background-color: transparent !important;
    }
    .jimu-tree-main {
      .jimu-tree-item:nth-of-type(${highlightIndex}) {
        .jimu-tree-item__body {
          border-left: .125rem solid var(--sys-color-primary-main) !important;
        }
      }
    }
  `
}
