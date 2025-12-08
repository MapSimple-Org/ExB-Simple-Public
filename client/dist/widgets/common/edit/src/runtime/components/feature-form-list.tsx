import {
  React, defaultMessages as jimuCoreMessages, hooks, type FeatureDataRecord, css
} from 'jimu-core'
import { Button, TextInput, Typography } from 'jimu-ui'
import { SearchOutlined } from 'jimu-icons/outlined/editor/search'
import { BatchEditOutlined } from 'jimu-icons/outlined/editor/batch-edit'
import { type EditFeatures, getDisplayField } from './utils'
import type { LayerInfo } from './feature-form-component'
import defaultMessages from '../translations/default'

interface FeatureFormListProps {
  editFeatures: EditFeatures
  layersInfo: { [dsId: string]: LayerInfo }
  layersOrder: string[]
  batchEditing: boolean
  onBatchEdit: (dsId: string, features: Array<FeatureDataRecord['feature']>) => void
  onClickItem: (dsId: string, feature: FeatureDataRecord['feature']) => void
}

export interface FeatureFormGroup {
  id: string
  dsId: string
  label: string
  items: FeatureFormItem[]
}

interface FeatureFormItem {
  label: string
  data: FeatureDataRecord['feature']
}

const style = css`
  &.feature-list {
    padding: 8px 16px;
    max-height: unset;
    background-color: var(--calcite-color-background);
    .feature-list-no-match {
      justify-content: center;
      align-items: center;
      height: 96px;
      display: flex;
    }
    .feature-list-group {
      padding: 12px 12px 0;
      .feature-list-group-header {
        margin-bottom: 8px;
      }
      .feature-list-group-label {
        line-height: 1.286;
      }
    }
    .feature-list-items {
      list-style: none;
      margin: 0;
      padding: 0;
      .feature-list-item {
        background-color: var(--sys-color-action);
        color: var(--sys-color-action-text);
        cursor: pointer;
        margin-bottom: 6px;
        min-height: 48px;
        transition: border 250ms ease-in-out;
        display: flex;
        justify-content: space-between;
        .feature-list-item-container {
          display: flex;
          margin: 9px 2px;
          width: 100%;
          .feature-list-item-label{
            flex: 1;
            margin: 0;
            display: flex;
            align-items: center;
            word-break: break-word;
            padding-left: 20px;
          }
        }
        &:last-child {
          margin-bottom: 0;
        }
        :hover {
          cursor: pointer;
          background-color: var(--sys-color-action-hover);
        }
        :focus,
        :focus-visible {
          outline-offset: -2px !important;
        }
      }
    }
  }
`

const FeatureFormList = (props: FeatureFormListProps) => {
  const { editFeatures, layersOrder, layersInfo, batchEditing, onBatchEdit, onClickItem } = props
  const [filterText, setFilterText] = React.useState('')
  const translate = hooks.useTranslation(jimuCoreMessages, defaultMessages)
  const { count, groupedSelectedFeatures } = React.useMemo(() => {
    let count = 0
    const groupedSelectedFeatures: FeatureFormGroup[] = []
    for (const dsId in editFeatures) {
      const featuresArray = editFeatures[dsId]
      if (featuresArray.length === 0 || !layersInfo[dsId]) continue
      const dataSource = layersInfo[dsId]?.dataSource
      const dsLabel = dataSource.getLabel()
      const displayField = getDisplayField(dataSource)
      const objectIdField = dataSource.getIdField()
      const group: FeatureFormGroup = {
        id: dsId,
        dsId,
        label: dsLabel,
        items: featuresArray.filter(ele => {
          const label = ele.feature.attributes?.[displayField] || ele.feature.attributes?.[objectIdField] || ele.feature.attributes?.objectid
          const lowerCasedFilter = filterText.toLowerCase()
          return !lowerCasedFilter || label?.toString()?.toLowerCase().indexOf(lowerCasedFilter) > -1
        }).map(item => {
          const objectIdFieldValue = item.feature.attributes?.[displayField] || item.feature.attributes?.[objectIdField] || item.feature.attributes?.objectid
          return {
            label: objectIdFieldValue,
            data: item.feature
          }
        })
      }
      count += group.items.length
      groupedSelectedFeatures.push(group)
    }
    // Sort the FeatureForm selection list
    groupedSelectedFeatures.sort((a, b) => {
      const aIndex = layersOrder.findIndex(dsId => dsId === a.id)
      const bIndex = layersOrder.findIndex(dsId => dsId === b.id)
      return aIndex - bIndex
    })
    return { count, groupedSelectedFeatures }
  }, [editFeatures, filterText, layersInfo, layersOrder])


  const onFilterChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    setFilterText(evt.target.value)
  }

  const handleBatchEdit = (group: FeatureFormGroup) => {
    const features = group.items.map(item => item.data)
    onBatchEdit?.(group.dsId, features)
  }

  return (
    <div className='feature-list h-100 overflow-auto' css={style}>
      <div className='feature-list-search d-flex align-items-center m-2'>
        <TextInput
          className='w-100'
          placeholder={translate('search')}
          onChange={onFilterChange}
          value={filterText}
          prefix={<SearchOutlined color='var(--sys-color-action-input-field-placeholder)' />}
          allowClear
          title={filterText}
        />
      </div>
      {count === 0 &&
        <div className='feature-list-no-match'>
          <Typography variant='title1'>{translate('noItemsFound')}</Typography>
        </div>
      }
      {count > 0 && <div className='feature-list-groups'>
        {groupedSelectedFeatures.map(group =>
          <div role='group' aria-label={group.label} className='feature-list-group' key={group.id}>
            <h4 className='feature-list-group-header d-flex align-items-center justify-content-between' title={group.label}>
              <Typography component='span' variant='title2' className='feature-list-group-label'>{group.label}</Typography>
              {batchEditing &&
                <Button size='sm' variant='text' icon disabled={group.items.length === 0} title={translate('editTheseRecords')} onClick={() => { handleBatchEdit(group) }} >
                  <BatchEditOutlined />
                </Button>
              }
            </h4>
            <div className='feature-list-items' role='listbox'>
              {group.items.map((item, index) =>
                <Button
                  key={`${group.dsId}__${item.label}_${index}`}
                  role='option'
                  className='w-100 border-0 feature-list-item'
                  onClick={() => { onClickItem(group.dsId, item.data) }}
                >
                  <div className='feature-list-item-container'>
                    <span className='feature-list-item-label'>{item.label}</span>
                  </div>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>}
    </div>
  )
}

export default FeatureFormList
