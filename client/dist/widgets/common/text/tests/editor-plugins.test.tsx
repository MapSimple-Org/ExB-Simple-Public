import { React } from 'jimu-core'
import { render } from '@testing-library/react'
import * as MutationObserver from 'mutation-observer'
import { Editor } from '../src/runtime/builder/editor'
import { mockGetSelection } from 'jimu-for-test'
import '@testing-library/jest-dom'
jest.mock('../src/runtime/builder/plugins', () => {
  return {
    TextPlugins: ({ widgetId }) => <div>{widgetId}</div>
  }
})

const WIDGET_ID = 'widget_1'
let useDataSources = null
describe('<EditorPlugins />', () => {
  beforeAll(() => {
    (global as any).MutationObserver = MutationObserver
    mockGetSelection(global)

    useDataSources = [{ dataSourceId: 'ds_1' }] as any
  })

  it('props: onCreate, onDestroy', () => {
    const onCreate = jest.fn()
    const onDestroy = jest.fn()

    let formats = ['bold']

    const { queryByText, rerender, unmount } = render(<Editor
      formats={formats}
      enabled={false}
      value='foo'
      widgetId={WIDGET_ID}
      useDataSources={useDataSources}
      onCreate={onCreate}
      onDestroy={onDestroy}
    />);

    (expect(queryByText(WIDGET_ID)) as any).toBeInTheDOM();
    (expect(onDestroy) as any).toHaveBeenCalledTimes(0);
    (expect(onCreate) as any).toHaveBeenCalledTimes(1)

    rerender(<Editor
      formats={formats}
      enabled={false}
      value='foo'
      widgetId={WIDGET_ID}
      useDataSources={useDataSources}
      onCreate={onCreate}
      onDestroy={onDestroy}
    />);

    (expect(onDestroy) as any).toHaveBeenCalledTimes(0);
    (expect(onCreate) as any).toHaveBeenCalledTimes(1)

    formats = ['strike']

    rerender(<Editor
      formats={formats}
      enabled={false}
      value='foo'
      widgetId={WIDGET_ID}
      useDataSources={useDataSources}
      onCreate={onCreate}
      onDestroy={onDestroy}
    />);

    (expect(onDestroy) as any).toHaveBeenCalledTimes(1);
    (expect(onCreate) as any).toHaveBeenCalledTimes(2)

    unmount();

    (expect(onDestroy) as any).toHaveBeenCalledTimes(2);
    (expect(onCreate) as any).toHaveBeenCalledTimes(2)
  })
})
