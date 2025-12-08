/** @jsx jsx */
import { React, jsx, type IntlShape, type IMThemeVariables, type DataRecord, css, DataLevel, type DataAction, getAppStore, DataActionManager, type DataRecordSet, DataSourceManager, type FeatureLayerDataSource, Immutable, DataSourceTypes, type FeatureLayerQueryParams } from 'jimu-core'
import { getLayerAccordionStyle, getCardStyle } from '../lib/style'
import defaultMessages from '../translations/default'
import { type AnalysisSettings, AnalysisTypeName, type SearchSettings } from '../../config'
import { Button, Icon, Collapse, Label, type IconComponentProps, Row, Dropdown, DropdownButton, DropdownMenu, DropdownItem, Surface } from 'jimu-ui'
import { DownOutlined } from 'jimu-icons/outlined/directional/down'
import { RightOutlined } from 'jimu-icons/outlined/directional/right'
import { ExportOutlined } from 'jimu-icons/outlined/editor/export'
import { createSymbol, getAllFieldsNames, getDisplayLabel, getOutputDsId, getSearchWorkflow } from '../../common/utils'
import classNames from 'classnames'

interface Props {
  theme: IMThemeVariables
  key: number
  intl: IntlShape
  widgetId?: string
  analysisIcon?: IconComponentProps
  label: string
  featureCount?: number
  isExpanded: boolean
  isListView?: boolean
  children?: React.ReactNode[]
  onToggle?: (index: number, isExpanded: boolean) => void
  index?: number
  dsId?: string
  analysisId: string
  analysisType?: string
  showExportButton?: boolean
  canToggle: boolean
  records?: any
  searchSettings?: SearchSettings
  analysisSettings?: AnalysisSettings
  canShowMoreFeatures: boolean
  selectedRecord?: DataRecord
  displayMapSymbol?: boolean
}

interface State {
  isFeatureLayerOpen: boolean
  isIconDown: boolean
  label: string
  layerLabelWidth: string
  displayAnalysisIcon: boolean
  displayFeatureCount: boolean
  showExportButton: boolean
  start: number
  actionNames: string[]
  actionNamesGroups: any
  isDropDownLoading: boolean
  actionElement: React.ReactElement
  showExportOptions: boolean
}

export default class LayerAccordion extends React.PureComponent<Props, State> {
  public symbolRef: React.RefObject<HTMLDivElement>
  public layerData = []
  public canShowMoreFeatures: boolean
  public dataSet: DataRecordSet[]
  dropdownRef = React.createRef<HTMLButtonElement>()
  constructor (props) {
    super(props)
    this.symbolRef = React.createRef()
    this.canShowMoreFeatures = this.props.canShowMoreFeatures
    this.dataSet = []
    this.state = {
      isFeatureLayerOpen: this.props.isExpanded,
      isIconDown: !this.props.isExpanded,
      label: this.props?.label,
      layerLabelWidth: '',
      displayAnalysisIcon: !!this.props.analysisIcon,
      displayFeatureCount: !!this.props.featureCount,
      showExportButton: false,
      start: 0,
      actionNames: [],
      actionNamesGroups: {},
      isDropDownLoading: false,
      actionElement: null,
      showExportOptions: false
    }
  }

  nls = (id: string) => {
    const messages = Object.assign({}, defaultMessages)
    //for unit testing no need to mock intl we can directly use default en msg
    if (this.props.intl?.formatMessage) {
      return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] })
    } else {
      return messages[id]
    }
  }

  componentDidMount = async () => {
    this.updateLayerLabelWidth()
    if (this.props.displayMapSymbol) {
      createSymbol(this.props.selectedRecord, this.symbolRef)
    }
    if (this.props.showExportButton) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await this.buildExportOptions()
    }
  }

  /**
   * Build data set array for downloading individual layer export
   */
  buildDataSetArray = async () => {
    const currentDsId = getOutputDsId(this.props.widgetId, this.props.analysisType, this.props.analysisId)
    const currentDs = DataSourceManager.getInstance().getDataSource(currentDsId) as FeatureLayerDataSource
    if (this.props.analysisType === AnalysisTypeName.Summary) {
      if (this.props.dsId) {
        const dsManager = DataSourceManager.getInstance()
        const query: FeatureLayerQueryParams = {}
        query.returnGeometry = true
        query.outFields = ['*']
        query.where = '1=1'
        const result = await currentDs.queryAll(query)
        const ds = await dsManager.createDataSource(Immutable({
          id: 'downloadCsv_layer' + new Date().getTime(),
          type: DataSourceTypes.FeatureLayer,
          isDataInDataSourceInstance: true,
          schema: currentDs.getSchema(),
          label: currentDs.getLabel()
        }))
        const dsJson = Object.assign(ds.getDataSourceJson())
        DataSourceManager.getInstance().updateDataSourceByDataSourceJson(ds, Immutable({ ...dsJson, exportOptions: currentDs.getExportOptions() }))
        ds.setSourceRecords(result.records)
        //dataset for statistics attributes
        const dataSets = {
          records: result.records,
          dataSource: ds,
          name: currentDs.getLabel()
        }
        this.pushUniqueDataSet(dataSets)
        const dataSourceForSummaryRecords = this.props.records[0].dataSource
        //dataset for feature attributes
        this.pushUniqueDataSet({
          records: this.props.records,
          dataSource: dataSourceForSummaryRecords,
          name: dataSourceForSummaryRecords.getLabel(),
          fields: this.getFieldsToExport(this.props.analysisId)
        })
      }
    } else if (this.props.analysisType === AnalysisTypeName.Closest) {
      const query: FeatureLayerQueryParams = {}
      query.returnGeometry = true
      query.outFields = ['*']
      query.where = '1=1'
      const result = await currentDs.queryAll(query)
      this.pushUniqueDataSet({
        records: result.records,
        dataSource: currentDs,
        name: currentDs.getLabel()
      })
    } else {
      //proximity dataset for feature attributes
      this.pushUniqueDataSet({
        records: this.props.records,
        dataSource: currentDs,
        name: currentDs.getLabel()
      })
    }
  }

  /**
   * Push only the unique dataset
   * @param newDataSet dataset
   */
  pushUniqueDataSet = (newDataSet: DataRecordSet) => {
    const idExists = this.dataSet.some(obj => obj.dataSource.id === newDataSet.dataSource.id)
    !idExists && this.dataSet.push(newDataSet)
  }

  /**
   * Check the current config property or runtime property changed in live view
   * @param prevProps previous property
   */
  componentDidUpdate = (prevProps) => {
    //check if analysis icon config or feature count config is changed
    //accrodingly update the UI at runtime
    if (prevProps.analysisIcon !== this.props.analysisIcon ||
      prevProps.featureCount !== this.props.featureCount) {
      this.setState({
        displayAnalysisIcon: !!this.props.analysisIcon,
        displayFeatureCount: !!this.props.featureCount
      }, () => {
        this.updateLayerLabelWidth()
      })
    }
    if (this.props.displayMapSymbol && prevProps.selectedRecord !== this.props.selectedRecord) {
      createSymbol(this.props.selectedRecord, this.symbolRef)
    }
  }

  /**
   * calculate and update width for layer label
   */
  updateLayerLabelWidth = () => {
    let layerLabelWidth: number
    if (this.props.isListView) {
      if (this.state.displayAnalysisIcon && this.state.displayFeatureCount) {
        layerLabelWidth = 130
      } else if (!this.state.displayAnalysisIcon && !this.state.displayFeatureCount) {
        layerLabelWidth = 50
      } else if (this.state.displayAnalysisIcon && !this.state.displayFeatureCount) {
        layerLabelWidth = 80
      } else if (!this.state.displayAnalysisIcon && this.state.displayFeatureCount) {
        layerLabelWidth = 100
      }
      if (!this.state.showExportButton) {
        layerLabelWidth = layerLabelWidth - 24
      }
      this.setState({
        layerLabelWidth: 'calc(100% -' + ' ' + layerLabelWidth + 'px)'
      })
    } else {
      if (this.state.displayFeatureCount) {
        this.setState({
          layerLabelWidth: 'calc(100% - 64px) !important'
        })
      } else {
        this.setState({
          layerLabelWidth: 'calc(100% - 24px) !important'
        })
      }
    }
  }

  /**
   * toggles right/down icon click
   */
  onToggleSelectedLayer = () => {
    this.props.canToggle && this.setState({
      isFeatureLayerOpen: !this.state.isFeatureLayerOpen,
      isIconDown: !this.state.isIconDown
    }, () => {
      if (this.props.onToggle) {
        this.props.onToggle(this.props.index, this.state.isFeatureLayerOpen)
      }
    })
  }

  /**
   * load more features
   */
  handleFeaturesToShow = () => {
    const end = this.state.start + 20
    //by default consider to show all features
    let featureItems = this.props.children
    // if canShowMoreFeatures is true, slice the childrens to be shown and control the visbility if canShowMoreFeatures flag
    if (this.canShowMoreFeatures) {
      featureItems = this.props.children.slice(0, end)
      if (end >= this.props.children.length) {
        this.canShowMoreFeatures = false
      }
    }
    return featureItems
  }

  /**
   * Render the individual Export list
   * @returns export options dropdown list
   */
  renderIndividualExportList = () => {
    const actionButton = css`
       padding-top: 7px!important;
      `
    const loadingStyle = css`
          @keyframes loading {
            0% {transform: rotate(0deg); };
            100% {transform: rotate(360deg)};
          }
          position: absolute;
          width: 60%;
          height: 60%;
          top: 20%;
          left: 20%;
          border: 2px solid var(--sys-color-secondary-light);
          border-radius: 50%;
          border-top: 2px solid var(--sys-color-primary-main);
          box-sizing: border-box;
          animation:loading 2s infinite linear;
        `
    return (
      <React.Fragment>
        <Dropdown className={'float-right'} direction='down' size='sm' title={this.nls('exportBtnTitle')}
          useKeyUpEvent toggle={this.onIndividualExportToggle} isOpen={this.state.showExportOptions}>
          <DropdownButton size='sm' arrow={false} css={actionButton} icon ref={this.dropdownRef}
            className='data-action-button' onClick={this.onIndividualExportToggle} type='tertiary' aria-label={this.nls('exportBtnTitle')}>
            {!this.state.isDropDownLoading && <ExportOutlined size={'m'} title={this.nls('exportBtnTitle')} />}
            {this.state.isDropDownLoading && <div css={loadingStyle} />}
          </DropdownButton>
          <DropdownMenu>
            {this.state.actionNames?.length > 0 &&
              this.state.actionNames.map(actionName => this.createActionItem(this.state.actionNamesGroups, actionName, DataLevel.Records))}
          </DropdownMenu>
        </Dropdown>
        {this.state.actionElement}
      </React.Fragment>
    )
  }

  /**
   * On action item click export the respective item
   * @param action clicked action
   * @param dataLevel data level
   */
  onActionItemClick = async (action: DataAction, dataLevel: DataLevel) => {
    const ACTIVE_CLASSNAME = 'active-data-action-item'
    const prevActive = document.querySelector(`.${ACTIVE_CLASSNAME}`)

    if (prevActive) {
      // Clean up the active className first
      prevActive.classList.remove(ACTIVE_CLASSNAME)
    }

    this.dropdownRef.current.className = classNames(this.dropdownRef.current.className, ACTIVE_CLASSNAME)
    // Execute the data action
    let actionElement = null
    let newDataSetArr = this.dataSet
    //if CSV export action is clicked then push the proximity feature count dataSet in the array
    if (action.id === 'export-csv' && this.props.analysisType === AnalysisTypeName.Proximity) {
      const currentDsId = getOutputDsId(this.props.widgetId, this.props.analysisType, this.props.analysisId)
      const proximityCountDsId = currentDsId + '_Count'
      const proximityCountDs = DataSourceManager.getInstance().getDataSource(proximityCountDsId) as FeatureLayerDataSource
      const query: FeatureLayerQueryParams = {}
      query.returnGeometry = true
      query.outFields = ['*']
      query.where = '1=1'
      const result = await proximityCountDs.queryAll(query)
      //dataset for proximity layer count
      const proximityCountDataSetArr = {
        records: result.records,
        dataSource: proximityCountDs,
        name: proximityCountDs.getLabel()
      }
      newDataSetArr = [...newDataSetArr, proximityCountDataSetArr]
    }
    actionElement = await DataActionManager.getInstance().executeDataAction(action, newDataSetArr, dataLevel, this.props.widgetId)
    // This is used for close the modal
    if (actionElement !== null && typeof actionElement !== 'boolean') {
      this.setState({
        actionElement: React.cloneElement(
          actionElement,
          {
            onClose: () => { this.setState({ actionElement: null }) },
            onConfirm: (...args) => {
              !actionElement.props.keepOpenAfterConfirm && this.setState({ actionElement: null })
              return actionElement.props.onConfirm(...args)
            }
          }
        )
      })
    }
    this.setState({
      showExportOptions: false
    })
  }

  /**
   * Create the action items to display in the dropdown
   * @param actionGroups available action groups
   * @param actionName available action names
   * @param dataLevel data level
   * @returns dropdown export items
   */
  createActionItem = (actionGroups: any, actionName: string, dataLevel: DataLevel): React.JSX.Element => {
    const actions: DataAction[] = actionGroups[actionName]
    if (actionName === 'export' && actions?.length > 0) {
      if (actions.length > 0) {
        return (
          <React.Fragment key={'exportAction'}>
            {actions.map((action, index) => {
              let label = action.label
              if (action.widgetId) {
                const widget = getAppStore().getState().appConfig.widgets[action.widgetId]
                label = widget?.label ?? action.label
              }
              return (
                <DropdownItem
                  key={index}
                  header={false}
                  onClick={() => { this.onActionItemClick(action, dataLevel) }}
                >
                  {label}
                </DropdownItem>
              )
            })}
          </React.Fragment>
        )
      }
    }
    return null
  }

  /**
   * Get all the available data action
   * @returns records action promise
   */
  getAvailableActions = async () => {
    // If no records, return empty record action list
    let recordActionsPromise = null
    recordActionsPromise = DataActionManager.getInstance().getSupportedActions(this.props.widgetId, this.dataSet, DataLevel.Records)
    return Promise.all([recordActionsPromise || {}])
  }

  /**
   * Build available export options
   */
  buildExportOptions = async () => {
    this.setState({
      isDropDownLoading: true
    })
    try {
      if (this.dataSet.length === 0) {
        await this.buildDataSetArray()
      }
      const [recordActions] = await this.getAvailableActions()
      const recordActionNames = Object.keys(recordActions)
      this.setState({
        showExportButton: recordActions.export?.length,
        actionNames: recordActionNames,
        actionNamesGroups: recordActions,
        isDropDownLoading: false
      })
    } catch (err) {
      console.error(err)
      this.setState({
        actionNamesGroups: {},
        isDropDownLoading: false
      })
    }
  }

  /**
   * Export individual export files
   * @param evt event on toggle button click
   */
  onIndividualExportToggle = (evt) => {
    evt?.stopPropagation()
    this.setState({
      showExportOptions: !this.state.showExportOptions
    })
  }

  /**
   * Get configured fields to export
   * @param analysisId analysis id
   * @returns configured fields to export
   */
  getFieldsToExport = (analysisId): string[] => {
    let configFieldsToExport: string[] = []
    const configLayersInfo = this.props.analysisSettings?.layersInfo
    const { searchByLocation } = getSearchWorkflow(this.props.searchSettings)
    configLayersInfo.forEach((layerInfo) => {
      if (layerInfo.analysisInfo.analysisId === analysisId) {
        if (layerInfo.analysisInfo.fieldsToExport?.length > 0) {
          const updatedFieldsToExport = [...layerInfo.analysisInfo.fieldsToExport]
          //in case of only search by location show the approximate distance fields in the exported CSV if available
          if (!searchByLocation && layerInfo.analysisInfo.fieldsToExport.includes('esriCTApproxDistance')) {
            updatedFieldsToExport.splice(layerInfo.analysisInfo.fieldsToExport.indexOf('esriCTApproxDistance'), 1)
          }
          configFieldsToExport = updatedFieldsToExport
        } else { //if no configured fields then fallback to take all the field names
          configFieldsToExport = getAllFieldsNames(layerInfo.useDataSource.dataSourceId)
        }
      }
    })
    return configFieldsToExport
  }

  render () {
    let styles = getLayerAccordionStyle(this.props.theme, this.state.layerLabelWidth, this.props.canToggle)
    if (!this.props.isListView) {
      styles = getCardStyle(this.props.theme, this.state.layerLabelWidth)
    }
    // returns limited features to render
    const featureItems = this.handleFeaturesToShow()
    const title = getDisplayLabel(this.props.label, this.nls('noValueForDisplayField'))
    const formattedFeatureCount = this.props.intl.formatNumber(this.props.featureCount, { maximumFractionDigits: 0 })
    return (
      <Surface level="overlay" css={styles} style={{ border: this.props.isListView ? '' : '1px solid var(--sys-color-divider-secondary)' }} className={this.props.isListView ? 'layer-Container shadow-2 py-1 w-100' : 'layer-Container shadow-none py-0 w-100 card rounded-1'}>
        <Row flow='wrap'>
          <div tabIndex={0} className='layer-title-Container' onClick={this.onToggleSelectedLayer.bind(this)}
            aria-label={this.props.label} role={'button'} { ...(this.props.canToggle && { 'aria-expanded': this.state.isFeatureLayerOpen }) } onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                this.onToggleSelectedLayer()
              }
            }}>

            {this.props.displayMapSymbol && <div className='layer-title-map-symbol' ref={this.symbolRef}></div>}

            {this.state.displayAnalysisIcon &&
              <div className='icon'>
                <Icon size={'m'} icon={this.props.analysisIcon} />
              </div>
            }

            <div className='layer-title'>
              <Label className='title3 layer-title-label text-break' title={title}>
                {title}
              </Label>
            </div>

            {this.props.isListView && this.state.showExportButton &&
              this.renderIndividualExportList()
            }

            {this.state.displayFeatureCount && <Label className='count mx-0' title={formattedFeatureCount}>{formattedFeatureCount}</Label>}
            {
              <Button tabIndex={-1} type='tertiary' className='toggle-button p-0' icon aria-label={this.props.label}>
                {this.state.isIconDown && <RightOutlined size={'m'} autoFlip />}
                {!this.state.isIconDown && <DownOutlined size={'m'} />}
              </Button>}
          </div>
        </Row>
        {
          <Collapse isOpen={this.state.isFeatureLayerOpen} className='w-100'>
            {featureItems}
            {this.canShowMoreFeatures &&
              <div className='show-more-button p-1 nm-border-top-color'>
                <Button type='secondary' title={this.nls('showMoreBtnTitle')} onClick={() => { this.setState({ start: featureItems.length }) }}>{this.nls('showMoreBtnTitle')}</Button>
              </div>
            }
          </Collapse>
        }
      </Surface>
    )
  }
}
