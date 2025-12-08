/** @jsx jsx */
import { React, jsx, type IntlShape } from 'jimu-core'
import { Select, Option, NumericInput, Icon, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { ColorPicker } from 'jimu-ui/basic/color-picker'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import type { AssetStyle } from '../../config'
import defaultMessages from '../translations/default'
import { lineTypeList, intersectingAssetShapeList } from '../constants'

interface Props {
  intl: IntlShape
  intersectingAssetItem: string
  config: AssetStyle
  layerGeometryType: string
  onIntersectingAssetStyleChange: (objectKey: string, property: string, style: any) => void
}

interface IState {
  intersectingAssetColor: string
  intersectingAssetShape: string
  intersectingAssetSize: number
}

export default class IntersectingAssetStylePicker extends React.PureComponent<Props, IState> {
  constructor (props) {
    super(props)
    const defaultColor = '#049546'
    const defaultSize = this.props.layerGeometryType === 'esriGeometryPoint' ? 6 : 4
    const defaultShape = this.props.layerGeometryType === 'esriGeometryPoint' ? 'circle' : 'solid-line'
    this.state = {
      intersectingAssetColor: this.props.config.intersectingAssetColor ? this.props.config.intersectingAssetColor : defaultColor,
      intersectingAssetShape: this.props.config.intersectingAssetShape ? this.props.config.intersectingAssetShape : defaultShape,
      intersectingAssetSize: this.props.config.intersectingAssetSize ? this.props.config.intersectingAssetSize : defaultSize
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
    this.props.onIntersectingAssetStyleChange(this.props.intersectingAssetItem, 'intersectingAssetShape', this.state.intersectingAssetShape)
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.config.intersectingAssetColor !== this.props.config.intersectingAssetColor) {
      this.setState({
        intersectingAssetColor: this.props.config.intersectingAssetColor
      })
    } else if (prevProps.config.intersectingAssetShape !== this.props.config.intersectingAssetShape) {
      this.setState({
        intersectingAssetShape: this.props.config.intersectingAssetShape
      })
    } else if (prevProps.config.intersectingAssetSize !== this.props.config.intersectingAssetSize) {
      this.setState({
        intersectingAssetSize: this.props.config.intersectingAssetSize
      })
    }
  }

  onIntersectingAssetColorChange = (color: string) => {
    this.setState({
      intersectingAssetColor: color
    })
    this.props.onIntersectingAssetStyleChange(this.props.intersectingAssetItem, 'intersectingAssetColor', color)
  }

  onIntersectingAssetShapeChange = (evt: React.FormEvent<HTMLInputElement>) => {
    this.setState({
      intersectingAssetShape: evt.currentTarget.value
    })
    this.props.onIntersectingAssetStyleChange(this.props.intersectingAssetItem, 'intersectingAssetShape', evt.currentTarget.value)
  }

  onIntersectingAssetSizeChange = (value: number) => {
    if (value === null) {
      return
    }

    this.setState({
      intersectingAssetSize: value
    })
    this.props.onIntersectingAssetStyleChange(this.props.intersectingAssetItem, 'intersectingAssetSize', value)
  }

  render () {
    return <div className={'pt-5 pb-4'}>
      <SettingRow>
        <ColorPicker aria-label={this.nls('styleColor')} className={'mr-2'} width='54px' height='26px'
          offset={[0, 0]} placement={'auto'} showArrow color={this.state.intersectingAssetColor ? this.state.intersectingAssetColor : '#FFFFFF'}
          onChange={this.onIntersectingAssetColorChange} />
        <Select aria-label={this.nls('styleShape') + this.state.intersectingAssetShape} size={'sm'} name={'symbolPicker'}
          onChange={this.onIntersectingAssetShapeChange} value={this.state.intersectingAssetShape}>
          {this.props.layerGeometryType === 'esriGeometryPoint' && intersectingAssetShapeList.map((item, index) => {
            const iconComponent = require(`../assets/icons/${item.value}.svg`)
            return <Option role={'option'} aria-label={item.label} key={index} value={item.value} title={this.nls(item.label)}>
              {<Icon size={12} icon={iconComponent} />}
            </Option>
          })}
          {this.props.layerGeometryType === 'esriGeometryPolyline' && lineTypeList.map((item, index) => {
            const iconComponent = require(`../assets/icons/${item.value}.svg`)
            return <Option role={'option'} aria-label={item.label} key={index} value={item.value} title={this.nls(item.label)}>
              {<Icon width={60} height={12} icon={iconComponent} />}
            </Option>
          })}
        </Select>
        <NumericInput aria-label={this.nls('styleSize')} size={'sm'} className={'ml-2'} min={1} max={20}
          value={this.state.intersectingAssetSize} onChange={this.onIntersectingAssetSizeChange} />
      </ SettingRow>
    </div>
  }
}
