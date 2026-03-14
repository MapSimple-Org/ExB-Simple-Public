import { getRecordKey, mergeResultsIntoAccumulated, removeResultsFromAccumulated, removeRecordsFromOriginSelections } from '../src/runtime/results-management-utils';
import { MessageManager, DataRecordsSelectionChangeMessage } from 'jimu-core';

// Mock shared-code/mapsimple-common
jest.mock('widgets/shared-code/mapsimple-common', () => ({
  createQuerySimpleDebugLogger: () => ({
    log: jest.fn()
  })
}));

// Mock jimu-core
jest.mock('jimu-core', () => ({
  DataSourceManager: {
    getInstance: jest.fn().mockReturnValue({
      getDataSource: jest.fn(),
      createDataSourceByDataSourceJson: jest.fn()
    })
  },
  DataSourceStatus: {
    NotReady: 'NotReady'
  },
  MessageManager: {
    getInstance: jest.fn().mockReturnValue({
      publishMessage: jest.fn()
    })
  },
  DataRecordSetChangeMessage: jest.fn(),
  RecordSetChangeType: {
    CreateUpdate: 'CreateUpdate'
  },
  DataRecordsSelectionChangeMessage: jest.fn()
}));

// Mock graphics-layer-utils
jest.mock('../src/runtime/graphics-layer-utils', () => ({
  removeHighlightGraphics: jest.fn()
}));

describe('results-management-utils unit tests', () => {
  let mockOutputDS: any;
  let mockOriginDS: any;

  beforeEach(() => {
    mockOriginDS = {
      id: 'origin_ds_1'
    };
    mockOutputDS = {
      id: 'output_ds_1',
      getOriginDataSources: jest.fn().mockReturnValue([mockOriginDS])
    };
  });

  describe('getRecordKey', () => {
    it('should generate key from origin DS id and record objectId', () => {
      const mockRecord: any = {
        getId: jest.fn().mockReturnValue('123')
      };
      const key = getRecordKey(mockRecord, mockOutputDS);
      expect(key).toBe('origin_ds_1_123');
    });

    it('should fallback to outputDS id if no origin DS', () => {
      mockOutputDS.getOriginDataSources.mockReturnValue([]);
      const mockRecord: any = {
        getId: jest.fn().mockReturnValue('456')
      };
      const key = getRecordKey(mockRecord, mockOutputDS);
      expect(key).toBe('output_ds_1_456');
    });
  });

  describe('getRecordKey - __originDSId preference (r025)', () => {
    it('should prefer __originDSId stamp over originDS.id when both exist', () => {
      const mockRecord: any = {
        getId: jest.fn().mockReturnValue('100'),
        feature: {
          attributes: {
            __originDSId: 'dataSource_layer_parks'
          }
        }
      };
      const key = getRecordKey(mockRecord, mockOutputDS);
      expect(key).toBe('dataSource_layer_parks_100');
    });

    it('should fall back to originDS.id when __originDSId is not stamped (undefined)', () => {
      const mockRecord: any = {
        getId: jest.fn().mockReturnValue('200'),
        feature: {
          attributes: {
            __originDSId: undefined
          }
        }
      };
      const key = getRecordKey(mockRecord, mockOutputDS);
      expect(key).toBe('origin_ds_1_200');
    });

    it('should fall back to outputDS.id when neither __originDSId nor originDS exists', () => {
      mockOutputDS.getOriginDataSources.mockReturnValue([]);
      const mockRecord: any = {
        getId: jest.fn().mockReturnValue('300'),
        feature: {
          attributes: {}
        }
      };
      const key = getRecordKey(mockRecord, mockOutputDS);
      expect(key).toBe('output_ds_1_300');
    });

    it('should use __originDSId even when originDS has different id (cross-layer spatial results)', () => {
      // Simulate cross-layer scenario: originDS says "layer_A" but the record was
      // stamped with "layer_B" because it came from a spatial search against a
      // different layer than the output DS's origin.
      const mockRecord: any = {
        getId: jest.fn().mockReturnValue('42'),
        feature: {
          attributes: {
            __originDSId: 'dataSource_layer_B'
          }
        }
      };
      // originDS.id is 'origin_ds_1' (from beforeEach), which differs from stamp
      const key = getRecordKey(mockRecord, mockOutputDS);
      expect(key).toBe('dataSource_layer_B_42');
    });

    it('should handle record with feature but no attributes (defensive coding)', () => {
      const mockRecord: any = {
        getId: jest.fn().mockReturnValue('500'),
        feature: {}
      };
      const key = getRecordKey(mockRecord, mockOutputDS);
      // No attributes means no __originDSId, so falls back to originDS.id
      expect(key).toBe('origin_ds_1_500');
    });
  });

  describe('mergeResultsIntoAccumulated', () => {
    it('should merge unique new records into existing records', () => {
      const existingRecord: any = {
        getId: jest.fn().mockReturnValue('1'),
        getDataSource: jest.fn().mockReturnValue({ getOriginDataSources: () => [mockOriginDS] })
      };
      const newRecord1: any = {
        getId: jest.fn().mockReturnValue('1'), // Duplicate
        getDataSource: jest.fn().mockReturnValue({ getOriginDataSources: () => [mockOriginDS] })
      };
      const newRecord2: any = {
        getId: jest.fn().mockReturnValue('2'), // Unique
        getDataSource: jest.fn().mockReturnValue({ getOriginDataSources: () => [mockOriginDS] })
      };

      const result = mergeResultsIntoAccumulated(
        mockOutputDS,
        [newRecord1, newRecord2],
        [existingRecord]
      );

      expect(result.mergedRecords.length).toBe(2);
      expect(result.mergedRecords).toContain(existingRecord);
      expect(result.mergedRecords).toContain(newRecord2);
      expect(result.mergedRecords).not.toContain(newRecord1);
      expect(result.addedRecordIds).toEqual(['2']);
      expect(result.duplicateRecordIds).toEqual(['1']);
    });
  });

  describe('removeResultsFromAccumulated', () => {
    it('should remove records that match the keys of recordsToRemove', () => {
      const record1: any = {
        getId: jest.fn().mockReturnValue('1'),
        getDataSource: jest.fn().mockReturnValue({ getOriginDataSources: () => [mockOriginDS] })
      };
      const record2: any = {
        getId: jest.fn().mockReturnValue('2'),
        getDataSource: jest.fn().mockReturnValue({ getOriginDataSources: () => [mockOriginDS] })
      };
      const record3: any = {
        getId: jest.fn().mockReturnValue('3'),
        getDataSource: jest.fn().mockReturnValue({ getOriginDataSources: () => [mockOriginDS] })
      };

      const existingRecords = [record1, record2, record3];
      const recordsToRemove = [record2];

      const result = removeResultsFromAccumulated(
        mockOutputDS,
        recordsToRemove,
        existingRecords
      );

      expect(result.length).toBe(2);
      expect(result).toContain(record1);
      expect(result).toContain(record3);
      expect(result).not.toContain(record2);
    });

    it('should return empty array if existing records is empty', () => {
      const result = removeResultsFromAccumulated(mockOutputDS, [{} as any], []);
      expect(result).toEqual([]);
    });
  });

  describe('mergeResultsIntoAccumulated - additional cases', () => {
    it('should return only new records when existing records is empty', () => {
      const newRecord: any = {
        getId: jest.fn().mockReturnValue('1'),
        getDataSource: jest.fn().mockReturnValue({ getOriginDataSources: () => [mockOriginDS] })
      };

      const result = mergeResultsIntoAccumulated(mockOutputDS, [newRecord], []);

      expect(result.mergedRecords.length).toBe(1);
      expect(result.mergedRecords).toContain(newRecord);
      expect(result.addedRecordIds).toEqual(['1']);
      expect(result.duplicateRecordIds).toEqual([]);
    });

    it('should return existing records unchanged when new records is empty', () => {
      const existingRecord: any = {
        getId: jest.fn().mockReturnValue('1'),
        getDataSource: jest.fn().mockReturnValue({ getOriginDataSources: () => [mockOriginDS] })
      };

      const result = mergeResultsIntoAccumulated(mockOutputDS, [], [existingRecord]);

      expect(result.mergedRecords.length).toBe(1);
      expect(result.mergedRecords).toContain(existingRecord);
      expect(result.addedRecordIds).toEqual([]);
      expect(result.duplicateRecordIds).toEqual([]);
    });

    it('should mark all new records as duplicates when they match existing', () => {
      const existing1: any = { getId: jest.fn().mockReturnValue('1') };
      const existing2: any = { getId: jest.fn().mockReturnValue('2') };
      const new1: any = { getId: jest.fn().mockReturnValue('1') };
      const new2: any = { getId: jest.fn().mockReturnValue('2') };

      const result = mergeResultsIntoAccumulated(mockOutputDS, [new1, new2], [existing1, existing2]);

      expect(result.mergedRecords.length).toBe(2);
      expect(result.addedRecordIds).toEqual([]);
      expect(result.duplicateRecordIds).toEqual(['1', '2']);
    });
  });

  describe('removeResultsFromAccumulated - additional cases', () => {
    it('should return existing records unchanged when recordsToRemove is empty', () => {
      const record1: any = { getId: jest.fn().mockReturnValue('1') };
      const record2: any = { getId: jest.fn().mockReturnValue('2') };

      const result = removeResultsFromAccumulated(mockOutputDS, [], [record1, record2]);

      expect(result.length).toBe(2);
      expect(result).toContain(record1);
      expect(result).toContain(record2);
    });

    it('should remove all records when all match', () => {
      const record1: any = { getId: jest.fn().mockReturnValue('1') };
      const record2: any = { getId: jest.fn().mockReturnValue('2') };

      const result = removeResultsFromAccumulated(mockOutputDS, [record1, record2], [record1, record2]);

      expect(result.length).toBe(0);
    });
  });

  describe('removeRecordsFromOriginSelections', () => {
    let mockMessageManager: any;

    beforeEach(() => {
      mockMessageManager = MessageManager.getInstance();
      jest.clearAllMocks();
    });

    it('should group records by origin DS and update selections', () => {
      const mockRecord1: any = {
        getId: jest.fn().mockReturnValue('1'),
        getDataSource: jest.fn().mockReturnValue({
          getOriginDataSources: () => [mockOriginDS]
        })
      };
      
      mockOriginDS.getSelectedRecords = jest.fn().mockReturnValue([mockRecord1]);
      mockOriginDS.getSelectedRecordIds = jest.fn().mockReturnValue(['1']);
      mockOriginDS.selectRecordsByIds = jest.fn();

      removeRecordsFromOriginSelections(
        'widget_1',
        [mockRecord1],
        mockOutputDS
      );

      // Verify origin DS selection was updated to empty
      expect(mockOriginDS.selectRecordsByIds).toHaveBeenCalledWith([], []);
      
      // Verify message was published
      expect(mockMessageManager.publishMessage).toHaveBeenCalled();
      const message = (mockMessageManager.publishMessage as jest.Mock).mock.calls[0][0];
      expect(message).toBeInstanceOf(DataRecordsSelectionChangeMessage);
    });

    it('should do nothing if recordsToRemove is empty', () => {
      removeRecordsFromOriginSelections('widget_1', [], mockOutputDS);
      expect(mockMessageManager.publishMessage).not.toHaveBeenCalled();
    });
  });
});

