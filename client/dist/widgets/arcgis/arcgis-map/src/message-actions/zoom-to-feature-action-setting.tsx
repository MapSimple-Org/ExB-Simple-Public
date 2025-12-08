/** @jsx jsx */
import {
  React, css, jsx, type ActionSettingProps, type SerializedStyles, type ImmutableObject, type IMThemeVariables, polished, Immutable,
  type UseDataSource, MessageType, CONSTANTS, AllDataSourceTypes, type IMDataViewJson, type ImmutableArray, classNames
} from 'jimu-core'
import { Radio, Label, NumericInput, Checkbox } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { DataSourceSelector, DEFAULT_DATA_VIEW_ID } from 'jimu-ui/advanced/data-source-selector'
import defaultMessages from '../setting/translations/default'
import { withTheme } from 'jimu-theme'
import { type ActionConfig, checkOutActionConfigForZoomToAndPanToMessageActions, getDataSourceSelectorSourceDataForZoomToAndPanToMessageActions, getDsByWidgetId } from './action-utils'
import { getMessageActionUseDataSourcesByConfig } from './zoom-to-pan-to-utils'

interface ExtraProps {
  theme?: IMThemeVariables
}

interface States {
  isShowLayerList: boolean
}

// ZoomTo message action config
export interface ZoomToMessageConfig extends ActionConfig {
  // useAnyTriggerData is used for DataRecordsSelectionChange and DataSourceFilterChange message types
  useAnyTriggerData?: boolean
  // useDataSource is the single selected trigger data, it is used if it only supports single data source
  // useDataSource: UseDataSource
  // useDataSources is the multiple selected trigger data, it is used if it supports multiple data sources
  // useDataSources?: UseDataSource[]
  isUseCustomZoomToOption?: boolean
  zoomToOption?: {
    scale: number
  }
  // return to the initial map extent when selection is cleared, default is false
  goToInitialMapExtentWhenSelectionCleared?: boolean
}

export type IMConfig = ImmutableObject<ZoomToMessageConfig>

const DSSelectorTypes = Immutable([
  AllDataSourceTypes.FeatureLayer,
  AllDataSourceTypes.SceneLayer,
  AllDataSourceTypes.BuildingComponentSubLayer,
  AllDataSourceTypes.ImageryLayer,
  AllDataSourceTypes.OrientedImageryLayer,
  AllDataSourceTypes.SubtypeGroupLayer,
  AllDataSourceTypes.SubtypeSublayer
])

// ZoomToFeatureActionSetting is only loaded and rendered when the message type is DataRecordSetChange, DataRecordsSelectionChange or DataSourceFilterChange.
// ZoomToFeatureActionSetting is not loaded and not rendered if the message type is ExtentChange or DataSourcesChange.
// The above code logic is implemented by getSettingComponentUri() method in zoom-to-feature-action.ts.
class _ZoomToFeatureActionSetting extends React.PureComponent<ActionSettingProps<IMConfig> & ExtraProps, States> {
  NoLockTriggerLayerWidgets = ['Map']

  modalStyle: any = {
    position: 'absolute',
    top: '0',
    bottom: '0',
    width: '259px',
    height: 'auto',
    borderRight: '',
    borderBottom: '',
    paddingBottom: '1px'
  }

  constructor (props) {
    super(props)

    this.modalStyle.borderRight = '1px solid black'
    this.modalStyle.borderBottom = '1px solid black'

    this.state = {
      isShowLayerList: false
    }
  }

  static defaultProps = {
    config: Immutable({
      useDataSource: null
    })
  }

  // the fromRootDsIds prop used for DataSourceSelector
  fromRootDsIds: ImmutableArray<string>

  componentDidMount () {
    // Case1: If actionConfig.useDataSource is null, it is the the first time to open the message action setting.
    // Case2: If actionConfig.useDataSource is not null, it is not the the first time to open the message action setting.
    const initConfig = checkOutActionConfigForZoomToAndPanToMessageActions(this.props.config, this.props.messageWidgetId, this.props.messageType)

    let config = this.props.config.set('useDataSource', initConfig.useDataSource)
    config = config.set('useDataSources', initConfig.useDataSources)

    this.updateMessageActionConfigAndUseDataSources(config)
  }

  getStyle (theme: IMThemeVariables): SerializedStyles {
    return css`
      .setting-header {
        padding: ${polished.rem(10)} ${polished.rem(16)} ${polished.rem(0)} ${polished.rem(16)}
      }

      .deleteIcon {
        cursor: pointer;
        opacity: .8;
      }

      .deleteIcon:hover {
        opacity: 1;
      }
    `
  }

  updateMessageActionConfigAndUseDataSources (config: IMConfig) {
    const useDataSources = getMessageActionUseDataSourcesByConfig(config)

    this.props.onSettingChange({
      actionId: this.props.actionId,
      config,
      useDataSources
    })
  }

  onAllDataRadioChecked = () => {
    const config = this.props.config.set('useAnyTriggerData', true)
    this.updateMessageActionConfigAndUseDataSources(config)
  }

  onCustomizeDataRadioChecked = () => {
    const config = this.props.config.set('useAnyTriggerData', false)
    this.updateMessageActionConfigAndUseDataSources(config)
  }

  handleTriggerLayerChange = (useDataSources: UseDataSource[]) => {
    if (useDataSources && useDataSources.length > 0) {
      this.handleTriggerLayerSelected(useDataSources)
    } else {
      this.handleRemoveLayerForTriggerLayer()
    }
  }

  handleTriggerLayerSelected = (currentSelectedDs: UseDataSource[]) => {
    let finalSelectedDs = null

    // No matter which if branch we take below, we must ensure that messageActionConfig.useDataSources must be a subset of messageWidgetUseDataSources.
    if (this.fromRootDsIds) {
      // Case1: Message widget data sources are WebMap/WebScene data sources, so currentSelectedDs must be the subset of messageWidgetUseDataSources.
      // We can use currentSelectedDs to update messageActionConfig.useDataSources directly.
      finalSelectedDs = currentSelectedDs
    } else {
      // Case2: Message widget data sources are layer data sources. We can't use currentSelectedDs to update messageActionConfig.useDataSources directly.
      // Consider the following case:
      // ds1 is a feature layer data source. Both ds1-dataView1 and ds1-dataView2 are the data views of ds1.
      // Filter widget uses ds1-dataView1 and ds1-dataView2 as data sources.
      // Add 'Data filtering changes -> Zoom to' message action for Filer widget.
      // Click the 'Select data' button of DataSourceSelector. In the data source tree, only main data sources display, so ds1 displays in the tree, ds1-dataView1 and ds1-dataView2 doesn't.
      // Then select the ds1 from the tree. The DataSourceSelector.onChange(currentSelectedDs) event will be triggered. Then we get the handleTriggerLayerSelected() callback here.
      // Now, currentSelectedDs is [ds1], it doesn't include ds1-dataView1 and ds1-dataView2.
      // We should not update messageActionConfig.useDataSources to currentSelectedDs ([ds1]) because ds1 is not in filterWidgetJson.useDataSources ([ds1-dataView1, ds1-dataView2]).
      // So, for the above case, we can't use currentSelectedDs to update messageActionConfig.useDataSources directly.
      // To make sure finalSelectedDs is the subset of messageWidgetUseDataSources, we need to filter messageWidgetUseDataSources by currentSelectedDs to get the valid subset data sources.
      // For the above case, the final messageActionConfig.useDataSources is [ds1-dataView1, ds1-dataView2] by the following code.

      // messageWidgetUseDataSources is messageWidgetJson.useDataSources + messageWidgetJson.outputDataSources.
      const messageWidgetUseDataSources = getDsByWidgetId(this.props.messageWidgetId, this.props.messageType)
      finalSelectedDs = messageWidgetUseDataSources.filter(messageWidgetUseDataSource => {
        const dataSource = currentSelectedDs.find(ds => {
          if ((!ds.dataViewId || ds.dataViewId === CONSTANTS.OUTPUT_DATA_VIEW_ID) && !this.props.config.useDataSources?.find(preDs => ds.mainDataSourceId === preDs.mainDataSourceId)) {
            // select ds from ds list
            return ds.mainDataSourceId === messageWidgetUseDataSource.mainDataSourceId
          } else {
            // select ds from data view check box
            return ds.dataSourceId === messageWidgetUseDataSource.dataSourceId
          }
        })

        if (dataSource) {
          return true
        } else {
          return false
        }
      })
    }

    let config = this.props.config.set('useDataSource', finalSelectedDs[0])
    // supports multiple trigger
    config = config.set('useDataSources', finalSelectedDs)

    this.updateMessageActionConfigAndUseDataSources(config)
  }

  handleRemoveLayerForTriggerLayer = () => {
    let config = this.props.config.set('useDataSource', null)
    // supports multiple trigger
    config = config.set('useDataSources', [])

    this.updateMessageActionConfigAndUseDataSources(config)
  }

  handleIsUseCustomZoomToOption = (isUseCustomZoomToOption: boolean) => {
    if (isUseCustomZoomToOption) {
      if (!this.props.config.zoomToOption || !this.props.config.zoomToOption.scale) {
        // make sure config.zoomToOption.scale is not empty when isUseCustomZoomToOption is true
        const newConfig = this.props.config.set('isUseCustomZoomToOption', isUseCustomZoomToOption).setIn(['zoomToOption', 'scale'], 5000)
        this.updateMessageActionConfigAndUseDataSources(newConfig)
        return
      }
    }

    // update config.isUseCustomZoomToOption
    const newConfig = this.props.config.set('isUseCustomZoomToOption', isUseCustomZoomToOption)
    this.updateMessageActionConfigAndUseDataSources(newConfig)
  }

  handleSetCustomZoomScale = (value) => {
    const newConfig = this.props.config.setIn(['zoomToOption', 'scale'], value)
    this.updateMessageActionConfigAndUseDataSources(newConfig)
  }

  // only available for selection change message
  onGoToInitialMapExtentWhenSelectionClearedCheckboxChanged = (evt, checked: boolean) => {
    checked = !!checked
    const newConfig = this.props.config.set('goToInitialMapExtentWhenSelectionCleared', checked)
    this.updateMessageActionConfigAndUseDataSources(newConfig)
  }

  /**
   * This method needs to render only when this.props.messageType is MessageType.DataRecordsSelectionChange or MessageType.DataSourceFilterChange.
   */
  getTriggerLayerContent = () => {
    // DataSourceSelector is needed only when this.props.messageType is MessageType.DataRecordsSelectionChange or MessageType.DataSourceFilterChange.
    const isSelectionChangeMessageType = this.props.messageType === MessageType.DataRecordsSelectionChange
    const isFilterChangeMessageType = this.props.messageType === MessageType.DataSourceFilterChange
    if (!isSelectionChangeMessageType && !isFilterChangeMessageType) {
      return null
    }

    const triggerDsSelectorSourceData = getDataSourceSelectorSourceDataForZoomToAndPanToMessageActions(this.props.messageWidgetId, this.props.config.useDataSource, this.props.config.useDataSources, this.props.messageType)

    let useDataSources
    if (triggerDsSelectorSourceData.useDataSources) {
      useDataSources = Immutable(triggerDsSelectorSourceData.useDataSources)
    } else {
      useDataSources = triggerDsSelectorSourceData.useDataSource ? Immutable([triggerDsSelectorSourceData.useDataSource]) : Immutable([])
    }

    // ZoomTo/PanTo message action support multiple trigger data. In most cases, it is ok to set isMultipleProp to true.
    // But there is a special case. List widget only have one data source. If we set isMultipleProp to true, 'Select data' button of DataSourceSelector always display, it is not expected.
    // To fix the above case, we can set isMultipleProp to isReadOnly.
    // isReadOnly is true when there is only one layer data source in the message widget. isReadOnly is still false if the message widget has WebMap or WebScene data sources.
    const isMultipleProp = !triggerDsSelectorSourceData.isReadOnly
    let hideDataViewProp: boolean | ((dataViewJson: IMDataViewJson, mainDataSourceId: string) => boolean) = null
    let isMultipleDataViewProp: boolean
    let disableDataViewProp: boolean

    // if DataSourceSelector.props.disableDataSourceList is true, means DataSourceSelector's 'Select data' button is disabled.
    let isDisableDataSourceListProp

    if (isSelectionChangeMessageType) {
      // selection change message
      // If the message type is selection change message, user should only select the main data source and can't select data source view because all data views share the same selection.
      hideDataViewProp = true
      isMultipleDataViewProp = false
      disableDataViewProp = true
      isDisableDataSourceListProp = triggerDsSelectorSourceData.isReadOnly
    } else {
      // filter change message
      // If the message type is filter change message, user can select multiple data source views.
      // But these candidate data source views must come from triggerWidgetJson.useDataSources, so need to use hideDataViewProp to filter the candidate data source views.
      hideDataViewProp = (dataViewJson, mainDataSourceId) => {
        const messageWidgetUseDataSources = getDsByWidgetId(this.props.messageWidgetId, this.props.messageType)
        const filteredMessageWidgetUseDataSources = messageWidgetUseDataSources.filter(messageWidgetUseDataSource => {
          return messageWidgetUseDataSource.mainDataSourceId === mainDataSourceId
        })
        const targetDsView = filteredMessageWidgetUseDataSources.find(messageWidgetUseDataSource => {
          let messageWidgetUseDataSourceDataViewId
          if (messageWidgetUseDataSource.dataViewId) {
            messageWidgetUseDataSourceDataViewId = messageWidgetUseDataSource.dataViewId
          } else {
            messageWidgetUseDataSourceDataViewId = DEFAULT_DATA_VIEW_ID
          }
          return messageWidgetUseDataSourceDataViewId === dataViewJson.id
        })
        return !targetDsView
      }

      isMultipleDataViewProp = true
      disableDataViewProp = false

      // For filter change message, we should set isDisableDataSourceListProp to false.
      // consider the following case:
      // DataSourceSelector shows a dropdown. In the dropdown, we can select multiple data views by checkbox.
      // If we uncheck all the checkbox of data source views, then DataSourceSelector only renders 'Select data' button.
      // Assume we set isDisableDataSourceListProp to true, then the 'Select data' button is disabled. We can't select the data anymore.
      // To avoid the above case, we need to set isDisableDataSourceListProp to false.
      isDisableDataSourceListProp = false
    }

    this.fromRootDsIds = triggerDsSelectorSourceData.fromRootDsIds

    const isAnyTriggerData = !!this.props.config.useAnyTriggerData
    const allDataString = this.props.intl.formatMessage({ id: 'mapAction_AllData', defaultMessage: defaultMessages.mapAction_AllData })
    const customizeDataString = this.props.intl.formatMessage({ id: 'mapAction_CustomizeData', defaultMessage: defaultMessages.mapAction_CustomizeData })

    return (
      <div>
        <SettingRow>
          <Label className='d-flex align-items-center' style={{ cursor: 'pointer' }}>
            <Radio className='mr-2' checked={isAnyTriggerData} onChange={() => { this.onAllDataRadioChecked() }} />
            { allDataString }
          </Label>
        </SettingRow>

        <SettingRow>
          <Label className='d-flex align-items-center' style={{ cursor: 'pointer' }}>
            <Radio className='mr-2' checked={!isAnyTriggerData} onChange={() => { this.onCustomizeDataRadioChecked() }} />
            { customizeDataString }
          </Label>
        </SettingRow>

        <SettingRow>
          <DataSourceSelector
            className={classNames([{ 'd-none': isAnyTriggerData }])}
            types={DSSelectorTypes}
            useDataSources={useDataSources}
            fromRootDsIds={triggerDsSelectorSourceData.fromRootDsIds}
            fromDsIds={triggerDsSelectorSourceData.fromDsIds}
            hideAddDataButton
            hideTypeDropdown
            mustUseDataSource
            // if disableRemove returns true, it doesn't display the 'x' button on the data source item.
            // if disableRemove returns false, it display the 'x' button on the data source item.
            disableRemove={() => triggerDsSelectorSourceData.isReadOnly}
            // if DataSourceSelector.props.disableDataSourceList is true, means DataSourceSelector's 'Select data' button is disabled.
            disableDataSourceList={isDisableDataSourceListProp}
            onChange={this.handleTriggerLayerChange}
            widgetId={this.props.messageWidgetId}
            isMultiple={isMultipleProp}
            hideDataView={hideDataViewProp}
            isMultipleDataView={isMultipleDataViewProp}
            disableDataView={disableDataViewProp}
            hideCreateViewButton
            enableToSelectOutputDsFromSelf={true}
          />
        </SettingRow>
      </div>
    )
  }

  render () {
    const isSelectionChangeMessage = this.props.messageType === MessageType.DataRecordsSelectionChange
    const isFilterChangeMessage = this.props.messageType === MessageType.DataSourceFilterChange

    // ZoomToFeatureActionSetting is only loaded and rendered when the message type is DataRecordSetChange, DataRecordsSelectionChange or DataSourceFilterChange.
    // If the message type is DataRecordSetChange, ZoomToFeatureActionSetting doesn't need to render DataSourceSelector to select the trigger data.
    const shouldRenderDataSourceSelector = isSelectionChangeMessage || isFilterChangeMessage

    const goToInitialMapExtentWhenSelectionCleared = this.props.config.goToInitialMapExtentWhenSelectionCleared || false

    return (
      <div css={this.getStyle(this.props.theme)}>
        {/* Trigger data */}
        {
          shouldRenderDataSourceSelector &&
          <SettingSection title={this.props.intl.formatMessage({ id: 'mapAction_TriggerLayer', defaultMessage: defaultMessages.mapAction_TriggerLayer })}>
            {this.getTriggerLayerContent()}
          </SettingSection>
        }

        {/* Zoom scale */}
        <SettingSection title={this.props.intl.formatMessage({ id: 'mapZoomToAction_ZoomScale', defaultMessage: defaultMessages.mapZoomToAction_ZoomScale })}>
          <SettingRow>
            <Label className='d-flex align-items-center' style={{ cursor: 'pointer' }}>
              <Radio
                className='mr-2' checked={!this.props.config.isUseCustomZoomToOption}
                onChange={() => { this.handleIsUseCustomZoomToOption(false) }}
              />
              {this.props.intl.formatMessage({ id: 'mapZoomToAction_Automatic', defaultMessage: defaultMessages.mapZoomToAction_Automatic })}
            </Label>
          </SettingRow>

          <SettingRow>
            <Label className='d-flex align-items-center' style={{ cursor: 'pointer' }}>
              <Radio
                style={{ cursor: 'pointer' }} className='mr-2' checked={this.props.config.isUseCustomZoomToOption}
                onChange={() => { this.handleIsUseCustomZoomToOption(true) }}
              />
              {this.props.intl.formatMessage({ id: 'mapZoomToAction_Custom', defaultMessage: defaultMessages.mapZoomToAction_Custom })}
            </Label>
          </SettingRow>

          {
            this.props.config.isUseCustomZoomToOption &&
            <SettingRow>
              <NumericInput
                className='w-100' placeholder={this.props.intl.formatMessage({ id: 'mapZoomToAction_TypeScale', defaultMessage: defaultMessages.mapZoomToAction_TypeScale })}
                value={this.props.config.zoomToOption && this.props.config.zoomToOption.scale}
                onChange={this.handleSetCustomZoomScale}
              />
            </SettingRow>
          }
        </SettingSection>

        {
          isSelectionChangeMessage &&
          <SettingSection>
            <Label className='d-flex align-items-center'>
              <Checkbox
                checked={goToInitialMapExtentWhenSelectionCleared}
                className="mr-2"
                onChange={this.onGoToInitialMapExtentWhenSelectionClearedCheckboxChanged}
              />
              {this.props.intl.formatMessage({ id: 'mapAction_ReturnToInitialMapExtent', defaultMessage: defaultMessages.mapAction_ReturnToInitialMapExtent })}
            </Label>
          </SettingSection>
        }
      </div>
    )
  }
}

export default withTheme(_ZoomToFeatureActionSetting)
