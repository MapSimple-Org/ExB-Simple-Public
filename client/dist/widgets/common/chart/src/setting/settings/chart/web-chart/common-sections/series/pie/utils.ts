import { React, Immutable, QueryScope, type IMFeatureLayerQueryParams, type QueriableDataSource, type ImmutableArray, type ImmutableObject } from 'jimu-core'
import type { ISimpleLineSymbol, WebChartPieChartSlice } from 'jimu-ui/advanced/chart'
import { getFillSymbol } from '../../../../../../../utils/default'

export const convertStripColors = (colors: string[]) => {
  return colors.map((color) => ({
    label: color,
    value: color,
    color: color
  }))
}

export const applyPieSlicesColors = (propSlices: ImmutableArray<WebChartPieChartSlice>, colors: string[]): ImmutableArray<WebChartPieChartSlice> => {
  if (!colors) return
  const slices = propSlices?.map((slice, index) => {
    const color = getNextColor(colors, index)
    slice = slice.setIn(['fillSymbol', 'color'], color)
    return slice as any
  })
  return slices
}

export const applyPieSlicesOutline = (propSlices: ImmutableArray<WebChartPieChartSlice>, outline: ImmutableObject<ISimpleLineSymbol>): ImmutableArray<WebChartPieChartSlice> => {
  if (!outline) return
  const slices = propSlices?.map((slice) => {
    slice = slice.setIn(['fillSymbol', 'outline'], outline)
    return slice as any
  })
  return slices
}

export const getNextColor = (colors: string[], index: number = 0): string => {
  if (!colors?.length) return
  const idx = index % colors.length
  const color = colors[idx]
  return color
}

export const getPieSlice = (index: number, colors: string[], value: string, outline?: ImmutableObject<ISimpleLineSymbol>): WebChartPieChartSlice => {
  const fillColor = getNextColor(colors, index)
  const fillSymbol = getFillSymbol(fillColor, 0)
  if (outline) {
    fillSymbol.outline = outline as any
  }
  return { sliceId: value, label: value, fillSymbol }
}

export const getByFieldPieSlices = (numericFields: ImmutableArray<string>, colors: string[], outline: ImmutableObject<ISimpleLineSymbol>): ImmutableArray<WebChartPieChartSlice> => {
  const slices = numericFields.filter(field => !!field).map((field, index) => {
    const slice = getPieSlice(index, colors, field, outline)
    return slice
  })
  return slices
}

export type LoadSlices = (count: number, outline?: ImmutableObject<ISimpleLineSymbol>) => Promise<{ value: ImmutableArray<WebChartPieChartSlice>, loadout: boolean, exceed: boolean }>
const defaultPieSlices = Immutable([]) as ImmutableArray<WebChartPieChartSlice>
export const useLoadingPieSlices = (
  dataSource: QueriableDataSource,
  query: IMFeatureLayerQueryParams,
  orderByFields: ImmutableArray<string>,
  propSlices: ImmutableArray<WebChartPieChartSlice> = defaultPieSlices,
  colors: string[],
  numberLimit: number = 50
): [LoadSlices, boolean] => {
  const recordNumberRef = React.useRef(0)
  const numberPerLoadRef = React.useRef(0)

  const [loading, setLoading] = React.useState(false)

  const categoryField = query?.groupByFieldsForStatistics?.[0] ?? ''
  let queryParams = query
  if (orderByFields?.length) {
    queryParams = queryParams.set('orderByFields', orderByFields)
  }

  const loadSlices = (count: number, outline?: ImmutableObject<ISimpleLineSymbol>) => {
    const exceed = propSlices.length >= numberLimit
    if (exceed) return Promise.resolve({ value: propSlices, loadout: false, exceed: true })
    setLoading(true)
    return dataSource.query(queryParams, { scope: QueryScope.InConfigView }).then((result) => {
      const records = result.records
      let slices = propSlices
      records.some((record) => {
        recordNumberRef.current++
        const value = record.getFieldValue(categoryField)
        if (value == null) return false
        const sliceId = value + ''
        const existed = !!slices.find(slice => slice.sliceId === sliceId)
        if (existed) return false
        const slice = getPieSlice(numberPerLoadRef.current, colors, sliceId, outline)
        slices = slices.concat(slice)
        numberPerLoadRef.current++
        return numberPerLoadRef.current >= count
      })
      const loadout = recordNumberRef.current >= records.length
      const exceed = Object.keys(slices).length >= numberLimit
      recordNumberRef.current = 0
      numberPerLoadRef.current = 0
      setLoading(false)
      return { value: slices, loadout, exceed }
    }, (error) => {
      console.error(error)
      setLoading(false)
      return undefined
    })
  }

  return [loadSlices, loading]
}
