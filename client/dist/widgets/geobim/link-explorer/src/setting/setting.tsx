/** @jsx JSX */
import type { JSX } from 'react'
import { React, getAppStore } from 'jimu-core'
import type { AllWidgetSettingProps } from 'jimu-for-builder'
import { Select, Option } from 'jimu-ui'
import {
  SettingSection,
  SettingRow,
  MapWidgetSelector,
} from 'jimu-ui/advanced/setting-components'
import {
  defaultSharedMessages,
  FeatureServiceErrors,
  GeoBIMWidgetNames,
  useSharedMessages,
} from 'widgets/shared-code/geobim'
import type { IMConfig } from '../config'
import defaultMessages from './translations/default'
const { useCallback } = React

interface ModelViewerWidgets {
  [widgetKey: string]: string | undefined // (widgetKey: widgetLabel)
}

const LinkExplorerWidgetSetting = (
  props: AllWidgetSettingProps<IMConfig>,
): JSX.Element => {
  const { useMapWidgetIds, id, config, intl, theme, manifest } = props
  const { modelViewerWidgetId } = config
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

  // NOTE: Despite useMapWidgetIds being an array, MapWidgetSelector only returns one map ID
  const onMapWidgetSelected = (newUseMapWidgetIds: string[]): void => {
    // NOTE: It's not documented, but settings will NOT be saved without supplying the ID!
    props.onSettingChange({ id, useMapWidgetIds: newUseMapWidgetIds })
  }

  const onModelViewerWidgetSelected = (modelViewerWidgetId: string): void => {
    props.onSettingChange({
      id: id,
      config: config.set('modelViewerWidgetId', modelViewerWidgetId),
    })
  }

  const removeOutdatedModelViewerWidgetId = (
    modelViewerWidgets: ModelViewerWidgets,
  ): void => {
    if (
      modelViewerWidgetId !== '' &&
      modelViewerWidgets[modelViewerWidgetId] == null
    ) {
      onModelViewerWidgetSelected('')
    }
  }

  const getModelViewerWidgets = (): ModelViewerWidgets => {
    const appWidgets =
      getAppStore().getState().appStateInBuilder?.appConfig.widgets
    const modelViewerWidgets: ModelViewerWidgets = {}
    if (appWidgets != null) {
      Object.keys(appWidgets).forEach((key) => {
        if (
          appWidgets[key].manifest.name ===
          (GeoBIMWidgetNames.DOCUMENT_VIEWER as string)
        ) {
          modelViewerWidgets[key] = appWidgets[key].label
        }
      })
    }
    return modelViewerWidgets
  }

  const renderModelViewerList = (): JSX.Element => {
    const modelViewerWidgets: ModelViewerWidgets = getModelViewerWidgets()
    removeOutdatedModelViewerWidgetId(modelViewerWidgets)

    return (
      <Select
        size="sm"
        useFirstOption={true}
        onChange={(evt: React.ChangeEvent<HTMLSelectElement>) => {
          onModelViewerWidgetSelected(evt.currentTarget.value)
        }}
        value={modelViewerWidgetId}
      >
        <Option key="None" value="">
          {i18nMessage('geobimNoneSetting')}
        </Option>
        {Object.entries(modelViewerWidgets).map(([widgetId, widgetLabel]) => {
          return (
            <Option key={widgetId} value={widgetId}>
              {widgetLabel}
            </Option>
          )
        })}
      </Select>
    )
  }

  return (
    <div className="widget-setting-link-explorer">
      <SettingSection title={i18nMessage('settingsLabel')}>
        <SettingRow>{i18nMessage('selectMapSetting')}</SettingRow>
        <SettingRow>
          <MapWidgetSelector
            autoSelect={true}
            onSelect={onMapWidgetSelected}
            useMapWidgetIds={useMapWidgetIds}
          />
        </SettingRow>
        <SettingRow>
          <FeatureServiceErrors
            useMapWidgetIds={useMapWidgetIds}
            theme={theme}
            errorType="info"
            noFeatureServiceErrorText={i18nMessage(
              'geobim_noFeatureServiceSettingsWarning',
            )}
            multipleFeatureServicesErrorText={i18nMessage(
              'geobim_multipleFeatureServicesSettingsWarning',
            )}
            infoMessageText={i18nMessage(
              'geobim_bimCloudConnectionSettingsTip',
            )}
          />
        </SettingRow>
        <SettingRow>{i18nMessage('selectModelViewer')}</SettingRow>
        <SettingRow>{renderModelViewerList()}</SettingRow>
      </SettingSection>
    </div>
  )
}

export default LinkExplorerWidgetSetting
