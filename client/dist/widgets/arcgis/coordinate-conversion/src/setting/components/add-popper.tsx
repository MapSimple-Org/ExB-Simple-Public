/**
  Licensing

  Copyright 2020 Esri

  Licensed under the Apache License, Version 2.0 (the "License"); You
  may not use this file except in compliance with the License. You may
  obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
  implied. See the License for the specific language governing
  permissions and limitations under the License.

  A copy of the license is available in the repository's
  LICENSE file.
*/
/** @jsx jsx */ // <-- make sure to include the jsx pragma
import { React, jsx, css, urlUtils, type IntlShape, type IMThemeVariables } from 'jimu-core'
import { TextInput, Button, Icon, AlertPopup, Checkbox, Label, Select, Option, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import defaultMessages from '../translations/default'
import type { OutputSettings } from '../../config'

const IconReset = require('jimu-ui/lib/icons/reset-outlined-16.svg')

interface Props {
  supportedFormats: OutputSettings[]
  intl?: IntlShape
  isOpen?: boolean
  theme?: IMThemeVariables
  onClose?: () => void
  onOkClick?: (
    selectedFormat: string,
    updatedCoordinateLabel: string,
    currentPattern: string,
    canAddAtTop: boolean
  ) => void
  children?: React.ReactNode
}

interface IState {
  addDefaultCoordinate: string
  coordinateLabel: string
  currentPattern: string
  isAddNewFormatPopperActive: boolean
  canAddAtTop: boolean
}

export default class AddPopper extends React.PureComponent<Props, IState> {
  constructor (props) {
    super(props)
    this.state = {
      addDefaultCoordinate: this.props.supportedFormats[0].name,
      isAddNewFormatPopperActive: this.props.isOpen,
      coordinateLabel: this.props.supportedFormats[0].label,
      currentPattern: this.props.supportedFormats[0].currentPattern,
      canAddAtTop: false
    }
  }

  onCoordinateChange = (evt) => {
    this.setState({
      addDefaultCoordinate: evt.target.value
    }, () => {
      const selectedCoords = this.props.supportedFormats.find(i => i.name === this.state.addDefaultCoordinate)
      this.setState({
        coordinateLabel: selectedCoords.label
      })
      this.resetToDefaultPattern(this.state.addDefaultCoordinate)
    })
  }

  onFormatLabelChange = (e) => {
    const value = e.target.value
    this.setState({
      coordinateLabel: value
    })
  }

  onFormatLabelAcceptValue = (value) => {
    this.setState({
      coordinateLabel: value.trim()
    })
  }

  onFormatChange = (e) => {
    const value = e.target.value
    this.setState({
      currentPattern: value
    })
  }

  onFormatAcceptValue = (value) => {
    this.setState({
      currentPattern: value.trim()
    })
  }

  onResetButtonClick = () => {
    const selectedValue = this.state.addDefaultCoordinate
    this.resetToDefaultPattern(selectedValue)
  }

  resetToDefaultPattern = (selectedValue: string) => {
    const selectedItem = this.props.supportedFormats.find(i => i.name === selectedValue)
    if (selectedItem) {
      this.setState({
        currentPattern: selectedItem.defaultPattern
      })
    }
  }

  onOkButtonClicked = () => {
    //in case of address only check for non empty coordinateLabel
    //else in other cases check for both non empty label and non empty pattern
    if (this.state.addDefaultCoordinate === 'address') {
      if (this.state.coordinateLabel === '') {
        return
      }
    } else if (this.state.addDefaultCoordinate !== 'address' &&
      (this.state.coordinateLabel === '' || this.state.currentPattern === '')) {
      return
    }
    this.setState({
      isAddNewFormatPopperActive: false
    })
    this.props.onOkClick(
      this.state.addDefaultCoordinate,
      this.state.coordinateLabel,
      this.state.currentPattern,
      this.state.canAddAtTop
    )
    this.props.onClose()
  }

  onCancelButtonClicked = () => {
    this.setState({
      isAddNewFormatPopperActive: false
    })
    this.props.onClose()
  }

  onCheckBoxChange = (evt) => {
    this.setState({
      canAddAtTop: evt.target.checked
    })
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

  render () {
    const addPopperCSS = css`
      .hidden{
        display: none;
      }

      .cursor-pointer {
        cursor: pointer;
      }

      .invalid-value {
        border: 1px solid red;
        box-shadow: 0 0 5px red;
      }
    `
    return <div>
      <AlertPopup css={addPopperCSS}
        aria-expanded={this.state.isAddNewFormatPopperActive}
        isOpen={this.state.isAddNewFormatPopperActive && !urlUtils.getAppIdPageIdFromUrl().pageId}
        onClickOk={this.onOkButtonClicked.bind(this)}
        onClickClose={this.onCancelButtonClicked.bind(this)}
        title={this.nls('addConversion')}>
        <table cellPadding={10}>
          <tbody>
            <tr>
              <td>
                <Label>
                  {this.nls('defaultCoordinate')}
                </Label>
              </td>
              <td>
                <Select aria-label={this.nls('defaultCoordinate')} name={'defaultCoords'}
                  size={'sm'} value={this.state.addDefaultCoordinate}
                  onChange={this.onCoordinateChange}>
                  {this.props.supportedFormats && this.props.supportedFormats.map((option, index) => {
                    return <Option tabIndex={0} role={'option'} aria-label={option.label} key={index} value={option.name}>{option.label}</Option>
                  })}
                </Select>
              </td>
            </tr>
            <tr>
              <td>
                <Label className={'mt-2'}>
                  {this.nls('coordinateLabel')}
                </Label>
              </td>
              <td>
                <TextInput role={'textbox'} aria-label={this.nls('coordinateLabel')} size={'sm'}
                  className={this.state.coordinateLabel === '' ? 'invalid-value' : ''}
                  value={this.state.coordinateLabel} onAcceptValue={this.onFormatLabelAcceptValue} onChange={this.onFormatLabelChange} />
              </td>
            </tr>
            <tr className={this.state.addDefaultCoordinate === 'address' ? 'hidden' : ''}>
              <td>
                <Label>
                  {this.nls('coordinateFormat')}
                </Label></td>
              <td>
                <TextInput role={'textbox'} aria-label={this.nls('coordinateFormat')} size={'sm'}
                  className={this.state.currentPattern === '' ? 'invalid-value' : ''}
                  value={this.state.currentPattern} onAcceptValue={this.onFormatAcceptValue} onChange={this.onFormatChange} />
              </td>
              <td>
                <Button role={'button'} aria-label={this.nls('resetFormat')} title={this.nls('resetFormat')} size={'sm'} icon type={'tertiary'} className={'reset-button ml-2'}
                  onClick={this.onResetButtonClick.bind(this)}>
                  <Icon icon={IconReset} size={'16'} ></Icon>
                </Button>
              </td>
            </tr>
            <tr>
              <td colSpan={3}>
                <Label className={'cursor-pointer'}>
                  <Checkbox className={'mr-2 font-13'} checked={this.state.canAddAtTop}
                    onChange={this.onCheckBoxChange.bind(this)} role={'checkbox'} aria-label={this.nls('addConversionCheckboxLabel')}
                  />
                  {this.nls('addConversionCheckboxLabel')}
                </Label>
              </td>
            </tr>
          </tbody>
        </table>
      </AlertPopup>
    </div>
  }
}
