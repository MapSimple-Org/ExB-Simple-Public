import { css, hooks, React } from 'jimu-core'
import { Button, ImageViewer, defaultMessages as jimuUIMessages } from 'jimu-ui'
import { styled } from 'jimu-theme'
import defaultMessages from '../translations/default'
import { FullscreenViewOutlined } from 'jimu-icons/outlined/application/fullscreen-view'


export interface ImageWidgetViewerProps {
  /**
   * An array of images' src list.
   */
  srcList: string[]
  /**
   * The default image's index in the `srcList` when the image viewer is loaded.
   * @default 0
   */
  defaultIndex?: number
}

const ViewerButton = styled(Button)(css`
  position: absolute;
  z-index: 1;
  top: 8px;
  right: 8px;
  border-radius: 50%;
  border: none;
  opacity: .7;
  &:hover {
    opacity: 1;
  }
`)

export const ImageWidgetViewer = (props: ImageWidgetViewerProps) => {
  const { srcList = [], defaultIndex = 0 } = props
  const [showViewer, setShowViewer] = React.useState(false)

  const translate = hooks.useTranslation(defaultMessages, jimuUIMessages)

  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setShowViewer(true)
    event.stopPropagation()
  }


  const handleClose = () => {
    setShowViewer(false)
  }


  return <React.Fragment>
    {srcList.length > 0 && <ViewerButton
      aria-label={translate('imageViewer')}
      disableHoverEffect
      icon
      variant='contained'
      size='sm'
      onClick={handleOpen}
    >
      <FullscreenViewOutlined />
    </ViewerButton>}
    <ImageViewer srcList={srcList} defaultIndex={defaultIndex} isOpen={showViewer} onClose={handleClose} />
  </React.Fragment>
}
