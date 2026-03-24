import { BaseVersionManager } from 'jimu-core'

/**
 * Migrate legacy {field} tokens to {{field}} in template expressions.
 * Only converts single-brace tokens that aren't already double-brace.
 * Safe to run multiple times — idempotent.
 */
function migrateTokenSyntax (template: string | undefined): string | undefined {
  if (!template) return template
  return template.replace(/(?<!\{)\{(\w+)\}(?!\})/g, '{{$1}}')
}

class VersionManager extends BaseVersionManager {
  versions = [{
    version: '1.0.0',
    description: 'The first version.',
    upgrader: (oldConfig) => {
      return oldConfig
    }
  }, {
    // r026.002: Auto-migrate {field} → {{field}} in saved CustomTemplate configs.
    // This handles apps that haven't been opened in the settings panel yet.
    version: '1.1.0',
    description: 'Migrate template token syntax from {field} to {{field}}.',
    upgrader: (oldConfig) => {
      let config = oldConfig

      // Migrate queryItems array
      const queryItems = config.queryItems
      if (queryItems?.length > 0) {
        const migratedItems = queryItems.map((item: any) => {
          let migrated = item

          if (item.resultTitleExpression) {
            const newTitle = migrateTokenSyntax(item.resultTitleExpression)
            if (newTitle !== item.resultTitleExpression) {
              migrated = { ...migrated, resultTitleExpression: newTitle }
            }
          }

          if (item.resultContentExpression) {
            const newContent = migrateTokenSyntax(item.resultContentExpression)
            if (newContent !== item.resultContentExpression) {
              migrated = { ...migrated, resultContentExpression: newContent }
            }
          }

          return migrated
        })

        config = config.set('queryItems', migratedItems)
      }

      return config
    }
  }]
}

export const versionManager = new VersionManager()
