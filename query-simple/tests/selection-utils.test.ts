import {
  getOriginDataSource,
  selectRecordsInDataSources,
  clearSelectionInDataSources,
  publishSelectionMessage,
  selectRecordsAndPublish,
  dispatchSelectionEvent,
  clearAllSelectionsForWidget,
  QUERYSIMPLE_SELECTION_EVENT
} from '../src/runtime/selection-utils'
import { MessageManager, DataRecordsSelectionChangeMessage, DataRecordSetChangeMessage, RecordSetChangeType, DataSourceManager } from 'jimu-core'

// Mock shared-code/mapsimple-common
jest.mock('widgets/shared-code/mapsimple-common', () => ({
  createQuerySimpleDebugLogger: () => ({
    log: jest.fn()
  })
}))

// Mock graphics-layer-utils
jest.mock('../src/runtime/graphics-layer-utils', () => ({
  addHighlightGraphics: jest.fn().mockResolvedValue(undefined),
  clearGraphicsLayer: jest.fn(),
  createOrGetGraphicsLayer: jest.fn(),
  cleanupGraphicsLayer: jest.fn()
}))

// Mock jimu-core
const mockPublishMessage = jest.fn()
const mockGetDataSources = jest.fn(() => ({}))
const mockDestroyDataSource = jest.fn()

jest.mock('jimu-core', () => ({
  MessageManager: {
    getInstance: jest.fn(() => ({
      publishMessage: mockPublishMessage
    }))
  },
  DataSourceManager: {
    getInstance: jest.fn(() => ({
      getDataSources: mockGetDataSources,
      destroyDataSource: mockDestroyDataSource
    }))
  },
  DataRecordsSelectionChangeMessage: jest.fn(),
  DataRecordSetChangeMessage: jest.fn(),
  RecordSetChangeType: {
    Remove: 'Remove'
  }
}))

describe('selection-utils unit tests', () => {
  let mockOriginDS: any
  let mockOutputDS: any
  let mockGraphicsLayer: any
  let mockMapView: any
  let originalLocation: Location
  
  beforeEach(() => {
    jest.clearAllMocks()
    mockPublishMessage.mockClear()
    mockGetDataSources.mockReturnValue({})
    mockDestroyDataSource.mockClear()
    
    mockOriginDS = {
      id: 'origin_ds_1',
      selectRecordsByIds: jest.fn(),
      getSelectedRecords: jest.fn().mockReturnValue([]),
      getSelectedRecordIds: jest.fn().mockReturnValue([])
    }
    
    mockOutputDS = {
      id: 'widget_1_output_q1',
      getOriginDataSources: jest.fn().mockReturnValue([mockOriginDS]),
      selectRecordsByIds: jest.fn(),
      clearSourceRecords: jest.fn()
    }
    
    mockGraphicsLayer = {
      id: 'querysimple-highlight-widget_1',
      graphics: {
        length: 0,
        forEach: jest.fn(),
        removeAll: jest.fn()
      },
      removeAll: jest.fn()
    }
    
    mockMapView = {
      map: {
        layers: {
          find: jest.fn(),
          toArray: jest.fn().mockReturnValue([]),
          length: 0
        },
        add: jest.fn(),
        remove: jest.fn()
      },
      popup: {
        visible: false,
        close: jest.fn()
      }
    }
    
    // Save and mock window.location
    originalLocation = window.location
    delete (window as any).location
    window.location = {
      hash: '',
      search: '',
      pathname: '/test',
      href: '',
      protocol: 'http:',
      host: 'localhost',
      hostname: 'localhost',
      port: '',
      origin: 'http://localhost',
      assign: jest.fn(),
      reload: jest.fn(),
      replace: jest.fn()
    } as any
    
    window.history.replaceState = jest.fn()
  })
  
  afterEach(() => {
    window.location = originalLocation
  })
  
  describe('getOriginDataSource', () => {
    it('should return null if outputDS is null', () => {
      const result = getOriginDataSource(null)
      expect(result).toBeNull()
    })
    
    it('should return first origin data source if available', () => {
      const result = getOriginDataSource(mockOutputDS)
      expect(result).toBe(mockOriginDS)
    })
    
    it('should return outputDS if it is already an origin data source', () => {
      const dsWithLayer: any = {
        id: 'ds_with_layer',
        layer: {},
        getOriginDataSources: jest.fn().mockReturnValue([])
      }
      
      const result = getOriginDataSource(dsWithLayer)
      expect(result).toBe(dsWithLayer)
    })
    
    it('should return null if no origin data sources and not a layer DS', () => {
      const dsWithoutOrigin: any = {
        id: 'ds_no_origin',
        getOriginDataSources: jest.fn().mockReturnValue([])
      }
      
      const result = getOriginDataSource(dsWithoutOrigin)
      expect(result).toBeNull()
    })
  })
  
  describe('selectRecordsInDataSources', () => {
    it('should return early if no outputDS', async () => {
      await selectRecordsInDataSources(null, ['1', '2'])
      
      expect(mockOriginDS.selectRecordsByIds).not.toHaveBeenCalled()
    })
    
    it('should select records in origin DS using layer selection', async () => {
      await selectRecordsInDataSources(mockOutputDS, ['1', '2'])
      
      expect(mockOriginDS.selectRecordsByIds).toHaveBeenCalledWith(['1', '2'], undefined)
      expect(mockOutputDS.selectRecordsByIds).toHaveBeenCalledWith(['1', '2'], undefined)
    })
    
    it('should use graphics layer for highlighting if enabled', async () => {
      const mockRecords: any[] = [
        { getId: () => '1', feature: {} },
        { getId: () => '2', feature: {} }
      ]
      
      const graphicsUtils = require('../src/runtime/graphics-layer-utils')
      
      await selectRecordsInDataSources(
        mockOutputDS,
        ['1', '2'],
        mockRecords,
        true, // useGraphicsLayer
        mockGraphicsLayer,
        mockMapView
      )
      
      expect(graphicsUtils.clearGraphicsLayer).toHaveBeenCalledWith(mockGraphicsLayer)
      expect(graphicsUtils.addHighlightGraphics).toHaveBeenCalledWith(
        mockGraphicsLayer,
        mockRecords,
        mockMapView
      )
    })
    
    it('should skip origin DS selection if skipOriginDSSelection flag is true', async () => {
      const mockRecords: any[] = [
        { getId: () => '1', feature: {} },
        { getId: () => '2', feature: {} }
      ]
      
      await selectRecordsInDataSources(
        mockOutputDS,
        ['1', '2'],
        mockRecords,
        true, // useGraphicsLayer
        mockGraphicsLayer,
        mockMapView,
        true  // skipOriginDSSelection
      )
      
      expect(mockOriginDS.selectRecordsByIds).not.toHaveBeenCalled()
      expect(mockOutputDS.selectRecordsByIds).toHaveBeenCalled()
    })
  })
  
  describe('publishSelectionMessage', () => {
    it('should publish message for origin DS', () => {
      const mockRecords: any[] = [{ getId: () => '1' }]
      
      publishSelectionMessage('widget_1', mockRecords, mockOutputDS)
      
      const messageManager = MessageManager.getInstance()
      expect(messageManager.publishMessage).toHaveBeenCalledTimes(1)
      expect(DataRecordsSelectionChangeMessage).toHaveBeenCalledWith(
        'widget_1',
        mockRecords,
        [mockOriginDS.id]
      )
    })
    
    it('should also publish to outputDS if alsoPublishToOutputDS is true', () => {
      const mockRecords: any[] = [{ getId: () => '1' }]
      
      publishSelectionMessage('widget_1', mockRecords, mockOutputDS, true)
      
      const messageManager = MessageManager.getInstance()
      expect(messageManager.publishMessage).toHaveBeenCalledTimes(2)
    })
    
    it('should return early if no outputDS', () => {
      publishSelectionMessage('widget_1', [], null)
      
      const messageManager = MessageManager.getInstance()
      expect(messageManager.publishMessage).not.toHaveBeenCalled()
    })
  })
  
  describe('selectRecordsAndPublish', () => {
    it('should select records and publish message', async () => {
      const mockRecords: any[] = [
        { getId: () => '1', feature: {} },
        { getId: () => '2', feature: {} }
      ]
      
      await selectRecordsAndPublish(
        'widget_1',
        mockOutputDS,
        ['1', '2'],
        mockRecords
      )
      
      expect(mockOriginDS.selectRecordsByIds).toHaveBeenCalled()
      expect(mockOutputDS.selectRecordsByIds).toHaveBeenCalled()
      
      const messageManager = MessageManager.getInstance()
      expect(messageManager.publishMessage).toHaveBeenCalled()
    })
  })
  
  describe('clearSelectionInDataSources', () => {
    it('should clear graphics layer if using graphics layer mode', async () => {
      const graphicsUtils = require('../src/runtime/graphics-layer-utils')
      
      await clearSelectionInDataSources(
        'widget_1',
        mockOutputDS,
        true,
        mockGraphicsLayer
      )
      
      expect(graphicsUtils.clearGraphicsLayer).toHaveBeenCalledWith(mockGraphicsLayer)
    })
    
    it('should clear selection in data sources', async () => {
      await clearSelectionInDataSources('widget_1', mockOutputDS)
      
      expect(mockOriginDS.selectRecordsByIds).toHaveBeenCalledWith([], undefined)
      expect(mockOutputDS.selectRecordsByIds).toHaveBeenCalledWith([], undefined)
    })
    
    it('should publish empty selection message', async () => {
      await clearSelectionInDataSources('widget_1', mockOutputDS)
      
      const messageManager = MessageManager.getInstance()
      expect(messageManager.publishMessage).toHaveBeenCalled()
    })
    
    it('should clear data_s parameter from hash', async () => {
      window.location.hash = '#pin=123&data_s=456'
      
      await clearSelectionInDataSources('widget_1', mockOutputDS)
      
      expect(window.history.replaceState).toHaveBeenCalledWith(
        null,
        '',
        expect.stringContaining('#pin=123')
      )
    })
  })
  
  describe('dispatchSelectionEvent', () => {
    it('should dispatch selection event with event manager', () => {
      const mockEventManager: any = {
        dispatchSelectionEvent: jest.fn()
      }
      
      dispatchSelectionEvent(
        'widget_1',
        ['1', '2'],
        mockOutputDS,
        'q1',
        mockEventManager,
        5
      )
      
      expect(mockEventManager.dispatchSelectionEvent).toHaveBeenCalledWith(
        'widget_1',
        ['1', '2'],
        mockOriginDS.id,
        mockOutputDS.id,
        'q1',
        5
      )
    })
    
    it('should do nothing if no event manager provided', () => {
      dispatchSelectionEvent(
        'widget_1',
        ['1', '2'],
        mockOutputDS,
        'q1',
        undefined,
        5
      )
      
      // Should not throw
    })
  })
  
  describe('clearAllSelectionsForWidget', () => {
    it('should exit early if no outputDS', async () => {
      await clearAllSelectionsForWidget({
        widgetId: 'widget_1',
        outputDS: null,
        useGraphicsLayer: false
      })
      
      // Should not throw
    })
    
    it('should clear selections in all origin data sources', async () => {
      const dsManager = DataSourceManager.getInstance()
      ;(dsManager.getDataSources as jest.Mock).mockReturnValue({
        'widget_1_output_q1': mockOutputDS,
        'widget_1_output_q2': {
          id: 'widget_1_output_q2',
          getOriginDataSources: jest.fn().mockReturnValue([mockOriginDS])
        },
        'other_widget_output': {
          id: 'other_widget_output'
        }
      })
      
      await clearAllSelectionsForWidget({
        widgetId: 'widget_1',
        outputDS: mockOutputDS,
        useGraphicsLayer: false
      })
      
      expect(mockOriginDS.selectRecordsByIds).toHaveBeenCalledWith([], undefined)
    })
    
    it('should cleanup graphics layer if using graphics layer mode', async () => {
      const graphicsUtils = require('../src/runtime/graphics-layer-utils')
      
      await clearAllSelectionsForWidget({
        widgetId: 'widget_1',
        outputDS: mockOutputDS,
        useGraphicsLayer: true,
        graphicsLayer: mockGraphicsLayer,
        mapView: mockMapView
      })
      
      expect(graphicsUtils.cleanupGraphicsLayer).toHaveBeenCalledWith('widget_1', mockMapView)
    })
    
    it('should close popup if visible', async () => {
      mockMapView.popup.visible = true
      
      await clearAllSelectionsForWidget({
        widgetId: 'widget_1',
        outputDS: mockOutputDS,
        useGraphicsLayer: false,
        mapView: mockMapView
      })
      
      expect(mockMapView.popup.close).toHaveBeenCalled()
    })
    
    it('should dispatch empty selection event', async () => {
      const mockEventManager: any = {
        dispatchSelectionEvent: jest.fn()
      }
      
      await clearAllSelectionsForWidget({
        widgetId: 'widget_1',
        outputDS: mockOutputDS,
        useGraphicsLayer: false,
        eventManager: mockEventManager,
        queryItemConfigId: 'q1'
      })
      
      expect(mockEventManager.dispatchSelectionEvent).toHaveBeenCalledWith(
        'widget_1',
        [],
        mockOriginDS.id,
        mockOutputDS.id,
        'q1',
        0
      )
    })
    
    it('should destroy all output data sources if destroyOutputDataSources is true', async () => {
      mockGetDataSources.mockReturnValue({
        'widget_1_output_q1': mockOutputDS,
        'widget_1_output_q2': {
          id: 'widget_1_output_q2',
          getOriginDataSources: jest.fn().mockReturnValue([mockOriginDS])
        }
      })
      
      await clearAllSelectionsForWidget({
        widgetId: 'widget_1',
        outputDS: mockOutputDS,
        useGraphicsLayer: false,
        destroyOutputDataSources: true
      })
      
      expect(mockDestroyDataSource).toHaveBeenCalledWith('widget_1_output_q1')
      expect(mockDestroyDataSource).toHaveBeenCalledWith('widget_1_output_q2')
    })
    
    it('should clear source records if not destroying data sources', async () => {
      await clearAllSelectionsForWidget({
        widgetId: 'widget_1',
        outputDS: mockOutputDS,
        useGraphicsLayer: false,
        destroyOutputDataSources: false
      })
      
      expect(mockOutputDS.clearSourceRecords).toHaveBeenCalled()
    })
    
    it('should publish data cleared message', async () => {
      await clearAllSelectionsForWidget({
        widgetId: 'widget_1',
        outputDS: mockOutputDS,
        useGraphicsLayer: false
      })
      
      const messageManager = MessageManager.getInstance()
      expect(messageManager.publishMessage).toHaveBeenCalled()
      expect(DataRecordSetChangeMessage).toHaveBeenCalledWith(
        'widget_1',
        RecordSetChangeType.Remove,
        [mockOutputDS.id]
      )
    })
  })
})
