/** @jsx jsx */
import { React, jsx, Immutable, type ImmutableObject, type ImmutableArray, hooks } from 'jimu-core'
import { defaultMessages as jimuUIMessages } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import { List, type ListItemsType, TreeItemActionType } from 'jimu-ui/basic/list-tree'
import defaultMessages from '../translations/default'
import { ToolsID, type Tool3D } from '../../constraints'
import settingOutlined from 'jimu-icons/svg/outlined/application/setting.svg'

export interface Props {
  tools: ImmutableArray<Tool3D>
  onToolsConfigChanged: (tools: ImmutableArray<Tool3D>) => void

  onSidePopperToggle: (toolsID: ToolsID, btnRef) => void
}

export const ToolsContainer = React.memo((props: Props) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  // List
  const _onSidePopperToggle = props.onSidePopperToggle
  const handleToolEdit = React.useCallback((tool: ImmutableObject<Tool3D>, data) => {
    _onSidePopperToggle(tool.id, data.event.target)
  }, [_onSidePopperToggle])
  const toolsToListItems = React.useCallback((tools: ImmutableArray<Tool3D>) => {
    const listItems = tools?.map((tool: ImmutableObject<Tool3D>) => {
      const isEnable = tool.enable
      const comd = [{
        label: translate('edit'),
        iconProps: () => ({ icon: settingOutlined }),
        action: (data) => {
          handleToolEdit(tool, data)
        }
      }]
      return {
        itemKey: tool.id,
        itemStateTitle: translate(tool.id),
        itemStateChecked: isEnable,
        itemStateCommands: (tool.id !== ToolsID.LineOfSight) ? comd : []
      }
    })

    return listItems.asMutable() as unknown as ListItemsType
  }, [handleToolEdit, translate])

  const [listItems, setListItems] = React.useState<ListItemsType>(() => {
    return toolsToListItems(props.tools)
  })
  React.useEffect(() => {
    setListItems(toolsToListItems(props.tools))
  }, [props.tools, toolsToListItems])

  return (
    <React.Fragment>
      <SettingSection title={translate('tools')} role='group' aria-label={translate('tools')}>
        <SettingRow>
          <div className='w-100'>
            <List
              className='w-100 py-1 pl-0 pr-1'
              itemsJson={listItems}
              isMultiSelection={true}
              dndEnabled={true}
              disableDoubleClickTitle={true}
              onUpdateItem={(actionData, refComponent) => {
                const [, nextItemsJson] = actionData.itemJsons
                const itemsInList = [...nextItemsJson]

                const newConfig = []
                if (actionData.updateType === TreeItemActionType.HandleCheckboxChanged) {
                  // 1.update enable/disable
                  props.tools.forEach((config) => {
                    itemsInList.forEach((item) => {
                      const key = item.itemKey
                      if (config.id === key) {
                        config = config.setIn(['enable'], item.itemStateChecked)
                        newConfig.push(config)
                      }
                    })
                  })
                } else if (actionData.updateType === TreeItemActionType.HandleDidDrop) {
                  // 2.reorder list
                  itemsInList.forEach((item) => {
                    const key = item.itemKey
                    const foundIdx = props.tools.findIndex((tool) => {
                      return tool.id === key
                    })

                    if (foundIdx > -1) {
                      newConfig.push(props.tools[foundIdx])
                    }
                  })
                }

                props.onToolsConfigChanged(Immutable(newConfig))
              }}
            />
          </div>
        </SettingRow>
      </SettingSection>
    </React.Fragment>
  )
})
