import { React, classNames } from 'jimu-core'
import type { SVGComponentProps } from 'jimu-ui'
import src from '../../svg/outlined/brand/widget-card.svg'
import srcRTL from '../../svg/outlined/brand/widget-card--rtl.svg'

export const WidgetCardOutlined = (props: SVGComponentProps) => {
  const SVG = window.SVG
  const { className, ...others } = props

  const classes = classNames('jimu-icon jimu-icon-component has-rtl-svg', className)
  if (!SVG) return <svg className={classes} {...others as any} />
  return <SVG className={classes} src={src} srcRTL={srcRTL} {...others} />
}
