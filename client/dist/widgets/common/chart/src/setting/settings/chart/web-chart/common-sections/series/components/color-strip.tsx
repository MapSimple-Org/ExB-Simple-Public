/**@jsx jsx */
import { React, jsx, css, classNames } from 'jimu-core'

interface ColorStripProps {
  className?: string
  colors?: string[]
  onChange?: (colors: string[]) => void
}

const style = css`
  display: flex;
  width: 100%;
  > .color-item {
    width: 30px;
    height: 16px;
  }
`

export const ColorStrip = (props: ColorStripProps): React.ReactElement => {
  const { className, colors, onChange } = props
  return (
    <div css={style} className={classNames('color-strip', className)} onClick={() => { onChange?.(colors) }}>
      {
        colors.map((color, index) => {
          return <div className='color-item' key={index} style={{ backgroundColor: color }}></div>
        })
      }
    </div>
  )
}
