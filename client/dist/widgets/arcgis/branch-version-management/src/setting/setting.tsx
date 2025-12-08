/* eslint-disable no-prototype-builtins */
import {
  React, Immutable, css, type IMThemeVariables, type SerializedStyles, DataSourceManager, type UseDataSource,
  defaultMessages as jimuCoreMessages, SessionManager, urlUtils, AllDataSourceTypes
} from 'jimu-core'
import { BaseWidgetSetting, type AllWidgetSettingProps } from 'jimu-for-builder'
import type { IMConfig } from '../config'
import defaultMessages from './translations/default'
import {
  Select, Checkbox, Table, Button, Icon, TextInput, Tooltip, Alert, Switch,
  defaultMessages as jimuUIDefaultMessages, NumericInput,
  FloatingPanel
} from 'jimu-ui'
import { SettingSection, SettingRow, SidePopper } from 'jimu-ui/advanced/setting-components'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import GDBVersionManager from '../runtime/branch-version-manager'
import './css/custom.css'
const closeIcon = require('jimu-ui/lib/icons/close.svg')
const upArrowIcon = require('jimu-ui/lib/icons/direction-up.svg')
const downArrowIcon = require('jimu-ui/lib/icons/direction-down.svg')
const appSortIcon = require('jimu-ui/lib/icons/app-sort.svg')
const infoIcon = require('jimu-ui/lib/icons/info.svg')
const helpIcon = require('jimu-ui/lib/icons/help.svg')

interface State {
  allVersionList: any[]
  filteredVersionList: any[]
  selectedVersion: any
  selectedService: any
  selectedWebMap: string
  vmsServices: any[]
  showServiceSelector: boolean
  showSidePanel: boolean
  showWebMapSelector: boolean
  showFieldMgmt: boolean
  showAlert: boolean
  alertMessage: string
  searchVersionText: string
  intervalNumber: number
  invalidInterval: boolean
  expandMode: boolean
  arrangementStyle: string
  configObject: any
}

export default class Setting extends BaseWidgetSetting<AllWidgetSettingProps<IMConfig>, State> {
  sidePopperTrigger = React.createRef<HTMLDivElement>()
  constructor (props) {
    super(props)
    this.state = {
      allVersionList: [],
      filteredVersionList: [],
      selectedVersion: {},
      selectedService: {},
      selectedWebMap: '',
      vmsServices: (this.props.config.versionConfig) ? (this.props.config.versionConfig.hasOwnProperty('services')) ? this.props.config.versionConfig.services : [] : [],
      showServiceSelector: false,
      showSidePanel: false,
      showWebMapSelector: false,
      showFieldMgmt: false,
      showAlert: false,
      alertMessage: this.formatMessage('alertMessagesErrorAlert'),
      searchVersionText: '',
      intervalNumber: 1,
      invalidInterval: false,
      expandMode: (this.props.config.versionConfig) ? (this.props.config.versionConfig.hasOwnProperty('expandMode')) ? this.props.config.versionConfig.expandMode : true : true,
      arrangementStyle: (this.props.config.versionConfig) ? (this.props.config.versionConfig.hasOwnProperty('arrangement')) ? this.props.config.versionConfig.arrangement : 'simple' : 'simple',
      configObject: Immutable.asMutable(Immutable(this.props.config.versionConfig), { deep: true })
    }
  }

  defaultVersion: string = 'sde.DEFAULT'
  vms: GDBVersionManager = GDBVersionManager.getInstance()
  //vms = new GDBVersionManager();
  formatMessage = (id: string, values?: { [key: string]: any }) => {
    const messages = Object.assign({}, defaultMessages, jimuUIDefaultMessages, jimuCoreMessages)
    return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] }, values)
  }

  fieldColumns = [
    { field: 'access', alias: this.formatMessage('fieldColumnsAccess'), show: true, sort: 'desc', order: 2, available: true },
    { field: 'commonAncestorDate', alias: this.formatMessage('fieldColumnsCommonAncestorDate'), show: false, sort: 'desc', order: 5, available: true },
    { field: 'creationDate', alias: this.formatMessage('fieldColumnsCreationDate'), show: false, sort: 'desc', order: 3, available: true },
    { field: 'description', alias: this.formatMessage('fieldColumnsDescription'), show: false, sort: 'desc', order: 4, available: true },
    { field: 'evaluationDate', alias: this.formatMessage('fieldColumnsEvaluationDate'), show: false, sort: 'desc', order: 6, available: true },
    { field: 'modifiedDate', alias: this.formatMessage('fieldColumnsModifiedDate'), show: true, sort: 'desc', order: 7, available: true },
    { field: 'previousAncestorDate', alias: this.formatMessage('fieldColumnsPreviousAncestorDate'), show: false, sort: 'desc', order: 8, available: true },
    { field: 'reconcileDate', alias: this.formatMessage('fieldColumnsReconcileDate'), show: false, sort: 'desc', order: 9, available: true },
    { field: 'versionGuid', alias: this.formatMessage('fieldColumnsVersionGuid'), show: false, sort: 'desc', order: 10, available: true },
    { field: 'versionId', alias: this.formatMessage('fieldColumnsVersionId'), show: false, sort: 'desc', order: 11, available: true },
    { field: 'versionName', alias: this.formatMessage('fieldColumnsVersionName'), show: true, sort: 'desc', order: 0, available: true },
    { field: 'versionOwner', alias: this.formatMessage('fieldColumnsVersionOwner'), show: true, sort: 'desc', order: 1, available: true }
  ]

  allowance = [
    { label: this.formatMessage('allowancesSwitch'), key: 'Switch', enabled: true },
    { label: this.formatMessage('allowancesCreateNew'), key: 'CreateNew', enabled: true },
    { label: this.formatMessage('allowancesDeleteExisting'), key: 'DeleteExisting', enabled: false },
    { label: this.formatMessage('allowancesUpdateName'), key: 'UpdateName', enabled: true },
    { label: this.formatMessage('allowancesUpdateDescription'), key: 'UpdateDescription', enabled: true },
    { label: this.formatMessage('allowancesChangeOwner'), key: 'ChangeOwner', enabled: false },
    { label: this.formatMessage('allowancesChangePrivileges'), key: 'ChangePrivileges', enabled: false },
    { label: this.formatMessage('allowancesAutoRefreshList'), key: 'AutoRefreshList', enabled: true, refreshInterval: 1 }
  ]
  //index 7 of allowance is hard coded and used in functions serviceCheckBoxAction and serviceSelectorAction.  Be sure to update if you add more allowances here.

  _updateServicesToConfig = (useDataSources?: UseDataSource[]) => {
    const immObj = Immutable(this.state.configObject)
    const localConfig = Immutable.asMutable(immObj, { deep: true })
    localConfig.services = Immutable.asMutable(Immutable(this.state.vmsServices), { deep: true })
    this.setState({ configObject: localConfig }, () => {
      if (!useDataSources) {
        this.props.onSettingChange({
          id: this.props.id,
          config: this.props.config.set('versionConfig', localConfig)
        })
      } else {
        this.props.onSettingChange({
          id: this.props.id,
          config: this.props.config.set('versionConfig', localConfig),
          useDataSources: useDataSources
        })
      }
    })
  }

  updateConfigItem = (evt: any, node: string) => {
    const immObj = Immutable(this.state.vmsServices)
    const localService = Immutable.asMutable(immObj, { deep: true })
    localService.forEach((s: any) => {
      if (s.name === this.state.selectedService.name) {
        s.configuredSettings[node] = (evt.hasOwnProperty('currentTarget')) ? evt.currentTarget.value : evt
      }
    })
    this.setState({ vmsServices: localService }, () => {
      this._updateServicesToConfig()
    })
  }

  updateGeneralItem = (value: any, node: string) => {
    const localConfig = { ...this.state.configObject }
    localConfig[node] = value
    if (node === 'expandMode') {
      this.setState({ configObject: localConfig, expandMode: value }, () => {
        this.props.onSettingChange({
          id: this.props.id,
          config: this.props.config.set('versionConfig', localConfig)
        })
      })
    } else {
      this.setState({ configObject: localConfig }, () => {
        this.props.onSettingChange({
          id: this.props.id,
          config: this.props.config.set('versionConfig', localConfig)
        })
      })
    }
  }

  updateArrangementItem = (node: string) => {
    const localConfig = { ...this.state.configObject }
    localConfig.arrangement = node
    this.setState({ configObject: localConfig, arrangementStyle: node }, () => {
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('versionConfig', localConfig)
      })
    })
  }

  //<JimuMapViewComponent useMapWidgetIds={this.props.config.useMapWidgetIds} onViewsCreate={()=>{}}></JimuMapViewComponent>
  //      {this.renderMapWidgetSelector()}
  //{(this.state.showWebMapSelector)?this.renderWebMapSelector():''}
  render () {
    const { theme } = this.props

    return <div className="widget-setting-demo">

      <SettingSection className="map-selector-section" title={this.formatMessage('layoutStyleTitle')}>
        <SettingRow>
          <Tooltip title={this.formatMessage('layoutStyleBasic')} placement="bottom">
            <div key={'simpleMode'}>
              <Button onClick={() => { this.arrangementHandler('simple') }}
                icon size="sm" type="tertiary" active={(this.state.arrangementStyle === 'simple')}
                style={{ backgroundColor: theme.ref.palette.neutral[300], border: (this.state.arrangementStyle === 'simple') ? 'solid #00aabb' : '' }}>
                <Icon width={95} height={95} icon={require('./assets/arrange_basic.svg')} ></Icon>
              </Button>
              <div style={{ display: 'flex', justifyContent: 'center' }}>{this.formatMessage('layoutStyleBasic')}</div>
            </div>
          </Tooltip>
          <div style={{ padding: '0 10px' }}></div>
          <Tooltip title={this.formatMessage('layoutStyleAdvanced')} placement="bottom">
            <div key={'advanceMode'}>
              <Button onClick={() => { this.arrangementHandler('management') }}
                icon size="sm" type="tertiary" active={(this.state.arrangementStyle === 'management')}
                style={{ backgroundColor: theme.ref.palette.neutral[300], border: (this.state.arrangementStyle === 'management') ? 'solid #00aabb' : '' }}>
                <Icon width={95} height={95} icon={require('./assets/arrange_advanced.svg')} ></Icon>
              </Button>
              <div style={{ display: 'flex', justifyContent: 'center' }}>{this.formatMessage('layoutStyleAdvanced')}</div>
            </div>
          </Tooltip>
        </SettingRow>
      </SettingSection>

      {this.renderServiceSelector()}

      {this.renderGeneralSection()}

      {(this.state.showSidePanel) && this.renderConfigSlideout()}

    </div>
  }

  onToggleUseDataEnabled = (useDataSourcesEnabled: boolean) => {
    // something else you want to do

    this.props.onSettingChange({
      id: this.props.id,
      useDataSourcesEnabled
    })
  }

  _checkDSInfo = (useDataSources: UseDataSource[]) => {
    const ds = DataSourceManager.getInstance()
    const dsList = ds.getDataSources()
    for (const key in dsList) {
      // eslint-disable-next-line no-empty
      if (dsList[key].type === 'FEATURE_SERVICE') {
      }
    }
  }

  arrangementHandler = (type: string) => {
    this.updateArrangementItem(type)
  }

  renderFieldOrderList = () => {
    //{field:'access', alias:'Access', show:true, sort:'desc', order:2},
    const fieldsList = []
    let fieldsPart = []
    if (Object.keys(this.state.selectedService).length > 0) {
      const immObj = Immutable(this.state.vmsServices)
      const localConfig = Immutable.asMutable(immObj, { deep: true })
      if (this.state.selectedService !== '') {
        const activeService = localConfig.filter((v: any) => {
          return v.name === this.state.selectedService.name
        })
        if (activeService.length > 0) {
          fieldsPart = activeService[0].configuredSettings.displayInfo
        }
      }
      fieldsPart.sort(this._compare('order', 'desc'))
      fieldsPart.forEach((ff: any) => {
        for (const key in defaultMessages) {
          if (key.toLowerCase() === ('fieldColumns' + ff.field).toLowerCase()) {
            ff.alias = this.formatMessage(key)
          }
        }
      })

      fieldsPart.forEach((fld: any, i: number) => {
        if (fld.available) {
          fieldsList.push(
            <tr key={fld.field}>
              <td style={{ fontSize: 'smaller' }}>{fld.alias}</td>
              <td>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  {(i > 0)
                    ? <Button icon type="tertiary" size="sm" onClick={() => { this.changeFieldOrder('up', i) }}>
                      <Icon icon={upArrowIcon} size="12" color="#fff" /></Button>
                    : <Button icon type="tertiary" size="sm"></Button>}
                  {(i < fieldsPart.length - 1)
                    ? <Button icon type="tertiary" size="sm" onClick={() => { this.changeFieldOrder('down', i) }}>
                      <Icon icon={downArrowIcon} size="12" color="#fff" /></Button>
                    : <Button icon type="tertiary" size="sm"></Button>}
                </div>
              </td>
            </tr>
          )
        }
      })
    }

    return (
      <Table style={{ height: '100%' }}>
        <thead>
          <tr>
            <th style={{ fontSize: 'smaller' }}>{this.formatMessage('field')}</th>
            <th style={{ fontSize: 'smaller' }}></th>
          </tr>
        </thead>
        <tbody>
          {fieldsList}
        </tbody>
      </Table>
    )
  }

  renderConfigSlideout = () => {
    const { theme } = this.props
    let allowanceAllFlag = true
    allowanceAllFlag = this._checkAllowAllState()

    return (
      <SidePopper isOpen={this.state.showSidePanel} position="right" toggle={() => { this.setState({ showSidePanel: !this.state.showSidePanel }) }}
        trigger={this.sidePopperTrigger?.current}
      >
        <div style={{ height: '100%', overflow: 'auto' }}>
          <div style={{ textAlign: 'right', width: '100%' }}>
            <Button size="sm" icon type="tertiary" className="ml-2" onClick={() => { this.setState({ showSidePanel: false }) }}><Icon icon={closeIcon} size="16" /></Button>
          </div>

          {(this.state.selectedService.hasOwnProperty('name')) && this.renderVersionSelector()}

          {(this.state.arrangementStyle !== 'simple') ? (this.state.selectedService.hasOwnProperty('name')) && this.renderVersionInformation() : ''}

          {(this.state.arrangementStyle !== 'simple')
            ? (this.state.selectedService.hasOwnProperty('name')) &&
            <SettingSection className="map-selector-section" title={
              <React.Fragment>
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                  <div style={{ display: 'flex', flex: 1 }}>{this.formatMessage('settingsSectionsVersionCapability')}</div>
                  <Tooltip title={this.formatMessage('settingsSectionsVersionCapabilityTooltip')} placement="bottom">
                    <div><Icon icon={infoIcon} size="16" color={theme.ref.palette.neutral[800]} /></div>
                  </Tooltip>
                </div>
              </React.Fragment>
            }>
              <SettingRow>
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <div style={{ paddingBottom: '5px', display: 'flex', flexDirection: 'row', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'row', flex: 4, justifyContent: 'flex-end' }}></div>
                    <div style={{ display: 'flex', flexDirection: 'row', flex: 1, justifyContent: 'flex-end' }}>{this.formatMessage('settingsSectionsAllowCapability')}</div>
                  </div>
                  <div style={{ paddingBottom: '5px', display: 'flex', flexDirection: 'row', flex: 1 }}>
                    <div style={{ display: 'flex', flexDirection: 'row', flex: 4, justifyContent: 'flex-end', paddingLeft: 5, paddingRight: 5, paddingBottom: 5 }}>
                      {this.formatMessage('settingsSectionsAllowAll')}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'row', flex: 1, justifyContent: 'flex-end', borderBottom: '1px solid #ccc', paddingBottom: 5 }}>
                      <Switch checked={allowanceAllFlag} onChange={(evt: any) => { this.updateAllowanceAction(null, evt.currentTarget.checked, true) }} />
                    </div>
                  </div>
                  {this.renderAllowances('advance')}
                </div>
              </SettingRow>
            </SettingSection>
            : <SettingSection>{this.renderAllowances('simple')}</SettingSection>
          }

        </div>
      </SidePopper>
    )
  }

  _checkAllowAllState = () => {
    let status = true
    const localConfig = Immutable(this.state.vmsServices)
    if (this.state.selectedService !== '') {
      const activeService = localConfig.filter((v: any) => {
        return v.name === this.state.selectedService.name
      })
      if (activeService.length > 0) {
        const allowancePart = activeService[0].configuredSettings.allowance
        status = !allowancePart.some((allow: any) => {
          return allow.enabled === false
        })
      }
    }
    return status
  }

  renderAllowances = (mode: string) => {
    const list = []
    let allowancePart = []
    const localVms = Immutable(this.state.vmsServices)
    const localConfig = Immutable.asMutable(localVms, { deep: true })
    if (this.state.selectedService !== '') {
      const activeService = localConfig.filter((v: any) => {
        return v.name === this.state.selectedService.name
      })
      if (activeService.length > 0) {
        allowancePart = activeService[0].configuredSettings.allowance
      }
    }
    allowancePart.forEach((all: any) => {
      for (const key in defaultMessages) {
        if (key.toLowerCase() === ('allowances' + all.key).toLowerCase()) {
          all.label = this.formatMessage(key)
        }
      }
    })
    allowancePart.forEach((al: any) => {
      if (mode === 'advance') {
        list.push(
          <div key={al.label} style={{ paddingBottom: '5px', display: 'flex', flexDirection: 'row', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'row', flex: 4 }}>{al.label}</div>
            <div style={{ display: 'flex', flexDirection: 'row', flex: 1, justifyContent: 'flex-end' }}>
              <Switch checked={al.enabled} onChange={((evt: any) => { this.updateAllowanceAction(al.key, evt.currentTarget.checked, false) })} />
            </div>
          </div>
        )
      } else {
        if (al.key === 'AutoRefreshList') {
          list.push(
            <div key={al.label} style={{ paddingBottom: '5px', display: 'flex', flexDirection: 'row', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'row', flex: 4 }}>{al.label}</div>
              <div style={{ display: 'flex', flexDirection: 'row', flex: 1, justifyContent: 'flex-end' }}>
                <Switch checked={al.enabled} onChange={((evt: any) => { this.updateAllowanceAction(al.key, evt.currentTarget.checked, false) })} />
              </div>
            </div>
          )
        }
      }
      if (al.key === 'AutoRefreshList') {
        if (al.enabled) {
          list.push(
            <div key={'refreshInterval'} style={{ paddingBottom: '5px', display: 'flex', flexDirection: 'row', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'row', flex: 6 }}>
                {this.formatMessage('settingsSectionsMinutes')}
              </div>
              <div
                style={{
                  textAlign: 'right',
                  display: 'flex',
                  flexDirection: 'row',
                  flex: 1
                }}
              >
                <NumericInput
                  style={{ width: 75 }}
                  value={this.state.intervalNumber}
                  size={'sm'}
                  min={1}
                  max={999}
                  type='number'
                  onChange={(value) => {
                    this.setState(
                      { invalidInterval: true, intervalNumber: value },
                      () => {
                        this.updateAllowanceInterval(al.key, value)
                      }
                    )
                  }}
                />

              </div>
            </div>
          )
          list.push(
            <div
              key={'toolTipHolder'}
              style={{
                textAlign: 'right',
                fontSize: '12px',
                fontStyle: 'italic'
              }}>
              {this.formatMessage('settingsSectionsTooltipNumber')}
            </div>
          )
        }
      }
    })
    return list
  }

  updateAllowanceInterval = (key: string, value: number) => {
    if (this.state.selectedService !== '') {
      let allowancePart = []
      const immObj = Immutable(this.state.vmsServices)
      const localVMS = Immutable.asMutable(immObj, { deep: true })
      localVMS.forEach((v: any) => {
        if (v.name === this.state.selectedService.name) {
          allowancePart = v.configuredSettings.allowance
          allowancePart.forEach((allow: any) => {
            if (allow.key === key) {
              allow.refreshInterval = value
            }
          })
        }
      })
      this.setState({ vmsServices: localVMS }, () => {
        this._updateServicesToConfig()
      })
    }
  }

  updateAllowanceAction = (key: string, value: boolean, updateAll: boolean) => {
    if (this.state.selectedService !== '') {
      let allowancePart = []
      const immObj = Immutable(this.state.vmsServices)
      const localVMS = Immutable.asMutable(immObj, { deep: true })
      localVMS.forEach((v: any) => {
        if (v.name === this.state.selectedService.name) {
          allowancePart = v.configuredSettings.allowance
          allowancePart.forEach((allow: any) => {
            if (updateAll) {
              allow.enabled = value
            } else {
              if (allow.key === key) {
                allow.enabled = value
              }
            }
          })
        }
      })
      this.setState({ vmsServices: localVMS }, () => {
        this._updateServicesToConfig()
      })
    }
  }

  updateActiveService = () => {
    if (this.state.selectedService !== '') {
      const immObj = Immutable(this.state.vmsServices)
      const localVMS = Immutable.asMutable(immObj, { deep: true })
      localVMS.forEach((v: any) => {
        if (v.name === this.state.selectedService.name) {
          v.activeInBuilder = true
        } else {
          v.activeInBuilder = false
        }
      })
      this.setState({ vmsServices: localVMS }, () => {
        this._updateServicesToConfig()
      })
    }
  }

  renderServiceSelector = () => {
    const { theme } = this.props
    const rows = []
    const helpLink = 'https://pro.arcgis.com/en/pro-app/latest/help/data/geodatabases/overview/register-a-dataset-as-branch-versioned.htm'
    if (this.state.vmsServices.length > 0) {
      this.state.vmsServices.forEach((s: any, idx: number) => {
        const tableRow = <tr key={s.name} style={{ borderLeft: (s.name === this.state.selectedService.name) ? 'solid #00aabb' : '' }} >
          {
            (this.state.vmsServices.length > 1) &&
            <td>
              {(idx > 0) ? <Button icon type="tertiary" size="sm" onClick={() => { this.changeServiceOrder('up', idx) }}><Icon icon={upArrowIcon} size="12" color="#fff" /></Button> : ''}
              {(idx < this.state.vmsServices.length - 1)
                ? <Button icon type="tertiary" size="sm" onClick={() => { this.changeServiceOrder('down', idx) }}>
                  <Icon icon={downArrowIcon} size="12" color="#fff" /></Button>
                : ''}
            </td>
          }
          <td role={'button'} style={{ fontSize: 'smaller', width: '100%' }} onClick={() => { this.serviceSelectorAction(s) }}>{s.name}</td>
          <td role={'button'} style={{ fontSize: 'smaller' }} onClick={() => { this.serviceRemoveAction(s) }}>
            <Icon icon={closeIcon} size="12" />
          </td>
        </tr>
        rows.push(tableRow)
      })
    }

    return (
      <SettingSection className="map-selector-section" title={
        <React.Fragment>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <Tooltip title={this.formatMessage('settingsSectionsVersionService')} placement="bottom">
              <div style={{ width: '100%', paddingRight: 20, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {this.formatMessage('settingsSectionsVersionService')}
              </div>
            </Tooltip>
            <Tooltip title={this.formatMessage('settingsSectionsVersionServiceHelp')} placement="bottom">
              <div onClick={() => { window.open(helpLink, '_blank') }} style={{ cursor: 'pointer' }}><Icon icon={helpIcon} size="16" color={theme.ref.palette.neutral[800]} /></div>
            </Tooltip>
          </div>
        </React.Fragment>
      }>
        <SettingRow>
          <DataSourceSelector types={Immutable([AllDataSourceTypes.FeatureService, AllDataSourceTypes.MapService])}
            mustUseDataSource={true}
            isMultiple={true}
            useDataSourcesEnabled={this.props.useDataSourcesEnabled}
            onToggleUseDataEnabled={this.onToggleUseDataEnabled}
            onChange={this.validateVMSExist} widgetId={this.props.id}
            closeDataSourceListOnChange={true}
          />
        </SettingRow>
        <SettingRow>
          <Alert
            form="basic"
            type="warning"
            open={this.state.showAlert}
            closable={true}
            text={this.state.alertMessage}
            onClose={() => { this.setState({ showAlert: !this.state.showAlert }) }}>
          </Alert>
        </SettingRow>
        <SettingRow>
          <div className="w-100">
            <div className="component-map-selector" style={{ maxHeight: 300, overflow: 'auto' }} ref={this.sidePopperTrigger}>
              <Table size="sm" hover style={{ fontSize: 'medium' }}>
                <tbody>{rows}</tbody>
              </Table>
            </div>
          </div>
        </SettingRow>
      </SettingSection>
    )
  }

  validateVMSExist = async (evt: any) => {
    const ds = DataSourceManager.getInstance()
    const dsList = ds.getDataSources()
    let validVMS = false
    let alreadyExist = false
    for (const key in dsList) {
      if (key === evt[0].dataSourceId) {
        //see if it is a VMS service
        const dsJson = dsList[key].getDataSourceJson()
        let trunURL = dsJson.url

        if (dsJson.url.includes('FeatureServer')) {
          trunURL = dsJson.url.substring(0, dsJson.url.indexOf('FeatureServer'))
        }
        if (dsJson.url.includes('MapServer')) {
          trunURL = dsJson.url.substring(0, dsJson.url.indexOf('MapServer'))
        }
        if (this.state.vmsServices.length > 0) {
          const filtered = this.state.vmsServices.filter((v: any) => {
            return v.name === dsList[key].getLabel() || v.url === trunURL
          })
          if (filtered.length > 0) {
            alreadyExist = true
          }
        }

        if (!alreadyExist) {
          //get the session since it might be coming from a different host.  To pass a token to the VMS
          const serviceToken = this.getServiceToken(trunURL)

          let valid = false
          if (serviceToken !== null) {
            valid = await this.vms.checkValidVMS(trunURL, serviceToken)
          } else {
            valid = await this.vms.checkValidVMS(trunURL)
          }
          if (valid) {
            validVMS = true
            const VMSObject = {} as any
            const immObj = Immutable(this.state.vmsServices)
            const localServices = Immutable.asMutable(immObj, { deep: true })
            VMSObject.name = dsList[key].getLabel()
            VMSObject.url = trunURL
            VMSObject.datasource = key
            VMSObject.activeInBuilder = true
            VMSObject.configuredSettings = {
              startupVersion: this.defaultVersion,
              startOnLoad: false,
              allowance: Immutable.asMutable(Immutable(this.allowance), { deep: true }),
              displayInfo: Immutable.asMutable(Immutable(this.fieldColumns), { deep: true })
            }
            localServices.forEach((v: any) => {
              v.activeInBuilder = false
            })
            localServices.push(VMSObject)
            this.setState({ vmsServices: localServices, showAlert: false, alertMessage: '', selectedService: VMSObject, showSidePanel: true }, () => {
              this._updateServicesToConfig(evt)
              this.pullVersions(this.state.selectedService)
              //this.serviceSelectorAction(VMSObject);
            })
          }
        }
      }
    }
    if (alreadyExist) {
      this.setState({ showAlert: true, alertMessage: this.formatMessage('alertMessagesAlreadyAdded') })
    } else {
      if (!validVMS) {
        this.setState({ showAlert: true, alertMessage: this.formatMessage('alertMessagesNotValid') })
      }
    }
  }

  serviceSelectorAction = (value: any) => {
    if (value !== '') {
      const vms = this.state.vmsServices.filter((v: any) => {
        return v.name === value.name
      })
      if (vms.length > 0) {
        this.setState({
          selectedService: vms[0],
          showSidePanel: true,
          intervalNumber: (vms[0].configuredSettings.allowance[7].refreshInterval),
          searchVersionText: '',
          showAlert: false
        }, () => {
          this.pullVersions(this.state.selectedService)
          this.updateActiveService()
        })
      }
    } else {
      this.setState({ selectedService: '', showSidePanel: false, intervalNumber: 1, invalidInterval: false, searchVersionText: '' })
    }
  }

  serviceRemoveAction = (value: any) => {
    if (value) {
      let pos = -1
      let isSelected = false
      const immObj = Immutable(this.state.vmsServices)
      const localVMS = Immutable.asMutable(immObj, { deep: true })
      localVMS.forEach((v: any, i: number) => {
        if (v.name === value.name) {
          pos = i
          if (this.state.selectedService !== '') {
            if (v.name === this.state.selectedService.name) {
              isSelected = true
            }
          }
        }
      })
      if (pos !== -1) {
        localVMS.splice(pos, 1)
        if (isSelected) {
          this.setState({ vmsServices: localVMS, selectedService: '', showSidePanel: false, searchVersionText: '' }, () => {
            this._updateServicesToConfig()
          })
        } else {
          this.setState({ vmsServices: localVMS }, () => {
            this._updateServicesToConfig()
          })
        }
      }
    }
  }

  renderVersionSelector = () => {
    let startVersion = this.defaultVersion
    let defaultInService = null
    const versionList = []
    let found = false
    // eslint-disable-next-line array-callback-return
    const savedStartUp = this.state.vmsServices.filter((v: any) => {
      if (this.state.selectedService !== '') {
        if (v.name === this.state.selectedService.name) { return v }
      }
    })
    if (savedStartUp.length > 0) {
      startVersion = savedStartUp[0].configuredSettings.startupVersion
    }
    if (this.state.searchVersionText !== '') {
      if (this.state.filteredVersionList.length > 0) {
        startVersion = this.state.filteredVersionList[0].versionGuid
      }
    }
    this.state.filteredVersionList.forEach((v: any) => {
      if (v.versionName === this.defaultVersion) {
        defaultInService = v.versionGuid
      }
      if (startVersion === v.versionGuid) {
        found = true
      }
      if (this.state.searchVersionText === v.versionName) {
        found = true
        startVersion = v.versionGuid
      }
      versionList.push(<option key={v.versionGuid} value={v.versionGuid}>{v.versionName}</option>)
    })
    if (!found) {
      //if name of version is no longer found, switch it back to default.
      if (defaultInService !== null) {
        startVersion = defaultInService
      } else {
        startVersion = this.defaultVersion
      }
    }
    return (
      <SettingSection className="map-selector-section" title={this.formatMessage('settingsSectionsSelectVersion')}>
        <SettingRow>
          <TextInput type="text" onChange={this.searchVersions} value={this.state.searchVersionText} placeholder={this.formatMessage('settingsSectionsSearchName')} style={{ width: '100%' }} />
        </SettingRow>
        <SettingRow>
          <Select onChange={(evt: any) => { this.updateVersionSelected(evt.currentTarget) }} defaultValue={startVersion} value={startVersion}>
            {versionList}
          </Select>
        </SettingRow>
      </SettingSection>
    )
  }

  updateVersionSelected = (e: any) => {
    const immObj = Immutable(this.state.vmsServices)
    const localVMS = Immutable.asMutable(immObj, { deep: true })
    localVMS.forEach((v: any, i: number) => {
      if (this.state.selectedService !== '') {
        if (v.name === this.state.selectedService.name) {
          v.configuredSettings.startupVersion = e.value
        }
      }
    })
    if (this.state.searchVersionText !== '') {
      this.setState({ vmsServices: localVMS, searchVersionText: e.textContent }, () => {
        this._updateServicesToConfig()
      })
    } else {
      this.setState({ vmsServices: localVMS }, () => {
        this._updateServicesToConfig()
      })
    }
  }

  renderGeneralSection = () => {
    let defaultVal = 10
    const localConfig = { ...this.state.configObject }
    if (localConfig.hasOwnProperty('pageCounter')) {
      defaultVal = localConfig.pageCounter
    }
    const pageValues = [
      <option key={'5'} value={5}>5</option>,
      <option key={'10'} value={10}>10</option>,
      <option key={'25'} value={25}>25</option>,
      <option key={'50'} value={50}>50</option>
    ]
    return (
      <React.Fragment>
        <SettingSection className="map-selector-section" title={this.formatMessage('settingsSectionsGeneralSettings')}>
          <SettingRow>
            {this.formatMessage('settingsSectionsRecordsPage')}
          </SettingRow>
          <SettingRow>
            <Select size={'sm'} onChange={(evt: any) => { this.updateGeneralItem(evt.currentTarget.value, 'pageCounter') }} defaultValue={defaultVal}>
              {pageValues}
            </Select>
          </SettingRow>
        </SettingSection>
        <SettingSection className="map-selector-section" title={''}>
          <SettingRow>
            {this.formatMessage('settingsSectionsExpandBasic')}
          </SettingRow>
          <SettingRow>
            <Switch checked={this.state.expandMode} onChange={((evt: any) => { this.updateGeneralItem(evt.currentTarget.checked, 'expandMode') })} />
          </SettingRow>
        </SettingSection>
      </React.Fragment>
    )
  }

  pullVersions = (service: any) => {
    let requestURL = service.url
    if (service.url.indexOf('FeatureServer') >= 0) {
      requestURL = service.url.substring(0, service.url.indexOf('FeatureServer'))
    }
    if (service.url.indexOf('MapServer') >= 0) {
      requestURL = service.url.substring(0, service.url.indexOf('MapServer'))
    }

    let validToken = this.getServiceToken(requestURL)
    if (validToken === null) {
      validToken = undefined
    }

    this.vms.getVersions(service.name, requestURL, validToken).then((result: any) => {
      if (result.hasOwnProperty('success')) {
        if (result.success) {
          if (result.hasOwnProperty('versions')) {
            this.setState({ filteredVersionList: result.versions, allVersionList: result.versions })
          }
        }
      } else {
        if (result.hasOwnProperty('error')) {
          this.setState({ filteredVersionList: [], allVersionList: [] })
        }
      }
    })
  }

  searchVersions = (value: any) => {
    const allVersions = [...this.state.allVersionList]
    const filtered = allVersions.filter((v: any) => {
      return (v.versionName).toLowerCase().indexOf((value.currentTarget.value).toLowerCase()) >= 0
    })
    this.setState({ filteredVersionList: filtered, searchVersionText: value.currentTarget.value }, () => {
      if (this.state.filteredVersionList.length > 0) {
        this.updateConfigItem(this.state.filteredVersionList[0].versionGuid, 'startupVersion')
      }
    })
  }

  renderVersionInformation = () => {
    const { theme } = this.props
    const fieldList = []
    let fieldsPart = []
    const immObj = Immutable(this.state.vmsServices)
    const localConfig = Immutable.asMutable(immObj, { deep: true })
    if (this.state.selectedService !== '') {
      const activeService = localConfig.filter((v: any) => {
        return v.name === this.state.selectedService.name
      })
      if (activeService.length > 0) {
        fieldsPart = activeService[0].configuredSettings.displayInfo
      }
      if (fieldsPart.length > 0) {
        const onlyOneShown = () => {
          let result = false
          const shown = fieldsPart.filter((lf: any) => {
            return lf.show === true
          })
          if (shown.length <= 1) {
            result = true
          }
          return result
        }
        const disableChk = onlyOneShown()
        fieldsPart.sort(this._compare('order', 'desc'))
        fieldsPart.forEach((ff: any) => {
          for (const key in defaultMessages) {
            if (key.toLowerCase() === ('fieldColumns' + ff.field).toLowerCase()) {
              ff.alias = this.formatMessage(key)
            }
          }
        })
        fieldsPart.forEach((fld: any) => {
          fieldList.push(
            <tr key={fld.field}>
              <td style={{ fontSize: 12, textAlign: 'left' }}>{fld.alias}</td>
              <td><Checkbox className="mr-2 font-13" checked={fld.available}
                onChange={(evt: any) => { this.changeFieldVisiblity(evt.currentTarget.value, 'available', evt.currentTarget.checked) }} value={fld.field} /></td>
              <td><Checkbox className="mr-2 font-13" checked={fld.show} disabled={(fld.show) ? disableChk : false}
                onChange={(evt: any) => { this.changeFieldVisiblity(evt.currentTarget.value, 'show', evt.currentTarget.checked) }} value={fld.field} /></td>
            </tr>
          )
        })
      }
    }

    return (
      <SettingSection className="map-selector-section" title={
        <React.Fragment>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div style={{ display: 'flex', flex: 1 }}>{this.formatMessage('settingsSectionsVersionInfo')}</div>
            <Tooltip title={this.formatMessage('settingsSectionsVersionInfoTooltip')} placement="bottom">
              <div><Icon icon={infoIcon} size="16" color={theme.ref.palette.neutral[800]} /></div>
            </Tooltip>
          </div>
        </React.Fragment>
      }>
        <SettingRow>
          <div className="w-100">
            <div className="component-map-selector" style={{ maxHeight: 250, overflow: 'auto' }}>
              <Table size="sm" hover width="90%" style={{ textAlign: 'center' }}>
                <thead>
                  <tr>
                    <th style={{ position: 'sticky', top: 0, backgroundColor: '#000', border: '#000', fontSize: 'smaller', whiteSpace: 'nowrap', alignItems: 'top', zIndex: 9999 }}>
                      <Button type="tertiary" onClick={(evt: any) => { this.toggleDialogAction('fieldMgmt', 'showFieldMgmt') }} id="btnFieldMgmt">
                        <Icon icon={appSortIcon} size="14" color="#fff" />
                      </Button>
                    </th>
                    <th style={{ position: 'sticky', top: 0, backgroundColor: '#000', border: '#000', fontSize: 13, whiteSpace: 'nowrap', alignItems: 'center', zIndex: 9999 }}>
                      {this.formatMessage('fieldColumnsColumnAvailable')}
                    </th>
                    <th style={{ position: 'sticky', top: 0, backgroundColor: '#000', border: '#000', fontSize: 13, whiteSpace: 'nowrap', alignItems: 'center', zIndex: 9999 }}>
                      {this.formatMessage('fieldColumnsColumnShow')}
                    </th>
                  </tr>
                </thead>
                <tbody>{fieldList}</tbody>
              </Table>
            </div>
          </div>
        </SettingRow>
        <FloatingPanel
          open={this.state.showFieldMgmt}
          reference={'btnFieldMgmt'}
          placement={'left'}
          onHeaderClose={() => { this.toggleDialogAction('fieldMgmt', 'showFieldMgmt') }}
          toggle={() => { this.toggleDialogAction('fieldMgmt', 'showFieldMgmt') }}
          defaultSize={{ width: 250, height: 600 }}
        >
          <div style={{ width: 250, height: '100%', overflow: 'auto' }}>
            {this.renderFieldOrderList()}
          </div>
        </FloatingPanel>
      </SettingSection>
    )
  }

  changeFieldOrder = (direction: string, index: number) => {
    if (this.state.selectedService !== '') {
      let fieldsPart = []
      const immObj = Immutable(this.state.vmsServices)
      const localVMS = Immutable.asMutable(immObj, { deep: true })
      localVMS.forEach((v: any) => {
        if (v.name === this.state.selectedService.name) {
          fieldsPart = v.configuredSettings.displayInfo
          fieldsPart.sort(this._compare('order', 'desc'))
          let newPos = index
          if (direction === 'up') {
            newPos = newPos - 1
            fieldsPart[index].order = newPos
            fieldsPart[index - 1].order = index
          } else {
            newPos = newPos + 1
            fieldsPart[index].order = newPos
            fieldsPart[index + 1].order = index
          }
        }
      })
      this.setState({ vmsServices: localVMS }, () => {
        this._updateServicesToConfig()
      })
    }
  }

  changeServiceOrder = (direction: string, index: number) => {
    const immObj = Immutable(this.state.vmsServices)
    const localVMS = Immutable.asMutable(immObj, { deep: true })
    const f = localVMS.splice(index, 1)[0]
    if (direction === 'up') {
      localVMS.splice(index - 1, 0, f)
    } else {
      localVMS.splice(index + 1, 0, f)
    }
    this.setState({ vmsServices: localVMS }, () => {
      this._updateServicesToConfig()
    })
  }

  changeFieldVisiblity = (updField: string, task: string, value: boolean) => {
    if (this.state.selectedService !== '') {
      let fieldsPart = []
      const immObj = Immutable(this.state.vmsServices)
      const localVMS = Immutable.asMutable(immObj, { deep: true })
      localVMS.forEach((v: any) => {
        if (v.name === this.state.selectedService.name) {
          fieldsPart = v.configuredSettings.displayInfo
          fieldsPart.forEach((fld: any) => {
            if (fld.field === updField) {
              fld[task] = value
            }
          })
        }
      })
      this.setState({ vmsServices: localVMS }, () => {
        this._updateServicesToConfig()
      })
    }
  }

  _compare = (prop: any, direction: string) => {
    return function (a: any, b: any) {
      let comparison = 0
      if (direction === 'desc') {
        if (a[prop] > b[prop]) {
          comparison = 1
        } else if (a[prop] < b[prop]) {
          comparison = -1
        }
      } else {
        if (a[prop] < b[prop]) {
          comparison = 1
        } else if (a[prop] > b[prop]) {
          comparison = -1
        }
      }
      return comparison
    }
  }

  updateVMSInfo = (param: any, value: any) => {
    return new Promise((resolve, reject) => {
      const selectedCopy = { ...this.state.selectedService }
      if (param === 'configured') {
        selectedCopy[param] = value
      } else {
        selectedCopy.configuredSettings[param] = value
      }
      this.setState({ selectedService: selectedCopy }, () => {
        const vmsCopy = [...this.state.vmsServices]
        vmsCopy.forEach((v: any) => {
          if (v.name === this.state.selectedService.name) {
            v = this.state.selectedService
          }
        })
        this.setState({ vmsServices: vmsCopy }, () => {
          resolve(true)
        })
      })
    })
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

  toggleDialogAction = (type: string, key: string) => {
    this.setState({ showFieldMgmt: !this.state.showFieldMgmt })
  }

  getStyle = (theme: IMThemeVariables): SerializedStyles => {
    return css`
      .simple-view-header{
        background: ${theme.sys.color.secondary.main};
      }

    `
  }
}
