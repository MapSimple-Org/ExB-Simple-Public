/** @jsx jsx */
import { React, jsx, css, type AllWidgetProps, DataSourceManager, type FeatureLayerDataSource, type FeatureDataRecord, MessageManager, DataRecordsSelectionChangeMessage } from 'jimu-core'
import { Paper, WidgetPlaceholder } from 'jimu-ui'
import { type IMConfig, QueryArrangeType, SelectionType } from '../config'
import defaultMessages from './translations/default'
import { getWidgetRuntimeDataMap } from './widget-config'

import { versionManager } from '../version-manager'
import { QueryTaskList } from './query-task-list'
import { TaskListInline } from './query-task-list-inline'
import { TaskListPopperWrapper } from './query-task-list-popper-wrapper'
import { QueryWidgetContext } from './widget-context'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()
import { WIDGET_VERSION } from '../version'

const { iconMap } = getWidgetRuntimeDataMap()

/**
 * Custom event name for QuerySimple to notify HelperSimple of selection changes.
 */
const QUERYSIMPLE_SELECTION_EVENT = 'querysimple-selection-changed'

/**
 * Custom event name for QuerySimple to notify HelperSimple of widget open/close state.
 */
const QUERYSIMPLE_WIDGET_STATE_EVENT = 'querysimple-widget-state-changed'

/**
 * Custom event name for requesting restoration when identify popup closes.
 */
const RESTORE_ON_IDENTIFY_CLOSE_EVENT = 'querysimple-restore-on-identify-close'

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, { initialQueryValue?: { shortId: string, value: string }, isPanelVisible?: boolean, hasSelection?: boolean, selectionRecordCount?: number, lastSelection?: { recordIds: string[], outputDsId: string, queryItemConfigId: string }, resultsMode?: SelectionType, accumulatedRecords?: FeatureDataRecord[] }> {
  static versionManager = versionManager

  state: { initialQueryValue?: { shortId: string, value: string }, isPanelVisible?: boolean, hasSelection?: boolean, selectionRecordCount?: number, lastSelection?: { recordIds: string[], outputDsId: string, queryItemConfigId: string }, resultsMode?: SelectionType, accumulatedRecords?: FeatureDataRecord[] } = {
    resultsMode: SelectionType.NewSelection // Default mode
  }
  private widgetRef = React.createRef<HTMLDivElement>()
  private visibilityObserver: IntersectionObserver | null = null
  private visibilityCheckInterval: number | null = null

  componentDidMount() {
    this.checkQueryStringForShortIds()
    // Listen for hash changes to detect when hash parameters are updated
    // This is needed when HelperSimple opens the widget with a hash parameter
    // or when hash parameters change while the widget is already mounted
    window.addEventListener('hashchange', this.checkQueryStringForShortIds)
    
    // Set up visibility detection
    this.setupVisibilityDetection()
    
    // Listen for selection changes from query-result
    window.addEventListener(QUERYSIMPLE_SELECTION_EVENT, this.handleSelectionChange as EventListener)
    
    // Listen for restore requests when identify popup closes
    window.addEventListener(RESTORE_ON_IDENTIFY_CLOSE_EVENT, this.handleRestoreOnIdentifyClose as EventListener)
    
    // Notify HelperSimple that this widget is now open
    const openEvent = new CustomEvent(QUERYSIMPLE_WIDGET_STATE_EVENT, {
      detail: {
        widgetId: this.props.id,
        isOpen: true
      },
      bubbles: true,
      cancelable: true
    })
    window.dispatchEvent(openEvent)
    debugLogger.log('WIDGET-STATE', {
      event: 'widget-opened',
      widgetId: this.props.id,
      isOpen: true,
      timestamp: new Date().toISOString()
    })
    
    // Also check after a short delay to catch cases where hash was already present
    // when widget was opened (e.g., by HelperSimple opening the widget)
    setTimeout(() => {
      this.checkQueryStringForShortIds()
    }, 100)
  }

  componentWillUnmount() {
    // Clean up hashchange listener
    window.removeEventListener('hashchange', this.checkQueryStringForShortIds)
    
    // Clean up selection change listener
    window.removeEventListener(QUERYSIMPLE_SELECTION_EVENT, this.handleSelectionChange as EventListener)
    
    // Clean up restore on identify close listener
    window.removeEventListener(RESTORE_ON_IDENTIFY_CLOSE_EVENT, this.handleRestoreOnIdentifyClose as EventListener)
    
    // Clean up visibility detection
    this.cleanupVisibilityDetection()
    
    // Notify HelperSimple that this widget is now closed
    const closeEvent = new CustomEvent(QUERYSIMPLE_WIDGET_STATE_EVENT, {
      detail: {
        widgetId: this.props.id,
        isOpen: false
      },
      bubbles: true,
      cancelable: true
    })
    window.dispatchEvent(closeEvent)
    debugLogger.log('WIDGET-STATE', {
      event: 'widget-closed',
      widgetId: this.props.id,
      isOpen: false,
      timestamp: new Date().toISOString()
    })
  }

  componentDidUpdate(prevProps: AllWidgetProps<IMConfig>) {
    if (prevProps.config.queryItems !== this.props.config.queryItems) {
      this.checkQueryStringForShortIds()
    }
  }

  /**
   * Notifies HelperSimple of selection changes.
   * Called by QueryTaskResult when selection is made.
   * 
   * @param recordIds - Array of selected record IDs
   * @param dataSourceId - Optional data source ID
   */
  notifyHelperSimpleOfSelection = (recordIds: string[], dataSourceId?: string) => {
    const { id } = this.props
    
    const event = new CustomEvent(QUERYSIMPLE_SELECTION_EVENT, {
      detail: {
        widgetId: id,
        recordIds,
        dataSourceId
      },
      bubbles: true,
      cancelable: true
    })
    window.dispatchEvent(event)
  }

  /**
   * Sets up visibility detection to track when the widget panel is open/closed.
   * Uses IntersectionObserver if available, falls back to periodic checking.
   */
  setupVisibilityDetection = () => {
    // Wait for next tick to ensure ref is set
    setTimeout(() => {
      if (!this.widgetRef.current) {
        debugLogger.log('WIDGET-STATE', {
          event: 'visibility-detection-setup-failed',
          widgetId: this.props.id,
          reason: 'widget-ref-not-available'
        })
        return
      }

      const element = this.widgetRef.current

      // Method 1: IntersectionObserver (most efficient)
      if ('IntersectionObserver' in window) {
        this.visibilityObserver = new IntersectionObserver(
          (entries) => {
            const entry = entries[0]
            const isVisible = entry.isIntersecting && entry.intersectionRatio > 0
            
            // Only log if state changed
            if (this.state.isPanelVisible !== isVisible) {
              this.setState({ isPanelVisible: isVisible })
              this.logVisibilityChange(isVisible, 'IntersectionObserver')
              this.notifyHelperSimpleOfPanelState(isVisible)
            }
          },
          {
            threshold: [0, 0.1, 1.0], // Trigger at 0%, 10%, and 100% visibility
            rootMargin: '0px'
          }
        )
        
        this.visibilityObserver.observe(element)
        debugLogger.log('WIDGET-STATE', {
          event: 'visibility-detection-setup',
          widgetId: this.props.id,
          method: 'IntersectionObserver'
        })
      } else {
        // Method 2: Fallback to periodic checking
        this.visibilityCheckInterval = window.setInterval(() => {
          const isVisible = this.checkVisibility()
          if (this.state.isPanelVisible !== isVisible) {
            this.setState({ isPanelVisible: isVisible })
            this.logVisibilityChange(isVisible, 'periodic-check')
            this.notifyHelperSimpleOfPanelState(isVisible)
          }
        }, 250) // Check every 250ms
        
        debugLogger.log('WIDGET-STATE', {
          event: 'visibility-detection-setup',
          widgetId: this.props.id,
          method: 'periodic-check'
        })
      }
    }, 100)
  }

  /**
   * Cleans up visibility detection observers/intervals.
   */
  cleanupVisibilityDetection = () => {
    if (this.visibilityObserver) {
      this.visibilityObserver.disconnect()
      this.visibilityObserver = null
    }
    
    if (this.visibilityCheckInterval !== null) {
      clearInterval(this.visibilityCheckInterval)
      this.visibilityCheckInterval = null
    }
  }

  /**
   * Checks if the widget element is currently visible.
   * Fallback method when IntersectionObserver is not available.
   */
  checkVisibility = (): boolean => {
    if (!this.widgetRef.current) return false
    
    const element = this.widgetRef.current
    const style = window.getComputedStyle(element)
    const rect = element.getBoundingClientRect()
    
    const isVisible = (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      rect.width > 0 &&
      rect.height > 0 &&
      rect.top < window.innerHeight &&
      rect.bottom > 0 &&
      rect.left < window.innerWidth &&
      rect.right > 0
    )
    
    return isVisible
  }

  /**
   * Tracks selection changes from query-result.
   */
  handleSelectionChange = (event: Event) => {
    const customEvent = event as CustomEvent<{ widgetId: string, recordIds: string[], dataSourceId?: string, outputDsId?: string, queryItemConfigId?: string }>
    const { id } = this.props
    
    // Only track if this is for our widget
    if (customEvent.detail.widgetId !== id) {
      return
    }
    
    const hasSelection = customEvent.detail.recordIds && customEvent.detail.recordIds.length > 0
    this.setState({
      hasSelection,
      selectionRecordCount: hasSelection ? customEvent.detail.recordIds.length : 0,
      lastSelection: hasSelection && customEvent.detail.outputDsId && customEvent.detail.queryItemConfigId
        ? {
            recordIds: customEvent.detail.recordIds,
            outputDsId: customEvent.detail.outputDsId,
            queryItemConfigId: customEvent.detail.queryItemConfigId
          }
        : undefined
    })
  }

  /**
   * Handles restore request when identify popup closes.
   * Only restores if widget panel is open.
   */
  private handleRestoreOnIdentifyClose = (event: Event) => {
    const customEvent = event as CustomEvent<{ 
      widgetId: string, 
      recordIds: string[], 
      outputDsId: string,
      queryItemConfigId: string
    }>
    const { id } = this.props
    
    // Only handle if this is for our widget
    if (customEvent.detail.widgetId !== id) {
      return
    }
    
    const isWidgetOpen = this.state.isPanelVisible === true
    
    debugLogger.log('RESTORE', {
      event: 'identify-popup-closed-restore-requested',
      widgetId: id,
      isWidgetOpen,
      recordCount: customEvent.detail.recordIds.length,
      outputDsId: customEvent.detail.outputDsId,
      queryItemConfigId: customEvent.detail.queryItemConfigId
    })
    
    // Only restore if widget is open
    if (!isWidgetOpen) {
      debugLogger.log('RESTORE', {
        event: 'identify-popup-closed-restore-skipped-widget-closed',
        widgetId: id,
        recordCount: customEvent.detail.recordIds.length
      })
      return
    }
    
    // Check if we have matching selection state
    if (!this.state.hasSelection || !this.state.lastSelection) {
      debugLogger.log('RESTORE', {
        event: 'identify-popup-closed-restore-skipped-no-selection',
        widgetId: id,
        hasSelection: this.state.hasSelection,
        hasLastSelection: !!this.state.lastSelection
      })
      return
    }
    
    // Verify the outputDsId matches
    if (this.state.lastSelection.outputDsId !== customEvent.detail.outputDsId) {
      debugLogger.log('RESTORE', {
        event: 'identify-popup-closed-restore-skipped-ds-mismatch',
        widgetId: id,
        ourOutputDsId: this.state.lastSelection.outputDsId,
        requestedOutputDsId: customEvent.detail.outputDsId
      })
      return
    }
    
    // Verify the queryItemConfigId matches (optional but good to check)
    if (this.state.lastSelection.queryItemConfigId !== customEvent.detail.queryItemConfigId) {
      debugLogger.log('RESTORE', {
        event: 'identify-popup-closed-restore-skipped-query-mismatch',
        widgetId: id,
        ourQueryItemConfigId: this.state.lastSelection.queryItemConfigId,
        requestedQueryItemConfigId: customEvent.detail.queryItemConfigId
      })
      return
    }
    
    // Restore selection to map (reuse existing method)
    debugLogger.log('RESTORE', {
      event: 'identify-popup-closed-restoring-selection',
      widgetId: id,
      recordCount: customEvent.detail.recordIds.length,
      outputDsId: customEvent.detail.outputDsId
    })
    
    this.addSelectionToMap()
  }

  /**
   * Adds selection to map when widget opens (reuses Add to Map logic).
   */
  private addSelectionToMap = () => {
    const { lastSelection } = this.state
    const { id, config } = this.props
    
    if (!lastSelection) {
      return
    }

    const dsManager = DataSourceManager.getInstance()
    const outputDS = dsManager.getDataSource(lastSelection.outputDsId) as FeatureLayerDataSource
    
    if (!outputDS) {
      debugLogger.log('RESTORE', {
        event: 'panel-opened-output-ds-not-found',
        widgetId: id,
        outputDsId: lastSelection.outputDsId
      })
      return
    }

    // Get records from output DS (same as Add to Map)
    const allRecords = outputDS.getAllLoadedRecords() || []
    const recordsToSelect = allRecords.filter(record => 
      lastSelection.recordIds.includes(record.getId())
    ) as FeatureDataRecord[]
    
    if (recordsToSelect.length === 0) {
      debugLogger.log('RESTORE', {
        event: 'panel-opened-no-matching-records',
        widgetId: id,
        ourRecordCount: lastSelection.recordIds.length
      })
      return
    }

    // Same logic as Add to Map action - selectRecordsAndPublish handles duplicate checking
    // Don't zoom when restoring on widget open (Add to Map action handles zoom for manual clicks)
    try {
      const { selectRecordsAndPublish } = require('./selection-utils')
      selectRecordsAndPublish(id, outputDS, lastSelection.recordIds, recordsToSelect, true)
      
      debugLogger.log('RESTORE', {
        event: 'panel-opened-selection-added-to-map',
        widgetId: id,
        recordCount: recordsToSelect.length,
        zoomExecuted: false
      })
    } catch (error) {
      debugLogger.log('RESTORE', {
        event: 'panel-opened-add-to-map-failed',
        widgetId: id,
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  /**
   * Handles results mode change from dropdown.
   * Updates widget state and logs the change for debugging.
   */
  private handleResultsModeChange = (mode: SelectionType) => {
    debugLogger.log('RESULTS-MODE', {
      event: 'mode-changed',
      widgetId: this.props.id,
      previousMode: this.state.resultsMode,
      newMode: mode,
      timestamp: new Date().toISOString()
    })
    
    // If switching to "New" mode, clear accumulated records
    if (mode === SelectionType.NewSelection) {
      debugLogger.log('RESULTS-MODE', {
        event: 'clearing-accumulated-records-on-mode-switch',
        widgetId: this.props.id,
        previousMode: this.state.resultsMode
      })
      this.setState({ resultsMode: mode, accumulatedRecords: [] })
    } else {
      this.setState({ resultsMode: mode })
    }
  }

  private handleAccumulatedRecordsChange = (records: FeatureDataRecord[]) => {
    debugLogger.log('RESULTS-MODE', {
      event: 'accumulated-records-updated',
      widgetId: this.props.id,
      recordsCount: records.length
    })
    this.setState({ accumulatedRecords: records })
  }

  /**
   * NOTE: No longer needed - we use existing output DS instead of creating new one.
   * Kept for reference but not used.
   */
  private getOrCreateAccumulatedResultsDS = async (originDS: FeatureLayerDataSource): Promise<FeatureLayerDataSource> => {
    // This is no longer used - we merge records into existing output DS
    throw new Error('This method is deprecated - use existing output DS instead')
  }

  /**
   * Clears selection from map only (keeps selection in widget's internal state).
   * Called when widget panel closes to remove selection from map while preserving widget state.
   */
  private clearSelectionFromMap = () => {
    const { lastSelection } = this.state
    const { id } = this.props
    
    debugLogger.log('RESTORE', {
      event: 'panel-closed-clearing-selection-from-map',
      widgetId: id,
      hasLastSelection: !!lastSelection,
      selectionRecordCount: lastSelection?.recordIds.length || 0
    })
    
    if (!lastSelection) {
      debugLogger.log('RESTORE', {
        event: 'panel-closed-no-selection-to-clear',
        widgetId: id
      })
      return
    }

    const dsManager = DataSourceManager.getInstance()
    const outputDS = dsManager.getDataSource(lastSelection.outputDsId) as FeatureLayerDataSource
    
    if (!outputDS) {
      debugLogger.log('RESTORE', {
        event: 'panel-closed-output-ds-not-found',
        widgetId: id,
        outputDsId: lastSelection.outputDsId
      })
      return
    }

    try {
      // Get origin DS (the map layer)
      const originDS = outputDS.getOriginDataSources()?.[0] as FeatureLayerDataSource
      
      if (!originDS) {
        debugLogger.log('RESTORE', {
          event: 'panel-closed-origin-ds-not-found',
          widgetId: id,
          outputDsId: lastSelection.outputDsId
        })
        return
      }

      // Check current selection state before clearing
      const currentSelectedIds = originDS.getSelectedRecordIds() || []
      const ourRecordIds = lastSelection.recordIds
      const matchesOurSelection = ourRecordIds.length === currentSelectedIds.length &&
        ourRecordIds.every(recordId => currentSelectedIds.includes(recordId))
      
      debugLogger.log('RESTORE', {
        event: 'panel-closed-checking-map-selection',
        widgetId: id,
        ourRecordCount: ourRecordIds.length,
        mapSelectedCount: currentSelectedIds.length,
        matchesOurSelection,
        ourRecordIds: ourRecordIds.slice(0, 5),
        mapSelectedIds: currentSelectedIds.slice(0, 5)
      })

      if (typeof originDS.selectRecordsByIds === 'function') {
        // Clear selection from originDS (map) only - don't touch outputDS (widget state)
        originDS.selectRecordsByIds([], [])
        
        debugLogger.log('RESTORE', {
          event: 'panel-closed-cleared-origin-ds-selection',
          widgetId: id,
          originDSId: originDS.id
        })
        
        // Publish clear message so map knows to clear
        MessageManager.getInstance().publishMessage(
          new DataRecordsSelectionChangeMessage(id, [], [originDS.id])
        )
        
        debugLogger.log('RESTORE', {
          event: 'panel-closed-published-clear-message',
          widgetId: id,
          originDSId: originDS.id
        })
        
        // Verify selection was cleared
        const afterClearIds = originDS.getSelectedRecordIds() || []
        debugLogger.log('RESTORE', {
          event: 'panel-closed-selection-cleared-from-map',
          widgetId: id,
          recordCount: lastSelection.recordIds.length,
          originDSId: originDS.id,
          selectionAfterClear: afterClearIds.length,
          verifiedCleared: afterClearIds.length === 0
        })
      } else {
        debugLogger.log('RESTORE', {
          event: 'panel-closed-origin-ds-no-select-method',
          widgetId: id,
          originDSId: originDS.id,
          hasSelectMethod: typeof originDS.selectRecordsByIds === 'function'
        })
      }
    } catch (error) {
      debugLogger.log('RESTORE', {
        event: 'panel-closed-clear-from-map-failed',
        widgetId: id,
        error: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined
      })
    }
  }

  /**
   * Logs visibility state changes.
   */
  logVisibilityChange = (isVisible: boolean, method: string) => {
    debugLogger.log('WIDGET-STATE', {
      event: isVisible ? 'panel-opened' : 'panel-closed',
      widgetId: this.props.id,
      isVisible,
      method,
      timestamp: new Date().toISOString()
    })
    
    if (isVisible) {
      // When panel opens, log if we have selection and add to map
      debugLogger.log('RESTORE', {
        event: 'panel-opened-checking-selection',
        widgetId: this.props.id,
        hasSelection: this.state.hasSelection || false,
        selectionRecordCount: this.state.selectionRecordCount || 0
      })
      
      // Add selection to map if we have one
      if (this.state.hasSelection) {
        this.addSelectionToMap()
      }
    } else {
      // When panel closes, clear selection from map only (keep widget state)
      if (this.state.hasSelection) {
        this.clearSelectionFromMap()
      } else {
        debugLogger.log('RESTORE', {
          event: 'panel-closed-no-selection-to-clear',
          widgetId: this.props.id
        })
      }
    }
  }

  /**
   * Notifies HelperSimple of panel visibility state changes.
   */
  notifyHelperSimpleOfPanelState = (isVisible: boolean) => {
    const event = new CustomEvent(QUERYSIMPLE_WIDGET_STATE_EVENT, {
      detail: {
        widgetId: this.props.id,
        isOpen: isVisible
      },
      bubbles: true,
      cancelable: true
    })
    window.dispatchEvent(event)
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
            <QueryTaskList 
              widgetId={id} 
              isInPopper 
              queryItems={config.queryItems} 
              defaultPageSize={config.defaultPageSize} 
              className='pb-4' 
              initialQueryValue={this.state.initialQueryValue} 
              onHashParameterUsed={this.removeHashParameter}
              resultsMode={this.state.resultsMode}
              onResultsModeChange={this.handleResultsModeChange}
              accumulatedRecords={this.state.accumulatedRecords}
              onAccumulatedRecordsChange={this.handleAccumulatedRecordsChange}
            />
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
      <Paper ref={this.widgetRef} variant='flat' className='jimu-widget runtime-query' css={css`
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
              <QueryTaskList 
                widgetId={id} 
                queryItems={config.queryItems} 
                defaultPageSize={config.defaultPageSize} 
                initialQueryValue={this.state.initialQueryValue} 
                onHashParameterUsed={this.removeHashParameter}
                resultsMode={this.state.resultsMode}
                onResultsModeChange={this.handleResultsModeChange}
                accumulatedRecords={this.state.accumulatedRecords}
                onAccumulatedRecordsChange={this.handleAccumulatedRecordsChange}
              />
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

