import { React, dataSourceUtils, type FeatureDataRecord } from 'jimu-core'
import FeatureForm from 'esri/widgets/FeatureForm'
import BatchAttributeForm from 'esri/widgets/BatchAttributeForm'
import Graphic from 'esri/Graphic'
import Collection from 'esri/core/Collection'
import { applyAttributeUpdates, getTimezone, updateDataSourceAfterEdit } from './utils'
import { getDataSourceById, getEditDataSource, getFlatFormElements } from '../../utils'
import { FormChangeType, type LayerInfo } from './feature-form-component'

interface UseFeatureFormOptions {
  activeLayerInfo: LayerInfo
  activeFeatures: Array<FeatureDataRecord['feature']>
  sourceVersion: number
  editContainer: React.RefObject<HTMLDivElement>
}

const useFeatureForm = (options: UseFeatureFormOptions) => {
  const { activeLayerInfo, activeFeatures, sourceVersion, editContainer } = options
  const activeId = activeLayerInfo?.id
  const activeLayer = activeLayerInfo?.layer
  const formTemplate = activeLayerInfo?.formTemplate

  const [formChange, setFormChange] = React.useState<FormChangeType>(null)
  const [formSubmittable, setFormSubmittable] = React.useState(false)
  const [loading, setLoading] = React.useState(false)

  const editForm = React.useRef<FeatureForm | BatchAttributeForm>(null)
  const destroyEditForm = React.useCallback(() => {
    if (editForm.current?.destroy && !editForm.current?.destroyed) {
      editForm.current.destroy()
      setFormChange(null)
    }
  }, [])
  const renderEditForm = React.useCallback(async () => {
    try {
      destroyEditForm()
      const ds = getDataSourceById(activeId)
      const dataSource = getEditDataSource(ds)
      const container = document && document.createElement('div')
      editContainer.current.appendChild(container)
      let features: __esri.Graphic[]
      if (!activeFeatures || activeFeatures.length === 0) {
        features = [new Graphic({ layer: activeLayer })]
      } else {
        const objectIdField = dataSource.getIdField() || 'OBJECTID'
        const objectIds = activeFeatures.map((f) => f.attributes[objectIdField])
        const recordQuery = `${objectIdField} IN (${objectIds.join(',')})`
        const result = await dataSource.query({
          where: recordQuery,
          returnGeometry: true,
          notAddFieldsToClient: true,
          outFields: ['*']
        })
        const fullRecords = (result?.records || []) as FeatureDataRecord[]
        features = await Promise.all(fullRecords.map(async (fullRecord) => await dataSourceUtils.changeToJSAPIGraphic(fullRecord.feature)))
      }
      const originFields = activeLayer.fields
      if (!originFields || activeLayer.loadStatus !== 'loaded') {
        // For arcade data source, the layer's fields may be filtered by the arcade script.
        // If the layer is not loaded, the FeatureForm will load the layer and the fields will be all fields.
        // So we need to load the layer first and then set the original fields back to the layer.
        await activeLayer.load()
        if (originFields && originFields.length > 0) {
          activeLayer.set({'fields': originFields})
        }
      }
      if (features.length > 1) {
        const featureCollection = new Collection(features)
        const batchForm = new BatchAttributeForm({
          container: container,
          features: featureCollection,
          timeZone: getTimezone(dataSource)
        })
        editForm.current = batchForm
        batchForm.on('value-change', (changedValue) => {
          const submittable = batchForm.viewModel.valid
          const change = batchForm.viewModel.userHasChangedValues ? FormChangeType.Normal : FormChangeType.Arcade
          setFormChange(change)
          setFormSubmittable(submittable)
        })
      } else if (features.length === 1) {
        const feature = features[0]
        const featureForm = new FeatureForm({
          container: container,
          feature: features[0],
          layer: activeLayer,
          formTemplate,
          timeZone: getTimezone(dataSource)
        })
        editForm.current = featureForm
        featureForm.on('value-change', (changedValue) => {
          const idField = dataSource.getIdField()
          const { fieldName } = changedValue
          // Exclude cases where the 'value-change' is caused by dataSource select.
          // If the changed field has an idField, the change is caused by dataSource select change.
          if (fieldName === idField) return
          const submittable = featureForm.viewModel.submittable
          const originalFormValues = feature.attributes
          const newFormValues = featureForm.viewModel.getValues()
          let change: FormChangeType = null
          if (newFormValues) {
            const arcadeFields = getFlatFormElements(featureForm.viewModel.formTemplate?.elements || [])
              .map(e => e.type === 'field' && e.valueExpression && e.fieldName).filter(v => !!v) || []
            for (const key in newFormValues) {
              if (originalFormValues?.[key] !== newFormValues[key]) {
                const isArcade = arcadeFields.includes(key)
                if (isArcade && !change) {
                  change = FormChangeType.Arcade
                }
                if (!isArcade) {
                  change = FormChangeType.Normal
                break
                }
              }
            }
          }
          setFormChange(change)
          setFormSubmittable(submittable)
        })
      }
    } catch (err) {
      console.error(err)
    }
  }, [activeFeatures, activeId, activeLayer, destroyEditForm, editContainer, formTemplate])

  const saveForm = React.useCallback(async () => {
    const form = editForm.current
    if (!form) return
    let edits: __esri.FeatureLayerApplyEditsEdits = {}
    if (form instanceof BatchAttributeForm) {
      if (!form.viewModel.valid) return
      const allFieldInputs = form.viewModel.activeForm.allFieldInputs
      const updatedAttributes = {}
      allFieldInputs.forEach((fieldInput) => {
        if (fieldInput.distinctValues.length !== 1) return
        const fieldValue = fieldInput.distinctValues[0]
        if (fieldInput.userHasChangedValue || (fieldInput as any).template.hasValueCalculations) {
          updatedAttributes[fieldInput.fieldName] = fieldValue
        }
      })
      const objectIdField = activeLayerInfo.layer.objectIdField
      const updateFeatures = form.features.map(f => ({
        attributes: {
          ...updatedAttributes,
          [objectIdField]: f.getObjectId()
        }
      } as __esri.Graphic))
      edits = {
        updateFeatures
      }
    } else if (form instanceof FeatureForm) {
      if (!form.viewModel.submittable) return
      const newFeature = form.feature
      if (!newFeature) return
      if (newFeature?.geometry) {
        newFeature.geometry = null
      }
      const updated = form.getValues()
      Object.keys(updated).forEach((name) => {
        newFeature.attributes[name] = updated[name]
      })
      edits = {
        updateFeatures: [newFeature]
      }
    }
    setLoading(true)
    setFormChange(null)
    try {
      await applyAttributeUpdates(activeLayerInfo, edits)
      let updateEdits = edits
      if (edits.updateFeatures.length > 1) {
        try {
          const ds = activeLayerInfo.dataSource
          const objectIdField = ds.getIdField() || 'OBJECTID'
          const updateIds = edits.updateFeatures.map(f => {
            const objectId = f.attributes[objectIdField]
            return typeof objectId === 'number' ? objectId : parseInt(objectId)
          })
          const result = await ds.query({
            where: `${objectIdField} IN (${updateIds.join(',')})`,
            outFields: ['*'],
            returnGeometry: false
          })
          const updateFeatures = (result?.records || []).map((r: FeatureDataRecord) => r.feature as __esri.Graphic)
          updateEdits = { updateFeatures }
        } catch (e) {
          console.error(e)
        }
      }
      updateDataSourceAfterEdit(activeLayerInfo.dataSource, updateEdits)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
    return true
  }, [activeLayerInfo])

  const addForm = React.useCallback(async () => {
    const featureForm = editForm.current as FeatureForm
    const formViewModel = featureForm?.viewModel
    const submittable = formViewModel?.submittable
    const addFeature = formViewModel?.feature
    if (submittable && addFeature) {
      const updated = featureForm.getValues()
      addFeature.attributes = updated
      const edits = {
        addFeatures: [addFeature]
      }
      setLoading(true)
      setFormChange(null)
      try {
        await applyAttributeUpdates(activeLayerInfo, edits)
        updateDataSourceAfterEdit(activeLayerInfo.dataSource, edits)
      } catch (e) {
        console.error(e)
      }
      setLoading(false)
      return true
    }
  }, [activeLayerInfo])

  const deleteForm = React.useCallback(async () => {
    const form = editForm.current
    if (!form) return
    let edits: __esri.FeatureLayerApplyEditsEdits = {}
    if (form instanceof FeatureForm) {
      const objectId = form.feature.getObjectId()
      edits = {
        deleteFeatures: [{
          objectId: typeof objectId === 'number' ? objectId : parseInt(objectId),
        }]
      }
    } else if (form instanceof BatchAttributeForm) {
      const objectIds = form.features.map(f => f.getObjectId()).toArray()
      edits = {
        deleteFeatures: objectIds.map(objectId => ( {objectId: typeof objectId === 'number' ? objectId : parseInt(objectId) }))
      }
    }
    setLoading(true)
    setFormChange(null)
    try {
      await applyAttributeUpdates(activeLayerInfo, edits)
      updateDataSourceAfterEdit(activeLayerInfo.dataSource, edits)
    } catch (e) {
      console.error(e)
    }
    setLoading(false)
    return true
  }, [activeLayerInfo])

  const timer = React.useRef<number>(null)
  React.useEffect(() => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      if (activeId && activeLayer && editContainer.current) {
        renderEditForm()
      } else {
        destroyEditForm()
      }
    }, 500)
  }, [activeId, activeLayer, sourceVersion, editContainer, destroyEditForm, renderEditForm, activeFeatures?.length])

  // JSAPI bug: FeatureForm's value-change not work for the first time due to deps loading.
  // Below code load the deps in advance to avoid the bug.
  React.useEffect(() => {
    const featureForm = new FeatureForm()
    featureForm.destroy()
  }, [])

  return { loading, formChange, formSubmittable, saveForm, addForm, deleteForm }
}

export default useFeatureForm
