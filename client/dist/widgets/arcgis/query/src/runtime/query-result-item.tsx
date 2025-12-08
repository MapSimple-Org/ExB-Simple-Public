/** @jsx jsx */
import {
  React,
  ReactRedux,
  jsx,
  css,
  type DataSource,
  type FeatureDataRecord,
  type IMState,
  classNames
} from 'jimu-core'
import FeatureInfo from './components/feature-info'
import { ListDirection } from '../config'

export interface ResultItemProps {
  widgetId: string
  popupTemplate: any
  defaultPopupTemplate: any
  data: FeatureDataRecord
  dataSource: DataSource
  expandByDefault: boolean
  onClick: (record: FeatureDataRecord) => void
}

const style = css`
  overflow: auto;
  flex-flow: row;
  cursor: pointer;
  flex-shrink: 0;
  min-height: 2rem;
  &.selected {
    outline: 2px solid var(--sys-color-primary-main);
  }
`

export const QueryResultItem = (props: ResultItemProps) => {
  const { widgetId, data, dataSource, popupTemplate, defaultPopupTemplate, onClick, expandByDefault = false } = props
  const selected = ReactRedux.useSelector((state: IMState) =>
    state.dataSourcesInfo?.[dataSource.id]?.selectedIds?.includes(data.getId())
  )
  const isVerticalAlign = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson.config.resultListDirection !== ListDirection.Horizontal
  })

  const handleClickResultItem = React.useCallback(() => {
    onClick(data)
  }, [onClick, data])

  const onKeyUp = React.useCallback((evt) => {
    if (evt.key === 'Enter' || evt.key === ' ') {
      evt.preventDefault()
      evt.stopPropagation()
      handleClickResultItem()
    }
  }, [handleClickResultItem])

  return (
    <div
      className={classNames('query-result-item', { selected })}
      onClick={handleClickResultItem}
      onKeyUp={onKeyUp}
      css={style}
      role='option'
      aria-selected={selected}
      tabIndex={0}
    >
      <FeatureInfo
        graphic={data.feature as __esri.Graphic}
        popupTemplate={popupTemplate}
        defaultPopupTemplate={defaultPopupTemplate}
        togglable={isVerticalAlign}
        expandByDefault={expandByDefault}
        dataSource={dataSource}
      />
    </div>
  )
}
