/** @jsx jsx */
import { QueryArrangeType } from '../config'
import iconClose from 'jimu-icons/svg/outlined/editor/close.svg'
import iconAdd from 'jimu-icons/svg/outlined/editor/plus.svg'
import iconSetting from 'jimu-icons/svg/outlined/application/setting.svg'
import arrowDown from 'jimu-icons/svg/outlined/directional/down.svg'
import arrowUp from 'jimu-icons/svg/outlined/directional/up.svg'
import arrowLeft from 'jimu-icons/svg/outlined/directional/arrow-left.svg'
import arrowRight from 'jimu-icons/svg/outlined/directional/right.svg'
import iconEmpty from 'jimu-icons/svg/outlined/application/click.svg'

export type ValueManSetByKeyType = [string, any, { [optionKey: string]: any }?] // represents: [key, value, options]
export type ValueManSetByIndexType = [number, any, { [optionKey: string]: any }?] // represents: [index, value, options]

export interface ValueManType {
  getByIndex: (index: number) => any
  setByIndices: (...indexValuePairs: ValueManSetByIndexType[]) => void
}

const iconMap = {
  iconQuery: require('../../icon.svg'),
  iconTipBulb: require('./assets/icons/tip-bulb.svg'),
  iconClose,
  iconAdd,
  iconSetting,
  arrowDown,
  arrowUp,
  arrowLeft,
  arrowRight,
  iconEmpty
}

export const widgetSettingDataMap = {
  iconMap,
  iconPropMap: {
    defaultIconResult: {
      svg: iconMap.iconQuery,
      properties: {
        color: '',
        filename: 'filter-16.svg',
        originalName: 'filter-16.svg',
        inlineSvg: true,
        path: ['general', 'filter'],
        size: 14
      }
    }
  },
  arrangementStyleMap: {
    [QueryArrangeType.Block]: {
      getTitle: (getI18nMessage) => getI18nMessage('vertical'),
      icon: require('./assets/arrange-vertical.svg')
    },
    [QueryArrangeType.Inline]: {
      getTitle: (getI18nMessage) => getI18nMessage('horizontal'),
      icon: require('./assets/arrange-horizontal.svg')
    },
    [QueryArrangeType.Popper]: {
      getTitle: (getI18nMessage) => getI18nMessage('icon'),
      icon: require('./assets/arrange-icon.svg')
    }
  }
}
