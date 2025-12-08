/** @jsx jsx */
import { React, jsx, type ImmutableObject, defaultMessages as jimuCoreMessages, hooks, css, Immutable, appConfigUtils } from 'jimu-core'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'
import { Button, type IconComponentProps, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { List, TreeItemActionType, type TreeItemType, type TreeItemsType } from 'jimu-ui/basic/list-tree'
import Indicator3d from './indicator-3d'
import type { IMConfig, BasemapInfo, BasemapFromUrl } from '../../config'
import { isBasemapFromUrl } from '../../utils'
import { EditOutlined } from 'jimu-icons/outlined/editor/edit'
import { SidePopper } from 'jimu-ui/advanced/setting-components'
import { AddBasemapsByUrlPopperContent } from './add-by-url'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import defaultMessages from '../translations/default'

interface Props extends AllWidgetSettingProps<IMConfig> {
  token: string
  onCustomBasemapsChange: (basemaps: Array<ImmutableObject<BasemapInfo>>) => void
}

const style = css`
  .jimu-tree-item__body {
    padding: 0.5rem 0.5rem 0.5rem 0;
    cursor: move;
    .jimu-tree-item__icon {
      position: relative;
      padding: 0 !important;
      .thumbnail {
        width: 80px !important;
        height: 53px !important;
        object-fit: cover;
      }
      .edit-btn {
        position: absolute;
        right: 1px;
        bottom: 1px;
        padding: 2px;
        background: var(--sys-color-secondary-main);
        border: none;
        border-radius: none;
        >.icon-btn-sizer {
          min-width: 0;
          min-height: 0;
        }
        svg {
          width: 16px !important;
          height: 16px !important;
        }
      }
    }
    .jimu-tree-item__title {
      margin: 0 0.5rem 0 0.5rem;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
      font-size: 0.8125rem;
      line-height: 1.0625rem;
      font-weight: 400;
    }
    .del-btn {
      opacity: 0;
      &:focus, &:active {
        opacity: 1;
      }
    }
    &:hover, &:focus, &:active {
      .del-btn {
        opacity: 1;
      }
    }
  }
`

const CustomBasemapList = (props: Props) => {
  const { config, token, onCustomBasemapsChange } = props
  const { customBasemaps } = config

  const translate = hooks.useTranslation(defaultMessages, jimuCoreMessages, jimuUIMessages)

  const onRemove = (id: string) => {
    onCustomBasemapsChange(customBasemaps.asMutable().filter((item) => item.id !== id))
  }

  const [isOpenPopper, setIsOpenPopper] = React.useState(false)

  const editButtonRef = React.useRef<HTMLButtonElement>(null)

  const [editingBasemapId, setEditingBasemapId] = React.useState('')

  const onEditBasemapFromUrl = (item: BasemapFromUrl) => {
    const newCustomBasemaps = customBasemaps.asMutable()
    const index = newCustomBasemaps.findIndex((i) => i.id === item.id)
    newCustomBasemaps[index] = Immutable(item)
    onCustomBasemapsChange(newCustomBasemaps)

    setIsOpenPopper(false)
    setEditingBasemapId('')
  }

  // for undo case, if delete the editing basemap, should close the edit popper
  const editBasemapInfo = React.useMemo(() => customBasemaps.find((item) => item.id === editingBasemapId), [customBasemaps, editingBasemapId])
  React.useEffect(() => {
    if (editingBasemapId && !editBasemapInfo && isOpenPopper) {
      setIsOpenPopper(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editBasemapInfo])

  return <React.Fragment>
    <List
      size='default'
      className='p-4'
      css={style}
      itemsJson={customBasemaps.asMutable().map((item, index) => {
        const mutableItem = item.asMutable({ deep: true })
        const thumbnailUrl = isBasemapFromUrl(mutableItem) ? appConfigUtils.processResourceUrl(mutableItem.thumbnail?.url) : `${mutableItem.thumbnailUrl}?token=${token}`
        return {
          itemStateDetailContent: item,
          itemKey: mutableItem.id,
          itemStateIcon: { icon: thumbnailUrl },
          itemStateTitle: mutableItem.title
        }
      })}
      dndEnabled
      onDidDrop={(actionData, refComponent) => {
        const { itemJsons } = refComponent.props
        const [, listItemJsons] = itemJsons as [TreeItemType, TreeItemsType]

        const sortedBasemaps = listItemJsons.map(item => {
          return (item.itemStateDetailContent as ImmutableObject<BasemapInfo>)
        })
        const orderChanged = sortedBasemaps.map((tool) => tool.id).join(',') !== customBasemaps.map((item) => item.id).join(',')
        if (orderChanged) {
          onCustomBasemapsChange(sortedBasemaps)
        }
      }}
      overrideItemBlockInfo={({ itemBlockInfo }) => {
        return {
          name: TreeItemActionType.RenderOverrideItem,
          children: [{
            name: TreeItemActionType.RenderOverrideItemDroppableContainer,
            children: [{
              name: TreeItemActionType.RenderOverrideItemDraggableContainer,
              children: [{
                name: TreeItemActionType.RenderOverrideItemBody,
                children: [{
                  name: TreeItemActionType.RenderOverrideItemDragHandle
                }, {
                  name: TreeItemActionType.RenderOverrideItemIcon
                }, {
                  name: TreeItemActionType.RenderOverrideItemTitle
                }, {
                  name: TreeItemActionType.RenderOverrideItemCommands
                }]
              }]
            }]
          }]
        }
      }}
      renderOverrideItemCommands={(actionData, refComponent) => {
        const { itemJsons } = refComponent.props
        const currentItemJson = itemJsons[0]
        const id = currentItemJson.itemKey
        return <Button size="sm" type="tertiary" icon className='del-btn p-0 border-0'
          title={translate('delete')} aria-label={translate('delete')}
          onClick={(evt) => {
            evt.stopPropagation()
            onRemove(id)
          }}
          onKeyDown={(evt) => {
            if (evt.key === 'Enter' || evt.key === ' ') {
              evt.stopPropagation()
              onRemove(id)
            }
          }}
        >
          <CloseOutlined />
        </Button>
      }}
      renderOverrideItemIcon={(actionData, refComponent) => {
        const { itemJsons } = refComponent.props
        const currentItemJson = itemJsons[0]
        const iconProp = currentItemJson.itemStateIcon as IconComponentProps
        const basemapInfo = currentItemJson.itemStateDetailContent as ImmutableObject<BasemapInfo>
        const onEdit = (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLButtonElement>) => {
          setEditingBasemapId(basemapInfo.id)
          editButtonRef.current = e.target as HTMLButtonElement
          setIsOpenPopper(true)
        }
        return <div className='jimu-tree-item__icon'>
          <img className='thumbnail' src={iconProp?.icon || require('../assets/default-thumbnail.svg')} onError={(e) => { (e.target as HTMLImageElement).src = require('../assets/default-thumbnail.svg') }} />
          <Indicator3d basemapInfo={basemapInfo.asMutable({ deep: true })} style={{ left: '2px', top: '2px' }} />
          {isBasemapFromUrl(basemapInfo) && <Button
            className='edit-btn' icon type='tertiary' title={translate('edit')} aria-label={translate('edit')}
            onClick={onEdit} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                onEdit(e)
              }
            }}>
            <EditOutlined size={16} />
          </Button>}
        </div>
      }}
    />
    <SidePopper
      position='right' title={translate('addBasemapsByUrl')} aria-label={translate('addBasemapsByUrl')}
      isOpen={isOpenPopper} toggle={() => { setIsOpenPopper(false) }} trigger={editButtonRef.current}>
      <AddBasemapsByUrlPopperContent {...props} editingBasemapId={editingBasemapId} onConfirm={onEditBasemapFromUrl} />
    </SidePopper>
  </React.Fragment>
}

export default CustomBasemapList
