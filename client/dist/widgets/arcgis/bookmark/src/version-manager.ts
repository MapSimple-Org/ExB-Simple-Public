import type { IMConfig } from './config'
import { BaseVersionManager, loadArcGISJSAPIModules } from 'jimu-core'

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.2.0',
    description: '1.2.0',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig
      if (!newConfig.bookmarks) {
        return newConfig
      }

      newConfig.bookmarks.forEach((bookMark, i) => {
        const layerIds = Object.keys(bookMark.layersConfig || {})
        layerIds.forEach(layerId => {
          const visibility = bookMark.layersConfig[layerId]
          newConfig = newConfig.setIn(['bookmarks', i, 'layersConfig', layerId], { visibility })
        })
      })

      return newConfig
    }
  }, {
    version: '1.18.0',
    description: 'support draw #23418',
    upgrader: async (oldConfig: IMConfig) => {
      //Bookmarks of 2D map and draw graphics, geometry hasZ needs change to false.
      if (!oldConfig.bookmarks) {
        return oldConfig
      }

      const newBookmarksPromise = oldConfig.bookmarks.map(async (bookmark) => {
        if (bookmark.type === '2d' && bookmark.graphics.length > 0) {
          const [Graphic] = await loadArcGISJSAPIModules(['esri/Graphic'])
          const oldGraphicsJson = bookmark.graphics
          const newGraphicsJson = []
          oldGraphicsJson.forEach(oldGraphicJson => {
            const oldGraphic = Graphic.fromJSON(oldGraphicJson)
            if (oldGraphic?.geometry?.hasZ) {
              oldGraphic.geometry.hasZ = false
            }
            newGraphicsJson.push(oldGraphic.toJSON())
          })
          bookmark = bookmark.set('graphics', newGraphicsJson)
        }
        return bookmark
      })

      const newBookmarksConfig = await Promise.all(newBookmarksPromise)
      return oldConfig.set('bookmarks', newBookmarksConfig)
    }
  }]
}

export const versionManager: BaseVersionManager = new VersionManager()
