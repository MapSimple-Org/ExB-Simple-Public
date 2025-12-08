// NOTE: Need to import jimu-core again for type consistency
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import * as JimuCore from 'jimu-core'
import type { Dispatch } from 'redux'
import { act, renderHook, type RenderHookResult } from '@testing-library/react'
import type {
  ActionTypes,
  IDocument,
  IFeature,
  IFeatureDocumentLinks,
  IUseLinksReturn,
} from 'widgets/shared-code/geobim'
import { areIDocumentsEqual } from '../../../../../../shared-code/lib/geobim/utils/geobim-utils'
import { useSelectedFeatureLinkedDocument } from '../use-selected-feature-linked-document'

// test constants
const DEFAULT_WIDGET_ID = 'document-viewer'

// jimu-core mocks
const dispatchMock = jest.fn()
const useDispatchMock = jest
  .fn<Dispatch<ActionTypes>, []>()
  .mockReturnValue(dispatchMock)
jest.mock('jimu-core', () => {
  const jimuCore: typeof JimuCore = jest.requireActual('jimu-core')
  return {
    __esModule: true,
    ...jimuCore,
    ReactRedux: {
      ...jimuCore.ReactRedux,
      useDispatch: () => useDispatchMock(),
    },
  }
})

// NOTE: Mock 'widgets/shared-code/geobim' fully as Webpack doesn't run for Jest
const useLinksMock = jest.fn<IUseLinksReturn, []>()
const useGeoBIMMock = jest.fn()
const setModelViewerLinkedDocumentMock = jest.fn<
  [],
  [
    widgetId: string,
    firstDocument: IDocument | null,
    bimIds: string[],
    dispatch: Dispatch<ActionTypes>,
  ]
>()
jest.mock(
  'widgets/shared-code/geobim',
  () => {
    return {
      __esModule: true,
      useLinks: () => useLinksMock(),
      useGeoBIM: () => useGeoBIMMock(),
      setModelViewerLinkedDocument: (
        widgetId: string,
        firstDocument: IDocument | null,
        bimIds: string[],
        dispatch: Dispatch<ActionTypes>,
      ) =>
        setModelViewerLinkedDocumentMock(
          widgetId,
          firstDocument,
          bimIds,
          dispatch,
        ),
      areIDocumentsEqual,
    }
  },
  { virtual: true },
)

describe('useSelectedFeatureLinkedDocument', () => {
  let renderResult: RenderHookResult<
    void,
    {
      widgetId: string
    }
  >

  // setup functions
  const setFeatureDocumentLinks = (
    documents: IDocument[],
    bimIds: string[],
    selectedFeatures = documents.map(() => ({}))
  ): void => {
    // Select new document
    useLinksMock.mockImplementation(() => {
      const featureDocumentLinks: IFeatureDocumentLinks = {
        documents,
        feature: {
          bimIds,
        } as unknown as IFeature,
      }
      return {
        featureDocumentLinks,
        linksLoading: false,
        linksInitialized: true,
      }
    })
    useGeoBIMMock.mockImplementation(() => {
      return {
        selectedFeatures
      }
    })
    act(() => {
      renderResult.rerender({
        widgetId: DEFAULT_WIDGET_ID,
      })
    })
  }

  beforeEach(() => {
    // set mock values to empty state
    useLinksMock.mockImplementation(() => {
      return {
        featureDocumentLinks: null,
        linksLoading: false,
        linksInitialized: true,
      }
    })
    useGeoBIMMock.mockImplementation(() => {
      return {
        selectedFeatures: []
      }
    })
    act(() => {
      renderResult = renderHook(
        (options) => {
          useSelectedFeatureLinkedDocument(options.widgetId)
        },
        {
          initialProps: {
            widgetId: DEFAULT_WIDGET_ID,
          },
        },
      )
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('should select a linked document', () => {
    const documents: IDocument[] = [
      {
        url: 'https://doc',
        displayName: 'Selected Document',
        fileName: 'SelectedDocument.rvt',
        isDefault: false,
      },
    ]
    const bimIds = ['bimId1', 'bimId2']
    setFeatureDocumentLinks(documents, bimIds)
    expect(setModelViewerLinkedDocumentMock).toHaveBeenCalledWith(
      DEFAULT_WIDGET_ID,
      documents[0],
      bimIds,
      dispatchMock,
    )
  })

  test('should ignore deselection', () => {
    const documents: IDocument[] = []
    const bimIds: string[] = []
    setFeatureDocumentLinks(documents, bimIds)
    expect(setModelViewerLinkedDocumentMock).not.toHaveBeenCalled()
  })

  test('should dispatch selection when feature selected but missing links', () => {
    const documents: IDocument[] = []
    const bimIds: string[] = []
    setFeatureDocumentLinks(documents, bimIds, [{}])
    expect(setModelViewerLinkedDocumentMock).toHaveBeenCalledWith(
      DEFAULT_WIDGET_ID,
      null,
      [],
      dispatchMock,
    )
  })

  test('should select the first document linked to the feature', () => {
    const documents: IDocument[] = [
      {
        url: 'https://doc1',
        displayName: 'First Document',
        fileName: 'FirstDocument.rvt',
        isDefault: false,
      },
      {
        url: 'https://doc2',
        displayName: 'Second Document',
        fileName: 'SecondDocument.ifc',
        isDefault: false,
      },
      {
        url: 'https://doc3',
        displayName: 'Third Document',
        fileName: 'ThirdDocument.pdf',
        isDefault: false,
      },
    ]
    const bimIds = ['bimId1', 'bimId2']
    setFeatureDocumentLinks(documents, bimIds)
    expect(setModelViewerLinkedDocumentMock).toHaveBeenCalledWith(
      DEFAULT_WIDGET_ID,
      documents[0],
      bimIds,
      dispatchMock,
    )
  })

  test('should select the default document linked to the feature', () => {
    const documents: IDocument[] = [
      {
        url: 'https://doc1',
        displayName: 'First Document',
        fileName: 'FirstDocument.rvt',
        isDefault: false,
      },
      {
        url: 'https://doc2',
        displayName: 'Second Document',
        fileName: 'SecondDocument.ifc',
        isDefault: true,
      },
      {
        url: 'https://doc3',
        displayName: 'Third Document',
        fileName: 'ThirdDocument.pdf',
        isDefault: false,
      },
    ]
    const bimIds = ['bimId1', 'bimId2']
    setFeatureDocumentLinks(documents, bimIds)
    expect(setModelViewerLinkedDocumentMock).toHaveBeenCalledWith(
      DEFAULT_WIDGET_ID,
      documents[1],
      bimIds,
      dispatchMock,
    )
  })
})
