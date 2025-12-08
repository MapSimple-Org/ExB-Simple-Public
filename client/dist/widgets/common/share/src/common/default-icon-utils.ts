/** @jsx jsx */
import { Immutable, type IMThemeVariables } from 'jimu-core'
import { IconSize } from '../config'

const shareIconImage = require('../assets/icons/share-icon-1.svg')
export const getDefaultIconConfig = (theme: IMThemeVariables) => {
  return Immutable({
    svg: shareIconImage,
    properties: {
      color: theme.ref.palette.neutral[700], //'#828282'
      size: IconSize.Small,
      inlineSvg: true
    }
  })
}
