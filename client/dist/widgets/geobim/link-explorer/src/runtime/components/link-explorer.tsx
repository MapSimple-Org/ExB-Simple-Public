/** @jsx JSX */
/** @jsxFrag React.Fragment */
import type { JSX } from 'react'
import { React, type IMThemeVariables } from 'jimu-core'
import { Alert, Loading, Typography } from 'jimu-ui'
import {
  type IDocument,
  type defaultSharedMessages,
  geoBIMWidgetContainerStyle,
  widgetHeaderStyle,
  loadingContainerStyle,
  useGeoBIM,
  selectionWarningStyle,
  ApsLogIn,
  UserTypeNotPermissible,
} from 'widgets/shared-code/geobim'
import { useLinkExplorer } from '../hooks/use-link-explorer'
import {
  documentInfo,
  documentLinkList,
  documentLinkListItem,
  documentTitle,
  noDocumentsMessage,
} from '../styles'
import type { IMConfig } from '../../config'
import type defaultMessages from '../translations/default'

export interface LinkExplorerProps {
  theme: IMThemeVariables
  config: IMConfig
  i18nMessage: (
    id:
      | keyof typeof defaultMessages
      | keyof typeof defaultSharedMessages.default,
    values?: { [key: string]: string },
  ) => string
}

const LinkExplorer = (props: LinkExplorerProps): JSX.Element => {
  const { theme, config, i18nMessage } = props
  const { modelViewerWidgetId } = config
  const {
    setDocumentSelection,
    linkExplorerTitle,
    featureDocumentLinks,
    linksLoading,
    linksInitialized,
    multipleFeatureSelectionWarning,
    cancelMultipleFeatureSelectionWarning,
  } = useLinkExplorer(modelViewerWidgetId, i18nMessage)
  const {
    apsAuthenticated,
    selectionUpdating,
    geoBIMLoading,
    userHasPermission,
    geoBIMInitialized,
  } = useGeoBIM()
  const widgetLoading =
    linksLoading || !linksInitialized || selectionUpdating || geoBIMLoading
  const showUserPermissionDenied = !userHasPermission && geoBIMInitialized

  const onDocumentSelected = (
    document: IDocument,
    bimIds: string[] | null,
  ): void => {
    setDocumentSelection(document, bimIds)
  }

  const renderDocumentList = (): JSX.Element[] => {
    if (
      featureDocumentLinks == null ||
      featureDocumentLinks.documents.length === 0
    ) {
      return [
        <div key="no-documents" css={noDocumentsMessage(theme)}>
          {i18nMessage('noDocuments')}
        </div>,
      ]
    }
    const documentList = featureDocumentLinks.documents.map(
      (document: IDocument): JSX.Element => {
        const documentAccount =
          document.attributes?.accountName ?? i18nMessage('noDocumentAccount')
        const documentProject =
          document.attributes?.projectName ?? i18nMessage('noDocumentProject')
        const documentDetails = `${documentAccount} - ${documentProject}`
        return (
          <div
            key={document.fileName}
            tabIndex={0}
            css={documentLinkListItem(theme)}
            onClick={() => {
              onDocumentSelected(
                document,
                featureDocumentLinks.feature.bimIds ?? null,
              )
            }}
            onKeyUp={(event: React.KeyboardEvent<HTMLDivElement>) => {
              if (event.key === 'Enter') {
                onDocumentSelected(
                  document,
                  featureDocumentLinks.feature.bimIds ?? null,
                )
              }
            }}
          >
            <div css={documentTitle(theme)}>{document.displayName}</div>
            <div css={documentInfo(theme)}>{documentDetails}</div>
          </div>
        )
      },
    )
    return documentList
  }

  const renderLinkExplorerWidget = (): JSX.Element => {
    return (
      <div css={geoBIMWidgetContainerStyle(theme)}>
        <div css={widgetHeaderStyle(theme)}>
          <Typography variant="title1" color="overlayText">
            {linkExplorerTitle}
          </Typography>
        </div>
        {showUserPermissionDenied && (
          <UserTypeNotPermissible
            userTypeNotPermissibleLinkText={i18nMessage('geobim_userTypeLink')}
            userTypeNotPermissibleText={i18nMessage('geobim_userTypeNote', {
              widget_name: i18nMessage('widgetTitle'),
            })}
            theme={theme}
          />
        )}
        {!apsAuthenticated && !showUserPermissionDenied && (
          <ApsLogIn
            logInLinkText={i18nMessage('geobim_logInLink')}
            loginMessageFirstLine={i18nMessage('geobim_logInText')}
            loginMessageSecondLine={i18nMessage('geobim_logInTip')}
            theme={theme}
          />
        )}
        {apsAuthenticated && !showUserPermissionDenied && (
          <>
            <div css={documentLinkList(theme)}>
              {widgetLoading && (
                <div key="documents-loading" css={loadingContainerStyle(theme)}>
                  <Loading />
                </div>
              )}
              {!widgetLoading && renderDocumentList()}
              {multipleFeatureSelectionWarning && !widgetLoading && (
                <div css={selectionWarningStyle(theme)}>
                  <Alert
                    text={i18nMessage('geobim_multipleFeatures')}
                    aria-live="polite"
                    closable={true}
                    open={multipleFeatureSelectionWarning}
                    onClose={() => {
                      cancelMultipleFeatureSelectionWarning()
                    }}
                    size="medium"
                    type="warning"
                    withIcon
                  />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    )
  }

  return <>{renderLinkExplorerWidget()}</>
}

export default LinkExplorer
