/** @jsx jsx */
/* eslint-disable no-prototype-builtins */
import {
  type AllWidgetProps,
  BaseWidget,
  jsx,
  DataSourceManager,
  css,
  type IMThemeVariables,
  type SerializedStyles,
  lodash,
  Immutable,
  defaultMessages as jimuCoreMessages,
  getAppStore,
  SessionManager,
  urlUtils,
  DataSourceTypes,
  DataSourceComponent
} from 'jimu-core'
import {
  Button,
  Input,
  ListGroup,
  Icon,
  InputGroup,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Popper,
  Checkbox,
  Col,
  FormGroup,
  Label,
  Alert,
  Select,
  Table,
  Pagination,
  TextInput,
  TextArea,
  Tooltip,
  Switch,
  defaultMessages as jimuUIDefaultMessages,
  WidgetPlaceholder,
  type FlipOptions,
  Paper
} from 'jimu-ui'
import type { IMConfig } from '../config'
import './css/custom.css'
import GDBVersionManager from './branch-version-manager'
import defaultMessages from './translations/default'
const refreshIcon = require('jimu-ui/lib/icons/reset.svg')
const newVersionIcon = require('jimu-ui/lib/icons/add-8.svg')
const addFieldIcon = require('jimu-ui/lib/icons/row.svg')
const sortDownIcon = require('jimu-ui/lib/icons/sort-down.svg')
const sortUpIcon = require('jimu-ui/lib/icons/sort-up.svg')
const editIcon = require('jimu-ui/lib/icons/edit.svg')
const lockIcon = require('jimu-ui/lib/icons/shared-no-one.svg')
const upArrowIcon = require('jimu-ui/lib/icons/arrow-up-12.svg')
const downArrowIcon = require('jimu-ui/lib/icons/arrow-down-12.svg')
const activeIcon = require('jimu-ui/lib/icons/default-user.svg')
const notActiveIcon = require('jimu-ui/lib/icons/design-mode-close.svg')
const pathIconImage = require('../assets/icons/icon.svg')

const FallbackFlipOptions: FlipOptions = {
  fallbackPlacements: ['top', 'left', 'right'],
  fallbackStrategy: 'bestFit'
}

export default class Widget extends BaseWidget<AllWidgetProps<IMConfig>, any> {
  constructor (props) {
    super(props)

    this.state = {
      isReady: false,
      isSimpleMode: this.props.config.versionConfig.hasOwnProperty(
        'arrangement'
      )
        ? this.props.config.versionConfig.arrangement === 'simple'
        : false,
      isModeExpand: this.props.config.versionConfig.hasOwnProperty('expandMode')
        ? this.props.config.versionConfig.expandMode
        : true,
      showMgmtTools: false,
      showVersionSettingsModal: false,
      showDeleteModal: false,
      showUpdateModal: false,
      showCreationAlert: false,
      showDeleteAlert: false,
      showServiceSelector: false,
      showFieldMgmt: false,
      creationAlertMsg: '',
      deleteAlertMsg: '',
      invalidVersionName: false,
      disableSave: false,
      dsList: [],
      vmsServices: [],
      versionList: [],
      filteredVersionList: [],

      configObj: Immutable.asMutable(
        Immutable(this.props.config.versionConfig),
        { deep: true }
      ),

      selectedService: '',
      selectedVersion: 'sde.DEFAULT',
      selectedVersionInfo: '',
      versionAction: 'create',
      versionObject: {
        versionName: '',
        versionDescription: '',
        versionScope: 'public',
        versionOwner: '',
        versionGuid: ''
      },
      versionOwnerSnapshot: '',
      portalUsers: [],
      userSearchValue: '',
      searchVersionValue: '',
      autoSwitchVersion: false,
      maxDisplayRows: 5,
      currentDisplayIndex: 0,
      fieldColumns: [],
      timeStamp: '',
      sort: { field: '', direction: '' },
      urlStartUpVersion: ''
    }
  }

  defaultVersion: string = 'sde.DEFAULT'
  refreshInterval: number = 1
  refreshHandler: any = null
  vms: GDBVersionManager = GDBVersionManager.getInstance()
  widRefForPopper = this.props.widgetId + 'divSimpleContainer'
  delayClickPrevent: number = new Date().getTime()

  componentWillMount () {
    const configItem = Immutable.asMutable(Immutable(this.state.configObj), {
      deep: true
    })
    configItem.services.forEach((s: any) => {
      s.configuredSettings.persistVersion = s.configuredSettings.startupVersion
    })
    this.setState({ configObj: configItem })
  }

  componentDidMount () {
    const { config } = this.props
    //this._populateSwitchableSources('runtime')
    if (config.versionConfig?.services.length > 0) {
      const queryObject = getAppStore().getState().queryObject
      if (queryObject) {
        if (queryObject?.data_version) {
          const urlVerStringList = queryObject.data_version
          const urlVerList = urlVerStringList.split(',')
          urlVerList.forEach((ver) => {
            const delimiter = ':'
            const parts = ver.split(delimiter)
            parts.shift()
            const versionPart = parts.join(delimiter)
            this.setState({ urlStartUpVersion: versionPart })
          })
        }
      }
    }
    const mapViews = this._getMapViews()
    if (Object.keys(mapViews).length > 0) {
      for (const key in mapViews) {
        this._createChildDatasources(mapViews[key].dataSourceId)
      }
    }
  }

  componentWillUnmount () {
    if (this.refreshHandler !== null) {
      clearInterval(this.refreshHandler)
    }
  }

  componentDidUpdate (preProps, preState) {
    const { config } = this.props
    const mapViews = this._getMapViews()
    if (Object.keys(mapViews).length > 0) {
      for (const key in mapViews) {
        this._createChildDatasources(mapViews[key].dataSourceId)
      }
    }

    if (window.jimuConfig.isInBuilder) {
      //if in builder, switching simple/advanced updates the widget in the canvas
      if (this.props.hasOwnProperty('useDataSources')) {
        if (this.state.dsList.length <= 0) {
          //populate dslist because it is not saved yet and user is in live view
          this._populateSwitchableSources('builder')
        }
      }
      if (config.versionConfig.hasOwnProperty('arrangement')) {
        if (
          preProps.config.versionConfig.arrangement !==
          config.versionConfig.arrangement
        ) {
          if (config.versionConfig.arrangement !== 'simple') {
            this.setState({ isSimpleMode: false })
          } else {
            this.setState({ isSimpleMode: true })
          }
        }
      }
      if (config.versionConfig.hasOwnProperty('expandMode')) {
        if (
          preProps.config.versionConfig.expandMode !==
          config.versionConfig.expandMode
        ) {
          if (config.versionConfig.expandMode) {
            this.setState({ isModeExpand: true })
          } else {
            this.setState({ isModeExpand: false })
          }
        }
      }
      if (config.versionConfig.hasOwnProperty('services')) {
        if (
          preProps.config.versionConfig.services.length !==
          config.versionConfig.services.length
        ) {
          if (config.versionConfig.services.length > 0) {
            this.setState({ configObj: config.versionConfig }, () => {
              this.setState(
                {
                  selectedService: config.versionConfig.services[0].name,
                  vmsServices: config.versionConfig.services
                },
                () => {
                  this._filterRuntimeFields()
                  this.pullVersions(this.state.selectedService, false).then(
                    () => {
                      const foundVersion = this.state.versionList.filter(
                        (vl: any) => {
                          let startupVersion = config.versionConfig.services[0].configuredSettings.startupVersion
                          if (this.state.urlStartUpVersion !== '') {
                            startupVersion = this.state.urlStartUpVersion
                          }
                          return (
                            vl.versionName === startupVersion || vl.versionGuid === startupVersion
                          )
                        }
                      )
                      if (foundVersion.length > 0) {
                        this.setState({ selectedVersion: foundVersion[0] })
                      }
                    }
                  )
                }
              )
            })
          } else {
            this.setState({
              configObj: config.versionConfig,
              selectedService: ''
            })
          }
        }
      }
      //if changing the page count, update and pull versions again in case page counts change.
      if (config.versionConfig.hasOwnProperty('pageCounter')) {
        if (
          preProps.config.versionConfig.pageCounter !==
          config.versionConfig.pageCounter
        ) {
          this.setState(
            { maxDisplayRows: parseInt(config.versionConfig.pageCounter) },
            () => {
              this.pullVersions(this.state.selectedService, false)
            }
          )
        }
      }
      //if fields or alowances changed in settings, re-render widget with new changes.
      if (config.versionConfig.hasOwnProperty('services')) {
        if (config.versionConfig.services.length > 0) {
          if (this.state.selectedService !== '') {
            const preService = preProps.config.versionConfig.services.filter(
              (pS: any) => {
                return pS.activeInBuilder === true
              }
            )
            const curService = config.versionConfig.services.filter(
              (s: any) => {
                return s.activeInBuilder === true
              }
            )
            if (!lodash.isDeepEqual(
              preProps.config.versionConfig.services[0].name,
              config.versionConfig.services[0].name
            )) {
              this.forceUpdate()
            }

            if (preService.length > 0 && curService.length > 0) {
              if (
                !lodash.isDeepEqual(
                  preService[0].configuredSettings.displayInfo,
                  curService[0].configuredSettings.displayInfo
                )
              ) {
                this.setState({ configObj: config.versionConfig }, () => {
                  this._filterRuntimeFields()
                })
              }
              if (
                !lodash.isDeepEqual(
                  preService[0].configuredSettings.allowance,
                  curService[0].configuredSettings.allowance
                )
              ) {
                this.setState({ configObj: config.versionConfig })
              }
              if (
                !lodash.isDeepEqual(
                  preService[0].configuredSettings.startupVersion,
                  curService[0].configuredSettings.startupVersion
                )
              ) {
                this.pullVersions(this.state.selectedService, false).then(
                  () => {
                    const foundVersion = this.state.versionList.filter(
                      (vl: any) => {
                        let startupVersion = curService[0].configuredSettings.startupVersion
                        if (this.state.urlStartUpVersion !== '') {
                          startupVersion = this.state.urlStartUpVersion
                        }
                        return (
                          vl.versionName === startupVersion || vl.versionGuid === startupVersion
                        )
                      }
                    )
                    if (foundVersion.length > 0) {
                      this.setState(
                        { selectedVersion: foundVersion[0] },
                        () => {
                          this.switchVersion(foundVersion[0])
                        }
                      )
                    }
                  }
                )
              }
              //this.setState({ selectedService: curService[0].name })
            }
          }
        }
      }
    }
  }

  _getMapViews = () => {
    return getAppStore().getState().jimuMapViewsInfo
  }

  _createChildDatasources = async (dsId: string) => {
    const ds = DataSourceManager.getInstance()
    const mapDS = ds.getDataSource(dsId)
    if (mapDS.isDataSourceSet() && !mapDS.areChildDataSourcesCreated()) {
      await mapDS.childDataSourcesReady()
      this._populateSwitchableSources(null)
    }
  }

  _populateSwitchableSources = (status: string) => {
    if (this.props.useDataSources) {
      if (this.props.useDataSources.length > 0) {
        const ds = DataSourceManager.getInstance()
        const dsList = ds.getDataSources()
        this.setState({ dsList: dsList }, () => {
          //initial load form configuration
          if (status === 'runtime') {
            this.loadConfig()
          }
        })
      } else {
        //this.setState({ isReady: true })
      }
    } else {
      //this.setState({ isReady: true })
    }
  }

  _refreshHandler = () => {
    if (this.state.selectedService !== '') {
      this.pullVersions(this.state.selectedService, false).then(() => {
        if (this.state.searchVersionValue !== '') {
          this.searchVersions(this.state.searchVersionValue)
        } else {
          if (this.state.sort.field !== '') {
            this.sortVersions(this.state.sort.field, this.state.sort.direction)
          }
        }
      })
    }
  }

  loadConfig = () => {
    const configItem = this.state.configObj
    let vmsList = []
    let lookupSelectedService = ''
    vmsList = configItem.services
    if (vmsList.length > 0) {
      lookupSelectedService = configItem.services[0].name

      this.setState(
        {
          isReady: true,
          showServiceSelector: true,
          vmsServices: vmsList,
          maxDisplayRows: parseInt(configItem.pageCounter),
          selectedService: lookupSelectedService
        },
        () => {
          if (this.state.selectedService !== '') {
            this._filterRuntimeFields()
            this.pullVersions(this.state.selectedService, true)
          }
        }
      )
    }
  }

  render () {
    const { theme } = this.props
    if (this.props.config.versionConfig.services.length <= 0) {
      return (
        <WidgetPlaceholder
          icon={pathIconImage}
          widgetId={this.props.id}
          name={this.formatMessage('_widgetLabel')}
          css={css`height: ${this.props.autoHeight ? '75px' : '100%'}; width: ${this.props.autoWidth ? '350px' : '100%'};`}
        />
      )
    }

    let isOpen = true
    const widState = getAppStore().getState().widgetsRuntimeInfo
    if (widState.hasOwnProperty(this.props.widgetId)) {
      if (widState[this.props.widgetId].hasOwnProperty('state')) {
        if (widState[this.props.widgetId].state === 'OPENED') {
          isOpen = true
        } else {
          isOpen = false
        }
      }
    }
    return (
      <Paper
        className="gdb-version-management jimu-widget display-flex-column-1 overflow-auto"
        shape="none"
        style={{
          backgroundColor: theme.sys.color.surface.paper,
          height: '100%',
          padding: 10
        }}
        css={this.getStyle(this.props.theme)}
      >
        {this.state.isReady === false && <DataSourceComponent
        useDataSource={this.props.useDataSources && this.props.useDataSources[0]}
        onAllChildDataSourcesCreated={() => {
          setTimeout(async () => {
            const mapViews = this._getMapViews()
            if (Object.keys(mapViews).length > 0) {
              const ds = DataSourceManager.getInstance()
              for (const key in mapViews) {
                const mapDS = ds.getDataSource(mapViews[key].dataSourceId)
                if (mapDS.isDataSourceSet() && !mapDS.areChildDataSourcesCreated()) {
                  await mapDS.childDataSourcesReady()
                }
              }
              setTimeout(() => {
                this._populateSwitchableSources('runtime')
              }, 1000)
            } else {
              this._populateSwitchableSources('runtime')
            }
          }, 1000)
        }}
        widgetId={this.props.id}
        >
        </DataSourceComponent>}

        {this.state.isReady && !this.state.showVersionSettingsModal && <div id={this.widRefForPopper}>{this.renderServiceSelector()}</div>}
        {this.state.showVersionSettingsModal &&
          this.renderVersionModification()}

        <Modal isOpen={this.state.showDeleteModal}>
          <ModalHeader
            toggle={(evt: any) => {
              this.toggleDeleteModal(true)
            }}
          >
            {this.formatMessage('modalheaderDeleteVersion')}
          </ModalHeader>
          <ModalBody>
            <Alert
              form="basic"
              type="warning"
              className="w-100"
              open={this.state.showDeleteAlert}
              text={this.state.deleteAlertMsg}
            ></Alert>
            {this.state.versionObject.hasOwnProperty('version')
              ? this.state.versionObject.version.toLowerCase() !==
                this.defaultVersion.toLowerCase()
                ? this.formatMessage('actionLabelsDelete') +
                ' ' +
                this.state.versionObject.version +
                '?'
                : this.formatMessage('actionLabelsCannotDelete')
              : ''}
          </ModalBody>
          {this.state.versionObject.hasOwnProperty('version')
            ? (
                this.state.versionObject.version.toLowerCase() !==
                this.defaultVersion.toLowerCase()
                  ? (
                  <ModalFooter>
                    <Button type="primary" onClick={this.deleteVersion}>
                      {this.formatMessage('versionmanagementYes')}
                    </Button>{' '}
                    <Button
                      type="secondary"
                      onClick={(evt: any) => {
                        this.toggleDeleteModal(true)
                      }}
                    >
                      {this.formatMessage('versionmanagementNo')}
                    </Button>
                  </ModalFooter>
                    )
                  : (
                      ''
                    )
              )
            : (
                ''
              )}
        </Modal>

        <Modal isOpen={this.state.showUpdateModal}>
          <ModalHeader
            toggle={(evt: any) => {
              this.toggleUpdateModal(true)
            }}
          >
            {this.formatMessage('modalheaderUpdateVersion')}
          </ModalHeader>
          <ModalBody>
            <Alert
              type="warning"
              form="basic"
              className="w-100"
              text={this.formatMessage('actionLabelsCannotDelete')}
            ></Alert>
          </ModalBody>
        </Modal>

        <Popper
          open={isOpen ? this.state.showFieldMgmt : false}
          reference={this.props.widgetId + '_btnFieldMgmt'}
          placement={'left-start'}
          arrowOptions={true}
          zIndex={2001}
        >
          <div
            style={{
              width: '100%',
              height:
                this.state.fieldColumns.length < 5
                  ? 'auto'
                  : this._sizePopperHeight(100),
              overflow: 'auto',
              fontSize: 'medium'
            }}
          >
            {this.renderFieldList()}
          </div>
        </Popper>

      </Paper>
    )
  }

  //********************
  //render subcomponents service selector, table, and render fields
  renderServiceSelector = () => {
    const { theme } = this.props
    const services = []
    const configObj = this.state.configObj
    let defaultVal = ''
    if (configObj !== null) {
      configObj.services.forEach((s: any) => {
        services.push(
          <option key={s.name} value={s.name}>
            {s.name}
          </option>
        )
        if (this.state.selectedService !== '') {
          if (this.state.selectedService === s.name) {
            defaultVal = s.name
          }
        }
      })
    }

    //if (this.state.isSimpleMode === false) {
    const timer = this._getRefreshInterval()
    if (timer > -1) {
      //refresh is being used
      if (this.refreshHandler !== null) {
        clearInterval(this.refreshHandler)
      }
      this.refreshHandler = setInterval(this._refreshHandler, timer)
    }
    //}

    let canEdit = true
    const serviceObj = this._getConfigServiceObject()
    if (serviceObj !== null) {
      const allowanceList = serviceObj.configuredSettings.allowance
      const editFilter = allowanceList.filter((al: any) => {
        return al.key.search(/\bDelete|\bUpdate|\bChange/g) > -1
      })
      canEdit = editFilter.some((eF: any) => {
        return eF.enabled === true
      })
      if (this.props.user === null) {
        canEdit = false
      }
    }

    let isOpen = true
    const widState = getAppStore().getState().widgetsRuntimeInfo
    if (widState.hasOwnProperty(this.props.widgetId)) {
      if (widState[this.props.widgetId].hasOwnProperty('state')) {
        if (widState[this.props.widgetId].state === 'OPENED') {
          isOpen = true
        } else {
          isOpen = false
        }
      }
    }

    let renderObject = (
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          height: '96%'
        }}
      >
        <div style={{ display: 'flex' }}>
          {services.length > 0
            ? (
              <table style={{ width: '100%' }}>
                <tbody>{this._createActiveRows(canEdit)}</tbody>
              </table>
              )
            : (
                this.formatMessage('actionLabelsNoServices')
              )}
        </div>
        {this.state.isModeExpand && (
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div
              style={{
                display: 'flex',
                flex: 1,
                fontWeight: 'bold',
                alignItems: 'center',
                paddingTop: 5,
                paddingBottom: 5
              }}
            >
              {services.length > 1 ? (
                <Select
                  value={defaultVal}
                  onChange={(evt: any) => {
                    this.setState(
                      {
                        selectedService: evt.currentTarget.value,
                        selectedVersion: '',
                        currentDisplayIndex: 0
                      },
                      () => {
                        this._filterRuntimeFields()
                        this.pullVersions(this.state.selectedService, true)
                        if (this.state.isSimpleMode === false) {
                          const timer = this._getRefreshInterval()
                          if (timer > -1) {
                            //refresh is being used
                            if (this.refreshHandler !== null) {
                              clearInterval(this.refreshHandler)
                            }
                            this.refreshHandler = setInterval(
                              this._refreshHandler,
                              timer
                            )
                          }
                        }
                      }
                    )
                  }}
                >
                  {services}
                </Select>
              ) : services.length > 0
                ? (
                  <h6 style={{ fontSize: 'large' }}>
                    {configObj.services[0].name}
                  </h6>
                  )
                : (
                    ''
                  )}
            </div>
          </div>
        )}
        {this.state.isModeExpand &&
          this.state.selectedService &&
          this.renderVersionManagement()}
      </div>
    )

    if (this.state.isSimpleMode) {
      if (this.state.isModeExpand) {
        if (services.length > 0) {
          renderObject = (
            <div
              style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                margin: 0
              }}
            >
              <div
                className="simple-view-header-bgcolor display-flex-row-1 cursor-hand"
                onClick={(evt: any) => {
                  this.setState({ isModeExpand: !this.state.isModeExpand })
                }}
              >
                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    paddingLeft: 10,
                    paddingRight: 10
                  }}
                >
                  {this.state.selectedVersion.hasOwnProperty('isLocked')
                    ? (
                        this.state.selectedVersion.isLocked
                          ? (
                          <Icon
                            icon={lockIcon}
                            size="15"
                            color={theme.sys.color.primary.text}
                          />
                            )
                          : (
                          <div style={{ width: 15, height: 15 }}></div>
                            )
                      )
                    : (
                      <div style={{ width: 15, height: 15 }}></div>
                      )}
                </div>
                <div
                  className="flex-center"
                  style={{
                    paddingLeft: 5,
                    paddingRight: 5,
                    fontWeight: 'bold',
                    fontSize: 'medium'
                  }}
                >
                  {this.formatMessage('simplemodeActiveVersion')}
                </div>
                <div
                  className="flex-center"
                  style={{
                    fontWeight: 'bold',
                    flex: 1,
                    paddingLeft: 5,
                    paddingRight: 5,
                    fontSize: 'medium'
                  }}
                >
                  {' '}
                  {this.state.selectedVersion.versionName}
                </div>
                <div style={{ float: 'right' }}>
                  <Tooltip
                    title={this.formatMessage('tooltipsCollapseSimpleMode')}
                    placement="bottom"
                  >
                    <Button
                      icon
                      onClick={(evt: any) => {
                        this.setState({
                          isModeExpand: !this.state.isModeExpand
                        })
                      }}
                    >
                      <Icon
                        icon={upArrowIcon}
                        size="16"
                        color={theme.sys.color.primary.main}
                      />
                    </Button>
                  </Tooltip>
                </div>
              </div>
              <Popper
                open={isOpen ? this.state.isModeExpand : false}
                keepMount={true}
                reference={this.widRefForPopper}
                placement={'bottom'}
                arrowOptions={true}
                zIndex={2001}
                flipOptions={FallbackFlipOptions}
              >
                <div
                  style={{ display: 'flex', flexDirection: 'row', margin: 5 }}
                >
                  <div style={{ display: 'flex', flex: 1, fontWeight: 'bold' }}>
                    {services.length > 1
                      ? (
                        <Select
                          value={defaultVal}
                          zIndex={2002}
                          placeholder={this.formatMessage(
                            'placeholderSelectService'
                          )}
                          onChange={(evt: any) => {
                            this.setState(
                              {
                                selectedService: evt.currentTarget.value,
                                selectedVersion: '',
                                currentDisplayIndex: 0
                              },
                              () => {
                                this._filterRuntimeFields()
                                this.pullVersions(
                                  this.state.selectedService,
                                  true
                                )
                              }
                            )
                          }}
                        >
                          {services}
                        </Select>
                        )
                      : services.length > 0
                        ? (
                          <h6 style={{ fontSize: 'large' }}>
                            {configObj.services[0].name}
                          </h6>
                          )
                        : (
                            this.formatMessage('actionLabelsNoServices')
                          )}
                  </div>
                </div>
                {this.state.selectedService &&
                  this.renderVersionManagementSimple()}
              </Popper>
            </div>
          )
        } else {
          renderObject = (
            <div
              style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                margin: 0
              }}
            >
              {this.formatMessage('actionLabelsNoServices')}
            </div>
          )
        }
      } else {
        if (services.length > 0) {
          renderObject = (
            <div
              style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                margin: 0
              }}
            >
              <div
                className="simple-view-header-bgcolor display-flex-row-1 cursor-hand"
                onClick={(evt: any) => {
                  this.setState({ isModeExpand: !this.state.isModeExpand })
                }}
              >
                <div
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    paddingLeft: 10,
                    paddingRight: 10
                  }}
                >
                  {this.state.selectedVersion.hasOwnProperty('isLocked')
                    ? (
                        this.state.selectedVersion.isLocked
                          ? (
                          <Icon
                            icon={lockIcon}
                            size="15"
                            color={theme.sys.color.primary.text}
                          />
                            )
                          : (
                          <div style={{ width: 15, height: 15 }}></div>
                            )
                      )
                    : (
                      <div style={{ width: 15, height: 15 }}></div>
                      )}
                </div>
                <div
                  className="flex-center"
                  style={{
                    paddingLeft: 5,
                    paddingRight: 5,
                    fontWeight: 'bold',
                    fontSize: 'medium'
                  }}
                >
                  {/* eslint-disable-next-line eqeqeq*/}
                  {this.state.selectedVersion != ""
                    ? this.formatMessage('simplemodeActiveVersion')
                    : this.formatMessage('simplemodeLoadingWait')}
                </div>
                <div
                  className="flex-center"
                  style={{
                    fontWeight: 'bold',
                    flex: 1,
                    paddingLeft: 5,
                    paddingRight: 5,
                    fontSize: 'medium'
                  }}
                >
                  {' '}
                  {this.state.selectedVersion.versionName}
                </div>
                <div
                  style={{
                    justifyItems: 'flex-end',
                    alignItems: 'center',
                    display: 'flex'
                  }}
                >
                  {/* eslint-disable-next-line eqeqeq*/}
                  {this.state.selectedVersion != "" ? (
                    <Tooltip
                      title={this.formatMessage('tooltipsExpandSimpleMode')}
                      placement="bottom"
                    >
                      <Button
                        icon
                        onClick={(evt: any) => {
                          this.setState({
                            isModeExpand: !this.state.isModeExpand
                          })
                        }}
                      >
                        <Icon
                          icon={downArrowIcon}
                          size="16"
                          color={theme.sys.color.primary.main}
                        />
                      </Button>
                    </Tooltip>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </div>
          )
        } else {
          renderObject = (
            <div
              style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'column',
                margin: 0
              }}
            >
              {this.formatMessage('actionLabelsNoServices')}
            </div>
          )
        }
      }
    }

    return renderObject
  }

  renderVersionManagement = () => {
    const { theme } = this.props
    let showFieldsBtn = true
    let canCreate = true
    let canEdit = true
    let canSwitch = true
    let validToken = true
    const configObj = this._getConfigServiceObject()
    if (configObj !== null) {
      const hasToken = this.getServiceToken(configObj.url)
      if (hasToken !== null) {
        validToken = true
      } else {
        validToken = false
      }
      const allowanceList = configObj.configuredSettings.allowance
      const createFilter = allowanceList.filter((al: any) => {
        return al.key === 'CreateNew'
      })
      if (createFilter.length > 0) {
        canCreate = createFilter[0].enabled
      }
      //check if there is a logged on user, if not, no creation
      if (!validToken) {
        canCreate = false
      }
      const editFilter = allowanceList.filter((al: any) => {
        return al.key.search(/\bDelete|\bUpdate|\bChange/g) > -1
      })
      canEdit = editFilter.some((eF: any) => {
        return eF.enabled === true
      })
      if (!validToken) {
        canEdit = false
      }
      const switchFilter = allowanceList.filter((al: any) => {
        return al.key === 'Switch'
      })
      if (switchFilter.length > 0) {
        canSwitch = switchFilter[0].enabled
      }
      const fieldList = configObj.configuredSettings.displayInfo
      if (fieldList.length > 0) {
        const fieldsDefined = fieldList.filter((lf: any) => {
          return lf.show === true || lf.available === true
        })
        showFieldsBtn = fieldsDefined.length > 1
      }
    }
    let numberOfVersions = this.state.versionList.length
    if (numberOfVersions === 0) {
      if (this.state.searchVersionValue === '') {
        numberOfVersions = 1
      }
    }

    return (
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          height: '60%'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          {validToken
            ? canCreate
              ? this.state.showMgmtTools && (
                <div style={{ flex: 1, flexDirection: 'row' }}>
                  <Tooltip
                    title={this.formatMessage('tooltipsNewVersion')}
                    placement="bottom"
                  >
                    <Button
                      icon
                      onClick={(evt: any) => {
                        this.resetVersionObjectData()
                      }}
                      type='primary'
                    >
                      <Icon
                        icon={newVersionIcon}
                        size="18"
                        color={theme.sys.color.primary.text}
                      />
                    </Button>
                  </Tooltip>
                </div>
              )
              : ''
            : ''}
          {validToken && canCreate && <div style={{ width: '1%' }}></div>}
          <div style={{ flex: 1, flexDirection: 'row' }}>
            <Tooltip
              title={this.formatMessage('tooltipsRefreshList')}
              placement="bottom"
            >
              <Button
                icon
                onClick={() => {
                  this.pullVersions(this.state.selectedService, false).then(
                    () => {
                      if (this.state.searchVersionValue !== '') {
                        this.searchVersions(this.state.searchVersionValue)
                      } else {
                        if (this.state.sort.field !== '') {
                          this.sortVersions(
                            this.state.sort.field,
                            this.state.sort.direction
                          )
                        }
                      }
                    }
                  )
                }}
              >
                <Icon icon={refreshIcon} size="18" color={theme.sys.color.primary.main} />
              </Button>
            </Tooltip>
          </div>
          <div style={{ width: '1%' }}></div>
          <InputGroup>
            <TextInput
              type="text"
              placeholder={this.formatMessage('placeholderSearchName')}
              value={this.state.searchVersionValue}
              onChange={(evt: any) => { this.searchVersions(evt.currentTarget.value) }
              }
              style={{ display: 'flex', flex: 1 }}
            />
          </InputGroup>
          {showFieldsBtn && <div style={{ width: '1%' }}></div>}
          {showFieldsBtn && (
            <div style={{ flex: 1, flexDirection: 'row' }}>
              <Tooltip
                title={this.formatMessage('tooltipsShowHideColumns')}
                placement="bottom"
              >
                <Button
                  id={this.props.widgetId + '_btnFieldMgmt'}
                  icon
                  onClick={() => {
                    this.toggleDialogAction('fieldMgmt', 'showFieldMgmt')
                  }}
                >
                  <Icon
                    icon={addFieldIcon}
                    size="18"
                    color={theme.sys.color.primary.main}
                  />
                </Button>
              </Tooltip>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            flex: 2,
            flexDirection: 'row',
            paddingTop: 10,
            height: '60%'
          }}
        >
          <div style={{ display: 'flex', flex: 1, overflow: 'auto' }}>
            <Table>
              {this._createVersionHeader(canEdit, canSwitch)}
              <tbody>
                {this.state.filteredVersionList.length > 0
                  ? (
                      this._createVersionRows(canEdit, canSwitch)
                    )
                  : this.state.searchVersionValue !== ''
                    ? (
                      <tr>
                        <td colSpan={99}>
                          {this.formatMessage('actionLabelsNoVersions')}
                        </td>
                      </tr>
                      )
                    : this.state.selectedVersion.hasOwnProperty('versionGuid')
                      ? (
                          this._createVersionRows(canEdit, canSwitch)
                        )
                      : (
                        <tr>
                          <td colSpan={99}></td>
                        </tr>
                        )}
              </tbody>
            </Table>
          </div>
        </div>
        <div
          style={{
            paddingTop: 5,
            display: 'flex',
            flexDirection: 'row',
            borderTop: '3px solid' + theme.sys.color.primary.main
          }}
        >
          {this.state.filteredVersionList.length > 1 && (
            <div
              style={{ display: 'flex', flex: 1, justifyContent: 'flex-start' }}
            >
              <Pagination
                className="mb-4"
                size="lg"
                totalPage={this.state.filteredVersionList.length}
                current={this.state.currentDisplayIndex + 1}
                onChangePage={(evt: number) => {
                  this.setState({ currentDisplayIndex: evt - 1 }, () => {
                    this._checkStatus()
                  })
                }}
              />
            </div>
          )}
          <div
            style={{
              display: 'flex',
              flex: 1,
              justifyContent:
                this.state.filteredVersionList.length > 1
                  ? 'flex-end'
                  : 'flex-start',
              fontSize: 'small'
            }}
          >
            {this.formatMessage('placeholderLastUpdated')}{' '}
            {this.state.timeStamp} <br />{' '}
            {this.formatMessage('placeholderNumberVersions')}{' '}
            {numberOfVersions.toLocaleString()}
          </div>
        </div>
      </div>
    )
  }

  renderVersionManagementSimple = () => {
    const { theme } = this.props
    let canSwitch = true
    const configObj = this._getConfigServiceObject()
    if (configObj !== null) {
      const allowanceList = configObj.configuredSettings.allowance
      const switchFilter = allowanceList.filter((al: any) => {
        return al.key === 'Switch'
      })
      if (switchFilter.length > 0) {
        canSwitch = switchFilter[0].enabled
      }
    }
    let numberOfVersions = this.state.versionList.length
    if (numberOfVersions === 0) {
      if (this.state.searchVersionValue === '') {
        numberOfVersions = 1
      }
    }
    return (
      <div
        style={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          marginLeft: 5,
          marginRight: 5,
          marginBottom: 5
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ flex: 1, flexDirection: 'row' }}>
            <Tooltip
              title={this.formatMessage('tooltipsRefreshList')}
              placement="bottom"
            >
              <Button
                icon
                type="primary"
                onClick={() => {
                  this.pullVersions(this.state.selectedService, false).then(
                    () => {
                      if (this.state.searchVersionValue !== '') {
                        this.searchVersions(this.state.searchVersionValue)
                      } else {
                        if (this.state.sort.field !== '') {
                          this.sortVersions(
                            this.state.sort.field,
                            this.state.sort.direction
                          )
                        }
                      }
                    }
                  )
                }}
              >
                <Icon icon={refreshIcon} size="18" />
              </Button>
            </Tooltip>
          </div>
          <div style={{ width: '1%' }}></div>
          <InputGroup>
            <TextInput
              type="text"
              placeholder={this.formatMessage('placeholderSearchName')}
              value={this.state.searchVersionValue}
              onChange={(evt: any) => { this.searchVersions(evt.currentTarget.value) }
              }
              style={{ display: 'flex', flex: 1 }}
            />
          </InputGroup>
        </div>
        <div style={{ paddingTop: 5, display: 'flex', flexDirection: 'row' }}>
          <table style={{ fontSize: 'medium', paddingTop: 5, width: '100%' }}>
            <tbody>
              {this.state.filteredVersionList.length > 0
                ? (
                    this._createVersionRowsSimple(canSwitch)
                  )
                : this.state.searchVersionValue !== ''
                  ? (
                    <tr>
                      <td colSpan={99}>
                        {this.formatMessage('actionLabelsNoVersions')}
                      </td>
                    </tr>
                    )
                  : this.state.selectedVersion.hasOwnProperty('versionGuid')
                    ? (
                        this._createVersionRowsSimple(canSwitch)
                      )
                    : (
                      <tr>
                        <td colSpan={99}></td>
                      </tr>
                      )}
            </tbody>
          </table>
        </div>
        <div
          style={{
            paddingTop: 5,
            display: 'flex',
            flexDirection: 'column',
            borderTop: '3px solid' + theme.sys.color.primary.main
          }}
        >
          {this.state.filteredVersionList.length > 1 && (
            <div
              style={{ display: 'flex', flex: 1, justifyContent: 'flex-start' }}
            >
              <Pagination
                className="mb-4"
                size="sm"
                totalPage={this.state.filteredVersionList.length}
                current={this.state.currentDisplayIndex + 1}
                onChangePage={(evt: number) => {
                  this.setState({ currentDisplayIndex: evt - 1 }, () => {
                    this._checkStatus()
                  })
                }}
              />
            </div>
          )}
          <div
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'flex-start',
              fontSize: 'small',
              flexDirection: 'column'
            }}
          >
            <div
              style={{ display: 'flex', flex: 1, justifyContent: 'flex-start', flexDirection: 'column' }}
            >
              <div>
                {this.formatMessage('placeholderLastUpdated')}{' '}
                {this.state.timeStamp}
              </div>
              <div>
                {this.formatMessage('placeholderNumberVersionsSimple')}{' '}
                {numberOfVersions.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  _createVersionHeader = (canEdit: boolean, canSwitch: boolean) => {
    const { theme } = this.props
    const headerList = []

    let validToken = true
    const configObj = this._getConfigServiceObject()
    if (configObj !== null) {
      const hasToken = this.getServiceToken(configObj.url)
      if (hasToken !== null) {
        validToken = true
      } else {
        validToken = false
      }
    }

    let localFields = [...this.state.fieldColumns]
    if (!validToken) {
      localFields = localFields.filter((lf: any) => {
        return lf.field === 'versionName' || lf.field === 'versionOwner'
      })
    }

    localFields.sort(this._compare('order', 'desc'))
    localFields.forEach((fld: any) => {
      if (fld.show) {
        headerList.push(
          <th
            key={fld.field}
            style={{
              position: 'sticky',
              top: 0,
              backgroundColor: theme.sys.color.surface.background,
              border: theme.sys.color.surface.backgroundText,
              color: theme.sys.color.surface.backgroundText,
              fontSize: 'medium',
              whiteSpace: 'nowrap',
              alignItems: 'top'
            }}
          >
            {fld.alias}
            <Tooltip
              title={
                fld.sort === 'desc'
                  ? this.formatMessage('tooltipsSortColumns') +
                  ' ' +
                  fld.alias +
                  ' ' +
                  this.formatMessage('tooltipsDesc')
                  : this.formatMessage('tooltipsSortColumns') +
                  ' ' +
                  fld.alias +
                  ' ' +
                  this.formatMessage('tooltipsAsc')
              }
              placement="bottom"
            >
              <Button
                type="tertiary"
                icon
                onClick={() => {
                  this.sortVersions(
                    fld.field,
                    fld.sort === 'desc' ? 'asc' : 'desc'
                  )
                }}
              >
                <Icon
                  icon={fld.sort === 'desc' ? sortDownIcon : sortUpIcon}
                  size="15"
                  color={theme.sys.color.surface.backgroundText}
                />
              </Button>
            </Tooltip>
          </th>
        )
      }
    })
    return (
      <thead>
        <tr>
          {canEdit || canSwitch
            ? (
              <th
                style={{
                  position: 'sticky',
                  top: 0,
                  backgroundColor: theme.sys.color.surface.background,
                  border: theme.sys.color.surface.backgroundText,
                  color: theme.sys.color.surface.backgroundText,
                  fontSize: 'medium',
                  alignItems: 'top',
                  whiteSpace: 'nowrap'
                }}
              >
                {this.formatMessage('otherheadersManage')}
                <Button type="tertiary" icon />
              </th>
              )
            : (
              <th
                style={{
                  position: 'sticky',
                  top: 0,
                  backgroundColor: theme.sys.color.surface.background,
                  border: theme.sys.color.surface.backgroundText,
                  color: theme.sys.color.surface.backgroundText,
                  fontSize: 'medium',
                  alignItems: 'top',
                  whiteSpace: 'nowrap'
                }}
              ></th>
              )}
          {headerList}
        </tr>
      </thead>
    )
  }

  _createActiveRows = (canEdit: boolean) => {
    const { theme } = this.props
    const versionList = []

    let validToken = true
    const configObj = this._getConfigServiceObject()
    if (configObj !== null) {
      const hasToken = this.getServiceToken(configObj.url)
      if (hasToken !== null) {
        validToken = true
      } else {
        validToken = false
      }
    }

    const generateRows = (v: any) => {
      if (typeof v !== 'undefined') {
        const nameStrip = v.versionName
        versionList.push(
          <tr
            key={v.versionName}
            className="simple-view-header-bgcolor cursor-hand"
            onClick={(evt: any) => {
              this.setState({ isModeExpand: !this.state.isModeExpand })
            }}
          >
            <td style={{ paddingLeft: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'row', flex: 1 }}>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ alignItems: 'center', display: 'flex' }}>
                    {v.hasOwnProperty('isLocked')
                      ? (
                          v.isLocked
                            ? (
                            <Icon
                              icon={lockIcon}
                              size="15"
                              color={theme.sys.color.primary.text}
                            />
                              )
                            : (
                            <div style={{ width: 15, height: 15 }}></div>
                              )
                        )
                      : (
                        <div style={{ width: 15, height: 15 }}></div>
                        )}
                  </div>
                  {validToken
                    ? (
                        v.hasOwnProperty('isLocked')
                          ? (
                              v.isLocked === false
                                ? (
                                    canEdit
                                      ? (
                                          v.versionName.toLowerCase() !== 'sde.default'
                                            ? (
                                      <div style={{ paddingLeft: 5 }}>
                                        <Tooltip
                                          title={this.formatMessage(
                                            'tooltipsUpdateVersionInfo'
                                          )}
                                          placement="bottom"
                                        >
                                          <Button
                                            icon
                                            onClick={(evt: any) => {
                                              evt.stopPropagation()
                                              this.setState(
                                                { isModeExpand: true },
                                                () => {
                                                  this.loadExistingVersion(v)
                                                }
                                              )
                                            }}
                                          >
                                            <Icon
                                              icon={editIcon}
                                              size="16"
                                              color={theme.sys.color.primary.main}
                                            />
                                          </Button>
                                        </Tooltip>
                                      </div>
                                              )
                                            : (
                                      <div
                                        style={{
                                          display: 'flex',
                                          flex: 1,
                                          flexDirection: 'row',
                                          paddingLeft: 5
                                        }}
                                      ></div>
                                              )
                                        )
                                      : (
                                  <div
                                    style={{
                                      display: 'flex',
                                      flex: 1,
                                      flexDirection: 'row',
                                      paddingLeft: 5
                                    }}
                                  ></div>
                                        )
                                  )
                                : (
                              <div
                                style={{
                                  display: 'flex',
                                  flex: 1,
                                  flexDirection: 'row',
                                  paddingLeft: 5
                                }}
                              ></div>
                                  )
                            )
                          : (
                          <div
                            style={{
                              display: 'flex',
                              flex: 1,
                              flexDirection: 'row',
                              paddingLeft: 5
                            }}
                          ></div>
                            )
                      )
                    : (
                      <div
                        style={{
                          display: 'flex',
                          flex: 1,
                          flexDirection: 'row',
                          paddingLeft: 5
                        }}
                      ></div>
                      )}
                </div>
                <div
                  style={{
                    color: theme.sys.color.primary.text,
                    fontSize: 'medium',
                    fontWeight: 'bold',
                    wordBreak: 'break-all',
                    paddingLeft: 10,
                    paddingRight: 10,
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {this.formatMessage('simplemodeActiveVersion')} {nameStrip}
                </div>
                <div
                  style={{
                    justifyItems: 'flex-end',
                    alignItems: 'center',
                    display: 'flex'
                  }}
                >
                  {/* eslint-disable-next-line eqeqeq*/}
                  {this.state.selectedVersion != "" ? (
                    <Tooltip
                      title={this.formatMessage('tooltipsExpandSimpleMode')}
                      placement="bottom"
                    >
                      <Button
                        icon
                        onClick={(evt: any) => {
                          this.toggleExpandAction()
                        }}
                      >
                        <Icon
                          icon={
                            this.state.isModeExpand
                              ? upArrowIcon
                              : downArrowIcon
                          }
                          size="16"
                          color={theme.sys.color.primary.main}
                        />
                      </Button>
                    </Tooltip>
                  ) : (
                    ''
                  )}
                </div>
              </div>
            </td>
          </tr>
        )
      }
    }
    //always make the first row the active version
    if (this.state.selectedVersion.hasOwnProperty('versionGuid')) {
      if (this.state.selectedVersion.versionGuid !== '') {
        generateRows(this.state.selectedVersion)
      }
    }
    return versionList
  }

  _createVersionRows = (canEdit: boolean, canSwitch: boolean) => {
    const { theme } = this.props
    const versionList = []

    let validToken = true
    const configObj = this._getConfigServiceObject()
    if (configObj !== null) {
      const hasToken = this.getServiceToken(configObj.url)
      if (hasToken !== null) {
        validToken = true
      } else {
        validToken = false
      }
    }

    const generateRows = (v: any) => {
      if (typeof v !== 'undefined') {
        const isActive =
          v.versionGuid === this.state.selectedVersion.versionGuid
        const fieldsList = []
        let localFields = [...this.state.fieldColumns]
        if (!validToken) {
          localFields = localFields.filter((lf: any) => {
            return lf.field === 'versionName' || lf.field === 'versionOwner'
          })
        }
        localFields.sort(this._compare('order', 'desc'))
        localFields.forEach((fld: any, i: number) => {
          if (fld.show) {
            if (fld.field === 'versionName') {
              const nameStrip = v.versionName.substring(
                v.versionName.lastIndexOf('.') + 1,
                v.versionName.length
              )
              fieldsList.push(
                <td
                  key={nameStrip + i}
                  className={
                    isActive
                      ? 'color-primary-small-font td-middle'
                      : 'color-dark-small-font td-middle'
                  }
                  style={{ fontSize: 'medium', wordBreak: 'break-all' }}
                >
                  {nameStrip}
                </td>
              )
            } else if (fld.field === 'versionOwner') {
              const owner = v.versionName.substring(
                0,
                v.versionName.lastIndexOf('.')
              )
              fieldsList.push(
                <td
                  key={owner + i}
                  className={
                    isActive
                      ? 'color-primary-small-font td-middle'
                      : 'color-dark-small-font td-middle'
                  }
                  style={{ fontSize: 'medium' }}
                >
                  {owner}
                </td>
              )
            } else if (fld.field.indexOf('Date') > -1) {
              const formattedDate = new Date(v[fld.field]).toLocaleString()
              fieldsList.push(
                <td
                  key={formattedDate.toLocaleString() + i}
                  className={
                    isActive
                      ? 'color-primary-small-font td-middle'
                      : 'color-dark-small-font td-middle'
                  }
                  style={{ fontSize: 'medium' }}
                >
                  {formattedDate.toLocaleString()}
                </td>
              )
            } else {
              fieldsList.push(
                <td
                  key={fld.field + i}
                  className={
                    isActive
                      ? 'color-primary-small-font td-middle'
                      : 'color-dark-small-font td-middle'
                  }
                  style={{ fontSize: 'medium' }}
                >
                  {v[fld.field]}
                </td>
              )
            }
          }
        })

        versionList.push(
          <tr key={v.versionName}>
            <td style={{ fontSize: 'medium', verticalAlign: 'middle' }}>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                <div style={{ alignItems: 'center', display: 'flex' }}>
                  {v.hasOwnProperty('isLocked')
                    ? (
                        v.isLocked
                          ? (
                          <Icon
                            icon={lockIcon}
                            size="15"
                            color={theme.sys.color.primary.main}
                          />
                            )
                          : (
                          <div style={{ width: 15, height: 15 }}></div>
                            )
                      )
                    : (
                      <div style={{ width: 15, height: 15 }}></div>
                      )}
                </div>
                {canSwitch
                  ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'row',
                        paddingLeft: 5
                      }}
                    >
                      <Tooltip
                        title={
                          isActive
                            ? this.formatMessage('tooltipsCurrentVersion')
                            : this.formatMessage('tooltipsSwitchVersion')
                        }
                        placement="bottom"
                      >
                        {isActive
                          ? (
                            <Button icon disabled={false}>
                              <Icon
                                icon={activeIcon}
                                size="16"
                                color={
                                  isActive
                                    ? theme.sys.color.primary.main
                                    : theme.sys.color.primary.light
                                }
                              />
                            </Button>
                            )
                          : (
                            <Button
                              icon
                              onClick={() => {
                                this.switchVersion(v)
                              }}
                            >
                              <Icon
                                icon={notActiveIcon}
                                size="16"
                                color={theme.sys.color.primary.light}
                              />
                            </Button>
                            )}
                      </Tooltip>
                    </div>
                    )
                  : (
                      ''
                    )}
                {v.hasOwnProperty('isLocked') &&
                  v.isLocked === false &&
                  validToken &&
                  canEdit &&
                  v.versionName.toLowerCase() !== 'sde.default' && (
                    <div
                      style={{
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'row',
                        paddingLeft: 5
                      }}
                    >
                      <Tooltip
                        title={this.formatMessage('tooltipsUpdateVersionInfo')}
                        placement="bottom"
                      >
                        <Button
                          icon
                          onClick={() => {
                            this.loadExistingVersion(v)
                          }}
                        >
                          <Icon
                            icon={editIcon}
                            size="16"
                            color={theme.sys.color.primary.main}
                          />
                        </Button>
                      </Tooltip>
                    </div>
                )}
              </div>
            </td>
            {fieldsList}
          </tr>
        )
      }
    }
    //always make the first row the active version
    /*
    if (this.state.selectedVersion.hasOwnProperty('versionGuid')) {
      if (this.state.selectedVersion.versionGuid !== '') {
        generateRows(this.state.selectedVersion);
      }
    }
    */
    //then list out other versions
    if (this.state.filteredVersionList.length > 0) {
      this.state.filteredVersionList[this.state.currentDisplayIndex].forEach(
        (v: any) => {
          if (this.state.selectedVersion.hasOwnProperty('versionGuid')) {
            //if (this.state.selectedVersion.versionGuid !== v.versionGuid) {
            generateRows(v)
            //}
          }
        }
      )
    }
    return versionList
  }

  _createVersionRowsSimple = (canSwitch: boolean) => {
    const { theme } = this.props
    const versionList = []
    const generateRows = (v: any) => {
      let isSelected = false
      if (v.versionGuid === this.state.selectedVersion.versionGuid) {
        isSelected = true
      }
      const fieldsList = []
      const localFields = [...this.state.fieldColumns]
      localFields.sort(this._compare('order', 'desc'))
      localFields.forEach((fld: any, i: number) => {
        if (fld.show) {
          if (fld.field === 'versionName') {
            if (isSelected) {
              fieldsList.push(
                <td
                  key={v.versionGuid}
                  style={{
                    width: '100%',
                    color: theme.sys.color.primary.main,
                    fontWeight: 'bold',
                    wordBreak: 'break-all'
                  }}
                >
                  {v.versionName}
                </td>
              )
            } else {
              fieldsList.push(
                <td
                  key={v.versionGuid}
                  style={{ width: '100%', wordBreak: 'break-all' }}
                >
                  {v.versionName}
                </td>
              )
            }
          }
        }
      })
      versionList.push(
        <tr key={v.versionName}>
          <td style={{ paddingTop: 3, paddingBottom: 3 }}>
            <Tooltip
              title={
                isSelected
                  ? this.formatMessage('tooltipsCurrentVersion')
                  : this.formatMessage('tooltipsSwitchVersion')
              }
              placement="bottom"
            >
              <Button
                icon
                onClick={() => {
                  this.switchVersion(v)
                }}
              >
                <Icon
                  icon={isSelected ? activeIcon : notActiveIcon}
                  size="16"
                  color={
                    isSelected
                      ? theme.sys.color.primary.main
                      : theme.sys.color.primary.light
                  }
                />
              </Button>
            </Tooltip>
          </td>
          <td width="1%"></td>
          <td>
            {v.hasOwnProperty('isLocked')
              ? (
                  v.isLocked
                    ? (
                    <Icon icon={lockIcon} size="15" color={theme.sys.color.primary.main} />
                      )
                    : (
                    <div style={{ width: 15, height: 15 }}></div>
                      )
                )
              : (
                <div style={{ width: 15, height: 15 }}></div>
                )}
          </td>
          <td width="1%"></td>
          {fieldsList}
        </tr>
      )
    }

    //always make the first row the active version
    //if (this.state.selectedVersion.hasOwnProperty('versionGuid')) {
    //  if (this.state.selectedVersion.versionGuid !== '') {
    //    generateRows(this.state.selectedVersion);
    //  }
    //}
    //then list out other versions
    if (this.state.filteredVersionList.length > 0) {
      this.state.filteredVersionList[this.state.currentDisplayIndex].forEach(
        (v: any) => {
          if (this.state.selectedVersion.hasOwnProperty('versionGuid')) {
            //if (this.state.selectedVersion.versionGuid !== v.versionGuid) {
            generateRows(v)
            //}
          }
        }
      )
    }

    return versionList
  }

  renderVersionModification = () => {
    let canDelete = true
    let canSwitch = true
    let canUpdateName = true
    let canUpdateDetails = true
    let canUpdateAccess = true
    let canUpdateOwner = true
    let defaultOwner = null
    const configObj = this._getConfigServiceObject()
    if (configObj !== null && this.state.selectedService !== '') {
      const allowanceList = configObj.configuredSettings.allowance
      const deleteFilter = allowanceList.filter((al: any) => {
        return al.key === 'DeleteExisting'
      })
      if (deleteFilter.length > 0) {
        canDelete = deleteFilter[0].enabled
      }
      const switchFilter = allowanceList.filter((al: any) => {
        return al.key === 'Switch'
      })
      if (switchFilter.length > 0) {
        canSwitch = switchFilter[0].enabled
      }
      const updateNameFilter = allowanceList.filter((al: any) => {
        return al.key === 'UpdateName'
      })
      if (updateNameFilter.length > 0) {
        canUpdateName = updateNameFilter[0].enabled
      }
      const updateDescFilter = allowanceList.filter((al: any) => {
        return al.key === 'UpdateDescription'
      })
      if (updateDescFilter.length > 0) {
        canUpdateDetails = updateDescFilter[0].enabled
      }
      const updateAccessFilter = allowanceList.filter((al: any) => {
        return al.key === 'ChangePrivileges'
      })
      if (updateAccessFilter.length > 0) {
        canUpdateAccess = updateAccessFilter[0].enabled
      }
      const updateownerFilter = allowanceList.filter((al: any) => {
        return al.key === 'ChangeOwner'
      })
      if (updateownerFilter.length > 0) {
        canUpdateOwner = updateownerFilter[0].enabled
      }
      if (configObj.hasOwnProperty('url')) {
        defaultOwner = this.getSessionUserName(configObj.url)
      }
    }

    return (
      <div
        style={{
          flex: 1,
          flexDirection: 'column',
          display: 'flex',
          margin: 5,
          height: '98%'
        }}
      >
        <Alert
          form="basic"
          type="warning"
          className="w-100 m-2"
          open={this.state.showCreationAlert}
          text={this.state.creationAlertMsg}
        ></Alert>
        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ flex: 1, fontWeight: 'bold', fontSize: 'large' }}>
            {this.state.versionAction !== 'create'
              ? this.formatMessage('otherheadersManageVersion')
              : this.formatMessage('otherheadersNewVersion')}
          </div>
          <div style={{ flex: 3 }}>
            <Tooltip
              title={this.formatMessage('tooltipsCharLimit62')}
              placement="bottom"
            >
              <TextArea
                maxLength={62}
                className="mb-4"
                placeholder={this.formatMessage(
                  'placeholderVersionNameText'
                )}
                //checkValidityOnChange={(value) => ({ valid: value !== "" })}
                disabled={
                  this.state.versionAction === 'create'
                    ? false
                    : !canUpdateName
                }
                defaultValue={this.state.versionObject.versionName}
                onAcceptValue={(name) => {
                  if (name !== '') {
                    this.manageNewVersionData(name, 'versionName')
                    this.setState({
                      creationAlertMsg: '',
                      showCreationAlert: false,
                      disableSave: false
                    })
                  } else {
                    this.setState({
                      invalidVersionName: true,
                      creationAlertMsg: this.formatMessage(
                        'actionLabelsNameNotBlank'
                      ),
                      showCreationAlert: true,
                      disableSave: true
                    })
                  }
                }}
              />
            </Tooltip>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h6 style={{ fontWeight: 'bold', fontSize: 'large' }}>
            {this.formatMessage('versionmanagementDescription')}
          </h6>
          <Tooltip
            title={this.formatMessage('tooltipsCharLimit64')}
            placement="bottom"
          >
            <TextArea
              maxLength={64}
              className="mb-4"
              placeholder={this.formatMessage(
                'placeholderVersionDescriptionText'
              )}
              disabled={
                this.state.versionAction === 'create'
                  ? false
                  : !canUpdateDetails
              }
              value={this.state.versionObject.versionDescription}
              onChange={(e: any) => {
                this.manageNewVersionData(e.target.value, 'versionDescription')
              }}
            />
          </Tooltip>
        </div>

        <div style={{ display: 'flex', flexDirection: 'row' }}>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1.5 }}>
            <h6 style={{ fontWeight: 'bold', fontSize: 'large' }}>
              {this.formatMessage('versionmanagementAccessPrivileges')}
            </h6>
            <FormGroup tag="fieldset" row style={{ fontSize: 'medium' }}>
              <Col sm={10}>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="radio"
                      name="sharePublic"
                      value="public"
                      disabled={!canUpdateAccess}
                      checked={
                        this.state.versionObject.versionScope === 'public'
                      }
                      onChange={(e: any) => {
                        this.manageNewVersionData(
                          e.target.value,
                          'versionScope'
                        )
                      }}
                    />{' '}
                    {this.formatMessage('versionmanagementPublicAccess')}
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="radio"
                      name="sharePublic"
                      value="protected"
                      disabled={!canUpdateAccess}
                      checked={
                        this.state.versionObject.versionScope === 'protected'
                      }
                      onChange={(e: any) => {
                        this.manageNewVersionData(
                          e.target.value,
                          'versionScope'
                        )
                      }}
                    />{' '}
                    {this.formatMessage('versionmanagementProtectedAccess')}
                  </Label>
                </FormGroup>
                <FormGroup check>
                  <Label check>
                    <Input
                      type="radio"
                      name="sharePrivate"
                      value="private"
                      disabled={!canUpdateAccess}
                      checked={
                        this.state.versionObject.versionScope === 'private'
                      }
                      onChange={(e: any) => {
                        this.manageNewVersionData(
                          e.target.value,
                          'versionScope'
                        )
                      }}
                    />{' '}
                    {this.formatMessage('versionmanagementPrivateAccess')}
                  </Label>
                </FormGroup>
              </Col>
            </FormGroup>

            <div
              style={{ display: 'flex', flexDirection: 'row', paddingTop: 10 }}
            >
              <div
                style={{ display: 'flex', flex: 1, flexDirection: 'column' }}
              >
                <h6 style={{ fontWeight: 'bold', fontSize: 'large' }}>
                  {this.formatMessage('versionmanagementActivateVersion')}
                </h6>
                <div style={{ display: 'flex', flex: 1, flexDirection: 'row' }}>
                  <div style={{ fontSize: 'medium' }}>
                    {this.formatMessage('versionmanagementNo')}
                  </div>
                  <div
                    style={{ paddingLeft: 5, paddingRight: 5, paddingTop: 5 }}
                  >
                    <Label check>
                      <Switch
                        checked={this.state.autoSwitchVersion}
                        disabled={!canSwitch}
                        onChange={(evt: any) => {
                          this.toggleAutoSwitch()
                        }}
                      />
                    </Label>
                  </div>
                  <div style={{ fontSize: 'medium' }}>
                    {this.formatMessage('versionmanagementYes')}
                  </div>
                </div>
              </div>
            </div>
          </div>
          {
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <FormGroup>
                <h6 style={{ fontWeight: 'bold', fontSize: 'large' }}>
                  {this.formatMessage('versionmanagementChangeOwner')}
                </h6>
                <h6 style={{ fontWeight: 'bold', fontSize: 'medium' }}>
                  {this.formatMessage('versionmanagementCurrentOwner')}
                  {this.state.versionOwnerSnapshot !== ''
                    ? this.state.versionOwnerSnapshot
                    : defaultOwner !== null
                      ? defaultOwner
                      : this.props.user.username}
                </h6>
                <InputGroup>
                  <TextInput
                    type="text"
                    style={{ width: '100%' }}
                    placeholder={this.formatMessage('placeholderSearchOwner')}
                    disabled={!canUpdateOwner}
                    value={this.state.userSearchValue}
                    onChange={(e: any) => {
                      this.searchPortaluser(e.currentTarget.value)
                    }}
                  />
                </InputGroup>
                {this.searchUserResultList()}
              </FormGroup>
            </div>
          }
        </div>

        <div
          style={{
            display: 'flex',
            flex: 1,
            flexDirection: 'row',
            paddingTop: 10
          }}
        >
          <div
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'flex-start',
              alignItems: 'flex-end',
              padding: 15
            }}
          >
            <Button
              type="secondary"
              style={{ fontSize: 'medium', fontWeight: 'bold' }}
              onClick={(evt: any) => {
                this.toggleCreationModel(true)
              }}
            >
              {this.formatMessage('buttonsCancel')}
            </Button>
          </div>
          <div
            style={{
              display: 'flex',
              flex: 1,
              justifyContent: 'flex-end',
              alignItems: 'flex-end'
            }}
          >
            <div
              style={{
                display: 'flex',
                flex: 1,
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'flex-end',
                padding: 15
              }}
            >
              <Button
                type="primary"
                style={{ fontSize: 'medium', fontWeight: 'bold' }}
                disabled={
                  this.state.invalidVersionName
                    ? this.state.invalidVersionName
                    : this.state.disableSave
                }
                onClick={() => {
                  const currTime = new Date().getTime()
                  if (currTime - this.delayClickPrevent > 500) {
                    this.setState({ disableSave: true }, () => {
                      this.state.versionAction === 'create'
                        ? this.createVersion()
                        : this.updateVersion()
                    })
                  }
                  this.delayClickPrevent = new Date().getTime()
                }}
              >
                {this.formatMessage('buttonsSave')}
              </Button>{' '}
              {this.state.versionAction !== 'create'
                ? (
                    canDelete
                      ? (
                      <div style={{ width: '2%' }}></div>
                        )
                      : (
                          ''
                        )
                  )
                : (
                    ''
                  )}
              {this.state.versionAction !== 'create'
                ? (
                    canDelete
                      ? (
                      <Button
                        type="secondary"
                        style={{ fontSize: 'medium', fontWeight: 'bold' }}
                        disabled={this.state.invalidVersionName}
                        onClick={() => {
                          this.setState({ showDeleteModal: true })
                        }}
                      >
                        {this.formatMessage('buttonsDelete')}
                      </Button>
                        )
                      : (
                          ''
                        )
                  )
                : (
                    ''
                  )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  renderFieldList = () => {
    //{field:'access', alias:'Access', show:true, sort:'desc', order:2},
    let validToken = true
    const configObj = this._getConfigServiceObject()
    if (configObj !== null) {
      const hasToken = this.getServiceToken(configObj.url)
      if (hasToken !== null) {
        validToken = true
      } else {
        validToken = false
      }
    }

    const { theme } = this.props
    const fieldsList = []
    let localFields = [...this.state.fieldColumns]

    if (!validToken) {
      localFields = localFields.filter((lf: any) => {
        return lf.field === 'versionName' || lf.field === 'versionOwner'
      })
    }

    const onlyOneShown = () => {
      let result = false
      const shown = localFields.filter((lf: any) => {
        return lf.show === true
      })
      if (shown.length <= 1) {
        result = true
      }
      return result
    }
    const disableChk = onlyOneShown()
    localFields.sort(this._compare('order', 'desc'))
    localFields.forEach((fld: any, i: number) => {
      if (fld.available || fld.show) {
        fieldsList.push(
          <tr key={fld.field}>
            <td style={{ fontSize: 'medium', paddingLeft: 5, paddingRight: 5 }}>
              {fld.alias}
            </td>
            {fld.available ? (
              <td>
                <Tooltip
                  title={
                    fld.show
                      ? this.formatMessage('tooltipsRemoveFromTable')
                      : this.formatMessage('tooltipsAddToTable')
                  }
                  placement="bottom"
                >
                  <Checkbox
                    className="m-4"
                    checked={fld.show}
                    disabled={fld.show ? disableChk : false}
                    onChange={(evt: any) => {
                      //evt.preventDefault();
                      this.changeFieldVisible(evt, i)
                    }}
                  />
                </Tooltip>
              </td>
            ) : (
              <td>
                <Tooltip
                  title={this.formatMessage('tooltipsNotAvailableField')}
                  placement="bottom"
                >
                  <Checkbox
                    className="m-4"
                    checked={fld.show}
                    disabled={true}
                  />
                </Tooltip>
              </td>
            )}
            <td style={{ paddingLeft: 5, paddingRight: 5 }}>
              <div style={{ display: 'flex', flexDirection: 'row' }}>
                {i > 0
                  ? (
                    <Tooltip
                      title={this.formatMessage('tooltipsMoveColumnUp')}
                      placement="bottom"
                    >
                      <Button
                        icon
                        type="tertiary"
                        size="sm"
                        onClick={() => {
                          this.changeFieldOrder('up', i)
                        }}
                      >
                        <Icon icon={upArrowIcon} size="16"/>
                      </Button>
                    </Tooltip>
                    )
                  : (
                    <Button icon type="tertiary" size="sm"></Button>
                    )}
                {i < localFields.length - 1
                  ? (
                    <Tooltip
                      title={this.formatMessage('tooltipsMoveColumnDown')}
                      placement="bottom"
                    >
                      <Button
                        icon
                        type="tertiary"
                        size="sm"
                        onClick={() => {
                          this.changeFieldOrder('down', i)
                        }}
                      >
                        <Icon icon={downArrowIcon} size="16" />
                      </Button>
                    </Tooltip>
                    )
                  : (
                    <Button icon type="tertiary" size="sm"></Button>
                    )}
              </div>
            </td>
          </tr>
        )
      }
    })
    return (
      <table style={{}}>
        <thead>
          <tr>
            <th
              style={{
                fontSize: 'medium',
                position: 'sticky',
                top: 0,
                backgroundColor: theme.sys.color.primary.main,
                zIndex: 999,
                color: theme.sys.color.primary.text,
                padding: 7
              }}
            >
              {this.formatMessage('otherheadersColumnHeader')}
            </th>
            <th
              style={{
                fontSize: 'medium',
                position: 'sticky',
                top: 0,
                backgroundColor: theme.sys.color.primary.main,
                zIndex: 999,
                color: theme.sys.color.primary.text,
                padding: 7
              }}
            >
              {this.formatMessage('otherheadersVisibleHeader')}
            </th>
            <th
              style={{
                fontSize: 'medium',
                textAlign: 'right',
                position: 'sticky',
                top: 0,
                backgroundColor: theme.sys.color.primary.main,
                zIndex: 999,
                color: theme.sys.color.primary.text,
                padding: 7
              }}
            >
              {this.formatMessage('otherheadersOrderHeader')}
            </th>
          </tr>
        </thead>
        <tbody>{fieldsList}</tbody>
      </table>
    )
  }
  //END of render components
  //***********************

  //********************************* */
  //START FUNCTIONS ON VERSION MANAGEMENT
  pullVersions = (service: any, serviceSwitch: boolean) => {
    return new Promise((resolve, reject) => {
      const configObj = this._getConfigServiceObject()
      let activeV = null
      let updateObject = null
      const currentPage = this.state.currentDisplayIndex
      if (configObj !== null) {
        let validToken = this.getServiceToken(configObj.url)
        if (validToken === null) {
          validToken = undefined
        }

        this.vms
          .getVersions(configObj.name, configObj.url, validToken)
          .then((result: any) => {
            if (result.hasOwnProperty('success')) {
              if (result.success) {
                if (result.hasOwnProperty('versions')) {
                  const vList = result.versions
                  //always move active version to top of list
                  if (this.state.selectedVersion !== '') {
                    if (
                      this.state.selectedVersion.hasOwnProperty('versionGuid')
                    ) {
                      if (this.state.selectedVersion.versionGuid !== '') {
                        const pos = vList.findIndex(
                          (x) =>
                            x.versionGuid ===
                            this.state.selectedVersion.versionGuid
                        )
                        if (pos > -1) {
                          activeV = vList[pos]
                          //vList.splice(pos, 1);
                          //vList.splice(0,0,activateV);
                        } else {
                          //cannot find version, go back to default
                          const findDefault = this.state.versionList.filter(
                            (v: any) => {
                              return (
                                v.versionName.toLowerCase() ===
                                this.defaultVersion.toLowerCase()
                              )
                            }
                          )
                          if (findDefault.length > 0) {
                            activeV = findDefault[0]
                            this.switchVersion(findDefault[0])
                          }
                        }
                      }
                    }
                  }
                  const currTime = this._getCurrentTime()
                  if (activeV !== null) {
                    updateObject = {
                      versionList: vList,
                      showMgmtTools: result.canManage,
                      currentDisplayIndex: 0,
                      timeStamp: currTime,
                      selectedVersion: activeV
                    }
                  } else {
                    updateObject = {
                      versionList: vList,
                      showMgmtTools: result.canManage,
                      currentDisplayIndex: 0,
                      timeStamp: currTime
                    }
                  }

                  this.setState(updateObject, () => {
                    const chunked = this.chunkVersions(this.state.versionList)
                    let newPage = 0
                    if (currentPage !== 0) {
                      if (chunked.length - 1 > currentPage) {
                        newPage = currentPage
                      } else {
                        newPage = chunked.length - 1
                      }
                    }
                    this.setState(
                      {
                        filteredVersionList: chunked,
                        currentDisplayIndex: newPage
                      },
                      () => {
                        if (serviceSwitch) {
                          //check if it is switching between services to load persisted one.
                          const persist = this.state.versionList.filter(
                            (v: any) => {
                              if (this.state.urlStartUpVersion !== '') {
                                return (v.versionName === this.state.urlStartUpVersion)
                              } else {
                                return (v.versionGuid === configObj.configuredSettings.persistVersion)
                              }
                            }
                          )
                          if (persist.length > 0) {
                            this.switchVersion(persist[0])
                          } else {
                            //if user defined a version to start other than default, switch it here first time
                            const found = this.state.versionList.filter(
                              (v: any) => {
                                return (
                                  v.versionGuid === configObj.configuredSettings.startupVersion
                                )
                              }
                            )
                            if (found.length > 0) {
                              this.switchVersion(found[0])
                            } else {
                              const findDefault = this.state.versionList.filter(
                                (v: any) => {
                                  return (
                                    v.versionName.toLowerCase() === this.defaultVersion.toLowerCase()
                                  )
                                }
                              )
                              if (findDefault.length > 0) {
                                this.switchVersion(findDefault[0])
                              } else {
                                this.switchVersion({
                                  versionName: this.defaultVersion,
                                  versionGuid: null
                                })
                              }
                            }
                          }
                          this._checkStatus()
                          resolve(true)
                        } else {
                          this._checkStatus()
                          resolve(true)
                        }
                      }
                    )
                  })
                }
              }
            } else {
              if (result.hasOwnProperty('error')) {
                this.setState({
                  versionList: [],
                  filteredVersionList: [],
                  showMgmtTools: false
                })
                resolve(false)
              } else {
                resolve(true)
              }
            }
          })
      }
    })
  }

  _checkStatus = () => {
    this._getVersionStatus().then((res: any) => {
      this._mergeStatus(res)
    })
  }

  _getVersionStatus = () => {
    return new Promise((resolve, reject) => {
      if (this.state.filteredVersionList.length > 0) {
        const configObj = this._getConfigServiceObject()
        if (configObj !== null) {
          let validToken = this.getServiceToken(configObj.url)
          if (validToken === null) {
            validToken = undefined
          }
          const status = []
          const promises = this.state.filteredVersionList[
            this.state.currentDisplayIndex
          ].map(async (filtered: any) => {
            await this.vms
              .getVersionState(
                filtered,
                validToken,
                this.state.selectedService,
                configObj.url
              )
              .then((result: any) => {
                if (result.hasOwnProperty('versionName')) {
                  status.push(result)
                }
              })
          })
          if (
            this.state.selectedVersion.hasOwnProperty('versionGuid') &&
            this.state.selectedVersion.versionGuid !== null
          ) {
            promises.push(
              this.vms
                .getVersionState(
                  this.state.selectedVersion,
                  validToken,
                  this.state.selectedService,
                  configObj.url
                )
                .then((result: any) => {
                  if (result.hasOwnProperty('versionName')) {
                    status.push(result)
                  }
                })
            )
          }
          Promise.all(promises).then((res: any) => {
            resolve(status)
          })
        }
      } else {
        resolve([])
      }
    })
  }

  _mergeStatus = (result: any) => {
    if (this.state.filteredVersionList.length > 0) {
      const localList = [...this.state.filteredVersionList]
      localList[this.state.currentDisplayIndex].forEach((filtered: any) => {
        const found = result.filter((r: any) => {
          return r.versionGuid === filtered.versionGuid
        })
        if (found.length > 0) {
          filtered.isLocked = found[0].isLocked
        }
      })
      if (
        this.state.selectedVersion.hasOwnProperty('versionGuid') &&
        this.state.selectedVersion.versionGuid !== null
      ) {
        const localActive = { ...this.state.selectedVersion }
        const foundActive = result.filter((r: any) => {
          return r.versionGuid === localActive.versionGuid
        })
        if (foundActive.length > 0) {
          localActive.isLocked = foundActive[0].isLocked
        }
        this.setState({
          filteredVersionList: localList,
          selectedVersion: localActive
        })
      } else {
        this.setState({ filteredVersionList: localList })
      }
    }
  }

  switchVersion = (evt: any) => {
    const list = []
    const currService = this.state.vmsServices.filter((vms: any) => {
      return vms.name === this.state.selectedService
    })
    if (currService.length > 0) {
      //get list of services to switch out
      for (const key in this.state.dsList) {
        if (
          this.state.dsList[key].hasOwnProperty('_url') &&
          this.state.dsList[key]._url
        ) {
          const listItemDecoded = decodeURI(this.state.dsList[key]._url)
          const checkItemDecoded = decodeURI(currService[0].url)
          if (listItemDecoded.includes(checkItemDecoded)) {
            list[key] = this.state.dsList[key]
          }
        } else {
          if (this.state.dsList[key].type === DataSourceTypes.FeatureService) {
            list[key] = this.state.dsList[key]
          }
          if (this.state.dsList[key].type === DataSourceTypes.MapService) {
            list[key] = this.state.dsList[key]
          }
        }
      }
    }
    if (currService.length > 0) {
      this.vms.changeGDBVersion(evt.versionName, list)
      const configItem = Immutable.asMutable(Immutable(this.state.configObj), {
        deep: true
      })
      configItem.services.forEach((s: any) => {
        if (currService[0].name === s.name) {
          s.configuredSettings.persistVersion = evt.versionGuid
        }
      })
      this.setState(
        {
          selectedVersion: evt,
          selectedVersionInfo: evt,
          configObj: configItem
        },
        () => {
          this.pullVersions(this.state.selectedService, false).then(
            (res: any) => {
              if (this.state.searchVersionValue !== '') {
                this.searchVersions(this.state.searchVersionValue)
              }
              if (this.state.sort.field !== '') {
                this.sortVersions(
                  this.state.sort.field,
                  this.state.sort.direction
                )
              }
            }
          )
        }
      )
    }
  }

  createVersion = () => {
    const configObj = this._getConfigServiceObject()
    if (configObj !== null) {
      if (this.state.versionObject.versionName !== '') {
        let validToken = this.getServiceToken(configObj.url)
        const defaultUser = this.getSessionUserName(configObj.url)
        if (validToken === null) {
          validToken = undefined
        }
        this.setState(
          {
            showCreationAlert: false,
            creationAlertMsg: '',
            disableSave: false
          },
          () => {
            this.vms
              .createGDBVersion(
                this.state.versionObject,
                validToken,
                this.state.dsList,
                this.state.selectedService,
                configObj.url,
                this.state.autoSwitchVersion
              )
              .then(async (result: any) => {
                if (result.success) {
                  //if user created with a different user, need to send an update after creation since it doesn't let you on create.
                  if (
                    this.state.versionObject.versionOwner.toLowerCase() !==
                    defaultUser.toLowerCase()
                  ) {
                    if (this.state.versionObject.versionOwner === '') {
                      //if it's blank, process normally
                      await this.pullVersions(
                        this.state.selectedService,
                        false
                      )
                      if (this.state.autoSwitchVersion) {
                        const configItem = Immutable.asMutable(
                          Immutable(this.state.configObj),
                          { deep: true }
                        )
                        configItem.services.forEach((s: any) => {
                          if (this.state.selectedService === s.name) {
                            s.configuredSettings.persistVersion =
                              result.versionInfo.versionGuid
                          }
                        })
                        this.setState(
                          {
                            showVersionSettingsModal: false,
                            selectedVersion: result.versionInfo,
                            selectedVersionInfo: result.versionInfo,
                            autoSwitchVersion: false,
                            configObj: configItem
                          },
                          async () => {
                            await this.pullVersions(
                              this.state.selectedService,
                              false
                            )
                            if (this.state.searchVersionValue !== '') {
                              this.searchVersions(
                                this.state.searchVersionValue
                              )
                            } else {
                              if (this.state.sort.field !== '') {
                                this.sortVersions(
                                  this.state.sort.field,
                                  this.state.sort.direction
                                )
                              }
                            }
                          }
                        )
                      } else {
                        this.setState(
                          {
                            showVersionSettingsModal: false,
                            autoSwitchVersion: false
                          },
                          () => {
                            if (this.state.searchVersionValue !== '') {
                              this.searchVersions(
                                this.state.searchVersionValue
                              )
                            } else {
                              if (this.state.sort.field !== '') {
                                this.sortVersions(
                                  this.state.sort.field,
                                  this.state.sort.direction
                                )
                              }
                            }
                          }
                        )
                      }
                    } else {
                      const local = { ...this.state.versionObject }
                      local.versionGuid = result.versionInfo.versionGuid
                      if (this.state.autoSwitchVersion) {
                        this.setState({ versionObject: local }, () => {
                          //this.pullVersions(this.state.selectedService, false).then(()=>{
                          this.updateVersion()
                          //});
                        })
                      } else {
                        this.setState({ versionObject: local }, () => {
                          //this.pullVersions(this.state.selectedService, false).then(()=>{
                          this.updateVersion()
                          //});
                        })
                      }
                    }
                  } else {
                    await this.pullVersions(this.state.selectedService, false)
                    if (this.state.autoSwitchVersion) {
                      const configItem = Immutable.asMutable(
                        Immutable(this.state.configObj),
                        { deep: true }
                      )
                      configItem.services.forEach((s: any) => {
                        if (this.state.selectedService === s.name) {
                          s.configuredSettings.persistVersion =
                            result.versionInfo.versionGuid
                        }
                      })
                      this.setState(
                        {
                          showVersionSettingsModal: false,
                          selectedVersion: result.versionInfo,
                          selectedVersionInfo: result.versionInfo,
                          autoSwitchVersion: false,
                          configObj: configItem
                        },
                        () => {
                          if (this.state.searchVersionValue !== '') {
                            this.searchVersions(this.state.searchVersionValue)
                          } else {
                            if (this.state.sort.field !== '') {
                              this.sortVersions(
                                this.state.sort.field,
                                this.state.sort.direction
                              )
                            }
                          }
                        }
                      )
                    } else {
                      this.setState(
                        {
                          showVersionSettingsModal: false,
                          autoSwitchVersion: false
                        },
                        () => {
                          if (this.state.searchVersionValue !== '') {
                            this.searchVersions(this.state.searchVersionValue)
                          } else {
                            if (this.state.sort.field !== '') {
                              this.sortVersions(
                                this.state.sort.field,
                                this.state.sort.direction
                              )
                            }
                          }
                        }
                      )
                    }
                  }
                } else {
                  if (result.hasOwnProperty('response')) {
                    this.setState({
                      showCreationAlert: true,
                      creationAlertMsg: result.response.error.message
                    })
                  } else {
                    this.setState({
                      showCreationAlert: true,
                      creationAlertMsg: result.error.message
                    })
                  }
                }
              })
          }
        )
      } else {
        this.setState({
          showCreationAlert: true,
          creationAlertMsg: this.formatMessage('actionLabelsNameNotBlank')
        })
      }
    }
  }

  deleteVersion = () => {
    const configObj = this._getConfigServiceObject()
    if (configObj !== null) {
      let validToken = this.getServiceToken(configObj.url)
      if (validToken === null) {
        validToken = undefined
      }
      this.vms
        .deleteGDBVersion(
          this.state.versionObject.version,
          validToken,
          this.state.dsList,
          this.state.selectedService,
          configObj.url
        )
        .then(async (result: any) => {
          if (result.success) {
            await this.pullVersions(this.state.selectedService, false)
            if (
              this.state.versionObject.versionGuid ===
              this.state.selectedVersion.versionGuid
            ) {
              const defaultInfo = this.state.versionList.filter((v: any) => {
                return (
                  v.versionName.toLowerCase() ===
                  this.defaultVersion.toLowerCase()
                )
              })
              if (defaultInfo.length > 0) {
                const configItem = Immutable.asMutable(
                  Immutable(this.state.configObj),
                  { deep: true }
                )
                configItem.services.forEach((s: any) => {
                  if (this.state.selectedService === s.name) {
                    s.configuredSettings.persistVersion =
                      defaultInfo[0].versionGuid
                  }
                })
                this.setState(
                  {
                    showDeleteModal: false,
                    showDeleteAlert: false,
                    deleteAlertMsg: '',
                    selectedVersion:
                      defaultInfo.length > 0
                        ? defaultInfo[0]
                        : this.defaultVersion,
                    selectedVersionInfo:
                      defaultInfo.length > 0 ? defaultInfo[0] : '',
                    showVersionSettingsModal: false,
                    configObj: configItem
                  },
                  () => {
                    if (this.state.searchVersionValue !== '') {
                      this.searchVersions(this.state.searchVersionValue)
                    } else {
                      if (this.state.sort.field !== '') {
                        this.sortVersions(
                          this.state.sort.field,
                          this.state.sort.direction
                        )
                      }
                    }
                  }
                )
              } else {
                this.setState(
                  {
                    showDeleteModal: false,
                    showDeleteAlert: false,
                    deleteAlertMsg: '',
                    showVersionSettingsModal: false
                  },
                  () => {
                    if (this.state.searchVersionValue !== '') {
                      this.searchVersions(this.state.searchVersionValue)
                    } else {
                      if (this.state.sort.field !== '') {
                        this.sortVersions(
                          this.state.sort.field,
                          this.state.sort.direction
                        )
                      }
                    }
                  }
                )
              }
            } else {
              this.setState(
                {
                  showDeleteModal: false,
                  showDeleteAlert: false,
                  deleteAlertMsg: '',
                  showVersionSettingsModal: false
                },
                () => {
                  if (this.state.searchVersionValue !== '') {
                    this.searchVersions(this.state.searchVersionValue)
                  } else {
                    if (this.state.sort.field !== '') {
                      this.sortVersions(
                        this.state.sort.field,
                        this.state.sort.direction
                      )
                    }
                  }
                }
              )
            }
          } else {
            this.setState({
              showDeleteAlert: true,
              deleteAlertMsg: result.hasOwnProperty('error')
                ? result.error.message
                : result.message
            })
          }
        })
    }
  }

  updateVersion = () => {
    const configObj = this._getConfigServiceObject()
    if (configObj !== null) {
      if (this.state.versionObject.versionName !== '') {
        let validToken = this.getServiceToken(configObj.url)
        if (validToken === null) {
          validToken = undefined
        }
        this.setState(
          {
            showCreationAlert: false,
            creationAlertMsg: '',
            disableSave: false
          },
          () => {
            this.vms
              .alterGDBVersion(
                this.state.versionObject,
                validToken,
                this.state.dsList,
                this.state.selectedService,
                configObj.url,
                this.state.autoSwitchVersion
              )
              .then(async (result: any) => {
                if (result.success) {
                  await this.pullVersions(this.state.selectedService, false)
                  const versionFound = this.state.versionList.filter(
                    (v: any) => {
                      return (
                        v.versionGuid === this.state.versionObject.versionGuid
                      )
                    }
                  )
                  if (versionFound.length > 0) {
                    if (this.state.autoSwitchVersion) {
                      const configItem = Immutable.asMutable(
                        Immutable(this.state.configObj),
                        { deep: true }
                      )
                      configItem.services.forEach((s: any) => {
                        if (this.state.selectedService === s.name) {
                          s.configuredSettings.persistVersion =
                            versionFound[0].versionGuid
                        }
                      })
                      this.setState(
                        {
                          showVersionSettingsModal: false,
                          versionAction: 'create',
                          userSearchValue: '',
                          configObj: configItem,
                          autoSwitchVersion: false,
                          selectedVersion: versionFound[0],
                          selectedVersionInfo: versionFound[0]
                        },
                        async () => {
                          await this.pullVersions(
                            this.state.selectedService,
                            false
                          )
                          if (this.state.searchVersionValue !== '') {
                            this.searchVersions(this.state.searchVersionValue)
                          } else {
                            if (this.state.sort.field !== '') {
                              this.sortVersions(
                                this.state.sort.field,
                                this.state.sort.direction
                              )
                            }
                          }
                        }
                      )
                    } else {
                      if (
                        versionFound[0].versionName.toLowerCase() ===
                        this.state.selectedVersion.versionName.toLowerCase()
                      ) {
                        const defaultInfo = this.state.versionList.filter(
                          (v: any) => {
                            return (
                              v.versionName.toLowerCase() ===
                              this.defaultVersion.toLowerCase()
                            )
                          }
                        )
                        if (defaultInfo.length > 0) {
                          const configItem = Immutable.asMutable(
                            Immutable(this.state.configObj),
                            { deep: true }
                          )
                          configItem.services.forEach((s: any) => {
                            if (this.state.selectedService === s.name) {
                              s.configuredSettings.persistVersion =
                                defaultInfo[0].versionGuid
                            }
                          })
                          this.setState(
                            {
                              showVersionSettingsModal: false,
                              versionAction: 'create',
                              userSearchValue: '',
                              autoSwitchVersion: false,
                              selectedVersion: defaultInfo[0],
                              selectedVersionInfo: defaultInfo[0]
                            },
                            () => {
                              this.switchVersion(this.state.selectedVersion)
                              if (this.state.searchVersionValue !== '') {
                                this.searchVersions(
                                  this.state.searchVersionValue
                                )
                              } else {
                                if (this.state.sort.field !== '') {
                                  this.sortVersions(
                                    this.state.sort.field,
                                    this.state.sort.direction
                                  )
                                }
                              }
                            }
                          )
                        }
                      } else {
                        this.setState(
                          {
                            showVersionSettingsModal: false,
                            versionAction: 'create',
                            userSearchValue: '',
                            autoSwitchVersion: false
                          },
                          () => {
                            if (this.state.searchVersionValue !== '') {
                              this.searchVersions(
                                this.state.searchVersionValue
                              )
                            } else {
                              if (this.state.sort.field !== '') {
                                this.sortVersions(
                                  this.state.sort.field,
                                  this.state.sort.direction
                                )
                              }
                            }
                          }
                        )
                      }
                    }
                  } else {
                    if (this.state.autoSwitchVersion) {
                      const configItem = Immutable.asMutable(
                        Immutable(this.state.configObj),
                        { deep: true }
                      )
                      configItem.services.forEach((s: any) => {
                        if (this.state.selectedService === s.name) {
                          s.configuredSettings.persistVersion =
                            this.state.versionObject.versionGuid
                        }
                      })
                      this.setState(
                        {
                          showVersionSettingsModal: false,
                          showCreationAlert: false,
                          creationAlertMsg: '',
                          userSearchValue: '',
                          autoSwitchVersion: false,
                          selectedVersion: this.state.versionObject,
                          selectedVersionInfo: this.state.versionObject
                        },
                        async () => {
                          await this.pullVersions(
                            this.state.selectedService,
                            false
                          )
                          if (this.state.searchVersionValue !== '') {
                            this.searchVersions(this.state.searchVersionValue)
                          } else {
                            if (this.state.sort.field !== '') {
                              this.sortVersions(
                                this.state.sort.field,
                                this.state.sort.direction
                              )
                            }
                          }
                        }
                      )
                    } else {
                      const defaultInfo = this.state.versionList.filter(
                        (v: any) => {
                          return (
                            v.versionName.toLowerCase() ===
                            this.defaultVersion.toLowerCase()
                          )
                        }
                      )
                      if (defaultInfo.length > 0) {
                        const configItem = Immutable.asMutable(
                          Immutable(this.state.configObj),
                          { deep: true }
                        )
                        configItem.services.forEach((s: any) => {
                          if (this.state.selectedService === s.name) {
                            s.configuredSettings.persistVersion =
                              defaultInfo[0].versionGuid
                          }
                        })
                        this.setState(
                          {
                            showVersionSettingsModal: false,
                            showCreationAlert: false,
                            creationAlertMsg: '',
                            userSearchValue: '',
                            selectedVersion:
                              defaultInfo.length > 0
                                ? defaultInfo[0]
                                : this.defaultVersion,
                            selectedVersionInfo:
                              defaultInfo.length > 0 ? defaultInfo[0] : '',
                            configObj: configItem
                          },
                          async () => {
                            await this.pullVersions(
                              this.state.selectedService,
                              false
                            )
                            if (this.state.searchVersionValue !== '') {
                              this.searchVersions(
                                this.state.searchVersionValue
                              )
                            } else {
                              if (this.state.sort.field !== '') {
                                this.sortVersions(
                                  this.state.sort.field,
                                  this.state.sort.direction
                                )
                              }
                            }
                          }
                        )
                      } else {
                        this.setState({
                          showVersionSettingsModal: false,
                          showCreationAlert: false,
                          creationAlertMsg: '',
                          userSearchValue: ''
                        })
                      }
                    }
                  }
                } else {
                  if (result.hasOwnProperty('response')) {
                    this.setState({
                      showCreationAlert: true,
                      creationAlertMsg: result.response.error.message,
                      userSearchValue: ''
                    })
                  } else {
                    this.setState({
                      showCreationAlert: true,
                      creationAlertMsg: result.error.message,
                      userSearchValue: ''
                    })
                  }
                }
              })
          }
        )
      } else {
        this.setState({
          showCreationAlert: true,
          creationAlertMsg: this.formatMessage('actionLabelsNameNotBlank')
        })
      }
    }
  }

  searchVersions = (value: any) => {
    const allVersions = [...this.state.versionList]
    const filtered = allVersions.filter((v: any) => {
      return v.versionName.toLowerCase().indexOf(value.toLowerCase()) >= 0
    })
    if (this.state.sort.field !== '') {
      filtered.sort(
        this._compare(this.state.sort.field, this.state.sort.direction)
      )
    }
    const chunked = this.chunkVersions(filtered)
    this.setState(
      {
        filteredVersionList: chunked,
        currentDisplayIndex: 0,
        searchVersionValue: value
      },
      () => {
        this._checkStatus()
      }
    )
  }

  loadExistingVersion = (evt: any) => {
    if (evt.versionName.toLowerCase() !== this.defaultVersion.toLowerCase()) {
      const currVer = this.state.versionList.filter((v: any) => {
        return v.versionGuid === evt.versionGuid
      })
      if (currVer.length > 0) {
        let isActive = false
        const verObj = { ...this.state.versionObject }
        if (currVer[0].versionGuid === this.state.selectedVersion.versionGuid) {
          isActive = true
        }
        verObj.version = currVer[0].versionName
        verObj.versionName = currVer[0].versionName.substring(
          currVer[0].versionName.lastIndexOf('.') + 1,
          currVer[0].versionName.length
        )
        verObj.versionDescription = currVer[0].description
        verObj.versionScope = currVer[0].access
        verObj.versionOwner = currVer[0].versionName.substring(
          0,
          currVer[0].versionName.lastIndexOf('.')
        )
        verObj.versionGuid = currVer[0].versionGuid
        this.setState(
          {
            versionObject: verObj,
            versionOwnerSnapshot: verObj.versionOwner,
            autoSwitchVersion: isActive
          },
          () => {
            this.setState({
              showVersionSettingsModal: true,
              versionAction: 'edit',
              userSearchValue: '',
              portalUsers: [],
              disableSave: false,
              invalidVersionName: false
            })
          }
        )
      } else {
        if (evt.versionGuid === this.state.selectedVersion.versionGuid) {
          const isActive = true
          const verObj = { ...this.state.versionObject }
          verObj.version = this.state.selectedVersion.versionName
          verObj.versionName = this.state.selectedVersion.versionName.substring(
            this.state.selectedVersion.versionName.lastIndexOf('.') + 1,
            this.state.selectedVersion.versionName.length
          )
          verObj.versionDescription = this.state.selectedVersion.description
          verObj.versionScope = this.state.selectedVersion.access
          verObj.versionOwner =
            this.state.selectedVersion.versionName.substring(
              0,
              this.state.selectedVersion.versionName.lastIndexOf('.')
            )
          verObj.versionGuid = this.state.selectedVersion.versionGuid
          this.setState(
            {
              versionObject: verObj,
              versionOwnerSnapshot: verObj.versionOwner,
              autoSwitchVersion: isActive
            },
            () => {
              this.setState({
                showVersionSettingsModal: true,
                versionAction: 'edit',
                userSearchValue: '',
                portalUsers: [],
                disableSave: false,
                invalidVersionName: false
              })
            }
          )
        }
      }
    } else {
      this.setState({ showUpdateModal: true })
    }
  }
  //END FUNCTIONS ON VERSION MANAGEMENT
  //********************************* */

  //************************** */
  //Managing version data in the UI
  manageNewVersionData = (value: any, field: string) => {
    const newVersion = { ...this.state.versionObject }
    if (newVersion.hasOwnProperty(field)) {
      newVersion[field] = value
    }
    if (field === 'versionOwner') {
      this.setState(
        {
          versionObject: newVersion,
          invalidVersionName: false,
          userSearchValue: value
        },
        () => {
          this.searchPortaluser(value)
        }
      )
    } else {
      this.setState({ versionObject: newVersion, invalidVersionName: false })
    }
  }

  resetVersionObjectData = () => {
    const configObj = this._getConfigServiceObject()
    let defaultOwner = null
    if (configObj !== null) {
      if (configObj.hasOwnProperty('url')) {
        defaultOwner = this.getSessionUserName(configObj.url)
      }
    }

    const verObj = { ...this.state.versionObject }
    verObj.versionName = ''
    verObj.versionDescription = ''
    verObj.versionScope = 'public'
    verObj.versionOwner = defaultOwner !== null ? defaultOwner : ''
    verObj.versionGuid = ''
    this.setState(
      {
        versionObject: verObj,
        versionAction: 'create',
        versionOwnerSnapshot: defaultOwner !== null ? defaultOwner : '',
        userSearchValue: '',
        portalUsers: [],
        disableSave: true
      },
      () => {
        this.toggleCreationModel(false)
      }
    )
  }

  searchPortaluser = (value: any) => {
    const searchVal = value
    let validToken = SessionManager.getInstance().getMainSession()?.token
    const configObj = this._getConfigServiceObject()
    if (configObj !== null) {
      validToken = this.getServiceToken(configObj.url)
    }

    const hostUrl = urlUtils.getUrlHost(configObj.url)
    const protocol = urlUtils.getProtocol(configObj.url)
    let servicePortal = protocol + '//' + hostUrl + '/portal'

    const correctPortal = this.checkPortalIfFederated(hostUrl)
    if (correctPortal !== null) {
      servicePortal = correctPortal.portal
      validToken = correctPortal._token
    }

    this.vms
      .searchPortalUsers(servicePortal, value, validToken)
      .then((result: any) => {
        if (result.hasOwnProperty('results')) {
          const listAll = result.results
          const filtered = listAll.filter((item: any) => {
            return item.username.indexOf('esri_') === -1
          })
          this.setState(
            { userSearchValue: searchVal, portalUsers: filtered })
        } else {
          this.setState({ userSearchValue: searchVal, portalUsers: [] })
        }
      })
  }

  searchUserResultList = () => {
    const users = []
    if (this.state.portalUsers.length > 0) {
      this.state.portalUsers.forEach((pu: any) => {
        users.push(
          <Button
            key={pu.username}
            type={
              this.state.versionObject.versionOwner === pu.username
                ? 'primary'
                : 'secondary'
            }
            onClick={() => {
              this.manageNewVersionData(pu.username, 'versionOwner')
            }}
          >
            {pu.fullName}
          </Button>
        )
      })
    } else {
      if (this.state.userSearchValue !== '') {
        users.push(
          <Button key={'no_user'} type={'secondary'}>
            {this.formatMessage('versionmanagementNoUserFound')}
          </Button>
        )
      }
    }
    return <ListGroup>{users}</ListGroup>
  }
  //END managing versions in UI
  //************************* */

  //********************** */
  //UI Helper functions
  chunkVersions = (array: any[]) => {
    const localList = [...array]
    let chunkList = []
    if (localList.length > 0) {
      chunkList = this.chunk(localList, this.state.maxDisplayRows)
    }
    return chunkList
  }

  chunk = (array, size) => {
    const temparray = []
    const chunk = size
    let i, j
    for (i = 0, j = array.length; i < j; i += chunk) {
      temparray.push(array.slice(i, i + chunk))
    }
    return temparray
  }

  _filterRuntimeFields = () => {
    const configObj = this._getConfigServiceObject()
    if (configObj !== null) {
      const fields = Immutable.asMutable(
        Immutable(configObj.configuredSettings.displayInfo),
        { deep: true }
      )
      const filteredFields = fields.filter((fld: any) => {
        return fld.available === true || fld.show === true
      })
      filteredFields.forEach((ff: any) => {
        for (const key in defaultMessages) {
          if (key.toLowerCase() === ('fieldColumns' + ff.field).toLowerCase()) {
            ff.alias = this.formatMessage(key)
          }
        }
      })
      this.setState({ fieldColumns: filteredFields })
    }
  }

  _getRefreshInterval = () => {
    let interval = -1
    const configObj = this._getConfigServiceObject()
    if (configObj !== null) {
      const allowance = configObj.configuredSettings.allowance
      const refreshNode = allowance.filter((a: any) => {
        return a.key === 'AutoRefreshList'
      })
      if (refreshNode.length > 0) {
        if (refreshNode[0].enabled) {
          interval = parseInt(refreshNode[0].refreshInterval) * 60000
        }
      }
    }
    return interval
  }

  sortVersions = (parameter: string, direction: string) => {
    const localList = [...this.state.versionList]
    const currentPage = this.state.currentDisplayIndex
    localList.sort(this._compare(parameter, direction))
    /*
    if (this.state.selectedVersion !== '') {
      const pos = localList.findIndex(x => x.versionGuid === this.state.selectedVersion.versionGuid);
      if (pos > -1) {
        //const activateV = localList[pos];
        localList.splice(pos, 1);
        //localList.splice(0,0,activateV);
      }
    }
    */
    const chunked = this.chunkVersions(localList)
    const configObj = this._getConfigServiceObject()
    if (configObj !== null) {
      //const localFields = [...configObj['configuredSettings']['displayInfo']];
      const localFields = [...this.state.fieldColumns]
      localFields.forEach((fld: any) => {
        fld.sort = 'desc'
        if (parameter === fld.field) {
          fld.sort = direction
        }
      })
      const persistState = { field: parameter, direction: direction }
      let newPage = 0
      if (currentPage !== 0) {
        if (chunked.length - 1 > currentPage) {
          newPage = currentPage
        } else {
          newPage = chunked.length - 1
        }
      }

      this.setState(
        {
          filteredVersionList: chunked,
          currentDisplayIndex: newPage,
          sort: persistState,
          fieldColumns: localFields
        },
        () => {
          if (this.state.searchVersionValue !== '') {
            this.searchVersions(this.state.searchVersionValue)
          }
          this._checkStatus()
        }
      )
    }
  }

  _compare = (prop: any, direction: string) => {
    return function (a: any, b: any) {
      let comparison = 0
      let propA = a[prop]
      let propB = b[prop]

      if (prop === 'versionOwner') {
        //there is no version owner in the REST so sort on versionName which has owner prefix.
        propA = a.versionName.toLowerCase()
        propB = b.versionName.toLowerCase()
      } else if (prop === 'versionName') {
        //if version name, compare without the user name prefix
        propA = propA
          .substring(propA.lastIndexOf('.') + 1, propA.length)
          .toLowerCase()
        propB = propB
          .substring(propB.lastIndexOf('.') + 1, propB.length)
          .toLowerCase()
      } else {
        //check if string to lowercase it
        if (isNaN(propA)) {
          propA = propA.toLowerCase()
        }
        if (isNaN(propB)) {
          propB = propB.toLowerCase()
        }
      }

      if (direction === 'desc') {
        if (propA > propB) {
          comparison = 1
        } else if (propA < propB) {
          comparison = -1
        }
      } else {
        if (propA < propB) {
          comparison = 1
        } else if (propA > propB) {
          comparison = -1
        }
      }
      return comparison
    }
  }

  _getCurrentTime = () => {
    const date = new Date()
    return date.toLocaleString()
  }

  changeFieldVisible = (evt: any, index: number) => {
    const localFields = [...this.state.fieldColumns]
    localFields.sort(this._compare('order', 'desc'))
    localFields[index].show = evt.currentTarget.checked
    this.setState({ fieldColumns: localFields })
  }

  changeFieldOrder = (direction: string, index: number) => {
    const localFields = [...this.state.fieldColumns]
    localFields.sort(this._compare('order', 'desc'))
    let newPos = index
    if (direction === 'up') {
      newPos = newPos - 1
      localFields[index].order = newPos
      localFields[index - 1].order = index
    } else {
      newPos = newPos + 1
      localFields[index].order = newPos
      localFields[index + 1].order = index
    }
    this.setState({ fieldColumns: localFields })
  }

  toggleExpandAction = () => {
    if (this.state.isModeExpand) {
      this.setState({ isModeExpand: false })
    } else {
      this.setState({ isModeExpand: true })
    }
  }

  toggleDialogAction = (type: string, key: string) => {
    switch (type) {
      case 'fieldMgmt': {
        this.setState({ showFieldMgmt: !this.state.showFieldMgmt })
      }
      default:
        break
    }
  }

  toggleCreationModel = (status: boolean) => {
    if (status) {
      this.setState({
        showVersionSettingsModal: false,
        showCreationAlert: false,
        creationAlertMsg: '',
        userSearchValue: '',
        portalUsers: [],
        autoSwitchVersion: false
      })
    } else {
      this.setState({
        showVersionSettingsModal: true,
        showCreationAlert: false,
        creationAlertMsg: '',
        userSearchValue: '',
        portalUsers: [],
        autoSwitchVersion: false
      })
    }
  }

  toggleDeleteModal = (status: boolean) => {
    if (status) {
      this.setState({ showDeleteModal: false, showDeleteAlert: false })
    } else {
      this.setState({ showDeleteModal: true })
    }
  }

  toggleUpdateModal = (status: boolean) => {
    if (status) {
      this.setState({ showUpdateModal: false })
    } else {
      this.setState({ showUpdateModal: true })
    }
  }

  toggleServiceSelectorModal = (status: boolean) => {
    if (status) {
      this.setState({ showServiceSelector: false })
    } else {
      this.setState({ showServiceSelector: true })
    }
  }

  toggleAutoSwitch = () => {
    if (this.state.autoSwitchVersion) {
      this.setState({ autoSwitchVersion: false })
    } else {
      this.setState({ autoSwitchVersion: true })
    }
  }

  toggleBackServiceSelector = () => {
    this.setState({ showServiceSelector: true })
  }

  //END helper functions
  //*************************** */

  //************************ */
  //Get and modify config object
  _getConfigServiceObject = () => {
    let configObj = null
    const versionConfig = this.state.configObj
    if (versionConfig !== null) {
      versionConfig.services.forEach((s: any) => {
        if (this.state.selectedService !== '') {
          if (this.state.selectedService === s.name) {
            configObj = s
          }
        }
      })
    }
    return configObj
  }

  getServiceToken = (url: string) => {
    const baseURL = urlUtils.getUrlHost(url.toLowerCase())
    const sessionManager = SessionManager.getInstance()
    const allSessions = sessionManager.getSessions()
    const foundSession = allSessions.filter((as: any) => {
      return (((as.portal).toLowerCase()).indexOf(baseURL) > -1)
    })
    let serviceToken = null
    if (((this.props.portalUrl).toLowerCase()).includes(baseURL)) {
      serviceToken = SessionManager.getInstance().getMainSession()?.token
    }
    if (foundSession.length > 0) {
      serviceToken = foundSession[0].token
    } else {
      if (serviceToken === null) {
        allSessions.map((as: any): any => {
          if (as.hasOwnProperty('federatedServers')) {
            for (const key in as.federatedServers) {
              if (((key).toLowerCase()).includes(baseURL)) {
                serviceToken = as.federatedServers[key].token
              }
            }
            return true
          } else {
            if (as.hasOwnProperty('trustedServers')) {
              for (const key in as.trustedServers) {
                if (((key).toLowerCase()).includes(baseURL)) {
                  serviceToken = as.trustedServers[key].token
                }
              }
              return true
            }
            return true
          }
        })
      }
    }
    return serviceToken
  }

  checkPortalIfFederated = (baseURL: string) => {
    let returnPortal = null
    const sessionManager = SessionManager.getInstance()
    const allSessions = sessionManager.getSessions()
    const foundSession = allSessions.filter((as: any) => {
      return (((as.portal).toLowerCase()).indexOf(baseURL) > -1)
    })
    if (foundSession.length > 0) {
      returnPortal = foundSession[0]
    } else {
      allSessions.map((as: any): any => {
        if (as.hasOwnProperty('federatedServers')) {
          for (const key in as.federatedServers) {
            if (((key).toLowerCase()).includes(baseURL)) {
              returnPortal = as
              return true
            }
          }
          return false
        } else {
          if (as.hasOwnProperty('trustedServers')) {
            for (const key in as.trustedServers) {
              if (((key).toLowerCase()).includes(baseURL)) {
                returnPortal = as
                return true
              }
            }
            return false
          } else {
            return false
          }
        }
      })
    }
    return returnPortal
  }

  getSessionUserName = (url: string) => {
    const baseURL = urlUtils.getUrlHost(url.toLowerCase())
    const sessionManager = SessionManager.getInstance()
    const allSessions = sessionManager.getSessions()
    const foundSession = allSessions.filter((as: any) => {
      return as.portal.toLowerCase().indexOf(baseURL) > -1
    })
    let sessionUser = null
    if (this.props.portalUrl.toLowerCase().includes(baseURL)) {
      sessionUser = this.props.user.username
    }
    if (foundSession.length > 0) {
      sessionUser = foundSession[0].username
    }
    return sessionUser
  }

  _getSizeOfContainer (): ClientRect {
    const layoutElem = document.querySelector('div.gdb-version-management')
    if (layoutElem) {
      return layoutElem.getBoundingClientRect()
    }
    return null
  }

  _sizePopperHeight = (offset: number) => {
    let returnSize = null
    const widgetSize = this._getSizeOfContainer()
    if (widgetSize !== null) {
      returnSize = this._getSizeOfContainer().height - offset
    } else {
      returnSize = 'auto'
    }
    return returnSize
  }

  _sizePopperWidth = (offset: number) => {
    let returnSize = null
    const widgetSize = this._getSizeOfContainer()
    if (widgetSize !== null) {
      returnSize = this._getSizeOfContainer().width - offset
    } else {
      returnSize = 'auto'
    }
    return returnSize
  }

  formatMessage = (id: string, values?: { [key: string]: any }) => {
    const messages = Object.assign(
      {},
      defaultMessages,
      jimuUIDefaultMessages,
      jimuCoreMessages
    )
    return this.props.intl.formatMessage(
      { id: id, defaultMessage: messages[id] },
      values
    )
  }

  //END config get/set
  //************************ */

  //************************** */
  //CSS for rendering the UI
  getStyle = (theme: IMThemeVariables): SerializedStyles => {
    return css`
      .td-middle {
        vertical-align: middle !important;
      }
      .background-light {
        background-color: ${theme.sys.color.primary.main};
      }
      .display-flex-column-1 {
        flex: 1;
        flex-direction: column;
        display: flex;
      }
      .display-flex-row-1 {
        flex: 1;
        flex-direction: row;
        display: flex;
      }
      .simple-view-header-bgcolor {
        background: ${theme.sys.color.primary.main};
        color: ${theme.sys.color.primary.text};
      }
      .overflow-auto {
        overflow: "auto";
      }
      .button-inactive-color {
        background: ${theme.sys.color.secondary.main};
      }
      .button-active-color {
        background: ${theme.sys.color.primary.main};
      }
      .icon-inactive-color {
        background: ${theme.sys.color.primary.light};
      }
      .icon-active-color {
        background: ${theme.sys.color.primary.dark};
      }
      .flex-center {
        align-items: center;
        display: flex;
      }
      .padding-left-right-5 {
        padding-left: 5;
        padding-right: 5;
      }
      .color-dark-small-font {
        color: ${theme.sys.color.surface.backgroundText};
        font-family: ${theme.ref.typeface.fontFamily};
        font-size: ${theme.sys.typography.h6.fontSize};
      }
      .color-primary-small-font {
        color: ${theme.sys.color.primary.main};
        font-family: ${theme.ref.typeface.fontFamily};
        font-size: ${theme.sys.typography.h6.fontSize};
        font-weight: bold;
      }
      .color-light-small-font {
        color: ${theme.sys.color.surface.backgroundText};
        font-family: ${theme.ref.typeface.fontFamily};
        font-size: ${theme.sys.typography.h6.fontSize};
      }
      .cursor-hand {
        cursor: pointer;
      }
    `
  }
}
