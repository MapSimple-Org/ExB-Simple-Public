import { BaseVersionManager } from 'jimu-core'
import type { Item, ItemsName } from './config'

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.10.0',
    description: 'allow users to reorder the media list, #6473',
    upgrader: (oldConfig) => {
      // default templates before 1.10
      const POPUP_MODE_DEFAULT_ITEMS = ['embed', 'qrcode', 'email', 'facebook', 'twitter', 'pinterest', 'linkedin']
      const INLINE_MODE_DEFAULT_ITEMS = ['facebook', 'twitter', 'pinterest', 'linkedin', 'embed', 'qrcode', 'email', 'sharelink']

      // updater
      function updateOldItems (itemsInOldConfig: ItemsName[], DEFAULT_ITEMS) {
        const newItems: Item[] = [] // Array<{id: ItemsName, enable: boolean}>

        DEFAULT_ITEMS.forEach((ITEM: ItemsName) => {
          const found = (itemsInOldConfig.findIndex((itemName: ItemsName) => (itemName === ITEM)) > -1)
          let enable = false
          if (found) {
            enable = true
          }

          newItems.push({ id: ITEM, enable: enable })
        })

        return newItems
      }

      // items upgrade
      // 1.popup
      oldConfig = oldConfig.setIn(['popup', 'items'], (updateOldItems(oldConfig.popup.items, POPUP_MODE_DEFAULT_ITEMS)))
      // 2.inline
      oldConfig = oldConfig.setIn(['inline', 'items'], (updateOldItems(oldConfig.inline.items, INLINE_MODE_DEFAULT_ITEMS)))

      return oldConfig
    }
  }, {
    version: '1.12.0',
    description: 'allow to change font color of the labels ,#13105',
    upgrader: (oldConfig) => {
      // inline
      oldConfig = oldConfig.setIn(['inline', 'design', 'labelColor'], 'var(--ref-palette-neutral-1200)') // font color of the labels ,#13105

      return oldConfig
    }
  }]
}

export const versionManager: BaseVersionManager = new VersionManager()
