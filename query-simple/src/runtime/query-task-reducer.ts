/**
 * QueryTask Reducer
 *
 * Consolidates 12 individual useState calls from query-task.tsx into a single
 * useReducer. This reduces the closure variable count for handleFormSubmitInternal
 * from 37 to ~22, enabling extraction to a separate file with a typed parameter object.
 *
 * State grouped by purpose:
 * - UI stage and execution flags (stage, resultCount, queryJustExecuted)
 * - Error/alert state (selectionError, zoomError, 4 alert objects)
 * - Clearing/DS lifecycle (isClearing, outputDS, dsRecreationKey)
 *
 * Five useState calls remain outside the reducer because they are NOT used
 * by the extraction targets (handleFormSubmitInternal, clearResult):
 * internalActiveTab, enabled, dataSource, spatialFilterEnabled, dataActionFilter
 *
 * @version r024.124
 */
import { type DataSource } from 'jimu-core'

// ---------------------------------------------------------------------------
// Alert type interfaces — match the exact shapes from query-task.tsx useState
// ---------------------------------------------------------------------------

/** r022.3: Zero results alert */
export interface NoResultsAlertState {
  show: boolean
  recordsRequested: number
  queryValue: string
  timestamp?: number
}

/** r022.15: Remove mode — query found records but none match accumulated */
export interface NoRemovalAlertState {
  show: boolean
  recordsFound: number
  queryValue: string
  timestamp?: number
}

/** r024.62: Query execution failure (service down, network error) */
export interface QueryErrorAlertState {
  show: boolean
  errorMessage: string
  timestamp?: number
}

/**
 * r028.114: Result-set truncation. The service returned its maximum transfer
 * count and `exceededTransferLimit` was true — there are MORE matching records
 * than were returned. `recordLimit` is the returned (shown) count.
 *
 * r028.122: Both query paths now fetch the TRUE total matching count (via a
 * count-only query) when truncation is real, so the alert can name the actual
 * number. `totalMatchCount` is that total when known (undefined if the count
 * couldn't be fetched — message falls back to the generic wording).
 * `totalMatchCountIsLowerBound` is true when the total is a floor rather than
 * exact (spatial multi-geometry input — the unique union can't be cheaply
 * deduped, so we report the largest sub-query total as "at least N").
 */
export interface TruncationAlertState {
  show: boolean
  recordLimit: number
  totalMatchCount?: number
  totalMatchCountIsLowerBound?: boolean
  timestamp?: number
}

/** r022.21: Add mode — all found records are duplicates */
export interface AllDuplicatesAlertState {
  show: boolean
  recordsFound: number
  queryValue: string
  timestamp?: number
}

// ---------------------------------------------------------------------------
// State interface
// ---------------------------------------------------------------------------

export interface QueryTaskState {
  /** UI stage: 0=form, 1=results, 2=loading, 3=clearing */
  stage: number
  /** Number of results from current/accumulated query */
  resultCount: number
  /** Selection error message displayed to user */
  selectionError: string | null
  /** Zoom error message displayed to user */
  zoomError: string | null
  /** Query execution failure alert */
  queryErrorAlert: QueryErrorAlertState | null
  /** Zero results alert */
  noResultsAlert: NoResultsAlertState | null
  /** r028.114: Result-set truncation alert (hit the service transfer limit) */
  truncationAlert: TruncationAlertState | null
  /** Add mode — all duplicates alert */
  allDuplicatesAlert: AllDuplicatesAlertState | null
  /** Remove mode — no matching records alert */
  noRemovalAlert: NoRemovalAlertState | null
  /** Flag for auto-tab-switch after query execution */
  queryJustExecuted: boolean
  /** Clearing operation in progress (forces effectiveRecords = []) */
  isClearing: boolean
  /** Output DataSource reference */
  outputDS: DataSource | null
  /** Key prop for DataSourceComponent remount (r021.51) */
  dsRecreationKey: number
}

// ---------------------------------------------------------------------------
// Action types
// ---------------------------------------------------------------------------

export type QueryTaskAction =
  | { type: 'SET_STAGE'; payload: number }
  | { type: 'SET_RESULT_COUNT'; payload: number }
  | { type: 'SET_SELECTION_ERROR'; payload: string | null }
  | { type: 'SET_ZOOM_ERROR'; payload: string | null }
  | { type: 'SET_QUERY_ERROR_ALERT'; payload: QueryErrorAlertState | null }
  | { type: 'SET_NO_RESULTS_ALERT'; payload: NoResultsAlertState | null }
  | { type: 'SET_TRUNCATION_ALERT'; payload: TruncationAlertState | null }
  | { type: 'SET_ALL_DUPLICATES_ALERT'; payload: AllDuplicatesAlertState | null }
  | { type: 'SET_NO_REMOVAL_ALERT'; payload: NoRemovalAlertState | null }
  | { type: 'SET_QUERY_EXECUTED'; payload: boolean }
  | { type: 'SET_CLEARING'; payload: boolean }
  | { type: 'SET_OUTPUT_DS'; payload: DataSource | null }
  | { type: 'INCREMENT_DS_RECREATION_KEY' }
  | { type: 'RESET_FOR_CLEAR' }
  | { type: 'QUERY_COMPLETE'; payload: { resultCount: number } }

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export const INITIAL_STATE: QueryTaskState = {
  stage: 0,
  resultCount: 0,
  selectionError: null,
  zoomError: null,
  queryErrorAlert: null,
  noResultsAlert: null,
  truncationAlert: null,
  allDuplicatesAlert: null,
  noRemovalAlert: null,
  queryJustExecuted: false,
  isClearing: false,
  outputDS: null,
  dsRecreationKey: 0
}

// ---------------------------------------------------------------------------
// Reducer
// ---------------------------------------------------------------------------

export function queryTaskReducer (state: QueryTaskState, action: QueryTaskAction): QueryTaskState {
  switch (action.type) {
    case 'SET_STAGE':
      return { ...state, stage: action.payload }

    case 'SET_RESULT_COUNT':
      return { ...state, resultCount: action.payload }

    case 'SET_SELECTION_ERROR':
      return { ...state, selectionError: action.payload }

    case 'SET_ZOOM_ERROR':
      return { ...state, zoomError: action.payload }

    case 'SET_QUERY_ERROR_ALERT':
      return { ...state, queryErrorAlert: action.payload }

    case 'SET_NO_RESULTS_ALERT':
      return { ...state, noResultsAlert: action.payload }

    case 'SET_TRUNCATION_ALERT':
      return { ...state, truncationAlert: action.payload }

    case 'SET_ALL_DUPLICATES_ALERT':
      return { ...state, allDuplicatesAlert: action.payload }

    case 'SET_NO_REMOVAL_ALERT':
      return { ...state, noRemovalAlert: action.payload }

    case 'SET_QUERY_EXECUTED':
      return { ...state, queryJustExecuted: action.payload }

    case 'SET_CLEARING':
      return { ...state, isClearing: action.payload }

    case 'SET_OUTPUT_DS':
      return { ...state, outputDS: action.payload }

    case 'INCREMENT_DS_RECREATION_KEY':
      return { ...state, dsRecreationKey: state.dsRecreationKey + 1 }

    // Atomic: resets multiple fields for clearResult
    case 'RESET_FOR_CLEAR':
      return {
        ...state,
        stage: 0,
        resultCount: 0,
        selectionError: null,
        zoomError: null,
        queryErrorAlert: null,
        noResultsAlert: null,
        truncationAlert: null,
        allDuplicatesAlert: null,
        noRemovalAlert: null,
        queryJustExecuted: false,
        isClearing: true
      }

    // Atomic: sets state after successful query completion
    case 'QUERY_COMPLETE':
      return {
        ...state,
        stage: 1,
        resultCount: action.payload.resultCount,
        queryJustExecuted: true
      }

    default:
      return state
  }
}
