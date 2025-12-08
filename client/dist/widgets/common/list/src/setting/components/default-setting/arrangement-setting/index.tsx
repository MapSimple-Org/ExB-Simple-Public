/** @jsx jsx */
import { jsx, React, hooks } from 'jimu-core'
import type { BrowserSizeMode, SizeModeLayoutJson } from 'jimu-core'
import type { SettingChangeFunction } from 'jimu-for-builder'
import { defaultMessages as jimuLayoutsDefaultMessages } from 'jimu-layouts/layout-runtime'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { Icon, Checkbox, Button, CollapsablePanel, Select, Switch, DistanceUnits, defaultMessages as jimuUIDefaultMessages } from 'jimu-ui'
import { MyNumericInput } from '../../my-input'
import type { IMConfig, ElementSize, CardSize } from '../../../../config'
import { PageStyle, ListLayoutType, MAX_PAGE_SIZE, MAX_ITEMS_PER_PAGE, SettingCollapseType, Status, DEFAULT_CARD_SIZE, DEFAULT_SPACE, DirectionType } from '../../../../config'
import { getCardSizeUnit } from '../../../utils/utils'
import defaultMessages from '../../../translations/default'
import GridLayoutSetting from './grid-layout-setting'
import RowColumnLayoutSetting from './row-column-layout-setting'

const defaultCardSize: { [key: string]: CardSize } = {
  STYLE0: {
    width: 200,
    height: 275
  },
  STYLE1: {
    width: 200,
    height: 275
  },
  STYLE2: {
    width: 200,
    height: 275
  },
  STYLE3: {
    width: 200,
    height: 275
  },
  STYLE4: {
    width: 360.52,
    height: 110
  },
  STYLE5: {
    width: 320,
    height: 88
  },
  STYLE6: {
    width: 360,
    height: 32
  },
  STYLE7: {
    width: 360.52,
    height: 110
  },
  STYLE8: {
    width: '50%',
    height: 160
  },
  STYLE9: {
    width: '33%',
    height: 160
  }
}

const defaultCardLayout: { [key: string]: ListLayoutType } = {
  STYLE0: ListLayoutType.Column,
  STYLE1: ListLayoutType.Column,
  STYLE2: ListLayoutType.Column,
  STYLE3: ListLayoutType.Column,
  STYLE4: ListLayoutType.Row,
  STYLE5: ListLayoutType.Row,
  STYLE6: ListLayoutType.Row,
  STYLE7: ListLayoutType.Row,
  STYLE8: ListLayoutType.GRID,
  STYLE9: ListLayoutType.GRID
}

interface Props {
  id: string
  config: IMConfig
  settingCollapse: SettingCollapseType
  browserSizeMode: BrowserSizeMode
  widgetRect: ElementSize
  builderStatus: Status
  showCardSetting: Status
  layouts: { [name: string]: SizeModeLayoutJson }
  onPropertyChange: (name, value) => void
  handleFormChange: (evt) => void
  openSettingCollapse: (settingCollapse: SettingCollapseType) => void
  closeSettingCollapse: () => void
  onSettingChange: SettingChangeFunction
  handleCheckboxChange: (dataField: string) => void
}

const ArrangementSetting = (props: Props) => {
  const nls = hooks.useTranslation(defaultMessages, jimuUIDefaultMessages, jimuLayoutsDefaultMessages)
  const { settingCollapse, id, config, browserSizeMode, widgetRect, builderStatus, showCardSetting, layouts } = props
  const { onPropertyChange, onSettingChange, handleCheckboxChange, closeSettingCollapse, openSettingCollapse, handleFormChange } = props

  const handlePageStyleChange = evt => {
    const value = evt?.target?.value
    let newConfig = config.set('pageStyle', value)
    if (value === PageStyle.MultiPage) {
      newConfig = newConfig.set('hidePageTotal', false)
    }
    const options = {
      id: id,
      config: newConfig
    }
    onSettingChange(options)
  }

  const handleHidePageTotalChange = () => {
    const newHidePageTotal = !config?.hidePageTotal
    onPropertyChange('hidePageTotal', newHidePageTotal)
  }

  const handleScrollStepChange = (valueInt: number) => {
    if (valueInt < 0) valueInt = 1
    onPropertyChange('scrollStep', valueInt)
  }

  const handleItemsPerPageChange = value => {
    if (!value || value === '') {
      value = '1'
    }
    let valueInt = parseInt(value)
    if (valueInt < 0) valueInt = 1
    onPropertyChange('itemsPerPage', valueInt)
  }

  const getPageStyleOptions = (): React.JSX.Element[] => {
    return [
      <option key={PageStyle.Scroll} value={PageStyle.Scroll}>
        {nls('scroll')}
      </option>,
      <option key={PageStyle.MultiPage} value={PageStyle.MultiPage}>
        {nls('multiPage')}
      </option>
    ]
  }


  const handleLayoutChange = (layoutType: ListLayoutType) => {
    let newConfig = config.set('layoutType', layoutType).set('horizontalSpace', DEFAULT_SPACE).set('verticalSpace', DEFAULT_SPACE)
    const cardSize = getCardSizeUnit({config, builderStatus, browserSizeMode})
    const itemStyle = defaultCardLayout[config.itemStyle]
    let newCardSize
    const direction = layoutType === ListLayoutType.Column ? DirectionType?.Horizon : DirectionType.Vertical
    if (itemStyle === layoutType) {
      newCardSize = defaultCardSize[config.itemStyle]
    } else {
      switch (layoutType) {
        case ListLayoutType.GRID:
          newCardSize = {
            width: '25%',
            height: `${DEFAULT_CARD_SIZE}px`
          }
          break
        case ListLayoutType.Column:
          newCardSize = {
            width: '320px',
            height: cardSize?.height?.unit === DistanceUnits.PERCENTAGE ? `${widgetRect.height * cardSize?.height?.distance / 100}px` : `${cardSize?.height?.distance}px`
          }
          break
        case ListLayoutType.Row:
          newCardSize = {
            width: cardSize?.width?.unit === DistanceUnits.PERCENTAGE ? `${widgetRect.width * cardSize?.width?.distance / 100}px` : `${cardSize?.width?.distance}px`,
            height: '200px'
          }
          break
        // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
        default:
          newCardSize = {
            width: cardSize?.width?.unit === DistanceUnits.PERCENTAGE ? `${widgetRect.width * cardSize?.width?.distance / 100}px` : `${cardSize?.width?.distance}px`,
            height: cardSize?.height?.unit === DistanceUnits.PERCENTAGE ? `${widgetRect.height * cardSize?.height?.distance / 100}px` : `${cardSize?.height?.distance}px`
          }
          break
      }
    }
    newConfig = newConfig.setIn(
      ['cardConfigs', Status.Default, 'cardSize', browserSizeMode],
      newCardSize
    ).setIn(
      ['cardConfigs', Status.Hover, 'cardSize', browserSizeMode],
      newCardSize
    ).setIn(
      ['cardConfigs', Status.Selected, 'cardSize', browserSizeMode],
      newCardSize
    ).setIn(['direction'], direction)

    onSettingChange({
      id: id,
      config: newConfig
    })
  }

  return (
    <SettingSection>
      <CollapsablePanel
        label={nls('arrangement')}
        isOpen={settingCollapse === SettingCollapseType.Arrangement}
        onRequestOpen={() => { openSettingCollapse(SettingCollapseType.Arrangement) }}
        onRequestClose={closeSettingCollapse}
        aria-label={nls('arrangement')}
      >
        <SettingRow className="mt-2" flow='wrap' label={nls('layout')} role='group' aria-label={nls('layout')}>
          <div className='d-flex align-items-center w-100 list-layout-select-con'>
            <Button icon title={nls('layoutRow')} aria-label={nls('layoutRow')} active={config?.layoutType === ListLayoutType.Row} onClick={() => { handleLayoutChange(ListLayoutType.Row) }} className='flex-grow-1' size='lg'>
              <Icon className='style-img w-100 h-100' icon={require('../../../assets/row.png')}/>
            </Button>
            <Button icon title={nls('layoutColumn')} aria-label={nls('layoutColumn')} active={config?.layoutType === ListLayoutType.Column} onClick={() => { handleLayoutChange(ListLayoutType.Column) }} className='ml-2 flex-grow-1' size='lg'>
              <Icon className='style-img w-100 h-100' icon={require('../../../assets/column.png')}/>
            </Button>
            <Button icon title={nls('layoutGrid')} aria-label={nls('layoutGrid')} active={config?.layoutType === ListLayoutType.GRID} onClick={() => { handleLayoutChange(ListLayoutType.GRID) }} className='ml-2 flex-grow-1' size='lg'>
              <Icon className='style-img w-100 h-100' icon={require('../../../assets/grid.png')}/>
            </Button>
          </div>
        </SettingRow>
        {config?.layoutType !== ListLayoutType.GRID && <RowColumnLayoutSetting
          id={id}
          config={config}
          browserSizeMode={browserSizeMode}
          builderStatus={builderStatus}
          showCardSetting={showCardSetting}
          layouts={layouts}
          onPropertyChange={onPropertyChange}
          handleFormChange={handleFormChange}
          handleCheckboxChange={handleCheckboxChange}
        />}
        {config?.layoutType === ListLayoutType.GRID && <GridLayoutSetting
          id={id}
          config={config}
          widgetRect={widgetRect}
          browserSizeMode={browserSizeMode}
          builderStatus={builderStatus}
          showCardSetting={showCardSetting}
          layouts={layouts}
          onPropertyChange={onPropertyChange}
          handleFormChange={handleFormChange}
          onSettingChange={onSettingChange}
        />}
        <SettingRow label={nls('pagingStyle')} flow='wrap' role='group' aria-label={nls('pagingStyle')}>
          <Select
            style={{ width: '100%' }}
            value={config.pageStyle}
            onChange={handlePageStyleChange}
            aria-label={nls('pagingStyle')}
            size='sm'
          >
            {getPageStyleOptions()}
          </Select>
        </SettingRow>
        {config.pageStyle === PageStyle.MultiPage && <SettingRow aria-label={nls('hidePageTotal')}>
          <div className='d-flex align-items-center' onClick={handleHidePageTotalChange}>
            <Checkbox aria-label={nls('hidePageTotal')} checked={config?.hidePageTotal}/>
            <div className='flex-grow-1 text-truncate ml-2'>{nls('hidePageTotal')}</div>
          </div>
        </SettingRow>}
        {config.pageStyle === PageStyle.Scroll && (
          <SettingRow tag='label' label={nls('scrollBar')} aria-label={nls('scrollBar')}>
            <div className='d-flex'>
              <Switch
                checked={config.scrollBarOpen}
                data-field='scrollBarOpen'
                onChange={handleFormChange}
                title={nls('scrollBar')}
                aria-label={nls('scrollBar')}
              />
            </div>
          </SettingRow>
        )}
        {config.pageStyle === PageStyle.Scroll && (
          <SettingRow tag='label' label={nls('navigator')} aria-label={nls('navigator')}>
            <div className='d-flex'>
              <Switch
                checked={config.navigatorOpen}
                data-field='navigatorOpen'
                onChange={handleFormChange}
                title={nls('navigator')}
                aria-label={nls('navigator')}
              />
            </div>
          </SettingRow>
        )}
        {config.pageStyle === PageStyle.Scroll && config.navigatorOpen && (
          <SettingRow label={nls('listStep')} flow='wrap' role='group' aria-label={nls('listStep')}>
            <MyNumericInput
              value={config.scrollStep}
              style={{ width: '100%' }}
              min={1}
              max={MAX_PAGE_SIZE}
              onChange={handleScrollStepChange}
              aria-label={nls('listStep')}
            />
          </SettingRow>
        )}
        {config.pageStyle === PageStyle.MultiPage && (
          <SettingRow label={nls('itemPerPage')} flow='wrap' role='group' aria-label={nls('itemPerPage')}>
            <MyNumericInput
              value={config.itemsPerPage}
              style={{ width: '100%' }}
              min={1}
              max={MAX_ITEMS_PER_PAGE}
              onChange={handleItemsPerPageChange}
              aria-label={nls('itemPerPage')}
            />
          </SettingRow>
        )}
      </CollapsablePanel>
    </SettingSection>
  )
}
export default ArrangementSetting