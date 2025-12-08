import { React, type ImmutableObject, classNames, hooks } from 'jimu-core'
import { TextInput, defaultMessages as jimuUiDefaultMessage, Switch, CollapsableToggle } from 'jimu-ui'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import type { WebChartAxisScrollBar, CategoryFormatOptions, NumberFormatOptions, WebChartAxis, WebChartLabelBehavior } from 'jimu-ui/advanced/chart'
import defaultMessages from '../../../../../translations/default'
import { LabelFormatSetting, TextAlignment, TextAlignments } from '../../components'
import { styled } from 'jimu-theme'
import { ScrollbarSetting } from './scrollbar'
import { LabelBehavior } from './components'

const DisplayRangeSlider = true

export interface CategoryAxisProps {
  className?: string
  isHorizontal?: boolean
  labelBehavior: WebChartLabelBehavior
  axis: ImmutableObject<WebChartAxis>
  onChange?: (axis: ImmutableObject<WebChartAxis>) => void
  onLabelBehaviorChange?: (value: WebChartLabelBehavior, isHorizontal: boolean) => void
}

const Root = styled.div`
  .label-alignment .jimu-widget-setting--row-label {
    color: var(--ref-palette-neutral-900);
  }
`

export const CategoryAxis = (props: CategoryAxisProps): React.ReactElement => {
  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage)

  const { className, axis: propAxis, isHorizontal, labelBehavior: propLabelBehavior, onChange, onLabelBehaviorChange } = props
  const visible = propAxis.visible ?? true
  const titleText = propAxis.title.content?.text ?? ''
  const valueFormat = propAxis.valueFormat
  const showGrid = propAxis.grid?.width > 0
  const alignmentName = isHorizontal ? 'horizontalAlignment' : 'verticalAlignment'
  const alignments = TextAlignments[alignmentName]
  const alignment = propAxis?.labels.content[alignmentName] ?? alignments[2] as any
  const scrollbar = propAxis.scrollbar
  const labelBehavior = propLabelBehavior || (isHorizontal ? 'rotate' : 'wrap')

  const handleVisibleChange = (visible: boolean): void => {
    let axis = propAxis.set('visible', visible).setIn(['labels', 'visible'], visible)
    if (!visible) {
      axis = axis.setIn(['grid', 'width'], 0)
    }
    onChange?.(axis)
  }

  const handleTitleTextChange = (value: string): void => {
    onChange?.(
      propAxis.set(
        'title',
        propAxis.title.set('visible', value !== '').setIn(['content', 'text'], value)
      )
    )
  }

  const handleValueFormatChange = (value: ImmutableObject<CategoryFormatOptions> | ImmutableObject<NumberFormatOptions>): void => {
    onChange?.(propAxis.set('valueFormat', value))
  }

  const handleShowGridChange = (): void => {
    onChange?.(propAxis.setIn(['grid', 'width'], showGrid ? 0 : 1))
  }

  const handleScrollbarChange = (value: ImmutableObject<WebChartAxisScrollBar>): void => {
    onChange?.(propAxis.setIn(['scrollbar'], value))
  }

  const handleAlignmentChange = (alignment): void => {
    onChange?.(propAxis.setIn(['labels', 'content', alignmentName], alignment))
  }

  return (
    <Root className={classNames('category-axis w-100', className)} >
      <SettingRow label={translate('axisTitle')} flow='wrap' level={2}>
        <TextInput
          size='sm'
          aria-label={translate('axisTitle')}
          defaultValue={titleText}
          className='w-100'
          onAcceptValue={handleTitleTextChange}
        />
      </SettingRow>
      <CollapsableToggle
        role='group'
        level={2}
        className='mt-4'
        isOpen={visible}
        label={translate('axisLabel')}
        aria-label={translate('axisLabel')}
        onRequestOpen={() => { handleVisibleChange(true) }}
        onRequestClose={() => { handleVisibleChange(false) }}>
        <React.Fragment>
          <LabelFormatSetting
            className='mt-2'
            value={valueFormat as ImmutableObject<CategoryFormatOptions>}
            onChange={handleValueFormatChange}
          />
          <SettingRow
            truncateLabel={true}
            className='label-alignment w-100 mt-2'
            label={translate('alignment')}
            flow='no-wrap'
          >
            <TextAlignment
              aria-label={translate('alignment')}
              vertical={!isHorizontal}
              className='w-50'
              value={alignment}
              onChange={handleAlignmentChange}
            />
          </SettingRow>
          <SettingRow label={translate('behavior')} className='mt-2'>
            <LabelBehavior className='w-50' horizontal={isHorizontal} value={labelBehavior} onChange={onLabelBehaviorChange} />
          </SettingRow>
        </React.Fragment>
      </CollapsableToggle>
      <SettingRow tag='label' label={translate('axisGrid')} level={2} className='mt-4'>
        <Switch checked={showGrid} onChange={handleShowGridChange} />
      </SettingRow>
      {DisplayRangeSlider && <ScrollbarSetting className='mt-3' value={scrollbar} onChange={handleScrollbarChange} />}
    </Root>
  )
}
