/** @jsx JSX */
/** @jsxFrag React.Fragment */
import type { JSX } from 'react'
import type { IMThemeVariables } from 'jimu-core'
import {
  type DocumentRepositoryItem,
  areIDocumentsEqual,
} from 'widgets/shared-code/geobim'
import { useTreeDocument } from '../../hooks/use-tree-document'
import { treeDocumentStyle, selectedTreeDocumentStyle } from '../../styles'

export interface TreeDocumentProps {
  theme: IMThemeVariables
  documentItem: DocumentRepositoryItem
}

const TreeDocument = (props: TreeDocumentProps): JSX.Element => {
  const { theme, documentItem } = props
  const { selectedDocument, selectDocument } = useTreeDocument()
  const isSelected =
    selectedDocument !== null &&
    areIDocumentsEqual(documentItem.document, selectedDocument)

  const onDocumentClick = (): void => {
    selectDocument(documentItem.document)
  }

  return (
    <div
      onClick={onDocumentClick}
      css={
        isSelected ? selectedTreeDocumentStyle(theme) : treeDocumentStyle(theme)
      }
    >
      {documentItem.label}
    </div>
  )
}

export default TreeDocument
