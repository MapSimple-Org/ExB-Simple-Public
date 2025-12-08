/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, type IntlShape, type IMThemeVariables, Immutable, type IMFieldSchema, JimuFieldType, lodash } from 'jimu-core'
import { Label, Select, Option, Tooltip, Icon, defaultMessages as jimuUIDefaultMessages, Alert } from 'jimu-ui'
import { FieldSelector } from 'jimu-ui/advanced/data-source-selector'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { getAdvanceSettingsStyle } from '../lib/style'
import defaultMessages from '../translations/default'
import type { ProfileLayersSettings, ElevationType, ProfileStyle } from '../../config'
import { getConfigIcon, selectableLayersElevationType, selectableLayersElevationTypeWithoutZ, unitOptions } from '../constants'
import LineStylePicker from './line-style-picker'

const { epConfigIcon } = getConfigIcon()

interface Props {
  intl: IntlShape
  theme: IMThemeVariables
  config: ProfileLayersSettings
  hasVerticalUnit: boolean
  hasSupportForZValue: boolean
  selectedLayerDataSource: any
  updateProfileSettings: (parentKey: string, childKey: string | null, value: any) => void
}

interface IState {
  elevationType: string
  oneFields: string[]
  twoFields: string[]
  elevationUnits: string
  style: ProfileStyle
}

export default class ProfileSettingPopper extends React.PureComponent<Props, IState> {
  readonly elevationTypeOptions: ElevationType[]
  private readonly _defaultSelectedItem = {
    name: ''
  }

  constructor (props) {
    super(props)
    //If layer does not support z value, removed this option from elevation drop down
    if (!this.props.hasSupportForZValue) {
      this.elevationTypeOptions = selectableLayersElevationTypeWithoutZ
    } else {
      //layer supports z value, include z value option from elevation drop down
      this.elevationTypeOptions = selectableLayersElevationType
    }
    this._defaultSelectedItem.name = this.nls('noSelectionItemLabel')

    this.state = {
      oneFields: this.props.config.elevationSettings.field1 === '' ? [] : [this.props.config.elevationSettings.field1],
      twoFields: this.props.config.elevationSettings.field2 === '' ? [] : [this.props.config.elevationSettings.field2],
      elevationType: this.props.config.elevationSettings.type,
      elevationUnits: this.props.config.elevationSettings.unit,
      style: this.props.config.style
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
    } else if (prevProps.config.elevationSettings.type !== this.props.config.elevationSettings.type) {
      this.setState({
        elevationType: this.props.config.elevationSettings.type
      })
    } else if (prevProps.config.elevationSettings.unit !== this.props.config.elevationSettings.unit) {
      this.setState({
        elevationUnits: this.props.config.elevationSettings.unit
      })
    } else if (!lodash.isDeepEqual(prevProps.config.style, this.props.config.style)) {
      this.setState({
        style: this.props.config.style
      })
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

  onElevationValueChange = (evt) => {
    this.setState({
      elevationType: evt.target.value
    }, () => {
      this.props.updateProfileSettings('elevationSettings', 'type', this.state.elevationType)
    })
  }

  onElevationValueUnitChange = (evt) => {
    this.setState({
      elevationUnits: evt.target.value
    }, () => {
      this.props.updateProfileSettings('elevationSettings', 'unit', this.state.elevationUnits)
    })
  }

  updateLineStyle = (object: string, property: string, value: any) => {
    const lineStyle = {
      lineType: property === 'lineType' ? value : this.props.config.style.lineType,
      lineColor: property === 'lineColor' ? value : this.props.config.style.lineColor,
      lineThickness: property === 'lineThickness' ? value : this.props.config.style.lineThickness
    }
    this.setState({
      style: lineStyle
    }, () => {
      this.props.updateProfileSettings(object, property, value)
    })
  }

  onOneFieldSelect = (allSelectedFields: IMFieldSchema[]) => {
    if (allSelectedFields.length === 0) {
      this.setState({
        oneFields: []
      })
      this.props.updateProfileSettings('elevationSettings', 'field1', '')
    } else {
      this.setState({
        oneFields: [allSelectedFields[0].jimuName]
      })
      this.props.updateProfileSettings('elevationSettings', 'field1', allSelectedFields[0].jimuName)
    }
  }

  onTwoFieldSelect = (allSelectedFields: IMFieldSchema[]) => {
    if (allSelectedFields.length === 0) {
      this.setState({
        twoFields: []
      })
      this.props.updateProfileSettings('elevationSettings', 'field2', '')
    } else {
      this.setState({
        twoFields: [allSelectedFields[0].jimuName]
      })
      this.props.updateProfileSettings('elevationSettings', 'field2', allSelectedFields[0].jimuName)
    }
  }

  render () {
    let selectedValueTypeHint: string
    if (this.state.elevationType === 'no elevation') {
      selectedValueTypeHint = this.nls('noElevationHint')
    } else if (this.state.elevationType === 'z') {
      selectedValueTypeHint = this.nls('noVerticalParamHint')
    }
    return <div style={{ height: '100%', width: '100%' }} css={getAdvanceSettingsStyle(this.props.theme)}>
      <SettingSection>
        <SettingRow className={'pt-1'}>
          <Label tabIndex={0} aria-label={this.nls('elevationSettingLabel')} className='w-100 d-flex'>
            <div className='flex-grow-1 text-break color-label title2 hint-paper'>
              {this.nls('elevationSettingLabel')}
            </div>
          </Label>
          <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('elevationSettingTooltip')}
            title={this.nls('elevationSettingTooltip')} showArrow placement='top'>
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
          <Select aria-label={this.state.elevationType} className={'selectOption'} name={'elevationValueType'}
            size={'sm'} value={this.state.elevationType}
            onChange={this.onElevationValueChange}>
            {this.elevationTypeOptions.map((option, index) => {
              return <Option role={'option'} key={index} aria-label={option.value} value={option.value}>
                {this.nls(option.name)}</Option>
            })}
          </Select>
        </SettingRow>

        <SettingRow className={this.state.elevationType === 'one' || this.state.elevationType === 'two' ? '' : 'hidden'}>
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
        </SettingRow>

        <SettingRow className={this.state.elevationType === 'two' ? '' : 'hidden'}>
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
        </SettingRow>

        <SettingRow className={this.state.elevationType === 'no elevation' || (this.state.elevationType === 'z' && !this.props.hasVerticalUnit) ? 'hint' : 'hidden'}>
          <Label tabIndex={0} aria-label={selectedValueTypeHint} className='w-100 d-flex'>
            <div className='flex-grow-1 text-break title3 hint-default'>
              {selectedValueTypeHint}
            </div>
          </Label>
        </SettingRow>

        <SettingRow className={this.state.elevationType === 'no elevation' || this.state.elevationType === 'z' ? 'hidden' : ''}>
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

        {this.props.config.distanceSettings.type !== 'map' &&
          <React.Fragment>
            <SettingRow className={'pt-4 ep-divider-top'}>
              <Label tabIndex={0} aria-label={this.nls('distanceSettingLabel')} className='w-100 d-flex'>
                <div className='flex-grow-1 text-break color-label title2 hint-paper'>
                  {this.nls('distanceSettingLabel')}
                </div>
              </Label>
            </SettingRow>
            <SettingRow>
              <div title={this.nls('distanceSettingsWarning')}>
                <Alert tabIndex={0} className={'warningMsg py-1'}
                  text={this.nls('distanceSettingsWarning')}
                  type={'info'}
                />
              </div>
            </SettingRow>
          </React.Fragment>
        }

        <SettingRow className={'pt-4 ep-divider-top'}>
          <Label tabIndex={0} aria-label={this.nls('styleLabel')} className='w-100 d-flex'>
            <div className='flex-grow-1 text-break color-label title2 hint-paper'>
              {this.nls('styleLabel')}
            </div>
          </Label>
          <Tooltip role={'tooltip'} tabIndex={0} aria-label={this.nls('styleLineTooltip')}
            title={this.nls('styleLineTooltip')} showArrow placement='top'>
            <div className='ml-2 d-inline'>
              <Icon size={14} icon={epConfigIcon.infoIcon} />
            </div>
          </Tooltip>
        </SettingRow>

        <SettingRow>
          <LineStylePicker
            intl={this.props.intl}
            lineItem={'style'}
            onLineStyleChange={this.updateLineStyle}
            config={this.state.style}
          />
        </SettingRow>
      </SettingSection>
    </div>
  }
}
