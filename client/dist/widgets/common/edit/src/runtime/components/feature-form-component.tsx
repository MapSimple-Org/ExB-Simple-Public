import {
  React, classNames, defaultMessages as jimuCoreMessages, type UseDataSource, type ImmutableArray,
  hooks, css, Immutable, type SubtypeSublayerDataSource, type FeatureDataRecord, type FeatureLayerDataSource,
  SupportedLayerServiceTypes, useIntl
} from 'jimu-core'
import { type ButtonProps, defaultMessages as jimuUIMessages, Loading, LoadingType, Paper, Typography } from 'jimu-ui'
import FormTemplate from 'esri/form/FormTemplate'
import { type LayersConfig, LayerHonorModeType } from '../../config'
import defaultMessages from '../translations/default'
import { getDataSourceById, getDsPrivileges, getEditDataSource, getEditHiddenFields } from '../../utils'
import {
  constructFormElements, type EditFeatures, flatMapArray, getDsAccessibleInfo, getIsAdvancedPermission, getDisplayField,
  featureFormStyle,
  useCalciteColorMapping
} from './utils'
import EmptyPlaceholder from './empty-placeholder'
import FeatureFormConfirm from './feature-form-confirm'
import FeatureFormHeader from './feature-form-header'
import FeatureFormButtons from './feature-form-buttons'
import FeatureFormList from './feature-form-list'
import FeatureFormSelect from './feature-form-select'
import EditListDataSource from './edit-list-ds'
import type { CommonProps } from '../widget'
import useFeatureForm from './use-feature-form'

export interface ControlButton {
  label: string
  type: ButtonProps['type']
  clickHandler: () => void
  disabled?: boolean
}

interface FeatureFormComponentProps extends CommonProps {
  label: string
  useDataSources: ImmutableArray<UseDataSource>
}

export type FeatureFormStep = 'empty' | 'list' | 'form' | 'new'
export type FormPriviledges = 'full' | 'none' | 'normal'

export interface LayerInfo {
  id: string
  dataSource: FeatureLayerDataSource | SubtypeSublayerDataSource
  layer: __esri.FeatureLayer | __esri.SubtypeSublayer
  formTemplate: FormTemplate
  isPublic: boolean
  privilege: FormPriviledges
}

const widgetStyle = css`
  ${featureFormStyle}
  &.widget-edit {
    .jimu-loading {
      z-index: 1;
    }
    .edit-con {
      display: flex;
      flex-direction: column;
    }
    .attr-height {
      overflow-y: auto;
      height: calc(100% - 113px);
      .edit-notice {
        margin: 12px 15px;
      }
    }
  }
`

export enum FormChangeType {
  Arcade = 'arcade',
  Normal = 'normal'
}

const FeatureFormComponent = (props: FeatureFormComponentProps) => {
  const { label: widgetLabel, config, canEditFeature, useDataSources } = props
  const { description, layersConfig, noDataMessage, batchEditing } = config

  const [activeId, setActiveId] = React.useState<string>(null)
  const [activeFeatures, setActiveFeatures] = React.useState<Array<FeatureDataRecord['feature']>>(null)
  const [editFeatures, setEditFeatures] = React.useState<EditFeatures>({})
  const [sourceVersion, setSourceVersion] = React.useState<number>(null)
  const [layersInfo, setLayersInfo] = React.useState<{ [dsId: string]: LayerInfo }>({})
  const [addLayersConfig, setAddLayersConfig] = React.useState<ImmutableArray<LayersConfig>>(Immutable([]))
  const [delConfirm, setDelConfirm] = React.useState(false)
  const [backConfirm, setBackConfirm] = React.useState(false)

  const editContainer = React.useRef<HTMLDivElement>(undefined)

  const activeLayerInfo = React.useMemo(() => layersInfo[activeId], [activeId, layersInfo])

  const translate = hooks.useTranslation(defaultMessages, jimuCoreMessages, jimuUIMessages)

  React.useEffect(() => {
    const newEditFeatures = Object.assign({}, editFeatures)
    let editFeaturesChanged = false
    for (const dsId in editFeatures) {
      const layerConfig = layersConfig.find(l => l.id === dsId)
      if (!layerConfig) {
        delete newEditFeatures[dsId]
        editFeaturesChanged = true
      }
    }
    editFeaturesChanged && setEditFeatures(newEditFeatures)
  }, [editFeatures, layersConfig])

  const { loading, formChange, formSubmittable, saveForm, addForm, deleteForm } = useFeatureForm({
    sourceVersion,
    activeLayerInfo,
    activeFeatures,
    editContainer,
  })

  const formPrivilegesIsFull = activeLayerInfo?.privilege === 'full'
  const formPrivilegesIsNormal = activeLayerInfo?.privilege === 'normal'
  const formEditable = activeLayerInfo?.isPublic || canEditFeature || formPrivilegesIsFull
  const activeConfig = layersConfig.find(item => item.id === activeId)
  const layerDefinition = activeLayerInfo?.dataSource?.getLayerDefinition?.()
  const {create, update, deletable} = getDsPrivileges(layerDefinition)
  const updateRecords = activeConfig?.updateRecords && update
  const deleteRecords = activeConfig?.deleteRecords && deletable
  const addRecords = activeConfig?.addRecords && create
  const isTableLayer = layerDefinition?.type === SupportedLayerServiceTypes.Table

  const intl = useIntl()
  const countLabel = activeFeatures?.length > 1 ? ` (${intl.formatNumber(activeFeatures.length)})` : ''
  const controls: ControlButton[] = []
  if (formPrivilegesIsFull || (formPrivilegesIsNormal && updateRecords)) {
    controls.push({
      label: translate('update') + countLabel,
      type: 'primary',
      disabled: !(formChange && formSubmittable),
      clickHandler: saveForm
    })
  }
  const handleDeleteConfirm = React.useCallback(() => {
    setDelConfirm(true)
  }, [])
  const cancelDelete = React.useCallback(() => {
    setDelConfirm(false)
  }, [])
  const handleDelete = React.useCallback(async () => {
    const success = await deleteForm()
    if (success) {
      setDelConfirm(false)
    }
  }, [deleteForm])
  if (formPrivilegesIsFull || (formPrivilegesIsNormal && deleteRecords)) {
    controls.push({
      label: translate('delete') + countLabel,
      type: 'danger',
      clickHandler: handleDeleteConfirm
    })
  }

  const addControls: ControlButton[] = []
  const handleAdd = React.useCallback(async () => {
    const success = await addForm()
    if (success) {
      setActiveId(null)
    }
  }, [addForm])
  if (isTableLayer && (formPrivilegesIsFull || (formPrivilegesIsNormal && addRecords))) {
    addControls.push({
      label: translate('add'),
      type: 'primary',
      disabled: false,
      clickHandler: handleAdd
    })
  }

  const handleBack = React.useCallback(() => {
    const flatEditFeatures = flatMapArray(editFeatures)
    if (flatEditFeatures.length === 1) {
      let needClearSelection = true
      const featureRecord = flatEditFeatures[0]
      const dataSource = featureRecord.dataSource
      const selectedRecordIds = dataSource.getSelectedRecordIds()
      if (selectedRecordIds.length > 1 || !selectedRecordIds.includes(featureRecord.getId())) {
        needClearSelection = false
      }
      if (dataSource && needClearSelection) {
        dataSource.clearSelection()
      }
    }
    setBackConfirm(false)
    setActiveId(null)
    setActiveFeatures(null)
  }, [editFeatures])
  const handleBackConfirm = React.useCallback(() => {
    if (formChange) {
      setBackConfirm(true)
    } else {
      handleBack()
    }
  }, [formChange, handleBack])
  const cancelBack = React.useCallback(() => {
    setBackConfirm(false)
  }, [])

  const handleClickItem = React.useCallback((dsId: string, feature: FeatureDataRecord['feature']) => {
    setActiveId(dsId)
    setActiveFeatures([feature])
  }, [])
  const handleBatchEdit = React.useCallback((dsId: string, features: Array<FeatureDataRecord['feature']>) => {
    setActiveId(dsId)
    setActiveFeatures(features)
  }, [])

  React.useEffect(() => {
    if (typeof canEditFeature !== 'boolean') return
    const newAddLayersConfig = layersConfig.filter(layerConfig => {
      const layerInfo = layersInfo[layerConfig.id]
      if (!layerInfo) return false
      const layerDefinition = layerInfo.dataSource.getLayerDefinition()
      const isTable = layerDefinition?.type === SupportedLayerServiceTypes.Table
      return (layerInfo.isPublic || canEditFeature) && isTable && (
        layerInfo.privilege === 'full' ||
        (layerInfo.privilege === 'normal' && layerConfig.addRecords)
      )
    })
    setAddLayersConfig(newAddLayersConfig)
  }, [canEditFeature, layersConfig, layersInfo])

  const handleNew = React.useCallback(() => {
    const firstId = addLayersConfig[0].id
    setActiveId(firstId)
    setActiveFeatures(null)
  }, [addLayersConfig])

  const getLayerInfo = React.useCallback(async (dsId: string) => {
    try {
      const ds = getDataSourceById(dsId)
      const dataSource = getEditDataSource(ds)
      const layer = await dataSource.createJSAPILayerByDataSource() as __esri.FeatureLayer | __esri.SubtypeSublayer
      let formTemplate: FormTemplate
      const layerConfig = layersConfig.filter(l => l.id === dsId)[0]
      if (!layerConfig) return
      if (layerConfig.layerHonorMode === LayerHonorModeType.Webmap) {
        formTemplate = layer.formTemplate
      } else {
        const hiddenFields = getEditHiddenFields(dataSource.getLayerDefinition())
        const fieldElements = (layer.formTemplate?.elements || []).filter(e => e.type === 'field')
        const elements = constructFormElements(layerConfig.groupedFields.asMutable({ deep: true }), hiddenFields, fieldElements)
        formTemplate = layer.formTemplate ? layer.formTemplate.clone() : new FormTemplate()
        formTemplate.elements = elements
      }
      // New logic of API: The user with advanced permissions can modify the configuration regardless of the configuration
      const isAdvancedPermission = await getIsAdvancedPermission(dataSource)
      // full editing privileges
      const fullEditingPrivileges: boolean = (layer as any).userHasFullEditingPrivileges
      const layerEditingEnabled: boolean = layer.editingEnabled ?? true
      let privilege: 'full' | 'none' | 'normal'
      if (isAdvancedPermission || (fullEditingPrivileges && layerEditingEnabled)) {
        privilege = 'full'
      } else if (!layerEditingEnabled) {
        privilege = 'none'
      } else {
        privilege = 'normal'
      }
      // fetch to confirm whether it's a public source
      const isPublic = await getDsAccessibleInfo(layer.url)
      const layerInfo = {
        id: layerConfig.id,
        dataSource,
        layer,
        formTemplate,
        isPublic,
        privilege
      }
      return layerInfo
    } catch (err) {
      console.error(err)
    }
  }, [layersConfig])

  const handleDataSourceCreated = React.useCallback(async (dsId: string) => {
    const newLayerInfo = await getLayerInfo(dsId)
    setLayersInfo(old => {
      const newLayersInfo = {}
      for (const l of layersConfig) {
        if (l.id === dsId) {
          newLayersInfo[l.id] = newLayerInfo
        } else if (old[l.id]) {
          newLayersInfo[l.id] = old[l.id]
        }
      }
      return newLayersInfo
    })
  }, [getLayerInfo, layersConfig])

  const activeIdRef = hooks.useLatest(activeId)
  React.useEffect(() => {
    const updateLayersInfo = async () => {
      const newLayersInfo = {}
      for (const layerConfig of layersConfig) {
        const dsId = layerConfig.id
        const ds = getDataSourceById(dsId)
        if (!ds) continue
        newLayersInfo[layerConfig.id] = await getLayerInfo(layerConfig.id)
      }
      setLayersInfo(newLayersInfo)
      if (activeIdRef.current && !newLayersInfo[activeIdRef.current]) {
        setActiveId(null)
        setActiveFeatures(null)
      }
    }
    updateLayersInfo()
  }, [layersConfig, getLayerInfo, activeIdRef])

  const editFeatureRef = hooks.useLatest(editFeatures)
  const handleSelectionChange = React.useCallback(async (dataSourceIds: string[], sourceVersion?: number) => {
    const newEditFeatures = Object.assign({}, editFeatureRef.current)
    for (const dataSourceId of dataSourceIds) {
      const dataSource = getDataSourceById(dataSourceId)
      if (!dataSource) return
      let editRecords = dataSource.getSelectedRecords() as FeatureDataRecord[]
      const fieldNames = Object.keys(dataSource.getSchema().fields || {})
      const idField = dataSource.getIdField()
      const displayField = getDisplayField(dataSource)
      if (editRecords.length > 0 && !editRecords[0].getFieldValue(displayField) && fieldNames.includes(displayField)) {
        try{
          const ids = editRecords.map(r => r.getId())
          const queryResult = await dataSource.query({ outFields: [idField, displayField], where: `${idField} in (${ids.join(',')})` })
          if (queryResult.records) {
            editRecords = queryResult.records as FeatureDataRecord[]
          }
        } catch (err) {
          console.error(err)
        }
      }
      newEditFeatures[dataSourceId] = editRecords
    }
    setEditFeatures(newEditFeatures)
    const flatEditFeatures = flatMapArray(newEditFeatures)
    if (flatEditFeatures.length === 1) {
      const [dsId, features] = Object.entries(newEditFeatures).find(([dsId, features]) => features.length > 0)
      setActiveId(dsId)
      setSourceVersion(sourceVersion)
      setActiveFeatures([features[0].feature])
    } else {
      setActiveId(null)
      setActiveFeatures(null)
    }
  }, [editFeatureRef])

  const handleSourceVersionChange = React.useCallback((dataSourceId: string, sourceVersion: number) => {
    handleSelectionChange([dataSourceId], sourceVersion)
  }, [handleSelectionChange])

  const layersOrder = React.useMemo(() => layersConfig.map(l => l.id).asMutable(), [layersConfig])
  const flatEditFeatures = flatMapArray(editFeatures)
  const editCount = flatEditFeatures.length
  const hasValidLayer = layersConfig.length > 0
  const noLayerTips = translate('initAttEmptyMessage')
  const emptyTips = hasValidLayer ? (noDataMessage || translate('noRecordTips')) : noLayerTips

  let featureFormStep: FeatureFormStep
  if (activeId) {
    featureFormStep = activeFeatures ? 'form' : 'new'
  } else {
    featureFormStep = editCount > 1 ? 'list' : 'empty'
  }

  let reliesOnFormPrivilegesIsFull = false
  if (featureFormStep === 'form') {
    reliesOnFormPrivilegesIsFull = (!updateRecords || !deleteRecords) && formPrivilegesIsFull
  } else if (featureFormStep === 'new') {
    reliesOnFormPrivilegesIsFull = !addRecords && formPrivilegesIsFull
  }

  const calciteColorMapping = useCalciteColorMapping()

  return (
    <Paper shape='none' className='jimu-widget widget-edit esri-widget' css={[widgetStyle, calciteColorMapping]}>
      {loading && <Loading type={LoadingType.Secondary} />}
      <div className='edit-con surface-1 border-0 h-100'>
        <FeatureFormHeader
          widgetLabel={widgetLabel}
          description={description}
          hasTableLayerAdd={addLayersConfig.length > 0}
          featureFormStep={featureFormStep}
          activeLayerInfo={activeLayerInfo}
          activeFeatures={activeFeatures}
          editCount={editCount}
          onBack={handleBackConfirm}
          onNew={handleNew}
        />
        <div className={classNames('attr-height', {'d-none': featureFormStep !== 'form' && featureFormStep !== 'new'})} ref={editContainer}>
          {featureFormStep === 'new' &&
            <FeatureFormSelect
              addLayersConfig={addLayersConfig}
              activeId={activeId}
              onChange={setActiveId}
            />
          }
          {reliesOnFormPrivilegesIsFull &&
            <calcite-notice className='edit-notice' kind='brand' open scale="s">
              <div slot="message">
                <Typography variant='label3'>{translate('ownerAdminNotice')}</Typography>
              </div>
            </calcite-notice>
          }
        </div>
        {featureFormStep === 'list' &&
          <FeatureFormList
            editFeatures={editFeatures}
            layersInfo={layersInfo}
            layersOrder={layersOrder}
            onClickItem={handleClickItem}
            batchEditing={batchEditing}
            onBatchEdit={handleBatchEdit}
          />
        }
        {featureFormStep === 'empty' &&
          <EmptyPlaceholder emptyTips={emptyTips} />
        }
        {featureFormStep === 'form' && controls.length > 0 && formEditable &&
          <FeatureFormButtons buttons={controls} />
        }
        {featureFormStep === 'new' && addControls.length > 0 &&
          <FeatureFormButtons buttons={addControls} />
        }
      </div>
      {delConfirm && <FeatureFormConfirm
        title={translate('deleteRecord')}
        message={activeFeatures?.length > 1 ? translate('deleteRecordsTips') : translate('deleteRecordTips')}
        confirmText={translate('delete')}
        cancelText={translate('keepRecord')}
        onConfirm={handleDelete}
        onCancel={cancelDelete}
      />}
      {backConfirm && <FeatureFormConfirm
        title={translate('selectionChangeConfirmTitle')}
        message={translate('selectionChangeConfirmTips')}
        confirmText={translate('discardConfirm')}
        cancelText={translate('discardCancel')}
        onConfirm={handleBack}
        onCancel={cancelBack}
      />}
      <EditListDataSource
        useDataSources={useDataSources}
        unsavedChange={formChange === FormChangeType.Normal && activeFeatures?.length > 0}
        onDataSourceCreated={handleDataSourceCreated}
        onSelectionChange={handleSelectionChange}
        onSourceVersionChange={handleSourceVersionChange}
      />
    </Paper>
  )
}

export default FeatureFormComponent
