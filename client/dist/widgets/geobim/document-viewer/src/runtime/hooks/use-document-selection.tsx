import {
  type ImmutableObject,
  React,
  ReactRedux,
  type IMState,
} from 'jimu-core'
import {
  areModelViewerLinkedDocumentsEqual,
  type SelectedBimDocument,
  modelViewerLinkedDocumentSelector,
  useLinks,
  useGeoBIM,
  useMultipleSelectionWarning,
} from 'widgets/shared-code/geobim'
const { useState, useMemo, useRef } = React
const { useSelector } = ReactRedux

interface DocumentSelectionContextType {
  bimDocument: SelectedBimDocument | null
  documentLoading: boolean
  multipleFeatureSelectionWarning: boolean
  cancelMultipleFeatureSelectionWarning: () => void
}

const useDocumentSelection = (
  widgetId: string,
  modelViewerDisabled: boolean,
): DocumentSelectionContextType => {
  const { linksLoading, linksInitialized } = useLinks()
  const {
    hasMapWidget,
    geoBIMInitialized,
    geoBIMLoading,
    selectionUpdating,
    selectedFeatures,
  } = useGeoBIM()
  const {
    multipleFeatureSelectionWarning,
    cancelMultipleFeatureSelectionWarning,
  } = useMultipleSelectionWarning(selectedFeatures, !modelViewerDisabled)
  const immutableStoreBimDocument: ImmutableObject<SelectedBimDocument> | null =
    useSelector((state: IMState) =>
      modelViewerLinkedDocumentSelector(widgetId, state),
    )
  // use memo to avoid unnecessary re-renders from immutable object
  const storeBimDocument: SelectedBimDocument | null = useMemo(
    () => immutableStoreBimDocument?.asMutable({ deep: true }) ?? null,
    [immutableStoreBimDocument],
  )
  const previousStoreBimDocument = useRef<SelectedBimDocument | null>(null)
  const [currentBimDocument, setCurrentBimDocument] =
    useState<SelectedBimDocument | null>(null)

  const documentLoading = useMemo(() => {
    if (
      !geoBIMInitialized ||
      (hasMapWidget &&
        (!linksInitialized || geoBIMLoading || selectionUpdating))
    ) {
      return true
    }
    return linksLoading
  }, [
    geoBIMInitialized,
    geoBIMLoading,
    hasMapWidget,
    linksInitialized,
    linksLoading,
    selectionUpdating,
  ])

  const processStoreSelections = () => {
    if (
      documentLoading ||
      areModelViewerLinkedDocumentsEqual(
        previousStoreBimDocument.current,
        storeBimDocument,
      )
    ) {
      return
    }
    previousStoreBimDocument.current = storeBimDocument

    // (ignore deselection events)
    if (storeBimDocument?.document != null) {
      setCurrentBimDocument(storeBimDocument)
      // (cancel warning when new document is successfully displayed)
      cancelMultipleFeatureSelectionWarning()
    } else if (!modelViewerDisabled) {
      setCurrentBimDocument(null)
    }
  }
  processStoreSelections()

  // memoize hook context and wrap all callback functions in useCallback()
  const documentSelectionReturn: DocumentSelectionContextType = useMemo(
    () => ({
      bimDocument: currentBimDocument,
      documentLoading,
      multipleFeatureSelectionWarning,
      cancelMultipleFeatureSelectionWarning,
    }),
    [
      currentBimDocument,
      documentLoading,
      multipleFeatureSelectionWarning,
      cancelMultipleFeatureSelectionWarning,
    ],
  )

  return documentSelectionReturn
}

export { useDocumentSelection, type DocumentSelectionContextType }
