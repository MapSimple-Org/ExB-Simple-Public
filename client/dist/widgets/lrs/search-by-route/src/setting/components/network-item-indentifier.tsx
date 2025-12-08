/** @jsx jsx */
import { React, jsx, type ImmutableObject, hooks, defaultMessages as jimuUIDefaultMessages } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { Checkbox, Select } from 'jimu-ui'
import { List, type TreeItemType, type TreeItemsType } from 'jimu-ui/basic/list-tree'
import defaultMessages from '../translations/default'
import { advancedActionMap, Identifiers, LineIdentifiers, lrsDefaultMessages, type LrsLayer, LrsLayerType } from 'widgets/shared-code/lrs'

interface Props {
  widgetId: string
  lrsLayer?: ImmutableObject<LrsLayer>
  onPropertyChanged: (prop: string, value: any, dsUpdateRequired?: boolean) => void
}

export function NetworkItemIdentifier (props: Props) {
  const { lrsLayer, onPropertyChanged } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages, lrsDefaultMessages, jimuUIDefaultMessages)
  const networkInfo = lrsLayer?.layerType === LrsLayerType.Network ? lrsLayer.networkInfo : null

  const getActiveIdentifiersCount = (): number => {
    // Returns how many identifiers are available.
    let count = 0
    if (networkInfo.useRouteId) { count++ }
    if (networkInfo.useRouteName) { count++ }
    if (networkInfo.useMultiField) { count++ }
    return count
  }

  const getCheckedState = (index: number) => {
    return networkInfo.routeIdFields[index].enabled
  }

  const setCheckState = (index: number) => {
    const updatedFields = networkInfo.routeIdFields.asMutable({ deep: true })
    updatedFields[index].enabled = !updatedFields[index].enabled
    onPropertyChanged('routeIdFields', updatedFields, true)
  }

  const onOrderChanged = (updatedFields) => {
    onPropertyChanged('routeIdFields', updatedFields, true)
  }

  return (
    <SettingSection title={getI18nMessage('defaultIdentifier')}>
      <SettingRow flow='wrap' label={getI18nMessage('routeIdentifier')}>
          <Select
            aria-label={getI18nMessage('routeIdentifier')}
            className='w-100'
            size='sm'
            value={networkInfo.defaultIdentifer}
            disabled={getActiveIdentifiersCount() === 1}
            onChange={(e) => { onPropertyChanged('defaultIdentifer', e.target.value, true) }}
          >
            {networkInfo.useRouteId && (
              <option value={Identifiers.RouteId}>{getI18nMessage('routeId')}</option>
            )}
            {networkInfo.useRouteName && (
              <option value={Identifiers.RouteName}>{getI18nMessage('routeName')}</option>
            )}
            {networkInfo.useMultiField && (
              <option value={Identifiers.MultiField}>{getI18nMessage('routeFields')}</option>
            )}
          </Select>
      </SettingRow>
      {networkInfo.defaultIdentifer === Identifiers.MultiField && (
      <React.Fragment>
        <List
          className='list-routeid-fields pt-2'
          showCheckbox={true}
          dndEnabled={true}
          itemsJson={Array.from(networkInfo.routeIdFields).map(
            (item, index) => ({
              itemStateDetailContent: item,
              itemKey: `${index}`,
              itemStateChecked: getCheckedState(index),
              itemStateTitle: item.field.alias,
              itemStateCommands: []
            })
          )}
          onUpdateItem={(actionData, refComponent) => {
            const { itemJsons } = refComponent.props
            const [, parentItemJson] = itemJsons as [
              TreeItemType,
              TreeItemsType
            ]
            onOrderChanged(
              parentItemJson.map((i) => i.itemStateDetailContent)
            )
          }}
          renderOverrideItemDetailToggle={((actionData, refComponent) => {
            const { itemJsons, itemJsons: [{ itemStateDetailVisible, itemStateDetailContent }] } = refComponent.props
            const [currentItemJson] = itemJsons
            const index = +currentItemJson.itemKey

            return (
              itemStateDetailContent
                ? <Checkbox
                  aria-expanded={!!itemStateDetailVisible}
                  className='jimu-tree-item__detail-toggle mr-2'
                  checked={getCheckedState(index)}
                  onClick={(evt) => { setCheckState(index) }}
                />
                : null
            )
          })}
          onClickItemBody={(actionData, refComponent) => {
            const { itemJsons: [currentItemJson] } = refComponent.props
            setCheckState(+currentItemJson.itemKey)
          }}
          {...advancedActionMap}
        />
      </React.Fragment>
      )}
      {networkInfo.supportsLines && (
        <div style={{ marginTop: '12px' }}>
        <SettingRow flow='wrap' label={getI18nMessage('lineIdentifier')}>
          <Select
            aria-label={getI18nMessage('lineIdentifier')}
            className='w-100'
            size='sm'
            value={networkInfo.defaultLineIdentifier}
            disabled={getActiveIdentifiersCount() === 1}
            onChange={(e) => { onPropertyChanged('defaultLineIdentifier', e.target.value, true) }}
          >
            {networkInfo.useLineId && (
              <option value={LineIdentifiers.LineId}>{getI18nMessage('lineId')}</option>
            )}
            {networkInfo.useLineName && (
              <option value={LineIdentifiers.LineName}>{getI18nMessage('lineName')}</option>
            )}
          </Select>
        </SettingRow>
        </div>
      )}
    </SettingSection>
  )
}
