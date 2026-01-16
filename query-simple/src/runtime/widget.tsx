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
// Chunk 3: Selection & Restoration Manager (r019.1) - Section 3.1: Selection State Tracking
import { SelectionRestorationManager } from './hooks/use-selection-restoration'

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
  // Chunk 3: Selection & Restoration Manager (r019.1) - Section 3.1: Selection State Tracking
  private selectionRestorationManager = new SelectionRestorationManager(
    () => this.state, // stateGetter
    {
      onStateUpdate: (newState) => this.setState(newState as any)
    }
  )

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
    
    // Chunk 7: Event handling (r018.59 - Step 7.1: Add manager)
    this.eventManager.setHandlers({
      onOpenWidgetEvent: this.handleOpenWidgetEvent,
      // Chunk 3: Section 3.1 Step 3.1.5 (r019.5): Switch to manager implementation
      onSelectionChange: (event) => this.selectionRestorationManager.handleSelectionChange(event),
      onRestoreOnIdentifyClose: this.handleRestoreOnIdentifyClose
    })
    
    this.eventManager.setup(this.props.id)
    
    // Chunk 3: Selection & Restoration Manager (r019.2) - Section 3.1: Initialize widgetId
    this.selectionRestorationManager.setWidgetId(this.props.id)
    
    // Graphics layer will be initialized when map view becomes available via JimuMapViewComponent
  }

  componentWillUnmount() {
    // r021.6 Chunk 2c: Close popup when widget unmounts
    const mapView = this.mapViewManager.getMapView() || this.mapViewRef.current
    if (mapView?.popup?.visible) {
      mapView.popup.close()
      debugLogger.log('POPUP', {
        event: 'popup-closed-on-widget-unmount',
        widgetId: this.props.id,
        reason: 'Widget unmounted',
        timestamp: Date.now()
      })
    }
    
    // Chunk 1: Clean up manager (r018.8)
    this.urlConsumptionManager.cleanup()
    
    // Chunk 7: Event handling cleanup (r018.59 - Step 7.1: Add manager)
    this.eventManager.cleanup(this.props.id)
    
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
    
    // Chunk 7: Dispatch selection event via EventManager (r018.59)
    // Note: This call is missing outputDsId and queryItemConfigId, but this method
    // is only used for notifying HelperSimple, not for setting lastSelection state.
    // The actual selection events come from query-task.tsx and query-result.tsx
    // which use dispatchSelectionEvent from selection-utils.ts
    this.eventManager.dispatchSelectionEvent(id, recordIds, dataSourceId)
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
        // r020.1 (BUG-HASH-DIRTY-001): Safety check - only restore if we have records to display
        const hasRecordsToDisplay = this.state.accumulatedRecords?.some(ar => ar.record) || 
                                    this.state.selectionRecordCount > 0
        
        if (!hasRecordsToDisplay) {
          debugLogger.log('RESTORE', {
            event: 'panel-opened-skipping-restore-no-records',
            widgetId: this.props.id,
            reason: 'hasSelectionToRestore-true-but-no-records-to-display',
            hasAccumulatedRecords,
            accumulatedRecordsCount: this.state.accumulatedRecords?.length || 0,
            selectionRecordCount: this.state.selectionRecordCount || 0,
            hasLastSelection: !!this.state.lastSelection
          })
          return // Don't restore if no records
        }
        
        debugLogger.log('RESTORE', {
          event: 'panel-opened-calling-addSelectionToMap',
          widgetId: this.props.id,
          reason: 'hasSelectionToRestore-is-true'
        })
        ;(async () => {
          const deps = {
            graphicsLayerRef: this.graphicsLayerRef,
            mapViewRef: this.mapViewRef,
            graphicsLayerManager: this.graphicsLayerManager,
            config: this.props.config
          }
          await this.selectionRestorationManager.addSelectionToMap(deps)
        })()
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
      // r021.7 Chunk 2c: Close popup when widget panel closes
      const mapView = this.mapViewManager.getMapView() || this.mapViewRef.current
      if (mapView?.popup?.visible) {
        mapView.popup.close()
        debugLogger.log('POPUP', {
          event: 'popup-closed-on-panel-close',
          widgetId: this.props.id,
          reason: 'Widget panel closed',
          timestamp: Date.now()
        })
      }
      
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
        ;(async () => {
          const deps = {
            graphicsLayerRef: this.graphicsLayerRef,
            mapViewRef: this.mapViewRef,
            graphicsLayerManager: this.graphicsLayerManager,
            config: this.props.config
          }
          await this.selectionRestorationManager.clearSelectionFromMap(deps)
        })()
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
      
      ;(async () => {
        const deps = {
          graphicsLayerRef: this.graphicsLayerRef,
          mapViewRef: this.mapViewRef,
          graphicsLayerManager: this.graphicsLayerManager,
          config: this.props.config
        }
        await this.selectionRestorationManager.addSelectionToMap(deps)
      })()
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
    
    ;(async () => {
      const deps = {
        graphicsLayerRef: this.graphicsLayerRef,
        mapViewRef: this.mapViewRef,
        graphicsLayerManager: this.graphicsLayerManager,
        config: this.props.config
      }
      await this.selectionRestorationManager.addSelectionToMap(deps)
    })()
  }

  // ============================================================================
  // r019.18: Removed addSelectionToMapParallel wrapper (27 lines)
  // r019.20: Removed clearSelectionFromMapParallel wrapper (27 lines)
  // All call sites now directly invoke SelectionRestorationManager methods
  // ============================================================================

  // ============================================================================
  // r019.15: Removed old addSelectionToMap implementation (272 lines)
  // Now fully handled by SelectionRestorationManager.addSelectionToMap()
  // ============================================================================

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

  // ============================================================================
  // r019.16: Removed old clearSelectionFromMap implementation (355 lines)
  // Now fully handled by SelectionRestorationManager.clearSelectionFromMap()
  // ============================================================================

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

