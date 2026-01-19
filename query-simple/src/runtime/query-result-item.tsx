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
import { Button, Tooltip } from 'jimu-ui'
import FeatureInfo from './components/feature-info'
import { ListDirection } from '../config'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()

/**
 * Trash icon as CSS background-image (r021.44 memory optimization)
 * Instead of creating 600 React component instances of <TrashOutlined>,
 * we use a single CSS style with SVG data-uri that's reused across all items.
 * This eliminates 600 component instances + 600 DOM nodes.
 * SVG source: jimu-icons/svg/outlined/editor/trash.svg
 */
const trashIconStyle = css`
  width: 18px;
  height: 18px;
  background-image: url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 6.5C6 6.22386 6.22386 6 6.5 6C6.77614 6 7 6.22386 7 6.5V12.5C7 12.7761 6.77614 13 6.5 13C6.22386 13 6 12.7761 6 12.5V6.5Z" fill="currentColor"/><path d="M9.5 6C9.22386 6 9 6.22386 9 6.5V12.5C9 12.7761 9.22386 13 9.5 13C9.77614 13 10 12.7761 10 12.5V6.5C10 6.22386 9.77614 6 9.5 6Z" fill="currentColor"/><path fill-rule="evenodd" clip-rule="evenodd" d="M11 0H5C4.44772 0 4 0.447715 4 1V3H0.5C0.223858 3 0 3.22386 0 3.5C0 3.77614 0.223858 4 0.5 4H2.1L2.90995 15.0995C2.96107 15.6107 3.39124 16 3.90499 16H12.095C12.6088 16 13.0389 15.6107 13.09 15.0995L13.9 4H15.5C15.7761 4 16 3.77614 16 3.5C16 3.22386 15.7761 3 15.5 3H12V1C12 0.447715 11.5523 0 11 0ZM11 3V1H5V3H11ZM12.895 4H3.10499L3.90499 15H12.095L12.895 4Z" fill="currentColor"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: inline-block;
`

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
  
  /* Add right padding to prevent header text from running into trash button */
  padding-right: 44px;  /* 32px button width + 12px buffer */
  
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
    
    // Larger touch target for mobile/accessibility
    min-width: 32px;
    min-height: 32px;
  }
  
  /* Ensure the FeatureInfo component respects the padding */
  .feature-info-component {
    width: 100%;
  }
  
  /* Make the header wrap if it's still too long */
  .esri-feature__title {
    word-wrap: break-word;
    overflow-wrap: break-word;
    padding-right: 8px;
  }
`

/**
 * QueryResultItem component - displays a single query result record
 * Features:
 * - Clicking the item zooms to the feature on the map
 * - Remove button (trash icon) in upper-right corner to remove record from results
 * - Records are expanded by default to show full feature information
 */
export const QueryResultItem = (props: ResultItemProps) => {
  const { widgetId, data, dataSource, popupTemplate, defaultPopupTemplate, onClick, onRemove, expandByDefault = false } = props
  
  const recordId = data.getId()
  
  // Log when QueryResultItem renders
  React.useEffect(() => {
    debugLogger.log('EXPAND-COLLAPSE', {
      event: 'QueryResultItem-render',
      recordId,
      expandByDefault,
      timestamp: Date.now()
    })
  }, [recordId, expandByDefault])
  
  // Check if this record is currently selected
  const selected = ReactRedux.useSelector((state: IMState) =>
    state.dataSourcesInfo?.[dataSource.id]?.selectedIds?.includes(data.getId())
  )
  
  // Determine if list is displayed vertically (affects FeatureInfo expandability)
  const isVerticalAlign = ReactRedux.useSelector((state: IMState) => {
    const widgetJson = state.appConfig.widgets[widgetId]
    return widgetJson.config.resultListDirection !== ListDirection.Horizontal
  })

  /**
   * Handle clicking on the result item.
   * Triggers zoom and popup opening (handled in toggleSelection callback).
   */
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
      <Tooltip title="Remove result" placement="bottom">
        <Button
          className="remove-button"
          icon
          size="sm"
          variant="text"
          color="inherit"
          onClick={handleRemove}
          aria-label="Remove result"
          css={css`
            padding: 6px;
            min-width: 32px;
            width: 32px;
            height: 32px;
            display: flex;
            align-items: center;
            justify-content: center;
          `}
        >
          <div css={trashIconStyle} aria-hidden="true" />
        </Button>
      </Tooltip>
    </div>
  )
}
