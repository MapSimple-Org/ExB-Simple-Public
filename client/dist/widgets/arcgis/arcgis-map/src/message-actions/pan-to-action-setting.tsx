/** @jsx jsx */
import {
  React, css, jsx, type ActionSettingProps, type SerializedStyles, type ImmutableObject, type IMThemeVariables,
  polished, Immutable, type UseDataSource, MessageType, CONSTANTS, AllDataSourceTypes, type IMDataViewJson,
  type ImmutableArray, classNames
} from 'jimu-core'
import { Radio, Label, Checkbox } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { DataSourceSelector, DEFAULT_DATA_VIEW_ID } from 'jimu-ui/advanced/data-source-selector'
import defaultMessages from '../setting/translations/default'
import { withTheme } from 'jimu-theme'
import {
  type ActionConfig, checkOutActionConfigForZoomToAndPanToMessageActions,
  getDataSourceSelectorSourceDataForZoomToAndPanToMessageActions, getDsByWidgetId
} from './action-utils'
import { getMessageActionUseDataSourcesByConfig } from './zoom-to-pan-to-utils'

interface ExtraProps {
  theme?: IMThemeVariables
}

interface States {
  isShowLayerList: boolean
}

export interface PanToMessageConfig extends ActionConfig {
  // useAnyTriggerData is used for DataRecordsSelectionChange and DataSourceFilterChange message types
  useAnyTriggerData?: boolean

  // return to the initial map extent when selection is cleared, default is false
  goToInitialMapExtentWhenSelectionCleared?: boolean
}

export type IMConfig = ImmutableObject<PanToMessageConfig>

const DSSelectorTypes = Immutable([
  AllDataSourceTypes.FeatureLayer,
  AllDataSourceTypes.SceneLayer,
  AllDataSourceTypes.BuildingComponentSubLayer,
  AllDataSourceTypes.ImageryLayer,
  AllDataSourceTypes.OrientedImageryLayer,
  AllDataSourceTypes.SubtypeGroupLayer,
  AllDataSourceTypes.SubtypeSublayer
])

// PanToActionSetting is only loaded and rendered when the message type is DataRecordsSelectionChange or DataSourceFilterChange.
// PanToActionSetting is not loaded and not rendered if the message type is DataRecordSetChange, ExtentChange or DataSourcesChange.
// The above code logic is implemented by getSettingComponentUri() method in pan-to-action.ts.
class _PanToActionSetting extends React.PureComponent<ActionSettingProps<IMConfig> & ExtraProps, States> {
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

  // the fromRootDsIds prop used for DataSourceSelector
  fromRootDsIds: ImmutableArray<string>

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

    // See more details in ZoomToFeatureActionSetting.handleTriggerLayerSelected
    if (this.fromRootDsIds) {
      finalSelectedDs = currentSelectedDs
    } else {
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

  // only available for selection change message
  onGoToInitialMapExtentWhenSelectionClearedCheckboxChanged = (evt, checked: boolean) => {
    checked = !!checked
    const newConfig = this.props.config.set('goToInitialMapExtentWhenSelectionCleared', checked)

    this.updateMessageActionConfigAndUseDataSources(newConfig)
  }

  render () {
    // PanToActionSetting is only loaded and rendered when the message type is DataRecordsSelectionChange or DataSourceFilterChange.
    // Both DataRecordsSelectionChange and DataSourceFilterChange need to render DataSourceSelector.
    const isSelectionChangeMessageType = this.props.messageType === MessageType.DataRecordsSelectionChange

    const triggerDsSelectorSourceData = getDataSourceSelectorSourceDataForZoomToAndPanToMessageActions(this.props.messageWidgetId, this.props.config.useDataSource, this.props.config.useDataSources, this.props.messageType)

    let useDataSources
    if (triggerDsSelectorSourceData.useDataSources) {
      useDataSources = Immutable(triggerDsSelectorSourceData.useDataSources)
    } else {
      useDataSources = triggerDsSelectorSourceData.useDataSource ? Immutable([triggerDsSelectorSourceData.useDataSource]) : Immutable([])
    }

    const goToInitialMapExtentWhenSelectionCleared = this.props.config.goToInitialMapExtentWhenSelectionCleared || false

    // ZoomTo/PanTo message action support multiple trigger data. In most cases, it is ok to set isMultipleProp to true.
    // But there is a special case. List widget only have one data source. If we set isMultipleProp to true, 'Select data' button of DataSourceSelector always display, it is not expected.
    // To fix the above case, we can set isMultipleProp to isReadOnly.
    // isReadOnly is true when there is only one layer data source in the message widget. isReadOnly is still false if the message widget has WebMap or WebScene data sources.
    const isMultipleProp = !triggerDsSelectorSourceData.isReadOnly
    let hideDataViewProp: boolean | ((dataViewJson: IMDataViewJson, mainDataSourceId: string) => boolean) = null
    let isMultipleDataViewProp: boolean // = true
    let disableDataViewProp: boolean // = false

    if (isSelectionChangeMessageType) {
      // selection change message
      // If the message type is selection change message, user should only select the main data source and can't select data source view because all data views share the same selection.
      hideDataViewProp = true
      isMultipleDataViewProp = false
      disableDataViewProp = true
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
    }

    this.fromRootDsIds = triggerDsSelectorSourceData.fromRootDsIds

    const isAnyTriggerData = !!this.props.config.useAnyTriggerData
    const allDataString = this.props.intl.formatMessage({ id: 'mapAction_AllData', defaultMessage: defaultMessages.mapAction_AllData })
    const customizeDataString = this.props.intl.formatMessage({ id: 'mapAction_CustomizeData', defaultMessage: defaultMessages.mapAction_CustomizeData })

    return (
      <div css={this.getStyle(this.props.theme)}>
        {/* Trigger data */}
        <SettingSection title={this.props.intl.formatMessage({ id: 'mapAction_TriggerLayer', defaultMessage: defaultMessages.mapAction_TriggerLayer })}>
          <SettingRow>
            <Label className='d-flex align-items-center'>
              <Radio className='mr-2' checked={isAnyTriggerData} onChange={() => { this.onAllDataRadioChecked() }} />
              { allDataString }
            </Label>
          </SettingRow>

          <SettingRow>
            <Label className='d-flex align-items-center'>
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
              // disableDataSourceList={false}
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
        </SettingSection>

        {
          isSelectionChangeMessageType &&
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

export default withTheme(_PanToActionSetting)
