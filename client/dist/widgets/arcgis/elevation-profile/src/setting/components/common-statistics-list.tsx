/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, type IMThemeVariables, type IntlShape } from 'jimu-core'
import { Checkbox, Tooltip, Label, Icon, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { List, TreeItemActionType, type TreeItemsType, type TreeItemType } from 'jimu-ui/basic/list-tree'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { getStatisticsListStyle } from '../lib/style'
import type { Statistics } from '../../config'
import defaultMessages from '../translations/default'
import { getConfigIcon } from '../constants'

const { epConfigIcon } = getConfigIcon()

interface Props {
  intl: IntlShape
  theme: IMThemeVariables
  availableStatistics: Statistics[]
  onStatsListUpdated: (statsList: Statistics[]) => void
}

export default class StatisticsList extends React.PureComponent<Props> {
  private _statistics: Statistics[]
  constructor (props) {
    super(props)
    this._statistics = []
  }

  nls = (id: string) => {
    const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages)
    //for unit testing no need to mock intl we can directly use default en msg
    if (this.props.intl && this.props.intl.formatMessage) {
      return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] })
    } else {
      return messages[id]
    }
  }

  componentDidMount = () => {
    const statisticsConfig = []
    //Update initial config saved statistics
    this.props.availableStatistics.forEach((stat) => {
      const configProperty = {
        name: stat.name,
        label: stat.label,
        enabled: stat.enabled
      }
      statisticsConfig.push(configProperty)
    })
    if (statisticsConfig.length > 0 && this._statistics.length !== statisticsConfig.length) {
      this._statistics = statisticsConfig
    }
    this.props.onStatsListUpdated(this._statistics)
  }

  componentDidUpdate = (prevProps) => {
    if (this.isStatsPropsChange(prevProps)) {
      this._statistics = this.props.availableStatistics
    }
  }

  isStatsPropsChange = (prevProps) => {
    let isChangeDone = false
    if (prevProps.availableStatistics.length > 0) {
      prevProps.availableStatistics.some((stats) => (
        this.props.availableStatistics.some((currentStats) => {
          if (stats.name === currentStats.name) {
            if (stats.enabled !== currentStats.enabled) {
              isChangeDone = true
              return true
            }
          }
          return false
        })
      ))
    }
    return isChangeDone
  }

  /**
  * Create checkbox and label element in the individual statistics list items
  */
  createOptionElement = (stat: any, index: number): any => {
    const _options = (
      <div style={{ width: 180 }}>
        <SettingRow>
          <Checkbox role={'çheckbox'} className={'cursor-pointer mr-2 font-13'}
            aria-label={stat.label} checked={stat.enabled}
            onChange={e => { this.onCheckBoxChange(e, index) }} />
          <div className={'text-truncate'} title={stat.label}>{this.nls(stat.name)}</div>
        </SettingRow>
      </div>
    )
    return _options
  }

  onCheckBoxChange = (evt: React.FormEvent<HTMLInputElement>, statIndex: number) => {
    const statistics = this._statistics
    let updatedSettings: Statistics
    statistics.some((statsSetting, index) => {
      if (statIndex === index) {
        updatedSettings = {
          name: statsSetting.name,
          label: statsSetting.label,
          enabled: evt.currentTarget.checked
        }
        return true
      }
      return false
    })
    evt.stopPropagation()
    this.updateItem(statIndex, updatedSettings)
  }

  updateItem = (index: number, itemAttributes: any) => {
    if (index > -1) {
      this._statistics = [
        ...this._statistics.slice(0, index),
        Object.assign({}, this._statistics[index], itemAttributes),
        ...this._statistics.slice(index + 1)
      ]

      this.props.onStatsListUpdated(this._statistics)
    }
  }

  render () {
    return <div css={getStatisticsListStyle(this.props.theme)} className={'pt-4 pb-2'}>
      <SettingRow>
        <Label tabIndex={0} aria-label={this.nls('statisticsListLabel')} className='w-100 d-flex'>
          <div className={'flex-grow-1 text-break color-label'}>
            {this.nls('statisticsListLabel')}
          </div>
        </Label>
        <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('statisticsListTooltip')}
          title={this.nls('statisticsListTooltip')} showArrow placement='top'>
          <div className='ml-2 d-inline color-label'>
            <Icon size={14} icon={epConfigIcon.infoIcon} />
          </div>
        </Tooltip>
      </SettingRow>

      {<div className={'pt-2'}>
        <List size='sm' className={this.props.availableStatistics && this.props.availableStatistics.length === 0 ? 'hidden' : 'ep-statistics-list-items'}
          itemsJson={Array.from(this.props.availableStatistics).map((stats, index) => ({
            itemStateDetailContent: stats,
            itemKey: `${index}`
          }))}
          dndEnabled
          onUpdateItem={(actionData, refComponent) => {
            const { itemJsons } = refComponent.props
            const [, parentItemJson] = itemJsons as [TreeItemType, TreeItemsType]
            const newSortedStatistics = parentItemJson.map(item => {
              return item.itemStateDetailContent
            })
            this._statistics = newSortedStatistics
            this.props.onStatsListUpdated(newSortedStatistics)
          }}
          overrideItemBlockInfo={() => {
            return {
              name: TreeItemActionType.RenderOverrideItem,
              children: [{
                name: TreeItemActionType.RenderOverrideItemDroppableContainer,
                withListGroupItemWrapper: false,
                children: [{
                  name: TreeItemActionType.RenderOverrideItemDraggableContainer,
                  children: [{
                    name: TreeItemActionType.RenderOverrideItemBody,
                    children: [{
                      name: TreeItemActionType.RenderOverrideItemDragHandle
                    }, {
                      name: TreeItemActionType.RenderOverrideItemMainLine
                    }]
                  }]
                }]
              }]
            }
          }}
          renderOverrideItemMainLine={(actionData, refComponent) => {
            const { itemJsons } = refComponent.props
            const currentItemJson = itemJsons[0]
            const listItemJsons = itemJsons[1] as any
            return this.createOptionElement(currentItemJson.itemStateDetailContent, listItemJsons.indexOf(currentItemJson))
          }}
        />
      </div>
      }
    </div>
  }
}
