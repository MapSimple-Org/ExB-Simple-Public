import { React, hooks, getAppStore, appActions, ExtensionManager, WidgetState} from 'jimu-core'
import { ConfirmDialog } from 'jimu-ui'
import defaultMessages from '../translations/default'
import type ReduxActionInterceptorExtensionImpl from '../../tools/redux-action-interceptor'

interface EditorCloseWarningProps {
  id: string
  formChange: boolean
}

const EditorCloseWarning = (props: EditorCloseWarningProps) => {
  const { id, formChange } = props


  const [warningBeforeClose, setWarningBeforeClose] = React.useState(false)
  const [isHidden, setIsHidden] = React.useState(false)

  const translate = hooks.useTranslation(defaultMessages)

  const actionInterceptor = React.useMemo(() => {
    return ExtensionManager.getInstance().getExtensionById(`${id}-reduxActionInterceptor`) as ReduxActionInterceptorExtensionImpl
  }, [id])

  const handleConfirmClose = React.useCallback(() => {
    setWarningBeforeClose(false)
    if (actionInterceptor) actionInterceptor.confirmClose = true
    if (isHidden) {
      getAppStore().dispatch(appActions.widgetRuntimeInfoChange(id, 'state', WidgetState.Hidden))
    } else {
      getAppStore().dispatch(appActions.closeWidget(id))
    }
  }, [actionInterceptor, id, isHidden])

  const handleCancelClose = React.useCallback(() => {
    setWarningBeforeClose(false)
  }, [])

  React.useEffect(() => {
    if (!actionInterceptor) return
    actionInterceptor.formChange = formChange
  }, [actionInterceptor, formChange])

  React.useEffect(() => {
    if (!actionInterceptor) return
    actionInterceptor.showWarningBeforeClose = (isHiddenAction: boolean) => {
      setIsHidden(isHiddenAction)
      setWarningBeforeClose(true)
    }
  }, [actionInterceptor])

  return warningBeforeClose && <ConfirmDialog
    level='warning'
    title={translate('selectionChangeConfirmTitle')}
    hasNotShowAgainOption={false}
    content={translate('selectionChangeConfirmTips')}
    confirmLabel={translate('discardConfirm')}
    cancelLabel={translate('discardCancel')}
    onConfirm={handleConfirmClose}
    onClose={handleCancelClose}
  />
}

export default EditorCloseWarning
