/** @jsx jsx */
import {
  React, jsx, css, Immutable,
  type UseDataSource,
  AllDataSourceTypes,
  DataSourceManager
} from 'jimu-core'
import { type AllWidgetSettingProps } from 'jimu-for-builder'
import { SettingSection, SettingRow, MapWidgetSelector } from 'jimu-ui/advanced/setting-components'
import { DataSourceSelector } from 'jimu-ui/advanced/data-source-selector'
import { TextInput, NumericInput, Switch, Select, Option, Button } from 'jimu-ui'
import type { IMConfig, StatusColorMap, RangeColorBreak } from '../config'
import type { FeedItem } from '../utils/parsers/interface'
import { fetchFeed } from '../utils/feed-fetcher'
import { CustomXmlParser } from '../utils/parsers/custom-xml'
import { renderPreview } from '../utils/markdown-template-utils'
import { buildOutputDataSourceJson } from '../utils/data-source-builder'
import { createFeedSimpleDebugLogger } from '../utils/debug-logger'
import defaultMessages from './translations/default'

const debugLogger = createFeedSimpleDebugLogger()

/** Data source types allowed for Map Integration layer selection */
const SPATIAL_JOIN_DS_TYPES = Immutable([AllDataSourceTypes.FeatureLayer])

const parser = new CustomXmlParser()

interface State {
  discoveredFields: string[]
  /** All parsed items from last Discover — used to extract unique status values */
  discoveredItems: FeedItem[]
  isDiscovering: boolean
  discoverError: string | null
  /** Field names from the selected Map Integration layer */
  spatialJoinFields: string[]
  /** Current value in the manual field name input */
  manualFieldInput: string
  /** Whether the template syntax help panel is expanded */
  templateHelpOpen: boolean
  /** Whether the popup template help panel is expanded */
  popupHelpOpen: boolean
  /** Index of the range break currently being dragged */
  dragIndex: number | null
  /** Index of the range break currently being dragged over */
  dragOverIndex: number | null
}

export default class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>, State> {
  private templateTextareaRef = React.createRef<HTMLTextAreaElement>()

  constructor (props: AllWidgetSettingProps<IMConfig>) {
    super(props)
    this.state = {
      discoveredFields: [],
      discoveredItems: [],
      isDiscovering: false,
      discoverError: null,
      spatialJoinFields: [],
      manualFieldInput: '',
      templateHelpOpen: false,
      popupHelpOpen: false,
      dragIndex: null,
      dragOverIndex: null
    }
  }

  componentDidMount (): void {
    // Load Map Integration layer fields if already configured (settings panel reopened)
    const useDs = this.props.useDataSources?.[0]
    if (useDs) {
      this.loadSpatialJoinFields((useDs as any).dataSourceId)
    }

    // Auto-discover feed fields when panel opens with a configured URL
    if (this.props.config.feedUrl && this.state.discoveredFields.length === 0) {
      this.onDiscoverFields()
    }
  }

  getI18nMessage = (id: string): string => {
    return this.props.intl.formatMessage({ id, defaultMessage: defaultMessages[id] })
  }

  // ── Discover Fields ──────────────────────────────────────────

  onDiscoverFields = async (): Promise<void> => {
    const { feedUrl, rootItemElement } = this.props.config
    debugLogger.log('SETTINGS', { action: 'discover-fields-start', feedUrl, rootItemElement: rootItemElement || 'item' })
    if (!feedUrl) {
      this.setState({ discoverError: 'Enter a Feed URL first.' })
      return
    }

    this.setState({ isDiscovering: true, discoverError: null })

    try {
      debugLogger.log('SETTINGS', { action: 'discover-fetch-start' })
      const result = await fetchFeed(feedUrl)
      debugLogger.log('SETTINGS', { action: 'discover-fetch-ok', status: result.status, responseLength: result.text.length })
      const parsed = parser.parse(result.text, rootItemElement || 'item')
      debugLogger.log('SETTINGS', { action: 'discover-parse-ok', fieldCount: parsed.fieldNames.length, itemCount: parsed.items.length, fields: parsed.fieldNames })
      this.setState({
        discoveredFields: parsed.fieldNames,
        discoveredItems: parsed.items,
        isDiscovering: false,
        discoverError: null
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      debugLogger.log('SETTINGS', { action: 'discover-error', error: message })
      this.setState({
        isDiscovering: false,
        discoverError: message
      })
    }
  }

  /** Add a manually typed field name to discoveredFields (CORS fallback) */
  onAddManualField = (): void => {
    const fieldName = this.state.manualFieldInput.trim()
    if (!fieldName) return
    // Avoid duplicates
    if (this.state.discoveredFields.includes(fieldName)) {
      this.setState({ manualFieldInput: '' })
      return
    }
    this.setState(prev => ({
      discoveredFields: [...prev.discoveredFields, fieldName],
      manualFieldInput: ''
    }))
  }

  /** Get unique values for a given field from discovered items */
  private getUniqueValuesForField (fieldName: string): string[] {
    const { discoveredItems } = this.state
    if (!fieldName || discoveredItems.length === 0) return []
    const values = new Set<string>()
    discoveredItems.forEach(item => {
      const val = item[fieldName]
      if (val && val.trim()) values.add(val.trim())
    })
    return Array.from(values).sort()
  }

  // ── Coordinate field detection ──────────────────────────────

  /**
   * Get coordinate field candidates, sorted with likely matches first.
   * Samples discovered items to check if values look like valid lat or lon.
   */
  getCoordinateCandidates = (type: 'lat' | 'lon'): string[] => {
    const { discoveredFields, discoveredItems } = this.state
    if (discoveredFields.length === 0) return []

    // Heuristic: score fields by name and sample values
    const scored = discoveredFields.map(field => {
      let score = 0
      const lower = field.toLowerCase()

      // Name-based scoring
      if (type === 'lat') {
        if (lower.includes('latitude') || lower.includes('lat')) score += 10
        if (lower === 'y' || lower.endsWith('.y')) score += 5
      } else {
        if (lower.includes('longitude') || lower.includes('lon') || lower.includes('lng')) score += 10
        if (lower === 'x' || lower.endsWith('.x')) score += 5
      }

      // Value-based scoring: check if sample values are valid coordinates
      const sampleItems = discoveredItems.slice(0, 5)
      let numericCount = 0
      let rangeCount = 0
      for (const item of sampleItems) {
        const val = parseFloat(item[field])
        if (!isNaN(val)) {
          numericCount++
          if (type === 'lat' && val >= -90 && val <= 90) rangeCount++
          if (type === 'lon' && val >= -180 && val <= 180) rangeCount++
        }
      }
      if (numericCount >= 3) score += 3
      if (rangeCount >= 3) score += 5

      return { field, score }
    })

    // Sort: high-scoring candidates first, then alphabetically
    return scored
      .sort((a, b) => b.score - a.score || a.field.localeCompare(b.field))
      .map(s => s.field)
  }

  // ── Config change handlers ──────────────────────────────────

  onFeedUrlChange = (value: string): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('feedUrl', value)
    })
  }

  onCardTemplateChange = (evt: React.ChangeEvent<HTMLTextAreaElement>): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('cardTemplate', evt.target.value)
    })
  }

  /** Insert a {{fieldName}} token at the cursor position in the template textarea */
  onInsertFieldToken = (fieldName: string): void => {
    const textarea = this.templateTextareaRef.current
    const token = `{{${fieldName}}}`
    const currentTemplate = this.props.config.cardTemplate || ''

    if (textarea) {
      const start = textarea.selectionStart ?? currentTemplate.length
      const end = textarea.selectionEnd ?? start
      const newValue = currentTemplate.substring(0, start) + token + currentTemplate.substring(end)

      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('cardTemplate', newValue)
      })

      requestAnimationFrame(() => {
        if (textarea) {
          textarea.focus()
          const newPos = start + token.length
          textarea.setSelectionRange(newPos, newPos)
        }
      })
    } else {
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set('cardTemplate', currentTemplate + token)
      })
    }
  }

  onStatusFieldChange = (evt: React.ChangeEvent<HTMLSelectElement>): void => {
    const newField = evt.target.value
    // When status field changes, reset the color map
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config
        .set('statusField', newField)
        .set('statusColorMap', {} as any)
    })
  }

  onStatusColorChange = (statusValue: string, color: string): void => {
    const currentMap = (this.props.config.statusColorMap as any) || {}
    const newMap: StatusColorMap = { ...currentMap, [statusValue]: color }
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('statusColorMap', newMap as any)
    })
  }

  onColorModeChange = (evt: React.ChangeEvent<HTMLSelectElement>): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('colorMode', evt.target.value as 'exact' | 'range')
    })
  }

  onAddRangeBreak = (): void => {
    const current = (this.props.config.rangeColorBreaks as any as RangeColorBreak[]) || []
    const newBreaks: RangeColorBreak[] = [...current, { min: null, max: null, color: '#FFD700', label: '' }]
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('rangeColorBreaks', newBreaks as any)
    })
  }

  onUpdateRangeBreak = (index: number, field: keyof RangeColorBreak, value: any): void => {
    const current = (this.props.config.rangeColorBreaks as any as RangeColorBreak[]) || []
    const updated = [...current]
    const brk = { ...updated[index] }

    // Sync logic: when card color changes, keep mapColor in sync if they
    // were previously matching (unset or same value). Once the user sets a
    // different mapColor, the two become independent.
    if (field === 'color') {
      const wasInSync = !brk.mapColor || brk.mapColor === brk.color
      brk.color = value
      if (wasInSync) {
        brk.mapColor = value
      }
    } else {
      ;(brk as any)[field] = value
    }

    updated[index] = brk
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('rangeColorBreaks', updated as any)
    })
  }

  onRemoveRangeBreak = (index: number): void => {
    const current = (this.props.config.rangeColorBreaks as any as RangeColorBreak[]) || []
    const updated = current.filter((_, i) => i !== index)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('rangeColorBreaks', updated as any)
    })
  }

  onMoveRangeBreak = (index: number, direction: 'up' | 'down'): void => {
    const current = (this.props.config.rangeColorBreaks as any as RangeColorBreak[]) || []
    const targetIndex = direction === 'up' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= current.length) return
    const updated = [...current]
    const temp = updated[index]
    updated[index] = updated[targetIndex]
    updated[targetIndex] = temp
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('rangeColorBreaks', updated as any)
    })
  }

  // ── Range break drag-and-drop reorder ──────────────────────────
  onBreakDragStart = (idx: number): void => {
    this.setState({ dragIndex: idx })
  }

  onBreakDragEnter = (idx: number): void => {
    if (this.state.dragIndex === null || this.state.dragIndex === idx) return
    this.setState({ dragOverIndex: idx })
  }

  onBreakDragOver = (e: React.DragEvent): void => {
    e.preventDefault() // allow drop
  }

  onBreakDrop = (): void => {
    const { dragIndex, dragOverIndex } = this.state
    if (dragIndex === null || dragOverIndex === null || dragIndex === dragOverIndex) {
      this.setState({ dragIndex: null, dragOverIndex: null })
      return
    }
    const current = (this.props.config.rangeColorBreaks as any as RangeColorBreak[]) || []
    const updated = [...current]
    const [moved] = updated.splice(dragIndex, 1)
    updated.splice(dragOverIndex, 0, moved)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('rangeColorBreaks', updated as any)
    })
    this.setState({ dragIndex: null, dragOverIndex: null })
  }

  onBreakDragEnd = (): void => {
    this.setState({ dragIndex: null, dragOverIndex: null })
  }

  // ── Reusable template syntax help panel ─────────────────────────
  renderTemplateHelp = (isOpen: boolean, stateKey: 'templateHelpOpen' | 'popupHelpOpen'): React.ReactNode => {
    return (
      <div css={css`margin-top: 4px;`}>
        <button
          type='button'
          onClick={() => this.setState(prev => ({ ...prev, [stateKey]: !prev[stateKey] }) as any)}
          aria-expanded={isOpen}
          css={css`
            display: flex;
            align-items: center;
            gap: 4px;
            background: none;
            border: none;
            padding: 2px 0;
            cursor: pointer;
            font-size: 11px;
            color: var(--sys-color-primary-main, #0079c1);
            &:hover { text-decoration: underline; }
          `}
        >
          <span css={css`
            display: inline-block;
            transition: transform 0.15s;
            transform: ${isOpen ? 'rotate(90deg)' : 'rotate(0deg)'};
            font-size: 10px;
          `}>▶</span>
          Template syntax reference
        </button>
        {isOpen && (
          <div css={css`
            margin-top: 4px;
            padding: 8px 10px;
            border: 1px solid var(--sys-color-divider-secondary, #e0e0e0);
            border-radius: 4px;
            background: var(--sys-color-surface-overlay, #f9f9f9);
            font-size: 11px;
            line-height: 1.6;
            color: var(--sys-color-text-secondary, inherit);
            overflow: hidden;
            word-break: break-word;
            code {
              font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
              font-size: 10px;
              background: rgba(255,255,255,0.08);
              padding: 1px 4px;
              border-radius: 2px;
              color: inherit;
              word-break: break-all;
            }
            h4 {
              margin: 0 0 2px 0;
              font-size: 11px;
              font-weight: 600;
              color: inherit;
            }
            .help-section { margin-bottom: 8px; }
            .help-section:last-child { margin-bottom: 0; }
            table { border-collapse: collapse; width: 100%; margin: 2px 0; table-layout: fixed; }
            td { padding: 2px 6px 2px 0; vertical-align: top; overflow-wrap: break-word; }
          `}>
            <div className='help-section'>
              <h4>Tokens</h4>
              <code>{'{{fieldName}}'}</code> — insert field value. Leave template empty to show all fields.
            </div>

            <div className='help-section'>
              <h4>Markdown</h4>
              <code>**bold**</code> &nbsp; <code>*italic*</code> &nbsp; <code># heading</code> &nbsp;
              <code>- list</code> &nbsp; <code>[text](url)</code> &nbsp; <code>---</code> rule
            </div>

            <div className='help-section'>
              <h4>Filters — chainable with <code>|</code></h4>
              <table>
                <tbody>
                  <tr><td><code>{'{{field | "MMM D, YYYY"}}'}</code></td><td>Date format (local time)</td></tr>
                  <tr><td><code>{'{{field | "HH:mm:ss"}}'}</code></td><td>24-hour time</td></tr>
                  <tr><td><code>{'{{field | "h:mm A"}}'}</code></td><td>12-hour time</td></tr>
                  <tr><td colSpan={2} css={css`font-size: 11px; color: var(--sys-color-text-tertiary); padding-top: 2px;`}>
                    Tokens: YYYY YY MMM MM M DD D HH H hh h mm ss A a Z<br/>
                    Z = timezone offset (e.g. -07:00). UTC dates auto-convert to local.
                  </td></tr>
                  <tr><td><code>{'{{field | autolink}}'}</code></td><td>URLs → clickable links</td></tr>
                  <tr><td><code>{'{{field | externalLink}}'}</code></td><td>Link via template</td></tr>
                </tbody>
              </table>
            </div>

            <div className='help-section'>
              <h4>Math &amp; formatting</h4>
              <table>
                <tbody>
                  <tr><td><code>{'{{field | /1000}}'}</code></td><td>Divide by 1000</td></tr>
                  <tr><td><code>{'{{field | *2.5}}'}</code></td><td>Multiply by 2.5</td></tr>
                  <tr><td><code>{'{{field | +10}}'}</code></td><td>Add 10</td></tr>
                  <tr><td><code>{'{{field | -5}}'}</code></td><td>Subtract 5</td></tr>
                  <tr><td><code>{'{{field | round:1}}'}</code></td><td>Round to 1 decimal</td></tr>
                  <tr><td><code>{'{{field | round}}'}</code></td><td>Round to integer</td></tr>
                  <tr><td><code>{'{{field | abs}}'}</code></td><td>Absolute value</td></tr>
                  <tr><td><code>{'{{field | prefix:$}}'}</code></td><td>Prepend text</td></tr>
                  <tr><td><code>{'{{field | suffix: km}}'}</code></td><td>Append text</td></tr>
                  <tr><td><code>{'{{field | upper}}'}</code></td><td>UPPERCASE</td></tr>
                  <tr><td><code>{'{{field | lower}}'}</code></td><td>lowercase</td></tr>
                </tbody>
              </table>
            </div>

            <div className='help-section'>
              <h4>Example — meters to km</h4>
              <code>{'{{distMeters | /1000 | round:1 | suffix: km}}'}</code>
              <br/>
              <span css={css`color: var(--sys-color-text-tertiary); font-size: 11px;`}>
                2400.00095 → 2.4 km
              </span>
            </div>
          </div>
        )}
      </div>
    )
  }

  onHoverTextFieldChange = (evt: React.ChangeEvent<HTMLSelectElement>): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('hoverTextField', evt.target.value)
    })
  }

  onRefreshIntervalChange = (value: number): void => {
    const clamped = value > 0 && value < 15 ? 15 : Math.max(0, Math.floor(value))
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('refreshInterval', clamped)
    })
  }

  onShowLastUpdatedChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('showLastUpdated', evt.target.checked)
    })
  }

  onShowColorLegendChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('showColorLegend', evt.target.checked)
    })
  }

  onSortFieldChange = (evt: React.ChangeEvent<HTMLSelectElement>): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('sortField', evt.target.value)
    })
  }

  onSortDirectionChange = (evt: React.ChangeEvent<HTMLSelectElement>): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('sortDirection', evt.target.value as 'asc' | 'desc')
    })
  }

  onReverseFeedOrderChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('reverseFeedOrder', evt.target.checked)
    })
  }

  onMaxItemsChange = (value: number): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('maxItems', Math.max(0, Math.floor(value)))
    })
  }

  /** Generic config setter for simple string/boolean/number properties */
  private setConfigValue = (key: string, value: any): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set(key, value)
    })
  }

  onFilterByStatusToggle = (statusValue: string, checked: boolean): void => {
    const current = (this.props.config.filterByStatus as any as string[]) || []
    const updated = checked
      ? [...current, statusValue]
      : current.filter((v: string) => v !== statusValue)
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('filterByStatus', updated as any)
    })
  }

  onHighlightNewItemsChange = (evt: React.ChangeEvent<HTMLInputElement>): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('highlightNewItems', evt.target.checked)
    })
  }

  onExternalLinkTemplateChange = (value: string): void => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set('externalLinkTemplate', value)
    })
  }

  // ── Map Integration handlers ─────────────────────────────────

  /**
   * Load field names from the Map Integration data source for the
   * Join Field (Layer) dropdown.
   */
  private loadSpatialJoinFields (dsId: string): void {
    try {
      const ds = DataSourceManager.getInstance().getDataSource(dsId)
      if (!ds) {
        this.setState({ spatialJoinFields: [] })
        return
      }
      const schema = ds.getSchema()
      const fields = Object.keys(schema?.fields || {}).sort()
      this.setState({ spatialJoinFields: fields })
    } catch {
      // DS schema unavailable — clear fields so dropdowns show empty
      this.setState({ spatialJoinFields: [] })
    }
  }

  /**
   * Called when the user selects or clears the Map Integration layer
   * via DataSourceSelector.
   */
  onSpatialJoinDsChange = (useDataSources: UseDataSource[]): void => {
    const useDs = useDataSources?.[0]

    if (!useDs) {
      // Cleared — deregister output DS and reset join fields
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config
          .set('joinFieldService', '')
          .set('joinFieldFeed', ''),
        useDataSources: []
      }, [])
      this.setState({ spatialJoinFields: [] })
      return
    }

    // Load fields from the selected layer
    this.loadSpatialJoinFields(useDs.dataSourceId)

    // Reset join field (service) since layer changed
    const newConfig = this.props.config.set('joinFieldService', '')

    // Save useDataSources on the widget; don't register output DS yet (need join fields)
    this.props.onSettingChange({
      id: this.props.id,
      config: newConfig,
      useDataSources: Immutable([useDs])
    }, [])
  }

  onJoinFieldServiceChange = (evt: React.ChangeEvent<HTMLSelectElement>): void => {
    const newConfig = this.props.config.set('joinFieldService', evt.target.value)
    this.saveConfigWithOutputDs(newConfig)
  }

  onJoinFieldFeedChange = (evt: React.ChangeEvent<HTMLSelectElement>): void => {
    const newConfig = this.props.config.set('joinFieldFeed', evt.target.value)
    this.saveConfigWithOutputDs(newConfig)
  }

  /**
   * Save config and register/deregister the output data source
   * based on whether all Map Integration fields are filled in.
   */
  private saveConfigWithOutputDs (newConfig: IMConfig): void {
    const useDs = this.props.useDataSources?.[0] as UseDataSource | undefined
    const joinFieldService = newConfig.joinFieldService as string
    const joinFieldFeed = newConfig.joinFieldFeed as string
    const allFilled = !!useDs && !!joinFieldService && !!joinFieldFeed

    if (allFilled) {
      const ds = DataSourceManager.getInstance().getDataSource(useDs.dataSourceId)
      if (ds) {
        const outputDsJson = buildOutputDataSourceJson(this.props.id, ds, useDs)
        this.props.onSettingChange({
          id: this.props.id,
          config: newConfig
        }, [outputDsJson])
        return
      }
    }

    // Not fully configured — deregister output DS
    this.props.onSettingChange({
      id: this.props.id,
      config: newConfig
    }, [])
  }

  render (): React.ReactElement {
    const { config } = this.props
    const { discoveredFields, isDiscovering, discoverError } = this.state
    const hasFields = discoveredFields.length > 0
    const statusValues = config.statusField ? this.getUniqueValuesForField(config.statusField) : []
    const colorMap = (config.statusColorMap as any) || {}
    const hasSpatialJoinDs = this.props.useDataSources && this.props.useDataSources.length > 0

    return (
      <div className='jimu-widget-setting setting-feed-simple__setting-content h-100'>

        {/* ── Feed Source ── */}
        <SettingSection title={this.getI18nMessage('feedSource')}>
          <SettingRow flow='wrap' label={this.getI18nMessage('feedUrl')}>
            <TextInput
              className='w-100'
              size='sm'
              placeholder='https://example.com/feed.xml'
              value={config.feedUrl || ''}
              onChange={(e) => { this.onFeedUrlChange(e.target.value) }}
            />
          </SettingRow>

          <SettingRow flow='wrap' label='Root item element'>
            <TextInput
              className='w-100'
              size='sm'
              placeholder='item'
              value={config.rootItemElement || ''}
              onChange={(e) => {
                this.props.onSettingChange({
                  id: this.props.id,
                  config: this.props.config.set('rootItemElement', e.target.value)
                })
              }}
            />
            <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 2px;`}>
              The repeating XML element that wraps each item (e.g. item, entry, event)
            </div>
          </SettingRow>

          <SettingRow flow='wrap' label='Fields'>
            <Button
              className='w-100'
              size='sm'
              type='primary'
              disabled={isDiscovering || !config.feedUrl}
              onClick={this.onDiscoverFields}
            >
              {isDiscovering ? 'Reading feed...' : 'Discover Fields'}
            </Button>

            {discoverError && (
              <div css={css`font-size: 11px; color: var(--sys-color-danger-main); margin-top: 4px;`}>
                {discoverError}
                {discoverError.includes('Failed to fetch') && (
                  <span css={css`display: block; margin-top: 2px; color: var(--sys-color-text-tertiary);`}>
                    This may be a CORS restriction. Add field names manually below — the feed will load at runtime via the portal proxy.
                  </span>
                )}
              </div>
            )}

            {/* Manual field entry — fallback when Discover can't reach the feed (CORS) */}
            <div css={css`margin-top: 8px; display: flex; gap: 4px;`}>
              <TextInput
                size='sm'
                placeholder='Type field name...'
                value={this.state.manualFieldInput}
                onChange={(evt) => this.setState({ manualFieldInput: (evt.target as HTMLInputElement).value })}
                onKeyDown={(evt) => {
                  if (evt.key === 'Enter') {
                    evt.preventDefault()
                    this.onAddManualField()
                  }
                }}
                css={css`flex: 1;`}
              />
              <Button
                size='sm'
                type='default'
                disabled={!this.state.manualFieldInput.trim()}
                onClick={this.onAddManualField}
              >
                Add
              </Button>
            </div>
            <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 2px;`}>
              Or type field names manually if the feed can't be reached.
            </div>

            {hasFields && (
              <div css={css`margin-top: 6px; font-size: 11px; color: var(--sys-color-text-tertiary);`}>
                {discoveredFields.length} fields found
                {discoveredFields.some(f => f.includes('.')) && (
                  <span css={css`display: block; margin-top: 2px; font-style: italic;`}>
                    Nested fields use dot notation (e.g. origin.time.value)
                  </span>
                )}
              </div>
            )}
          </SettingRow>
        </SettingSection>

        {/* ── Card Template ── */}
        <SettingSection title={this.getI18nMessage('cardTemplate')}>
          <SettingRow flow='wrap' label='Template'>
            <textarea
              ref={this.templateTextareaRef}
              aria-label='Card template'
              className='w-100'
              rows={8}
              placeholder={'**{{status}}** - {{location}}\n{{description}}\nUpdated: {{changeDate}}'}
              value={config.cardTemplate || ''}
              onChange={this.onCardTemplateChange}
              css={css`
                font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
                font-size: 12px;
                line-height: 1.5;
                padding: 8px;
                border: 1px solid var(--sys-color-divider-secondary);
                border-radius: 4px;
                background: var(--sys-color-surface-paper);
                color: var(--sys-color-text-primary);
                resize: vertical;
                &:focus {
                  outline: 2px solid var(--sys-color-primary-main);
                  outline-offset: -1px;
                }
              `}
            />
            {this.renderTemplateHelp(this.state.templateHelpOpen, 'templateHelpOpen')}
          </SettingRow>

          {hasFields && (
            <SettingRow flow='wrap' label='Insert Field'>
              <div css={css`display: flex; flex-wrap: wrap; gap: 4px; max-height: 200px; overflow-y: auto; padding: 4px;`}>
                {discoveredFields.map((field) => (
                  <button
                    key={field}
                    type='button'
                    aria-label={`Insert {{${field}}} token`}
                    onClick={() => { this.onInsertFieldToken(field) }}
                    css={css`
                      display: inline-block;
                      padding: 2px 8px;
                      border-radius: 3px;
                      border: 1px solid var(--sys-color-divider-secondary);
                      background: var(--ref-palette-neutral-200);
                      color: var(--ref-palette-neutral-1000);
                      font-family: monospace;
                      font-size: 11px;
                      cursor: pointer;
                      &:hover {
                        background: var(--sys-color-primary-light);
                        border-color: var(--sys-color-primary-main);
                      }
                    `}
                  >
                    {field}
                  </button>
                ))}
              </div>
            </SettingRow>
          )}

          <SettingRow flow='wrap' label='Card Template (Mobile)'>
            <textarea
              className='w-100'
              placeholder='(Desktop template used on all screens if empty)'
              value={(config as any).cardTemplateMobile || ''}
              aria-label='Mobile card template'
              onChange={(e) => {
                this.props.onSettingChange({
                  id: this.props.id,
                  config: this.props.config.set('cardTemplateMobile', e.target.value)
                })
              }}
              rows={3}
              css={css`
                font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                font-size: 11px;
                padding: 6px 8px;
                border: 1px solid var(--sys-color-divider-secondary);
                border-radius: 4px;
                background: var(--sys-color-surface-paper);
                color: var(--sys-color-text-primary);
                resize: vertical;
                line-height: 1.5;
              `}
            />
            <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px; line-height: 1.4;`}>
              Optional simplified template for viewports ≤ 600px. Uses the same {'{{token}}'} syntax.
            </div>
          </SettingRow>

          {config.cardTemplate && (
            <SettingRow flow='wrap' label='Preview'>
              <div
                css={css`
                  width: 100%;
                  padding: 8px;
                  border: 1px solid var(--sys-color-divider-secondary);
                  border-radius: 4px;
                  background: var(--sys-color-surface-overlay);
                  font-size: 0.85rem;
                  line-height: 1.4;
                  color: var(--sys-color-text-primary);
                  p { margin: 0 0 4px 0; }
                  h3, h4, h5, h6 { margin: 0 0 4px 0; }
                  hr { margin: 6px 0; border: none; border-top: 1px solid var(--sys-color-divider-secondary); }
                  ul { margin: 0; padding-left: 20px; }
                  li { margin-bottom: 2px; }
                `}
                dangerouslySetInnerHTML={{ __html: renderPreview(config.cardTemplate) }}
              />
            </SettingRow>
          )}
        </SettingSection>

        {/* ── Card Colors ── */}
        <SettingSection title='Card Colors'>
          <SettingRow flow='wrap' label={this.getI18nMessage('statusField')}>
            {hasFields
              ? (
                <Select
                  className='w-100'
                  size='sm'
                  value={config.statusField || ''}
                  onChange={this.onStatusFieldChange}
                >
                  <Option value=''>(None — no color coding)</Option>
                  {discoveredFields.map((field) => (
                    <Option key={field} value={field}>{field}</Option>
                  ))}
                </Select>
                )
              : (
                <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); font-style: italic;`}>
                  Click "Discover Fields" above to load available fields.
                </div>
                )}
          </SettingRow>

          {/* Color mode toggle — only show when a field is selected */}
          {config.statusField && (
            <SettingRow flow='wrap' label='Color Mode'>
              <Select
                className='w-100'
                size='sm'
                value={config.colorMode || 'exact'}
                onChange={this.onColorModeChange}
              >
                <Option value='exact'>Exact match (text values)</Option>
                <Option value='range'>Numeric range</Option>
              </Select>
            </SettingRow>
          )}

          {/* Exact match color pickers */}
          {config.statusField && (config.colorMode || 'exact') === 'exact' && statusValues.length > 0 && (
            <SettingRow flow='wrap' label='Colors'>
              <div css={css`width: 100%; display: flex; flex-direction: column; gap: 6px;`}>
                {statusValues.map((val) => (
                  <div
                    key={val}
                    css={css`
                      display: flex;
                      align-items: center;
                      gap: 8px;
                    `}
                  >
                    <input
                      type='color'
                      aria-label={`Color for status: ${val}`}
                      value={colorMap[val] || '#ffffff'}
                      onChange={(e) => { this.onStatusColorChange(val, e.target.value) }}
                      css={css`
                        width: 28px;
                        height: 28px;
                        border: 1px solid var(--sys-color-divider-secondary);
                        border-radius: 4px;
                        padding: 2px;
                        cursor: pointer;
                        background: transparent;
                      `}
                    />
                    <span css={css`font-size: 12px;`}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </SettingRow>
          )}

          {config.statusField && (config.colorMode || 'exact') === 'exact' && statusValues.length === 0 && (
            <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); font-style: italic; padding: 0 16px 8px;`}>
              Click "Discover Fields" to load status values for color assignment.
            </div>
          )}

          {/* Range-based color breaks */}
          {config.statusField && config.colorMode === 'range' && (
            <SettingRow flow='wrap' label='Range Breaks'>
              <div css={css`width: 100%; display: flex; flex-direction: column; gap: 8px;`}>
                <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); line-height: 1.4;`}>
                  Each range matches: min ≤ value {'<'} max. Leave min or max empty for unbounded.
                  Ranges are checked top-to-bottom — first match wins.
                </div>
                {((config.rangeColorBreaks as any as RangeColorBreak[]) || []).map((brk, idx) => (
                  <div
                    key={idx}
                    draggable
                    onDragStart={() => { this.onBreakDragStart(idx) }}
                    onDragEnter={() => { this.onBreakDragEnter(idx) }}
                    onDragOver={this.onBreakDragOver}
                    onDrop={this.onBreakDrop}
                    onDragEnd={this.onBreakDragEnd}
                    css={css`
                      display: flex;
                      align-items: stretch;
                      gap: 6px;
                      padding: 6px 8px;
                      border: 1px solid var(--sys-color-divider-secondary, #444);
                      border-radius: 4px;
                      border-left: 4px solid ${brk.color || '#ccc'};
                      background: var(--sys-color-surface-overlay, rgba(255,255,255,0.04));
                      transition: opacity 0.15s, border-color 0.15s;
                      ${this.state.dragIndex === idx ? 'opacity: 0.4;' : ''}
                      ${this.state.dragOverIndex === idx && this.state.dragIndex !== idx
                        ? 'border-top: 2px solid var(--sys-color-primary-main, #007AFF);'
                        : ''}
                    `}
                  >
                    {/* Drag handle */}
                    <div
                      css={css`
                        display: flex;
                        align-items: center;
                        cursor: grab;
                        color: var(--sys-color-text-tertiary);
                        font-size: 12px;
                        flex-shrink: 0;
                        padding: 0 2px;
                        user-select: none;
                        &:active { cursor: grabbing; }
                      `}
                      title='Drag to reorder'
                      aria-label='Drag to reorder'
                    >⠿</div>
                    <input
                      type='color'
                      aria-label={`Card color for range ${idx + 1}`}
                      value={brk.color || '#FFD700'}
                      onChange={(e) => { this.onUpdateRangeBreak(idx, 'color', e.target.value) }}
                      css={css`
                        width: 24px;
                        height: 24px;
                        border: 1px solid var(--sys-color-divider-secondary);
                        border-radius: 3px;
                        padding: 1px;
                        cursor: pointer;
                        background: transparent;
                        flex-shrink: 0;
                        align-self: center;
                      `}
                    />
                    <div css={css`display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0;`}>
                      <div css={css`display: flex; align-items: center; gap: 4px;`}>
                        <NumericInput
                          size='sm'
                          placeholder='min'
                          value={brk.min ?? undefined}
                          onAcceptValue={(v) => { this.onUpdateRangeBreak(idx, 'min', v === null || v === undefined || isNaN(v) ? null : v) }}
                          css={css`width: 60px; font-size: 11px;`}
                        />
                        <span css={css`font-size: 11px; color: var(--sys-color-text-tertiary);`}>to</span>
                        <NumericInput
                          size='sm'
                          placeholder='max'
                          value={brk.max ?? undefined}
                          onAcceptValue={(v) => { this.onUpdateRangeBreak(idx, 'max', v === null || v === undefined || isNaN(v) ? null : v) }}
                          css={css`width: 60px; font-size: 11px;`}
                        />
                      </div>
                      <TextInput
                        size='sm'
                        placeholder='Label (optional)'
                        value={brk.label || ''}
                        onChange={(e) => { this.onUpdateRangeBreak(idx, 'label', (e.target as HTMLInputElement).value) }}
                        css={css`font-size: 11px;`}
                      />
                      {/* Per-break map layer overrides (map color, size, marker style) */}
                      <div css={css`display: flex; align-items: center; gap: 4px;`}>
                        <input
                          type='color'
                          aria-label='Map symbol color override'
                          value={brk.mapColor || brk.color || '#FFD700'}
                          onChange={(e) => { this.onUpdateRangeBreak(idx, 'mapColor' as any, e.target.value) }}
                          title='Map symbol color (overrides card color)'
                          css={css`
                            width: 22px; height: 22px;
                            border: 1px solid var(--sys-color-divider-secondary);
                            border-radius: 3px; padding: 1px;
                            cursor: pointer; background: transparent; flex-shrink: 0;
                          `}
                        />
                        <NumericInput
                          size='sm'
                          placeholder='Size'
                          min={4}
                          max={24}
                          step={1}
                          value={brk.size ?? undefined}
                          onAcceptValue={(v) => { this.onUpdateRangeBreak(idx, 'size' as any, v === null || v === undefined || isNaN(v) ? undefined : v) }}
                          css={css`width: 56px; font-size: 11px;`}
                        />
                        <Select
                          size='sm'
                          value={brk.markerStyle || ''}
                          onChange={(evt) => { this.onUpdateRangeBreak(idx, 'markerStyle' as any, evt.target.value || undefined) }}
                          css={css`flex: 1; min-width: 0; font-size: 11px;`}
                        >
                          <Option value=''>(Default)</Option>
                          <Option value='circle'>Circle</Option>
                          <Option value='square'>Square</Option>
                          <Option value='diamond'>Diamond</Option>
                          <Option value='cross'>Cross</Option>
                          <Option value='x'>X</Option>
                        </Select>
                      </div>
                    </div>
                    <button
                      type='button'
                      onClick={() => { this.onRemoveRangeBreak(idx) }}
                      aria-label='Remove range'
                      title='Remove range'
                      css={css`
                        background: none;
                        border: none;
                        cursor: pointer;
                        font-size: 14px;
                        padding: 2px;
                        color: var(--sys-color-text-tertiary);
                        flex-shrink: 0;
                        align-self: flex-start;
                        margin-top: 2px;
                        &:hover { color: var(--sys-color-danger-main); }
                      `}
                    >✕</button>
                  </div>
                ))}
                <Button
                  type='default'
                  size='sm'
                  onClick={this.onAddRangeBreak}
                >
                  + Add Range
                </Button>
              </div>
            </SettingRow>
          )}

          {/* Show Color Legend toggle — only when a status field is selected */}
          {config.statusField && (
            <SettingRow label='Show color legend'>
              <Switch
                checked={config.showColorLegend !== false}
                onChange={this.onShowColorLegendChange}
              />
            </SettingRow>
          )}
        </SettingSection>

        {/* ── Hover Text — only show when fields are discovered ── */}
        {hasFields && (
        <SettingSection title='Hover Text'>
          <SettingRow flow='wrap' label='Tooltip Field'>
            <Select
              className='w-100'
              size='sm'
              value={config.hoverTextField || ''}
              onChange={this.onHoverTextFieldChange}
            >
              <Option value=''>(None)</Option>
              {discoveredFields.map((field) => (
                <Option key={field} value={field}>{field}</Option>
              ))}
            </Select>
            <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
              Shows the selected field's value as a tooltip when hovering over a card.
            </div>
          </SettingRow>
        </SettingSection>
        )}

        {/* ── Polling ── */}
        <SettingSection title={this.getI18nMessage('polling')}>
          <SettingRow flow='wrap' label={this.getI18nMessage('refreshInterval')}>
            <NumericInput
              className='w-100'
              size='sm'
              min={0}
              max={3600}
              step={5}
              value={config.refreshInterval ?? 30}
              onAcceptValue={this.onRefreshIntervalChange}
            />
            <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
              Minimum 15 seconds. Set to 0 for manual refresh only.
            </div>
          </SettingRow>
          <SettingRow label={this.getI18nMessage('showLastUpdated')}>
            <Switch
              checked={config.showLastUpdated !== false}
              onChange={this.onShowLastUpdatedChange}
            />
          </SettingRow>
          <SettingRow label='Highlight New Items'>
            <Switch
              checked={config.highlightNewItems === true}
              onChange={this.onHighlightNewItemsChange}
            />
          </SettingRow>
        </SettingSection>

        {/* ── Sorting ── */}
        <SettingSection title={this.getI18nMessage('sorting')}>
          <SettingRow label='Enable Sort Controls'>
            <Switch
              checked={config.enableSortControls !== false}
              onChange={(evt) => { this.setConfigValue('enableSortControls', (evt.target as HTMLInputElement).checked) }}
            />
          </SettingRow>
          <SettingRow flow='wrap' label='Default Sort Field'>
            {hasFields
              ? (
                <Select
                  className='w-100'
                  size='sm'
                  value={config.sortField || ''}
                  onChange={this.onSortFieldChange}
                >
                  <Option value=''>(None — keep feed order)</Option>
                  {discoveredFields.map((field) => (
                    <Option key={field} value={field}>{field}</Option>
                  ))}
                </Select>
                )
              : (
                <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); font-style: italic;`}>
                  Click "Discover Fields" above to load available fields.
                </div>
                )}
          </SettingRow>
          {config.sortField && (
            <SettingRow flow='wrap' label='Default Sort Direction'>
              <Select
                size='sm'
                value={config.sortDirection || 'asc'}
                onChange={this.onSortDirectionChange}
              >
                <Option value='asc'>{this.getI18nMessage('sortAsc')}</Option>
                <Option value='desc'>{this.getI18nMessage('sortDesc')}</Option>
              </Select>
            </SettingRow>
          )}
          {!config.sortField && (
            <SettingRow label='Reverse Feed Order'>
              <Switch
                checked={config.reverseFeedOrder === true}
                onChange={this.onReverseFeedOrderChange}
              />
            </SettingRow>
          )}
          {hasFields && (
            <SettingRow flow='wrap' label='Sortable Fields'>
              <div css={css`width: 100%; display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto;`}>
                <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-bottom: 4px;`}>
                  Leave all unchecked to allow sorting by any field.
                </div>
                {discoveredFields.map((field) => {
                  const sortableFields = (config.sortableFields as any as string[]) || []
                  const isChecked = sortableFields.includes(field)
                  return (
                    <label
                      key={field}
                      css={css`
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 12px;
                        cursor: pointer;
                        color: var(--sys-color-text-primary);
                      `}
                    >
                      <input
                        type='checkbox'
                        checked={isChecked}
                        onChange={(e) => {
                          const current = (config.sortableFields as any as string[]) || []
                          const updated = e.target.checked
                            ? [...current, field]
                            : current.filter((f: string) => f !== field)
                          this.setConfigValue('sortableFields', updated)
                        }}
                      />
                      {field}
                    </label>
                  )
                })}
              </div>
            </SettingRow>
          )}
        </SettingSection>

        {/* ── Display Limits ── */}
        <SettingSection title='Display Limits'>
          <SettingRow flow='wrap' label='Max Items'>
            <NumericInput
              className='w-100'
              size='sm'
              min={0}
              max={500}
              step={1}
              value={config.maxItems ?? 0}
              onAcceptValue={this.onMaxItemsChange}
            />
            <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
              0 = show all items
            </div>
          </SettingRow>

          {/* Filter by Status — exact mode: checkboxes; range mode: numeric min/max */}
          {config.statusField && config.colorMode === 'range' && (
            <SettingRow flow='wrap' label='Numeric Filter'>
              <div css={css`width: 100%; display: flex; align-items: center; gap: 6px;`}>
                <NumericInput
                  size='sm'
                  placeholder='min'
                  value={config.filterNumericMin ?? undefined}
                  onAcceptValue={(v) => { this.setConfigValue('filterNumericMin', v === null || v === undefined || isNaN(v) ? null : v) }}
                  css={css`flex: 1; font-size: 11px;`}
                />
                <span css={css`font-size: 11px; color: var(--sys-color-text-tertiary);`}>to</span>
                <NumericInput
                  size='sm'
                  placeholder='max'
                  value={config.filterNumericMax ?? undefined}
                  onAcceptValue={(v) => { this.setConfigValue('filterNumericMax', v === null || v === undefined || isNaN(v) ? null : v) }}
                  css={css`flex: 1; font-size: 11px;`}
                />
              </div>
              <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px; line-height: 1.4;`}>
                Only show items where the status field value falls within this range. Leave empty for no limit.
              </div>
            </SettingRow>
          )}
          {config.statusField && (config.colorMode || 'exact') === 'exact' && statusValues.length > 0 && (
            <SettingRow flow='wrap' label='Show Status Values'>
              <div css={css`width: 100%; display: flex; flex-direction: column; gap: 4px;`}>
                {statusValues.map((val) => {
                  const filterList = (config.filterByStatus as any as string[]) || []
                  const isHidden = filterList.includes(val)
                  return (
                    <label
                      key={val}
                      css={css`
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 12px;
                        cursor: pointer;
                        color: var(--sys-color-text-primary);
                      `}
                    >
                      <input
                        type='checkbox'
                        checked={!isHidden}
                        onChange={(e) => { this.onFilterByStatusToggle(val, !e.target.checked) }}
                      />
                      {val}
                    </label>
                  )
                })}
              </div>
              <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
                Uncheck values to hide them from the display.
              </div>
            </SettingRow>
          )}
        </SettingSection>

        {/* ── Search ── */}
        <SettingSection title='Search'>
          <SettingRow label='Enable Search Bar'>
            <Switch
              checked={config.enableSearchBar !== false}
              onChange={(evt) => { this.setConfigValue('enableSearchBar', (evt.target as HTMLInputElement).checked) }}
            />
          </SettingRow>
          {config.enableSearchBar !== false && (
          <SettingRow flow='wrap' label='Search Placeholder'>
            <TextInput
              className='w-100'
              size='sm'
              placeholder='Search...'
              value={config.searchPlaceholder || ''}
              onChange={(e) => { this.setConfigValue('searchPlaceholder', e.target.value) }}
            />
          </SettingRow>
          {hasFields && (
            <SettingRow flow='wrap' label='Search Fields'>
              <div css={css`width: 100%; display: flex; flex-direction: column; gap: 4px; max-height: 200px; overflow-y: auto;`}>
                <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-bottom: 4px;`}>
                  Leave all unchecked to search all fields.
                </div>
                {this.state.discoveredFields.map((field) => {
                  const searchFields = (config.searchFields as any as string[]) || []
                  const isChecked = searchFields.includes(field)
                  return (
                    <label
                      key={field}
                      css={css`
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-size: 12px;
                        cursor: pointer;
                        color: var(--sys-color-text-primary);
                      `}
                    >
                      <input
                        type='checkbox'
                        checked={isChecked}
                        onChange={(e) => {
                          const current = (config.searchFields as any as string[]) || []
                          const updated = e.target.checked
                            ? [...current, field]
                            : current.filter((f: string) => f !== field)
                          this.setConfigValue('searchFields', updated)
                        }}
                      />
                      {field}
                    </label>
                  )
                })}
              </div>
            </SettingRow>
          )}
        </SettingSection>

        {/* ── Pagination & Labels ── */}
        <SettingSection title='Pagination & Labels'>
          {(config.maxItems ?? 0) > 0 && (
            <React.Fragment>
              <SettingRow flow='wrap' label='Show More Button Label'>
                <TextInput
                  className='w-100'
                  size='sm'
                  placeholder='Show more ({n} remaining)'
                  value={config.showMoreLabel || ''}
                  onChange={(e) => { this.setConfigValue('showMoreLabel', e.target.value) }}
                />
                <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
                  Use {'{n}'} for remaining count.
                </div>
              </SettingRow>
              <SettingRow label='Show "Show All" Button'>
                <Switch
                  checked={config.showShowAllButton === true}
                  onChange={(evt) => { this.setConfigValue('showShowAllButton', (evt.target as HTMLInputElement).checked) }}
                />
              </SettingRow>
            </React.Fragment>
          )}
          <SettingRow flow='wrap' label='Item Label (singular)'>
            <TextInput
              className='w-100'
              size='sm'
              placeholder='item'
              value={config.itemLabelSingular || ''}
              onChange={(e) => { this.setConfigValue('itemLabelSingular', e.target.value) }}
            />
          </SettingRow>
          <SettingRow flow='wrap' label='Item Label (plural)'>
            <TextInput
              className='w-100'
              size='sm'
              placeholder='items'
              value={config.itemLabelPlural || ''}
              onChange={(e) => { this.setConfigValue('itemLabelPlural', e.target.value) }}
            />
          </SettingRow>
        </SettingSection>

        {/* ── CSV Export (hidden — not ready for production) ── */}
        {false && <SettingSection title='CSV Export'>
          <SettingRow label='Enable CSV Export'>
            <Switch
              checked={config.enableCsvExport === true}
              onChange={(evt) => { this.setConfigValue('enableCsvExport', (evt.target as HTMLInputElement).checked) }}
            />
          </SettingRow>
          {config.enableCsvExport && (
            <React.Fragment>
              <SettingRow flow='wrap' label='Button Label'>
                <TextInput
                  className='w-100'
                  size='sm'
                  placeholder='Export CSV'
                  value={config.exportButtonLabel || ''}
                  onChange={(e) => { this.setConfigValue('exportButtonLabel', e.target.value) }}
                />
              </SettingRow>
              <SettingRow flow='wrap' label='Filename Template'>
                <TextInput
                  className='w-100'
                  size='sm'
                  placeholder='feedsimple-export-{date}'
                  value={config.exportFilenameTemplate || ''}
                  onChange={(e) => { this.setConfigValue('exportFilenameTemplate', e.target.value) }}
                />
                <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px; line-height: 1.4;`}>
                  Use {'{{date}}'} for current date (YYYY-MM-DD).
                </div>
              </SettingRow>
              {/* Export fields checkboxes — shown only when field names are available */}
              {this.state.fieldNames?.length > 0 && (
                <SettingRow flow='wrap' label='Export Fields'>
                  <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-bottom: 4px;`}>
                    Select fields to include. None selected = all fields.
                  </div>
                  {this.state.fieldNames.map(field => {
                    const exportFields: string[] = config.exportFields ? [...config.exportFields as any] : []
                    const isChecked = exportFields.includes(field)
                    return (
                      <label key={field} css={css`
                        display: flex; align-items: center; gap: 6px;
                        font-size: 12px; padding: 2px 0; cursor: pointer;
                      `}>
                        <input
                          type='checkbox'
                          checked={isChecked}
                          onChange={() => {
                            const updated = isChecked
                              ? exportFields.filter(f => f !== field)
                              : [...exportFields, field]
                            this.setConfigValue('exportFields', updated)
                          }}
                        />
                        {field}
                      </label>
                    )
                  })}
                </SettingRow>
              )}
              {/* Column header labels — shown only when export fields are selected */}
              {config.exportFields && (config.exportFields as any).length > 0 && (
                <SettingRow flow='wrap' label='Column Header Labels'>
                  <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-bottom: 4px;`}>
                    Custom labels for CSV column headers. Leave blank to use field name.
                  </div>
                  {[...(config.exportFields as any)].map((field: string) => {
                    const labels: { [key: string]: string } = config.columnHeaderLabels
                      ? { ...(config.columnHeaderLabels as any) }
                      : {}
                    return (
                      <div key={field} css={css`
                        display: flex; align-items: center; gap: 6px;
                        margin-bottom: 4px;
                      `}>
                        <span css={css`font-size: 11px; min-width: 80px; color: var(--sys-color-text-secondary);`}>
                          {field}
                        </span>
                        <TextInput
                          size='sm'
                          placeholder={field}
                          value={labels[field] || ''}
                          onChange={(e) => {
                            const updated = { ...labels, [field]: e.target.value }
                            // Remove empty entries
                            if (!e.target.value) delete updated[field]
                            this.setConfigValue('columnHeaderLabels', updated)
                          }}
                          css={css`flex: 1;`}
                        />
                      </div>
                    )
                  })}
                </SettingRow>
              )}
            </React.Fragment>
          )}
        </SettingSection>}

        {/* ── Feed Map Layer ── */}
        <SettingSection title='Feed Map Layer'>
          <SettingRow label='Enable Map Layer'>
            <Switch
              checked={config.enableFeedMapLayer === true}
              onChange={(evt) => {
                this.props.onSettingChange({
                  id: this.props.id,
                  config: this.props.config.set('enableFeedMapLayer', evt.target.checked)
                })
              }}
            />
          </SettingRow>
          <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); padding: 0 16px 8px; line-height: 1.4;`}>
            When enabled, feed items with lat/lon coordinates are plotted as points on the map and appear in the LayerList.
          </div>

          {config.enableFeedMapLayer && (
            <React.Fragment>
              <SettingRow flow='wrap' label='Latitude Field'>
                {hasFields
                  ? (
                    <Select
                      className='w-100'
                      size='sm'
                      value={config.latitudeField || ''}
                      onChange={(evt) => {
                        this.props.onSettingChange({
                          id: this.props.id,
                          config: this.props.config.set('latitudeField', evt.target.value)
                        })
                      }}
                    >
                      <Option value=''>(Select a field)</Option>
                      {this.getCoordinateCandidates('lat').map((field) => (
                        <Option key={field} value={field}>{field}</Option>
                      ))}
                    </Select>
                    )
                  : (
                    <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); font-style: italic;`}>
                      Click "Discover Fields" above to load feed fields.
                    </div>
                    )}
              </SettingRow>

              <SettingRow flow='wrap' label='Longitude Field'>
                {hasFields
                  ? (
                    <Select
                      className='w-100'
                      size='sm'
                      value={config.longitudeField || ''}
                      onChange={(evt) => {
                        this.props.onSettingChange({
                          id: this.props.id,
                          config: this.props.config.set('longitudeField', evt.target.value)
                        })
                      }}
                    >
                      <Option value=''>(Select a field)</Option>
                      {this.getCoordinateCandidates('lon').map((field) => (
                        <Option key={field} value={field}>{field}</Option>
                      ))}
                    </Select>
                    )
                  : (
                    <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); font-style: italic;`}>
                      Click "Discover Fields" above to load feed fields.
                    </div>
                    )}
              </SettingRow>

              <SettingRow flow='wrap' label='Layer Title'>
                <TextInput
                  className='w-100'
                  size='sm'
                  placeholder='Feed Items'
                  value={config.feedMapLayerTitle || ''}
                  onChange={(e) => {
                    this.props.onSettingChange({
                      id: this.props.id,
                      config: this.props.config.set('feedMapLayerTitle', e.target.value)
                    })
                  }}
                />
              </SettingRow>

              <SettingRow label='Marker Color'>
                <input
                  type='color'
                  aria-label='Marker color'
                  value={config.feedMapLayerColor || '#FF4500'}
                  onChange={(e) => {
                    this.props.onSettingChange({
                      id: this.props.id,
                      config: this.props.config.set('feedMapLayerColor', e.target.value)
                    })
                  }}
                  css={css`
                    width: 36px;
                    height: 28px;
                    border: 1px solid var(--sys-color-divider-secondary);
                    border-radius: 4px;
                    padding: 2px;
                    cursor: pointer;
                    background: transparent;
                  `}
                />
              </SettingRow>

              <SettingRow label='Marker Size'>
                <NumericInput
                  size='sm'
                  style={{ width: 80 }}
                  min={4}
                  max={24}
                  step={1}
                  value={config.feedMapLayerSize || 8}
                  onAcceptValue={(value) => {
                    this.props.onSettingChange({
                      id: this.props.id,
                      config: this.props.config.set('feedMapLayerSize', value)
                    })
                  }}
                />
              </SettingRow>

              <SettingRow flow='wrap' label='Marker Style'>
                <Select
                  className='w-100'
                  size='sm'
                  value={config.feedMapLayerMarkerStyle || 'circle'}
                  onChange={(evt) => {
                    this.props.onSettingChange({
                      id: this.props.id,
                      config: this.props.config.set('feedMapLayerMarkerStyle', evt.target.value)
                    })
                  }}
                >
                  <Option value='circle'>Circle</Option>
                  <Option value='square'>Square</Option>
                  <Option value='diamond'>Diamond</Option>
                  <Option value='cross'>Cross</Option>
                  <Option value='x'>X</Option>
                </Select>
              </SettingRow>

              <SettingRow flow='wrap' label='Outline'>
                <div css={css`display: flex; align-items: center; gap: 8px; width: 100%;`}>
                  <input
                    type='color'
                    aria-label='Outline color'
                    value={config.feedMapLayerOutlineColor || '#FFFFFF'}
                    onChange={(e) => {
                      this.props.onSettingChange({
                        id: this.props.id,
                        config: this.props.config.set('feedMapLayerOutlineColor', e.target.value)
                      })
                    }}
                    css={css`width: 32px; height: 28px; padding: 1px; border: 1px solid var(--sys-color-border-default); border-radius: 4px; cursor: pointer; background: transparent;`}
                  />
                  <NumericInput
                    size='sm'
                    placeholder='Width'
                    min={0}
                    max={5}
                    step={0.5}
                    value={config.feedMapLayerOutlineWidth ?? 1}
                    onAcceptValue={(value) => {
                      this.props.onSettingChange({
                        id: this.props.id,
                        config: this.props.config.set('feedMapLayerOutlineWidth', value ?? 0)
                      })
                    }}
                    css={css`width: 64px;`}
                  />
                  <span css={css`font-size: 11px; color: var(--sys-color-text-tertiary);`}>0 = none</span>
                </div>
              </SettingRow>

              <SettingRow flow='wrap' label='Popup Title'>
                <TextInput
                  className='w-100'
                  size='sm'
                  placeholder='e.g., M{{magnitude.mag.value}} - {{description.text}}'
                  value={(config as any).feedMapLayerPopupTitle || ''}
                  aria-label='Popup title template'
                  onChange={(e) => {
                    this.props.onSettingChange({
                      id: this.props.id,
                      config: this.props.config.set('feedMapLayerPopupTitle', (e.target as HTMLInputElement).value)
                    })
                  }}
                />
                <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 2px; line-height: 1.4;`}>
                  Dynamic title with {'{{token}}'} substitution. Falls back to layer title if empty.
                </div>
              </SettingRow>

              <SettingRow flow='wrap' label='Popup Template'>
                <textarea
                  className='w-100'
                  placeholder='(Uses card template if empty)'
                  value={config.feedMapLayerPopupTemplate || ''}
                  aria-label='Popup template'
                  onChange={(e) => {
                    this.props.onSettingChange({
                      id: this.props.id,
                      config: this.props.config.set('feedMapLayerPopupTemplate', e.target.value)
                    })
                  }}
                  rows={4}
                  css={css`
                    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                    font-size: 11px;
                    padding: 6px 8px;
                    border: 1px solid var(--sys-color-divider-secondary);
                    border-radius: 4px;
                    background: var(--sys-color-surface-paper);
                    color: var(--sys-color-text-primary);
                    resize: vertical;
                    line-height: 1.5;
                  `}
                />
                <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px; line-height: 1.4;`}>
                  Leave empty to reuse the card template for map popups. Supports the same {'{{token}}'} syntax.
                </div>
                {this.renderTemplateHelp(this.state.popupHelpOpen, 'popupHelpOpen')}
              </SettingRow>

              <SettingRow flow='wrap' label='Popup Template (Mobile)'>
                <textarea
                  className='w-100'
                  placeholder='(Desktop template used on all screens if empty)'
                  value={(config as any).feedMapLayerPopupTemplateMobile || ''}
                  aria-label='Mobile popup template'
                  onChange={(e) => {
                    this.props.onSettingChange({
                      id: this.props.id,
                      config: this.props.config.set('feedMapLayerPopupTemplateMobile', e.target.value)
                    })
                  }}
                  rows={3}
                  css={css`
                    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                    font-size: 11px;
                    padding: 6px 8px;
                    border: 1px solid var(--sys-color-divider-secondary);
                    border-radius: 4px;
                    background: var(--sys-color-surface-paper);
                    color: var(--sys-color-text-primary);
                    resize: vertical;
                    line-height: 1.5;
                  `}
                />
                <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px; line-height: 1.4;`}>
                  Optional simplified template for viewports ≤ 600px. Uses the same {'{{token}}'} syntax.
                </div>
              </SettingRow>

              {/* ── Mobile Popup Behavior ── */}
              <SettingRow flow='wrap' label='Mobile Popup Behavior'>
                <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-bottom: 8px; line-height: 1.4;`}>
                  Controls how popups behave on viewports ≤ 600px.
                </div>

                {/* Open Collapsed */}
                <div css={css`display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 8px;`}>
                  <div>
                    <div css={css`font-size: 12px; color: var(--sys-color-text-primary);`}>Open Collapsed</div>
                    <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary);`}>Show only the title bar. User taps to expand.</div>
                  </div>
                  <Switch
                    checked={(config as any).mobilePopupCollapsed === true}
                    onChange={(evt) => {
                      this.props.onSettingChange({
                        id: this.props.id,
                        config: this.props.config.set('mobilePopupCollapsed', evt.target.checked)
                      })
                    }}
                  />
                </div>

                {/* Dock Position */}
                <div css={css`width: 100%; margin-bottom: 8px;`}>
                  <div css={css`font-size: 12px; color: var(--sys-color-text-primary); margin-bottom: 4px;`}>Dock Position</div>
                  <Select
                    size='sm'
                    value={(config as any).mobilePopupDockPosition || ''}
                    onChange={(evt) => {
                      this.props.onSettingChange({
                        id: this.props.id,
                        config: this.props.config.set('mobilePopupDockPosition', evt.target.value)
                      })
                    }}
                  >
                    <Option value=''>Auto (JSAPI default)</Option>
                    <Option value='top-center'>Top</Option>
                    <Option value='bottom-center'>Bottom</Option>
                  </Select>
                  <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
                    Pin popup to a fixed position on mobile.
                  </div>
                </div>

                {/* Hide Dock Button — only show when dock position is explicitly set */}
                {(config as any).mobilePopupDockPosition && (
                  <div css={css`display: flex; align-items: center; justify-content: space-between; width: 100%; margin-bottom: 8px;`}>
                    <div>
                      <div css={css`font-size: 12px; color: var(--sys-color-text-primary);`}>Hide Dock Button</div>
                      <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary);`}>Prevent users from undocking the popup.</div>
                    </div>
                    <Switch
                      checked={(config as any).mobilePopupHideDockButton === true}
                      onChange={(evt) => {
                        this.props.onSettingChange({
                          id: this.props.id,
                          config: this.props.config.set('mobilePopupHideDockButton', evt.target.checked)
                        })
                      }}
                    />
                  </div>
                )}

                {/* Hide Action Bar */}
                <div css={css`display: flex; align-items: center; justify-content: space-between; width: 100%;`}>
                  <div>
                    <div css={css`font-size: 12px; color: var(--sys-color-text-primary);`}>Hide Action Bar</div>
                    <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary);`}>Remove zoom-to and other action buttons.</div>
                  </div>
                  <Switch
                    checked={(config as any).mobilePopupHideActionBar === true}
                    onChange={(evt) => {
                      this.props.onSettingChange({
                        id: this.props.id,
                        config: this.props.config.set('mobilePopupHideActionBar', evt.target.checked)
                      })
                    }}
                  />
                </div>
              </SettingRow>

              {/* Map Widget selector — only show if not already set by Map Integration */}
              {!config.mapWidgetId && (
                <SettingRow flow='wrap' label='Map Widget'>
                  <MapWidgetSelector
                    onSelect={(mapWidgetIds) => {
                      const selectedId = mapWidgetIds && mapWidgetIds.length > 0 ? mapWidgetIds[0] : ''
                      this.props.onSettingChange({
                        id: this.props.id,
                        config: this.props.config.set('mapWidgetId', selectedId)
                      })
                    }}
                    useMapWidgetIds={config.mapWidgetId
                      ? Immutable([config.mapWidgetId] as string[])
                      : undefined}
                  />
                  <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
                    Select the map widget to display feed points on.
                  </div>
                </SettingRow>
              )}

              {config.mapWidgetId && (
                <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); padding: 0 16px 8px; font-style: italic;`}>
                  Using map widget from Map Integration section.
                </div>
              )}

              {config.enableFeedMapLayer && config.latitudeField && config.longitudeField && config.mapWidgetId && (
                <div css={css`
                  font-size: 11px;
                  color: var(--sys-color-success-main);
                  background: var(--sys-color-success-container);
                  border: 1px solid var(--sys-color-success-main);
                  border-radius: 4px;
                  padding: 6px 10px;
                  margin: 0 16px 8px;
                `}>
                  Feed Map Layer active — items with coordinates will appear as points on the map.
                </div>
              )}
            </React.Fragment>
          )}
        </SettingSection>

        {/* ── Map Integration ── */}
        <SettingSection title='Map Integration'>
          <SettingRow flow='wrap' label='Feature Layer'>
            <DataSourceSelector
              widgetId={this.props.id}
              mustUseDataSource
              types={SPATIAL_JOIN_DS_TYPES}
              isMultiple={false}
              useDataSources={this.props.useDataSources}
              onChange={this.onSpatialJoinDsChange}
              closeDataSourceListOnChange
            />
            <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
              Select a feature layer from the map to join with feed items.
            </div>
          </SettingRow>

          {hasSpatialJoinDs && (
            <SettingRow flow='wrap' label='Join Field (Layer)'>
              {this.state.spatialJoinFields.length > 0
                ? (
                  <Select
                    className='w-100'
                    size='sm'
                    value={config.joinFieldService || ''}
                    onChange={this.onJoinFieldServiceChange}
                  >
                    <Option value=''>(Select a field)</Option>
                    {this.state.spatialJoinFields.map((field) => (
                      <Option key={field} value={field}>{field}</Option>
                    ))}
                  </Select>
                  )
                : (
                  <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); font-style: italic;`}>
                    Loading layer fields...
                  </div>
                  )}
              <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
                Field on the feature layer to match against.
              </div>
            </SettingRow>
          )}

          {hasSpatialJoinDs && (
            <SettingRow flow='wrap' label='Join Field (Feed)'>
              {hasFields
                ? (
                  <Select
                    className='w-100'
                    size='sm'
                    value={config.joinFieldFeed || ''}
                    onChange={this.onJoinFieldFeedChange}
                  >
                    <Option value=''>(Select a field)</Option>
                    {discoveredFields.map((field) => (
                      <Option key={field} value={field}>{field}</Option>
                    ))}
                  </Select>
                  )
                : (
                  <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); font-style: italic;`}>
                    Click "Discover Fields" above to load feed fields.
                  </div>
                  )}
              <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
                Feed field whose values match the layer join field.
              </div>
            </SettingRow>
          )}

          {hasSpatialJoinDs && config.joinFieldService && config.joinFieldFeed && (
            <SettingRow flow='wrap' label='Map Widget'>
              <MapWidgetSelector
                onSelect={(mapWidgetIds) => {
                  const selectedId = mapWidgetIds && mapWidgetIds.length > 0 ? mapWidgetIds[0] : ''
                  this.props.onSettingChange({
                    id: this.props.id,
                    config: this.props.config.set('mapWidgetId', selectedId)
                  })
                }}
                useMapWidgetIds={config.mapWidgetId
                  ? Immutable([config.mapWidgetId] as string[])
                  : undefined}
              />
              <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
                Map widget to zoom and identify features on card click.
              </div>
            </SettingRow>
          )}

          {hasSpatialJoinDs && config.joinFieldService && config.joinFieldFeed && config.mapWidgetId && (
              <div css={css`
                font-size: 11px;
                color: var(--sys-color-success-main);
                background: var(--sys-color-success-container);
                border: 1px solid var(--sys-color-success-main);
                border-radius: 4px;
                padding: 6px 10px;
                margin: 0 16px 8px;
              `}>
                Map integration active — feed items will be linked to map features.
              </div>
          )}
        </SettingSection>

        {/* ── Zoom & Click Behavior ── */}
        {/* Show when either Feed Map Layer or Spatial Join is fully configured with a map widget */}
        {config.mapWidgetId && (
          (config.enableFeedMapLayer && config.latitudeField && config.longitudeField) ||
          (hasSpatialJoinDs && config.joinFieldService && config.joinFieldFeed)
        ) && (
          <SettingSection title='Zoom & Click Behavior'>
            <SettingRow label='Zoom on Card Click'>
              <Switch
                checked={config.enableZoomOnClick !== false}
                onChange={(evt) => {
                  const checked = evt.target.checked
                  let newConfig = this.props.config.set('enableZoomOnClick', checked)
                  // Mutually exclusive: if enabling zoom, disable center
                  if (checked && (config.enableCenterOnClick === true)) {
                    newConfig = newConfig.set('enableCenterOnClick', false)
                  }
                  this.props.onSettingChange({ id: this.props.id, config: newConfig })
                }}
              />
            </SettingRow>
            <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); padding: 0 16px 8px; line-height: 1.4;`}>
              When enabled, clicking a card zooms the map to the corresponding feature or point.
            </div>

            <SettingRow label='Center on Card Click'>
              <Switch
                checked={config.enableCenterOnClick === true}
                onChange={(evt) => {
                  const checked = evt.target.checked
                  let newConfig = this.props.config.set('enableCenterOnClick', checked)
                  // Mutually exclusive: if enabling center, disable zoom
                  if (checked && config.enableZoomOnClick !== false) {
                    newConfig = newConfig.set('enableZoomOnClick', false)
                  }
                  this.props.onSettingChange({ id: this.props.id, config: newConfig })
                }}
              />
            </SettingRow>
            <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); padding: 0 16px 8px; line-height: 1.4;`}>
              When enabled, clicking a card pans the map to center on the feature without changing zoom level.
            </div>

            {/* Zoom settings — always visible since they apply to feed layer click and card click */}
            <SettingRow label='Zoom Level (Points)'>
              <NumericInput
                size='sm'
                style={{ width: 80 }}
                min={0}
                max={23}
                step={1}
                value={config.zoomFactorPoint || 15}
                onAcceptValue={(value) => {
                  this.props.onSettingChange({
                    id: this.props.id,
                    config: this.props.config.set('zoomFactorPoint', value)
                  })
                }}
              />
            </SettingRow>
            <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin: -4px 16px 8px;`}>
              Map zoom level for point features (0 = world, 15 = street). Default: 15.
            </div>

            {/* Only show polygon buffer when spatial join is configured (feed map layer only has points) */}
            {hasSpatialJoinDs && config.joinFieldService && config.joinFieldFeed && (
              <React.Fragment>
                <SettingRow label='Zoom Buffer (Lines/Polygons)'>
                  <NumericInput
                    size='sm'
                    style={{ width: 80 }}
                    min={1.0}
                    step={0.1}
                    value={config.zoomFactorPoly || 1.5}
                    onAcceptValue={(value) => {
                      this.props.onSettingChange({
                        id: this.props.id,
                        config: this.props.config.set('zoomFactorPoly', value)
                      })
                    }}
                  />
                </SettingRow>
                <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin: -4px 16px 8px;`}>
                  Extent buffer for line/polygon features (1.0 = tight, 2.0 = double). Default: 1.5.
                </div>
              </React.Fragment>
            )}

          </SettingSection>
        )}

        {/* ── Card Options — always visible when fields are discovered ── */}
        {hasFields && (
          <SettingSection title='Card Options'>
            <SettingRow label={this.props.intl.formatMessage({ id: 'enableCardExpand', defaultMessage: defaultMessages.enableCardExpand })}>
              <Switch
                checked={config.enableCardExpand === true}
                onChange={(evt) => {
                  this.props.onSettingChange({
                    id: this.props.id,
                    config: this.props.config.set('enableCardExpand', evt.target.checked)
                  })
                }}
              />
            </SettingRow>
            <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); padding: 0 16px 8px; line-height: 1.4;`}>
              {this.props.intl.formatMessage({ id: 'enableCardExpandDesc', defaultMessage: defaultMessages.enableCardExpandDesc })}
            </div>

            <SettingRow label='Link Field'>
              <Select
                size='sm'
                value={config.linkField || ''}
                onChange={(evt) => {
                  this.props.onSettingChange({
                    id: this.props.id,
                    config: this.props.config.set('linkField', evt.target.value)
                  })
                }}
                css={css`width: 55%;`}
              >
                <Option value=''>None</Option>
                {config.externalLinkTemplate && (
                  <Option value='__externalLink__'>Built URL (template)</Option>
                )}
                {this.state.discoveredFields.map((field) => (
                  <Option key={field} value={field}>{field}</Option>
                ))}
              </Select>
            </SettingRow>
            <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); padding: 0 16px 8px; line-height: 1.4;`}>
              Feed field containing a URL, or use a built URL from the template below. A link icon appears on the card toolbar.
            </div>

            <SettingRow flow='wrap' label='Link URL Template'>
              <TextInput
                className='w-100'
                size='sm'
                placeholder='https://example.com?id={{fieldName}}'
                value={config.externalLinkTemplate || ''}
                onChange={(e) => { this.onExternalLinkTemplateChange(e.target.value) }}
              />
              <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px; line-height: 1.4;`}>
                Build a URL using {'{{token}}'} substitution. Select "Built URL" above to use it as the link field.
              </div>
            </SettingRow>

            <SettingRow label='Toolbar Position'>
              <Select
                size='sm'
                value={(config as any).toolbarPosition || 'bottom'}
                onChange={(evt) => {
                  this.props.onSettingChange({
                    id: this.props.id,
                    config: this.props.config.set('toolbarPosition', evt.target.value)
                  })
                }}
                css={css`width: 55%;`}
              >
                <Option value='bottom'>Bottom</Option>
                <Option value='right'>Right</Option>
                <Option value='menu'>Menu (⋮)</Option>
              </Select>
            </SettingRow>
            <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); padding: 0 16px 8px; line-height: 1.4;`}>
              Bottom: horizontal row below content. Right: vertical strip. Menu (⋮): kebab dropdown — ideal for mobile.
            </div>

            <SettingRow label='Toolbar Position (Mobile)'>
              <Select
                size='sm'
                value={(config as any).toolbarPositionMobile || ''}
                onChange={(evt) => {
                  this.props.onSettingChange({
                    id: this.props.id,
                    config: this.props.config.set('toolbarPositionMobile', evt.target.value)
                  })
                }}
                css={css`width: 55%;`}
              >
                <Option value=''>Default</Option>
                <Option value='bottom'>Bottom</Option>
                <Option value='right'>Right</Option>
                <Option value='menu'>Menu (⋮)</Option>
              </Select>
            </SettingRow>
            <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); padding: 0 16px 8px; line-height: 1.4;`}>
              Override toolbar layout at viewports ≤ 600px. Default uses the desktop setting.
            </div>

            <SettingRow flow='wrap' label='Source Attribution'>
              <TextInput
                className='w-100'
                size='sm'
                placeholder='e.g., USGS Earthquake Hazards Program'
                value={(config as any).sourceLabel || ''}
                onChange={(e) => { this.setConfigValue('sourceLabel', e.target.value) }}
              />
              <TextInput
                className='w-100'
                size='sm'
                placeholder='https://source-website.com (optional)'
                value={(config as any).sourceUrl || ''}
                onChange={(e) => { this.setConfigValue('sourceUrl', e.target.value) }}
                css={css`margin-top: 4px;`}
              />
              <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); margin-top: 4px; line-height: 1.4;`}>
                Optional credit shown below the card list. Add a URL to make it a clickable link.
              </div>
            </SettingRow>
          </SettingSection>
        )}
      </div>
    )
  }
}
