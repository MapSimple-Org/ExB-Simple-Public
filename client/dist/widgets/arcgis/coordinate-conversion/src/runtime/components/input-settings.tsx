/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, type IntlShape, type IMThemeVariables } from 'jimu-core'
import type { IMConfig, OutputSettings } from '../../config'
import { Icon, Row, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import type { JimuMapView } from 'jimu-arcgis'
import { getInputContainerStyle } from '../lib/style'
import defaultMessages from '../translations/default'
import AddPopper from '../components/add-popper'
import { CoordinateControl, type CoordinateControlResult } from 'jimu-ui/advanced/coordinate-control'

import type Point from 'esri/geometry/Point'

const iconAddConversion = require('jimu-ui/lib/icons/add.svg')

interface Props {
  intl: IntlShape
  theme: IMThemeVariables
  parentWidgetId: string
  config: IMConfig
  jimuMapview: JimuMapView
  locatorURL: string
  minCandidateScore: number
  maxSuggestions: number
  displayFullAddress: boolean
  onConversionComplete: (results: Point) => void
  onClear: () => void
  processing: (value: boolean) => void
  addNewConversion: (formatName: string, label: string, currentPattern: string, addAtTheTop: boolean) => void
  copyAllList: string[]
}

interface IState {
  supportedFormats: OutputSettings[]
  isAddConversionPopupOpen: boolean
}

export default class InputSettings extends React.PureComponent<Props, IState> {
  constructor (props) {
    super(props)
    this.state = {
      supportedFormats: null,
      isAddConversionPopupOpen: false
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

  onAddConversion = () => {
    this.setState({
      isAddConversionPopupOpen: true
    })
  }

  addNewConversion = (formatName: string, label: string, currentPattern: string, addAtTheTop: boolean) => {
    this.props.addNewConversion(formatName, label, currentPattern, addAtTheTop)
  }

  onAddPopperClose = () => {
    this.setState({
      isAddConversionPopupOpen: false
    })
  }

  onInputConversionComplete = (conversionResult: CoordinateControlResult) => {
    this.props.onConversionComplete(conversionResult.mapCoordinate)
  }

  onInputProcessing = (isProcessing: boolean) => {
    this.props.processing(isProcessing)
  }

  onInputClear = () => {
    this.props.onClear()
  }

  addNewFormat = (formatName: string, label: string, currentPattern: string, addAtTheTop: boolean) => {
    this.props.addNewConversion(formatName, label, currentPattern, addAtTheTop)
  }

  getSupportedFormats = (supportedFormats) => {
    this.setState({
      supportedFormats: supportedFormats
    })
  }

  render () {
    const inputContainerStyles = getInputContainerStyle(this.props.theme)
    return <div css={inputContainerStyles} className={'input-container shadow-2'}>
      <CoordinateControl
        parentWidgetId={this.props.parentWidgetId}
        locatorURL={this.props.locatorURL}
        inputLabelString={this.nls('inputLabel')}
        defaultCoordinate={this.props.config.inputSettings.defaultCoordinate}
        defaultFormat={this.props.config.inputSettings.format}
        zoomScale={this.props.config.generalSettings.zoomScale}
        defaultPointSymbol={this.props.config?.generalSettings?.defaultPointSymbol}
        minCandidateScore={this.props.config.addressSettings.minCandidateScore}
        maxSuggestions={this.props.maxSuggestions}
        displayFullAddress={this.props.displayFullAddress}
        jimuMapview={this.props.jimuMapview}
        copyAllList={this.props.copyAllList}
        showCopy={true}
        showZoom={true}
        onConversionComplete={this.onInputConversionComplete}
        processing={this.onInputProcessing}
        onClear={this.onInputClear}
        getSupportedFormats={this.getSupportedFormats}
      />

      <Row className={'pt-6 pl-4 add-button-row'} aria-label={this.nls('addConversion')}>
        {
          <div className={'addBtn'} title={this.nls('addConversion')}
            id={'refAdd' + this.props.parentWidgetId} onClick={this.onAddConversion.bind(this)}>
            <Icon icon={iconAddConversion} size={'16'}></Icon>
          </div>
        }
      </Row>

      {/* Dialog for selecting new format to be added */}
      {this.state.isAddConversionPopupOpen && this.state.supportedFormats && this.state.supportedFormats.length > 0 &&
        <AddPopper
          theme={this.props.theme}
          supportedFormats={this.state.supportedFormats}
          intl={this.props.intl}
          isOpen={this.state.isAddConversionPopupOpen}
          onOkClick={this.addNewConversion}
          onClose={this.onAddPopperClose}>
        </AddPopper>
      }
    </div>
  }
}
