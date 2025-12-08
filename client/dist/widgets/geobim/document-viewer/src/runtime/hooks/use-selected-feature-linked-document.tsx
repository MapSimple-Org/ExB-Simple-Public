import { React, ReactRedux, lodash } from 'jimu-core'
import type { Dispatch } from 'redux'
import {
  useLinks,
  setModelViewerLinkedDocument,
  type ActionTypes,
  areIDocumentsEqual,
  type IDocument,
  useGeoBIM,
} from 'widgets/shared-code/geobim'
const { useRef } = React
const { useDispatch } = ReactRedux

/**
 * Sends a linked document selection through the store based on the currently
 * selected map feature (if a map is linked to the widget in GeoBIM Provider)
 *
 * @param widgetId - The Widget ID of the Document Viewer
 */
const useSelectedFeatureLinkedDocument = (widgetId: string): void => {
  const { featureDocumentLinks } = useLinks()
  const { selectedFeatures } = useGeoBIM()

  const dispatch = useDispatch<Dispatch<ActionTypes>>()
  const previousDocument = useRef<IDocument | null>(null)
  const previousBimIds = useRef<string[] | null>(null)
  const defaultDocument =
    featureDocumentLinks?.documents.find((document) => document.isDefault) ??
    featureDocumentLinks?.documents[0] ??
    null
  const bimIds = featureDocumentLinks?.feature.bimIds ?? null

  if (
    !areIDocumentsEqual(previousDocument.current, defaultDocument) ||
    !lodash.isDeepEqual(previousBimIds.current, bimIds)
  ) {
    previousBimIds.current = bimIds
    previousDocument.current = defaultDocument

    // ignore deselection events
    if (selectedFeatures?.length > 0) {
      // Send feature selections through the store
      setModelViewerLinkedDocument(widgetId, defaultDocument, bimIds, dispatch)
    }
  }
}

export { useSelectedFeatureLinkedDocument }
