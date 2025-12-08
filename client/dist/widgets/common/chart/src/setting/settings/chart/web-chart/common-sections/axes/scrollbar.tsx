import { React, type ImmutableObject, classNames, hooks, Immutable } from 'jimu-core'
import { defaultMessages as jimuUiDefaultMessage, CollapsableToggle, NumericInput } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import type { WebChartAxisScrollBar } from 'jimu-ui/advanced/chart'
import defaultMessages from '../../../../../translations/default'
import { getAxisScrollbar } from '../../../../../../utils/default'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { useTheme2 } from 'jimu-theme'

export interface ScrollbarSettingProps {
  className?: string
  value: ImmutableObject<WebChartAxisScrollBar>
  onChange: (value: ImmutableObject<WebChartAxisScrollBar>) => void
}

const DefaultScrollbar = Immutable(getAxisScrollbar())

export const ScrollbarSetting = (props: ScrollbarSettingProps): React.ReactElement => {
  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage)
  const appTheme = useTheme2()

  const { className, value: propValue = DefaultScrollbar, onChange } = props

  const handleScrollbarVisibleChange = (scrollbarVisible: boolean): void => {
    const value = propValue.set('visible', scrollbarVisible)
    onChange(value)
  }

  const handleScrollbarWidthChange = (val: string | number, evt): void => {
    if (val === null && evt.target.value !== '') {
      return
    }
    const width = Math.floor(+val)
    const gripSize = width * 2
    const value = propValue.set('width', width).set('gripSize', gripSize)
    onChange(value)
  }

  const handleScrollbarColorChange = (val: string): void => {
    const color = val || DefaultScrollbar.color
    const value = propValue.set('color', color)
    onChange(value)
  }

  return (
    <CollapsableToggle
      level={2}
      className={classNames('scrollbar-setting', className)}
      isOpen={propValue.visible}
      label={translate('displayRangeSlider')}
      aria-label={translate('displayRangeSlider')}
      onRequestOpen={() => { handleScrollbarVisibleChange(true) }}
      onRequestClose={() => { handleScrollbarVisibleChange(false) }}>
      <SettingRow label={translate('sliderColor')} level={3} className='mt-2'>
        <ThemeColorPicker
          aria-label={translate('sliderColor')}
          specificTheme={appTheme}
          value={propValue.color as any}
          onChange={handleScrollbarColorChange} />
      </SettingRow>
      <SettingRow label={translate('size')} level={3} className='mt-2'>
        <NumericInput
          size='sm'
          min={1}
          max={30}
          step={1}
          className='w-input-sm'
          showHandlers={false}
          defaultValue={propValue.width}
          required={true}
          title={translate('start')}
          placeholder={translate('start')}
          onAcceptValue={handleScrollbarWidthChange}
        />
      </SettingRow>
    </CollapsableToggle>
  )
}
