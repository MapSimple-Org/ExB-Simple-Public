/** @jsx jsx */
import { React, jsx, css, hooks } from 'jimu-core'
import defaultMessages from '../translations/default'
import { defaultMessages as jimuUIMessages, Radio, Label } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import DataAttributeSourceSection from './data-attribute-source-section'
import MapSourceSection from './map-source-section'
import { getDefaultDataAttributeInfo, getDefaultMapInfo, type IMConfig } from '../../config'
import type { RootSettingProps } from '../utils'

export interface SourceSectionProps {
  rootSettingProps: RootSettingProps
  showPlaceholder: boolean
  onConfigUpdate: (newConfig: IMConfig) => void
}

const style = css`
.select-source-type-radio {
  cursor: pointer;
}

.select-source-type-label {
  cursor: pointer;
  word-break: break-all;
}

.multiple-jimu-map-config-component .jimu-tree .jimu-tree-command-list > button {
  pointer-events: none;
}
`

/**
 * Configure data sources or map layers.
 */
export default function SourceSection (props: SourceSectionProps): React.ReactElement {
  const {
    rootSettingProps,
    showPlaceholder,
    onConfigUpdate
  } = props

  const {
    config
  } = rootSettingProps

  const translate = hooks.useTranslation(jimuUIMessages, defaultMessages)
  const isDsSourceChecked = !config.useMap
  const isMapSourceChecked = config.useMap

  const onDsSourceRadioChanged = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    let newConfig = config.set('useMap', false)

    if (!newConfig.dataAttributeInfo) {
      const defaultDataAttributeInfo = getDefaultDataAttributeInfo()
      newConfig = newConfig.set('dataAttributeInfo', defaultDataAttributeInfo)
    }

    // clear newConfig.mapInfo
    newConfig = newConfig.set('mapInfo', {})

    onConfigUpdate(newConfig)
  }, [config, onConfigUpdate])

  const onMapSourceRadioChanged = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    let newConfig = config.set('useMap', true)

    if (!newConfig.mapInfo) {
      const defaultMapInfo = getDefaultMapInfo()
      newConfig = newConfig.set('mapInfo', defaultMapInfo)
    }

    // clear newConfig.dataAttributeInfo.dataSourceItems
    if (newConfig.dataAttributeInfo) {
      newConfig = newConfig.setIn(['dataAttributeInfo', 'dataSourceItems'], [])
    }

    onConfigUpdate(newConfig)
  }, [config, onConfigUpdate])

  const className = showPlaceholder ? 'h-100' : ''

  return (
    <SettingSection title={translate('sourceLabel')} className={className} css={style}>
      <SettingRow>
        <div className='source-radios' role='radiogroup' aria-label={translate('sourceLabel')}>
          <div className='source-radio d-flex'>
            <Radio
              id="select-source-ds-radio"
              name="select-source"
              checked={isDsSourceChecked}
              className='select-source-type-radio'
              onChange={onDsSourceRadioChanged}
            />
            <Label
              for="select-source-ds-radio"
              className="ml-1 select-source-type-label"
              aria-label={translate('selectByAttrbute')}
            >
              {translate('selectByAttrbute')}
            </Label>
          </div>

          <div className='source-radio d-flex mt-3'>
            <Radio
              id="select-source-map-radio"
              name="select-source"
              checked={isMapSourceChecked}
              className='select-source-type-radio'
              onChange={onMapSourceRadioChanged}
            />
            <Label
              for="select-source-map-radio"
              className="ml-1 select-source-type-label"
              aria-label={translate('interactWithMap')}
            >
              {translate('interactWithMap')}
            </Label>
          </div>
        </div>
      </SettingRow>

      {
        isDsSourceChecked &&
        <DataAttributeSourceSection
          rootSettingProps={rootSettingProps}
          showPlaceholder={showPlaceholder}
        />
      }

      {
        isMapSourceChecked &&
        <MapSourceSection
          rootSettingProps={rootSettingProps}
          showPlaceholder={showPlaceholder}
        />
      }
    </SettingSection>
  )
}
