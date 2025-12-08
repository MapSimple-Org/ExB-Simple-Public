import { Typography } from 'jimu-ui'

interface FeatureFormDeleteProps {
  title: string
  message: string
  confirmText: string
  cancelText: string
  onConfirm: () => void
  onCancel: () => void
}

const FeatureFormConfirm = (props: FeatureFormDeleteProps) => {
  const { title, message, confirmText, cancelText, onConfirm, onCancel } = props

  return <calcite-scrim data-testid='prompt' key='prompt'>
    <div className='esri-editor__prompt--danger'>
      <div className='esri-editor__prompt__header'>
        <calcite-icon icon='exclamation-mark-triangle'></calcite-icon>
        <Typography component='span' variant='title2' className='esri-widget__heading esri-editor__prompt__header__heading'>{title}</Typography>
      </div>
      <Typography component='div' variant='label1' className='esri-editor__prompt__message'>{message}</Typography>
      <div className='esri-editor__prompt__divider' />
      <div className='esri-editor__prompt__actions'>
        <calcite-button
          appearance='outline'
          className='esri-editor__prompt__half-width-button'
          data-testid='secondary-prompt-button'
          key='prompt-secondary-button'
          kind='danger'
          onClick={onCancel}
          width='full'
        >
          <Typography variant='label1'>{cancelText}</Typography>
        </calcite-button>
        <calcite-button
          appearance='solid'
          className='esri-editor__prompt__half-width-button'
          data-testid='primary-prompt-button'
          key='prompt-primary-button'
          kind='danger'
          onClick={onConfirm}
          width='full'
        >
          <Typography variant='label1'>{confirmText}</Typography>
        </calcite-button>
      </div>
    </div>
  </calcite-scrim>
}

export default FeatureFormConfirm
