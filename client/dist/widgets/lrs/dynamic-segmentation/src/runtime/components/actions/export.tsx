/** @jsx jsx */
import {
  jsx,
  hooks,
  React,
  DataSourceManager,
  DataActionManager, Immutable, DataLevel,
  type FieldSchema,
  JimuFieldType,
  type EsriFieldType,
  DataSourceTypes,
  loadArcGISJSAPIModule
} from 'jimu-core'
import { CalciteAction } from 'calcite-components'

import defaultMessages from '../../translations/default'
import { Tooltip, Dropdown, DropdownButton, DropdownMenu, DropdownItem } from 'jimu-ui'
import { useDynSegRuntimeState } from '../../state'
import { findFieldByType } from 'widgets/shared-code/lrs'
import type { JimuMapView } from 'jimu-arcgis'
import { DynSegFields } from '../../../constants'

export interface ExportProps {
  dynSegFeatureLayer: __esri.FeatureLayer
  widgetId: string
  routeId: string
  jimuMapView: JimuMapView
}

const NumberFieldArray = ['long', 'big-integer', 'integer', 'single', 'double', 'small-integer']
const StringFieldArray = ['global-id', 'guid', 'string']

export function Export (props: ExportProps) {
  const { dynSegFeatureLayer, widgetId, routeId, jimuMapView } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const { records, display } = useDynSegRuntimeState()
  const [isExport, setIsExport] = React.useState(false)

  React.useEffect(() => {
    if (records?.length === 0) setIsExport(false)
    else setIsExport(true)
  }, [records, display])

  const convertFieldToJimuField = (field: __esri.Field) => {
    let type
    if (NumberFieldArray.includes(field.type)) {
      type = JimuFieldType.Number
    } else if (field.type === 'date') {
      type = JimuFieldType.Date
    } else if (StringFieldArray.includes(field.type)) {
      type = JimuFieldType.String
    }
    if (!type) {
      return null
    }
    return {
      jimuName: field.name,
      name: field.name,
      type: type,
      esriType: field.type as EsriFieldType,
      alias: field.alias,
      format: (field.type === 'oid' ? { digitSeparator: false, places: 0 } : null)
    }
  }

  const convertJSAPIFieldsToJimuFields = (fields: __esri.Field[]) => {
    if (!fields) {
      return null
    }
    const jimuFields: { [jimuName: string]: FieldSchema } = {}
    fields.forEach(r => {
      const fieldSchema = convertFieldToJimuField(r)
      if (fieldSchema && fieldSchema.name) jimuFields[r.name] = fieldSchema
    })
    return jimuFields
  }

  const convertJSAPIFieldsToJimuFieldsAlias = (fields: __esri.Field[]) => {
    if (!fields) {
      return null
    }
    const jimuFields: { [jimuName: string]: FieldSchema } = {}
    fields.forEach(r => {
      const fieldSchema = convertFieldToJimuField(r)
      if (fieldSchema && fieldSchema.name) jimuFields[r.alias] = fieldSchema
    })
    return jimuFields
  }

  const getFieldNames = () => {
    const fields = convertJSAPIFieldsToJimuFields(dynSegFeatureLayer.fields)
    const fieldNames = Object.keys(fields)
    return fieldNames
  }

  const getFieldNamesAlias = () => {
    const fields = convertJSAPIFieldsToJimuFieldsAlias(dynSegFeatureLayer.fields)
    const fieldNames = Object.keys(fields)
    return fieldNames
  }

  const createFieldNameAliasDict = () => {
    const fields = dynSegFeatureLayer.fields
    const fieldAlias = {}
    fields.forEach((field) => {
      fieldAlias[field.name] = field.alias
    })
    return fieldAlias
  }

  const exportCsv = () => {
    DataSourceManager.getInstance().createDataSource(Immutable({
      id: 'downloadCsv_layer' + new Date().getTime(),
      type: DataSourceTypes.FeatureLayer,
      isDataInDataSourceInstance: true,
      sourceLabel: routeId + '_dynseg_export',
      schema: {
        idField: findFieldByType(dynSegFeatureLayer.fields, 'oid'),
        fields: { ...convertJSAPIFieldsToJimuFields(dynSegFeatureLayer.fields) }
      },
      geometryType: 'esriGeometryPolyline'
    })).then(ds => {
      const dataRecords = []
      records.forEach((record) => {
        const newRecord = ds.buildRecord(record)
        dataRecords.push(newRecord)
      })
      const dataSets = {
        records: dataRecords,
        dataSource: ds,
        name: getI18nMessage('dynamicSeg'),
        fields: getFieldNames()
      }
      const actionsPromise = DataActionManager.getInstance().getSupportedActions(widgetId, [dataSets],
        DataLevel.Records)
      actionsPromise.then(async actions => {
        const action = actions.export
        if (action?.length > 0) {
          const exportToCsvAction = action.filter((action) => {
            return action.id === 'export-csv'
          })
          await DataActionManager.getInstance().executeDataAction(exportToCsvAction[0], [dataSets], DataLevel.Records, widgetId)
        }
      }).catch(err => {
        console.error(err)
      })
    })
  }

  const exportJson = () => {
    DataSourceManager.getInstance().createDataSource(Immutable({
      id: 'downloadJson_layer' + new Date().getTime(),
      type: DataSourceTypes.FeatureLayer,
      isDataInDataSourceInstance: true,
      sourceLabel: routeId + '_dynseg_export',
      schema: {
        idField: findFieldByType(dynSegFeatureLayer.fields, 'oid'),
        fields: { ...convertJSAPIFieldsToJimuFields(dynSegFeatureLayer.fields) }
      },
      geometryType: 'esriGeometryPolyline'
    })).then(ds => {
      const dataRecords = []
      const fieldAlias = createFieldNameAliasDict()
      records.forEach((record) => {
        const cloneRec = record.clone()
        const attributes = cloneRec.attributes
        const keys = Object.keys(attributes)
        keys.forEach((key) => {
          const newKey = fieldAlias[key]
          attributes[newKey] = attributes[key]
          delete attributes.key
        })
        const newRecord = ds.buildRecord(cloneRec)
        dataRecords.push(newRecord)
      })
      const dataSets = {
        records: dataRecords,
        dataSource: ds,
        name: getI18nMessage('dynamicSeg'),
        fields: getFieldNamesAlias()
      }
      const actionsPromise = DataActionManager.getInstance().getSupportedActions(widgetId, [dataSets],
        DataLevel.Records)
      actionsPromise.then(async actions => {
        const action = actions.export
        if (action?.length > 0) {
          const exportToCsvAction = action.filter((action) => {
            return action.id === 'export-json'
          })
          await DataActionManager.getInstance().executeDataAction(exportToCsvAction[0], [dataSets], DataLevel.Records, widgetId)
        }
      }).catch(err => {
        console.error(err)
      })
    })
  }

  const exportGeoJson = () => {
    DataSourceManager.getInstance().createDataSource(Immutable({
      id: 'downloadGeoJson_layer' + new Date().getTime(),
      type: DataSourceTypes.FeatureLayer,
      isDataInDataSourceInstance: true,
      sourceLabel: routeId + '_dynseg_export',
      schema: {
        idField: findFieldByType(dynSegFeatureLayer.fields, 'oid'),
        fields: { ...convertJSAPIFieldsToJimuFields(dynSegFeatureLayer.fields) }
      },
      geometryType: 'esriGeometryPolyline'
    })).then(async ds => {
      const dataRecords = []
      const projRecords = records

      const sp = jimuMapView.view.spatialReference
      const projection = await loadArcGISJSAPIModule('esri/geometry/projection')
      projection.load().then(() => {
        projRecords.forEach((record) => {
          // remove geometry for points before exporting
          if (record.attributes[DynSegFields.typeName] === 'Point') {
            record.geometry = null
          }
        })

        projRecords.forEach((record) => {
          if (record.geometry) record.geometry = projection.project(record.geometry, sp)
        })

        projRecords.forEach((record) => {
          const newRecord = ds.buildRecord(record)
          dataRecords.push(newRecord)
        })

        const dataSets = {
          records: dataRecords,
          dataSource: ds,
          name: getI18nMessage('dynamicSeg'),
          fields: getFieldNames()
        }
        const actionsPromise = DataActionManager.getInstance().getSupportedActions(widgetId, [dataSets],
          DataLevel.Records)
        actionsPromise.then(async actions => {
          const action = actions.export
          if (action?.length > 0) {
            const exportToCsvAction = action.filter((action) => {
              return action.id === 'export-geojson'
            })
            await DataActionManager.getInstance().executeDataAction(exportToCsvAction[0], [dataSets], DataLevel.Records, widgetId)
          }
        }).catch(err => {
          console.error(err)
        })
      })
    })
  }

  return (
    <React.Fragment>
        <Dropdown className={'float-right'} direction='down' size='sm' useKeyUpEvent>
            <DropdownButton icon arrow={false} size='sm' type='link'>
              <Tooltip
                placement='auto'
                title={getI18nMessage('exportLabel')}
                showArrow
                enterDelay={300}
                enterNextDelay={1000}>
                  <CalciteAction
                      text={getI18nMessage('exportLabel')}
                      icon='export'
                      scale='m'
                      disabled={isExport ? undefined : true }
                      />
              </Tooltip>
            </DropdownButton>
            <DropdownMenu>
                <DropdownItem onClick={exportCsv}>
                    {getI18nMessage('exportCsv')}
                </DropdownItem>
                <DropdownItem onClick={exportJson}>
                    {getI18nMessage('exportJson')}
                </DropdownItem>
                <DropdownItem onClick={exportGeoJson}>
                    {getI18nMessage('exportGeoJson')}
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    </React.Fragment>
  )
};
