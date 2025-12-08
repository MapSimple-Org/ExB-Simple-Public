import {
  css, privilegeUtils, type IMThemeVariables, type SerializedStyles,
  type QueriableDataSource, type ClauseValuePair, type FeatureLayerDataSource
} from 'jimu-core'
import { LayerHonorModeType, type LayersConfig } from '../config'

interface UsedFields {
  popupAllFields: ClauseValuePair[]
  actionUsedFields: string[]
}

/**
 * Function to get all fields of table from popup info and used fields for data action.
 * @param {LayersConfig} curLayer active layer config
 * @param {QueriableDataSource} dataSource current dataSource
 * @returns {UsedFields} all fields and used fields for data action
 */
export function getUsedFields (curLayer: LayersConfig, dataSource: QueriableDataSource): UsedFields {
  if (!curLayer) return { popupAllFields: [], actionUsedFields: [] }
  const popupAllFields: ClauseValuePair[] = []
  if (dataSource) {
    const allFieldsSchema = dataSource?.getSchema()
    if (!allFieldsSchema?.fields) return { popupAllFields: [], actionUsedFields: [] }
    const schemaFieldsKeys = Object.keys(allFieldsSchema?.fields)
    const popupInfo = (dataSource as FeatureLayerDataSource)?.getPopupInfo()
    if (popupInfo) {
      const popupAllFieldInfos = popupInfo.fieldInfos || []
      const filteredPopupFieldInfos = popupAllFieldInfos.filter(item => schemaFieldsKeys.includes(item.fieldName))
      for (const item of filteredPopupFieldInfos) {
        if (item.visible) popupAllFields.push({ value: item.fieldName, label: item.label || item.fieldName })
      }
    } else {
      // if popupInfo is null, use definition or 'allFields' instead
      const layerDefinitionFields = (dataSource as FeatureLayerDataSource)?.getLayerDefinition()?.fields
      const useFields = layerDefinitionFields?.length > 0 ? layerDefinitionFields : curLayer.allFields
      const filteredUseFields = (useFields as any[]).filter(item => schemaFieldsKeys.includes(item.jimuName || item.name))
      for (const item of filteredUseFields) {
        popupAllFields.push({ value: item.name, label: item.alias || item.name })
      }
    }
  }
  const isHonorWebmap = curLayer.layerHonorMode === LayerHonorModeType.Webmap
  const actionUsedFields = isHonorWebmap ? popupAllFields.map(item => item.value as string) : curLayer.tableFields.map(item => item.jimuName)
  return { popupAllFields, actionUsedFields }
}

/**
 * Function to get global table tool css
 * @param {IMThemeVariables} theme used theme
 * @returns {SerializedStyles} style for table tool
 */
export function getGlobalTableTools (theme: IMThemeVariables): SerializedStyles {
  return css`
    .esri-button-menu__item .esri-button-menu__item-label{
      padding: 4px 15px !important;
    }
    .table-popup-search{
      .search-icon{
        z-index: 2;
      }
      .popup-search-input{
        border-radius: 2px;
        .input-wrapper{
          height: 30px;
        }
      }
    }
    .table-action-option{
      width: 100%;
      display: inline-flex;
      flex-direction: row;
      .table-action-option-tab{
        margin: auto 8px;
      }
      .table-action-option-close{
        flex: 1;
        button{
          :hover {
            color: ${theme.sys.color.action.default};
          }
          float: right;
        }
      }
    }
    .esri-popover--open{
      z-index: 1005 !important;
      .esri-date-picker__calendar{
        background-color: ${theme.sys.color.action.default};
      }
    }
  `
}

export const getPrivilege = async () => {
  const exbAccess = await privilegeUtils.checkExbAccess(privilegeUtils.CheckTarget.Experience)
  return exbAccess?.capabilities?.canEditFeature
}

export const minusStringArray = (array1: string[], array2: string[]) => {
  const lengthFlag = array1.length > array2.length
  const arr1 = lengthFlag ? array1 : array2
  const arr2 = lengthFlag ? array2 : array1
  return arr1.filter(item => {
    const hasField = arr2.some(ele => {
      return ele === item
    })
    return !hasField
  })
}

export const areArraysEqual = (arr1: string[], arr2: string[]) =>{
  if (arr1.length !== arr2.length) return false
  return arr1.every((value, index) => value === arr2[index])
}
