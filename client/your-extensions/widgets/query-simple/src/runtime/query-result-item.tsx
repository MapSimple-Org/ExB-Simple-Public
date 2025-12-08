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
import { Button } from 'jimu-ui'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'
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
  onRemove: (record: FeatureDataRecord) => void
}

const style = css`
  overflow: auto;
  flex-flow: row;
  cursor: pointer;
  flex-shrink: 0;
  min-height: 2rem;
  position: relative;
  &.selected {
    outline: 2px solid var(--sys-color-primary-main);
  }
  
  .remove-button {
    position: absolute;
    top: 4px;
    right: 4px;
    z-index: 10;
    opacity: 0.7;
    transition: opacity 0.2s;
    
    &:hover {
      opacity: 1;
    }
  }
`

/**
 * QueryResultItem component - displays a single query result record
 * Features:
 * - Clicking the item zooms to the feature on the map
 * - Remove button (X) in upper-right corner to remove record from results
 * - Records are expanded by default to show full feature information
 */
export const QueryResultItem = (props: ResultItemProps) => {
  const { widgetId, data, dataSource, popupTemplate, defaultPopupTemplate, onClick, onRemove, expandByDefault = false } = props
  
  // Check if this record is currently selected
  const selected = ReactRedux.useSelector((state: IMState) =>
    state.dataSourcesInfo?.[dataSource.id]?.selectedIds?.includes(data.getId())
  )
  
  // Determine if list is displayed vertically (affects FeatureInfo expandability)
  const isVerticalAlign = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson.config.resultListDirection !== ListDirection.Horizontal
  })

  // Handle clicking on the result item - zooms to feature on map
  const handleClickResultItem = React.useCallback((e: React.MouseEvent) => {
    // Don't trigger zoom if clicking the remove button
    if ((e.target as HTMLElement).closest('.remove-button')) {
      return
    }
    onClick(data)
  }, [onClick, data])

  // Handle clicking the remove button - removes record from results and selection
  const handleRemove = React.useCallback((e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the item click handler
    e.preventDefault()
    onRemove(data)
  }, [onRemove, data])

  const onKeyUp = React.useCallback((evt) => {
    if (evt.key === 'Enter' || evt.key === ' ') {
      evt.preventDefault()
      evt.stopPropagation()
      handleClickResultItem(evt as any)
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
      <Button
        className="remove-button"
        icon
        size="sm"
        variant="text"
        color="inherit"
        onClick={handleRemove}
        aria-label="Remove record"
        css={css`
          padding: 4px;
          min-width: auto;
          width: 20px;
          height: 20px;
        `}
      >
        <CloseOutlined size={14} />
      </Button>
    </div>
  )
}
