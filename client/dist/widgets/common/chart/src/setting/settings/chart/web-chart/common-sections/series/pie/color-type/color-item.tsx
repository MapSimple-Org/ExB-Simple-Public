/**@jsx jsx */
import { React, jsx, css, classNames, type ImmutableObject, Immutable, hooks } from 'jimu-core'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { convertStripColors } from '../utils'
import { Button, defaultMessages } from 'jimu-ui'
import { getTheme2 } from 'jimu-theme'
import { SeriesColors } from '../../../../../../../../utils/default'
import { MinusCircleOutlined } from 'jimu-icons/outlined/editor/minus-circle'
import type { WebChartPieChartSlice } from 'jimu-ui/advanced/chart'
import { EditableText } from '../../../../components'

interface ColorItemProps {
  className?: string
  editable?: boolean
  value: ImmutableObject<WebChartPieChartSlice>
  onChange?: (value: ImmutableObject<WebChartPieChartSlice>) => void
  deletable?: boolean
  onDelete?: (sliceId: string) => void
}

const presetSeriesColors = convertStripColors(SeriesColors)

const style = css`
  display: flex;
  width: 100%;
  justify-content: space-between;
  .editor-text-color {
    width: 88%;
    flex-grow: 1;
    display: inline-flex;
    justify-content: space-between;
    .label {
      max-width: 70%;
    }
  }
`
const defaultValue = Immutable({}) as ImmutableObject<WebChartPieChartSlice>
export const ColorItem = (props: ColorItemProps): React.ReactElement => {
  const { className, editable = true, value: propValue = defaultValue, onChange, deletable, onDelete } = props
  const label = propValue.label ?? propValue.sliceId
  const color = propValue.fillSymbol?.color as any

  const appTheme = getTheme2()
  const translate = hooks.useTranslation(defaultMessages)

  const handleColorChange = (color: string) => {
    const value = propValue.setIn(['fillSymbol', 'color'], color)
    onChange?.(value)
  }

  const handleLabelChange = (label: string) => {
    const value = propValue.set('label', label)
    onChange?.(value)
  }

  const handleDeleteClick = () => {
    onDelete?.(propValue.sliceId)
  }

  return (
    <div css={style} className={classNames('color-item', className)}>
      <div className='editor-text-color'>
        <EditableText className='label text-truncate' editable={editable} value={label} onChange={handleLabelChange}></EditableText>
        <ThemeColorPicker aria-label={label} disableReset disableAlpha={!deletable} specificTheme={appTheme} presetColors={presetSeriesColors} value={color} onChange={handleColorChange} />
      </div>
      {
        deletable && <Button aria-label={translate('remove')} title={translate('remove')} type='tertiary' icon size='sm' onClick={handleDeleteClick}><MinusCircleOutlined size='m' /></Button>
      }
    </div>
  )
}
