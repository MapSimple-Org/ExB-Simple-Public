/** @jsx jsx */
import { React, jsx, hooks } from 'jimu-core'
import { ITEM_MIN_SIZE } from '../../../constants'
import { AdvancedButtonGroup, Button, CollapsablePanel, NumericInput, Slider } from 'jimu-ui'
import { SettingRow, SettingSection } from 'jimu-ui/advanced/setting-components'
import defaultMessages from '../../translations/default'
import { ItemSizeType, DirectionType } from '../../../config'
import { ItemSizeSelector } from './item-size-selector'
import { ArrowRightOutlined } from 'jimu-icons/outlined/directional/arrow-right'
import { ArrowDownOutlined } from 'jimu-icons/outlined/directional/arrow-down'

const { useState } = React

const directions = [
  { icon: 'right', value: DirectionType.Horizon },
  { icon: 'down', value: DirectionType.Vertical }
]

interface GalleryArrangementSettingProps {
  direction: DirectionType
  handleDirectionClick: (evt: any) => void
  handleFormChange: (evt: any) => void
  galleryItemSpace: number
  onPropertyChange: (name: any, value: any) => void
  itemSizeType: ItemSizeType
  galleryItemWidth: number
  galleryItemHeight: number
}

export const GalleryArrangementSetting = (props: GalleryArrangementSettingProps) => {
  const { direction, handleDirectionClick, handleFormChange, galleryItemSpace, onPropertyChange, itemSizeType, galleryItemWidth, galleryItemHeight } = props

  const [showArrangement, setShowArrangement] = useState(true)

  const translate = hooks.useTranslation(defaultMessages)
  const isVertical = direction === DirectionType.Vertical

  const handleGalleryItemSpaceChange = (value: number) => {
    onPropertyChange('galleryItemSpace', value)
  }

  const handleGalleryItemSizeChange = (value: number, isVertical: boolean) => {
    const val = value ?? ITEM_MIN_SIZE
    isVertical ? onPropertyChange('galleryItemHeight', val) : onPropertyChange('galleryItemWidth', val)
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
        <SettingRow className='mt-2' label={translate('direction')} role='group' aria-label={translate('direction')}>
          <AdvancedButtonGroup size='sm'>
            {
              directions.map((data, i) => {
                return (
                  <Button
                    key={i} icon active={direction === data.value}
                    data-value={data.value}
                    onClick={handleDirectionClick}
                    aria-label={data.icon === 'right' ? translate('horizontal') : translate('vertical')}
                  >
                    {data.icon === 'right' ? <ArrowRightOutlined size='s' /> : <ArrowDownOutlined size='s' />}
                  </Button>
                )
              })
            }
          </AdvancedButtonGroup>
        </SettingRow>
        <SettingRow
          flow='wrap'
          role='group'
          label={(isVertical ? translate('verticalSpacing') : translate('horizontalSpacing')) + ' (px)'}
          aria-label={(isVertical ? translate('verticalSpacing') : translate('horizontalSpacing')) + ' (px)'}
        >
          <div className='d-flex justify-content-between w-100 align-items-center'>
            <Slider
              style={{ width: '60%' }}
              data-field={'galleryItemSpace'}
              onChange={handleFormChange}
              value={galleryItemSpace ?? 24}
              title='0-50'
              min={0}
              max={50}
            />
            <NumericInput
              style={{ width: '25%' }}
              value={galleryItemSpace ?? 24}
              min={0}
              max={50}
              title='0-50'
              onChange={handleGalleryItemSpaceChange}
            />
          </div>
        </SettingRow>
        <ItemSizeSelector
          itemSizeType={itemSizeType}
          onPropertyChange={onPropertyChange}
        />
        {itemSizeType === ItemSizeType.Custom &&
          <SettingRow
            flow='wrap'
            role='group'
            label={`${isVertical ? translate('height') : translate('width')} (px)`}
            aria-label={`${isVertical ? translate('height') : translate('width')} (px)`}
          >
            <NumericInput
              style={{ width: '100%' }}
              value={isVertical ? (galleryItemHeight ?? 237.5) : (galleryItemWidth ?? 200)}
              min={ITEM_MIN_SIZE}
              onChange={(value) => { handleGalleryItemSizeChange(value, isVertical) }}
            />
          </SettingRow>}
      </CollapsablePanel>
    </SettingSection>
  )
}
