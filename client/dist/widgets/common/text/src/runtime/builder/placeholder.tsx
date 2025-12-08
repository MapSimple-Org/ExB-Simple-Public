import { React, appActions, focusElementInKeyboardMode, getAppStore, hooks } from 'jimu-core'
import { type RichTextEditorProps, type Editor, type Sources, RichTextEditor, type DeltaValue, richTextEditorUtils, type RichSelection, type UnprivilegedEditor } from 'jimu-ui/advanced/rich-text-editor'
import { normalizeLineSpace, replacePlaceholderTextContent } from '../../utils'
import { shouldShowPlaceholder, getDefaultValue, sanitizeHTML, getOtherArcadeContentCount, canAddArcadeContent } from './utils'
import { ZeroWidthSpace } from '../../consts'
import { ModalOverlayIdContext } from 'jimu-ui'
const { useEffect, useRef, useState, useMemo,useCallback } = React

export type EditorPlaceholderProps = Omit<RichTextEditorProps, 'defaultValue' | 'onChange' | 'value' | 'enabled'> & {
  enabled: boolean
  value?: string
  widgetId?: string
  onChange?: (value: string) => void
  onComplete?: (value: string, placeholder: string) => void
}

const useRefValues = (enabled: boolean, value: string, placeholder: string, onChange, onComplete): React.RefObject<any> => {
  const ref = useRef({ enabled, value, placeholder, onChange, onComplete })
  useEffect(() => {
    ref.current = { enabled, value, placeholder, onChange, onComplete }
  }, [enabled, value, placeholder, onChange, onComplete])
  return ref
}

const defaultModules = {
  toolbar: false,
  // Automatically convert address strings to anchor tags
  autoformat: {
    link: {
      trigger: /[\s]/,
      find: /https?:\/\/[\S]+|(www\.[\S]+)/gi,
      transform: function (value: string, noProtocol: boolean) {
        return noProtocol ? 'http://' + value : value
      },
      format: 'link'
    }
  },
  // Normalize line-height from content when pasting
  clipboard: {
    matchers: [
      ['p', normalizeLineSpace],
      ['li', normalizeLineSpace],
      ['h1', normalizeLineSpace],
      ['h2', normalizeLineSpace],
      ['h3', normalizeLineSpace],
      ['h4', normalizeLineSpace],
      ['h5', normalizeLineSpace],
      ['h6', normalizeLineSpace]
    ]
  }
}

// Selectors that match all content
const pasteMatcherSelector = '*'
// Identifies the trailing newline character in a string
const BreakLineReg = /(?!^\n$)[\n]/mg

// Remove the trailing newline character on the pasted content
const pasteMatcherCallback = (_, delta: DeltaValue): DeltaValue => {
  delta.forEach((op) => {
    if (typeof op.insert === 'string') {
      op.insert = op.insert.replace(BreakLineReg, ' ')
    }
  })
  return delta
}

// Add a hook to the editor for pasted content
const addPasteMatcher = (editor: Editor): void => {
  editor.clipboard.addMatcher(pasteMatcherSelector, pasteMatcherCallback)
}

// Remove the hook for pasted content for the editor
const removePasteMatcher = (editor: Editor): boolean => {
  const matchers = editor.clipboard.matchers
  let index = -1
  matchers.some(([selector, callback], idx) => {
    if (selector === pasteMatcherSelector && callback === pasteMatcherCallback) {
      index = idx
      return true
    } else {
      return false
    }
  })
  if (index > -1) {
    editor.clipboard.matchers.splice(index, 1)
    return true
  }
}

/**
 * Sanitize and paste html to editor
 * @param html
 * @param editor
 */
const pasteContent = (editor: Editor, html: string): DeltaValue => {
  if (editor == null) return
  // To fix issue #3092, add a hook that will remove all line break tag when pasting, this hook will affect this method
  // so remove the hook before pasting and restore it after pasting
  const hasPasteMatch = removePasteMatcher(editor)
  // Make sure the contents are sanitized before pasting
  html = sanitizeHTML(html)
  const delta = editor.clipboard.convert({ html })
  editor.setContents(delta, 'silent')
  richTextEditorUtils.setEditorCursorEnd(editor, 'silent')
  if (hasPasteMatch) {
    addPasteMatcher(editor)
  }
}

export const EditorPlaceholder = (props: EditorPlaceholderProps): React.ReactElement => {
  const {
    editorRef: editorRefProp,
    value: valueProp,
    placeholder: placeholderProp,
    enabled,
    widgetId,
    onChange,
    onComplete,
    ...others
  } = props

  // If the widget is placed inside a modal, the z-index of the image-resize's popper is calculated based on the modalId obtained from the context.
  const modalId = React.useContext(ModalOverlayIdContext)
  const modules = React.useMemo(() => {
    return {
      ...defaultModules,
      imageResize: { modalId }
    }
  }, [modalId])
  const [editorRef, handleEditor] = hooks.useForwardRef<Editor>(editorRefProp)
  const [value, setValue] = useState(valueProp)
  const [placeholder, setPlaceholder] = useState(placeholderProp)
  const refValues = useRefValues(enabled, value, placeholder, onChange, onComplete)
  const [otherArcadeContentCount, setOtherArcadeContentCount] = useState<number>()

  const canAddArcadeRef = useRef<boolean>(true)
  // Only update defaultValue when the component mounted
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const defaultValue = useMemo(() => getDefaultValue(enabled, value, placeholder), [])

  useEffect(() => {
    const count = getOtherArcadeContentCount(valueProp, widgetId)
    setOtherArcadeContentCount(count)
    canAddArcadeRef.current = canAddArcadeContent(count, valueProp, widgetId)
  }, [valueProp, widgetId])

  // When the content of the editor changes, the latest value is saved to the state
  const handleChange = hooks.useEventCallback((html: string, _, source: Sources) => {
    if (source === 'silent') return
    // placeholder is editing
    if (shouldShowPlaceholder(value, placeholder, enabled)) {
      setPlaceholder(html)
    } else {
      // Otherwise, value is editing
      setValue(html)
      onChange?.(html)
    }
    canAddArcadeRef.current = canAddArcadeContent(otherArcadeContentCount, html, widgetId)
  })

  hooks.useUpdateEffect(() => {
    setPlaceholder(placeholderProp)
    if (shouldShowPlaceholder(value, placeholderProp)) {
      const editor = editorRef.current
      pasteContent(editor, placeholderProp)
    }
  }, [placeholderProp])

  hooks.useUpdateEffect(() => {
    const { value, placeholder, onComplete } = refValues.current
    const editor = editorRef.current
    if (!enabled) {
      // when enabled from true to false, try to show placeholder in editor
      if (shouldShowPlaceholder(value, placeholder)) {
        pasteContent(editor, placeholder)
      }
      onComplete?.(value, placeholder)
    } else {
      const editor = editorRef.current
      // when enabled from false to true, try to show the placeholder without textContent in editor
      if (shouldShowPlaceholder(value, placeholder)) {
        // Replace the textContent with a `zero width no-break space`(\uFEFF) for the placeholder to ensure the formats of placeholder can be inherited
        const value = replacePlaceholderTextContent(placeholder, ZeroWidthSpace)
        pasteContent(editor, value)
        focusElementInKeyboardMode(editor, true)
      }
    }
  }, [enabled])

  // Listen to paste events and process pasted content
  useEffect(() => {
    const editor = editorRef.current
    if (editor != null) {
      addPasteMatcher(editor)
    }
  }, [editorRef])

  // When unMounted, `onComplete` is triggered to return the modified `value` and `placeholder`
  hooks.useUnmount(() => {
    const { value, placeholder, enabled, onComplete } = refValues.current
    if (enabled) {
      onComplete?.(value, placeholder)
    }
  })

  const onSelectionChange = useCallback((nextSelection: RichSelection, source: Sources, editor: UnprivilegedEditor) => {
    if (source !== 'user') return
    if (canAddArcadeRef.current) return
    if (nextSelection && nextSelection.length > 0) {
      const formats = editor.getFormat(nextSelection)
      const isArcade = formats?.arcade != null
      if (!isArcade) return
      getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'canAddArcadeContent', isArcade))
      getAppStore().dispatch(appActions.widgetToolbarStateChange(widgetId, ['text-arcade']))
    } else {
      getAppStore().dispatch(appActions.widgetStatePropChange(widgetId, 'canAddArcadeContent', false))
      getAppStore().dispatch(appActions.widgetToolbarStateChange(widgetId, ['text-arcade']))
    }
  }, [widgetId])

  return (
    <RichTextEditor
      autoFocus
      enabled={enabled}
      editorRef={handleEditor}
      onChange={handleChange}
      defaultValue={defaultValue}
      modules={modules}
      onSelectionChange={onSelectionChange}
      {...others}
    />
  )
}
