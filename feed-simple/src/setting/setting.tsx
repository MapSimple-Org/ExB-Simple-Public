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
import type { IMConfig, StatusColorMap } from '../config'
import type { FeedItem } from '../utils/parsers/interface'
import { fetchFeed } from '../utils/feed-fetcher'
import { CustomXmlParser } from '../utils/parsers/custom-xml'
import { renderPreview } from '../utils/markdown-template-utils'
import { buildOutputDataSourceJson } from '../utils/data-source-builder'
import defaultMessages from './translations/default'

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
      spatialJoinFields: []
    }
  }

  componentDidMount (): void {
    // Load Map Integration layer fields if already configured (settings panel reopened)
    const useDs = this.props.useDataSources?.[0]
    if (useDs) {
      this.loadSpatialJoinFields((useDs as any).dataSourceId)
    }
  }

  getI18nMessage = (id: string): string => {
    return this.props.intl.formatMessage({ id, defaultMessage: defaultMessages[id] })
  }

  // ── Discover Fields ──────────────────────────────────────────

  onDiscoverFields = async (): Promise<void> => {
    const { feedUrl, rootItemElement } = this.props.config
    if (!feedUrl) {
      this.setState({ discoverError: 'Enter a Feed URL first.' })
      return
    }

    this.setState({ isDiscovering: true, discoverError: null })

    try {
      const result = await fetchFeed(feedUrl)
      const parsed = parser.parse(result.text, rootItemElement || 'item')
      this.setState({
        discoveredFields: parsed.fieldNames,
        discoveredItems: parsed.items,
        isDiscovering: false,
        discoverError: null
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      this.setState({
        isDiscovering: false,
        discoverError: message
      })
    }
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
              <div css={css`font-size: 11px; color: #c00; margin-top: 4px;`}>
                {discoverError}
              </div>
            )}

            {hasFields && (
              <div css={css`margin-top: 6px; font-size: 11px; color: var(--sys-color-text-tertiary);`}>
                {discoveredFields.length} fields found
              </div>
            )}
          </SettingRow>
        </SettingSection>

        {/* ── Card Template ── */}
        <SettingSection title={this.getI18nMessage('cardTemplate')}>
          <SettingRow flow='wrap' label='Template'>
            <textarea
              ref={this.templateTextareaRef}
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
            <div css={css`font-size: 10px; color: var(--sys-color-text-tertiary); margin-top: 4px; line-height: 1.4;`}>
              Use {'{{fieldName}}'} tokens. Supports **bold**, *italic*, # headings, - lists, [links](url), --- rules.
              Leave empty to show all fields.
            </div>
          </SettingRow>

          {hasFields && (
            <SettingRow flow='wrap' label='Insert Field'>
              <div css={css`display: flex; flex-wrap: wrap; gap: 4px;`}>
                {discoveredFields.map((field) => (
                  <button
                    key={field}
                    type='button'
                    onClick={() => { this.onInsertFieldToken(field) }}
                    css={css`
                      display: inline-block;
                      padding: 2px 8px;
                      border-radius: 3px;
                      border: 1px solid var(--sys-color-divider-secondary);
                      background: var(--sys-color-surface-overlay);
                      color: var(--sys-color-primary-dark);
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

          {config.cardTemplate && (
            <SettingRow flow='wrap' label='Preview'>
              <div
                css={css`
                  width: 100%;
                  padding: 8px;
                  border: 1px solid var(--sys-color-divider-secondary);
                  border-radius: 4px;
                  background: #fff;
                  font-size: 0.85rem;
                  line-height: 1.4;
                  color: #333;
                  p { margin: 0 0 4px 0; }
                  h3, h4, h5, h6 { margin: 0 0 4px 0; }
                  hr { margin: 6px 0; border: none; border-top: 1px solid #ddd; }
                  ul { margin: 0; padding-left: 20px; }
                  li { margin-bottom: 2px; }
                `}
                dangerouslySetInnerHTML={{ __html: renderPreview(config.cardTemplate) }}
              />
            </SettingRow>
          )}
        </SettingSection>

        {/* ── Status Colors ── */}
        <SettingSection title='Status Colors'>
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

          {/* Color pickers for each unique status value */}
          {config.statusField && statusValues.length > 0 && (
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
                    <span css={css`font-size: 12px; color: var(--sys-color-text-primary);`}>
                      {val}
                    </span>
                  </div>
                ))}
              </div>
            </SettingRow>
          )}

          {config.statusField && statusValues.length === 0 && (
            <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); font-style: italic; padding: 0 16px 8px;`}>
              Click "Discover Fields" to load status values for color assignment.
            </div>
          )}
        </SettingSection>

        {/* ── Hover Text ── */}
        <SettingSection title='Hover Text'>
          <SettingRow flow='wrap' label='Tooltip Field'>
            {hasFields
              ? (
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
                )
              : (
                <div css={css`font-size: 11px; color: var(--sys-color-text-tertiary); font-style: italic;`}>
                  Click "Discover Fields" above to load available fields.
                </div>
                )}
            <div css={css`font-size: 10px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
              Shows the selected field's value as a tooltip when hovering over a card.
            </div>
          </SettingRow>
        </SettingSection>

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
          <SettingRow flow='wrap' label={this.getI18nMessage('sortField')}>
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
            <SettingRow flow='wrap' label={this.getI18nMessage('sortDirection')}>
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
            <div css={css`font-size: 10px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
              0 = show all items
            </div>
          </SettingRow>

          {/* Filter by Status — only show when status field is configured and fields discovered */}
          {config.statusField && statusValues.length > 0 && (
            <SettingRow flow='wrap' label='Hide Status Values'>
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
                        checked={isHidden}
                        onChange={(e) => { this.onFilterByStatusToggle(val, e.target.checked) }}
                      />
                      {val}
                    </label>
                  )
                })}
              </div>
              <div css={css`font-size: 10px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
                Checked values are hidden from the display.
              </div>
            </SettingRow>
          )}
        </SettingSection>

        {/* ── External Link ── */}
        <SettingSection title='External Link'>
          <SettingRow flow='wrap' label='Link Template'>
            <TextInput
              className='w-100'
              size='sm'
              placeholder='https://example.com?id={{clid}}'
              value={config.externalLinkTemplate || ''}
              onChange={(e) => { this.onExternalLinkTemplateChange(e.target.value) }}
            />
            <div css={css`font-size: 10px; color: var(--sys-color-text-tertiary); margin-top: 4px; line-height: 1.4;`}>
              URL template with {'{{token}}'} substitution. Used by the externalLink filter in card templates.
            </div>
          </SettingRow>
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
            <div css={css`font-size: 10px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
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
              <div css={css`font-size: 10px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
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
              <div css={css`font-size: 10px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
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
              <div css={css`font-size: 10px; color: var(--sys-color-text-tertiary); margin-top: 4px;`}>
                Map widget to zoom and identify features on card click.
              </div>
            </SettingRow>
          )}

          {hasSpatialJoinDs && config.joinFieldService && config.joinFieldFeed && config.mapWidgetId && (
            <React.Fragment>
              <SettingRow label='Zoom Level (Points)'>
                <NumericInput
                  size='sm'
                  style={{ width: 80 }}
                  min={1}
                  max={23}
                  step={1}
                  value={config.zoomFactorPoint || 15}
                  onChange={(value) => {
                    this.props.onSettingChange({
                      id: this.props.id,
                      config: this.props.config.set('zoomFactorPoint', value)
                    })
                  }}
                />
              </SettingRow>
              <div css={css`font-size: 11px; color: #6c757d; margin: -4px 16px 8px;`}>
                Map zoom level for point features (1–23). Default: 15.
              </div>

              <SettingRow label='Zoom Buffer (Lines/Polygons)'>
                <NumericInput
                  size='sm'
                  style={{ width: 80 }}
                  min={1.0}
                  step={0.1}
                  value={config.zoomFactorPoly || 1.5}
                  onChange={(value) => {
                    this.props.onSettingChange({
                      id: this.props.id,
                      config: this.props.config.set('zoomFactorPoly', value)
                    })
                  }}
                />
              </SettingRow>
              <div css={css`font-size: 11px; color: #6c757d; margin: -4px 16px 8px;`}>
                Extent buffer for line/polygon features (1.0 = tight, 2.0 = double). Default: 1.5.
              </div>

              <div css={css`
                font-size: 11px;
                color: #155724;
                background: #d4edda;
                border: 1px solid #c3e6cb;
                border-radius: 4px;
                padding: 6px 10px;
                margin: 0 16px 8px;
              `}>
                Map integration active — feed items will be linked to map features.
              </div>
            </React.Fragment>
          )}
        </SettingSection>
      </div>
    )
  }
}
