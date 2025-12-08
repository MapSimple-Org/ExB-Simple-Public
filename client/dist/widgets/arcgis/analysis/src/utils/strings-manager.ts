import type { LocaleItem } from '@arcgis/analysis-ui-schema'

export async function fetchStrings (path: string) {
  const response = await fetch(path)
  const results = await response.json()
  return results as LocaleItem
}

export class StringsManager {
  static instance: StringsManager
  private cache: { [key: string]: LocaleItem } = {}

  static getInstance () {
    if (!StringsManager.instance) {
      StringsManager.instance = new StringsManager()
    }

    return StringsManager.instance
  }

  async getStrings (path: string) {
    if (this.cache[path]) {
      return this.cache[path]
    }
    return fetchStrings(path).then((strings) => {
      this.cache[path] = strings
      return strings
    })
  }
}
