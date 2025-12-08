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
  JimuLayerViewSelectorDropdown,
  SettingRow,
  SettingSection
} from 'jimu-ui/advanced/setting-components'
import { type LayersOption, SwipeStyle } from '../../config'
import { isLayersDisabled, isLayersHidden } from '../../utils/utils'

const STYLE = css`
  .img-card {
    background:  var(--ref-palette-neutral-300);
  }
  .swipe-img {
    height: ${polished.rem(160)};
  }
`

const horizontalLeadingImage = require('../assets/simple-horizontal-leading.svg')
const horizontalTrailingImage = require('../assets/simple-horizontal-trailing.svg')
const verticalLeadingImage = require('../assets/simple-vertical-leading.svg')
const verticalTrailingImage = require('../assets/simple-vertical-trailing.svg')
interface ChooseSwipeLayersProps {
  mapViewId: string
  onConfigChange: (key: string[], value: any) => void
  swipeMapViewList: { [mapViewId: string]: LayersOption }
  swipeStyle: SwipeStyle
  folderUrl: string
}

const { useState, useEffect } = React

const ChooseSwipeLayers = (props: ChooseSwipeLayersProps) => {
  const { mapViewId, onConfigChange, swipeMapViewList, swipeStyle } = props
  const [selectedLeadingLayers, setSelectedLeadingLayers] = useState(swipeMapViewList?.[mapViewId]?.leadingLayersId)
  const [selectedTrailingLayers, setSelectedTrailingLayers] = useState(swipeMapViewList?.[mapViewId]?.trailingLayersId)
  const [showHorizontalLeadingGif, setShowHorizontalLeadingGif] = useState(false)
  const [showHorizontalTrailingGif, setShowHorizontalTrailingGif] = useState(false)
  const [showVerticalLeadingGif, setShowVerticalLeadingGif] = useState(false)
  const [showVerticalTrailingGif, setShowVerticalTrailingGif] = useState(false)

  const translate = hooks.useTranslation(defaultMessages)

  const swipeHorizontal = swipeStyle === SwipeStyle.SimpleHorizontal

  const horizontalLeadingGif = `${props.folderUrl}dist/setting/assets/simple-horizontal-leading.gif`
  const horizontalTrailingGif = `${props.folderUrl}dist/setting/assets/simple-horizontal-trailing.gif`
  const verticalLeadingGif = `${props.folderUrl}dist/setting/assets/simple-vertical-leading.gif`
  const verticalTrailingGif = `${props.folderUrl}dist/setting/assets/simple-vertical-trailing.gif`

  useEffect(() => {
    setSelectedLeadingLayers(swipeMapViewList?.[mapViewId]?.leadingLayersId)
    setSelectedTrailingLayers(swipeMapViewList?.[mapViewId]?.trailingLayersId)
  }, [swipeMapViewList, mapViewId])

  const onLeadingChange = (valueObj: string[]) => {
    if (!valueObj) valueObj = []
    setSelectedLeadingLayers(valueObj)

    const newSwipeUseMapView = { ...swipeMapViewList }
    // eslint-disable-next-line no-prototype-builtins
    if (!newSwipeUseMapView.hasOwnProperty(mapViewId)) {
      const layersOption: LayersOption = {
        leadingLayersId: [],
        trailingLayersId: []
      }
      newSwipeUseMapView[mapViewId] = layersOption
    }
    newSwipeUseMapView[mapViewId].leadingLayersId = valueObj
    onConfigChange(['swipeMapViewList'], newSwipeUseMapView)
  }

  const onTrailingChange = (valueObj: string[]) => {
    if (!valueObj) valueObj = []
    setSelectedTrailingLayers(valueObj)

    const newSwipeUseMapView = { ...swipeMapViewList }
    // eslint-disable-next-line no-prototype-builtins
    if (!newSwipeUseMapView.hasOwnProperty(mapViewId)) {
      const layersOption: LayersOption = {
        leadingLayersId: [],
        trailingLayersId: []
      }
      newSwipeUseMapView[mapViewId] = layersOption
    }
    newSwipeUseMapView[mapViewId].trailingLayersId = valueObj
    onConfigChange(['swipeMapViewList'], newSwipeUseMapView)
  }

  return (
    <div css={STYLE}>
      <SettingSection title={translate('selectLeadingLayers')}>
        <SettingRow>
          <JimuLayerViewSelectorDropdown
            jimuMapViewId={mapViewId}
            disableLayers={isLayersDisabled}
            hideLayers={isLayersHidden}
            isMultiSelection={true}
            onChange={onLeadingChange}
            selectedValues={selectedLeadingLayers}
          />
        </SettingRow>
        <SettingRow>
          {swipeHorizontal
            ? <div className='img-card'
              onMouseEnter={() => { setShowHorizontalLeadingGif(true) }}
              onMouseLeave={() => { setShowHorizontalLeadingGif(false) }}
            >
              <Icon
                autoFlip
                className='w-100 swipe-img'
                icon={showHorizontalLeadingGif ? horizontalLeadingGif : horizontalLeadingImage}
              />
            </div>
            : <div className='img-card'
                onMouseEnter={() => { setShowVerticalLeadingGif(true) }}
                onMouseLeave={() => { setShowVerticalLeadingGif(false) }}
              >
              <Icon
                autoFlip
                className='w-100 swipe-img'
                icon={showVerticalLeadingGif ? verticalLeadingGif : verticalLeadingImage}
              />
            </div>
          }
        </SettingRow>
      </SettingSection>
      <SettingSection title={translate('selectTrailingLayers')}>
        <SettingRow>
          <JimuLayerViewSelectorDropdown
            jimuMapViewId={mapViewId}
            disableLayers={isLayersDisabled}
            hideLayers={isLayersHidden}
            isMultiSelection={true}
            onChange={onTrailingChange}
            selectedValues={selectedTrailingLayers}
          />
        </SettingRow>
        <SettingRow>
          {swipeHorizontal
            ? <div className='img-card'
              onMouseEnter={() => { setShowHorizontalTrailingGif(true) }}
              onMouseLeave={() => { setShowHorizontalTrailingGif(false) }}
            >
              <Icon
                autoFlip
                className='w-100 swipe-img'
                icon={showHorizontalTrailingGif ? horizontalTrailingGif : horizontalTrailingImage}
              />
            </div>
            : <div className='img-card'
                onMouseEnter={() => { setShowVerticalTrailingGif(true) }}
                onMouseLeave={() => { setShowVerticalTrailingGif(false) }}
              >
              <Icon
                autoFlip
                className='w-100 swipe-img'
                icon={showVerticalTrailingGif ? verticalTrailingGif : verticalTrailingImage}
              />
            </div>
          }
        </SettingRow>
      </SettingSection>
    </div>
  )
}

export default ChooseSwipeLayers
