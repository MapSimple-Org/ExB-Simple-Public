import { css, type IMThemeVariables, type SerializedStyles } from 'jimu-core'
import { ExBThemeSpacing } from 'widgets/shared-code/geobim'

export const modelViewerWrapper = (
  _theme: IMThemeVariables,
): SerializedStyles => {
  return css({
    label: 'modelViewerWrapper',
    position: 'relative',
    width: '100%',
    height: '100%',
  })
}

export const modelViewerBody = (_theme: IMThemeVariables): SerializedStyles => {
  return css({
    label: 'modelViewerBody',
    position: 'relative',
    width: '100%',
    height: '100%',
  })
}

export const modelViewerAlert = (theme: IMThemeVariables): SerializedStyles => {
  return css({
    label: 'modelViewerAlert',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: `0 ${theme.sys.spacing(ExBThemeSpacing.Five)} ${theme.sys.spacing(ExBThemeSpacing.Five)} ${theme.sys.spacing(ExBThemeSpacing.Five)}`,

    'div.jimu-alert-panel': {
      width: '100% !important',
    },
  })
}

export const multipleSelectionAlert = (
  theme: IMThemeVariables,
): SerializedStyles => {
  return css({
    label: 'multipleSelectionAlert',
    position: 'absolute',
    bottom: 0,
    left: 0,
    padding: `0 ${theme.sys.spacing(ExBThemeSpacing.Five)} ${theme.sys.spacing(ExBThemeSpacing.Five)} ${theme.sys.spacing(ExBThemeSpacing.Five)}`,

    'div.jimu-alert-panel': {
      width: '100% !important',
    },
  })
}

export const noDocumentMessage = (
  theme: IMThemeVariables,
): SerializedStyles => {
  return css({
    label: 'noDocumentMessage',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    color: theme.sys.color.surface.paperHint,
  })
}
