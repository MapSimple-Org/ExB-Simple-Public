// Mock shared-code/mapsimple-common
const mockDebugLogger = { log: jest.fn() }
jest.mock('widgets/shared-code/mapsimple-common', () => ({
  createQuerySimpleDebugLogger: () => mockDebugLogger
}))

// Minimal jimu-core mock (WidgetVisibilityManager only needs type imports)
jest.mock('jimu-core', () => ({}))

// Minimal config mock (matches use-widget-visibility.ts import path relative to source)
jest.mock('../src/config', () => ({}))

// Mock IntersectionObserver (not available in jsdom)
let intersectionCallback: IntersectionObserverCallback | null = null
const mockDisconnect = jest.fn()
const mockObserve = jest.fn()

class MockIntersectionObserver {
  constructor(callback: IntersectionObserverCallback) {
    intersectionCallback = callback
  }
  observe = mockObserve
  unobserve = jest.fn()
  disconnect = mockDisconnect
}

;(global as any).IntersectionObserver = MockIntersectionObserver

import { WidgetVisibilityManager } from '../src/runtime/managers/widget-visibility-manager'

describe('WidgetVisibilityManager', () => {
  let manager: WidgetVisibilityManager
  let dispatchEventSpy: jest.SpyInstance

  beforeEach(() => {
    manager = new WidgetVisibilityManager()
    dispatchEventSpy = jest.spyOn(window, 'dispatchEvent')
    mockDebugLogger.log.mockClear()
    mockDisconnect.mockClear()
    mockObserve.mockClear()
    intersectionCallback = null
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    manager.cleanup()
    dispatchEventSpy.mockRestore()
  })

  describe('observer self-disconnect (r024.112)', () => {
    it('should disconnect observer after first visibility change', () => {
      const element = document.createElement('div')
      document.body.appendChild(element)

      const mockProps = { id: 'widget_1', config: {} } as any
      const mockCallbacks = { onVisibilityChange: jest.fn() }
      const mockOnStateChange = jest.fn()

      manager.setup(element, mockProps, mockCallbacks, mockOnStateChange)

      // Advance past the 100ms setup timeout
      jest.advanceTimersByTime(100)

      // Observer should be created and observing
      expect(mockObserve).toHaveBeenCalledWith(element)
      expect(intersectionCallback).not.toBeNull()

      // Simulate first visibility (isIntersecting = true)
      intersectionCallback!(
        [{ isIntersecting: true, intersectionRatio: 1.0 }] as any,
        {} as any
      )

      // After first open, observer should self-disconnect
      expect(mockDisconnect).toHaveBeenCalled()
      expect((manager as any).visibilityObserver).toBeNull()

      // Callback should have been called
      expect(mockOnStateChange).toHaveBeenCalledWith(true)

      document.body.removeChild(element)
    })
  })

  describe('notifyMount', () => {
    it('should dispatch querysimple-widget-state-changed event with isOpen: true', () => {
      manager.notifyMount('widget_1')

      expect(dispatchEventSpy).toHaveBeenCalledTimes(1)
      const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent
      expect(event.type).toBe('querysimple-widget-state-changed')
      expect(event.detail).toEqual({
        widgetId: 'widget_1',
        isOpen: true
      })
      expect(event.bubbles).toBe(true)
    })
  })

  describe('notifyUnmount', () => {
    it('should dispatch querysimple-widget-state-changed event with isOpen: false', () => {
      manager.notifyUnmount('widget_1')

      expect(dispatchEventSpy).toHaveBeenCalledTimes(1)
      const event = dispatchEventSpy.mock.calls[0][0] as CustomEvent
      expect(event.type).toBe('querysimple-widget-state-changed')
      expect(event.detail).toEqual({
        widgetId: 'widget_1',
        isOpen: false
      })
      expect(event.bubbles).toBe(true)
    })
  })
})
