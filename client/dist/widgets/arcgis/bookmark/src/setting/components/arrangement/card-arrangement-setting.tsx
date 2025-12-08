/** @jsx jsx */
import { React, jsx, hooks, lodash } from 'jimu-core'
import { DEFAULT_CARD_ITEM_SPACE, ITEM_MIN_SIZE, OLD_CARD_TEMPLATE_WIDTH, SCROLL_BAR_WIDTH } from '../../../constants'
import { Button, CollapsablePanel, DistanceUnits, type LinearUnit, Tooltip, utils as jimuUtils } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../../translations/default'
import { InputRatio, SizeEditor } from 'jimu-ui/advanced/style-setting-components'
import { LayoutItemSizeModes } from 'jimu-layouts/layout-runtime'
import { ItemSizeType, type ElementSizeUnit, type ElementSize, type IMConfig } from '../../../config'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { LockOutlined } from 'jimu-icons/outlined/editor/lock'
import { UnlockOutlined } from 'jimu-icons/outlined/editor/unlock'
import { ItemSizeSelector } from './item-size-selector'

const { useState, useRef } = React

interface CardArrangementSettingProps {
  widgetId: string
  savedConfig: Partial<IMConfig>
  cardItemWidth: number | string
  cardItemHeight: number | string
  widgetRect: ElementSize
  onPropertyChange: (name: any, value: any) => void
  onSettingChange: SettingChangeFunction
  keepAspectRatio: boolean
  cardItemSizeRatio: number
  itemSizeType: ItemSizeType
}

export const CardArrangementSetting = (props: CardArrangementSettingProps) => {
  //Before 2024R03, the old card template has a fixed width of 150px. OLD_CARD_TEMPLATE_WIDTH is set to avoid the regression issue #21431.
  const { widgetId, savedConfig, cardItemWidth = OLD_CARD_TEMPLATE_WIDTH, cardItemHeight, widgetRect, onPropertyChange, onSettingChange, keepAspectRatio, cardItemSizeRatio, itemSizeType } = props

  const [showArrangement, setShowArrangement] = useState(true)
  const [aspectRatio, setAspectRatio] = useState(null)

  const aspectRatioRef = useRef<string>(null)

  const translate = hooks.useTranslation(defaultMessages)

  const widthAvailableUnits = [DistanceUnits.PIXEL, DistanceUnits.PERCENTAGE]
  const heightAvailableUnits = [DistanceUnits.PIXEL]
  const itemWidthLinearUnit = jimuUtils.toLinearUnit(cardItemWidth)
  const itemHeightLinearUnit = jimuUtils.toLinearUnit(cardItemHeight)

  const debounceGridItemSizeRatioChange = lodash.debounce(
    (value) => { handleCardItemSizeRatioChange(value) },
    200
  )

  const handleCardItemSizeChange = (valueInt: LinearUnit, isHeight: boolean) => {
    const oldCardSizeUnit = getCardSizeUnit(cardItemWidth || OLD_CARD_TEMPLATE_WIDTH, cardItemHeight)
    const oldSize = isHeight ? oldCardSizeUnit?.height : oldCardSizeUnit?.width
    const cardContentSize = isHeight ? widgetRect?.height : getCardActualContentPxWidth()

    let minSize = ITEM_MIN_SIZE
    if (valueInt?.unit === DistanceUnits.PERCENTAGE) {
      minSize = isHeight ? (ITEM_MIN_SIZE * 100) / cardContentSize : ((ITEM_MIN_SIZE + DEFAULT_CARD_ITEM_SPACE) * 100) / cardContentSize
    }

    const isDistanceUnitsChange = checkIsDistanceUnitsChange(valueInt, isHeight)
    if (isDistanceUnitsChange && !isHeight) {
      if (valueInt.unit === DistanceUnits.PIXEL) {
        valueInt.distance = oldSize.distance * cardContentSize / 100 - DEFAULT_CARD_ITEM_SPACE
      }
      if (valueInt.unit === DistanceUnits.PERCENTAGE) {
        valueInt.distance = ((oldSize.distance + DEFAULT_CARD_ITEM_SPACE) * 100) / cardContentSize
      }
    }

    const value = valueInt.distance < minSize ? minSize : valueInt.distance
    valueInt.distance = value

    if (isHeight) {
      const newHeight = jimuUtils.stringOfLinearUnit(valueInt)
      onPropertyChange('cardItemHeight', newHeight)
    } else {
      const newWidth = jimuUtils.stringOfLinearUnit(valueInt)
      let newConfig = savedConfig.set('cardItemWidth', newWidth)
      if (keepAspectRatio) {
        const widthPx = valueInt?.unit === DistanceUnits.PERCENTAGE ? (value * cardContentSize / 100) : value
        const newHeight = widthPx * cardItemSizeRatio
        newConfig = newConfig.set('cardItemHeight', newHeight)
      }
      onSettingChange({ id: widgetId, config: newConfig })
    }
  }

  const getCardSizeUnit = (width: number | string, height: number | string): ElementSizeUnit => {
    return {
      width: jimuUtils.toLinearUnit(width),
      height: jimuUtils.toLinearUnit(height)
    }
  }

  const getCardActualContentPxWidth = (): number => {
    return (widgetRect?.width - SCROLL_BAR_WIDTH * 2) || 0
  }

  const checkIsDistanceUnitsChange = (valueInt: LinearUnit, isHeight: boolean): boolean => {
    const oldCardSizeUnit = getCardSizeUnit(cardItemWidth || OLD_CARD_TEMPLATE_WIDTH, cardItemHeight)
    const size = isHeight ? oldCardSizeUnit?.height : oldCardSizeUnit?.width
    if (valueInt.unit === size.unit) {
      return false
    } else if (!size.unit && valueInt.unit === DistanceUnits.PIXEL) {
      return false
    } else {
      return true
    }
  }

  const handleKeepAspectRatioChange = () => {
    let newConfig = savedConfig.set('keepAspectRatio', !keepAspectRatio)
    setAspectRatio(null)
    aspectRatioRef.current = null
    if (!keepAspectRatio) {
      const cardSize = getCardSizeUnit(cardItemWidth || OLD_CARD_TEMPLATE_WIDTH, cardItemHeight)
      const widthPx = getCardPxWidthFromCardSize(cardSize.width)
      const cardItemSizeRatio = cardSize.height.distance / widthPx
      newConfig = newConfig.set('cardItemSizeRatio', cardItemSizeRatio)
    }
    onSettingChange({ id: widgetId, config: newConfig })
  }

  const getCardPxWidthFromCardSize = (width: LinearUnit): number => {
    let widthPx: number
    if (width.unit === DistanceUnits.PERCENTAGE) {
      const cardContentWidth = getCardActualContentPxWidth()
      //The space should be removed. Because the width in percentage includes space, the width in px does not include space.
      widthPx = width.distance * cardContentWidth / 100 - DEFAULT_CARD_ITEM_SPACE
    } else {
      widthPx = width.distance
    }
    return widthPx
  }

  const getAspectRatio = (cardItemSizeRatio: number, aspectRatio: string): string => {
    if (!aspectRatio && !aspectRatioRef.current) {
      return `100:${cardItemSizeRatio * 100} `
    } else {
      return aspectRatio || aspectRatioRef.current
    }
  }

  const handleCardItemSizeRatioChange = (value: string) => {
    const aspectRatios = value?.split(':')
    const aspectRatiosH = Number(aspectRatios?.[1])
    const aspectRatiosW = Number(aspectRatios?.[0])
    if (aspectRatiosH <= 0 || aspectRatiosW <= 0) {
      return false
    }
    const ratio = aspectRatiosH / aspectRatiosW
    if (!ratio) return false
    const oldCardSize = getCardSizeByRatio(ratio, cardItemWidth || OLD_CARD_TEMPLATE_WIDTH, cardItemHeight)
    const newCardWidth = jimuUtils.stringOfLinearUnit(oldCardSize.width)
    const newCardHeight = jimuUtils.stringOfLinearUnit(oldCardSize.height)
    setAspectRatio(value)
    aspectRatioRef.current = value
    const newConfig = savedConfig.set('cardItemSizeRatio', ratio).set('cartItemWidth', newCardWidth).set('cardItemHeight', newCardHeight)
    onSettingChange({ id: widgetId, config: newConfig })
  }

  const getCardSizeByRatio = (ratio: number, width: number | string, height: number | string): ElementSizeUnit => {
    const cardSize = getCardSizeUnit(width, height)
    const widthPx = getCardPxWidthFromCardSize(cardSize.width)
    cardSize.height.distance = ratio * widthPx
    return cardSize
  }

  return (
    <SettingSection>
      <CollapsablePanel
        label={translate('arrangement')}
        isOpen={showArrangement}
        onRequestOpen={() => { setShowArrangement(true) }}
        onRequestClose={() => { setShowArrangement(false) }}
        role='group'
        aria-label={translate('arrangement')}
      >
        <ItemSizeSelector
          itemSizeType={itemSizeType}
          onPropertyChange={onPropertyChange}
        />
        {itemSizeType === ItemSizeType.Custom && <React.Fragment><SettingRow label={translate('width')} aria-label={translate('width')}>
          <div className='card-size-edit'>
            <SizeEditor
              disableModeSelect
              label='W'
              mode={LayoutItemSizeModes.Custom}
              value={itemWidthLinearUnit}
              availableUnits={widthAvailableUnits}
              onChange={value => { handleCardItemSizeChange(value, false) }}
            />
          </div>
        </SettingRow>
        <div
          className='ml-1 d-flex'
        >
          <Tooltip title={translate('keepAspectRatio')} placement='bottom'>
            <Button size='sm' type='tertiary' onClick={handleKeepAspectRatioChange} icon aria-pressed={keepAspectRatio}>
              {keepAspectRatio ? <LockOutlined size='s' /> : <UnlockOutlined size='s' />}
            </Button>
          </Tooltip>
        </div>
        <SettingRow label={translate('height')} aria-label={translate('height')}>
          <div className='card-size-edit'>
            <SizeEditor
              label='H'
              disableModeSelect
              mode={LayoutItemSizeModes.Custom}
              value={itemHeightLinearUnit}
              availableUnits={heightAvailableUnits}
              onChange={value => { handleCardItemSizeChange(value, true) }}
              disabled={keepAspectRatio}
            />
          </div>
        </SettingRow>
        {keepAspectRatio &&
          <SettingRow label={translate('aspectRatio')} aria-label={translate('aspectRatio')}>
            <InputRatio style={{ width: '7.5rem' }} value={getAspectRatio(cardItemSizeRatio, aspectRatio)} onChange={debounceGridItemSizeRatioChange} />
          </SettingRow>}
        </React.Fragment>}
      </CollapsablePanel>
    </SettingSection>
  )
}
