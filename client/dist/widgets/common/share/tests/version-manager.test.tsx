import { Immutable } from 'jimu-core'
import { versionManager } from '../src/version-manager'
import { UiMode, ItemsName } from '../src/config'

let upgrader = null
let upgrader112 = null

describe('Test allow users to reorder the media list, #6473', () => {
  beforeAll(() => {
    // eslint-disable-next-line @typescript-eslint/prefer-find
    upgrader = versionManager.versions?.filter(function (version) {
      return version.version === '1.10.0'
    })[0]?.upgrader

    // eslint-disable-next-line @typescript-eslint/prefer-find
    upgrader112 = versionManager.versions?.filter(function (version) {
      return version.version === '1.12.0'
    })[0]?.upgrader
  })

  // 1. all medias
  it('1.All media-items test', () => {
    const oldConfig = Immutable({
      uiMode: UiMode.Inline,
      popup: {
        icon: '',
        items: ['embed', 'qrcode', 'email', 'facebook', 'twitter', 'pinterest', 'linkedin'],
        tooltip: ''
      },
      inline: {
        items: ['facebook', 'twitter', 'pinterest', 'linkedin', 'embed', 'qrcode', 'email', 'sharelink'],
        design: {
          direction: 'HORIZONTAL',
          hideLabel: false,
          btnRad: 0,
          btnColor: '',
          iconColor: '',
          size: 'default'
        }
      }
    })

    const newConfig = upgrader(oldConfig)

    // popup
    expect(newConfig.popup.items).toStrictEqual([
      { id: ItemsName.Embed, enable: true },
      { id: ItemsName.QRcode, enable: true },
      { id: ItemsName.Email, enable: true },
      { id: ItemsName.Facebook, enable: true },
      { id: ItemsName.Twitter, enable: true },
      { id: ItemsName.Pinterest, enable: true },
      { id: ItemsName.Linkedin, enable: true }
    ])
    // inline
    expect(newConfig.inline.items).toStrictEqual([
      { id: ItemsName.Facebook, enable: true },
      { id: ItemsName.Twitter, enable: true },
      { id: ItemsName.Pinterest, enable: true },
      { id: ItemsName.Linkedin, enable: true },
      { id: ItemsName.Embed, enable: true },
      { id: ItemsName.QRcode, enable: true },
      { id: ItemsName.Email, enable: true },
      { id: ItemsName.Sharelink, enable: true }
    ])
  })

  // 2. part of medias
  it('2. part of media-items test', () => {
    const oldConfig = Immutable({
      uiMode: UiMode.Popup,
      popup: {
        icon: '',
        items: ['embed', /*'qrcode', 'email',*/ 'facebook'/*, 'twitter', 'pinterest', 'linkedin'*/],
        tooltip: ''
      },
      inline: {
        items: [/*'facebook', 'twitter', 'pinterest',*/'linkedin', /*'embed',*/ 'qrcode'/*, 'email', 'sharelink'*/],
        design: {
          direction: 'HORIZONTAL',
          hideLabel: false,
          btnRad: 0,
          btnColor: '',
          iconColor: '',
          size: 'default'
        }
      }
    })

    const newConfig = upgrader(oldConfig)

    // popup
    expect(newConfig.popup.items).toStrictEqual([
      { id: ItemsName.Embed, enable: true },
      { id: ItemsName.QRcode, enable: false },
      { id: ItemsName.Email, enable: false },
      { id: ItemsName.Facebook, enable: true },
      { id: ItemsName.Twitter, enable: false },
      { id: ItemsName.Pinterest, enable: false },
      { id: ItemsName.Linkedin, enable: false }
    ])
    // inline
    expect(newConfig.inline.items).toStrictEqual([
      { id: ItemsName.Facebook, enable: false },
      { id: ItemsName.Twitter, enable: false },
      { id: ItemsName.Pinterest, enable: false },
      { id: ItemsName.Linkedin, enable: true },
      { id: ItemsName.Embed, enable: false },
      { id: ItemsName.QRcode, enable: true },
      { id: ItemsName.Email, enable: false },
      { id: ItemsName.Sharelink, enable: false }
    ])
  })

  // 3. empty medias
  it('3. empty media-items test', () => {
    const oldConfig = Immutable({
      uiMode: UiMode.Popup,
      popup: {
        icon: '',
        items: [/*'embed', 'qrcode', 'email', 'facebook', 'twitter', 'pinterest', 'linkedin'*/],
        tooltip: ''
      },
      inline: {
        items: [/*'facebook', 'twitter', 'pinterest','linkedin', 'embed', 'qrcode', 'email', 'sharelink'*/],
        design: {
          direction: 'HORIZONTAL',
          hideLabel: false,
          btnRad: 0,
          btnColor: '',
          iconColor: '',
          size: 'default'
        }
      }
    })

    const newConfig = upgrader(oldConfig)

    // popup
    expect(newConfig.popup.items).toStrictEqual([
      { id: ItemsName.Embed, enable: false },
      { id: ItemsName.QRcode, enable: false },
      { id: ItemsName.Email, enable: false },
      { id: ItemsName.Facebook, enable: false },
      { id: ItemsName.Twitter, enable: false },
      { id: ItemsName.Pinterest, enable: false },
      { id: ItemsName.Linkedin, enable: false }
    ])
    // inline
    expect(newConfig.inline.items).toStrictEqual([
      { id: ItemsName.Facebook, enable: false },
      { id: ItemsName.Twitter, enable: false },
      { id: ItemsName.Pinterest, enable: false },
      { id: ItemsName.Linkedin, enable: false },
      { id: ItemsName.Embed, enable: false },
      { id: ItemsName.QRcode, enable: false },
      { id: ItemsName.Email, enable: false },
      { id: ItemsName.Sharelink, enable: false }
    ])
  })

  // 5. allow to change font color of the labels
  it('4. allow to change font color of the labels ,#13105', () => {
    const oldConfig = Immutable({
      uiMode: 'POPUP',
      popup: {
        icon: '',
        items: [
          { id: 'embed', enable: true },
          { id: 'qrcode', enable: true },
          { id: 'email', enable: true },
          { id: 'facebook', enable: true },
          { id: 'twitter', enable: true },
          { id: 'pinterest', enable: true },
          { id: 'linkedin', enable: true }
        ],
        tooltip: ''
      },
      inline: {
        items: [
          { id: 'facebook', enable: true },
          { id: 'twitter', enable: true },
          { id: 'pinterest', enable: true },
          { id: 'linkedin', enable: true },
          { id: 'embed', enable: true },
          { id: 'qrcode', enable: true },
          { id: 'email', enable: true },
          { id: 'sharelink', enable: true }
        ],
        design: {
          direction: 'HORIZONTAL',
          hideLabel: true,
          btnRad: 0,
          btnColor: '',
          iconColor: '',
          size: 'default'
          //labelColor": "var(--dark)"
        }
      }
    })

    const newConfig = upgrader112(oldConfig)

    // inline
    expect(newConfig.inline.design.labelColor).toStrictEqual('var(--ref-palette-neutral-1200)')

    expect(newConfig.inline.design.hideLabel).toStrictEqual(true)
    expect(newConfig.inline.design.btnColor).toStrictEqual('')
  })
})
