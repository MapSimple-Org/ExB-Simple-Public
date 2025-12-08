/** @jsx jsx */
import { React, jsx } from 'jimu-core'
import { Checkbox, Label, Select } from 'jimu-ui'
import { MapWidgetSelector, SettingSection } from 'jimu-ui/advanced/setting-components'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import type { IMConfig } from '../config'
import i18n from './translations/default'
import './style.css'

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>, any> {
  handleAutoSetOnFeatureSelectionChange = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    if (evt) {
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('autoSetOnFeatureSelection', checked)
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

  handleFilterByActiveFloorOnlyChange = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    if (evt) {
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('filterByActiveFloorOnly', checked)
      })
    }
  }

  handleFilterDataSourcesChange = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    if (evt) {
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('filterDataSources', checked)
      })
    }
  }

  handleLongNamesChange = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    if (evt) {
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('longNames', checked)
      })
    }
  }

  handleMapWidgetSelected = (useMapWidgetIds: string[]): void => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds
    })
  }

  handlePositionChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    if (evt) {
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('position', evt.target.value)
      })
    }
  }

  handleZoomOnAutoSetChange = (evt: React.ChangeEvent<HTMLInputElement>, checked: boolean): void => {
    if (evt) {
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('zoomOnAutoSet', checked)
      })
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
    const position = this.props.config.position || 'top-left'
    return (
      <SettingSection role='group' aria-label={this.nls('floorfilter_setting_description')}>
        <div className='widget-setting-floorfilter-section'>
          <Label className='widget-setting-floorfilter-label'>
            {this.nls('floorfilter_setting_selectMap')}
          </Label>
          <div>
            <MapWidgetSelector
              onSelect={this.handleMapWidgetSelected}
              useMapWidgetIds={this.props.useMapWidgetIds}
            />
          </div>
        </div>
        <div className='widget-setting-floorfilter-section-b' style={{ display: 'none' }}>
          <Label>
            <Checkbox
              checked={!!this.props.config.displayLabel}
              onChange={this.handleDisplayLabelChange}
            />
            <span className='widget-setting-floorfilter-checkbox-label'>
              {this.nls('floorfilter_setting_displayLabel')}
            </span>
          </Label>
        </div>
        <div className='widget-setting-floorfilter-section-b'>
          <Label>
            <Checkbox
              checked={!!this.props.config.longNames}
              onChange={this.handleLongNamesChange}
            />
            <span className='widget-setting-floorfilter-checkbox-label'
              title={this.nls('floorfilter_setting_longNamesTip')}
            >
              {this.nls('floorfilter_setting_longNames')}
            </span>
          </Label>
        </div>
        <div className='widget-setting-floorfilter-section-b'>
          <Label>
            <Checkbox
              checked={!!this.props.config.filterDataSources}
              onChange={this.handleFilterDataSourcesChange}
            />
            <span className='widget-setting-floorfilter-checkbox-label'
              title={this.nls('floorfilter_setting_filterDataSourcesTip')}
            >
              {this.nls('floorfilter_setting_filterDataSources')}
            </span>
          </Label>
          <div className='widget-setting-floorfilter-section-c'>
            <Label>
              <Checkbox
                disabled={!this.props.config.filterDataSources}
                checked={!!this.props.config.filterByActiveFloorOnly}
                onChange={this.handleFilterByActiveFloorOnlyChange}
              />
              <span className='widget-setting-floorfilter-checkbox-label'
                title={this.nls('floorfilter_setting_filterByActiveFloorOnlyTip')}
              >
                {this.nls('floorfilter_setting_filterByActiveFloorOnly')}
              </span>
            </Label>
          </div>
        </div>
        <div className='widget-setting-floorfilter-section-b'>
          <Label>
            <Checkbox
              checked={!!this.props.config.autoSetOnFeatureSelection}
              onChange={this.handleAutoSetOnFeatureSelectionChange}
            />
            <span className='widget-setting-floorfilter-checkbox-label'
              title={this.nls('floorfilter_setting_autoSetOnFeatureSelectionTip')}
            >
              {this.nls('floorfilter_setting_autoSetOnFeatureSelection')}
            </span>
          </Label>
          <div className='widget-setting-floorfilter-section-c'>
            <Label>
              <Checkbox
                disabled={!this.props.config.autoSetOnFeatureSelection}
                checked={!!this.props.config.zoomOnAutoSet}
                onChange={this.handleZoomOnAutoSetChange}
              />
              <span className='widget-setting-floorfilter-checkbox-label'
                title={this.nls('floorfilter_setting_zoomOnAutoSetTip')}
              >
                {this.nls('floorfilter_setting_zoomOnAutoSet')}
              </span>
            </Label>
          </div>
        </div>
        <div className='widget-setting-floorfilter-section-b'>
          <Label className='widget-setting-floorfilter-label'>
            {this.nls('floorfilter_setting_positioned')}
          </Label>
          <div>
          <Select
              value={position}
              onChange={this.handlePositionChange}
            >
              <option key='top-left' value='top-left'>{this.nls('floorfilter_setting_topLeft')}</option>
              <option key='top-right' value='top-right'>{this.nls('floorfilter_setting_topRight')}</option>
              <option key='bottom-left' value='bottom-left'>{this.nls('floorfilter_setting_bottomLeft')}</option>
              <option key='bottom-right' value='bottom-right'>{this.nls('floorfilter_setting_bottomRight')}</option>
            </Select>
          </div>
        </div>
      </SettingSection>
    )
  }
}
