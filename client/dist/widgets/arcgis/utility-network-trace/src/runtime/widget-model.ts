import {
  DataSourceManager, MessageManager, DataRecordsSelectionChangeMessage, type DataSourceJson, type ImmutableObject, type FeatureLayerQueryParams,
  getAppStore, DataSourceStatus, type FeatureLayerDataSource, type QueriableDataSource, type SubtypeSublayerDataSource
} from 'jimu-core'
import { type JimuMapView, MapViewManager } from 'jimu-arcgis'
import { defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import UtilityNetworkTrace from 'esri/widgets/UtilityNetworkTrace'
import * as reactiveUtils from 'esri/core/reactiveUtils'
import { traceInformation } from '../setting/constants'
import FeatureLayer from 'esri/layers/FeatureLayer'
import Graphic from 'esri/Graphic'
import type { IMConfig } from '../config'
import { getOutputDataSourceId } from '../common/utils'

export default class WidgetModel {
  private static instance: WidgetModel

  public unt: UtilityNetworkTrace = null

  public activeDataSourceId: string = ''
  public appConfigDataSources: ImmutableObject<{ [dsId: string]: DataSourceJson }> = null
  public updatedConfig: IMConfig = null

  private props: any = null

  readonly mvManager: MapViewManager = MapViewManager.getInstance()

  static getInstance (): WidgetModel {
    if (!WidgetModel.instance) {
      WidgetModel.instance = new WidgetModel()
    }
    return WidgetModel.instance
  }

  /****** PUBLIC METHODS ****/
  public loadPropsFromView (props) {
    this.props = props
  }

  //--------------------------------------------------------------------------
  //  loadTraceWidgetFromAPI
  //--------------------------------------------------------------------------

  /**
   * Loads the Utility Network widget from the ArcGIS JS SDK. Takes a Utility Network with published trace configurations to work.
   *
   * @method loadTraceWidgetFromAPI
   * @instance
   * @param {any} jimuMapView - The current active map view.
   * @param {HTMLElement} domRef - Reference to the DOM object to place the widget.
   * @return {Promise<UtilityNetworkTrace>} When resolved, response is the Utility Network Trace widget.
   */
  public async loadTraceWidgetFromAPI (jimuMapView: any, domRef: HTMLElement,
    appConfigDataSources: ImmutableObject<{ [dsId: string]: DataSourceJson }>): Promise<UtilityNetworkTrace> {
    if (this.unt !== null) {
      if (this.unt.viewModel !== null) {
        this.unt.viewModel.reset()
      }
    }
    let un = null
    if (jimuMapView.view.map.utilityNetworks) {
      un = jimuMapView.view.map.utilityNetworks.getItemAt(0)
    }
    const unt = new UtilityNetworkTrace({
      container: domRef,
      utilityNetwork: un,
      view: jimuMapView.view,
      showSelectionAttributes: true,
      selectOnComplete: true,
      showGraphicsOnComplete: true,
      selectedTraces: [],
      flags: [],
      enableResultArea: this.props.config.configInfo?.[jimuMapView.dataSourceId]?.traceResultAreaSettings?.enableResultArea,
      resultAreaProperties: this.props.config.configInfo?.[jimuMapView.dataSourceId]?.traceResultAreaSettings?.resultAreaProperties
    })
    this.unt = unt
    this.activeDataSourceId = jimuMapView.dataSourceId
    this.appConfigDataSources = appConfigDataSources
    this.updatedConfig = this.props.config
    await this.loadAllChildDS()
    this.registerEvents()
    return unt
  }

  /**
   * Update the Unt property on change from config
   * @param enableResultArea unt enable result area props
   * @param resultAreaProps unt result area props
   * @param config updated config
   * @param updatedAppConfigDataSources updated app config datasources
   */
  public updateUntProps (enableResultArea: boolean, resultAreaProps: ImmutableObject<__esri.ResultAreaPropertiesExtend>, config: IMConfig,
    updatedAppConfigDataSources: ImmutableObject<{ [dsId: string]: DataSourceJson }>) {
    this.unt?.set?.('enableResultArea', enableResultArea)
    this.unt?.set?.('resultAreaProperties', resultAreaProps)
    this.appConfigDataSources = updatedAppConfigDataSources
    this.updatedConfig = config
  }

  /**
   * get output data source from data source manager instance
   * @param outputDs output datasource id
   * @returns output datasource
   */
  public getOutputDataSource = (outputDsId: string) => {
    return DataSourceManager.getInstance().getDataSource(outputDsId)
  }

  /**
   * Build trace result area statistics as output
   * @param traceResultGraphics trace result area graphics
   */
  buildTraceResultStatsAsOutput = async (traceResultGraphics: __esri.CollectionProperties<__esri.GraphicProperties>) => {
    const outputDsId = getOutputDataSourceId(this.props.widgetId)
    let outputDs = this.getOutputDataSource(outputDsId)
    //if outputDs is not available create it
    if (!outputDs) {
      outputDs = await DataSourceManager.getInstance().createDataSource(outputDsId) as FeatureLayerDataSource
    }
    //if outputDs still not valid return
    if (!outputDs) {
      return
    }

    //if all the result area graphics are removed then show no data status in dataSource
    if (traceResultGraphics?.length === 0) {
      outputDs.setStatus(DataSourceStatus.NotReady)
      return
    }

    const statsFields = []

    statsFields.push({
      alias: 'OBJECTID',
      type: 'double',
      name: 'OBJECTID'
    })

    // trace result area stats values which will be displayed or use in other widgets
    traceInformation.forEach((trace) => {
      const areaUnit = this.updatedConfig?.configInfo?.[this.activeDataSourceId]?.traceResultAreaSettings?.resultAreaProperties?.areaUnit || 'square-feet'
      if (trace.value === 'areaStatistic') {
        if (areaUnit === 'square-miles') {
          statsFields.push({
            alias: this.appConfigDataSources[outputDsId].schema.fields[trace.value].alias,
            type: 'double',
            name: trace.value
          })
        } else if (areaUnit === 'square-meters') {
          statsFields.push({
            alias: this.appConfigDataSources[outputDsId].schema.fields[trace.value].alias,
            type: 'double',
            name: trace.value
          })
        } else if (areaUnit === 'square-feet') {
          statsFields.push({
            alias: this.appConfigDataSources[outputDsId].schema.fields[trace.value].alias,
            type: 'double',
            name: trace.value
          })
        } else if (areaUnit === 'square-kilometers') {
          statsFields.push({
            alias: this.appConfigDataSources[outputDsId].schema.fields[trace.value].alias,
            type: 'double',
            name: trace.value
          })
        }
      } else if (trace.value === 'version' || trace.value === 'elementCount') {
        statsFields.push({
          alias: this.appConfigDataSources[outputDsId].schema.fields[trace.value].alias,
          type: 'double',
          name: trace.value
        })
      } else {
        statsFields.push({
          alias: this.appConfigDataSources[outputDsId].schema.fields[trace.value].alias,
          type: 'string',
          name: trace.value
        })
      }
    })

    //fill the info popuptemplate with field name and label
    const fieldsInPopupTemplate: any[] = []
    statsFields.forEach((fields) => {
      if (fields.name) {
        fieldsInPopupTemplate.push({
          fieldName: fields.name,
          label: fields.alias
        })
      }
    })

    const newGraphics: any[] = []
    const symbol = {
      type: 'simple-fill',
      color: this.unt.resultAreaProperties.color.color,
      style: 'solid',
      outline: {
        color: this.unt.resultAreaProperties.color.color,
        width: 1
      }
    } as any
    traceResultGraphics.forEach((graphic: Graphic, index: number) => {
      const traceAttributes: any = {}
      traceAttributes.OBJECTID = index
      statsFields.forEach((fields) => {
        const attributeValue = graphic.attributes[fields.name]
        if (attributeValue !== undefined && attributeValue !== null) {
          if (fields.name === 'date') {
            traceAttributes[fields.name] = attributeValue.toString()
          } else {
            traceAttributes[fields.name] = attributeValue
          }
        }
      })
      const traceGraphic = new Graphic({
        geometry: graphic.geometry,
        attributes: traceAttributes,
        symbol: symbol
      })
      newGraphics.push(traceGraphic)
    })

    const messages = Object.assign({}, jimuUIDefaultMessages)
    //create custom feature layer with all the trace result area statistics info
    const renderer = {
      type: 'simple',
      symbol: symbol
    } as __esri.renderers.Renderer

    const layer = new FeatureLayer({
      id: outputDsId + '_layer',
      title: this.props.intl.formatMessage({ id: 'outputStatistics', defaultMessage: messages.outputStatistics }, { name: this.props.label }),
      fields: statsFields,
      geometryType: 'polygon',
      source: newGraphics,
      objectIdField: 'OBJECTID',
      popupTemplate: { //feature info widget popup title
        title: '{traceName}',
        fieldInfos: fieldsInPopupTemplate,
        content: [{
          type: 'fields',
          fieldInfos: fieldsInPopupTemplate
        }]
      },
      renderer: renderer
    })
    const featureLayerDs = outputDs as FeatureLayerDataSource
    featureLayerDs.layer = layer
    //update the data source status
    outputDs?.setStatus(DataSourceStatus.Unloaded)
    outputDs?.setCountStatus(DataSourceStatus.Unloaded)
    outputDs?.addSourceVersion()
  }

  /**
   * Listen the required events and get the results
   */
  public registerEvents () {
    //let traceResultAreaGraphicLayer: __esri.GraphicsLayer

    this.unt.on('create-result-area', () => {
      const graphicsList = []
      setTimeout(() => {
        this.unt.viewModel.traceResults.forEach((traceResult) => {
          // @ts-expect-error: ''create-result-area' new as of ArcGIS Maps SDK for JavaScript 4.29
          if (traceResult.resultAreaGraphic) {
            // @ts-expect-error: ''create-result-area' new as of ArcGIS Maps SDK for JavaScript 4.29
            graphicsList.push(traceResult.resultAreaGraphic)
          }
        })
        //for (const key in result) {
        //Since the graphic is created without adding it yet to a graphic layer,
        //just pass the graphic as an array.
        this.buildTraceResultStatsAsOutput(graphicsList)
        //}
      }, 500)
    })

    /*
    this.unt.on('add-result-area', (result) => {
      for (const key in result) {
        //get the result trace area layer
        traceResultAreaGraphicLayer = result[key].layer
        //Update the output dataSource to reflect the added result area
        this.buildTraceResultStatsAsOutput(traceResultAreaGraphicLayer?.graphics)
      }
    })

    this.unt.on('remove-result-area', () => {
      //Close the popup on removing any result area
      this.unt.view?.closePopup()
      //Update the output dataSource to reflect the removed result area
      this.buildTraceResultStatsAsOutput(traceResultAreaGraphicLayer?.graphics)
    })

    */

    // @ts-expect-error: 'select-features' event is not documented for 4.23, let us fix it later.
    this.unt.on('select-features', (res) => {
      this.clearSelection(res)
      const mapDS = this.getActiveMap()
      const mapLyrVws = mapDS?.jimuLayerViews
      const mapTables = mapDS?.jimuTables
      const dsObj = DataSourceManager.getInstance()
      const mapLyrVwsSel = {}
      const fetchRecordPromises: Array<Promise<any>> = []
      const listOfKeys: string[] = []
      res.resultSet.forEach((arrResult) => {
        if (arrResult) {
          arrResult.forEach((rs) => {
            for (const key in mapLyrVws) {
              const ds = dsObj.getDataSource(mapLyrVws[key].layerDataSourceId)
              if (ds && (ds.type === 'FEATURE_LAYER' || ds.type === 'SUBTYPE_SUBLAYER')) {
                // @ts-expect-error
                if (ds.layer.id === rs.layer.id || (ds.type === 'SUBTYPE_SUBLAYER' && rs.layer.layerId === parseInt(ds.layerId))) {
                  const oidField = rs.layer.objectIdField
                  if (!mapLyrVwsSel[key]) {
                    mapLyrVwsSel[key] = {
                      ds: ds,
                      objectIdList: []
                    }
                  }
                  //create list of all object id's for the layer
                  rs.featureSet.features.forEach((feat) => {
                    if (ds.type === 'SUBTYPE_SUBLAYER') {
                      // @ts-expect-error
                      const dsLayer = ds.layer
                      const subtypeField = dsLayer.subtypeField
                      if (feat.attributes[subtypeField] === dsLayer.subtypeCode || feat.attributes[subtypeField.toLowerCase()] === dsLayer.subtypeCode) {
                        mapLyrVwsSel[key].objectIdList.push(feat.attributes[oidField])
                      }
                    } else {
                      mapLyrVwsSel[key].objectIdList.push(feat.attributes[oidField])
                    }
                  })
                  if (mapLyrVwsSel[key].objectIdList.length > 0) {
                    listOfKeys.push(key)
                    //query the records from dataSource
                    fetchRecordPromises.push(this.fetchRecords(ds, mapLyrVwsSel[key].objectIdList))
                  }
                }
              }
            }
            for (const key in mapTables) {
              const extractedDS = key.split('-').slice(1).join('-')
              const ds = dsObj.getDataSource(extractedDS)
              if (ds && (ds.type === 'FEATURE_LAYER' || ds.type === 'SUBTYPE_SUBLAYER')) {
                // @ts-expect-error
                if (ds.layer.id === rs.layer.id || (ds.type === 'SUBTYPE_SUBLAYER' && rs.layer.layerId === parseInt(ds.layerId))) {
                  const oidField = rs.layer.objectIdField
                  if (!mapLyrVwsSel[key]) {
                    mapLyrVwsSel[key] = {
                      ds: ds,
                      objectIdList: []
                    }
                  }
                  //create list of all object id's for the layer
                  rs.featureSet.features.forEach((feat) => {
                    if (ds.type === 'SUBTYPE_SUBLAYER') {
                      // @ts-expect-error
                      const dsLayer = ds.layer
                      const subtypeField = dsLayer.subtypeField
                      if (feat.attributes[subtypeField] === dsLayer.subtypeCode || feat.attributes[subtypeField.toLowerCase()] === dsLayer.subtypeCode) {
                        mapLyrVwsSel[key].objectIdList.push(feat.attributes[oidField])
                      }
                    } else {
                      mapLyrVwsSel[key].objectIdList.push(feat.attributes[oidField])
                    }
                  })
                  if (mapLyrVwsSel[key].objectIdList.length > 0) {
                    listOfKeys.push(key)
                    //query the records from dataSource
                    fetchRecordPromises.push(this.fetchRecords(ds, mapLyrVwsSel[key].objectIdList))
                  }
                }
              }
            }
          })
        }
      })

      Promise.all(fetchRecordPromises).then((fetchedRecords) => {
        let allRecords = []
        const alldatasources: string[] = []
        listOfKeys.forEach((key, index) => {
          if (fetchedRecords[index]?.length > 0) {
            const ds = mapLyrVwsSel[key].ds
            //selet records in the layer
            ds.selectRecordsByIds(mapLyrVwsSel[key].objectIdList.map(String), fetchedRecords[index], true)
            // create records list to publish DataRecordsSelectionChangeMessage
            allRecords = allRecords.concat(fetchedRecords[index])
            alldatasources.push(ds.id)
          }
        })
        if (allRecords.length > 0) {
          //publish DataRecordsSelectionChangeMessage
          const message = new DataRecordsSelectionChangeMessage(this.props.id, allRecords, alldatasources)
          MessageManager.getInstance().publishMessage(message)
        }
      })
    })

    // @ts-expect-error: 'clear-selection' event is not documented for 4.23, let us fix it later.
    this.unt.on('clear-selection', (res) => {
      if (this.unt) {
        //Close the popup on clear button click
        this.unt.view?.closePopup()
        this.clearSelection(res)
      }
    })

    // @ts-expect-error: 'reset' event is not documented for 4.30, let us fix it later.
    this.unt.on('reset', () => {
      if (this.unt) {
        //reset the output dataSource
        this.getOutputDataSource(this.props?.outputDataSources?.[0])?.setStatus(DataSourceStatus.NotReady)
      }
    })

    const fsDS = this.getFeatureLayerDS()
    if (fsDS !== null) {
      if (this.unt.utilityNetwork) {
        this.unt.utilityNetwork.gdbVersion = fsDS.getGDBVersion()
      }
      let layerToWatch = fsDS.layer
      if (fsDS.type === 'SUBTYPE_SUBLAYER') {
        //@ts-expect-error
        layerToWatch = fsDS.parentDataSource.layer
      }
      reactiveUtils.watch(
        //@ts-expect-error
        () => layerToWatch.gdbVersion,
        (value) => {
          this.unt.utilityNetwork.gdbVersion = value
        })
    }
  }

  private async fetchRecords (ds, objectIdList) {
    const query: FeatureLayerQueryParams = {}
    query.objectIds = objectIdList
    query.returnGeometry = true
    query.outFields = ['*']
    const queryDS = ds as QueriableDataSource
    const result = await queryDS?.queryAll(query)
    return Promise.resolve(result?.records)
  }

  public clearSelection (res) {
    const mapDS = this.getActiveMap()
    if (mapDS !== null) {
      const mapLyrVws = mapDS.jimuLayerViews
      const dsObj = DataSourceManager.getInstance()
      if (res.resultSet.length > 0) {
        const uniqueDS = []
        for (const key in mapLyrVws) {
          if (!uniqueDS.includes(mapLyrVws[key].layerDataSourceId)) {
            const ds = dsObj.getDataSource(mapLyrVws[key].layerDataSourceId)
            if (ds) {
              if (ds.type === 'FEATURE_LAYER' || ds.type === 'SUBTYPE_SUBLAYER') {
                ds.clearSelection()
              }
            }
          }
          uniqueDS.push(mapLyrVws[key].layerDataSourceId)
        }
      } else {
        for (const key in mapLyrVws) {
          const ds = dsObj.getDataSource(mapLyrVws[key].layerDataSourceId)
          if (ds) {
            if (ds.type === 'FEATURE_LAYER' || ds.type === 'SUBTYPE_SUBLAYER') {
              ds.clearSelection()
            }
          }
        }
      }
    }
  }

  public clearAll () {
    let activeMap = null
    //closes the popup on map change/delete, widget delete
    this.unt?.view?.closePopup()
    const allIds = this.mvManager?.getAllJimuMapViewIds()
    allIds?.forEach((ids) => {
      const jmapView = this.mvManager?.getJimuMapViewById(ids)
      activeMap = jmapView
      if (activeMap !== null) {
        const dsObj = DataSourceManager.getInstance()
        const mapLyrVws = activeMap.jimuLayerViews
        for (const key in mapLyrVws) {
          const ds = dsObj.getDataSource(mapLyrVws[key].layerDataSourceId)
          if (ds) {
            if (ds.type === 'FEATURE_LAYER' || ds.type === 'SUBTYPE_SUBLAYER') {
              ds.clearSelection()
            }
          }
        }
        activeMap.view.graphics.removeAll()
        this.callResetOnJSWidget()
      }
    })
  }

  public callResetOnJSWidget () {
    if (this.unt !== null) {
      if (this.unt.viewModel !== null) {
        //@ts-expect-error
        if (this.unt.viewModel._unObject !== null) {
          this.unt.viewModel.reset()
        }
      }
    }
  }

  public getActiveMap (): JimuMapView {
    let returnVal = null
    if (this.props) {
      if (this.props.useMapWidgetIds?.length > 0) {
        const mapViewGroups = this.mvManager.getJimuMapViewGroup(this.props.useMapWidgetIds)
        if (mapViewGroups && mapViewGroups.jimuMapViews) {
          for (const id in mapViewGroups.jimuMapViews) {
            if (mapViewGroups.jimuMapViews[id].dataSourceId) {
              if (
                mapViewGroups.jimuMapViews[id].isActive ||
                mapViewGroups.jimuMapViews[id].isActive === undefined
              ) {
                returnVal = mapViewGroups.jimuMapViews[id]
              }
            }
          }
        }
      }
    }
    return returnVal
  }

  public getFeatureLayerDS (): FeatureLayerDataSource | SubtypeSublayerDataSource {
    const mapDS = this.getActiveMap()
    if (mapDS !== null) {
      const mapLyrVws = mapDS.jimuLayerViews
      const dsObj = DataSourceManager.getInstance()
      for (const key in mapLyrVws) {
        const ds = dsObj.getDataSource(mapLyrVws[key].layerDataSourceId)
        if (ds) {
          if (ds.type === 'FEATURE_LAYER' || ds.type === 'SUBTYPE_SUBLAYER') {
            const flDS = ds.type === 'SUBTYPE_SUBLAYER' ? ds as SubtypeSublayerDataSource : ds as FeatureLayerDataSource
            const lyrDef = flDS.getLayerDefinition()
            const unField = lyrDef.fields.some((fld) => {
              return fld.name.toLowerCase().includes('subnetworkname')
            })
            if (unField) {
              return flDS
            }
          }
        } else {
          return null
        }
      }
      return null
    } else {
      return null
    }
  }

  public async loadAllChildDS (): Promise<boolean> {
    const activeMap = this.getActiveMap()
    if (activeMap) {
      await activeMap.whenAllJimuLayerViewLoaded()
      const dsObj = DataSourceManager.getInstance()
      const mapDs = dsObj.getDataSource(activeMap.dataSourceId)
      if (mapDs.isDataSourceSet() && !mapDs.areChildDataSourcesCreated()) {
        await mapDs.childDataSourcesReady()
      }
      return true
    }
    return false
  }

  public getURLVersion () {
    const queryObject = getAppStore().getState().queryObject
    if (queryObject) {
      if (queryObject?.data_version) {
        const urlVerStringList = queryObject.data_version
        const urlVerList = urlVerStringList.split(',')
        urlVerList.forEach((ver) => {
          const verSplit = ver.split(':')
          if (this.unt) {
            if (this.unt.utilityNetwork) {
              this.unt.utilityNetwork.gdbVersion = verSplit[1]
            }
          }
        })
      }
    }
  }
}
