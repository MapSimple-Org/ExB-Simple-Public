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

export function ResultsSetting (props: Props) {
  const { widgetId, queryItem, onQueryItemChanged, onPropertyChanged } = props
  const [showContent, setShowContent] = React.useState(false)
  const [showExpressionBuilder, setShowExpressionBuilder] = React.useState(false)
  const expressionBuilderRef = React.useRef(undefined)
  const editorRef = React.useRef<HTMLInputElement>(undefined)
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const [expression, setExpression] = React.useState(queryItem.resultTitleExpression)
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
      {currentItem.resultFieldsType === FieldsType.SelectAttributes && (
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
      {currentItem.resultFieldsType === FieldsType.SelectAttributes && (
        <ResultsFieldSetting
          useDataSource={queryItem.useDataSource as any}
          label={getI18nMessage('configFields')}
          selectedFields={queryItem.resultDisplayFields as any}
          onFieldsChanged={(fields: string[]) => { onPropertyChanged('resultDisplayFields', fields, true) }}
        />
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

