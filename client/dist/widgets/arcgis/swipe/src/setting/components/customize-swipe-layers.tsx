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
import ChooseSwipeLayers from './choose-swipe-layers'
import type { LayersOption, SwipeStyle } from '../../config'
import { getJimuMapViewId, isWebMap } from '../../utils/utils'

const { useState, useRef, useCallback } = React
const STYLE = css`
  .text-container {
    margin-top: 12px;
  }
  .layer-remind {
    color: var(--ref-palette-neutral-1000);
    font-size: ${polished.rem(13)};
  }
`
interface CustomizeSwipeLayersProps {
  useMapWidgetId: string
  onConfigChange: (key: string[], value: any) => void
  swipeMapViewList: { [mapViewId: string]: LayersOption }
  swipeStyle: SwipeStyle
  folderUrl: string
  mapUseDataSources: ImmutableArray<string>
}

const CustomizeSwipeLayers = (props: CustomizeSwipeLayersProps) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)
  const { useMapWidgetId, onConfigChange, swipeMapViewList, swipeStyle, mapUseDataSources } = props
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
        <span className='w-100 layer-remind'>{translate('layerRemind')}</span>
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
                <ChooseSwipeLayers
                  mapViewId={getJimuMapViewId(useMapWidgetId, dsId)}
                  onConfigChange={onConfigChange}
                  swipeMapViewList={swipeMapViewList}
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
            />
          }
        </div>
      </SettingRow>
    </SettingSection>
  )
}

export default CustomizeSwipeLayers
