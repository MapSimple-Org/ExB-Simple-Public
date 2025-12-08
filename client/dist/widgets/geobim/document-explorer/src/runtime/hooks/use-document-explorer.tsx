import { React } from 'jimu-core'
import {
  GeoBimFeatureServiceError,
  type IRepositoryItem,
  type NodeRepositoryItem,
  useDocuments,
  useGeoBIM,
  getFeatureAttribute,
  type IDocument,
} from 'widgets/shared-code/geobim'
import {
  DocumentsContext,
  type DocumentsContextType,
} from '../providers/documents-provider'
const { useContext, useState, useCallback, useMemo, useEffect } = React

const PROJECT_ID_ATTRIBUTE = 'projectId'

interface UseDocumentsExplorerContextType {
  setDocumentSearchText: (text: string) => void
  zoomToDocumentInMap: (document: IDocument | null) => void
  selectedDocument: IDocument | null
  selectedDocumentHasFeature: boolean
  root: NodeRepositoryItem | null
  rootItems: IRepositoryItem[] | null
  rootUpdating: boolean
  geoBIMError: GeoBimFeatureServiceError
  selectedRootItem: NodeRepositoryItem | null
  searchResults: NodeRepositoryItem | null
  searchActive: boolean
  searchUpdating: boolean
  accessError: boolean
}

const useDocumentExplorer = (): UseDocumentsExplorerContextType => {
  const documentsContext = useContext<DocumentsContextType | undefined>(
    DocumentsContext,
  )
  if (documentsContext === undefined) {
    throw new Error('Must call useTree inside of DocumentsProvider')
  }
  const {
    selectedDocument,
    selectedDocumentHasFeature,
    zoomToDocumentInMap,
    clearDocumentSelection,
  } = documentsContext
  const { selectedFeatures, geoBIMError, currentGeoBIMView } = useGeoBIM()
  const { searchRepository, getRoot, useDocumentsReady } = useDocuments()
  // NOTE: Only local state for the widget is kept in hooks. All shared state is in the Store.
  const [root, setRoot] = useState<NodeRepositoryItem | null>(null)
  const [rootItems, setRootItems] = useState<IRepositoryItem[] | null>(null)
  const [rootUpdating, setRootUpdating] = useState<boolean>(true)
  const [searchText, setSearchText] = useState<string>('')
  const [searchResults, setSearchResults] = useState<NodeRepositoryItem | null>(
    null,
  )
  const [searchActive, setSearchActive] = useState<boolean>(false)
  const [searchUpdating, setSearchUpdating] = useState<boolean>(false)
  const [accessError, setAccessError] = useState<boolean>(false)

  const selectedRootItem = useMemo((): NodeRepositoryItem | null => {
    if (selectedFeatures.length !== 1 || rootItems === null) {
      // only support single selection for now
      return null
    }
    const selectedFeature = selectedFeatures[0]
    // TODO: Replace with an explicit check for a BIM Project feature (see Issue #5269)
    const rootItemId = getFeatureAttribute(
      selectedFeature.feature,
      PROJECT_ID_ATTRIBUTE,
    ) as string
    for (const item of rootItems) {
      if (item.id === rootItemId) {
        // (root items will never be documents)
        return item as NodeRepositoryItem
      }
    }
    return null
  }, [rootItems, selectedFeatures])

  useEffect(
    function updateRoot() {
      let unloading = false

      const getTreeRootItems = async (): Promise<void> => {
        if (
          (!useDocumentsReady || currentGeoBIMView == null) &&
          geoBIMError === GeoBimFeatureServiceError.NONE
        ) {
          // root still needs to update
          setRoot(null)
          setRootItems(null)
          setRootUpdating(true)
          return
        }
        if (
          geoBIMError === GeoBimFeatureServiceError.MULTIPLE_FEATURE_SERVICES ||
          geoBIMError === GeoBimFeatureServiceError.NO_FEATURE_SERVICE
        ) {
          // nothing to show user when feature service isn't set up properly
          setRoot(null)
          setRootItems(null)
          setRootUpdating(false)
          return
        }
        setRootUpdating(true)
        const currentRoot = await getRoot()
        const currentAccessError = currentRoot === null
        const currentRootItems = currentRoot?.children ?? null
        if (!unloading) {
          setRoot(currentRoot)
          setRootItems(currentRootItems)
          setRootUpdating(false)
          setAccessError(currentAccessError)
        }
      }
      void getTreeRootItems()

      return (): void => {
        unloading = true
      }
    },
    [currentGeoBIMView, geoBIMError, getRoot, useDocumentsReady],
  )

  useEffect(
    function searchDocuments() {
      let unloading = false

      const getSearchResults = async (): Promise<void> => {
        if (root === null || searchText === '' || !useDocumentsReady) {
          setSearchActive(false)
          setSearchResults(null)
          setSearchUpdating(false)
          if (root === null) {
            // clear selection if there are no documents
            clearDocumentSelection()
          }
          return
        }
        setSearchActive(true)
        setSearchUpdating(true)
        const rootItem = selectedRootItem ?? root
        const results = await searchRepository(rootItem, searchText)
        if (!unloading) {
          clearDocumentSelection() // clear selections from before search
          setSearchResults(results)
          setSearchUpdating(false)
        }
      }
      void getSearchResults()

      return (): void => {
        unloading = true
      }
    },
    [
      clearDocumentSelection,
      root,
      rootUpdating,
      searchRepository,
      searchText,
      selectedRootItem,
      useDocumentsReady,
    ],
  )

  const setDocumentSearchText = useCallback(
    (text: string | null | undefined): void => {
      if (text == null) {
        setSearchText('')
      } else {
        setSearchText(text)
      }
    },
    [],
  )

  // memoize context and wrap all callback functions in useCallback()
  const useDocumentExplorerReturn: UseDocumentsExplorerContextType =
    useMemo(() => {
      return {
        setDocumentSearchText,
        zoomToDocumentInMap,
        selectedDocument,
        selectedDocumentHasFeature,
        root,
        rootItems,
        rootUpdating,
        geoBIMError,
        selectedRootItem,
        searchResults,
        searchActive,
        searchUpdating,
        accessError,
      }
    }, [
      setDocumentSearchText,
      zoomToDocumentInMap,
      selectedDocument,
      selectedDocumentHasFeature,
      root,
      rootItems,
      rootUpdating,
      geoBIMError,
      selectedRootItem,
      searchResults,
      searchActive,
      searchUpdating,
      accessError,
    ])
  return useDocumentExplorerReturn
}

export { useDocumentExplorer, type UseDocumentsExplorerContextType }
