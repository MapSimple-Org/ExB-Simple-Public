/** @jsx jsx */
import { jsx, DataSourceComponent, DataSourceManager, React, DataSourceStatus, type IMDataSourceInfo, appConfigUtils, getAppStore, type DataSource, type UseDataSource } from 'jimu-core'
import { checkIsArraysSameContent } from '../../utils/utils'
import type { OutputDataSourceWarningOption } from '../../config'

interface OutputDataSourceListProps {
  id: string
  reportOptions: any
  handleWarningLabelChange: (option: OutputDataSourceWarningOption) => void
}

const { useState, useEffect, useRef } = React

const OutputDataSourceList = (props: OutputDataSourceListProps) => {
  const outputDsCreatedStatusRef = useRef({})
  const preDsRef = useRef<string[]>(null)
  const { reportOptions, id, handleWarningLabelChange } = props
  const [outputDs, setOutputDs] = useState(null)
  const [ds, setDs] = useState(null)

  useEffect(() => {
    const reportSectionOverrides = reportOptions?.reportSectionOverrides || {}
    const newOutputDs = []
    const outputDsIds = []
    const dsIds = []
    const newDs = []

    Object.keys(reportSectionOverrides).forEach(key => {
      const reportItem = reportSectionOverrides[key]
      const ds = reportItem?.exbDatasource?.[0]
      const isDsOutputDs = reportItem?.isDsOutputDs
      if (ds && isDsOutputDs && !outputDsIds?.includes(ds?.dataSourceId)) {
        newOutputDs.push(ds)
        outputDsIds.push(ds?.dataSourceId)
      }

      if (ds && !isDsOutputDs && !dsIds?.includes(ds?.dataSourceId)) {
        newDs.push(ds)
        dsIds.push(ds?.dataSourceId)
      }
    })

    if (!checkIsArraysSameContent(outputDsIds, preDsRef.current)) {
      handleWarningLabelChange(null)
      outputDsCreatedStatusRef.current = {}
    }
    preDsRef.current = outputDsIds

    setOutputDs(newOutputDs)
    setDs(newDs)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportOptions])

  const onDSCreated = (ds) => {
    updateOutputDsCreatedStatus(true, ds)
  }

  const onCreateDataSourceFailed = (err, ds) => {
    updateOutputDsCreatedStatus(false, ds)
  }

  const updateOutputDsCreatedStatus = (isCreated: boolean, usDataSource) => {
    const dsId = usDataSource.dataSourceId
    const outputDsCreatedStatus = outputDsCreatedStatusRef.current
    const widgets = getAppStore().getState().appConfig?.widgets || {}

    if (outputDsCreatedStatus?.[dsId] !== isCreated) {
      outputDsCreatedStatus[dsId] = isCreated
      outputDsCreatedStatusRef.current = outputDsCreatedStatus

      const label = []
      const outputDsWidgetLabels = {}
      Object.keys(outputDsCreatedStatus).forEach(id => {
        if (!outputDsCreatedStatus[id]) {
          const dsM = DataSourceManager.getInstance()
          const ds = dsM.getDataSource(id)
          const dsLabel = ds?.getLabel()
          const usDs = getUseDataSourceByDataSource(ds)
          const outputDsWidgetId = appConfigUtils?.getWidgetIdByOutputDataSource(usDs)
          const widgetLabel = widgets?.[outputDsWidgetId]?.label
          if (outputDsWidgetId) {
            label.push(dsLabel)
            outputDsWidgetLabels[outputDsWidgetId] = widgetLabel
          }
        }
      })
      let widgetIds = null
      let labels = null
      if (Object.keys(outputDsWidgetLabels)?.length > 0) {
        labels = label.join(', ')
        widgetIds = Object.keys(outputDsWidgetLabels).map(id => outputDsWidgetLabels[id]).join(', ')
      }
      handleWarningLabelChange({
        label: labels,
        widgets: widgetIds
      })
    }
  }

  const getUseDataSourceByDataSource = (dataSource: DataSource): UseDataSource => {
    if (!dataSource) {
      return null
    }
    return {
      dataSourceId: dataSource.id,
      mainDataSourceId: dataSource.getMainDataSource().id,
      dataViewId: dataSource.dataViewId,
      rootDataSourceId: dataSource.getRootDataSource()?.id
    }
  }

  const onDataSourceInfoChange = (info: IMDataSourceInfo, dsId: string) => {
    const dsStatus = info?.status
    const isCreated = dsStatus !== DataSourceStatus.NotCreated && dsStatus !== DataSourceStatus.CreateError && dsStatus !== DataSourceStatus.LoadError && dsStatus !== DataSourceStatus.SaveError && dsStatus !== DataSourceStatus.NotReady
    updateOutputDsCreatedStatus(isCreated, dsId)
  }

  return (
    <div>
      {
        outputDs?.map(ds => {
          return (<DataSourceComponent
            key={ds.dataSourceId}
            query={null}
            useDataSource={ds}
            onDataSourceCreated={() => { onDSCreated(ds) }}
            onCreateDataSourceFailed={(err) => { onCreateDataSourceFailed(err, ds) }}
            widgetId={id}
            queryCount
            onDataSourceInfoChange={(info) => { onDataSourceInfoChange(info, ds) }}
          />)
        })
      }
      {
        ds?.map(ds => {
          return (<DataSourceComponent
            key={ds.dataSourceId}
            query={null}
            useDataSource={ds}
            widgetId={id}
            queryCount
          />)
        })
      }
    </div>
  )
}

export default OutputDataSourceList
