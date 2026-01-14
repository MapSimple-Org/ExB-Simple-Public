/** @jsx jsx */
// This file is duplicated from '../../../../feature-info/src/runtime/components/feature-info'
import { React, css, jsx, type DataSource, injectIntl, type IntlShape, classNames } from 'jimu-core'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { Button } from 'jimu-ui'
import { RightFilled } from 'jimu-icons/filled/directional/right'
import { DownFilled } from 'jimu-icons/filled/directional/down'
import { createQuerySimpleDebugLogger } from 'widgets/shared-code/common'

const debugLogger = createQuerySimpleDebugLogger()

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
}

interface State {
  loadStatus: LoadStatus
  showContent: boolean
}

const style = css`
  border: 1px solid var(--sys-color-divider-secondary);
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
  private Feature: typeof __esri.Feature
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
        this.setState({ showContent: expandByDefault }, () => {
          debugLogger.log('EXPAND-COLLAPSE', {
            event: 'FeatureInfo-state-updated',
            recordId,
            newShowContent: this.state.showContent,
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

  destroyFeature () {
    this.feature && !this.feature.destroyed && this.feature.destroy()
  }

  getVisibleElements () {
    const { togglable = false } = this.props
    const { showContent } = this.state
    const expanded = togglable ? showContent : true
    return {
      title: true,
      content: {
        fields: expanded,
        text: expanded,
        media: expanded,
        attachments: expanded
      },
      lastEditedInfo: false
    }
  }

  createFeature () {
    let featureModulePromise
    if (this.Feature) {
      featureModulePromise = Promise.resolve()
    } else {
      featureModulePromise = loadArcGISJSAPIModules([
        'esri/widgets/Feature'
      ]).then(modules => {
        [
          this.Feature
        ] = modules
      })
    }
    return featureModulePromise.then(() => {
      // Check if component is still mounted before trying to append
      // This prevents errors when component unmounts during async module loading
      if (!this.featureContainer.current) {
        // Component was unmounted, abort
        return
      }
      
      const container = document && document.createElement('div')
      container.className = 'jimu-widget'
      this.featureContainer.current.appendChild(container)

      const originDS = this.props.dataSource.getOriginDataSources()
      const rootDataSource = originDS?.[0]?.getRootDataSource()

      this.destroyFeature()
      const layer = this.props.graphic.layer as __esri.FeatureLayer
      if (this.props.popupTemplate) {
        this.props.graphic.popupTemplate = this.props.popupTemplate
      } else if (layer) {
        // set popupTemplate with layer's popupTemplate or defaultPopupTemplate
        this.props.graphic.popupTemplate = layer.popupTemplate ?? this.props.defaultPopupTemplate
      } else {
        this.props.graphic.popupTemplate = this.props.defaultPopupTemplate
      }
      if (layer && !layer.popupTemplate) {
        layer.popupTemplate = this.props.popupTemplate || this.props.defaultPopupTemplate
      }
      this.feature = new this.Feature({
        container: container,
        defaultPopupTemplateEnabled: true,
        // @ts-expect-error
        spatialReference: this.props.dataSource?.layer?.spatialReference || null,
        // @ts-expect-error
        map: rootDataSource?.map || null,
        graphic: this.props.graphic,
        visibleElements: this.getVisibleElements()
      })
    }).then(() => {
      this.setState({ loadStatus: LoadStatus.Fulfilled })
    })
  }

  toggleExpanded = (e) => {
    e.stopPropagation()
    this.setState({ showContent: !this.state.showContent })
  }

  render () {
    const { togglable = false, intl } = this.props
    const { showContent } = this.state
    return (
      <div className='feature-info-component d-flex align-items-center p-1' css={style}>
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
            {showContent ? <DownFilled size='m'/> : <RightFilled size='m' autoFlip/>}
          </Button>
        )}
        <div className='flex-grow-1' ref={this.featureContainer} />
      </div>
    )
  }
}

export default injectIntl(FeatureInfo)


