import { UrlConsumptionManager } from '../src/runtime/hooks/use-url-consumption'
import { SelectionType } from '../src/config'

// Mock shared-code/mapsimple-common
jest.mock('widgets/shared-code/mapsimple-common', () => ({
  createQuerySimpleDebugLogger: () => ({
    log: jest.fn()
  })
}))

describe('use-url-consumption unit tests', () => {
  let manager: UrlConsumptionManager
  let mockProps: any
  let callbacks: any
  let originalLocation: Location
  
  beforeEach(() => {
    manager = new UrlConsumptionManager()
    
    // Save original location
    originalLocation = window.location
    
    // Mock window.location
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
    
    // Mock window.history.replaceState
    window.history.replaceState = jest.fn()
    
    mockProps = {
      id: 'widget_1',
      config: {
        queryItems: [
          { configId: 'q1', shortId: 'pin' },
          { configId: 'q2', shortId: 'parcel' }
        ]
      }
    }
    
    callbacks = {
      onInitialValueFound: jest.fn(),
      onModeResetNeeded: jest.fn()
    }
  })
  
  afterEach(() => {
    // Restore original location
    window.location = originalLocation
  })
  
  describe('checkUrlParameters', () => {
    it('should exit early if no query items configured', () => {
      mockProps.config.queryItems = []
      manager.checkUrlParameters(mockProps, SelectionType.NewSelection, callbacks)
      
      expect(callbacks.onInitialValueFound).not.toHaveBeenCalled()
    })
    
    it('should exit early if no shortIds configured', () => {
      mockProps.config.queryItems = [{ configId: 'q1', shortId: '' }]
      manager.checkUrlParameters(mockProps, SelectionType.NewSelection, callbacks)
      
      expect(callbacks.onInitialValueFound).not.toHaveBeenCalled()
    })
    
    it('should detect hash parameter and call callback with value', () => {
      window.location.hash = '#pin=2223059013'
      manager.checkUrlParameters(mockProps, SelectionType.NewSelection, callbacks)
      
      expect(callbacks.onInitialValueFound).toHaveBeenCalledWith({
        shortId: 'pin',
        value: '2223059013'
      })
    })
    
    it('should detect query string parameter if no hash match', () => {
      window.location.hash = ''
      window.location.search = 'pin=2223059013' // Note: search should not include leading ?
      manager.checkUrlParameters(mockProps, SelectionType.NewSelection, callbacks)
      
      expect(callbacks.onInitialValueFound).toHaveBeenCalledWith({
        shortId: 'pin',
        value: '2223059013'
      })
    })
    
    it('should prioritize hash parameter over query string', () => {
      window.location.hash = '#pin=111111'
      window.location.search = 'pin=222222' // Note: search should not include leading ?
      manager.checkUrlParameters(mockProps, SelectionType.NewSelection, callbacks)
      
      expect(callbacks.onInitialValueFound).toHaveBeenCalledWith({
        shortId: 'pin',
        value: '111111'
      })
    })
    
    it('should call onInitialValueFound with undefined if no match', () => {
      window.location.hash = '#other=value'
      window.location.search = ''
      manager.checkUrlParameters(mockProps, SelectionType.NewSelection, callbacks)
      
      expect(callbacks.onInitialValueFound).toHaveBeenCalledWith(undefined)
    })
    
    it('should skip if same shortId parameter already processed', () => {
      window.location.hash = '#pin=2223059013'
      
      // First call - should process
      manager.checkUrlParameters(mockProps, SelectionType.NewSelection, callbacks)
      expect(callbacks.onInitialValueFound).toHaveBeenCalledTimes(1)
      
      // Second call with same parameter - should skip
      manager.checkUrlParameters(mockProps, SelectionType.NewSelection, callbacks)
      expect(callbacks.onInitialValueFound).toHaveBeenCalledTimes(1)
    })
    
    it('should process different shortId parameter even if value is same', () => {
      window.location.hash = '#pin=123'
      manager.checkUrlParameters(mockProps, SelectionType.NewSelection, callbacks)
      expect(callbacks.onInitialValueFound).toHaveBeenCalledTimes(1)
      
      // Change to different shortId with same value
      window.location.hash = '#parcel=123'
      manager.checkUrlParameters(mockProps, SelectionType.NewSelection, callbacks)
      expect(callbacks.onInitialValueFound).toHaveBeenCalledTimes(2)
    })
    
    it('should call onModeResetNeeded if in accumulation mode', () => {
      window.location.hash = '#pin=2223059013'
      manager.checkUrlParameters(mockProps, SelectionType.AddToSelection, callbacks)
      
      expect(callbacks.onModeResetNeeded).toHaveBeenCalled()
      expect(callbacks.onInitialValueFound).toHaveBeenCalledWith({
        shortId: 'pin',
        value: '2223059013'
      })
    })
    
    it('should not call onModeResetNeeded if already in NewSelection mode', () => {
      window.location.hash = '#pin=2223059013'
      manager.checkUrlParameters(mockProps, SelectionType.NewSelection, callbacks)
      
      expect(callbacks.onModeResetNeeded).not.toHaveBeenCalled()
    })
    
    it('should prevent concurrent processing', () => {
      window.location.hash = '#pin=123'
      
      // Start first call (will set isProcessing = true)
      const callbacksSlow = {
        onInitialValueFound: jest.fn(() => {
          // While this is running, try to call again
          manager.checkUrlParameters(mockProps, SelectionType.NewSelection, callbacks)
        }),
        onModeResetNeeded: jest.fn()
      }
      
      manager.checkUrlParameters(mockProps, SelectionType.NewSelection, callbacksSlow)
      
      // Second call should be skipped (concurrent processing)
      expect(callbacks.onInitialValueFound).not.toHaveBeenCalled()
    })
    
    it('should match first configured shortId if multiple present', () => {
      window.location.hash = '#parcel=456&pin=123'
      manager.checkUrlParameters(mockProps, SelectionType.NewSelection, callbacks)
      
      // Should match 'pin' first because it's first in queryItems array
      expect(callbacks.onInitialValueFound).toHaveBeenCalledWith({
        shortId: 'pin',
        value: '123'
      })
    })
  })
  
  describe('removeHashParameter', () => {
    it('should remove hash parameter from URL', () => {
      window.location.hash = '#pin=2223059013&data_s=123'
      manager.removeHashParameter('pin', 'widget_1')
      
      // pathname is '' in mock, so expected path starts with /
      expect(window.history.replaceState).toHaveBeenCalledWith(
        null,
        '',
        expect.stringContaining('#data_s=123')
      )
    })
    
    it('should clear hash entirely if only one parameter', () => {
      window.location.hash = '#pin=2223059013'
      manager.removeHashParameter('pin', 'widget_1')
      
      // pathname is '' in mock, so expected path is just /
      expect(window.history.replaceState).toHaveBeenCalledWith(
        null,
        '',
        '/'
      )
    })
    
    it('should preserve other hash parameters', () => {
      window.location.hash = '#pin=123&other=456&data_s=789'
      manager.removeHashParameter('pin', 'widget_1')
      
      expect(window.history.replaceState).toHaveBeenCalledWith(
        null,
        '',
        expect.stringContaining('#other=456&data_s=789')
      )
    })
    
    it('should do nothing if shortId not in hash', () => {
      window.location.hash = '#other=123'
      manager.removeHashParameter('pin', 'widget_1')
      
      expect(window.history.replaceState).not.toHaveBeenCalled()
    })
    
    it('should do nothing if shortId is empty', () => {
      window.location.hash = '#pin=123'
      manager.removeHashParameter('', 'widget_1')
      
      expect(window.history.replaceState).not.toHaveBeenCalled()
    })
    
    it('should preserve query string when removing hash', () => {
      window.location.hash = '#pin=123'
      window.location.search = '?foo=bar'
      manager.removeHashParameter('pin', 'widget_1')
      
      // Query string should be empty after removing hash with no hash left
      expect(window.history.replaceState).toHaveBeenCalledWith(
        null,
        '',
        '/'
      )
    })
  })
  
  describe('cleanup', () => {
    it('should remove hashchange listener if present', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
      
      // Simulate hashChangeHandler being set
      ;(manager as any).hashChangeHandler = jest.fn()
      
      manager.cleanup()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('hashchange', expect.any(Function))
      expect((manager as any).hashChangeHandler).toBeNull()
      
      removeEventListenerSpy.mockRestore()
    })
    
    it('should do nothing if no hashchange listener', () => {
      const removeEventListenerSpy = jest.spyOn(window, 'removeEventListener')
      
      manager.cleanup()
      
      expect(removeEventListenerSpy).not.toHaveBeenCalled()
      
      removeEventListenerSpy.mockRestore()
    })
  })
})
