/** @jsx jsx */
import {
  jsx,
  React,
  css,
  polished,
  hooks
} from 'jimu-core'
import {
  Icon
} from 'jimu-ui'
import defaultMessages from '../translations/default'
import {
  SettingRow,
  SettingSection,
  JimuLayerViewSelectorDropdown
} from 'jimu-ui/advanced/setting-components'
import { SwipeStyle } from '../../config'
import { isLayersDisabled, isLayersHidden } from '../../utils/utils'

const STYLE = css`
  .img-card {
    background:  var(--ref-palette-neutral-300);
  }
  .swipe-img {
    height: ${polished.rem(160)};
  }
`

const horizontalScrollingImage = require('../assets/advanced-horizontal-scrolling.svg')
const verticalScrollingImage = require('../assets/advanced-vertical-scrolling.svg')

interface ChooseScrollLayersProps {
  folderUrl: string
  mapViewId: string
  onConfigChange: (key: string[], value: any) => void
  scrollMapViewList: { [mapViewId: string]: string[] }
  swipeStyle: SwipeStyle
}

const { useState, useEffect } = React

const ChooseScrollLayers = (props: ChooseScrollLayersProps) => {
  const { mapViewId, onConfigChange, scrollMapViewList, swipeStyle } = props
  const [selectedScrollLayers, setSelectedScrollLayers] = useState(scrollMapViewList?.[mapViewId])
  const [showHorizontalScrollingGif, setShowHorizontalScrollingGif] = useState(false)
  const [showVerticalScrollingGif, setShowVerticalScrollingGif] = useState(false)
  const translate = hooks.useTranslation(defaultMessages)
  const swipeHorizontal = swipeStyle === SwipeStyle.AdvancedHorizontal

  const horizontalScrollingGif = `${props.folderUrl}dist/setting/assets/advanced-horizontal-scrolling.gif`
  const verticalScrollingGif = `${props.folderUrl}dist/setting/assets/advanced-vertical-scrolling.gif`

  useEffect(() => {
    setSelectedScrollLayers(scrollMapViewList?.[mapViewId])
  }, [scrollMapViewList, mapViewId])

  const onScrollChange = (valueObj: string[]) => {
    if (!valueObj) valueObj = []
    setSelectedScrollLayers(valueObj)

    const newScrollUseMapView = { ...scrollMapViewList }
    // eslint-disable-next-line no-prototype-builtins
    if (!newScrollUseMapView.hasOwnProperty(mapViewId)) {
      newScrollUseMapView[mapViewId] = []
    }
    newScrollUseMapView[mapViewId] = valueObj
    onConfigChange(['scrollMapViewList'], newScrollUseMapView)
  }

  return (
    <div css={STYLE}>
      <SettingSection title={translate('selectScrollLayers')}>
        <SettingRow>
            <JimuLayerViewSelectorDropdown
              jimuMapViewId={mapViewId}
              disableLayers={isLayersDisabled}
              hideLayers={isLayersHidden}
              isMultiSelection={true}
              onChange={onScrollChange}
              selectedValues={selectedScrollLayers}
          />
        </SettingRow>
        <SettingRow>
          {swipeHorizontal
            ? <div className='img-card'
              onMouseEnter={() => { setShowHorizontalScrollingGif(true) }}
              onMouseLeave={() => { setShowHorizontalScrollingGif(false) }}
            >
              <Icon
                autoFlip
                className='w-100 swipe-img'
                icon={showHorizontalScrollingGif ? horizontalScrollingGif : horizontalScrollingImage}
              />
            </div>
            : <div className='img-card'
                onMouseEnter={() => { setShowVerticalScrollingGif(true) }}
                onMouseLeave={() => { setShowVerticalScrollingGif(false) }}
              >
              <Icon
                autoFlip
                className='w-100 swipe-img'
                icon={showVerticalScrollingGif ? verticalScrollingGif : verticalScrollingImage}
              />
            </div>
          }
        </SettingRow>
      </SettingSection>
    </div>
  )
}

export default ChooseScrollLayers
