import { Immutable } from 'jimu-core'
import { versionManager } from '../src/version-manager'

let upgrader = null

describe('Version manager test', () => {
  describe('version 1.13.0', () => {
    beforeAll(() => {
      // eslint-disable-next-line @typescript-eslint/prefer-find
      upgrader = versionManager.versions?.filter(function (version) {
        return version.version === '1.13.0'
      })[0]?.upgrader
    })
    it('should upgrade the line-height: normal to line-height: 1.5', () => {
      const oldConfig = Immutable({
        text: '<p style="color: #000;line-height: normal;"><strong style="color: rgb(255, 255, 255); font-size: 14px;">foo</strong></p><p style="color: #000;line-height: 1.5;"><strong style="color: rgb(255, 255, 255); font-size: 14px;">foo</strong></p>'
      })
      const newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        text: '<p style="color: #000;line-height: 1.2;"><strong style="color: rgb(255, 255, 255); font-size: 14px;">foo</strong></p><p style="color: #000;line-height: 1.5;"><strong style="color: rgb(255, 255, 255); font-size: 14px;">foo</strong></p>'
      })
    })
  })
})
