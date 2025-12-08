import { React, type ImmutableObject, classNames, Immutable, hooks } from 'jimu-core'
import { defaultMessages as jimUiDefaultMessage, Switch } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../../../../../translations/default'
import { TextSymbolSetting, type TextSymbol, TextStyleCollapse } from '../../components'
import type { IWebChart } from '../../../../../../config'
import {
  getDefaultAxisLabelColor,
  getDefaultAxisTitleColor,
  getDefaultFooterColor,
  getDefaultGaugeValueLabelColor,
  getDefaultLegendLabelColor,
  getDefaultLegendTitleColor,
  getDefaultTextColor,
  getDefaultTitleColor,
  getDefaultValueLabelColor,
  isSerialSeries
} from '../../../../../../utils/default'
import type { ChartTypes } from 'jimu-ui/advanced/chart'

export interface TextStyleProps {
  className?: string
  elements: TextElementPaths[]
  webChart: ImmutableObject<IWebChart>
  onChange: (webChart: ImmutableObject<IWebChart>) => void
}

enum TextElementPaths {
  ChartTitle = 'title.content',
  ChartDescription = 'footer.content',
  AxisTitle = 'axes.title.content',
  AxisLabel = 'axes.labels.content',
  LegendTitle = 'legend.title.content',
  LegendLabel = 'legend.body',
  ValueLabel = 'series.dataLabels.content',
  AxisInnerLabel = 'axes.innerLabel.content'
}

/**
 * Get the supported text elements.
 * @param type
 */
export const getTextElements = (type: ChartTypes) => {
  if (isSerialSeries(type) || type === 'histogramSeries') {
    return [
      TextElementPaths.ChartTitle,
      TextElementPaths.ChartDescription,
      TextElementPaths.AxisTitle,
      TextElementPaths.AxisLabel,
      TextElementPaths.LegendTitle,
      TextElementPaths.LegendLabel,
      TextElementPaths.ValueLabel
    ]
  } else if (type === 'scatterSeries') {
    return [
      TextElementPaths.ChartTitle,
      TextElementPaths.ChartDescription,
      TextElementPaths.AxisTitle,
      TextElementPaths.AxisLabel,
      TextElementPaths.LegendTitle,
      TextElementPaths.LegendLabel
    ]
  } else if (type === 'pieSeries') {
    return [
      TextElementPaths.ChartTitle,
      TextElementPaths.ChartDescription,
      TextElementPaths.LegendTitle,
      TextElementPaths.LegendLabel,
      TextElementPaths.ValueLabel
    ]
  } else if (type === 'gaugeSeries') {
    return [
      TextElementPaths.ChartTitle,
      TextElementPaths.ChartDescription,
      TextElementPaths.AxisInnerLabel,
      TextElementPaths.AxisLabel
    ]
  }
}

const TextElementsTranslation = {
  [TextElementPaths.ChartTitle]: 'chartTitle',
  [TextElementPaths.ChartDescription]: 'chartDescription',
  [TextElementPaths.AxisTitle]: 'axisTitle',
  [TextElementPaths.AxisLabel]: 'axisLabel',
  [TextElementPaths.LegendTitle]: 'legendTitle',
  [TextElementPaths.LegendLabel]: 'legendLabel',
  [TextElementPaths.ValueLabel]: 'dataLabel',
  [TextElementPaths.AxisInnerLabel]: 'displayValue'
}

const getDefaultTextElementColor = (element?: TextElementPaths) => {
  if (element === TextElementPaths.ChartTitle) {
    return getDefaultTitleColor()
  } else if (element === TextElementPaths.ChartDescription) {
    return getDefaultFooterColor()
  } else if (element === TextElementPaths.AxisTitle) {
    return getDefaultAxisTitleColor()
  } else if (element === TextElementPaths.AxisLabel) {
    return getDefaultAxisLabelColor()
  } else if (element === TextElementPaths.LegendTitle) {
    return getDefaultLegendTitleColor()
  } else if (element === TextElementPaths.LegendLabel) {
    return getDefaultLegendLabelColor()
  } else if (element === TextElementPaths.ValueLabel) {
    return getDefaultValueLabelColor()
  } else if (element === TextElementPaths.AxisInnerLabel) {
    return getDefaultGaugeValueLabelColor()
  }
  return getDefaultTextColor()
}

const TextSymbolKeys = [
  'color',
  'weight',
  'style',
  'decoration',
  'family',
  'size'
]

/**
 * Convert path to array path
 * @param path
 * @param capture
 */
const getPathArray = (path: TextElementPaths, capture: boolean = true): string[] => {
  let paths = path.split('.')
  if (
    path === TextElementPaths.AxisLabel ||
    path === TextElementPaths.AxisInnerLabel ||
    path === TextElementPaths.AxisTitle ||
    path === TextElementPaths.ValueLabel
  ) {
    if (capture) {
      paths.splice(1, 0, '0')
    } else {
      paths = paths.slice(1)
    }
  }
  return paths
}

/**
 * Check whether a style is the same in all elements
 * @param key
 * @param textElements
 * @param webChart
 */
const isSameTextStyle = (
  key: string,
  textElements: TextElementPaths[],
  webChart: ImmutableObject<IWebChart>
): boolean => {
  const first =
    key === 'color'
      ? webChart.getIn(getPathArray(textElements[0]))?.color
      : webChart.getIn(getPathArray(textElements[0]))?.font?.[key]

  return textElements.every(path => {
    const symbol = webChart.getIn(getPathArray(path))
    return key === 'color'
      ? symbol?.color === first
      : symbol?.font?.[key] === first
  })
}

/**
 * Gets the same style in all elements
 * @param textElements
 * @param webChart
 */
const getSameTextStyle = (
  textElements: TextElementPaths[],
  webChart: ImmutableObject<IWebChart>
): ImmutableObject<TextSymbol> => {
  let symbol = Immutable({
    type: 'esriTS',
    horizontalAlignment: 'center'
  }) as ImmutableObject<TextSymbol>

  const first = webChart.getIn(getPathArray(textElements[0]))

  TextSymbolKeys.forEach(key => {
    const same = isSameTextStyle(key, textElements, webChart)
    if (same) {
      symbol =
        key === 'color'
          ? symbol.set(key, first?.[key])
          : symbol.setIn(['font', key], first?.font?.[key])
    }
  })

  return symbol
}

/**
 * Set the style in webChart according to the path
 * @param key
 * @param path
 * @param value
 * @param webChart
 */
const setTextStyle = (
  key: string,
  path: TextElementPaths,
  value: any,
  webChart: ImmutableObject<IWebChart>
): ImmutableObject<IWebChart> => {
  let ret = webChart

  const paths = getPathArray(path, false).concat(
    key === 'color' ? ['color'] : ['font', key]
  )

  if (
    path === TextElementPaths.AxisLabel ||
    path === TextElementPaths.AxisTitle ||
    path === TextElementPaths.AxisInnerLabel
  ) {
    ret = webChart.set(
      'axes',
      ret.axes?.map(axis => {
        return axis?.setIn(paths, value)
      })
    )
  } else if (path === TextElementPaths.ValueLabel) {
    ret = ret.set(
      'series',
      ret.series.map(serie => {
        return Immutable.setIn(serie, paths, value)
      })
    )
  } else {
    ret = ret.setIn(paths, value)
  }
  return ret
}

const DefaultTextElements = getTextElements('barSeries')

export const TextStyle = (props: TextStyleProps): React.ReactElement => {
  const { className, elements = DefaultTextElements, webChart, onChange } = props
  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage)
  const [useAll, setUseAll] = React.useState(false)
  const [currentPath, setCurrentPath] = React.useState<TextElementPaths>()
  const allSymbol = getSameTextStyle(elements, webChart)

  const handleAllTextChange = (key: string, value: any): void => {
    let ret = webChart
    elements.forEach(path => {
      ret = setTextStyle(key, path, value, ret)
    })
    onChange(ret)
  }

  const handleTextChange = (
    path: TextElementPaths,
    value: ImmutableObject<TextSymbol>
  ): void => {
    let ret = webChart
    const paths = getPathArray(path, false)

    if (
      path === TextElementPaths.AxisLabel ||
      path === TextElementPaths.AxisInnerLabel ||
      path === TextElementPaths.AxisTitle
    ) {
      ret = webChart.set(
        'axes',
        ret.axes?.map(axis => {
          const text = axis.getIn(paths)?.text ?? ''
          if (text) {
            value = value.set('text', text)
          }
          return axis?.setIn(paths, value)
        })
      )
    } else if (path === TextElementPaths.ValueLabel) {
      ret = ret.set(
        'series',
        ret.series.map(serie => {
          return Immutable.setIn(serie, paths, value)
        })
      )
    } else {
      ret = ret.setIn(paths, value)
    }
    onChange(ret)
  }

  return (
    <div className={classNames('text-style w-100', className)} role='group' aria-label={translate('textElements')}>
      <SettingSection>
        <SettingRow tag='label' label={translate('allText')} level={1}>
          <Switch
            checked={useAll}
            onChange={(_, checked) => { setUseAll(checked) }}
          />
        </SettingRow>
      </SettingSection>

      <SettingSection>
        {useAll && (
          <TextSymbolSetting
            defaultColor={getDefaultTextElementColor()}
            value={allSymbol}
            aria-label={translate('allText')}
            onColorChange={value => { handleAllTextChange('color', value) }}
            onFontChange={handleAllTextChange}
          />
        )}
        {!useAll && (
          <>
            {elements.map((path, idx) => {
              const symbol = webChart.getIn(getPathArray(path))
              const label = translate(TextElementsTranslation[path])
              return (
                <TextStyleCollapse
                  key={idx}
                  className='mb-2'
                  defaultColor={getDefaultTextElementColor(path)}
                  open={currentPath === path}
                  baseline={idx !== elements?.length - 1}
                  toggle={open => { setCurrentPath(open ? path : undefined) }}
                  label={label}
                  value={symbol}
                  onChange={value => { handleTextChange(path, value) }}
                />
              )
            })}
          </>
        )}
      </SettingSection>
    </div>
  )
}
