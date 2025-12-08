import { React } from 'jimu-core'
import * as MutationObserver from 'mutation-observer'
import { EditorPlaceholder } from '../src/runtime/builder/placeholder'
import { mockGetSelection, withThemeRender } from 'jimu-for-test'
import '@testing-library/jest-dom'
import { ZeroWidthSpace } from '../src/consts'
const render = withThemeRender()
describe('<EditorPlaceholder />', () => {
  beforeAll(() => {
    (global as any).MutationObserver = MutationObserver
    mockGetSelection(global)
  })

  describe('prop: placeholder, value', () => {
    it('value is defined, display value', () => {
      const placeholder = 'placeholder'
      const value = 'value'
      const { queryByText } = render(<EditorPlaceholder enabled={false} placeholder={placeholder} value={value} />);
      (expect(queryByText(value)) as any).toBeInTheDOM();
      (expect(queryByText(placeholder)) as any).not.toBeInTheDOM()
    })

    it('value is not defined, displace placeholder', () => {
      const placeholder = 'placeholder'
      const { getByText } = render(<EditorPlaceholder enabled={false} placeholder={placeholder} />);
      (expect(getByText(placeholder)) as any).toBeInTheDOM()
    })
  })

  it('props: editorRef', () => {
    const editorRef = { current: null } as any
    render(<EditorPlaceholder enabled={false} editorRef={editorRef} value='<span>bar</span>' />);
    (expect(editorRef.current.root) as any).toBeInTheDOM()
  })

  describe('prop: enabled', () => {
    it('the default value of enabled is false', () => {
      const placeholder = '<strong>placeholder</strong>'
      const { getByTestId, rerender } = render(<EditorPlaceholder value='' placeholder={placeholder} enabled={false} />)
      expect(getByTestId('rich-editor-core').firstChild.firstChild.firstChild.firstChild.nodeName).toBe('STRONG')
      expect(getByTestId('rich-editor-core').firstChild.firstChild.firstChild.firstChild.textContent).toBe('placeholder')
      rerender(<EditorPlaceholder value='' placeholder={placeholder} enabled />)
      expect(getByTestId('rich-editor-core').firstChild.firstChild.firstChild.firstChild.nodeName).toBe('STRONG')
      expect(getByTestId('rich-editor-core').firstChild.firstChild.firstChild.firstChild.textContent).toBe(ZeroWidthSpace)
    })

    it('the default value of enabled is true', () => {
      const placeholder = '<strong>placeholder</strong>'
      const { getByTestId, rerender } = render(<EditorPlaceholder value='' placeholder={placeholder} enabled />)
      expect(getByTestId('rich-editor-core').firstChild.firstChild.firstChild.firstChild.nodeName).toBe('STRONG')
      expect(getByTestId('rich-editor-core').firstChild.firstChild.firstChild.firstChild.textContent).toBe(ZeroWidthSpace)
      rerender(<EditorPlaceholder value='' placeholder={placeholder} enabled={false} />)
      expect(getByTestId('rich-editor-core').firstChild.firstChild.firstChild.firstChild.nodeName).toBe('STRONG')
      expect(getByTestId('rich-editor-core').firstChild.firstChild.firstChild.firstChild.textContent).toBe('placeholder')
    })
  })

  it('props: onComplete', () => {
    const onComplete = jest.fn()
    const { rerender, unmount } = render(<EditorPlaceholder enabled onComplete={onComplete} value='foo' placeholder='bar' />)
    rerender(<EditorPlaceholder enabled={false} onComplete={onComplete} value='foo' placeholder='bar' />);
    (expect(onComplete) as any).toHaveBeenNthCalledWith(1, 'foo', 'bar')
    rerender(<EditorPlaceholder enabled={true} onComplete={onComplete} value='foo' placeholder='bar' />)
    onComplete.mockRestore()
    unmount();
    (expect(onComplete) as any).toHaveBeenNthCalledWith(1, 'foo', 'bar')
  })
})
