/** @jsx jsx */
import {
  React,
  jsx,
  css,
  type ImmutableObject,
  DataSourceComponent,
  dataSourceUtils,
  DataSourceManager,
  type IMSqlExpression,
  Immutable,
  hooks
} from 'jimu-core'
import { TextInput, TextArea, Collapse, Button } from 'jimu-ui'
import { SqlExpressionBuilderPopup } from 'jimu-ui/advanced/sql-expression-builder'
import { getJimuFieldNamesBySqlExpression } from 'jimu-ui/basic/sql-expression-runtime'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from './translations/default'
import type { QueryItemType } from '../config'
import { DEFAULT_QUERY_ITEM } from '../default-query-item'
import { TitleComponent } from './titleComponent'

interface Props {
  queryItem: ImmutableObject<QueryItemType>
  onPropertyChanged: (prop: string, value: any, dsUpdateRequired?: boolean) => void
  onQueryItemChanged: (queryItem: ImmutableObject<QueryItemType>, dsUpdateRequired?: boolean) => void
}

export function AttributeFilterSetting (props: Props) {
  const { queryItem, onQueryItemChanged, onPropertyChanged } = props
  const [popperVisible, setPopperVisible] = React.useState(false)
  const getI18nMessage = hooks.useTranslation(defaultMessages)

  // fill the queryItem with default values
  const currentItem = Object.assign({}, DEFAULT_QUERY_ITEM, queryItem)
  const enabled = currentItem.useAttributeFilter
  const dataSourceIdAvailable = currentItem.useDataSource?.dataSourceId != null
  const dataSource = DataSourceManager.getInstance().getDataSource(currentItem.useDataSource?.dataSourceId)

  const [label, setLabel] = React.useState(currentItem.attributeFilterLabel ?? getI18nMessage('attributeFilter'))
  const [desc, setDesc] = React.useState(currentItem.attributeFilterDesc)

  React.useEffect(() => {
    setLabel(queryItem?.attributeFilterLabel ?? getI18nMessage('attributeFilter'))
    setDesc(queryItem?.attributeFilterDesc ?? '')
  }, [queryItem, getI18nMessage])

  const showPopper = React.useCallback(() => {
    setPopperVisible(true)
  }, [setPopperVisible])

  const hidePopper = React.useCallback(() => {
    setPopperVisible(false)
  }, [setPopperVisible])

  const handleLabelChanged = (prop: string, value: string, defaultValue: string) => {
    if (value === defaultValue) {
      onPropertyChanged(prop, null)
    } else {
      onPropertyChanged(prop, value)
    }
  }

  const handleSqlExpressionChanged = (sqlExprObj: IMSqlExpression) => {
    const { dataSourceId, mainDataSourceId, dataViewId, rootDataSourceId } = queryItem.useDataSource
    const nextSqlExprObj = sqlExprObj?.parts?.length > 0 ? sqlExprObj : null
    let newItem = queryItem.set('sqlExprObj', nextSqlExprObj)
    const fields = getJimuFieldNamesBySqlExpression(Immutable(nextSqlExprObj))

    const nextUseDataSource = {
      dataSourceId,
      mainDataSourceId,
      dataViewId,
      rootDataSourceId,
      fields
    }
    newItem = newItem.set('useDataSource', nextUseDataSource)
    onQueryItemChanged(newItem, true)
  }

  const titleComponent = (
    <TitleComponent label='attributeFilter' enabled={enabled} onChange={(e) => { onPropertyChanged('useAttributeFilter', e.target.checked) }} />
  )
  return (
    <SettingSection role='group' aria-label={getI18nMessage('attributeFilter')} title={titleComponent}>
      <Collapse isOpen={enabled}>
        <SettingRow flow='wrap' label={getI18nMessage('label')}>
          <TextInput
            aria-label={getI18nMessage('label')}
            className='w-100'
            size='sm'
            value={label}
            onChange={(e) => { setLabel(e.target.value) }}
            onAcceptValue={(value) => { handleLabelChanged('attributeFilterLabel', value, getI18nMessage('attributeFilter')) }
            }
          />
        </SettingRow>
        <SettingRow flow='wrap' truncateLabel label={getI18nMessage('addSQLExpressionsToYourQuery')}>
          <Button
            className='w-100 text-default set-link-btn'
            type={dataSourceIdAvailable ? 'primary' : 'secondary'}
            disabled={!dataSourceIdAvailable}
            onClick={showPopper}
          >
            {getI18nMessage('sqlExpressionBuilder')}
          </Button>
        </SettingRow>
        <SettingRow>
          <TextArea
            css={css`
              flex: 1;
            `}
            height={80}
            value={dataSourceUtils.getArcGISSQL(currentItem.sqlExprObj, dataSource).displaySQL ?? ''}
            spellCheck={false}
            readOnly
            onClick={(e) => { e.currentTarget.select() }}
            placeholder={getI18nMessage('pleaseAddYourSQLExpressionsFirst')}
          />
        </SettingRow>
        <SettingRow label={getI18nMessage('description')} flow='wrap'>
          <TextArea
            aria-label={getI18nMessage('description')}
            height={80}
            value={desc}
            placeholder={getI18nMessage('describeTheFilter')}
            onChange={(e) => { setDesc(e.target.value) }}
            onAcceptValue={(value) => { onPropertyChanged('attributeFilterDesc', value) }}
          />
        </SettingRow>
      </Collapse>
      <DataSourceComponent useDataSource={currentItem.useDataSource}>
        {(ds) => {
          // check if timezone is changed
          if (currentItem.sqlExprObj) {
            const sqlResult = dataSourceUtils.getArcGISSQL(currentItem.sqlExprObj, ds)
            if (sqlResult.displaySQL !== currentItem.sqlExprObj.displaySQL) {
              handleSqlExpressionChanged(Object.assign({}, currentItem.sqlExprObj, sqlResult) as any)
            }
          }
          return (
            <SqlExpressionBuilderPopup
              dataSource={ds}
              isOpen={popperVisible}
              toggle={hidePopper}
              expression={currentItem.sqlExprObj}
              onChange={(expr) => { handleSqlExpressionChanged(expr) }}
            />
          )
        }}
      </DataSourceComponent>
    </SettingSection>
  )
}
