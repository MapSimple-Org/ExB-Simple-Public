/** @jsx JSX */
/** @jsxFrag React.Fragment */
import type { ReactNode, JSX } from 'react'
import type { Dispatch } from 'redux'
import { React, ReactRedux } from 'jimu-core'
import {
  type ActionTypes,
  type IDocument,
  type IGeoBIMDocument,
  setModelViewerLinkedDocument,
  useDocuments,
  useMap,
} from 'widgets/shared-code/geobim'
const { createContext, useState, useEffect, useCallback, useMemo } = React
const { useDispatch } = ReactRedux

interface DocumentsProviderProps {
  modelViewerWidgetId: string | null | undefined
  children: ReactNode
}

interface DocumentsContextType {
  selectedDocument: IDocument | null
  selectedDocumentHasFeature: boolean
  selectDocument: (document: IDocument) => void
  zoomToDocumentInMap: () => Promise<void>
  clearDocumentSelection: () => void
}

const DocumentsContext = createContext<DocumentsContextType | undefined>(
  undefined,
)

function DocumentsProvider(props: DocumentsProviderProps): JSX.Element {
  const { modelViewerWidgetId, children } = props
  const { zoomToFeature } = useMap()
  const { getGeoBIMDocument, getDocumentsLayer } = useDocuments()
  const dispatch = useDispatch<Dispatch<ActionTypes>>()
  // NOTE: Only local state for the widget is kept in hooks. All shared state is in the Store.
  const [selectedDocument, setSelectedDocument] = useState<IDocument | null>(
    null,
  )
  const [geoBIMDocument, setGeoBIMDocument] = useState<IGeoBIMDocument | null>(
    null,
  )

  useEffect(
    function processSelectedDocument() {
      let unloading = false

      const getRelatedGeoBIMDocument = async (
        selectedDocument: IDocument | null,
      ): Promise<void> => {
        if (selectedDocument === null) {
          setGeoBIMDocument(null)
          return
        }
        const relatedGeoBIMDocument = await getGeoBIMDocument(selectedDocument)
        if (!unloading) {
          setGeoBIMDocument(relatedGeoBIMDocument)
        }
      }
      void getRelatedGeoBIMDocument(selectedDocument)

      return (): void => {
        unloading = true
      }
    },
    [getGeoBIMDocument, selectedDocument],
  )

  const selectDocument = useCallback(
    (document: IDocument): void => {
      if (document.url === selectedDocument?.url) {
        // do nothing if already selected
        return
      }
      setSelectedDocument(document)
      if (modelViewerWidgetId != null) {
        setModelViewerLinkedDocument(
          modelViewerWidgetId,
          document,
          null,
          dispatch,
        )
      }
    },
    [selectedDocument, modelViewerWidgetId, dispatch],
  )

  const zoomToDocumentInMap = useCallback(async (): Promise<void> => {
    const objectId = geoBIMDocument?.objectId
    if (objectId == null) return

    const documentsLayer = await getDocumentsLayer()
    const layerId = documentsLayer?.layerId
    const portalItemId = documentsLayer?.portalItemId
    if (layerId == null || portalItemId == null) return

    await zoomToFeature(objectId, layerId, portalItemId)
  }, [geoBIMDocument, getDocumentsLayer, zoomToFeature])

  const clearDocumentSelection = useCallback((): void => {
    setSelectedDocument(null)
  }, [])

  const selectedDocumentHasFeature = useMemo((): boolean => {
    return geoBIMDocument !== null
  }, [geoBIMDocument])

  // memoize provider context and wrap all callback functions in useCallback()
  const documentsReturn: DocumentsContextType = useMemo(() => {
    return {
      selectedDocument,
      selectedDocumentHasFeature,
      selectDocument,
      zoomToDocumentInMap,
      clearDocumentSelection,
    }
  }, [
    clearDocumentSelection,
    selectDocument,
    zoomToDocumentInMap,
    selectedDocumentHasFeature,
    selectedDocument,
  ])

  return (
    <DocumentsContext.Provider value={documentsReturn}>
      {children}
    </DocumentsContext.Provider>
  )
}

export { DocumentsProvider, DocumentsContext, type DocumentsContextType }
