/** @jsx jsx */
// This file is duplicated from '../../../../feature-info/src/runtime/components/feature-info'
import { React, css, jsx, type DataSource, injectIntl, type IntlShape, classNames } from 'jimu-core'
// r024.51: Direct import from @arcgis/core instead of jimu-arcgis wrapper.
// This is INDEPENDENT of the USE_DIRECT_QUERY toggle and remains enabled.
//
// Why: The jimu-arcgis Feature wrapper prevents ESRI's internal ObservationHandle
// cleanup between queries. Importing directly from @arcgis/core lets ESRI's core
// delete its own handles (50K+ deleted per cycle vs ~0 on the jimu-arcgis path).
// This is a low-risk module swap - same Feature widget, same popup rendering,
// just imported from the source instead of through ExB's wrapper layer.
import Feature from '@arcgis/core/widgets/Feature'
import { Button } from 'jimu-ui'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/mapsimple-common'

const debugLogger = createQuerySimpleDebugLogger()

/**
 * Arrow icons as CSS background-images (r021.46 memory optimization)
 * Instead of creating 600 React component instances of RightFilled/DownFilled,
 * we use CSS styles with SVG data-uris that are reused across all items.
 * This eliminates 600 component instances + 600 DOM nodes.
 * SVG sources: jimu-icons/svg/filled/directional/right.svg and down.svg
 */
const rightArrowStyle = css`
  width: 16px;
  height: 16px;
  background-image: url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 2L12 8L4 14V2Z" fill="currentColor"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: inline-block;
`

const downArrowStyle = css`
  width: 16px;
  height: 16px;
  background-image: url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14 4L8 12L2 4L14 4Z" fill="currentColor"/></svg>');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: inline-block;
`

export enum LoadStatus {
  Pending = 'Pending',
  Fulfilled = 'Fulfilled',
  Rejected = 'Rejected'
}

interface Props {
  dataSource: DataSource
  graphic: __esri.Graphic
  popupTemplate: __esri.PopupTemplate
  defaultPopupTemplate: __esri.PopupTemplate
  togglable?: boolean
  expandByDefault?: boolean
  /** r023.33: Notifies parent when expand state changes. Used by QueryResultItem to show inline icons vs menu. */
  onExpandChange?: (expanded: boolean) => void
}

interface State {
  loadStatus: LoadStatus
  showContent: boolean
}

const style = css`
  border: 1px solid var(--sys-color-divider-secondary);
  /* r025.063: Ensure short-content expanded items are tall enough to cover stacked action buttons */
  &.feature-info-expanded {
    min-height: 4.5rem;
  }
  .esri-widget__heading {
    font-size: 0.875rem !important;
    font-weight: 500 !important;
    margin: 0;
    color: var(--sys-color-surface-paper-text);
  }

  .esri-feature__content-element {
    padding: 0;
  }

  .jimu-btn.expanded {
    align-self: flex-start;
  }
  
  // Larger expand/collapse button for better touch targets
  .jimu-btn[aria-label*="expand"],
  .jimu-btn[aria-label*="collapse"] {
    min-width: 32px;
    min-height: 32px;
    padding: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .esri-feature.esri-widget {
    background-color: transparent;
  }
`

interface ExtraProps {
  intl: IntlShape
}

class FeatureInfo extends React.PureComponent<Props & ExtraProps, State> {
  // r024.48: Removed private Feature class reference - using direct import now
  private feature: __esri.Feature
  private readonly featureContainer: React.RefObject<HTMLInputElement | null>

  constructor (props) {
    super(props)
    const { togglable = false, expandByDefault } = this.props
    const recordId = this.props.graphic?.attributes?.OBJECTID || this.props.graphic?.attributes?.objectid || 'unknown'
    const initialShowContent = !togglable || expandByDefault
    
    debugLogger.log('EXPAND-COLLAPSE', {
      event: 'FeatureInfo-constructor',
      recordId,
      togglable,
      expandByDefault,
      initialShowContent,
      timestamp: Date.now()
    })
    
    this.featureContainer = React.createRef()
    this.state = {
      showContent: initialShowContent,
      loadStatus: LoadStatus.Pending
    }
  }

  componentDidMount () {
    this.createFeature()
  }

  componentDidUpdate (prevProps: Props) {
    if (this.feature) {
      if (prevProps.popupTemplate !== this.props.popupTemplate ||
        prevProps.defaultPopupTemplate !== this.props.defaultPopupTemplate ||
        prevProps.graphic !== this.props.graphic) {
        this.destroyFeature()
        this.createFeature()
      } else {
        this.feature.visibleElements = this.getVisibleElements()
      }
    }
    
    // Sync expandByDefault prop changes (when user clicks Expand All/Collapse All)
    // This ensures all items respect the global expand/collapse state
    if (prevProps.expandByDefault !== this.props.expandByDefault) {
      const { togglable = false, expandByDefault } = this.props
      const recordId = this.props.graphic?.attributes?.OBJECTID || this.props.graphic?.attributes?.objectid || 'unknown'
      
      debugLogger.log('EXPAND-COLLAPSE', {
        event: 'expandByDefault-prop-changed',
        recordId,
        prevExpandByDefault: prevProps.expandByDefault,
        newExpandByDefault: expandByDefault,
        togglable,
        currentShowContent: this.state.showContent,
        willUpdateState: togglable,
        timestamp: Date.now()
      })
      
      if (togglable) {
        // r024.19: Don't call onExpandChange when syncing from prop - parent already knows
        // Calling it would cause a cascade: prop change → setState → onExpandChange → parent setState
        // With 600 items, this was causing 2400+ state updates and a visible flash
        this.setState({ showContent: expandByDefault }, () => {
          debugLogger.log('EXPAND-COLLAPSE', {
            event: 'FeatureInfo-state-updated-from-prop',
            recordId,
            newShowContent: this.state.showContent,
            note: 'r024.19: Skipping onExpandChange callback - parent initiated this change',
            timestamp: Date.now()
          })
        })
      }
    }
    
    // Log all componentDidUpdate calls to track remounts
    const recordId = this.props.graphic?.attributes?.OBJECTID || this.props.graphic?.attributes?.objectid || 'unknown'
    if (prevProps.graphic !== this.props.graphic || 
        prevProps.popupTemplate !== this.props.popupTemplate ||
        prevProps.defaultPopupTemplate !== this.props.defaultPopupTemplate) {
      debugLogger.log('EXPAND-COLLAPSE', {
        event: 'FeatureInfo-props-changed-recreate',
        recordId,
        graphicChanged: prevProps.graphic !== this.props.graphic,
        popupTemplateChanged: prevProps.popupTemplate !== this.props.popupTemplate,
        defaultPopupTemplateChanged: prevProps.defaultPopupTemplate !== this.props.defaultPopupTemplate,
        expandByDefault: this.props.expandByDefault,
        currentShowContent: this.state.showContent,
        timestamp: Date.now()
      })
    }
  }

  // r023.21: Ensure Esri Feature widget and container div are cleaned up on unmount.
  // Without this, every unmount (clearResult, query switch, record removal) orphans
  // the manually-created DOM as detached nodes that can't be GC'd.
  componentWillUnmount () {
    this.destroyFeature()
  }

  destroyFeature () {
    // r024.45: Simplified cleanup - let ESRI handle its own cleanup.
    // Removed r024.32-34 globalHandleManager tracking (160 objects/closures per query)
    // and r024.32 aggressive Calcite disconnectedCallback calls (10,000+ DOM queries).
    
    if (this.feature && !this.feature.destroyed) {
      this.feature.destroy()
    }
    this.feature = null
    
    // Clear the outer container
    if (this.featureContainer.current) {
      this.featureContainer.current.innerHTML = ''
    }
  }

  getVisibleElements () {
    const { showContent } = this.state
    return {
      title: true,
      content: showContent
        ? {
            fields: true,
            text: true,
            media: true,
            attachments: true
          }
        : false,
      lastEditedInfo: false
    }
  }

  createFeature () {
    if (!this.featureContainer.current) {
      return
    }

    this.destroyFeature()

    const container = document && document.createElement('div')
    container.className = 'jimu-widget'
    this.featureContainer.current.appendChild(container)

    const originDS = this.props.dataSource.getOriginDataSources()
    const rootDataSource = originDS?.[0]?.getRootDataSource()
    const layer = this.props.graphic.layer as __esri.FeatureLayer
    if (this.props.popupTemplate) {
      this.props.graphic.popupTemplate = this.props.popupTemplate
    } else if (layer) {
      this.props.graphic.popupTemplate = layer.popupTemplate ?? this.props.defaultPopupTemplate
    } else {
      this.props.graphic.popupTemplate = this.props.defaultPopupTemplate
    }
    if (layer && !layer.popupTemplate) {
      layer.popupTemplate = this.props.popupTemplate || this.props.defaultPopupTemplate
    }
    // r024.51: Direct instantiation from @arcgis/core - no jimu-arcgis wrapper
    this.feature = new Feature({
      container: container,
      defaultPopupTemplateEnabled: true,
      // @ts-expect-error
      spatialReference: this.props.dataSource?.layer?.spatialReference || null,
      // @ts-expect-error
      map: rootDataSource?.map || null,
      graphic: this.props.graphic,
      visibleElements: this.getVisibleElements()
    })
    this.setState({ loadStatus: LoadStatus.Fulfilled })
  }

  toggleExpanded = (e) => {
    e.stopPropagation()
    const next = !this.state.showContent
    this.setState({ showContent: next }, () => {
      this.props.onExpandChange?.(next)
    })
  }

  render () {
    const { togglable = false, intl } = this.props
    const { showContent } = this.state
    return (
      <div className={classNames('feature-info-component d-flex align-items-center p-1', { 'feature-info-expanded': showContent })} css={style}>
        {togglable && (
          <Button
            aria-label={intl.formatMessage({ id: showContent ? 'collapse' : 'expand' })}
            className={classNames('jimu-outline-inside flex-shrink-0', { expanded: showContent })}
            variant='text'
            color='inherit'
            icon
            size='sm'
            onClick={this.toggleExpanded}
            css={css`
              min-width: 32px;
              min-height: 32px;
              padding: 6px;
              display: flex;
              align-items: center;
              justify-content: center;
            `}
          >
            <div css={showContent ? downArrowStyle : rightArrowStyle} aria-hidden="true" />
          </Button>
        )}
        <div className='flex-grow-1' ref={this.featureContainer} />
      </div>
    )
  }
}

export default injectIntl(FeatureInfo)


