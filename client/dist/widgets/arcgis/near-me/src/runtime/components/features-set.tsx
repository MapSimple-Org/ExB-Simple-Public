/** @jsx jsx */ // <-- make sure to include the jsx pragma
import {
  React, jsx, type IntlShape, type IMThemeVariables, type DataRecord, DataActionManager, DataLevel, type DataRecordSet, type DataAction, classNames, css,
  defaultMessages as jimuCoreDefaultMessages,
  MutableStoreManager
} from 'jimu-core'
import { Row, Button, Label, Dropdown, DropdownButton, DropdownMenu, DropdownItem, Icon, Collapse } from 'jimu-ui'
import defaultMessages from '../translations/default'
import type { JimuMapView } from 'jimu-arcgis'
import type { IMConfig } from '../../config'
import { RightOutlined } from 'jimu-icons/outlined/directional/right'
import { getFeaturesSetStyles } from '../lib/style'
import { DownOutlined } from 'jimu-icons/outlined/directional/down'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'
import Features from 'esri/widgets/Features'
import { createSymbol, formatSmallNumberWithSignificantDigits, getDisplayLabel, getSelectedLayerInstance } from '../../common/utils'
import type Graphic from 'esri/Graphic'
import * as reactiveUtils from 'esri/core/reactiveUtils'
import { ActionOutlined } from 'jimu-icons/outlined/application/action'
import type { FormatNumberOptions } from 'react-intl'

interface Props {
  intl: IntlShape
  widgetId: string
  index: string
  theme: IMThemeVariables
  config: IMConfig
  popupTitleField: string
  jimuMapView: JimuMapView
  selectedRecord: DataRecord
  selectedFeatureLength: number
  ifOneAnalysisResult: boolean
  distanceUnit: string
  showPlanRoute: boolean
  isExpanded: boolean
  expandOnOpen: boolean
  approximateDistanceUI?: boolean
  showDistFromInputLocation: boolean
  isEnableProximitySearch: boolean
  showDataActions: boolean
  isGroup: boolean
  graphicLayer?: GraphicsLayer
  children?: React.ReactNode
  displayMapSymbol: boolean
  selectedLayerDsId: string
  startingPointGraphic: Graphic
  showClippedFeaturesInfo?: boolean
  selectRecord?: (index: string, popupContainer: HTMLDivElement, record: DataRecord) => void
  clearRecord?: (index: string) => void
  highlightFeature?: (featureRecord: DataRecord, showHighlight: boolean) => void
}
interface State {
  isFeatureLayerOpen: boolean
  isIconRight: boolean
  title: string
  isTitleLoaded: boolean
  featureItem: React.JSX.Element
  actionElement: React.ReactElement
}

export default class FeaturesSet extends React.PureComponent<Props, State> {
  public popUpContent: React.RefObject<HTMLDivElement>
  public readonly symbolRef: React.RefObject<HTMLDivElement>
  public featureWidgetTitle: React.RefObject<HTMLDivElement>
  public planRouteAction: DataAction
  public dataSetPlanRoute: DataRecordSet[]
  public dataSetArray: DataRecordSet[]
  dropdownRef = React.createRef<HTMLButtonElement>()
  public recordActionNames: string[]
  public recordActions: any

  constructor (props) {
    super(props)
    this.popUpContent = React.createRef()
    this.symbolRef = React.createRef()
    this.featureWidgetTitle = React.createRef()
    this.planRouteAction = null
    this.recordActionNames = []
    this.recordActions = {}

    if (this.props.config) {
      this.state = {
        isFeatureLayerOpen: this.props.isExpanded,
        isIconRight: !this.props.isExpanded,
        title: '',
        isTitleLoaded: false,
        featureItem: null,
        actionElement: null
      }
    }
  }

  nls = (id: string) => {
    const messages = Object.assign({}, defaultMessages, jimuCoreDefaultMessages)
    //for unit testing no need to mock intl we can directly use default en msg
    if (this.props.intl?.formatMessage) {
      return this.props.intl.formatMessage({ id: id, defaultMessage: messages[id] })
    } else {
      return messages[id]
    }
  }

  componentDidMount = async () => {
    await this.getDataSetForActions()
    //for closest and proximity with expanded list
    //if only one analysis result is returned with only one feature then zoom to feature automatically
    if (!this.props.popupTitleField || (this.props.popupTitleField && this.props.isExpanded)) {
      this.createFeatureItem(this.props.ifOneAnalysisResult && this.props.expandOnOpen, this.props.displayMapSymbol)
    } else if (this.props.ifOneAnalysisResult && this.props.popupTitleField && this.props.expandOnOpen) {
      this.onToggleSelectedLayer()
    }
    if (this.props.displayMapSymbol) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      createSymbol(this.props.selectedRecord, this.symbolRef)
    }
  }

  componentDidUpdate = (prevProps) => {
    // also create symbol if layer is changed
    if (prevProps.selectedRecord !== this.props.selectedRecord && this.props.displayMapSymbol) {
      createSymbol(this.props.selectedRecord, this.symbolRef)
    }
  }

  /**
   * Get the data set for the action
   */
  getDataSetForActions = async () => {
    const featureRecord = this.props.selectedRecord as any
    const selectedDataSource = getSelectedLayerInstance(this.props.selectedLayerDsId) as any
    this.recordActionNames = []
    this.recordActions = {}
    this.dataSetPlanRoute = []
    this.dataSetArray = []

    const dataSet = [{
      dataSource: selectedDataSource,
      records: [this.props.selectedRecord],
      name: selectedDataSource.getLabel(),
      type: 'selected' as 'selected' | 'loaded' | 'current'
    }]
    this.dataSetArray = dataSet
    try {
      [this.recordActions] = await this.getAvailableActions()
      this.recordActionNames = Object.keys(this.recordActions).filter((action) => action !== 'export')
    } catch (err) {
      console.error(err)
      this.recordActions = {}
    }

    //if starting point and selected feature graphic geometry is point then only show the Plan Route action in the data action list
    const startingPointRecord = this.props.startingPointGraphic ? selectedDataSource.buildRecord(this.props.startingPointGraphic) : null
    if (this.props.showPlanRoute && featureRecord.feature?.geometry?.type === 'point' && startingPointRecord) {
      this.dataSetPlanRoute = [{
        dataSource: selectedDataSource,
        records: [startingPointRecord, this.props.selectedRecord],
        name: selectedDataSource.getLabel(),
        type: 'selected' as 'selected' | 'loaded' | 'current'
      }]
      const actions = await DataActionManager.getInstance().getSupportedActions(this.props.widgetId, this.dataSetPlanRoute, DataLevel.Records)
      if (actions.PlanRoute?.length > 0) {
        this.planRouteAction = actions.PlanRoute[0]
      }
    }
  }

  /**
   * Get all the available data action
   * @returns records action promise
   */
  getAvailableActions = () => {
    // If no records, return empty record action list
    let recordActionsPromise = null
    let recordsCount = 0
    for (const dataSet of this.dataSetArray) {
      recordsCount += dataSet.records.length
    }
    if (recordsCount !== 0) {
      recordActionsPromise = DataActionManager.getInstance().getSupportedActions(this.props.widgetId, this.dataSetArray, DataLevel.Records)
    }
    return Promise.all([recordActionsPromise || {}])
  }

  /**
   * Create the feature module using feature record
   */
  createFeature = () => {
    const featureRecord = this.props.selectedRecord as any
    if (featureRecord?.feature) {
      const container = document && document.createElement('div')
      container.className = 'jimu-widget bg-transparent pointer'
      const parent = this.popUpContent.current
      parent?.insertBefore(container, parent.firstChild || null)
      const featureWidget = new Features({
        container: container,
        view: this.props.jimuMapView.view,
        features: [featureRecord.feature],
        map: this.props.jimuMapView.view.map,
        spatialReference: this.props.jimuMapView.view.spatialReference,
        visible: true,
        visibleElements: {
          heading: false,
          actionBar: false,
          closeButton: false
        }
      })

      featureWidget.viewModel.defaultPopupTemplateEnabled = true
      //update the feature title div with the feature popup title if the feature popup title is present
      reactiveUtils.watch(() => featureWidget.viewModel.title, (title) => {
        if (title !== '' && this.featureWidgetTitle?.current) {
          this.featureWidgetTitle.current.innerHTML = title
        }
      })
    }
  }

  /**
   * Get the popup title for aria-label
   * @returns string popup title for aria-label
   */
  displayPopupTitle = (): string => {
    let popupTitle = ''
    if (this.props.selectedRecord) {
      popupTitle = this.props.selectedRecord.getFormattedFieldValue(this.props.popupTitleField, this.props.intl)
    }
    return getDisplayLabel(popupTitle, this.nls('noValueForDisplayField'))
  }

  /**
   * On toggle the layer the feature details section will show or collapse
   */
  onToggleSelectedLayer = () => {
    if (!this.props.isExpanded) {
      this.setState({
        isFeatureLayerOpen: !this.state.isFeatureLayerOpen,
        isIconRight: !this.state.isIconRight
      }, () => {
        if (this.state.isFeatureLayerOpen && !this.state.featureItem) {
          this.createFeatureItem(true)
        } else {
          this.onFeatureDetailsClick()
        }
      })
    }
  }

  /**
   * On feature details click highlight the feature or flash it on the map
   */
  onFeatureDetailsClick = (e?) => {
    if (e && (e.target as HTMLElement).tagName.toLocaleLowerCase().startsWith('calcite')) {
      e.stopPropagation()
      return
    }
    const featureRecord = this.props.selectedRecord as any
    if (featureRecord) {
      if (featureRecord.getFeature().geometry) {
        this.selectOrClearRecord()
      } else {
        featureRecord._dataSource.queryById(this.props.selectedRecord.getId()).then((fetchedRecord) => {
          this.selectOrClearRecord(fetchedRecord)
        })
      }
    }
  }

  /**
   * Select or clear the record based on if it is already selected and if details are open
   */
  selectOrClearRecord = (fetchedRecord?: DataRecord) => {
    if (!this.popUpContent?.current?.classList.contains('record-selected') && this.state.isFeatureLayerOpen) {
      this.props.selectRecord(this.props.index, this.popUpContent.current, fetchedRecord ?? this.props.selectedRecord)
    } else {
      this.props.clearRecord(this.props.index)
    }
  }

  /**
   * On expand list create each feature item with its approximate distance and feature details
   * @param boolean flag to call featuresDetails click once the item is created
   */
  createFeatureItem = (callFeatureDetailsClick: boolean, displayMapSymbol?: boolean) => {
    const featureRecord = this.props.selectedRecord as any
    let individualFeatureItem: React.JSX.Element = null
    const formattedDistance = this.props.intl.formatNumber(featureRecord.feature.distance, { maximumFractionDigits: 2 })
    //Show the Display field value instead of the Approximate distance string in case expand feature details
    const title = this.props.popupTitleField && this.props.isExpanded ? this.displayPopupTitle() : this.nls('approximateDistance')
    const displayFeatureTitle = this.props.approximateDistanceUI && (this.props.showDistFromInputLocation || this.props.popupTitleField)
    individualFeatureItem = (
      <div>
        {/* show approximateDistanceUI - closet, proximity with expanded list */}
        {(displayMapSymbol || (displayFeatureTitle && this.props.isExpanded)) &&
          <div className='approximateDist-container nm-border-bottom-color'>
            {displayMapSymbol && <div className='feature-title-map-symbol' ref={this.symbolRef}></div>}
            {displayFeatureTitle &&
              <div className='approximateDist-label'>
                <Label className='mb-0'>
                  {title}
                </Label>
              </div>}
            {this.props.showDistFromInputLocation && this.props.approximateDistanceUI &&
              <Label tabIndex={-1} className='approximateDist mb-0 pt-0 font-weight-bold'>
                <div tabIndex={0} aria-label={this.getAriaLabelString(this.nls('approximateDistance'), formattedDistance, this.props.distanceUnit)}>
                  {this.getLabelForDistUnit(formattedDistance, this.props.distanceUnit)}
                </div>
              </Label>
            }
          </div>
        }
        <div className='title2 feature-widget-title-container nm-border-bottom-color'>
          <div ref={this.featureWidgetTitle} className='feature-widget-title'></div>
          {this.props.showDataActions && (this.recordActionNames?.length > 0 || this.planRouteAction) &&
            <div className={'pr-1'}>
              {this.renderSupportedActionList()}
            </div>
          }
        </div>
        <div tabIndex={0} className='pb-2 pointer record-container' ref={this.popUpContent} onClick={this.onFeatureDetailsClick.bind(this)} >
          {/* Show clipped length or area based of feature geometry type and also show the value */}
          {/* Add Clipped Features Info only if esriCTClippedInfo is valid */}
          {this.props.showClippedFeaturesInfo &&
            featureRecord.feature?.attributes?.esriCTClippedInfo !== undefined &&
            featureRecord.feature?.attributes?.esriCTClippedInfo !== null &&
            this.getClippedFeaturesInfo(featureRecord.feature?.attributes?.esriCTClippedInfo)}
        </div>
      </div>
    )
    this.setState({
      featureItem: individualFeatureItem
    }, () => {
      this.createFeature()
      //when creating the featureItem first time and if callFeatureDetailsClick is true call onFeatureDetailsClick after creation of the item
      if (callFeatureDetailsClick) {
        this.onFeatureDetailsClick()
      }
    })
  }

  /**
    * Render the supported action dropdown list
    * @returns actions dropdown list
    */
  renderSupportedActionList = () => {
    const actionButton = css`
     padding-top: 3px!important;
    `
    return (
      <React.Fragment>
        <Dropdown
          className={'float-right'} direction='down' size='sm' useKeyUpEvent
          aria-label={this.nls('actions')}
          >
          <DropdownButton size='sm' arrow={false} css={actionButton} icon ref={this.dropdownRef}
            className='data-action-button' type='tertiary' title={this.nls('actions')}>
            {<ActionOutlined size='m' />}
          </DropdownButton>
          <DropdownMenu>
            {this.recordActionNames?.length > 0 &&
              this.recordActionNames.map(actionName => this.createActionItem(this.recordActions, actionName, DataLevel.Records))}
            {this.planRouteAction &&
              this.createPlanRouteAction()
            }
          </DropdownMenu>
        </Dropdown>
      </React.Fragment>
    )
  }

  /**
   * Create the plan route action item to display in the dropdown
   * @returns dropdown action item for plan route
   */
  createPlanRouteAction = () => {
    const dsId = this.dataSetPlanRoute[0].dataSource.id
    const icon = MutableStoreManager.getInstance().getStateValue(['dataActions', this.planRouteAction.name, dsId, 'icon']) || this.planRouteAction.icon
    return (
      <DropdownItem
        key={this.planRouteAction.id}
        header={false}
        aria-label={this.planRouteAction.label}
        onClick={async e => { await this.onActionItemClick(this.planRouteAction, DataLevel.Records) }}>
        <div className='d-flex align-items-center'>
          {icon && <React.Fragment>
            {
              (typeof icon === 'string')
                ? <Icon icon={icon} className='jimu-icon-auto-color' />
                : icon
            }
          </React.Fragment>
          }
          {<span className='ml-2'>{this.planRouteAction.label}</span>}
        </div>
      </DropdownItem>
    )
  }

  /**
    * Create the action items to display in the dropdown
    * @param actionGroups available action groups
    * @param actionName available action names
    * @param dataLevel data level
    * @returns dropdown action items
    */
  createActionItem = (actionGroups: any, actionName: string, dataLevel: DataLevel): React.JSX.Element => {
    const actions: DataAction[] = actionGroups[actionName]
    if (actions?.length > 0 && this.dataSetArray.length > 0) {
      if (actionName === 'locate' && !this.props.isEnableProximitySearch) {
        return
      }
      const firstAction = actions[0]
      const dsId = this.dataSetArray[0].dataSource.id
      const icon = MutableStoreManager.getInstance().getStateValue(['dataActions', firstAction.name, dsId, 'icon']) || firstAction.icon
      if (actions.length === 1) {
        return (
          <DropdownItem
            key={firstAction.id}
            header={false}
            aria-label={firstAction.label}
            onClick={async e => { await this.onActionItemClick(firstAction, dataLevel) }}>
            <div className='d-flex align-items-center'>
              {icon && <React.Fragment>
                {
                  (typeof icon === 'string')
                    ? <Icon icon={icon} className='jimu-icon-auto-color' />
                    : icon
                }
              </React.Fragment>
              }
              {<span className='ml-2'>{firstAction.label}</span>}
            </div>
          </DropdownItem>
        )
      }
    }
    return null
  }

  /**
    * On action item click export the respective item
    * @param action clicked action
    * @param dataLevel data level
    */
  onActionItemClick = async (action: DataAction, dataLevel: DataLevel): Promise<void> => {
    const ACTIVE_CLASSNAME = 'active-data-action-item'
    const prevActive = document.querySelector(`.${ACTIVE_CLASSNAME}`)
    let actionElement = null

    if (prevActive) {
      // Clean up the active className first
      prevActive.classList.remove(ACTIVE_CLASSNAME)
    }

    this.dropdownRef.current.className = classNames(this.dropdownRef.current.className, ACTIVE_CLASSNAME)
    // Execute the data action
    if (action.name === 'PlanRoute') {
      actionElement = await DataActionManager.getInstance().executeDataAction(action, this.dataSetPlanRoute, dataLevel, this.props.widgetId)
    } else {
      actionElement = await DataActionManager.getInstance().executeDataAction(action, this.dataSetArray, dataLevel, this.props.widgetId)
    }

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
  }

  /**
   * Get the string for aria label
   * @param approximateDistanceLabel approximateDistance Label
   * @param formattedDistance  formatted Distance
   * @param distanceUnit  distance Unit
   * @returns aria label string
   */
  getAriaLabelString = (approximateDistanceLabel: string, formattedDistance: string, distanceUnit: string): string => {
    let getAriaLabel = ''
    getAriaLabel = this.props.intl.formatMessage({
      id: 'ariaLabelString', defaultMessage: defaultMessages.ariaLabelString
    }, { label: approximateDistanceLabel, formattedDist: formattedDistance, distUnit: distanceUnit })
    return getAriaLabel
  }

  /**
   * Get label for distance and unit
   * @param formattedDistance formatted Distance
   * @param distanceUnit distance Unit
   * @returns distance unit label
   */
  getLabelForDistUnit = (formattedDistance: string, distanceUnit: string): string => {
    let getLabelForDistanceUnit = ''
    getLabelForDistanceUnit = this.props.intl.formatMessage({
      id: 'distanceUnitLabel', defaultMessage: defaultMessages.distanceUnitLabel
    }, { distanceLabel: formattedDistance, unitLabel: distanceUnit })
    return getLabelForDistanceUnit
  }

  /**
   * Render clipped length or area info based on feature geometry type
   */
  getClippedFeaturesInfo(value) {
    const feature = (this.props.selectedRecord as any).feature
    const defaultNumberFormat: FormatNumberOptions = {
      useGrouping: true,
      notation: 'standard',
      maximumFractionDigits: 2,
      minimumFractionDigits: 2
    }
    let formattedValue = this.props.intl.formatNumber(value, defaultNumberFormat)
    let label = ''
    // if the value is 0.00 show the actual value
    if (formattedValue === "0.00") {
      formattedValue = formatSmallNumberWithSignificantDigits(value)
    }
    const unit = this.props.distanceUnit
    if (feature && feature.geometry) {
      const geomType = feature.geometry.type
      if (geomType === 'polyline') {
        label = this.props.intl.formatMessage({
          id: 'clippedLengthLabel', defaultMessage: defaultMessages.clippedLengthLabel
        }, { value: formattedValue, unit: unit })
      } else if ((geomType === 'polygon' || geomType === 'extent')) {
        label = this.props.intl.formatMessage({
          id: 'clippedAreaLabel', defaultMessage: defaultMessages.clippedAreaLabel
        }, { value: formattedValue, unit: unit + '\u00b2' })
      }
    }
    return (
      <div className='px-2 pt-2'>
        <Label className='mb-0 font-italic' role='note'>
          {label}
        </Label>
      </div>
    )
  }

  render () {
    const featureRecord = this.props.selectedRecord as any
    const displayPopupTitle = this.displayPopupTitle()
    let featureTitleAriaLabel = displayPopupTitle
    let formattedDistance: string
    if (featureRecord.feature.distance !== undefined) {
      formattedDistance = this.props.intl.formatNumber(featureRecord.feature.distance, { maximumFractionDigits: 2 })
      featureTitleAriaLabel = this.getAriaLabelString(featureTitleAriaLabel, formattedDistance, this.props.distanceUnit)
    }
    const featuresSetStyles = getFeaturesSetStyles(this.props.theme)
    return (
      <div style={{ borderTop: '1px solid var(--sys-color-divider-secondary)' }} className='feature-container w-100 m-0' css={featuresSetStyles}>
        {/* proximity without expanded list */}
        {this.props.selectedFeatureLength > 0 && this.props.popupTitleField && !this.props.isExpanded &&
          <React.Fragment>
            <Row flow='wrap'>
              <div className={!this.props.approximateDistanceUI && this.state.isFeatureLayerOpen ? 'feature-title-container nm-border-bottom-color' : 'feature-title-container'} onClick={this.onToggleSelectedLayer.bind(this)}
                tabIndex={0} role={'button'} aria-label={featureTitleAriaLabel} onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    if (!this.props.isExpanded) {
                      this.onToggleSelectedLayer()
                    }
                  }
                }} onMouseOver={() => { this.props.highlightFeature(featureRecord, true) }}
                onMouseLeave={() => { this.props.highlightFeature(featureRecord, false) }}>
                <div className='d-inline-flex'>
                  {this.props.displayMapSymbol && <div className='feature-title-map-symbol' ref={this.symbolRef}></div>}
                  <div className='feature-title'>
                    <Label className={this.props.isExpanded ? 'label2 label-title expand-list-label-title' : 'label2 label-title'}>
                      {displayPopupTitle}
                    </Label>
                  </div>
                </div>
                <div className='d-inline-flex'>
                  {(featureRecord.feature.distance !== undefined && this.props.showDistFromInputLocation) &&
                    <Label className='label2 approximateDist pr-1'>
                      {this.getLabelForDistUnit(formattedDistance, this.props.distanceUnit)}
                    </Label>
                  }
                  <Button tabIndex={-1} type='tertiary' icon role={'button'} aria-expanded={this.state.isFeatureLayerOpen} className={'actionButton p-0'}>
                    { this.state.isIconRight && <RightOutlined size={'m'} autoFlip /> }
                    { !this.state.isIconRight && <DownOutlined size={'m'} /> }
                  </Button>
                </div>
              </div>
            </Row>

            <Collapse isOpen={this.state.isFeatureLayerOpen} className='w-100'>
              {this.state.featureItem}
            </Collapse>
          </React.Fragment>
        }

        {/* proximity with expanded list */}
        {this.props.popupTitleField && this.props.isExpanded &&
          this.state.featureItem
        }

        {/* Closest */}
        {this.props.selectedFeatureLength === 1 && !this.props.popupTitleField &&
          this.state.featureItem
        }

        {this.state.actionElement}
      </div>
    )
  }
}
