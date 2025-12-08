import { type WidgetUpgradeInfo, Immutable } from 'jimu-core'
import { versionManager } from '../src/version-manager'

describe('Test my-location version-manager for version 1.16.0', () => {
  it('should update selectedFields in config', async () => {
    const oldInfo = {
      widgetJson: Immutable({
        config: Immutable({
          selectedFields: ['ObjectID', 'Time', 'Altitude', 'Speed', 'LineId']
        })
      })
    }

    const expectedConfig = {
      selectedFields: ['OBJECTID', 'location_timestamp', 'altitude', 'speed', 'LineID']
    }

    const updatedInfo = await versionManager.upgrade(oldInfo as WidgetUpgradeInfo, '1.15.0', '1.16.0', 'my-location')
    expect(updatedInfo.widgetJson.config).toEqual(expectedConfig)
  })

  it('should update fields in outputDataSourceJsons', async () => {
    const oldInfo = {
      widgetJson: Immutable({
        outputDataSources: ['outputDataSource1', 'outputDataSource2']
      }),
      outputDataSourceJsons: Immutable({
        outputDataSource1: Immutable({
          schema: {
            fields: {
              ObjectID: { name: 'ObjectID', jimuName: 'ObjectID', esriType: 'esriFieldTypeGUID' },
              Time: { name: 'Time', jimuName: 'Time' },
              Altitude: { name: 'Altitude', jimuName: 'Altitude' },
              Speed: { name: 'Speed', jimuName: 'Speed' },
              LineId: { name: 'LineId', jimuName: 'LineId' }
            },
            idField: 'ObjectID'
          }
        }),
        outputDataSource2: Immutable({
          schema: {
            fields: {
              ObjectID: { name: 'ObjectID', jimuName: 'ObjectID', esriType: 'esriFieldTypeGUID' },
              Time: { name: 'Time', jimuName: 'Time' },
              Altitude: { name: 'Altitude', jimuName: 'Altitude' },
              Speed: { name: 'Speed', jimuName: 'Speed' },
              LineId: { name: 'LineId', jimuName: 'LineId' }
            },
            idField: 'ObjectID'
          }
        })
      })
    }

    const expectedOutputDataSourceJsons = Immutable({
      outputDataSource1: {
        schema: {
          fields: {
            OBJECTID: { name: 'OBJECTID', jimuName: 'OBJECTID', esriType: 'esriFieldTypeOID' },
            location_timestamp: { name: 'location_timestamp', jimuName: 'location_timestamp' },
            altitude: { name: 'altitude', jimuName: 'altitude' },
            speed: { name: 'speed', jimuName: 'speed' },
            LineID: { name: 'LineID', jimuName: 'LineID' }
          },
          idField: 'OBJECTID'
        }
      },
      outputDataSource2: {
        schema: {
          fields: {
            OBJECTID: { name: 'OBJECTID', jimuName: 'OBJECTID', esriType: 'esriFieldTypeOID' },
            location_timestamp: { name: 'location_timestamp', jimuName: 'location_timestamp' },
            altitude: { name: 'altitude', jimuName: 'altitude' },
            speed: { name: 'speed', jimuName: 'speed' },
            LineID: { name: 'LineID', jimuName: 'LineID' }
          },
          idField: 'OBJECTID'
        }
      }
    })

    const updatedInfo = await versionManager.upgrade(oldInfo as any, '1.15.0', '1.16.0', 'my-location')
    expect(updatedInfo.outputDataSourceJsons).toEqual(expectedOutputDataSourceJsons)
  })
})
