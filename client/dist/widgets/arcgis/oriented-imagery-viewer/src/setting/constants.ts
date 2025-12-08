import type { SettingInfo } from '../config'

export const toolSettingsInfo: SettingInfo[] = [
  {
    name: 'viewerToolsEnabled',
    labelKey: 'viewerToolsToggleLabel',
    subTools: [
      {
        name: 'imageGalleryEnabled',
        labelKey: 'imageGalleryToolToggleLabel'
      },
      {
        name: 'imageEnahncementEnabled',
        labelKey: 'imageEnhancementToolToggleLabel'
      },
      {
        name: 'mapImageConversionToolEnabled',
        labelKey: 'mapImageConversionToolToggleLabel'
      },
      {
        name: 'showPopupsActionEnabled',
        labelKey: 'showPopupsActionToggleLabel'
      },
      {
        name: 'navigationToolEnabled',
        labelKey: 'navigationToolToggleLabel'
      },
      {
        name: 'directionalNavigationEnabled',
        labelKey: 'directionalNavigationToggleLabel'
      },
      {
        name: 'sequentialNavigationEnabled',
        labelKey: 'sequentialNavigationToggleLabel'
      },
      {
        name: 'measurementToolsEnabled',
        labelKey: 'measurementToolsToggleLabel'
      },
      {
        name: 'imageOverlaysEnabled',
        labelKey: 'imageOverlaysToggleLabel',
        subTools: [
          {
            name: 'dataCaptureEnabled',
            labelKey: 'digitizationToggleLabel'
          }
        ]
      }
    ]
  }
]

export const extentSettingsInfo: SettingInfo[] = [
  {
    name: 'navigateToExtentEnabled',
    labelKey: 'navigateToExtentLabel'
  }
]
