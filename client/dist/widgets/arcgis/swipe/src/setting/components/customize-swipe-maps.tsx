/** @jsx jsx */
import {
  jsx,
  React,
  css,
  polished,
  DataSourceManager,
  type ImmutableArray,
  type ImmutableObject,
  type DataSourcesJson,
  classNames,
  hooks
} from 'jimu-core'
import {
  Alert,
  Button,
  Tooltip,
  defaultMessages as jimuUIMessages
} from 'jimu-ui'
import defaultMessages from '../translations/default'
import {
  SettingSection,
  SettingRow
} from 'jimu-ui/advanced/setting-components'
import { MapThumb } from 'jimu-ui/advanced/map'
import { arraysEqual } from '../../utils/utils'
import { ArrowUpDownOutlined } from 'jimu-icons/outlined/directional/arrow-up-down'
import { ArrowLeftRightOutlined } from 'jimu-icons/outlined/directional/arrow-left-right'
import { SwipeStyle } from '../../config'
import { useEffect, useState } from 'react'

const STYLE = css`
  .map-remind {
    color: var(--ref-palette-neutral-1000);
    font-size: ${polished.rem(13)};
  }
  .text-container {
    margin-top: ${polished.rem(12)};
  }
  .thumbnail-container {
    position: relative;
    width: 100%;
    .arrow-button {
      width: ${polished.rem(26)};
      height: ${polished.rem(26)};
      position: absolute;
      left: 50%;
      margin-left: -${polished.rem(13)};
      top: 50%;
      margin-top: -${polished.rem(13)};
      border: 1px solid #C5C5C5;
      border-radius: 2px;
      z-index: 1;
    }
    .map-button {
      padding: 0;
      width: 100%;
      height: 100%;
      cursor: default;
    }
    .horizontal-style {
      .map-thumbnail {
        height: ${polished.rem(108)};
        overflow: hidden;
        flex-basis: 50%;
        background-color: var(--ref-palette-neutral-300);
        border: 1px solid var(--ref-palette-neutral-600);
      }
      .mapThumb1 {
        margin-right: 1px;
      }
      .mapThumb2 {
        margin-left: 1px;
      }
    }
    .vertical-style {
      .map-thumbnail {
        width: 100%;
        overflow: hidden;
        flex-basis: ${polished.rem(80)};
        background-color: var(--ref-palette-neutral-300);
        border: 1px solid var(--ref-palette-neutral-600);
      }
      .mapThumb1 {
        margin-bottom: 1px;
      }
      .mapThumb2 {
        margin-top: 1px;
      }
    }
  }
`
interface CustomizeSwipeMapsProps {
  onConfigChange: (key: string[], value: any) => void
  mapUseDataSourcesOrderList: ImmutableArray<string>
  mapUseDataSources: ImmutableArray<string>
  dsJsons: ImmutableObject<DataSourcesJson>
  swipeStyle: SwipeStyle
}

const CustomizeSwipeMaps = (props: CustomizeSwipeMapsProps) => {
  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)
  const { onConfigChange, mapUseDataSourcesOrderList, mapUseDataSources, dsJsons, swipeStyle } = props
  const [mapThumbOrder, setMapThumbOrder] = useState([])

  useEffect(() => {
    if (arraysEqual(mapUseDataSources, mapUseDataSourcesOrderList)) {
      setMapThumbOrder(mapUseDataSourcesOrderList.asMutable())
    } else if (mapUseDataSources.length === 2) {
      setMapThumbOrder(mapUseDataSources.asMutable())
    } else {
      setMapThumbOrder([])
    }
  }, [mapUseDataSources, mapUseDataSourcesOrderList])

  const handleClickReverse = (evt) => {
    const newOrder = [...mapThumbOrder].reverse()
    onConfigChange(['mapUseDataSourcesOrderList'], newOrder)
  }

  //Get the name of the data source.
  const getDataSourceLabel = (dataSourceId: string): string => {
    if (!dataSourceId) {
      return ''
    }
    const dsObj = DataSourceManager.getInstance().getDataSource(dataSourceId)
    const label = dsObj?.getLabel()
    return label || dsObj?.getDataSourceJson().sourceLabel || dataSourceId
  }

  const reverseMapThumbnail = (isHorizontal: boolean) => {
    return (
      <div className='thumbnail-container'>
        <Button
          className='arrow-button'
          onClick={handleClickReverse}
          type='default'
          size='sm'
          icon
          title={translate('reverse')}
          aria-label={translate('reverse')}
        >
          {isHorizontal ? <ArrowLeftRightOutlined size='m'/> : <ArrowUpDownOutlined />}
        </Button>
        <div className={classNames(`d-flex ${isHorizontal ? 'flex-row justify-content-between horizontal-style' : 'flex-column flex-wrap align-items-center vertical-style'}`)}>
          <div className='map-thumbnail mapThumb1'>
            <Tooltip
              showArrow
              title={getDataSourceLabel(mapThumbOrder[0])}
              placement='top'
            >
              <Button
                className='map-button jimu-outline-inside'
                type='tertiary'
              >
                <MapThumb
                  mapItemId={dsJsons[mapThumbOrder[0]] ? dsJsons[mapThumbOrder[0]].itemId : null}
                  portUrl={dsJsons[mapThumbOrder[0]] ? dsJsons[mapThumbOrder[0]].portalUrl : null}
                  usedInSetting
                />
              </Button>
            </Tooltip>
          </div>
          <div className='map-thumbnail mapThumb2'>
            <Tooltip
              showArrow
              title={getDataSourceLabel(mapThumbOrder[1])}
              placement={isHorizontal ? 'top' : 'bottom'}
            >
              <Button
                className='map-button jimu-outline-inside'
                type='tertiary'
              >
                <MapThumb
                  mapItemId={dsJsons[mapThumbOrder[1]] ? dsJsons[mapThumbOrder[1]].itemId : null}
                  portUrl={dsJsons[mapThumbOrder[1]] ? dsJsons[mapThumbOrder[1]].portalUrl : null}
                  usedInSetting
                />
              </Button>
            </Tooltip>
          </div>
        </div>
      </div>
    )
  }

  return (
    <SettingSection
      title={<div>{translate('customizeSettings')}</div>}
      css={STYLE}
    >
      <SettingRow flow='wrap' className='text-container'>
        <span className='w-100 map-remind'>{translate('mapRemind')}</span>
      </SettingRow>
      <SettingRow>
        <div className='w-100'>
          {mapUseDataSources.length === 2
            ? reverseMapThumbnail(swipeStyle === SwipeStyle.SimpleHorizontal)
            : <Alert
              tabIndex={0}
              className={'warningMsg w-100'}
              open
              text={translate('mapMustHaveTwoDS')}
              type={'warning'}
            />}
        </div>
      </SettingRow>
    </SettingSection>
  )
}

export default CustomizeSwipeMaps
