/** @jsx jsx */
import { React, jsx, css, type ImmutableObject, Immutable, type OrderByOption, type Expression, hooks, focusElementInKeyboardMode } from 'jimu-core'
import { TextInput, TextArea, Select, Button, Popper, Checkbox, Tooltip, type ShiftOptions, type FlipOptions } from 'jimu-ui'
import { Sort } from 'jimu-ui/advanced/sql-expression-builder'
import { SettingRow, SettingCollapse } from 'jimu-ui/advanced/setting-components'
import { ExpressionBuilderType, ExpressionBuilder } from 'jimu-ui/advanced/expression-builder'
import defaultMessages from './translations/default'
import { type QueryItemType, FieldsType, ResultSelectMode } from '../config'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'
import { ResultsFieldSetting } from './results-field'
import { DataOutlined } from 'jimu-icons/outlined/data/data'
import { InfoOutlined } from 'jimu-icons/outlined/suggested/info'
import { renderPreview } from '../runtime/markdown-template-utils'

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

  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const [expression, setExpression] = React.useState(queryItem.resultTitleExpression)
  // r023.18: Local state for content template
  const [contentExpression, setContentExpression] = React.useState((queryItem as any).resultContentExpression || '')
  const currentItem = Object.assign({}, DEFAULT_QUERY_ITEM, queryItem)

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
      if (expression != null) {
        setExpression(`${expression} {${exp.parts[0].jimuFieldName}}`)
      } else {
        setExpression(`{${exp.parts[0].jimuFieldName}}`)
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

  const handleContentExpressionChange = hooks.useEventCallback((exp: Expression) => {
    if (exp.parts.length > 0) {
      const fieldToken = `{${exp.parts[0].jimuFieldName}}`
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

      {/* r023.18: Content template editor - CustomTemplate only */}
      {showContentEditor && (
        <React.Fragment>
          <SettingRow flow='wrap' label={
            <div css={css`display: flex; align-items: center; gap: 4px;`}>
              <span>{getI18nMessage('contentTemplate')}</span>
              <Tooltip
                placement='bottom'
                css={css`white-space: pre-line;`}
                title={getI18nMessage('contentTemplateTip')}
              >
                <Button
                  size='sm'
                  icon
                  type='tertiary'
                  aria-label='Markdown syntax help'
                  css={css`padding: 0; min-width: auto; flex-shrink: 0;`}
                >
                  <InfoOutlined color='var(--sys-color-primary-main)' size='s'/>
                </Button>
              </Tooltip>
            </div>
          }>
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
              placeholder={'**{OWNER}**\n\nManaged by: {MANAGER}\nType: *{SITETYPE}*'}
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

