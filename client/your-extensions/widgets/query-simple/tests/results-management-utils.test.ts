import { getRecordKey, mergeResultsIntoAccumulated, removeResultsFromAccumulated, removeRecordsFromOriginSelections } from '../src/runtime/results-management-utils';
import { MessageManager, DataRecordsSelectionChangeMessage } from 'jimu-core';

// Mock shared-code/common
jest.mock('widgets/shared-code/common', () => ({
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

      expect(result.length).toBe(2);
      expect(result).toContain(existingRecord);
      expect(result).toContain(newRecord2);
      expect(result).not.toContain(newRecord1);
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

