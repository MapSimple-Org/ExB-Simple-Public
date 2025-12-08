/** @jsx jsx */
import {
  React,
  css,
  hooks,
  type ImmutableObject,
  type DataSource,
  loadArcGISJSAPIModules,
  jsx,
  focusElementInKeyboardMode
} from 'jimu-core'
import {
  Coordinate,
  coordinateGraphicColor,
  getGeometryGraphic,
  getSimplePointGraphic,
  isDefined,
  SpatialReferenceFrom,
  type LrsLayer
} from 'widgets/shared-code/lrs'
import defaultMessages from '../translations/default'
import { Label, TextInput, type ValidityResult } from 'jimu-ui'
import type { CoordinateQuery} from '../../config'
import { useImperativeHandle } from 'react'
import type GraphicsLayer from 'esri/layers/GraphicsLayer'

export interface SearchCoordinatesProps {
  lrsLayer?: ImmutableObject<LrsLayer>
  dataSource: DataSource
  isDataSourceReady: boolean
  onSubmit: (query: CoordinateQuery) => void
  onValidationChanged: (isValid: boolean) => void
  coordinateGraphic: GraphicsLayer
  reset?: boolean
}

const getFormStyle = () => {
  return css`
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    .search-by-coordinates-form__content {
      display: flex;
      flex-direction: column;
      width: 100%;
      height: 100%;
      flex: 1 1 auto;
      overflow: auto;
    }
  `
}

export const SearchCoordinatesForm = React.forwardRef((props: SearchCoordinatesProps, ref) => {
  const { reset, isDataSourceReady, onSubmit, lrsLayer, onValidationChanged, coordinateGraphic } = props
  const [routeAndGeometryRequest, setRouteAndGeometryRequest] = React.useState<CoordinateQuery>({})
  const [isXCoordinateValid, setIsXCoordinateValid] = React.useState<boolean>(false) // required
  const [isYCoordinateValid, setIsYCoordinateValid] = React.useState<boolean>(false) // required
  const [isZCoordinateValid, setIsZCoordinateValid] = React.useState<boolean>(true) // optional
  const [xCoordinateValue, setXCoordinateValue] = React.useState(null)
  const [yCoordinateValue, setYCoordinateValue] = React.useState(null)
  const [zCoordinateValue, setZCoordinateValue] = React.useState(null)
  const searchInputRefX = React.useRef<HTMLInputElement>(null)
  const searchInputRefY = React.useRef<HTMLInputElement>(null)
  const searchInputRefZ = React.useRef<HTMLInputElement>(null)

  const getI18nMessage = hooks.useTranslation(defaultMessages)

  useImperativeHandle(ref, () => ({
    submitForm
  }))

  const submitForm = () => {
    onSubmit(routeAndGeometryRequest)
  }

  const isValidInput = React.useMemo(() => {
    return isXCoordinateValid && isYCoordinateValid && isZCoordinateValid
  }, [isXCoordinateValid, isYCoordinateValid, isZCoordinateValid])

  React.useEffect(() => {
    onValidationChanged(isValidInput)
  }, [isValidInput, onValidationChanged])

  React.useEffect(() => {
    setXCoordinateValue('')
    setYCoordinateValue('')
    setZCoordinateValue('')

    // Reset the query form.
    const resetRequest: CoordinateQuery = {
      xCoordinate: NaN,
      yCoordinate: NaN,
      zCoordinate: NaN
    }
    setRouteAndGeometryRequest(resetRequest)
  }, [lrsLayer, reset])

  React.useEffect(() => {
    setTimeout(() => {
      searchInputRefX.current.select()
      focusElementInKeyboardMode(searchInputRefX.current, true)
      searchInputRefX.current.blur()
      searchInputRefY.current.select()
      focusElementInKeyboardMode(searchInputRefY.current, true)
      searchInputRefY.current.blur()
      searchInputRefZ.current.select()
      focusElementInKeyboardMode(searchInputRefZ.current, true)
      searchInputRefZ.current.blur()
    }, 200)
  }, [reset])

  const validateCoordinate = (value: string, coordinate: Coordinate): ValidityResult => {
    // From measure field needs to be a text input to support station values
    if (isNaN(Number(value))) {
      updateRequestCoordinate(NaN, false, coordinate)
      clearCoordinateGraphic()
      return { valid: false, msg: getI18nMessage('invalidCoordinate') }
    }
    if (value === '') {
      updateRequestCoordinate(Number(NaN), coordinate === Coordinate.Z, coordinate)
    } else {
      updateRequestCoordinate(Number(value), true, coordinate)
    }

    let Point: typeof __esri.Point = null
    let SpatialReference: typeof __esri.SpatialReference = null
    loadArcGISJSAPIModules(['esri/geometry/Point', 'esri/geometry/SpatialReference']).then(modules => {
      [Point, SpatialReference] = modules
    }).then(async () => {
      const point = new Point()
      point.x = Number(xCoordinateValue)
      point.y = Number(yCoordinateValue)

      if (zCoordinateValue) {
        point.z = Number(zCoordinateValue)
      } else {
        point.z = 0
      }

      if (lrsLayer.networkInfo.defaultSpatialReferenceFrom === SpatialReferenceFrom.Map) {
        point.spatialReference = new SpatialReference({ wkid: 102100 })
      } else {
        point.spatialReference = new SpatialReference({ wkid: lrsLayer.networkInfo.spatialReferenceInfo.wkid, wkt: lrsLayer.networkInfo.spatialReferenceInfo.wkt })
      }

      updateCoordinateGraphic(await getGeometryGraphic(await getSimplePointGraphic(point), coordinateGraphicColor))
    })
    return { valid: true }
  }

  const updateCoordinateGraphic = (graphic: __esri.Graphic) => {
    if (!isDefined(graphic)) {
      clearCoordinateGraphic()
    } else if (isDefined(coordinateGraphic)) {
      coordinateGraphic.removeAll()
      coordinateGraphic.add(graphic)
    }
  }

  const clearCoordinateGraphic = (): void => {
    if (isDefined(coordinateGraphic)) {
      coordinateGraphic.removeAll()
    }
  }

  const updateRequestCoordinate = (value: number, isValid: boolean, coordinate: Coordinate) => {
    const request = routeAndGeometryRequest
    switch (coordinate) {
      case Coordinate.X: {
        request.xCoordinate = value
        setIsXCoordinateValid(isValid)
        break
      }
      case Coordinate.Y: {
        request.yCoordinate = value
        setIsYCoordinateValid(isValid)
        break
      }
      case Coordinate.Z: {
        request.zCoordinate = value
        setIsZCoordinateValid(isValid)
        break
      }
    }
    setRouteAndGeometryRequest(request)
  }

  const onCoordinateChange = (e: React.ChangeEvent<HTMLInputElement>, coordinate: Coordinate) => {
    const value = e?.target?.value
    switch (coordinate) {
      case Coordinate.X: {
        setXCoordinateValue(value)
        break
      }
      case Coordinate.Y: {
        setYCoordinateValue(value)
        break
      }
      case Coordinate.Z: {
        setZCoordinateValue(value)
        break
      }
    }
  }

  return (
    <div className='search-by-coordinates-form' css={getFormStyle()}>
      <div className='search-by-coordinates-form__content my-2'>
        <div className="search-by-coordinates-form__x-coordinate-label pt-2 px-3">
          <Label size="default" className='mb-1 title3' style={{ width: '100%' }} >
            {getI18nMessage('xCoordinateRequiredLabel')}
          </Label>
          <TextInput
            aria-label={getI18nMessage('xCoordinateRequiredLabel')}
            type="text"
            size='sm'
            style={{ width: '100%' }}
            ref={searchInputRefX}
            disabled={!isDataSourceReady}
            allowClear={!!xCoordinateValue}
            value={xCoordinateValue || ''}
            onChange={(e) => { onCoordinateChange(e, Coordinate.X) }}
            checkValidityOnAccept={(e) => { return validateCoordinate(e, Coordinate.X) }} />
        </div>
        <div className="search-by-coordinates-form__y-coordinate-label pt-2 px-3">
          <Label size="default" className='mb-1 title3' style={{ width: '100%' }} >
            {getI18nMessage('yCoordinateRequiredLabel')}
          </Label>
          <TextInput
            aria-label={getI18nMessage('yCoordinateRequiredLabel')}
            type="text"
            size='sm'
            style={{ width: '100%' }}
            ref={searchInputRefY}
            disabled={!isDataSourceReady}
            allowClear={!!yCoordinateValue}
            value={yCoordinateValue || ''}
            onChange={(e) => { onCoordinateChange(e, Coordinate.Y) }}
            checkValidityOnAccept={(e) => { return validateCoordinate(e, Coordinate.Y) }} />
        </div>
        <div className="search-by-coordinates-form__z-coordinate-label pt-2 px-3">
          <Label size="default" className='mb-1 title3' style={{ width: '100%' }} >
            {getI18nMessage('zCoordinateLabel')}
          </Label>
          <TextInput
            aria-label={getI18nMessage('zCoordinateLabel')}
            type="text"
            size='sm'
            style={{ width: '100%' }}
            ref={searchInputRefZ}
            disabled={!isDataSourceReady}
            allowClear={!!zCoordinateValue}
            value={zCoordinateValue || ''}
            onChange={(e) => { onCoordinateChange(e, Coordinate.Z) }}
            checkValidityOnAccept={(e) => { return validateCoordinate(e, Coordinate.Z) }} />
        </div>
      </div>
    </div>
  )
})
