/** @jsx jsx */
import { React, jsx, css, type ImmutableObject, Immutable, type OrderByOption, type Expression, hooks, focusElementInKeyboardMode } from 'jimu-core'
import { TextInput, TextArea, Select, Button, Popper, Checkbox, type ShiftOptions, type FlipOptions } from 'jimu-ui'
import { Sort } from 'jimu-ui/advanced/sql-expression-builder'
import { SettingRow, SettingCollapse } from 'jimu-ui/advanced/setting-components'
import { ExpressionBuilderType, ExpressionBuilder } from 'jimu-ui/advanced/expression-builder'
import defaultMessages from './translations/default'
import { type QueryItemType, FieldsType, ResultSelectMode } from '../config'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'
import { ResultsFieldSetting } from './results-field'
import { DataOutlined } from 'jimu-icons/outlined/data/data'
import { renderPreview } from '../runtime/markdown-template-utils'
import { TableBuilder } from 'widgets/shared-code/mapsimple-common'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'

interface Props {
  widgetId: string
  queryItem: ImmutableObject<QueryItemType>
  onPropertyChanged: (prop: string, value: any, dsUpdateRequired?: boolean) => void
  onQueryItemChanged: (queryItem: ImmutableObject<QueryItemType>, dsUpdateRequired?: boolean) => void
}

const shiftOptions: ShiftOptions = {
  crossAxis: true
}

const flipOptions: FlipOptions = {
  boundary: document.body,
  fallbackPlacements: ['left-start', 'left-end']
}

// r023.18: Preview panel styles
const previewStyle = css`
  background-color: var(--ref-palette-neutral-200);
  border: 1px solid var(--ref-palette-neutral-400);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 0.875rem;
  line-height: 1.5;
  max-height: 200px;
  overflow-y: auto;

  h3 { font-size: 1rem; font-weight: 600; margin: 0 0 4px 0; }
  h4 { font-size: 0.9rem; font-weight: 600; margin: 0 0 4px 0; }
  p { margin: 0 0 6px 0; }
  ul { margin: 2px 0 6px 0; padding-left: 20px; }
  li { margin: 1px 0; }
  hr { border: none; border-top: 1px solid var(--ref-palette-neutral-500); margin: 6px 0; }
  strong { font-weight: 700; }
  em { font-style: italic; }
`

export function ResultsSetting (props: Props) {
  const { widgetId, queryItem, onQueryItemChanged, onPropertyChanged } = props
  const [showContent, setShowContent] = React.useState(false)
  // Title expression state & popper
  const [showExpressionBuilder, setShowExpressionBuilder] = React.useState(false)
  const expressionBuilderRef = React.useRef(undefined)
  const editorRef = React.useRef<HTMLInputElement>(undefined)
  // r023.18: Content template state & popper (separate from title)
  const [showContentExpressionBuilder, setShowContentExpressionBuilder] = React.useState(false)
  const contentExpressionBuilderRef = React.useRef(undefined)
  const contentEditorRef = React.useRef<HTMLTextAreaElement>(undefined)
  // r026.002: Expandable template syntax help (replaces tooltip)
  const [templateHelpOpen, setTemplateHelpOpen] = React.useState(false)
  // r026.014: Table builder inline panel
  const [showTableBuilder, setShowTableBuilder] = React.useState(false)

  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const [expression, setExpression] = React.useState(queryItem.resultTitleExpression)
  // r023.18: Local state for content template
  const [contentExpression, setContentExpression] = React.useState((queryItem as any).resultContentExpression || '')
  const currentItem = Object.assign({}, DEFAULT_QUERY_ITEM, queryItem)

  // r026.002: Detect legacy {field} syntax in title and content expressions
  const RE_LEGACY_TOKEN = /(?<!\{)\{(\w+)\}(?!\})/g // matches {FIELD} but not {{FIELD}}
  const hasLegacyTitle = expression ? RE_LEGACY_TOKEN.test(expression) : false
  RE_LEGACY_TOKEN.lastIndex = 0 // reset stateful regex
  const hasLegacyContent = contentExpression ? RE_LEGACY_TOKEN.test(contentExpression) : false
  RE_LEGACY_TOKEN.lastIndex = 0
  const hasLegacySyntax = hasLegacyTitle || hasLegacyContent

  /**
   * r026.002: One-click migration from {field} to {{field}} syntax.
   * Non-destructive: only converts single-brace tokens that aren't already double-brace.
   */
  const handleMigrateTemplates = React.useCallback(() => {
    const migrate = (tmpl: string): string =>
      tmpl.replace(/(?<!\{)\{(\w+)\}(?!\})/g, '{{$1}}')

    if (hasLegacyTitle && expression) {
      const migrated = migrate(expression)
      setExpression(migrated)
      onPropertyChanged('resultTitleExpression', migrated, true)
    }
    if (hasLegacyContent && contentExpression) {
      const migrated = migrate(contentExpression)
      setContentExpression(migrated)
      onPropertyChanged('resultContentExpression', migrated, true)
    }
  }, [expression, contentExpression, hasLegacyTitle, hasLegacyContent, onPropertyChanged])

  const show = React.useCallback(() => {
    setShowContent(true)
  }, [setShowContent])

  const hide = React.useCallback(() => {
    setShowContent(false)
  }, [setShowContent])

  const toggleExpressionBuilder = React.useCallback(() => {
    if (!showExpressionBuilder && editorRef.current) {
      focusElementInKeyboardMode(editorRef.current, true)
    }
    setShowExpressionBuilder(!showExpressionBuilder)
  }, [showExpressionBuilder])

  // r023.18: Toggle for content template expression builder
  const toggleContentExpressionBuilder = React.useCallback(() => {
    if (!showContentExpressionBuilder && contentEditorRef.current) {
      focusElementInKeyboardMode(contentEditorRef.current, true)
    }
    setShowContentExpressionBuilder(!showContentExpressionBuilder)
  }, [showContentExpressionBuilder])

  const handleLabelChanged = (prop: string, value: string, defaultValue: string) => {
    if (value === defaultValue) {
      onPropertyChanged(prop, null)
    } else {
      onPropertyChanged(prop, value)
    }
  }

  const onQueryParamChange = (sortData: OrderByOption[]) => {
    const { dataSourceId, mainDataSourceId, dataViewId, rootDataSourceId } = queryItem.useDataSource

    const nextUseDataSource = {
      dataSourceId,
      mainDataSourceId,
      dataViewId,
      rootDataSourceId,
      fields: queryItem.useDataSource.fields
    }
    let newItem = queryItem.set('sortOptions', sortData)
    newItem = newItem.set('useDataSource', nextUseDataSource)
    onQueryItemChanged(newItem, true)
  }

  const handleTextChange = hooks.useEventCallback((e) => {
    setExpression(e.target.value)
  })

  const handleTextAccepted = hooks.useEventCallback((value: string) => {
    onPropertyChanged('resultTitleExpression', value, true)
  })

  const handleExpressionChange = hooks.useEventCallback((exp: Expression) => {
    if (exp.parts.length > 0) {
      // r026.002: Emit {{field}} syntax (double-brace) for unified template engine
      if (expression != null) {
        setExpression(`${expression} {{${exp.parts[0].jimuFieldName}}}`)
      } else {
        setExpression(`{{${exp.parts[0].jimuFieldName}}}`)
      }
      focusElementInKeyboardMode(editorRef.current, true)
    }
  })

  // r023.18: Content template handlers
  const handleContentTextChange = hooks.useEventCallback((e) => {
    setContentExpression(e.target.value)
  })

  const handleContentTextAccepted = hooks.useEventCallback((value: string) => {
    onPropertyChanged('resultContentExpression', value, true)
  })

  // r026.002: Emit {{field}} syntax (double-brace) for unified template engine
  const handleContentExpressionChange = hooks.useEventCallback((exp: Expression) => {
    if (exp.parts.length > 0) {
      const fieldToken = `{{${exp.parts[0].jimuFieldName}}}`
      if (contentExpression) {
        setContentExpression(`${contentExpression} ${fieldToken}`)
      } else {
        setContentExpression(fieldToken)
      }
      focusElementInKeyboardMode(contentEditorRef.current, true)
    }
  })

  // r023.18: Determine if title/content editors should show
  const showTitleEditor = currentItem.resultFieldsType === FieldsType.SelectAttributes ||
                          currentItem.resultFieldsType === FieldsType.CustomTemplate
  const showContentEditor = currentItem.resultFieldsType === FieldsType.CustomTemplate

  return (
    <SettingCollapse
      role='group'
      aria-label={getI18nMessage('results')}
      label={getI18nMessage('results')}
      className='p-4'
      isOpen={showContent}
      onRequestOpen={show}
      onRequestClose={hide}
    >
      <SettingRow flow='wrap' label={getI18nMessage('label')}>
        <TextInput
          aria-label={getI18nMessage('label')}
          className='w-100'
          size='sm'
          value={currentItem.resultsLabel ?? getI18nMessage('results')}
          onChange={(e) => { handleLabelChanged('resultsLabel', e.target.value, getI18nMessage('results')) }}
        />
      </SettingRow>
      <SettingRow flow='wrap' label={getI18nMessage('selectMode')}>
        <Select
          aria-label={getI18nMessage('selectMode')}
          className='w-100'
          size='sm'
          value={currentItem.resultSelectMode ?? ResultSelectMode.Single}
          onChange={(e) => {
            onPropertyChanged('resultSelectMode', e.target.value, false)
          }}
        >
          <option value={ResultSelectMode.Single}>{getI18nMessage('single')}</option>
          <option value={ResultSelectMode.Multiple}>{getI18nMessage('multiple')}</option>
        </Select>
      </SettingRow>
      <SettingRow flow='wrap' label={getI18nMessage('chooseMode')}>
        <Select
          aria-label={getI18nMessage('chooseMode')}
          className='w-100'
          size='sm'
          value={currentItem.resultFieldsType}
          onChange={(e) => {
            onPropertyChanged('resultFieldsType', e.target.value, true)
          }}
        >
          <option value={FieldsType.PopupSetting}>{getI18nMessage('field_PopupSetting')}</option>
          <option value={FieldsType.SelectAttributes}>{getI18nMessage('field_SelectAttributes')}</option>
          <option value={FieldsType.CustomTemplate}>{getI18nMessage('field_CustomTemplate')}</option>
        </Select>
      </SettingRow>
      <SettingRow>
        <label>
          <Checkbox
            className='mr-2'
            checked={currentItem.resultExpandByDefault ?? false}
            onChange={(_, checked) => { onPropertyChanged('resultExpandByDefault', checked) }}
          />
          <span>{getI18nMessage('expandByDefault')}</span>
        </label>
      </SettingRow>
      <SettingRow>
        <label>
          <Checkbox
            className='mr-2'
            checked={currentItem.zoomToSelected ?? true}
            onChange={(_, checked) => { onPropertyChanged('zoomToSelected', checked) }}
          />
          <span>{getI18nMessage('zoomToSelected')}</span>
        </label>
      </SettingRow>
      <SettingRow>
        <label>
          <Checkbox
            className='mr-2'
            checked={currentItem.isSpatialResultDefault ?? false}
            onChange={(_, checked) => { onPropertyChanged('isSpatialResultDefault', checked) }}
          />
          <span>{getI18nMessage('spatialResultDefault')}</span>
        </label>
      </SettingRow>

      {/* Title expression editor - shared between SelectAttributes and CustomTemplate */}
      {showTitleEditor && (
        <SettingRow flow='wrap' label={getI18nMessage('configTitle')}>
          <TextArea
            aria-label={getI18nMessage('configTitle')}
            className='mt-2 w-100'
            css={css`
              background-color: var(--ref-palette-neutral-300);
              z-index: 1;
            `}
            height={80}
            onChange={handleTextChange}
            onAcceptValue={handleTextAccepted}
            spellCheck={false}
            value={expression}
            ref={editorRef}
          />
          <div className='w-100' css={css`height: 32px; background-color: var(--ref-palette-neutral-300);`}>
            <Button
              aria-label={getI18nMessage('configTitle')}
              ref={expressionBuilderRef}
              onClick={toggleExpressionBuilder}
              type='tertiary'
              icon
            >
              <DataOutlined size='s'/>
            </Button>
          </div>
          <Popper
            open={showExpressionBuilder}
            placement='left-start'
            reference={expressionBuilderRef.current}
            shiftOptions={shiftOptions}
            flipOptions={flipOptions}
            arrowOptions
            toggle={() => { setShowExpressionBuilder(false) }}
            trapFocus={false}
            autoFocus={false}
          >
            <div css={css`
              width: 240px;
              height: 360px;
              .component-main-data-and-view {
                display: none;
              }
              .field-list {
                height: calc(100% - 60px) !important;
              }
            `}>
              <ExpressionBuilder
                widgetId={widgetId}
                types={Immutable([ExpressionBuilderType.Attribute])}
                useDataSources={Immutable([queryItem.useDataSource]) as any}
                expression={null}
                onChange={handleExpressionChange}
              />
            </div>
          </Popper>
        </SettingRow>
      )}

      {/* Field selector - SelectAttributes only */}
      {currentItem.resultFieldsType === FieldsType.SelectAttributes && (
        <ResultsFieldSetting
          useDataSource={queryItem.useDataSource as any}
          label={getI18nMessage('configFields')}
          selectedFields={queryItem.resultDisplayFields as any}
          onFieldsChanged={(fields: string[]) => { onPropertyChanged('resultDisplayFields', fields, true) }}
        />
      )}

      {/* r026.002: Legacy syntax migration banner */}
      {showContentEditor && hasLegacySyntax && (
        <SettingRow>
          <div css={css`
            display: flex;
            align-items: flex-start;
            gap: 8px;
            padding: 8px 12px;
            background-color: var(--sys-color-warning-light);
            border: 1px solid var(--sys-color-warning-main);
            border-radius: 4px;
            width: 100%;
          `}>
            <WarningOutlined size='m' color='var(--sys-color-warning-dark)' />
            <div css={css`flex: 1; font-size: 0.8rem;`}>
              <div css={css`font-weight: 600; margin-bottom: 4px;`}>Legacy template syntax detected</div>
              <div css={css`margin-bottom: 6px;`}>
                Your templates use <code>{'{FIELD}'}</code> syntax. The new <code>{'{{FIELD}}'}</code> syntax
                enables pipe filters like date formatting, math, and text transforms.
              </div>
              <Button
                size='sm'
                type='primary'
                onClick={handleMigrateTemplates}
              >
                Migrate to {'{{field}}'} syntax
              </Button>
            </div>
          </div>
        </SettingRow>
      )}

      {/* r023.18: Content template editor - CustomTemplate only */}
      {showContentEditor && (
        <React.Fragment>
          <SettingRow flow='wrap' label={getI18nMessage('contentTemplate')}>
            <TextArea
              aria-label={getI18nMessage('contentTemplate')}
              className='mt-2 w-100'
              css={css`
                background-color: var(--ref-palette-neutral-300);
                z-index: 1;
                font-family: monospace;
                font-size: 0.85rem;
              `}
              height={140}
              onChange={handleContentTextChange}
              onAcceptValue={handleContentTextAccepted}
              spellCheck={false}
              value={contentExpression}
              ref={contentEditorRef}
              placeholder={'**{{OWNER}}**\n\nManaged by: {{MANAGER}}\nType: *{{SITETYPE}}*'}
            />
            <div className='w-100' css={css`height: 32px; background-color: var(--ref-palette-neutral-300);`}>
              <Button
                aria-label={getI18nMessage('contentTemplate')}
                ref={contentExpressionBuilderRef}
                onClick={toggleContentExpressionBuilder}
                type='tertiary'
                icon
              >
                <DataOutlined size='s'/>
              </Button>
            </div>
            <Popper
              open={showContentExpressionBuilder}
              placement='left-start'
              reference={contentExpressionBuilderRef.current}
              shiftOptions={shiftOptions}
              flipOptions={flipOptions}
              arrowOptions
              toggle={() => { setShowContentExpressionBuilder(false) }}
              trapFocus={false}
              autoFocus={false}
            >
              <div css={css`
                width: 240px;
                height: 360px;
                .component-main-data-and-view {
                  display: none;
                }
                .field-list {
                  height: calc(100% - 60px) !important;
                }
              `}>
                <ExpressionBuilder
                  widgetId={widgetId}
                  types={Immutable([ExpressionBuilderType.Attribute])}
                  useDataSources={Immutable([queryItem.useDataSource]) as any}
                  expression={null}
                  onChange={handleContentExpressionChange}
                />
              </div>
            </Popper>
          </SettingRow>

          {/* r026.002: Template tools — syntax help + table builder */}
          <div css={css`margin-top: 4px; display: flex; gap: 12px; flex-wrap: wrap;`}>
            <button
              type='button'
              onClick={() => setTemplateHelpOpen(!templateHelpOpen)}
              aria-expanded={templateHelpOpen}
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
                transform: ${templateHelpOpen ? 'rotate(90deg)' : 'rotate(0deg)'};
                font-size: 10px;
              `}>▶</span>
              Template syntax reference
            </button>
            {/* r026.014: Insert Table toggle */}
            <button
              type='button'
              onClick={() => setShowTableBuilder(!showTableBuilder)}
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
                transform: ${showTableBuilder ? 'rotate(90deg)' : 'rotate(0deg)'};
                font-size: 10px;
              `}>▶</span>
              Insert table
            </button>
          </div>
          {/* r026.014: Table builder inline panel */}
          {showTableBuilder && (
            <TableBuilder
              onInsert={(markdown) => {
                // Append table markdown to content template
                const newContent = contentExpression
                  ? `${contentExpression}\n${markdown}`
                  : markdown
                setContentExpression(newContent)
                handleContentTextAccepted(newContent)
                setShowTableBuilder(false)
              }}
              onCancel={() => setShowTableBuilder(false)}
            />
          )}
          <div>
            {templateHelpOpen && (
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
                  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
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
                  <code>{'{{fieldName}}'}</code> — insert field value
                </div>

                <div className='help-section'>
                  <h4>Markdown</h4>
                  <code>**bold**</code> &nbsp; <code>*italic*</code> &nbsp; <code>- list</code> &nbsp;
                  <code>[text](url)</code> &nbsp; <code>---</code> rule
                  <table>
                    <tbody>
                      <tr><td><code># Title</code></td><td>Large heading</td></tr>
                      <tr><td><code>## Subtitle</code></td><td>Medium heading</td></tr>
                      <tr><td><code>### Small</code></td><td>Small heading</td></tr>
                      <tr><td><code>#### Tiny</code></td><td>Tiny heading</td></tr>
                    </tbody>
                  </table>
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
                  <h4>Tables</h4>
                  <table>
                    <tbody>
                      <tr><td><code>{'| Header | Header |'}</code></td><td>Header row</td></tr>
                      <tr><td><code>{'| --- | --- |'}</code></td><td>Separator (required)</td></tr>
                      <tr><td><code>{'| Cell | Cell |'}</code></td><td>Data row(s)</td></tr>
                      <tr><td><code>{'| :--- | :---: | ---: |'}</code></td><td>Left, center, right align</td></tr>
                    </tbody>
                  </table>
                  <span css={css`color: var(--sys-color-text-tertiary); font-size: 10px;`}>
                    Use the "Insert table" tool above for easy table creation.
                  </span>
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

          {/* Live preview */}
          <SettingRow flow='wrap' label={getI18nMessage('templatePreview')}>
            <div
              className='w-100 mt-1'
              css={previewStyle}
              dangerouslySetInnerHTML={{ __html: renderPreview(contentExpression) }}
            />
          </SettingRow>
        </React.Fragment>
      )}

      <SettingRow role='group' aria-label={getI18nMessage('sortRecords')} flow='wrap' label={getI18nMessage('sortRecords')} css={css`.no-sort-remind {margin-top: 0 !important;}`}>
        <Sort
          onChange={(sortData) => { onQueryParamChange(sortData) }}
          value={Immutable(currentItem.sortOptions)}
          useDataSource={currentItem.useDataSource}
        />
      </SettingRow>
    </SettingCollapse>
  )
}

