/* eslint-disable react/no-unused-class-component-methods */

import { React, Immutable, DataSourceManager, SessionManager, DataSourceTypes } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { MapWidgetSelector, SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { MapViewManager, loadArcGISJSAPIModules } from 'jimu-arcgis'
import { Select, Option, Button, Checkbox, Label, TextInput, Tooltip, Switch, Collapse } from 'jimu-ui'
import type { IMConfig } from '../config'
import defaultMessages from './translations/default'
import './assets/style.css'

interface State {
  groupList: any
  selectContent: string
  folderList: any
  itemList: any
  orgGroupList: any
  contentList: any
  oicList: any
  layerEditCollapseFlags: any
  apiLoaded: boolean
  oic: any
}

// const arrowDown = require('jimu-ui/lib/icons/arrow-down-12.svg')
// const arrowUp = require('jimu-ui/lib/icons/arrow-up-12.svg')

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>, State> {
  supportedTypes = Immutable([DataSourceTypes.WebMap])
  dsManager = DataSourceManager.getInstance()
  userContentInfo: any
  OICList: any[]
  mapView: any
  mvManager: MapViewManager = MapViewManager.getInstance()
  vectorLayers: any[]
  featureLayerCss: string = 'oi-hideFeatureLayers'
  Portal: typeof __esri.Portal
  esriRequest: typeof __esri.request
  IdentityManager: typeof __esri.IdentityManager
  MapView: typeof __esri.MapView
  unmount: boolean = false

  constructor (props) {
    super(props)
    this.state = {
      groupList: [],
      selectContent: this.props.config.catalogSourceType,
      folderList: [],
      itemList: [],
      orgGroupList: [],
      contentList: [],
      oicList: [],
      oic: this.props.config.catalogSelectDefault,
      layerEditCollapseFlags: {},
      apiLoaded: false
    }
  }

  onMapSelected = (useMapWidgetIds: any) => {
    if (useMapWidgetIds.length > 0) {
      // document.getElementById("oi-widget").style.display = "block"

      this.mapView = (this.mvManager as any).jimuMapViewGroups[
        useMapWidgetIds[0]
      ].getActiveJimuMapView()?.view
      //var map = this.mvManager.getJimuMapViewById(useMapWidgetIds[0])

      //oiapi issue #222
      if (
        this.props.useMapWidgetIds === undefined ||
        this.props.useMapWidgetIds === null ||
        this.props.useMapWidgetIds?.[0] !== useMapWidgetIds[0]
      ) {
        this.vectorLayers = []
        const layers = this.mapView?.map.layers
        if (layers) {
          for (let i = 0; i < layers.length; i++) {
            if (layers.getItemAt(i).type === 'feature') {
              const layer: any = {}
              layer.title = layers.getItemAt(i).title
              layer.id = layers.getItemAt(i).id
              this.vectorLayers.push({
                featureLayer: layer,
                addToViewer: false,
                editing: false
              })
            }
          }
        }
        this.props.onSettingChange({
          id: this.props.id,
          config: this.props.config.set(
            'vectorLayers',
            this.vectorLayers
          )
        })
      }
    } else {
      this.vectorLayers = []
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config
          .set('vectorLayers', undefined)
          .set('editingEnabled', false)
      })
    }

    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds
    })
  }

  nls = (id: string) => {
    return this.props.intl ? this.props.intl.formatMessage({ id: id, defaultMessage: defaultMessages[id] }) : id
  }

  async componentDidMount () {
    if (!this.unmount) {
      if (!this.state.apiLoaded) {
        await loadArcGISJSAPIModules(['esri/portal/Portal', 'esri/request']).then((modules) => {
          [this.Portal, this.esriRequest] = modules
          this.setState({
            apiLoaded: true
          })
        })
        if (this.props.config.oicList.length > 0) {
          this.OICList = this.props.config.oicList
        } else {
          this.OICList = []
        }
        this.getOICFromUserAcc()
      }
      //#839
      if (this.props.useMapWidgetIds && !this.mapView) {
        this.onMapSelected(this.props.useMapWidgetIds)
      }
    }
  }

  componentWillUnmount () {
    this.unmount = true
  }

  getOICFromUserAcc = () => {
    const portal = new this.Portal({ url: this.props.portalUrl })
    portal.load().then((user) => {
      if (!this.userContentInfo) {
        this.userContentInfo = {
          userId: this.props.user.username,
          myFolders: {},
          myGroups: {},
          myOrgGroups: {},
          //myFavorites: {},
          user: user
        }

        for (let b = 0; b < this.props.user.groups.length; b++) {
          this.userContentInfo.myGroups[this.props.user.groups[b].title] = { id: this.props.user.groups[b].id, items: [] }
        }
        this.getOrganisationGroups(user)

        this.getOICFromFolders(user)
      }
    })
  }

  getOrganisationGroups = (user) => {
    this.esriRequest(user.restUrl + '/community/groups', {
      query: {
        f: 'json',
        q: 'orgid:' + this.props.user.orgId,
        start: 1,
        num: 50,
        sortField: 'title',
        sortOrder: 'asc'
      },
      responseType: 'json'
    }).then((result) => {
      const orgGroups = result.data
      for (let b = 0; b < orgGroups.results.length; b++) {
        this.userContentInfo.myOrgGroups[orgGroups.results[b].title] = { id: orgGroups.results[b].id, items: [] }
      }
    })
  }

  getOICFromFolders = (user) => {
    this.esriRequest(user.restUrl + '/content/users/' + this.props.user.username, {
      query: {
        f: 'json',
        token: SessionManager.getInstance().getMainSession()?.token
      },
      responseType: 'json'
    }).then((userContent: any) => {
      userContent = userContent.data
      this.userContentInfo.myFolders[userContent.currentFolder || '[ root folder ]'] = { id: null, items: [] }
      for (let a = 0; a < userContent.items.length; a++) {
        if (userContent.items[a].type === 'Oriented Imagery Catalog') {
          this.userContentInfo.myFolders[userContent.currentFolder ||
            '[ root folder ]'].items.push({
            name: userContent.items[a].title,
            url: this.props.portalUrl + '/sharing/rest/content/items/' + userContent.items[a].id
          })
        }
      }
      for (const a in userContent.folders) {
        this.userContentInfo.myFolders[userContent.folders[a].title] = { id: userContent.folders[a].id, items: [] }
      }
      this.populateFolderGroupList(this.state.selectContent)
      this.populateOICList(this.props.config.catalogGroupFolder)
      //html.set("itemNotify", "");
      //this.hideLoading();
    }).catch(() => {
      this.populateFolderGroupList(this.state.selectContent)
      this.populateOICList(this.props.config.catalogGroupFolder)
      //html.set("itemNotify", "");
      //this.hideLoading();
    })
  }

  populateFolderGroupList = (value) => {
    let items
    if (value === 'content') {
      items = Object.keys(this.userContentInfo.myFolders)
    } else if (value === 'group') { //groupchange
      items = Object.keys(this.userContentInfo.myGroups)
    } else if (value === 'orgGroups') {
      items = Object.keys(this.userContentInfo.myOrgGroups)
    }
    // else {
    //     var items = Object.keys(this.userContentInfo.myFavorites);
    // }
    items?.sort(function (a, b) {
      a = a.toLowerCase().split(' ')[0]
      b = b.toLowerCase().split(' ')[0]
      if (a < b) {
        return -1
      }
      if (a > b) {
        return 1
      }
      return 0
    })

    this.setState({
      contentList: items
    })
  }

  handleGroupFolderChange = (evt) => {
    const folderGroup = evt.currentTarget.value
    this.populateOICList(folderGroup)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config
        .set('catalogGroupFolder', folderGroup)
        .set('catalogSelectDefault', null)
    })
  }

  populateOICList = (value) => {
    if (value) {
      let items
      if (this.state.selectContent === 'content') {
        items = this.userContentInfo?.myFolders[value].items
      } else if (this.state.selectContent === 'group') { //groupchange
        items = this.userContentInfo?.myGroups[value].items
      } else if (this.state.selectContent === 'orgGroups') {
        items = this.userContentInfo?.myOrgGroups[value].items
      }
      // else
      //     var items = this.userContentInfo.myFavorites[value];
      if (items.length) {
        items.sort(function (a, b) {
          a = a.name.toLowerCase().split(' ')[0]
          b = b.name.toLowerCase().split(' ')[0]
          if (a < b) {
            return -1
          }
          if (a > b) {
            return 1
          }
          return 0
        })
        const OIClist = []

        for (const a in items) {
          //this.addSelectOption(document.getElementById("agolOICList"), items[a].name, items[a].url);
          OIClist.push({ name: items[a].name, value: items[a].url })
        }
        this.setState({
          itemList: OIClist
        })
      } else {
        if (this.state.selectContent === 'content') { this.getOICFromFolder(value) } else { this.getOICFromGroup(value) }
      }
    }
  }

  getOICFromFolder = (value) => {
    const id = this.userContentInfo.myFolders[value].id
    this.esriRequest(this.userContentInfo.user.restUrl + '/content/users/' + this.props.user.username + '/' + id, {
      query: {
        f: 'json',
        token: SessionManager.getInstance().getMainSession()?.token

      },
      responseType: 'json'
    }).then((response: any) => {
      response = response.data
      if (response.items) {
        this.userContentInfo.myFolders[value].items = []
        for (let a = 0; a < response.items.length; a++) {
          if (response.items[a].type === 'Oriented Imagery Catalog') {
            this.userContentInfo.myFolders[value].items.push({ name: response.items[a].title, url: this.userContentInfo.user.restUrl + '/content/items/' + response.items[a].id })
          }
        }
        const items = this.userContentInfo.myFolders[value].items
        items.sort(function (a, b) {
          a = a.name.toLowerCase().split(' ')[0]
          b = b.name.toLowerCase().split(' ')[0]
          if (a < b) {
            return -1
          }
          if (a > b) {
            return 1
          }
          return 0
        })
        const OIClist = []

        for (const a in items) {
          //this.addSelectOption(document.getElementById("agolOICList"), items[a].name, items[a].url);
          OIClist.push({ name: items[a].name, value: items[a].url })
        }
        this.setState({
          itemList: OIClist
        })

        //this.hideLoading();
      } //else
      //this.hideLoading();
    }).catch(() => {
      //this.hideLoading();
    })
  }

  getOICFromGroup = (value) => {
    const id = this.userContentInfo.myGroups[value] ? this.userContentInfo.myGroups[value].id : this.userContentInfo.myOrgGroups[value].id //groupchange
    this.esriRequest(this.userContentInfo.user.restUrl + '/content/groups/' + id, {
      query: {
        f: 'json',
        token: SessionManager.getInstance().getMainSession()?.token
      },
      responseType: 'json'
    }).then((response: any) => {
      response = response.data
      if (response.items) {
        if (this.userContentInfo.myGroups[value]) {
          this.userContentInfo.myGroups[value].items = []
        } else if (this.userContentInfo.myOrgGroups[value]) {
          this.userContentInfo.myOrgGroups[value].items = []
        }
        for (let a = 0; a < response.items.length; a++) {
          if (response.items[a].type === 'Oriented Imagery Catalog') {
            if (this.userContentInfo.myGroups[value]) { //groupchange
              this.userContentInfo.myGroups[value].items.push({ name: response.items[a].title, url: this.userContentInfo.user.restUrl + '/content/items/' + response.items[a].id })
            } else {
              this.userContentInfo.myOrgGroups[value].items.push({ name: response.items[a].title, url: this.userContentInfo.user.restUrl + '/content/items/' + response.items[a].id })
            }
          }
        }
        const items = this.userContentInfo.myGroups[value] ? this.userContentInfo.myGroups[value].items : this.userContentInfo.myOrgGroups[value].items
        items.sort(function (a, b) {
          a = a.name.toLowerCase().split(' ')[0]
          b = b.name.toLowerCase().split(' ')[0]
          if (a < b) {
            return -1
          }
          if (a > b) {
            return 1
          }
          return 0
        })
        const OIClist = []

        for (const a in items) {
          //this.addSelectOption(document.getElementById("agolOICList"), items[a].name, items[a].url);
          OIClist.push({ name: items[a].name, value: items[a].url })
        }
        this.setState({
          itemList: OIClist
        })

        //this.hideLoading();
      } //else
      //this.hideLoading();
    }).catch(() => {
      //this.hideLoading();
    })
  }

  changeContent = (evt) => {
    if (evt.currentTarget.value !== 'itemurl') {
      this.populateFolderGroupList(evt.currentTarget.value)
    }
    this.setState({
      selectContent: evt.currentTarget.value,
      oic: null
    })
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config
        .set('catalogSourceType', evt.currentTarget.value)
        .set('catalogGroupFolder', null)
        .set('catalogSelectDefault', null)
        .set('itemUrlInput', null)
    })
  }

  chooseOIC = (evt) => {
    this.setState({
      oic: { name: evt.currentTarget.textContent, url: evt.currentTarget.value }
    })
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config
        .set('catalogSelectDefault', { name: evt?.currentTarget?.textContent, url: evt?.currentTarget?.value })
    })
  }

  getOICfromUrl = (value: string) => {
    const url = value
    if (url.includes('id=')) {
      //if (url.indexOf("/portal") !== -1)
      const itemUrl = url.split('/home')[0] + '/sharing/rest/content/items/' + (url.split('id=')[1]).split('/')[0] //#530
      // else
      //     var itemUrl = "https://www.arcgis.com" + "/sharing/rest/content/items/" + (url.split("id=")[1]).split("/")[0];
      this.esriRequest(itemUrl, {
        query: {
          f: 'json'
          //token: this.props.token
        },
        responseType: 'json'
      }).then((response) => {
        if (response.data && response.data.type === 'Oriented Imagery Catalog') {
          //#7136
          // this.OICList = []
          // this.OICList.push({ name: response.data.title, url: response.url })
          this.setState({
            oic: {
              name: response.data.title, url: response.url
            }
          })
        } else {
          //document.getElementById('addOICDialog').style.display = '';
          //this.errorNotification("Error! Item type is not OIC.");
        }
      }).catch((error) => {
        // this.esriRequest(error.details.url, {
        //   query: {
        //     f: 'json',
        //     token: this
        //   }
        // })
        console.log(error)
      })
    } else {
      // document.getElementById('addOICDialog').style.display = '';
      // this.errorNotification("Error! Please enter a valid OIC item url.");
    }
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config
        .set('itemUrlInput', value)
    })
  }

  addOICToList = () => {
    // if (this.state.selectContent !== 'itemurl') {
    //   this.OICList = []
    //   this.OICList.push(this.state.oic)
    // } else {
    //   this.OICList = []
    //   this.OICList.push(this.state.oic)
    // }
    this.OICList = []
    if (this.state.oic) this.OICList.push(this.state.oic)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('oicList', this.OICList)
    })
    this.setState({
      oicList: this.OICList
    })
  }

  deleteOICList = () => {
    this.OICList = []
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('oicList', this.OICList)
    })

    this.setState({
      oicList: this.OICList
    })
  }

  enableEditing = (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    //#861
    this.featureLayerCss = checked ? 'oi-showFeatureLayers' : 'oi-hideFeatureLayers'
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('editingEnabled', checked)
    })
  }

  enableLayerView = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    //oiapi issue #222
    this.vectorLayers = this.props.config.vectorLayers.map((layer) => {
      if (
        event.currentTarget.id.split('-add')[0] ===
        layer.featureLayer.id
      ) {
        layer.addToViewer = checked
      }
      return layer
    })

    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('vectorLayers', this.vectorLayers)
    })
  }

  enableLayerEdit = (
    event: React.ChangeEvent<HTMLInputElement>,
    checked: boolean
  ) => {
    //oiapi issue #222
    this.vectorLayers = this.props.config.vectorLayers.map((layer) => {
      if (
        event.currentTarget.id.split('-edit')[0] ===
        layer.featureLayer.id
      ) {
        layer.editing = checked
      }
      return layer
    })

    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('vectorLayers', this.vectorLayers)
    })
  }

  render () {
    let content
    this.featureLayerCss = this.props.config.editingEnabled ? 'oi-showFeatureLayers' : 'oi-hideFeatureLayers' //#861

    if (this.state.selectContent === 'itemurl') {
      content = <SettingRow role='group' aria-label={this.nls('catalogUrl')}><TextInput id='oic-itemurl' defaultValue={this.props.config.itemUrlInput} placeholder={this.nls('catalogUrl')} onAcceptValue={this.getOICfromUrl} /> </SettingRow>
    } else {
      content = <><SettingRow role='group' aria-label={this.nls('selectGroupFolder')}>
        <Select defaultValue={this.props.config.catalogGroupFolder}
        placeholder={this.nls('selectGroupFolder')}
          // style={{ display: 'inline-block', width: '16.35rem', maxWidth: '16.35rem !important' }}
          onChange={this.handleGroupFolderChange}
        >
          {
            this.state.contentList?.map((item, i) => {
              return <Option value={item} key={i}>
                <div className='text-truncate'>{item}</div>
              </Option>
            }
            )}
        </Select></SettingRow>
        <SettingRow role='group' aria-label={this.nls('selectOIC')}>
          <Select
            placeholder={this.nls('selectOIC')}
            // style={{ display: 'inline-block', width: '16.35rem', maxWidth: '16.35rem !important' }}
            onChange={this.chooseOIC}
            value={this.state.oic ? this.state.oic.url : null}>
            {
              this.state.itemList.map((oic, i) => {
                return <Option value={oic.value} key={i}>
                  <div className='text-truncate'>{oic.name}</div>
                </Option>
              })
            }
          </Select></SettingRow></>
    }

    let feautureDiv

    //#804
    if (this.mapView) {
      if (this.props.config.vectorLayers?.length > 0) {
        feautureDiv = this.props.config.vectorLayers?.map((product, i) => {
          //#861
          //#872
          const editingEnabled = !!((this.mapView.map.findLayerById(product.featureLayer.id))?.editingEnabled &&
            (this.mapView.map.findLayerById(product.featureLayer.id))?.capabilities?.operations?.supportsEditing)
          return <SettingRow role='group' aria-label={this.nls('editLayer')} flow="wrap" key={i} className={this.featureLayerCss} label={
            <div className="w-100 d-flex">
              {/* <Tooltip placement="top" showArrow={true} title={this.nls('addToViewer')}> */}
              <span className="d-inline-flex">
                <Checkbox checked={product.addToViewer} onChange={this.enableLayerView} id={product.featureLayer.id + '-add'} />
                <Label className="pl-2">{product.featureLayer.title}</Label></span>

            </div>
          }>
            {/* #872 */}
            <Collapse isOpen={product.addToViewer} className="w-100 offset-1">
              <Tooltip placement="top" showArrow={true} title={!editingEnabled ? this.nls('editingTooltip') : ''}>
                <span className="d-inline-flex">
                  {/* #7140 */}
                  <Checkbox checked={product.editing} disabled={!editingEnabled} onChange={this.enableLayerEdit} id={product.featureLayer.id + '-edit'} />
                  <Label className="pl-2">{this.nls('editLayer')}</Label></span>

              </Tooltip>
            </Collapse>
          </SettingRow>
        })
      }
    }

    const enableEditingSwitch = this.props.config.vectorLayers?.length > 0 //#870
    return <div className="widget-setting-orientedimagery">
      <SettingSection
        className="map-selector-section"
        title={this.nls('chooseMapWidget')}
      >
        <SettingRow>
          <MapWidgetSelector onSelect={this.onMapSelected} useMapWidgetIds={this.props.useMapWidgetIds} /><br />
        </SettingRow>
      </SettingSection>
      {/* issue #781 will show the configuration whether correct map widget is selected or not. Behavior similar to other Exb widgets */}
      {/* <div id="oi-widget"  style={{display:"none"}}> */}
      <SettingSection title={this.nls('chooseOIC')} role='group' aria-label={this.nls('catalogSelection')}>

        <SettingRow role='group' aria-label={this.nls('chooseOIC')}>
          <Select
            // style={{ display: 'inline-block', width: '16.35rem', maxWidth: '16.35rem !important' }}
            value={this.state.selectContent} onChange={this.changeContent}>
            <Option value='content'>{this.nls('contents')}</Option>
            <Option value='group'>{this.nls('groups')}</Option>
            <Option value='orgGroups'>{this.nls('org')}</Option>
            <Option value='itemurl'>{this.nls('itemurl')}</Option>
          </Select>
        </SettingRow>
        {content}
        <SettingRow role='group' aria-label={this.nls('selectedCatalog')}>
          {
            this.OICList && this.OICList[0]
              ? <TextInput style={{ width: '228px' }} readOnly disabled value={this.OICList[0]?.name} />
              : null
          }
        </SettingRow>
        <SettingRow role='group' aria-label={this.nls('addOIC')}>
          {/* #7138 */}
          <Button type='primary' disabled={!this.state.oic} size='sm' onClick={this.addOICToList}>{this.nls('addOIC')}</Button>
          <Button type='secondary' disabled={!this.OICList} size='sm' onClick={this.deleteOICList}
            style={{ marginLeft: '5px' }}
          >
            {this.nls('deleteOIC')}</Button>

        </SettingRow>

      </SettingSection>

      <SettingSection title={this.nls('configureEdit')} role='group' aria-label={this.nls('configureEdit')}>
        <SettingRow role='group' aria-label={this.nls('configureEdit')}>
          <Tooltip placement="top" showArrow={true} title={!enableEditingSwitch ? this.nls('editingSwitchTooltip') : ''}>
            <span>
              <Label style={{ cursor: 'pointer' }}>
                <Switch
                  className="mr-2"
                  onChange={this.enableEditing}
                  id='oi-editingCheckbox'
                  checked={!!(this.props.config.editingEnabled && enableEditingSwitch)}
                  disabled={!enableEditingSwitch} /*#870*/ />
                {this.nls('enableEditing')}
              </Label>
            </span>
          </Tooltip>
        </SettingRow>
        {feautureDiv}

      </SettingSection>

      {/* </div> */}
    </div>
  }
}
