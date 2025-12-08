import { Immutable, type extensionSpec, type IMAppConfig, type ImmutableArray } from 'jimu-core'
import defaultMessages from '../setting/translations/default'
import { type Bookmark, type IMConfig, TemplateType } from '../config'

export default class BuilderOperations implements extensionSpec.BuilderOperationsExtension {
  id = 'bookmark-builder-operation'
  widgetId: string
  slideTypes = [TemplateType.Slide1, TemplateType.Slide2, TemplateType.Slide3]

  getTranslationKey(appConfig: IMAppConfig): Promise<extensionSpec.TranslationKey[]> {
    const config = appConfig.widgets[this.widgetId].config as IMConfig
    const { bookmarks = Immutable([]) as ImmutableArray<Bookmark>, templateType } = config
    const keys: extensionSpec.TranslationKey[] = []
    const isSlideTypes = this.slideTypes.includes(templateType)
    const bookmarksKeys = getKeysInBookmarks(bookmarks, `widgets.${this.widgetId}.config`, isSlideTypes)
    bookmarksKeys.length > 0 && keys.push(...bookmarksKeys)
    return Promise.resolve(keys)
  }
}

export function getKeysInBookmarks (bookmarks: ImmutableArray<Bookmark> = Immutable([]), path: string, isSlideTypes: boolean) {
  const keys: extensionSpec.TranslationKey[] = []
  bookmarks.forEach((bookmark, sysIndex) => {
    const bookmarkName = bookmark.name
    const bookmarkPath = `${path}.bookmarks[${sysIndex}]`
    keys.push({
      keyType: 'value',
      key: `${bookmarkPath}.name`,
      label: {
        key: 'bookmarkLabel',
        enLabel: defaultMessages.bookmarkLabel
      },
      nav: bookmarkName,
      valueType: 'text'
    })
    if (isSlideTypes && bookmark.description) {
      keys.push({
        keyType: 'value',
        key: `${bookmarkPath}.description`,
        label: {
          key: 'bookmarkDescription',
          enLabel: defaultMessages.bookmarkDescription
        },
        nav: bookmarkName,
        valueType: 'text'
      })
    }
  })
  return keys
}
