import { React, ReactRedux, type ImmutableObject, type JimuMapViewInfo, type IMState, type DataSourceInfo } from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'

interface Props {
  jimuMapView: JimuMapView

  onSelectedGraphicsChanged?: (selectedGraphicCount: number) => void
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface States {}

class _SelectedNumber extends React.PureComponent<Props & ExtraProps, States> {
  currentJimuMapView: JimuMapView

  componentDidMount () {
    this.setCurrentJimuMapView(this.props.jimuMapView)
    this.computerSelectedGraphicCount()
  }

  componentDidUpdate (prevProps: Readonly<Props & ExtraProps>): void {
    const preJimuMapView = prevProps?.jimuMapView || null
    const currJimuMapView = this.props.jimuMapView || null

    if (preJimuMapView !== currJimuMapView) {
      // switch map
      this.setCurrentJimuMapView(currJimuMapView)
    }

    this.computerSelectedGraphicCount()
  }

  componentWillUnmount (): void {
    this.setCurrentJimuMapView(null)
  }

  setCurrentJimuMapView (jimuMapView: JimuMapView): void {
    if (this.currentJimuMapView) {
      this.currentJimuMapView.removeJimuLayerViewSelectedFeaturesChangeListener(this.onJimuLayerViewSelectedFeaturesChange)
    }

    this.currentJimuMapView = jimuMapView

    if (this.currentJimuMapView) {
      this.currentJimuMapView.addJimuLayerViewSelectedFeaturesChangeListener(this.onJimuLayerViewSelectedFeaturesChange)
    }
  }

  onJimuLayerViewSelectedFeaturesChange = () => {
    // Typically, this callback method is called when we highlight a feature by popup click, but the data source is not used and not created.
    this.computerSelectedGraphicCount()
  }

  computerSelectedGraphicCount () {
    if (this.props.onSelectedGraphicsChanged) {
      const selectedGraphicCount = this.props.jimuMapView.getSelectedFeatureCount()
      this.props.onSelectedGraphicsChanged(selectedGraphicCount)
    }
  }

  render () {
    return null
  }
}

const mapStateToProps = (state: IMState, ownProps: Props): ExtraProps => {
  if (state.appStateInBuilder) {
    const dataSourcesInfo = state.appStateInBuilder && state.appStateInBuilder.dataSourcesInfo
    const jimuMapViewsInfo = state.appStateInBuilder && state.appStateInBuilder.jimuMapViewsInfo
    return {
      dataSourcesInfo: dataSourcesInfo,
      viewInfos: jimuMapViewsInfo
    }
  } else {
    const dataSourcesInfo = state && state.dataSourcesInfo
    const jimuMapViewsInfo = state && state.jimuMapViewsInfo
    return {
      dataSourcesInfo: dataSourcesInfo,
      viewInfos: jimuMapViewsInfo
    }
  }
}

interface ExtraProps {
  dataSourcesInfo?: ImmutableObject<{ [dsId: string]: DataSourceInfo }>
  viewInfos?: ImmutableObject<{ [jimuMapViewId: string]: JimuMapViewInfo }>
}

export const SelectedNumber = ReactRedux.connect<ExtraProps, unknown, Props>(mapStateToProps)(_SelectedNumber)
