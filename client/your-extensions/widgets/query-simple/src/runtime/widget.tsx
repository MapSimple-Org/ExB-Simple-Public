/** @jsx jsx */
import { React, jsx, css, type AllWidgetProps } from 'jimu-core'
import { Paper, WidgetPlaceholder } from 'jimu-ui'
import { type IMConfig, QueryArrangeType } from '../config'
import defaultMessages from './translations/default'
import { getWidgetRuntimeDataMap } from './widget-config'

import { versionManager } from '../version-manager'
import { QueryTaskList } from './query-task-list'
import { TaskListInline } from './query-task-list-inline'
import { TaskListPopperWrapper } from './query-task-list-popper-wrapper'
import { QueryWidgetContext } from './widget-context'
import { debugLogger } from './debug-logger'
import { WIDGET_VERSION } from '../version'

const { iconMap } = getWidgetRuntimeDataMap()

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, { initialQueryValue?: { shortId: string, value: string } }> {
  static versionManager = versionManager

  state: { initialQueryValue?: { shortId: string, value: string } } = {}

  componentDidMount() {
    this.checkQueryStringForShortIds()
    // Listen for hash changes to detect when hash parameters are updated
    // This is needed when HelperSimple opens the widget with a hash parameter
    // or when hash parameters change while the widget is already mounted
    window.addEventListener('hashchange', this.checkQueryStringForShortIds)
    
    // Also check after a short delay to catch cases where hash was already present
    // when widget was opened (e.g., by HelperSimple opening the widget)
    setTimeout(() => {
      this.checkQueryStringForShortIds()
    }, 100)
  }

  componentWillUnmount() {
    // Clean up hashchange listener
    window.removeEventListener('hashchange', this.checkQueryStringForShortIds)
  }

  componentDidUpdate(prevProps: AllWidgetProps<IMConfig>) {
    if (prevProps.config.queryItems !== this.props.config.queryItems) {
      this.checkQueryStringForShortIds()
    }
  }

  /**
   * Removes a hash parameter from the URL after it has been used to populate a query.
   * This prevents the parameter from being re-applied when switching between queries.
   */
  removeHashParameter = (shortId: string) => {
    const hash = window.location.hash.substring(1)
    if (!hash) {
      return
    }
    
    const urlParams = new URLSearchParams(hash)
    
    if (urlParams.has(shortId)) {
      const value = urlParams.get(shortId)
      urlParams.delete(shortId)
      const newHash = urlParams.toString()
      // Update URL without triggering navigation
      // If no hash params remain, remove hash entirely, otherwise keep the hash
      const newUrl = newHash 
        ? `${window.location.pathname}${window.location.search}#${newHash}` 
        : `${window.location.pathname}${window.location.search}`
      
      debugLogger.log('HASH', {
        event: 'hash-removed',
        widgetId: this.props.id,
        shortId: shortId,
        value: value,
        newHash: newHash,
        newUrl: newUrl
      })
      
      window.history.replaceState(null, '', newUrl)
      
      // Clear the state so it won't trigger again
      if (this.state.initialQueryValue?.shortId === shortId) {
        this.setState({ initialQueryValue: undefined })
      }
    }
  }

  /**
   * Checks the URL hash parameters for any shortIds that match query items.
   * If found, stores the value to be used to auto-populate and execute the query.
   * Experience Builder uses hash-based URL parameters (e.g., #pin=2223059013).
   * 
   * This method prioritizes the first matching shortId found in the query items order.
   * If multiple hash parameters exist, only the first match is used.
   */
  checkQueryStringForShortIds = () => {
    const { config } = this.props
    if (!config.queryItems?.length) {
      return
    }

    // Extract all shortIds from query items
    const shortIds = config.queryItems
      .map(item => item.shortId)
      .filter(shortId => shortId != null && shortId.trim() !== '')

    if (shortIds.length === 0) {
      return
    }

    // Get URL hash fragment parameters (ExB uses # for params)
    const hash = window.location.hash.substring(1) // Remove the #
    const urlParams = new URLSearchParams(hash)

    // Log hash check for debugging
    debugLogger.log('HASH', {
      event: 'hash-check',
      widgetId: this.props.id,
      hash: hash,
      availableShortIds: shortIds,
      currentState: this.state.initialQueryValue
    })

    // Find the first matching shortId (prioritize first match in query items order)
    // This ensures we only set state once per check and maintains consistent behavior
    for (const shortId of shortIds) {
      if (urlParams.has(shortId)) {
        const value = urlParams.get(shortId)
        // Only update if the value has changed to avoid unnecessary re-renders
        if (this.state.initialQueryValue?.shortId !== shortId || this.state.initialQueryValue?.value !== value) {
          debugLogger.log('HASH', {
            event: 'hash-detected',
            widgetId: this.props.id,
            shortId: shortId,
            value: value,
            previousShortId: this.state.initialQueryValue?.shortId,
            previousValue: this.state.initialQueryValue?.value
          })
          this.setState({ initialQueryValue: { shortId, value } })
        } else {
          debugLogger.log('HASH', {
            event: 'hash-skipped',
            widgetId: this.props.id,
            shortId: shortId,
            value: value,
            reason: 'value-unchanged'
          })
        }
        return // Exit after first match
      }
    }

    // If no hash parameters match any shortId, clear the state
    // This handles cases where hash parameters were removed
    if (this.state.initialQueryValue) {
      debugLogger.log('HASH', {
        event: 'hash-cleared',
        widgetId: this.props.id,
        previousShortId: this.state.initialQueryValue.shortId,
        previousValue: this.state.initialQueryValue.value,
        reason: 'no-matching-hash-params'
      })
      this.setState({ initialQueryValue: undefined })
    }
  }

  render () {
    const { config, id, icon, label, layoutId, layoutItemId, controllerWidgetId } = this.props
    const widgetLabel = this.props.intl.formatMessage({
      id: '_widgetLabel',
      defaultMessage: defaultMessages._widgetLabel
    })
    if (!config.queryItems?.length) {
      return <WidgetPlaceholder icon={iconMap.iconQuery} widgetId={this.props.id} name={widgetLabel} />
    }

    if (config.arrangeType === QueryArrangeType.Popper && !controllerWidgetId) {
      return (
        <QueryWidgetContext.Provider value={`${layoutId}:${layoutItemId}`}>
          <TaskListPopperWrapper
            id={0}
            icon={icon}
            popperTitle={label}
            minSize={config.sizeMap?.arrangementIconPopper?.minSize}
            defaultSize={config.sizeMap?.arrangementIconPopper?.defaultSize}
          >
            <QueryTaskList widgetId={id} isInPopper queryItems={config.queryItems} defaultPageSize={config.defaultPageSize} className='pb-4' initialQueryValue={this.state.initialQueryValue} onHashParameterUsed={this.removeHashParameter} />
          </TaskListPopperWrapper>
        </QueryWidgetContext.Provider>
      )
    }

    if (config.arrangeType === QueryArrangeType.Inline && !controllerWidgetId) {
      return (
        <QueryWidgetContext.Provider value={`${layoutId}:${layoutItemId}`}>
          <TaskListInline
            widgetId={id}
            widgetLabel={label}
            wrap={config.arrangeWrap}
            queryItems={config.queryItems}
            minSize={config.sizeMap?.arrangementIconPopper?.minSize}
            defaultSize={config.sizeMap?.arrangementIconPopper?.defaultSize}
            defaultPageSize={config.defaultPageSize}
            initialQueryValue={this.state.initialQueryValue}
            onHashParameterUsed={this.removeHashParameter}
          />
        </QueryWidgetContext.Provider>
      )
    }

    return (
      <Paper variant='flat' className='jimu-widget runtime-query' css={css`
        display: flex;
        flex-direction: column;
        height: 100%;
      `}>
        <div className="widget-header" css={css`
          padding: 6px 16px;
          border-bottom: 1px solid var(--sys-color-divider-secondary);
          background-color: var(--sys-color-surface);
        `}>
          <h3 className="widget-title" css={css`
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            color: var(--sys-color-text-primary);
          `}>
            {label || widgetLabel}
          </h3>
        </div>
        <div css={css`
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        `}>
          <div css={css`
            flex: 1;
            overflow: auto;
          `}>
            <QueryWidgetContext.Provider value={`${layoutId}:${layoutItemId}`}>
              <QueryTaskList widgetId={id} queryItems={config.queryItems} defaultPageSize={config.defaultPageSize} initialQueryValue={this.state.initialQueryValue} onHashParameterUsed={this.removeHashParameter}/>
            </QueryWidgetContext.Provider>
          </div>
          {/* Stationary footer */}
          <div css={css`
            padding: 4px 12px;
            border-top: 1px solid var(--sys-color-divider-secondary);
            background-color: var(--sys-color-surface-paper);
            flex-shrink: 0;
            text-align: center;
          `}>
            <span css={css`
              font-size: 0.75rem;
              color: var(--sys-color-text-tertiary);
              font-weight: 400;
              letter-spacing: 0.025em;
              display: inline-flex;
              align-items: center;
              gap: 4px;
            `}>
              {/* Code/Open Source Symbol */}
              <svg 
                width="14" 
                height="14" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                css={css`
                  flex-shrink: 0;
                  opacity: 0.6;
                `}
              >
                <polyline points="16 18 22 12 16 6"/>
                <polyline points="8 6 2 12 8 18"/>
              </svg>
              QuerySimple by MapSimple.org
              <span css={css`
                margin-left: 6px;
                opacity: 0.5;
                font-size: 0.7rem;
              `}>
                v{WIDGET_VERSION}
              </span>
            </span>
          </div>
        </div>
      </Paper>
    )
  }
}

