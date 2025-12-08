/** @jsx jsx */
import { React, jsx, css, classNames, polished } from 'jimu-core'
import { useTheme, useTheme2, useUseTheme2 } from 'jimu-theme'

interface NavQuickStyleItemProps {
  title?: string
  children: any
  selected?: boolean
  onClick?: (evt?: React.MouseEvent<HTMLDivElement>) => void
}

const useStyle = () => {
  const theme = useTheme()
  const theme2 = useTheme2()
  const isUseTheme2 = useUseTheme2()
  const appTheme = window.jimuConfig.isBuilder !== isUseTheme2 ? theme2 : theme
  const builderTheme = window.jimuConfig.isBuilder !== isUseTheme2 ? theme : theme2
  const selectedColor = builderTheme.sys.color.primary.light
  const surfaceBg = appTheme ? appTheme.sys.color.surface.background : 'transparent'
  const surfaceBgText = appTheme ? appTheme.sys.color.surface.backgroundText : 'inherit'

  return React.useMemo(() => {
    return css`
      width: 100%;
      height:  ${polished.rem(50)};
      padding: ${polished.rem(8)}  ${polished.rem(12)};
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: ${surfaceBg};
      position: relative;
      color: ${surfaceBgText};
      &.selected {
        outline: 3px solid ${selectedColor};
      }
      >.overlay {
        z-index: 1;
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        cursor: pointer;
      }
  `
  }, [selectedColor, surfaceBg, surfaceBgText])
}

export const NavQuickStyleItem = (props: NavQuickStyleItemProps) => {
  const { title, children, selected, onClick } = props
  const style = useStyle()

  return (
    <div
      css={style}
      title={title}
      className={classNames('quick-style-item', { selected })}
      onClick={onClick}
    >
      <div className='overlay' />
      {children}
    </div>
  )
}
