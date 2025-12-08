import { type IMState, type ImmutableObject, Immutable } from 'jimu-core'
// NOTE: Need to import jimu-core again for type consistency
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import * as JimuCore from 'jimu-core'
import {
  act,
  renderHook,
  waitFor,
  type RenderHookResult,
} from '@testing-library/react'
import type {
  IUseLinksReturn,
  IDocument,
  GeoBIMContextType,
  SelectedBimDocument,
} from 'widgets/shared-code/geobim'
import { useMultipleSelectionWarning } from '../../../../../../../widgets/shared-code/lib/geobim/hooks/use-multiple-selection-warning'
import { areModelViewerLinkedDocumentsEqual } from '../../../../../../../widgets/shared-code/lib/geobim/utils/geobim-utils'
import {
  useDocumentSelection,
  type DocumentSelectionContextType,
} from '../use-document-selection'

// test constants
const DEFAULT_WIDGET_ID = 'document-viewer'

// jimu-core mocks
jest.mock('jimu-core', () => {
  const jimuCore: typeof JimuCore = jest.requireActual('jimu-core')
  return {
    __esModule: true,
    ...jimuCore,
    ReactRedux: {
      ...jimuCore.ReactRedux,
      useSelector: (selectorFunc: () => unknown): unknown => {
        return selectorFunc()
      },
    },
  }
})

// NOTE: Mock 'widgets/shared-code/geobim' fully as Webpack doesn't run for Jest
const useLinksMock = jest.fn<IUseLinksReturn, []>()
const useGeoBIMMock = jest.fn<GeoBIMContextType, []>()
const modelViewerLinkedDocumentSelectorMock = jest.fn<
  ImmutableObject<SelectedBimDocument> | null,
  [modelViewerWidgetId: string, store: IMState]
>()
jest.mock(
  'widgets/shared-code/geobim',
  () => {
    return {
      __esModule: true,
      useLinks: () => {
        return useLinksMock()
      },
      useGeoBIM: () => {
        return useGeoBIMMock()
      },
      modelViewerLinkedDocumentSelector: (
        modelViewerWidgetId: string,
        store: IMState,
      ) => {
        return modelViewerLinkedDocumentSelectorMock(modelViewerWidgetId, store)
      },
      // test actual implementations of these methods
      useMultipleSelectionWarning,
      areModelViewerLinkedDocumentsEqual,
    }
  },
  { virtual: true },
)

// local mocks
const mockUseSelectedFeatureLinkedDocument = jest.fn<[], [widgetId: string]>()
jest.mock(
  '../use-selected-feature-linked-document',
  () => {
    return {
      __esModule: true,
      useSelectedFeatureLinkedDocument: (widgetId: string) =>
        mockUseSelectedFeatureLinkedDocument(widgetId),
    }
  },
  { virtual: true },
)

describe('useDocumentSelection', () => {
  let testHook: { current: DocumentSelectionContextType }
  let renderResult: RenderHookResult<
    DocumentSelectionContextType,
    {
      widgetId: string
      modelViewerDisabled: boolean
    }
  >

  // setup functions
  const setStoreDocumentSelection = async (
    modelViewerDisabled: boolean,
    document: IDocument | null,
    bimIds: string[] = [],
  ): Promise<void> => {
    modelViewerLinkedDocumentSelectorMock.mockImplementation(
      (): ImmutableObject<SelectedBimDocument> | null => {
        const selectedBimDocument: SelectedBimDocument = {
          document,
          selectedIds: bimIds.length > 0 ? bimIds : null,
        }
        return Immutable(selectedBimDocument)
      },
    )
    await act(async () => {
      renderResult.rerender({
        widgetId: DEFAULT_WIDGET_ID,
        modelViewerDisabled,
      })
      await waitFor(() => {
        expect(testHook.current.documentLoading).toBe(false)
      })
    })
  }

  beforeEach(async () => {
    // set mock values to loading state
    useLinksMock.mockImplementation(() => {
      return {
        featureDocumentLinks: null,
        linksLoading: true,
        linksInitialized: false,
      }
    })
    useGeoBIMMock.mockImplementation(() => {
      return {
        hasMapWidget: true,
        geoBIMInitialized: false,
        selectedFeatures: [],
      } as unknown as GeoBIMContextType
    })
    modelViewerLinkedDocumentSelectorMock.mockImplementation(
      (): ImmutableObject<SelectedBimDocument> | null => {
        const selectedBimDocument: SelectedBimDocument = {
          document: null,
          selectedIds: null,
        }
        return Immutable(selectedBimDocument)
      },
    )
    const initialProps = {
      widgetId: DEFAULT_WIDGET_ID,
      modelViewerDisabled: false,
    }
    await act(async () => {
      renderResult = renderHook(
        (options) =>
          useDocumentSelection(options.widgetId, options.modelViewerDisabled),
        {
          initialProps,
        },
      )
      testHook = renderResult.result
      await waitFor(() => {
        expect(testHook.current).toBeDefined()
      })
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  test('initializes to loading state', () => {
    expect(testHook.current.bimDocument).toBeNull()
    expect(testHook.current.documentLoading).toBe(true)
    expect(testHook.current.multipleFeatureSelectionWarning).toBe(false)
    expect(testHook.current.cancelMultipleFeatureSelectionWarning).toBeDefined()
  })

  test('should call dependencies with its widget ID', () => {
    expect(modelViewerLinkedDocumentSelectorMock).toHaveBeenCalledWith(
      DEFAULT_WIDGET_ID,
      undefined, // TODO: Use the actual Redux Store so we can test locking and selection logic
    )
  })

  describe('when initialization is complete', () => {
    beforeEach(async () => {
      // ARRANGE: Mock completed initialization
      useLinksMock.mockImplementation(() => {
        return {
          featureDocumentLinks: null,
          linksLoading: false,
          linksInitialized: true,
        }
      })
      useGeoBIMMock.mockImplementation(() => {
        return {
          hasMapWidget: true,
          geoBIMInitialized: true,
          selectedFeatures: [],
        } as unknown as GeoBIMContextType
      })
      await act(async () => {
        renderResult.rerender({
          widgetId: DEFAULT_WIDGET_ID,
          modelViewerDisabled: false,
        })
        await waitFor(() => {
          expect(testHook.current).toBeDefined()
        })
      })
    })

    test('should indicate loading state is complete', () => {
      expect(testHook.current.bimDocument).toBeNull()
      expect(testHook.current.documentLoading).toBe(false)
      expect(testHook.current.multipleFeatureSelectionWarning).toBe(false)
    })

    describe('when given a document selection', () => {
      let testDocument: IDocument | null = null
      let testSelection: string[] = []

      beforeEach(async () => {
        testDocument = {
          displayName: 'Test Document',
          fileName: 'TestDocument.rvt',
          url: 'https://abc',
          isDefault: false,
          attributes: {},
        }
        testSelection = ['123', '456', '789']
        await setStoreDocumentSelection(false, testDocument, testSelection)
      })

      test('should return the document selection', () => {
        expect(testHook.current.bimDocument?.document).toEqual(testDocument)
        expect(testHook.current.bimDocument?.selectedIds).toEqual(testSelection)
      })

      describe('when unlocked and multiple features are selected in the map', () => {
        beforeEach(async () => {
          const selectedFeatures = [
            {
              feature: {
                id: 'feature1',
                layer: {},
                attributes: {},
              },
              dataSource: null,
            },
            {
              feature: {
                id: 'feature2',
                layer: {},
                attributes: {},
              },
              dataSource: null,
            },
          ]
          useGeoBIMMock.mockImplementation(() => {
            return {
              hasMapWidget: true,
              geoBIMInitialized: true,
              selectedFeatures,
            } as unknown as GeoBIMContextType
          })
          await act(async () => {
            renderResult.rerender({
              widgetId: DEFAULT_WIDGET_ID,
              modelViewerDisabled: false,
            })
            await waitFor(() => {
              expect(testHook.current.documentLoading).toBe(false)
            })
          })
        })

        test('should show the multiple selection warning', () => {
          expect(testHook.current.multipleFeatureSelectionWarning).toBe(true)
        })

        describe('when given a new document selection', () => {
          let testDocument2: IDocument | null = null
          let testSelection2: string[] = []

          beforeEach(async () => {
            testDocument2 = {
              displayName: 'Test Document 2',
              fileName: 'DifferentTestDocument.ifc',
              url: 'https://def',
              isDefault: false,
              attributes: {},
            }
            testSelection2 = ['abc', 'def']
            await setStoreDocumentSelection(
              false,
              testDocument2,
              testSelection2,
            )
          })

          test('should return the latest document', () => {
            expect(testHook.current.bimDocument?.document).toEqual(
              testDocument2,
            )
            expect(testHook.current.bimDocument?.selectedIds).toEqual(
              testSelection2,
            )
          })

          test('should cancel the multiple selection warning', () => {
            expect(testHook.current.multipleFeatureSelectionWarning).toBe(false)
          })
        })
      })

      describe('when locked and multiple features are selected in the map', () => {
        beforeEach(async () => {
          const selectedFeatures = [
            {
              feature: {
                id: 'feature1',
                layer: {},
                attributes: {},
              },
              dataSource: null,
            },
            {
              feature: {
                id: 'feature2',
                layer: {},
                attributes: {},
              },
              dataSource: null,
            },
          ]
          useGeoBIMMock.mockImplementation(() => {
            return {
              hasMapWidget: true,
              geoBIMInitialized: true,
              selectedFeatures,
            } as unknown as GeoBIMContextType
          })
          await act(async () => {
            renderResult.rerender({
              widgetId: DEFAULT_WIDGET_ID,
              modelViewerDisabled: true,
            })
            await waitFor(() => {
              expect(testHook.current.documentLoading).toBe(false)
            })
          })
        })

        test('should not show the multiple selection warning', () => {
          expect(testHook.current.multipleFeatureSelectionWarning).toBe(false)
        })
      })
    })
  })

  describe('when there is no map widget', () => {
    beforeEach(async () => {
      useLinksMock.mockImplementation(() => {
        return {
          featureDocumentLinks: null,
          linksLoading: false,
          linksInitialized: false, // will not be initialized without map
        }
      })
      useGeoBIMMock.mockImplementation(() => {
        return {
          hasMapWidget: false,
          geoBIMInitialized: true,
          selectedFeatures: [],
        } as unknown as GeoBIMContextType
      })
      await act(async () => {
        renderResult.rerender({
          widgetId: DEFAULT_WIDGET_ID,
          modelViewerDisabled: false,
        })
        await waitFor(() => {
          expect(testHook.current).toBeDefined()
        })
      })
    })

    test('should still indicate when initialization is complete', () => {
      expect(testHook.current.bimDocument).toBeNull()
      expect(testHook.current.documentLoading).toBe(false)
      expect(testHook.current.multipleFeatureSelectionWarning).toBe(false)
    })

    describe('when unlocked and given a document selection', () => {
      let testDocument: IDocument | null = null
      let testSelection: string[] = []

      beforeEach(async () => {
        testDocument = {
          displayName: 'Test Document',
          fileName: 'TestDocument.rvt',
          url: 'https://abc',
          isDefault: false,
          attributes: {},
        }
        testSelection = ['123', '456', '789']
        await setStoreDocumentSelection(false, testDocument, testSelection)
      })

      test('should return the document selection', () => {
        expect(testHook.current.bimDocument?.document).toEqual(testDocument)
        expect(testHook.current.bimDocument?.selectedIds).toEqual(testSelection)
      })
    })
  })
})
