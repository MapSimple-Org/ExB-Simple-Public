/** @jsx jsx */
import { jsx, React, hooks, BrowserSizeMode, type SizeModeLayoutJson } from 'jimu-core'
import { defaultMessages as jimuLayoutsDefaultMessages } from 'jimu-layouts/layout-runtime'
import { defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import type { IMConfig, Status } from '../../../../config'
import { ListLayoutType, DirectionType } from '../../../../config'
import { useTheme } from 'jimu-theme'
import { DesktopOutlined } from 'jimu-icons/outlined/application/desktop'
import { TabletOutlined } from 'jimu-icons/outlined/application/tablet'
import { MobileOutlined } from 'jimu-icons/outlined/application/mobile'
import defaultMessages from '../../../translations/default'

const { useState, useEffect } = React

interface Props {
  config: IMConfig
  browserSizeMode: BrowserSizeMode
  showCardSetting: Status
  layouts: { [name: string]: SizeModeLayoutJson }
}

const ItemSizeLabel = (props: Props) => {
  const theme = useTheme()
  const nls = hooks.useTranslation(defaultMessages, jimuUIDefaultMessages, jimuLayoutsDefaultMessages)
  const { config, showCardSetting, browserSizeMode, layouts } = props
  const [labelString, setLabelString] = useState()

  useEffect(() => {
    const isVertical = config?.layoutType ? config?.layoutType === ListLayoutType.Row : config.direction === DirectionType.Vertical
    const isGrid = config?.layoutType === ListLayoutType.GRID
    let labelString
    if (isGrid) {
      labelString = nls('gridItemSize')
    } else {
      labelString = isVertical ? `${nls('itemHeight')} (px)` : `${nls('itemWidth')} (px)`
    }
    setLabelString(labelString)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  const getBrowserIcons = (iconSize: number, browserSizeMode: BrowserSizeMode, showCardSetting, layouts) => {
    const currentLayout = layouts[showCardSetting]

    const autoMedium = !currentLayout[BrowserSizeMode.Medium]
    const autoMobile = !currentLayout[BrowserSizeMode.Small]

    const isDesktop = browserSizeMode === BrowserSizeMode.Large || !currentLayout[browserSizeMode]

    const isPad = (browserSizeMode === BrowserSizeMode.Large && autoMedium) ||
      browserSizeMode === BrowserSizeMode.Medium ||
      (browserSizeMode === BrowserSizeMode.Small && autoMedium && autoMobile)

    const isMobile = (browserSizeMode === BrowserSizeMode.Large && autoMobile) ||
      (browserSizeMode === BrowserSizeMode.Medium && autoMedium && autoMobile) ||
      browserSizeMode === BrowserSizeMode.Small

    const color = theme.ref.palette.neutral[800]

    const desktopLabel = nls('appliedToLargeScreen')
    const padLabel = nls('appliedToMediumScreen')
    const mobileLabel = nls('appliedToSmallScreen')
    return (
      <div className='d-flex justify-content-between align-items-center'>
        {isDesktop && <DesktopOutlined size={iconSize} color={color} title={desktopLabel} aria-label={desktopLabel}/>}
        {isPad && <TabletOutlined size={iconSize} color={color} className={isDesktop ? 'ml-1' : ''} title={padLabel} aria-label={padLabel} />}
        {isMobile && <MobileOutlined size={iconSize} color={color} className={isDesktop || isPad ? 'ml-1' : ''} title={mobileLabel} aria-label={mobileLabel} />}
      </div>
    )
  }

  return (<div className='d-flex'>
    <div className='flex-grow-1'>
      {labelString}
    </div>
    {getBrowserIcons(12, browserSizeMode, showCardSetting, layouts)}
  </div>)
}
export default ItemSizeLabel