/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, type IntlShape, type IMThemeVariables, Immutable, type IMFieldSchema, JimuFieldType, lodash } from 'jimu-core'
import { FieldSelector } from 'jimu-ui/advanced/data-source-selector'
import { Label, Tooltip, Select, Option, Icon, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../translations/default'
import type { AssetLayersSettings, AssetStyle, ElevationType } from '../../config'
import { chartSymbolOptions, getConfigIcon, unitOptions, intersectingLayersElevationType, intersectingLayersElevationTypeWithoutZ } from '../constants'
import { getAdvanceSettingsStyle } from '../lib/style'
import IntersectingAssetStylePicker from './intersecting-asset-style-picker'

const { epConfigIcon } = getConfigIcon()

interface Props {
  intl: IntlShape
  theme: IMThemeVariables
  config: AssetLayersSettings
  hasSupportForZValue: boolean
  selectedLayerDataSource: any
  hasVerticalUnit: boolean
  updateAssetSettings: (parentKey: string, childKey: string | null, value: any) => void
}

interface IState {
  isIntersectingAssetStylePickerOpen: boolean
  elevationType: string
  elevationUnits: string
  symbology: string
  oneFields: string[]
  twoFields: string[]
  displayField: string[]
  style: AssetStyle
}

export default class AssetSettingPopper extends React.PureComponent<Props, IState> {
  readonly _elevationTypeOptions: ElevationType[]
  private readonly _defaultSelectedItem = {
    name: ''
  }

  constructor (props) {
    super(props)

    //If layer does not support z value, removed this option from elevation drop down
    if (!this.props.hasSupportForZValue) {
      this._elevationTypeOptions = intersectingLayersElevationTypeWithoutZ
    } else {
      //layer supports z value, include z value option from elevation drop down
      this._elevationTypeOptions = intersectingLayersElevationType
    }

    this._defaultSelectedItem.name = this.nls('noSelectionItemLabel')

    let isOpen: boolean = false
    if (this.props.config.style.type !== 'map') {
      isOpen = true
    }

    this.state = {
      isIntersectingAssetStylePickerOpen: isOpen,
      oneFields: this.props.config.elevationSettings.field1 === '' ? [] : [this.props.config.elevationSettings.field1],
      twoFields: this.props.config.elevationSettings.field2 === '' ? [] : [this.props.config.elevationSettings.field2],
      displayField: this.props.config.displayField === '' ? [] : [this.props.config.displayField],
      elevationType: this.props.config.elevationSettings.type,
      elevationUnits: this.props.config.elevationSettings.unit,
      symbology: this.props.config.style.type,
      style: this.props.config.style
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

  componentDidUpdate = (prevProps) => {
    if (prevProps.config.elevationSettings.field1 !== this.props.config.elevationSettings.field1) {
      this.setState({
        oneFields: this.props.config.elevationSettings.field1 === '' ? [] : [this.props.config.elevationSettings.field1]
      })
    } else if (prevProps.config.elevationSettings.field2 !== this.props.config.elevationSettings.field2) {
      this.setState({
        twoFields: this.props.config.elevationSettings.field2 === '' ? [] : [this.props.config.elevationSettings.field2]
      })
    } else if (!lodash.isDeepEqual(prevProps.config.displayField, this.props.config.displayField)) {
      this.setState({
        displayField: this.props.config.displayField === '' ? [] : [this.props.config.displayField]
      })
      if (this.props.config.displayField.length === 0) {
        this._defaultSelectedItem.name = this.nls('noSelectionItemLabel')
      }
    } else if (prevProps.config.elevationSettings.type !== this.props.config.elevationSettings.type) {
      this.setState({
        elevationType: this.props.config.elevationSettings.type
      })
    } else if (prevProps.config.elevationSettings.unit !== this.props.config.elevationSettings.unit) {
      this.setState({
        elevationUnits: this.props.config.elevationSettings.unit
      })
    } else if (prevProps.config.style.type !== this.props.config.style.type) {
      this.setState({
        symbology: this.props.config.style.type
      })
    } else if (!lodash.isDeepEqual(prevProps.config.style, this.props.config.style)) {
      this.setState({
        style: this.props.config.style
      })
    }
  }

  onElevationValueChange = (evt) => {
    this.setState({
      elevationType: evt.target.value
    }, () => {
      this.props.updateAssetSettings('elevationSettings', 'type', this.state.elevationType)
    })
  }

  onElevationValueUnitChange = (evt) => {
    this.setState({
      elevationUnits: evt.target.value
    }, () => {
      this.props.updateAssetSettings('elevationSettings', 'unit', this.state.elevationUnits)
    })
  }

  onSymbologyChange = (evt) => {
    if (evt.target.value === 'map') {
      this.setState({
        isIntersectingAssetStylePickerOpen: false
      })
    } else {
      this.setState({
        isIntersectingAssetStylePickerOpen: true
      })
    }
    this.setState({
      symbology: evt.target.value
    }, () => {
      this.props.updateAssetSettings('style', 'type', this.state.symbology)
    })
  }

  onIntersectingAssetStyleChange = (object: string, property: string, value: any) => {
    this.props.updateAssetSettings(object, property, value)
  }

  onOneFieldSelect = (allSelectedFields: IMFieldSchema[]) => {
    if (allSelectedFields.length === 0) {
      this.setState({
        oneFields: []
      })
      this.props.updateAssetSettings('elevationSettings', 'field1', '')
    } else {
      this.setState({
        oneFields: [allSelectedFields[0].jimuName]
      })
      this.props.updateAssetSettings('elevationSettings', 'field1', allSelectedFields[0].jimuName)
    }
  }

  onTwoFieldSelect = (allSelectedFields: IMFieldSchema[]) => {
    if (allSelectedFields.length === 0) {
      this.setState({
        twoFields: []
      })
      this.props.updateAssetSettings('elevationSettings', 'field2', '')
    } else {
      this.setState({
        twoFields: [allSelectedFields[0].jimuName]
      })
      this.props.updateAssetSettings('elevationSettings', 'field2', allSelectedFields[0].jimuName)
    }
  }

  onDisplayFieldSelect = (allSelectedFields: IMFieldSchema[]) => {
    if (allSelectedFields.length === 0) {
      this.setState({
        displayField: []
      })
      this.props.updateAssetSettings('displayField', '', '')
    } else {
      this.setState({
        displayField: [allSelectedFields[0].jimuName]
      })
      this.props.updateAssetSettings('displayField', '', allSelectedFields[0].jimuName)
    }
  }

  render () {
    let selectedValueTypeHint: string
    if (this.state.elevationType === 'no elevation') {
      selectedValueTypeHint = this.nls('noElevationHint')
    } else if (this.state.elevationType === 'z') {
      selectedValueTypeHint = this.nls('noVerticalParamHint')
    }
    const layerGeometryType = this.props.selectedLayerDataSource?.layer.layerDefinition.geometryType

    return <div style={{ height: '100%', width: '100%' }} css={getAdvanceSettingsStyle(this.props.theme)}>
      <SettingSection>
        <SettingRow className={'pt-1'}>
          <Label tabIndex={0} aria-label={this.nls('elevationSettingLabel')} className='w-100 d-flex'>
            <div className='flex-grow-1 text-break color-label title2 hint-paper'>
              {this.nls('elevationSettingLabel')}
            </div>
          </Label>
          <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('elevationSettingIntersectingTooltip')}
            title={this.nls('elevationSettingIntersectingTooltip')} showArrow placement='top'>
            <div className='ml-2 d-inline'>
              <Icon size={14} icon={epConfigIcon.infoIcon} />
            </div>
          </Tooltip>
        </SettingRow>

        <SettingRow>
          <Label tabIndex={0} aria-label={this.nls('valueType')} className='flex-grow-1 ep-label'>
            <div className='flex-grow-1 text-break title3 hint-default'>
              {this.nls('valueType')}
            </div>
          </Label>
          <Select aria-label={this.state.elevationType} className={'selectOption'}
            size={'sm'} name={'elevationValueType'}
            value={this.state.elevationType}
            onChange={this.onElevationValueChange}>
            {this._elevationTypeOptions.map((option, index) => {
              return <Option role={'option'} aria-label={option.value} key={index} value={option.value}>
                {this.nls(option.name)}</Option>
            })}
          </Select>
        </SettingRow>

        <SettingRow className={this.state.elevationType === 'one' || this.state.elevationType === 'two' ? '' : 'hidden'}>
          <div className={'left-and-right d-flex justify-content-between w-100'}>
          <Label tabIndex={0} aria-label={this.nls('oneFieldLabel')} className='flex-grow-1 ep-label'>
            <div className='flex-grow-1 text-break title3 hint-default'>
              {this.nls('oneFieldLabel')}
            </div>
          </Label>
          <FieldSelector className={'fieldSelectorWidth'}
            dataSources={[this.props.selectedLayerDataSource.layer]}
            onChange={this.onOneFieldSelect.bind(this)}
            isDataSourceDropDownHidden={true}
            useDropdown={true}
            selectedFields={Immutable(this.state.oneFields)}
            isMultiple={false}
            types={Immutable([JimuFieldType.Number])}
            noSelectionItem={this._defaultSelectedItem}
          />
          </div>
        </SettingRow>

        <SettingRow className={this.state.elevationType === 'two' ? '' : 'hidden'}>
          <div className={'left-and-right d-flex justify-content-between w-100'}>
            <Label tabIndex={0} aria-label={this.nls('twoFieldLabel')} className='flex-grow-1 ep-label'>
              <div className='flex-grow-1 text-break title3 hint-default'>
                {this.nls('twoFieldLabel')}
              </div>
            </Label>
            <FieldSelector className={'fieldSelectorWidth'}
              dataSources={[this.props.selectedLayerDataSource.layer]}
              onChange={this.onTwoFieldSelect.bind(this)}
              isDataSourceDropDownHidden={true}
              useDropdown={true}
              selectedFields={Immutable(this.state.twoFields)}
              types={Immutable([JimuFieldType.Number])}
              isMultiple={false}
              noSelectionItem={this._defaultSelectedItem}
            />
          </div>
        </SettingRow>

        <SettingRow className={this.state.elevationType === 'no elevation' || (this.state.elevationType === 'z' && !this.props.hasVerticalUnit) ? 'hint' : 'hidden'}>
          <Label tabIndex={0} aria-label={selectedValueTypeHint} className='w-100 d-flex'>
            <div className='flex-grow-1 text-break title3 hint-default'>
              {selectedValueTypeHint}
            </div>
          </Label>
        </SettingRow>

        <SettingRow className={this.state.elevationType === 'match profile' ? 'hint' : 'hidden'}>
          <Label tabIndex={0} aria-label={this.nls('matchProfileHint')} className='w-100 d-flex'>
            <div className='flex-grow-1 text-break title3 hint-default'>
              {this.nls('matchProfileHint')}
            </div>
          </Label>
        </SettingRow>

        <SettingRow className={(this.state.elevationType === 'no elevation' || this.state.elevationType === 'z' ||
        this.state.elevationType === 'match profile')
          ? 'hidden'
          : ''}>
          <Label tabIndex={0} aria-label={this.nls('valueUnit')} className='flex-grow-1 ep-label'>
            <div className='flex-grow-1 text-break title3 hint-default'>
              {this.nls('valueUnit')}
            </div>
          </Label>
          <Select aria-label={this.state.elevationUnits} className={'selectOption'} name={'valueunit'}
            size={'sm'} value={this.state.elevationUnits}
            onChange={this.onElevationValueUnitChange}>
            {unitOptions.map((option, index) => {
              return <Option role={'option'} aria-label={option.value} key={index} value={option.value}>
                {this.nls(option.value)}</Option>
            })}
          </Select>
        </SettingRow>

        <SettingRow className={'pt-4 ep-divider-top'}>
          <Label tabIndex={0} aria-label={this.nls('styleLabel')} className='w-100 d-flex'>
            <div className='flex-grow-1 text-break color-label title2 hint-paper'>
              {this.nls('displayFieldLabel')}
            </div>
          </Label>
          <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('displayFieldTooltip')}
            title={this.nls('displayFieldTooltip')} showArrow placement='top'>
            <div className='ml-2 d-inline'>
              <Icon size={14} icon={epConfigIcon.infoIcon} />
            </div>
          </Tooltip>
        </SettingRow>

        <SettingRow>
          <FieldSelector
            dataSources={[this.props.selectedLayerDataSource.layer]}
            onChange={this.onDisplayFieldSelect.bind(this)}
            isDataSourceDropDownHidden={true}
            useDropdown={true}
            selectedFields={Immutable(this.state.displayField)}
            isMultiple={false}
            noSelectionItem={this._defaultSelectedItem}
          />
        </SettingRow>

        <SettingRow className={'pt-4 ep-divider-top'}>
          <Label tabIndex={0} aria-label={this.nls('styleLabel')} className='w-100 d-flex'>
            <div className='flex-grow-1 text-break color-label title2 hint-paper'>
              {this.nls('styleLabel')}
            </div>
          </Label>
          <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('stylePointTooltip')}
            title={this.nls('stylePointTooltip')} showArrow placement='top'>
            <div className='ml-2 d-inline'>
              <Icon size={14} icon={epConfigIcon.infoIcon} />
            </div>
          </Tooltip>
        </SettingRow>

        <SettingRow className='hidden'>
          <Label tabIndex={0} aria-label={this.nls('symbology')} className='flex-grow-1 ep-label'>
            <div className='flex-grow-1 text-break title3 hint-default'>
              {this.nls('symbology')}
            </div>
          </Label>
          <Select aria-label={this.state.symbology} className={'selectOption'}
            size={'sm'} name={'symbology'}
            value={this.state.symbology}
            onChange={this.onSymbologyChange}>
            {chartSymbolOptions.map((option, index) => {
              return <Option role={'option'} aria-label={option.value} key={index} value={option.value}>
                {this.nls(option.name)}</Option>
            })}
          </Select>
        </SettingRow>

        <IntersectingAssetStylePicker
          intl={this.props.intl}
          intersectingAssetItem={'style'}
          config={this.state.style}
          layerGeometryType={layerGeometryType}
          onIntersectingAssetStyleChange={this.onIntersectingAssetStyleChange} />
      </SettingSection>
    </div>
  }
}
