/** @jsx jsx */
import {
  jsx,
  hooks,
  React,
  css,
  type DataSource
} from 'jimu-core'

import defaultMessages from '../../translations/default'
import { AdvancedSelect, type AdvancedSelectItem } from 'jimu-ui'
import { useDynSegRuntimeDispatch, useDynSegRuntimeState } from '../../state'
import { ListVisibleOutlined } from '../../utils/iconUtils'

export interface HideFieldsProps {
  networkDS: DataSource
}

export function HideFields (props: HideFieldsProps) {
  const getI18nMessage = hooks.useTranslation(defaultMessages)
  const { fieldInfo, display } = useDynSegRuntimeState()
  const { networkDS } = props
  const dispatch = useDynSegRuntimeDispatch()
  const [selectedFields, setSelectedFields] = React.useState<AdvancedSelectItem[]>()
  const [allFields, setAllFields] = React.useState([])
  const [allFieldInfo, setFieldInfo] = React.useState([])
  const [isDisable, setDisable] = React.useState(true)

  React.useEffect(() => {
    const selectedFields = createFields()
    setSelectedFields(selectedFields)
    setAllFields(selectedFields)
    setFieldInfo(fieldInfo)
    if (!fieldInfo || fieldInfo.length === 0) setDisable(true)
    else setDisable(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldInfo, display])

  const createFields = (): AdvancedSelectItem[] => {
    const fields = []
    if (!fieldInfo || fieldInfo.length === 0) return []
    fieldInfo.forEach((info) => {
      if (info.isEventIdField || info.isOidField || info.exclude) {
        // exclude eventId and oid fields
      } else {
        const option = {
          label: info.featureFieldAlias,
          value: info.featureFieldAlias
        }
        fields.push(option)
      }
    })
    return fields
  }

  const setHideAllFields = () => {
    allFieldInfo.forEach((info) => {
      info.visible = false
    })
    setFieldInfo(allFieldInfo)
    dispatch({ type: 'SET_FIELD_INFO', value: allFieldInfo })
    setSelectedFields([])
  }

  const onSelectedFieldsChange = (valuePairs: AdvancedSelectItem[]) => {
    if (!valuePairs || valuePairs.length === 0) setHideAllFields()
    else {
      setSelectedFields(valuePairs)
      toggleVisibility(valuePairs)
    }
  }

  const toggleVisibility = (valuePairs) => {
    //reset fields visibility
    allFieldInfo.forEach((info) => {
      info.visible = true
    })
    setFieldInfo(allFieldInfo)

    const checkedFields = valuePairs
    const uncheckedFields = allFields.filter(
      field => !checkedFields.some(checked => checked.value === field.value)
    )
    const infos = allFieldInfo
    uncheckedFields.forEach((pair) => {
      const value = pair.value
      const info = infos.find(info => info.featureFieldAlias === value)
      info.visible = false
    })
    dispatch({ type: 'SET_FIELD_INFO', value: infos })
  }

  const cssStyle = css`
    .advance-select-lrs,
    .advance-select-lrs .jimu-dropdown,
    .advance-select-lrs .jimu-dropdown button {
      padding: 0;
      margin: 0;
      border: none;
    }

    .advance-select-lrs,
    .advance-select-lrs .jimu-dropdown {
      padding: 0;
      margin: 0;
      border: none;
      height: 100%;
    }

    .advance-select-lrs .jimu-dropdown button  {
      padding-inline: 1rem;
    }

    .advance-select-lrs .jimu-dropdown button: disabled{
      background-color: transparent;
      color: #6a6a6a;
      opacity: 0.5;
    }

  `
  return (
    <span css={cssStyle}>
      {networkDS && (<AdvancedSelect
        className='advance-select-lrs'
        size="sm"
        title={getI18nMessage('showFields')}
        dataSource={networkDS}
        sortList={false}
        selectedValues={selectedFields}
        isMultiple
        icon={true}
        arrow={false}
        disabled={isDisable}
        strategy='absolute'
        customDropdownButtonContent={() => {
          return (
            <ListVisibleOutlined />
          )
        }}
        onChange={onSelectedFieldsChange}
        staticValues={createFields()}
      />)}
    </span>
  )
};
