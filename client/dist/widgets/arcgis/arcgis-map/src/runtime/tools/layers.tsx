/** @jsx jsx */
import { css, jsx, React, classNames } from 'jimu-core'
import { BaseTool, type BaseToolProps, type IconType } from '../layout/base/base-tool'
import type { JimuMapView } from 'jimu-arcgis'
import { defaultMessages, Nav, NavItem, NavLink } from 'jimu-ui'

interface States {
  activeTabIndex: number
}

export default class Layers extends BaseTool<BaseToolProps, States> {
  toolName = 'Layers'

  constructor (props) {
    super(props)
    this.state = {
      activeTabIndex: 0
    }
  }

  getTitle () {
    return this.props.intl.formatMessage({ id: 'LayersLabel', defaultMessage: defaultMessages.LayersLabel })
  }

  getIcon (): IconType {
    return {
      icon: require('../assets/icons/layerlist.svg')
    }
  }

  getExpandPanel (): React.JSX.Element {
    return (
      <div
        style={{ width: this.props.isMobile ? '100%' : '250px', minHeight: '32px', position: 'relative' }}
        className={classNames({ 'exbmap-ui-pc-expand-maxheight': !this.props.isMobile })}
      >
        <Nav tabs style={{ borderRadius: 0 }}>
          <NavItem>
            <NavLink style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} active={this.state.activeTabIndex === 0} onClick={() => { this.handleTabIndexChange(0) }} onKeyDown={e => { this.handleKeyDown(e, 0) }}>
              {this.props.intl.formatMessage({ id: 'LayersLabelLayer', defaultMessage: defaultMessages.LayersLabelLayer })}
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink style={{ borderBottomLeftRadius: 0, borderBottomRightRadius: 0 }} active={this.state.activeTabIndex === 1} onClick={() => { this.handleTabIndexChange(1) }} onKeyDown={e => { this.handleKeyDown(e, 1) }}>
              {this.props.intl.formatMessage({ id: 'LayersLabelLegend', defaultMessage: defaultMessages.LayersLabelLegend })}
            </NavLink>
          </NavItem>
        </Nav>
        <div className='mt-1' />
        {this.state.activeTabIndex === 0 && <LayerListInner jimuMapView={this.props.jimuMapView} mapComponentsLoaded={this.props.mapComponentsLoaded} />}
        {this.state.activeTabIndex === 1 && <LegendInner jimuMapView={this.props.jimuMapView} mapComponentsLoaded={this.props.mapComponentsLoaded} />}
      </div>
    )
  }

  handleTabIndexChange = (activeTabIndex: number) => {
    this.setState({
      activeTabIndex: activeTabIndex
    })
  }

  handleKeyDown = (e: React.KeyboardEvent<any>, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      this.handleTabIndexChange(index)
    }
  }
}

interface InnerProps {
  jimuMapView: JimuMapView
  mapComponentsLoaded: boolean
}

class LayerListInner extends React.PureComponent<InnerProps, any> {
  layerListElement: HTMLArcgisLayerListElement & { view: __esri.View }
  container: HTMLElement

  constructor (props) {
    super(props)
    this.state = {}
  }

  onRef(ref) {
    // ref is set to null when open popper or switch active view, then set to original dom, we need to avoid this special case
    if (!ref) {
      return
    }

    this.container = ref
    this.tryUpdateLayerListElement()
  }

  componentDidUpdate () {
    this.tryUpdateLayerListElement()
  }

  tryUpdateLayerListElement() {
    // ref is set to null when open popper or switch active view, then set to original dom, we need to avoid this special case
    if (!this.container) {
      return
    }

    const jimuMapView = this.props.jimuMapView
    const currView = jimuMapView?.view || null

    if (this.props.mapComponentsLoaded && this.container && currView) {
      // ready to create/update LayerList element

      // destroy current layerListElement when container changed
      if (this.layerListElement) {
        if (this.layerListElement.parentNode !== this.container) {
          this.destroyLayerListElement()
        }
      }

      if (this.layerListElement) {
        // update layerListElement.view if view changed
        if (this.layerListElement.view !== currView) {
          this.layerListElement.view = currView
        }
      } else {
        // create new LayerList element
        this.layerListElement = document.createElement('arcgis-layer-list') as HTMLArcgisLayerListElement & { view: __esri.View }
        this.layerListElement.view = currView
        this.container.appendChild(this.layerListElement)

        jimuMapView.deleteJimuMapTool('LayerList')
        jimuMapView.addJimuMapTool({
          name: 'LayerList',
          instance: this.layerListElement
        })
      }
    } else {
      // not ready to create/update LayerList element
      this.destroyLayerListElement()
    }
  }

  destroyLayerListElement() {
    if (this.layerListElement) {
      this.layerListElement.destroy()
      this.layerListElement = null
      const jimuMapView = this.props.jimuMapView

      if (jimuMapView) {
        jimuMapView.deleteJimuMapTool('LayerList')
      }
    }
  }

  componentWillUnmount () {
    this.destroyLayerListElement()
  }

  getStyle () {
    return css`
      width: 100%;
      min-height: 32px;
      position: relative;

      arcgis-layer-list {
        width: 100%;
      }
    `
  }

  render () {
    return (
      <div className='layers-map-tool' ref={ref => { this.onRef(ref) }} css={this.getStyle()}>
      </div>
    )
  }
}

class LegendInner extends React.PureComponent<InnerProps, any> {
  legendElement: HTMLArcgisLegendElement & { view: __esri.View }
  container: HTMLElement

  constructor (props) {
    super(props)
    this.state = {}
  }

  onRef(ref) {
    // ref is set to null when open popper or switch active view, then set to original dom, we need to avoid this special case
    if (!ref) {
      return
    }

    this.container = ref
    this.tryUpdateLegendElement()
  }

  componentDidUpdate () {
    this.tryUpdateLegendElement()
  }

  tryUpdateLegendElement() {
    // ref is set to null when open popper or switch active view, then set to original dom, we need to avoid this special case
    if (!this.container) {
      return
    }

    const jimuMapView = this.props.jimuMapView
    const currView = jimuMapView?.view || null

    if (this.props.mapComponentsLoaded && this.container && currView) {
      // ready to create/update Legend element

      // destroy current legendElement when container changed
      if (this.legendElement) {
        if (this.legendElement.parentNode !== this.container) {
          this.destroyLegendElement()
        }
      }

      if (this.legendElement) {
        // update legendElement.view if view changed
        if (this.legendElement.view !== currView) {
          this.legendElement.view = currView
        }
      } else {
        // create new Legend element
        this.legendElement = document.createElement('arcgis-legend') as HTMLArcgisLegendElement & { view: __esri.View }
        this.legendElement.view = currView
        this.container.appendChild(this.legendElement)

        jimuMapView.deleteJimuMapTool('Legend')
        jimuMapView.addJimuMapTool({
          name: 'Legend',
          instance: this.legendElement
        })
      }
    } else {
      // not ready to create/update Legend element
      this.destroyLegendElement()
    }
  }

  destroyLegendElement() {
    if (this.legendElement) {
      this.legendElement.destroy()
      this.legendElement = null
      const jimuMapView = this.props.jimuMapView

      if (jimuMapView) {
        jimuMapView.deleteJimuMapTool('Legend')
      }
    }
  }

  componentWillUnmount () {
    this.destroyLegendElement()
  }

  getStyle () {
    return css`
      width: 100%;
      min-height: 32px;
      position: relative;

      arcgis-legend {
        width: 100%;
      }
    `
  }

  render () {
    return (
      <div className='legend-map-tool' ref={ref => { this.onRef(ref) }} css={this.getStyle()}>
      </div>
    )
  }
}
