/** @jsx jsx */
import { css, jsx, React, Immutable, type ImmutableArray, type IMThemeVariables, type IntlShape, hooks } from 'jimu-core'
import { defaultMessages } from 'jimu-ui'
import nls from '../translations/default'
import { type CommandActionDataType, type CommandType, List, type ListItemsType, TreeItemActionType } from 'jimu-ui/basic/list-tree'
import { type UiMode, type Item, ItemsName } from '../../config'
import Edit from 'jimu-icons/svg/outlined/editor/edit.svg'
interface Props {
  uiMode: UiMode
  items?: ImmutableArray<Item>
  onItemsChange: (items: ImmutableArray<Item>) => void

  intl: IntlShape
  theme: IMThemeVariables
  title: string
  onEmailContentClick: (EventTarget) => void
}

export const ItemsSelector = React.memo((props: Props) => {
  const translate = hooks.useTranslation(defaultMessages)

  const getStyle = () => {
    //const theme = props.theme
    return css`
      font-size: 13px;
      font-weight: lighter;

      /* List */
      .jimu-tree {
        .jimu-tree-item {
          .jimu-tree-item__content {
            .jimu-tree-item__body {
              .jimu-tree-item__main-line {
                padding: 0.25rem 0;
              }
              .jimu-tree-item__title-text {
                -webkit-line-clamp: 1;
                word-break: keep-all;
              }
            }
          }
        }
      }
    `
  }
  const emailCommand: CommandType = React.useMemo(() => ({
    key: 'emailContent',
    label: props.intl.formatMessage({ id: 'emailContent', defaultMessage: nls.emailContent }),
    iconProps: {
      icon: Edit,
      width: '16px',
      height: '16px',
      color: props.theme.ref.palette.neutral[1000]
    },
    action: (action: CommandActionDataType) => {
      props.onEmailContentClick(action.event.target)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [props.intl, props.theme, props.onEmailContentClick])

  // List
  const [listItems, setListItems] = React.useState<ListItemsType>([])
  React.useEffect(() => {

    const items = props.items?.map((item: Item) => {
      return {
        itemKey: item.id,
        itemStateTitle: translate(item.id),
        itemStateChecked: item.enable,
        itemStateCommands: item.id === ItemsName.Email ? [emailCommand] : [],
      }
    })

    setListItems(items as unknown as ListItemsType)
  }, [emailCommand, props.items, translate])

  return (
    <div css={getStyle()} aria-label={props.title}>
      <List
        className='w-100 py-1 pl-0 pr-1'
        itemsJson={listItems}
        isMultiSelection={true}
        dndEnabled={true}
        onlyShowOnHover={true}
        disableDoubleClickTitle={true}
        onUpdateItem={(actionData, refComponent) => {
          const [, nextItemsJson] = actionData.itemJsons
          const newItemConfig = []

          if (actionData.updateType === TreeItemActionType.HandleCheckboxChanged) {
            const itemMap = new Map()
            props.items.forEach((item, index) => {
              itemMap.set(item.id, { item, index })
            })
            props.items.forEach(originalItem => {
              const matchingListItem = nextItemsJson.find(listItem => listItem.itemKey === originalItem.id)
              if (matchingListItem) {
                newItemConfig.push(originalItem.setIn(['enable'], matchingListItem.itemStateChecked))
              } else {
                newItemConfig.push(originalItem)
              }
            })
          } else if (actionData.updateType === TreeItemActionType.HandleDidDrop) {
            const processedKeys = new Set()
            nextItemsJson.forEach(listItem => {
              const key = listItem.itemKey
              if (!processedKeys.has(key)) {
                processedKeys.add(key)

                const originalItem = props.items.find(item => item.id === key)
                if (originalItem) {
                  newItemConfig.push(originalItem)
                }
              }
            })
          }

          if (newItemConfig.length === props.items?.length) {
            props.onItemsChange(Immutable(newItemConfig))
          } else {
            console.error(`Item count mismatch: expected ${props.items?.length}, got ${newItemConfig.length}`)
          }
        }}
      />
    </div>
  )
})
