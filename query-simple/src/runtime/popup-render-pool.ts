/**
 * PopupRenderPool - r024.46
 * 
 * Manages a pool of ESRI Feature widgets to pre-render popup content.
 * Instead of creating 160 Feature widgets (one per result), we use a pool
 * of 10 that process records in parallel via a queue pattern.
 * 
 * This bounds the ObservationHandle leak to ~10 widgets instead of 160+.
 * 
 * The rendered HTML is extracted with shadow DOM flattening and Calcite
 * tag renaming to prevent web component re-instantiation.
 */

import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { type DataSource, type FeatureDataRecord } from 'jimu-core'
import { createQuerySimpleDebugLogger, substituteTokens, convertTemplateToHtml } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createQuerySimpleDebugLogger()

// Calcite tag to flat class mapping
// When we extract HTML, we rename calcite-* tags to divs with these classes
// This prevents the browser from instantiating new web components
const CALCITE_TAG_MAP: Record<string, string> = {
  'calcite-icon': 'f-flat-icon',
  'calcite-action': 'f-flat-action',
  'calcite-action-bar': 'f-flat-action-bar',
  'calcite-action-group': 'f-flat-action-group',
  'calcite-list': 'f-flat-list',
  'calcite-list-item': 'f-flat-list-item',
  'calcite-list-item-group': 'f-flat-list-item-group',
  'calcite-link': 'f-flat-link',
  'calcite-button': 'f-flat-button',
  'calcite-value-list': 'f-flat-value-list',
  'calcite-value-list-item': 'f-flat-value-list-item',
  'calcite-panel': 'f-flat-panel',
  'calcite-block': 'f-flat-block',
  'calcite-card': 'f-flat-card',
  'calcite-chip': 'f-flat-chip',
  'calcite-label': 'f-flat-label',
  'calcite-notice': 'f-flat-notice',
  'calcite-loader': 'f-flat-loader',
}

interface QueueItem {
  record: FeatureDataRecord
  popupTemplate: __esri.PopupTemplate
  defaultPopupTemplate: __esri.PopupTemplate
  isCustomTemplate?: boolean // r026.002: Flag for our own {{field}} substitution
}

interface FeatureWorker {
  id: number
  feature: __esri.Feature
  container: HTMLDivElement
  busy: boolean
}

interface PoolConfig {
  poolSize?: number
  onRecordRendered: (recordId: string, html: string) => void
  onAllComplete?: () => void
  onError?: (recordId: string, error: Error) => void
}

/**
 * Recursively flattens shadow DOM content into light DOM.
 * This captures the rendered content (including SVGs from calcite-icon)
 * so it can be serialized as static HTML.
 */
function flattenShadowRoots(element: Element): void {
  // Process children first (depth-first)
  const children = Array.from(element.children)
  children.forEach(child => flattenShadowRoots(child))
  
  // If this element has a shadow root, inline its content
  if (element.shadowRoot) {
    try {
      // Get the shadow DOM's innerHTML
      const shadowContent = element.shadowRoot.innerHTML
      // Replace the element's content with the shadow content
      element.innerHTML = shadowContent
      // Recursively flatten any nested shadow roots in the new content
      Array.from(element.children).forEach(child => flattenShadowRoots(child))
    } catch (e) {
      // Some shadow roots may be closed or inaccessible
      debugLogger.log('TASK', {
        event: 'flatten-shadow-error',
        tagName: element.tagName,
        error: e instanceof Error ? e.message : String(e)
      })
    }
  }
}

/**
 * Renames Calcite custom element tags to divs with specific classes.
 * This prevents the browser from instantiating new web components
 * when the HTML is injected elsewhere.
 */
function renameCalciteTags(html: string): string {
  let result = html
  
  for (const [calciteTag, flatClass] of Object.entries(CALCITE_TAG_MAP)) {
    // Replace opening tags: <calcite-icon ...> → <div class="f-flat-icon" ...>
    // Preserve all attributes by capturing them
    const openingTagRegex = new RegExp(`<${calciteTag}([^>]*)>`, 'gi')
    result = result.replace(openingTagRegex, (match, attrs) => {
      // Check if there's already a class attribute
      if (/class\s*=/.test(attrs)) {
        // Append to existing class
        attrs = attrs.replace(/class\s*=\s*["']([^"']*)["']/, `class="$1 ${flatClass}"`)
      } else {
        // Add new class attribute
        attrs = ` class="${flatClass}"${attrs}`
      }
      return `<div${attrs}>`
    })
    
    // Replace closing tags: </calcite-icon> → </div>
    const closingTagRegex = new RegExp(`</${calciteTag}>`, 'gi')
    result = result.replace(closingTagRegex, '</div>')
  }
  
  return result
}

/**
 * Extracts static HTML from a Feature widget container.
 * r024.56: Simplified - just get innerHTML directly without shadow DOM manipulation.
 * The Feature widget renders to light DOM, shadow flattening was destroying content.
 */
function extractStaticHTML(container: HTMLElement): string {
  // Just get the innerHTML directly - Feature widget content is in light DOM
  const html = container.innerHTML
  
  // r024.66: Enhanced diagnostic - check what's actually in the DOM
  const featureContent = container.querySelector('.esri-feature__content-element')
  const fieldsTable = container.querySelector('.esri-feature__fields')
  const fieldRows = container.querySelectorAll('.esri-feature__field-data')
  const nonEmptyValues = Array.from(fieldRows).filter(row => row.textContent?.trim()).length
  
  debugLogger.log('TASK', {
    event: 'extract-static-html',
    htmlLength: html.length,
    hasFeatureContent: !!featureContent,
    hasFieldsTable: !!fieldsTable,
    totalFieldRows: fieldRows.length,
    nonEmptyValueCount: nonEmptyValues,
    htmlPreview: html.substring(0, 300),
    timestamp: Date.now()
  })
  
  return html
}

/**
 * Waits for a Feature widget to finish rendering.
 * r024.57: Check for actual content in DOM, not just viewModel state.
 */
async function waitForFeatureReady(feature: __esri.Feature, container: HTMLElement, timeoutMs: number = 5000): Promise<boolean> {
  const startTime = Date.now()
  
  return new Promise((resolve) => {
    const check = () => {
      // Check timeout first
      if (Date.now() - startTime > timeoutMs) {
        debugLogger.log('TASK', {
          event: 'feature-ready-timeout',
          elapsed: Date.now() - startTime,
          timeoutMs,
          hasContent: container.querySelector('.esri-feature__text, .esri-feature__fields') !== null
        })
        resolve(false)
        return
      }
      
      // Check if viewModel is done loading
      const viewModelReady = !feature.viewModel?.waitingForContent
      
      // Check if actual content is in the DOM (not just spinner)
      const hasContent = container.querySelector('.esri-feature__text, .esri-feature__fields, .esri-feature__media') !== null
      
      if (viewModelReady && hasContent) {
        resolve(true)
        return
      }
      
      // Check again after a short delay
      setTimeout(check, 100)
    }
    
    check()
  })
}

export class PopupRenderPool {
  private workers: FeatureWorker[] = []
  private queue: QueueItem[] = []
  private isProcessing: boolean = false
  private isInitialized: boolean = false
  private poolContainer: HTMLDivElement | null = null
  private FeatureClass: typeof __esri.Feature | null = null
  private config: PoolConfig
  private dataSource: DataSource | null = null
  private mapView: __esri.MapView | __esri.SceneView | null = null
  private processedCount: number = 0
  private totalCount: number = 0

  constructor(config: PoolConfig) {
    this.config = {
      poolSize: 5, // r024.65: Reduced - too many concurrent causes contention
      ...config
    }
  }

  /**
   * Initialize the pool with Feature widgets.
   * Creates a hidden container and the specified number of Feature widget workers.
   */
  async initialize(
    mapView: __esri.MapView | __esri.SceneView,
    dataSource: DataSource
  ): Promise<void> {
    if (this.isInitialized) {
      return
    }

    this.mapView = mapView
    this.dataSource = dataSource

    debugLogger.log('TASK', {
      event: 'popup-render-pool-initializing',
      poolSize: this.config.poolSize,
      timestamp: Date.now()
    })

    // Load the Feature widget module
    const [Feature] = await loadArcGISJSAPIModules(['esri/widgets/Feature'])
    this.FeatureClass = Feature

    // Create an off-screen container for the pool
    // r024.64: Removed visibility:hidden - it can prevent ESRI widgets from fully rendering
    this.poolContainer = document.createElement('div')
    this.poolContainer.id = 'popup-render-pool-container'
    this.poolContainer.style.cssText = 'position: absolute; left: -9999px; top: -9999px; width: 400px;'
    document.body.appendChild(this.poolContainer)

    // Get data source info for Feature widget initialization
    const originDS = dataSource.getOriginDataSources()
    const rootDataSource = originDS?.[0]?.getRootDataSource()

    // Create worker Feature widgets
    for (let i = 0; i < this.config.poolSize!; i++) {
      const container = document.createElement('div')
      container.id = `popup-render-worker-${i}`
      container.className = 'popup-render-worker'
      this.poolContainer.appendChild(container)

      const feature = new this.FeatureClass({
        container,
        defaultPopupTemplateEnabled: true,
        // @ts-expect-error - spatialReference may not be in types
        spatialReference: dataSource?.layer?.spatialReference || null,
        // @ts-expect-error - map property
        map: rootDataSource?.map || null,
        visibleElements: {
          title: true,
          content: {
            fields: true,
            text: true,
            media: true,
            attachments: true
          },
          lastEditedInfo: false
        }
      })

      this.workers.push({
        id: i,
        feature,
        container,
        busy: false
      })
    }

    this.isInitialized = true

    debugLogger.log('TASK', {
      event: 'popup-render-pool-initialized',
      poolSize: this.workers.length,
      timestamp: Date.now()
    })
  }

  /**
   * Process a list of records through the pool.
   * Each record's popup content will be rendered and extracted as static HTML.
   */
  async processRecords(
    records: FeatureDataRecord[],
    popupTemplate: __esri.PopupTemplate,
    defaultPopupTemplate: __esri.PopupTemplate,
    isCustomTemplate?: boolean // r026.002: Flag for our own {{field}} substitution
  ): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('PopupRenderPool not initialized. Call initialize() first.')
    }

    // Reset counters
    this.processedCount = 0
    this.totalCount = records.length

    debugLogger.log('TASK', {
      event: 'popup-render-pool-processing-start',
      recordCount: records.length,
      poolSize: this.workers.length,
      isCustomTemplate: !!isCustomTemplate,
      timestamp: Date.now()
    })

    // Add all records to the queue
    this.queue = records.map(record => ({
      record,
      popupTemplate,
      defaultPopupTemplate,
      isCustomTemplate
    }))

    // Start all workers
    this.isProcessing = true
    const workerPromises = this.workers.map(worker => this.runWorker(worker))

    // Wait for all workers to complete
    await Promise.all(workerPromises)

    this.isProcessing = false

    debugLogger.log('TASK', {
      event: 'popup-render-pool-processing-complete',
      processedCount: this.processedCount,
      totalCount: this.totalCount,
      timestamp: Date.now()
    })

    this.config.onAllComplete?.()
  }

  /**
   * Worker loop - continuously processes records from the queue until empty.
   */
  private async runWorker(worker: FeatureWorker): Promise<void> {
    while (this.queue.length > 0 && this.isProcessing) {
      // Grab the next record from the queue
      const item = this.queue.shift()
      if (!item) break

      worker.busy = true

      try {
        const recordId = item.record.getId()
        const graphic = item.record.feature as __esri.Graphic
        const layer = graphic.layer as __esri.FeatureLayer

        // r024.66: DIAGNOSTIC - Log what the graphic actually contains
        const graphicAttributes = graphic.attributes || {}
        const attributeKeys = Object.keys(graphicAttributes)
        const sampleValues = attributeKeys.slice(0, 5).map(k => ({ key: k, value: graphicAttributes[k] }))
        
        debugLogger.log('TASK', {
          event: 'popup-render-diagnostic',
          workerId: worker.id,
          recordId,
          hasLayer: !!layer,
          layerId: layer?.id,
          hasPopupTemplate: !!item.popupTemplate,
          hasDefaultPopupTemplate: !!item.defaultPopupTemplate,
          layerPopupTemplate: !!layer?.popupTemplate,
          layerDefaultPopupTemplate: !!layer?.defaultPopupTemplate,
          attributeCount: attributeKeys.length,
          attributeKeys: attributeKeys.slice(0, 10),
          sampleValues,
          hasMap: !!this.mapView?.map,
          hasSpatialRef: !!this.dataSource?.layer?.spatialReference,
          timestamp: Date.now()
        })
        
        // r026.002: CustomTemplate mode — our own substitution, skip Esri Feature widget
        if (item.isCustomTemplate && item.popupTemplate?.content?.[0]?.type === 'text') {
          const rawTemplate = item.popupTemplate.content[0].text
          const attributes = graphic.attributes || {}

          // Our engine: substitute {{tokens}}, then convert markdown to HTML
          // Also handles legacy {field} tokens for un-migrated configs (graceful fallback)
          let substituted = substituteTokens(rawTemplate, attributes)
          substituted = substituted.replace(/(?<!\{)\{(\w+)\}(?!\})/g, (_m, field) => {
            const val = attributes[field]
            return val != null ? String(val) : ''
          })
          const html = convertTemplateToHtml(substituted)

          // Also substitute the title expression (with same legacy fallback)
          const titleTemplate = item.popupTemplate.title || ''
          let title = substituteTokens(titleTemplate, attributes)
          title = title.replace(/(?<!\{)\{(\w+)\}(?!\})/g, (_m, field) => {
            const val = attributes[field]
            return val != null ? String(val) : ''
          })

          debugLogger.log('TASK', {
            event: 'popup-render-custom-template',
            workerId: worker.id,
            recordId,
            templateLength: rawTemplate.length,
            htmlLength: html.length,
            timestamp: Date.now()
          })

          // Inject directly — no Esri Feature widget needed
          const titleHtml = title ? `<div class="esri-widget__heading">${title}</div>` : ''
          worker.container.innerHTML = `<div class="esri-feature">${titleHtml}<div class="esri-feature__text">${html}</div></div>`
          this.config.onRecordRendered(recordId, `${titleHtml}${html}`)
          worker.busy = false
          continue // Skip Feature widget creation
        }

        // r024.65: Destroy old Feature widget and create fresh one for each record
        if (worker.feature && !worker.feature.destroyed) {
          worker.feature.destroy()
        }
        worker.container.innerHTML = ''
        
        // Set up popupTemplate on graphic AND layer (matching feature-info.tsx)
        if (item.popupTemplate) {
          graphic.popupTemplate = item.popupTemplate
          if (layer && !layer.popupTemplate) {
            layer.popupTemplate = item.popupTemplate
          }
        } else if (item.defaultPopupTemplate) {
          graphic.popupTemplate = item.defaultPopupTemplate
          if (layer && !layer.popupTemplate) {
            layer.popupTemplate = item.defaultPopupTemplate
          }
        } else if (layer) {
          graphic.popupTemplate = layer.popupTemplate ?? layer.defaultPopupTemplate
        }
        
        // Create fresh Feature widget with the graphic
        const widgetContainer = document.createElement('div')
        widgetContainer.className = 'jimu-widget'
        worker.container.appendChild(widgetContainer)
        
        worker.feature = new this.FeatureClass({
          container: widgetContainer,
          defaultPopupTemplateEnabled: true,
          spatialReference: this.dataSource?.layer?.spatialReference || null,
          map: this.mapView?.map || null,
          graphic: graphic,
          visibleElements: {
            title: true,
            content: {
              fields: true,
              text: true,
              media: true,
              attachments: true
            },
            lastEditedInfo: false
          }
        })

        // Wait for the Feature widget to finish rendering
        const ready = await waitForFeatureReady(worker.feature, worker.container, 3000)

        if (!ready) {
          debugLogger.log('TASK', {
            event: 'popup-render-worker-timeout',
            workerId: worker.id,
            recordId,
            timestamp: Date.now()
          })
        }

        // r024.64: Reduced delay - 100ms should be enough after waitForFeatureReady
        await new Promise(resolve => setTimeout(resolve, 100))

        // Extract the static HTML
        let html = extractStaticHTML(worker.container)
        
        // r024.64: If HTML is too short, quick retry with shorter delay
        if (html.length < 100) {
          debugLogger.log('TASK', {
            event: 'popup-render-worker-retry',
            workerId: worker.id,
            recordId,
            initialHtmlLength: html.length,
            timestamp: Date.now()
          })
          await new Promise(resolve => setTimeout(resolve, 200))
          html = extractStaticHTML(worker.container)
        }

        // Notify callback
        this.config.onRecordRendered(recordId, html)

        this.processedCount++

        debugLogger.log('TASK', {
          event: 'popup-render-worker-processed',
          workerId: worker.id,
          recordId,
          progress: `${this.processedCount}/${this.totalCount}`,
          htmlLength: html.length,
          timestamp: Date.now()
        })

      } catch (error) {
        const recordId = item.record.getId()
        debugLogger.log('TASK', {
          event: 'popup-render-worker-error',
          workerId: worker.id,
          recordId,
          error: error instanceof Error ? error.message : String(error),
          timestamp: Date.now()
        })
        this.config.onError?.(recordId, error as Error)
      }

      worker.busy = false
    }
  }

  /**
   * Stop processing and clear the queue.
   */
  cancel(): void {
    this.isProcessing = false
    this.queue = []

    debugLogger.log('TASK', {
      event: 'popup-render-pool-cancelled',
      processedCount: this.processedCount,
      totalCount: this.totalCount,
      timestamp: Date.now()
    })
  }

  /**
   * Destroy the pool and clean up resources.
   * Only called when the widget unmounts.
   */
  destroy(): void {
    this.cancel()

    // Destroy all Feature widgets
    for (const worker of this.workers) {
      if (worker.feature && !worker.feature.destroyed) {
        worker.feature.destroy()
      }
    }
    this.workers = []

    // Remove the pool container from DOM
    if (this.poolContainer && this.poolContainer.parentNode) {
      this.poolContainer.parentNode.removeChild(this.poolContainer)
    }
    this.poolContainer = null

    this.isInitialized = false
    this.FeatureClass = null
    this.dataSource = null
    this.mapView = null

    debugLogger.log('TASK', {
      event: 'popup-render-pool-destroyed',
      timestamp: Date.now()
    })
  }

  /**
   * Get current pool status.
   */
  getStatus(): { initialized: boolean; processing: boolean; queueLength: number; processed: number; total: number } {
    return {
      initialized: this.isInitialized,
      processing: this.isProcessing,
      queueLength: this.queue.length,
      processed: this.processedCount,
      total: this.totalCount
    }
  }
}

// Export the extraction functions for potential reuse
export { extractStaticHTML, flattenShadowRoots, renameCalciteTags, CALCITE_TAG_MAP }
