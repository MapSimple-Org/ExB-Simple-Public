/** @jsx jsx */
import { jsx, css, type DataSource, type IntlShape, type FeatureLayerDataSource, getAppStore, dateUtils } from 'jimu-core'
import { Button, Tooltip } from 'jimu-ui'
import React from 'react'
import InputRange from './input-range'
import { DataLayerOutlined } from 'jimu-icons/outlined/gis/data-layer'
import { StartEndFilled } from 'jimu-icons/filled/application/start-end'
import { getLineInfo } from './utils'
import { getTimeSpanStyles } from './style'
import { DATE_PATTERN, TIME_PATTERN } from '../../utils/utils'

interface TimeSpanProps {
  width?: number
  startTime?: number
  endTime?: number
  dataSources: { [dsId: string]: DataSource }
  intl: IntlShape
  overallExtentLabel: string
  theme: any
  onChange: (sTime: number, eTime: number) => void
}

/**
 * Time span component: it includes layers and time-range.
 * @param props
 * @returns
 */
const TimeSpan = function (props: TimeSpanProps) {
  const { startTime, endTime, theme, intl, overallExtentLabel, width = 188, dataSources, onChange } = props
  const [layersInfo, setLayersInfo] = React.useState(null)
  const [layersExtent, setLayersExtent] = React.useState(null)
  const [wholeExtent, setWholeExtent] = React.useState(null)
  const isRTL = getAppStore().getState().appContext.isRTL

  React.useEffect(() => {
    if (layersExtent) {
      refreshWholeExtent()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startTime, endTime])

  React.useEffect(() => {
    initLayers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSources]) // For layers from webMap

  /**
   * Init layersInfo and layers' extent.
   * layers' extent: from the whole extent from layers' timeInfo or features' attribute
   */
  const initLayers = () => { // TODO: get initial layers in getTimeExtentForDS
    let min: number = null
    let max: number = null
    const layers = []
    Object.keys(dataSources).forEach(dsId => {
      const ds = (dataSources[dsId] as FeatureLayerDataSource)
      const dsInfo = ds.getTimeInfo()
      const start = dsInfo?.timeExtent?.[0]
      const end = dsInfo?.timeExtent?.[1]
      // TODO: query features if no timeExtent.

      layers.push({
        label: ds.getLabel(),
        extent: [start, end],
        extentLabels: [
          dateUtils.formatDateValue(start, intl, DATE_PATTERN, TIME_PATTERN),
          dateUtils.formatDateValue(end, intl, DATE_PATTERN, TIME_PATTERN)
        ]
      })
      min = min ? Math.min(min, start) : start
      max = max ? Math.max(max, end) : end
    })
    setLayersInfo(layers)
    setLayersExtent([min, max])
    refreshWholeExtent(min, max)
  }

  // use min of all layer's extent and selected extent as final extent.
  const refreshWholeExtent = (startLayersExtent = layersExtent[0], endLayersExtent = layersExtent[1]) => {
    const min = startTime ? Math.min(startTime, startLayersExtent) : startLayersExtent
    const max = endTime ? Math.max(endTime, endLayersExtent) : endLayersExtent
    setWholeExtent([min, max])
  }

  const inputRangeChanged = (start: number, end: number) => {
    onChange(start, end)
  }

  const getLayerLinesHeight = () => {
    const layerLength = Object.keys(dataSources).length + 1
    return 20 * layerLength
  }
  return (
    <div className='time-span w-100' dir='ltr' css={getTimeSpanStyles(theme)} >
      <div className='layer-lines'
        css={css`
          height: ${getLayerLinesHeight()};
        `}
      >
        {
          layersInfo?.map((layer, index) => {
            const lineInfo = getLineInfo(width, wholeExtent, layer.extent[0], layer.extent[1])
            return <div className='d-flex align-items-center layer-line-container' key={'layer-line-' + index}>
              <Tooltip placement='bottom'
                title={<div className='p-2'><div>{layer.label}</div><div>{`${layer.extentLabels[0]} - ${layer.extentLabels[1]}`}</div></div>}
              >
                <Button icon size='sm' type='tertiary' className='layer-icon p-0 border-0' >
                  <DataLayerOutlined size={12} />
                </Button>
              </Tooltip>
              <div className='layer-line'
                css={css`
                  margin-left: ${isRTL ? 'unset' : lineInfo.marginLeft};
                  margin-right: ${isRTL ? lineInfo.marginLeft : 'unset'};
                  width: ${lineInfo.width};
                `}
              ></div>
            </div>
          })
        }
        <div className='d-flex align-items-center layer-line-container'>
          <Tooltip placement='bottom' title={overallExtentLabel}>
            <Button icon size='sm' type='tertiary' className='layer-icon p-0' >
              <StartEndFilled size={12} />
            </Button>
          </Tooltip>
          {
            wholeExtent && <InputRange
              theme={theme}
              width={width}
              isRTL={isRTL}
              intl={intl}
              shadowHeight={layersInfo.length * 20 + 10}
              startValue={startTime ?? wholeExtent[0]}
              endValue={endTime ?? wholeExtent[1]}
              extent={wholeExtent}
              onChange={inputRangeChanged}
            />
          }
        </div>
      </div>
    </div>
  )
}

export default TimeSpan
