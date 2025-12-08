import type {
  JimuMapView,
  JimuLayerView
} from 'jimu-arcgis'
import {
  ClauseLogic,
  ClauseOperator,
  dataSourceUtils,
  type DataSource,
  type QueriableDataSource,
  type QueryParams
} from 'jimu-core'
import * as reactiveUtils from '@arcgis/core/core/reactiveUtils.js'

/*

Floor Filter: Improve the floor awareness of data-centric widgets

https://devtopia.esri.com/Beijing-R-D-Center/ExperienceBuilder-Web-Extensions/issues/25307

We have several customers who would like their data-centric widgets to be floor aware:
- Chart Edit FeatureInfo Filter List Search Select Table ...

Rather than updating each widget to add floor awareness, our approach is to support the
majority of use cases from the 'Floor Filter' itself.

There are two primary types of floor aware use cases.

One is for a particular widget to only consider features on the active floor.
For instance:
- a Table that only shows features on the active floor
- a Chart that only shows statistics for the active floor

The other is to 'auto set' the 'Floor Filter' when interacting with a feature within a widget.
For instance:
- a List is showing features from multiple buildings/floors, but when an item within the list is clicked
  the floor filter will 'auto set' and zoom to the associated building/floor

We've introduced four checkboxes to the 'Floor Filter' settings:

'Filter data by selected floor'
  'Display selected floor only'

'Switch floor on feature selection'
  'Zoom to selected floor'

To implement 'Filter data sources by floor', we are updating the expression for the queryable data source:
dataSource.updateQueryParams

To implement 'Switch floor on feature selection', we are listening for selected feature changes,
and only proceed when a single floor aware feature is selected:
jimuMapView.addJimuLayerViewSelectedFeaturesChangeListener

To implement both together we found that it was necessary to clear selections on the data source
(but only when a single floor aware feature is selected):
dataSource.clearSelection

Indoors shadow issues:
https://github.com/EsriPS/indoors-web/issues/9189
https://github.com/EsriPS/indoors-web/issues/9190

*/

/*
// example Arcade expression for initializing LEVEL_ID within the editor
if ($editcontext.editType == "INSERT") {
  var levelsLayer = FeatureSetByName($map, "Levels", ["*"], true);
  var features = Intersects(levelsLayer,$feature);
  if (Count(features) > 0) {
    var levelId = First(features)["LEVEL_ID"];
    return levelId;
  }
}
return $feature["LEVEL_ID"];
*/

export default class DsFilter {
  ffLevelHandle: any
  vwFloorsHandle: any
  filterDataSources: boolean = false
  filterByActiveFloorOnly: boolean = false
  autoSetOnFeatureSelection: boolean = false
  zoomOnAutoSet: boolean = false
  jimuMapView: JimuMapView
  registeredLvCreatedListener: (jimuLayerView: JimuLayerView) => void
  registeredSelChangeListener: (jimuLayerView: JimuLayerView) => void
  widgetId: string
  coreFloorFilterWidget

  clear (): void {
    this.clearHandles()
    if (this.jimuMapView && this.filterDataSources) {
      this.updateDataSources(this.jimuMapView, this.widgetId, null, true)
    }
  }

  clearHandles (): void {
    try {
      if (this.jimuMapView && this.registeredLvCreatedListener) {
        this.jimuMapView.removeJimuLayerViewCreatedListener(this.registeredLvCreatedListener)
      }
      if (this.jimuMapView && this.registeredSelChangeListener) {
        this.jimuMapView.removeJimuLayerViewSelectedFeaturesChangeListener(this.registeredSelChangeListener)
      }
      if (this.ffLevelHandle) this.ffLevelHandle.remove()
      if (this.vwFloorsHandle) this.vwFloorsHandle.remove()
    } catch (ex) {
      console.error(ex)
    } finally {
      this.registeredLvCreatedListener = null
      this.registeredSelChangeListener = null
      this.ffLevelHandle = null
      this.vwFloorsHandle = null
    }
  }

  init (jimuMapView: JimuMapView, foorFilterWidget, coreFloorFilterWidget): void {
    this.clearHandles()
    this.jimuMapView = jimuMapView
    this.coreFloorFilterWidget = coreFloorFilterWidget
    const widgetId = this.widgetId = foorFilterWidget?.props?.id
    const filterDataSources = this.filterDataSources = !!(foorFilterWidget?.props?.config?.filterDataSources)
    const filterByActiveFloorOnly = this.filterByActiveFloorOnly = !!(foorFilterWidget?.props?.config?.filterByActiveFloorOnly)
    const autoSetOnFeatureSelection = this.autoSetOnFeatureSelection = !!(foorFilterWidget?.props?.config?.autoSetOnFeatureSelection)
    const zoomOnAutoSet = this.zoomOnAutoSet = !!(foorFilterWidget?.props?.config?.zoomOnAutoSet)

    if (jimuMapView && jimuMapView.view && coreFloorFilterWidget && (filterDataSources || autoSetOnFeatureSelection)) {
      if (filterDataSources) {
        if (filterByActiveFloorOnly) {
          this.ffLevelHandle = reactiveUtils.watch(
            () => coreFloorFilterWidget.level,
            (levelId) => {
              this.updateDataSources(jimuMapView, widgetId, levelId, filterByActiveFloorOnly)
            }
          )
        } else {
          this.vwFloorsHandle = reactiveUtils.watch(
            () => coreFloorFilterWidget.view.floors,
            () => {
              const levelId = coreFloorFilterWidget.level
              this.updateDataSources(jimuMapView, widgetId, levelId, filterByActiveFloorOnly)
            }
          )
        }

        this.registeredLvCreatedListener = (lv: JimuLayerView) => {
          const levelId = coreFloorFilterWidget.level
          this.updateDataSources(jimuMapView, widgetId, levelId, filterByActiveFloorOnly, lv)
        }
        jimuMapView.addJimuLayerViewCreatedListener(this.registeredLvCreatedListener)

        this.updateDataSources(jimuMapView, widgetId, coreFloorFilterWidget.level, filterByActiveFloorOnly)
      }

      if (autoSetOnFeatureSelection) {
        this.registeredSelChangeListener = (jimuLayerView: JimuLayerView) => {
          this.selectedFeaturesChangeListener(jimuLayerView, coreFloorFilterWidget, zoomOnAutoSet)
        }
        jimuMapView.addJimuLayerViewSelectedFeaturesChangeListener(this.registeredSelChangeListener)
      }
    }
  }

  private selectedFeaturesChangeListener(jimuLayerView: JimuLayerView, coreFloorFilterWidget, zoomOnAutoSet: boolean) {
    const dataSource = jimuLayerView?.getLayerDataSource()
    // @ts-expect-error
    const dsLayer = dataSource?.layer
    const lvLayer = jimuLayerView?.layer
    let floorField = dsLayer?.floorInfo?.floorField || lvLayer?.floorInfo?.floorField
    if (dataSource && floorField && coreFloorFilterWidget) {
      const selectedRecords: any = dataSource?.getSelectedRecords()
      if ((selectedRecords?.length === 1) && selectedRecords[0]?.feature?.attributes) {

        // Exp Builder Floor Filter: selecting a feature does not switch the floor to feature selection in 3D scene #9571
        // https://github.com/EsriPS/indoors-web/issues/9571
        dsLayer?.fields?.some(field => {
          if (floorField.toLowerCase() === field.name.toLowerCase()) {
            floorField = field.name
            return true
          }
          return false
        })

        const levelId = selectedRecords[0].feature.attributes[floorField]
        if (levelId && (coreFloorFilterWidget.level !== levelId)) {
          const prevFid = coreFloorFilterWidget.facility
          const level = coreFloorFilterWidget.viewModel?.getLevel(levelId)
          if (level) {
            console.log("FloorFilter: auto changing level...",lvLayer?.title, levelId) // @todo temporary
            coreFloorFilterWidget.level = levelId
            const facilityId = coreFloorFilterWidget.facility
            const facility = coreFloorFilterWidget.viewModel?.getFacility(facilityId)
            if (zoomOnAutoSet && facility && (prevFid !== facilityId)) {
              coreFloorFilterWidget.viewModel.goTo(facility)
            }
          }
        }
      }
    }
  }

  private updateDataSources (
    jimuMapView: JimuMapView,
    widgetId: string,
    levelId: string,
    filterByActiveFloorOnly: boolean,
    singleLayerView?: JimuLayerView
  ): void {
    const floors = jimuMapView?.view?.floors
    const levelsForFacility3D = []
    if ((typeof levelId === 'string') && levelId.startsWith('all--')) {
      levelId = null
      const wgtFacilityId = this.coreFloorFilterWidget?.facility
      const wgtLevels = this.coreFloorFilterWidget?.viewModel?.filterFeatures?.levels?.levelsInfo
      if (wgtFacilityId && wgtLevels) {
        wgtLevels.forEach(l => {
          if (l.facilityId === wgtFacilityId) levelsForFacility3D.push(l.id)
        })
      }
    }

    const applyWhere = (layer, where: string): void => {
      // for non-datasource layers that are floor aware,
      // maintain the original definition expression so that it can accessed later (xtnOrigDefExpr)
      if (!layer.xtnOrigDefExpr) {
        layer.xtnOrigDefExpr = layer.definitionExpression || 'none'
      }
      if (layer.xtnOrigDefExpr && layer.xtnOrigDefExpr !== 'none') {
        where = '(' + layer.xtnOrigDefExpr + ') AND ' + where
      }
      layer.definitionExpression = where
    }

    const escSqlQuote = (v: string): string => {
      if (typeof v === 'string') return v.replace(/'/g, "''")
      return v
    }

    const findFloorField = (fields, name): string => {
      let floorField: string = name
      if (name && fields && (fields.length > 0)) {
        const lc = name.toLowerCase()
        fields.some(field => {
          if (lc === field.name.toLowerCase()) {
            floorField = field.name
            return true
          }
          return false
        })
      }
      return floorField
    }

    const makeQueryParams = (floorField: string, dataSource: DataSource, forceFloors: boolean, title: string): QueryParams => {
      let queryParams: QueryParams = null

      let selectedLevelId = null
      const selectedRecords: any = dataSource?.getSelectedRecords()
      if ((selectedRecords?.length === 1) && selectedRecords[0]?.feature?.attributes) {
        selectedLevelId = selectedRecords[0].feature.attributes[floorField]
      }

      if (!filterByActiveFloorOnly || forceFloors) {
        if (floors && floors.length > 0) {
          const clauses = []
          floors.forEach(floor => {
            if (floor) {
              const clause = dataSourceUtils.createSQLClause(floorField, ClauseOperator.StringOperatorIs, [{ value: floor, label: floor + '' }])
              clauses.push(clause)
            }
          })
          if (clauses.length > 0) {
            const outdoor = dataSourceUtils.createSQLClause(floorField, ClauseOperator.StringOperatorIsBlank, [{ value: null, label: 'null' }])
            clauses.push(outdoor)
            const sqlExpression = dataSourceUtils.createSQLExpression(ClauseLogic.Or, clauses, dataSource)
            queryParams = { where: sqlExpression.sql, sqlExpression } as QueryParams
          } else {
            queryParams = { where: '1=1', sqlExpression: null } as QueryParams
          }
        } else {
          queryParams = { where: '1=1', sqlExpression: null } as QueryParams
        }
      } else if (filterByActiveFloorOnly) {
        if (levelId) {
          const clause = dataSourceUtils.createSQLClause(floorField, ClauseOperator.StringOperatorIs, [{ value: levelId, label: levelId + '' }])
          const outdoor = dataSourceUtils.createSQLClause(floorField, ClauseOperator.StringOperatorIsBlank, [{ value: null, label: 'null' }])
          const sqlExpression = dataSourceUtils.createSQLExpression(ClauseLogic.Or, [clause, outdoor], dataSource)
          queryParams = { where: sqlExpression.sql, sqlExpression } as QueryParams
        } else {
          queryParams = { where: '1=1', sqlExpression: null } as QueryParams
          if (levelsForFacility3D && levelsForFacility3D.length > 0) {
            const clauses = []
            levelsForFacility3D.forEach(lid => {
              const clause = dataSourceUtils.createSQLClause(floorField, ClauseOperator.StringOperatorIs, [{ value: lid, label: lid + '' }])
              clauses.push(clause)
            })
            const sqlExpression = dataSourceUtils.createSQLExpression(ClauseLogic.Or, clauses, dataSource)
            queryParams = { where: sqlExpression.sql, sqlExpression } as QueryParams
          }
        }
      }
      if (selectedLevelId && this.autoSetOnFeatureSelection) {
        // widgets that have a single feature selection can attempt to re-select that feature when their datasource expression changes
        //
        // the method we are in 'updateDataSources' is invoked when the user interacts with the floor filter
        // (i.e. changes the site/facility/level and 'filterDataSources' is on,
        // this method will change datasource expressions
        //
        // when 'autoSetOnFeatureSelection' is on, the above 'selectedFeaturesChangeListener' method will kick-in when the
        // single feature re-select is attempted causing the floor filter to revert to it's previously selected level
        //
        // for now, we'll clear the selection
        console.log("FloorFilter: clearing single selection:",title,"on",selectedLevelId)
        dataSource.clearSelection() // @todo what are the possible side effects
        //
        // 'clearSelection' seems to work ok for these widgets:
        // Chart Filter
        // FeatureInfo List Search Select Table Map(Select tool)
        // Edit - the active edit feature gets cleared
        //
      }
      return queryParams
    }

    const makeWhere = (floorField: string, forceFloors: boolean): string => {
      let ids = []
      if (!filterByActiveFloorOnly || forceFloors) {
        if (floors && floors.length > 0) ids = floors.toArray()
      } else if (filterByActiveFloorOnly && levelId) {
        ids = [levelId]
      } else if (filterByActiveFloorOnly && (levelsForFacility3D && levelsForFacility3D.length > 0)) {
        ids = levelsForFacility3D
      }
      if (ids && ids.length > 0) {
        ids = ids.map(id => `'${escSqlQuote(id)}'`)
        const where = `(${floorField} IN (${ids.join(',')}))`
        return where
      }
      return '1=1'
    }

    const processLayerView = async (jimuLayerView: JimuLayerView): Promise<void> => {
      const dataSource = jimuLayerView?.getLayerDataSource()
      const forceFloors = false

      // @ts-expect-error
      const dsLayer = dataSource?.layer
      const lvLayer = jimuLayerView?.layer
      if (lvLayer?.floorInfo?.floorField && (typeof lvLayer.when === 'function') && (lvLayer.loadStatus === 'loading')) {
        await lvLayer.when()
      }

      if (dataSource) {
        let floorField = dsLayer?.floorInfo?.floorField || lvLayer?.floorInfo?.floorField
        if (floorField && dsLayer && (dsLayer.type === 'feature' || dsLayer.type === 'scene')) {
          floorField = findFloorField(dsLayer.fields, floorField)
          const qDataSource = (dataSource as QueriableDataSource)
          if (typeof qDataSource.updateQueryParams === "function") {
            const queryParams = makeQueryParams(floorField, qDataSource, forceFloors, lvLayer?.title)
            if (queryParams) {
              qDataSource.updateQueryParams(queryParams, widgetId)
            }
          }
        }
      } else {
        let floorField = lvLayer?.floorInfo?.floorField
        if (floorField && lvLayer && (lvLayer?.type === 'feature' || dsLayer?.type === 'scene')) {
          floorField = findFloorField(lvLayer.fields, floorField)
          const where = makeWhere(floorField, forceFloors)
          applyWhere(lvLayer, where)
        }
      }
    }

    if (singleLayerView) {
      processLayerView(singleLayerView)
    } else {
      const allLayerViews = jimuMapView?.getAllJimuLayerViews()
      if (Array.isArray(allLayerViews)) {
        allLayerViews.forEach(jimuLayerView => {
          processLayerView(jimuLayerView)
        })
      }
    }
  }
}
