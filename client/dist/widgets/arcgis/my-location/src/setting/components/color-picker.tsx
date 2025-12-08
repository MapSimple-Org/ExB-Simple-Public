import { React } from 'jimu-core'
import { styled } from 'jimu-theme'
import { ColorPicker as BasicColorPicker, type ColorPickerProps } from 'jimu-ui/basic/color-picker'

const Root = styled.div`
  position: relative;
  .mask {
    position: absolute;
    width: 100%;
    height: 100%;
  }
`

export const ColorPicker = React.forwardRef((props: ColorPickerProps, ref: React.Ref<HTMLDivElement>) => {
  const { disabled, ...others } = props
  return <Root ref={ref}>
    {disabled && <div className='mask'></div>}
    <BasicColorPicker {...others} />
  </Root>
})
