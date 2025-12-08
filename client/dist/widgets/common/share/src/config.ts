// import { ImageParam } from 'jimu-ui';
import type { ImmutableObject, IMIconResult } from 'jimu-core'

export enum UiMode {
  Popup = 'POPUP',
  Inline = 'INLINE',
  // Slide = 'SLIDE'
}

export enum InlineDirection {
  Horizontal = 'HORIZONTAL',
  Vertical = 'VERTICAL'
}

// popup mode
export enum BtnIconSize {
  Small = 'sm',
  Medium = 'default',
  Large = 'lg',
}

// inline mode
export enum IconColorMode {
  Default = 'default',
  White = 'white',
  Black = 'black'
}
export enum IconSize {
  Small = 16, // 'sm',
  Medium = 24, // 'default',
  Large = 32// 'lg',
}
export enum IconRadius {
  Rad00 = 0,
  // eslint-disable-next-line @typescript-eslint/no-mixed-enums
  Rad20 = '5px',
  Rad50 = '50%',
}

// items
export enum ItemsName {
  Embed = 'embed',
  QRcode = 'qrcode',
  Sharelink = 'sharelink',
  Email = 'email',
  Facebook = 'facebook',
  Twitter = 'twitter',
  Pinterest = 'pinterest',
  Linkedin = 'linkedin'
}
export const BackableList = [ItemsName.Embed, ItemsName.QRcode, ItemsName.Sharelink]
// 10.3: allow users to reorder the media list in the setting ,#6473
export interface Item {
  id: ItemsName
  enable: boolean
}
/* customize email content */
export interface emailContent {
  isCustomize?: boolean
  content?: string
}

/* widget config */
export interface ShareConfig {
  uiMode: UiMode
  // imgSrc: string;
  // imageParam?: ImmutableObject<ImageParam>;
  popup: {
    icon: IMIconResult | ''
    items: Item[]
    tooltip: string
  }
  inline: {
    items: Item[]
    design: {
      direction: InlineDirection
      btnRad: IconRadius
      hideLabel: boolean
      btnColor: string
      iconColor: IconColorMode
      size: IconSize
      // numOfDisplay: number
      labelColor: string
    }
  },
  emailContent?: emailContent

  // slide: {
  //   items: string[];
  // }
}

/* short link errorInfo */
export enum ErrorInfo {
  UrlIsTooLong = 'urlIsTooLong',
  NetworkFailed = 'networkFailed'
}

export type IMConfig = ImmutableObject<ShareConfig>
