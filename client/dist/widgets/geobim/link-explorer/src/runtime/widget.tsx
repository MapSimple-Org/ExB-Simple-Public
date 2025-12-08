/** @jsx JSX */
/** @jsxFrag React.Fragment */
import type { JSX } from 'react'
import { React, type AllWidgetProps } from 'jimu-core'
import { Paper, WidgetPlaceholder } from 'jimu-ui'
import {
  defaultSharedMessages,
  GeoBIMProvider,
  useSharedMessages,
} from 'widgets/shared-code/geobim'
import type { IMConfig } from '../config'
import defaultMessages from './translations/default'
import linkExplorerIcon from '../../icon.svg'
import LinkExplorer from './components/link-explorer'
const { useCallback } = React

const LinkExplorerWidget = (props: AllWidgetProps<IMConfig>): JSX.Element => {
  const { useMapWidgetIds, intl, theme, widgetId, config, manifest } = props
  const { translateMessage } = useSharedMessages(
    intl,
    manifest.translatedLocales,
  )

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
  const currentMapWidgetId = useMapWidgetIds?.[0]
  const appConfigured = !!currentMapWidgetId

  return (
    <Paper shape="none" className="jimu-widget widget-link-explorer">
      {!appConfigured && (
        <WidgetPlaceholder
          icon={linkExplorerIcon}
          name={i18nMessage('widgetTitle')}
        />
      )}
      {appConfigured && (
        <>
          <GeoBIMProvider mapWidgetId={currentMapWidgetId} widgetId={widgetId}>
            <LinkExplorer
              i18nMessage={i18nMessage}
              theme={theme}
              config={config}
            />
          </GeoBIMProvider>
        </>
      )}
    </Paper>
  )
}

export default LinkExplorerWidget
