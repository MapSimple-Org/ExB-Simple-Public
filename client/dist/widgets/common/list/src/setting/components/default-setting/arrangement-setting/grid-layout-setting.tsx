/** @jsx jsx */
import { jsx, React, hooks, css, lodash } from 'jimu-core'
import type { BrowserSizeMode, SizeModeLayoutJson } from 'jimu-core'
import { LayoutItemSizeModes, defaultMessages as jimuLayoutsDefaultMessages } from 'jimu-layouts/layout-runtime'
import { SettingRow } from 'jimu-ui/advanced/setting-components'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { Slider, Tooltip, TextAlignValue, DistanceUnits, utils as uiUtils, type LinearUnit, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { SizeEditor, InputRatio, TextAlignment } from 'jimu-ui/advanced/style-setting-components'
import { MyNumericInput } from '../../my-input'
import type { IMConfig, CardSize, Status, ElementSize, ElementSizeUnit } from '../../../../config'
import { LIST_CARD_MIN_SIZE } from '../../../../config'
import { getCardSizeUnit, getListActualContentPxWidth, checkIsDistanceUnitsChange, getCardPxWidthFormCardSize } from '../../../utils/utils'
import { handleResizeCard } from '../../../../common-builder-support'
import ItemSizeLabel from './item-size-label'
import defaultMessages from '../../../translations/default'
import { LockOutlined } from 'jimu-icons/outlined/editor/lock'
import { UnlockOutlined } from 'jimu-icons/outlined/editor/unlock'

const { useState, useEffect, useRef } = React

interface Props {
  id: string
  config: IMConfig
  browserSizeMode: BrowserSizeMode
  builderStatus: Status
  widgetRect: ElementSize
  showCardSetting: Status
  layouts: { [name: string]: SizeModeLayoutJson }
  onPropertyChange: (name, value) => void
  handleFormChange: (evt) => void
  onSettingChange: SettingChangeFunction
}

const GridLayoutSetting = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessages, jimuUIDefaultMessages, jimuLayoutsDefaultMessages)
  const aspectRatioRef = useRef(null)
  const debounceGridItemSizeRatioChangeRef = useRef(null)

  const { id, config, browserSizeMode, builderStatus, showCardSetting, layouts, widgetRect } = props
  const { onPropertyChange, handleFormChange, onSettingChange } = props

  const [cardSize, setCardSize] = useState(null)
  const [aspectRatio, setAspectRatio] = useState(null as string)

  useEffect(() => {
    const cardSize = getCardSizeUnit({config, builderStatus, browserSizeMode})
    setCardSize(cardSize)
    debounceGridItemSizeRatioChangeRef.current = lodash.debounce(
      (value) => { handleGridItemSizeRatioChange(value) },
      200
    )
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config, builderStatus, browserSizeMode])

  const availableUnits = [DistanceUnits.PIXEL, DistanceUnits.PERCENTAGE]
  const inputStyle = { width: '7.5rem' }
  const heightAvailableUnits = [DistanceUnits.PIXEL]

  const handleGridItemSizeChange = (valueInt: LinearUnit, isHeight: boolean = false) => {
    const oldCardSizeUnit = getCardSizeUnit({config, builderStatus, browserSizeMode})
    const oldSize = isHeight ? oldCardSizeUnit?.height : oldCardSizeUnit?.width
    const listConSize = isHeight ? widgetRect?.height : getListActualContentPxWidth(config?.horizontalSpace, widgetRect)
    const newCardSize = getCardSize()

    let minSize = LIST_CARD_MIN_SIZE
    if (valueInt?.unit === DistanceUnits.PERCENTAGE) {
      minSize = isHeight ? (LIST_CARD_MIN_SIZE * 100) / listConSize : ((LIST_CARD_MIN_SIZE + config?.horizontalSpace) * 100) / listConSize
    }

    const isDistanceUnitsChange = checkIsDistanceUnitsChange({ valueInt, isHeight, config, builderStatus, browserSizeMode })
    if (isDistanceUnitsChange && !isHeight) {
      if (valueInt.unit === DistanceUnits.PIXEL) {
        valueInt.distance = oldSize.distance * listConSize / 100 - config?.horizontalSpace
      }
      if (valueInt.unit === DistanceUnits.PERCENTAGE) {
        valueInt.distance = ((oldSize.distance + config?.horizontalSpace) * 100) / listConSize
      }
    }

    const value = valueInt.distance < minSize ? minSize : valueInt.distance
    valueInt.distance = value

    if (isHeight) {
      newCardSize.height = uiUtils.stringOfLinearUnit(valueInt)
    } else {
      newCardSize.width = uiUtils.stringOfLinearUnit(valueInt)
      const widthPx = valueInt?.unit === DistanceUnits.PERCENTAGE ? (value * listConSize / 100) : value
      if (config?.keepAspectRatio) {
        const height = widthPx * config?.gridItemSizeRatio
        newCardSize.height = `${height}px`
      }
    }
    const resizeOption = {
      widgetId: id,
      widgetConfig: config,
      browserSizeMode: browserSizeMode,
      newCardSize: newCardSize
    }
    handleResizeCard(resizeOption).exec()
  }

  const getCardSize = hooks.useEventCallback((): CardSize => {
    const oldCardSize = getCardSizeUnit({config, builderStatus, browserSizeMode})
    return {
      width: uiUtils.stringOfLinearUnit(oldCardSize.width),
      height: uiUtils.stringOfLinearUnit(oldCardSize.height)
    }
  })

  const handleAlignmentChange = (alignment: TextAlignValue) => {
    onPropertyChange('gridAlignment', alignment)
  }

  const handleGridItemSizeRatioChange = hooks.useEventCallback((value: string) => {
    const aspectRatios = value?.split(':')
    const aspectRatiosH = Number(aspectRatios?.[1])
    const aspectRatiosW = Number(aspectRatios?.[0])
    if (aspectRatiosH <= 0 || aspectRatiosW <= 0) {
      return false
    }
    const ratio = aspectRatiosH / aspectRatiosW
    if (!ratio) return false
    const oldCardSize = getCardSizeInGridByRatio(ratio, config)
    const newCardSize = {
      width: uiUtils.stringOfLinearUnit(oldCardSize.width),
      height: uiUtils.stringOfLinearUnit(oldCardSize.height)
    }
    setAspectRatio(value)
    aspectRatioRef.current = value
    const resizeOption = {
      widgetId: id,
      widgetConfig: config.set('gridItemSizeRatio', ratio),
      browserSizeMode: browserSizeMode,
      newCardSize: newCardSize
    }
    handleResizeCard(resizeOption).exec()
  })

  const getCardSizeInGridByRatio = hooks.useEventCallback((ratio: number, config: IMConfig): ElementSizeUnit => {
    const oldCardSize = getCardSizeUnit({config, builderStatus, browserSizeMode})
    const pxWidth = getCardPxWidthFormCardSize({
      config,
      builderStatus,
      browserSizeMode,
      widgetRect
    })
    oldCardSize.height.distance = ratio * pxWidth
    return oldCardSize
  })

  const handleKeepAspectRatioChange = hooks.useEventCallback((config: IMConfig) => {
    const cardSize = getCardSizeUnit({config, builderStatus, browserSizeMode})
    const widthPx = getCardPxWidthFormCardSize({
      config,
      builderStatus,
      browserSizeMode,
      widgetRect
    })
    const gridItemSizeRatio = cardSize.height.distance / widthPx
    let newConfig = config.set('keepAspectRatio', !config?.keepAspectRatio)
    setAspectRatio(null)
    aspectRatioRef.current = null
    if (newConfig?.keepAspectRatio) {
      newConfig = newConfig.set('gridItemSizeRatio', gridItemSizeRatio)
    }

    const option = {
      id: id,
      config: newConfig
    }
    onSettingChange(option)
  })

  const getAspectRatio = (gridItemSizeRatio: number, aspectRatio: string): string => {
    if (!aspectRatio && !aspectRatioRef.current) {
      return `100:${gridItemSizeRatio * 100} `
    } else {
      return aspectRatio || aspectRatioRef.current
    }
  }

  const handleHorizontalSpaceChange = (valueFloat: number) => {
    if (!valueFloat && valueFloat !== 0) {
      onPropertyChange('horizontalSpace', 0)
    }
    onPropertyChange('horizontalSpace', valueFloat)
  }

  const handleVerticalSpaceChange = (valueFloat: number) => {
    if (!valueFloat && valueFloat !== 0) {
      onPropertyChange('verticalSpace', 0)
    }
    onPropertyChange('verticalSpace', valueFloat)
  }

  return (
    <div className='mt-4'>
      <SettingRow
        label={<ItemSizeLabel config={config} browserSizeMode={browserSizeMode} showCardSetting={showCardSetting} layouts={layouts}/>}
        flow='wrap'/>
      <SettingRow label={nls('width')} aria-label={nls('width')}>
        <div className='list-size-edit'>
          <SizeEditor
            disableModeSelect
            label='W'
            mode={LayoutItemSizeModes.Custom}
            value={cardSize?.width}
            availableUnits={availableUnits}
            onChange={value => { handleGridItemSizeChange(value) }}
            aria-label={nls('width')}
          />
        </div>
      </SettingRow>
      <div
        className='ml-4 d-flex'
        css={css`
          .icon {
            cursor: pointer;
            width: 12px;
          }
        `}
      >
        <Tooltip title={nls('listKeepAspectRatio')} placement='bottom'>
          <div aria-label={nls('listKeepAspectRatio')} className='icon' onClick={() => { handleKeepAspectRatioChange(config) }}>
            {config?.keepAspectRatio ? <LockOutlined size='s' /> : <UnlockOutlined size='s' />}
          </div>
        </Tooltip>
      </div>
      <SettingRow label={nls('height')} aria-label={nls('height')}>
        <div className='list-size-edit'>
          <SizeEditor
            label='H'
            disableModeSelect
            mode={LayoutItemSizeModes.Custom}
            value={cardSize?.height}
            availableUnits={heightAvailableUnits}
            onChange={value => { handleGridItemSizeChange(value, true) }}
            disabled={config?.keepAspectRatio}
          />
        </div>
      </SettingRow>
      {config?.keepAspectRatio &&
        <SettingRow label={nls('sizeAspectRatio')} aria-label={nls('sizeAspectRatio')}>
          <InputRatio style={inputStyle} value={getAspectRatio(config.gridItemSizeRatio, aspectRatio)} onChange={debounceGridItemSizeRatioChangeRef.current} />
        </SettingRow>}
      <SettingRow label={nls('alignment')} aria-label={nls('alignment')}>
        <TextAlignment
          textAlign={config?.gridAlignment || TextAlignValue.CENTER}
          onChange={handleAlignmentChange}
        />
      </SettingRow>
      <SettingRow
        flow='wrap'
        label={`${nls('horizontalSpacing')} (px)`}
        role='group'
        aria-label={`${nls('horizontalSpacing')} (px)`}
      >
        <div className='d-flex justify-content-between w-100 align-items-center'>
          <Slider
            style={{ width: '60%' }}
            data-field='horizontalSpace'
            onChange={handleFormChange}
            value={config?.horizontalSpace || 0}
            title='0-50'
            min={0}
            max={50}
          />
          <MyNumericInput
            style={{ width: '25%' }}
            value={config?.horizontalSpace || 0}
            min={0}
            max={50}
            title='0-50'
            onChange={handleHorizontalSpaceChange}
          />
        </div>
      </SettingRow>
      <SettingRow
        flow='wrap'
        label={`${nls('verticalSpacing')} (px)`}
        role='group'
        aria-label={`${nls('verticalSpacing')} (px)`}
      >
        <div className='d-flex justify-content-between w-100 align-items-center'>
          <Slider
            style={{ width: '60%' }}
            data-field='verticalSpace'
            onChange={handleFormChange}
            value={config?.verticalSpace || 0}
            title='0-50'
            min={0}
            max={50}
          />
          <MyNumericInput
            style={{ width: '25%' }}
            value={config.verticalSpace || 0}
            min={0}
            max={50}
            title='0-50'
            onChange={handleVerticalSpaceChange}
          />
        </div>
      </SettingRow>
    </div>
  )
}
export default GridLayoutSetting