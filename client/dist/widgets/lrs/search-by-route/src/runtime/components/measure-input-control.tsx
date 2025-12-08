/** @jsx jsx */
import {
  React,
  hooks,
  type ImmutableObject,
  type DataSource,
  type IntlShape,
  jsx
} from 'jimu-core'
import defaultMessages from '../translations/default'
import { Button, Label, TextInput, type ValidityResult } from 'jimu-ui'
import type { RouteAndMeasureQuery } from '../../config'
import { GetUnits, type LrsLayer, type NetworkInfo, SearchMeasuresType, convertStationToNumber } from 'widgets/shared-code/lrs'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'

export interface SearchMeasureProps {
  lrsLayer?: ImmutableObject<LrsLayer>
  dataSource: DataSource
  isDataSourceReady: boolean
  searchMeasureBy: SearchMeasuresType
  routeAndMeasureRequest: RouteAndMeasureQuery
  intl: IntlShape
  reset?: boolean
  onChange: (request: RouteAndMeasureQuery, isValid: boolean) => void
}

export function MeasureInputControl (props: SearchMeasureProps) {
  const { reset, lrsLayer, isDataSourceReady, searchMeasureBy, routeAndMeasureRequest, intl, onChange } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const networkInfo = lrsLayer?.networkInfo || {} as NetworkInfo
  const units = GetUnits(networkInfo.unitsOfMeasure, intl)
  const [measureOrStationValue, setMeasureOrStationValue] = React.useState('')
  const [fromMeasureOrStationValue, setFromMeasureOrStationValue] = React.useState('')
  const [toMeasureOrStationValue, setToMeasureOrStationValue] = React.useState('')
  const [measureOrStationItems, setMeasureOrStationItems] = React.useState<string[]>(new Array<string>(1).fill(''))

  React.useEffect(() => {
    setMeasureOrStationValue('')
    setFromMeasureOrStationValue('')
    setToMeasureOrStationValue('')
    setMeasureOrStationItems(new Array<string>(1).fill(''))
  }, [reset])

  const validateMeasure = (value: string, isFromMeasure: boolean, index?: number): ValidityResult => {
    if (isNaN(Number(value))) {
      const stationValue = convertStationToNumber(value)
      if (isNaN(stationValue)) {
        updateRequestMeasure(NaN, isFromMeasure, false, index, '')
        return { valid: false, msg: getI18nMessage('invalidMeasure') }
      } else {
        // save station value as number
        updateRequestMeasure(stationValue, isFromMeasure, true, index, value)
        return { valid: true }
      }
    }
    if (value === '') {
      updateRequestMeasure(Number(NaN), isFromMeasure, true, index, '')
    } else {
      updateRequestMeasure(Number(value), isFromMeasure, true, index, '')
    }
    return { valid: true }
  }

  const updateRequestMeasure = (value: number, fromMeasure: boolean, isValid: boolean, index: number, station?: string) => {
    const request = routeAndMeasureRequest
    if (request.searchMeasureBy === SearchMeasuresType.Single) {
      request.measure = value
      request.station = station
    } else if (request.searchMeasureBy === SearchMeasuresType.Multiple) {
      request.measures[index] = value
      request.stations[index] = station
    } else if (request.searchMeasureBy === SearchMeasuresType.Range) {
      if (fromMeasure) {
        request.fromMeasure = value
        request.fromStation = station
      } else {
        request.toMeasure = value
        request.toStation = station
      }
    }
    onChange(request, isValid)
  }

  const onMeasureOrStationChange = (e: { target: { value: any } }) => {
    const value = e?.target?.value
    setMeasureOrStationValue(value)
  }

  const onFromMeasureOrStationChange = (e: { target: { value: any } }) => {
    const value = e?.target?.value
    setFromMeasureOrStationValue(value)
  }

  const onToMeasureOrStationChange = (e: { target: { value: any } }) => {
    const value = e?.target?.value
    setToMeasureOrStationValue(value)
  }

  const onMeasuresOrStationsChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    measureOrStationItems[index] = e.target.value
    const items: string[] = []
    measureOrStationItems.forEach((item, idx) => {
      items.push(item)
    })
    setMeasureOrStationItems(items)
  }

  const addMeasureOrStation = () => {
    let items: string[] = []
    items.push('')
    if (measureOrStationItems) {
      items = measureOrStationItems.concat(items)
    }
    routeAndMeasureRequest.measures.push(Number(NaN))
    routeAndMeasureRequest.stations.push('')
    setMeasureOrStationItems(items)
  }

  const removeMeasureOrStation = (index: number) => {
    routeAndMeasureRequest.measures.splice(index, 1)
    routeAndMeasureRequest.stations.splice(index, 1)
    measureOrStationItems.splice(index, 1)
    const items: string[] = []
    measureOrStationItems.forEach((item, idx) => {
      items.push(item)
    })
    setMeasureOrStationItems(items)
  }

  return (
    <div className='measure-input-control'>
      <div className='measure-input-control__content pt-2'>
        {searchMeasureBy === SearchMeasuresType.Single && (
          <div className="measure-input-control__single px-3">
            <Label size="default" className='mb-0 w-100 title3' centric>
              {getI18nMessage('measureWithUnits', { units: units })}
            </Label>
            <TextInput
              aria-label={getI18nMessage('measureWithUnits', { units: units })}
              type="text"
              size='sm'
              style={{ width: '100%' }}
              disabled={!isDataSourceReady}
              allowClear={true}
              value={measureOrStationValue}
              onChange={onMeasureOrStationChange}
              checkValidityOnAccept={(e) => { return validateMeasure(e, true) }} />
          </div>
        )}
        {searchMeasureBy === SearchMeasuresType.Multiple && (
          <div className="measure-input-control__multiple">
            <div className="measure-input-control__multiple-measure px-3">
              <Label size="default" className='mb-0 w-100 title3' centric>
                {getI18nMessage('measuresWithUnits', { units: units })}
              </Label>
              {measureOrStationItems && measureOrStationItems.map((item, index) => {
                return (
                  <div key={index} className='d-flex w-100'>
                    <TextInput
                      aria-label={getI18nMessage('measuresWithUnits', { units: units })}
                      type="text"
                      className='mb-1'
                      size='sm'
                      style={{ width: '93%', float: 'left' }}
                      disabled={!isDataSourceReady}
                      allowClear={true}
                      checkValidityOnAccept={(e) => { return validateMeasure(e, true, index) }}
                      onChange={(e) => { onMeasuresOrStationsChange(e, index) }}
                      value={item}
                    />
                    {index > 0 && (
                      <Button
                        className='text-input-clear clear-content'
                        style={{ float: 'left', width: '7%' }}
                        type='tertiary'
                        aria-label={getI18nMessage('clear')}
                        title={getI18nMessage('clear')}
                        icon
                        size='sm'
                        onClick={() => { removeMeasureOrStation(index) }}
                      >
                        <CloseOutlined size='s'/>
                      </Button>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="measure-input-control__multiple-add-input pt-2 px-3">
              <Button
                type='secondary'
                size='sm'
                style={{ width: '93%' }}
                onClick={addMeasureOrStation}
              >
                {getI18nMessage('addAnotherMeasure')}
              </Button>
            </div>
          </div>
        )}
        {searchMeasureBy === SearchMeasuresType.Range && (
          <div className="measure-input-control__range">
            <div className="measure-input-control__range-from-measure px-3">
              <Label size="default" className='mb-0 w-100 title3' centric>
                {getI18nMessage('fromMeasureWithUnits', { units: units })}
              </Label>
              <TextInput
                aria-label={getI18nMessage('fromMeasureWithUnits', { units: units })}
                type="text"
                size='sm'
                style={{ width: '100%' }}
                disabled={!isDataSourceReady}
                allowClear={true}
                value={fromMeasureOrStationValue}
                onChange={onFromMeasureOrStationChange}
                checkValidityOnAccept={(e) => { return validateMeasure(e, true) }} />
            </div>
            <div className="measure-input-control__range-to-measure pt-2 px-3">
              <Label size="default" className='mb-0 w-100 title3' centric>
                {getI18nMessage('toMeasureWithUnits', { units: units })}
              </Label>
              <TextInput
                aria-label={getI18nMessage('toMeasureWithUnits', { units: units })}
                type="text"
                size='sm'
                style={{ width: '100%' }}
                disabled={!isDataSourceReady}
                allowClear={true}
                value={toMeasureOrStationValue}
                onChange={onToMeasureOrStationChange}
                checkValidityOnAccept={(e) => { return validateMeasure(e, false) }} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
