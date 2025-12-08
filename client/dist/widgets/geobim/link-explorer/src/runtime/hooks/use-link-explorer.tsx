import { type IMState, React, ReactRedux } from 'jimu-core'
import type { Dispatch } from 'redux'
import {
  type IFeatureDocumentLinks,
  getFeatureTitle,
  type IDocument,
  setModelViewerLinkedDocument,
  type ActionTypes,
  modelViewerDisabledSelector,
  useLinks,
  useGeoBIM,
  type defaultSharedMessages,
  areRecordArraysEqual,
  type GraphicDataRecord,
  useMultipleSelectionWarning,
  areFeatureDocumentLinksEqual,
} from 'widgets/shared-code/geobim'
import type defaultMessages from '../translations/default'
const { useMemo, useCallback, useState } = React
const { useDispatch, useSelector } = ReactRedux

interface LinkExplorerContextType {
  setDocumentSelection: (
    document: IDocument | null,
    bimIds: string[] | null,
  ) => void
  linkExplorerTitle: string
  featureDocumentLinks: IFeatureDocumentLinks | null
  linksLoading: boolean
  linksInitialized: boolean
  multipleFeatureSelectionWarning: boolean
  cancelMultipleFeatureSelectionWarning: () => void
}

const useLinkExplorer = (
  modelViewerWidgetId: string | null | undefined,
  i18nMessage: (
    id:
      | keyof typeof defaultMessages
      | keyof typeof defaultSharedMessages.default,
    values?: { [key: string]: string },
  ) => string,
): LinkExplorerContextType => {
  const isModelViewerDisabled: boolean = useSelector((state: IMState) =>
    modelViewerDisabledSelector(modelViewerWidgetId, state),
  )
  const { selectedFeatures, geoBIMLoading } = useGeoBIM()
  const { featureDocumentLinks, linksLoading, linksInitialized } = useLinks()
  const {
    multipleFeatureSelectionWarning,
    cancelMultipleFeatureSelectionWarning,
  } = useMultipleSelectionWarning(selectedFeatures, true)
  // NOTE: Only local state for the widget is kept in hooks. All shared state is in the Store.
  const dispatch = useDispatch<Dispatch<ActionTypes>>()
  const [selectionTitle, setSelectionTitle] = useState<string | null>(null)
  const [prevSelectedFeatures, setPrevSelectedFeatures] = useState<
    GraphicDataRecord[]
  >([])
  const [currentFeatureDocumentLinks, setCurrentFeatureDocumentLinks] =
    useState<IFeatureDocumentLinks | null>(null)

  /* ignore deselection events
     (when featureDocumentLinks is null and no multiple feature selection warnings) */
  if (
    !areFeatureDocumentLinksEqual(
      featureDocumentLinks,
      currentFeatureDocumentLinks,
    ) &&
    (featureDocumentLinks !== null || multipleFeatureSelectionWarning)
  ) {
    setCurrentFeatureDocumentLinks(featureDocumentLinks)
  }

  // set selection title
  if (!areRecordArraysEqual(prevSelectedFeatures, selectedFeatures)) {
    // TODO: Handle multiselect (single select for now...)
    setPrevSelectedFeatures(selectedFeatures)
    if (selectedFeatures.length === 1) {
      const selectedFeature: __esri.Graphic = selectedFeatures[0].feature
      if (selectedFeature.layer != null) {
        const selectedRecordTitle: string =
          getFeatureTitle(selectedFeature) ?? i18nMessage('noFeatureTitle')
        const selectedLayerTitle: string | null | undefined =
          selectedFeature.layer.title
        const newLinkExplorerTitle: string =
          selectedRecordTitle === selectedLayerTitle ||
          selectedLayerTitle == null
            ? selectedRecordTitle
            : `${selectedLayerTitle}: ${selectedRecordTitle}`
        if (selectionTitle !== newLinkExplorerTitle) {
          setSelectionTitle(newLinkExplorerTitle)
        }
      }
    } else if (selectedFeatures.length > 1 && selectionTitle !== null) {
      // clear title if multiple features selected
      setSelectionTitle(null)
    }
  }

  const linkExplorerTitle = useMemo((): string => {
    if (linksInitialized && !geoBIMLoading && selectionTitle !== null) {
      return selectionTitle
    }
    return i18nMessage('widgetTitle')
  }, [geoBIMLoading, i18nMessage, linksInitialized, selectionTitle])

  const setDocumentSelection = useCallback(
    (document: IDocument | null, bimIds: string[] | null): void => {
      if (
        modelViewerWidgetId == null ||
        modelViewerWidgetId === '' ||
        isModelViewerDisabled
      ) {
        return
      }
      setModelViewerLinkedDocument(
        modelViewerWidgetId,
        document,
        bimIds,
        dispatch,
      )
    },
    [modelViewerWidgetId, isModelViewerDisabled, dispatch],
  )

  // memoize hook context and wrap all callback functions in useCallback()
  const linkExplorerReturn: LinkExplorerContextType = useMemo(
    () => ({
      setDocumentSelection,
      linkExplorerTitle,
      featureDocumentLinks: currentFeatureDocumentLinks,
      linksLoading,
      linksInitialized,
      multipleFeatureSelectionWarning,
      cancelMultipleFeatureSelectionWarning,
    }),
    [
      setDocumentSelection,
      linkExplorerTitle,
      currentFeatureDocumentLinks,
      linksLoading,
      linksInitialized,
      multipleFeatureSelectionWarning,
      cancelMultipleFeatureSelectionWarning,
    ],
  )

  return linkExplorerReturn
}

export { useLinkExplorer }
