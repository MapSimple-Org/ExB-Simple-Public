import { React, type ImmutableObject, classNames, Immutable, hooks } from 'jimu-core'
import { defaultMessages as jimUiDefaultMessage, Switch } from 'jimu-ui'
import { getDefaultAxisColor, getDefaultGridColor, getDefaultLineColor, isXYChart } from '../../../../../../utils/default'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../../../../../translations/default'
import { LineSymbolSetting, LineStyleCollapse } from '../../components'
import type { IWebChart } from '../../../../../../config'
import type { ChartTypes, ISimpleLineSymbol } from 'jimu-ui/advanced/chart'

enum LineElementPaths {
  CategoryAxis = 'axes.0.lineSymbol',
  CategoryGrid = 'axes.0.grid',
  ValueAxis = 'axes.1.lineSymbol',
  ValueGrid = 'axes.1.grid'
}

/**
 * Get the supported line elements.
 * @param type
 */
export const getLineElements = (type: ChartTypes) => {
  if (isXYChart(type)) {
    return Object.values(LineElementPaths)
  } else if (type === 'pieSeries') {
    return []
  } else if (type === 'gaugeSeries') {
    return [LineElementPaths.CategoryAxis]
  }
}

const LineStyleProp = ['color', 'style', 'width']

const LineElementsTranslation = {
  [LineElementPaths.CategoryAxis]: 'categoryAxis',
  [LineElementPaths.CategoryGrid]: 'categoryGrid',
  [LineElementPaths.ValueAxis]: 'valueAxis',
  [LineElementPaths.ValueGrid]: 'valueGrid'
}

const getDefaultSymbolElementColor = (element?: LineElementPaths) => {
  if (element === LineElementPaths.CategoryAxis || element === LineElementPaths.ValueAxis) {
    return getDefaultAxisColor()
  } else if (element === LineElementPaths.CategoryGrid || element === LineElementPaths.ValueGrid) {
    return getDefaultGridColor()
  }
  return getDefaultLineColor()
}

/**
 * Convert path to array path
 */
const getPathArray = (path: string): string[] => path?.split('.')

/**
 * Check whether a style is the same in all elements
 * @param key
 * @param elements
 * @param webChart
 */
const isSameLineStyle = (
  key: string,
  elements: LineElementPaths[],
  webChart: ImmutableObject<IWebChart>
): boolean => {
  const first = webChart?.getIn(getPathArray(elements[0]))[key]

  return elements.every(path => {
    const symbol = webChart?.getIn(getPathArray(path))
    return symbol?.[key] === first
  })
}

/**
 * Gets the same style in all elements
 * @param textElements
 * @param webChart
 */
const getSameLineStyle = (
  textElements: LineElementPaths[],
  webChart: ImmutableObject<IWebChart>
): ImmutableObject<ISimpleLineSymbol> => {
  let symbol = Immutable({
    type: 'esriSLS'
  }) as ImmutableObject<ISimpleLineSymbol>

  const first = webChart.getIn(getPathArray(textElements[0]))

  LineStyleProp.forEach(key => {
    const same = isSameLineStyle(key, textElements, webChart)
    if (same) {
      symbol = symbol.set(key, first?.[key])
    }
  })

  return symbol
}

export interface LineStyleProps {
  className?: string
  isGauge?: boolean
  elements: LineElementPaths[]
  webChart: ImmutableObject<IWebChart>
  onChange: (webChart: ImmutableObject<IWebChart>) => void
}

const useTranslation = (isGauge: boolean = false) => {
  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage)
  return (id: string, values?: any) => {
    if (isGauge && id === LineElementsTranslation[LineElementPaths.CategoryAxis]) {
      return translate('axis')
    } else {
      return translate(id, values)
    }
  }
}

const DefaultLineElements = getLineElements('barSeries')
export const LineStyle = (props: LineStyleProps): React.ReactElement => {
  const { className, isGauge = false, elements = DefaultLineElements, webChart, onChange } = props
  const translate = useTranslation(isGauge)
  const [useAll, setUseAll] = React.useState(false)
  const [currentPath, setCurrentPath] = React.useState<LineElementPaths>()
  const allSymbol = getSameLineStyle(elements, webChart)

  const handleAllLineChange = (key: string, value: any): void => {
    if (value !== 0 && !value) return
    let ret = webChart
    elements.forEach(path => {
      const paths = getPathArray(path)
      let symbol = ret.getIn(paths)
      if (symbol) {
        symbol = symbol.set(key, value)
        ret = ret.setIn(paths, symbol)
      }
    })
    onChange(ret)
  }

  const handleLineChange = (
    path: LineElementPaths,
    value: ImmutableObject<ISimpleLineSymbol>
  ): void => {
    let ret = webChart
    const paths = getPathArray(path)
    ret = ret.setIn(paths, value)
    onChange(ret)
  }

  return (
    <div className={classNames('line-style w-100', className)} role='group' aria-label={translate('symbolElements')}>
      {elements?.length > 1 && <SettingSection>
        <SettingRow tag='label' label={translate('allLine')} level={1}>
          <Switch
            checked={useAll}
            onChange={(_, checked) => { setUseAll(checked) }}
          />
        </SettingRow>
      </SettingSection>}
      <SettingSection>
        {useAll && (
          <LineSymbolSetting
            defaultColor={getDefaultSymbolElementColor()}
            value={allSymbol}
            aria-label={translate('allLine')}
            onPropsChange={handleAllLineChange}
          />
        )}
        {!useAll && (
          <>
            {elements.map((path, idx) => {
              const symbol = webChart.getIn(getPathArray(path))
              const label = translate(LineElementsTranslation[path])
              return (
                <LineStyleCollapse
                  className='mb-2'
                  defaultColor={getDefaultSymbolElementColor(path)}
                  open={currentPath === path}
                  baseline={idx !== elements?.length - 1}
                  toggle={open => { setCurrentPath(open ? path : undefined) }}
                  label={label}
                  key={idx}
                  value={symbol}
                  onChange={value => { handleLineChange(path, value) }}
                />
              )
            })}
          </>
        )}
      </SettingSection>
    </div>
  )
}
