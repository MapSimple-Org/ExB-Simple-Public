import { React } from 'jimu-core'
import {
  type DocumentRepositoryItem,
  isDocumentRepositoryItem,
  isNodeRepositoryItem,
  type NodeRepositoryItem,
  repositoryItemHasChildren,
  useDocuments,
} from 'widgets/shared-code/geobim'
const { useMemo, useState, useCallback, useEffect } = React

interface UseTreeNodeContextType {
  onToggleExpanded: () => void
  nodeChildren: NodeRepositoryItem[]
  documentChildren: DocumentRepositoryItem[]
  loading: boolean
  accessError: boolean
  expanded: boolean
}

function useTreeNode(nodeItem: NodeRepositoryItem): UseTreeNodeContextType {
  const { getChildren, useDocumentsReady } = useDocuments()
  const [loading, setLoading] = useState<boolean>(true)
  const [expanded, setExpanded] = useState<boolean>(false)
  const [expandedOnce, setExpandedOnce] = useState<boolean>(false)
  const [nodeChildren, setNodeChildren] = useState<NodeRepositoryItem[]>([])
  const [documentChildren, setDocumentChildren] = useState<
    DocumentRepositoryItem[]
  >([])
  const [accessError, setAccessError] = useState<boolean>(false)
  const nodeChildrenAlreadyLoaded = useMemo(() => {
    return repositoryItemHasChildren(nodeItem) && nodeItem.children !== null
  }, [nodeItem])

  // expand node if Node's children already loaded
  if (nodeChildrenAlreadyLoaded && !expandedOnce) {
    const nodes = nodeItem.children?.filter(isNodeRepositoryItem) ?? []
    const documents = nodeItem.children?.filter(isDocumentRepositoryItem) ?? []
    setNodeChildren(nodes)
    setDocumentChildren(documents)
    setExpanded(true)
    setExpandedOnce(true)
  }

  useEffect(
    function initNodeChildren() {
      let unloading = false

      const loadNodeChildren = async (): Promise<void> => {
        /* NOTE: Do not load children until first expanded
               otherwise the whole tree will load at once! */
        if (!expandedOnce || nodeChildrenAlreadyLoaded || !useDocumentsReady) {
          setLoading(false)
          return
        }

        setLoading(true)
        const children = await getChildren(nodeItem)
        if (unloading) return

        if (children === null) {
          setNodeChildren([])
          setDocumentChildren([])
          setAccessError(true)
          setLoading(false)
          return
        }
        const nodes = children.filter(isNodeRepositoryItem)
        const documents = children.filter(isDocumentRepositoryItem)
        setNodeChildren(nodes)
        setDocumentChildren(documents)
        setAccessError(false)
        setLoading(false)
      }
      void loadNodeChildren()

      return () => {
        unloading = true
      }
    },
    [
      expandedOnce,
      getChildren,
      nodeChildrenAlreadyLoaded,
      nodeItem,
      useDocumentsReady,
    ],
  )

  const onToggleExpanded = useCallback((): void => {
    setExpandedOnce((prevExpandedOnce) => {
      // only set to true on first expansion
      if (!prevExpandedOnce) {
        return true
      }
      return prevExpandedOnce
    })
    setExpanded((prevExpanded) => !prevExpanded)
  }, []) // (using updater functions removes dependencies)

  // memoize context and wrap all callback functions in useCallback()
  const useTreeNodeReturn: UseTreeNodeContextType = useMemo(
    () => ({
      onToggleExpanded,
      nodeChildren,
      documentChildren,
      loading,
      accessError,
      expanded,
    }),
    [
      accessError,
      documentChildren,
      expanded,
      loading,
      nodeChildren,
      onToggleExpanded,
    ],
  )

  return useTreeNodeReturn
}

export { useTreeNode, type UseTreeNodeContextType }
