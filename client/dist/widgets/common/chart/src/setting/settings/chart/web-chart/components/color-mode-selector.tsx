import { React, classNames, hooks } from 'jimu-core'
import { Button, Select, Tooltip, defaultMessages as jimuUiDefaultMessage } from 'jimu-ui'
import defaultMessages from '../../../../translations/default'
import { styled } from 'jimu-theme'
import { WarningOutlined } from 'jimu-icons/outlined/suggested/warning'

interface ColorModeSelectorProps {
  className?: string
  value?: boolean
  allowed?: boolean
  'aria-label'?: string
  onChange?: (value: boolean) => void
}

const Root = styled('div')({
  position: 'relative',
  '.jimu-button-color-warning': {
    position: 'absolute',
    right: '16px'
  }
})

const StyledTooltip = styled(Tooltip)({
  width: '295px'
})

export const ColorModeSelector = (props: ColorModeSelectorProps): React.ReactElement => {
  const { className, 'aria-label': ariaLabel, allowed, value = true, onChange } = props

  const colorMode = value ? 'useLayerColor' : 'customColor'
  const [updating, setUpdating] = React.useState(false)
  const visibility = (!allowed && allowed != null) && (colorMode === 'useLayerColor') && !updating

  React.useEffect(() => {
    setUpdating(false)
  }, [allowed])

  const translate = hooks.useTranslation(defaultMessages, jimuUiDefaultMessage)

  const handleChange = (evt: React.MouseEvent<HTMLSelectElement>) => {
    const colorMode = evt.currentTarget.value
    onChange?.(colorMode === 'useLayerColor')
    setUpdating(true)
  }

  return (
    <Root className={classNames(className, 'color-mode-selector d-flex align-items-center')}>
      <Select
        size='sm'
        aria-label={ariaLabel}
        value={colorMode}
        onChange={handleChange}
      >
        <option value='useLayerColor'>
          {translate('useLayerColor')}
        </option>
        <option value='customColor'>
          {translate('customColor')}
        </option>
      </Select>
      {visibility && <StyledTooltip placement='top-end' enterDelay={200} leaveDelay={500} interactive={true} title={translate('useLayerColorWarning')}>
        <Button className='warning-button' variant='text' color='warning' icon disableHoverEffect={true} disableRipple={true}>
          <WarningOutlined />
        </Button>
      </StyledTooltip>}
    </Root>
  )
}
