import { React, WidgetState } from 'jimu-core'
import {
  ModelViewerErrorCodes,
  type SelectedBimDocument,
  useGeoBIM,
  useModelViewer,
  type defaultSharedMessages,
} from 'widgets/shared-code/geobim'
import type defaultMessages from '../translations/default'

const { useMemo, useState, useEffect } = React

interface ModelViewerDocumentsContextType {
  viewerErrorMessage: string | null
  documentVisible: boolean
}

const useModelViewerComponent = (
  bimDocument: SelectedBimDocument | null,
  i18nMessage: (
    id:
      | keyof typeof defaultMessages
      | keyof typeof defaultSharedMessages.default,
    values?: { [key: string]: string },
  ) => string,
): ModelViewerDocumentsContextType => {
  const { showModelViewer, viewDocument, viewerError } = useModelViewer()
  const { widgetState } = useGeoBIM()
  const [documentVisible, setDocumentVisible] = useState<boolean>(false)
  const documentUrl = bimDocument?.document?.url
  const documentSelectedIds = bimDocument?.selectedIds
  const issue = bimDocument?.document?.issue
  useEffect(
    function setDocument() {
      if (documentUrl != null && widgetState !== WidgetState.Closed) {
        showModelViewer(true)
        setDocumentVisible(true)
        viewDocument(
          documentUrl,
          undefined,
          documentSelectedIds ?? undefined,
          issue !== undefined ? [issue] : undefined,
        )
      } else {
        showModelViewer(false)
        setDocumentVisible(false)
      }
    },
    [
      documentSelectedIds,
      documentUrl,
      showModelViewer,
      viewDocument,
      issue,
      widgetState,
    ],
  )

  const viewerErrorMessage = useMemo(() => {
    if (viewerError === null) return null

    if (viewerError.errorCode === ModelViewerErrorCodes.NOT_VIEWABLE) {
      return i18nMessage('documentNotViewable')
    }

    if (viewerError.internalErrorCode != null) {
      // TODO: Translate error message?
      return `Code ${viewerError.internalErrorCode as string}: ${viewerError.message}`
    } else {
      return viewerError.message
    }
  }, [viewerError, i18nMessage])

  // memoize hook context and wrap all callback functions in useCallback()
  const modelViewerReturn: ModelViewerDocumentsContextType = useMemo(
    () => ({
      viewerErrorMessage,
      documentVisible,
    }),
    [documentVisible, viewerErrorMessage],
  )

  return modelViewerReturn
}

export { useModelViewerComponent }
