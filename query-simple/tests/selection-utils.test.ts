// Mock shared-code/mapsimple-common
const mockDebugLogger = { log: jest.fn() }
jest.mock('widgets/shared-code/mapsimple-common', () => ({
  createQuerySimpleDebugLogger: () => mockDebugLogger
}))

// Mock jimu-core
const mockPublishMessage = jest.fn()
jest.mock('jimu-core', () => ({
  MessageManager: {
    getInstance: jest.fn().mockReturnValue({
      publishMessage: mockPublishMessage
    })
  },
  DataRecordsSelectionChangeMessage: jest.fn(),
  DataRecordSetChangeMessage: jest.fn(),
  RecordSetChangeType: { CreateUpdate: 'CreateUpdate' },
  DataSourceManager: {
    getInstance: jest.fn().mockReturnValue({
      getDataSource: jest.fn()
    })
  }
}))

// Mock graphics-layer-utils
jest.mock('../src/runtime/graphics-layer-utils', () => ({
  addHighlightGraphics: jest.fn(),
  clearGraphicsLayerOrGroupLayer: jest.fn(),
  createOrGetGraphicsLayer: jest.fn(),
  cleanupGraphicsLayer: jest.fn(),
  cleanupAnyResultLayer: jest.fn(),
  clearAnyResultLayerContents: jest.fn()
}))

import {
  QUERYSIMPLE_SELECTION_EVENT,
  getOriginDataSource,
  publishSelectionMessage,
  findClearResultsButton,
  clearDataSParameterFromHash,
  dispatchSelectionEvent
} from '../src/runtime/selection-utils'

describe('selection-utils unit tests', () => {
  beforeEach(() => {
    mockDebugLogger.log.mockClear()
    mockPublishMessage.mockClear()
  })

  describe('QUERYSIMPLE_SELECTION_EVENT', () => {
    it('should be a defined string constant', () => {
      expect(QUERYSIMPLE_SELECTION_EVENT).toBe('querysimple-selection-changed')
    })
  })

  describe('getOriginDataSource', () => {
    it('should return null for null input', () => {
      expect(getOriginDataSource(null)).toBeNull()
    })

    it('should return null for undefined input', () => {
      expect(getOriginDataSource(undefined)).toBeNull()
    })

    it('should return first origin data source when available', () => {
      const originDS = { id: 'origin_1' }
      const outputDS: any = {
        getOriginDataSources: jest.fn().mockReturnValue([originDS])
      }
      expect(getOriginDataSource(outputDS)).toBe(originDS)
    })

    it('should return null when getOriginDataSources returns empty array', () => {
      const outputDS: any = {
        getOriginDataSources: jest.fn().mockReturnValue([])
      }
      expect(getOriginDataSource(outputDS)).toBeNull()
    })

    it('should return outputDS itself if it has layer property (already origin)', () => {
      const outputDS: any = {
        layer: {},
        getOriginDataSources: jest.fn().mockReturnValue([])
      }
      expect(getOriginDataSource(outputDS)).toBe(outputDS)
    })

    it('should return outputDS itself if it has type FeatureLayer', () => {
      const outputDS: any = {
        type: 'FeatureLayer',
        getOriginDataSources: jest.fn().mockReturnValue([])
      }
      expect(getOriginDataSource(outputDS)).toBe(outputDS)
    })

    it('should handle DS without getOriginDataSources method', () => {
      const outputDS: any = { id: 'test' }
      expect(getOriginDataSource(outputDS)).toBeNull()
    })
  })

  describe('publishSelectionMessage', () => {
    it('should not publish when outputDS is null', () => {
      publishSelectionMessage('widget_1', [], null)
      expect(mockPublishMessage).not.toHaveBeenCalled()
    })

    it('should publish to origin DS when available', () => {
      const originDS = { id: 'origin_1' }
      const outputDS: any = {
        id: 'output_1',
        getOriginDataSources: jest.fn().mockReturnValue([originDS])
      }

      publishSelectionMessage('widget_1', [], outputDS)

      expect(mockPublishMessage).toHaveBeenCalledTimes(1)
    })

    it('should publish to outputDS as fallback when no origin DS and alsoPublishToOutputDS is true', () => {
      const outputDS: any = {
        id: 'output_1',
        getOriginDataSources: jest.fn().mockReturnValue([])
      }

      publishSelectionMessage('widget_1', [], outputDS, true)

      expect(mockPublishMessage).toHaveBeenCalledTimes(1)
    })

    it('should publish to both origin DS and output DS when alsoPublishToOutputDS is true', () => {
      const originDS = { id: 'origin_1' }
      const outputDS: any = {
        id: 'output_1',
        getOriginDataSources: jest.fn().mockReturnValue([originDS])
      }

      publishSelectionMessage('widget_1', [], outputDS, true)

      // Once for originDS, once for outputDS
      expect(mockPublishMessage).toHaveBeenCalledTimes(2)
    })
  })

  describe('dispatchSelectionEvent', () => {
    it('should call eventManager.dispatchSelectionEvent when provided', () => {
      const originDS = { id: 'origin_1' }
      const outputDS: any = {
        id: 'output_1',
        getOriginDataSources: jest.fn().mockReturnValue([originDS])
      }
      const eventManager: any = {
        dispatchSelectionEvent: jest.fn()
      }

      dispatchSelectionEvent('widget_1', ['1', '2'], outputDS, 'config_1', eventManager, 5)

      expect(eventManager.dispatchSelectionEvent).toHaveBeenCalledWith(
        'widget_1', ['1', '2'], 'origin_1', 'output_1', 'config_1', 5
      )
    })

    it('should not throw when eventManager is not provided', () => {
      const outputDS: any = {
        id: 'output_1',
        getOriginDataSources: jest.fn().mockReturnValue([])
      }

      expect(() => {
        dispatchSelectionEvent('widget_1', ['1'], outputDS, 'config_1')
      }).not.toThrow()
    })
  })

  describe('findClearResultsButton', () => {
    it('should return null when no button exists in DOM', () => {
      expect(findClearResultsButton()).toBeNull()
    })

    it('should find button with aria-label "Clear results"', () => {
      const button = document.createElement('button')
      button.setAttribute('aria-label', 'Clear results')
      document.body.appendChild(button)

      expect(findClearResultsButton()).toBe(button)

      document.body.removeChild(button)
    })

    it('should prefer button inside .query-result__header', () => {
      // Create a button outside the header
      const outsideButton = document.createElement('button')
      outsideButton.setAttribute('aria-label', 'Clear results')
      document.body.appendChild(outsideButton)

      // Create a button inside the header
      const header = document.createElement('div')
      header.className = 'query-result__header'
      const headerButton = document.createElement('button')
      headerButton.setAttribute('aria-label', 'Clear results')
      header.appendChild(headerButton)
      document.body.appendChild(header)

      expect(findClearResultsButton()).toBe(headerButton)

      document.body.removeChild(outsideButton)
      document.body.removeChild(header)
    })
  })

  describe('clearDataSParameterFromHash', () => {
    const originalLocation = window.location
    const originalHistory = window.history

    beforeEach(() => {
      // Reset hash
      window.history.replaceState(null, '', window.location.pathname)
    })

    it('should do nothing when hash is empty', () => {
      const spy = jest.spyOn(window.history, 'replaceState')
      clearDataSParameterFromHash()
      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    })

    it('should remove data_s parameter from hash', () => {
      window.history.replaceState(null, '', '#data_s=abc&other=123')

      clearDataSParameterFromHash()

      expect(window.location.hash).not.toContain('data_s')
      expect(window.location.hash).toContain('other=123')
    })

    it('should clear hash completely if data_s was the only parameter', () => {
      window.history.replaceState(null, '', '#data_s=abc')

      clearDataSParameterFromHash()

      expect(window.location.hash).toBe('')
    })

    it('should not modify hash when data_s is not present', () => {
      window.history.replaceState(null, '', '#other=123')
      const spy = jest.spyOn(window.history, 'replaceState')

      clearDataSParameterFromHash()

      expect(spy).not.toHaveBeenCalled()
      spy.mockRestore()
    })
  })
})
