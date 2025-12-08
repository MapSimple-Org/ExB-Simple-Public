/** @jsx JSX */
/** @jsxFrag React.Fragment */
import type { JSX } from 'react'
import type { IMThemeVariables } from 'jimu-core'
import { RightFilled } from 'jimu-icons/filled/directional/right'
import { DownFilled } from 'jimu-icons/filled/directional/down'
import { Loading } from 'jimu-ui'
import type {
  defaultSharedMessages,
  NodeRepositoryItem,
  DocumentRepositoryItem,
} from 'widgets/shared-code/geobim'
import { useTreeNode } from '../../hooks/use-tree-node'
import type defaultMessages from '../../translations/default'
import {
  treeChildrenStyle,
  noDocumentsStyle,
  treeNodeStyle,
  treeNodeIcon,
  treeNodeLoadingStyle,
} from '../../styles'
import TreeDocument from './tree-document'

export interface TreeNodeProps {
  i18nMessage: (
    id:
      | keyof typeof defaultMessages
      | keyof typeof defaultSharedMessages.default,
  ) => string
  theme: IMThemeVariables
  nodeItem: NodeRepositoryItem
  hidden?: boolean
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { i18nMessage, theme, nodeItem, hidden } = props
  const {
    onToggleExpanded,
    nodeChildren,
    documentChildren,
    loading,
    accessError,
    expanded,
  } = useTreeNode(nodeItem)

  const renderNodeChildren = (): JSX.Element[] => {
    if (nodeChildren.length === 0) {
      return []
    }
    return nodeChildren.map((child: NodeRepositoryItem) => {
      return (
        <TreeNode
          key={child.id}
          i18nMessage={i18nMessage}
          theme={theme}
          nodeItem={child}
        />
      )
    })
  }

  const renderDocumentChildren = (): JSX.Element[] => {
    if (documentChildren.length === 0) {
      if (nodeChildren.length === 0) {
        // if there are no documents and no children, show a message to the user
        return [
          <div key="no-documents" css={noDocumentsStyle(theme)}>
            {i18nMessage('noDocuments')}
          </div>,
        ]
      } else {
        return []
      }
    }
    return documentChildren.map((documentItem: DocumentRepositoryItem) => {
      return (
        <TreeDocument
          key={documentItem.id}
          theme={theme}
          documentItem={documentItem}
        />
      )
    })
  }

  return (
    <div hidden={hidden}>
      <div
        css={treeNodeStyle(theme)}
        onClick={() => {
          onToggleExpanded()
        }}
      >
        {expanded ? (
          <div css={treeNodeIcon(theme)}>
            <DownFilled size="s" />
          </div>
        ) : (
          <div css={treeNodeIcon(theme)}>
            <RightFilled size="s" />
          </div>
        )}
        <b>{nodeItem.label}</b>
      </div>
      <div css={treeChildrenStyle(theme)} hidden={!expanded}>
        <div hidden={!loading} css={treeNodeLoadingStyle(theme)}>
          <Loading />
        </div>
        <div hidden={loading}>
          {accessError && (
            <div css={noDocumentsStyle(theme)}>{i18nMessage('noAccess')}</div>
          )}
          {!accessError && (
            <>
              <div>{renderNodeChildren()}</div>
              <div>{renderDocumentChildren()}</div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default TreeNode
