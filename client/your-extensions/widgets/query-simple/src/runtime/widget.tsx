/** @jsx jsx */
import { React, jsx, css, type AllWidgetProps, DataSourceManager, type FeatureLayerDataSource, type FeatureDataRecord, MessageManager, DataRecordsSelectionChangeMessage, type DataSource } from 'jimu-core'
import { Paper, WidgetPlaceholder } from 'jimu-ui'
import { type IMConfig, QueryArrangeType, SelectionType } from '../config'
import defaultMessages from './translations/default'
import { getWidgetRuntimeDataMap } from './widget-config'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'

import { versionManager } from '../version-manager'
import { QueryTaskList } from './query-task-list'
import { TaskListInline } from './query-task-list-inline'
import { TaskListPopperWrapper } from './query-task-list-popper-wrapper'
import { QueryWidgetContext } from './widget-context'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'
import { WIDGET_VERSION } from '../version'
// Chunk 1: URL Parameter Consumption Manager (r018.8)
import { UrlConsumptionManager } from './hooks/use-url-consumption'
// Chunk 2: Widget Visibility Engine Manager (r018.13) - Step 2.3: Switch to manager
import { WidgetVisibilityManager } from './hooks/use-widget-visibility'
// Chunk 6: Map View Management Manager (r018.14) - Step 6.1: Add manager without integration
import { MapViewManager } from './hooks/use-map-view'
// Chunk 4: Graphics Layer Management Manager (r018.24) - Step 4.2: Parallel execution
import { GraphicsLayerManager } from './hooks/use-graphics-layer'
// Chunk 5: Accumulated Records Management Manager (r018.26) - Step 5.1: Add manager without integration
import { AccumulatedRecordsManager } from './hooks/use-accumulated-records'
// Chunk 7: Event Handling Manager (r018.59) - Step 7.1: Create Event Manager
import { EventManager, OPEN_WIDGET_EVENT, QUERYSIMPLE_SELECTION_EVENT, RESTORE_ON_IDENTIFY_CLOSE_EVENT } from './hooks/use-event-handling'

const debugLogger = createQuerySimpleDebugLogger()
const { iconMap } = getWidgetRuntimeDataMap()

// Event constants moved to EventManager (r018.59 - Chunk 7.1)

/**
 * QuerySimple Widget
 * 
 * A high-performance query widget for ArcGIS Experience Builder that provides:
 * - Universal SQL optimization for database index usage
 * - Dual-mode deep linking (hash fragments and query strings)
 * - Results accumulation across multiple queries
 * - Selection persistence and restoration
 * - Graphics layer highlighting for map visualization
 * 
 * Architecture:
 * This widget follows a "Hook & Shell" pattern where complex logic is extracted into
 * manager classes (UrlConsumptionManager, WidgetVisibilityManager, MapViewManager)
 * to keep the main widget class clean and maintainable.
 * 
 * @since 1.19.0-r018.18
 * @see {@link UrlConsumptionManager} for URL parameter handling
 * @see {@link WidgetVisibilityManager} for panel visibility detection
 * @see {@link MapViewManager} for map view reference management
 */
export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, { 
  initialQueryValue?: { shortId: string, value: string }, 
  isPanelVisible?: boolean, 
  hasSelection?: boolean, 
  selectionRecordCount?: number, 
  lastSelection?: { recordIds: string[], outputDsId: string, queryItemConfigId: string }, 
  resultsMode?: SelectionType, 
  accumulatedRecords?: FeatureDataRecord[], 
  graphicsLayerInitialized?: boolean, 
  activeTab?: 'query' | 'results'
}> {
  static versionManager = versionManager
  // Chunk 1: URL Parameter Consumption Manager (r018.8)
  private urlConsumptionManager = new UrlConsumptionManager()
  // Chunk 2: Widget Visibility Engine Manager (r018.13) - Step 2.3: Switch to manager
  private visibilityManager = new WidgetVisibilityManager()
  
  // Refs must be declared before managers that use them
  private widgetRef = React.createRef<HTMLDivElement>()
  private graphicsLayerRef = React.createRef<__esri.GraphicsLayer | null>()
  private mapViewRef = React.createRef<__esri.MapView | __esri.SceneView | null>()
  
  // Chunk 6: Map View Management Manager (r018.16) - Step 6.3: Switch to manager
  private mapViewManager = new MapViewManager(this.mapViewRef)
  // Chunk 4: Graphics Layer Management Manager (r018.24) - Step 4.2: Parallel execution
  private graphicsLayerManager = new GraphicsLayerManager(this.graphicsLayerRef, this.mapViewRef)
  // Chunk 5: Accumulated Records Management Manager (r018.26) - Step 5.1: Add manager without integration
  private accumulatedRecordsManager = new AccumulatedRecordsManager()
  // Chunk 7: Event Handling Manager (r018.59) - Step 7.1: Create Event Manager
  private eventManager = new EventManager()
  
  // Track processed hash parameters to prevent re-execution when switching queries
  // Key: "shortId:value" (e.g., "pin:2223059013")
  private processedHashParamsRef = new Set<string>()

  state: {
    initialQueryValue?: { shortId: string, value: string },
    isPanelVisible?: boolean,
    hasSelection?: boolean,
    selectionRecordCount?: number,
    lastSelection?: { recordIds: string[], outputDsId: string, queryItemConfigId: string },
    resultsMode?: SelectionType,
    accumulatedRecords?: FeatureDataRecord[],
    graphicsLayerInitialized?: boolean,
    activeTab?: 'query' | 'results',
    // Track when HelperSimple explicitly opens widget - only then should query-task-list use initialQueryValue for selection
    // Using state instead of ref ensures React triggers re-renders when flag changes
    shouldUseInitialQueryValueForSelection?: boolean
  } = {
    resultsMode: SelectionType.NewSelection, // Default mode
    activeTab: 'query'
  }

  /**
   * Handles tab change between "Query" and "Results" tabs.
   * 
   * @param activeTab - The tab to switch to ('query' or 'results')
   * 
   * @since 1.19.0-r017.0
   */
  handleTabChange = (activeTab: 'query' | 'results') => {
    this.setState({ activeTab })
  }

  /**
   * Resets the manual modifications flag when user starts fresh operations.
   * This allows hash-triggered queries to work again after explicit user actions.
   */
  resetManualModifications = () => {
    // FIX (r018.96): Removed manuallyRemovedRecordIds tracking - no longer needed
    // Duplicate detection in mergeResultsIntoAccumulated handles preventing duplicates
    const hasManualModifications = this.state.hasManualModifications

    debugLogger.log('RESULTS-MODE', {
      event: 'reset-manual-modifications-check',
      widgetId: this.props.id,
      hasManualModifications,
      note: 'r018.96: No manuallyRemovedRecordIds tracking',
      timestamp: Date.now()
    })

    if (hasManualModifications) {
      debugLogger.log('RESULTS-MODE', {
        event: 'resetting-manual-modifications',
        widgetId: this.props.id,
        reason: 'user-started-fresh-operation',
        hadManualModificationsFlag: hasManualModifications,
        note: 'r018.96: No manuallyRemovedRecordIds to clear',
        timestamp: Date.now()
      })
    }
  }

  /**
   * Handles HelperSimple's open widget event.
   * QuerySimple should only process hash parameters when HelperSimple explicitly opens the widget.
   * This ensures HelperSimple remains the orchestrator and prevents autonomous hash processing.
   */
  handleOpenWidgetEvent = (event: CustomEvent) => {
    const { id } = this.props

    debugLogger.log('HASH-EXEC', {
      event: 'querysimple-handleopenwidgetevent-received',
      widgetId: id,
      eventWidgetId: event.detail?.widgetId,
      matches: event.detail?.widgetId === id,
      currentState: {
        shouldUseInitialQueryValueForSelection: this.state.shouldUseInitialQueryValueForSelection,
        hasInitialQueryValue: !!this.state.initialQueryValue,
        initialQueryValueShortId: this.state.initialQueryValue?.shortId,
        initialQueryValueValue: this.state.initialQueryValue?.value,
        processedHashParams: Array.from(this.processedHashParamsRef),
        currentUrlHash: window.location.hash.substring(1),
      },
      timestamp: Date.now()
    })

    // With surgical hash modification, the hash already contains only desired record IDs
    // No need to block processing - the hash is now a precise representation of selection intent

    // Only process if this event is for our widget
    if (event.detail?.widgetId !== id) {
      debugLogger.log('HASH-EXEC', {
        event: 'querysimple-handleopenwidgetevent-ignored-wrong-widget',
        widgetId: id,
        eventWidgetId: event.detail?.widgetId,
        timestamp: Date.now()
      })
      return
    }
    
    // NOTE: We don't check processed hashes here anymore
    // The check happens in onInitialValueFound after we know which shortId:value pair is being processed
    
    debugLogger.log('HASH', {
      event: 'open-widget-event-received-from-helpersimple',
      widgetId: id,
      timestamp: Date.now()
    })
    
    // Set flag to allow query-task-list to use initialQueryValue for selection
    // This ensures we only react to hash parameters when HelperSimple explicitly opens us
    // Using state instead of ref ensures React triggers re-render so query-task-list sees the change
    this.setState({ shouldUseInitialQueryValueForSelection: true }, () => {
      debugLogger.log('HASH-EXEC', {
        event: 'querysimple-flag-set-true-state-updated',
        widgetId: id,
        newState: {
          shouldUseInitialQueryValueForSelection: this.state.shouldUseInitialQueryValueForSelection,
          hasInitialQueryValue: !!this.state.initialQueryValue,
          initialQueryValueShortId: this.state.initialQueryValue?.shortId,
          initialQueryValueValue: this.state.initialQueryValue?.value
        },
        timestamp: Date.now()
      })
    })
    
    debugLogger.log('HASH', {
      event: 'shouldUseInitialQueryValueForSelection-flag-set-true',
      widgetId: id,
      flagValue: true,
      timestamp: Date.now()
    })
    
    // Now check URL parameters - HelperSimple has explicitly opened us
    debugLogger.log('HASH-EXEC', {
      event: 'querysimple-checkurlparameters-starting',
      widgetId: this.props.id,
      currentState: {
        shouldUseInitialQueryValueForSelection: this.state.shouldUseInitialQueryValueForSelection,
        hasInitialQueryValue: !!this.state.initialQueryValue,
        initialQueryValueShortId: this.state.initialQueryValue?.shortId,
        initialQueryValueValue: this.state.initialQueryValue?.value
      },
      timestamp: Date.now()
    })
    
    this.urlConsumptionManager.checkUrlParameters(
      this.props,
      this.state.resultsMode,
      {
        onInitialValueFound: (value) => {
          debugLogger.log('HASH-EXEC', {
            event: 'querysimple-oninitialvaluefound-called',
            widgetId: this.props.id,
            hasValue: !!value,
            valueShortId: value?.shortId,
            valueValue: value?.value,
            currentState: {
              shouldUseInitialQueryValueForSelection: this.state.shouldUseInitialQueryValueForSelection,
              hasInitialQueryValue: !!this.state.initialQueryValue,
              initialQueryValueShortId: this.state.initialQueryValue?.shortId,
              initialQueryValueValue: this.state.initialQueryValue?.value
            },
            timestamp: Date.now()
          })
          
          if (value) {
            // Check if this specific shortId:value combination was already processed
            const paramKey = `${value.shortId}:${value.value}`
            if (this.processedHashParamsRef.has(paramKey)) {
              debugLogger.log('HASH-EXEC', {
                event: 'querysimple-oninitialvaluefound-already-processed',
                widgetId: this.props.id,
                shortId: value.shortId,
                value: value.value,
                paramKey,
                processedParams: Array.from(this.processedHashParamsRef),
                timestamp: Date.now()
              })
              return
            }
            
            // Only update if the value or shortId has changed to avoid unnecessary re-renders
            const willUpdate = this.state.initialQueryValue?.shortId !== value.shortId || this.state.initialQueryValue?.value !== value.value
            
            debugLogger.log('HASH-EXEC', {
              event: 'querysimple-oninitialvaluefound-will-update',
              widgetId: this.props.id,
              willUpdate,
              previousShortId: this.state.initialQueryValue?.shortId,
              previousValue: this.state.initialQueryValue?.value,
              newShortId: value.shortId,
              newValue: value.value,
              timestamp: Date.now()
            })
            
            if (willUpdate) {
              debugLogger.log('HASH', {
                event: 'url-param-detected',
                widgetId: this.props.id,
                shortId: value.shortId,
                value: value.value,
                foundIn: 'manager',
                triggeredBy: 'helpersimple-open-widget-event',
                previousShortId: this.state.initialQueryValue?.shortId,
                previousValue: this.state.initialQueryValue?.value,
                timestamp: Date.now()
              })
              
              // Reset to New mode when hash parameter is detected to avoid bugs with accumulation modes
              // Using AccumulatedRecordsManager (r018.58)
              const needsModeReset = this.state.resultsMode !== SelectionType.NewSelection
              const currentMode = this.state.resultsMode
              
              // Update initialQueryValue state
              this.setState({ 
                initialQueryValue: { shortId: value.shortId, value: value.value }
              }, () => {
                debugLogger.log('HASH-EXEC', {
                  event: 'querysimple-initialqueryvalue-state-updated',
                  widgetId: this.props.id,
                  newState: {
                    shouldUseInitialQueryValueForSelection: this.state.shouldUseInitialQueryValueForSelection,
                    hasInitialQueryValue: !!this.state.initialQueryValue,
                    initialQueryValueShortId: this.state.initialQueryValue?.shortId,
                    initialQueryValueValue: this.state.initialQueryValue?.value,
                    resultsMode: this.state.resultsMode
                  },
                  timestamp: Date.now()
                })
              })

              // Reset mode via manager if needed
              if (needsModeReset) {
                const resetResult = this.accumulatedRecordsManager.resetModeOnHashDetection(
                  this.props.id,
                  currentMode
                )
                
                // Update widget state from manager's return value
                this.setState({
                  resultsMode: resetResult.resultsMode,
                  accumulatedRecords: resetResult.accumulatedRecords
                })
              }
            }
          } else {
            debugLogger.log('HASH-EXEC', {
              event: 'querysimple-oninitialvaluefound-no-value-clearing',
              widgetId: this.props.id,
              hasCurrentInitialQueryValue: !!this.state.initialQueryValue,
              timestamp: Date.now()
            })
            // No matching parameters found - clear state
            if (this.state.initialQueryValue) {
              this.setState({ initialQueryValue: undefined })
            }
          }
        },
        onModeResetNeeded: () => {
          // Reset to New mode when hash parameter is detected
          // Using AccumulatedRecordsManager (r018.58)
          const currentMode = this.state.resultsMode
          const needsReset = currentMode !== SelectionType.NewSelection
          
          if (needsReset) {
            debugLogger.log('HASH', {
              event: 'mode-reset-needed-on-hash-detection',
              widgetId: this.props.id,
              currentMode,
              triggeredBy: 'helpersimple-open-widget-event',
              timestamp: Date.now()
            })
            
            const resetResult = this.accumulatedRecordsManager.resetModeOnHashDetection(
              this.props.id,
              currentMode
            )
            
            // Update widget state from manager's return value
            this.setState({
              resultsMode: resetResult.resultsMode,
              accumulatedRecords: resetResult.accumulatedRecords
            })
          }
        }
      }
    )
  }

  componentDidMount() {
    // Chunk 1: Manager implementation (r018.8 - switched to manager)
    // Setup manager (no autonomous URL checking - HelperSimple orchestrates)
    // NOTE: setup() is a no-op - callbacks are never called
    this.urlConsumptionManager.setup(
      this.props,
      this.state.resultsMode,
      {} // Empty callbacks - setup() is a no-op
    )
    
    // Listen for HelperSimple's open widget event
    // QuerySimple should only process hash parameters when HelperSimple explicitly opens the widget
    // This ensures HelperSimple remains the orchestrator
    // Note: Event listener setup moved to parallel execution section below (Chunk 7.1)
    
    debugLogger.log('HASH-EXEC', {
      event: 'querysimple-mounted-event-listener-setup',
      widgetId: this.props.id,
      currentState: {
        shouldUseInitialQueryValueForSelection: this.state.shouldUseInitialQueryValueForSelection,
        hasInitialQueryValue: !!this.state.initialQueryValue,
        initialQueryValueShortId: this.state.initialQueryValue?.shortId,
        initialQueryValueValue: this.state.initialQueryValue?.value
      },
      timestamp: Date.now()
    })
    
    // Chunk 2: Manager implementation (r018.13 - Step 2.3: Switch to manager)
    if (this.widgetRef.current) {
      this.visibilityManager.setup(
        this.widgetRef.current,
        this.props,
        {
          onVisibilityChange: (isVisible) => {
            // Update state
            this.setState({ isPanelVisible: isVisible })
            
            // Handle restoration logic
            this.handleVisibilityChange(isVisible)
          }
        },
        (isVisible) => {
          // Manager's internal state tracking callback
          // (no-op, restoration handled in onVisibilityChange)
        }
      )
      
      // Notify mount via manager
      this.visibilityManager.notifyMount(this.props.id)
    }

    // Chunk 5: Initialize accumulated records manager state (r018.26 - Step 5.1: Add manager)
    // Sync manager state with widget state
    if (this.state.resultsMode) {
      this.accumulatedRecordsManager.handleResultsModeChange(
        this.props.id,
        this.state.resultsMode,
        false
      )
    }
    if (this.state.accumulatedRecords && this.state.accumulatedRecords.length > 0) {
      this.accumulatedRecordsManager.handleAccumulatedRecordsChange(
        this.props.id,
        this.state.accumulatedRecords
      )
    }
    
    // Set up callbacks for manager
    // Set up callbacks for manager (r018.57)
    // Note: Primary state updates come from manager return values in handleResultsModeChange/handleAccumulatedRecordsChange
    // These callbacks serve as backup/verification but shouldn't be needed since we update state directly from return values
    this.accumulatedRecordsManager.setCallbacks({
      onModeChange: (mode) => {
        // State is updated from handleResultsModeChange return value, so this is just a backup
        if (this.state.resultsMode !== mode) {
          debugLogger.log('RESULTS-MODE', {
            event: 'callback-onModeChange-state-sync',
            widgetId: this.props.id,
            callbackMode: mode,
            currentStateMode: this.state.resultsMode,
            note: 'State should already be synced from return value',
            timestamp: Date.now()
          })
          this.setState({ resultsMode: mode })
        }
      },
      onAccumulatedRecordsChange: (records) => {
        // State is updated from handleAccumulatedRecordsChange, so this is just a backup
        const currentCount = this.state.accumulatedRecords?.length || 0
        if (currentCount !== records.length) {
          debugLogger.log('RESULTS-MODE', {
            event: 'callback-onAccumulatedRecordsChange-state-sync',
            widgetId: this.props.id,
            callbackCount: records.length,
            currentStateCount: currentCount,
            note: 'State should already be synced from direct update',
            timestamp: Date.now()
          })
          this.setState({ accumulatedRecords: records })
        }
      }
    })
    
    // ============================================================================
    // OLD IMPLEMENTATION (parallel execution) - Chunk 7.1
    // ============================================================================
    // Listen for HelperSimple orchestration events
    window.addEventListener(OPEN_WIDGET_EVENT, this.handleOpenWidgetEvent)
    
    // Listen for selection changes from query-result
    window.addEventListener(QUERYSIMPLE_SELECTION_EVENT, this.handleSelectionChange as EventListener)
    
    // Listen for restore requests when identify popup closes
    window.addEventListener(RESTORE_ON_IDENTIFY_CLOSE_EVENT, this.handleRestoreOnIdentifyClose as EventListener)
    
    debugLogger.log('EVENTS', {
      event: 'old-implementation-event-listeners-setup',
      widgetId: this.props.id,
      listenersRegistered: 3,
      timestamp: Date.now()
    })
    // ============================================================================

    // NEW IMPLEMENTATION (parallel execution) - Chunk 7.1
    this.eventManager.setHandlers({
      onOpenWidgetEvent: this.handleOpenWidgetEvent,
      onSelectionChange: this.handleSelectionChange,
      onRestoreOnIdentifyClose: this.handleRestoreOnIdentifyClose
    })
    
    this.eventManager.setup(this.props.id)

    // COMPARISON LOGGING
    debugLogger.log('CHUNK-7-COMPARE', {
      event: 'event-listeners-setup-comparison',
      widgetId: this.props.id,
      oldImplementation: {
        listenersRegistered: 3,
        setupMethod: 'window.addEventListener'
      },
      newImplementation: {
        listenersRegistered: 3,
        setupMethod: 'EventManager.setup',
        isSetup: this.eventManager.isSetup()
      },
      match: this.eventManager.isSetup() === true,
      timestamp: Date.now()
    })
    
    // Graphics layer will be initialized when map view becomes available via JimuMapViewComponent
  }

  componentWillUnmount() {
    // Chunk 1: Clean up manager (r018.8)
    this.urlConsumptionManager.cleanup()
    
    // ============================================================================
    // OLD IMPLEMENTATION (parallel execution) - Chunk 7.1
    // ============================================================================
    // Clean up HelperSimple open widget event listener
    window.removeEventListener(OPEN_WIDGET_EVENT, this.handleOpenWidgetEvent)
    
    // Clean up selection change listener
    window.removeEventListener(QUERYSIMPLE_SELECTION_EVENT, this.handleSelectionChange as EventListener)
    
    // Clean up restore on identify close listener
    window.removeEventListener(RESTORE_ON_IDENTIFY_CLOSE_EVENT, this.handleRestoreOnIdentifyClose as EventListener)
    
    debugLogger.log('EVENTS', {
      event: 'old-implementation-event-listeners-cleaned',
      widgetId: this.props.id,
      listenersRemoved: 3,
      timestamp: Date.now()
    })
    // ============================================================================

    // NEW IMPLEMENTATION (parallel execution) - Chunk 7.1
    const wasSetup = this.eventManager.isSetup()
    this.eventManager.cleanup(this.props.id)

    // COMPARISON LOGGING
    debugLogger.log('CHUNK-7-COMPARE', {
      event: 'event-listeners-cleanup-comparison',
      widgetId: this.props.id,
      oldImplementation: {
        listenersRemoved: 3,
        cleanupMethod: 'window.removeEventListener'
      },
      newImplementation: {
        wasSetup,
        cleanupMethod: 'EventManager.cleanup',
        isSetup: this.eventManager.isSetup()
      },
      match: this.eventManager.isSetup() === false,
      timestamp: Date.now()
    })
    
    // Chunk 2: Clean up manager (r018.13 - Step 2.3: Switch to manager)
    this.visibilityManager.cleanup()
    this.visibilityManager.notifyUnmount(this.props.id)
    
    // Chunk 4: Graphics layer cleanup (r018.25 - Step 4.3: Remove old implementation)
    this.graphicsLayerManager.cleanup(this.props.id)
    
    // Chunk 5: Clean up accumulated records manager (r018.26 - Step 5.1: Add manager)
    this.accumulatedRecordsManager.cleanup()
    
    debugLogger.log('WIDGET-STATE', {
      event: 'widget-closed',
      widgetId: this.props.id,
      isOpen: false,
      timestamp: new Date().toISOString()
    })
  }

  componentDidUpdate(prevProps: AllWidgetProps<IMConfig>) {
    // QuerySimple no longer autonomously checks URL parameters
    // Only HelperSimple can trigger hash parameter processing via OPEN_WIDGET_EVENT
    // This ensures HelperSimple remains the orchestrator
    
    // Chunk 4: Graphics layer is now required (r018.25 - Step 4.3: Remove config change handling)
    // No need to handle config changes for graphics layer since it's always enabled
  }

  /**
   * Notifies HelperSimple widget of selection changes via custom event.
   * 
   * This method dispatches a custom event that HelperSimple listens to for tracking
   * selection state. Called by QueryTaskResult component when user selects records.
   * 
   * @param recordIds - Array of selected record IDs (objectIds from the feature layer)
   * @param dataSourceId - Optional data source ID for the selected records
   * 
   * @since 1.19.0-r017.0
   */
  notifyHelperSimpleOfSelection = (recordIds: string[], dataSourceId?: string) => {
    const { id } = this.props
    
    // ============================================================================
    // OLD IMPLEMENTATION (parallel execution) - Chunk 7.1
    // ============================================================================
    const oldEvent = new CustomEvent(QUERYSIMPLE_SELECTION_EVENT, {
      detail: {
        widgetId: id,
        recordIds,
        dataSourceId
      },
      bubbles: true,
      cancelable: true
    })
    window.dispatchEvent(oldEvent)
    
    debugLogger.log('EVENTS', {
      event: 'old-implementation-selection-event-dispatched',
      widgetId: id,
      recordIdsCount: recordIds.length,
      dataSourceId,
      timestamp: Date.now()
    })
    // ============================================================================

    // NEW IMPLEMENTATION (parallel execution) - Chunk 7.1
    // Note: This call is missing outputDsId and queryItemConfigId, but this method
    // is only used for notifying HelperSimple, not for setting lastSelection state.
    // The actual selection events come from query-task.tsx and query-result.tsx
    // which use dispatchSelectionEvent from selection-utils.ts
    this.eventManager.dispatchSelectionEvent(id, recordIds, dataSourceId)

    // COMPARISON LOGGING
    debugLogger.log('CHUNK-7-COMPARE', {
      event: 'selection-event-dispatch-comparison',
      widgetId: id,
      oldImplementation: {
        method: 'window.dispatchEvent',
        recordIdsCount: recordIds.length,
        dataSourceId
      },
      newImplementation: {
        method: 'EventManager.dispatchSelectionEvent',
        recordIdsCount: recordIds.length,
        dataSourceId
      },
      match: true, // Both dispatch the same event
      timestamp: Date.now()
    })
  }

  /**
   * Handles widget panel visibility changes from WidgetVisibilityManager.
   * 
   * This method implements the selection restoration pattern:
   * - When panel opens: Restores selection to map if widget has accumulated records or last selection
   * - When panel closes: Clears selection from map (but preserves widget state for restoration)
   * 
   * The restoration logic respects the current results mode:
   * - "Add to" / "Remove from" modes: Uses accumulated records for restoration
   * - "New" mode: Uses lastSelection state for restoration
   * 
   * @param isVisible - True if widget panel is visible, false if hidden
   * 
   * @since 1.19.0-r018.13 (Chunk 2: Manager implementation)
   * @see {@link WidgetVisibilityManager} for visibility detection implementation
   */
  handleVisibilityChange = (isVisible: boolean) => {
    if (isVisible) {
      // When panel opens, check if we have selection to restore
      const isAccumulationMode = this.state.resultsMode === SelectionType.AddToSelection || 
                                 this.state.resultsMode === SelectionType.RemoveFromSelection
      const hasAccumulatedRecords = this.state.accumulatedRecords && this.state.accumulatedRecords.length > 0
      const hasSelectionState = this.state.hasSelection || false
      const hasSelectionToRestore = isAccumulationMode 
        ? hasAccumulatedRecords 
        : hasSelectionState
      
      debugLogger.log('RESTORE', {
        event: 'panel-opened-checking-selection',
        widgetId: this.props.id,
        resultsMode: this.state.resultsMode,
        isAccumulationMode,
        hasSelection: hasSelectionState,
        hasAccumulatedRecords,
        accumulatedRecordsCount: this.state.accumulatedRecords?.length || 0,
        selectionRecordCount: this.state.selectionRecordCount || 0,
        hasLastSelection: !!this.state.lastSelection,
        lastSelectionRecordCount: this.state.lastSelection?.recordIds.length || 0,
        hasSelectionToRestore,
        decisionLogic: {
          'isAccumulationMode': isAccumulationMode,
          'hasAccumulatedRecords': hasAccumulatedRecords,
          'hasSelectionState': hasSelectionState,
          'calculated-hasSelectionToRestore': hasSelectionToRestore,
          'will-call-addSelectionToMap': hasSelectionToRestore
        }
      })
      
      // Add selection to map if we have one
      if (hasSelectionToRestore) {
        debugLogger.log('RESTORE', {
          event: 'panel-opened-calling-addSelectionToMap',
          widgetId: this.props.id,
          reason: 'hasSelectionToRestore-is-true'
        })
        this.addSelectionToMap()
      } else {
        debugLogger.log('RESTORE', {
          event: 'panel-opened-skipping-addSelectionToMap',
          widgetId: this.props.id,
          reason: 'hasSelectionToRestore-is-false',
          why: isAccumulationMode 
            ? 'no-accumulated-records' 
            : 'no-hasSelection-state'
        })
      }
    } else {
      // When panel closes, clear selection from map only (keep widget state)
      const isAccumulationMode = this.state.resultsMode === SelectionType.AddToSelection || 
                                 this.state.resultsMode === SelectionType.RemoveFromSelection
      const hasAccumulatedRecords = this.state.accumulatedRecords && this.state.accumulatedRecords.length > 0
      const hasSelectionState = this.state.hasSelection || false
      const hasSelectionToClear = isAccumulationMode 
        ? hasAccumulatedRecords 
        : hasSelectionState
      
      debugLogger.log('RESTORE', {
        event: 'panel-closed-checking-selection',
        widgetId: this.props.id,
        resultsMode: this.state.resultsMode,
        isAccumulationMode,
        hasSelection: hasSelectionState,
        hasAccumulatedRecords,
        accumulatedRecordsCount: this.state.accumulatedRecords?.length || 0,
        selectionRecordCount: this.state.selectionRecordCount || 0,
        hasLastSelection: !!this.state.lastSelection,
        lastSelectionRecordCount: this.state.lastSelection?.recordIds.length || 0,
        hasSelectionToClear,
        decisionLogic: {
          'isAccumulationMode': isAccumulationMode,
          'hasAccumulatedRecords': hasAccumulatedRecords,
          'hasSelectionState': hasSelectionState,
          'calculated-hasSelectionToClear': hasSelectionToClear,
          'will-call-clearSelectionFromMap': hasSelectionToClear
        }
      })
      
      if (hasSelectionToClear) {
        debugLogger.log('RESTORE', {
          event: 'panel-closed-calling-clearSelectionFromMap',
          widgetId: this.props.id,
          reason: 'hasSelectionToClear-is-true'
        })
        this.clearSelectionFromMap()
      } else {
        debugLogger.log('RESTORE', {
          event: 'panel-closed-no-selection-to-clear',
          widgetId: this.props.id,
          reason: 'hasSelectionToClear-is-false',
          why: isAccumulationMode 
            ? 'no-accumulated-records' 
            : 'no-hasSelection-state'
        })
      }
    }
  }

  /**
   * Handles map view change from JimuMapViewComponent.
   * 
   * This method is called by JimuMapViewComponent when the map view becomes available
   * or changes. It delegates to MapViewManager for reference management and initializes
   * the graphics layer if enabled in widget configuration.
   * 
   * @param jimuMapView - The JimuMapView instance from JimuMapViewComponent, or null if unavailable
   * 
   * @since 1.19.0-r018.18 (Chunk 6: Manager implementation)
   * @see {@link MapViewManager} for map view reference management
   */
  private handleJimuMapViewChanged = (jimuMapView: JimuMapView | null) => {
    const { id, config } = this.props
    
    // Manager implementation (r018.16 - Step 6.3: Switch to manager)
    this.mapViewManager.handleJimuMapViewChanged(
      jimuMapView,
      this.props,
      {
        onMapViewChange: (newJimuMapView) => {
          // Get map view from manager
          const newMapView = this.mapViewManager.getMapView()
          
          // Chunk 4: Graphics layer initialization (r018.25 - Step 4.3: Remove old implementation)
          // Initialize graphics layer if map view is available and graphics layer should be initialized
          if (this.graphicsLayerManager.shouldInitialize(config, newMapView) && newMapView) {
            // Use void to handle promise without blocking
            void this.graphicsLayerManager.initialize(id, newMapView, {
              onGraphicsLayerInitialized: (graphicsLayer) => {
                // Update state to force re-render and update props
                this.setState({ graphicsLayerInitialized: true })
              }
            })
          }
        }
      }
    )
  }

  /**
   * Initializes graphics layer lazily when output data source becomes available.
   * 
   * This method is called by QueryTask component when an output data source is created.
   * It retrieves the map view from MapViewManager and initializes the graphics layer
   * using GraphicsLayerManager if not already initialized.
   * 
   * @param outputDS - The output data source that was created
   * 
   * @since 1.19.0-r017.0
   * @see {@link GraphicsLayerManager.initializeFromOutputDS} for graphics layer initialization
   * @see {@link MapViewManager.getMapView} for map view retrieval
   */

  /**
   * Initializes graphics layer lazily when output data source becomes available.
   * 
   * This method is called by QueryTask component when an output data source is created.
   * It retrieves the map view from MapViewManager and initializes the graphics layer
   * using GraphicsLayerManager if not already initialized.
   * 
   * @param outputDS - The output data source that was created
   * 
   * @since 1.19.0-r017.0
   * @see {@link GraphicsLayerManager.initializeFromOutputDS} for graphics layer initialization
   * @see {@link MapViewManager.getMapView} for map view retrieval
   */
  public initializeGraphicsLayerFromOutputDS = async (outputDS: DataSource) => {
    const { id, config } = this.props
    
    // Chunk 4: Graphics layer initialization (r018.25 - Step 4.3: Remove old implementation)
    // Use map view from manager if available
    const mapView = this.mapViewManager.getMapView() || this.mapViewRef.current
    
    await this.graphicsLayerManager.initializeFromOutputDS(
      id,
      config,
      outputDS,
      mapView,
      {
        onGraphicsLayerInitialized: (graphicsLayer) => {
          this.setState({ graphicsLayerInitialized: true })
        }
      }
    )
  }


  /**
   * Clears all graphics from the graphics layer if it exists.
   * 
   * This method is called when clearing results or switching queries in "New" mode
   * to ensure graphics are removed from the map. It does not remove the graphics layer
   * itself, only clears its contents.
   * 
   * @since 1.19.0-r017.0
   * @see {@link GraphicsLayerManager.clearGraphics} for graphics clearing logic
   */
  public clearGraphicsLayerIfExists = () => {
    const { config } = this.props
    
    // Chunk 4: Graphics layer clearing (r018.25 - Step 4.3: Remove old implementation)
    this.graphicsLayerManager.clearGraphics(this.props.id, config)
  }


  /**
   * Handles selection change events from QueryTaskResult component.
   * 
   * This method updates widget state when records are selected or deselected in the
   * results tab. It respects the current results mode:
   * - "Add to" / "Remove from" modes: Uses accumulated records count for restoration state
   * - "New" mode: Uses event record IDs for restoration state
   * 
   * Also handles automatic mode reset: If selection is cleared in "Remove from" mode,
   * the mode is automatically reset to "New" since Remove mode requires selection to function.
   * 
   * @param event - Custom event containing selection details (widgetId, recordIds, outputDsId, queryItemConfigId)
   * 
   * @since 1.19.0-r017.0
   */
  handleSelectionChange = (event: Event) => {
    const customEvent = event as CustomEvent<{ widgetId: string, recordIds: string[], dataSourceId?: string, outputDsId?: string, queryItemConfigId?: string }>
    const { id } = this.props
    
    // Only track if this is for our widget
    if (customEvent.detail.widgetId !== id) {
      return
    }
    
    const hasSelection = customEvent.detail.recordIds && customEvent.detail.recordIds.length > 0
    
    // If the panel is NOT visible, and we are receiving an EMPTY selection,
    // it's almost certainly our own 'clearSelectionFromMap' logic firing.
    // We should IGNORE this so we don't wipe out the lastSelection state.
    if (!this.state.isPanelVisible && !hasSelection) {
      debugLogger.log('RESTORE', {
        event: 'handleSelectionChange-ignoring-empty-selection-while-panel-closed',
        widgetId: id,
        timestamp: Date.now()
      })
      return
    }
    
    // In "Add to" or "Remove from" mode, use accumulated records count for restoration
    // The accumulated records are the source of truth for what should be restored
    const isAccumulationMode = this.state.resultsMode === SelectionType.AddToSelection || 
                               this.state.resultsMode === SelectionType.RemoveFromSelection
    const accumulatedRecordsCount = this.state.accumulatedRecords?.length || 0
    const selectionCount = isAccumulationMode && accumulatedRecordsCount > 0
      ? accumulatedRecordsCount
      : (hasSelection ? customEvent.detail.recordIds.length : 0)
    
    // If selection is cleared and we're in Remove mode, reset to NewSelection mode
    // Remove mode requires selection to function, so it should be disabled when selection is empty
    const shouldResetMode = !hasSelection && 
                            selectionCount === 0 && 
                            this.state.resultsMode === SelectionType.RemoveFromSelection
    
    debugLogger.log('RESTORE', {
      event: 'handleSelectionChange-updating-state',
      widgetId: id,
      resultsMode: this.state.resultsMode,
      isAccumulationMode,
      eventRecordIdsCount: customEvent.detail.recordIds.length,
      hasSelectionFromEvent: hasSelection,
      accumulatedRecordsCountBefore: accumulatedRecordsCount,
      calculatedSelectionCount: selectionCount,
      'will-set-hasSelection': selectionCount > 0,
      'will-set-lastSelection': hasSelection && !!customEvent.detail.outputDsId && !!customEvent.detail.queryItemConfigId,
      'will-reset-mode': shouldResetMode,
      decisionLogic: {
        'isAccumulationMode': isAccumulationMode,
        'accumulatedRecordsCount > 0': accumulatedRecordsCount > 0,
        'use-accumulated-count': isAccumulationMode && accumulatedRecordsCount > 0,
        'use-event-count': !(isAccumulationMode && accumulatedRecordsCount > 0),
        'should-reset-mode': shouldResetMode
      }
    })
    
    this.setState({
      hasSelection: selectionCount > 0,
      selectionRecordCount: selectionCount,
      // Store lastSelection for compatibility, but restoration will use accumulatedRecords in Add/Remove modes
      lastSelection: hasSelection && customEvent.detail.outputDsId && customEvent.detail.queryItemConfigId
        ? {
            recordIds: customEvent.detail.recordIds,
            outputDsId: customEvent.detail.outputDsId,
            queryItemConfigId: customEvent.detail.queryItemConfigId
          }
        : undefined,
      // Reset mode to NewSelection if selection is cleared in Remove mode
      ...(shouldResetMode ? {
        resultsMode: SelectionType.NewSelection,
        accumulatedRecords: [] // Also clear accumulated records when resetting mode
      } : {})
    })
    
    debugLogger.log('RESTORE', {
      event: 'handleSelectionChange-state-updated',
      widgetId: id,
      'new-hasSelection': selectionCount > 0,
      'new-selectionRecordCount': selectionCount,
      'new-lastSelection-recordIds-count': hasSelection && customEvent.detail.outputDsId && customEvent.detail.queryItemConfigId
        ? customEvent.detail.recordIds.length
        : 0,
      'mode-reset': shouldResetMode,
      'new-mode': shouldResetMode ? SelectionType.NewSelection : this.state.resultsMode,
      'note': shouldResetMode 
        ? 'Mode reset to NewSelection because selection was cleared in Remove mode'
        : 'lastSelection-only-contains-current-query-records-not-all-accumulated-records'
    })
  }

  /**
   * Handles restore request when identify popup closes.
   * 
   * This method restores selection to the map after the identify popup closes and
   * selection was cleared. It only restores if the widget panel is currently open
   * (users can't see restored selection if widget is closed).
   * 
   * Restoration logic:
   * - "Add to" / "Remove from" modes: Restores all accumulated records grouped by origin data source
   * - "New" mode: Restores lastSelection state
   * 
   * @param event - Custom event containing selection details (widgetId, recordIds, outputDsId, queryItemConfigId)
   * 
   * @since 1.19.0-r017.0
   * @see {@link RESTORE_ON_IDENTIFY_CLOSE_EVENT} for event name constant
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
    
    // Use manager as source of truth for visibility (r018.13)
    const isWidgetOpen = this.visibilityManager.getIsPanelVisible()
    const isAccumulationMode = this.state.resultsMode === SelectionType.AddToSelection || 
                               this.state.resultsMode === SelectionType.RemoveFromSelection
    
    debugLogger.log('RESTORE', {
      event: 'identify-popup-closed-restore-requested',
      widgetId: id,
      isWidgetOpen,
      resultsMode: this.state.resultsMode,
      isAccumulationMode,
      eventRecordIdsCount: customEvent.detail.recordIds.length,
      hasSelection: this.state.hasSelection || false,
      accumulatedRecordsCount: this.state.accumulatedRecords?.length || 0,
      hasLastSelection: !!this.state.lastSelection,
      lastSelectionRecordCount: this.state.lastSelection?.recordIds.length || 0,
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
    
    // HYPOTHESIS: Should always check accumulatedRecords first, regardless of mode
    if (this.state.accumulatedRecords && this.state.accumulatedRecords.length > 0) {
      debugLogger.log('RESTORE', {
        event: 'identify-popup-closed-found-accumulated-records',
        widgetId: id,
        resultsMode: this.state.resultsMode,
        isAccumulationMode,
        accumulatedRecordsCount: this.state.accumulatedRecords.length,
        'should-use-accumulated': true,
        'current-condition-check': isAccumulationMode,
        'condition-result': isAccumulationMode
      })
    }
    
    // In Add/Remove modes, check accumulated records instead of lastSelection
    if (isAccumulationMode) {
      if (!this.state.hasSelection || !this.state.accumulatedRecords || this.state.accumulatedRecords.length === 0) {
        debugLogger.log('RESTORE', {
          event: 'identify-popup-closed-restore-skipped-no-accumulated-records',
          widgetId: id,
          hasSelection: this.state.hasSelection,
          accumulatedRecordsCount: this.state.accumulatedRecords?.length || 0,
          'hypothesis': 'hasSelection-is-false-or-no-accumulated-records',
          'maybe-hasSelection-should-be-based-on-accumulated-records': true
        })
        return
      }
      
      // Restore all accumulated records (grouped by origin DS)
      debugLogger.log('RESTORE', {
        event: 'identify-popup-closed-restoring-accumulated-records',
        widgetId: id,
        accumulatedRecordsCount: this.state.accumulatedRecords.length
      })
      
      this.addSelectionToMap()
      return
    }
    
    // HYPOTHESIS: Maybe accumulatedRecords exist but we're not in accumulation mode?
    if (this.state.accumulatedRecords && this.state.accumulatedRecords.length > 0 && !isAccumulationMode) {
      debugLogger.log('RESTORE', {
        event: 'identify-popup-closed-accumulated-records-exist-but-not-accumulation-mode',
        widgetId: id,
        resultsMode: this.state.resultsMode,
        isAccumulationMode,
        accumulatedRecordsCount: this.state.accumulatedRecords.length,
        'hypothesis': 'accumulated-records-exist-but-mode-is-not-add-or-remove',
        'should-we-still-use-them': 'NEEDS-INVESTIGATION'
      })
    }
    
    // For "New" mode, use original validation logic
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
   * Restores selection to the map when widget panel opens.
   * 
   * This method is called by handleVisibilityChange when the panel becomes visible.
   * It restores previously selected records to the map based on the current results mode:
   * 
   * - "Add to" / "Remove from" modes: Restores all accumulated records, grouped by origin data source
   * - "New" mode: Restores lastSelection state from the most recent query
   * 
   * The restoration uses selectRecordsAndPublish utility which handles:
   * - Selecting records in origin data sources
   * - Adding graphics to graphics layer (if enabled)
   * - Publishing selection messages to other widgets
   * - Deduplication of records
   * 
   * Note: This method does NOT zoom to the selection (unlike the "Add to Map" action).
   * 
   * @since 1.19.0-r017.0
   * @see {@link selectRecordsAndPublish} utility function for selection logic
   */
  private addSelectionToMap = () => {
    const { lastSelection, accumulatedRecords, resultsMode } = this.state
    const { id } = this.props
    
    debugLogger.log('RESTORE', {
      event: 'addSelectionToMap-called',
      widgetId: id,
      resultsMode,
      hasAccumulatedRecords: !!(accumulatedRecords && accumulatedRecords.length > 0),
      accumulatedRecordsCount: accumulatedRecords?.length || 0,
      hasLastSelection: !!lastSelection,
      lastSelectionRecordCount: lastSelection?.recordIds.length || 0,
      lastSelectionOutputDsId: lastSelection?.outputDsId
    })
    
    // In Add/Remove modes, use accumulated records for restoration
    const isAccumulationMode = resultsMode === SelectionType.AddToSelection || 
                              resultsMode === SelectionType.RemoveFromSelection
    
    // HYPOTHESIS: Should always check accumulatedRecords first, regardless of mode
    // Adding log to see if accumulatedRecords exist but we're not using them
    if (accumulatedRecords && accumulatedRecords.length > 0) {
      debugLogger.log('RESTORE', {
        event: 'addSelectionToMap-found-accumulated-records',
        widgetId: id,
        resultsMode,
        isAccumulationMode,
        accumulatedRecordsCount: accumulatedRecords.length,
        'should-use-accumulated': true,
        'current-condition-check': isAccumulationMode && accumulatedRecords && accumulatedRecords.length > 0,
        'condition-result': isAccumulationMode && accumulatedRecords && accumulatedRecords.length > 0
      })
    } else {
      debugLogger.log('RESTORE', {
        event: 'addSelectionToMap-no-accumulated-records',
        widgetId: id,
        resultsMode,
        isAccumulationMode,
        accumulatedRecordsCount: 0,
        'will-fallback-to-lastSelection': !!lastSelection
      })
    }
    
    if (isAccumulationMode && accumulatedRecords && accumulatedRecords.length > 0) {
      // Group accumulated records by origin data source
      const recordsByOriginDS = new Map<FeatureLayerDataSource, FeatureDataRecord[]>()
      const dsManager = DataSourceManager.getInstance()
      
      accumulatedRecords.forEach((record, index) => {
        const recordId = record.getId()
        let originDS: FeatureLayerDataSource | null = null
        
        // Method 1: Try to get from record.getDataSource()
        const recordDS = record.getDataSource?.() as FeatureLayerDataSource
        if (recordDS) {
          originDS = recordDS.getOriginDataSources()?.[0] as FeatureLayerDataSource || recordDS
          
          debugLogger.log('RESTORE', {
            event: 'found-origin-ds-from-record-ds',
            widgetId: id,
            recordIndex: index,
            recordId,
            originDSId: originDS?.id || 'null',
            method: 'record.getDataSource()'
          })
        }
        
        // Method 2: If that failed, search all data sources for a record with matching ID
        if (!originDS) {
          const dsMap = dsManager.getDataSources()
          const allDataSources = Object.values(dsMap)
          
          for (const ds of allDataSources) {
            // Check if this is a FeatureLayerDataSource by checking for getAllLoadedRecords method
            if (ds && typeof (ds as any).getAllLoadedRecords === 'function') {
              try {
                // Check if this DS has the record
                const allRecords = (ds as any).getAllLoadedRecords() || []
                const matchingRecord = allRecords.find((r: FeatureDataRecord) => r.getId() === recordId)
                
                if (matchingRecord) {
                  // Found the record - get origin DS from this DS
                  originDS = (ds as any).getOriginDataSources()?.[0] as FeatureLayerDataSource || ds as FeatureLayerDataSource
                  
                  debugLogger.log('RESTORE', {
                    event: 'found-origin-ds-via-search',
                    widgetId: id,
                    recordIndex: index,
                    recordId,
                    originDSId: originDS.id,
                    method: 'searched-all-data-sources',
                    searchedDSId: ds.id
                  })
                  break
                }
              } catch (error) {
                // Continue searching
              }
            }
          }
        }
        
        if (originDS) {
          if (!recordsByOriginDS.has(originDS)) {
            recordsByOriginDS.set(originDS, [])
          }
          recordsByOriginDS.get(originDS)!.push(record)
        } else {
          debugLogger.log('RESTORE', {
            event: 'could-not-find-origin-ds-for-record',
            widgetId: id,
            recordIndex: index,
            recordId,
            warning: 'record-will-be-skipped'
          })
        }
      })
      
      debugLogger.log('RESTORE', {
        event: 'panel-opened-restoring-accumulated-records',
        widgetId: id,
        resultsMode,
        accumulatedRecordsCount: accumulatedRecords.length,
        originDSCount: recordsByOriginDS.size
      })
      
      // Restore selection for each origin data source
      const { selectRecordsAndPublish } = require('./selection-utils')
      const useGraphicsLayer = this.props.config.useGraphicsLayerForHighlight
      const graphicsLayer = this.graphicsLayerRef.current || undefined
      const mapView = this.mapViewRef.current || undefined
      
      recordsByOriginDS.forEach((records, originDS) => {
        const recordIds = records.map(r => r.getId())
        try {
          // Use originDS directly (not outputDS) since records are selected in origin layers
          // Use async IIFE since forEach callback can't be async
          ;(async () => {
            await selectRecordsAndPublish(id, originDS, recordIds, records, true, useGraphicsLayer, graphicsLayer, mapView)
          })()
          
          debugLogger.log('RESTORE', {
            event: 'panel-opened-restored-origin-ds',
            widgetId: id,
            originDSId: originDS.id,
            recordCount: records.length,
            zoomExecuted: false
          })
        } catch (error) {
          debugLogger.log('RESTORE', {
            event: 'panel-opened-restore-origin-ds-failed',
            widgetId: id,
            originDSId: originDS.id,
            error: error instanceof Error ? error.message : String(error),
            errorStack: error instanceof Error ? error.stack : undefined
          })
        }
      })
      
      return
    }
    
    // HYPOTHESIS: Maybe accumulatedRecords exist but we're not in accumulation mode?
    // Or maybe we should always check accumulatedRecords first?
    if (accumulatedRecords && accumulatedRecords.length > 0 && !isAccumulationMode) {
      debugLogger.log('RESTORE', {
        event: 'addSelectionToMap-accumulated-records-exist-but-not-accumulation-mode',
        widgetId: id,
        resultsMode,
        isAccumulationMode,
        accumulatedRecordsCount: accumulatedRecords.length,
        'hypothesis': 'accumulated-records-exist-but-mode-is-not-add-or-remove',
        'should-we-still-use-them': 'NEEDS-INVESTIGATION'
      })
    }
    
    // Fall back to original logic for "New" mode
    if (!lastSelection) {
      debugLogger.log('RESTORE', {
        event: 'addSelectionToMap-no-lastSelection-exiting',
        widgetId: id,
        resultsMode,
        hasAccumulatedRecords: !!(accumulatedRecords && accumulatedRecords.length > 0),
        accumulatedRecordsCount: accumulatedRecords?.length || 0,
        'hypothesis': 'no-lastSelection-so-exiting-early-maybe-should-check-accumulated-records-first'
      })
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
      const useGraphicsLayer = this.props.config.useGraphicsLayerForHighlight
      const graphicsLayer = this.graphicsLayerRef.current || undefined
      const mapView = this.mapViewRef.current || undefined
      ;(async () => {
        await selectRecordsAndPublish(id, outputDS, lastSelection.recordIds, recordsToSelect, true, useGraphicsLayer, graphicsLayer, mapView)
      })()
      
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
   * Handles results mode change from the mode dropdown in QueryTask component.
   * 
   * This method is called when the user switches between "Create new", "Add to", or
   * "Remove from" modes. It performs the following actions:
   * 
   * 1. Consumes hash parameters when switching to accumulation modes (prevents re-triggering)
   * 2. Clears accumulated records when switching to "New" mode
   * 3. Updates widget state with the new mode
   * 
   * @param mode - The new selection type mode (NewSelection, AddToSelection, or RemoveFromSelection)
   * 
   * @since 1.19.0-r017.0
   */
  private handleResultsModeChange = (mode: SelectionType) => {
    // Using AccumulatedRecordsManager (r018.58)
    const shouldConsumeHash = (mode === SelectionType.AddToSelection || mode === SelectionType.RemoveFromSelection) && !!this.state.initialQueryValue?.shortId
    
    const result = this.accumulatedRecordsManager.handleResultsModeChange(
      this.props.id,
      mode,
      shouldConsumeHash,
      this.state.initialQueryValue?.shortId,
      this.removeHashParameter
    )

    // Reset manual modifications when switching to New Selection mode
    if (mode === SelectionType.NewSelection && this.state.resultsMode !== SelectionType.NewSelection) {
      this.resetManualModifications()
    }

    // Update widget state from manager's return value
    this.setState({
      resultsMode: result.resultsMode,
      accumulatedRecords: result.accumulatedRecords
    })
  }

  /**
   * Removes a hash parameter from the URL when switching to accumulation modes.
   * 
   * This method is called when switching to "Add to" or "Remove from" modes to consume
   * the deep link parameter. This prevents the hash parameter from re-triggering the query
   * when the widget re-renders.
   * 
   * The URL is updated using history.replaceState to avoid page reload, and both pathname
   * and query string are preserved (e.g., debug parameters remain intact).
   * 
   * @param shortId - The shortId parameter to remove from the URL hash
   * 
   * @since 1.19.0-r017.0
   */
  private removeHashParameter = (shortId: string) => {
    if (!shortId) return
    
    const hash = window.location.hash.substring(1)
    const urlParams = new URLSearchParams(hash)
    
    if (urlParams.has(shortId)) {
      urlParams.delete(shortId)
      const newHash = urlParams.toString()
      
      debugLogger.log('HASH', {
        event: 'removeHashParameter',
        shortId,
        newHash: newHash ? `#${newHash}` : '(empty)',
        timestamp: Date.now()
      })
      
      // Update the URL without triggering a reload
      // Always preserve pathname and query string, only update hash
      window.history.replaceState(null, '', 
        window.location.pathname + window.location.search + (newHash ? `#${newHash}` : '')
      )
      
      // Also clear the state so it won't trigger again
      if (this.state.initialQueryValue?.shortId === shortId) {
        this.setState({ initialQueryValue: undefined })
      }
    }
  }

  private handleAccumulatedRecordsChange = (records: FeatureDataRecord[]) => {
    // DIAGNOSTIC LOGGING: State change tracking
    const previousRecords = this.state.accumulatedRecords || []
    const previousIds = previousRecords.map(r => r.getId())
    const newIds = records.map(r => r.getId())
    const addedIds = newIds.filter(id => !previousIds.includes(id))
    const removedIds = previousIds.filter(id => !newIds.includes(id))
    
    debugLogger.log('RESULTS-MODE', {
      event: 'accumulated-records-state-change',
      widgetId: this.props.id,
      previousCount: previousRecords.length,
      previousIds: previousIds,
      newCount: records.length,
      newIds: newIds,
      addedIds: addedIds,
      removedIds: removedIds,
      resultsMode: this.state.resultsMode,
      timestamp: Date.now()
    })
    
    // Using AccumulatedRecordsManager (r018.58)
    this.accumulatedRecordsManager.handleAccumulatedRecordsChange(this.props.id, records)

    // If we're in Remove mode and all accumulated records are cleared, reset to NewSelection mode
    // Remove mode requires accumulated records to function, so it should be disabled when records are empty
    const shouldResetMode = records.length === 0 && 
                           this.state.resultsMode === SelectionType.RemoveFromSelection

    this.setState({ 
      accumulatedRecords: records,
      // Reset mode to NewSelection if all accumulated records cleared in Remove mode
      ...(shouldResetMode ? {
        resultsMode: SelectionType.NewSelection
      } : {})
    })

    if (shouldResetMode) {
      debugLogger.log('RESULTS-MODE', {
        event: 'mode-reset-on-accumulated-records-cleared',
        widgetId: this.props.id,
        previousMode: SelectionType.RemoveFromSelection,
        newMode: SelectionType.NewSelection,
        reason: 'all-accumulated-records-cleared-in-remove-mode',
        timestamp: Date.now()
      })
    }
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
   * Clears selection from the map while preserving widget's internal state.
   * 
   * This method is called when the widget panel closes to remove selection from the map
   * (cleaning up the visual selection) while keeping the selection state in the widget
   * for restoration when the panel reopens.
   * 
   * The method handles both "New" mode (lastSelection) and accumulation modes (accumulatedRecords).
   * It groups records by origin data source and clears selection from each origin data source,
   * ensuring multi-layer selections are properly cleared.
   * 
   * Graphics layer is also cleared if enabled, and empty selection messages are published
   * to notify other widgets (like HelperSimple) that selection has been cleared.
   * 
   * @since 1.19.0-r017.0
   * @see {@link clearSelectionInDataSources} utility function for clearing logic
   */
  private clearSelectionFromMap = () => {
    const { lastSelection, accumulatedRecords, resultsMode } = this.state
    const { id } = this.props
    
    const isAccumulationMode = resultsMode === SelectionType.AddToSelection || 
                               resultsMode === SelectionType.RemoveFromSelection
    
    debugLogger.log('RESTORE', {
      event: 'clearSelectionFromMap-called',
      widgetId: id,
      resultsMode,
      isAccumulationMode,
      hasLastSelection: !!lastSelection,
      lastSelectionRecordCount: lastSelection?.recordIds.length || 0,
      hasAccumulatedRecords: !!(accumulatedRecords && accumulatedRecords.length > 0),
      accumulatedRecordsCount: accumulatedRecords?.length || 0,
      selectionRecordCount: this.state.selectionRecordCount || 0,
      hasSelection: this.state.hasSelection || false
    })
    
    // Always clear graphics layer first when panel closes (if graphics layer is enabled)
    // This ensures visual selection is removed even if state is inconsistent
    if (this.props.config.useGraphicsLayerForHighlight && this.graphicsLayerRef.current) {
      this.graphicsLayerManager.clearGraphics(id, this.props.config)
      debugLogger.log('RESTORE', {
        event: 'panel-closed-graphics-layer-cleared',
        widgetId: id,
        graphicsLayerId: this.graphicsLayerRef.current.id
      })
    }
    
    // Always clear accumulated records if they exist (regardless of mode)
    // This handles the case where mode might have changed but records still exist
    debugLogger.log('RESTORE', {
      event: 'clearSelectionFromMap-checking-accumulated-records',
      widgetId: id,
      'condition': 'accumulatedRecords && accumulatedRecords.length > 0',
      'condition-result': !!(accumulatedRecords && accumulatedRecords.length > 0),
      accumulatedRecordsCount: accumulatedRecords?.length || 0
    })
    
    if (accumulatedRecords && accumulatedRecords.length > 0) {
      // Group accumulated records by origin data source
      const recordsByOriginDS = new Map<FeatureLayerDataSource, FeatureDataRecord[]>()
      const dsManager = DataSourceManager.getInstance()
      
      accumulatedRecords.forEach((record, index) => {
        const recordId = record.getId()
        let originDS: FeatureLayerDataSource | null = null
        
        // Method 1: Try to get from record.getDataSource()
        const recordDS = record.getDataSource?.() as FeatureLayerDataSource
        if (recordDS) {
          originDS = recordDS.getOriginDataSources()?.[0] as FeatureLayerDataSource || recordDS
          
          debugLogger.log('RESTORE', {
            event: 'clear-found-origin-ds-from-record-ds',
            widgetId: id,
            recordIndex: index,
            recordId,
            originDSId: originDS?.id || 'null',
            method: 'record.getDataSource()'
          })
        }
        
        // Method 2: If that failed, search all data sources for a record with matching ID
        if (!originDS) {
          const dsMap = dsManager.getDataSources()
          const allDataSources = Object.values(dsMap)
          
          for (const ds of allDataSources) {
            // Check if this is a FeatureLayerDataSource by checking for getAllLoadedRecords method
            if (ds && typeof (ds as any).getAllLoadedRecords === 'function') {
              try {
                // Check if this DS has the record
                const allRecords = (ds as any).getAllLoadedRecords() || []
                const matchingRecord = allRecords.find((r: FeatureDataRecord) => r.getId() === recordId)
                
                if (matchingRecord) {
                  // Found the record - get origin DS from this DS
                  originDS = (ds as any).getOriginDataSources()?.[0] as FeatureLayerDataSource || ds as FeatureLayerDataSource
                  
                  debugLogger.log('RESTORE', {
                    event: 'clear-found-origin-ds-via-search',
                    widgetId: id,
                    recordIndex: index,
                    recordId,
                    originDSId: originDS.id,
                    method: 'searched-all-data-sources',
                    searchedDSId: ds.id
                  })
                  break
                }
              } catch (error) {
                // Continue searching
              }
            }
          }
        }
        
        if (originDS) {
          if (!recordsByOriginDS.has(originDS)) {
            recordsByOriginDS.set(originDS, [])
          }
          recordsByOriginDS.get(originDS)!.push(record)
        } else {
          debugLogger.log('RESTORE', {
            event: 'clear-could-not-find-origin-ds-for-record',
            widgetId: id,
            recordIndex: index,
            recordId,
            warning: 'record-will-be-skipped'
          })
        }
      })
      
      debugLogger.log('RESTORE', {
        event: 'panel-closed-clearing-accumulated-records-from-map',
        widgetId: id,
        accumulatedRecordsCount: accumulatedRecords.length,
        originDSCount: recordsByOriginDS.size
      })
      
      // Clear selection from each origin data source
      const { clearSelectionInDataSources } = require('./selection-utils')
      const useGraphicsLayer = this.props.config.useGraphicsLayerForHighlight
      const graphicsLayer = this.graphicsLayerRef.current || undefined
      
      recordsByOriginDS.forEach((records, originDS) => {
        try {
          // Use async IIFE since forEach callback can't be async
          ;(async () => {
            await clearSelectionInDataSources(id, originDS, useGraphicsLayer, graphicsLayer)
            
            debugLogger.log('RESTORE', {
              event: 'panel-closed-cleared-origin-ds-selection',
              widgetId: id,
              originDSId: originDS.id,
              recordCount: records.length,
              usedGraphicsLayer: useGraphicsLayer
            })
          })()
        } catch (error) {
          debugLogger.log('RESTORE', {
            event: 'panel-closed-clear-origin-ds-failed',
            widgetId: id,
            originDSId: originDS.id,
            error: error instanceof Error ? error.message : String(error)
          })
        }
      })
      
      debugLogger.log('RESTORE', {
        event: 'clearSelectionFromMap-cleared-accumulated-records-returning',
        widgetId: id,
        'will-not-fallback-to-lastSelection': true
      })
      return
    }
    
    // HYPOTHESIS: Maybe accumulatedRecords exist but we didn't enter the if block?
    // Or maybe we should always clear accumulated records if they exist?
    if (accumulatedRecords && accumulatedRecords.length > 0) {
      debugLogger.log('RESTORE', {
        event: 'clearSelectionFromMap-accumulated-records-exist-but-not-clearing',
        widgetId: id,
        resultsMode,
        isAccumulationMode,
        accumulatedRecordsCount: accumulatedRecords.length,
        'hypothesis': 'accumulated-records-exist-but-condition-failed-why',
        'condition-was': 'accumulatedRecords && accumulatedRecords.length > 0',
        'condition-result': !!(accumulatedRecords && accumulatedRecords.length > 0)
      })
    }
    
    // If we have selection state but no lastSelection, we still need to clear
    // This handles the case where state is inconsistent (hasSelection=true but lastSelection=null)
    if (this.state.hasSelection && !lastSelection) {
      debugLogger.log('RESTORE', {
        event: 'clearSelectionFromMap-has-selection-but-no-lastSelection',
        widgetId: id,
        selectionRecordCount: this.state.selectionRecordCount || 0,
        note: 'will-attempt-to-clear-from-current-selection-state'
      })
      
      // Try to get the output DS from the most recent query
      // Find output DS for this widget (pattern: widget_{id}_output_*)
      const dsManager = DataSourceManager.getInstance()
      const allDataSources = Object.values(dsManager.getDataSources())
      const outputDS = allDataSources.find(ds => 
        ds.id.startsWith(`widget_${id}_output_`)
      ) as FeatureLayerDataSource
      
      if (outputDS) {
        const originDS = outputDS.getOriginDataSources()?.[0] as FeatureLayerDataSource
        if (originDS) {
          const { clearSelectionInDataSources } = require('./selection-utils')
          const useGraphicsLayer = this.props.config.useGraphicsLayerForHighlight
          const graphicsLayer = this.graphicsLayerRef.current || undefined
          
          ;(async () => {
            try {
              await clearSelectionInDataSources(id, originDS, useGraphicsLayer, graphicsLayer)
              debugLogger.log('RESTORE', {
                event: 'panel-closed-cleared-selection-from-state',
                widgetId: id,
                originDSId: originDS.id,
                outputDSId: outputDS.id,
                usedGraphicsLayer: useGraphicsLayer
              })
            } catch (error) {
              debugLogger.log('RESTORE', {
                event: 'panel-closed-clear-from-state-failed',
                widgetId: id,
                originDSId: originDS.id,
                outputDSId: outputDS.id,
                error: error instanceof Error ? error.message : String(error)
              })
            }
          })()
          return
        } else {
          debugLogger.log('RESTORE', {
            event: 'clearSelectionFromMap-no-origin-ds-found',
            widgetId: id,
            outputDSId: outputDS.id,
            note: 'output-ds-found-but-no-origin-ds'
          })
        }
      } else {
        debugLogger.log('RESTORE', {
          event: 'clearSelectionFromMap-no-output-ds-found',
          widgetId: id,
          note: 'could-not-find-output-ds-for-widget'
        })
      }
    }
    
    // Fall back to original logic for "New" mode with lastSelection
    if (!lastSelection) {
      debugLogger.log('RESTORE', {
        event: 'clearSelectionFromMap-no-lastSelection-exiting',
        widgetId: id,
        hasAccumulatedRecords: !!(accumulatedRecords && accumulatedRecords.length > 0),
        accumulatedRecordsCount: accumulatedRecords?.length || 0,
        hasSelection: this.state.hasSelection || false,
        selectionRecordCount: this.state.selectionRecordCount || 0
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

      // Use clearSelectionInDataSources utility which supports graphics layer
      const { clearSelectionInDataSources } = require('./selection-utils')
      const useGraphicsLayer = this.props.config.useGraphicsLayerForHighlight
      const graphicsLayer = this.graphicsLayerRef.current || undefined
      
      ;(async () => {
        await clearSelectionInDataSources(id, originDS, useGraphicsLayer, graphicsLayer)
        
        debugLogger.log('RESTORE', {
          event: 'panel-closed-cleared-origin-ds-selection',
          widgetId: id,
          originDSId: originDS.id,
          usedGraphicsLayer: useGraphicsLayer
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
      })()
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
   * NOTIFY that a hash parameter has been used.
   * Previously this removed the hash from the URL, but per updated requirements,
   * user-entered hashes should remain in the URL.
   * 
   * @param shortId - The shortId parameter that was used
   */
  handleHashParameterUsed = (shortId: string) => {
    const { id } = this.props
    const { initialQueryValue } = this.state
    
    debugLogger.log('HASH-EXEC', {
      event: 'querysimple-handlehashparameterused-called',
      widgetId: id,
      shortId,
      currentState: {
        shouldUseInitialQueryValueForSelection: this.state.shouldUseInitialQueryValueForSelection,
        hasInitialQueryValue: !!this.state.initialQueryValue,
        initialQueryValueShortId: this.state.initialQueryValue?.shortId,
        initialQueryValueValue: this.state.initialQueryValue?.value
      },
      timestamp: Date.now()
    })
    
    // NOTE: Hash parameters are NOT cleared here - they persist in URL
    // Hash parameters are only consumed when switching to accumulation modes (Add/Remove)
    // to prevent re-triggering when the user manually switches modes
    
    debugLogger.log('HASH', {
      event: 'handleHashParameterUsed-notified',
      widgetId: id,
      shortId: shortId,
      currentInitialQueryValue: initialQueryValue,
      note: 'Hash parameter used but NOT cleared - hash remains in URL per user requirement',
      timestamp: Date.now()
    })

    // Track this shortId:value pair as processed to prevent re-execution when switching queries
    // This prevents HelperSimple from re-triggering the same parameter when switching queries
    if (initialQueryValue) {
      const paramKey = `${initialQueryValue.shortId}:${initialQueryValue.value}`
      this.processedHashParamsRef.add(paramKey)
      debugLogger.log('HASH-EXEC', {
        event: 'querysimple-hashparam-tracked-as-processed',
        widgetId: id,
        shortId: initialQueryValue.shortId,
        value: initialQueryValue.value,
        paramKey,
        processedParams: Array.from(this.processedHashParamsRef),
        timestamp: Date.now()
      })
    }
    
    // ALWAYS clear both hash state values after execution
    // QuerySimple should not remember hash state after HelperSimple-driven execution completes
    // This prevents autonomous re-processing when switching queries
    // Using a single setState ensures atomic update and prevents race conditions
    this.setState({ 
      shouldUseInitialQueryValueForSelection: false,
      initialQueryValue: undefined
    }, () => {
      debugLogger.log('HASH-EXEC', {
        event: 'querysimple-handlehashparameterused-state-cleared',
        widgetId: id,
        shortId,
        newState: {
          shouldUseInitialQueryValueForSelection: this.state.shouldUseInitialQueryValueForSelection,
          hasInitialQueryValue: !!this.state.initialQueryValue,
          initialQueryValueShortId: this.state.initialQueryValue?.shortId,
          initialQueryValueValue: this.state.initialQueryValue?.value
        },
        timestamp: Date.now()
      })
    })
    
    debugLogger.log('HASH', {
      event: 'shouldUseInitialQueryValueForSelection-flag-cleared',
      widgetId: id,
      shortId: shortId,
      flagValue: false,
      timestamp: Date.now()
    })
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
                shouldUseInitialQueryValueForSelection={this.state.shouldUseInitialQueryValueForSelection}
                onHashParameterUsed={this.handleHashParameterUsed}
                resultsMode={this.state.resultsMode}
                onResultsModeChange={this.handleResultsModeChange}
                accumulatedRecords={this.state.accumulatedRecords}
                onAccumulatedRecordsChange={this.handleAccumulatedRecordsChange}
                useGraphicsLayerForHighlight={config.useGraphicsLayerForHighlight}
                graphicsLayer={this.graphicsLayerRef.current || undefined}
                mapView={this.mapViewRef.current || undefined}
                onInitializeGraphicsLayer={this.initializeGraphicsLayerFromOutputDS}
                onClearGraphicsLayer={this.clearGraphicsLayerIfExists}
                activeTab={this.state.activeTab}
                onTabChange={this.handleTabChange}
                eventManager={this.eventManager}
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
            onHashParameterUsed={this.handleHashParameterUsed}
          />
        </QueryWidgetContext.Provider>
      )
    }

    return (
      <Paper ref={this.widgetRef} variant='flat' className='jimu-widget runtime-query' data-widgetid={id} css={css`
        display: flex;
        flex-direction: column;
        height: 100%;
      `}>
        {/* Hidden JimuMapViewComponent to get map view for graphics layer */}
        {/* Uses explicit map widget ID from config (widget-level binding) */}
        {config.useGraphicsLayerForHighlight && config.highlightMapWidgetId && (
          <JimuMapViewComponent
            useMapWidgetId={config.highlightMapWidgetId}
            onActiveViewChange={this.handleJimuMapViewChanged}
          />
        )}
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
                shouldUseInitialQueryValueForSelection={this.state.shouldUseInitialQueryValueForSelection}
                onHashParameterUsed={this.handleHashParameterUsed}
                resultsMode={this.state.resultsMode}
                onResultsModeChange={this.handleResultsModeChange}
                accumulatedRecords={this.state.accumulatedRecords}
                onAccumulatedRecordsChange={this.handleAccumulatedRecordsChange}
                useGraphicsLayerForHighlight={config.useGraphicsLayerForHighlight}
                graphicsLayer={this.graphicsLayerRef.current || undefined}
                mapView={this.mapViewRef.current || undefined}
                onInitializeGraphicsLayer={this.initializeGraphicsLayerFromOutputDS}
                onClearGraphicsLayer={this.clearGraphicsLayerIfExists}
                activeTab={this.state.activeTab}
                onTabChange={this.handleTabChange}
                eventManager={this.eventManager}
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
              QuerySimple by MapSimple
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

