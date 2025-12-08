import { React, type ImmutableObject, hooks } from 'jimu-core'
import { defaultMessages as jimUiDefaultMessage } from 'jimu-ui'
import type { IWebChart } from '../../../../../../config'
import { DefaultBgColor } from '../../../../../../utils/default'
import defaultMessages from '../../../../../translations/default'
import { Background } from './background'
import { TextStyle, getTextElements } from './text-style'
import { getLineElements, LineStyle } from './line-style'
import { getSeriesType } from 'jimu-ui/advanced/chart'
import { AnchoredSidePanel } from '../../../../components'

export interface AppearanceSettingProps {
  isGauge?: boolean
  webChart: ImmutableObject<IWebChart>
  onChange: (webChart: ImmutableObject<IWebChart>) => void
}

export const AppearanceSetting = (
  props: AppearanceSettingProps
): React.ReactElement => {
  const translate = hooks.useTranslation(defaultMessages, jimUiDefaultMessage)
  const { isGauge = false, webChart, onChange } = props
  const background = webChart?.background

  const seriesType = getSeriesType(webChart.series as any)
  const textElements = React.useMemo(
    () => getTextElements(seriesType),
    [seriesType]
  )
  const LineElements = React.useMemo(
    () => getLineElements(seriesType),
    [seriesType]
  )

  const handleBackgroundChange = (value: string): void => {
    onChange?.(webChart.set('background', value || DefaultBgColor))
  }

  return (
    <div className='appearance-setting w-100' aria-label={translate('appearance')} role='group'>
      <Background value={background} onChange={handleBackgroundChange} />
      {!!textElements.length && (
        <AnchoredSidePanel
          label={translate('textElements')}
          title={translate('textElements')}
        >
          <TextStyle
            webChart={webChart}
            elements={textElements}
            onChange={onChange}
          />
        </AnchoredSidePanel>
      )}
      {!!LineElements.length && (
        <AnchoredSidePanel
          label={translate('symbolElements')}
          title={translate('symbolElements')}
        >
          <LineStyle
            isGauge={isGauge}
            webChart={webChart}
            elements={LineElements}
            onChange={onChange}
          />
        </AnchoredSidePanel>
      )}
    </div>
  )
}
