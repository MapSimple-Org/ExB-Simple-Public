/** @jsx jsx */
import { React, jsx, type ImmutableObject, Immutable, type OrderByOption, hooks, defaultMessages as jimuUIDefaultMessages } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { Sort } from 'jimu-ui/advanced/sql-expression-builder'
import { Switch } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { lrsDefaultMessages, type LrsLayer, LrsLayerType } from 'widgets/shared-code/lrs'

interface Props {
  lrsLayer?: ImmutableObject<LrsLayer>
  onPropertyChanged: (prop: string, value: any, dsUpdateRequired?: boolean) => void
  onQueryItemChanged: (queryItem: ImmutableObject<LrsLayer>, dsUpdateRequired?: boolean) => void
}

export function ResultsSetting (props: Props) {
  const { lrsLayer, onPropertyChanged, onQueryItemChanged } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages, lrsDefaultMessages, jimuUIDefaultMessages)
  const networkInfo = lrsLayer?.layerType === LrsLayerType.Network ? lrsLayer.networkInfo : null

  const onFieldChange = (sortData: OrderByOption[]) => {
    const { dataSourceId, mainDataSourceId, dataViewId, rootDataSourceId } = lrsLayer.useDataSource

    const nextUseDataSource = {
      dataSourceId,
      mainDataSourceId,
      dataViewId,
      rootDataSourceId,
      fields: lrsLayer.useDataSource.fields
    }
    const updatedNetworkInfo = networkInfo.set('sortOptions', sortData)
    const updatedLrs = lrsLayer.set('networkInfo', updatedNetworkInfo).set('useDataSource', nextUseDataSource)
    onQueryItemChanged(updatedLrs, true)
  }

  return (
    <div >
      {networkInfo?.sortOptions && (
        <SettingSection role='group' aria-label={getI18nMessage('results')} title={getI18nMessage('results')} >
          <SettingRow aria-label={getI18nMessage('sortResults')} flow='wrap' label={getI18nMessage('sortResults')}>
            <Sort
              onChange={onFieldChange}
              value={Immutable(networkInfo.sortOptions)}
              useDataSource={lrsLayer.useDataSource}
            />
          </SettingRow>
            <SettingRow flow='no-wrap' tag='label' label={getI18nMessage('expandByDefault')}>
              <Switch
                checked={networkInfo.expandByDefault}
                onChange={(e) => { onPropertyChanged('expandByDefault', e.target.checked, true) }}
              />
            </SettingRow>
        </SettingSection>
      )}
    </div>
  )
}
