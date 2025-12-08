/** @jsx jsx */
import {
  React, jsx, classNames, type DataSource, type IMSqlExpression, type ClauseLogic,
  type IMThemeVariables, type IntlShape, defaultMessages as jimuCoreMessages,
  appConfigUtils, type IMUseDataSource, getAppStore, lodash, dataSourceUtils,
  SqlExpressionMode, moduleLoader, focusElementInKeyboardMode
} from 'jimu-core'
import type * as sqlExpressionBuilderModule from 'jimu-ui/advanced/sql-expression-builder'
import { type filterItemConfig, FilterArrangeType, FilterItemType, FilterTriggerType } from '../config'
import { Switch, Icon, Button, Popper, Card, defaultMessages as jimuUIMessages, Alert, Select, Option, Label, Paper } from 'jimu-ui'
import { SqlExpressionRuntime, getShownClauseNumberByExpression, getTotalClauseNumberByExpression } from 'jimu-ui/basic/sql-expression-runtime'
import { FILTER_PANEL_WIDTH, getFilterItemsStyles } from './style'
import { DownFilled } from 'jimu-icons/filled/directional/down'
import { FallbackFlipOptions } from './utils'

const allDefaultMessages = Object.assign({}, jimuCoreMessages, jimuUIMessages)

interface Props {
  id: number
  widgetId: string
  arrangeType: FilterArrangeType
  triggerType: FilterTriggerType
  wrap: boolean
  isInPopup: boolean
  omitInternalStyle: boolean
  filterNum: number
  a11yLabel: string
  config: filterItemConfig
  useDataSource: IMUseDataSource
  selectedDs: DataSource
  dataSources: { [dsId: string]: DataSource } // for custom filter
  isNotReadyFromWidget?: boolean // Only for output ds
  logicalOperator: ClauseLogic
  onChange: (id: number, dataSource: DataSource, sqlExprObj: IMSqlExpression, applied: boolean) => void
  onFilterItemCollapseChange: (id: number, collapsed: boolean) => void
  theme?: IMThemeVariables
  intl: IntlShape
}

interface State {
  isOpen: boolean
  applied: boolean
  collapsed: boolean
  sqlExprObj: IMSqlExpression
  sqlChanged: boolean // for applyButton's state in button & !omit,
  outputWidgetLabel: string
  popperVersion: number
  SqlExpressionBuilder: any
}

export default class FilterItem extends React.PureComponent<Props, State> {
  pillButton: any
  endUserClausesNum: number
  clausesNumConfigured: number

  constructor (props) {
    super(props)
    const { collapseFilterExprs } = this.props.config
    const sqlExprObj = this.getSqlExprObjFromItem()
    this.endUserClausesNum = getShownClauseNumberByExpression(sqlExprObj)
    this.clausesNumConfigured = getTotalClauseNumberByExpression(sqlExprObj)
    this.state = {
      isOpen: false,
      applied: this.getAppliedState(),
      collapsed: collapseFilterExprs,
      sqlExprObj: sqlExprObj,
      sqlChanged: false,
      outputWidgetLabel: this.getOutPutWidgetLabel(),
      popperVersion: 1,
      SqlExpressionBuilder: null
    }
  }

  componentDidMount () {
    this.loadSqlExpressionBuilder()
  }

  componentDidUpdate (prevProps: Props, prevState: State) {
    const { config, logicalOperator, omitInternalStyle, useDataSource, selectedDs } = this.props
    const sqlExprObj = this.getSqlExprObjFromItem()
    this.endUserClausesNum = getShownClauseNumberByExpression(sqlExprObj)
    this.clausesNumConfigured = getTotalClauseNumberByExpression(sqlExprObj)

    if (prevProps.config !== config || prevProps.selectedDs !== selectedDs) {
      // const selectedDs = prevProps.selectedDs !== propSelectedDs ? propSelectedDs : this.state.selectedDs
      this.setState({
        applied: this.getAppliedState(),
        collapsed: prevProps.config.collapseFilterExprs !== config.collapseFilterExprs ? config.collapseFilterExprs : this.state.collapsed,
        sqlExprObj: selectedDs ? sqlExprObj : null,
        outputWidgetLabel: useDataSource.dataSourceId === prevProps.useDataSource.dataSourceId ? this.state.outputWidgetLabel : this.getOutPutWidgetLabel()
      })
      this.loadSqlExpressionBuilder() // when type is changed from single/group to custom.
    } else if (prevProps.logicalOperator !== logicalOperator || prevProps.omitInternalStyle !== omitInternalStyle) { // update applied btn
      this.setState({
        applied: this.getAppliedState()
      })
    }
  }

  loadSqlExpressionBuilder = () => {
    if (this.props.config.type === FilterItemType.Custom && !this.state.SqlExpressionBuilder) {
      moduleLoader.loadModule<typeof sqlExpressionBuilderModule>('jimu-ui/advanced/sql-expression-builder').then(modules => {
        this.setState({ SqlExpressionBuilder: modules?.SqlExpressionBuilder })
      })
    }
  }

  getSqlExprObjFromItem = () => {
    const { selectedDs, config } = this.props
    let sqlExpr = config.sqlExprObj
    if (config.type === FilterItemType.Group) {
      sqlExpr = dataSourceUtils.getDisplayedSQLExpressionFromGroupSQLExpression(config.sqlExprObjForGroup, selectedDs, this.formatMessage)
    }
    return sqlExpr
  }

  formatMessage = (id, values?: any) => {
    return this.props.intl.formatMessage({ id: id, defaultMessage: allDefaultMessages[id] }, values)
  }

  getOutPutWidgetLabel = () => {
    const widgets = getAppStore().getState().appConfig.widgets
    const wId = appConfigUtils.getWidgetIdByOutputDataSource(this.props.useDataSource)
    return widgets[wId]?.label
  }

  getAppliedState = () => {
    let applied = this.props.config.autoApplyWhenWidgetOpen || false
    if (this.props.omitInternalStyle && this.endUserClausesNum === 1 && this.clausesNumConfigured === 1) {
      applied = true
    }
    return applied
  }

  onCollapsedChange = () => {
    this.setState({ collapsed: !this.state.collapsed })
    this.props.onFilterItemCollapseChange(this.props.id, !this.state.collapsed)
  }

  onApplyChange = (checked) => {
    this.setState({ sqlChanged: false })
    this.props.onChange(this.props.id, this.props.selectedDs, this.state.sqlExprObj, checked)
  }

  onToggleChange = (checked) => {
    this.setState({ applied: checked })
    this.onApplyChange(checked)
  }

  onPillClick = (hasPopper, pillTarget) => {
    if (hasPopper) {
      this.setState({
        popperVersion: !this.state.isOpen ? this.state.popperVersion + 1 : this.state.popperVersion
      })
      this.onTogglePopper()
    } else {
      const willActive = pillTarget.className.indexOf('active') < 0
      this.onToggleChange(!!willActive)
    }
  }

  onSqlExpressionChange = (sqlExprObj: IMSqlExpression, newSelectedDs?) => {
    const { omitInternalStyle, id, selectedDs: propSelectedDs, triggerType, onChange } = this.props
    let selectedDs = propSelectedDs
    let isSqlChanged = this.getSqlExprObjFromItem()?.sql !== sqlExprObj?.sql // the initial sqlExprObj is null for custom case.
    if (newSelectedDs) { // from custom ds list: ds is changed
      selectedDs = newSelectedDs
      isSqlChanged = true
    }
    this.setState({
      sqlExprObj: sqlExprObj,
      sqlChanged: !!(triggerType === FilterTriggerType.Button && !omitInternalStyle && isSqlChanged)
    })
    if ((newSelectedDs || triggerType === FilterTriggerType.Toggle) || omitInternalStyle) {
      onChange(id, selectedDs, sqlExprObj, this.state.applied)
    }
  }

  onTogglePopper = () => {
    if (this.state.isOpen) {
      lodash.defer(() => {
        focusElementInKeyboardMode(this.pillButton)
      })
    }
    this.setState({ isOpen: !this.state.isOpen })
  }

  getFilterItem = (hasEndUserClauses: boolean, isTitleHidden = false) => {
    const { config, triggerType, arrangeType, filterNum, omitInternalStyle, wrap } = this.props
    const { icon, name, type } = config
    return (
      <div className='h-100'>
        <div className={classNames('d-flex justify-content-between w-100 pr-2 align-items-center', isTitleHidden ? 'flex-row-reverse' : '')}>
          {
            !isTitleHidden && hasEndUserClauses &&
            <Button
              aria-label={this.formatMessage(this.state.collapsed ? 'expand' : 'collapse')}
              aria-expanded={!this.state.collapsed}
              size='sm' icon variant='text' color='inherit'
              className='filter-item-expand-icon jimu-outline-inside'
              onClick={this.onCollapsedChange}
            >
              <DownFilled className={this.state.collapsed ? 'filter-item-arrow' : ''} size='s' />
            </Button>
          }
          {
            !isTitleHidden && icon && <div className={classNames('filter-item-icon', hasEndUserClauses ? '' : 'no-arrow')}>
              <Icon icon={icon.svg} size={icon.properties.size} aria-hidden='true' />
            </div>
          }
          {
            <Label check className={classNames('d-flex', { 'flex-grow-1': !isTitleHidden })}>
              {
                !isTitleHidden && <div className={classNames('filter-item-name flex-grow-1', !hasEndUserClauses && !icon ? 'no-icons' : '')}>
                  {name}
                </div>
              }
              {
                triggerType === FilterTriggerType.Toggle && <div className='ml-1 d-flex align-items-center'>
                  {this.getToggle()}
                </div>
              }
            </Label>
          }
        </div>
        {
          (this.state.sqlExprObj || type === FilterItemType.Custom) && <div
            className={classNames('w-100 pl-6 pr-6', {
              'd-none': this.state.collapsed,
              'sql-expression-inline': arrangeType === FilterArrangeType.Inline && filterNum === 1 && omitInternalStyle,
              'sql-expression-wrap': arrangeType === FilterArrangeType.Inline && filterNum === 1 && wrap
            })}
          >
            {this.getSqlExpression()}
          </div>
        }
        {
          triggerType === FilterTriggerType.Button && <div className='d-flex justify-content-end pl-5 pr-5 pt-2 pb-2'>
            {this.getApplyButtons()}
          </div>
        }
      </div>
    )
  }

  isDataSourceError = () => {
    return this.props.selectedDs === null
  }

  isOutputFromWidget = () => {
    return this.props.selectedDs?.getDataSourceJson().isOutputFromWidget
  }

  isOutputDataSourceValid = () => {
    return this.isOutputFromWidget() && !this.props.isNotReadyFromWidget
  }

  isOutputDataSourceInvalid = () => {
    return this.isOutputFromWidget() && this.props.isNotReadyFromWidget
  }

  // valid: for display all clauses of current filter.
  isDataSourceValid = () => {
    return this.props.selectedDs && ((this.isOutputFromWidget() && !this.props.isNotReadyFromWidget) || !this.isOutputDataSourceInvalid())
  }

  // loading or invalid: for the enabled/disabled state of Switch and Button.
  isDataSourceLoadingOrInvalid = () => {
    return !this.isDataSourceValid()
  }

  getErrorIcon = () => {
    if (this.isDataSourceError()) {
      return (
        <Alert
          variant='text'
          form='tooltip'
          size='small'
          type='error'
          text={this.formatMessage('dataSourceCreateError')}
          className='mr-2'
        >
        </Alert>
      )
    } else if (this.isOutputDataSourceInvalid()) {
      const warningLabel = this.formatMessage('outputDataIsNotGenerated', { outputDsLabel: this.props.selectedDs.getLabel(), sourceWidgetName: this.state.outputWidgetLabel })
      return (
        <Alert
          variant='text'
          form='tooltip'
          size='small'
          type='warning'
          text={warningLabel}
          className='mr-2'
        >
        </Alert>
      )
    } else {
      return null
    }
  }

  getToggle = () => {
    // bind error icon with toggle
    return (
      <React.Fragment>
        {this.getErrorIcon()}
        <Switch
          checked={this.state.applied}
          disabled={this.isDataSourceLoadingOrInvalid()}
          aria-label={this.props.config.name}
          onChange={evt => { this.onToggleChange(evt.target.checked) }}
        />
      </React.Fragment>
    )
  }

  getApplyButtons = () => {
    return (
      <div className={'w-100 d-flex justify-content-end apply-cancel-group'}>
        {this.getErrorIcon()}
        <Button
          type='primary' className='filter-apply-button wrap'
          disabled={this.isDataSourceLoadingOrInvalid() || !!(this.state.applied && !this.state.sqlChanged)}
          onClick={() => { this.onApplyChange(true) }}
        >
          {this.formatMessage('apply')}
        </Button>
        <Button
          type='default' className='filter-cancel-button ml-2'
          disabled={this.isDataSourceLoadingOrInvalid() || !this.state.applied}
          onClick={() => { this.onApplyChange(false) }}
          >
          {this.formatMessage('cancel')}
        </Button>
      </div>
    )
  }

  getTriggerNodeForClauses = (triggerType = this.props.triggerType) => {
    let Trigger = null
    switch (triggerType) {
      case FilterTriggerType.Toggle:
        Trigger = this.getToggle()
        break
      case FilterTriggerType.Button:
        Trigger = this.getApplyButtons()
        break
    }
    return Trigger
  }

  getSqlExpression = () => {
    if (!this.isDataSourceValid()) {
      return null
    }
    if (this.props.config.type === FilterItemType.Custom) {
      return this.getCustomSqlExpressionBuilder()
    }
    return <SqlExpressionRuntime
      widgetId={this.props.widgetId}
      dataSource={this.props.selectedDs}
      expression={this.state.sqlExprObj}
      onChange={this.onSqlExpressionChange}
    />
  }

  getCustomSqlExpressionBuilder = () => {
    const { widgetId, config, triggerType, dataSources, selectedDs } = this.props
    return (
      <div>
        <div className='filter-layer-select mt-3 mb-3'>
          <div className='layer-label'>{this.formatMessage('selectLayer')}</div>
          <Select
            className='layer-select'
            aria-label={this.formatMessage('selectLayer')}
            title={selectedDs?.getLabel() || ''}
            value={selectedDs.id}
            onChange={evt => {
              // clear the filters from previous ds
              if (this.state.applied && config.sqlExprObj) {
                this.onSqlExpressionChange(null, selectedDs)
              }
              // update to current ds
              setTimeout(() => {
                this.setState({ applied: triggerType === FilterTriggerType.Button ? false : this.state.applied }, () => {
                  this.onSqlExpressionChange(null, dataSources[evt.target.value])
                })
              }, 0)
            }}>
            {
              config.useDataSources.map(ds => {
                const dsLabel = dataSources[ds.dataSourceId]?.getLabel()
                return <Option key={ds.dataSourceId} value={ds.dataSourceId} active={selectedDs.id === ds.dataSourceId} >
                  {dsLabel}
                </Option>
              })
            }
          </Select>
        </div>
        {
          selectedDs && this.state.SqlExpressionBuilder &&
          <this.state.SqlExpressionBuilder
            mode={SqlExpressionMode.Simple}
            widgetId={widgetId}
            dataSource={selectedDs}
            forceUpdateExpression={!this.state.sqlExprObj}
            expression={this.state.sqlExprObj}
            onChange={this.onSqlExpressionChange}
          />
        }
      </div>
    )
  }

  /* toggle(TR) or button(BR): for wrap multiple clauses */
  getTriggerNodeForWrapClauses = (triggerType) => {
    return triggerType === this.props.triggerType && this.isSingleFilterAndMultipleClauses() && this.props.wrap && <div className='d-flex flex-row-reverse'>
      {this.getTriggerNodeForClauses(triggerType)}
    </div>
  }

  /* toggle or button (Right) for no-wrap multiple clauses */
  getTriggerNodeForNoWrapClause = () => {
    return this.isSingleFilterAndMultipleClauses() && !this.props.wrap && <div className='ml-4'>
      {this.getTriggerNodeForClauses()}
    </div>
  }

  // 1 filter, multiple clause configured, and visible clauses exists
  isSingleFilterAndMultipleClauses () {
    return this.props.filterNum === 1 && this.clausesNumConfigured > 1 && this.endUserClausesNum >= 1
  }

  // 1 filter, 1 clause configured, and it's visible for endUser.
  isSingleFilterAndSingleShownClause () {
    return this.props.filterNum === 1 && this.clausesNumConfigured === 1 && this.endUserClausesNum === 1
  }

  // multiple filters, current filter has only 1 single clause & it's visible for endUser.
  isMultipleFiltersAndSingleShownClause () {
    return this.props.filterNum > 1 && this.clausesNumConfigured === 1 && this.endUserClausesNum === 1
  }

  // Render block ( & popup-block), or inline.
  render () {
    const { config, arrangeType, triggerType, omitInternalStyle, wrap, isInPopup, theme, id, a11yLabel } = this.props
    const { name, icon, type } = config
    const isCustomFilter = type === FilterItemType.Custom
    const hasEndUserClausesNum = isCustomFilter || this.endUserClausesNum >= 1

    return (
      <div
        className={classNames('filter-item', { 'filter-item-custom': isCustomFilter })}
        role='group'
        aria-label={`${id === 0 ? a11yLabel : ''}. ${name}`}
      >
        <Paper variant='outlined' shape='shape2' transparent={isInPopup} className='filter-item-inline'>
          {
            arrangeType === FilterArrangeType.Block
              ? <div className='w-100'>
                {
                  omitInternalStyle &&
                  (this.isSingleFilterAndSingleShownClause() || this.isMultipleFiltersAndSingleShownClause())
                    ? <div className='w-100 pl-6 pr-6'>{this.getSqlExpression()}</div>
                    : <div className='filter-expanded-container'>{this.getFilterItem(hasEndUserClausesNum)}</div>
                }
              </div>
              : <React.Fragment>
                {
                  // single filter, single clause, single shown
                  this.isSingleFilterAndSingleShownClause()
                    ? <div className='sql-expression-inline d-flex'>
                      {this.getSqlExpression()}
                      {
                        !omitInternalStyle && <div className='ml-4'>
                          {this.getTriggerNodeForClauses()}
                        </div>
                      }
                    </div>
                    : <React.Fragment>
                      {
                        (this.isSingleFilterAndMultipleClauses() ||
                          (this.isMultipleFiltersAndSingleShownClause() && omitInternalStyle))
                          ? <div className={classNames('sql-expression-inline d-flex', {
                            'sql-expression-wrap': wrap,
                            'filter-item-pill': this.isMultipleFiltersAndSingleShownClause()
                          })}
                          >
                            {this.getTriggerNodeForWrapClauses(FilterTriggerType.Toggle)}
                            {this.getSqlExpression()}
                            {this.getTriggerNodeForWrapClauses(FilterTriggerType.Button)}
                            {this.getTriggerNodeForNoWrapClause()}
                          </div>
                          : <div className='filter-popper-container'>
                            {
                              triggerType === FilterTriggerType.Toggle && this.endUserClausesNum === 0 && !isCustomFilter
                                ? <Card className='filter-item-pill filter-item-toggle-pill'>
                                  {icon && <Icon icon={icon.svg} size={icon.properties.size} className='mr-1' />}
                                  <Label check>
                                    <span className='filter-item-name toggle-name'>{name}</span>
                                    {this.getToggle()}
                                  </Label>
                                </Card>
                                : <div className="filter-item-pill h-100 nowrap">
                                  <Button
                                    className={classNames('', { 'frame-active': this.state.applied })} title={name}
                                    ref={ref => { this.pillButton = ref }}
                                    type='default'
                                    aria-pressed={this.state.applied}
                                    onClick={evt => { this.onPillClick(hasEndUserClausesNum, this.pillButton) }}
                                  >
                                    {icon && <Icon icon={icon.svg} size={icon.properties.size} />}
                                    {name}
                                  </Button>
                                </div>
                            }
                            {
                              hasEndUserClausesNum && <Popper
                                open={this.state.isOpen}
                                toggle={this.onTogglePopper}
                                sizeOptions={true}
                                autoUpdate={true}
                                flipOptions={FallbackFlipOptions}
                                arrowOptions={true}
                                reference={this.pillButton}
                                autoFocus={this.state.popperVersion > 1}
                                forceLatestFocusElements={triggerType === FilterTriggerType.Button} // cancel button could be enabled or disabled
                              >
                                <div className='filter-items-container' css={getFilterItemsStyles(theme)} style={{ width: FILTER_PANEL_WIDTH }}>
                                  <div className={classNames('filter-item filter-item-popper', { 'filter-item-custom': isCustomFilter })}>
                                    <Paper variant='outlined' shape='shape2' className='filter-item-inline'>
                                      {this.getFilterItem(hasEndUserClausesNum, arrangeType !== FilterArrangeType.Popper)}
                                      {
                                        // to trap focus inside popper when pressing TAB key on disabled cancel button.
                                        triggerType === FilterTriggerType.Button && <Button className='sr-only' aria-label={this.formatMessage('pressTabToContinue')} />
                                      }
                                    </Paper>
                                  </div>
                                </div>
                              </Popper>
                            }
                          </div>
                      }
                    </React.Fragment>
                }
              </React.Fragment>
          }
        </Paper>
      </div>
    )
  }
}
