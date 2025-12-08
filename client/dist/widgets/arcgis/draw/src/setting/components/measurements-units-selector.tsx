/** @jsx jsx */
import { css, jsx, React, useIntl, type IMThemeVariables, type IntlShape } from 'jimu-core'
import { Checkbox, Label, Tabs, Tab, defaultMessages } from 'jimu-ui'
import { JimuSymbolType, type MeasurementsUnitsInfo, useMeasurementsUnitsInfos } from 'jimu-ui/advanced/map'
import { SettingRow } from 'jimu-ui/advanced/setting-components'

interface Props {
  measurementsUnitsInfos: MeasurementsUnitsInfo[]

  onUnitsSettingChange: (measurementsUnitsInfos: MeasurementsUnitsInfo[]) => void

  intl: IntlShape
  theme: IMThemeVariables
  //title: string
}

export const MeasurementsUnitsSelector = React.memo((props: (Props)) => {
  const rootRef = React.useRef(null)
  const DEFAULT_MEASUREMENTS_UNITS_INFOS = useMeasurementsUnitsInfos()
  const [unitsStates, setUnitsStates] = React.useState<MeasurementsUnitsInfo[]>(() => {
    const initialState: MeasurementsUnitsInfo[] = []

    DEFAULT_MEASUREMENTS_UNITS_INFOS.forEach(item => {
      const _value = item.value
      let _tmpItem = { ...item } // copied

      //find info in config
      const itemInConfig = props.measurementsUnitsInfos.find((config) => {
        return (config.value === _value)
      })
      if (itemInConfig) {
        _tmpItem = { ..._tmpItem, ...itemInConfig } //merge obj
      }

      initialState.push(_tmpItem)
    })

    return initialState
  })

  const _getSelectedUnitNum = (uiType: JimuSymbolType) => {
    let num = 0
    unitsStates.filter((item) => {
      return (item.type === uiType)
    }).forEach((item) => {
      if (item.activated) {
        num++
      }
    })

    return num
  }

  const _isItemChecked = (id) => {
    const itemInStates = unitsStates.find(item => {
      return (item.value === id)
    })

    return itemInStates && itemInStates.activated
  }

  const _createItemUI = (uiType: JimuSymbolType) => {
    const elements = []
    const selectedUnitNum = _getSelectedUnitNum(uiType)

    unitsStates.filter((item) => {
      return (item.type === uiType)
    }).forEach((item, idx) => {
      const isChecked = _isItemChecked(item.value)
      const isDisable = ((selectedUnitNum === 1) && isChecked)
      const note = item.note
      elements.push(
        <li className='d-flex item' key={'key-' + idx}>
          <Checkbox className='d-flex mr-2' data-itemid={item.value} checked={isChecked} disabled={isDisable}
            onChange={() => {
              onOptionsChange(item.value)
            }}
            aria-label={note} />

          <div className='d-flex mr-4 item-note-wrapper dot-dot-dot'>
            <Label className='item-note dot-dot-dot'
              title={note} aria-label={note}>
              {note}
            </Label>
          </div>
        </li>
      )
    })

    return elements
  }

  const onOptionsChange = (value: string) => {
    const states = unitsStates.map((item) => {
      if (value === item.value) {
        item.activated = !item.activated
      }
      return item
    })
    //{ value: 'dd', label: 'Y°N, X°E' }
    setUnitsStates(states)
    props.onUnitsSettingChange(states)
  }

  const getStyle = () => {
    const theme = props.theme

    return css`
      font-size: 13px;
      font-weight: lighter;
      width: 100%;
      height: 154px;
      overflow-y: scroll;
      background: ${theme.ref.palette.neutral[300]};

      .dot-dot-dot{
        text-align: left;
        justify-content: start;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .util-items{
        list-style: none;
        list-style-type: none;
        /*background: ${theme.ref.palette.neutral[300]};*/

        .item{
          margin: 10px 0;
          align-items: center;

          .item-note-wrapper{
            /*width: 80px;*/
            .item-note{
              display: inline-block;
              width: 100%;
            }
          }

          .item-label{
            width: 105px;
          }
        }
      }
    `
  }

  const unitTips = props.intl.formatMessage({ id: 'drawUnits', defaultMessage: defaultMessages.drawUnits })
  const pointTips = useIntl().formatMessage({ id: 'drawModePoint', defaultMessage: defaultMessages.drawModePoint })
  const lineTips = useIntl().formatMessage({ id: 'drawModeLine', defaultMessage: defaultMessages.drawModeLine })
  const areaTips = useIntl().formatMessage({ id: 'drawToolAreaTip', defaultMessage: defaultMessages.drawToolAreaTip })

  const [activeTabIDState, setActiveTabIDState] = React.useState<string>()
  return (
    <SettingRow>
      <div className='d-block w-100' role='group' aria-label={unitTips}>
        <SettingRow label={unitTips} className='w-100 mb-2 bold-font-label'></SettingRow>
        <div ref={rootRef} className='w-100 mb-2' css={getStyle()}>
          <Tabs fill type='underline' value={activeTabIDState} onChange={(value) => { setActiveTabIDState(value) }}>
            {/* 1. point */}
            <Tab id={JimuSymbolType.Point} title={pointTips}>
              <ul className='util-items p-0 mx-2 mb-0' role='group' aria-label={unitTips}>
                {_createItemUI(JimuSymbolType.Point)}
              </ul>
            </Tab>
            {/* 2. line */}
            <Tab id={JimuSymbolType.Polyline} title={lineTips}>
              <ul className='util-items p-0 mx-2 mb-0' role='group' aria-label={unitTips}>
                {_createItemUI(JimuSymbolType.Polyline)}
              </ul>
            </Tab>
            {/* 3. polygon / area */}
            <Tab id={JimuSymbolType.Polygon} title={areaTips}>
              <ul className='util-items p-0 mx-2 mb-0' role='group' aria-label={unitTips}>
                {_createItemUI(JimuSymbolType.Polygon)}
              </ul>
            </Tab>
          </Tabs>
        </div>
      </div>
    </SettingRow>)
})
