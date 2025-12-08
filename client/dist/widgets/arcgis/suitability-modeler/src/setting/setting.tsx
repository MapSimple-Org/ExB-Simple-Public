/** @jsx jsx */
/**
  Licensing

  Copyright 2021 Esri

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

import { React, css, jsx } from 'jimu-core'
import { Button, Checkbox, Icon, Label, Radio, TextInput } from 'jimu-ui'
import { MapWidgetSelector, SettingSection } from 'jimu-ui/advanced/setting-components'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import checkIcon from 'jimu-ui/lib/icons/check.svg'
import type { IMConfig } from '../config'
import i18n from './translations/default'
import './style.css'

interface State {
  serviceUrl?: string
  itemId?: string
  itemTitle?: string
  byUrl: boolean
  searchHasFocus: boolean
  searchResults: any
  clearSearch: boolean
}

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>, State> {
  portal: __esri.Portal
  searchRef: any
  searchingId: number

  constructor (props: any) {
    super(props)
    this.searchRef = React.createRef()
    let byUrl = true
    if (this.props.config.serviceUrl) {
      byUrl = true
    } else if (this.props.config.itemId) {
      byUrl = false
    }
    this.state = {
      serviceUrl: this.props.config.serviceUrl,
      itemId: this.props.config.itemId,
      itemTitle: this.props.config.itemTitle,
      byUrl: byUrl,
      searchHasFocus: false,
      searchResults: null,
      clearSearch: false
    }
  }

  componentDidMount (): void {
    this.init().catch(() => null) // the catch is for ts-standard
  }

  handleAllowExportChange = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    if (evt) {
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('allowExport', checked)
      })
    }
  }

  handleLockSlider = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    if (evt) {
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('lockSlider', checked)
      })
    }
  }

  handleDisplayLabelChange = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    if (evt) {
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('displayLabel', checked)
      })
    }
  }

  handleHideRangesChange = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    if (evt) {
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('hideRanges', checked)
      })
    }
  }

  handleMapWidgetSelected = (useMapWidgetIds: string[]): void => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds
    })
  }

  handleSearchBlur = (): void => {
    setTimeout(() => {
      this.setState({ searchHasFocus: false })
    }, 10)
  }

  handleSearchFocus = (): void => {
    this.setState({ searchHasFocus: true })
  }

  handleSearchItemClick = (e): void => {
    const itemId = e.target.getAttribute('data-itemId')
    const itemTitle = e.target.getAttribute('data-itemTitle')
    this.setState({ clearSearch: true }, () => {
      this.setState({ searchHasFocus: false })
      this.search().catch(() => null) // the catch is for ts-standard
      this.setModelProps(false, null, itemId, itemTitle)
    })
  }

  async init (): Promise<void> {
    try {
      const modules = await loadArcGISJSAPIModules(['esri/portal/Portal'])
      const Portal: typeof __esri.Portal = modules[0]
      const portal = new Portal({
        url: this.props.portalUrl
      })
      await portal.load()
      this.portal = portal
      this.search().catch(() => null) // the catch is for ts-standard
    } catch (ex) {
      console.error(ex)
      // @todo need to inform user?
    }
  }

  nls = (id: string): string => {
    if (this.props.intl) {
      return this.props.intl.formatMessage({
        id: id,
        defaultMessage: i18n[id]
      })
    }
    return id
  }

  render (): any {
    return (
      <SettingSection role='group' aria-label={this.nls('wro_setting_description')}>
        <div className='widget-setting-wro-section'>
          <Label className='widget-setting-wro-label'>{this.nls('wro_setting_selectMap')}</Label>
          <div>
            <MapWidgetSelector
              onSelect={this.handleMapWidgetSelected}
              useMapWidgetIds={this.props.useMapWidgetIds}
            />
          </div>
        </div>
        <div className='widget-setting-wro-section-b'>
          <Label>
            <Checkbox
              checked={!!this.props.config.displayLabel}
              onChange={this.handleDisplayLabelChange}
            />
            <span className='widget-setting-wro-checkbox-label'>
              {this.nls('wro_setting_displayLabel')}
            </span>
          </Label>
        </div>
        <div className='widget-setting-wro-section-b'>
          <Label>
            <Checkbox
              checked={!!this.props.config.allowExport}
              onChange={this.handleAllowExportChange}
            />
            <span className='widget-setting-wro-checkbox-label'>
              {this.nls('wro_setting_allowExport')}
            </span>
          </Label>
        </div>
        <div className='widget-setting-wro-section-b'>
          <Label>
            <Checkbox
              checked={!!this.props.config.lockSlider}
              onChange={this.handleLockSlider}
            />
            <span className='widget-setting-wro-checkbox-label'>
              {this.nls('wro_setting_lockSlider')}
            </span>
          </Label>
        </div>
        <div className='widget-setting-wro-section-b'>
          <Label>
            <Checkbox
              checked={!!this.props.config.hideRanges}
              onChange={this.handleHideRangesChange}
            />
            <span className='widget-setting-wro-checkbox-label'>
              {this.nls('wro_setting_hideRanges')}
            </span>
          </Label>
        </div>
        {this.renderModelSection()}
      </SettingSection>
    )
  }

  renderItemSection (): any {
    const clearSearch = this.state.clearSearch

    let cssModelName = css``
    let modelName: string
    if (this.props.config.serviceUrl) {
      modelName = this.props.config.serviceUrl
    } else if (this.props.config.itemId) {
      modelName = this.state.itemTitle || this.props.config.itemTitle || this.props.config.itemId
    }
    if (modelName) {
      cssModelName = css`
        background-color: ${this.props.theme.sys.color.primary.main};
        padding: 2px 6px;
        width: 100%;
      `
    } else {
      modelName = this.nls('wro_setting_model')
    }

    const handleSearchChange = (e): void => {
      const v = e.target.value
      this.search(v).catch(() => null) // the catch is for ts-standard
    }

    let items = []
    const searchResults = this.state.searchResults
    if (searchResults) {
      items = searchResults.map((item: any) => {
        return (
          <li key={item.itemId}>
            <Button
              className='widget-setting-wro-search-item'
              onMouseDown={this.handleSearchItemClick} // should be onClick but there is a blur issue
              data-itemId={item.itemId} data-itemTitle={item.itemTitle}
            >
              {item.itemTitle}
            </Button>
          </li>
        )
      })
    }

    let ulCls = 'widget-setting-wro-search-items'
    const ref = this.searchRef
    if (document.activeElement && (document.activeElement === ref.current)) {
      ulCls += ' widget-setting-wro-on'
    } else {
      ulCls += ' widget-setting-wro-off'
    }

    return (
      <div className='widget-setting-wro-section'>
        <Label className='widget-setting-wro-label' css={cssModelName}>
          {modelName}
        </Label>

        {!clearSearch &&
          <div>
            <TextInput
              className='w-100'
              type='text'
              allowClear
              maxLength={1024}
              ref={this.searchRef}
              placeholder={this.nls('wro_setting_searchForAModel')}
              onChange={handleSearchChange}
              onFocus={this.handleSearchFocus}
              onBlur={this.handleSearchBlur}
            />
            <ul className={ulCls}>
              {items}
            </ul>
          </div>}

      </div>
    )
  }

  renderModelSection (): any {
    const byUrl = this.state.byUrl
    const byItem = !byUrl

    const handleByUrlChange = (): void => {
      if (!this.state.byUrl) {
        this.setModelProps(true, null, null, null)
      }
      this.setState({ byUrl: true })
    }

    const handleByItemChange = (): void => {
      if (this.state.byUrl) {
        this.setModelProps(false, null, null, null)
      }
      this.setState({ byUrl: false })
    }

    return (
      <React.Fragment>
        <div className='widget-setting-wro-section-b'>
          <Label className='widget-setting-wro-label'>{this.nls('wro_setting_startingState')}</Label>
          <div>
            <Label>
              <Radio
                name='startingState'
                checked={byUrl}
                onChange={handleByUrlChange}
              />
              <span className='widget-setting-wro-radio-label'>
                {this.nls('wro_setting_byUrl')}
              </span>
            </Label>
          </div>
          <div>
            <Label>
              <Radio
                name='startingState'
                checked={byItem}
                onChange={handleByItemChange}
              />
              <span className='widget-setting-wro-radio-label'>
                {this.nls('wro_setting_byItem')}
              </span>
            </Label>
          </div>
        </div>
        {byUrl && this.renderUrlSection()}
        {byItem && this.renderItemSection()}
      </React.Fragment>
    )
  }

  renderUrlSection (): any {
    const handleServiceUrlChange = (e): any => {
      this.setState({ serviceUrl: e.target.value })
    }

    const handleSet = (): any => {
      this.setModelProps(true, this.state.serviceUrl, null, null)
    }

    return (
      <div className='widget-setting-wro-section'>
        <div>
          <Label className='widget-setting-wro-label'>{this.nls('wro_setting_serviceUrl')}</Label>
          <div style={{ display: 'flex' }}>
            <TextInput
              className='w-100'
              type='text'
              maxLength={1024}
              defaultValue={this.state.serviceUrl}
              onChange={handleServiceUrlChange}
            />
            <Button icon title={this.nls('wro_setting_setUrl')} onClick={handleSet}>
              <Icon icon={checkIcon} />
            </Button>
          </div>
        </div>
        <div className='widget-setting-wro-note' style={{ width: '100%' }}>
          <div className='widget-setting-wro-note-br'>
            https://example.com/arcgis/rest/services/Example/ImageServer
          </div>
          <div className='widget-setting-wro-note-br'>
            https://utility.arcgis.com/usrsvcs/servers/24b7c7752170431a95719323a9e71a5e/rest/services/WRO_World_Ecophysiographic_Data/ImageServer
          </div>
          <div className='widget-setting-wro-note-br'>
            https://greeninfrastructuremapsdev.arcgis.com/arcgis/rest/services/GreenInfrastructure/WeightedOverlay_Geoplanner/ImageServer
          </div>
        </div>
      </div>
    )
  }

  async search (v?: string): Promise<void> {
    try {
      if (!this.portal) {
        // @todo need to inform user?
        console.error("WRO search, Portal wasn't loaded")
        return
      }
      const searchingId = this.searchingId = Date.now()
      let items = []
      let q = '(type:"Image Service" AND typekeywords:geodesignModelerLayer)'
      if (typeof v === 'string' && v.length > 0) {
        q = q + ' AND (' + v + ')'
        // q = q+" AND (title:("+v+"))";
        let params: any = {
          query: q,
          num: 100,
          sortField: 'title'
        }
        for (let i = 1; i <= 10; i++) {
          const result = await this.portal.queryItems(params)
          if (result.results && result.results.length > 0) {
            items = items.concat(result.results)
            params = result.nextQueryParams
            if (params.start === -1) break
          } else {
            break
          }
          if (searchingId !== this.searchingId) break
        }
      }
      const searchResults = items.map(item => {
        return {
          itemId: item.id,
          itemTitle: item.title
        }
      })
      if (searchingId !== this.searchingId) return
      this.setState({ searchResults: searchResults })
    } catch (ex) {
      console.error('Search error', ex)
      // @todo need to inform user?
    }
  }

  setModelProps (byUrl: boolean, serviceUrl: string, itemId: string, itemTitle: string): void {
    const chk = (v: string): string => {
      if (typeof v !== 'string') v = ''
      v = v.trim()
      if (v.length === 0) v = null
      return v
    }

    if (byUrl) {
      serviceUrl = chk(serviceUrl)
    } else {
      itemId = chk(itemId)
      itemTitle = chk(itemTitle)
    }
    const cfg = this.props.config.set('serviceUrl', serviceUrl).set('itemId', itemId).set('itemTitle', itemTitle)
    this.props.onSettingChange({
      id: this.props.id,
      config: cfg
    })
    setTimeout(() => {
      this.setState({
        serviceUrl: serviceUrl,
        itemId: itemId,
        itemTitle: itemTitle,
        clearSearch: false
      })
    }, 100)
  }
}
