/** @jsx jsx */
import { React, jsx, css, getAppStore, Immutable, lodash, type ImmutableArray, proxyUtils, SupportedUtilityType, type UseUtility, SessionManager } from 'jimu-core'
import { type AllWidgetSettingProps, getAppConfigAction, helpUtils } from 'jimu-for-builder'
import { SettingSection, SettingRow, MapWidgetSelector, SidePopper, SettingCollapse } from 'jimu-ui/advanced/setting-components'
import { Radio, TextArea, Select, Switch, Label, Button, Icon, Checkbox, Popper, NumericInput, Tabs, Tab } from 'jimu-ui'
import defaultMessages from './translations/default'
import { getStyle } from './lib/style'
import { ArcgisBaSearch, ArcgisReportList } from '../../node_modules/@arcgis/business-analyst-components/dist/components'
import { defineCustomElements } from '../../node_modules/@arcgis/business-analyst-components/dist/stencil-components/loader'
import { GEClient } from '../../node_modules/@arcgis/business-analyst-components/dist/stencil-components/dist/collection/util/mobile/GEClient'
import { TokenProvider } from '../../node_modules/@arcgis/business-analyst-components/dist/stencil-components/dist/collection/util/mobile/TokenProvider'


import { ColorPicker } from 'jimu-ui/basic/color-picker'
import { Mode, ViewMode, TravelDirection, TrafficType, type TravelMode } from '../config'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import ChartColumnOutlined from 'jimu-icons/svg/outlined/data/chart-column.svg'
import PinEsriOutlined from 'jimu-icons/svg/outlined/gis/pin-esri.svg'
import PolygonOutlined from 'jimu-icons/svg/outlined/gis/polygon.svg'
import SearchOutlined from 'jimu-icons/svg/outlined/editor/search.svg'
import RingsIcon from './assets/rings32.svg'
import DriveIcon from './assets/drivetime32.svg'
import WalkIcon from './assets/walktime32.svg'
import { UtilitySelector } from 'jimu-ui/advanced/utility-selector'
import CloseOutlined from 'jimu-icons/svg/outlined/editor/close.svg'
import { ACLUtils } from '../../node_modules/@arcgis/business-analyst-components/dist/stencil-components/dist/collection/ACLUtils'
import { getCountries, getValidHierarchies, getLatestHierarchyID, getActiveHierarchyId } from '../countries'

// import { StateManager } from '../ba-utilities/StateManager/StateManager'

enum InfoBufferType { ring = 'ring', drivetime = 'drivetime', walktime = 'walktime' }
enum BaSearchType { all = '0', locations = '1', boundaries = '2' }
// TM - Travel mode types now imported from config

export interface TravelModeOptions {
  mode: string | TravelMode | undefined // Support both enum/string itemId and TravelMode object
  direction: TravelDirection
  useTrafficEnabled: boolean
  useTrafficChecked: boolean
  trafficType: TrafficType
  offsetTime: number
  offsetDay: string
  offsetHr: string
}

const popperStyles = () => {
  return css`
      width: 240px;
      padding: 10px;

      h1, h2, h3, h4, h5, h6 {
        color: var(--sys-color-surface-paperText);
      }

      .btn-primary {
        min-width: 100px;
        color: var(--sys-color-action-text);
        background-color: var(--sys-color-action-default);
        border: 1px solid var(--sys-color-divider-secondary);
        box-shadow: 0 2px 12px 0 rgba(95,95,255,0.10); /* reduced shadow for theme consistency */
      }
    `
}

enum MaxBuffers {
  Rings = 1000,
  DriveMinutes = 300,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  DriveMile = 300,
  DriveKm = 482.8,
  // eslint-disable-next-line @typescript-eslint/no-duplicate-enum-values
  WalkMinutes = 300,
  WalkMile = 27,
  WalkKm = 43.45
}

const supportedUtilityTypes = [SupportedUtilityType.GeoEnrichment]

const defaultFillSymbol = {
  type: 'esriSFS',
  color: [245, 172, 70, 102],
  outline: {
    type: 'esriSLS',
    color: [204, 50, 2, 179],
    width: 1,
    style: 'esriSLSSolid'
  },
  style: 'esriSFSSolid'
}

export default class Setting extends React.PureComponent<AllWidgetSettingProps<any>, any> {
  // export default class Setting extends React.Component<AllWidgetSettingProps<any>, any> {
  static SettingRegistry: any = {}

  // stateManager: StateManager
  sidePopperTrigger = React.createRef<HTMLDivElement>()
  _mapWidgetId
  modeInfoRef: React.RefObject<unknown>
  linkInfographicRef: React.RefObject<unknown>
  allowSearchInfoRef: React.RefObject<unknown>
  useLatestDSInfoRef: React.RefObject<unknown>
  userBufferInfoRef: React.RefObject<unknown>
  allowChoiceInfoRef: React.RefObject<unknown>
  _checkedItemsList
  _ignoreNextDefaultClick: boolean = false
  sessionToken: string = null
  _hasSetDefaults: boolean = false
  // TM
  travelModeDefaults: TravelModeOptions = {
    mode: undefined, // Travel modes will come from service only
    direction: TravelDirection.away,
    useTrafficEnabled: true,
    useTrafficChecked: false,
    trafficType: TrafficType.live,
    offsetTime: 0, // Now
    offsetDay: '', // localized Monday
    offsetHr: '' // localized 12 PM
  }
  _dtoStates = [
    // Note: stTravelModeData is handled separately to preserve full object structure
    'stTravelDirection',
    'stUseTrafficChecked',
    'stTrafficType',
    'stOffsetTime',
    'stOffsetDay',
    'stOffsetHr'
  ]

  constructor ( props ) {
    super( props )
    Setting.SettingRegistry[this.props.id] = this

    // this.stateManager = new StateManager( "arcgis-app-state" );

    this.modeInfoRef = React.createRef()
    this.linkInfographicRef = React.createRef()
    this.allowSearchInfoRef = React.createRef()
    this.userBufferInfoRef = React.createRef()
    this.allowChoiceInfoRef = React.createRef()
    this.useLatestDSInfoRef = React.createRef()

    this._hasSetDefaults = false
    const isAll = props.config.baSearchType === BaSearchType.all
    const geogEnabled = isAll || props.config.baSearchType === BaSearchType.boundaries
    const ptsEnabled = isAll || props.config.baSearchType === BaSearchType.locations

    defineCustomElements( window )

    this.state = {
      countries: null,
      error: null,
      modePopperOpen: false,
      useLatestDSInfoIconOpen: false,
      allowSearchInfoIconOpen: false,
      allowBufferInfoIconOpen: false,
      allowInfographicChoiceIconOpen: false,
      settingsOpen: false,
      availableHierarchies: null,
      selectedHierarchyObj: null,
      selectedCountry: props.config.sourceCountry, // Setting.tsx local country state value init from shared prop
      availableGeographyLevels: props.config.availableGeographyLevels,
      activeGeographyLevels: props.config.selectedGeographyLevels,
      baSearchType: props.config.baSearchType,
      geographiesChecked: geogEnabled,
      pointsOfInterestChecked: ptsEnabled,
      presetShowSearchInput: false,
      presetSearchSidePopper: false,
      presetBufferSidePopper: false,
      presetInfographicSidePopper: false,
      workflowSearchSidePopper: false,
      workflowBufferSidePopper: false,
      workflowInfographicSidePopper: false,
      workflowShowSearchInput: false,
      presetBuffersQueued: false,
      stPresetBuffer: null,
      stPresetRingsBuffer1: null,
      stPresetRingsBuffer2: null,
      stPresetRingsBuffer3: null,
      stPresetRingsBufferUnit: null,
      stPresetDrivetimeBuffer1: null,
      stPresetDrivetimeBuffer2: null,
      stPresetDrivetimeBuffer3: null,
      stPresetDrivetimeBufferUnit: null,
      stPresetWalktimeBuffer1: null,
      stPresetWalktimeBuffer2: null,
      stPresetWalktimeBuffer3: null,
      stPresetWalktimeBufferUnit: null,
      stViewMode: ViewMode.Auto,
      // default is minutes
      maxDriveBuffer: MaxBuffers.DriveMinutes,
      maxWalkBuffer: MaxBuffers.WalkMinutes,
      portalUrl: props.portalUrl,
      geocodeUrl: props.portalSelf.helperServices && props.portalSelf.helperServices.geocode && props.portalSelf.helperServices.geocode[0].url,
      geoenrichmentServiceUrl: props.portalSelf.helperServices && props.portalSelf.helperServices.geoenrichment && props.portalSelf.helperServices.geoenrichment.url,
      routingUtilityUrl: props.portalSelf.helperServices && props.portalSelf.helperServices.routingUtilities && props.portalSelf.helperServices.routingUtilities.url,
      searchbarEnabled: props.config.searchbarEnabled,
      drawPointEnabled: props.config.drawPointEnabled,
      drawPolygonEnabled: props.config.drawPointEnabled,
      portalHelpUrl: '',
      stUseTrafficChecked: false,
      stTravelModeData: '',
      stTravelDirection: TravelDirection.away,
      stTrafficType: TrafficType.live,
      stOffsetTime: 0,
      stOffsetDay: 'Monday',
      stOffsetHr: '12:00 PM',
      travelModes: [],
      isLoadingTravelModes: false

    }

    this.onPropertyChange( 'syncBufferSettings', false )
    // Need to set proxy referrer if proxy is already configured from creating a copy of existing app
    if ( props.config.geoenrichmentConfig?.useUtility?.utilityId ) {
      this.setProxyReferrer()
    }
  }

  getToken() {
    if ( !this.sessionToken ) {
      if ( SessionManager ) {
        this.sessionToken = SessionManager.getInstance()?.getMainSession()?.token
      }
    }
    return this.sessionToken
  }

  presetColors = [
    { label: 'Paper', value: 'var(--sys-color-surface-paper)', color: 'var(--sys-color-surface-paper)' },
    { label: 'Overlay', value: 'var(--sys-color-surface-overlay)', color: 'var(--sys-color-surface-overlay)' },
    { label: 'Primary', value: 'var(--sys-color-brand-primary)', color: 'var(--sys-color-brand-primary)' },
    { label: 'White', value: '#FFFFFF', color: '#FFFFFF' }
  ]

  preloadData = () => {
    this.setDefaults()
  }

  missingBuffers = ( bufferType ) => {
    const {
      widgetMode,
      workflowEnableUserConfigBuffers,
      presetBuffer,
      presetRingsBuffer1,
      presetRingsBuffer2,
      presetRingsBuffer3,
      presetDrivetimeBuffer1,
      presetDrivetimeBuffer2,
      presetDrivetimeBuffer3,
      presetWalktimeBuffer1,
      presetWalktimeBuffer2,
      presetWalktimeBuffer3,
      workflowBuffer,
      workflowRingsBuffer1,
      workflowRingsBuffer2,
      workflowRingsBuffer3,
      workflowDrivetimeBuffer1,
      workflowDrivetimeBuffer2,
      workflowDrivetimeBuffer3,
      workflowWalktimeBuffer1,
      workflowWalktimeBuffer2,
      workflowWalktimeBuffer3
    } = this.props.config

    if ( widgetMode === Mode.Preset ) {
      switch ( bufferType ) {
        case InfoBufferType.ring:
          if ( presetBuffer === InfoBufferType.ring && ACLUtils.notDef( presetRingsBuffer1 ) && ACLUtils.notDef( presetRingsBuffer2 ) && ACLUtils.notDef( presetRingsBuffer3 ) ) {
            return true
          }
        case InfoBufferType.drivetime:
          if ( presetBuffer === InfoBufferType.drivetime && ACLUtils.notDef( presetDrivetimeBuffer1 ) && ACLUtils.notDef( presetDrivetimeBuffer2 ) && ACLUtils.notDef( presetDrivetimeBuffer3 ) ) {
            return true
          }
        case InfoBufferType.walktime:
          if ( presetBuffer === InfoBufferType.walktime && ACLUtils.notDef( presetWalktimeBuffer1 ) && ACLUtils.notDef( presetWalktimeBuffer2 ) && ACLUtils.notDef( presetWalktimeBuffer3 ) ) {
            return true
          }
        default:
          return false
      }
    } else {
      if ( ACLUtils.notDef( workflowEnableUserConfigBuffers ) ) {
        return true
      } else if ( !workflowEnableUserConfigBuffers ) {
        switch ( bufferType ) {
          case InfoBufferType.ring:
            if ( workflowBuffer === InfoBufferType.ring && ACLUtils.notDef( workflowRingsBuffer1 ) && ACLUtils.notDef( workflowRingsBuffer2 ) && ACLUtils.notDef( workflowRingsBuffer3 ) ) {
              return true
            }
          case InfoBufferType.drivetime:
            if ( workflowBuffer === InfoBufferType.drivetime && ACLUtils.notDef( workflowDrivetimeBuffer1 ) && ACLUtils.notDef( workflowDrivetimeBuffer2 ) && ACLUtils.notDef( workflowDrivetimeBuffer3 ) ) {
              return true
            }
          case InfoBufferType.walktime:
            if ( workflowBuffer === InfoBufferType.walktime && ACLUtils.notDef( workflowWalktimeBuffer1 ) && ACLUtils.notDef( workflowWalktimeBuffer2 ) && ACLUtils.notDef( workflowWalktimeBuffer3 ) ) {
              return true
            }
          default:
            return false
        }
      }
    }
  }

  _presetChangedTimer = null
  _cancelPresetTimer() {
    if ( this._presetChangedTimer ) { clearInterval( this._presetChangedTimer ); this._presetChangedTimer = null }
  }

  _setPresetBuffersChanged() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    self._cancelPresetTimer()
    requestAnimationFrame( () => {
      self.onPropertyChange( 'presetBuffersHaveChanged', true )
      self._presetChangedTimer = setTimeout( () => {
        self._cancelPresetTimer()
        self.onPropertyChange( 'presetBuffersHaveChanged', false )
      }, 0 )
    } )
  }

  // NOTE: When changing default values, also verify they are updated in the widget constructor as that is
  // called prior to this for new Experience Builder app creation
  setDefaults() {
    const changeArr = []
    if ( ACLUtils.notDef( this.props.config.widgetMode ) ) {
      changeArr.push( { name: 'widgetMode', value: Mode.Workflow } )
    }
    if ( ACLUtils.notDef( this.props.config.viewMode ) ) {
      changeArr.push( { name: 'viewMode', value: ViewMode.Auto } )
    }
    if ( ACLUtils.notDef( this.props.config.sourceCountry ) ) {
      changeArr.push( { name: 'sourceCountry', value: 'US' } )
    }
    if ( ACLUtils.notDef( this.props.config.widgetPlaceholderText ) ) {
      changeArr.push( { name: 'widgetPlaceholderText', value: this.localeString( 'widgetPlaceholderText' ) } )
    }
    if ( ACLUtils.notDef( this.props.config.widgetPlaceholderTextToggle ) ) {
      changeArr.push( { name: 'widgetPlaceholderTextToggle', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.workflowIntroText ) || this.props.config.workflowIntroText === defaultMessages.introTextWithDraw ) {
      changeArr.push( { name: 'workflowIntroText', value: this.localeString( 'introTextWithDraw' ) } )
    }
    if ( ACLUtils.notDef( this.props.config.workflowIntroTextReports ) || this.props.config.workflowIntroTextReports === defaultMessages.infographicDesc ) {
      changeArr.push( { name: 'workflowIntroTextReports', value: this.localeString( 'infographicDesc' ) } )
    }
    if ( ACLUtils.notDef( this.props.config.workflowIntroTextBuffers ) || this.props.config.workflowIntroTextBuffers === defaultMessages.bufferExtentDesc ) {
      changeArr.push( { name: 'workflowIntroTextBuffers', value: this.localeString( 'bufferExtentDesc' ) } )
    }
    if ( ACLUtils.notDef( this.props.config.langCode ) ) {
      changeArr.push( { name: 'langCode', value: 'en-us' } )
    }
    if ( ACLUtils.notDef( this.props.config.igBackgroundColor ) ) {
      changeArr.push( { name: 'igBackgroundColor', value: '#525659' } )
    }
    if ( ACLUtils.notDef( this.props.config.runReportOnClick ) ) {
      changeArr.push( { name: 'runReportOnClick', value: false } )
    }
    if ( ACLUtils.notDef( this.props.config.displayHeader ) ) {
      changeArr.push( { name: 'displayHeader', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.headerColor ) ) {
      changeArr.push( { name: 'headerColor', value: '#151515' } )
    }
    if ( ACLUtils.notDef( this.props.config.headerTextColor ) ) {
      changeArr.push( { name: 'headerTextColor', value: '#FFFFFF' } )
    }
    if ( ACLUtils.notDef( this.props.config.imageExport ) ) {
      changeArr.push( { name: 'imageExport', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.pdf ) ) {
      changeArr.push( { name: 'pdf', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.dynamicHtml ) ) {
      changeArr.push( { name: 'dynamicHtml', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.excel ) ) {
      changeArr.push( { name: 'excel', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.fullscreen ) ) {
      changeArr.push( { name: 'fullscreen', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.zoomLevel ) ) {
      changeArr.push( { name: 'zoomLevel', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.workflowEnableSearch ) ) {
      changeArr.push( { name: 'workflowEnableSearch', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.workflowDisplayIntroText ) ) {
      changeArr.push( { name: 'workflowDisplayIntroText', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.restrictSearch ) ) {
      changeArr.push( { name: 'restrictSearch', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.workflowEnableUserConfigBuffers ) ) {
      changeArr.push( { name: 'workflowEnableUserConfigBuffers', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.baSearchType ) ) {
      changeArr.push( { name: 'baSearchType', value: BaSearchType.all } )
    }
    if ( ACLUtils.notDef( this.props.config.workflowAvailableBufferRings ) ) {
      changeArr.push( { name: 'workflowAvailableBufferRings', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.workflowAvailableBufferDrivetime ) ) {
      changeArr.push( { name: 'workflowAvailableBufferDrivetime', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.workflowAvailableBufferWalktime ) ) {
      changeArr.push( { name: 'workflowAvailableBufferWalktime', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.presetSearchSelectedObject ) ) {
      changeArr.push( { name: 'presetSearchSelectedObject', value: null } )
    }
    if ( ACLUtils.notDef( this.props.config.presetSelectedReport ) ) {
      changeArr.push( { name: 'presetSelectedReport', value: null } )
    }
    if ( ACLUtils.notDef( this.props.config.presetSelectedReportName ) ) {
      changeArr.push( { name: 'presetSelectedReportName', value: null } )
    }
    if ( ACLUtils.notDef( this.props.config.workflowSearchSelectedObject ) ) {
      changeArr.push( { name: 'workflowSearchSelectedObject', value: null } )
    }
    if ( ACLUtils.notDef( this.props.config.autoSelectLatestDataSource ) ) {
      changeArr.push( { name: 'autoSelectLatestDataSource', value: false } )
    }
    if ( ACLUtils.notDef( this.props.config.standardInfographicID ) ) {
      changeArr.push( { name: 'standardInfographicID', value: undefined } )
    }
    if ( ACLUtils.notDef( this.props.config.workflowIntroTextReportCheckbox ) ) {
      changeArr.push( { name: 'workflowIntroTextReportCheckbox', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.workflowIntroTextBuffersCheckbox ) ) {
      changeArr.push( { name: 'workflowIntroTextBuffersCheckbox', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.workflowEnableInfographicChoice ) ) {
      changeArr.push( { name: 'workflowEnableInfographicChoice', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.defaultReport ) ) {
      changeArr.push( { name: 'defaultReport', value: undefined } )
    }
    if ( ACLUtils.notDef( this.props.config.reportList ) ) {
      changeArr.push( { name: 'reportList', value: {} } )
    }
    if ( ACLUtils.notDef( this.props.config.workflowBuffer ) ) {
      changeArr.push( { name: 'workflowBuffer', value: InfoBufferType.ring } )
    }
    if ( this.missingBuffers( InfoBufferType.ring ) ) {
      changeArr.push( { name: 'workflowRingsBuffer1', value: 1 } )
    }
    if ( this.missingBuffers( InfoBufferType.ring ) ) {
      changeArr.push( { name: 'workflowRingsBuffer2', value: 3 } )
    }
    if ( this.missingBuffers( InfoBufferType.ring ) ) {
      changeArr.push( { name: 'workflowRingsBuffer3', value: 5 } )
    }
    if ( ACLUtils.notDef( this.props.config.workflowRingsBufferUnit ) ) {
      changeArr.push( { name: 'workflowRingsBufferUnit', value: 'miles' } )
    }
    if ( this.missingBuffers( InfoBufferType.drivetime ) ) {
      changeArr.push( { name: 'workflowDrivetimeBuffer1', value: 5 } )
    }
    if ( this.missingBuffers( InfoBufferType.drivetime ) ) {
      changeArr.push( { name: 'workflowDrivetimeBuffer2', value: 10 } )
    }
    if ( this.missingBuffers( InfoBufferType.drivetime ) ) {
      changeArr.push( { name: 'workflowDrivetimeBuffer3', value: 15 } )
    }
    if ( ACLUtils.notDef( this.props.config.workflowDrivetimeBufferUnit ) ) {
      changeArr.push( { name: 'workflowDrivetimeBufferUnit', value: 'minutes' } )
    }
    if ( this.missingBuffers( InfoBufferType.walktime ) ) {
      changeArr.push( { name: 'workflowWalktimeBuffer1', value: 5 } )
    }
    if ( this.missingBuffers( InfoBufferType.walktime ) ) {
      changeArr.push( { name: 'workflowWalktimeBuffer2', value: 10 } )
    }
    if ( this.missingBuffers( InfoBufferType.walktime ) ) {
      changeArr.push( { name: 'workflowWalktimeBuffer3', value: 15 } )
    }
    if ( ACLUtils.notDef( this.props.config.workflowWalktimeBufferUnit ) ) {
      changeArr.push( { name: 'workflowWalktimeBufferUnit', value: 'minutes' } )
    }

    if ( !this._hasSetDefaults ) {
      this._hasSetDefaults = true

      changeArr.push( { name: 'presetBuffersHaveChanged', value: false } )

      if ( ACLUtils.notDef( this.props.config.presetBuffer ) && ACLUtils.notDef( this.state.stPresetBuffer ) ) {
        this.updateState( 'stPresetBuffer', InfoBufferType.ring )
        //changeArr.push({ name: 'presetBuffer', value: InfoBufferType.ring })
      } else if ( ACLUtils.notDef( this.props.config.presetBuffer ) && ACLUtils.isDef( this.state.stPresetBuffer ) ) {
        changeArr.push( { name: 'presetBuffer', value: this.state.stPresetBuffer } )
      } else {
        this.updateState( 'stPresetBuffer', this.props.config.presetBuffer )
      }
      if ( this.missingBuffers( InfoBufferType.ring ) ) {
        this.updateState( 'stPresetRingsBuffer1', 1 )
        //changeArr.push({ name: 'presetRingsBuffer1', value: 1 })
      } else if ( ACLUtils.notDef( this.props.config.presetRingsBuffer1 ) && ACLUtils.isDef( this.state.stPresetRingsBuffer1 ) ) {
        changeArr.push( { name: 'presetRingsBuffer1', value: this.state.stPresetRingsBuffer1 } )
      } else {
        this.updateState( 'stPresetRingsBuffer1', this.props.config.presetRingsBuffer1 )
      }
      if ( this.missingBuffers( InfoBufferType.ring ) ) {
        this.updateState( 'stPresetRingsBuffer2', 3 )
        //changeArr.push({ name: 'presetRingsBuffer2', value: 3 })
      } else if ( ACLUtils.notDef( this.props.config.presetRingsBuffer2 ) && ACLUtils.isDef( this.state.stPresetRingsBuffer2 ) ) {
        changeArr.push( { name: 'presetRingsBuffer2', value: this.state.stPresetRingsBuffer2 } )
      } else {
        this.updateState( 'stPresetRingsBuffer2', this.props.config.presetRingsBuffer2 )
      }
      if ( this.missingBuffers( InfoBufferType.ring ) ) {
        this.updateState( 'stPresetRingsBuffer3', 5 )
        //changeArr.push({ name: 'presetRingsBuffer3', value: 5 })
      } else if ( ACLUtils.notDef( this.props.config.presetRingsBuffer3 ) && ACLUtils.isDef( this.state.stPresetRingsBuffer3 ) ) {
        changeArr.push( { name: 'presetRingsBuffer3', value: this.state.stPresetRingsBuffer3 } )
      } else {
        this.updateState( 'stPresetRingsBuffer3', this.props.config.presetRingsBuffer3 )
      }
      if ( ACLUtils.notDef( this.props.config.presetRingsBufferUnit ) && ACLUtils.notDef( this.state.stPresetRingsBufferUnit ) ) {
        this.updateState( 'stPresetRingsBufferUnit', 'miles' )
      } else if ( ACLUtils.notDef( this.props.config.presetRingsBufferUnit ) && ACLUtils.isDef( this.state.stPresetRingsBufferUnit ) ) {
        changeArr.push( { name: 'presetRingsBufferUnit', value: this.state.stPresetRingsBufferUnit } )
      } else {
        this.updateState( 'stPresetRingsBufferUnit', this.props.config.presetRingsBufferUnit )
      }
      if ( this.missingBuffers( InfoBufferType.drivetime ) ) {
        this.updateState( 'stPresetDrivetimeBuffer1', 5 )
      } else if ( ACLUtils.notDef( this.props.config.presetDrivetimeBuffer1 ) && ACLUtils.isDef( this.state.stPresetDrivetimeBuffer1 ) ) {
        changeArr.push( { name: 'presetDrivetimeBuffer1', value: this.state.stPresetDrivetimeBuffer1 } )
      } else {
        this.updateState( 'stPresetDrivetimeBuffer1', this.props.config.presetDrivetimeBuffer1 )
      }
      if ( this.missingBuffers( InfoBufferType.drivetime ) ) {
        this.updateState( 'stPresetDrivetimeBuffer2', 10 )
      } else if ( ACLUtils.notDef( this.props.config.presetDrivetimeBuffer2 ) && ACLUtils.isDef( this.state.stPresetDrivetimeBuffer2 ) ) {
        changeArr.push( { name: 'presetDrivetimeBuffer2', value: this.state.stPresetDrivetimeBuffer2 } )
      } else {
        this.updateState( 'stPresetDrivetimeBuffer2', this.props.config.presetDrivetimeBuffer2 )
      }
      if ( this.missingBuffers( InfoBufferType.drivetime ) ) {
        this.updateState( 'stPresetDrivetimeBuffer3', 15 )
      } else if ( ACLUtils.notDef( this.props.config.presetDrivetimeBuffer3 ) && ACLUtils.isDef( this.state.stPresetDrivetimeBuffer3 ) ) {
        changeArr.push( { name: 'presetDrivetimeBuffer3', value: this.state.stPresetDrivetimeBuffer3 } )
      } else {
        this.updateState( 'stPresetDrivetimeBuffer3', this.props.config.presetDrivetimeBuffer3 )
      }
      if ( ACLUtils.notDef( this.props.config.presetDrivetimeBufferUnit ) && ACLUtils.notDef( this.state.stPresetDrivetimeBufferUnit ) ) {
        this.updateState( 'stPresetDrivetimeBufferUnit', 'minutes' )
      } else if ( ACLUtils.notDef( this.props.config.presetDrivetimeBufferUnit ) && ACLUtils.isDef( this.state.stPresetDrivetimeBufferUnit ) ) {
        changeArr.push( { name: 'presetDrivetimeBufferUnit', value: this.state.stPresetDrivetimeBufferUnit } )
      } else {
        this.updateState( 'stPresetDrivetimeBufferUnit', this.props.config.presetDrivetimeBufferUnit )
      }
      if ( this.missingBuffers( InfoBufferType.walktime ) ) {
        this.updateState( 'stPresetWalktimeBuffer1', 5 )
      } else if ( ACLUtils.notDef( this.props.config.presetWalktimeBuffer1 ) && ACLUtils.isDef( this.state.stPresetWalktimeBuffer1 ) ) {
        changeArr.push( { name: 'presetWalktimeBuffer1', value: this.state.stPresetWalktimeBuffer1 } )
      } else {
        this.updateState( 'stPresetWalktimeBuffer1', this.props.config.presetWalktimeBuffer1 )
      }
      if ( this.missingBuffers( InfoBufferType.walktime ) ) {
        this.updateState( 'stPresetWalktimeBuffer2', 10 )
      } else if ( ACLUtils.notDef( this.props.config.presetWalktimeBuffer2 ) && ACLUtils.isDef( this.state.stPresetWalktimeBuffer2 ) ) {
        changeArr.push( { name: 'presetWalktimeBuffer2', value: this.state.stPresetWalktimeBuffer2 } )
      } else {
        this.updateState( 'stPresetWalktimeBuffer2', this.props.config.presetWalktimeBuffer2 )
      }
      if ( this.missingBuffers( InfoBufferType.walktime ) ) {
        this.updateState( 'stPresetWalktimeBuffer3', 15 )
      } else if ( ACLUtils.notDef( this.props.config.presetWalktimeBuffer3 ) && ACLUtils.isDef( this.state.stPresetWalktimeBuffer3 ) ) {
        changeArr.push( { name: 'presetWalktimeBuffer3', value: this.state.stPresetWalktimeBuffer3 } )
      } else {
        this.updateState( 'stPresetWalktimeBuffer3', this.props.config.presetWalktimeBuffer3 )
      }
      if ( ACLUtils.notDef( this.props.config.presetWalktimeBufferUnit ) && ACLUtils.notDef( this.state.stPresetWalktimeBufferUnit ) ) {
        this.updateState( 'stPresetWalktimeBufferUnit', 'minutes' )
      } else if ( ACLUtils.notDef( this.props.config.presetWalktimeBufferUnit ) && ACLUtils.isDef( this.state.stPresetWalktimeBufferUnit ) ) {
        changeArr.push( { name: 'presetWalktimeBufferUnit', value: this.state.stPresetWalktimeBufferUnit } )
      } else {
        this.updateState( 'stPresetWalktimeBufferUnit', this.props.config.presetWalktimeBufferUnit )
      }
    }
    if ( ACLUtils.notDef( this.props.config.searchbarEnabled ) ) {
      changeArr.push( { name: 'searchbarEnabled', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.drawPointEnabled ) ) {
      changeArr.push( { name: 'drawPointEnabled', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.drawPolygonEnabled ) ) {
      changeArr.push( { name: 'drawPolygonEnabled', value: true } )
    }
    // Travel mode will be set from service data, no local defaults
    // if ( ACLUtils.notDef( this.props.config.travelModeData ) ) {
    //   changeArr.push( { name: 'travelModeData', value: DEFAULT_TRAVEL_MODE } )
    // }
    // Add defaults for other travel mode properties
    if ( ACLUtils.notDef( this.props.config.travelDirection ) ) {
      changeArr.push( { name: 'travelDirection', value: TravelDirection.away } )
    }
    if ( ACLUtils.notDef( this.props.config.useTrafficEnabled ) ) {
      changeArr.push( { name: 'useTrafficEnabled', value: true } )
    }
    if ( ACLUtils.notDef( this.props.config.useTrafficChecked ) ) {
      changeArr.push( { name: 'useTrafficChecked', value: false } )
    }
    if ( ACLUtils.notDef( this.props.config.trafficType ) ) {
      changeArr.push( { name: 'trafficType', value: TrafficType.live } )
    }
    if ( ACLUtils.notDef( this.props.config.offsetTime ) ) {
      changeArr.push( { name: 'offsetTime', value: 0 } )
    }
    if ( ACLUtils.notDef( this.props.config.offsetDay ) ) {
      changeArr.push( { name: 'offsetDay', value: 'Monday' } )
    }
    if ( ACLUtils.notDef( this.props.config.offsetHr ) ) {
      changeArr.push( { name: 'offsetHr', value: '12:00 PM' } )
    }
    this.onMultiplePropertyChange( changeArr )
  }

  // Max values based on limitations of GE
  // Drive time (minutes): 300
  // Drive time (miles): 300
  // Drive time (km): 482.8
  // Walk time (minutes): 540
  // Walk time (miles): 27
  // Walk time (km): 43.45

  setMaxBuffers( bufferType, bufferUnit = null ) {
    const { widgetMode, workflowDrivetimeBufferUnit, workflowWalktimeBufferUnit } = this.props.config
    const { stPresetDrivetimeBufferUnit, stPresetWalktimeBufferUnit } = this.state
    let useUnit
    if ( ACLUtils.isDef( bufferUnit ) ) {
      useUnit = bufferUnit
    } else {
      if ( widgetMode === Mode.Preset ) {
        useUnit = bufferType === InfoBufferType.drivetime ? stPresetDrivetimeBufferUnit : stPresetWalktimeBufferUnit
      } else {
        useUnit = bufferType === InfoBufferType.drivetime ? workflowDrivetimeBufferUnit : workflowWalktimeBufferUnit
      }
    }

    if ( ( bufferType === InfoBufferType.drivetime ) && ACLUtils.isDef( useUnit ) ) {
      if ( useUnit === 'minutes' ) {
        this.updateState( 'maxDriveBuffer', MaxBuffers.DriveMinutes )
        this.enforceMax( InfoBufferType.drivetime, MaxBuffers.DriveMinutes )
      } else if ( useUnit === 'miles' ) {
        this.updateState( 'maxDriveBuffer', MaxBuffers.DriveMile )
        this.enforceMax( InfoBufferType.drivetime, MaxBuffers.DriveMile )
      } else if ( useUnit === 'kilometers' ) {
        this.updateState( 'maxDriveBuffer', MaxBuffers.DriveKm )
        this.enforceMax( InfoBufferType.drivetime, MaxBuffers.DriveKm )
      }
    }
    if ( ( bufferType === InfoBufferType.walktime ) && ACLUtils.isDef( useUnit ) ) {
      if ( useUnit === 'minutes' ) {
        this.updateState( 'maxWalkBuffer', MaxBuffers.WalkMinutes )
        this.enforceMax( InfoBufferType.walktime, MaxBuffers.WalkMinutes )
      } else if ( useUnit === 'miles' ) {
        this.updateState( 'maxWalkBuffer', MaxBuffers.WalkMile )
        this.enforceMax( InfoBufferType.walktime, MaxBuffers.WalkMile )
      } else if ( useUnit === 'kilometers' ) {
        this.updateState( 'maxWalkBuffer', MaxBuffers.WalkKm )
        this.enforceMax( InfoBufferType.walktime, MaxBuffers.WalkKm )
      }
    }
  }

  enforceMax( bufferType, max ) {
    const { widgetMode } = this.props.config
    const { workflowDrivetimeBuffer1, workflowDrivetimeBuffer2, workflowDrivetimeBuffer3, workflowWalktimeBuffer1, workflowWalktimeBuffer2, workflowWalktimeBuffer3 } = this.props.config
    const { stPresetDrivetimeBuffer1, stPresetDrivetimeBuffer2, stPresetDrivetimeBuffer3, stPresetWalktimeBuffer1, stPresetWalktimeBuffer2, stPresetWalktimeBuffer3 } = this.state

    if ( widgetMode === Mode.Preset ) {
      if ( bufferType === InfoBufferType.drivetime ) {
        if ( stPresetDrivetimeBuffer1 > max ) this.updateBufferValue( 'stPresetDrivetimeBuffer1', max )
        if ( stPresetDrivetimeBuffer2 > max ) this.updateBufferValue( 'stPresetDrivetimeBuffer2', max )
        if ( stPresetDrivetimeBuffer3 > max ) this.updateBufferValue( 'stPresetDrivetimeBuffer3', max )
      } else if ( bufferType === InfoBufferType.walktime ) {
        if ( stPresetWalktimeBuffer1 > max ) this.updateBufferValue( 'stPresetWalktimeBuffer1', max )
        if ( stPresetWalktimeBuffer2 > max ) this.updateBufferValue( 'stPresetWalktimeBuffer2', max )
        if ( stPresetWalktimeBuffer3 > max ) this.updateBufferValue( 'stPresetWalktimeBuffer3', max )
      }
    } else {
      if ( bufferType === InfoBufferType.drivetime ) {
        if ( workflowDrivetimeBuffer1 > max ) this.updateBufferValue( 'workflowDrivetimeBuffer1', max )
        if ( workflowDrivetimeBuffer2 > max ) this.updateBufferValue( 'workflowDrivetimeBuffer2', max )
        if ( workflowDrivetimeBuffer3 > max ) this.updateBufferValue( 'workflowDrivetimeBuffer3', max )
      } else if ( bufferType === InfoBufferType.walktime ) {
        if ( workflowWalktimeBuffer1 > max ) this.updateBufferValue( 'workflowWalktimeBuffer1', max )
        if ( workflowWalktimeBuffer2 > max ) this.updateBufferValue( 'workflowWalktimeBuffer2', max )
        if ( workflowWalktimeBuffer3 > max ) this.updateBufferValue( 'workflowWalktimeBuffer3', max )
      }
    }
  }

  /** updateBufferValue
   * This updates either the state or prop according to context, and
   * for Preset Mode it also shows the Apply button
   *
   *  name = either state name for Preset Mode, or prop name for Workflow
   *  value = new value
   */
  updateBufferValue( name: string, value: any ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    const { widgetMode } = this.props.config
    if ( widgetMode === Mode.Workflow ) {
      this.onPropertyChange( name, value )
    } else {
      this.updateState( name, value )
      requestAnimationFrame( () => {
        self._showApplyButton()
      } )
    }
  }


  handleBufferChange( name: string, value: any, bufferType: any ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    self.updateBufferValue( name, value )

    requestAnimationFrame( () => {
      // Only check for drivetime buffer unit changes
      if (
        name === 'workflowDrivetimeBufferUnit' ||
        name === 'stPresetDrivetimeBufferUnit'
      ) {
        this.setMaxBuffers( bufferType, value )

        // Determine which state/prop to update
        const { widgetMode } = this.props.config
        const isPreset = widgetMode === Mode.Preset

        // Use the new buffer unit directly for filtering
        const travelModes = this.getFilteredTravelModes( value )
        let defaultModeId

        if ( value === 'minutes' ) {
          defaultModeId =
            travelModes.find( m => m.name.toLowerCase().includes( 'driving time' ) )?.itemId ||
            travelModes[0]?.itemId
        } else if ( value === 'kilometers' || value === 'miles' ) {
          defaultModeId =
            travelModes.find( m => m.name.toLowerCase().includes( 'driving distance' ) )?.itemId ||
            travelModes[0]?.itemId
        }

        if ( defaultModeId ) {
          // Get the full travel mode object instead of just the ID
          const selectedTravelMode = travelModes.find( m => m.itemId === defaultModeId )
          if ( selectedTravelMode ) {
            // Create a clean travel mode object to avoid nested duplication
            const travelModeWithId = {
              ...selectedTravelMode.travelModeData,
              itemId: selectedTravelMode.itemId,
              name: selectedTravelMode.name,
              description: selectedTravelMode.description
            }

            if ( isPreset ) {
              // For preset mode, update both state and config
              self.updateBufferValue( 'stTravelModeData', selectedTravelMode.itemId )
              self.onPropertyChange( 'travelModeData', travelModeWithId )
            } else {
              self.updateBufferValue( 'travelModeData', travelModeWithId )
            }
          }
        }
      } else {
        self.setMaxBuffers( bufferType )
      }
    } )
  }

  // onToggleUseLatestDataSource() {

  // }

  handleIgSettingChange( name: string, value: any ) {
    this.onPropertyChange( name, value )
  }

  _toPropName( s ): string {
    const sEnd = s.trim().substr( 3 )
    const sPre: string = ( s.substr( 2, 1 ) as string ).toLowerCase()
    return ACLUtils.hasText( sEnd ) && ACLUtils.hasText( sPre ) ? sPre + sEnd : null
  }

  syncDtoStatesFromProps() {
    for ( let ii = 0; ii < this._dtoStates.length; ii++ ) {
      const stName = this._dtoStates[ii]
      const pName = this._toPropName( stName )
      const stVal = this.state[stName]
      if ( this.props.config[pName] !== stVal ) {
        this.updateState( stName, this.props.config[pName] )
      }
    }

    // Handle stTravelModeData separately
    const travelModeData = this.props.config.travelModeData
    if ( travelModeData ) {
      // If travelModeData is an object, use its itemId; if it's a string, use it directly
      const travelModeId = typeof travelModeData === 'object' ? travelModeData.itemId : travelModeData
      if ( this.state.stTravelModeData !== travelModeId ) {
        this.updateState( 'stTravelModeData', travelModeId )
      }
    } else if ( this.state.stTravelModeData && !travelModeData ) {
      // If config has no travel mode but state does, clear the state
      this.updateState( 'stTravelModeData', '' )
    }
  }

  applyPresetDto() {
    const changeArr = []
    let changed = false
    for ( let ii = 0; ii < this._dtoStates.length; ii++ ) {
      const stName = this._dtoStates[ii]
      const pName = this._toPropName( stName )
      const stVal = this.state[stName]
      if ( this.props.config[pName] !== stVal ) {
        changeArr.push( { name: pName, value: stVal } )
        changed = true
      }
    }

    // Handle stTravelModeData separately to preserve full object structure
    if ( this.state.stTravelModeData && this.state.travelModes.length > 0 ) {
      // Find the full travel mode object from the itemId stored in state
      const selectedTravelMode = this.state.travelModes.find( mode => mode.itemId === this.state.stTravelModeData )
      if ( selectedTravelMode ) {
        // Create a clean travel mode object to avoid nested duplication
        const travelModeWithId = {
          ...selectedTravelMode.travelModeData,
          itemId: selectedTravelMode.itemId,
          name: selectedTravelMode.name,
          description: selectedTravelMode.description
        }
        if ( this.props.config.travelModeData !== travelModeWithId ) {
          changeArr.push( { name: 'travelModeData', value: travelModeWithId } )
          changed = true
        }
      }
    }

    this.onMultiplePropertyChange( changeArr )

    if ( changed ) {
      this._setPresetBuffersChanged()
    }
  }

  applyPresetBuffers() {
    const changeArr = []
    const {
      presetBuffer, presetRingsBuffer1, presetRingsBuffer2, presetRingsBuffer3, presetRingsBufferUnit, presetDrivetimeBuffer1,
      presetDrivetimeBuffer2, presetDrivetimeBuffer3, presetDrivetimeBufferUnit, presetWalktimeBuffer1, presetWalktimeBuffer2,
      presetWalktimeBuffer3, presetWalktimeBufferUnit
    } = this.props.config
    const {
      stPresetBuffer, stPresetRingsBuffer1, stPresetRingsBuffer2, stPresetRingsBuffer3, stPresetRingsBufferUnit, stPresetDrivetimeBuffer1,
      stPresetDrivetimeBuffer2, stPresetDrivetimeBuffer3, stPresetDrivetimeBufferUnit, stPresetWalktimeBuffer1, stPresetWalktimeBuffer2,
      stPresetWalktimeBuffer3, stPresetWalktimeBufferUnit
    } = this.state

    if ( presetBuffer !== stPresetBuffer ) {
      changeArr.push( { name: 'presetBuffer', value: stPresetBuffer } )
    }
    if ( presetRingsBuffer1 !== stPresetRingsBuffer1 ) {
      changeArr.push( { name: 'presetRingsBuffer1', value: isNaN( parseFloat( stPresetRingsBuffer1 ) ) ? null : parseFloat( stPresetRingsBuffer1 ) } )
    }
    if ( presetRingsBuffer2 !== stPresetRingsBuffer2 ) {
      changeArr.push( { name: 'presetRingsBuffer2', value: isNaN( parseFloat( stPresetRingsBuffer2 ) ) ? null : parseFloat( stPresetRingsBuffer2 ) } )
    }
    if ( presetRingsBuffer3 !== stPresetRingsBuffer3 ) {
      changeArr.push( { name: 'presetRingsBuffer3', value: isNaN( parseFloat( stPresetRingsBuffer3 ) ) ? null : parseFloat( stPresetRingsBuffer3 ) } )
    }
    if ( presetRingsBufferUnit !== stPresetRingsBufferUnit ) {
      changeArr.push( { name: 'presetRingsBufferUnit', value: stPresetRingsBufferUnit } )
    }
    if ( presetDrivetimeBuffer1 !== stPresetDrivetimeBuffer1 ) {
      changeArr.push( { name: 'presetDrivetimeBuffer1', value: isNaN( parseFloat( stPresetDrivetimeBuffer1 ) ) ? null : parseFloat( stPresetDrivetimeBuffer1 ) } )
    }
    if ( presetDrivetimeBuffer2 !== stPresetDrivetimeBuffer2 ) {
      changeArr.push( { name: 'presetDrivetimeBuffer2', value: isNaN( parseFloat( stPresetDrivetimeBuffer2 ) ) ? null : parseFloat( stPresetDrivetimeBuffer2 ) } )
    }
    if ( presetDrivetimeBuffer3 !== stPresetDrivetimeBuffer3 ) {
      changeArr.push( { name: 'presetDrivetimeBuffer3', value: isNaN( parseFloat( stPresetDrivetimeBuffer3 ) ) ? null : parseFloat( stPresetDrivetimeBuffer3 ) } )
    }
    if ( presetDrivetimeBufferUnit !== stPresetDrivetimeBufferUnit ) {
      changeArr.push( { name: 'presetDrivetimeBufferUnit', value: stPresetDrivetimeBufferUnit } )
    }
    if ( presetWalktimeBuffer1 !== stPresetWalktimeBuffer1 ) {
      changeArr.push( { name: 'presetWalktimeBuffer1', value: isNaN( parseFloat( stPresetWalktimeBuffer1 ) ) ? null : parseFloat( stPresetWalktimeBuffer1 ) } )
    }
    if ( presetWalktimeBuffer2 !== stPresetWalktimeBuffer2 ) {
      changeArr.push( { name: 'presetWalktimeBuffer2', value: isNaN( parseFloat( stPresetWalktimeBuffer2 ) ) ? null : parseFloat( stPresetWalktimeBuffer2 ) } )
    }
    if ( presetWalktimeBuffer3 !== stPresetWalktimeBuffer3 ) {
      changeArr.push( { name: 'presetWalktimeBuffer3', value: isNaN( parseFloat( stPresetWalktimeBuffer3 ) ) ? null : parseFloat( stPresetWalktimeBuffer3 ) } )
    }
    if ( presetWalktimeBufferUnit !== stPresetWalktimeBufferUnit ) {
      changeArr.push( { name: 'presetWalktimeBufferUnit', value: stPresetWalktimeBufferUnit } )
    }
    if ( changeArr.length > 0 ) {
      this.onMultiplePropertyChange( changeArr )
      this._setPresetBuffersChanged()
    }
  }

  reportSelectedHandler( ev: any ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    const { widgetMode } = this.props.config
    const changeArr = []
    this.closeDefaultReportPanel()
    if ( widgetMode === Mode.Preset ) {
      changeArr.push( { name: 'presetSelectedReport', value: ev.detail.id } )
      changeArr.push( { name: 'presetSelectedReportName', value: ev.detail.name } )
    } else {
      changeArr.push( { name: 'workflowSelectedReport', value: ev.detail.id } )
      changeArr.push( { name: 'workflowSelectedReportName', value: ev.detail.name } )
    }

    if ( ev.detail.reportID ) {
      // changeArr.push( { name: 'selectedReportIDName', value: ev.detail.reportID } )
      changeArr.push( { name: 'standardInfographicID', value: ev.detail.reportID } )

    }
    this.onMultiplePropertyChange( changeArr )

    requestAnimationFrame( () => {
      self.applyPresetDto()
      self.applyPresetBuffers()

      self._hideApplyButton()
    } )
  }

  accordionInitHandler( data: any ) {
    this.onPropertyChange( 'reportList', data.detail )
  }

  baSearchResultsHandler( ev: any ) {
    this.onSiteObjectChanged( { origin: 'basearch', data: ev } )
  }

  _findReportInList( reportId: string, list: any ) {
    let result
    if ( reportId && list && list.length > 0 ) {
      for ( let ii = 0; ii < list.length; ii++ ) {
        const rep = list[ii]
        if ( rep?.id === reportId ) {
          result = rep
          break
        }
      }
    }
    return result
  }

  /* Find a report in any of our standard lists */
  _getReportItem( reportId: string, list: any ): boolean {
    let item, rep
    if ( list ) {
      rep = this._findReportInList( reportId, list.user )
      if ( !rep ) {
        rep = this._findReportInList( reportId, list.shared )
      }
      if ( !rep ) {
        rep = this._findReportInList( reportId, list.public )
      }
      if ( !rep ) {
        rep = this._findReportInList( reportId, list.gallery )
      }
      if ( !rep ) {
        rep = this._findReportInList( reportId, list.tabular )
      }
      if ( rep ) {
        item = rep
      }
    }
    return item
  }

  _listHasDefaultReport( list: any ): boolean {
    let found: boolean = false
    const report = this.getDefaultReport()
    if ( report && report.id ) {
      const rep: any = this._getReportItem( report.id, list )
      if ( rep && rep.id && rep.isChecked ) {
        found = true
      }
    }
    return found
  }

  reportCheckedHandler( ev: any ) {
    this.closeDefaultReportPanel()

    const reportList = this.props.config.reportList
    const incomingReports = ev.detail.reports
    let newPublicList = []; let newUserList = []; let newSharedList = []; let newGalleryList = []; let newTabularList = []
    //const report = ev.detail.detail.report

    if ( reportList.public && reportList.public.length > 0 ) {
      newPublicList = reportList.public.map( item => {
        const matchingReport = incomingReports.find( r => r.id === item.id )
        if ( matchingReport ) {
          return { ...item, isChecked: matchingReport.isChecked }
        }
        return item
      } )
    }

    if ( reportList.user && reportList.user.length > 0 ) {
      newUserList = reportList.user.map( item => {
        const matchingReport = incomingReports.find( r => r.id === item.id )
        if ( matchingReport ) {
          return { ...item, isChecked: matchingReport.isChecked }
        }
        return item
      } )
    }

    if ( reportList.shared && reportList.shared.length > 0 ) {
      newSharedList = reportList.shared.map( item => {
        const matchingReport = incomingReports.find( r => r.id === item.id )
        if ( matchingReport ) {
          return { ...item, isChecked: matchingReport.isChecked }
        }
        return item
      } )
    }

    if ( reportList.gallery && reportList.gallery.length > 0 ) {
      newGalleryList = reportList.gallery.map( item => {
        const matchingReport = incomingReports.find( r => r.id === item.id )
        if ( matchingReport ) {
          return { ...item, isChecked: matchingReport.isChecked }
        }
        return item
      } )
    }
    if ( reportList.tabular && reportList.tabular.length > 0 ) {
      newTabularList = reportList.tabular.map( item => {
        const matchingReport = incomingReports.find( r => r.id === item.id )
        if ( matchingReport ) {
          return { ...item, isChecked: matchingReport.isChecked }
        }
        return item
      } )
    }
    const list = {
      public: newPublicList,
      shared: newSharedList,
      user: newUserList,
      gallery: newGalleryList,
      tabular: newTabularList
    }
    this.onPropertyChange( 'reportList', list )

    // reset the default if it is no longer checked/available
    if ( !this._listHasDefaultReport( list ) ) {
      this.resetDefaultReport()
    }
  }

  // onSiteObjectChanged()
  //
  // When we change the location or boundary being used for reports
  // the notification goes through here.  One source is the 'searchResults'
  // event listener [just above].  The other source is a direct call by
  // the map-actions handler when the user clicks on a linked map, or when
  // the user selects a search result from the embedded map-search control.
  //
  // In either case, we take the search result and set the state variables,
  // which then triggers another render in the widget.  At the same time,
  // we notify the MapActions that we need to update the buffers or geometry
  // showing on the linked map.
  //
  onSiteObjectChanged( searchResult ) {
    if ( !searchResult ) return

    if ( searchResult.origin === 'basearch' ) {
      // data is coming from arcgis-ba-search result
      const e = searchResult.data
      let result: any = {}
      if ( e.detail.type === 'location' ) {
        result = {
          type: 'location',
          name: e.detail.name,
          address: e.detail.address,
          lat: e.detail.location.lat,
          lon: e.detail.location.lon
        }
      } else if ( e.detail.type === 'geography' ) {
        //setup geometry compatible with infographic component
        const geom: any = {
          type: 'polygon',
          rings: e.detail.geometry,
          spatial: { wkid: 102100 },
          latitude: 34.055561, // placeholder
          longitude: -117.182602
        }
        result = {
          type: 'geography',
          name: e.detail.title,
          areaId: e.detail.areaId,
          geography: {
            sourceCountry: e.detail.attributes.CountryAbbr,
            levelId: e.detail.attributes.DataLayerID,
            hierarchy: e.detail.attributes.Hierarchy,
            id: e.detail.areaId,
            attributes: e.detail.attributes,
            symbol: defaultFillSymbol
          },
          geometry: geom
        }
      }
      // updating these props will tell the widget the search object has changed
      // Also, it will tell the widget that a linked map may need updating
      if ( e.detail.mode && e.detail.mode === Mode.Preset ) {
        this.onPropertyChange( 'presetSearchSelectedObject', JSON.stringify( result ) )
        this.updateState( 'presetShowSearchInput', false )
      } else {
        this.onPropertyChange( 'workflowSearchSelectedObject', JSON.stringify( result ) )
        this.updateState( 'workflowShowSearchInput', false )
      }
    }
  }

  // TM
  /**
   * time24ToLocale
   * @param langCode Language code like 'en-US'
   * @param time24 Time to localize in the format 'hh:mm'
   * @returns localized time string
   */
  time24ToLocale( langCode: string, time24: string ) {
    if ( langCode && time24 ) {
      const d = new Date( Date.parse( '01 Jan 2024 ' + time24 + ' UTC' ) )
      const tm = d.toLocaleTimeString( langCode, { timeZone: 'UTC', hour: 'numeric', minute: 'numeric' } )
      return tm
    } else {
      throw new Error( 'time24ToLocale: invalid args' )
    }
  }

  // TM
  // If 'travelModeData' is null or undefined, we set all the travel mode props to their defaults
  // Also handles backward compatibility for old 'drivingMode' property
  //
  checkTravelModeDefaults() {
    const { travelModeData, drivingMode, widgetMode } = this.props.config

    // Don't proceed if travel modes haven't loaded yet
    if ( this.state.isLoadingTravelModes || this.state.travelModes.length === 0 ) {
      return
    }

    // Check for backward compatibility: if we have old drivingMode but no travelModeData
    if ( !travelModeData && drivingMode && typeof drivingMode === 'string' ) {
      // Try to find travel mode by matching name (case-insensitive) or itemId
      const matchedTravelMode = this.state.travelModes.find( mode =>
        ( mode.name && mode.name.toLowerCase() === drivingMode.toLowerCase() ) ||
        mode.itemId === drivingMode
      )

      if ( matchedTravelMode ) {
        //console.log(`BA Infographic: Converting old drivingMode "${drivingMode}" to travelModeData:`, matchedTravelMode.name)
        // Convert old drivingMode to new travelModeData structure
        const travelModeWithId = {
          ...matchedTravelMode.travelModeData,
          itemId: matchedTravelMode.itemId,
          name: matchedTravelMode.name,
          description: matchedTravelMode.description
        }
        this.onMultiplePropertyChange( [
          { name: 'travelModeData', value: travelModeWithId },
          { name: 'drivingMode', value: undefined } // Remove old property
        ] )

        // Also update state for preset mode
        if ( widgetMode === Mode.Preset ) {
          this.updateState( 'stTravelModeData', matchedTravelMode.itemId )
        }
        return // Exit early since we've set the travel mode
      } else {
        //console.warn(`BA Infographic: Could not find travel mode matching old drivingMode: "${drivingMode}". Available travel modes:`,
        this.state.travelModes.map( mode => mode.name )
      }
    }

    // Only set defaults if we don't have travelModeData and travel modes are loaded
    if ( !travelModeData && this.state.travelModes.length > 0 ) {
      // Set defaults - use first available travel mode from service
      const defs = this.travelModeDefaults
      const offTime = defs.offsetTime
      const langCode = getAppStore()?.getState()?.appContext?.locale || 'en-US'
      const offDay = this.localeString( 'mon' )
      const offHr = this.time24ToLocale( langCode, '12:00' )

      // Use first available travel mode from service
      const defaultDrivingMode = this.state.travelModes[0]

      // Create a clean travel mode object to avoid nested duplication
      const travelModeWithId = {
        ...defaultDrivingMode.travelModeData,
        itemId: defaultDrivingMode.itemId,
        name: defaultDrivingMode.name,
        description: defaultDrivingMode.description
      }

      const changeArr = [
        { name: 'travelModeData', value: travelModeWithId },
        { name: 'travelDirection', value: defs.direction },
        { name: 'useTrafficEnabled', value: defs.useTrafficEnabled },
        { name: 'useTrafficChecked', value: defs.useTrafficChecked },
        { name: 'trafficType', value: defs.trafficType },
        { name: 'offsetTime', value: offTime },
        { name: 'offsetDay', value: offDay },
        { name: 'offsetHr', value: offHr }
      ]
      this.onMultiplePropertyChange( changeArr )

      // Also update state for preset mode
      if ( widgetMode === Mode.Preset ) {
        this.updateState( 'stTravelModeData', defaultDrivingMode.itemId )
      }
    }
  }

  // called just before Render
  static getDerivedStateFromProps( props, state ) {
    // Get the Setting instance for the active settings
    const inst = Setting.SettingRegistry[props.id]
    const token = SessionManager?.getInstance()?.getMainSession()?.token

    if ( inst ) {
      const { viewMode } = inst.props.config

      // sync viewMode
      if ( inst.state.stViewMode !== viewMode ) {
        const vm = ( typeof viewMode !== 'undefined' && viewMode === ViewMode.Auto ) ? undefined : viewMode
        inst.updateState( 'stViewMode', vm )
      }

      if ( inst.state.selectedHierarchyObj === null || inst.state.countries === null ) {
        const langCode = getAppStore().getState().appContext.locale || 'en'
        const geUrl = inst.state.geoenrichmentServiceUrl ? inst.state.geoenrichmentServiceUrl : 'https://geoenrich.arcgis.com/arcgis/rest/services/World/GeoEnrichmentServer'

        if ( langCode && geUrl && token && ( !inst.state.countries || inst.state.countries.length <= 0 ) ) {
          getCountries( langCode, geUrl, token ).then( ( countries ) => {
            if ( countries ) {
              // Get the hierarchies for the selected country
              const hierarchies = getValidHierarchies( inst.props.config.sourceCountry, countries )
              inst.updateState( 'availableHierarchies', hierarchies )

              if ( !inst.props.config.selectedHierarchy ) {
                // update new widget selectedHierarchy to the default
                const def = hierarchies.find( o => o.default )
                if ( def ) {
                  inst.updateState( 'selectedHierarchyObj', def )
                  inst.onPropertyChange( 'selectedHierarchy', def.ID )
                  inst._syncGeographyLevels( def )
                }
              } else {
                const h = hierarchies.find( o => o.ID === inst.props.config.selectedHierarchy )
                inst.updateState( 'selectedHierarchyObj', h )
                // Always sync geography levels on first load to ensure defaults are
                // refreshed from the selected hierarchy (config.json may be stale).
                // _syncGeographyLevels preserves any previously selected items.
                inst._syncGeographyLevels( h )
              }
              // Now update the state with the modified data.countries
              inst.updateState( 'countries', countries )
              // TM
              if ( inst.state.travelModes.length > 0 ) {
                inst.checkTravelModeDefaults()
              }
            }
          } )
        }
      } else {
        const countries = inst.state.countries
        // Get the hierarchies for the selected country
        const hierarchies = getValidHierarchies( inst.props.config.sourceCountry, countries )
        inst.updateState( 'availableHierarchies', hierarchies )

        if ( !inst.props.config.selectedHierarchy ) {
          // update new widget selectedHierarchy to the default
          const def = hierarchies.find( o => o.default )
          if ( def ) {
            inst.updateState( 'selectedHierarchyObj', def )
            inst.onPropertyChange( 'selectedHierarchy', def.ID )
            if ( !inst.state.activeGeographyLevels ) {
              inst._syncGeographyLevels( def )
            }
          }
        } else {
          const h = hierarchies.find( o => o.ID === inst.props.config.selectedHierarchy )
          inst.updateState( 'selectedHierarchyObj', h )
          if ( !inst.state.activeGeographyLevels ) {
            inst._syncGeographyLevels( h )
          }
        }
        // TM
        if ( inst.state.travelModes.length > 0 ) {
          inst.checkTravelModeDefaults()
        }
      }
    }
    // if (props.name !== state.name) {
    //   //Change in props
    //   return {
    //     name: props.name
    //   }
    // }
    return null // No change to state
  }

  async componentDidMount() {
    this.preloadData()
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this

    helpUtils.getWidgetHelpLink( 'ba-infographic' ).then( url => {
      self.setState( { portalHelpUrl: url } )
    } )

    this.syncDtoStatesFromProps()

    // Load travel modes first, then check defaults
    await this.loadTravelModes()

    // After travel modes are loaded, check for defaults and backward compatibility
    this.checkTravelModeDefaults()
  }

  /** _syncGeographyLevels
   *
   * hierarchy = currently active hierarchy
   * force = (Optional) arg that sets all levels according to the 'checked' value
   *          ex: force= {checked: true} // sets all the levels to checked
   */
  _syncGeographyLevels = ( hierarchy, force?) => {
    if ( hierarchy && hierarchy.geographyLevels && hierarchy.geographyLevels.length > 0 ) {
      // update selected states for updated geography levels without losing previous selected states
      const hLevels = hierarchy.geographyLevels
      const newlySelected = []
      const existPrev = this.state.availableGeographyLevels
      let selectedPrev = []
      if ( this.state.activeGeographyLevels ) {
        selectedPrev = this.state.activeGeographyLevels
      } else if ( this.props.config.selectedGeographyLevels ) {
        selectedPrev = this.props.config.selectedGeographyLevels
      }

      // update selected levels list
      /**
       * Here we should make sure that we only have levels in the 'hierarchy',
       *  and then check any from the 'active' list that are also found in the
       *  'hierarchy' levels.
       *
       *  All the other levels should be unchecked.
       */
      if ( hLevels && hLevels.length > 0 ) {
        for ( let ii = 0; ii < hLevels.length; ii++ ) {
          const l = hLevels[ii]

          if ( !force ) {
            const wasPrev = existPrev.includes( l )
            const selPrev = selectedPrev.includes( l )

            // if the same level was purposely not selected before this, then deselect it
            if ( !wasPrev || selPrev ) {
              newlySelected.push( l )
            }
          } else if ( force.checked ) {
            newlySelected.push( l )
          }
        }
      }
      this.onPropertyChange( 'availableGeographyLevels', hLevels )
      this.onPropertyChange( 'selectedGeographyLevels', newlySelected )
      this.updateState( 'availableGeographyLevels', hLevels )
      this.updateState( 'activeGeographyLevels', newlySelected )
    }
  }

  onPropertyChange = ( name, value ) => {
    const { config, id } = this.props
    if ( value === config[name] ) {
      return
    }
    const newConfig = config.set( name, value )
    const alterProps = {
      id,
      config: newConfig
    }
    this.props.onSettingChange( alterProps )
  }

  onMultiplePropertyChange = ( changeArr ) => {
    const { config, id } = this.props
    let newConfig = config
    changeArr.forEach( item => {
      if ( item.value === config[item.name] ) return
      newConfig = newConfig.set( item.name, item.value )
    } )
    const alterProps = {
      id,
      config: newConfig
    }
    this.props.onSettingChange( alterProps )
  }

  // Handle widget mode changes with travel mode preservation
  onWidgetModeChange = ( newMode: Mode ) => {
    // Store the current travel mode before changing modes
    let currentTravelMode = null

    if ( this.props.config.widgetMode === Mode.Preset && newMode === Mode.Workflow ) {
      // Switching from Preset to Workflow: get travel mode from state
      if ( this.state.stTravelModeData && this.state.travelModes.length > 0 ) {
        currentTravelMode = this.state.travelModes.find( mode => mode.itemId === this.state.stTravelModeData )
      }
    } else if ( this.props.config.widgetMode === Mode.Workflow && newMode === Mode.Preset ) {
      // Switching from Workflow to Preset: use config travel mode
      currentTravelMode = this.props.config.travelModeData
    }

    // Change the widget mode
    this.onPropertyChange( 'widgetMode', newMode )

    // Preserve the travel mode if we found one
    if ( currentTravelMode ) {
      requestAnimationFrame( () => {
        // Ensure we store only the clean travel mode object
        const cleanTravelMode = currentTravelMode?.travelModeData
          ? { ...currentTravelMode.travelModeData, itemId: currentTravelMode.itemId, name: currentTravelMode.name, description: currentTravelMode.description }
          : currentTravelMode

        if ( newMode === Mode.Preset ) {
          // Set both config and state for preset mode
          this.onPropertyChange( 'travelModeData', cleanTravelMode )
          const travelModeId = typeof cleanTravelMode === 'object' ? cleanTravelMode.itemId : cleanTravelMode
          this.updateState( 'stTravelModeData', travelModeId )
        } else {
          // Set config for workflow mode
          this.onPropertyChange( 'travelModeData', cleanTravelMode )
        }
      } )
    }
  }

  setProxyReferrer() {
    // Set geoenrichment proxy referrer
    let baProxyReferrer = ''
    switch ( window.jimuConfig.hostEnv ) {
      case 'prod':
        baProxyReferrer = 'https://bao.arcgis.com/'
        break
      case 'qa':
        baProxyReferrer = 'https://baoqa.arcgis.com/'
        break
      case 'dev':
        baProxyReferrer = 'https://baodev.arcgis.com/'
        break
    }

    proxyUtils.registerProxyReferrer( baProxyReferrer )
  }

  onGeoenrichmentUtilityChange = ( utilities: ImmutableArray<UseUtility> ) => {
    this.setProxyReferrer()

    if ( utilities?.[0]?.utilityId !== this.props.config.geoenrichmentConfig?.useUtility?.utilityId ) {
      const newConfig = { useUtility: utilities?.[0] }
      this.onPropertyChange( 'geoenrichmentConfig', newConfig )

      const { id } = this.props

      this.props.onSettingChange( {
        id,
        config: this.props.config.setIn( ['geoenrichmentConfig', 'useUtility'], utilities?.[0] ),
        useUtilities: this.getUsedUtilities( utilities?.[0] )
      } )
    }
  }

  getUsedUtilities( geoenrichmentUtility: UseUtility ): UseUtility[] {
    return [geoenrichmentUtility]
  }

  // updateState changes the state to the new value, unless the
  // old and new values are the same, then it does nothing
  updateState( name: string, value: any, callback?: any ) {
    let isSame: boolean = false

    const before = this.state[name]
    const after = value
    if ( typeof this.state[name] === 'object' ) {
      isSame = lodash.isDeepEqual( before, after )
    } else {
      isSame = before === after
    }
    if ( !isSame ) {
      this.setState( ( prevState ) => ( {
        ...prevState,
        [name]: value
      } ), callback )
    }
  }

  getKeys( obj: any ) {
    let k; const keys = []
    for ( k in obj ) {
      // eslint-disable-next-line no-prototype-builtins
      if ( obj.hasOwnProperty( k ) ) {
        keys.push( k )
      }
    }
    return keys
  }

  shallowObjectComparisonAreEqual( obj1, obj2 ) {
    if ( !obj1 && !obj2 ) return true
    if ( ( !obj1 && obj2 ) || ( !obj2 && obj1 ) ) return false
    const keys1 = this.getKeys( obj1 )
    const keys2 = this.getKeys( obj2 )

    return keys1.length === keys2.length &&
      keys1.every( ( key ) => {
        const hasProp = Object.prototype.hasOwnProperty.call( obj2, key )
        if ( !hasProp ) return false
        // object props compare true if they are both objects (shallow)
        if ( typeof obj1[key] === 'object' ) {
          return ( obj2[key] && typeof obj2[key] === 'object' )
        } else {
          return ( hasProp && obj1[key] === obj2[key] )
        }
      } )
  }

  isObject( object ) {
    return object != null && typeof object === 'object'
  }

  _onDataSourceChanged = ( country?, selectedHierarchyId?) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    const { countries, selectedCountry } = self.state
    const { widgetMode } = self.props.config
    let countryObj = null
    if ( country ) {
      countryObj = countries.find( o => o.id === country )
    } else if ( selectedCountry ) {
      countryObj = countries.find( o => o.id === selectedCountry )
    }
    if ( !countryObj ) {
      // console.log('%c BA Widget Setting: missing country', 'color:red;font-size:10pt')
      return
    }
    // update default hierarchy
    const filteredHierarchies = []
    for ( let ii = 0; ii < countryObj.hierarchies.length; ii++ ) {
      const h = countryObj.hierarchies[ii]
      if ( h.ID !== 'landscape' ) {
        filteredHierarchies.push( h )
      }
    }
    let hier
    if ( selectedHierarchyId ) {
      // validate the hierarchy arg
      hier = filteredHierarchies.find( h => h.ID === selectedHierarchyId )
    }
    if ( !hier ) {
      const defHier = filteredHierarchies.find( h => h.default )
      hier = defHier || filteredHierarchies[0]
      selectedHierarchyId = hier.ID
    }
    // Update our 'countries' data defaults to match our new selected hierarchy
    for ( let ii = 0; ii < filteredHierarchies.length; ii++ ) {
      const h = filteredHierarchies[ii]
      if ( h.ID === selectedHierarchyId ) {
        filteredHierarchies[ii].default = true
      } else {
        filteredHierarchies[ii].default = false
      }
    }
    // updating default hierarchy Geography Levels
    let availableLevels
    if ( filteredHierarchies ) {
      for ( let ii = 0; ii < filteredHierarchies.length; ii++ ) {
        const h = filteredHierarchies[ii]
        if ( h && h.ID === selectedHierarchyId ) {
          availableLevels = h.levelsInfo?.geographyLevels
          break
        }
      }
    }

    // update related states
    self.updateState( 'presetSearchSidePopper', false )
    self.updateState( 'presetBufferSidePopper', false )
    self.updateState( 'presetInfographicSidePopper', false )
    self.updateState( 'workflowSidePopper', false )
    self.updateState( 'workflowBufferSidePopper', false )
    self.updateState( 'workflowInfographicSidePopper', false )
    self.updateState( 'availableHierarchies', filteredHierarchies )
    self.updateState( 'selectedHierarchyObj', hier )

    if ( widgetMode === Mode.Preset ) {
      self.updateState( 'presetShowSearchInput', true )
    } else {
      self.updateState( 'workflowShowSearchInput', true )
    }
    self.onPropertyChange( 'presetBuffersAccepted', false )

    // Allow this country selection UI handler to complete before
    // setting props & state
    requestAnimationFrame( () => {
      // update the shared props between Setting and Widget
      const changeArr = [
        { name: 'selectedGeographyLevels', value: availableLevels },
        { name: 'availableGeographyLevels', value: availableLevels },
        {
          name: 'selectedHierarchy',
          value: hier.ID
        },
        { name: 'langCode', value: getAppStore().getState().appContext.locale || 'en' },
        { name: 'sourceCountry', value: country },
        { name: 'reportList', value: {} },
        { name: 'defaultReport', value: undefined },
        { name: 'presetSelectedReport', value: null },
        { name: 'presetSelectedReportName', value: null },
        { name: 'presetSearchSelectedObject', value: null },
        { name: 'workflowSearchSelectedObject', value: null },
        { name: 'standardInfographicID', value: null },
        { name: '' }
      ]

      self.onMultiplePropertyChange( changeArr )
      self.updateState( 'availableGeographyLevels', availableLevels )
      self.updateState( 'activeGeographyLevels', availableLevels )
    } )
  }

  updateSelectedCountry = ( country ) => {
    this.onPropertyChange( 'autoSelectLatestDataSource', false )
    this._onDataSourceChanged( country )
  }

  onDataSourceChange = ( e ) => {
    const selectedHierarchyId = e.target?.value
    this._onDataSourceChanged( this.state.selectedCountry, selectedHierarchyId )
  }

  isGeographyLevelSelected = ( level ) => {
    let isFound = false
    if ( level && level.length > 0 ) {
      const checkedItems = this.state.activeGeographyLevels || this.props.config.selectedGeographyLevels
      const l = checkedItems.find( o => o === level )
      if ( l ) { isFound = true }

    }
    return isFound
  }

  updateGeographyLevelCheck = ( level, checked ) => {

    const checkedItems = this.state.activeGeographyLevels
    let selectedLevels: any[]
    let isGeographiesSelected = false
    if ( !checked ) {
      const removeLevelIdx = checkedItems.indexOf( level.level )
      selectedLevels = [
        ...checkedItems.slice( 0, removeLevelIdx ),
        ...checkedItems.slice( removeLevelIdx + 1 )
      ]
      // update the parent checkbox
      isGeographiesSelected = selectedLevels.length > 0
    } else {
      if ( !this.isGeographyLevelSelected( level ) ) {
        selectedLevels = [
          ...checkedItems,
          level.level
        ]
      }
      // update the parent checkbox
      isGeographiesSelected = true
    }
    this.onPropertyChange( 'selectedGeographyLevels', selectedLevels )
    this.updateState( 'activeGeographyLevels', selectedLevels )

    // changing checkedItems may effect the Geographies checkbox state
    if ( this.state.geographiesChecked !== isGeographiesSelected ) {
      this.onSearchTypeChanged( 'geographies', isGeographiesSelected )
    }
  }

  componentDidUpdate( prevProps, prevState ) {
    const { id, sourceCountry, selectedGeographyLevels, baSearchType, viewMode, widgetMode } = this.props.config
    const { selectedCountry, geographiesChecked, pointsOfInterestChecked } = this.state

    if ( this.state.stViewMode !== viewMode ) {
      const vm = ( typeof viewMode !== 'undefined' && viewMode === ViewMode.Auto ) ? undefined : viewMode
      this.updateState( 'stViewMode', vm )
    }

    // Handle widget mode changes - sync travel mode data between config and state
    if ( prevProps.config.widgetMode !== widgetMode ) {
      if ( widgetMode === Mode.Preset ) {
        // Switching TO preset mode: sync config travelModeData to state stTravelModeData
        const travelModeData = this.props.config.travelModeData
        if ( travelModeData ) {
          const travelModeId = typeof travelModeData === 'object' ? travelModeData.itemId : travelModeData
          this.updateState( 'stTravelModeData', travelModeId )
        }
      } else if ( widgetMode === Mode.Workflow ) {
        // Switching TO workflow mode: apply preset state to config if we have it
        if ( this.state.stTravelModeData && this.state.travelModes.length > 0 ) {
          const selectedTravelMode = this.state.travelModes.find( mode => mode.itemId === this.state.stTravelModeData )
          if ( selectedTravelMode && this.props.config.travelModeData !== selectedTravelMode ) {
            this.onPropertyChange( 'travelModeData', selectedTravelMode )
          }
        }
      }
    }

    if ( this.props.config.travelModeData !== prevProps.config.travelModeData ) {
      const travelModeData = this.props.config.travelModeData
      // Update state based on whether we have an object or just an itemId
      if ( travelModeData && typeof travelModeData === 'object' ) {
        this.updateState( 'stTravelModeData', travelModeData.itemId )
      } else {
        this.updateState( 'stTravelModeData', travelModeData )
      }
    }

    if ( prevState.isLoadingTravelModes && !this.state.isLoadingTravelModes && this.state.travelModes.length > 0 ) {
      this.checkTravelModeDefaults()
    }

    // sync Setting UI's country local state with the value
    // shared between Settings & Widget
    if ( selectedCountry !== sourceCountry ) {
      this.updateState( 'selectedCountry', sourceCountry )
    }
    // if (this.state.availableGeographyLevels !== availableGeographyLevels) {
    //   this.updateState('availableGeographyLevels', availableGeographyLevels)
    // }
    if ( !this.state.activeGeographyLevels && selectedGeographyLevels ) {
      this.updateState( 'activeGeographyLevels', selectedGeographyLevels )
    }

    // baSearchType and related
    //  -undefined searchType not allowed
    if ( typeof baSearchType === 'undefined' ) {
      this.onPropertyChange( 'baSearchType', BaSearchType.all )
    } else if ( this.state.baSearchType !== baSearchType ) {
      this.updateState( 'baSearchType', baSearchType )
    }
    const isAll = baSearchType === BaSearchType.all
    const geogEnabled = isAll || baSearchType === BaSearchType.boundaries
    const ptsEnabled = isAll || baSearchType === BaSearchType.locations
    if ( geographiesChecked !== geogEnabled ) {
      this.updateState( 'geographiesChecked', geogEnabled )
    }
    if ( pointsOfInterestChecked !== ptsEnabled ) {
      this.updateState( 'pointsOfInterestChecked', ptsEnabled )
    }
    // ---
    if ( this.props.config !== prevProps.config ) {
      this.preloadData()
    }
    const elem: any = document.getElementById( id + '_' + 'reports' )
    if ( elem ) {
      elem.setMultipleChoice( false )
    }
    const wfElem: any = document.getElementById( id + '_' + 'wf-reports' )
    if ( wfElem ) {
      elem.setMultipleChoice( true )
    }
  }

  onDefaultInfographicChanged( info ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    if ( info ) {
      this.onPropertyChange( 'defaultReport', info )

      requestAnimationFrame( () => {
        self.initializeReportComponents( true )
      } )
    }
  }

  initializeReportComponents( mergeWithLatest?: boolean ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    const token = this.getToken()

    /** IMPORTANT: Makes sure the UI is updated */
    requestAnimationFrame( () => {
      const { user } = self.props
      const { sourceCountry, selectedHierarchy, autoSelectLatestDataSource, reportList } = self.props.config
      const { workflowEnableInfographicChoice } = self.props.config
      const langCode = getAppStore().getState().appContext.locale || 'en'

      const presetReports: any = document.getElementById( self.props.id + '_' + 'reports' )
      if ( presetReports ) {
        const activeH = getActiveHierarchyId( self.props.config.selectedHierarchy, self.props.config.autoSelectLatestDataSource )
        presetReports.initialize( user.username, token, sourceCountry, activeH, langCode, false, {} )

        presetReports.style.width = '100%'
        presetReports.style.padding = '3px !important'
      }
      const wfReports: any = document.getElementById( self.props.id + '_' + 'wf-reports' )
      if ( wfReports ) {
        const def = self.getDefaultReport()
        const defReport = ( def ) ? JSON.stringify( def ) : undefined
        const activeH = getActiveHierarchyId( selectedHierarchy, autoSelectLatestDataSource )

        if ( workflowEnableInfographicChoice ) {
          const rList = ( reportList && ( reportList.public || reportList.user || reportList.shared || reportList.gallery || reportList.tabular ) ) ? reportList : {}
          wfReports.initialize( user.username, token, sourceCountry, activeH, langCode, true, rList, defReport, mergeWithLatest )
          wfReports.style.width = '100%'
          wfReports.style.padding = '3px !important'
          wfReports.setAttribute( 'showCheckboxes', true )
        } else {
          wfReports.initialize( user.username, token, sourceCountry, activeH, langCode, false, {}, defReport )
          wfReports.style.width = '100%'
          wfReports.style.padding = '3px !important'
          wfReports.setAttribute( 'showCheckboxes', false )
        }
      }
    } )
  }

  showInfographicsLoading() {
    // display the busy spinner
    const busy = document.getElementById( this.props.id + '_loading-infos' )
    if ( busy ) {
      busy.style.display = 'block'
    }
  }

  hideInfographicsLoading() {
    // hide the busy spinner
    const busy = document.getElementById( this.props.id + '_loading-infos' )
    if ( busy ) {
      busy.style.display = 'hidden'
    }
  }

  refreshInfographicReports() {
    this.showInfographicsLoading()
    this.initializeReportComponents()
    this.hideInfographicsLoading()
  }

  toggleSidePopper = ( name: string ) => {
    // ensure other poppers are closed
    this.updateState( 'presetSearchSidePopper', false )
    this.updateState( 'presetBufferSidePopper', false )
    this.updateState( 'presetInfographicSidePopper', false )
    this.updateState( 'workflowSidePopper', false )
    this.updateState( 'workflowBufferSidePopper', false )
    this.updateState( 'workflowInfographicSidePopper', false )

    // open popper
    const isOpening: boolean = !this.state[name]
    this.updateState( name, !this.state[name] )
    if ( isOpening ) {
      const refreshListAndMergeWithLatest = true
      setTimeout( () => { this.initializeReportComponents( refreshListAndMergeWithLatest ) }, 0 )
    }
    // TODO: update geography list
  }

  setSearchResultLabel = ( str ) => {
    const { id } = this.props
    const elem = document.getElementById( id + '_searchResult' )
    if ( elem ) elem.innerText = str
  }

  onMapWidgetSelected = ( useMapWidgetIds: string[] ) => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    self._mapWidgetId = useMapWidgetIds[0]
    self.props.onSettingChange( {
      id: self.props.id,
      useMapWidgetIds
    } )
    if ( useMapWidgetIds.length ) {
      const mapWidget = useMapWidgetIds.toString()
      const appConfigActions = getAppConfigAction()
      const appConfig = appConfigActions.appConfig
      const widgetConfig = appConfig.widgets[useMapWidgetIds[0]].config
      self.props.onSettingChange( {
        id: mapWidget,
        config: {
          ...widgetConfig,
          toolConfig: {
            ...widgetConfig.toolConfig,
            canSearch: false
          }
        }
      } )
    }
  }

  localeString = ( string ) => {
    return this.props.intl.formatMessage( { id: string, defaultMessage: defaultMessages[string] } )
  }

  getThemeObject = () => {
    return {
      brand: '#007F94',
      brandHover: '#00aabb',
      brandPress: '#00aabb',
      foreground1: '#181818ff',
      foreground2: '#4a4a4aff',
      text1: '#fafafaff',
      text2: '#a8a8a8ff',
      text3: '#ffffffff',
      border: '#a8a8a8',
      border2: '#929292ff',
      border3: '#181818',
      accordionBackground: '#4a4a4aff',
      accordionForeground: '#a8a8a8ff',
      text: '#181818',
      background: '#ffffff',
      foreground: '#181818',
      textInverse: '#ffffff',
      backgroundInverse: '#181818',
      borderInverse: '#ffffff',
      scrollbar: '#cccccc',
      scrollbarBG: '#f5f5f5'
    }
  }

  onToggleInfographicChoice( val: boolean ) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    this.onPropertyChange( 'workflowEnableInfographicChoice', val )

    requestAnimationFrame( () => {
      self.initializeReportComponents()
    } )
  }

  stringifyTheme = () => {
    // Theme colors should match ExB
    const themeString = this.getThemeObject()
    return JSON.stringify( themeString )
  }

  onToggleEnableMapSearch = ( checked ) => {
    if ( checked !== this.props.config.searchbarEnabled ) {
      this.onPropertyChange( 'searchbarEnabled', checked )
    }
  }

  onSearchTypeChanged = ( searchType, checked ) => {
    const { baSearchType } = this.state
    switch ( searchType ) {
      case ( 'pointsOfInterest' ): {
        let isChecked = checked
        const geogEnabled = baSearchType === BaSearchType.all || baSearchType === BaSearchType.boundaries
        if ( !geogEnabled && !checked ) {
          // force check on points (not able to have both un-checked)
          isChecked = true
        }
        this.updateState( 'pointsOfInterestChecked', isChecked )
        const searchType = isChecked ? geogEnabled ? BaSearchType.all : BaSearchType.locations : BaSearchType.boundaries
        const delay = () => {
          this.onPropertyChange( 'baSearchType', searchType )
          requestAnimationFrame( () => {
            this.renderBufferBtn()
          } )
        }
        setTimeout( delay, 0 )
        break
      }
      case ( 'geographies' ): {
        let isChecked = checked
        const locsEnabled = baSearchType === BaSearchType.all || baSearchType === BaSearchType.locations
        if ( !locsEnabled && !checked ) {
          // force check on points (not able to have both un-checked)
          isChecked = true
        }
        this.updateState( 'geographiesChecked', isChecked )
        const searchType = isChecked ? locsEnabled ? BaSearchType.all : BaSearchType.boundaries : BaSearchType.locations
        const delay = () => { this.onPropertyChange( 'baSearchType', searchType ) }
        setTimeout( delay, 0 )
        break
      }
    }
  }

  toggleAllGeographyLevels = ( checked ) => {
    const hier = this.state.selectedHierarchyObj
    const allLevels = hier.geographyLevels

    // turn all levels on/off
    if ( !checked ) {
      this.onPropertyChange( 'selectedGeographyLevels', [] )
      this.updateState( 'activeGeographyLevels', [] )
    } else {
      this.onPropertyChange( 'selectedGeographyLevels', this.props.config.availableGeographyLevels )
      this.updateState( 'activeGeographyLevels', allLevels )
    }
    this._syncGeographyLevels( hier, { checked: checked } )
  }

  renderBufferBtn = () => {
    const { stPresetBuffer, presetBuffersQueued } = this.state
    const { widgetMode } = this.props.config
    let disableBuffers = false

    if ( widgetMode === Mode.Preset ) {
      if ( !presetBuffersQueued ) {
        // if the location selected is a Boundary - we disable the Buffers button
        disableBuffers = false
        if ( this.props.config.presetSearchSelectedObject ) {
          const obj = JSON.parse( this.props.config.presetSearchSelectedObject )
          if ( obj && ( obj.type === 'geography' || !this.state.pointsOfInterestChecked ) ) {
            disableBuffers = true
          }
        }

        switch ( stPresetBuffer ) {
          case 'ring':
            return (
              <Button className='w-100 d-flex selectedStateButton' disabled={disableBuffers} style={{ flex: '1 1 auto', alignItems: 'stretch' }} onClick={() => { this.toggleSidePopper( 'presetBufferSidePopper' ) }}>
                <div className='d-flex' style={{ flex: '0 1 auto', alignItems: 'center' }}>
                  <Icon size='l' icon={RingsIcon} style={{ marginRight: '4px' }} />
                </div>
                <div className='d-flex' style={{ flex: '1 1 auto', textAlign: 'left', justifyContent: 'end', flexDirection: 'column' }}>
                  {this.localeString( 'rings' )}
                </div>
              </Button>
            )
          case 'drivetime':
            return (
              <Button className='w-100 d-flex selectedStateButton' disabled={disableBuffers} style={{ flex: '1 1 auto', alignItems: 'stretch' }} onClick={() => { this.toggleSidePopper( 'presetBufferSidePopper' ) }}>
                <div className='d-flex' style={{ flex: '0 1 auto', alignItems: 'center' }}>
                  <Icon size='l' icon={DriveIcon} style={{ marginRight: '3px' }} />
                </div>
                <div className='d-flex' style={{ flex: '1 1 auto', textAlign: 'left', justifyContent: 'end', flexDirection: 'column' }}>
                  {this.localeString( InfoBufferType.drivetime )}
                </div>
              </Button>
            )
          case 'walktime':
            return (
              <Button className='w-100 d-flex selectedStateButton' disabled={disableBuffers} style={{ flex: '1 1 auto', alignItems: 'stretch' }} onClick={() => { this.toggleSidePopper( 'presetBufferSidePopper' ) }}>
                <div className='d-flex' style={{ flex: '0 1 auto', alignItems: 'center' }}>
                  <Icon size='l' icon={WalkIcon} style={{ marginRight: '2px' }} />
                </div>
                <div className='d-flex' style={{ flex: '1 1 auto', textAlign: 'left', justifyContent: 'end', flexDirection: 'column' }}>
                  {this.localeString( InfoBufferType.walktime )}
                </div>
              </Button>
            )
          default:
            break
        }
      } else {
        return (
          <Button type='tertiary' className='unselectedStateButtonDashed' onClick={() => { this.toggleSidePopper( 'presetBufferSidePopper' ); this.onPropertyChange( 'presetBuffersAccepted', true ) }} style={{ width: '100%' }}>
            {this.localeString( 'setBuffers' )}
          </Button>
        )
      }
    }
  }

  clearSearchObj = () => {
    const { widgetMode } = this.props.config
    if ( widgetMode === Mode.Preset ) {
      this.onPropertyChange( 'presetSearchSelectedObject', null )
      this.updateState( 'presetShowSearchInput', true )
    } else {
      this.onPropertyChange( 'workflowSearchSelectedObject', null )
      this.updateState( 'workflowShowSearchInput', true )
    }
  }

  openDefaultInfographicPanel = () => {
    const { reportList, sourceCountry, selectedHierarchy, autoSelectLatestDataSource } = this.props.config
    const { user } = this.props
    //populate list of selected infographics
    const elemId = this.props.id + '_' + 'def-selected-reports'
    const selectedList = { user: [], shared: [], public: [], gallery: [], tabular: [] }
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    const langCode = getAppStore().getState().appContext.locale || 'en'
    const token = this.getToken()
    const activeH = getActiveHierarchyId( selectedHierarchy, autoSelectLatestDataSource )

    const _extract = ( name, items?) => {
      if ( reportList[name] ) {
        const list = ( items ) || reportList[name]
        if ( list && list.length > 0 ) {
          for ( let ii = 0; ii < reportList[name].length; ii++ ) {
            const item = reportList[name][ii]
            if ( item && item.isChecked ) {
              selectedList[name].push( item )
            }
          }
        }
      }
    }
    ['user', 'shared', 'public'].forEach( o => { _extract( o ) } )
    if ( reportList.gallery ) { _extract( 'gallery', reportList.gallery.data ) }
    if ( reportList.tabular ) { _extract( 'tabular', reportList.tabular.data ) }

    const panel = this.getDefaultReportPanel()
    if ( panel ) {
      panel.style.display = 'block'
    }

    this._checkedItemsList = selectedList
    // Note: the report list may not exist when first opening the collapsablePanel
    // We need to let it instantiate before initialization
    function _delay() {
      // init report list to match our results
      const reports: any = document.getElementById( elemId )
      if ( reports ) {
        let def = self.getDefaultReport()
        if ( def ) { def = JSON.stringify( def ) }
        reports.initialize( user.username, token, sourceCountry, activeH, langCode, false, selectedList, def )
      }
    }
    setTimeout( _delay, 0 )
  }

  closeDefaultReportPanel = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    requestAnimationFrame( () => {
      const panel = self.getDefaultReportPanel()
      if ( panel ) {
        panel.style.display = 'none'
      }
    } )
  }

  onChangeDrivetimeToggle = ( value: any ) => {
    const checked: boolean = value === true
    this.onPropertyChange( 'displayDrivetimeOptions', checked )
  }

  onSettingsDefaultReportSelected = ( ev ) => {
    // user chose report as default
    const id = ev.detail?.id
    const name = ev.detail?.name

    if ( id && name ) {
      this.onDefaultInfographicChanged( { id, name } )
    }
    this.closeDefaultReportPanel()
  }

  resetDefaultReport = () => {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    function _delay() {
      self.onDefaultInfographicChanged( { id: undefined, name: undefined } )
      self.closeDefaultReportPanel()
    }
    setTimeout( _delay, 0 )
  }

  getDefaultReportPanel = () => {
    const { id } = this.props
    const elemId = id + '_' + 'def-selected-reports'
    const panel: any = document.getElementById( elemId )
    return panel
  }

  _defaultReportIsValid = ( report ) => {
    return ( report && report.id && report.id.length > 0 && report.name && report.name.length > 0 )
  }

  getDefaultReport = () => {
    let result
    const { defaultReport } = this.props.config

    if ( this._defaultReportIsValid( defaultReport ) ) {
      result = {
        id: defaultReport.id,
        name: defaultReport.name
      }
    }
    return result
  }

  getDefaultReportLabel = () => {
    let name
    const { defaultReport } = this.props.config

    if ( defaultReport && this._defaultReportIsValid( defaultReport ) ) {
      name = defaultReport.name
    } else { name = this.localeString( 'selectDefaultInfographic' ) }
    return name
  }

  /** getValidSelectedHierarchyID
   * This function checks the state of the auto-select-latest button.  If
   * that is checked, then this will return an empty string which causes GE to
   * use the latest hierarchy.
   * @param available - available hierarchies for this country
   * @param selected - selected hierarchy
   * @returns
   */
  getValidSelectedHierarchyID = ( available, selected ): string => {
    const { autoSelectLatestDataSource } = this.props.config

    if ( !autoSelectLatestDataSource ) {
      // if auto-select is not enabled, then we return the selected hierarchy ID

      // console.log( '%c SETTINGS getHierarchy...', 'color:orange;font-size:12pt;' ) //  @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
      const specified = ( selected && available && available.find( ( h ) => h.ID === selected.ID ) ) ? selected : undefined
      if ( specified && specified.ID ) {
        return specified.ID
      }
    }
    return ''
  }

  /** resetLocationAndInfographic */
  onSelectLatestDataSource = (): void => {
    const c = this.props.config.sourceCountry
    const selHierId = getLatestHierarchyID( c, this.state.countries )
    // as if the user changed the selected data source...
    requestAnimationFrame( () => {
      this._onDataSourceChanged( c, selHierId )
    } )
  }

  async loadTravelModes() {
    if ( this.state.travelModes.length > 0 ) return // Already loaded

    this.setState( { isLoadingTravelModes: true } )

    try {
      const username = this.props.user?.username
      const token = this.getToken()
      if ( username && token ) {
        TokenProvider.setToken( username, token )
      }

      const response = await GEClient.getTravelModes( token, window.jimuConfig.hostEnv, this.state.routingUtilityUrl )

      const typedResponse = response as any

      let travelModes: TravelMode[] = []
      if ( typedResponse && typedResponse.results && Array.isArray( typedResponse.results ) && typedResponse.results.length > 0 ) {
        const supportedTravelModesResult = typedResponse.results.find(
          ( result: any ) => result.paramName === 'supportedTravelModes'
        )

        if ( supportedTravelModesResult &&
          supportedTravelModesResult.value &&
          supportedTravelModesResult.value.features &&
          Array.isArray( supportedTravelModesResult.value.features ) ) {

          travelModes = supportedTravelModesResult.value.features.map( ( feature: any ) => {
            const attrs = feature.attributes

            let travelModeDetails: any = {}
            try {
              if ( attrs.TravelMode && typeof attrs.TravelMode === 'string' ) {
                travelModeDetails = JSON.parse( attrs.TravelMode )
              }
            } catch ( e ) {
              console.warn( 'Error parsing TravelMode JSON:', e )
            }

            return {
              name: attrs.Name || attrs.AltName || 'Unknown Mode',
              itemId: attrs.TravelModeId || '',
              type: travelModeDetails.type || 'AUTOMOBILE',
              description: attrs.Name || attrs.AltName || '',
              travelModeData: travelModeDetails
            }

          } )
        }
      }

      if ( travelModes.length === 0 ) {
        console.warn( 'No travel modes loaded from API service' )
      }

      this.setState( { travelModes } )

      //console.log('Loaded travel modes:', travelModes)
    } catch ( error ) {
      console.error( 'Error loading travel modes from service:', error )
      this.setState( { travelModes: [] } )
    } finally {
      this.setState( { isLoadingTravelModes: false } )
    }
  }

  getFilteredTravelModes( bufferUnitOverride?: string ): TravelMode[] {
    const { workflowDrivetimeBufferUnit, widgetMode } = this.props.config
    const { stPresetDrivetimeBufferUnit } = this.state

    if ( !this.state.travelModes ) return []

    // Determine which buffer unit to use based on mode or override
    let bufferUnit
    if ( bufferUnitOverride ) {
      bufferUnit = bufferUnitOverride
    } else if ( widgetMode === Mode.Preset ) {
      bufferUnit = stPresetDrivetimeBufferUnit
    } else {
      bufferUnit = workflowDrivetimeBufferUnit
    }

    if ( !bufferUnit ) return this.state.travelModes

    const unit = bufferUnit.toLowerCase()


    const timeAttributeFilters: string[] = ['TravelTime', 'TruckTravelTime']
    let impedanceFilters: string[]
    if ( unit === 'minutes' ) {
      impedanceFilters = ['TravelTime', 'TruckTravelTime']
    } else {
      impedanceFilters = ['Kilometers', 'Miles']
    }

    const filtered = this.state.travelModes.filter( mode => {
      const impedance = mode.travelModeData?.impedanceAttributeName
      const timeAttr = mode.travelModeData?.timeAttributeName
      return (
        impedanceFilters.includes( impedance ) &&
        timeAttributeFilters.includes( timeAttr )
      )
    } )

    return filtered
  }

  getDefaultTravelModeForUnit( bufferUnit: string, travelModes: TravelMode[] ): string | undefined {
    if ( !bufferUnit || !travelModes || travelModes.length === 0 ) return undefined
    const unit = bufferUnit.toLowerCase()
    if ( unit === 'minutes' ) {
      // Prefer "Driving Time"
      const drivingTime = travelModes.find( m => m.name.toLowerCase().includes( 'driving time' ) )
      return drivingTime?.itemId || travelModes[0].itemId
    } else {
      // Prefer "Driving Distance"
      const drivingDistance = travelModes.find( m => m.name.toLowerCase().includes( 'driving distance' ) )
      return drivingDistance?.itemId || travelModes[0].itemId
    }
  }

  getDrivingModeOptions() {
    if ( this.state.isLoadingTravelModes ) {
      return (
        <option value="" disabled>
          {this.localeString( 'loading' ) || 'Loading...'}
        </option>
      )
    }

    // Filter travel modes based on buffer unit from config
    const filteredModes = this.getFilteredTravelModes()

    // Sort alphabetically by name
    const sortedModes = filteredModes.sort( ( a, b ) => a.name.localeCompare( b.name ) )

    return sortedModes.map( mode => (
      <option
        key={mode.itemId}
        value={mode.itemId}
        selected={
          ( this.props.config.travelModeData?.itemId === mode.itemId || this.props.config.travelModeData === mode.itemId ) ||
          this.state.stTravelModeData === mode.itemId
        }
      >
        {mode.name}
      </option>
    ) )
  }

  // TM - Backward compatibility migration
  // Migrates old 'drivingMode' property (string name) to new 'travelModeData' (object)
  migrateDrivingModeToTravelModeData() {
    const { travelModeData, drivingMode } = this.props.config

    // Only migrate if we have old drivingMode but no new travelModeData
    if ( !travelModeData && drivingMode && typeof drivingMode === 'string' && this.state.travelModes.length > 0 ) {
      // Try to find travel mode by matching name (case-insensitive)
      const matchedTravelMode = this.state.travelModes.find( mode =>
        mode.name && mode.name.toLowerCase() === drivingMode.toLowerCase()
      )

      if ( matchedTravelMode ) {
        //console.log(`BA Infographic: Migrating old drivingMode "${drivingMode}" to travelModeData:`, matchedTravelMode.name)
        // Convert old drivingMode to new travelModeData structure
        const travelModeWithId = {
          ...matchedTravelMode.travelModeData,
          itemId: matchedTravelMode.itemId,
          name: matchedTravelMode.name,
          description: matchedTravelMode.description
        }
        this.onMultiplePropertyChange( [
          { name: 'travelModeData', value: travelModeWithId },
          { name: 'drivingMode', value: undefined } // Remove old property
        ] )
        return true // Migration successful
      } else {
        //console.warn(`BA Infographic: Could not find travel mode matching old drivingMode: "${drivingMode}". Available travel modes:`,
        this.state.travelModes.map( mode => mode.name )
      }
    }
    return false // No migration needed or failed
  }

  render() {
    const {
      selectedCountry, activeGeographyLevels, geographiesChecked, pointsOfInterestChecked, presetBuffersQueued,
      maxDriveBuffer, maxWalkBuffer, stViewMode, portalHelpUrl, availableHierarchies, selectedHierarchyObj
    } = this.state

    const {
      reportList, drawPointEnabled, searchbarEnabled, drawPolygonEnabled, showIncrementButtons, displayDrivetimeOptions,
      travelModeData, travelDirection, useTrafficChecked, trafficType, offsetTime, offsetDay, offsetHr,
      workflowEnableUserConfigBuffers, workflowAvailableBufferRings, workflowBuffer, workflowRingsBuffer1,
      workflowRingsBuffer2, workflowRingsBuffer3, workflowRingsBufferUnit, workflowAvailableBufferDrivetime,
      workflowDrivetimeBuffer1, workflowDrivetimeBuffer2, workflowDrivetimeBuffer3, workflowDrivetimeBufferUnit,
      workflowAvailableBufferWalktime, workflowEnableInfographicChoice, workflowIntroTextReportCheckbox,
      workflowIntroTextReports, workflowWalktimeBuffer1, workflowWalktimeBuffer2, workflowWalktimeBuffer3,
      workflowWalktimeBufferUnit, workflowIntroTextBuffersCheckbox, workflowIntroTextBuffers, workflowEnableSearch,
      workflowDisplayIntroText, workflowIntroText, widgetMode, igBackgroundColor, runReportOnClick, imageExport,
      dynamicHtml, excel, pdf, fullscreen, zoomLevel, displayHeader, headerColor, headerTextColor, sourceCountry,
      widgetPlaceholderText, widgetPlaceholderTextToggle, workflowSearchSelectedObject, presetSearchSelectedObject,
      presetSelectedReport, presetSelectedReportName, workflowSelectedReport, autoSelectLatestDataSource
    } = this.props.config

    const {
      stPresetBuffer, stPresetRingsBuffer1, stPresetRingsBuffer2, stPresetRingsBuffer3, stPresetRingsBufferUnit,
      stPresetDrivetimeBuffer1, stPresetDrivetimeBuffer2, stPresetDrivetimeBuffer3, stPresetDrivetimeBufferUnit,
      stPresetWalktimeBuffer1, stPresetWalktimeBuffer2, stPresetWalktimeBuffer3, stPresetWalktimeBufferUnit,
      countries, modePopperOpen, settingsOpen, presetSearchSidePopper, allowInfographicChoiceIconOpen,
      workflowInfographicSidePopper, presetInfographicSidePopper, presetBufferSidePopper, workflowBufferSidePopper,
      allowBufferInfoIconOpen, presetShowSearchInput, workflowSearchSidePopper, allowSearchInfoIconOpen, useLatestDSInfoIconOpen,
      stTravelModeData, stTravelDirection, stTrafficType, stOffsetTime, stOffsetDay, stOffsetHr,
      workflowShowSearchInput, stUseTrafficChecked
    } = this.state

    const { theme, useMapWidgetIds, user, id } = this.props

    // TM
    // const travelModeDefaults: TravelModeOptions = {
    //   mode: DrivingMode.driving,
    //   direction: TravelDirection.toward
    // }
    const _useTrafficEnabled = true
    const langCode = getAppStore().getState().appContext.locale || 'en'
    const token = this.getToken()
    const presetSearchObj = presetSearchSelectedObject ? JSON.parse( presetSearchSelectedObject ) : ''
    const workflowSearchObj = workflowSearchSelectedObject ? JSON.parse( workflowSearchSelectedObject ) : ''

    const validSelectedHierarchyID = this.getValidSelectedHierarchyID( availableHierarchies, selectedHierarchyObj )

    // set disabled state of the Buffers button
    let buffersButtonDisabled: boolean = workflowSearchObj && workflowSearchObj.type === 'geography'
    if ( !buffersButtonDisabled && presetSearchObj && presetSearchObj.type === 'geography' ) {
      buffersButtonDisabled = true
    }

    const style = css`
          .widget-setting-get-map-coordinates {
            .checkbox-row {
              display: flex;
              justify-content: space-between;
              margin-bottom: 8px;
            }
          }

          .bufferInput {
            width: 20% !important;
          }

          .bufferUnits {
            width: 40% !important;
          }
        `
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this

    const isUsingBuffers = () => {
      return true
    }

    const onAllowWorkflowSearch = ( flag ) => {
      // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
      const self = this
      const originalState = flag
      requestAnimationFrame( () => {
        if ( originalState ) {
          self.updateState( 'baSearchType', self.props.config.baSearchType || BaSearchType.all )
        } else {
          self.onPropertyChange( 'baSearchType', BaSearchType.all )
        }
        const changeArr = [
          { name: 'workflowSearchSelectedObject', value: null },
          { name: 'workflowEnableSearch', value: originalState },
          { name: '' }
        ]
        self.onMultiplePropertyChange( changeArr )
        if ( originalState ) {
          self.updateState( 'workflowShowSearchInput', true )
        }
      } )
    }
    const onClickSelectDefaultReport = ( ev ) => {
      if ( !this._ignoreNextDefaultClick ) {
        self.openDefaultInfographicPanel()
      }
      self._ignoreNextDefaultClick = false
    }
    const onClickClearDefaultReport = ( ev ) => {
      self.resetDefaultReport()
      self._ignoreNextDefaultClick = true
    }
    const learnMoreUrl = window.jimuConfig.isInPortal ? portalHelpUrl : 'https://links.esri.com/ba-exb/modes'

    const modeLabel = (
      <div className='w-100 d-flex'>
        <div className='text-truncate p-1'>
          {self.localeString( 'mode' )
          }
        </div>
        <React.Fragment>
          <Button
            type='tertiary'
            className='widget-help-btn' icon size='sm'
            onClick={() => { self.updateState( 'modePopperOpen', !modePopperOpen ) }}
            onMouseEnter={() => { self.updateState( 'modePopperOpen', true ) }}
            ref={self.modeInfoRef as React.RefObject<HTMLButtonElement>}
          >
            <InfoOutlined />
            {/* <span className='sr-only'>{this.localeString('modeInfo')}</span> */}
            <Popper
              arrowOptions
              css={popperStyles}
              open={modePopperOpen}
              placement='right'
              offsetOptions={10}
              reference={self.modeInfoRef}
              toggle={() => { self.updateState( 'modePopperOpen', false ) }}
            >
              <h5>{self.localeString( 'mode' )}</h5>
              <p>{self.localeString( 'modeInfoLine1' )}</p>
              <p>{self.localeString( 'modeInfoLine2' )}</p>
              <Button className='float-right' type='primary' size='sm' href={learnMoreUrl} target='_blank'>
                {self.localeString( 'learnMore' )}
              </Button>
            </Popper>
          </Button>
        </React.Fragment>
      </div >
    )

    const popperOuterStyle: React.CSSProperties = {
      padding: '12px !important'
    }
    const viewModeValue: string = ( stViewMode != null && stViewMode !== 'auto' ) ? stViewMode : ViewMode.Auto

    const pinIcon = PinEsriOutlined
    const polygonIcon = PolygonOutlined
    const searchIcon = SearchOutlined

    const infographicsLoadingSpinner: React.CSSProperties = {
      position: 'relative',
      top: '0px',
      left: 'calc(50% - 16px)',
      transform: 'scale(0.8)',
      width: '24px',
      height: '24px',
      display: 'hidden',
      marginBottom: '20px'
    }

    const timeOffsets = [
      { value: 0, label: self.localeString( 'now' ) },
      ...Array.from( { length: 48 }, ( _, index ) => {
        const minutes = ( index + 1 ) * 15
        const hours = Math.floor( minutes / 60 )
        const mins = minutes % 60
        return {
          value: minutes,
          label: hours > 0
            ? `+${hours} ${self.localeString( 'offsetHr' )} ${mins > 0 ? mins + ' ' + self.localeString( 'min' ) : ''}`
            : `+${mins} ${self.localeString( 'min' )}`
        }
      } )
    ]

    // Days of the week
    const daysOfWeek = [
      self.localeString( 'mon' ),
      self.localeString( 'tues' ),
      self.localeString( 'wed' ),
      self.localeString( 'thurs' ),
      self.localeString( 'fri' ),
      self.localeString( 'sat' ),
      self.localeString( 'sun' )

    ]

    // Generate time options in 15-minute increments up to 24 hours
    const timeOptions = Array.from( { length: 96 }, ( _, index ) => {
      const totalMinutes = index * 15
      const hours24 = Math.floor( totalMinutes / 60 )
      const minutes = totalMinutes % 60
      const hours12 = hours24 % 12 || 12 // Convert to 12-hour format, treating 0 as 12
      const period = hours24 < 12 ? 'AM' : 'PM' // Determine AM/PM
      const formattedTime = `${hours12}:${minutes < 10 ? '0' : ''}${minutes} ${period}`

      return {
        value: formattedTime,
        label: formattedTime
      }
    } )

    return (
      <div css={getStyle( theme )}>
        <div className='widget-setting-bao' style={{ display: 'relative' }}>
          {/* Select Mode */}
          <SettingSection className='map-selector-section' title={modeLabel}>
            <div className='mode-group w-100 mt-1'>
              <div className='d-flex justify-content-between w-100'>

                <Button onClick={( e: any ) => { self.onWidgetModeChange( e.currentTarget.value ) }} name='mode' value={Mode.Workflow} type='tertiary' vertical={true} title={self.localeString( 'workflowIcon' )}>
                  <Icon autoFlip className={`mode-img mode-img-h ${widgetMode === Mode.Workflow && 'active'}`} icon={require( './assets/Workflow108x80.svg' )} />
                  {self.localeString( 'workflow' )}
                </Button>
                <Button onClick={( e: any ) => { self.onWidgetModeChange( e.currentTarget.value ) }} name='mode' value={Mode.Preset} type='tertiary' vertical={true} title={self.localeString( 'presetIcon' )} >
                  <Icon autoFlip className={`mode-img mode-img-h ${widgetMode === Mode.Preset && 'active'}`} icon={require( './assets/InfographicPreset108x80.svg' )} />
                  {self.localeString( 'preset' )}
                </Button>
              </div>
            </div >
          </SettingSection >

          {/* Default Setting */}

          {
            widgetMode === Mode.Preset &&
            <SettingSection>
              <SettingRow>
                <Checkbox style={{ cursor: 'pointer' }} className='mr-2' checked={widgetPlaceholderTextToggle} onChange={e => { self.onPropertyChange( 'widgetPlaceholderTextToggle', e.target.checked ) }} />
                {self.localeString( 'introTextCheckbox' )}
              </SettingRow >
              <TextArea className='w-100 mt-2' spellCheck={true} height={80} value={widgetPlaceholderText} onChange={e => { self.onPropertyChange( 'widgetPlaceholderText', e.target.value ) }} />
            </SettingSection >
          }
          {/* Link Map Widget */}
          <SettingSection className='map-selector-section' title={self.localeString( 'selectMapWidget' )}>
            <React.Fragment>
              <div css={style}>
                <div className='widget-setting-get-map-coordinates'>
                  <SettingRow>
                    <MapWidgetSelector onSelect={self.onMapWidgetSelected} useMapWidgetIds={useMapWidgetIds} />
                  </SettingRow>
                  {useMapWidgetIds && useMapWidgetIds.length > 0 && ( widgetMode === Mode.Workflow || widgetMode === Mode.Preset ) && (
                    <div className='drawnGraphicContainer' >
                      <SettingRow
                        tag='label'
                        label={
                          <span>
                            <Icon size='m' icon={searchIcon} style={{ marginRight: '8px' }} />
                            {self.localeString( 'showSearchButton' )}

                          </span >
                        }
                      >
                        <Switch
                          aria-label={self.localeString( 'showSearchButton' )}
                          checked={searchbarEnabled}
                          onChange={( e ) => { self.onToggleEnableMapSearch( e.target.checked ) }}
                        />
                      </SettingRow >
                    </div >
                  )}

                  {
                    useMapWidgetIds && useMapWidgetIds.length > 0 && widgetMode === Mode.Workflow && (
                      <div className='drawnGraphicContainer'>
                        <SettingRow role='group' aria-label={self.localeString( 'drawingToolsTips' )} flow='wrap' className='d-block' label={self.localeString( 'drawingToolsTips' )}>

                        </SettingRow>
                        <div className='drawnGraphicContainer'>
                          {/* Point Draw Mode */}
                          <SettingRow
                            tag='label'
                            label={
                              <span style={{ display: 'flex', alignItems: 'center' }}>
                                <Icon size='l' icon={pinIcon} style={{ marginRight: '8px' }} />
                                {self.localeString( 'drawModePoint' )}
                              </span >
                            }
                          >
                            <Switch
                              aria-label={self.localeString( 'drawModePoint' )}
                              checked={drawPointEnabled}
                              onChange={e => { self.onPropertyChange( 'drawPointEnabled', e.target.checked ) }}
                            />
                          </SettingRow >

                          {/* Polygon Draw Mode */}
                          < SettingRow
                            tag='label'
                            label={
                              < span style={{ display: 'flex', alignItems: 'center' }}>
                                <Icon size='l' icon={polygonIcon} style={{ marginRight: '8px' }} />

                                {self.localeString( 'drawModePolygon' )}
                              </span >
                            }
                          >
                            <Switch
                              aria-label={self.localeString( 'drawModePolygon' )}
                              checked={drawPolygonEnabled}
                              onChange={e => { self.onPropertyChange( 'drawPolygonEnabled', e.target.checked ) }}
                            />
                          </SettingRow >
                        </div >

                      </div >
                    )}
                </div >
              </div >
            </React.Fragment >
          </SettingSection >

          {/* Location Settings */}
          < SettingSection title={< div className='w-100 d-flex' style={{ height: '23px', flexFlow: 'column wrap', alignContent: 'space-between' }}>
            <div className='text-truncate py-1'>
              {self.localeString( 'locationSettings' )}
            </div >
          </div >}>
            <SettingRow flow='wrap' label={self.localeString( 'selectCountry' )}>
              <Select name='sourceCountry' size='sm' value={selectedCountry} onChange={e => { self.updateSelectedCountry( e.target.value ) }}>
                {countries && countries.map( ( country ) => {
                  return (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  )
                } )}
              </Select>
            </SettingRow>
            {availableHierarchies && availableHierarchies.length > 1 &&
              <SettingRow flow='wrap' label={self.localeString( 'data-source' )}>
                <Select name='selectedHierarchy' size='sm' value={validSelectedHierarchyID} onChange={self.onDataSourceChange} disabled={autoSelectLatestDataSource}>
                  {availableHierarchies && availableHierarchies.map( ( h ) => {
                    return (
                      <option key={h.ID} value={h.ID}>{h.alias}</option>
                    )
                  } )}
                </Select>
              </SettingRow>
            }
            {selectedCountry && selectedCountry === 'US' &&
              < SettingRow tag='label' label={self.localeString( 'autoDataSource' )}>

                <Button type='tertiary' className='widget-help-btn' icon size='sm' onMouseEnter={() => { self.updateState( 'useLatestDSInfoIconOpen', true ) }} onMouseLeave={() => { self.updateState( 'useLatestDSInfoIconOpen', false ) }} ref={self.useLatestDSInfoRef as React.RefObject<HTMLButtonElement>} >
                  <InfoOutlined />
                  <span className='sr-only'>
                    {self.localeString( 'introTextWithDraw' )}
                  </span>
                  <Popper arrowOptions css={popperStyles} open={useLatestDSInfoIconOpen} placement='right' offsetOptions={10} reference={self.useLatestDSInfoRef} toggle={() => { self.updateState( 'useLatestDSInfoIconOpen', false ) }}>
                    <h5>{self.localeString( 'infoUseLatestDS' )}</h5>
                    <p>{self.localeString( 'infoUseLatestDSDescription' )}</p>
                  </Popper>
                </Button>

                <Switch className='can-x-switch' data-key='displayHeader' checked={autoSelectLatestDataSource}
                  onChange={e => {
                    self.handleIgSettingChange( 'autoSelectLatestDataSource', e.target.checked )
                    self.onSelectLatestDataSource()
                  }} />
              </SettingRow>
            }

            {widgetMode === Mode.Preset
              ? <React.Fragment>
                <SettingRow>
                  {presetSearchObj && ( presetSearchObj.name || presetSearchObj.address )
                    ? <Button className='w-100 d-flex selectedStateButton' style={{ flex: '1 1 auto', alignItems: 'stretch' }} onClick={() => { self.toggleSidePopper( 'presetSearchSidePopper' ) }}>

                      <div className='d-flex' style={{ flex: '0 1 auto', alignItems: 'center' }}>
                        <Icon size='l' icon={presetSearchObj.type === 'location' ? PinEsriOutlined : PolygonOutlined} />
                      </div>
                      <div className='d-flex' style={{ flex: '1 1 auto', textAlign: 'left', justifyContent: 'end', flexDirection: 'column' }}>
                        {presetSearchObj.type === 'location' ? presetSearchObj.address : presetSearchObj.name}
                      </div>
                    </Button>

                    : <Button type='tertiary' className='unselectedStateButtonDashed' onClick={() => { self.toggleSidePopper( 'presetSearchSidePopper' ) }}>
                      {self.localeString( 'setLocation' )}
                    </Button>
                  }
                </SettingRow>
                {
                  presetSearchSidePopper && (
                    <SidePopper isOpen title={self.localeString( 'setLocation' )} position='right' toggle={() => { self.toggleSidePopper( 'presetSearchSidePopper' ) }} trigger={self.sidePopperTrigger?.current}>
                      <div className='p-4'>
                        <SettingRow className='mt-4' label={self.localeString( 'presetLocationLabel' )} />
                        <SettingRow>
                          {presetSearchObj && !presetShowSearchInput
                            ? <Button className='w-100 d-flex selectedStateButton' style={{ flex: '1 1 auto', alignItems: 'stretch' }} onClick={() => { self.clearSearchObj() }} >
                              <div className='d-flex' style={{ flex: '0 1 auto', alignItems: 'center' }}>
                                <Icon size='l' icon={presetSearchObj.type === 'location' ? PinEsriOutlined : PolygonOutlined} />
                              </div>
                              <div className='d-flex' style={{ flex: '1 1 auto', textAlign: 'left', justifyContent: 'end', flexDirection: 'column' }}>
                                {presetSearchObj.type === 'location' ? presetSearchObj.address : presetSearchObj.name}
                              </div>
                              <span className='d-flex justify-content-center' style={{ margin: 'auto 0', alignItems: 'right' }} title={self.localeString( 'clearSearch' )}>
                                <Icon size='s' icon={CloseOutlined} />
                              </span>
                            </Button>
                            : <ArcgisBaSearch
                              id={id + '_' + 'preset_search'}
                              className='w-100'
                              style={{ position: 'relative', width: '100%' }}
                              username={user.username}
                              mode={widgetMode}
                              env={window.jimuConfig.hostEnv}
                              geoenrichmentUrl={self.state.geoenrichmentServiceUrl ? self.state.geoenrichmentServiceUrl : null}
                              geocodeUrl={self.state.geocodeUrl ? self.state.geocodeUrl : null}
                              token={token}
                              sourceCountry={selectedCountry}
                              selectedHierarchy={selectedHierarchyObj.ID}
                              langCode={langCode}
                              activeLevels={JSON.stringify( self.state.activeGeographyLevels )}
                              colors={self.getThemeObject()}
                              theme={2}
                              onSearchResults={ev => { self.baSearchResultsHandler( ev ) }} />
                          }
                        </SettingRow >
                      </div >
                    </SidePopper >
                  )
                }
              </React.Fragment >
              : <React.Fragment>
                <SettingRow>
                  {workflowSearchObj && ( workflowSearchObj.name || workflowSearchObj.address )
                    ? <Button className='w-100 d-flex selectedStateButton' style={{ flex: '1 1 auto', alignItems: 'stretch' }} onClick={() => { self.toggleSidePopper( 'workflowSearchSidePopper' ) }}>
                      <div className='d-flex' style={{ flex: '0 1 auto', alignItems: 'center' }}>
                        <Icon size='l' icon={workflowSearchObj.type === 'location' ? PinEsriOutlined : PolygonOutlined} />
                      </div>
                      <div className='d-flex' style={{ flex: '1 1 auto', textAlign: 'left', justifyContent: 'end', flexDirection: 'column' }}>
                        {workflowSearchObj.type === 'location' ? workflowSearchObj.address : workflowSearchObj.name}
                      </div>
                    </Button>
                    : <Button type='tertiary' className='unselectedStateButtonDashed' onClick={() => { self.toggleSidePopper( 'workflowSearchSidePopper' ) }}>
                      {self.localeString( 'customizeSearch' )}
                    </Button>
                  }

                </SettingRow>
                {
                  workflowSearchSidePopper && (
                    <SidePopper isOpen title={self.localeString( 'customizeSearchBtn' )} position='right' toggle={() => { self.toggleSidePopper( 'workflowSearchSidePopper' ) }} trigger={self.sidePopperTrigger?.current}>
                      <div className='p-4'>
                        <SettingRow label={
                          <React.Fragment>
                            {self.localeString( 'allowRuntimeSearch' )}
                            <Button type='tertiary' className='widget-help-btn' icon size='sm' onClick={() => { self.updateState( 'allowSearchInfoIconOpen', !allowSearchInfoIconOpen ) }} onMouseEnter={() => { self.updateState( 'allowSearchInfoIconOpen', true ) }} onMouseLeave={() => { self.updateState( 'allowSearchInfoIconOpen', false ) }} ref={self.allowSearchInfoRef as React.RefObject<HTMLButtonElement>} >
                              <InfoOutlined />
                              <span className='sr-only'>
                                {self.localeString( 'introTextWithDraw' )}
                              </span>
                              <Popper arrowOptions css={popperStyles} open={allowSearchInfoIconOpen} placement='right' offsetOptions={10} reference={self.allowSearchInfoRef} toggle={() => { self.updateState( 'allowSearchInfoIconOpen', false ) }} >
                                <h5>{self.localeString( 'allowRuntimeSearch' )}</h5>
                                <p>{self.localeString( 'allowRuntimeSearchInfo' )}</p>
                              </Popper>
                            </Button>
                          </React.Fragment>
                        }>
                          <Switch className='can-x-switch' data-key='workflowEnableSearch' checked={workflowEnableSearch} onChange={e => { onAllowWorkflowSearch( e.target.checked ) }} />
                        </SettingRow>
                        {workflowEnableSearch
                          ? <React.Fragment>
                            {self.localeString( 'userConfigLocationDesc' )}
                            <SettingRow>
                              <Checkbox style={{ cursor: 'pointer' }} className='mr-2' checked={workflowDisplayIntroText} onChange={e => { self.onPropertyChange( 'workflowDisplayIntroText', e.target.checked ) }} />
                              {self.localeString( 'introTextCheckbox' )}
                            </SettingRow>
                            <TextArea className='w-100 mt-2' spellCheck={true} height={80} value={workflowIntroText} onChange={e => { self.onPropertyChange( 'workflowIntroText', e.target.value ) }} />
                          </React.Fragment >
                          : self.localeString( 'userConfigLocationDescOff' )
                        }
                        {
                          !workflowEnableSearch && (
                            <React.Fragment>
                              <SettingRow className='mt-4' label={self.localeString( 'customExtentBoundary' )} />

                              <SettingRow>

                                {workflowSearchObj && !workflowShowSearchInput
                                  ? <Button className='w-100 d-flex selectedStateButton' style={{ flex: '1 1 auto', alignItems: 'stretch' }} onClick={() => { self.clearSearchObj() }} >
                                    <div className='d-flex' style={{ flex: '0 1 auto', alignItems: 'center' }}>
                                      <Icon size='l' icon={workflowSearchObj.type === 'location' ? PinEsriOutlined : PolygonOutlined} />
                                    </div>
                                    <div className='d-flex' style={{ flex: '1 1 auto', textAlign: 'left', justifyContent: 'end', flexDirection: 'column' }}>
                                      {workflowSearchObj.type === 'location' ? workflowSearchObj.address : workflowSearchObj.name}
                                    </div>
                                    <span className='d-flex justify-content-center' style={{ margin: 'auto 0', alignItems: 'right' }} title={self.localeString( 'clearSearch' )}>
                                      <Icon size='s' icon={CloseOutlined} />
                                    </span>
                                  </Button>
                                  : <ArcgisBaSearch
                                    id={id + '_workflow_search'}
                                    className='w-100'
                                    style={{ position: 'relative', width: '100%' }}
                                    username={user.username}
                                    mode={widgetMode}
                                    env={window.jimuConfig.hostEnv}
                                    geoenrichmentUrl={self.state.geoenrichmentServiceUrl ? self.state.geoenrichmentServiceUrl : null}
                                    geocodeUrl={self.state.geocodeUrl ? self.state.geocodeUrl : null}
                                    token={token}
                                    sourceCountry={selectedCountry}
                                    selectedHierarchy={selectedHierarchyObj?.ID}
                                    langCode={langCode}
                                    activeLevels={JSON.stringify( self.state.activeGeographyLevels )}
                                    colors={self.getThemeObject()}
                                    theme={2}
                                    onSearchResults={ev => { self.baSearchResultsHandler( ev ) }} />
                                }
                              </SettingRow >
                            </React.Fragment >
                          )
                        }

                        {
                          workflowEnableSearch && widgetMode === Mode.Workflow && (
                            <React.Fragment>
                              <SettingRow className="pt-4" label={self.localeString( 'searchControl' )} />
                              <SettingRow>
                                <Label check centric>
                                  {/* Points of Interest checkbox */}
                                  <Checkbox style={{ cursor: 'pointer' }} className='mr-2'
                                    checked={pointsOfInterestChecked} onChange={e => { self.onSearchTypeChanged( 'pointsOfInterest', e.target.checked ) }} />
                                  {self.localeString( 'pointsOfInterest' )}

                                </Label>
                              </SettingRow>
                              <SettingRow>
                                {/* Geographies checkbox */}
                                <Label check centric>
                                  <Checkbox style={{ cursor: 'pointer' }} className='mr-2'
                                    checked={geographiesChecked} onChange={e => {
                                      self.toggleAllGeographyLevels( e.target.checked )
                                      self.onSearchTypeChanged( 'geographies', e.target.checked )
                                    }} />
                                  {self.localeString( 'geographies' )}
                                </Label>
                              </SettingRow>

                              {/* GEOGRAPHY LEVELS */}
                              {
                                self.state.availableGeographyLevels &&
                                self.state.availableGeographyLevels.map( level => {
                                  const matching: string = activeGeographyLevels.find( o => o === level )
                                  const isSelected: boolean = ( typeof matching !== 'undefined' && matching.length > 0 )
                                  return (
                                    <SettingRow>
                                      <Label check centric>
                                        <Checkbox style={{ cursor: 'pointer' }} checked={isSelected}
                                          onChange={e => {
                                            const level = e.target.labels[0].innerText
                                            self.updateGeographyLevelCheck( { level }, !self.isGeographyLevelSelected( level ) )
                                          }} className='ml-4 mr-2' />
                                        {level}
                                      </Label>
                                    </SettingRow>
                                  )
                                } )
                              }
                            </React.Fragment >
                          )
                        }
                      </div >
                    </SidePopper >
                  )}
              </React.Fragment >
            }
          </SettingSection >

          {/* Customize Buffers  */}
          {
            ( isUsingBuffers() && widgetMode === Mode.Preset )
              ? <SettingSection title={<div className='w-100 d-flex' style={{ height: '23px', flexFlow: 'column wrap', alignContent: 'space-between' }}>
                <div className='text-truncate py-1'>
                  {self.localeString( 'buffersLabel' )}
                </ div >
              </div >}>
                <SettingRow flow='wrap'>
                  {self.renderBufferBtn()}
                </SettingRow>

                {
                  presetBufferSidePopper && (
                    <SidePopper isOpen title={self.localeString( 'setBuffers' )} position='right' toggle={() => { self.toggleSidePopper( 'presetBufferSidePopper' ) }} trigger={self.sidePopperTrigger?.current}>
                      <div className="p-4" style={popperOuterStyle}>
                        <SettingRow>
                          <Label centric>
                            {self.localeString( 'selectPresetBuffer' )}
                          </Label>
                        </SettingRow>
                        <SettingRow>
                          <Label check centric>

                            <Radio name='stPresetBuffer' style={{ cursor: 'pointer' }} value={InfoBufferType.ring} className='mr-2' checked={stPresetBuffer === InfoBufferType.ring} onChange={( e ) => { self.handleBufferChange( e.currentTarget.name, e.currentTarget.value, InfoBufferType.ring ) }} />
                            {self.localeString( 'rings' )}
                          </Label >
                        </SettingRow >
                        <div css={style} className='m-2'>
                          <SettingRow flow='no-wrap' className='w-100 d-flex'>

                            <NumericInput min='0.1' max={MaxBuffers.Rings} showHandlers={false} name='stPresetRingsBuffer1' data-key='stPresetRingsBuffer1' className='bufferInput' size='sm' value={stPresetRingsBuffer1} onChange={( buffer ) => { self.handleBufferChange( 'stPresetRingsBuffer1', buffer, InfoBufferType.ring ) }} />
                            <NumericInput min='0.1' max={MaxBuffers.Rings} showHandlers={false} name='stPresetRingsBuffer2' data-key='stPresetRingsBuffer2' className='bufferInput mx-1' size='sm' value={stPresetRingsBuffer2} onChange={( buffer ) => { self.handleBufferChange( 'stPresetRingsBuffer2', buffer, InfoBufferType.ring ) }} />
                            <NumericInput min='0.1' max={MaxBuffers.Rings} showHandlers={false} name='stPresetRingsBuffer3' data-key='stPresetRingsBuffer3' className='bufferInput' size='sm' value={stPresetRingsBuffer3} onChange={( buffer ) => { self.handleBufferChange( 'stPresetRingsBuffer3', buffer, InfoBufferType.ring ) }} />
                            <Select name='stPresetRingsBufferUnit' className='bufferUnits ml-1' size='sm' value={stPresetRingsBufferUnit} onChange={( e ) => { self.handleBufferChange( 'stPresetRingsBufferUnit', e.currentTarget.value, InfoBufferType.ring ) }}>
                              <option value='miles'>{self.localeString( 'milesLow' )}</option>
                              <option value='kilometers'>{self.localeString( 'kilometerLow' )}</option>
                            </Select>
                          </SettingRow>
                        </div >
                        <SettingRow>
                          <Label check centric>
                            <Radio name='stPresetBuffer' style={{ cursor: 'pointer' }} value={InfoBufferType.drivetime} className='mr-2' checked={stPresetBuffer === InfoBufferType.drivetime} onChange={e => { self.handleBufferChange( e.currentTarget.name, e.currentTarget.value, InfoBufferType.drivetime ) }} />
                            {self.localeString( InfoBufferType.drivetime )}
                          </Label >
                        </SettingRow >
                        <div css={style} className='m-2'>
                          <SettingRow flow='no-wrap' className='w-100 d-flex'>
                            <NumericInput min='1' max={maxDriveBuffer} showHandlers={false} name='stPresetDrivetimeBuffer1' data-key='stPresetDrivetimeBuffer1' className='bufferInput' size='sm' value={stPresetDrivetimeBuffer1} onChange={( buffer ) => { self.handleBufferChange( 'stPresetDrivetimeBuffer1', buffer, InfoBufferType.drivetime ) }} />
                            <NumericInput min='1' max={maxDriveBuffer} showHandlers={false} name='stPresetDrivetimeBuffer2' data-key='stPresetDrivetimeBuffer2' className='bufferInput mx-1' size='sm' value={stPresetDrivetimeBuffer2} onChange={( buffer ) => { self.handleBufferChange( 'stPresetDrivetimeBuffer2', buffer, InfoBufferType.drivetime ) }} />
                            <NumericInput min='1' max={maxDriveBuffer} showHandlers={false} name='stPresetDrivetimeBuffer3' data-key='stPresetDrivetimeBuffer3' className='bufferInput' size='sm' value={stPresetDrivetimeBuffer3} onChange={( buffer ) => { self.handleBufferChange( 'stPresetDrivetimeBuffer3', buffer, InfoBufferType.drivetime ) }} />
                            <Select name='stPresetDrivetimeBufferUnit' className='bufferUnits ml-1' size='sm' value={stPresetDrivetimeBufferUnit} onChange={( e ) => { self.handleBufferChange( 'stPresetDrivetimeBufferUnit', e.currentTarget.value, InfoBufferType.drivetime ) }}>
                              <option value='minutes'>{self.localeString( 'minuteLow' )}</option>
                              <option value='miles'>{self.localeString( 'milesLow' )}</option>
                              <option value='kilometers'>{self.localeString( 'kilometerLow' )}</option>
                            </Select>
                          </SettingRow>
                        </div >
                        <SettingRow>
                          <Label check centric>

                            <Radio name='stPresetBuffer' style={{ cursor: 'pointer' }} value={InfoBufferType.walktime} className='mr-2' checked={stPresetBuffer === InfoBufferType.walktime} onChange={e => { self.handleBufferChange( e.currentTarget.name, e.currentTarget.value, InfoBufferType.walktime ) }} />
                            {self.localeString( InfoBufferType.walktime )}
                          </Label >
                        </SettingRow >
                        <div css={style} className='m-2'>
                          <SettingRow flow='no-wrap' className='w-100 d-flex mt-2'>
                            <NumericInput min='1' max={maxWalkBuffer} showHandlers={false} name='stPresetWalktimeBuffer1' data-key='stPresetWalktimeBuffer1' className='bufferInput' size='sm' value={stPresetWalktimeBuffer1} onChange={( buffer ) => { self.handleBufferChange( 'stPresetWalktimeBuffer1', buffer, InfoBufferType.walktime ) }} />
                            <NumericInput min='1' max={maxWalkBuffer} showHandlers={false} name='stPresetWalktimeBuffer2' data-key='stPresetWalktimeBuffer2' className='bufferInput mx-1' size='sm' value={stPresetWalktimeBuffer2} onChange={( buffer ) => { self.handleBufferChange( 'stPresetWalktimeBuffer2', buffer, InfoBufferType.walktime ) }} />
                            <NumericInput min='1' max={maxWalkBuffer} showHandlers={false} name='stPresetWalktimeBuffer3' data-key='stPresetWalktimeBuffer3' className='bufferInput' size='sm' value={stPresetWalktimeBuffer3} onChange={( buffer ) => { self.handleBufferChange( 'stPresetWalktimeBuffer3', buffer, InfoBufferType.walktime ) }} />
                            <Select name='stPresetWalktimeBufferUnit' className='bufferUnits ml-1' size='sm' value={stPresetWalktimeBufferUnit} onChange={( e ) => { self.handleBufferChange( 'stPresetWalktimeBufferUnit', e.currentTarget.value, InfoBufferType.walktime ) }}>
                              <option value='minutes'>{self.localeString( 'minuteLow' )}</option>
                              <option value='miles'>{self.localeString( 'milesLow' )}</option>
                              <option value='kilometers'>{self.localeString( 'kilometerLow' )}</option>
                            </Select>
                          </SettingRow>
                        </div >

                        {/* Preset Drivetime Options - - - - - - - - - - - - */}
                        {
                          stPresetBuffer === InfoBufferType.drivetime && (
                            <div className='pt-2'>
                              {self.localeString( 'mode' )}

                              <div className='pt-1'>
                                {/* Travel Mode */}
                                <Select
                                  key={stPresetDrivetimeBufferUnit}
                                  name='travelModeData'
                                  size='sm'
                                  value={stTravelModeData}
                                  onChange={( e ) => {
                                    // Find the full travel mode object and extract only the travelModeData
                                    const selectedItemId = e.currentTarget.value
                                    const selectedTravelMode = self.state.travelModes.find( mode => mode.itemId === selectedItemId )
                                    if ( selectedTravelMode ) {
                                      // Store only the travelModeData portion to avoid nested duplication
                                      const travelModeWithId = {
                                        ...selectedTravelMode.travelModeData,
                                        itemId: selectedTravelMode.itemId,
                                        name: selectedTravelMode.name,
                                        description: selectedTravelMode.description
                                      }
                                      self.onPropertyChange( 'travelModeData', travelModeWithId )
                                    }
                                    // Also update state for UI
                                    self.updateBufferValue( 'stTravelModeData', selectedItemId )
                                  }}
                                >
                                  {this.getDrivingModeOptions()}
                                </Select>
                              </div>
                              {/* Travel Direction - Away */}
                              <div style={{ color: '#fff' }} className='ml-3 pt-2'>
                                <Label check centric>
                                  <Radio
                                    name='travelDirection'
                                    style={{ cursor: 'pointer' }}
                                    value={TravelDirection.away}
                                    className='mr-2'
                                    checked={stTravelDirection === TravelDirection.away}
                                    onChange={( e ) => { self.updateBufferValue( 'stTravelDirection', e.currentTarget.value ) }}
                                  />
                                  {self.localeString( 'awayFacility' )}
                                </Label>
                              </div>
                              {/* Travel Direction - Toward */}
                              <div style={{ color: '#fff' }} className='ml-3 pt-1'>
                                <Label check centric>
                                  <Radio
                                    name='travelDirection'
                                    style={{ cursor: 'pointer' }}
                                    value={TravelDirection.toward}
                                    className='mr-2'
                                    checked={stTravelDirection === TravelDirection.toward}
                                    onChange={( e ) => { self.updateBufferValue( 'stTravelDirection', e.currentTarget.value ) }}
                                  />
                                  {self.localeString( 'towardFacility' )}
                                </Label>
                              </div>
                              {/* Use Traffic Checkbox */}
                              <div className='pt-3'>
                                <Label check centric>
                                  <Checkbox
                                    style={{ cursor: 'pointer' }}
                                    className='mr-2'
                                    checked={stUseTrafficChecked === true}
                                    onChange={e => {
                                      self.updateBufferValue( 'stUseTrafficChecked', e.target.checked )
                                    }}
                                  />
                                  {self.localeString( 'useTraffic' )}
                                </Label>
                              </div>
                              {/* Traffic Options */}
                              {
                                _useTrafficEnabled && (
                                  <Tabs
                                    className='h-100 pt-2'
                                    type='pills'
                                    fill
                                    defaultValue={TrafficType.live}
                                    value={stTrafficType}
                                    onChange={tt => {
                                      self.updateBufferValue( 'stTrafficType', tt )
                                    }}
                                  >
                                    {/* Traffic Type LIVE */}
                                    <Tab id={TrafficType.live} title={self.localeString( 'liveTraffic' )}>
                                      <div className='traffic-container h-100 pt-2'>
                                        {self.localeString( 'timeOffset' )}
                                        <Select
                                          className='pt-1'
                                          name='offsetTime'
                                          size='sm'
                                          value={stOffsetTime}
                                          onChange={e => {
                                            const n = parseInt( e.currentTarget.value )
                                            self.updateBufferValue( 'stOffsetTime', n )
                                          }}
                                        >
                                          {timeOffsets.map( offset => (
                                            <option key={offset.value} value={offset.value}>
                                              {offset.label}
                                            </option>
                                          ) )}
                                        </Select>
                                      </div>
                                    </Tab>
                                    {/* Traffic Type TYPICAL */}
                                    <Tab id={TrafficType.typical} title={self.localeString( 'typicalTraffic' )}>
                                      <div className='pt-2'>
                                        {/* Traffic Typical OffsetDay */}
                                        {self.localeString( 'day' )}
                                        <Select
                                          className='pt-1'
                                          name='offsetDay'
                                          size='sm'
                                          value={stOffsetDay}
                                          onChange={e => {
                                            self.updateBufferValue( 'stOffsetDay', e.currentTarget.value )
                                          }}
                                        >
                                          {daysOfWeek.map( day => (
                                            <option key={day} value={day}>
                                              {day}
                                            </option>
                                          ) )}
                                        </Select>
                                      </div>

                                      <div className='pt-2'>
                                        {/* Traffic Typical OffsetHr */}
                                        {self.localeString( 'time' )}
                                        <Select
                                          className='pt-1'
                                          name='offsetHr'
                                          size='sm'
                                          value={stOffsetHr}
                                          onChange={e => {
                                            self.updateBufferValue( 'stOffsetHr', e.currentTarget.value )
                                          }}
                                        >
                                          {timeOptions.map( time => (
                                            <option key={time.value} value={time.value}>
                                              {time.label}
                                            </option>
                                          ) )}
                                        </Select>
                                      </div >
                                    </Tab >
                                  </Tabs >
                                )
                              }
                            </div >
                          )
                        }

                        {
                          presetBuffersQueued && (
                            <div css={style} className='mx-2 mt-4'>
                              <SettingRow flow='wrap'>
                                <div className='w-100' ref={self.sidePopperTrigger}>
                                  <Button type='primary' onClick={() => { self.onApplyButtonClicked() }} style={{ width: '100%' }}>{self.localeString( 'applyBtn' )}</Button>
                                </div>
                              </SettingRow>
                            </div >
                          )
                        }
                      </div >
                    </SidePopper >
                  )
                }
              </SettingSection >
              : <SettingSection title={<div className='w-100 d-flex' style={{ height: '23px', flexFlow: 'column wrap', alignContent: 'space-between' }}>
                {/* Workflow Mode */}
                <div className='text-truncate py-1'>
                  {self.localeString( 'buffersLabel' )}
                </ div >
              </div >
              }>
                <SettingRow flow='wrap'>
                  <div className='w-100' ref={self.sidePopperTrigger}>
                    <Button type='primary' disabled={buffersButtonDisabled} onClick={() => { self.toggleSidePopper( 'workflowBufferSidePopper' ) }} style={{ width: '100%' }}>{self.localeString( 'customizeBuffersBtn' )}</Button>
                  </div>
                </SettingRow>

                {/* Workflow Customize Buffers - - - - - - - - - - - - - - - - - - - - - */}

                {
                  workflowBufferSidePopper && (
                    <SidePopper isOpen title={self.localeString( 'customizeBuffersBtn' )} position='right' toggle={() => { self.toggleSidePopper( 'workflowBufferSidePopper' ) }} trigger={self.sidePopperTrigger?.current}>
                      <div className="p-4" style={popperOuterStyle}>
                        {widgetMode === Mode.Workflow && (
                          <React.Fragment>
                            <SettingRow label={
                              <React.Fragment>
                                {self.localeString( 'userConfigBuffers' )}
                                <Button type='tertiary' className='widget-help-btn' icon size='sm' onClick={() => { self.updateState( 'allowBufferInfoIconOpen', !allowBufferInfoIconOpen ) }} onMouseEnter={() => { self.updateState( 'allowBufferInfoIconOpen', true ) }} onMouseLeave={() => { self.updateState( 'allowBufferInfoIconOpen', false ) }} ref={self.userBufferInfoRef as React.RefObject<HTMLButtonElement>} >
                                  <InfoOutlined />
                                  <span className='sr-only'>
                                    {self.localeString( 'userConfigLocationInfo' )}
                                  </span>
                                  <Popper arrowOptions css={popperStyles} open={allowBufferInfoIconOpen} placement='right' offsetOptions={10} reference={self.userBufferInfoRef} toggle={() => { self.updateState( 'allowBufferInfoIconOpen', false ) }} >
                                    <h5>{self.localeString( 'userConfigBuffers' )}</h5>
                                    <p>{self.localeString( 'userConfigLocationInfo' )}</p>
                                  </Popper>
                                </Button>
                              </React.Fragment>
                            }>

                              <Switch className='can-x-switch' data-key='workflowEnableUserConfigBuffers' checked={workflowEnableUserConfigBuffers} onChange={e => { self.onPropertyChange( 'workflowEnableUserConfigBuffers', e.target.checked ) }} />
                            </SettingRow >
                            {
                              workflowEnableUserConfigBuffers &&
                              <React.Fragment>
                                <SettingRow>
                                  <Checkbox style={{ cursor: 'pointer' }} className='mr-2' checked={workflowIntroTextBuffersCheckbox} onChange={e => { self.onPropertyChange( 'workflowIntroTextBuffersCheckbox', e.target.checked ) }} />
                                  {self.localeString( 'introTextCheckbox' )}
                                </SettingRow>
                                <TextArea className='w-100 mt-2' spellCheck={true} height={80} value={workflowIntroTextBuffers} onChange={e => { self.onPropertyChange( 'workflowIntroTextBuffers', e.target.value ) }} />
                              </React.Fragment>
                            }
                            {
                              workflowEnableUserConfigBuffers && (
                                <SettingRow className='mt-6' label={self.localeString( 'defaultSettings' )} />
                              )
                            }
                          </React.Fragment >
                        )
                        }
                        <SettingRow>
                          <Label check centric>
                            {workflowEnableUserConfigBuffers
                              ? <Checkbox style={{ cursor: 'pointer' }} className='mr-2' checked={workflowAvailableBufferRings === true} onChange={e => { self.handleBufferChange( 'workflowAvailableBufferRings', e.target.checked, InfoBufferType.ring ) }} />
                              : <Radio name='workflowBuffer' style={{ cursor: 'pointer' }} className='mr-2' checked={workflowBuffer === InfoBufferType.ring} onChange={e => { self.handleBufferChange( 'workflowBuffer', InfoBufferType.ring, InfoBufferType.ring ) }} />
                            }
                            {self.localeString( 'rings' )}
                          </Label>
                        </SettingRow>
                        <div css={style} className='m-2'>
                          <SettingRow flow='no-wrap' className='w-100 d-flex'>
                            <NumericInput min='0.1' max={MaxBuffers.Rings} showHandlers={false} name='workflowRingsBuffer1' data-key='workflowRingsBuffer1' className='bufferInput' size='sm' value={workflowRingsBuffer1} onChange={( buffer ) => { self.handleBufferChange( 'workflowRingsBuffer1', buffer, 'rings' ) }} />
                            <NumericInput min='0.1' max={MaxBuffers.Rings} showHandlers={false} name='workflowRingsBuffer2' data-key='workflowRingsBuffer2' className='bufferInput mx-1' size='sm' value={workflowRingsBuffer2} onChange={( buffer ) => { self.handleBufferChange( 'workflowRingsBuffer2', buffer, 'rings' ) }} />
                            <NumericInput min='0.1' max={MaxBuffers.Rings} showHandlers={false} name='workflowRingsBuffer3' data-key='workflowRingsBuffer3' className='bufferInput' size='sm' value={workflowRingsBuffer3} onChange={( buffer ) => { self.handleBufferChange( 'workflowRingsBuffer3', buffer, 'rings' ) }} />
                            <Select name='workflowRingsBufferUnit' className='bufferUnits ml-1' size='sm' value={workflowRingsBufferUnit} onChange={( e ) => { self.handleBufferChange( 'workflowRingsBufferUnit', e.currentTarget.value, 'rings' ) }}>
                              <option value='miles'>{self.localeString( 'milesLow' )}</option>
                              <option value='kilometers'>{self.localeString( 'kilometerLow' )}</option>
                            </Select>
                          </SettingRow>
                        </div >
                        <SettingRow>
                          <Label check centric>
                            {workflowEnableUserConfigBuffers
                              ? <Checkbox style={{ cursor: 'pointer' }} className='mr-2' checked={workflowAvailableBufferWalktime === true} onChange={e => { self.handleBufferChange( 'workflowAvailableBufferWalktime', e.target.checked, InfoBufferType.walktime ) }} />
                              : <Radio name='workflowBuffer' style={{ cursor: 'pointer' }} className='mr-2' checked={workflowBuffer === InfoBufferType.walktime} onChange={e => { self.handleBufferChange( 'workflowBuffer', InfoBufferType.walktime, InfoBufferType.walktime ) }} />
                            }
                            {self.localeString( InfoBufferType.walktime )}
                          </Label>
                        </SettingRow>
                        <div css={style} className='m-2'>
                          <SettingRow flow='no-wrap' className='w-100 d-flex mt-2'>
                            <NumericInput min='1' max={maxWalkBuffer} showHandlers={false} name='workflowWalktimeBuffer1' data-key='workflowWalktimeBuffer1' className='bufferInput' size='sm' value={workflowWalktimeBuffer1} onChange={( buffer ) => { self.handleBufferChange( 'workflowWalktimeBuffer1', buffer, InfoBufferType.walktime ) }} />
                            <NumericInput min='1' max={maxWalkBuffer} showHandlers={false} name='workflowWalktimeBuffer2' data-key='workflowWalktimeBuffer2' className='bufferInput mx-1' size='sm' value={workflowWalktimeBuffer2} onChange={( buffer ) => { self.handleBufferChange( 'workflowWalktimeBuffer2', buffer, InfoBufferType.walktime ) }} />
                            <NumericInput min='1' max={maxWalkBuffer} showHandlers={false} name='workflowWalktimeBuffer3' data-key='workflowWalktimeBuffer3' className='bufferInput' size='sm' value={workflowWalktimeBuffer3} onChange={( buffer ) => { self.handleBufferChange( 'workflowWalktimeBuffer3', buffer, InfoBufferType.walktime ) }} />
                            <Select name='workflowWalktimeBufferUnit' className='bufferUnits ml-1' size='sm' value={workflowWalktimeBufferUnit} onChange={( e ) => { self.handleBufferChange( 'workflowWalktimeBufferUnit', e.currentTarget.value, InfoBufferType.walktime ) }}>
                              <option value='minutes'>{self.localeString( 'minuteLow' )}</option>
                              <option value='miles'>{self.localeString( 'milesLow' )}</option>
                              <option value='kilometers'>{self.localeString( 'kilometerLow' )}</option>
                            </Select>
                          </SettingRow>
                        </div >
                        <SettingRow>
                          <Label check centric>
                            {workflowEnableUserConfigBuffers
                              ? <Checkbox style={{ cursor: 'pointer' }} className='mr-2' checked={workflowAvailableBufferDrivetime === true} onChange={e => { self.handleBufferChange( 'workflowAvailableBufferDrivetime', e.target.checked, InfoBufferType.drivetime ) }} />
                              : <Radio name='workflowBuffer' style={{ cursor: 'pointer' }} className='mr-2' checked={workflowBuffer === InfoBufferType.drivetime} onChange={e => { self.handleBufferChange( 'workflowBuffer', InfoBufferType.drivetime, InfoBufferType.drivetime ) }} />
                            }
                            {self.localeString( InfoBufferType.drivetime )}
                          </Label>
                        </SettingRow>
                        <div css={style} className='m-2'>
                          <SettingRow flow='no-wrap' className='w-100 d-flex'>
                            <NumericInput min='1' max={maxDriveBuffer} showHandlers={false} name='workflowDrivetimeBuffer1' data-key='workflowDrivetimeBuffer1' className='bufferInput' size='sm' value={workflowDrivetimeBuffer1} onChange={( buffer ) => { self.handleBufferChange( 'workflowDrivetimeBuffer1', buffer, InfoBufferType.drivetime ) }} />
                            <NumericInput min='1' max={maxDriveBuffer} showHandlers={false} name='workflowDrivetimeBuffer2' data-key='workflowDrivetimeBuffer2' className='bufferInput mx-1' size='sm' value={workflowDrivetimeBuffer2} onChange={( buffer ) => { self.handleBufferChange( 'workflowDrivetimeBuffer2', buffer, InfoBufferType.drivetime ) }} />
                            <NumericInput min='1' max={maxDriveBuffer} showHandlers={false} name='workflowDrivetimeBuffer3' data-key='workflowDrivetimeBuffer3' className='bufferInput' size='sm' value={workflowDrivetimeBuffer3} onChange={( buffer ) => { self.handleBufferChange( 'workflowDrivetimeBuffer3', buffer, InfoBufferType.drivetime ) }} />
                            <Select name='workflowDrivetimeBufferUnit' className='bufferUnits ml-1' size='sm' value={workflowDrivetimeBufferUnit} onChange={( e ) => { self.handleBufferChange( 'workflowDrivetimeBufferUnit', e.currentTarget.value, InfoBufferType.drivetime ) }}>
                              <option value='minutes'>{self.localeString( 'minuteLow' )}</option>
                              <option value='miles'>{self.localeString( 'milesLow' )}</option>
                              <option value='kilometers'>{self.localeString( 'kilometerLow' )}</option>
                            </Select>
                          </SettingRow>
                        </div >
                        <div className='pt-3'>
                          <SettingRow tag='label'>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                              <span>{self.localeString( 'incrementButtonsLabel' )}</span>
                              <Switch
                                className='can-x-switch'
                                style={{ alignSelf: 'flex-end' }}
                                data-key='dynamicHtml'
                                checked={showIncrementButtons}
                                onChange={e => { self.onPropertyChange( 'showIncrementButtons', e.target.checked ) }}
                              />
                            </div >
                          </SettingRow >
                          {/* Workflow DTO toggle - - - - - - - - - - - - - - - - - - - - - */}
                          {
                            ( workflowEnableUserConfigBuffers && workflowAvailableBufferDrivetime ) ||
                              ( !workflowEnableUserConfigBuffers && workflowBuffer === InfoBufferType.drivetime )
                              ? (
                                <SettingRow tag='label'>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                    <span>{self.localeString( 'driveTimeOptions' )}</span>
                                    <Switch
                                      className='can-x-switch'
                                      style={{ alignSelf: 'flex-end' }}
                                      data-key='dynamicHtml'
                                      checked={displayDrivetimeOptions}
                                      onChange={e => { self.onChangeDrivetimeToggle( e.target.checked ) }}
                                    />
                                  </div >
                                </SettingRow >
                              )
                              : null
                          }
                        </div >
                        {/* Workflow Drivetime Options - - - - - - - - - - - - - */}
                        {
                          displayDrivetimeOptions && (
                            ( workflowEnableUserConfigBuffers && workflowAvailableBufferDrivetime ) ||
                            ( !workflowEnableUserConfigBuffers && workflowBuffer === InfoBufferType.drivetime )
                          ) && (
                            <div className='pt-2'>

                              {self.localeString( 'mode' )}
                              <div className='pt-1'>
                                <Select
                                  key={workflowDrivetimeBufferUnit} // For Workflow mode
                                  name='travelModeData'
                                  size='sm'
                                  value={travelModeData?.itemId || travelModeData}
                                  onChange={( e ) => {
                                    // Find the full travel mode object and extract only the travelModeData
                                    const selectedItemId = e.currentTarget.value
                                    const selectedTravelMode = self.state.travelModes.find( m => m.itemId === selectedItemId )
                                    if ( selectedTravelMode ) {
                                      // Store only the travelModeData portion to avoid nested duplication
                                      const travelModeWithId = {
                                        ...selectedTravelMode.travelModeData,
                                        itemId: selectedTravelMode.itemId,
                                        name: selectedTravelMode.name,
                                        description: selectedTravelMode.description
                                      }
                                      // Update both the config and the buffer value to ensure consistency
                                      self.onPropertyChange( 'travelModeData', travelModeWithId )
                                      self.updateBufferValue( 'travelModeData', travelModeWithId )
                                    } else {
                                      // Fallback for string values
                                      self.updateBufferValue( 'travelModeData', selectedItemId )
                                    }
                                  }}
                                >
                                  {this.getDrivingModeOptions()}
                                </Select>
                              </div>
                              <div style={{ color: '#fff' }} className='ml-3 pt-2'>
                                <Label check centric>
                                  <Radio
                                    name='travelDirection'
                                    style={{ cursor: 'pointer' }}
                                    value={TravelDirection.away}
                                    className='mr-2'
                                    checked={travelDirection === TravelDirection.away}
                                    onChange={( e ) => { self.updateBufferValue( 'travelDirection', e.currentTarget.value ) }}
                                  />
                                  {self.localeString( 'awayFacility' )}
                                </Label>
                              </div>
                              <div style={{ color: '#fff' }} className='ml-3 pt-1'>
                                <Label check centric>
                                  <Radio
                                    name='travelDirection'
                                    style={{ cursor: 'pointer' }}
                                    value={TravelDirection.toward}
                                    className='mr-2'
                                    checked={travelDirection === TravelDirection.toward}
                                    onChange={( e ) => { self.updateBufferValue( 'travelDirection', e.currentTarget.value ) }}
                                  />
                                  {self.localeString( 'towardFacility' )}
                                </Label>
                              </div>
                              <div className='pt-3'>
                                <Label check centric>
                                  <Checkbox
                                    style={{ cursor: 'pointer' }}
                                    className='mr-2'
                                    checked={useTrafficChecked === true}
                                    onChange={e => {
                                      self.updateBufferValue( 'useTrafficChecked', e.target.checked )
                                    }}
                                  />
                                  {self.localeString( 'useTraffic' )}
                                </Label>
                              </div>
                              {
                                _useTrafficEnabled && (
                                  <Tabs
                                    className='h-100 pt-2'
                                    type='pills'
                                    fill
                                    defaultValue={TrafficType.live}
                                    value={trafficType}
                                    onChange={selection => {
                                      self.updateBufferValue( 'trafficType', selection )
                                    }}
                                  >
                                    <Tab id={TrafficType.live} title={self.localeString( 'liveTraffic' )}>
                                      <div className='traffic-container h-100 pt-2'>
                                        {self.localeString( 'timeOffset' )}
                                        <Select
                                          className='pt-1'
                                          name='offsetTime'
                                          size='sm'
                                          value={offsetTime}
                                          onChange={e => {
                                            const n = parseInt( e.currentTarget.value )
                                            self.updateBufferValue( 'offsetTime', n )
                                          }}
                                        >
                                          {timeOffsets.map( offset => (
                                            <option key={offset.value} value={offset.value}>
                                              {offset.label}
                                            </option>
                                          ) )}
                                        </Select>
                                      </div>
                                    </Tab>
                                    <Tab id={TrafficType.typical} title={self.localeString( 'typicalTraffic' )}>
                                      <div className='pt-2'>
                                        {self.localeString( 'day' )}
                                        <Select
                                          className='pt-1'
                                          name='offsetDay'
                                          size='sm'
                                          value={offsetDay}
                                          onChange={e => {
                                            self.updateBufferValue( 'offsetDay', e.currentTarget.value )
                                          }}
                                        >
                                          {daysOfWeek.map( day => (
                                            <option key={day} value={day}>
                                              {day}
                                            </option>
                                          ) )}
                                        </Select>
                                      </div>
                                      <div className='pt-2'>

                                        {self.localeString( 'time' )}
                                        <Select
                                          className='pt-1'
                                          name='offsetHr'
                                          size='sm'
                                          value={offsetHr}
                                          onChange={e => {
                                            self.updateBufferValue( 'offsetHr', e.currentTarget.value )
                                          }}
                                        >
                                          {timeOptions.map( time => (
                                            <option key={time.value} value={time.value}>
                                              {time.label}
                                            </option>
                                          ) )}
                                        </Select>
                                      </div >
                                    </Tab >
                                  </Tabs >
                                )
                              }
                            </div >
                          )
                        }

                      </div >
                    </SidePopper >
                  )
                }
              </SettingSection >
          }

          {/* Customize Infographics - - - - - - - - - - - - - - - - - - - - - */}
          {
            widgetMode === Mode.Preset
              ? <SettingSection title={<div className='w-100 d-flex' style={{ height: '23px', flexFlow: 'column wrap', alignContent: 'space-between' }}>
                <div className='text-truncate py-1'>
                  {self.localeString( 'infographics' )}
                </ div >
              </div >}>
                <SettingRow>
                  {presetSelectedReportName
                    ? <Button className='w-100 d-flex selectedStateButton' style={{ flex: '1 1 auto', alignItems: 'stretch' }} onClick={() => { self.toggleSidePopper( 'presetInfographicSidePopper' ) }} >
                      <div className='d-flex' style={{ flex: '0 1 auto', alignItems: 'center' }}>
                        <Icon size='l' icon={ChartColumnOutlined} />
                      </div>
                      <div className='d-flex' style={{ flex: '1 1 auto', textAlign: 'left', justifyContent: 'end', flexDirection: 'column' }}>
                        {presetSelectedReportName}
                      </div>
                    </Button>
                    : <Button type='tertiary' className='unselectedStateButtonDashed' onClick={() => { self.toggleSidePopper( 'presetInfographicSidePopper' ) }} >
                      {self.localeString( 'selectAnInfographic' )}

                    </Button>
                  }
                </SettingRow>
                {
                  !window.jimuConfig.isInPortal &&
                  <div className='pt-2 text-sm-right'>
                    <a href='https://links.esri.com/ba-exb/credits' target='_blank'>{self.localeString( 'creditUsage' )}</a>
                  </div >
                }
                {
                  presetInfographicSidePopper &&
                  <SidePopper isOpen title={self.localeString( 'selectAnInfographic' )} position='right' toggle={() => { self.toggleSidePopper( 'presetInfographicSidePopper' ) }} trigger={self.sidePopperTrigger?.current}>

                    {/* --------------------REPORT LIST SIDE POPPER CONTENT*/}
                    <div className='p-4' style={popperOuterStyle}>
                      <img id={id + '_' + 'loading-infos'} src={require( '../runtime/assets/largeBusy.gif' )} style={infographicsLoadingSpinner}></img>

                      <ArcgisReportList
                        id={id + '_' + 'reports'}
                        env={window.jimuConfig.hostEnv}
                        username={user.username}
                        token={token}
                        geoenrichmentUrl={self.state.geoenrichmentServiceUrl ? self.state.geoenrichmentServiceUrl : null}
                        portalUrl={self.state.portalUrl ? self.state.portalUrl : null}
                        colors={self.stringifyTheme()}
                        selectedReportId={presetSelectedReport}
                        showCheckboxes={false}
                        sourceCountry={sourceCountry}
                        hierarchy={selectedHierarchyObj?.ID}
                        langCode={langCode}
                        style={{ width: '100%', marginTop: '-42px' }}
                        onReportSelected={ev => { self.reportSelectedHandler( ev ) }}
                        onReportChecked={ev => { self.reportCheckedHandler( ev ) }}
                      />
                    </div>
                  </SidePopper>
                }
              </SettingSection >
              : <SettingSection title={<div className='w-100 d-flex' style={{ height: '23px', flexFlow: 'column wrap', alignContent: 'space-between' }}>
                <div className='text-truncate py-1'>
                  {self.localeString( 'infographics' )}
                </ div >
              </div >
              }>
                <SettingRow>
                  <Button type='primary' onClick={() => { self.toggleSidePopper( 'workflowInfographicSidePopper' ) }} style={{ width: '100%' }}>
                    {self.localeString( 'customizeInfographicsBtn' )}
                  </Button>
                </SettingRow>
                {
                  !window.jimuConfig.isInPortal &&
                  <div className='pt-2 text-sm-right'>
                    <a href='https://links.esri.com/ba-exb/credits' target='_blank'>{self.localeString( 'creditUsage' )}</a>
                  </div >
                }
                {
                  workflowInfographicSidePopper && (
                    <SidePopper isOpen title={widgetMode === Mode.Workflow ? self.localeString( 'customizeInfographicsBtn' ) : self.localeString( 'selectAnInfographic' )} position='right' toggle={() => { self.toggleSidePopper( 'workflowInfographicSidePopper' ) }} trigger={self.sidePopperTrigger?.current}>
                      <div css={getStyle( theme )}>
                        {/* --------------------REPORT LIST SIDE POPPER CONTENT*/}
                        <div className='p-4' style={popperOuterStyle}>
                          <SettingRow label={
                            <React.Fragment>
                              {self.localeString( 'allowInfographicChoice' )}
                              <Button type='tertiary' className='widget-help-btn' icon size='sm' onClick={() => { self.updateState( 'allowInfographicChoiceIconOpen', !allowInfographicChoiceIconOpen ) }} onMouseEnter={() => { self.updateState( 'allowInfographicChoiceIconOpen', true ) }} onMouseLeave={() => { self.updateState( 'allowInfographicChoiceIconOpen', false ) }} ref={self.allowSearchInfoRef as React.RefObject<HTMLButtonElement>} >
                                <InfoOutlined />
                                <span className='sr-only'>
                                  {self.localeString( 'allowRuntimeReportInfo' )}
                                </span>
                                <Popper arrowOptions css={popperStyles} open={allowInfographicChoiceIconOpen} placement='right' offsetOptions={10} reference={self.allowSearchInfoRef} toggle={() => { self.updateState( 'allowInfographicChoiceIconOpen', false ) }} >
                                  <h5>{self.localeString( 'allowInfographicChoice' )}</h5>
                                  <p>{self.localeString( 'allowInfographicInfo' )}</p>

                                </Popper>
                              </Button>
                            </React.Fragment>
                          }>
                            <Switch className='can-x-switch' data-key='workflowEnableInfographicChoice' checked={workflowEnableInfographicChoice} onChange={e => { self.onToggleInfographicChoice( e.target.checked ) }} />
                          </SettingRow >
                          {/*TODO: change to report list string*/}
                          {workflowEnableInfographicChoice ? self.localeString( 'allowInfographicChoiceDesc' ) : self.localeString( 'selectAnInfographic' )}
                          {
                            workflowEnableInfographicChoice &&
                            <React.Fragment>
                              <SettingRow>
                                <Checkbox style={{ cursor: 'pointer' }} className='mr-2' checked={workflowIntroTextReportCheckbox} onChange={e => { self.onPropertyChange( 'workflowIntroTextReportCheckbox', e.target.checked ) }} />
                                {self.localeString( 'introTextCheckbox' )}
                              </SettingRow>
                              <TextArea className='w-100 mt-2' spellCheck={true} height={80} value={workflowIntroTextReports} onChange={e => { self.onPropertyChange( 'workflowIntroTextReports', e.target.value ) }} />
                            </React.Fragment>
                          }
                          <SettingRow className='mt-6 pb-2' label={self.localeString( 'selectInfographics' )} />
                          <img id={id + '_' + 'loading-infos'} src={require( '../runtime/assets/largeBusy.gif' )} style={infographicsLoadingSpinner}></img>
                          {
                            workflowEnableInfographicChoice
                              ? (
                                <ArcgisReportList
                                  id={id + '_' + 'wf-reports'}
                                  env={window.jimuConfig.hostEnv}
                                  geoenrichmentUrl={self.state.geoenrichmentServiceUrl ? self.state.geoenrichmentServiceUrl : null}
                                  portalUrl={self.state.portalUrl ? self.state.portalUrl : null}
                                  username={user.username}
                                  token={token}
                                  colors={self.stringifyTheme()}
                                  sourceCountry={sourceCountry}
                                  hierarchy={selectedHierarchyObj?.ID}
                                  langCode={langCode}
                                  showCheckboxes={true}
                                  selectedReportId={workflowSelectedReport}
                                  reportList={JSON.stringify( reportList )}
                                  style={{ width: '100%', marginTop: '-42px' }}
                                  onReportSelected={ev => { self.reportSelectedHandler( ev ) }}
                                  onReportChecked={ev => { self.reportCheckedHandler( ev ) }}
                                  onAccordionInit={ev => { self.accordionInitHandler( ev ) }} />
                              )
                              : (
                                <ArcgisReportList
                                  id={id + '_' + 'wf-reports'}
                                  env={window.jimuConfig.hostEnv}
                                  username={user.username}
                                  token={token}
                                  geoenrichmentUrl={self.state.geoenrichmentServiceUrl ? self.state.geoenrichmentServiceUrl : null}
                                  portalUrl={self.state.portalUrl ? self.state.portalUrl : null}
                                  colors={self.stringifyTheme()}
                                  selectedReportId={workflowSelectedReport}
                                  showCheckboxes={false}
                                  sourceCountry={sourceCountry}
                                  hierarchy={selectedHierarchyObj?.ID}
                                  langCode={langCode}
                                  style={{ width: '100%', marginTop: '-42px' }}
                                  onReportSelected={ev => { self.reportSelectedHandler( ev ) }}
                                  onReportChecked={ev => { self.reportCheckedHandler( ev ) }}
                                />
                              )
                          }

                          {/* Choose Default Infographic */}

                          {
                            workflowEnableInfographicChoice
                              ? (
                                <div>

                                  <SettingRow className='mt-6 pb-2' label={self.localeString( 'defaultInfographic' )} />

                                  {
                                    self.getDefaultReport() !== undefined
                                      ? (
                                        <Button className='w-100 d-flex selectedStateButton' style={{ flex: '1 1 auto', alignItems: 'stretch' }} onClick={( e ) => { onClickSelectDefaultReport( e ) }}>
                                          <div className='d-flex' style={{ flex: '1 1 auto', textAlign: 'center', justifyContent: 'end', flexDirection: 'column' }}>
                                            {self.getDefaultReportLabel()}
                                          </div>

                                          <span className='d-flex justify-content-center' style={{ margin: 'auto 0', alignItems: 'right' }} onClick={( e ) => { onClickClearDefaultReport( e ) }} title={self.localeString( 'clearDefaultInfographic' )}>
                                            <Icon size='s' icon={CloseOutlined} />
                                          </span>
                                        </Button>
                                      )
                                      : (
                                        <Button type='tertiary' className='unselectedStateButtonDashed' onClick={( e ) => { onClickSelectDefaultReport( e ) }}>
                                          {self.getDefaultReportLabel()}
                                        </Button>
                                      )
                                  }
                                  <ArcgisReportList
                                    id={id + '_' + 'def-selected-reports'}
                                    env={window.jimuConfig.hostEnv}
                                    username={user.username}
                                    token={token}
                                    expandOne={true}
                                    geoenrichmentUrl={self.state.geoenrichmentServiceUrl ? self.state.geoenrichmentServiceUrl : null}
                                    portalUrl={self.state.portalUrl ? self.state.portalUrl : null}
                                    colors={self.stringifyTheme()}
                                    showCheckboxes={false}
                                    selectedReportId={workflowSelectedReport}
                                    reportList={JSON.stringify( self._checkedItemsList )}
                                    sourceCountry={sourceCountry}
                                    langCode={langCode}
                                    onReportSelected={ev => { self.onSettingsDefaultReportSelected( ev ) }}
                                    style={{ width: '100%', display: 'none', minHeight: '100px', marginTop: '-32px' }}
                                  />
                                </div > )
                              : ( '' )
                          }
                        </div >
                      </div >
                    </SidePopper >
                  )
                }
              </SettingSection >
          }

          {/* Settings */}
          <SettingSection>
            <SettingCollapse
              label={self.localeString( 'infographicSettings' )}
              isOpen={settingsOpen}
              onRequestOpen={() => {
                self.updateState( 'settingsOpen', true )
              }}
              onRequestClose={() => {
                self.updateState( 'settingsOpen', false )
              }}
            >
              <SettingRow flow='no-wrap' className='mt-4' label={self.localeString( 'viewMode' )}>
                <Select className='w-50' name='viewMode' size='sm' value={viewModeValue} onChange={e => { self.handleIgSettingChange( 'viewMode', e.target.value ) }}>
                  <option key={ViewMode.Auto} value={ViewMode.Auto}>{self.localeString( 'autoLayout' )}</option>
                  <option key={ViewMode.Full} value={ViewMode.Full}>{self.localeString( 'fullPages' )}</option>
                  <option key={ViewMode.Stack} value={ViewMode.Stack}>{self.localeString( 'panelsInStack' )}</option>
                  <option key={ViewMode.Slides} value={ViewMode.Slides}>{self.localeString( 'panelsInSlides' )}</option>
                  <option key={ViewMode.StackAll} value={ViewMode.StackAll}>{self.localeString( 'panelsInStackAll' )}</option>
                </Select>
              </SettingRow>
              <SettingRow label={self.localeString( 'backgroundColor' )}>
                <ColorPicker
                  style={{ padding: '0' }} width={26} height={14}
                  color={igBackgroundColor}
                  onChange={value => {
                    self.handleIgSettingChange( 'igBackgroundColor', value )
                  }}
                  presetColors={self.presetColors}
                />
              </SettingRow>

              {self.props.config.widgetMode === Mode.Preset &&
                <SettingRow tag='label' label={self.localeString( 'runReportOnClick' )}>
                  <Switch className='can-x-switch' data-key='runReportOnClick'
                    checked={runReportOnClick} onChange={e => {
                      self.handleIgSettingChange( 'runReportOnClick', e.target.checked )
                    }} />
                </SettingRow>
              }

              <SettingRow tag='label' label={self.localeString( 'displayHeader' )}>
                <Switch className='can-x-switch' data-key='displayHeader' checked={displayHeader}
                  onChange={e => {
                    self.handleIgSettingChange( 'displayHeader', e.target.checked )
                  }} />
              </SettingRow>
              {
                displayHeader && (
                  <React.Fragment>

                    <SettingRow label={self.localeString( 'headerColor' )}>
                      <ColorPicker
                        style={{ padding: '0' }} width={26} height={14} disableAlpha
                        color={headerColor}
                        onChange={value => {
                          self.handleIgSettingChange( 'headerColor', value )
                        }}
                        presetColors={self.presetColors}
                      />
                    </SettingRow>
                    <SettingRow label={self.localeString( 'headerTextColor' )}>
                      <ColorPicker
                        style={{ padding: '0' }} width={26} height={14} disableAlpha
                        color={headerTextColor}
                        onChange={value => {
                          self.handleIgSettingChange( 'headerTextColor', value )
                        }}
                        presetColors={self.presetColors}
                      />
                    </SettingRow>
                    <SettingRow tag='label' label={self.localeString( 'imageExport' )}>
                      <Switch className='can-x-switch' data-key='imageExport'
                        checked={imageExport} onChange={e => {
                          self.handleIgSettingChange( 'imageExport', e.target.checked )
                        }} />
                    </SettingRow>
                    <SettingRow tag='label' label={self.localeString( 'dynamicHtml' )}>
                      <Switch className='can-x-switch' data-key='dynamicHtml'
                        checked={dynamicHtml} onChange={e => {
                          self.handleIgSettingChange( 'dynamicHtml', e.target.checked )
                        }} />
                    </SettingRow>
                    <SettingRow tag='label' label={self.localeString( 'excel' )}>
                      <Switch className='can-x-switch' data-key='excel' checked={excel}
                        onChange={e => {
                          self.handleIgSettingChange( 'excel', e.target.checked )
                        }} />
                    </SettingRow>
                    <SettingRow tag='label' label={self.localeString( 'pdf' )}>
                      <Switch className='can-x-switch' data-key='pdf' checked={pdf}
                        onChange={e => {
                          self.handleIgSettingChange( 'pdf', e.target.checked )
                        }} />
                    </SettingRow>
                    {
                      widgetMode === Mode.Preset && (
                        <SettingRow tag='label' label={self.localeString( 'fullscreen' )}>
                          <Switch className='can-x-switch' data-key='fullscreen' checked={fullscreen} onChange={e => { self.handleIgSettingChange( 'fullscreen', e.target.checked ) }} />
                        </SettingRow>
                      )
                    }
                    {
                      self.props.config.viewMode && self.props.config.viewMode !== 'slides' && (
                        <SettingRow tag='label' label={self.localeString( 'zoomLevel' )}>
                          <Switch className='can-x-switch' data-key='zoomLevel' checked={zoomLevel} onChange={e => { self.handleIgSettingChange( 'zoomLevel', e.target.checked ) }} />
                        </SettingRow>
                      )}
                  </React.Fragment>
                )
              }
            </SettingCollapse >
          </SettingSection >
          <SettingSection title={<div className='w-100 d-flex' style={{ height: '23px', flexFlow: 'column wrap', alignContent: 'space-between' }}>
            <div className='text-truncate py-1'>
              {self.localeString( 'geoEnrichment' )}
            </ div >
          </div >
          }>
            <UtilitySelector
              useUtilities={Immutable( self.props.config.geoenrichmentConfig?.useUtility ? [self.props.config.geoenrichmentConfig.useUtility] : [] )}
              onChange={self.onGeoenrichmentUtilityChange}
              showRemove={false}
              closePopupOnSelect
              types={supportedUtilityTypes}
            />
          </SettingSection >
        </div >
      </div >
    )
  }

  _showApplyButton() {
    this.updateState( 'presetBuffersQueued', true )
  }

  _hideApplyButton() {
    this.updateState( 'presetBuffersQueued', false )
  }

  onApplyButtonClicked() {
    // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
    const self = this
    requestAnimationFrame( () => {
      self.onPropertyChange( 'syncBufferSettings', true )
      self.applyPresetDto()
      self.applyPresetBuffers()
      self._hideApplyButton()
    } )
  }
}
