/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, type IntlShape, type IMThemeVariables, lodash } from 'jimu-core'
import { Checkbox, Button, Icon, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { List, TreeItemActionType, type TreeItemsType, type TreeItemType } from 'jimu-ui/basic/list-tree'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import { getTableStyle } from '../lib/style'
import defaultMessages from '../translations/default'
import type { OutputSettings } from '../../config'

const iconEdit = require('jimu-ui/lib/icons/edit.svg')

interface Props {
  theme: IMThemeVariables
  intl: IntlShape
  allSupportedFormats: OutputSettings[]
  onEditClick?: () => void
  onSettingsUpdate?: (prop: OutputSettings[]) => void
}

interface State {
  isAllChecked: boolean
}

export default class CoordinateTable extends React.PureComponent<Props, State> {
  private _outputSettings: OutputSettings[]

  constructor (props) {
    super(props)
    this._outputSettings = []
    this.state = {
      isAllChecked: false
    }
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
    let isAllChecked = true
    const coordinateConfig = []
    this.props.allSupportedFormats.forEach((coordinateFormat) => {
      const configProperty = {
        name: coordinateFormat.name,
        label: coordinateFormat.label,
        defaultPattern: coordinateFormat.defaultPattern,
        currentPattern: coordinateFormat.currentPattern,
        enabled: coordinateFormat.enabled,
        isCustom: coordinateFormat.isCustom
      }
      coordinateConfig.push(configProperty)
      if (!coordinateFormat.enabled) {
        isAllChecked = false
      }
    })
    if (coordinateConfig.length > 0 && this._outputSettings.length !== coordinateConfig.length) {
      this._outputSettings = coordinateConfig
    }
    this.props.onSettingsUpdate(this._outputSettings)
    this.setState({
      isAllChecked: isAllChecked
    })
  }

  componentDidUpdate = (prevProps) => {
    if (!lodash.isDeepEqual(prevProps.allSupportedFormats, this.props.allSupportedFormats)) {
      this._outputSettings = this.props.allSupportedFormats
      let isAllChecked = true
      this.props.allSupportedFormats.forEach((coordinateFormat) => {
        if (!coordinateFormat.enabled) {
          isAllChecked = false
        }
      })
      this.setState({
        isAllChecked: isAllChecked
      })
    }
  }

  updateHeaderCheckBoxState = (updatedSettings) => {
    let isAllChecked = true
    updatedSettings.some((formatSettings) => {
      if (!formatSettings.enabled) {
        isAllChecked = false
        return true
      }
      return false
    })
    this.setState({
      isAllChecked: isAllChecked
    })
  }

  onHeaderCheckBoxChange = (checked) => {
    const outputSettings = this._outputSettings
    const updatedSettings = outputSettings.map((coordinateSetting) => {
      const temp = Object.assign({}, coordinateSetting)
      temp.enabled = checked
      return temp
    })
    this.props.onSettingsUpdate(updatedSettings)
    this._outputSettings = updatedSettings
    this.updateHeaderCheckBoxState(this._outputSettings)
  }

  onCheckBoxChange = (evt, formatIndex: number) => {
    const outputSettings = this._outputSettings
    let updatedSettings: OutputSettings
    outputSettings.some((coordinateSetting, index) => {
      if (formatIndex === index) {
        updatedSettings = {
          name: coordinateSetting.name,
          label: coordinateSetting.label,
          defaultPattern: coordinateSetting.defaultPattern,
          currentPattern: coordinateSetting.currentPattern,
          enabled: evt.target.checked,
          isCustom: coordinateSetting.isCustom
        }
        return true
      }
      return false
    })
    evt.stopPropagation()
    this.updateItem(formatIndex, updatedSettings)
  }

  updateItem (index, itemAttributes) {
    if (index > -1) {
      this._outputSettings = [
        ...this._outputSettings.slice(0, index),
        Object.assign({}, this._outputSettings[index], itemAttributes),
        ...this._outputSettings.slice(index + 1)
      ]

      this.props.onSettingsUpdate(this._outputSettings)
      this.updateHeaderCheckBoxState(this._outputSettings)
    }
  }

  onEditButtonClick = () => {
    this.props.onEditClick()
  }

  /**
  * Create checkbox, label, format elements in the individual list items
  */

  createOptionElement = (coordinateFormat: any, index: number): any => {
    const coordsConfig = []
    const inputOption = {
      name: coordinateFormat.name,
      label: coordinateFormat.label,
      defaultPattern: coordinateFormat.defaultPattern,
      currentPattern: coordinateFormat.currentPattern,
      enabled: coordinateFormat.enabled,
      isCustom: coordinateFormat.isCustom
    }
    coordsConfig.push(inputOption)
    const _options = (
      <div className={'rowDimensions'}>
        <SettingRow>
          <Checkbox className={'cursor-pointer mr-2 font-13'} checked={coordinateFormat.enabled}
            onChange={e => { this.onCheckBoxChange(e, index) }} />
          <div className={'coordinatesNotation text-truncate'} title={coordinateFormat.label}>{coordinateFormat.label}</div>
          <div className={'coordinateFormat pl-1 text-truncate'} title={coordinateFormat.currentPattern}>{coordinateFormat.currentPattern}</div>
        </SettingRow>
      </div>
    )
    return _options
  }

  /**
  * Create header for the coordinates list
  */
  createHeaderElement = () => {
    const _header = (
      <div className={'tableHeading'}>
        <SettingRow>
          <Checkbox className={'cursor-pointer alignBox mr-2 font-13'}
            checked={this.state.isAllChecked}
            onChange={evt => { this.onHeaderCheckBoxChange(evt.target.checked) }} />
          <div className={'coordinateHeaderLabel text-truncate'} title={this.nls('coordinateLabel')}>{this.nls('coordinateLabel')}</div>
          <div className={'coordinateHeaderFormat pl-1 text-truncate'} title={this.nls('coordinateFormat')}>{this.nls('coordinateFormat')}</div>
          <span><Button aria-label={this.nls('edit')} className={'ml-2'} title={this.nls('edit')} size={'sm'} icon type={'tertiary'}
            onClick={this.onEditButtonClick.bind(this)}>
            <Icon icon={iconEdit} size={12} />
          </Button></span>
        </SettingRow>
      </div>
    )
    return _header
  }

  render () {
    const header = this.createHeaderElement()
    return <div css={getTableStyle(this.props.theme)} style={{ height: '100%', width: '100%' }}>
      <div className={this.props.allSupportedFormats && this.props.allSupportedFormats.length === 0 ? 'hidden' : ''}>
        {header}
        <List className={'coordinate-converion-list-items'}
          itemsJson={Array.from(this.props.allSupportedFormats).map((coordinateFormat, index) => ({
            itemStateDetailContent: coordinateFormat,
            itemKey: `${index}`
          }))}
          dndEnabled
          onUpdateItem={(actionData, refComponent) => {
            const { itemJsons } = refComponent.props
            const [, parentItemJson] = itemJsons as [TreeItemType, TreeItemsType]
            const newSortedConversions = parentItemJson.map(item => {
              return item.itemStateDetailContent
            })
            this._outputSettings = newSortedConversions
            this.props.onSettingsUpdate(newSortedConversions)
          }}
          overrideItemBlockInfo={({ itemBlockInfo }) => {
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
    </div >
  }
}
