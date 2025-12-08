/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, type IntlShape, type IMThemeVariables, focusElementInKeyboardMode } from 'jimu-core'
import { TextInput, TextArea, Button, Icon, Popper, Label, AlertPopup, Collapse, Row, defaultMessages as jimuUIDefaultMessages, Surface } from 'jimu-ui'
import { getOutputCoordsStyle } from '../lib/style'
import defaultMessages from '../translations/default'
import type Conversion from 'esri/widgets/CoordinateConversion/support/Conversion'

const iconCopy = require('jimu-ui/lib/icons/duplicate.svg')
const iconSettings = require('jimu-ui/lib/icons/settings-12.svg')
const iconClose = require('jimu-ui/lib/icons/close-12.svg')
const iconReset = require('jimu-ui/lib/icons/reset-outlined-16.svg')
const iconExpandCollapse = require('jimu-ui/lib/icons/arrow-down-16.svg')

interface Props {
  displayLabel: string
  isOpen: boolean
  parentWidgetId: string
  intl: IntlShape
  theme: IMThemeVariables
  index: number
  key: number
  displayCoordinates: string
  conversionInfo: Conversion
  onRemove: (props: number) => void
  onOutPutSettingsActive: (props: number, value: boolean) => void
  onCurrentPatternChange: (index: number, label: string, newPattern: string) => void
  isEmpty: boolean
  isRTL: boolean
  children?: React.ReactNode
}

interface IState {
  outputSettingsActive: boolean
  isCopyMessageOpen: boolean
  isDetails1CopyMessageOpen: boolean
  isDetails2CopyMessageOpen: boolean
  isDetails3CopyMessageOpen: boolean
  isDetails4CopyMessageOpen: boolean
  isOutputFormatExpanded: boolean
  isRemoveFormatActive: boolean
  currentOutputFormatLabel: string
  outputFormatLabel: string
  outputFormatPattern: string
  details1Label: string
  details2Label: string
  details3Label: string
  details4Label: string
  details3Visible: boolean
  details4Visible: boolean
  details1Value: string
  details2Value: string
  details3Value: string
  details4Value: string
  copyDetailsTextboxValue: string
}

export default class OutputFormatsDisplay extends React.PureComponent<Props, IState> {
  private readonly outputLabel = React.createRef<HTMLDivElement>()
  private readonly _copyOutputTextbox = React.createRef<HTMLInputElement>()
  private readonly _copyDetailsTextbox = React.createRef<HTMLInputElement>()
  private readonly editTextFocus = React.createRef<HTMLInputElement>()
  private readonly details1Input = React.createRef<HTMLInputElement>()
  private readonly details2Input = React.createRef<HTMLInputElement>()
  private readonly details3Input = React.createRef<HTMLInputElement>()
  private readonly details4Input = React.createRef<HTMLInputElement>()
  details1Value: string
  details2Value: string
  details3Value: string
  details4Value: string
  constructor (props) {
    super(props)
    this.state = {
      outputSettingsActive: false,
      isCopyMessageOpen: false,
      isDetails1CopyMessageOpen: false,
      isDetails2CopyMessageOpen: false,
      isDetails3CopyMessageOpen: false,
      isDetails4CopyMessageOpen: false,
      isOutputFormatExpanded: !!this.props.isOpen,
      isRemoveFormatActive: false,
      currentOutputFormatLabel: this.props.displayLabel || this.props.conversionInfo.format.name,
      outputFormatLabel: this.props.displayLabel || this.props.conversionInfo.format.name,
      outputFormatPattern: this.props.conversionInfo.format.currentPattern,
      details1Label: '',
      details2Label: '',
      details3Label: '',
      details4Label: '',
      details3Visible: false,
      details4Visible: false,
      details1Value: '',
      details2Value: '',
      details3Value: '',
      details4Value: '',
      copyDetailsTextboxValue: ''
    }
    this.outputLabel = React.createRef<HTMLDivElement>()
    this.details1Input = React.createRef<HTMLInputElement>()
    this.details2Input = React.createRef<HTMLInputElement>()
    this.details3Input = React.createRef<HTMLInputElement>()
    this.details4Input = React.createRef<HTMLInputElement>()
  }

  componentDidMount = () => {
    this.setDetailSection()
  }

  componentDidUpdate = (prevProps) => {
    if (prevProps.displayCoordinates !== this.props.displayCoordinates) {
      this.setDetailSection()
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

  onOutputSettingsClick = () => {
    this.setState({
      outputSettingsActive: !this.state.outputSettingsActive
    }, () => {
      //added timeout since alert popup takes some to render
      //set focus to label textbox only once on settings popper open
      setTimeout(() => {
        focusElementInKeyboardMode(this.editTextFocus.current)
      }, 500)
    })
  }

  onFormatLabelChange = (e) => {
    const value = e.target.value
    this.setState({
      currentOutputFormatLabel: value
    })
  }

  onFormatLabelAcceptValue = (value) => {
    this.setState({
      currentOutputFormatLabel: value.trim()
    })
  }

  onFormatChange = (e) => {
    const value = e.target.value
    this.setState({
      outputFormatPattern: value
    })
  }

  onFormatAcceptValue = (value) => {
    this.setState({
      outputFormatPattern: value.trim()
    })
  }

  onResetButtonClick = () => {
    this.setState({
      outputFormatPattern: this.props.conversionInfo.format.defaultPattern
    })
  }

  onOutputSettingsOkClicked = () => {
    if (this.props.conversionInfo.format.name !== 'address' &&
      (this.state.currentOutputFormatLabel === '' || this.state.outputFormatPattern === '')) {
      return
    }
    this.setState({
      outputSettingsActive: false,
      outputFormatLabel: this.state.currentOutputFormatLabel
    }, () => {
      this.props.onCurrentPatternChange(this.props.index, this.state.outputFormatLabel, this.state.outputFormatPattern)
    })
  }

  onOutputSettingsCancelClicked = () => {
    //close the output settings and set format to the current selected format
    //get current pattern
    this.setState({
      outputSettingsActive: false,
      outputFormatPattern: this.props.conversionInfo.format.currentPattern,
      currentOutputFormatLabel: this.props.displayLabel || this.props.conversionInfo.format.name
    })
  }

  onExpandClick = () => {
    this.setState({
      isOutputFormatExpanded: !this.state.isOutputFormatExpanded
    }, () => {
      this.props.onOutPutSettingsActive(this.props.index, this.state.isOutputFormatExpanded)
    })
  }

  onRemoveClick = (evt) => {
    this.setState({
      isRemoveFormatActive: !this.state.isRemoveFormatActive
    })
    this.props.onRemove(this.props.index)
  }

  onCopyButtonClick = () => {
    //Remove the existing selection
    if (window.getSelection) {
      window.getSelection().removeAllRanges()
    }

    this._copyOutputTextbox.current.select()
    //Copy the contents
    document.execCommand('copy')
    this.setState({
      isCopyMessageOpen: true
    })
    setTimeout(() => {
      //Remove the existing selection
      if (window.getSelection) {
        window.getSelection().removeAllRanges()
      }
      this.setState({
        isCopyMessageOpen: false
      })
    }, 500)
  }

  onCoordinateCopyBtnClick = (evt) => {
    let value = ''
    //get the value of specific details (1/2/3/4) as per the clicked button against each details textbox
    //and show the copy popover on for that specific details
    switch (evt.currentTarget.id) {
      case 'refCopyDetails1' + this.props.parentWidgetId + this.props.index:
        value = this.state.details1Value
        this.setState({
          isDetails1CopyMessageOpen: true
        })
        break
      case 'refCopyDetails2' + this.props.parentWidgetId + this.props.index:
        value = this.state.details2Value
        this.setState({
          isDetails2CopyMessageOpen: true
        })
        break
      case 'refCopyDetails3' + this.props.parentWidgetId + this.props.index:
        value = this.state.details3Value
        this.setState({
          isDetails3CopyMessageOpen: true
        })
        break
      case 'refCopyDetails4' + this.props.parentWidgetId + this.props.index:
        value = this.state.details4Value
        this.setState({
          isDetails4CopyMessageOpen: true
        })
        break
    }
    //set the value in hidden copy details textbox
    //and after timeout copy that value and hide the copy popover
    this.setState({ copyDetailsTextboxValue: value }, () => {
      setTimeout(() => {
        if (this._copyDetailsTextbox.current) {
          this._copyDetailsTextbox.current.select()
          //Copy the contents
          document.execCommand('copy')
          this.setState({
            isDetails1CopyMessageOpen: false,
            isDetails2CopyMessageOpen: false,
            isDetails3CopyMessageOpen: false,
            isDetails4CopyMessageOpen: false
          })
        }
      }, 500)
    })
  }

  setDetailSection = () => {
    const segments = this.matchSegments()
    if (segments.length > 0) {
      switch (this.props.conversionInfo.format.name) {
        case 'basemap':
          this.setState({
            details1Label: this.nls('xLabel'),
            details2Label: this.nls('yLabel'),
            details1Value: segments[0],
            details2Value: segments[1]
          })
          break
        case 'xy':
          this.setState({
            details1Label: this.nls('lonLabel'),
            details2Label: this.nls('latLabel'),
            details1Value: segments[0],
            details2Value: segments[1]
          })
          break
        case 'dd':
          this.setState({
            details1Label: this.nls('latLabel'),
            details2Label: this.nls('lonLabel'),
            details1Value: segments[0],
            details2Value: segments[2]
          })
          break
        case 'dms':
          this.setState({
            details1Label: this.nls('latLabel'),
            details2Label: this.nls('lonLabel'),
            details1Value: segments[0] + ' ' + segments[1] + ' ' + segments[2],
            details2Value: segments[4] + ' ' + segments[5] + ' ' + segments[6]
          })
          break
        case 'ddm':
          this.setState({
            details1Label: this.nls('latLabel'),
            details2Label: this.nls('lonLabel'),
            details1Value: segments[0] + ' ' + segments[1],
            details2Value: segments[3] + ' ' + segments[4]
          })
          break
        case 'usng':
        case 'mgrs':
          this.setState({
            details1Label: this.nls('gzdLabel'),
            details2Label: this.nls('gridSquareLabel'),
            details3Label: this.nls('eastingLabel'),
            details4Label: this.nls('northingLabel'),
            details3Visible: true,
            details4Visible: true,
            details1Value: segments[0],
            details2Value: segments[1],
            details3Value: segments[2],
            details4Value: segments[3]
          })
          break
        case 'utm':
          this.setState({
            details1Label: this.nls('zoneLabel'),
            details2Label: this.nls('bandLabel'),
            details3Label: this.nls('eastingLabel'),
            details4Label: this.nls('northingLabel'),
            details3Visible: true,
            details4Visible: true,
            details1Value: segments[0],
            details2Value: segments[1],
            details3Value: segments[2],
            details4Value: segments[3]
          })
          break
      }
    }
  }

  matchSegments = (): string[] => {
    let coordinate, coordinateSegments
    const segmentMatches: string[] = []
    if (this.props && this.props.conversionInfo && this.props.conversionInfo.position &&
      this.props.conversionInfo.position.coordinate) {
      coordinate = this.props.conversionInfo.position.coordinate
      coordinateSegments = this.props.conversionInfo.format.coordinateSegments
      for (let i = 0; i < coordinateSegments.length; i++) {
        const segment = coordinateSegments[i]
        const match = coordinate.match(segment.searchPattern)
        if (!match) {
          segmentMatches.push('')
          continue
        }
        let segmentMatch = match[0]
        coordinate = coordinate.replace(segmentMatch, '').trim()
        if (segment.substitution) {
          const substitutionString = segment.substitution.output(segmentMatch)
          if (substitutionString) {
            segmentMatch = substitutionString
          }
        }
        segmentMatches.push(this.props.isEmpty ? '' : segmentMatch)
      }
    }
    return segmentMatches
  }

  showDetailsCopyMsg = () => {
    let showCopyMsgAt: number = 0
    let showMsg: boolean = false
    if (this.state.isDetails1CopyMessageOpen) {
      showCopyMsgAt = 1
      showMsg = this.state.isDetails1CopyMessageOpen
    } else if (this.state.isDetails2CopyMessageOpen) {
      showCopyMsgAt = 2
      showMsg = this.state.isDetails2CopyMessageOpen
    } else if (this.state.isDetails3CopyMessageOpen) {
      showCopyMsgAt = 3
      showMsg = this.state.isDetails3CopyMessageOpen
    } else if (this.state.isDetails4CopyMessageOpen) {
      showCopyMsgAt = 4
      showMsg = this.state.isDetails4CopyMessageOpen
    }
    return <Popper
      open={showMsg}
      version={0}
      placement={'bottom'}
      arrowOptions={true}
      reference={'refCopyDetails' + showCopyMsgAt + this.props.parentWidgetId + this.props.index}>
      <div className={'p-2'}>{this.nls('copySuccessMessage')}</div>
    </Popper>
  }

  /**
   * Formats value in input box to show minus sign at front in case of RTL
   * @param displayValue : string - Value to be shown in input box
   * @returns : string
   */
  formatDisplayCoordinate = (displayValue) => {
    if (this.props.isRTL && this.props.conversionInfo?.format?.name === 'xy' && displayValue && displayValue.charAt(0) === '-') {
      return displayValue.substr(1) + displayValue.substr(0, 1)
    }
    return displayValue
  }

  render () {
    const outputCoordinateStyles = getOutputCoordsStyle(this.props.theme)
    return <div css={outputCoordinateStyles}>
      <Surface level='overlay' className={'outputSection shadow-2 py-2'}>
        <Row flow={'wrap'} aria-label={this.state.outputFormatLabel} className={'pl-4 pr-5'}>
          <div className={'adjust-buttons w-100 align-items-center'}>
            <Label id={'outputFormatLabel' + this.props.parentWidgetId + this.props.index}
              className={this.props.conversionInfo.format.name === 'address' ? 'w-100 outputSettingsFormatLabel outputSettingsAddressLabel' : 'outputSettingsFormatLabel'}>
              {this.state.outputFormatLabel}
            </Label>
            <Button role={'button'} aria-labelledby={'outputFormatLabel' + this.props.parentWidgetId + this.props.index} aria-haspopup={'dialog'} title={this.nls('outputSettings')}
              className={this.props.conversionInfo.format.name === 'address' ? 'hidden' : 'actionButton'}
              type={'tertiary'} icon size={'sm'} variant={this.state.outputSettingsActive ? 'contained' : 'text'}
              color={this.state.outputSettingsActive ? 'primary' : 'default'}
              onClick={this.onOutputSettingsClick.bind(this)}>
              <Icon icon={iconSettings} size={'17'}></Icon>
            </Button>
            <Button role={'button'} aria-label={this.state.outputFormatLabel} aria-disabled={this.props.isEmpty} disabled={this.props.isEmpty} title={this.nls('copy')}
              className={'actionButton'} type={'tertiary'} icon size={'sm'} variant={this.state.isCopyMessageOpen ? 'contained' : 'text'}
              color={this.state.isCopyMessageOpen ? 'primary' : 'default'} id={'refCopy' + this.props.parentWidgetId + this.props.index} onClick={this.onCopyButtonClick.bind(this)}>
              <Icon icon={iconCopy} size={'17'}></Icon>
            </Button>
            {this.props.conversionInfo.format.name !== 'address' &&
              <div className={this.state.isOutputFormatExpanded ? 'arrow-up' : 'arrow-down'} >
                <Button role={'button'} aria-labelledby={'outputFormatLabel' + this.props.parentWidgetId + this.props.index} aria-expanded={this.state.isOutputFormatExpanded}
                  title={this.state.isOutputFormatExpanded ? this.nls('collapseOutput') : this.nls('expandOutput')} className={'actionButton'} type={'tertiary'} icon size={'sm'} onClick={this.onExpandClick.bind(this)}>
                  <Icon icon={iconExpandCollapse} size={'17'} />
                </Button>
              </div>
            }
            <Button role={'button'} aria-labelledby={'outputFormatLabel' + this.props.parentWidgetId + this.props.index} title={this.nls('removeCoordinate')}
              className={'actionButton'} type={'tertiary'} icon size={'sm'} variant={this.state.isRemoveFormatActive ? 'contained' : 'text'}
              color={this.state.isRemoveFormatActive ? 'primary' : 'default'} onClick={this.onRemoveClick.bind(this)}>
              <Icon icon={iconClose} size={'17'}></Icon>
            </Button>
          </div>
        </Row>

        {/* Output display coordinate value */}
        <div className={'w-100 outputSettingsCoordinateLabel'} ref={this.outputLabel}>{this.props.isEmpty ? '' : this.formatDisplayCoordinate(this.props.displayCoordinates)}</div>

        <TextArea tabIndex={-1} className={'hidden-copy-outputCoords'} ref={this._copyOutputTextbox}
          value={this.props.isEmpty ? '' : this.props.displayCoordinates} />

        {/* Output Edit Conversion popup */}
        <AlertPopup css={outputCoordinateStyles}
          aria-expanded={this.state.outputSettingsActive}
          isOpen={this.state.outputSettingsActive}
          onClickOk={this.onOutputSettingsOkClicked.bind(this)}
          onClickClose={this.onOutputSettingsCancelClicked.bind(this)}
          title={this.nls('outputSettingsEditPopupTitle')}>
          <table cellPadding={10}>
            <tbody>
              <tr>
                <td>
                  <Label className='text-nowrap'>
                    {this.nls('coordinateLabel')}
                  </Label>
                </td>
                <td>
                  <TextInput required role={'textbox'} ref={this.editTextFocus} aria-label={this.nls('coordinateLabel')} size={'sm'} value={this.state.currentOutputFormatLabel}
                    onAcceptValue={this.onFormatLabelAcceptValue} onChange={this.onFormatLabelChange} className={this.state.currentOutputFormatLabel === '' ? 'format-label invalid-value' : 'format-label'} />
                </td>
              </tr>
              <tr className={this.props.conversionInfo.format.name === 'address' ? 'hidden' : ''}>
                <td>
                  <Label className='text-nowrap'>
                    {this.nls('coordinateFormat')}
                  </Label></td>
                <td>
                  <TextInput required role={'textbox'} aria-label={this.nls('coordinateFormat')} size={'sm'} value={this.state.outputFormatPattern} onAcceptValue={this.onFormatAcceptValue} onChange={this.onFormatChange}
                    className={this.state.outputFormatPattern === '' ? 'invalid-value' : ''} />
                </td>
                <td>
                  <Button role={'button'} aria-label={this.nls('resetFormat')} title={this.nls('resetFormat')} className={'ml-2'} type={'tertiary'} size={'sm'}
                    onClick={this.onResetButtonClick.bind(this)}>
                    <Icon icon={iconReset} size={'16'} />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </AlertPopup>
        {/* Copy message toast popper */}
        {this.state.isCopyMessageOpen &&
          <Popper
            open={this.state.isCopyMessageOpen}
            version={0}
            placement={'bottom'}
            arrowOptions={true}
            reference={'refCopy' + this.props.parentWidgetId + this.props.index}>
            <div className={'p-2'}>{this.nls('copySuccessMessage')}</div>
          </Popper>
        }
        {/* Details Section */}
        { /* First two rows of details are present in all the formats */
          <Collapse isOpen={this.state.isOutputFormatExpanded}>
            <div className={'pt-2'}>
              <TextArea tabIndex={-1} className={'hidden-copy-outputCoords'} ref={this._copyDetailsTextbox}
                value={this.state.copyDetailsTextboxValue} />
              <Row flow={'wrap'} aria-label={this.state.details1Label} className={'pl-4 pr-5'}>
                <div className={'d-flex justify-content-between w-100 align-items-center'}>
                  <Label id={'details1Label' + this.props.parentWidgetId + this.props.index} className={'details-section-label'} title={this.state.details1Label}>{this.state.details1Label}</Label>
                  <TextInput role={'textbox'} aria-labelledby={'details1Label' + this.props.parentWidgetId + this.props.index} size={'sm'} className={'details-section-text'}
                    ref={this.details1Input} title={this.formatDisplayCoordinate(this.state.details1Value)} value={this.formatDisplayCoordinate(this.state.details1Value)} readOnly={true} />
                  <Button role={'button'} aria-label={this.nls('copy') + ' ' + this.state.details1Label} disabled={this.props.isEmpty} title={this.nls('copy') + ' ' + this.state.details1Label}
                    className={'actionButton'} type={'tertiary'} icon size={'sm'}
                    id={'refCopyDetails1' + this.props.parentWidgetId + this.props.index} variant={this.state.isDetails1CopyMessageOpen ? 'contained' : 'text'}
                    color={this.state.isDetails1CopyMessageOpen ? 'primary' : 'default'} onClick={this.onCoordinateCopyBtnClick.bind(this)}>
                    <Icon icon={iconCopy} size={'17'}></Icon>
                  </Button>
                </div>
              </Row>
              <Row flow={'wrap'} aria-label={this.state.details2Label} className={'pl-4 pr-5 pt-4'}>
                <div className={'d-flex justify-content-between w-100 align-items-center'}>
                  <Label id={'details2Label' + this.props.parentWidgetId + this.props.index} className={'details-section-label'} title={this.state.details2Label}>{this.state.details2Label}</Label>
                  <TextInput role={'textbox'} aria-labelledby={'details2Label' + this.props.parentWidgetId + this.props.index} size={'sm'} className={'details-section-text'}
                    ref={this.details2Input} title={this.formatDisplayCoordinate(this.state.details2Value)} value={this.formatDisplayCoordinate(this.state.details2Value)} readOnly={true} />
                  <Button role={'button'} aria-label={this.nls('copy') + ' ' + this.state.details2Label} disabled={this.props.isEmpty} title={this.nls('copy') + ' ' + this.state.details2Label}
                    className={'actionButton'} type={'tertiary'} icon size={'sm'}
                    id={'refCopyDetails2' + this.props.parentWidgetId + this.props.index} variant={this.state.isDetails2CopyMessageOpen ? 'contained' : 'text'}
                    color={this.state.isDetails2CopyMessageOpen ? 'primary' : 'default'} onClick={this.onCoordinateCopyBtnClick.bind(this)}>
                    <Icon icon={iconCopy} size={'17'}></Icon>
                  </Button>
                </div>
              </Row>
              {this.state.details3Visible &&
                <Row flow={'wrap'} aria-label={this.state.details3Label} className={'pl-4 pr-5 pt-4'}>
                  <div className={'d-flex justify-content-between w-100 align-items-center'}>
                    <Label id={'details3Label' + this.props.parentWidgetId + this.props.index} className={'details-section-label'} title={this.state.details3Label}>{this.state.details3Label}</Label>
                    <TextInput role={'textbox'} aria-labelledby={'details3Label' + this.props.parentWidgetId + this.props.index} size={'sm'} className={'details-section-text'}
                      ref={this.details3Input} title={this.state.details3Value} value={this.state.details3Value} readOnly={true} />
                    <Button role={'button'} aria-label={this.nls('copy') + ' ' + this.state.details3Label} disabled={this.props.isEmpty} title={this.nls('copy') + ' ' + this.state.details3Label}
                      className={'actionButton'} type={'tertiary'} icon size={'sm'}
                      id={'refCopyDetails3' + this.props.parentWidgetId + this.props.index} variant={this.state.isDetails3CopyMessageOpen ? 'contained' : 'text'}
                      color={this.state.isDetails3CopyMessageOpen ? 'primary' : 'default'} onClick={this.onCoordinateCopyBtnClick.bind(this)}>
                      <Icon icon={iconCopy} size={'17'}></Icon>
                    </Button>
                  </div>
                </Row>
              }
              {this.state.details3Visible &&
                <Row flow={'wrap'} aria-label={this.state.details4Label} className={'pl-4 pr-5 pt-4'}>
                  <div className={'d-flex justify-content-between w-100 align-items-center'}>
                    <Label id={'details4Label' + this.props.parentWidgetId + this.props.index} className={'details-section-label'} title={this.state.details4Label}>{this.state.details4Label}</Label>
                    <TextInput role={'textbox'} aria-labelledby={'details4Label' + this.props.parentWidgetId + this.props.index} size={'sm'} className={'details-section-text'}
                      ref={this.details4Input} title={this.state.details4Value} value={this.state.details4Value} readOnly={true} />
                    <Button role={'button'} aria-label={this.nls('copy') + ' ' + this.state.details4Label} disabled={this.props.isEmpty} title={this.nls('copy') + ' ' + this.state.details4Label}
                      className={'actionButton'} type={'tertiary'} icon size={'sm'}
                      id={'refCopyDetails4' + this.props.parentWidgetId + this.props.index} variant={this.state.isDetails4CopyMessageOpen ? 'contained' : 'text'}
                      color={this.state.isDetails4CopyMessageOpen ? 'primary' : 'default'} onClick={this.onCoordinateCopyBtnClick.bind(this)}>
                      <Icon icon={iconCopy} size={'17'}></Icon>
                    </Button>
                  </div>
                </Row>
              }
              {/* Copy message toast popper for details section*/}
              {(this.state.isDetails1CopyMessageOpen || this.state.isDetails2CopyMessageOpen ||
                this.state.isDetails3CopyMessageOpen || this.state.isDetails4CopyMessageOpen) &&
                this.showDetailsCopyMsg()}
            </div>
          </Collapse>
        }
      </Surface>
    </div>
  }
}
