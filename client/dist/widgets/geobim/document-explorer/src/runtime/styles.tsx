import { css, type IMThemeVariables, type SerializedStyles } from 'jimu-core'
import {
  loadingContainerStyle,
  ExBThemeSpacing,
} from 'widgets/shared-code/geobim'

const treeNodeIconSpacing = (theme: IMThemeVariables): string => {
  return theme.sys.spacing(ExBThemeSpacing.Two)
}

export const documentExplorerControls = (
  theme: IMThemeVariables,
): SerializedStyles => {
  return css({
    label: 'documentExplorerControls',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.sys.spacing(ExBThemeSpacing.Three),
    color: theme.sys.color.surface.overlayText,
    backgroundColor: theme.sys.color.surface.overlay,
    borderBottom: `solid 1px ${theme.sys.color.divider.primary}`,
  })
}

export const searchBox = (_theme: IMThemeVariables): SerializedStyles => {
  return css({
    label: 'searchBox',
    flex: '1 1 auto',
    minWidth: '100px',
  })
}

export const zoomToButton = (theme: IMThemeVariables): SerializedStyles => {
  return css({
    label: 'zoomToButton',
    marginLeft: theme.sys.spacing(ExBThemeSpacing.Three),
  })
}

export const documentsContainer = (
  _theme: IMThemeVariables,
): SerializedStyles => {
  return css({
    label: 'documentsContainer',
    height: '100%',
    overflow: 'auto',
    position: 'relative',
  })
}

export const documentsLoadingContainer = (
  theme: IMThemeVariables,
): SerializedStyles => {
  return css(
    {
      label: 'documentsLoadingContainer',
      position: 'relative',
      height: '100%',
    },
    loadingContainerStyle(theme),
  )
}

export const treeContainer = (theme: IMThemeVariables): SerializedStyles => {
  return css({
    label: 'treeContainer',
    minWidth: 'fit-content',
    padding: theme.sys.spacing(ExBThemeSpacing.Three),
  })
}

export const rootDisplayStyle = (theme: IMThemeVariables): SerializedStyles => {
  return css({
    label: 'rootDisplayStyle',
    minWidth: 'fit-content',
    marginLeft: theme.sys.spacing(ExBThemeSpacing.Five),
  })
}

export const rootItemsDisplayStyle = (
  _theme: IMThemeVariables,
): SerializedStyles => {
  return css({
    label: 'rootItemsDisplayStyle',
    minWidth: 'fit-content',
    marginLeft: '0px',
  })
}

export const treeNodeStyle = (theme: IMThemeVariables): SerializedStyles => {
  return css({
    label: 'treeNodeStyle',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: theme.sys.spacing(ExBThemeSpacing.One),
    minWidth: 'fit-content',
    cursor: 'pointer',
    color: theme.sys.color.action.text,

    '&:hover': {
      backgroundColor: theme.sys.color.action.hover,
    },
  })
}

export const treeNodeIcon = (theme: IMThemeVariables): SerializedStyles => {
  return css({
    label: 'treeNodeIcon',
    margin: `0 ${treeNodeIconSpacing(theme)} 2px 0`,
  })
}

export const treeNodeLoadingStyle = (
  theme: IMThemeVariables,
): SerializedStyles => {
  return css({
    label: 'treeNodeLoadingStyle',
    display: 'inline-block',
    // HACK: Used to contain and position the ExB loading spinner
    position: 'relative',
    transform: 'scale(0.3)',
    height: '12px', // (same height as the ExB loading spinner inline)
    marginTop: theme.sys.spacing(ExBThemeSpacing.Two),
    marginLeft: treeNodeIconSpacing(theme),
  })
}

export const treeChildrenStyle = (
  theme: IMThemeVariables,
): SerializedStyles => {
  return css({
    label: 'treeChildrenStyle',
    minWidth: 'fit-content',
    marginLeft: theme.sys.spacing(ExBThemeSpacing.Six),
  })
}

export const noDocumentsStyle = (theme: IMThemeVariables): SerializedStyles => {
  return css({
    label: 'noDocumentsStyle',
    padding: theme.sys.spacing(1),
  })
}

export const treeDocumentStyle = (
  theme: IMThemeVariables,
): SerializedStyles => {
  return css({
    label: 'treeDocumentStyle',
    padding: theme.sys.spacing(1),
    minWidth: 'fit-content',
    cursor: 'pointer',
    color: theme.sys.color.action.text,

    '&:hover': {
      backgroundColor: theme.sys.color.action.hover,
    },
  })
}

export const selectedTreeDocumentStyle = (
  theme: IMThemeVariables,
): SerializedStyles => {
  return css(
    {
      label: 'selectedTreeDocumentStyle',
      color: `${theme.sys.color.action.selected.text} !important`,
      backgroundColor: `${theme.sys.color.action.selected.default} !important`,

      '&:hover': {
        backgroundColor: `${theme.sys.color.action.selected.hover} !important`,
      },
    },
    treeDocumentStyle(theme),
  )
}

export const noTreeMessageContainer = (
  theme: IMThemeVariables,
): SerializedStyles => {
  return css({
    label: 'noTreeMessageContainer',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.sys.color.surface.paperHint,
    padding: theme.sys.spacing(ExBThemeSpacing.Two),
  })
}

export const noTreeMessageStyle = (
  _theme: IMThemeVariables,
): SerializedStyles => {
  return css({
    label: 'noTreeMessageStyle',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  })
}
