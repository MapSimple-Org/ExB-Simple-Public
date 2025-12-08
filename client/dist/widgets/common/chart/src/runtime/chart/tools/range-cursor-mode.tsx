import { React, classNames, hooks } from 'jimu-core'
import { ZoomInOutlined } from 'jimu-icons/outlined/editor/zoom-in'
import { ButtonGroup, Button, defaultMessages, Tooltip } from 'jimu-ui'
import { SelectRectangleOutlined } from 'jimu-icons/outlined/gis/select-rectangle'
import type { ChartTypes } from 'jimu-ui/advanced/chart'
import { isXYChart } from '../../../utils/default'

export type RangeCursorModeValue = 'selection' | 'zoom'

export interface RangeCursorModeProps {
  type: ChartTypes
  className?: string
  onChange: (mode?: RangeCursorModeValue) => void
}

export const RangeCursorMode = (props: RangeCursorModeProps): React.ReactElement => {
  const translate = hooks.useTranslation(defaultMessages)
  const [mode, setMode] = React.useState<RangeCursorModeValue>('selection')

  const { type = 'barSeries', className, onChange } = props

  const handleSelectionClick = () => {
    if (type === 'pieSeries') return

    onChange('selection')
    setMode('selection')
  }

  const handleZoomClick = () => {
    onChange('zoom')
    setMode('zoom')
  }

  return <ButtonGroup variant='text' className={classNames('range-cursor-mode', className)}>
    <Tooltip title={translate('SelectLabel')}>
      <Button
        size='sm'
        className="mr-1"
        icon
        aria-label={translate('SelectLabel')}
        onClick={handleSelectionClick}
        aria-pressed={mode === 'selection'}
        color={mode === 'selection' ? 'primary' : 'inherit'}
        variant={mode === 'selection' ? 'contained' : 'text'}
      >
        <SelectRectangleOutlined />
      </Button>
    </Tooltip>
    {isXYChart(type) && <Tooltip title={translate('ZoomLabel')}>
      <Button
        size='sm'
        icon
        aria-label={translate('ZoomLabel')}
        onClick={handleZoomClick}
        aria-pressed={mode === 'zoom'}
        color={mode === 'zoom' ? 'primary' : 'inherit'}
        variant={mode === 'zoom' ? 'contained' : 'text'}
      >
        <ZoomInOutlined />
      </Button>
    </Tooltip>}
  </ButtonGroup>
}
