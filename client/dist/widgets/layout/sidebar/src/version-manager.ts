import { BaseVersionManager } from 'jimu-core'

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.8.0',
    description: 'Online 10.1.',
    upgrader: (oldConfig) => {
      let newConfig = oldConfig

      // in previous version, although the toggle button is not configuable, but the colors are saved in config, but the saved value is not correct.
      newConfig = newConfig.setIn(['toggleBtn', 'color', 'normal', 'icon', 'color'], 'var(--ref-palette-neutral-1100)')

      newConfig = newConfig.setIn(['toggleBtn', 'color', 'normal', 'bg', 'color'], 'var(--ref-palette-neutral-200)')
      newConfig = newConfig.setIn(['toggleBtn', 'color', 'hover', 'bg', 'color'], 'var(--ref-palette-neutral-300)')
      newConfig = newConfig.setIn(['toggleBtn', 'border'], {
        type: 'solid',
        color: 'var(--ref-palette-neutral-500)',
        width: '1px'
      })

      return newConfig
    }
  }]
}

export const versionManager: BaseVersionManager = new VersionManager()
