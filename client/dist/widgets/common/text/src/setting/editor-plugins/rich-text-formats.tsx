import { React } from 'jimu-core'
import { RichTextFormats as JimuRichTextFormats, type RichTextFormatProps, useEditorSelectionFormats } from 'jimu-ui/advanced/rich-text-editor'

interface Props extends Omit<RichTextFormatProps, 'selection' | 'formats'> {
  /**
   * Default formats color
   */
  defaultColor?: string
}

export const RichTextFormats = (props: Props): React.ReactElement => {
  const { editor, defaultColor, ...others } = props
  const [_formats, selection] = useEditorSelectionFormats(editor, true)

  const formats = React.useMemo(() => {
    let formats = _formats
    if (formats?.link?.link != null) {
      formats = {
        ...formats,
        link: formats.link.link
      }
    }
    if (!formats.color && defaultColor) {
      formats = {
        ...formats,
        color: defaultColor
      }
    }
    return formats
  }, [_formats, defaultColor])

  return (
    <JimuRichTextFormats
      editor={editor}
      formats={formats}
      selection={selection}
      {...others}
    />
  )
}
