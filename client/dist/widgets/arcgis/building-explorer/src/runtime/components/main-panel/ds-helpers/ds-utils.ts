import type { JimuMapView } from 'jimu-arcgis'
import { lodash, type SqlQueryParams, AllDataSourceTypes, type DataSource, type BuildingComponentSubLayerDataSource } from 'jimu-core'
import { getBuildingSceneLayersByLayerViewIds } from '../../../../common/utils'

export const applyFilterOnDs = lodash.debounce(_applyFilterOnDs, 200)
// 2. apply filter On Ds
export function _applyFilterOnDs (vm: __esri.BuildingExplorerViewModel, enableApplyFlag: boolean, propsParams: { selectedLayerViewIds: string[], jimuMapView: JimuMapView, widgetId: string }/*, isClear?: boolean*/) {
  if (enableApplyFlag) {
    const filtersMap = _getFiltersFromLayers(vm)
    if (filtersMap.size <= 0) {
      return // no filter, so skip
    }

    const selectedLayers = getBuildingSceneLayersByLayerViewIds(propsParams.selectedLayerViewIds, propsParams.jimuMapView)
    // set filter for each layers
    selectedLayers.forEach(async (layer) => {
      const filterString = filtersMap.get(layer.id)

      const jimuLayerView = propsParams.jimuMapView.getJimuLayerViewByAPILayer(layer)
      // use create instead of get to ensure that, ds is available when the app is initialized
      const layerDataSource = await jimuLayerView?.createLayerDataSource()
      // await all child ds are ready
      layerDataSource?.isDataSourceSet() && await layerDataSource?.childDataSourcesReady()

      _updateQueryParams(layerDataSource, [{ where: filterString }], propsParams.widgetId)
    })
  }
}

function _getFiltersFromLayers (vm: __esri.BuildingExplorerViewModel): Map<string, string> {
  const filtersMap = new Map<string, string>()
  // https://devtopia.esri.com/WebGIS/arcgis-js-api/issues/60894
  for (const layer of vm.layers) {
    for (const filter of layer.filters) {
      for (const block of filter.filterBlocks) {
        //console.log('Filter: ' + layer.title + ' ==>  ', block.filterMode.type + ' ==>  ', block.filterExpression)
        // solid type: https://devtopia.esri.com/WebGIS/arcgis-js-api/issues/60894#issuecomment-4700570
        if (block.filterMode.type === 'solid') {
          filtersMap.set(layer.id, block.filterExpression)
        }
      }
    }
  }

  return filtersMap
}

// merge where
function _mergeQueryParams (whereArr: string[]): SqlQueryParams {
  const where = whereArr.length > 1 ? whereArr.map(w => `(${w})`).join(' and ') : whereArr[0]
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-template-expression
  return { where: where ? `${where}` : '' }
}

// code from: https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder/pull/19202/files
function _updateQueryParams (dataSource: DataSource, SqlQueryParamsArr: SqlQueryParams[], widgetId: string) {
  const whereArr = SqlQueryParamsArr.map(params => params?.where)
  const finalQueryParams = _mergeQueryParams(whereArr)

  const allComponentDss/*: BuildingComponentSubLayerDataSourceImpl[]*/ = dataSource?.isDataSourceSet() && dataSource?.getAllChildDataSources().filter(ds => {
    return ds.type === AllDataSourceTypes.BuildingComponentSubLayer
  })
  allComponentDss?.forEach((componentDs, idx) => {
    //console.table(Object.assign({ DsID: componentDs.id }, finalQueryParams))
    //console.log('filter count==> ' + idx);
    (componentDs as BuildingComponentSubLayerDataSource).updateQueryParams(finalQueryParams, widgetId)
  })
}
