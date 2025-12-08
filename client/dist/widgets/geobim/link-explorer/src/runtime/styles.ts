import { css, type IMThemeVariables, type SerializedStyles } from 'jimu-core'
import { ExBThemeSpacing } from 'widgets/shared-code/geobim'

// ExB has no border thicknesses defined in their themes
const FOCUS_BORDER_THICKNESS = '3px'

export const documentLinkList = (
  _theme: IMThemeVariables,
): SerializedStyles => {
  return css({
    label: 'documentLinkList',
    flexBasis: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    justifyContent: 'flex-start',
    overflowY: 'auto',
    position: 'relative',
  })
}

export const documentLinkListItem = (
  theme: IMThemeVariables,
): SerializedStyles => {
  const listPadding = theme.sys.spacing(ExBThemeSpacing.Two)
  return css({
    label: 'documentLinkListItem',
    padding: listPadding,
    borderBottom: `solid 1px ${theme.sys.color.divider.primary}`,
    cursor: 'pointer',
    textDecoration: 'underline',
    color: theme.sys.color.action.text,
    backgroundColor: theme.sys.color.action.default,
    // animate hover state with color and underlined text
    transition:
      'background-color 0.3s ease-in-out, text-decoration-color 0.3s ease-in-out',
    textDecorationColor: 'transparent',

    '&:hover': {
      textDecorationColor: 'inherit',
    },

    '&:focus': {
      borderLeft: `solid ${FOCUS_BORDER_THICKNESS} ${theme.sys.color.action.selected.default}`,
      paddingLeft: `calc(${listPadding} - ${FOCUS_BORDER_THICKNESS})`,
      outline: '0px !important', // (prevents issues with ExB focus effects)
    },
  })
}

export const documentTitle = (theme: IMThemeVariables): SerializedStyles => {
  return css({
    label: 'documentTitle',
    fontWeight: theme.sys.typography.fontWeightBold,
  })
}

export const documentInfo = (theme: IMThemeVariables): SerializedStyles => {
  return css({
    label: 'documentInfo',
    fontWeight: theme.sys.typography.fontWeightLight,
  })
}

export const noDocumentsMessage = (
  theme: IMThemeVariables,
): SerializedStyles => {
  return css({
    label: 'noDocumentsMessage',
    flexBasis: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.sys.color.surface.paperHint,
  })
}
