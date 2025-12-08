import { React, type DataSource, type IMUseDataSource, hooks, type ImmutableArray, type UseDataSource } from 'jimu-core'
import { ConfirmDialog } from 'jimu-ui'
import defaultMessages from '../translations/default'
import EditItemDataSource from './edit-item-ds'

interface EditListDataSourceProps {
  useDataSources: IMUseDataSource[] | ImmutableArray<UseDataSource>
  unsavedChange: boolean
  onDataSourceCreated?: (dataSourceId: string, dataSource?: DataSource) => void
  onSelectionChange: (dataSourceIds: string[]) => void
  onSourceVersionChange?: (dataSourceId: string, sourceVersion: number) => void
}

const EditListDataSource = (props: EditListDataSourceProps) => {
  const { useDataSources, unsavedChange, onDataSourceCreated, onSelectionChange, onSourceVersionChange } = props

  const [showConfirm, setShowConfirm] = React.useState(false)
  const selectionToBeChangeDsIds = React.useRef<string[]>([])
  const timer = React.useRef<number>(null)
  const doSelectionChange = React.useCallback(() => {
    if (selectionToBeChangeDsIds.current.length > 0) {
      timer.current !== null && window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => {
        onSelectionChange?.(selectionToBeChangeDsIds.current)
        selectionToBeChangeDsIds.current = []
      }, 500)
    }
  }, [onSelectionChange])

  const handleSelectionChangeConfirm = React.useCallback((dsId: string) => {
    if (!selectionToBeChangeDsIds.current.includes(dsId)) {
      selectionToBeChangeDsIds.current.push(dsId)
    }
    if (unsavedChange) {
      setShowConfirm(true)
    } else {
      doSelectionChange()
    }
  }, [doSelectionChange, unsavedChange])

  const handleConfirm = React.useCallback(() => {
    setShowConfirm(false)
    doSelectionChange()
  }, [doSelectionChange])

  const handleCancel = React.useCallback(() => {
    setShowConfirm(false)
  }, [])

  React.useEffect(() => {
    if (!unsavedChange) {
      doSelectionChange()
    }
  }, [doSelectionChange, unsavedChange])

  const translate = hooks.useTranslation(defaultMessages)

  return (<React.Fragment>
    {useDataSources?.map((useDs: IMUseDataSource) =>
      <EditItemDataSource
        key={useDs.dataSourceId}
        useDataSource={useDs}
        onDataSourceCreated={onDataSourceCreated}
        onSelectionChange={handleSelectionChangeConfirm}
        onSourceVersionChange={onSourceVersionChange}
      />
    )}
    {showConfirm && <ConfirmDialog
      level='warning'
      title={translate('selectionChangeConfirmTitle')}
      hasNotShowAgainOption={false}
      content={translate('selectionChangeConfirmTips')}
      confirmLabel={translate('discardConfirm')}
      cancelLabel={translate('discardCancel')}
      onConfirm={handleConfirm}
      onClose={handleCancel}
    />}
  </React.Fragment>)
}

export default EditListDataSource
