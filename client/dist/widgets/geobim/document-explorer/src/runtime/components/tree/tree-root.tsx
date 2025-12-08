/** @jsx JSX */
/** @jsxFrag React.Fragment */
import type { JSX } from 'react'
import { React, type IMThemeVariables } from 'jimu-core'
import { RightFilled } from 'jimu-icons/filled/directional/right'
import { DownFilled } from 'jimu-icons/filled/directional/down'
import {
  type defaultSharedMessages,
  type IRepositoryItem,
  type NodeRepositoryItem,
  isNodeRepositoryItem,
} from 'widgets/shared-code/geobim'
import type defaultMessages from '../../translations/default'
import {
  treeContainer,
  rootDisplayStyle,
  rootItemsDisplayStyle,
  treeNodeStyle,
  treeNodeIcon,
  noDocumentsStyle,
} from '../../styles'
import TreeNode from './tree-node'
const { useState } = React

export interface TreeRootProps {
  i18nMessage: (
    id:
      | keyof typeof defaultMessages
      | keyof typeof defaultSharedMessages.default,
  ) => string
  theme: IMThemeVariables
  root: NodeRepositoryItem | null
  rootItems: IRepositoryItem[] | null
  selectedRootItem: NodeRepositoryItem | null
  hidden?: boolean
}

const TreeRoot = (props: TreeRootProps): JSX.Element => {
  const { i18nMessage, theme, root, rootItems, selectedRootItem, hidden } =
    props
  const [rootExpanded, setRootExpanded] = useState<boolean>(false)

  const onToggleExpanded = () => {
    setRootExpanded((prevRootExpanded) => !prevRootExpanded)
  }

  const isRootItemHidden = (rootItem: IRepositoryItem): boolean => {
    if (selectedRootItem !== null) {
      return rootItem.id !== selectedRootItem.id
    } else {
      return !rootExpanded
    }
  }

  const renderRoot = (): JSX.Element | null => {
    if (root === null || selectedRootItem !== null) {
      // (don't show root if a specific root item is selected)
      return null
    }
    return (
      <>
        <div
          css={treeNodeStyle(theme)}
          onClick={() => {
            onToggleExpanded()
          }}
        >
          {rootExpanded ? (
            <div css={treeNodeIcon(theme)}>
              <DownFilled size="s" />
            </div>
          ) : (
            <div css={treeNodeIcon(theme)}>
              <RightFilled size="s" />
            </div>
          )}
          <b>{root.label}</b>
        </div>
      </>
    )
  }

  const renderRootItems = (): JSX.Element[] => {
    if (rootItems == null || rootItems.length === 0) {
      return [
        <div
          key="no-projects"
          hidden={!rootExpanded}
          css={noDocumentsStyle(theme)}
        >
          {i18nMessage('noProjects')}
        </div>,
      ]
    }
    return rootItems
      .filter((rootItem: IRepositoryItem) => {
        // should be no DocumentRepositoryItems at the root
        return isNodeRepositoryItem(rootItem)
      })
      .map((rootItem: NodeRepositoryItem) => {
        const isHidden = isRootItemHidden(rootItem)
        return (
          <TreeNode
            key={rootItem.id}
            i18nMessage={i18nMessage}
            theme={theme}
            nodeItem={rootItem}
            hidden={isHidden}
          />
        )
      })
  }

  return (
    <div hidden={hidden}>
      <div css={treeContainer(theme)}>
        {renderRoot()}
        <div
          css={
            selectedRootItem === null
              ? rootDisplayStyle(theme)
              : rootItemsDisplayStyle(theme)
          }
        >
          {renderRootItems()}
        </div>
      </div>
    </div>
  )
}

export default TreeRoot
