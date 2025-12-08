/** @jsx JSX */
/** @jsxFrag React.Fragment */
import type { JSX } from 'react'
import { React, type AllWidgetProps } from 'jimu-core'
import { Paper } from 'jimu-ui'
import {
  defaultSharedMessages,
  GeoBIMProvider,
  useSharedMessages,
} from 'widgets/shared-code/geobim'
import type { IMConfig } from '../config'
import defaultMessages from './translations/default'
import ModelViewerWidget from './components/model-viewer-widget'
const { useCallback } = React

const DocumentViewerWidget = (props: AllWidgetProps<IMConfig>): JSX.Element => {
  const { useMapWidgetIds, intl, theme, widgetId, state, manifest } = props
  const { translateMessage } = useSharedMessages(
    intl,
    manifest.translatedLocales,
  )
  const currentMapWidgetId = useMapWidgetIds?.[0]

  const i18nMessage = useCallback(
    (
      id:
        | keyof typeof defaultMessages
        | keyof typeof defaultSharedMessages.default,
      values?: { [key: string]: string },
    ): string => {
      // NOTE: defaultMessages is last to ensure it takes priority over defaultSharedMessages
      const defaultLocaleMessages = {
        ...defaultSharedMessages.default,
        ...defaultMessages,
      }
      // In the future if strings get loaded by the framework then we can restore
      // the following call to formatMessage and remove the call to translateMessage
      // and the useSharedMessages hook.
      // return intl.formatMessage({ id: id, defaultMessage: messages[id] }, values)
      return translateMessage(id, defaultLocaleMessages, values)
    },
    [translateMessage],
  )

  return (
    <Paper shape="none" className="jimu-widget widget-document-viewer">
      <>
        <GeoBIMProvider
          mapWidgetId={currentMapWidgetId}
          widgetId={widgetId}
          widgetState={state}
        >
          <ModelViewerWidget
            i18nMessage={i18nMessage}
            theme={theme}
            widgetId={widgetId}
          />
        </GeoBIMProvider>
      </>
    </Paper>
  )
}

export default DocumentViewerWidget
