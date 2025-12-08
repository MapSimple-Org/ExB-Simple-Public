/** @jsx jsx */
// This file is duplicated from '../../../../feature-info/src/runtime/components/feature-info'
import { React, css, jsx, type DataSource, injectIntl, type IntlShape, classNames } from 'jimu-core'
import { loadArcGISJSAPIModules } from 'jimu-arcgis'
import { Button } from 'jimu-ui'
import { RightFilled } from 'jimu-icons/filled/directional/right'
import { DownFilled } from 'jimu-icons/filled/directional/down'

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
    this.featureContainer = React.createRef()
    this.state = {
      showContent: !togglable || expandByDefault,
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
      <div className='feature-info-component d-flex align-items-center p-2' css={style}>
        {togglable && (
          <Button
            aria-label={intl.formatMessage({ id: showContent ? 'collapse' : 'expand' })}
            className={classNames('p-0 jimu-outline-inside flex-shrink-0', { expanded: showContent })}
            variant='text'
            color='inherit'
            icon
            size='sm'
            onClick={this.toggleExpanded}
          >
            {showContent ? <DownFilled size='s'/> : <RightFilled size='s' autoFlip/>}
          </Button>
        )}
        <div className='flex-grow-1' ref={this.featureContainer} />
      </div>
    )
  }
}

export default injectIntl(FeatureInfo)


