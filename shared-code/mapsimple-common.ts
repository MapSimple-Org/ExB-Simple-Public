/**
 * Shared utilities for MapSimple widget family (query-simple, helper-simple)
 * 
 * IMPORTANT: Uses 'mapsimple-common' namespace to avoid conflicts with other
 * custom widgets that might also use a generic 'common' namespace.
 * 
 * This is the entry point for 'widgets/shared-code/mapsimple-common'
 */

export * from './mapsimple-common/common-components'
export * from './mapsimple-common/utils'
export * from './mapsimple-common/use-ds-exists'
export * from './mapsimple-common/data-source-tip'
export * from './mapsimple-common/debug-logger'
export * from './mapsimple-common/widget-config-manager'
export * from './mapsimple-common/global-handle-manager'
export { convertTemplateToHtml, applyInlineFormatting } from './mapsimple-common/markdown-template-utils'
export { substituteTokens, substituteLegacyTokens, resolveExternalLinkUrl } from './mapsimple-common/token-renderer'
export type { FilterContext } from './mapsimple-common/token-renderer'
export { TableBuilder, parseMarkdownToTableState, findTableBlockAtCursor } from './mapsimple-common/table-builder'
export type { TableBuilderProps, TableBuilderState } from './mapsimple-common/table-builder'


