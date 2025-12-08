/** @jsx jsx */
import {
  React,
  css,
  type ImmutableObject,
  type DataSource,
  jsx,
  type IntlShape
} from 'jimu-core'
import type { RouteAndMeasureQuery } from '../../config'
import { RouteInputControl } from './route-input-control'
import { MeasureSegmentControl } from './measures-segment-control'
import { MeasureInputControl } from './measure-input-control'
import { useImperativeHandle } from 'react'
import { LineIdentifiers, type LrsLayer, type NetworkInfo, SearchMeasuresType } from 'widgets/shared-code/lrs'

export interface SearchLineMeasureFormProps {
  widgetId: string
  lrsLayer?: ImmutableObject<LrsLayer>
  dataSource: DataSource
  isDataSourceReady: boolean
  intl: IntlShape
  reset?: boolean
  hideRoute: boolean
  onSubmit: (query: RouteAndMeasureQuery) => void
  onValidationChanged: (isValid: boolean) => void
}

const getFormStyle = () => {
  return css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    .search-by-measure-form__content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      overflow: auto;
    }
  `
}

export const SearchLineMeasureForm = React.forwardRef((props: SearchLineMeasureFormProps, ref) => {
  const { widgetId, reset, lrsLayer, dataSource, isDataSourceReady, intl, hideRoute, onSubmit, onValidationChanged } = props
  const networkInfo = React.useMemo(() => {
    return lrsLayer?.networkInfo || {} as NetworkInfo
  }, [lrsLayer])

  const [routeAndMeasureRequest, setRouteAndMeasureRequest] = React.useState<RouteAndMeasureQuery>({})
  const [isLineValid, setIsLineValid] = React.useState<boolean>(false)
  const [isMeasureValid, setIsMeasureValid] = React.useState<boolean>(true)
  const [searchMeasureBy, setSearchMeasureBy] = React.useState<SearchMeasuresType>(SearchMeasuresType.Single)

  useImperativeHandle(ref, () => ({
    submitForm
  }))

  React.useEffect(() => {
    // Set the search measure type.
    let searchBy = SearchMeasuresType.Single
    if (networkInfo.searchSingle) {
      searchBy = SearchMeasuresType.Single
    } else if (networkInfo.searchMultiple) {
      searchBy = SearchMeasuresType.Multiple
    } else if (networkInfo.searchRange) {
      searchBy = SearchMeasuresType.Range
    }
    setSearchMeasureBy(searchBy)

    // Reset the query form.
    const resetRequest: RouteAndMeasureQuery = {
      routeId: '',
      routeName: '',
      lineId: '',
      lineName: '',
      routeIdFields: new Array(networkInfo?.routeIdFields?.length).fill(''),
      measure: NaN,
      station: '',
      fromMeasure: NaN,
      fromStation: '',
      toMeasure: NaN,
      toStation: '',
      measures: [NaN],
      stations: [''],
      isPoint: false,
      searchMeasureBy: searchBy
    }
    setRouteAndMeasureRequest(resetRequest)
  }, [networkInfo, reset])

  // Submit the form.
  const submitForm = () => {
    // Create a copy and update the request. This is to avoid updating the state
    // and invalidating the form for the next request.
    const requestCopy = { ...routeAndMeasureRequest }
    requestCopy.isMeasureToGeometryOperation = false
    requestCopy.isPoint = false

    if (requestCopy.searchMeasureBy === SearchMeasuresType.Single) {
      if (!isNaN(requestCopy.measure)) {
        requestCopy.isMeasureToGeometryOperation = true
        requestCopy.isPoint = true
      }
    } else if (requestCopy.searchMeasureBy === SearchMeasuresType.Multiple) {
      if (requestCopy.measures.some(item => !isNaN(item))) {
        requestCopy.isMeasureToGeometryOperation = true
        requestCopy.isPoint = true
      }
    } else {
      requestCopy.isPoint = false
      if (!isNaN(requestCopy.fromMeasure) || !isNaN(requestCopy.toMeasure)) {
        // To measure was provided, but from measure was not. Swap the measures.
        if (isNaN(requestCopy.fromMeasure) && !isNaN(requestCopy.toMeasure)) {
          requestCopy.fromMeasure = requestCopy.toMeasure
          requestCopy.toMeasure = NaN
          requestCopy.isPoint = true
        }
        if (!isNaN(requestCopy.fromMeasure) && isNaN(requestCopy.toMeasure)) {
          requestCopy.isPoint = true
        }
        requestCopy.isMeasureToGeometryOperation = true
      }
    }

    onSubmit(requestCopy)
  }

  const isValidInput = React.useMemo(() => {
    return isDataSourceReady && isLineValid && isMeasureValid
  }, [isDataSourceReady, isLineValid, isMeasureValid])

  React.useEffect(() => {
    onValidationChanged(isValidInput)
  }, [isValidInput, onValidationChanged])

  const handleLineIdentifierChanged = React.useCallback((request: RouteAndMeasureQuery, index?: number) => {
    setRouteAndMeasureRequest(request)
  }, [])

  const handleLineIdentifierAccepted = React.useCallback((request: RouteAndMeasureQuery, isValid: boolean, index?: number) => {
    setRouteAndMeasureRequest(request)

    if (networkInfo.defaultLineIdentifier === LineIdentifiers.LineId && request.lineId === '') {
      setIsLineValid(false)
    } else if (networkInfo.defaultLineIdentifier === LineIdentifiers.LineName && request.lineName === '') {
      setIsLineValid(false)
    } else {
      setIsLineValid(isValid)
    }
  }, [networkInfo])

  const handleMeasureTypeChange = React.useCallback((value: SearchMeasuresType) => {
    const request = routeAndMeasureRequest
    request.searchMeasureBy = value
    setRouteAndMeasureRequest(request)
    setSearchMeasureBy(value)
  }, [routeAndMeasureRequest])

  const handleMeasureChanged = React.useCallback((request: RouteAndMeasureQuery, isValid: boolean) => {
    setRouteAndMeasureRequest(request)
    setIsMeasureValid(isValid)
  }, [])

  return (
    <div className='search-by-measure-form' css={getFormStyle()}>
      <div className='search-by-measure-form__content pt-3'>
        <RouteInputControl
          reset={reset}
          intl={intl}
          widgetId={widgetId}
          lrsLayer={lrsLayer}
          dataSource={dataSource}
          routeAndMeasureRequest={routeAndMeasureRequest}
          isDataSourceReady={isDataSourceReady}
          hideRoute={hideRoute}
          onChange={handleLineIdentifierChanged}
          onAccept={handleLineIdentifierAccepted}
          type='lineMeasure'
        />
        <MeasureSegmentControl
          lrsLayer={lrsLayer}
          searchMeasureBy={searchMeasureBy}
          onChange={handleMeasureTypeChange}
        />
        <MeasureInputControl
          reset={reset}
          intl={intl}
          lrsLayer={lrsLayer}
          dataSource={dataSource}
          isDataSourceReady={isDataSourceReady}
          searchMeasureBy={searchMeasureBy}
          routeAndMeasureRequest={routeAndMeasureRequest}
          onChange={handleMeasureChanged}
        />
      </div>
    </div>
  )
})
