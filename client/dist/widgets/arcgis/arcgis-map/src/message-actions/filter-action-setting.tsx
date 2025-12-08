/** @jsx jsx */
import {
  React, css, jsx, type ActionSettingProps, type SerializedStyles, type ImmutableObject, type DataSource,
  type IMThemeVariables, polished, Immutable, type UseDataSource, DataSourceComponent, type IMFieldSchema, type IMSqlExpression,
  dataSourceUtils, DataSourceManager, SqlExpressionMode, type ImmutableArray, AllDataSourceTypes, MessageActionConnectionType
} from 'jimu-core'
import { Radio, Label, Tooltip, Button, Icon, Switch, Collapse } from 'jimu-ui'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { FieldSelector, DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import { withTheme } from 'jimu-theme'

import { SqlExpressionBuilderPopup } from 'jimu-ui/advanced/sql-expression-builder'
import defaultMessages from '../setting/translations/default'
import * as actionUtils from './action-utils'
import { getMessageActionUseDataSourcesByConfig } from './flash-filter-utils'
import { ChooseConnectionType } from 'jimu-ui/advanced/builder-components'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'

interface ExtraProps {
  theme?: IMThemeVariables
}

interface States {
  isShowLayerList: boolean
  currentLayerType: 'trigger' | 'action'
  isSqlExprShow: boolean
}

export interface FilterMessageActionConfig {
  useAnyTriggerData: boolean
  messageUseDataSource: UseDataSource
  actionUseDataSource: UseDataSource
  sqlExprObj?: IMSqlExpression

  enabledDataRelationShip?: boolean
  connectionType?: MessageActionConnectionType // default is MessageActionConnectionType.SetCustomFields
}

export type IMConfig = ImmutableObject<FilterMessageActionConfig>

const DSSelectorTypes = Immutable([
  AllDataSourceTypes.FeatureLayer,
  AllDataSourceTypes.SceneLayer,
  AllDataSourceTypes.BuildingComponentSubLayer,
  AllDataSourceTypes.ImageryLayer,
  AllDataSourceTypes.OrientedImageryLayer,
  AllDataSourceTypes.SubtypeGroupLayer,
  AllDataSourceTypes.SubtypeSublayer
])

class _FilterActionSetting extends React.PureComponent<ActionSettingProps<IMConfig> & ExtraProps, States> {
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
      isShowLayerList: false,
      currentLayerType: null,
      isSqlExprShow: false
    }
  }

  static defaultProps = {
    config: Immutable({
      useAnyTriggerData: true,
      messageUseDataSource: null,
      actionUseDataSource: null,
      sqlExprObj: null,
      enabledDataRelationShip: true,
      connectionType: MessageActionConnectionType.SetCustomFields
    })
  }

  initOutputDataSources = (outputDataSources): ImmutableArray<UseDataSource> => {
    const ds = outputDataSources?.map(dsId => {
      return {
        dataSourceId: dsId,
        mainDataSourceId: dsId,
        rootDataSourceId: null
      }
    }) ?? []
    return Immutable(ds)
  }

  componentDidMount () {
    // const initConfig = this.getInitConfig()
    const initConfig = actionUtils.getInitConfigForFilterAndFlashMessageActions(this.props)

    const newConfig = this.props.config
      .set('messageUseDataSource', initConfig.messageUseDataSource)
      .set('actionUseDataSource', initConfig.actionUseDataSource)
      .set('sqlExprObj', initConfig.sqlExprObj)

    this.updateMessageActionConfigAndUseDataSources(newConfig)
  }

  getStyle (theme: IMThemeVariables): SerializedStyles {
    return css`
      .jimu-widget-setting--section {
        border-bottom: none;
      }

      .label-line-height {
        line-height: 20px;
      }

      .jimu-collapse {
        margin-top: 12px;
        margin-bottom: 12px;
      }

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

      .sql-expr-display {
        width: 100%;
        height: auto;
        min-height: 60px;
        line-height: 25px;
        padding: 3px 5px;
        color: ${theme.ref.palette.neutral[900]};
        border: 1px solid ${theme.ref.palette.neutral[500]};
      }

      .relate-panel-left {
        flex: auto;
        .action-select-chooser {
          margin-top: ${polished.rem(12)};
        }
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
      this.handleTriggerLayerSelected(useDataSources[0])
    } else {
      this.handleRemoveLayerForTriggerLayer()
    }
  }

  handleActionLayerChange = (useDataSources: UseDataSource[]) => {
    if (useDataSources && useDataSources.length > 0) {
      this.handleActionLayerSelected(useDataSources[0])
    } else {
      this.handleRemoveLayerForActionLayer()
    }
  }

  handleTriggerLayerSelected = (currentSelectedDs: UseDataSource) => {
    const newConfig = this.props.config.set('messageUseDataSource', currentSelectedDs)

    this.updateMessageActionConfigAndUseDataSources(newConfig)
  }

  handleActionLayerSelected = (currentSelectedDs: UseDataSource) => {
    const newConfig = this.props.config.set('actionUseDataSource', currentSelectedDs).set('sqlExprObj', null)

    this.updateMessageActionConfigAndUseDataSources(newConfig)
  }

  handleRemoveLayerForTriggerLayer = () => {
    const newConfig = this.props.config.set('messageUseDataSource', null).set('connectionType', null)

    this.updateMessageActionConfigAndUseDataSources(newConfig)
  }

  handleRemoveLayerForActionLayer = () => {
    const newConfig = this.props.config.set('actionUseDataSource', null).set('sqlExprObj', null).set('connectionType', null)

    this.updateMessageActionConfigAndUseDataSources(newConfig)
  }

  showSqlExprPopup = () => {
    this.setState({ isSqlExprShow: true })
  }

  toggleSqlExprPopup = () => {
    this.setState({ isSqlExprShow: !this.state.isSqlExprShow })
  }

  onSqlExprBuilderChange = (sqlExprObj: IMSqlExpression) => {
    const newConfig = this.props.config.set('sqlExprObj', sqlExprObj)

    this.updateMessageActionConfigAndUseDataSources(newConfig)
  }

  onMessageFieldSelected = (allSelectedFields: IMFieldSchema[], ds: DataSource) => {
    const newConfig = this.props.config.set('messageUseDataSource', {
      dataSourceId: this.props.config.messageUseDataSource.dataSourceId,
      mainDataSourceId: this.props.config.messageUseDataSource.mainDataSourceId,
      dataViewId: this.props.config.messageUseDataSource.dataViewId,
      rootDataSourceId: this.props.config.messageUseDataSource.rootDataSourceId,
      fields: allSelectedFields.map(f => f.jimuName)
    })

    this.updateMessageActionConfigAndUseDataSources(newConfig)
  }

  onActionFieldSelected = (allSelectedFields: IMFieldSchema[], ds: DataSource) => {
    const newConfig = this.props.config.set('actionUseDataSource', {
      dataSourceId: this.props.config.actionUseDataSource.dataSourceId,
      mainDataSourceId: this.props.config.actionUseDataSource.mainDataSourceId,
      dataViewId: this.props.config.actionUseDataSource.dataViewId,
      rootDataSourceId: this.props.config.actionUseDataSource.rootDataSourceId,
      fields: allSelectedFields.map(f => f.jimuName)
    })

    this.updateMessageActionConfigAndUseDataSources(newConfig)
  }

  switchEnabledDataRelationShip = (checked) => {
    const newConfig = this.props.config.set('enabledDataRelationShip', checked)

    this.updateMessageActionConfigAndUseDataSources(newConfig)
  }

  checkTriggerLayerIsSameToActionLayer = () => {
    if (this.props.config.messageUseDataSource && this.props.config.actionUseDataSource) {
      if (this.props.config.messageUseDataSource.mainDataSourceId === this.props.config.actionUseDataSource.mainDataSourceId &&
        this.props.config.messageUseDataSource.rootDataSourceId === this.props.config.actionUseDataSource.rootDataSourceId) {
        return true
      } else {
        return false
      }
    } else {
      return false
    }
  }

  onUseLayersRelationship = () => {
    const newConfig = this.props.config
      .setIn(['messageUseDataSource', 'fields'], [])
      .setIn(['actionUseDataSource', 'fields'], [])
      .set('connectionType', MessageActionConnectionType.UseLayersRelationship)

    this.updateMessageActionConfigAndUseDataSources(newConfig)
  }

  onSetCustomFields = () => {
    const newConfig = this.props.config
      .setIn(['messageUseDataSource', 'fields'], [])
      .setIn(['actionUseDataSource', 'fields'], [])
      .set('connectionType', MessageActionConnectionType.SetCustomFields)

    this.updateMessageActionConfigAndUseDataSources(newConfig)
  }

  render () {
    const { config } = this.props
    const dsManager = DataSourceManager.getInstance()
    const messageUseDataSourceInstance = config.messageUseDataSource && dsManager.getDataSource(config.messageUseDataSource.dataSourceId)
    const actionUseDataSourceInstance = config.actionUseDataSource && dsManager.getDataSource(config.actionUseDataSource.dataSourceId)

    // If isCustomFields is true, it means "Set custom connection fields" radio checked. This is the only option when version <= 2024.R01
    // If isCustomFields is false, it means "Use layer's relationship" radio checked. This is a new option when version >= 2024.R02.
    const isCustomFields = !config.connectionType || config.connectionType === MessageActionConnectionType.SetCustomFields

    const { theme } = this.props

    // For filter/flash message action, both trigger data and action data can only be a single data source, not multiple data sources.
    // The default value of isMultiple prop of DataSourceSelector is false.

    // this.props.messageWidgetId is the widget that publishes message, e.g. Select widget publishes selection-change message.
    // For DataSourceSelector of publishing message widget,
    // props.fromRootDsIds is webmap/webscene data source ids, it is filtered by messageWidgetJson.useDataSources.
    // props.fromDsIds is layer data source ids, it is filtered from messageWidgetJson.useDataSources and messageWidgetJson.outputDataSources by this.props.messageType.
    // props.useDataSources is the array wrapper of this.props.config.messageUseDataSource.
    // const triggerDsSelectorSourceData = this.getDsSelectorSourceData(this.props.messageWidgetId, this.props.config.messageUseDataSource)
    const triggerDsSelectorSourceData = actionUtils.getDataSourceSelectorSourceDataForFilterAndFlashMessageActions(this.props.messageWidgetId, this.props.messageType, this.props.config.messageUseDataSource)

    // this.props.widgetId is the map widget, map widget receives message and filters features.
    // For DataSourceSelector of action widget,
    // props.fromRootDsIds is webmap/webscene data source ids, it is filtered by actionWidgetJson.useDataSources.
    // props.fromDsIds is layer data source ids, it is filtered from actionWidgetJson.useDataSources and actionWidgetJson.outputDataSources by this.props.messageType.
    // props.useDataSources is the array wrapper of this.props.config.actionUseDataSource.
    // const actionDsSelectorSourceData = this.getDsSelectorSourceData(this.props.widgetId, this.props.config.actionUseDataSource)
    const actionDsSelectorSourceData = actionUtils.getDataSourceSelectorSourceDataForFilterAndFlashMessageActions(this.props.widgetId, this.props.messageType, this.props.config.actionUseDataSource)

    const neutral900 = theme?.ref?.palette?.neutral?.[900]

    const isAnyTriggerData = this.props.config.useAnyTriggerData
    const triggerActionConnectionModeString = this.props.intl.formatMessage({ id: 'mapAction_TriggerActionConnectionMode', defaultMessage: defaultMessages.mapAction_TriggerActionConnectionMode })
    const automaticString = this.props.intl.formatMessage({ id: 'mapZoomToAction_Automatic', defaultMessage: defaultMessages.mapZoomToAction_Automatic })
    const mapFilterActionAutomaticTriggerDataTipString = this.props.intl.formatMessage({ id: 'mapFilterAction_AutomaticTriggerDataTip', defaultMessage: defaultMessages.mapFilterAction_AutomaticTriggerDataTip })
    const customizeString = this.props.intl.formatMessage({ id: 'mapAction_Customize', defaultMessage: defaultMessages.mapAction_Customize })

    const mapActionTriggerLayerString = this.props.intl.formatMessage({ id: 'mapAction_TriggerLayer', defaultMessage: defaultMessages.mapAction_TriggerLayer })
    const mapActionActionLayerString = this.props.intl.formatMessage({ id: 'mapAction_ActionLayer', defaultMessage: defaultMessages.mapAction_ActionLayer })

    return (
      <div css={this.getStyle(this.props.theme)}>
        {/* Connection mode */}
        <SettingSection title={triggerActionConnectionModeString} className='pb-0'>
          <SettingRow>
            <Label className='d-flex align-items-center label-line-height'>
              <Radio className='mr-2' checked={isAnyTriggerData} onChange={() => { this.onAllDataRadioChecked() }} />
              { automaticString }
            </Label>
            <Tooltip title={mapFilterActionAutomaticTriggerDataTipString} showArrow placement='left'>
              <span className='ml-2'>
                <InfoOutlined />
              </span>
            </Tooltip>
          </SettingRow>

          <SettingRow>
            <Label className='d-flex align-items-center label-line-height'>
              <Radio className='mr-2' checked={!isAnyTriggerData} onChange={() => { this.onCustomizeDataRadioChecked() }} />
              { customizeString }
            </Label>
          </SettingRow>
        </SettingSection>

        {/* Trigger data */}
        {
          !isAnyTriggerData &&
          <SettingSection title={mapActionTriggerLayerString} className='pt-5 pb-0'>
            <DataSourceSelector
              className='mt-2'
              types={DSSelectorTypes}
              useDataSources={triggerDsSelectorSourceData.useDataSources}
              fromRootDsIds={triggerDsSelectorSourceData.fromRootDsIds}
              fromDsIds={triggerDsSelectorSourceData.fromDsIds}
              closeDataSourceListOnChange
              disableRemove={() => triggerDsSelectorSourceData.isReadOnly}
              disableDataSourceList={triggerDsSelectorSourceData.isReadOnly}
              hideAddDataButton
              hideTypeDropdown
              mustUseDataSource
              onChange={this.handleTriggerLayerChange}
              widgetId={this.props.messageWidgetId}
              isMultiple={false}
              hideDataView={true}
              isMultipleDataView={false}
              disableDataView={true}
              enableToSelectOutputDsFromSelf={true}
            />
          </SettingSection>
        }

        {/* Action data */}
        {
          !isAnyTriggerData &&
          <SettingSection title={mapActionActionLayerString} className='pt-5 pb-0'>
            <DataSourceSelector
              className='mt-2'
              types={DSSelectorTypes}
              useDataSources={actionDsSelectorSourceData.useDataSources}
              fromRootDsIds={actionDsSelectorSourceData.fromRootDsIds}
              fromDsIds={actionDsSelectorSourceData.fromDsIds}
              closeDataSourceListOnChange
              disableRemove={() => actionDsSelectorSourceData.isReadOnly}
              disableDataSourceList={actionDsSelectorSourceData.isReadOnly}
              hideAddDataButton
              hideTypeDropdown
              mustUseDataSource
              onChange={this.handleActionLayerChange}
              widgetId={this.props.widgetId}
              isMultiple={false}
              hideDataView={true}
              isMultipleDataView={false}
              disableDataView={true}
              enableToSelectOutputDsFromSelf={true}
            />
          </SettingSection>
        }

        {/* Conditions */}
        {
          !isAnyTriggerData && this.props.config && this.props.config.messageUseDataSource && this.props.config.actionUseDataSource &&
          <SettingSection title={this.props.intl.formatMessage({ id: 'mapAction_Conditions', defaultMessage: defaultMessages.mapAction_Conditions })} className='pt-5'>
            <SettingRow tag='label' label={this.props.intl.formatMessage({ id: 'mapAction_RelateMessage', defaultMessage: defaultMessages.mapAction_RelateMessage })} className='mt-2'>
              <Switch checked={this.props.config.enabledDataRelationShip} onChange={evt => { this.switchEnabledDataRelationShip(evt.target.checked) }} />
            </SettingRow>

            <Collapse isOpen={this.props.config.enabledDataRelationShip} className='w-100'>
              <ChooseConnectionType
                messageDataSource={messageUseDataSourceInstance}
                actionDataSource={actionUseDataSourceInstance}
                connectionType={config.connectionType}
                onUseLayersRelationship={this.onUseLayersRelationship}
                onSetCustomFields={this.onSetCustomFields}
              />
              {
                this.checkTriggerLayerIsSameToActionLayer() &&
                <div className='w-100 border p-1 mr-2'>{this.props.intl.formatMessage({ id: 'mapAction_AutoBind', defaultMessage: defaultMessages.mapAction_AutoBind })}</div>
              }
              {
                !this.checkTriggerLayerIsSameToActionLayer() && isCustomFields &&
                <div className='w-100 d-flex align-items-center'>
                  <div className='d-flex flex-column relate-panel-left mt-3'>
                    <FieldSelector
                      className='w-100'
                      useDataSources={Immutable([this.props.config.messageUseDataSource?.asMutable({ deep: true })])} isDataSourceDropDownHidden
                      placeholder={this.props.intl.formatMessage({ id: 'mapAction_TriggerLayerField', defaultMessage: defaultMessages.mapAction_TriggerLayerField })}
                      onChange={this.onMessageFieldSelected} useDropdown
                      selectedFields={this.props.config.messageUseDataSource && this.props.config.messageUseDataSource.fields
                        ? this.props.config.messageUseDataSource.fields
                        : Immutable([])}
                    />
                    <FieldSelector
                      className='w-100 action-select-chooser'
                      placeholder={this.props.intl.formatMessage({ id: 'mapAction_ActionLayerField', defaultMessage: defaultMessages.mapAction_ActionLayerField })}
                      useDataSources={Immutable([this.props.config.actionUseDataSource?.asMutable({ deep: true })])} isDataSourceDropDownHidden
                      onChange={this.onActionFieldSelected} useDropdown
                      selectedFields={this.props.config.actionUseDataSource && this.props.config.actionUseDataSource.fields
                        ? this.props.config.actionUseDataSource.fields
                        : Immutable([])}
                    />
                  </div>
                  <Icon className='flex-none' width={12} height={40} color={neutral900} icon={require('jimu-ui/lib/icons/link-combined.svg')} />
                </div>
              }
            </Collapse>

            <SettingRow>
              <Button type='link' disabled={!this.props.config.actionUseDataSource} className='w-100 d-flex justify-content-start' onClick={this.showSqlExprPopup}>
                <div className='w-100 text-truncate' style={{ textAlign: 'start' }}>
                  {this.props.intl.formatMessage({ id: 'mapAction_MoreConditions', defaultMessage: defaultMessages.mapAction_MoreConditions })}
                </div>
              </Button>
              {
                this.props.config.actionUseDataSource &&
                <DataSourceComponent useDataSource={this.props.config.actionUseDataSource}>{(ds) => {
                  return (
                    <SqlExpressionBuilderPopup
                      dataSource={ds} mode={SqlExpressionMode.Simple}
                      isOpen={this.state.isSqlExprShow} toggle={this.toggleSqlExprPopup}
                      expression={this.props.config.sqlExprObj} onChange={(sqlExprObj) => { this.onSqlExprBuilderChange(sqlExprObj) }}
                    />
                  )
                }
              }
              </DataSourceComponent>}
            </SettingRow>

            <SettingRow>
              <div className='sql-expr-display'>
                {
                  this.props.config.sqlExprObj && actionUseDataSourceInstance
                    ? dataSourceUtils.getArcGISSQL(this.props.config.sqlExprObj, actionUseDataSourceInstance).displaySQL
                    : this.props.intl.formatMessage({ id: 'mapAction_SetExpression', defaultMessage: defaultMessages.mapAction_SetExpression })
                }
              </div>
            </SettingRow>
          </SettingSection>}
      </div>
    )
  }
}

export default withTheme(_FilterActionSetting)
