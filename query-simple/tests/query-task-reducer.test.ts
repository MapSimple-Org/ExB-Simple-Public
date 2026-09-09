/**
 * Unit tests for query-task-reducer.
 *
 * Focused on the alert state machine, with emphasis on the r028.114 truncation
 * alert (set, clear, and that RESET_FOR_CLEAR wipes it alongside the others).
 *
 * r028.114
 */
import { queryTaskReducer, INITIAL_STATE, type TruncationAlertState } from '../src/runtime/query-task-reducer'

describe('query-task-reducer', () => {
  describe('initial state', () => {
    it('starts with all alerts null, including truncationAlert', () => {
      expect(INITIAL_STATE.truncationAlert).toBeNull()
      expect(INITIAL_STATE.noResultsAlert).toBeNull()
      expect(INITIAL_STATE.queryErrorAlert).toBeNull()
    })
  })

  describe('SET_TRUNCATION_ALERT (r028.114)', () => {
    it('sets the truncation alert payload', () => {
      const payload: TruncationAlertState = { show: true, recordLimit: 1000, timestamp: 123 }
      const next = queryTaskReducer(INITIAL_STATE, { type: 'SET_TRUNCATION_ALERT', payload })
      expect(next.truncationAlert).toEqual(payload)
    })

    it('clears the truncation alert with a null payload', () => {
      const withAlert = { ...INITIAL_STATE, truncationAlert: { show: true, recordLimit: 2000, timestamp: 1 } }
      const next = queryTaskReducer(withAlert, { type: 'SET_TRUNCATION_ALERT', payload: null })
      expect(next.truncationAlert).toBeNull()
    })

    it('does not disturb other alert state', () => {
      const seeded = {
        ...INITIAL_STATE,
        noResultsAlert: { show: true, recordsRequested: 0, queryValue: 'x', timestamp: 1 }
      }
      const next = queryTaskReducer(seeded, {
        type: 'SET_TRUNCATION_ALERT',
        payload: { show: true, recordLimit: 1000, timestamp: 2 }
      })
      expect(next.noResultsAlert).toBe(seeded.noResultsAlert) // untouched reference
      expect(next.truncationAlert?.recordLimit).toBe(1000)
    })
  })

  describe('RESET_FOR_CLEAR', () => {
    it('wipes truncationAlert along with the other alerts', () => {
      const dirty = {
        ...INITIAL_STATE,
        truncationAlert: { show: true, recordLimit: 1000, timestamp: 1 },
        noResultsAlert: { show: true, recordsRequested: 0, queryValue: 'x', timestamp: 1 },
        queryErrorAlert: { show: true, errorMessage: 'boom', timestamp: 1 },
        resultCount: 42
      }
      const next = queryTaskReducer(dirty, { type: 'RESET_FOR_CLEAR' })
      expect(next.truncationAlert).toBeNull()
      expect(next.noResultsAlert).toBeNull()
      expect(next.queryErrorAlert).toBeNull()
      expect(next.resultCount).toBe(0)
      expect(next.isClearing).toBe(true)
    })
  })
})
