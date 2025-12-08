/** @jsx jsx */
import { React, jsx, type ImmutableObject, hooks, type ImmutableArray, defaultMessages as jimuUIDefaultMessages } from 'jimu-core'
import { SettingSection, SettingRow } from 'jimu-ui/advanced/setting-components'
import { Checkbox, Switch } from 'jimu-ui'
import defaultMessages from '../translations/default'
import { derivedFields, distanceField, lrsDefaultMessages, type LrsLayer, LrsLayerType, measureFields, stationField, toRouteField } from 'widgets/shared-code/lrs'

interface Props {
  lrsLayer?: ImmutableObject<LrsLayer>
  lrsLayers?: ImmutableArray<LrsLayer>
  onPropertyChanged: (prop: string, value: any, dsUpdateRequired?: boolean) => void
  onPropertiesChanged: (prop: string[], value: any[], dsUpdateRequired?: boolean) => void
}

export function NetworkItemFields (props: Props) {
  const { lrsLayer, lrsLayers, onPropertyChanged, onPropertiesChanged } = props
  const getI18nMessage = hooks.useTranslation(defaultMessages, lrsDefaultMessages, jimuUIDefaultMessages)
  const [isShowFields, setShowFields] = React.useState<boolean>(false)
  const [isCheckAllLrsFields, setCheckAllLrsFields] = React.useState<boolean>(false)
  const [isCheckAllAdditionalFields, setCheckAllAdditionalFields] = React.useState<boolean>(false)
  const [hasDerivedNetwork, setDerivedNetwork] = React.useState<boolean>()
  const networkInfo = lrsLayer?.layerType === LrsLayerType.Network ? lrsLayer.networkInfo : null

  React.useEffect(() => {
    if (!lrsLayer || !networkInfo) return
    const lrsNetworkId = networkInfo.lrsNetworkId.toString()
    const derivedNetInfo = lrsLayers.find(item => (item?.networkInfo && lrsNetworkId === item.networkInfo.derivedFromNetworkId) && item.networkInfo.isDerived)
    if (derivedNetInfo?.networkInfo?.isDerived) setDerivedNetwork(true)
    else setDerivedNetwork(false)
    const checkedFieldsLrs = []
    const checkedFieldsNonLrs = []

    const savedLrsFields = networkInfo.lrsFields
    const savedNonLrsFields = networkInfo.additionalFields
    if (savedLrsFields) {
      savedLrsFields.forEach((field) => {
        checkedFieldsLrs.push(field)
      })
    } else {
      const defaultChecked = networkInfo.defaultChecked
      if (!defaultChecked) return
      defaultChecked.forEach((field) => {
        checkedFieldsLrs.push(field)
      })
    }

    if (savedNonLrsFields) {
      savedNonLrsFields.forEach((field) => {
        checkedFieldsNonLrs.push(field)
      })
    } else {
      const defaultChecked = getAdditionalFields()
      if (!defaultChecked) return
      defaultChecked.forEach((field) => {
        checkedFieldsNonLrs.push(field.value)
      })
    }

    if (networkInfo?.lrsFields?.length === networkInfo?.layerFields?.length) {
        // Set checkAllLrsFields to true if all fields are checked
        setCheckAllLrsFields(true)
        const fields = networkInfo.layerFields
        fields.forEach((field) => {
          setPropValLrs(field.jimuName, true)
        })
    } else {
      setCheckAllLrsFields(false)
    }

    if (networkInfo?.additionalFields?.length === getAdditionalFields()?.length) {
      // Set checkAllAdditioalFields to true if all fields are checked
      setCheckAllAdditionalFields(true)
      const fields1 = getAdditionalFields()
      fields1.forEach((field) => {
        setPropValNonLrs(field.value, true)
      })
    } else {
      setCheckAllAdditionalFields(false)
    }

    setShowFields(networkInfo.showAdditionalFields)
    const props = ['lrsFields', 'additionalFields']
    const values = [checkedFieldsLrs, checkedFieldsNonLrs]
    onPropertiesChanged(props, values, true)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lrsLayer.name, hasDerivedNetwork])

  const setPropValLrs = (fieldName, value) => {
    const updatedFields = networkInfo?.lrsFields.asMutable()
    if (fieldName) {
      if (value && !networkInfo.lrsFields?.includes(fieldName)) {
        updatedFields.push(fieldName)
      } else if (!value && networkInfo.lrsFields?.includes(fieldName)) {
        const index = updatedFields.indexOf(fieldName)
        if (index !== -1) {
          updatedFields.splice(index, 1)
        }
      }
    }
    onPropertyChanged('lrsFields', updatedFields, true)
    if (updatedFields.length === networkInfo.layerFields.length) {
      setCheckAllLrsFields(true)
    } else {
      setCheckAllLrsFields(false)
    }
  }

  const setPropValNonLrs = (fieldName, value) => {
    const updatedFields = networkInfo.additionalFields.asMutable()
    if (fieldName) {
      if (value && !networkInfo.additionalFields?.includes(fieldName)) {
        updatedFields.push(fieldName)
      } else if (!value && networkInfo.additionalFields?.includes(fieldName)) {
        const index = updatedFields.indexOf(fieldName)
        if (index !== -1) {
          updatedFields.splice(index, 1)
        }
      }
    }
    onPropertyChanged('additionalFields', updatedFields, true)
    if (updatedFields.length === getAdditionalFields().length) {
      setCheckAllAdditionalFields(true)
    } else {
      setCheckAllAdditionalFields(false)
    }
  }

  const renderNetworkFields = () => {
    const fields = lrsLayer?.networkInfo?.layerFields
    if (!fields) return
    const results = []
    fields.forEach((field) => {
      results.push(
        <div>
          <Checkbox
            checked={lrsLayer.networkInfo.lrsFields?.includes(field.jimuName)}
            onClick={(e) => {
              setPropValLrs(field.jimuName, e.currentTarget.checked)
            }}
          />
          <span style={{ paddingLeft: '0.5rem' }}>{field.alias}</span>
        </div>
      )
    })
    return results
  }

  const getAdditionalFields = () => {
    const fields = []
    fields.push({
      label: measureFields.at(0).label,
      value: measureFields.at(0).value
    })
    fields.push({
      label: measureFields.at(1).label,
      value: measureFields.at(1).value
    })
    if (hasDerivedNetwork) {
      fields.push({
        label: derivedFields.at(0).label,
        value: derivedFields.at(0).value
      })
      fields.push({
        label: derivedFields.at(1).label,
        value: derivedFields.at(1).value
      })
      fields.push({
        label: derivedFields.at(2).label,
        value: derivedFields.at(2).value
      })
      fields.push({
        label: derivedFields.at(3).label,
        value: derivedFields.at(3).value
      })
    }
    fields.push({
      label: distanceField.label,
      value: distanceField.value
    })
    fields.push({
      label: stationField.at(0).label,
      value: stationField.at(0).value
    })
    fields.push({
      label: stationField.at(1).label,
      value: stationField.at(1).value
    })
    fields.push({
      label: stationField.at(2).label,
      value: stationField.at(2).value
    })

    if (networkInfo?.supportsLines) {
      fields.push({
        label: toRouteField.at(0).label,
        value: toRouteField.at(0).value
      })
      fields.push({
        label: toRouteField.at(1).label,
        value: toRouteField.at(1).value
      })
      fields.push({
        label: toRouteField.at(2).label,
        value: toRouteField.at(2).value
      })
      fields.push({
        label: toRouteField.at(3).label,
        value: toRouteField.at(3).value
      })
      fields.push({
        label: toRouteField.at(4).label,
        value: toRouteField.at(4).value
      })
    }
    return fields
  }

  const renderAdditionalFields = () => {
    const results = []
    const fields = getAdditionalFields()
    fields.forEach((field) => {
      results.push(
        <div>
          <Checkbox
            checked={networkInfo.additionalFields?.includes(field.value)}
            onClick={(e) => {
              setPropValNonLrs(field.value, e.currentTarget.checked)
            }}
          />
          <span style={{ paddingLeft: '0.5rem' }}>{field.label}</span>
        </div>
      )
    })
    return results
  }

  const onToggleAdditionalFields = (e) => {
    onPropertyChanged('showAdditionalFields', e.target.checked, true)
    setShowFields(e.target.checked)
  }

  const onChangeCheckAllLrsFields = (checked) => {
    setCheckAllLrsFields(checked)
    const updatedFields = networkInfo.lrsFields.asMutable()
    const fields = networkInfo.layerFields
    if (!fields) return
    fields.forEach((field) => {
      const fieldName = field.jimuName
      const value = checked
      if (fieldName) {
        if (value && !networkInfo.lrsFields?.includes(fieldName)) {
          updatedFields.push(fieldName)
        } else if (!value && networkInfo.lrsFields?.includes(fieldName)) {
          const index = updatedFields.indexOf(fieldName)
          if (index !== -1) {
            updatedFields.splice(index, 1)
          }
        }
      }
    })
    onPropertiesChanged(['lrsFields', 'checkAllLrsFields'], [updatedFields, checked], true)
  }

  const onChangeCheckAllAdditionalFields = (checked) => {
    setCheckAllAdditionalFields(checked)
    const updatedFields = networkInfo.additionalFields.asMutable()
    const fields = getAdditionalFields()
    if (!fields) return
    fields.forEach((field) => {
      const fieldName = field.value
      const value = checked
      if (fieldName) {
        if (value && !networkInfo.additionalFields?.includes(fieldName)) {
          updatedFields.push(fieldName)
        } else if (!value && networkInfo.additionalFields?.includes(fieldName)) {
          const index = updatedFields.indexOf(fieldName)
          if (index !== -1) {
            updatedFields.splice(index, 1)
          }
        }
      }
    })
    onPropertiesChanged(['additionalFields', 'checkAllAdditionalFields'],[updatedFields, checked], true)
  }

  const networkFields = renderNetworkFields()
  const additionalFields = renderAdditionalFields()

  return (
    <SettingSection role='group'>
        <SettingRow tag='label' aria-label={getI18nMessage('advancedFieldDisplay')} flow='no-wrap' label={getI18nMessage('advancedFieldDisplay')}>
          <Switch
            checked={isShowFields}
            onChange={onToggleAdditionalFields}
          />
        </SettingRow>
        {isShowFields && (
          <div style={{ paddingTop: '1rem' }}>
            <SettingRow aria-label={getI18nMessage('networkFields')} flow='no-wrap'
            label={getI18nMessage('networkFields')}>
              <Checkbox
                checked={isCheckAllLrsFields}
                onClick={(e) => {
                  onChangeCheckAllLrsFields(e.currentTarget.checked)
                }}
              />
            </SettingRow>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.7rem', marginBottom: '0.7rem', marginLeft: '0.7rem' }}>{networkFields}</div>
            <SettingRow aria-label={getI18nMessage('additionalFields')} flow='no-wrap'
              label={getI18nMessage('additionalFields')}>
                <Checkbox
                  checked={isCheckAllAdditionalFields}
                  onClick={(e) => {
                    onChangeCheckAllAdditionalFields(e.currentTarget.checked)
                  }}
                />
            </SettingRow>
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.7rem', marginLeft: '0.7rem' }}>{additionalFields}</div>
          </div>
        )}
    </SettingSection>
  )
}
