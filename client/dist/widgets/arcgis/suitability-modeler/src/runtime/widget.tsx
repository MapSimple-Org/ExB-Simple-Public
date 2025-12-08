/** @jsx jsx */
/**
  Licensing

  Copyright 2021 Esri

  Licensed under the Apache License, Version 2.0 (the "License"); You
  may not use this file except in compliance with the License. You may
  obtain a copy of the License at
  http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
  implied. See the License for the specific language governing
  permissions and limitations under the License.

  A copy of the license is available in the repository's
  LICENSE file.
*/

import { React, type AllWidgetProps, jsx } from 'jimu-core'
import type { IMConfig } from '../config'
import defaultMessages from './translations/default'

import { JimuMapViewComponent, type JimuMapView } from 'jimu-arcgis'

import { Modeler } from './wro/modeler'
import { WroContext } from './wro/wro-context'
import { ModelFactory, type WroModel, type WroStatus } from './wro/wro-model'
import * as layerUtil from './wro/wro-layer-util'
import * as wroColormaps from './wro/wro-colormaps'
import './style.css'

interface State {
  jimuMapView: JimuMapView
  wasModelLoaded: boolean
  wroModel: WroModel
  wroStatus: WroStatus
}

let COUNTER = 0

export default class Widget extends React.PureComponent<AllWidgetProps<IMConfig>, State> {
  modelerRef
  wroContext: WroContext

  constructor (props: any) {
    super(props)
    this.modelerRef = React.createRef()
    const wroStatus = ModelFactory.newWroStatus()
    this.state = {
      jimuMapView: null,
      wasModelLoaded: false,
      wroModel: null,
      wroStatus: wroStatus
    }

    wroColormaps.initLabels(this.nls)
    const wroContext = this.wroContext = new WroContext()
    wroContext.nls = this.nls
    wroContext.getConfig = (): any => this.props.config
    wroContext.getId = (): string => this.props.id
    wroContext.getLabel = (): string => this.props.config.displayLabel ? this.props.label : null
    wroContext.getPortal = (): any => this.props.portalSelf
    wroContext.getPortalUrl = (): string => this.props.portalUrl
    wroContext.getTheme = (): any => this.props.theme
    wroContext.getUser = (): any => this.props.user
    wroContext.getView = (): any => this.state.jimuMapView?.view
    wroContext.modelController.onModelChange = this.onWroModelChange
    wroContext.modelController.onStatusChange = this.onWroStatusChange
  }

  componentDidUpdate (prevProps: AllWidgetProps<IMConfig>, prevState: State): void {
    const wroContext: WroContext = this.wroContext
    const wroModel: WroModel = this.state.wroModel

    const state: State = this.state
    const props: AllWidgetProps<IMConfig> = this.props
    const config: IMConfig = props.config
    const prevConfig: IMConfig = prevProps.config

    const serviceUrl = config.serviceUrl
    const itemId = config.itemId
    const prevServiceUrl = prevConfig.serviceUrl
    const prevItemId = prevConfig.itemId

    let newState: any
    const ensureNewState = (): any => {
      if (newState === undefined) newState = {}
      return newState
    }

    const ensureNewStatus = (): WroStatus => {
      ensureNewState()
      if (!newState.wroStatus) {
        newState.wroStatus = ModelFactory.cloneStatus(state.wroStatus)
      }
      return newState.wroStatus
    }

    if (props.theme !== prevProps.theme) {
      ensureNewStatus().themeId = this.newThemeId()
    }
    if (props.label !== prevProps.label) {
      ensureNewStatus()
    }
    if (config.displayLabel !== prevConfig.displayLabel) {
      ensureNewStatus()
    }
    if (config.allowExport !== prevConfig.allowExport) {
      ensureNewStatus()
    }
    if (config.lockSlider !== prevConfig.lockSlider) {
      ensureNewStatus()
    }
    if (config.hideRanges !== prevConfig.hideRanges) {
      ensureNewStatus()
    }

    if (!serviceUrl && !itemId) {
      this.clearLayers(state.jimuMapView?.view, wroModel)
      ensureNewState().wroModel = null
      this.setState(newState)
      return
    }

    let reloadModel = true
    if (prevServiceUrl && prevServiceUrl === serviceUrl) {
      reloadModel = false
    } else if (prevItemId && prevItemId === itemId) {
      reloadModel = false
    }

    if (state.jimuMapView && !prevState.jimuMapView && !state.wasModelLoaded) {
      reloadModel = true
    }

    if (reloadModel) {
      this.clearLayers(state.jimuMapView?.view, wroModel)
      ensureNewStatus().isModelLoading = true
      ensureNewState().wroModel = null
      this.setState(newState)
      this.loadModel(wroContext, serviceUrl, itemId, true)
    } else {
      if (newState) {
        this.setState(newState)
      }

      const jimuMapView = state.jimuMapView
      if (jimuMapView && jimuMapView !== prevState.jimuMapView) {
        if (state.wasModelLoaded && wroModel && wroModel.mapLayerId) {
          const isStartup = true
          this.autoRunModel(isStartup)
        }
      }
    }
  }

  componentWillUnmount (): void {
    const view = this.state.jimuMapView?.view
    const wroModel: WroModel = this.state.wroModel
    this.clearLayers(view, wroModel)
  }

  autoRunModel = (isStartup?: boolean): void => {
    const wroContext: WroContext = this.wroContext
    const wroModel: WroModel = this.state.wroModel
    const jimuMapView = this.state.jimuMapView

    // @todo should we auto-add the model layer to the new view
    // or wait for the user to hit the run button?
    if (jimuMapView?.view?.map) {
      if (wroModel && (wroModel.mapLayerId || isStartup)) {
        if (wroContext.modelController.isValid(wroModel)) {
          layerUtil.runWroModel(wroContext, wroModel).then(() => {
            // n/a
          }).catch(ex => {
            console.error('Error running WRO model', ex)
          })
        }
      }
    }
  }

  clearLayers = (view: any, wroModel: WroModel): void => {
    const wroContext: WroContext = this.wroContext
    const id = this.props.id
    if (view?.map) {
      let l = view.map.findLayerById(`${id}_drawGfxLayerId`)
      if (l) view.map.remove(l)
      l = view.map.findLayerById(`${id}_selGfxLayerId`)
      if (l) view.map.remove(l)
      if (wroModel?.mapLayerId) {
        layerUtil.removeLayer(wroContext, wroModel)
      }
    }
  }

  handleActiveViewChange = (jimuMapView: JimuMapView): void => {
    const wroModel: WroModel = this.state.wroModel

    // @todo should we remove the model layer from the previous view?
    const prev = this.state.jimuMapView
    if (prev?.view?.map) {
      this.clearLayers(prev?.view, wroModel)
    }

    const wroStatus = ModelFactory.cloneStatus(this.state.wroStatus)
    if (jimuMapView) {
      wroStatus.viewId = this.newViewId()
    } else {
      wroStatus.viewId = null
    }
    this.setState({
      jimuMapView: jimuMapView,
      wroStatus: wroStatus
    }, () => {

      // if (jimuMapView && !prev) {
      //   const wroContext: WroContext = this.wroContext;
      //   let serviceUrl = this.props.config.serviceUrl;
      //   let itemId = this.props.config.itemId;
      //
      //   //serviceUrl = "https://utility.arcgis.com/usrsvcs/servers/24b7c7752170431a95719323a9e71a5e/rest/services/WRO_World_Ecophysiographic_Data/ImageServer";
      //   //itemId = null;
      //   //serviceUrl = null;
      //   //itemId = "7cf3a0ca09254e01a1a8b073cd80cbf7";
      //
      //   this.loadModel(wroContext,serviceUrl,itemId,true);
      // }

    })
  }

  loadModel (wroContext: WroContext, serviceUrl: string, itemId: string, isStartup?: boolean): void {
    wroContext.loadModel(serviceUrl, itemId).then(result => {
      const wroModel = result as WroModel
      const wroStatus = ModelFactory.cloneStatus(this.state.wroStatus)
      wroStatus.isModelLoading = false
      this.setState({
        wasModelLoaded: true,
        wroModel: wroModel,
        wroStatus: wroStatus
      }, () => {
        // @todo should we auto-add model layer on startup?
        if (isStartup) {
          this.autoRunModel(isStartup)
        }
      })
    }).catch(ex => {
      console.error('Error loading WRO model', ex)
      const wroStatus = ModelFactory.cloneStatus(this.state.wroStatus)
      wroStatus.isModelLoading = false
      this.setState({
        wroStatus: wroStatus
      })
    })
  }

  newThemeId = (): string => {
    return 'themeId_' + (COUNTER++).toString()
  }

  newViewId = (): string => {
    return 'viewId_' + (COUNTER++).toString()
  }

  nls = (id: string, values?: any): string => {
    if (this.props.intl) {
      return this.props.intl.formatMessage({
        id: id,
        defaultMessage: defaultMessages[id]
      }, values)
    }
    return id
  }

  onWroModelChange = (wroModel: WroModel, wasCleared?: boolean): void => {
    try {
      if (wasCleared) {
        const clearGfx = this.modelerRef?.current?.chartPanelRef?.current?.handleClearClicked
        if (clearGfx) clearGfx()
      }
    } catch (ex) {
      console.error(ex)
    }

    this.setState({
      wroModel: wroModel
    })
  }

  onWroStatusChange = (wroStatus: WroStatus): void => {
    this.setState({
      wroStatus: wroStatus
    })
  }

  render (): any {
    const wroContext: WroContext = this.wroContext
    const wroModel: WroModel = this.state.wroModel
    const wroStatus: WroStatus = this.state.wroStatus
    return (
      <div className='widget-wro jimu-widget'>
        <Modeler ref={this.modelerRef}
          wroContext={wroContext} wroModel={wroModel} wroStatus={wroStatus}
        />
        <JimuMapViewComponent
          useMapWidgetId={this.props.useMapWidgetIds?.[0]}
          onActiveViewChange={this.handleActiveViewChange}
        />
      </div>
    )
  }
}
