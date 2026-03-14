/** @jsx jsx */
import {
  React, jsx, css,
  type AllWidgetProps,
  type DataSource,
  DataSourceComponent
} from 'jimu-core'
import Graphic from 'esri/Graphic'
import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'
import type { IMConfig } from '../config'
import type { FeedItem } from '../utils/parsers/interface'
import { versionManager } from '../version-manager'
import { WIDGET_VERSION } from '../version'
import { createFeedSimpleDebugLogger } from '../utils/debug-logger'
import { fetchFeed } from '../utils/feed-fetcher'
import { CustomXmlParser } from '../utils/parsers/custom-xml'
import { type FilterContext } from '../utils/token-renderer'
import FeedCard from './feed-card'
import { type RestGeometry } from '../utils/feature-join'
import {
  isMapIntegrationConfigured,
  inferGeometryType,
  buildGoToTarget,
  buildPanTarget,
  identifyFeatureOnMap,
  queryGeometries
} from '../utils/map-interaction'
import {
  isFeedMapLayerConfigured,
  createFeedFeatureLayer,
  syncFeedItemsToLayer,
  destroyFeedFeatureLayer,
  buildPopupTemplate,
  buildFieldMapping,
  zoomToFeedPoint,
  panToFeedPoint,
  getFeedLayerId
} from '../utils/feed-layer-manager'
import defaultMessages from './translations/default'

const debugLogger = createFeedSimpleDebugLogger()
const parser = new CustomXmlParser()

/** Minimum allowed polling interval in seconds */
const MIN_POLL_INTERVAL = 15

/** Duration (ms) for the highlight flash animation on new/changed items */
const HIGHLIGHT_DURATION_MS = 2000

/** After this many consecutive failures, double the polling interval */
const BACKOFF_THRESHOLD = 3

/** After this many consecutive failures, pause polling entirely */
const PAUSE_THRESHOLD = 6

interface State {
  items: FeedItem[]
  fieldNames: string[]
  isLoading: boolean
  error: string | null
  fetchError: string | null // non-blocking error shown as banner (preserves last good data)
  lastFetchTime: number | null
  /** IDs of items from the previous fetch cycle (for change detection) */
  previousItemIds: Set<string>
  /** IDs currently highlighted as new/changed */
  highlightedIds: Set<string>
  /** Number of consecutive fetch failures (for exponential backoff) */
  consecutiveFailures: number
  /** Whether polling has been paused due to repeated failures */
  pollPaused: boolean
  /** Cached geometries from feature service keyed by join field value */
  geometryMap: Map<string, RestGeometry>
  /** ID of the currently selected card (for visual indicator + toggle) */
  selectedItemId: string | null
  /** ID of the card currently showing "no geometry" info message (auto-clears after 3s) */
  noGeometryItemId: string | null
  /** Whether the scroll-to-top button should be visible */
  showScrollTop: boolean
}

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, State> {
  static versionManager = versionManager

  private pollTimerId: ReturnType<typeof setInterval> | null = null
  private highlightTimerId: ReturnType<typeof setTimeout> | null = null
  private noGeometryTimerId: ReturnType<typeof setTimeout> | null = null
  private handleVisibilityChange: (() => void) | null = null
  /** Cached join IDs from last geometry query — skip re-query when unchanged */
  private previousJoinIds: Set<string> = new Set()
  /** JSAPI MapView reference from JimuMapViewComponent — used for goTo and popup */
  private mapView: __esri.MapView | __esri.SceneView | null = null
  /** Auto-generated FeatureLayer from feed coordinates (if enabled) */
  private feedFeatureLayer: __esri.FeatureLayer | null = null
  /** Click handler for map-to-card sync on the feed layer */
  private feedLayerClickHandler: __esri.Handle | null = null

  constructor (props: AllWidgetProps<IMConfig>) {
    super(props)
    this.state = {
      items: [],
      fieldNames: [],
      isLoading: false,
      error: null,
      fetchError: null,
      lastFetchTime: null,
      previousItemIds: new Set<string>(),
      highlightedIds: new Set<string>(),
      consecutiveFailures: 0,
      pollPaused: false,
      geometryMap: new Map(),
      selectedItemId: null,
      noGeometryItemId: null,
      showScrollTop: false
    }
  }

  /** Ref for the scrollable card list container */
  private scrollContainerRef = React.createRef<HTMLDivElement>()

  getI18nMessage = (id: string): string => {
    return this.props.intl.formatMessage({ id, defaultMessage: defaultMessages[id] })
  }

  componentDidMount (): void {
    debugLogger.log('FETCH', { action: 'widget-mounted', version: WIDGET_VERSION })
    const { feedUrl } = this.props.config
    if (feedUrl) {
      this.loadFeed()
    }
    this.startPolling()
    this.setupVisibilityListener()
  }

  componentDidUpdate (prevProps: AllWidgetProps<IMConfig>): void {
    const prevUrl = prevProps.config.feedUrl
    const currUrl = this.props.config.feedUrl
    const prevInterval = prevProps.config.refreshInterval
    const currInterval = this.props.config.refreshInterval

    // Feed URL changed — reload immediately and restart polling
    if (prevUrl !== currUrl && currUrl) {
      this.loadFeed()
      this.startPolling()
    }

    // Interval changed — restart polling with new interval
    if (prevInterval !== currInterval) {
      this.startPolling()
    }

    // Feed map layer toggled off — destroy layer
    const prevFeedLayerEnabled = prevProps.config.enableFeedMapLayer
    const currFeedLayerEnabled = this.props.config.enableFeedMapLayer
    if (prevFeedLayerEnabled && !currFeedLayerEnabled) {
      this.cleanupFeedLayer()
    }
    // Feed map layer toggled on — create layer if we have items
    if (!prevFeedLayerEnabled && currFeedLayerEnabled && this.mapView && this.state.items.length > 0) {
      this.initFeedLayer(this.state.items, this.state.fieldNames)
    }

    // Feed map layer style config changed — recreate layer with new renderer
    if (this.feedFeatureLayer && currFeedLayerEnabled) {
      const styleFields = ['feedMapLayerColor', 'feedMapLayerSize', 'feedMapLayerMarkerStyle', 'feedMapLayerTitle'] as const
      const styleChanged = styleFields.some(f => prevProps.config[f] !== this.props.config[f])
      if (styleChanged) {
        this.cleanupFeedLayer()
        if (this.mapView && this.state.items.length > 0) {
          this.initFeedLayer(this.state.items, this.state.fieldNames)
        }
      }
    }

    // Spatial join DS changed — clear map integration state and re-query
    const prevDsId = (prevProps.useDataSources?.[0] as any)?.dataSourceId
    const currDsId = (this.props.useDataSources?.[0] as any)?.dataSourceId
    if (prevDsId !== currDsId) {
      this.previousJoinIds = new Set()
      this.setState({ geometryMap: new Map(), selectedItemId: null })
      if (currDsId && isMapIntegrationConfigured(this.props.useDataSources, this.props.config) && this.state.items.length > 0) {
        this.runQueryGeometries(this.state.items)
      }
    }
  }

  componentWillUnmount (): void {
    this.stopPolling()
    this.clearHighlightTimer()
    if (this.noGeometryTimerId) clearTimeout(this.noGeometryTimerId)
    this.teardownVisibilityListener()
    this.cleanupFeedLayer()
    debugLogger.log('POLL', { action: 'widget-unmounted' })
  }

  // ── Polling lifecycle ──────────────────────────────────────────

  /**
   * Starts (or restarts) the polling timer based on config.refreshInterval.
   * Clears any existing timer first. If interval is 0 or missing, no timer is set.
   * Applies exponential backoff when consecutiveFailures >= BACKOFF_THRESHOLD.
   * Does not start if polling is paused (>= PAUSE_THRESHOLD failures).
   */
  private startPolling (): void {
    this.stopPolling()

    if (this.state.pollPaused) {
      debugLogger.log('POLL', { action: 'poll-paused', reason: 'too many consecutive failures' })
      return
    }

    const intervalSec = this.props.config.refreshInterval
    if (!intervalSec || intervalSec <= 0) {
      debugLogger.log('POLL', { action: 'poll-disabled', reason: 'interval is 0 or unset' })
      return
    }

    let effectiveInterval = Math.max(intervalSec, MIN_POLL_INTERVAL)

    // Apply backoff: double the interval after BACKOFF_THRESHOLD failures
    const { consecutiveFailures } = this.state
    if (consecutiveFailures >= BACKOFF_THRESHOLD) {
      effectiveInterval = effectiveInterval * 2
      debugLogger.log('POLL', { action: 'backoff-applied', failures: consecutiveFailures, intervalSec: effectiveInterval })
    }

    const intervalMs = effectiveInterval * 1000

    debugLogger.log('POLL', { action: 'poll-start', intervalSec: effectiveInterval })
    this.pollTimerId = setInterval(() => {
      debugLogger.log('POLL', { action: 'poll-tick' })
      this.loadFeed()
    }, intervalMs)
  }

  /** Clears the polling timer if one is active. */
  private stopPolling (): void {
    if (this.pollTimerId !== null) {
      clearInterval(this.pollTimerId)
      this.pollTimerId = null
      debugLogger.log('POLL', { action: 'poll-stopped' })
    }
  }

  // ── Page Visibility API ────────────────────────────────────────

  /** Pause polling when tab is hidden, resume when visible. */
  private setupVisibilityListener (): void {
    this.handleVisibilityChange = (): void => {
      if (document.hidden) {
        debugLogger.log('POLL', { action: 'visibility-hidden', pausing: true })
        this.stopPolling()
      } else {
        debugLogger.log('POLL', { action: 'visibility-visible', resuming: true })
        // Fetch immediately on return, then restart timer
        if (this.props.config.feedUrl) {
          this.loadFeed()
        }
        this.startPolling()
      }
    }
    document.addEventListener('visibilitychange', this.handleVisibilityChange)
  }

  /** Remove the visibility listener. */
  private teardownVisibilityListener (): void {
    if (this.handleVisibilityChange) {
      document.removeEventListener('visibilitychange', this.handleVisibilityChange)
      this.handleVisibilityChange = null
    }
  }

  // ── Change Detection ─────────────────────────────────────────────

  /**
   * Generate a stable ID for a feed item.
   * Uses joinFieldFeed if configured, otherwise hashes all field values.
   */
  private getItemId (item: FeedItem): string {
    const { joinFieldFeed } = this.props.config
    if (joinFieldFeed && item[joinFieldFeed]) {
      return item[joinFieldFeed]
    }
    // Simple hash: concatenate all values with a delimiter
    return Object.values(item).join('|')
  }

  /**
   * Compare new items against previous IDs, return set of new/changed IDs.
   * Only called when highlightNewItems is enabled.
   */
  private detectChanges (newItems: FeedItem[]): Set<string> {
    const { previousItemIds } = this.state
    if (previousItemIds.size === 0) return new Set<string>()

    const changed = new Set<string>()
    for (const item of newItems) {
      const id = this.getItemId(item)
      if (!previousItemIds.has(id)) {
        changed.add(id)
      }
    }
    return changed
  }

  /** Clear the highlight auto-dismiss timer. */
  private clearHighlightTimer (): void {
    if (this.highlightTimerId !== null) {
      clearTimeout(this.highlightTimerId)
      this.highlightTimerId = null
    }
  }

  /**
   * Set highlighted IDs and schedule auto-clear after HIGHLIGHT_DURATION_MS.
   */
  private applyHighlights (ids: Set<string>): void {
    if (ids.size === 0) return

    this.clearHighlightTimer()
    this.setState({ highlightedIds: ids })

    debugLogger.log('RENDER', {
      action: 'highlight-new-items',
      count: ids.size,
      durationMs: HIGHLIGHT_DURATION_MS
    })

    this.highlightTimerId = setTimeout(() => {
      this.setState({ highlightedIds: new Set<string>() })
      this.highlightTimerId = null
    }, HIGHLIGHT_DURATION_MS)
  }

  // ── Map Integration ──────────────────────────────────────────────

  /** Callback when JimuMapViewComponent provides the active map view */
  private onActiveViewChange = (jimuMapView: JimuMapView | null): void => {
    // Clean up old feed layer if map view is changing
    if (this.feedFeatureLayer && this.mapView) {
      this.cleanupFeedLayer()
    }

    this.mapView = jimuMapView?.view ?? null
    debugLogger.log('JOIN', { action: 'map-view-changed', hasView: !!this.mapView })

    // Initialize feed map layer if configured and items are available
    if (this.mapView && isFeedMapLayerConfigured(this.props.config as any) && this.state.items.length > 0) {
      this.initFeedLayer(this.state.items, this.state.fieldNames)
    }
  }

  /** Callback when DataSourceComponent creates the origin (spatial join) DataSource instance */
  private onOriginDsCreated = (ds: DataSource): void => {
    debugLogger.log('JOIN', { action: 'origin-ds-created', dsId: ds.id })
    if (this.state.items.length > 0 && isMapIntegrationConfigured(this.props.useDataSources, this.props.config)) {
      this.runQueryGeometries(this.state.items)
    }
  }

  /**
   * Thin wrapper around the extracted queryGeometries utility.
   * Calls the pure function and applies results to widget state.
   */
  private async runQueryGeometries (items: FeedItem[]): Promise<void> {
    const { joinFieldFeed, joinFieldService } = this.props.config
    const dataSourceId = (this.props.useDataSources?.[0] as any)?.dataSourceId
    if (!joinFieldFeed || !joinFieldService || !dataSourceId) return

    const result = await queryGeometries({
      items,
      joinFieldFeed,
      joinFieldService,
      dataSourceId,
      mapView: this.mapView,
      previousJoinIds: this.previousJoinIds
    })

    if (!result.skipped) {
      this.previousJoinIds = result.newJoinIds
      this.setState({ geometryMap: result.geometryMap })
    }
  }

  // ── Feed Map Layer ──────────────────────────────────────────────

  /**
   * Initialize the client-side FeatureLayer from feed coordinates.
   * Called when mapView + items + config are all ready.
   */
  private async initFeedLayer (items: FeedItem[], fieldNames: string[]): Promise<void> {
    if (!this.mapView || this.feedFeatureLayer) return

    const config = this.props.config as any

    // Check if layer already exists on map (widget remount)
    const existingLayerId = getFeedLayerId(this.props.id)
    const existing = this.mapView.map.allLayers.find(l => l.id === existingLayerId)
    if (existing) {
      this.feedFeatureLayer = existing as __esri.FeatureLayer
      debugLogger.log('FEED-LAYER', { action: 'layer-reattached', layerId: existingLayerId })
    } else {
      this.feedFeatureLayer = createFeedFeatureLayer(this.props.id, config, fieldNames)
      this.mapView.map.add(this.feedFeatureLayer)
    }

    // Set popup template
    const filterCtx: FilterContext = {
      externalLinkTemplate: config.externalLinkTemplate,
      dateFormatString: config.dateFormatString
    }
    const fieldMapping = buildFieldMapping(fieldNames)
    this.feedFeatureLayer.popupTemplate = buildPopupTemplate(
      config, fieldNames, filterCtx, fieldMapping
    )

    // Sync items to the layer
    await syncFeedItemsToLayer(
      this.feedFeatureLayer,
      items,
      config,
      fieldNames,
      (item) => this.getItemId(item)
    )

    // Set up map-to-card click handler
    this.setupFeedLayerClickHandler()
  }

  /**
   * Sync feed items to the existing feed layer (called on each poll cycle).
   */
  private async syncFeedLayer (items: FeedItem[], fieldNames: string[]): Promise<void> {
    if (!this.feedFeatureLayer || !this.mapView) {
      // Layer not created yet — try to create it
      if (this.mapView && isFeedMapLayerConfigured(this.props.config as any)) {
        await this.initFeedLayer(items, fieldNames)
      }
      return
    }

    await syncFeedItemsToLayer(
      this.feedFeatureLayer,
      items,
      this.props.config as any,
      fieldNames,
      (item) => this.getItemId(item)
    )
  }

  /**
   * Listen for clicks on the feed layer to sync map → card selection.
   */
  /** Ensure the feed layer is visible (e.g. user turned it off in the layer list). */
  private ensureFeedLayerVisible (): void {
    if (this.feedFeatureLayer && !this.feedFeatureLayer.visible) {
      this.feedFeatureLayer.visible = true
      debugLogger.log('FEED-LAYER', { action: 'layer-visibility-restored' })
    }
  }

  private setupFeedLayerClickHandler (): void {
    if (!this.mapView || this.feedLayerClickHandler) return

    this.feedLayerClickHandler = this.mapView.on('click', async (event) => {
      if (!this.mapView || !this.feedFeatureLayer) return

      const response = await this.mapView.hitTest(event, {
        include: [this.feedFeatureLayer]
      })

      const results = response.results?.filter(
        (r: any) => r.type === 'graphic' && r.graphic?.layer?.id === this.feedFeatureLayer?.id
      )

      if (results && results.length > 0) {
        const graphic = (results[0] as any).graphic
        const feedItemId = graphic?.attributes?.FEED_ITEM_ID
        if (feedItemId) {
          this.setState({ selectedItemId: feedItemId })
          debugLogger.log('FEED-LAYER', { action: 'map-click-select', feedItemId })

          // Scroll the matching card into view
          requestAnimationFrame(() => {
            const cardEl = document.querySelector(`[data-feed-item-id="${feedItemId}"]`)
            if (cardEl) {
              cardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
            }
          })
        }
      }
    })
  }

  /**
   * Clean up feed layer and click handler.
   */
  private cleanupFeedLayer (): void {
    if (this.feedLayerClickHandler) {
      this.feedLayerClickHandler.remove()
      this.feedLayerClickHandler = null
    }
    if (this.feedFeatureLayer && this.mapView) {
      destroyFeedFeatureLayer(this.mapView, this.props.id)
      this.feedFeatureLayer = null
    }
  }

  // ── Filtering & Display ──────────────────────────────────────────

  /**
   * Applies filterByStatus and maxItems to the stored items.
   * Called in render() so config changes take effect without re-fetching.
   */
  private getDisplayItems (): FeedItem[] {
    const { statusField, filterByStatus, maxItems } = this.props.config
    let result = this.state.items

    // Filter out items whose status value is in the hide list
    if (statusField && filterByStatus && filterByStatus.length > 0) {
      result = result.filter(item => {
        const val = item[statusField]
        return !filterByStatus.includes(val)
      })
    }

    // Limit rendered items (0 = show all)
    if (maxItems && maxItems > 0) {
      result = result.slice(0, maxItems)
    }

    return result
  }

  // ── Sorting ─────────────────────────────────────────────────────

  /**
   * Sorts items by the configured sortField and sortDirection.
   * Attempts date parsing first, then numeric, then falls back to string comparison.
   * Returns items in original order if no sortField is configured.
   */
  private sortItems (items: FeedItem[]): FeedItem[] {
    const { sortField, sortDirection, reverseFeedOrder } = this.props.config
    if (!sortField) return reverseFeedOrder ? [...items].reverse() : items

    const dir = sortDirection === 'desc' ? -1 : 1

    return [...items].sort((a, b) => {
      const valA = a[sortField] ?? ''
      const valB = b[sortField] ?? ''

      // Try date parsing first
      const dateA = Date.parse(valA)
      const dateB = Date.parse(valB)
      if (!isNaN(dateA) && !isNaN(dateB)) {
        return (dateA - dateB) * dir
      }

      // Try numeric comparison
      const numA = Number(valA)
      const numB = Number(valB)
      if (!isNaN(numA) && !isNaN(numB) && valA !== '' && valB !== '') {
        return (numA - numB) * dir
      }

      // Fall back to case-insensitive string comparison
      return valA.localeCompare(valB, undefined, { sensitivity: 'base' }) * dir
    })
  }

  loadFeed = async (): Promise<void> => {
    const { feedUrl, rootItemElement } = this.props.config
    const hasExistingData = this.state.items.length > 0

    // If we already have data, don't show full loading state — just clear previous fetch error
    if (hasExistingData) {
      this.setState({ fetchError: null })
    } else {
      this.setState({ isLoading: true, error: null, fetchError: null })
    }

    debugLogger.log('FETCH', { action: 'fetch-start', url: feedUrl })

    try {
      const result = await fetchFeed(feedUrl)
      debugLogger.log('FETCH', { action: 'fetch-success', status: result.status, length: result.text.length })

      const parsed = parser.parse(result.text, rootItemElement || 'item')
      debugLogger.log('PARSE', {
        action: 'parse-complete',
        itemCount: parsed.items.length,
        fieldNames: parsed.fieldNames
      })

      const sortedItems = this.sortItems(parsed.items)
      if (this.props.config.sortField) {
        debugLogger.log('PARSE', {
          action: 'sort-applied',
          sortField: this.props.config.sortField,
          sortDirection: this.props.config.sortDirection || 'asc'
        })
      }

      // Change detection: highlight new/changed items
      if (this.props.config.highlightNewItems) {
        const changedIds = this.detectChanges(sortedItems)
        if (changedIds.size > 0) {
          this.applyHighlights(changedIds)
        }
      }

      // Build new ID set for next cycle's comparison
      const newItemIds = new Set(sortedItems.map(item => this.getItemId(item)))

      // Reset failure counter on success; if we were in backoff, restore normal polling
      const wasBackedOff = this.state.consecutiveFailures >= BACKOFF_THRESHOLD

      this.setState({
        items: sortedItems,
        fieldNames: parsed.fieldNames,
        isLoading: false,
        error: null,
        fetchError: null,
        lastFetchTime: Date.now(),
        previousItemIds: newItemIds,
        consecutiveFailures: 0,
        pollPaused: false
      })

      if (wasBackedOff) {
        debugLogger.log('POLL', { action: 'backoff-reset', reason: 'successful fetch' })
        this.startPolling()
      }

      // Map integration: query feature service for matching geometries
      if (isMapIntegrationConfigured(this.props.useDataSources, this.props.config)) {
        this.runQueryGeometries(sortedItems)
      } else {
        debugLogger.log('JOIN', { action: 'map-integration-not-configured', useDataSources: this.props.useDataSources?.length ?? 0, joinFieldFeed: this.props.config.joinFieldFeed, joinFieldService: this.props.config.joinFieldService })
      }

      // Feed map layer: sync coordinates to client-side FeatureLayer
      if (isFeedMapLayerConfigured(this.props.config as any)) {
        this.syncFeedLayer(sortedItems, parsed.fieldNames)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      const failures = this.state.consecutiveFailures + 1
      debugLogger.log('FETCH', { action: 'fetch-error', error: message, consecutiveFailures: failures })

      if (hasExistingData) {
        // Keep last good data visible, show non-blocking error banner
        this.setState({ fetchError: message, consecutiveFailures: failures })
      } else {
        // First load failed — show full error state
        this.setState({ isLoading: false, error: message, consecutiveFailures: failures })
      }

      // Pause polling after PAUSE_THRESHOLD failures
      if (failures >= PAUSE_THRESHOLD) {
        debugLogger.log('POLL', { action: 'poll-pause-threshold', failures })
        this.stopPolling()
        this.setState({ pollPaused: true })
      } else if (failures >= BACKOFF_THRESHOLD) {
        // Restart polling with doubled interval
        this.startPolling()
      }
    }
  }

  // ── Card Click ──────────────────────────────────────────────────

  /**
   * Handle card click:
   * 1. Map integration configured → zoom to feature + open popup on map
   * 2. externalLinkTemplate configured → open substituted URL in new tab
   * 3. Neither → no-op
   */
  private onCardClick = (item: FeedItem, evt: React.MouseEvent): void => {
    // Don't intercept clicks on links inside the card
    if ((evt.target as HTMLElement).closest('a')) return

    const { joinFieldFeed, joinFieldService, externalLinkTemplate } = this.props.config
    const itemId = this.getItemId(item)

    // Feed map layer: zoom to feed point directly from coordinates
    if (isFeedMapLayerConfigured(this.props.config as any) && this.mapView) {
      // Toggle: clicking the same card again clears selection
      if (this.state.selectedItemId === itemId) {
        if (this.mapView?.popup) {
          this.mapView.popup.close()
        }
        this.setState({ selectedItemId: null })
        debugLogger.log('FEED-LAYER', { action: 'card-deselected', itemId })
        return
      }

      // Ensure the feed layer is visible in the layer list
      this.ensureFeedLayerVisible()

      // Always identify the point; only zoom if zoom-on-click is enabled (default true)
      const skipZoom = this.props.config.enableZoomOnClick === false
      zoomToFeedPoint(this.mapView, item, this.props.config as any, { skipZoom })
        .then((success) => {
          if (!success) {
            this.showNoGeometryMessage(itemId)
          }
        })
      this.setState({ selectedItemId: itemId })
      debugLogger.log('FEED-LAYER', { action: 'card-click-select', itemId, zoomEnabled: !skipZoom })
      return
    }

    // Spatial join map integration: zoom to feature + open popup on map
    if (isMapIntegrationConfigured(this.props.useDataSources, this.props.config) && joinFieldFeed && joinFieldService) {
      const joinValue = item[joinFieldFeed]

      // Toggle: clicking the same card again clears selection
      if (this.state.selectedItemId === itemId) {
        if (this.mapView?.popup) {
          this.mapView.popup.close()
        }
        this.setState({ selectedItemId: null })
        debugLogger.log('JOIN', { action: 'card-deselected', itemId })
        return
      }

      if (joinValue && this.state.geometryMap.has(joinValue)) {
        const restGeom = this.state.geometryMap.get(joinValue)
        const geometry = inferGeometryType(restGeom)
        const graphic = new Graphic({
          attributes: { [joinFieldService]: joinValue },
          geometry
        })

        // Zoom (if enabled) and identify the feature on the map
        if (this.mapView) {
          const dataSourceId = (this.props.useDataSources[0] as any).dataSourceId
          const doIdentify = (): void => {
            identifyFeatureOnMap({
              mapView: this.mapView,
              dataSourceId,
              joinField: joinFieldService,
              joinValue
            })
          }

          if (this.props.config.enableZoomOnClick !== false) {
            const pointZoom = this.props.config.zoomFactorPoint || 15
            const polyBuffer = this.props.config.zoomFactorPoly || 1.5
            const goToTarget = buildGoToTarget(graphic, geometry.type, pointZoom, polyBuffer)
            this.mapView.goTo(goToTarget, { animate: true, duration: 800 })
              .then(doIdentify)
              .catch(() => {
                // goTo can fail if view is destroyed mid-animation — safe to ignore
              })
          } else {
            // No zoom — identify immediately
            doIdentify()
          }
          debugLogger.log('JOIN', { action: 'card-click-select', joinValue, geometryType: geometry.type, zoomEnabled: this.props.config.enableZoomOnClick !== false })
        }

        this.setState({ selectedItemId: itemId })
        debugLogger.log('JOIN', { action: 'card-selected', itemId, joinValue })
      } else {
        debugLogger.log('JOIN', { action: 'card-click-no-geometry', joinValue })
        this.setState({ selectedItemId: itemId })
        this.showNoGeometryMessage(itemId)
      }
      return
    }

    // Fallback: external link
    if (!externalLinkTemplate) return

    const url = externalLinkTemplate.replace(
      /\{\{(\s*[\w.@\[\]]+\s*)\}\}/g,
      (_m, name: string) => item[name.trim()] ?? ''
    )

    debugLogger.log('RENDER', { action: 'card-click-external', url })
    window.open(url, '_blank', 'noopener')
  }

  /** Show a temporary "no geometry" info message on a card, auto-clearing after 3s */
  private showNoGeometryMessage (itemId: string): void {
    if (this.noGeometryTimerId) clearTimeout(this.noGeometryTimerId)
    this.setState({ noGeometryItemId: itemId })
    this.noGeometryTimerId = setTimeout(() => {
      this.setState({ noGeometryItemId: null })
      this.noGeometryTimerId = null
    }, 3000)
  }

  // ── Scroll to Top ─────────────────────────────────────────────────

  /** Show/hide scroll-to-top button based on scroll position */
  private onScrollContainer = (e: React.UIEvent<HTMLDivElement>): void => {
    const scrollTop = (e.target as HTMLDivElement).scrollTop
    const shouldShow = scrollTop > 200
    if (shouldShow !== this.state.showScrollTop) {
      this.setState({ showScrollTop: shouldShow })
    }
  }

  /** Smooth-scroll the card list back to the top */
  private scrollToTop = (): void => {
    this.scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ── Toolbar Handlers ──────────────────────────────────────────────

  /** Zoom to a feed item's feature/point on the map (toolbar button) */
  private onCardZoom = (item: FeedItem): void => {
    if (!this.mapView) return
    const itemId = this.getItemId(item)

    // Feed Map Layer takes priority
    if (isFeedMapLayerConfigured(this.props.config as any)) {
      this.ensureFeedLayerVisible()
      zoomToFeedPoint(this.mapView, item, this.props.config as any)
        .then((success) => {
          if (!success) this.showNoGeometryMessage(itemId)
        })
      this.setState({ selectedItemId: itemId })
      debugLogger.log('FEED-LAYER', { action: 'toolbar-zoom', itemId })
      return
    }

    // Spatial join
    const { joinFieldFeed, joinFieldService } = this.props.config
    if (!joinFieldFeed || !joinFieldService) return
    const joinValue = item[joinFieldFeed]

    if (joinValue && this.state.geometryMap.has(joinValue)) {
      const restGeom = this.state.geometryMap.get(joinValue)
      const geometry = inferGeometryType(restGeom)
      const graphic = new Graphic({ attributes: { [joinFieldService]: joinValue }, geometry })
      const pointZoom = this.props.config.zoomFactorPoint || 15
      const polyBuffer = this.props.config.zoomFactorPoly || 1.5
      const goToTarget = buildGoToTarget(graphic, geometry.type, pointZoom, polyBuffer)
      const dataSourceId = (this.props.useDataSources[0] as any).dataSourceId

      this.mapView.goTo(goToTarget, { animate: true, duration: 800 })
        .then(() => {
          identifyFeatureOnMap({ mapView: this.mapView, dataSourceId, joinField: joinFieldService, joinValue })
        })
        .catch(() => { /* goTo can fail if view destroyed */ })
      this.setState({ selectedItemId: itemId })
      debugLogger.log('JOIN', { action: 'toolbar-zoom', joinValue })
    } else {
      this.setState({ selectedItemId: itemId })
      this.showNoGeometryMessage(itemId)
    }
  }

  /** Pan (center without zoom change) to a feed item on the map (toolbar button) */
  private onCardPan = (item: FeedItem): void => {
    if (!this.mapView) return
    const itemId = this.getItemId(item)

    // Feed Map Layer takes priority
    if (isFeedMapLayerConfigured(this.props.config as any)) {
      this.ensureFeedLayerVisible()
      panToFeedPoint(this.mapView, item, this.props.config as any)
        .then((success) => {
          if (!success) this.showNoGeometryMessage(itemId)
        })
      this.setState({ selectedItemId: itemId })
      debugLogger.log('FEED-LAYER', { action: 'toolbar-pan', itemId })
      return
    }

    // Spatial join
    const { joinFieldFeed, joinFieldService } = this.props.config
    if (!joinFieldFeed || !joinFieldService) return
    const joinValue = item[joinFieldFeed]

    if (joinValue && this.state.geometryMap.has(joinValue)) {
      const restGeom = this.state.geometryMap.get(joinValue)
      const geometry = inferGeometryType(restGeom)
      const graphic = new Graphic({ attributes: { [joinFieldService]: joinValue }, geometry })
      const panTarget = buildPanTarget(graphic, geometry.type)
      const dataSourceId = (this.props.useDataSources[0] as any).dataSourceId

      this.mapView.goTo(panTarget, { animate: true, duration: 800 })
        .then(() => {
          identifyFeatureOnMap({ mapView: this.mapView, dataSourceId, joinField: joinFieldService, joinValue })
        })
        .catch(() => { /* goTo can fail if view destroyed */ })
      this.setState({ selectedItemId: itemId })
      debugLogger.log('JOIN', { action: 'toolbar-pan', joinValue })
    } else {
      this.setState({ selectedItemId: itemId })
      this.showNoGeometryMessage(itemId)
    }
  }

  /** Whether cards should be clickable (have pointer cursor + hover effect) */
  private isCardClickable (): boolean {
    return !!this.props.config.externalLinkTemplate ||
      isMapIntegrationConfigured(this.props.useDataSources, this.props.config) ||
      isFeedMapLayerConfigured(this.props.config as any)
  }

  /** Format lastFetchTime as a human-readable string */
  private formatLastUpdated (): string | null {
    const { lastFetchTime } = this.state
    if (!lastFetchTime) return null
    const date = new Date(lastFetchTime)
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  }

  render (): React.ReactElement {
    const { config } = this.props
    const { isLoading, error, fetchError, pollPaused } = this.state
    const items = this.getDisplayItems()
    const showLastUpdated = config.showLastUpdated !== false // default true
    const lastUpdatedStr = this.formatLastUpdated()

    return (
      <div className='jimu-widget feed-simple' css={css`
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      `}>
        {/* Scrollable content area */}
        <div
          ref={this.scrollContainerRef}
          onScroll={this.onScrollContainer}
          css={css`
            flex: 1;
            overflow: auto;
            padding: 12px;
            position: relative;
          `}
        >
          {!config.feedUrl && (
            <div css={css`
              color: #999;
              font-size: 12px;
              font-style: italic;
            `}>
              {this.getI18nMessage('noFeedConfigured')}
            </div>
          )}

          {isLoading && (
            <div css={css`color: #666; font-size: 12px;`}>
              {this.getI18nMessage('loading')}
            </div>
          )}

          {/* Full error — first load failed, no data to show */}
          {error && (
            <div css={css`
              color: #c00;
              font-size: 12px;
              padding: 8px;
              background: #fff0f0;
              border-radius: 4px;
              border: 1px solid #fcc;
            `}>
              {error}
            </div>
          )}

          {/* Polling paused banner — click to retry */}
          {pollPaused && (
            <div
              role='button'
              tabIndex={0}
              onClick={() => {
                this.setState({ pollPaused: false, consecutiveFailures: 0 }, () => {
                  this.loadFeed()
                  this.startPolling()
                })
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  this.setState({ pollPaused: false, consecutiveFailures: 0 }, () => {
                    this.loadFeed()
                    this.startPolling()
                  })
                }
              }}
              css={css`
                color: #721c24;
                font-size: 12px;
                padding: 8px 12px;
                background: #f8d7da;
                border-radius: 4px;
                border: 1px solid #f5c6cb;
                margin-bottom: 8px;
                cursor: pointer;
                text-align: center;
                &:hover { background: #f1c0c5; }
              `}
            >
              Feed unavailable — click to retry
            </div>
          )}

          {/* Non-blocking fetch error banner — data is stale but still visible */}
          {fetchError && !pollPaused && (
            <div css={css`
              color: #856404;
              font-size: 11px;
              padding: 6px 10px;
              background: #fff3cd;
              border-radius: 4px;
              border: 1px solid #ffc107;
              margin-bottom: 8px;
              display: flex;
              align-items: center;
              gap: 6px;
            `}>
              <span css={css`font-size: 14px;`}>⚠</span>
              <span>
                {this.getI18nMessage('errorFeedUnavailable')} — showing last available data
                {lastUpdatedStr && ` (${lastUpdatedStr})`}
              </span>
            </div>
          )}

          {!isLoading && !error && items.length > 0 && (() => {
            const clickable = this.isCardClickable()
            const filterCtx: FilterContext = {
              externalLinkTemplate: config.externalLinkTemplate,
              dateFormatString: config.dateFormatString
            }

            // Toolbar visibility (computed once for all cards)
            const hasMapConfig = isFeedMapLayerConfigured(config as any) ||
              isMapIntegrationConfigured(this.props.useDataSources, config)
            const showZoomButton = hasMapConfig && config.enableZoomOnClick === false
            const showPanButton = hasMapConfig
            const showExpandButton = config.enableCardExpand === true

            // i18n labels for toolbar tooltips
            const toolbarLabels = (showZoomButton || showPanButton || showExpandButton)
              ? {
                  zoom: this.getI18nMessage('zoomToFeature'),
                  pan: this.getI18nMessage('panToFeature'),
                  expand: this.getI18nMessage('expandCard'),
                  collapse: this.getI18nMessage('collapseCard'),
                  noGeometry: this.getI18nMessage('zoomDisabledNoGeometry')
                }
              : undefined

            return (
              <div>
                {items.map((item, i) => {
                  const id = this.getItemId(item)

                  // Per-item geometry check for toolbar button state
                  let hasGeometry = true
                  if (hasMapConfig) {
                    if (isFeedMapLayerConfigured(config as any)) {
                      const lat = parseFloat(item[config.latitudeField] ?? '')
                      const lon = parseFloat(item[config.longitudeField] ?? '')
                      hasGeometry = !isNaN(lat) && !isNaN(lon)
                    } else if (config.joinFieldFeed) {
                      hasGeometry = this.state.geometryMap.has(item[config.joinFieldFeed] ?? '')
                    }
                  }

                  return (
                    <div key={i} data-feed-item-id={id}>
                      <FeedCard
                        item={item}
                        isHighlighted={this.state.highlightedIds.has(id)}
                        isSelected={this.state.selectedItemId === id}
                        cardTemplate={config.cardTemplate}
                        statusField={config.statusField}
                        statusColorMap={config.statusColorMap}
                        hoverTextField={config.hoverTextField}
                        filterContext={filterCtx}
                        clickable={clickable}
                        highlightDurationMs={HIGHLIGHT_DURATION_MS}
                        onClick={clickable ? this.onCardClick : undefined}
                        noGeometryMessage={this.state.noGeometryItemId === id
                          ? this.getI18nMessage(isFeedMapLayerConfigured(config as any) ? 'noValidCoordinates' : 'noGeometryOnMap')
                          : undefined}
                        showZoomButton={showZoomButton}
                        showPanButton={showPanButton}
                        showExpandButton={showExpandButton}
                        hasGeometry={hasGeometry}
                        onZoom={showZoomButton ? this.onCardZoom : undefined}
                        onPan={showPanButton ? this.onCardPan : undefined}
                        toolbarLabels={toolbarLabels}
                      />
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* DataSourceComponent ensures the spatial join layer DS is instantiated by ExB */}
          {isMapIntegrationConfigured(this.props.useDataSources, this.props.config) && (
            <DataSourceComponent
              useDataSource={this.props.useDataSources[0]}
              onDataSourceCreated={this.onOriginDsCreated}
            />
          )}
          {/* JimuMapViewComponent — provides JSAPI MapView for goTo/popup/feed layer */}
          {this.props.config.mapWidgetId && (
            <JimuMapViewComponent
              useMapWidgetId={this.props.config.mapWidgetId}
              onActiveViewChange={this.onActiveViewChange}
            />
          )}

          {/* Scroll-to-top FAB */}
          {this.state.showScrollTop && (
            <button
              onClick={this.scrollToTop}
              aria-label={this.getI18nMessage('scrollToTop')}
              title={this.getI18nMessage('scrollToTop')}
              css={css`
                position: sticky;
                bottom: 10px;
                left: 100%;
                transform: translateX(-15px);
                width: 36px;
                height: 36px;
                border-radius: 6px;
                border: none;
                background: var(--sys-color-primary-main, #0079c1);
                color: #fff;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
                transition: background 0.2s, box-shadow 0.2s, transform 0.15s;
                z-index: 10;
                &:hover {
                  background: var(--sys-color-primary-dark, #005e95);
                  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
                  transform: translateX(-15px) translateY(-1px);
                }
                &:active {
                  transform: translateX(-15px) translateY(0);
                }
              `}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 10l5-5 5 5"/>
              </svg>
            </button>
          )}
        </div>
        {/* Stationary footer */}
        <div css={css`
          padding: 4px 12px;
          border-top: 1px solid var(--sys-color-divider-secondary);
          background-color: var(--sys-color-surface-paper);
          flex-shrink: 0;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1px;
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
            {/* RSS/Feed Symbol */}
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
              <circle cx="5" cy="19" r="2"/>
              <path d="M3 11a8 8 0 0 1 8 8"/>
              <path d="M3 3a16 16 0 0 1 16 16"/>
            </svg>
            FeedSimple by MapSimple
            <span css={css`
              margin-left: 6px;
              opacity: 0.5;
              font-size: 0.7rem;
            `}>
              v{WIDGET_VERSION}
            </span>
          </span>
          {showLastUpdated && lastUpdatedStr && (
            <span css={css`
              font-size: 0.65rem;
              color: var(--sys-color-text-tertiary);
              opacity: 0.5;
            `}>
              {this.getI18nMessage('lastUpdated')} {lastUpdatedStr}
            </span>
          )}
        </div>
      </div>
    )
  }
}
