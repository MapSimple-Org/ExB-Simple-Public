import { React } from 'jimu-core'
import { ThemeColorPicker } from 'jimu-ui/basic/color-picker'
import { FontStyle } from 'jimu-ui/advanced/style-setting-components'
import { useTheme2 } from 'jimu-theme'
import textIcon from 'jimu-icons/svg/outlined/editor/uppercase.svg'

interface FontSettingProps {
  bold: boolean
  italic: boolean
  underline: boolean
  strike: boolean
  color: string
  'aria-label'?: string
  onChange: (key: string, value: any) => void
}

export const FontSetting = (props: FontSettingProps) => {
  const { bold, italic, underline, strike, color, onChange } = props
  const theme = useTheme2()

  return (<div className='font-setting d-flex align-items-center' role='group' aria-label={props['aria-label']}>
    <FontStyle
      bold={bold}
      italic={italic}
      underline={underline}
      strike={strike}
      applyDefaultValue={false}
      className='mr-1'
      onChange={onChange}
    />
    <ThemeColorPicker
      className='jimu-outline-inside'
      icon={textIcon}
      type='with-icon'
      specificTheme={theme}
      value={color}
      onChange={(value) => { onChange('color', value) }}
    />
  </div>)
}
