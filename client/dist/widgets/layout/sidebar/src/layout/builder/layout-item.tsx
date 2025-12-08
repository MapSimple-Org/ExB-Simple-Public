/** @jsx jsx */
import { React, jsx, css, classNames, type IMSizeModeLayoutJson } from 'jimu-core'
import { LayoutEntry } from 'jimu-layouts/layout-builder'
import { styleUtils } from 'jimu-ui'

interface Props {
  collapsed?: boolean
  itemStyle?: any
  innerLayouts: IMSizeModeLayoutJson
  style?: any
  className?: string
}

export class SidebarLayoutItem extends React.PureComponent<Props> {
  render (): React.JSX.Element {
    const { style, className, innerLayouts, itemStyle, collapsed } = this.props
    // const layoutSetting = this.props.setting || {};
    return (
      <div
        className={classNames('side', className, { 'd-flex': !collapsed, 'd-none': collapsed })}
        style={{
          ...style,
          ...styleUtils.toCSSStyle(itemStyle),
          overflow: 'auto'
        }}
        css={css`
          .exb-drop-area {
            pointer-events: ${collapsed ? 'none !important' : 'inherit'}
          }
        `}
      >
        <LayoutEntry className='border-0' layouts={innerLayouts} isInWidget ignoreMinHeight />
      </div>
    )
  }
}
