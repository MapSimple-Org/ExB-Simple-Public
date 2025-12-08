/** @jsx jsx */
import { React, Immutable, jsx, type UseDataSource, DataSourceComponent, type FeatureLayerDataSource, type SceneLayerDataSource, DataSourceManager, type IMDataSourceJson } from 'jimu-core'
import { Checkbox, TextInput } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import { getFeatureLayer, supportedDsTypes, batchDsTypes } from '../utils'
import type { DSConfig } from '../config'

interface Props {
  dsConfig: DSConfig
  //theme: IMThemeVariables
  //appTheme: IMThemeVariables
  widgetId: string
  i18nMessage: (id: string, defaultMessage?: string) => string
  onDataSourceChange: (updateDataSources: UseDataSource[]) => void
  onContentOptionsChanged: (dsConfigId: string, checked: boolean, name: string) => void
  onLabelChange: (dsConfigId: string, label: string) => void
  getUseDataSourceById: (dataSourceId: string) => UseDataSource
  newAddFlag: boolean
}

interface State {
  popupHasTextContent: boolean
  popupHasMediaContent: boolean
  popupHasAttachmentsContent: boolean
  popupHasTitle: boolean
  popupHasChangeTracking: boolean
  layerHasAttachment: boolean
  layerHasChangeTracking: boolean
  label: string
}

export default class DSSetting extends React.PureComponent< Props, State > {
  constructor (props) {
    super(props)
    this.state = {
      popupHasTextContent: true,
      popupHasMediaContent: false,
      popupHasAttachmentsContent: false,
      popupHasTitle: false,
      popupHasChangeTracking: false,
      layerHasAttachment: false,
      layerHasChangeTracking: false,
      label: this.props.dsConfig?.label || ''
    }
  }

  componentDidUpdate (prevProps) {
    if (prevProps.dsConfig?.label !== this.props.dsConfig?.label) {
      this.setState({ label: this.props.dsConfig?.label || '' })
    }
  }

  getCapabilities () {
    return {
      supportsTitle: this.state.popupHasTitle,
      supportsMedia: this.state.popupHasMediaContent,
      supportsAttachment: this.state.popupHasAttachmentsContent && this.state.layerHasAttachment,
      supportsChangeTracking: this.state.popupHasChangeTracking && this.state.layerHasChangeTracking
    }
  }

  onLabelType = (event) => {
    this.setState({ label: event.target.value })
  }

  onDataSourceCreated = (dataSource: FeatureLayerDataSource | SceneLayerDataSource): void => {
    getFeatureLayer(dataSource).then(featureLayer => {
      // popup capabilities
      const popupContent = featureLayer?.popupTemplate?.content
      let popupHasTextContent = false
      let popupHasMediaContent = false
      let popupHasAttachmentsContent = false
      let popupHasTitle = !!featureLayer?.popupTemplate?.title
      let popupHasChangeTracking = featureLayer?.popupTemplate?.lastEditInfoEnabled
      if (popupContent && popupContent.length) {
        popupContent.forEach(content => {
          switch (content.type) {
            case 'text':
              popupHasTextContent = true
              break
            case 'media':
              popupHasMediaContent = true
              break
            case 'attachments':
              popupHasAttachmentsContent = true
              break
          }
        })
      } else {
        popupHasTextContent = true
        popupHasTitle = true
        popupHasMediaContent = false
        popupHasAttachmentsContent = false
        popupHasChangeTracking = false
      }

      //if (!popupHasTextContent) {
      //  this.props.onSettingChange({
      //    id: this.props.id,
      //    config: this.props.config.set('styleType', StyleType.custom)
      //  })
      //}

      // layer capabilities
      const layerHasAttachment = featureLayer?.capabilities?.data?.supportsAttachment
      const layerHasChangeTracking = !!(featureLayer?.editingInfo && featureLayer?.editFieldsInfo)

      this.setState({
        popupHasTextContent: popupHasTextContent,
        popupHasMediaContent: popupHasMediaContent,
        popupHasAttachmentsContent: popupHasAttachmentsContent,
        popupHasTitle: popupHasTitle,
        popupHasChangeTracking: popupHasChangeTracking,
        layerHasAttachment: layerHasAttachment,
        layerHasChangeTracking: layerHasChangeTracking
      })
    })
  }

  getDetailsOptionsContent = () => {
    return (<SettingSection title={this.props.i18nMessage('detailOptions')} aria-label={this.props.i18nMessage('detailOptions')} role="group">
      <div className='featureInfo-options-part'>
        <SettingRow label={this.props.i18nMessage('title', 'Title')}>
          <Checkbox
            className='can-x-switch' disabled={!this.getCapabilities().supportsTitle} checked={!!this.props.dsConfig?.contentConfig.title}
            data-key='title' onChange={evt => { this.props.onContentOptionsChanged(this.props.dsConfig?.id, evt.target.checked, 'title') }}
            aria-label={this.props.i18nMessage('title')}
          />
        </SettingRow>
        <SettingRow label={this.props.i18nMessage('content')}>
          <Checkbox
            className='can-x-switch' disabled={!this.props.dsConfig} checked={!!this.props.dsConfig?.contentConfig.fields}
            data-key='content' onChange={evt => { this.props.onContentOptionsChanged(this.props.dsConfig?.id, evt.target.checked, 'fields') }}
            aria-label={this.props.i18nMessage('content')}
          />
        </SettingRow>
        <SettingRow label={this.props.i18nMessage('media')}>
          <Checkbox
            className='can-x-switch' disabled={!this.getCapabilities().supportsMedia} checked={!!this.props.dsConfig?.contentConfig.media}
            data-key='media' onChange={evt => { this.props.onContentOptionsChanged(this.props.dsConfig?.id, evt.target.checked, 'media') }}
            aria-label={this.props.i18nMessage('media')}
          />
        </SettingRow>
        <SettingRow label={this.props.i18nMessage('attachments')}>
          <Checkbox
            className='can-x-switch' disabled={!this.getCapabilities().supportsAttachment} checked={!!this.props.dsConfig?.contentConfig.attachments}
            data-key='attachments' onChange={evt => { this.props.onContentOptionsChanged(this.props.dsConfig?.id, evt.target.checked, 'attachments') }}
            aria-label={this.props.i18nMessage('attachments')}
          />
        </SettingRow>
        <SettingRow label={this.props.i18nMessage('lastEditInfo')}>
          <Checkbox
            className='can-x-switch' disabled={!this.getCapabilities().supportsChangeTracking} checked={!!this.props.dsConfig?.contentConfig.lastEditInfo}
            data-key='lastEditInfo' onChange={evt => { this.props.onContentOptionsChanged(this.props.dsConfig?.id, evt.target.checked, 'lastEditInfo') }}
            aria-label={this.props.i18nMessage('lastEditInfo')}
          />
        </SettingRow>
      </div>
    </SettingSection>)
  }

  getLabelContent = () => {
    return (<SettingSection title={this.props.i18nMessage('label')}>
      <SettingRow>
        <TextInput
          type='text'
          size='sm'
          className='w-100'
          value={this.state.label}
          onChange={this.onLabelType}
          onAcceptValue={value => {
            if (value !== this.props.dsConfig?.label) {
              this.props.onLabelChange(this.props.dsConfig?.id, value)
            }
          }}
          aria-label={this.props.i18nMessage('label')}
        />
      </SettingRow>
    </SettingSection>)
  }

  onFilterDs = (dsJson: IMDataSourceJson): boolean => {
    let hideDsFlag = false
    const isBatchDs = batchDsTypes.includes(dsJson.type as any)
    if (isBatchDs) {
      const dataSource = DataSourceManager.getInstance().getDataSource(dsJson.id)
      const allChildDs = dataSource.isDataSourceSet() ? dataSource.getAllChildDataSources() : []
      if (allChildDs?.length === 0) {
        hideDsFlag = true
      }
    }
    return hideDsFlag
  }

  onDataSourceChange = (updateDataSources: UseDataSource[]) => {
    this.props.onDataSourceChange(updateDataSources)
  }

  getDSSelectorContent = () => {
    let dataSourceComponentContent = null
    const useDataSource = this.props.getUseDataSourceById(this.props.dsConfig?.useDataSourceId)
    if (useDataSource && useDataSource.dataSourceId) {
      dataSourceComponentContent = (
        <DataSourceComponent
          useDataSource={Immutable(useDataSource)}
          onDataSourceCreated={this.onDataSourceCreated}
          query={null}
        />
      )
    }

    return (
      <SettingSection title={this.props.i18nMessage('data')}>
        <SettingRow>
          <DataSourceSelector
            types={supportedDsTypes}
            disableRemove={() => true}
            useDataSourcesEnabled mustUseDataSource
            useDataSources={ useDataSource ? Immutable([useDataSource]) : Immutable([]) }
            onChange={this.onDataSourceChange}
            widgetId={this.props.widgetId}
            closeDataSourceListOnChange
            hideDs={this.onFilterDs}
            isMultiple={this.props.newAddFlag}
            isBatched={true}
          />
          {dataSourceComponentContent}
        </SettingRow>
      </SettingSection>
    )
  }

  render () {
    const dataSourceSelectorContent = this.getDSSelectorContent()
    const labelContent = this.getLabelContent()
    const detailOptionsContent = this.getDetailsOptionsContent()
    return (
      <div>
        {dataSourceSelectorContent}
        {labelContent}
        {detailOptionsContent}
      </div>
    )
  }
}
