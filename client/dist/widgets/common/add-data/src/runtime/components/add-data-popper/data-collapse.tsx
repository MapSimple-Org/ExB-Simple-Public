/** @jsx jsx */
import { React, ReactRedux, jsx, css, type IMDataSourceJson, Immutable, i18n, dataSourceUtils, type IMState, DataSourceStatus, hooks } from 'jimu-core'
import { Button, defaultMessages as jimuUIMessages, Icon, Alert, Loading, LoadingType } from 'jimu-ui'

import { DownOutlined } from 'jimu-icons/outlined/directional/down'
import { UpOutlined } from 'jimu-icons/outlined/directional/up'
import { CloseOutlined } from 'jimu-icons/outlined/editor/close'

import type { DataOptions } from '../../types'
import { createDataSourcesByDataOptions, destroyDataSourcesById, getDataSource, usePrevious } from '../../utils'
import type { IMConfig } from '../../../config'

export interface DataCollapseProps {
  multiDataOptions: DataOptions[]
  widgetId: string
  doneButtonRef: React.MutableRefObject<HTMLButtonElement>
  config: IMConfig
  onFinish: (multiDataOptions: DataOptions[]) => void
  onRemove: (dsId: string) => void
  setErrorMsg: (msg: string) => void
}

const { useState, useEffect } = React
const { useSelector } = ReactRedux

export const DataCollapse = (props: DataCollapseProps) => {
  const { multiDataOptions, widgetId, doneButtonRef, config, onFinish: propsOnFinish, onRemove, setErrorMsg } = props
  const translate = hooks.useTranslation(jimuUIMessages)
  const [isCollapseOpen, setIsCollapseOpen] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const prevMultiDataOptions = usePrevious(multiDataOptions)

  useEffect(() => {
    // Remove data based on diff.
    const removedMultiDataOptions = prevMultiDataOptions?.filter(prevD => !multiDataOptions.some(d => d.dataSourceJson.id === prevD.dataSourceJson.id)) || []
    destroyDataSourcesById(removedMultiDataOptions.map(d => d.dataSourceJson.id), widgetId, false)

    // Create data based on diff.
    setIsLoading(true)
    const addedMultiDataOptions = multiDataOptions.filter(d => !prevMultiDataOptions?.some(prevD => d.dataSourceJson.id === prevD.dataSourceJson.id))
    createDataSourcesByDataOptions(addedMultiDataOptions, widgetId, config, false).catch(err => {
      setErrorMsg(translate('dataSourceCreateError'))
    }).finally(() => {
      setIsLoading(false)
    })
  }, [widgetId, multiDataOptions, prevMultiDataOptions, setErrorMsg, translate, config])

  const toggleCollapse = () => {
    setIsCollapseOpen(!isCollapseOpen)
  }

  const onFinish = () => {
    propsOnFinish(multiDataOptions)
  }

  const selectedString = translate('numSelected', { number: multiDataOptions.length })
  const collapseBtnString = isCollapseOpen ? translate('collapse') : translate('expand')

  return <div className='data-collapse' css={style}>
    {
      multiDataOptions.length > 0 &&
      <div className='data-container p-4'>
        <div className='d-flex justify-content-between align-items-center'>
          <div className='d-flex align-items-center n-selected' role="group" aria-label={selectedString}>
            <span className='text-truncate' title={selectedString}>{selectedString}</span>
            <Button className='jimu-outline-inside' type='tertiary' size='sm' icon onClick={toggleCollapse} title={collapseBtnString} aria-label={collapseBtnString} aria-expanded={isCollapseOpen}>
              {
                isCollapseOpen ? <DownOutlined size='s' color='var(--sys-color-surface-overlay-text)' /> : <UpOutlined size='s' color='var(--sys-color-surface-overlay-text)' />
              }
            </Button>
          </div>
          <div className='small-done-btn'>
            {
              !isCollapseOpen &&
              <Button onClick={onFinish} disabled={isLoading} type='primary' className='text-truncate w-100 px-2' title={translate('done')} ref={doneButtonRef}>
                {translate('done')}
              </Button>
            }
          </div>
        </div>

        {
          isCollapseOpen &&
          <div className='data-items mt-4' role="list">
            {
              multiDataOptions.map((d, i) => <DataItem key={i} widgetId={widgetId} isLoading={isLoading} onRemove={onRemove} dsJson={Immutable(d.dataSourceJson)} />)
            }
          </div>
        }

        {
          isCollapseOpen &&
          <div className='big-done-btn w-100'>
            <Button onClick={onFinish} disabled={isLoading} type='primary' className='text-truncate w-100' title={translate('done')} aria-label={translate('done')} ref={doneButtonRef}>
              {translate('done')}
            </Button>
          </div>
        }
      </div>
    }
  </div>
}

function DataItem ({ widgetId, dsJson, isLoading, onRemove }: {widgetId: string, dsJson: IMDataSourceJson, isLoading: boolean, onRemove: (dsId: string) => void }) {
  const translate = hooks.useTranslation(jimuUIMessages)
  const intl = i18n.getIntl()
  const ds = getDataSource(dsJson.id)
  const dsInfo = useSelector((state: IMState) => state.dataSourcesInfo?.[dsJson.id])
  const isDataError = dsInfo ? dsInfo.instanceStatus === DataSourceStatus.CreateError : !ds && !isLoading
  const isDataLoading = dsInfo ? dsInfo.instanceStatus === DataSourceStatus.NotCreated : !ds && isLoading

  const dsLabelTextId = `add-data-${widgetId}-collapse-panel-list-item-${dsJson.id}`

  return <div className='d-flex align-items-center justify-content-between w-100 data-item' role="listitem">
    <div className='d-flex align-items-center flex-grow-1 text-truncate' title={dataSourceUtils.getDsTypeString(dsJson?.type, intl)}>
      {
        isDataError &&
        <div className='d-flex justify-content-center align-items-center flex-shrink-0 data-error'>
          <Alert className='flex-shrink-0' css={css`padding-left: 0 !important; padding-right: 0 !important;`} buttonType='tertiary' form='tooltip' size='small' type='error' text={translate('dataSourceCreateError')} />
        </div>
      }
      {
        isDataLoading &&
        <div className='d-flex justify-content-center align-items-center flex-shrink-0 data-loading'>
          <Loading type={LoadingType.Donut} width={16} height={16} />
        </div>
      }
      {
        !isDataError && !isDataLoading &&
        <div className='d-flex justify-content-center align-items-center flex-shrink-0 data-thumbnail'>
          <Icon icon={dataSourceUtils.getDsIcon(dsJson)} color='var(--sys-color-primary-text)' size='12' />
        </div>
      }
      <div className='flex-grow-1 text-truncate pl-2 data-label' title={dsJson.label || dsJson.sourceLabel} id={dsLabelTextId}>
        {dsJson.label || dsJson.sourceLabel}
      </div>
    </div>
    <div className='d-flex align-items-center flex-shrink-0'>
      <Button className='jimu-outline-inside' type='tertiary' size='sm' icon onClick={() => { onRemove(dsJson.id) }} title={translate('remove')} aria-label={translate('remove')} aria-describedby={dsLabelTextId}>
        <CloseOutlined size={14} color='var(--sys-color-surface-overlay-text)' />
      </Button>
    </div>
  </div>
}

const style = css`
  .data-container {
    position: absolute;
    right: 0;
    left: 0;
    bottom: 0;
    box-shadow: 0px -1px 4px rgba(0, 0, 0, 0.16) !important;
    border: 0 !important;
    background: var(--sys-color-surface-overlay);
    color: var(--sys-color-surface-overlay-text);
    z-index: 10;
    .n-selected {
      font-size: 14px;
      max-width: 130px;
    }
    .data-items {
      max-height: 500px;
      overflow-y: auto;
      overflow-x: hidden;
      .data-thumbnail {
        width:  26px;
        height:  26px;
        background-color: var(--sys-color-info-main);
      }
      .data-loading, .data-error {
        position: relative;
        width: 24px;
        height: 24px;
        border: 1px solid var(--sys-color-info-main);
      }
      .data-label {
        font-size: 13px;
      }
      .data-item {
        height: 26px;
        margin-bottom: 12px;
      }
    }
    .small-done-btn {
      max-width: 90px;
    }
  }
`
