import type { ExpressionPart, IMExpressionMap, ImmutableArray, UseDataSource } from 'jimu-core'
import { richTextUtils } from 'jimu-ui'
import type { DeltaValue } from 'jimu-ui/advanced/rich-text-editor'

/**
 * Replace the text content with new plain text
 *
 * Note: The placeholder must be a nested structure of tags with the text inside:
 *   Correct: <p><strong>foo</strong></p>
 *   Wrong:   <p>foo<strong>bar</strong></p>
 * @param placeholder
 * @param textContent
 */
export const replacePlaceholderTextContent = (placeholder: string, textContent: string) => {
  const plaintext = richTextUtils.getHTMLTextContent(placeholder)
  return placeholder.replace(plaintext?.trim(), textContent)
}

export const normalizeLineSpace = (_, delta: DeltaValue) => {
  delta.forEach((op) => {
    // Only numeric line-height is supported
    const linespace = op?.attributes?.linespace
    if (linespace && isNaN(Number(linespace))) {
      op.attributes.linespace = 1.5
    }
  })
  return delta
}

/**
 * Get expression parts from expressions
 * @param expressions
 */
export const getExpressionParts = (expressions: IMExpressionMap): ExpressionPart[] => {
  let parts = []
  for (const uniqueid in expressions) {
    const expression = expressions[uniqueid]
    if (expression?.parts != null) {
      parts = parts.concat(expression?.parts)
    }
  }
  return parts
}

export const hasSameDataSourceFields = (uds1: ImmutableArray<UseDataSource>, uds2: ImmutableArray<UseDataSource>) => {
  if (!uds1 || !uds2) return false
  if (uds1.length !== uds2.length) return false
  let sameFields = true
  uds1.forEach((uds1Item, i) => {
    if (uds1Item.dataSourceId !== uds2[i].dataSourceId) {
      sameFields = false
      return
    }
    if ((uds1Item.fields ?? [])?.length !== (uds2[i].fields ?? [])?.length) {
      sameFields = false
      return
    }
    uds1Item.fields?.forEach((field, j) => {
      if (field !== uds2[i].fields[j]) {
        sameFields = false
      }
    })
  })
  return sameFields
}