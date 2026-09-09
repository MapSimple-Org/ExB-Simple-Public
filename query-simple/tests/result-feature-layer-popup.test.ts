// Mock shared-code/mapsimple-common
const mockDebugLogger = { log: jest.fn() }
const mockSubstituteTokens = jest.fn((template: string, attrs: Record<string, any>) => {
  // Simple token replacement for testing: {{FIELD}} -> value
  return template.replace(/\{\{(\w+)\}\}/g, (_, field) => attrs[field] ?? '')
})
const mockSubstituteLegacyTokens = jest.fn((text: string, _attrs?: Record<string, any>) => text)
const mockConvertTemplateToHtml = jest.fn((text: string) => `<p>${text}</p>`)

jest.mock('widgets/shared-code/mapsimple-common', () => ({
  createQuerySimpleDebugLogger: () => mockDebugLogger,
  substituteTokens: (a: any, b: any) => mockSubstituteTokens(a, b),
  substituteLegacyTokens: (a: any, b: any) => mockSubstituteLegacyTokens(a, b),
  convertTemplateToHtml: (a: any) => mockConvertTemplateToHtml(a)
}))

// Mock jimu-arcgis loadArcGISJSAPIModules
// Capture CustomContent creator for direct testing
let capturedCustomContentCreator: ((event: any) => HTMLElement) | null = null
const MockPopupTemplate = jest.fn().mockImplementation((props: any) => ({
  ...props,
  _type: 'PopupTemplate'
}))
const MockCustomContent = jest.fn().mockImplementation((props: any) => {
  capturedCustomContentCreator = props.creator
  return { ...props, _type: 'CustomContent' }
})

jest.mock('jimu-arcgis', () => ({
  loadArcGISJSAPIModules: jest.fn().mockImplementation((modules: string[]) => {
    const result = modules.map((m: string) => {
      if (m === 'esri/PopupTemplate') return MockPopupTemplate
      if (m === 'esri/popup/content/CustomContent') return MockCustomContent
      return jest.fn()
    })
    return Promise.resolve(result)
  })
}))

import {
  registerRecords,
  unregisterRecords,
  clearRecordRegistry,
  setQueryConfigs,
  clearQueryConfigs,
  buildResultPopupTemplate
} from '../src/runtime/result-feature-layer-popup'

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function createMockRecord (id: string, attributes: Record<string, any> = {}): any {
  return {
    getId: () => id,
    getData: () => attributes,
    feature: {
      attributes: { ...attributes, __queryConfigId: 'config_1' },
      geometry: { type: 'polygon', rings: [] }
    }
  }
}

function createMockGraphicEvent (compositeKey: string, queryConfigId: string): any {
  return {
    graphic: {
      attributes: {
        OBJECTID: 1,
        RECORD_ID: 'rec_1',
        QUERY_CONFIG_ID: queryConfigId,
        COMPOSITE_KEY: compositeKey
      }
    }
  }
}

// r028.110: Field tables now render as a headerless Markdown pipe-table fed to
// the shared convertTemplateToHtml (mocked here to wrap its input in <p>). These
// helpers inspect the Markdown that the popup creator produced — the table DOM
// itself is the shared engine's responsibility (covered by its own tests).

/** The Markdown string passed to the most recent convertTemplateToHtml call. */
function lastTableMarkdown (): string {
  const calls = mockConvertTemplateToHtml.mock.calls
  return calls.length ? String(calls[calls.length - 1][0]) : ''
}

/** Count data rows in a headerless Markdown table (pipe lines minus separator). */
function countMarkdownRows (md: string): number {
  return md.split('\n').filter(l => l.trim().startsWith('|') && !/^\|[\s:|-]+\|$/.test(l.trim())).length
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('result-feature-layer-popup', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    capturedCustomContentCreator = null
    // Clean registries between tests
    clearRecordRegistry('widget_1')
    clearRecordRegistry('widget_2')
    clearQueryConfigs('widget_1')
    clearQueryConfigs('widget_2')
    mockDebugLogger.log.mockClear()
  })

  // -------------------------------------------------------------------------
  // Record registry
  // -------------------------------------------------------------------------

  describe('registerRecords', () => {
    it('should register records for a widget', () => {
      const record = createMockRecord('rec_1', { NAME: 'Test' })
      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])

      expect(mockDebugLogger.log).toHaveBeenCalledWith(
        'POPUP',
        expect.objectContaining({
          event: 'registerRecords',
          widgetId: 'widget_1',
          added: 1,
          registrySize: 1
        })
      )
    })

    it('should accumulate records across multiple calls', () => {
      const rec1 = createMockRecord('rec_1', { NAME: 'A' })
      const rec2 = createMockRecord('rec_2', { NAME: 'B' })

      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record: rec1 }])
      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_2', record: rec2 }])

      // Second call should report size=2
      expect(mockDebugLogger.log).toHaveBeenLastCalledWith(
        'POPUP',
        expect.objectContaining({
          registrySize: 2
        })
      )
    })

    it('should isolate records between widgets', () => {
      const rec1 = createMockRecord('rec_1', { NAME: 'A' })
      const rec2 = createMockRecord('rec_1', { NAME: 'B' })

      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record: rec1 }])
      registerRecords('widget_2', [{ compositeKey: 'config_1_rec_1', record: rec2 }])

      // Each widget should have size=1
      const calls = mockDebugLogger.log.mock.calls.filter(
        (c: any[]) => c[0] === 'POPUP' && c[1].event === 'registerRecords'
      )
      expect(calls).toHaveLength(2)
      expect(calls[0][1].registrySize).toBe(1)
      expect(calls[1][1].registrySize).toBe(1)
    })

    it('should overwrite existing record with same composite key', () => {
      const rec1 = createMockRecord('rec_1', { NAME: 'Old' })
      const rec2 = createMockRecord('rec_1', { NAME: 'New' })

      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record: rec1 }])
      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record: rec2 }])

      // Size should still be 1 (overwrite, not duplicate)
      expect(mockDebugLogger.log).toHaveBeenLastCalledWith(
        'POPUP',
        expect.objectContaining({
          registrySize: 1
        })
      )
    })
  })

  describe('unregisterRecords', () => {
    it('should remove records by composite key', () => {
      const rec = createMockRecord('rec_1', { NAME: 'Test' })
      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record: rec }])
      mockDebugLogger.log.mockClear()

      unregisterRecords('widget_1', ['config_1_rec_1'])

      expect(mockDebugLogger.log).toHaveBeenCalledWith(
        'POPUP',
        expect.objectContaining({
          event: 'unregisterRecords',
          widgetId: 'widget_1',
          removed: 1,
          registrySize: 0
        })
      )
    })

    it('should handle unregistering from a widget with no records', () => {
      // Should not throw
      unregisterRecords('nonexistent_widget', ['some_key'])
    })

    it('should handle unregistering keys that do not exist', () => {
      const rec = createMockRecord('rec_1', { NAME: 'Test' })
      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record: rec }])
      mockDebugLogger.log.mockClear()

      unregisterRecords('widget_1', ['config_1_rec_999'])

      expect(mockDebugLogger.log).toHaveBeenCalledWith(
        'POPUP',
        expect.objectContaining({
          registrySize: 1 // original record still there
        })
      )
    })
  })

  describe('clearRecordRegistry', () => {
    it('should clear all records for a widget', () => {
      const rec1 = createMockRecord('rec_1', { NAME: 'A' })
      const rec2 = createMockRecord('rec_2', { NAME: 'B' })
      registerRecords('widget_1', [
        { compositeKey: 'config_1_rec_1', record: rec1 },
        { compositeKey: 'config_1_rec_2', record: rec2 }
      ])
      mockDebugLogger.log.mockClear()

      clearRecordRegistry('widget_1')

      expect(mockDebugLogger.log).toHaveBeenCalledWith(
        'POPUP',
        expect.objectContaining({
          event: 'clearRecordRegistry',
          widgetId: 'widget_1',
          cleared: 2
        })
      )
    })

    it('should not affect other widgets', () => {
      const rec1 = createMockRecord('rec_1', { NAME: 'A' })
      const rec2 = createMockRecord('rec_1', { NAME: 'B' })
      registerRecords('widget_1', [{ compositeKey: 'key_1', record: rec1 }])
      registerRecords('widget_2', [{ compositeKey: 'key_2', record: rec2 }])
      mockDebugLogger.log.mockClear()

      clearRecordRegistry('widget_1')

      // widget_1 cleared
      expect(mockDebugLogger.log).toHaveBeenCalledWith(
        'POPUP',
        expect.objectContaining({
          event: 'clearRecordRegistry',
          widgetId: 'widget_1',
          cleared: 1
        })
      )
    })

    it('should handle clearing a widget with no records', () => {
      clearRecordRegistry('widget_1')

      expect(mockDebugLogger.log).toHaveBeenCalledWith(
        'POPUP',
        expect.objectContaining({
          event: 'clearRecordRegistry',
          cleared: 0
        })
      )
    })
  })

  // -------------------------------------------------------------------------
  // Query config registry
  // -------------------------------------------------------------------------

  describe('setQueryConfigs', () => {
    it('should store query configs for a widget', () => {
      const queries = [{ configId: 'config_1', name: 'Test Query' }]
      setQueryConfigs('widget_1', queries)
      // No direct way to read back, but buildResultPopupTemplate uses it.
      // Verified via the creator tests below.
    })
  })

  describe('clearQueryConfigs', () => {
    it('should clear query configs without throwing', () => {
      setQueryConfigs('widget_1', [{ configId: 'config_1' }])
      expect(() => clearQueryConfigs('widget_1')).not.toThrow()
    })

    it('should handle clearing configs for a widget that was never set', () => {
      expect(() => clearQueryConfigs('nonexistent')).not.toThrow()
    })
  })

  // -------------------------------------------------------------------------
  // buildResultPopupTemplate
  // -------------------------------------------------------------------------

  describe('buildResultPopupTemplate', () => {
    it('should return a PopupTemplate with CustomContent', async () => {
      const pt = await buildResultPopupTemplate('widget_1')

      expect(MockPopupTemplate).toHaveBeenCalledTimes(1)
      expect(MockCustomContent).toHaveBeenCalledTimes(1)
      expect(pt._type).toBe('PopupTemplate')
      expect(pt.outFields).toEqual(['*'])
      expect(pt.content).toHaveLength(1)
      expect(pt.content[0]._type).toBe('CustomContent')
    })

    it('should set outFields to * on CustomContent', async () => {
      await buildResultPopupTemplate('widget_1')

      const ccArgs = MockCustomContent.mock.calls[0][0]
      expect(ccArgs.outFields).toEqual(['*'])
    })

    it('should set a function as the title', async () => {
      const pt = await buildResultPopupTemplate('widget_1')

      expect(typeof pt.title).toBe('function')
    })
  })

  // -------------------------------------------------------------------------
  // CustomContent creator: join-back and rendering
  // -------------------------------------------------------------------------

  describe('CustomContent creator', () => {
    async function setupCreator (widgetId = 'widget_1'): Promise<(event: any) => HTMLElement> {
      await buildResultPopupTemplate(widgetId)
      if (!capturedCustomContentCreator) {
        throw new Error('Creator was not captured from MockCustomContent')
      }
      return capturedCustomContentCreator
    }

    it('should return fallback when graphic has no attributes', async () => {
      const creator = await setupCreator()

      const result = creator({ graphic: null })
      expect(result.textContent).toBe('No attributes available')
      expect(result.style.fontStyle).toBe('italic')
    })

    it('should return fallback when graphic attributes are undefined', async () => {
      const creator = await setupCreator()

      const result = creator({ graphic: { attributes: undefined } })
      expect(result.textContent).toBe('No attributes available')
    })

    it('should return fallback when record is not in registry', async () => {
      const creator = await setupCreator()

      const event = createMockGraphicEvent('config_1_rec_999', 'config_1')
      const result = creator(event)

      expect(result.textContent).toBe('Record no longer available')
      expect(mockDebugLogger.log).toHaveBeenCalledWith(
        'POPUP',
        expect.objectContaining({
          event: 'popup-record-not-found',
          compositeKey: 'config_1_rec_999'
        })
      )
    })

    it('should render CustomTemplate content when query config is CustomTemplate', async () => {
      // Register a record
      const record = createMockRecord('rec_1', { NAME: 'Test Park', ACRES: '42' })
      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])

      // Set query config as CustomTemplate
      setQueryConfigs('widget_1', [{
        configId: 'config_1',
        resultFieldsType: 'CustomTemplate',
        resultContentExpression: 'Name: {{NAME}}, Acres: {{ACRES}}'
      }])

      const creator = await setupCreator()
      const event = createMockGraphicEvent('config_1_rec_1', 'config_1')
      const result = creator(event)

      // substituteTokens should have been called with the template and attributes
      expect(mockSubstituteTokens).toHaveBeenCalledWith(
        'Name: {{NAME}}, Acres: {{ACRES}}',
        expect.objectContaining({ NAME: 'Test Park', ACRES: '42' })
      )
      // convertTemplateToHtml should have been called
      expect(mockConvertTemplateToHtml).toHaveBeenCalled()
      // Result should be a styled div
      expect(result.style.fontSize).toBe('0.875rem')
      expect(result.querySelector('style')).not.toBeNull()
    })

    it('should render field table for SelectAttributes config', async () => {
      const record = createMockRecord('rec_1', { NAME: 'Test Park', ACRES: '42', OWNER: 'NPS' })
      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])

      setQueryConfigs('widget_1', [{
        configId: 'config_1',
        resultFieldsType: 'SelectAttributes',
        resultDisplayFields: ['NAME', 'ACRES']
      }])

      const creator = await setupCreator()
      const event = createMockGraphicEvent('config_1_rec_1', 'config_1')
      creator(event)

      // r028.110: field table is a Markdown pipe-table fed to convertTemplateToHtml.
      // 2 data rows (NAME, ACRES); OWNER excluded (not in resultDisplayFields).
      const md = lastTableMarkdown()
      expect(countMarkdownRows(md)).toBe(2)
      expect(md).toContain('Test Park')
      expect(md).toContain('42')
      expect(md).not.toContain('NPS')
    })

    it('should render field table for AllAttributes (no config match)', async () => {
      const record = createMockRecord('rec_1', {
        NAME: 'Test Park',
        ACRES: '42',
        __queryConfigId: 'config_1',
        OBJECTID: 99,
        Shape: 'polygon'
      })
      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])

      // No query config set, so AllAttributes fallback
      const creator = await setupCreator()
      const event = createMockGraphicEvent('config_1_rec_1', 'config_1')
      creator(event)

      // 2 data rows (NAME, ACRES); __queryConfigId, OBJECTID, Shape excluded.
      const md = lastTableMarkdown()
      expect(countMarkdownRows(md)).toBe(2)
      expect(md).toContain('Test Park')
      expect(md).not.toContain('OBJECTID')
    })

    it('should render field table with object-style resultDisplayFields', async () => {
      const record = createMockRecord('rec_1', { NAME: 'Test', ACRES: '42', OWNER: 'NPS' })
      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])

      setQueryConfigs('widget_1', [{
        configId: 'config_1',
        resultFieldsType: 'SelectAttributes',
        resultDisplayFields: [{ jimuName: 'NAME' }, { name: 'ACRES' }]
      }])

      const creator = await setupCreator()
      const event = createMockGraphicEvent('config_1_rec_1', 'config_1')
      creator(event)

      // object-style resultDisplayFields ({jimuName}/{name}) resolve to 2 rows.
      expect(countMarkdownRows(lastTableMarkdown())).toBe(2)
    })

    it('should show "No fields to display" for empty attributes', async () => {
      const record = createMockRecord('rec_1', {})
      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])

      const creator = await setupCreator()
      const event = createMockGraphicEvent('config_1_rec_1', 'config_1')
      const result = creator(event)

      // r028.043: Content is now wrapped in createPopupContentDiv (includes a
      // <style> tag), so textContent includes CSS rules. Check the inner span.
      expect(result.querySelector('span')?.textContent).toBe('No fields to display')
    })

    it('should skip null/undefined values in field table', async () => {
      const record = createMockRecord('rec_1', { NAME: 'Test', ACRES: null, OWNER: undefined })
      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])

      const creator = await setupCreator()
      const event = createMockGraphicEvent('config_1_rec_1', 'config_1')
      creator(event)

      // Only NAME has a value; ACRES (null) and OWNER (undefined) are skipped.
      expect(countMarkdownRows(lastTableMarkdown())).toBe(1)
    })

    it('should fall back to field table when CustomTemplate has empty content expression', async () => {
      const record = createMockRecord('rec_1', { NAME: 'Test' })
      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])

      setQueryConfigs('widget_1', [{
        configId: 'config_1',
        resultFieldsType: 'CustomTemplate',
        resultContentExpression: '' // empty
      }])

      const creator = await setupCreator()
      const event = createMockGraphicEvent('config_1_rec_1', 'config_1')
      creator(event)

      // Empty CustomTemplate content falls back to the field table (1 row: NAME).
      expect(countMarkdownRows(lastTableMarkdown())).toBe(1)
    })

    // r028.110: aliases + value formatting + cell escaping in the field table.
    // fieldMeta is captured from feature.layer.fields at registerRecords time.
    describe('r028.110 field-table aliases + formatting + escaping', () => {
      /** Mock record that carries a source-layer field schema (alias/type/domain). */
      function recordWithSchema (
        attributes: Record<string, any>,
        fields: Array<{ name: string, alias?: string, type?: string, domain?: any }>
      ): any {
        return {
          getId: () => 'rec_1',
          getData: () => attributes,
          feature: {
            attributes: { ...attributes, __queryConfigId: 'config_1' },
            geometry: { type: 'polygon', rings: [] },
            layer: { fields }
          }
        }
      }

      it('uses the field alias as the row label', async () => {
        const record = recordWithSchema(
          { PIN: '2473251510' },
          [{ name: 'PIN', alias: 'Parcel', type: 'string' }]
        )
        registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])
        setQueryConfigs('widget_1', [{
          configId: 'config_1', resultFieldsType: 'SelectAttributes', resultDisplayFields: ['PIN']
        }])

        const creator = await setupCreator()
        creator(createMockGraphicEvent('config_1_rec_1', 'config_1'))

        const md = lastTableMarkdown()
        expect(md).toContain('Parcel')        // alias label
        expect(md).toContain('2473251510')    // value
      })

      it('formats an epoch-ms date field (4-digit year, not raw epoch)', async () => {
        const record = recordWithSchema(
          { DateReceived: 1505162400000 },
          [{ name: 'DateReceived', alias: 'Date received', type: 'date' }]
        )
        registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])
        setQueryConfigs('widget_1', [{
          configId: 'config_1', resultFieldsType: 'SelectAttributes', resultDisplayFields: ['DateReceived']
        }])

        const creator = await setupCreator()
        creator(createMockGraphicEvent('config_1_rec_1', 'config_1'))

        const md = lastTableMarkdown()
        expect(md).toContain('Date received')          // alias
        expect(md).not.toContain('1505162400000')      // raw epoch must be gone
        expect(md).toMatch(/20\d{2}/)                  // a 4-digit year is present
      })

      it('decodes a coded-value domain to its label', async () => {
        const record = recordWithSchema(
          { STATUS: 2 },
          [{ name: 'STATUS', alias: 'Status', type: 'small-integer', domain: { codedValues: [{ code: 1, name: 'Open' }, { code: 2, name: 'Closed' }] } }]
        )
        registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])
        setQueryConfigs('widget_1', [{
          configId: 'config_1', resultFieldsType: 'SelectAttributes', resultDisplayFields: ['STATUS']
        }])

        const creator = await setupCreator()
        creator(createMockGraphicEvent('config_1_rec_1', 'config_1'))

        expect(lastTableMarkdown()).toContain('Closed')
      })

      it('escapes pipes, HTML, and Markdown characters in values (no cell break / injection)', async () => {
        const record = recordWithSchema(
          { NOTE: 'a|b <script> *x* [y]' },
          [{ name: 'NOTE', alias: 'Note', type: 'string' }]
        )
        registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])
        setQueryConfigs('widget_1', [{
          configId: 'config_1', resultFieldsType: 'SelectAttributes', resultDisplayFields: ['NOTE']
        }])

        const creator = await setupCreator()
        creator(createMockGraphicEvent('config_1_rec_1', 'config_1'))

        const md = lastTableMarkdown()
        // Still exactly one data row — the pipe did not split the cell.
        expect(countMarkdownRows(md)).toBe(1)
        // Dangerous/structural chars are entity-encoded, not literal.
        expect(md).not.toContain('<script>')
        expect(md).toContain('&lt;script&gt;')
        expect(md).toContain('&#124;')   // encoded pipe
        expect(md).toContain('&#42;')    // encoded asterisk
      })

      it('falls back to field name + raw value when no schema is present', async () => {
        // createMockRecord has no feature.layer → fieldMeta is empty.
        const record = createMockRecord('rec_1', { ACRES: 42 })
        registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])
        setQueryConfigs('widget_1', [{
          configId: 'config_1', resultFieldsType: 'SelectAttributes', resultDisplayFields: ['ACRES']
        }])

        const creator = await setupCreator()
        creator(createMockGraphicEvent('config_1_rec_1', 'config_1'))

        const md = lastTableMarkdown()
        expect(md).toContain('ACRES')   // field name as label (no alias)
        expect(md).toContain('42')      // raw value
      })
    })

    it('should return error fallback when creator throws', async () => {
      // Register a record with valid attributes so we reach substituteTokens
      const record = createMockRecord('rec_1', { NAME: 'Test' })
      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])

      setQueryConfigs('widget_1', [{
        configId: 'config_1',
        resultFieldsType: 'CustomTemplate',
        resultContentExpression: '{{NAME}}'
      }])

      // Force convertTemplateToHtml to throw (substituteTokens runs first, then this)
      mockConvertTemplateToHtml.mockImplementationOnce(() => { throw new Error('render boom') })

      const creator = await setupCreator()
      const event = createMockGraphicEvent('config_1_rec_1', 'config_1')
      const result = creator(event)

      expect(result.textContent).toBe('Error rendering popup')
      expect(mockDebugLogger.log).toHaveBeenCalledWith(
        'POPUP',
        expect.objectContaining({
          event: 'popup-creator-error'
        })
      )
    })
  })

  // -------------------------------------------------------------------------
  // Dynamic title function
  // -------------------------------------------------------------------------

  describe('dynamic title', () => {
    async function getTitleFn (widgetId = 'widget_1'): Promise<(feature: any) => string> {
      const pt = await buildResultPopupTemplate(widgetId)
      return pt.title as (feature: any) => string
    }

    it('should return "Query Result" when graphic has no attributes', async () => {
      const titleFn = await getTitleFn()
      expect(titleFn({ graphic: null })).toBe('Query Result')
    })

    it('should resolve title from resultTitleExpression for CustomTemplate', async () => {
      const record = createMockRecord('rec_1', { NAME: 'Test Park' })
      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])

      setQueryConfigs('widget_1', [{
        configId: 'config_1',
        resultFieldsType: 'CustomTemplate',
        resultTitleExpression: '{{NAME}}'
      }])

      const titleFn = await getTitleFn()
      const title = titleFn({
        graphic: {
          attributes: { QUERY_CONFIG_ID: 'config_1', COMPOSITE_KEY: 'config_1_rec_1' }
        }
      })

      expect(mockSubstituteTokens).toHaveBeenCalledWith(
        '{{NAME}}',
        expect.objectContaining({ NAME: 'Test Park' })
      )
      // Our mock replaces {{NAME}} with 'Test Park'
      expect(title).toBe('Test Park')
    })

    it('should fall back to searchAlias when no title expression', async () => {
      setQueryConfigs('widget_1', [{
        configId: 'config_1',
        resultFieldsType: 'SelectAttributes',
        searchAlias: 'Parks Search'
      }])

      const titleFn = await getTitleFn()
      const title = titleFn({
        graphic: {
          attributes: { QUERY_CONFIG_ID: 'config_1', COMPOSITE_KEY: 'config_1_rec_1' }
        }
      })

      expect(title).toBe('Parks Search')
    })

    it('should fall back to query name when no searchAlias', async () => {
      setQueryConfigs('widget_1', [{
        configId: 'config_1',
        resultFieldsType: 'SelectAttributes',
        name: 'Parks Query'
      }])

      const titleFn = await getTitleFn()
      const title = titleFn({
        graphic: {
          attributes: { QUERY_CONFIG_ID: 'config_1', COMPOSITE_KEY: 'config_1_rec_1' }
        }
      })

      expect(title).toBe('Parks Query')
    })

    it('should fall back to "Query Result" when no config matches', async () => {
      const titleFn = await getTitleFn()
      const title = titleFn({
        graphic: {
          attributes: { QUERY_CONFIG_ID: 'unknown_config', COMPOSITE_KEY: 'x' }
        }
      })

      expect(title).toBe('Query Result')
    })

    it('should return "Query Result" when title function throws', async () => {
      // Force substituteTokens to throw during title resolution
      const record = createMockRecord('rec_1', { NAME: 'Test' })
      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])

      setQueryConfigs('widget_1', [{
        configId: 'config_1',
        resultFieldsType: 'CustomTemplate',
        resultTitleExpression: '{{NAME}}'
      }])

      mockSubstituteTokens.mockImplementationOnce(() => { throw new Error('boom') })

      const titleFn = await getTitleFn()
      const title = titleFn({
        graphic: {
          attributes: { QUERY_CONFIG_ID: 'config_1', COMPOSITE_KEY: 'config_1_rec_1' }
        }
      })

      expect(title).toBe('Query Result')
    })
  })

  // -------------------------------------------------------------------------
  // Registry captures latest data (mutable closure)
  // -------------------------------------------------------------------------

  describe('mutable registry closure', () => {
    it('should see records added after template was built', async () => {
      // Build template FIRST, register record AFTER
      const creator = await (async () => {
        await buildResultPopupTemplate('widget_1')
        return capturedCustomContentCreator!
      })()

      // Now register the record
      const record = createMockRecord('rec_1', { NAME: 'Late Record' })
      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])

      setQueryConfigs('widget_1', [{
        configId: 'config_1',
        resultFieldsType: 'SelectAttributes'
      }])

      const event = createMockGraphicEvent('config_1_rec_1', 'config_1')
      creator(event)

      // Should find the record even though it was registered after build —
      // a field table (1 row: NAME) is produced rather than the not-found fallback.
      expect(countMarkdownRows(lastTableMarkdown())).toBe(1)
    })

    it('should reflect record removal in subsequent popup opens', async () => {
      const record = createMockRecord('rec_1', { NAME: 'Will Be Removed' })
      registerRecords('widget_1', [{ compositeKey: 'config_1_rec_1', record }])

      const creator = await (async () => {
        await buildResultPopupTemplate('widget_1')
        return capturedCustomContentCreator!
      })()

      // First open: record exists
      const event = createMockGraphicEvent('config_1_rec_1', 'config_1')
      const result1 = creator(event)
      expect(result1.textContent).not.toBe('Record no longer available')

      // Remove the record
      unregisterRecords('widget_1', ['config_1_rec_1'])

      // Second open: record gone
      const result2 = creator(event)
      expect(result2.textContent).toBe('Record no longer available')
    })
  })
})
