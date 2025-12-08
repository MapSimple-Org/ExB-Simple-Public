/** @jsx JSX */
/** @jsxFrag React.Fragment */
import type { JSX } from 'react'
import { React, type IMThemeVariables, lodash } from 'jimu-core'
import { SearchOutlined } from 'jimu-icons/outlined/editor/search'
import { Alert, Button, Loading, TextInput } from 'jimu-ui'
import { SelectZoomToOutlined } from 'jimu-icons/outlined/gis/select-zoom-to'
import {
  type defaultSharedMessages,
  geoBIMWidgetContainerStyle,
  useGeoBIM,
  ApsLogIn,
  UserTypeNotPermissible,
  GeoBimFeatureServiceError,
} from 'widgets/shared-code/geobim'
import { useDocumentExplorer } from '../hooks/use-document-explorer'
import type defaultMessages from '../translations/default'
import {
  documentExplorerControls,
  documentsContainer,
  noTreeMessageContainer,
  noTreeMessageStyle,
  documentsLoadingContainer,
  treeContainer,
  searchBox,
  zoomToButton,
} from '../styles'
import TreeRoot from './tree/tree-root'
import TreeNode from './tree/tree-node'
const { useMemo } = React

const SEARCH_DEBOUNCE_TIME_MS = 700

export interface DocumentExplorerProps {
  i18nMessage: (
    id:
      | keyof typeof defaultMessages
      | keyof typeof defaultSharedMessages.default,
    values?: { [key: string]: string },
  ) => string
  theme: IMThemeVariables
}

const DocumentExplorer = (props: DocumentExplorerProps): JSX.Element => {
  const { i18nMessage, theme } = props
  const { apsAuthenticated, userHasPermission, geoBIMInitialized } = useGeoBIM()
  const {
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
  } = useDocumentExplorer()
  const zoomSelectDisabled =
    rootUpdating ||
    searchUpdating ||
    !selectedDocument ||
    !selectedDocumentHasFeature
  const showUserPermissionDenied = !userHasPermission && geoBIMInitialized

  const getZoomToButtonTip = (): string => {
    if (selectedDocument === null) {
      return i18nMessage('zoomSelectButtonNoSelection')
    }
    if (!selectedDocumentHasFeature) {
      return i18nMessage('zoomSelectButtonInvalidSelection')
    }
    return i18nMessage('zoomSelectButtonEnabled')
  }

  // wrap setDocumentSearchText in a debounce function to prevent excessive API calls
  const onSearchTextChange = useMemo(
    () => lodash.debounce(setDocumentSearchText, SEARCH_DEBOUNCE_TIME_MS),
    [setDocumentSearchText],
  )

  // NOTE: The "search" type in ExB TextInput is buggy, so we use "text" type here.
  const renderControls = (): JSX.Element => {
    return (
      <div css={documentExplorerControls(theme)}>
        <TextInput
          css={searchBox(theme)}
          type="text"
          allowClear={true}
          disabled={rootUpdating || root === null}
          prefix={
            <SearchOutlined
              color={theme.sys.color.divider.primary}
              currentColor={true}
            />
          }
          placeholder={i18nMessage('searchDocuments')}
          onChange={(event) => {
            onSearchTextChange(event.target.value)
          }}
        />
        <div css={zoomToButton(theme)} title={getZoomToButtonTip()}>
          <Button
            type="default"
            onClick={() => {
              zoomToDocumentInMap(selectedDocument)
            }}
            disabled={zoomSelectDisabled}
            icon={true}
          >
            <SelectZoomToOutlined />
          </Button>
        </div>
      </div>
    )
  }

  const renderTree = (): JSX.Element => {
    if (!rootUpdating && accessError) {
      return (
        <div
          key={'no-access'}
          css={noTreeMessageContainer(theme)}
          hidden={searchActive}
        >
          {i18nMessage('noAccess')}
        </div>
      )
    }
    if (!rootUpdating && root === null) {
      return (
        <div
          key={'no-hub'}
          css={noTreeMessageContainer(theme)}
          hidden={searchActive}
        >
          <div css={noTreeMessageStyle(theme)}>{i18nMessage('noHub')}</div>
          {geoBIMError === GeoBimFeatureServiceError.NO_FEATURE_SERVICE && (
            <div>
              <Alert
                fullWidth={true}
                type="warning"
                withIcon={true}
                text={i18nMessage('noGeoBIMFeatureServiceError')}
              />
            </div>
          )}
          {geoBIMError ===
            GeoBimFeatureServiceError.MULTIPLE_FEATURE_SERVICES && (
            <div>
              <Alert
                fullWidth={true}
                type="warning"
                withIcon={true}
                text={i18nMessage('multipleGeoBIMFeatureServicesError')}
              />
            </div>
          )}
        </div>
      )
    }
    return (
      <>
        <div
          hidden={!rootUpdating || searchActive}
          css={documentsLoadingContainer(theme)}
        >
          <Loading />
        </div>
        <TreeRoot
          key={root?.id ?? 'no-hub'}
          i18nMessage={i18nMessage}
          theme={theme}
          root={root}
          rootItems={rootItems}
          selectedRootItem={selectedRootItem}
          hidden={rootUpdating || searchActive}
        />
      </>
    )
  }

  const renderSearchTree = (): JSX.Element | null => {
    if (!searchActive) return null

    if (searchUpdating) {
      return (
        <div css={documentsLoadingContainer(theme)}>
          <Loading />
        </div>
      )
    }
    if (searchResults === null) {
      return (
        <div css={noTreeMessageContainer(theme)}>
          {i18nMessage('noSearchResults')}
        </div>
      )
    }
    return (
      <div css={treeContainer(theme)}>
        <TreeNode
          key={searchResults.id}
          i18nMessage={i18nMessage}
          theme={theme}
          nodeItem={searchResults}
        />
      </div>
    )
  }

  return (
    <div css={geoBIMWidgetContainerStyle(theme)}>
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
          {renderControls()}
          <div css={documentsContainer(theme)}>
            {renderTree()}
            {renderSearchTree()}
          </div>
        </>
      )}
    </div>
  )
}

export default DocumentExplorer
