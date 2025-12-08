/** @jsx jsx */
import { React, jsx, type AppMode, type SizeModeLayoutJson, Immutable, classNames } from 'jimu-core'
import type { JimuMapView } from 'jimu-arcgis'
import { LayoutEntry } from 'jimu-layouts/layout-runtime'
import { checkIsLive } from '../utils'

interface LayoutProps {
  jimuMapView?: JimuMapView

  appMode: AppMode
  layouts: { [name: string]: SizeModeLayoutJson }
  LayoutEntry?: any
  widgetManifestName: string
  children?: React.ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface LayoutState {}

export default class Layout extends React.PureComponent<LayoutProps, LayoutState> {
  constructor (props) {
    super(props)

    this.state = {}
  }

  getMapFixedLayout = () => {
    // #1197, #2960
    if (window.jimuConfig.isInBuilder) {
      const LayoutEntry = this.props.LayoutEntry
      const layout = this.props.layouts && this.props.layouts.MapFixedLayout
      return (
        <LayoutEntry
          layouts={layout || null} isInWidget className={classNames('w-100 h-100 map-fix-layout',
            { 'widget-map-usemask': !checkIsLive(this.props.appMode), 'map-is-live-mode': checkIsLive(this.props.appMode) })}
        />
      )
    } else {
      const layout = this.props.layouts && this.props.layouts.MapFixedLayout
      return <LayoutEntry layouts={layout ? Immutable(layout) : null} className='w-100 h-100 map-is-live-mode map-fix-layout' />
    }
  }

  render () {
    return this.getMapFixedLayout()
  }
}
