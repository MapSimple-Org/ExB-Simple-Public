import { React, css, focusElementInKeyboardMode, type IMThemeVariables, type IntlShape } from 'jimu-core'
import type { IMConfig, UiMode, ItemsName } from '../../../config'

export enum ExpandType {
  BtnRedirect,
  ShowInPopup
}
/* share items */
export enum ShownMode {
  Btn,
  Content
}

export interface BaseItemConstraint {
  uiMode: UiMode

  sharedUrl: string

  isShowInModal: boolean // for btn shadow
  shownMode: ShownMode

  isShowing: boolean

  getAppTitle: () => string
  onItemClick: (name: ItemsName, ref: React.RefObject<any>, type: ExpandType, isUpdateUrl?: boolean) => void

  // jimu-builder
  intl: IntlShape
  theme: IMThemeVariables
  config: IMConfig

  // a11y
  a11yFocusElement?: any
}


/* eslint-disable react/no-unused-class-component-methods */
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
export default abstract class BaseItem<Props = unknown, State = unknown> extends React.PureComponent<BaseItemConstraint & Props, State> {
  abstract onClick (ref): void

  openInNewTab (url: string): void {
    const win = window.open(url, '_blank')
    focusElementInKeyboardMode(win, true)
  }

  // Messages
  getAppTitle (): string {
    return this.props.getAppTitle()
  }

  getMsgBy (): string {
    return ' by ArcGIS Experience Builder'
  }

  // styles
  getCommonStyle = () => {
    const borderColor = this.props.theme.sys.color.divider.secondary

    return css`
      .separator-line {
        border-top: 1px solid ${borderColor};
        margin-bottom: 1rem;
      }
    `
  }
}
/* eslint-enable react/no-unused-class-component-methods */
