import { React, hooks, css } from 'jimu-core'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'
import { Button, Select, Tab, Tabs } from 'jimu-ui'
import type { LayersConfig } from '../../config'
import type { JSX } from 'react'
import defaultMessages from '../translations/default'

export interface Props {
  allLayersConfig: LayersConfig[]
  isHorizontalTab: boolean
  activeTabId: string
  searchOn: boolean
  toolListNode: JSX.Element
  onTabClick: (tabId: string) => void
  onCloseTab: (tabId: string, evt?) => void
}

const getStyles = () => css`
  &.table-tab-select{
    .horizontal-tab-select{
      margin-bottom: 4px;
      .activeBtn{
        color: #fff;
        background-color: #076fe5;
      }
    }
    .dropdown-tab-select{
      height: 40px;
      margin-bottom: 4px;
      .dropdown-button{
        height: 32px;
      }
    }
    .tab-flex{
      width: 100%;
      overflow-x: auto;
      .closeable{
        height: 31px;
      }
    }
  }
`

const TableTabSelect = (props: Props) => {
  const {
    allLayersConfig, isHorizontalTab, activeTabId, searchOn, toolListNode, onTabClick, onCloseTab
  } = props
  const translate = hooks.useTranslation(defaultMessages)

  return (
    <div
      className={`d-flex table-tab-select ${
        isHorizontalTab ? 'horizontal-tab-select' : 'dropdown-tab-select'
      }`}
      css={getStyles()}
    >
      {isHorizontalTab
        ? <Tabs
          scrollable
          type='underline'
          className='tab-flex'
          value={activeTabId}
          onChange={onTabClick}
          onClose={onCloseTab}
        >
          {
            allLayersConfig.map(item => {
              const isDataAction = !!item.dataActionObject
              return (
                <Tab
                  key={item.id}
                  id={item.id}
                  title={item.name}
                  className='text-truncate'
                  closeable={isDataAction}
                >
                  <div className='mt-2' />
                </Tab>
              )
            }) as any
          }
        </Tabs>
        : (
          <Select
            size='sm'
            value={activeTabId}
            onChange={(evt) => { onTabClick(evt?.target?.value) }}
            className='top-drop'
            aria-label={translate('selectSheet')}
          >
            {allLayersConfig.map(item => {
              return (
                <option key={item.id} value={item.id} title={item.name}>
                  <div className='table-action-option'>
                    <div className='table-action-option-tab' title={item.name}>{item.name}</div>
                    {item.dataActionObject &&
                      <div className='table-action-option-close'>
                        <Button
                          size='sm'
                          icon
                          type='tertiary'
                          onClick={(evt) => { onCloseTab(item.id, evt) }}
                        >
                          <CloseOutlined size='s' />
                        </Button>
                      </div>
                    }
                  </div>
                </option>
              )
            })}
          </Select>
          )
      }
      {!searchOn && toolListNode}
    </div>
  )
}

export default TableTabSelect
