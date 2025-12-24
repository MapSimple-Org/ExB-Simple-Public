import { type AllWidgetProps } from 'jimu-core'
import { type IMConfig } from '../../config'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()

/**
 * Custom event name for QuerySimple to notify HelperSimple of widget open/close state.
 */
const QUERYSIMPLE_WIDGET_STATE_EVENT = 'querysimple-widget-state-changed'

interface VisibilityCallbacks {
  onVisibilityChange?: (isVisible: boolean) => void
}

/**
 * Utility to manage widget panel visibility detection and HelperSimple notification.
 * 
 * Uses IntersectionObserver for efficient DOM-level visibility tracking.
 * Falls back to periodic checking if IntersectionObserver is not available.
 * 
 * Part of Chunk 2: Widget Visibility Engine extraction.
 * 
 * Note: This is a utility class (not a hook) to work with class components.
 */
export class WidgetVisibilityManager {
  private visibilityObserver: IntersectionObserver | null = null
  private visibilityCheckInterval: number | null = null
  private isPanelVisible: boolean = false
  private widgetElement: HTMLElement | null = null

  /**
   * Checks if the widget element is currently visible.
   * Fallback method when IntersectionObserver is not available.
   */
  private checkVisibility(): boolean {
    if (!this.widgetElement) return false
    
    const element = this.widgetElement
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
   * Notifies HelperSimple of panel visibility state changes.
   */
  private notifyHelperSimpleOfPanelState(isVisible: boolean, widgetId: string): void {
    const event = new CustomEvent(QUERYSIMPLE_WIDGET_STATE_EVENT, {
      detail: {
        widgetId,
        isOpen: isVisible
      },
      bubbles: true,
      cancelable: true
    })
    window.dispatchEvent(event)
    
    debugLogger.log('WIDGET-STATE', {
      event: isVisible ? 'panel-opened' : 'panel-closed',
      widgetId,
      isVisible,
      method: 'notifyHelperSimpleOfPanelState',
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Logs visibility state changes and calls callbacks.
   */
  private logVisibilityChange(
    isVisible: boolean,
    method: string,
    widgetId: string,
    callbacks: VisibilityCallbacks
  ): void {
    debugLogger.log('WIDGET-STATE', {
      event: isVisible ? 'panel-opened' : 'panel-closed',
      widgetId,
      isVisible,
      method,
      timestamp: new Date().toISOString()
    })
    
    // Notify HelperSimple
    this.notifyHelperSimpleOfPanelState(isVisible, widgetId)
    
    // Call optional callback
    if (callbacks.onVisibilityChange) {
      callbacks.onVisibilityChange(isVisible)
    }
  }

  /**
   * Sets up visibility detection.
   */
  setup(
    widgetElement: HTMLElement,
    props: AllWidgetProps<IMConfig>,
    callbacks: VisibilityCallbacks,
    onVisibilityStateChange: (isVisible: boolean) => void
  ): void {
    const { id } = props
    this.widgetElement = widgetElement

    // Wait for next tick to ensure element is ready
    setTimeout(() => {
      if (!this.widgetElement) {
        debugLogger.log('WIDGET-STATE', {
          event: 'visibility-detection-setup-failed',
          widgetId: id,
          reason: 'widget-element-not-available'
        })
        return
      }

      const element = this.widgetElement

      // Method 1: IntersectionObserver (most efficient)
      if ('IntersectionObserver' in window) {
        this.visibilityObserver = new IntersectionObserver(
          (entries) => {
            const entry = entries[0]
            const isVisible = entry.isIntersecting && entry.intersectionRatio > 0
            
            // Only update if state changed
            if (this.isPanelVisible !== isVisible) {
              this.isPanelVisible = isVisible
              this.logVisibilityChange(isVisible, 'IntersectionObserver', id, callbacks)
              onVisibilityStateChange(isVisible)
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
          widgetId: id,
          method: 'IntersectionObserver'
        })
      } else {
        // Method 2: Fallback to periodic checking
        this.visibilityCheckInterval = window.setInterval(() => {
          const isVisible = this.checkVisibility()
          if (this.isPanelVisible !== isVisible) {
            this.isPanelVisible = isVisible
            this.logVisibilityChange(isVisible, 'periodic-check', id, callbacks)
            onVisibilityStateChange(isVisible)
          }
        }, 250) // Check every 250ms
        
        debugLogger.log('WIDGET-STATE', {
          event: 'visibility-detection-setup',
          widgetId: id,
          method: 'periodic-check'
        })
      }
    }, 100)
  }

  /**
   * Cleans up visibility detection observers/intervals.
   */
  cleanup(): void {
    // Clean up IntersectionObserver
    if (this.visibilityObserver) {
      this.visibilityObserver.disconnect()
      this.visibilityObserver = null
    }
    
    // Clean up interval
    if (this.visibilityCheckInterval !== null) {
      clearInterval(this.visibilityCheckInterval)
      this.visibilityCheckInterval = null
    }
    
    this.widgetElement = null
  }

  /**
   * Gets current visibility state.
   */
  getIsPanelVisible(): boolean {
    return this.isPanelVisible
  }

  /**
   * Notifies HelperSimple on mount.
   */
  notifyMount(widgetId: string): void {
    const openEvent = new CustomEvent(QUERYSIMPLE_WIDGET_STATE_EVENT, {
      detail: {
        widgetId,
        isOpen: true
      },
      bubbles: true,
      cancelable: true
    })
    window.dispatchEvent(openEvent)
    
    debugLogger.log('WIDGET-STATE', {
      event: 'widget-mounted',
      widgetId,
      timestamp: new Date().toISOString()
    })
  }

  /**
   * Notifies HelperSimple on unmount.
   */
  notifyUnmount(widgetId: string): void {
    const closeEvent = new CustomEvent(QUERYSIMPLE_WIDGET_STATE_EVENT, {
      detail: {
        widgetId,
        isOpen: false
      },
      bubbles: true,
      cancelable: true
    })
    window.dispatchEvent(closeEvent)
    
    debugLogger.log('WIDGET-STATE', {
      event: 'widget-unmounted',
      widgetId,
      timestamp: new Date().toISOString()
    })
  }
}
