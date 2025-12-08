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
import { jsx, type AllWidgetProps, BaseWidget, getAppStore, type ImmutableArray, type IMState, AppMode, type UseUtility, UtilityManager, lodash, defaultMessages as jimuUIDefaultMessages } from 'jimu-core'
import { Loading, LoadingType, Paper } from 'jimu-ui'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import type { IMConfig, OutputSettings } from '../config'
import { getStyle } from './lib/style'
import defaultMessages from './translations/default'
import OutputFormatsDisplay from './components/output-formats-display'
import InputSettings from './components/input-settings'
import { generateAddressFormat } from './address-utils'
import Point from 'esri/geometry/Point'
import Conversion from 'esri/widgets/CoordinateConversion/support/Conversion'
import CoordinateConversionViewModel from 'esri/widgets/CoordinateConversion/CoordinateConversionViewModel'
import formatUtils from 'esri/widgets/CoordinateConversion/support/formatUtils'
import type Format from 'esri/widgets/CoordinateConversion/support/Format'
import * as reactiveUtils from 'esri/core/reactiveUtils'

interface State {
  supportedFormats: OutputSettings[]
  outputFormatCoordVM: CoordinateConversionViewModel
  conversionInfo: string[]
  jimuMapview: JimuMapView
  outputList: React.JSX.Element[]
  locatorURL: string
  isDisplayFullAddress: boolean
  selectedInputLocation: Point
  showEmptyOutput: boolean
  showLoading: boolean
}

interface OutputDisplayInfo {
  format: Format
  displayLabel: string
  isOpen: boolean
  addedAtRuntime?: boolean
}

interface ExtraProps {
  appMode: AppMode
}

const DEFAULT_POINT = new Point()

export default class Widget extends BaseWidget<AllWidgetProps<IMConfig> & ExtraProps, State> {
  mapView: __esri.MapView | __esri.SceneView
  private outputCoordinateList: string[]
  private _isMounted: boolean
  private _outputDisplayInfos: OutputDisplayInfo[]
  private readonly isRTL: boolean

  static mapExtraStateProps = (state: IMState): ExtraProps => {
    return {
      appMode: state.appRuntimeInfo?.appMode
    }
  }

  constructor (props) {
    super(props)
    //Get the default geocoding service URL
    const geocodeServiceURL = this.getDefaultGeocodeServiceURL()

    this.outputCoordinateList = []
    this._outputDisplayInfos = []
    this._isMounted = false
    this.isRTL = false

    const appState = getAppStore().getState()
    this.isRTL = appState?.appContext?.isRTL

    this.state = {
      conversionInfo: [],
      supportedFormats: [],
      outputFormatCoordVM: null,
      jimuMapview: null,
      outputList: [],
      locatorURL: geocodeServiceURL,
      isDisplayFullAddress: this.props.config?.addressSettings?.displayFullAddress ? this.props.config.addressSettings.displayFullAddress : false,
      selectedInputLocation: null,
      showEmptyOutput: true,
      showLoading: true //by default on widget load show loading indicator
    }
    //check whether any utility selected in configuration in the new app
    if (this.props.config.addressSettings?.useUtilitiesGeocodeService?.length > 0) {
      this.updateGeocodeURL()
    }
  }

  nls = (id: string) => {
    //for unit testing no need to mock intl we can directly use default en msg
    const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages)
    if (this.props.intl && this.props.intl.formatMessage) {
      return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] })
    } else {
      return messages[id]
    }
  }

  componentDidMount = () => {
    this._isMounted = true
    if (!this.isMapConfigured()) {
      this.createAPIWidget()
    }
  }

  didOutputSettingsChanged = (newSettings: ImmutableArray<OutputSettings>, prevSettings: OutputSettings[]): boolean => {
    let outputSettingsChanged = false
    if (newSettings.length !== prevSettings.length) {
      return true
    }
    // eslint-disable-next-line array-callback-return
    newSettings.some((newOutputSetting, index) => {
      if (newOutputSetting.name !== prevSettings[index].name ||
        newOutputSetting.label !== prevSettings[index].label ||
        newOutputSetting.enabled !== prevSettings[index].enabled ||
        newOutputSetting.currentPattern !== prevSettings[index].currentPattern) {
        outputSettingsChanged = true
        return true
      }
    })
    return outputSettingsChanged
  }

  componentDidUpdate = (prevPops) => {
    //check whether the live view mode is on or off and if mode is off display the default cursor
    if (this.props.appMode !== prevPops.appMode && this.props.appMode === AppMode.Design) {
      this._displayDefaultCursor()
    }
    const isMapWidgetIdsEqual = lodash.isDeepEqual(this.props.useMapWidgetIds, prevPops.useMapWidgetIds)
    //if map or output settings configuration is changed, update CVM and map instance, in result it will update output as well
    if (!isMapWidgetIdsEqual ||
      this.didOutputSettingsChanged(this.props.config.outputSettings, prevPops.config.outputSettings)) {
      const newState = {} as State
      //destroy if prev instance of CVM
      if (this.state.outputFormatCoordVM && this.state.outputFormatCoordVM) {
        this.state.outputFormatCoordVM.destroy()
      }
      newState.outputFormatCoordVM = null
      //if map is configured and map id is changed empty the result it will impact if map is of different SR
      //else when no map is configured set jimuMapview to null
      if (this.isMapConfigured()) {
        if (!isMapWidgetIdsEqual) {
          this._displayDefaultCursor()
          newState.showEmptyOutput = true
        }
      } else {
        this._displayDefaultCursor()
        newState.jimuMapview = null
      }
      //set the state and call create api widget function
      this.setState(newState, () => {
        this.createAPIWidget()
      })
    }

    //check for the updated geocode service url in config
    //if utility services is used then check if it is updated OR
    //if utility service was configured and now removed
    //In these two cases update the geocode url
    if ((this.props.config.addressSettings?.useUtilitiesGeocodeService?.length > 0 &&
      prevPops.config.addressSettings?.useUtilitiesGeocodeService?.[0]?.utilityId !== this.props.config.addressSettings?.useUtilitiesGeocodeService?.[0]?.utilityId) ||
      (this.props.config.addressSettings?.useUtilitiesGeocodeService?.length === 0 &&
        prevPops.config.addressSettings?.useUtilitiesGeocodeService.length !== this.props.config.addressSettings?.useUtilitiesGeocodeService.length)) {
      this.updateGeocodeURL()
    }

    //check if the display full address changed in config
    if (prevPops.config?.addressSettings?.displayFullAddress !== this.props.config?.addressSettings.displayFullAddress) {
      this.setState({
        isDisplayFullAddress: this.props.config?.addressSettings.displayFullAddress
      }, () => {
        this.updateGeocodeURL()
      })
    }
  }

  componentWillUnmount = () => {
    this._isMounted = false
  }

  updateGeocodeURL = () => {
    const conversions = this.state.outputFormatCoordVM?.conversions
    this.getGeocodeServiceURL().then((geocodeServiceURL) => {
      this.setState({
        locatorURL: geocodeServiceURL
      }, () => {
        if (conversions) {
          const addressFormat = generateAddressFormat(this.state.locatorURL, this.props.config.addressSettings.minCandidateScore, this.state.isDisplayFullAddress)
          conversions.forEach((conversionItem) => {
            if (conversionItem.format.name === 'address') {
              conversionItem.format = addressFormat
            }
          })
        }
      })
    })
  }

  getDefaultGeocodeServiceURL = () => {
    //by default use esri world geocoding service
    let geocodeServiceURL = 'https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer'
    //if geocoding service url is configured then use that (This is for backward compatibility before implementing Utility selector)
    //else if use org first geocode service
    if (this.props.config?.addressSettings?.geocodeServiceUrl) {
      geocodeServiceURL = this.props.config.addressSettings.geocodeServiceUrl
    } else if (this.props.portalSelf && this.props.portalSelf.helperServices && this.props.portalSelf.helperServices.geocode &&
      this.props.portalSelf.helperServices.geocode.length > 0 && this.props.portalSelf.helperServices.geocode[0].url) { // Use org's first geocode service if available
      geocodeServiceURL = this.props.portalSelf.helperServices.geocode[0].url
    }
    return geocodeServiceURL
  }

  getGeocodeServiceURL = async (): Promise<string> => {
    //Ge the default geocoding service url if utility service is not configured
    let geocodeServiceURL = this.getDefaultGeocodeServiceURL()
    const geocodeURlFromUtility = await this.getGeocodeURLFromUtility()
    // if utility services is used fetch its url
    if (this.props.config.addressSettings?.useUtilitiesGeocodeService?.length > 0) {
      geocodeServiceURL = geocodeURlFromUtility
    }
    return geocodeServiceURL
  }

  getGeocodeURLFromUtility = async (): Promise<string> => {
    if (this.props.config.addressSettings?.useUtilitiesGeocodeService?.length > 0) {
      return this.getUrlOfUseUtility(this.props.config.addressSettings?.useUtilitiesGeocodeService?.[0])
    }
    return Promise.resolve('')
  }

  //get url from the selcted utility
  getUrlOfUseUtility = async (useUtility: UseUtility): Promise<string> => {
    if (!useUtility) {
      return Promise.resolve('')
    }
    return UtilityManager.getInstance().getUrlOfUseUtility(useUtility)
      .then((url) => {
        return Promise.resolve(url)
      })
  }

  _displayDefaultCursor = () => {
    if (this.state.jimuMapview && this.state.jimuMapview.view) {
      if (this.state.jimuMapview.view && this.state.jimuMapview.view.container &&
        this.state.jimuMapview.view.container.style.cursor !== null) {
        this.state.jimuMapview.view.container.style.cursor = 'default'
      }
    }
  }

  onActiveViewChange = (jimuMapView: JimuMapView) => {
    if (!(jimuMapView && jimuMapView.view)) {
      return
    }
    this.setState({
      jimuMapview: jimuMapView
    }, () => {
      this.createAPIWidget()
    })
  }

  createAPIWidget = () => {
    if (!this.state.outputFormatCoordVM) {
      const cVM = new CoordinateConversionViewModel({
        view: this.state.jimuMapview ? this.state.jimuMapview.view : null
      })
      reactiveUtils.watch(() => cVM.state, async () => {
        await reactiveUtils.whenOnce(() => {
          if (cVM.state === 'ready') {
            //Call the pause method to avoid reverse geocode request on map mouse move
            cVM.pause()
          }
        })
      })
      reactiveUtils.watch(() => cVM.messages, () => {
        if (this._isMounted) {
          setTimeout(() => {
            //Call the pause method to avoid reverse geocode request on map mouse move
            if (!this._isMounted) {
              return
            }
            /**
             * with the implementation of 492, user can now add custom options in config & at runtime
             * when widget is in live mode, those options user added at runtime should also be maintained
             * runtime options can only be added at the top or bottom, not in the between of configured options
             * added the below logic to show the runtime options added before and after of the configured options
             */

            //generate new default formats
            const allFormats = formatUtils.generateDefaultFormats(cVM.messages)
            cVM.conversions.removeAll()
            const newOutputDisplayInfos = []; const outputDisplayInfosToBeAppended = []
            let append = false
            if (this._outputDisplayInfos && this._outputDisplayInfos.length > 0) {
              //loop through all the _outputDisplayInfos and check of those which are added at runtime
              this._outputDisplayInfos.forEach((outputDisplayInfo) => {
                const configuredSetting = outputDisplayInfo.format
                let newConversion
                //as soon as we get the configured option in _outputDisplayInfos, all the options added at runtime should be appended to the new configured options
                if (!append && !outputDisplayInfo.addedAtRuntime) {
                  append = true
                }
                //if the conversion is added at runtime
                //then if append flag is true add it in array outputDisplayInfosToBeAppended which will be appended to new configured options
                //else add it in newOutputDisplayInfos and then new configured options will be pushed in this array
                if (outputDisplayInfo.addedAtRuntime) {
                  if (configuredSetting.name === 'address') {
                    const addressFormat = generateAddressFormat(this.state.locatorURL, this.props.config.addressSettings.minCandidateScore, this.state.isDisplayFullAddress)
                    const runtimeAddrOutputDisplayInfo: OutputDisplayInfo = {
                      displayLabel: outputDisplayInfo.displayLabel,
                      isOpen: outputDisplayInfo.isOpen,
                      format: addressFormat,
                      addedAtRuntime: true
                    }
                    if (append) {
                      outputDisplayInfosToBeAppended.push(runtimeAddrOutputDisplayInfo)
                    } else {
                      cVM.conversions.add(new Conversion({ format: addressFormat }))
                      newOutputDisplayInfos.push(runtimeAddrOutputDisplayInfo)
                    }
                  } else if (configuredSetting.name !== 'basemap') {
                    const defaultFormat = formatUtils.generateDefaultFormats(cVM.messages).filter((format) => {
                      return format.name === configuredSetting.name
                    })
                    newConversion = new Conversion({ format: defaultFormat[0] })
                    newConversion.format.currentPattern = configuredSetting.currentPattern
                    const runtimeOutputDisplayInfo: OutputDisplayInfo = {
                      displayLabel: outputDisplayInfo.displayLabel,
                      isOpen: outputDisplayInfo.isOpen,
                      format: newConversion.format,
                      addedAtRuntime: true
                    }
                    if (append) {
                      outputDisplayInfosToBeAppended.push(runtimeOutputDisplayInfo)
                    } else {
                      cVM.conversions.add(newConversion)
                      newOutputDisplayInfos.push(runtimeOutputDisplayInfo)
                    }
                  }
                }
              })
            }

            //now the _outputDisplayInfos will have only previously added options at runtime which should be on top
            this._outputDisplayInfos = newOutputDisplayInfos.slice()
            //Now add configured options
            //when output settings are configured use them and show configured coordinate formats along with the options added at the runtime
            //else show all formats
            if (this.props.config && this.props.config.outputSettings && this.props.config.outputSettings.length > 0) {
              this.props.config.outputSettings.forEach((configuredSetting) => {
                if (configuredSetting.enabled) {
                  let newConversion
                  if (configuredSetting.name === 'address') {
                    const addressFormat = generateAddressFormat(this.state.locatorURL, this.props.config.addressSettings.minCandidateScore, this.state.isDisplayFullAddress)
                    cVM.conversions.add(new Conversion({ format: addressFormat }))
                    this._outputDisplayInfos.push({ displayLabel: configuredSetting.label, isOpen: false, format: addressFormat } as OutputDisplayInfo)
                  } else if (configuredSetting.name !== 'basemap') {
                    const defaultFormat = formatUtils.generateDefaultFormats(cVM.messages).filter((format) => {
                      return format.name === configuredSetting.name
                    })
                    newConversion = new Conversion({ format: defaultFormat[0] })
                    newConversion.format.currentPattern = configuredSetting.currentPattern
                    cVM.conversions.add(newConversion)
                    this._outputDisplayInfos.push({ displayLabel: configuredSetting.label, isOpen: false, format: defaultFormat[0] } as OutputDisplayInfo)
                  }
                }
              })
              //After adding all the configured options now append options which are added at runtime
              if (outputDisplayInfosToBeAppended && outputDisplayInfosToBeAppended.length > 0) {
                outputDisplayInfosToBeAppended.forEach((outputDisplayInfo) => {
                  const newConversion = new Conversion({ format: outputDisplayInfo.format })
                  cVM.conversions.add(newConversion)
                  this._outputDisplayInfos.push({
                    displayLabel: outputDisplayInfo.displayLabel,
                    isOpen: outputDisplayInfo.isOpen,
                    format: newConversion.format,
                    addedAtRuntime: true
                  } as OutputDisplayInfo)
                })
              }
            } else {
              //On first load output settings will be an empty array, so by default add all the formats
              const addressFormat = generateAddressFormat(this.state.locatorURL, this.props.config.addressSettings.minCandidateScore, this.state.isDisplayFullAddress)
              cVM.conversions.add(new Conversion({ format: addressFormat }))
              this._outputDisplayInfos.push({ displayLabel: this.nls('address'), isOpen: false, format: addressFormat } as OutputDisplayInfo)
              allFormats.forEach((defaultFormat) => {
                let newConversion
                if (defaultFormat.name !== 'basemap') {
                  newConversion = new Conversion({ format: defaultFormat })
                  newConversion.format.currentPattern = defaultFormat.currentPattern
                  cVM.conversions.add(newConversion)
                  this._outputDisplayInfos.push({ displayLabel: this.nls(defaultFormat.name), isOpen: false, format: defaultFormat } as OutputDisplayInfo)
                }
              })
            }
            this.setState({
              outputFormatCoordVM: cVM
            }, () => {
              //if selectedInputLocation is null
              //once CCVm is set, set the default location to show empty output conversions
              //Only the configured Output formats will be displayed
              //Also, hide the loading indicator which was shown on widget load.
              //else show output conversions for prev selected location (will be useful for builder and live mode)
              if (this.state.selectedInputLocation === null) {
                this.setState({
                  selectedInputLocation: DEFAULT_POINT,
                  showLoading: false
                }, () => {
                  this.updateOutputConversions()
                })
              } else {
                this.updateOutputConversions()
              }
            })
          }, 400)
        }
      })
    }
  }

  onCoordinateSystemRemove = (index: number) => {
    this.state.outputFormatCoordVM.conversions.remove(this.state.outputFormatCoordVM.conversions.getItemAt(index))
    this._outputDisplayInfos.splice(index, 1)
    this.updateOutputConversions()
  }

  updateDisplayState = (index: number, isActive: boolean) => {
    this._outputDisplayInfos[index].isOpen = isActive
  }

  updateCurrentPattern = (index: number, label: string, newPattern: string) => {
    this.state.outputFormatCoordVM.conversions.getItemAt(index).format.currentPattern = newPattern
    this._outputDisplayInfos[index].displayLabel = label
    this.updateOutputConversions()
  }

  updateOutputConversions = () => {
    if (this.state.selectedInputLocation) {
      this.setState({
        showLoading: true
      }, () => {
        this.state.outputFormatCoordVM?.updateConversions(this.state.outputFormatCoordVM.conversions.toArray(), this.state.selectedInputLocation).then(() => {
          if (this.state.outputFormatCoordVM) {
            this.renderOutputList(this.state.outputFormatCoordVM.conversions)
          }
        }, (err) => {
          this.setState({
            showLoading: false
          })
          console.log(err.message)
        })
      })
    }
  }

  renderOutputList = (results) => {
    const items: React.JSX.Element[] = []
    //empty prev output coordinate list
    this.outputCoordinateList = []
    this.setState({
      outputList: []
    }, () => {
      results.forEach((conversionInfo, index) => {
        let displayValue = conversionInfo.displayCoordinate
        const label = this._outputDisplayInfos[index] ? this._outputDisplayInfos[index].displayLabel : conversionInfo.format.name
        //for empty address show nls msg - No address found
        if (conversionInfo.format.name === 'address' &&
          (displayValue === '' || displayValue === null)) {
          displayValue = this.nls('noAddressFoundMsg')
        }
        //Push output label and display value in outputCoordinateList, which will be used for copy all
        this.outputCoordinateList.push(label + '\r\n' + displayValue)
        items.push(<OutputFormatsDisplay
          displayLabel={label}
          isOpen={this._outputDisplayInfos[index] ? this._outputDisplayInfos[index].isOpen : false}
          parentWidgetId={this.props.id}
          intl={this.props.intl}
          theme={this.props.theme}
          index={index}
          key={index}
          displayCoordinates={displayValue}
          onRemove={this.onCoordinateSystemRemove.bind(this)}
          conversionInfo={conversionInfo}
          onOutPutSettingsActive={this.updateDisplayState.bind(this)}
          onCurrentPatternChange={this.updateCurrentPattern.bind(this)}
          isEmpty={this.state.showEmptyOutput}
          isRTL={this.isRTL}>
        </OutputFormatsDisplay>)
      })
      this.setState({
        outputList: items,
        showLoading: false
      })
    })
  }

  addNewFormat = (name, label, currentPattern, addAtTheTop) => {
    let newConversion
    //Create new conversion based on the newly added format
    if (name === 'address') {
      const addressFormat = generateAddressFormat(this.state.locatorURL, this.props.config.addressSettings.minCandidateScore, this.state.isDisplayFullAddress)
      newConversion = new Conversion({ format: addressFormat })
    } else {
      const newFormats = formatUtils.generateDefaultFormats(this.state.outputFormatCoordVM.messages)
      const newFormat = newFormats.filter((format) => {
        return format.name === name
      })
      newFormat[0].currentPattern = currentPattern
      newConversion = new Conversion({ format: newFormat[0] })
    }
    //create new newOutputDisplayInfo based on selected format and label
    const newOutputDisplayInfo: OutputDisplayInfo = {
      displayLabel: label,
      isOpen: false,
      format: newConversion.format,
      addedAtRuntime: true
    }
    //based on addAtTheTop add conversion at 0 or else at the last index
    if (addAtTheTop) {
      this.state.outputFormatCoordVM.conversions.splice(0, 0, newConversion)
      this._outputDisplayInfos.splice(0, 0, newOutputDisplayInfo)
    } else {
      this.state.outputFormatCoordVM.conversions.add(newConversion)
      this._outputDisplayInfos.push(newOutputDisplayInfo)
    }
    // added timer to fix https://github.com/ArcGIS/solutions-web-collaboration/issues/1221
    setTimeout(() => {
      this.updateOutputConversions()
    }, 100)
  }

  /* This function should only be called on input conversion complete .
   Don't call this function from anywhere else as it will set showEmptyOutput to false.
  showEmptyOutput should remain true untill any location is not selected from input component*/
  onInputConversionComplete = (locationPoint: Point) => {
    this.setState({
      selectedInputLocation: locationPoint || DEFAULT_POINT,
      showEmptyOutput: false
    }, () => {
      this.updateOutputConversions()
    })
  }

  onInputProcessing = (isProcessing: boolean) => {
    this.setState({
      showLoading: isProcessing
    })
  }

  onInputClear = () => {
    this.setState({
      selectedInputLocation: DEFAULT_POINT,
      showEmptyOutput: true
    }, () => {
      this.updateOutputConversions()
    })
  }

  /**
   * Returns true/false based on if map is configured or not
   */
  isMapConfigured = (): boolean => {
    return this.props.useMapWidgetIds && this.props.useMapWidgetIds.length === 1
  }

  /**
   * Input Settings can be loaded if map is not configured or
   * If map is configured it should have view loaded
   */
  canLoadInputSettings = (): boolean => {
    if (!this.isMapConfigured()) {
      return true
    } else {
      if (this.state.jimuMapview) {
        return true
      }
    }
    return false
  }

  render () {
    let maxSuggestions = 6
    if (this.props.config?.addressSettings?.maxSuggestions || this.props.config?.addressSettings?.maxSuggestions === 0) {
      maxSuggestions = this.props.config.addressSettings.maxSuggestions
    }
    return (
      <Paper css={getStyle(this.props.theme)} shape="none" className="jimu-widget">
        <div className="widget-coordinate-conversion">
          {this.isMapConfigured() &&
            <JimuMapViewComponent useMapWidgetId={this.props.useMapWidgetIds[0]} onActiveViewChange={this.onActiveViewChange}></JimuMapViewComponent>
          }

          {/* Input */}
          {this.canLoadInputSettings() &&
              <InputSettings
                copyAllList={this.outputCoordinateList}
                parentWidgetId={this.props.id}
                intl={this.props.intl}
                config={this.props.config}
                theme={this.props.theme}
                jimuMapview={this.state.jimuMapview}
                locatorURL={this.state.locatorURL}
                minCandidateScore={this.props.config.addressSettings.minCandidateScore}
                maxSuggestions={maxSuggestions}
                displayFullAddress={ this.state.isDisplayFullAddress}
                onConversionComplete={this.onInputConversionComplete}
                processing={this.onInputProcessing}
                onClear={this.onInputClear}
                addNewConversion={this.addNewFormat}
              />
          }
          {/* Output */}
          {<div className="mt-5">
            {this.state.outputList}
          </div>
          }
          {/* Loading Indicator */}
          {this.state.showLoading && <Loading type={LoadingType.Secondary} />}
        </div>
      </Paper>
    )
  }
}
