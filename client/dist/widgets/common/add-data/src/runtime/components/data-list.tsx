/** @jsx jsx */
import { React, ReactRedux, jsx, css, Immutable, i18n, defaultMessages as jimuCoreMessages, classNames, dataSourceUtils, type IMState, DataSourceStatus, type IMThemeVariables, hooks, focusElementInKeyboardMode } from 'jimu-core'
import { Button, defaultMessages as jimuUIMessages, Loading, LoadingType, Icon, Alert, TextInput, DataActionList, DataActionListStyle } from 'jimu-ui'

import { TrashOutlined } from 'jimu-icons/outlined/editor/trash'
import { EditOutlined } from 'jimu-icons/outlined/editor/edit'

import { getDataSource, usePrevious } from '../utils'
import type { DataOptions } from '../types'
import { useTheme } from 'jimu-theme'

export interface DataListProps {
  multiDataOptions: DataOptions[]
  enableDataAction: boolean
  isLoading: boolean
  widgetId: string
  disableRenaming?: boolean
  onChangeData: (dataOptions: DataOptions) => void
  onRemoveData: (id: string) => void
}

const { useLayoutEffect, useState, useRef, useMemo } = React
const { useSelector } = ReactRedux

export const DataList = (props: DataListProps) => {
  const { multiDataOptions, enableDataAction, isLoading, onRemoveData, onChangeData, widgetId, disableRenaming } = props
  const translate = hooks.useTranslation(jimuUIMessages, jimuCoreMessages)
  const [renamingDataOptions, setRenamingDataOptions] = useState<DataOptions>(null)
  const renamingInputRef = useRef<HTMLInputElement>(null)
  const dssInfo = useSelector((state: IMState) => state.dataSourcesInfo)
  const prevRenamingInputRef = usePrevious(renamingInputRef)
  const intl = i18n.getIntl()

  const theme = useTheme()
  const dataListStyle = useDataListStyle(theme)

  useLayoutEffect(() => {
    // Make rename input focus and default value of the input selected.
    if (renamingDataOptions && renamingInputRef.current && prevRenamingInputRef?.current !== renamingInputRef.current) {
      focusElementInKeyboardMode(renamingInputRef.current)
      renamingInputRef.current.select()
    }
  }, [renamingInputRef, prevRenamingInputRef, renamingDataOptions])

  const onRenameData = (dataOptions: DataOptions, label: string) => {
    toggleRenameData(dataOptions)
    onChangeData({
      ...dataOptions,
      dataSourceJson: {
        ...dataOptions.dataSourceJson,
        label
      }
    })
  }

  const toggleRenameData = (dataOptions: DataOptions) => {
    setRenamingDataOptions(renamingDataOptions?.dataSourceJson.id === dataOptions?.dataSourceJson.id ? null : dataOptions)
  }

  const onRenameBtnKeyUp = (evt: React.KeyboardEvent<HTMLButtonElement>, dataOptions: DataOptions) => {
    if (evt.key === 'Enter') {
      toggleRenameData(dataOptions)
    }
  }

  return <ul className='data-list' css={dataListStyle}>
    {
      multiDataOptions.map((d, i) => {
        const ds = getDataSource(d.dataSourceJson.id)
        const dsInfo = dssInfo?.[d.dataSourceJson.id]
        const isDataError = dsInfo ? dsInfo.instanceStatus === DataSourceStatus.CreateError : !ds && !isLoading
        const isDataLoading = dsInfo ? dsInfo.instanceStatus === DataSourceStatus.NotCreated : !ds && isLoading
        const isRenaming = renamingDataOptions?.dataSourceJson.id === d.dataSourceJson.id
        const label = d.dataSourceJson.label || d.dataSourceJson.sourceLabel
        const dsTypeString = dataSourceUtils.getDsTypeString(d.dataSourceJson?.type, intl)
        const isDataActionEnabled = enableDataAction && ds
        return <li key={d.dataSourceJson.id} className={classNames('d-flex justify-content-between align-items-center data-item', { 'pt-3': i !== 0 })} aria-label={`${dsTypeString} ${label}`} role='group'>
          <div className='flex-grow-1 text-truncate d-flex justify-content-start align-items-center'>
            {
              isDataLoading &&
              <div className='flex-shrink-0 d-flex justify-content-center align-items-center mr-1 data-item-loading'>
                <Loading type={LoadingType.Donut} width={16} height={16} />
              </div>
            }
            <div className='flex-grow-1 text-truncate d-flex align-items-center' title={dsTypeString}>
              {
                !isDataLoading &&
                <div className='flex-shrink-0 d-flex justify-content-center align-items-center data-thumbnail'>
                  <Icon icon={dataSourceUtils.getDsIcon(Immutable(d.dataSourceJson))} color='var(--sys-color-primary-text)' size='12' />
                </div>
              }
              {
                isDataError &&
                <Alert className='flex-shrink-0 ml-2 mr-1' css={css`padding-left: 0 !important; padding-right: 0 !important;`} variant='text' form='tooltip' size='small' type='error' text={translate('dataSourceCreateError')} />
              }
              <div className={classNames('flex-grow-1 text-truncate data-label', { 'pl-2': !isDataError })} title={renamingDataOptions ? '' : label}>
                {
                  isRenaming
                    ? <TextInput className='w-100' size='sm' defaultValue={label} onAcceptValue={value => { onRenameData(d, value) }} ref={renamingInputRef} />
                    : label
                }
              </div>
            </div>
          </div>
          <div className='flex-shrink-0 d-flex justify-content-end align-items-center data-item-operations'>
            {
              !disableRenaming && !isDataLoading && !isDataError &&
              <Button
                className='jimu-outline-inside' type='tertiary' size='sm' icon
                title={translate('rename')} aria-label={translate('rename')}
                onClick={() => { toggleRenameData(d) }}
                onKeyDown={(e) => {
                  // prevent default to avoid trigger click event after keydown, since if trigger click after key down, the input will be focused and keyup will trigger immediately and cause the input blur
                  if (e.key === 'Enter') {
                    e.preventDefault()
                  }
                }}
                onKeyUp={(e) => { onRenameBtnKeyUp(e, d) }}>
                <EditOutlined size='m' />
              </Button>
            }
            {
              isDataActionEnabled &&
              <DataActionList
                widgetId={widgetId} dataSets={[{ dataSource: ds, records: [], name: ds.getDataSourceJson().label || ds.getDataSourceJson().sourceLabel }]}
                listStyle={DataActionListStyle.Dropdown} buttonSize='sm' buttonType='tertiary' hideGroupTitle buttonClassName='jimu-outline-inside' />
            }
            <Button className='jimu-outline-inside' type='tertiary' size='sm' icon onClick={() => { onRemoveData(d.dataSourceJson.id) }} title={translate('remove')} aria-label={translate('remove')}>
              <TrashOutlined size='m' />
            </Button>
          </div>
        </li>
      })
    }
  </ul>
}

const style = css`
  max-height: calc(100% - 35px);
  overflow: auto;

  margin-bottom: 38px;
  padding-left: 0;

  .data-item {
    width: 100%;
    overflow: hidden;
  }
  .data-item-loading {
    position: relative;
    width: 24px;
    height: 24px;
    border: 1px solid var(--sys-color-info-main);
  }
  .data-thumbnail {
    width:  26px;
    height:  26px;
    background-color: var(--sys-color-info-main);
  }
  .data-label {
    font-size: 13px;
    color: var(--sys-color-surface-paper-text);
  }
  .jimu-button-color-error {
    color: var(--sys-color-error-main);
  }
  .data-item-operations {
    .jimu-btn svg {
      color: var(--sys-color-surface-paper-text);
    }
  }
  .jimu-input .input-wrapper {
    color: var(--sys-color-surface-paper-text);
  }
`

const useDataListStyle = (theme: IMThemeVariables) => {
  // add inside outline style to data action dropdown button to avoid cut off of focus ring
  return useMemo(() => css`
    ${style}
    .data-item-operations .data-action-dropdown .data-action-button{
      &:focus,
      &:focus-visible {
        outline-offset: -2px;
      }
      border: 0;
    }
  `, [])
}
