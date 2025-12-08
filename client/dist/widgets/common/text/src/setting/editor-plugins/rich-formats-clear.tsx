/** @jsx jsx */
import { React, jsx, css, hooks } from 'jimu-core'
import { Button, defaultMessages } from 'jimu-ui'
import { ClearFormatOutlined } from 'jimu-icons/outlined/editor/clear-format'
import { type Editor, richTextEditorUtils, useEditorSelectionFormats } from 'jimu-ui/advanced/rich-text-editor'

interface RichFormatClearProps {
  editor: Editor
  className?: string
  style?: any
  formats?: { [x: string]: any }
  onChange?: (text: string) => void
}

const style = css`
  > * {
    user-select: none;
  }
`

export const RichFormatClear = (props: RichFormatClearProps): React.ReactElement => {
  const { editor, onChange, ...others } = props
  const [, selection] = useEditorSelectionFormats(editor, true)

  const translate = hooks.useTranslation(defaultMessages)

  const handleClick = (): void => {
    richTextEditorUtils.clearFormats(editor, selection)
    onChange?.(editor?.root.innerHTML)
  }

  return (
    <Button
      css={style}
      {...others}
      icon
      type='tertiary'
      size='sm'
      onClick={handleClick}
      title={translate('clearAllFormats')}
      aria-label={translate('clearAllFormats')}
    >
      <ClearFormatOutlined />
    </Button>
  )
}
