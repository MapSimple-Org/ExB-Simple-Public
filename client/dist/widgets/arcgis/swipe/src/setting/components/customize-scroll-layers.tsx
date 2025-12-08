/** @jsx jsx */
import {
  jsx,
  React,
  css,
  polished,
  hooks,
  type ImmutableArray
} from 'jimu-core'
import {
  Alert,
  defaultMessages as jimuUIMessages
} from 'jimu-ui'
import defaultMessages from '../translations/default'
import {
  SettingSection,
  SettingRow,
  MultipleJimuMapConfig,
  type MultipleJimuMapValidateResult
} from 'jimu-ui/advanced/setting-components'
import ChooseScrollLayers from './choose-scroll-layers'
import type { SwipeStyle } from '../../config'
import { getJimuMapViewId, isWebMap } from '../../utils/utils'

const { useState, useRef, useCallback } = React
const STYLE = css`
  .layer-remind {
    color: var(--ref-palette-neutral-1000);
    font-size: ${polished.rem(13)};
  }
  .text-container {
    margin-top: 12px;
  }
`
interface CustomizeScrollLayersProps {
  useMapWidgetId: string
  onConfigChange: (key: string[], value: any) => void
  scrollMapViewList: { [mapViewId: string]: string[] }
  swipeStyle: SwipeStyle
  folderUrl: string
  mapUseDataSources: ImmutableArray<string>
}

const CustomizeScrollLayers = (props: CustomizeScrollLayersProps) => {
  const { useMapWidgetId, onConfigChange, scrollMapViewList, swipeStyle, mapUseDataSources } = props
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)
  const [dsId, setDsId] = useState(null)
  const customizeLayersRef = useRef<HTMLDivElement>(null)

  const onListItemBodyClick = (dataSourceId: string) => {
    setDsId(dataSourceId)
  }

  const isDataSourceValid = useCallback((dataSourceId: string): MultipleJimuMapValidateResult => {
    if (isWebMap(dataSourceId)) {
      return {
        isValid: true
      }
    } else {
      return {
        isValid: false,
        invalidMessage: translate('webSceneNotSupported')
      }
    }
  }, [translate])

  return (
    <SettingSection
      title={
        <div>
          {translate('customizeSettings')}
        </div>
      }
      css={STYLE}
    >
      <SettingRow flow='wrap' className='text-container'>
        <span className='w-100 layer-remind'>{translate('scrollRemind')}</span>
      </SettingRow>
      <SettingRow>
        <div className='w-100'>
          {(mapUseDataSources?.length === 1 || mapUseDataSources?.length === 2)
            ? <MultipleJimuMapConfig
              mapWidgetId={useMapWidgetId}
              forwardRef={(ref: HTMLDivElement) => {
                customizeLayersRef.current = ref
              }}
              onClick={onListItemBodyClick}
              isDataSourceValid={isDataSourceValid}
              sidePopperContent={
                <ChooseScrollLayers
                  mapViewId={getJimuMapViewId(useMapWidgetId, dsId)}
                  onConfigChange={onConfigChange}
                  scrollMapViewList={scrollMapViewList}
                  swipeStyle={swipeStyle}
                  folderUrl={props.folderUrl}
                />
              }
            />
            : <Alert
              tabIndex={0}
              className={'warningMsg w-100'}
              open
              text={translate('mapEmpty')}
              type={'warning'}
            />}
        </div>
      </SettingRow>
    </SettingSection>
  )
}

export default CustomizeScrollLayers
