import { type WebMapFrameSize, MapFrameUnit as Unit } from '../config'

interface DPI {
  XDPI: number
  YDPI: number
}

export function convertToPxSize (value: number[], unit: Unit, dpi: number): WebMapFrameSize {
  switch (unit) {
    case Unit.Centimeter:
      return {
        width: cm2px(value[0], true, dpi),
        height: cm2px(value[1], false, dpi)
      }
    case Unit.Inch:
      return {
        width: in2px(value[0], true, dpi),
        height: in2px(value[1], false, dpi)
      }
    case Unit.Millimeter:
      return {
        width: mm2px(value[0], true, dpi),
        height: mm2px(value[1], false, dpi)
      }
    case Unit.Point:
      return {
        width: point2px(value[0], true, dpi),
        height: point2px(value[1], false, dpi)
      }
  }
}

export function convertToMeters (value: number[], unit: Unit): WebMapFrameSize {
  switch (unit) {
    case Unit.Centimeter:
      return {
        width: value[0] * 0.01,
        height: value[1] * 0.01
      }
    case Unit.Inch:
      return {
        width: value[0] * 0.0254,
        height: value[1] * 0.0254
      }
    case Unit.Millimeter:
      return {
        width: 1609.344,
        height: 1609.344
      }
    case Unit.Point:
      return {
        width: value[0] * 0.0254 * 1 / 72,
        height: value[1] * 0.0254 * 1 / 72
      }
  }
}

export function px2cm (pxValue: number, isX: boolean, extDip?: number): number {
  const DPI = getDpi(extDip)
  const dpi = isX ? DPI.XDPI : DPI.YDPI
  const cm = pxValue / dpi * 2.54
  return cm
}

export function px2meter (pxValue: number, isX: boolean, extDip?: number): number {
  const DPI = getDpi(extDip)
  const dpi = isX ? DPI.XDPI : DPI.YDPI
  const cm = pxValue / dpi * 2.54
  return cm / 100
}

export function px2in (pxValue: number, isX: boolean, extDip?: number): number {
  const DPI = getDpi(extDip)
  const dpi = isX ? DPI.XDPI : DPI.YDPI
  const inch = pxValue / dpi
  return inch
}

export function px2mm (pxValue: number, isX: boolean, extDip?: number): number {
  const DPI = getDpi(extDip)
  const dpi = isX ? DPI.XDPI : DPI.YDPI
  const mm = pxValue / dpi * 2.54 / 10
  return mm
}

export function px2point (pxValue: number, isX: boolean, extDip?: number): number {
  const DPI = getDpi(extDip)
  const dpi = isX ? DPI.XDPI : DPI.YDPI
  const pt = pxValue / dpi / 10 / 0.376 * 2.54
  return pt
}

export function cm2px (cmValue: number, isX: boolean, extDip?: number): number {
  const DPI = getDpi(extDip)
  const dpi = isX ? DPI.XDPI : DPI.YDPI
  const px = cmValue / 2.54 * dpi
  return px
}

export function in2px (inValue: number, isX: boolean, extDip?: number): number {
  const DPI = getDpi(extDip)
  const dpi = isX ? DPI.XDPI : DPI.YDPI
  const px = inValue * dpi
  return px
}

export function mm2px (mmValue: number, isX: boolean, extDip?: number): number {
  const DPI = getDpi(extDip)
  const dpi = isX ? DPI.XDPI : DPI.YDPI
  const px = mmValue / 2.54 * dpi * 10
  return px
}

export function point2px (pointValue: number, isX: boolean, extDip?: number): number {
  const DPI = getDpi(extDip)
  const dpi = isX ? DPI.XDPI : DPI.YDPI
  const mm = pointValue * 0.376
  const px = mm / 2.54 * dpi * 10
  return px
}

export function getDPIByInch (): DPI {
  const DPI = {
    XDPI: null,
    YDPI: null
  } as DPI
  const screen = window.screen as any
  if (screen?.XDPI) {
    DPI.XDPI = screen?.deviceXDPI
    DPI.YDPI = screen?.deviceYDPI
  } else {
    const tmpNode = document.createElement('div')
    tmpNode.style.cssText = 'width:1in;height:1in;position:absolute;left:0px;top:0px;z-index:99;visibility:hidden'
    document.body.appendChild(tmpNode)
    DPI.XDPI = tmpNode.offsetWidth
    DPI.YDPI = tmpNode.offsetHeight
    tmpNode.parentNode.removeChild(tmpNode)
  }
  return DPI
}

function getDpi (dpi?: number): DPI {
  if (dpi) {
    return {
      XDPI: dpi,
      YDPI: dpi
    }
  } else {
    return getDPIByInch()
  }
}
