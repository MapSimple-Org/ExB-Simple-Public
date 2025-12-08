/** @jsx jsx */
import { type ImmutableObject, React, hooks, jsx } from 'jimu-core'
import defaultMessages from '../../../translations/default'
import { Label, Select } from 'jimu-ui'
import type { Track, TrackRecord } from 'widgets/lrs/dynamic-segmentation/src/config'
import { type EventInfo, getCalciteBasicTheme, getExistingFieldNames, isDefined, isNumber, type NetworkInfo } from 'widgets/shared-code/lrs'
import { CalciteTable, CalciteTableCell, CalciteTableHeader, CalciteTableRow } from 'calcite-components'
import { getTheme } from 'jimu-theme'
import { round } from 'lodash-es'
import { getObjectIdValue } from '../../../utils/diagram-utils'

export interface StatisticsProps {
  track: Track
  trackRecord: TrackRecord
  eventInfo: EventInfo
  eventEsriFields: __esri.Field[]
  currentRecord: __esri.Graphic
  allRecords: __esri.Graphic[]
  networkInfo: ImmutableObject<NetworkInfo>
  featureLayer: __esri.FeatureLayer
  refresh?: boolean
}

export const Statistics = React.forwardRef((props: StatisticsProps, ref) => {
  const { track, trackRecord, eventEsriFields, eventInfo, currentRecord, allRecords, networkInfo, featureLayer, refresh } = props
  const [currentField, setCurrentField] = React.useState<__esri.Field>(null)
  const [derivedFields, setDerivedFields] = React.useState<__esri.Field[]>([])
  const [currentStats, setCurrentStats] = React.useState<Array<[string, string]>>([])
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const theme = getTheme()

  React.useImperativeHandle(ref, () => ({
    getStats: () => { return currentStats }
  }))

  React.useEffect(() => {
    if (isDefined(eventInfo) && isDefined(eventEsriFields)) {
      const defaultField = getDerivedFields()
      getDerivedFieldsValues(defaultField)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track, trackRecord, eventInfo, eventEsriFields, currentRecord])

  React.useEffect(() => {
    if (refresh) {
      const defaultField = getDerivedFields()
      getDerivedFieldsValues(defaultField)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refresh])

  const getDerivedFields = (): __esri.Field => {
    // Get all numeric fields that are not in the LRS fields, length fields, or have a domain
    const lrsFieldNames = eventInfo.lrsFields.map((lrsField) => lrsField.alias)
    const lengthFieldNames = getExistingFieldNames()
    const derivedFields = eventEsriFields.filter((field) => {
      return (
        isNumber(field.type) &&
        !lrsFieldNames.includes(field.alias) &&
        !lengthFieldNames.includes(field.name.toUpperCase()) &&
        !isDefined(field.domain) &&
        trackRecord.attributes.has(field.name)
      )
    })
    setDerivedFields(derivedFields)
    if (derivedFields.length) {
      setCurrentField(derivedFields[0])
      return derivedFields[0]
    }
    return null
  }

  const getStatArray = (first?: number, last?: number, min?: number, max?: number, average?: number, median?: number): Array<[string, string]> => {
    const fieldAndValues = []
    fieldAndValues.push([getI18nMessage('historicalFirstLabel'), first?.toString() ?? ''])
    fieldAndValues.push([getI18nMessage('historicalLastLabel'), last?.toString() ?? ''])
    fieldAndValues.push([getI18nMessage('historicalMinimumLabel'), min?.toString() ?? ''])
    fieldAndValues.push([getI18nMessage('historicalMaximumLabel'), max?.toString() ?? ''])
    fieldAndValues.push([getI18nMessage('meanLabel'), average?.toString() ?? ''])
    fieldAndValues.push([getI18nMessage('medianLabel'), median?.toString() ?? ''])
    return fieldAndValues
  }

  const getDerivedFieldsValues = (field: __esri.Field) => {
    let fieldAndValues = getStatArray()
    if (isDefined(allRecords) && isDefined(currentRecord) && isDefined(networkInfo) && isDefined(field) && allRecords.length) {
      const editorTrackingCreatedDate = featureLayer?.editFieldsInfo?.creationDateField

      const recordsInTrack = new Map<number, TrackRecord>()
      track.records.forEach((record) => {
        const objectId = getObjectIdValue(record)
        if (!isNaN(objectId)) {
          recordsInTrack.set(objectId, record)
        }
      })
      // get the min, max, average, median, and mean
      let firstDate = null
      let lastDate = null
      let first = NaN
      let last = NaN
      let median = NaN
      let min = NaN
      let max = NaN
      let mean = NaN

      const values = []
      allRecords.forEach((record) => {
        let value = record.attributes[field.name]
        const objectId = record.getObjectId()
        if (recordsInTrack.has(objectId as number)) {
          const recordByOID = recordsInTrack.get(objectId as number)
          const fieldValue = recordByOID.attributes.get(field.name)
          value = fieldValue
        }
        if (isDefined(value) && !isNaN(value)) {
          const createdDate = record.attributes[editorTrackingCreatedDate]
          if (isDefined(createdDate)) {
            const date = new Date(createdDate)
            if (!isDefined(firstDate) || date < firstDate) {
              first = value
              firstDate = date
            }
            if (!isDefined(lastDate) || date > lastDate) {
              last = value
              lastDate = date
            }
          }
          values.push(value)
        }
      })

      if (values.length > 0) {
        const precision = getMaxPrecision(values)
        min = round(Math.min(...values), precision)
        max = round(Math.max(...values), precision)
        mean = round(values.reduce((a, b) => a + b, 0) / values.length, precision)

        const sortedValues = [...values].sort((a, b) => a - b)
        const half = Math.floor(sortedValues.length / 2) ?? 0
        if (sortedValues.length % 2) {
          median = round(sortedValues[half], precision)
        } else {
          median = round((sortedValues[half - 1] + sortedValues[half]) / 2.0, precision)
        }

        // create the outputs
        fieldAndValues = getStatArray(first, last, min, max, mean, median)
      }
    }
    setCurrentStats(fieldAndValues)
  }

  const getMaxPrecision = (values: number[]): number => {
    let maxPrecision = 0
    values.forEach((value) => {
      const precision = getPrecision(value)
      if (precision > maxPrecision) {
        maxPrecision = precision
      }
    })
    return maxPrecision
  }

  const getPrecision = (value: number): number => {
    if (!isFinite(value)) return 0
    let e = 1; let p = 0
    while (Math.round(value * e) / e !== value) { e *= 10; p++ }
    return p
  }

  const onSelectChange = (value: string) => {
    const field = eventEsriFields.find((field) => field.alias === value)
    setCurrentField(field)
    getDerivedFieldsValues(field)
  }

  const showDerivedUI = derivedFields && derivedFields.length

  return (
  <div
    className="statistics d-flex w-100 h-100"
    style={{
      flexDirection: 'column',
      paddingTop: '15px'
    }}>
    {showDerivedUI
      ? <div
      style={{
        margin: '0px',
        background: theme.sys.color.surface.paper,
        padding: '0px 15px 15px 15px'
      }}
      css={getCalciteBasicTheme()}>
          <Label
            className='statistic-label text-truncate title3'
            size='lg'
            centric
            style={{
              margin: '0px'
            }}>
            {getI18nMessage('statistics')}
          </Label>
          <Select
            className='statistics-select'
            style={{ marginBottom: '15px' }}
            value={currentField.alias}
            onChange={(e) => { onSelectChange(e.target.value) }}>
            {derivedFields.map((field, index) => {
              return (
                <option key={field.alias} value={field.alias}>{field.alias}</option>
              )
            })}
          </Select>

          <CalciteTable
            caption={getI18nMessage('statistics')}
            bordered
            className='table-container'
            scale='m'
            layout='fixed'>
            <CalciteTableRow slot='table-header'>
              <CalciteTableHeader heading={getI18nMessage('attribute')}/>
              <CalciteTableHeader heading={getI18nMessage('value')}/>
            </CalciteTableRow>
            {currentStats.map((value, index) => {
              return (
                <CalciteTableRow key={index}>
                  <CalciteTableCell alignment='center'>
                    <div className='w-100 d-flex'>
                      <Label
                        title={value[0]}
                        className='text-truncate label2'
                        style={{
                          textOverflow: 'ellipsis',
                          marginBottom: 0,
                          alignItems: 'center',
                          textAlign: 'left'
                        }}>
                        {value[0]}
                      </Label>
                    </div>
                  </CalciteTableCell>
                  <CalciteTableCell alignment='center'>
                    <div className='w-100 d-flex'>
                      <Label
                        title={value[1]}
                        className='text-truncate label2'
                        style={{
                          textOverflow: 'ellipsis',
                          marginBottom: 0,
                          alignItems: 'center',
                          textAlign: 'left'
                        }}>
                        {value[1]}
                      </Label>
                    </div>
                  </CalciteTableCell>
                </CalciteTableRow>
              )
            })}
          </CalciteTable>
        </div>
      : <div></div>
    }
  </div>
  )
})
