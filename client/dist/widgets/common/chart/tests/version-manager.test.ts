import { Immutable } from 'jimu-core'
import { ByFieldSeriesX, ByFieldSeriesY } from '../src/constants'
import { buildUniqueQuery, setSeriesIdWithNumericField, versionManager } from '../src/version-manager'
import { DefaultPieLegendLabelMaxWidth } from '../src/utils/default'

let upgrader = null

jest.mock('@arcgis/charts-components', () => jest.fn())
jest.mock('@arcgis/charts-components-react', () => jest.fn())

describe('Version manager test', () => {
  describe('version 1.6.0', () => {
    beforeAll(() => {
      // eslint-disable-next-line @typescript-eslint/prefer-find
      upgrader = versionManager.versions?.filter(function (version) {
        return version.version === '1.6.0'
      })[0]?.upgrader
    })
    it('should upgrade `multipleBarType` to `stackedType`', () => {
      const oldConfig = Immutable({
        webChart: {
          series: [{
            multipleBarType: 'sideBySide'
          }, {
            multipleBarType: 'stacked'
          }]
        }
      })
      const newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          series: [{
            stackedType: 'sideBySide'
          }, {
            stackedType: 'stacked'
          }]
        }
      })
    })
  })
  describe('version 1.7.0', () => {
    describe('buildUniqueQuery', () => {
      it('by-group', () => {
        const series = Immutable([
          {
            query: {
              groupByFieldsForStatistics: ['category'],
              outStatistics: [
                {
                  onStatisticField: 'numeric0',
                  outStatisticFieldName: 'numeric0_sum',
                  statisticType: 'sum'
                }
              ]
            },
            id: 'numeric0_sum',
            x: 'category',
            y: 'numeric0_sum'
          },
          {
            query: {
              groupByFieldsForStatistics: ['category'],
              outStatistics: [
                {
                  onStatisticField: 'numeric1',
                  outStatisticFieldName: 'numeric1_sum',
                  statisticType: 'sum'
                }
              ]
            },
            id: 'numeric0_sum',
            x: 'category',
            y: 'numeric1_sum'
          }
        ]) as any
        expect(buildUniqueQuery(series)).toEqual({
          groupByFieldsForStatistics: ['category'],
          outStatistics: [
            {
              onStatisticField: 'numeric0',
              outStatisticFieldName: 'numeric0_sum',
              statisticType: 'sum'
            },
            {
              onStatisticField: 'numeric1',
              outStatisticFieldName: 'numeric1_sum',
              statisticType: 'sum'
            }
          ]
        })
      })
      it('by-field', () => {
        const series = Immutable([{
          query: {
            outStatistics: [
              {
                onStatisticField: 'numeric0',
                outStatisticFieldName: 'numeric0_sum',
                statisticType: 'sum'
              }, {
                onStatisticField: 'numeric1',
                outStatisticFieldName: 'numeric1_sum',
                statisticType: 'sum'
              }
            ]
          },
          id: ByFieldSeriesY,
          x: ByFieldSeriesY,
          y: ByFieldSeriesX
        }]) as any
        expect(buildUniqueQuery(series)).toEqual({
          outStatistics: [
            {
              onStatisticField: 'numeric0',
              outStatisticFieldName: 'numeric0_sum',
              statisticType: 'sum'
            },
            {
              onStatisticField: 'numeric1',
              outStatisticFieldName: 'numeric1_sum',
              statisticType: 'sum'
            }
          ]
        })
      })
    })

    describe('setSeriesIdWithNumericField', () => {
      it('by-group', () => {
        const series = Immutable([
          {
            query: {
              groupByFieldsForStatistics: ['category'],
              outStatistics: [
                {
                  onStatisticField: 'numeric0',
                  outStatisticFieldName: 'numeric0_sum',
                  statisticType: 'sum'
                }
              ]
            },
            id: 'numeric0_sum',
            x: 'category',
            y: 'numeric0_sum'
          },
          {
            query: {
              groupByFieldsForStatistics: ['category'],
              outStatistics: [
                {
                  onStatisticField: 'numeric1',
                  outStatisticFieldName: 'numeric1_sum',
                  statisticType: 'sum'
                }
              ]
            },
            id: 'numeric1_sum',
            x: 'category',
            y: 'numeric1_sum'
          }
        ]) as any
        expect(setSeriesIdWithNumericField(series)).toEqual([
          {
            query: {
              groupByFieldsForStatistics: ['category'],
              outStatistics: [
                {
                  onStatisticField: 'numeric0',
                  outStatisticFieldName: 'numeric0_sum',
                  statisticType: 'sum'
                }
              ]
            },
            id: 'numeric0',
            x: 'category',
            y: 'numeric0_sum'
          },
          {
            query: {
              groupByFieldsForStatistics: ['category'],
              outStatistics: [
                {
                  onStatisticField: 'numeric1',
                  outStatisticFieldName: 'numeric1_sum',
                  statisticType: 'sum'
                }
              ]
            },
            id: 'numeric1',
            x: 'category',
            y: 'numeric1_sum'
          }
        ])
      })
      it('by-field', () => {
        const series = Immutable([{
          query: {
            outStatistics: [
              {
                onStatisticField: 'numeric0',
                outStatisticFieldName: 'numeric0_sum',
                statisticType: 'sum'
              }, {
                onStatisticField: 'numeric1',
                outStatisticFieldName: 'numeric1_sum',
                statisticType: 'sum'
              }
            ]
          },
          id: ByFieldSeriesY,
          y: ByFieldSeriesX,
          x: ByFieldSeriesY
        }]) as any
        expect(setSeriesIdWithNumericField(series)).toEqual(series)
      })
    })
    describe('version 1.7.0', () => {
      beforeAll(() => {
        // eslint-disable-next-line @typescript-eslint/prefer-find
        upgrader = versionManager.versions?.filter(function (version) {
          return version.version === '1.7.0'
        })[0]?.upgrader
      })
      it('should upgrade successfully for `by-group` mode', () => {
        const oldConfig = Immutable({
          webChart: {
            series: [
              {
                query: {
                  groupByFieldsForStatistics: ['category'],
                  outStatistics: [
                    {
                      onStatisticField: 'numeric0',
                      outStatisticFieldName: 'numeric0_sum',
                      statisticType: 'sum'
                    }
                  ]
                },
                id: 'numeric0_sum',
                x: 'category',
                y: 'numeric0_sum'
              },
              {
                query: {
                  groupByFieldsForStatistics: ['category'],
                  outStatistics: [
                    {
                      onStatisticField: 'numeric1',
                      outStatisticFieldName: 'numeric1_sum',
                      statisticType: 'sum'
                    }
                  ]
                },
                id: 'numeric1_sum',
                x: 'category',
                y: 'numeric1_sum'
              }
            ] as any
          }
        })
        const newConfig = upgrader(oldConfig)

        expect(newConfig).toEqual({
          webChart: {
            dataSource: {
              query: {
                groupByFieldsForStatistics: ['category'],
                outStatistics: [
                  {
                    onStatisticField: 'numeric0',
                    outStatisticFieldName: 'numeric0_sum',
                    statisticType: 'sum'
                  },
                  {
                    onStatisticField: 'numeric1',
                    outStatisticFieldName: 'numeric1_sum',
                    statisticType: 'sum'
                  }
                ]
              }
            },
            series: [
              {
                id: 'numeric0',
                x: 'category',
                y: 'numeric0_sum'
              },
              {
                id: 'numeric1',
                x: 'category',
                y: 'numeric1_sum'
              }
            ] as any
          }
        })
      })
      it('should upgrade successfully for `by-field` mode', () => {
        const oldConfig = Immutable({
          webChart: {
            series: [
              {
                query: {
                  outStatistics: [
                    {
                      onStatisticField: 'numeric0',
                      outStatisticFieldName: 'numeric0_sum',
                      statisticType: 'sum'
                    }, {
                      onStatisticField: 'numeric1',
                      outStatisticFieldName: 'numeric1_sum',
                      statisticType: 'sum'
                    }
                  ]
                },
                id: ByFieldSeriesY,
                y: ByFieldSeriesX,
                x: ByFieldSeriesY
              }
            ] as any
          }
        })
        const newConfig = upgrader(oldConfig)

        expect(newConfig).toEqual({
          webChart: {
            dataSource: {
              query: {
                outStatistics: [
                  {
                    onStatisticField: 'numeric0',
                    outStatisticFieldName: 'numeric0_sum',
                    statisticType: 'sum'
                  },
                  {
                    onStatisticField: 'numeric1',
                    outStatisticFieldName: 'numeric1_sum',
                    statisticType: 'sum'
                  }
                ]
              }
            },
            series: [
              {
                id: ByFieldSeriesY,
                y: ByFieldSeriesX,
                x: ByFieldSeriesY
              }
            ] as any
          }
        })
      })
    })
  })
  describe('version 1.10.0', () => {
    beforeAll(() => {
      // eslint-disable-next-line @typescript-eslint/prefer-find
      upgrader = versionManager.versions?.filter(function (version) {
        return version.version === '1.10.0'
      })[0]?.upgrader
    })
    it('should upgrade `id`, `x`, `y` and `name` of series for by-field mode.', () => {
      const oldConfig = Immutable({
        webChart: {
          dataSource: {
            query: {
              outStatistics: [
                {
                  statisticType: 'min',
                  onStatisticField: 'Ward',
                  outStatisticFieldName: 'Ward_min'
                },
                {
                  statisticType: 'min',
                  onStatisticField: 'District',
                  outStatisticFieldName: 'District_min'
                }
              ]
            }
          },
          series: [
            {
              type: 'pieSeries',
              id: 'FieldValue',
              name: 'Sum of value',
              x: 'FieldName',
              y: 'FieldValue'
            }
          ]
        }
      })
      const newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          dataSource: {
            query: {
              outStatistics: [
                {
                  statisticType: 'min',
                  onStatisticField: 'Ward',
                  outStatisticFieldName: 'Ward_min'
                },
                {
                  statisticType: 'min',
                  onStatisticField: 'District',
                  outStatisticFieldName: 'District_min'
                }
              ]
            }
          },
          series: [
            {
              type: 'pieSeries',
              id: 'value',
              name: 'Min of value',
              x: 'name',
              y: 'value'
            }
          ]
        }
      })
    })
    it('should upgrade `config.colorMatch` to `series[0].slices` for pie chart.', () => {
      const oldConfig = Immutable({
        webChart: {
          dataSource: {
            query: {
              groupByFieldsForStatistics: [
                'Year'
              ],
              outStatistics: [
                {
                  statisticType: 'count',
                  onStatisticField: 'FID',
                  outStatisticFieldName: 'FID_count'
                }
              ]
            },
            colorMatch: {
              configFields: {
                fillColor: '_fillColor'
              },
              colorMatches: {
                2011: {
                  _fillColor: '#77B484'
                },
                2012: {
                  _fillColor: '#DF6B35'
                },
                2013: {
                  _fillColor: '#DBCF4E'
                },
                2014: {
                  _fillColor: '#41546D'
                },
                2015: {
                  _fillColor: '#8257C2'
                },
                2016: {
                  _fillColor: '#D6558B'
                }
              }
            }
          },
          series: [
            {
              type: 'pieSeries',
              colorType: 'colorMatch',
              id: 'FID',
              name: 'FID',
              x: 'Year',
              y: 'FID_count',
              sliceGrouping: {
                percentageThreshold: 7,
                groupName: 'Other',
                fillSymbol: {
                  type: 'esriSFS',
                  style: 'esriSFSSolid',
                  color: 'var(--ref-palette-neutral-1100)',
                  outline: {
                    type: 'esriSLS',
                    style: 'esriSLSSolid',
                    color: 'var(--ref-palette-neutral-700)',
                    width: 1
                  }
                }
              },
              fillSymbol: {
                type: 'esriSFS',
                style: 'esriSFSSolid',
                color: 'var(--ref-palette-neutral-800)',
                outline: {
                  type: 'esriSLS',
                  style: 'esriSLSSolid',
                  color: 'var(--ref-palette-neutral-700)',
                  width: 1
                }
              }
            }
          ]
        }
      })
      const newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          dataSource: {
            query: {
              groupByFieldsForStatistics: [
                'Year'
              ],
              outStatistics: [
                {
                  statisticType: 'count',
                  onStatisticField: 'FID',
                  outStatisticFieldName: 'FID_count'
                }
              ]
            }
          },
          series: [
            {
              type: 'pieSeries',
              colorType: 'colorMatch',
              id: 'FID',
              name: 'FID',
              x: 'Year',
              y: 'FID_count',
              sliceGrouping: {
                percentageThreshold: 7,
                groupName: 'Other',
                fillSymbol: {
                  type: 'esriSFS',
                  style: 'esriSFSSolid',
                  color: 'var(--ref-palette-neutral-1100)',
                  outline: {
                    type: 'esriSLS',
                    style: 'esriSLSSolid',
                    color: 'var(--ref-palette-neutral-700)',
                    width: 1
                  }
                }
              },
              fillSymbol: {
                type: 'esriSFS',
                style: 'esriSFSSolid',
                color: 'var(--ref-palette-neutral-800)',
                outline: {
                  type: 'esriSLS',
                  style: 'esriSLSSolid',
                  color: 'var(--ref-palette-neutral-700)',
                  width: 1
                }
              },
              slices: [
                {
                  sliceId: '2011',
                  fillSymbol: {
                    type: 'esriSFS',
                    style: 'esriSFSSolid',
                    color: '#77B484',
                    outline: {
                      type: 'esriSLS',
                      style: 'esriSLSSolid',
                      color: 'var(--ref-palette-neutral-700)',
                      width: 1
                    }
                  }
                },
                {
                  sliceId: '2012',
                  fillSymbol: {
                    type: 'esriSFS',
                    style: 'esriSFSSolid',
                    color: '#DF6B35',
                    outline: {
                      type: 'esriSLS',
                      style: 'esriSLSSolid',
                      color: 'var(--ref-palette-neutral-700)',
                      width: 1
                    }
                  }
                },
                {
                  sliceId: '2013',
                  fillSymbol: {
                    type: 'esriSFS',
                    style: 'esriSFSSolid',
                    color: '#DBCF4E',
                    outline: {
                      type: 'esriSLS',
                      style: 'esriSLSSolid',
                      color: 'var(--ref-palette-neutral-700)',
                      width: 1
                    }
                  }
                },
                {
                  sliceId: '2014',
                  fillSymbol: {
                    type: 'esriSFS',
                    style: 'esriSFSSolid',
                    color: '#41546D',
                    outline: {
                      type: 'esriSLS',
                      style: 'esriSLSSolid',
                      color: 'var(--ref-palette-neutral-700)',
                      width: 1
                    }
                  }
                },
                {
                  sliceId: '2015',
                  fillSymbol: {
                    type: 'esriSFS',
                    style: 'esriSFSSolid',
                    color: '#8257C2',
                    outline: {
                      type: 'esriSLS',
                      style: 'esriSLSSolid',
                      color: 'var(--ref-palette-neutral-700)',
                      width: 1
                    }
                  }
                },
                {
                  sliceId: '2016',
                  fillSymbol: {
                    type: 'esriSFS',
                    style: 'esriSFSSolid',
                    color: '#D6558B',
                    outline: {
                      type: 'esriSLS',
                      style: 'esriSLSSolid',
                      color: 'var(--ref-palette-neutral-700)',
                      width: 1
                    }
                  }
                }
              ]
            }
          ]
        }
      })
    })
  })

  describe('version 1.12.0', () => {
    beforeAll(() => {
      // eslint-disable-next-line @typescript-eslint/prefer-find
      upgrader = versionManager.versions?.filter(function (version) {
        return version.version === '1.12.0'
      })[0]?.upgrader
    })
    it('should move the optional `rotated` property from the series to the chart object', () => {
      const oldConfig = Immutable({
        webChart: {
          version: '1.0.0',
          series: [
            {
              type: 'barSeries',
              colorType: 'singleColor',
              id: 'value1',
              name: 'value1',
              x: 'name',
              y: 'value1_count',
              rotated: true
            },
            {
              type: 'barSeries',
              colorType: 'singleColor',
              id: 'value2',
              name: 'value2',
              x: 'name',
              y: 'value2_count',
              rotated: true
            }
          ]
        }
      })
      const newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          version: '6.2.1',
          rotated: true,
          series: [
            {
              type: 'barSeries',
              colorType: 'singleColor',
              id: 'value1',
              name: 'value1',
              x: 'name',
              y: 'value1_count'
            },
            {
              type: 'barSeries',
              colorType: 'singleColor',
              id: 'value2',
              name: 'value2',
              x: 'name',
              y: 'value2_count'
            }
          ]
        }
      })
    })
    it('should upgrade the numeric type in the slice id of the pie chart to a string type and upgrade `sliceGrouping`', () => {
      const oldConfig = Immutable({
        webChart: {
          version: '1.0.0',
          series: [
            {
              type: 'pieSeries',
              colorType: 'colorMatch',
              id: 'FID',
              name: 'FID',
              x: 'Year',
              y: 'FID_count',
              sliceGrouping: {
                percentageThreshold: 0,
                groupName: 'Other',
                fillSymbol: {
                  type: 'esriSFS'
                }
              },
              slices: [
                {
                  sliceId: 2011,
                  fillSymbol: {
                    type: 'esriSFS',
                    style: 'esriSFSSolid',
                    color: '#77B484',
                    outline: {
                      type: 'esriSLS',
                      style: 'esriSLSSolid',
                      color: 'var(--ref-palette-neutral-700)',
                      width: 1
                    }
                  }
                },
                {
                  sliceId: 2012,
                  fillSymbol: {
                    type: 'esriSFS',
                    style: 'esriSFSSolid',
                    color: '#DF6B35',
                    outline: {
                      type: 'esriSLS',
                      style: 'esriSLSSolid',
                      color: 'var(--ref-palette-neutral-700)',
                      width: 1
                    }
                  }
                }
              ]
            }
          ]
        }
      })
      const newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          version: '6.2.1',
          series: [
            {
              type: 'pieSeries',
              colorType: 'singleColor',
              id: 'FID',
              name: 'FID',
              x: 'Year',
              y: 'FID_count',
              sliceGrouping: {
                sliceId: '__other-slice__',
                percentageThreshold: 0,
                label: 'Other',
                fillSymbol: {
                  type: 'esriSFS'
                }
              },
              slices: [
                {
                  sliceId: '2011',
                  fillSymbol: {
                    type: 'esriSFS',
                    style: 'esriSFSSolid',
                    color: '#77B484',
                    outline: {
                      type: 'esriSLS',
                      style: 'esriSLSSolid',
                      color: 'var(--ref-palette-neutral-700)',
                      width: 1
                    }
                  }
                },
                {
                  sliceId: '2012',
                  fillSymbol: {
                    type: 'esriSFS',
                    style: 'esriSFSSolid',
                    color: '#DF6B35',
                    outline: {
                      type: 'esriSLS',
                      style: 'esriSLSSolid',
                      color: 'var(--ref-palette-neutral-700)',
                      width: 1
                    }
                  }
                }
              ]
            }
          ]
        }
      })
    })
  })

  describe('version 1.13.0', () => {
    beforeAll(() => {
      // eslint-disable-next-line @typescript-eslint/prefer-find
      upgrader = versionManager.versions?.filter(function (version) {
        return version.version === '1.13.0'
      })[0]?.upgrader
    })
    it('should upgrade series dataTooltipVisible to true, sortLabelsBy to originalValue, support max-length for the label of pie legend', () => {
      const oldConfig = Immutable({
        webChart: {
          series: [
            {
              type: 'pieSeries',
              colorType: 'colorMatch',
              id: 'FID',
              name: 'FID',
              x: 'Year',
              y: 'FID_count'
            }
          ],
          legend: {
            type: 'chartLegend',
            visible: true
          }
        }
      })
      const newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          sortLabelsBy: 'originalValue',
          series: [
            {
              type: 'pieSeries',
              colorType: 'colorMatch',
              id: 'FID',
              name: 'FID',
              x: 'Year',
              y: 'FID_count',
              dataTooltipVisible: true
            }
          ],
          legend: {
            type: 'chartLegend',
            visible: true,
            labelMaxWidth: DefaultPieLegendLabelMaxWidth
          }
        }
      })
    })
  })

  describe('version 1.14.0', () => {
    beforeAll(() => {
      // eslint-disable-next-line @typescript-eslint/prefer-find
      upgrader = versionManager.versions?.filter(function (version) {
        return version.version === '1.14.0'
      })[0]?.upgrader
    })
    it('should upgrade series dataTooltipVisible to true, sortLabelsBy to originalValue, support max-length for the label of pie legend', async () => {
      const oldInfo = {
        widgetJson: Immutable({
          uri: 'widgets/common/chart/',
          version: '1.14.0',
          label: 'Chart',
          config: {
            webChart: {
              type: 'chart',
              dataSource: {
                query: {
                  outStatistics: [
                    {
                      statisticType: 'sum',
                      onStatisticField: 'PER_DEM',
                      outStatisticFieldName: 'PER_DEM'
                    },
                    {
                      statisticType: 'sum',
                      onStatisticField: 'PER_GOP',
                      outStatisticFieldName: 'PER_GOP'
                    }
                  ]
                }
              },
              series: [
                {
                  type: 'pieSeries',
                  colorType: 'singleColor',
                  id: 'value',
                  name: 'Sum of Value',
                  x: 'name',
                  y: 'value'
                }
              ]
            }
          },
          id: 'widget_4',
          outputDataSources: [
            'widget_4_output'
          ],
          useDataSources: [
            {
              dataSourceId: 'ds1-layer-2-selection',
              mainDataSourceId: 'ds1-layer-2',
              rootDataSourceId: 'ds1',
              dataViewId: 'selection',
              fields: []
            }
          ]
        }),
        outputDataSourceJsons: Immutable({
          widget_4_output: {
            id: 'widget_4_output'
          }
        })
      }
      const newInfo = await upgrader(oldInfo)
      expect(newInfo).toEqual({
        ...oldInfo,
        widgetJson: {
          ...oldInfo.widgetJson,
          useDataSources: [
            {
              ...oldInfo.widgetJson.useDataSources[0],
              fields: ['PER_DEM', 'PER_GOP']
            }
          ]
        }
      })
    })
  })

  describe('version 1.15.0', () => {
    beforeAll(() => {
      // eslint-disable-next-line @typescript-eslint/prefer-find
      upgrader = versionManager.versions?.filter(function (version) {
        return version.version === '1.15.0'
      })[0]?.upgrader
    })
    it('should upgrade version to 9.4.0', () => {
      const oldConfig = Immutable({
        webChart: {
          version: '7.3.1',
          series: [
            {
              type: 'pieSeries',
              colorType: 'colorMatch',
              id: 'FID',
              name: 'FID',
              x: 'Year',
              y: 'FID_count'
            }
          ]
        }
      })
      const newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          version: '9.4.0',
          series: [
            {
              type: 'pieSeries',
              colorType: 'colorMatch',
              id: 'FID',
              name: 'FID',
              x: 'Year',
              y: 'FID_count'
            }
          ]
        }
      })
    })
    it('Should upgrade version to 9.4.0 and remove time-binning options for no aggregation', () => {
      const oldConfig = Immutable({
        webChart: {
          type: 'chart',
          version: '7.3.1',
          dataSource: {
            query: {
              groupByFieldsForStatistics: [
                'DailyHighDate'
              ],
              outFields: [
                'Water_Level_Elevation'
              ],
              orderByFields: [
                'DailyHighDate ASC'
              ]
            }
          },
          series: [
            {
              type: 'lineSeries',
              dataTooltipVisible: true,
              timeIntervalSize: 1,
              timeIntervalUnits: 'esriTimeUnitsDays',
              timeAggregationType: 'equalIntervalsFromStartTime',
              trimIncompleteTimeInterval: false,
              nullPolicy: 'interpolate'
            }
          ]
        }
      })
      const newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          type: 'chart',
          version: '9.4.0',
          dataSource: {
            query: {
              groupByFieldsForStatistics: [
                'DailyHighDate'
              ],
              outFields: [
                'Water_Level_Elevation'
              ],
              orderByFields: [
                'DailyHighDate ASC'
              ]
            }
          },
          series: [
            {
              type: 'lineSeries',
              dataTooltipVisible: true
            }
          ]
        }
      })
    })
    it('should set `hideOversizedStackedLabels` for bar series', () => {
      const oldConfig = Immutable({
        webChart: {
          version: '7.3.1',
          series: [
            {
              type: 'barSeries',
              id: 'FID',
              name: 'FID',
              x: 'Year',
              y: 'FID_count'
            }
          ]
        }
      })
      const newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          version: '9.4.0',
          series: [
            {
              type: 'barSeries',
              id: 'FID',
              name: 'FID',
              x: 'Year',
              y: 'FID_count',
              hideOversizedStackedLabels: false
            }
          ]
        }
      })
    })
  })

  describe('version 1.16.0', () => {
    beforeAll(() => {
      // eslint-disable-next-line @typescript-eslint/prefer-find
      upgrader = versionManager.versions?.filter(function (version) {
        return version.version === '1.16.0'
      })[0]?.upgrader
    })
    it('Should upgrade version to 17.0.0 and remove `series.colorType` and move `series.stackedType` to `config.stackedType`', () => {
      const oldConfig = Immutable({
        webChart: {
          type: 'chart',
          version: '9.4.0',
          sortLabelsBy: 'originalValue',
          dataSource: {
            query: {
              groupByFieldsForStatistics: [
                'Year'
              ],
              outStatistics: [
                {
                  statisticType: 'sum',
                  onStatisticField: 'District',
                  outStatisticFieldName: 'sum_of_District'
                },
                {
                  statisticType: 'sum',
                  onStatisticField: 'Ward',
                  outStatisticFieldName: 'sum_of_Ward'
                }
              ],
              orderByFields: [
                'sum_of_District ASC'
              ]
            }
          },
          series: [
            {
              type: 'barSeries',
              colorType: 'singleColor',
              stackedType: 'sideBySide',
              rotated: false
            }
          ]
        },
        options: {
          hideEmptySeriesInLegend: false
        }
      })
      const newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          type: 'chart',
          version: '17.0.0',
          colorMatch: false,
          stackedType: 'sideBySide',
          dataSource: {
            query: {
              groupByFieldsForStatistics: [
                'Year'
              ],
              outStatistics: [
                {
                  statisticType: 'sum',
                  onStatisticField: 'District',
                  outStatisticFieldName: 'sum_of_District'
                },
                {
                  statisticType: 'sum',
                  onStatisticField: 'Ward',
                  outStatisticFieldName: 'sum_of_Ward'
                }
              ]
            }
          },
          orderOptions: {
            orderByFields: [
              'sum_of_District ASC'
            ],
            data: {
              orderType: 'arcgis-charts-y-value',
              preferLabel: false,
              orderBy: 'ASC'
            }
          },
          series: [
            {
              type: 'barSeries'
            }
          ]
        },
        options: {
          hideEmptySeries: false
        }
      })
    })
    it('Should upgrade version to 17.0.0 and remove `series.colorType` and replace `config.sortLabelsBy` with to `config.orderOptions` for scatter-plot and histogram chart', () => {
      let oldConfig = Immutable({
        webChart: {
          type: 'chart',
          version: '9.4.0',
          sortLabelsBy: 'originalValue',
          dataSource: {
            query: {
              outFields: [
                'District',
                'Ward'
              ],
              orderByFields: [
                'District ASC'
              ]
            }
          },
          series: [
            {
              type: 'scatterSeries'
            }
          ]
        },
        options: {
          hideEmptySeriesInLegend: true
        }
      }) as any
      let newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          type: 'chart',
          version: '17.0.0',
          colorMatch: false,
          orderOptions: {
            orderByFields: [
              'District ASC'
            ]
          },
          dataSource: {
            query: {
              outFields: [
                'District',
                'Ward'
              ]
            }
          },
          series: [
            {
              type: 'scatterSeries'
            }
          ]
        },
        options: {
          hideEmptySeries: true
        }
      })

      oldConfig = Immutable({
        webChart: {
          type: 'chart',
          version: '9.4.0',
          sortLabelsBy: 'originalValue',
          dataSource: {
            query: {
              outFields: [
                'Beat'
              ],
              orderByFields: [
                'Beat ASC'
              ]
            }
          },
          series: [
            {
              type: 'histogramSeries'
            }
          ]
        }
      })
      newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          type: 'chart',
          version: '17.0.0',
          colorMatch: false,
          orderOptions: {
            orderByFields: [
              'Beat ASC'
            ]
          },
          dataSource: {
            query: {
              outFields: [
                'Beat'
              ]
            }
          },
          series: [
            {
              type: 'histogramSeries'
            }
          ]
        }
      })
    })
    it('Should upgrade version to 17.0.0 for gauge', () => {
      const oldConfig = Immutable({
        webChart: {
          type: 'chart',
          version: '9.4.0',
          dataSource: {
            query: {
              outStatistics: [
                {
                  statisticType: 'sum',
                  onStatisticField: 'Beat',
                  outStatisticFieldName: 'displayValue'
                }
              ]
            }
          },
          series: [
            {
              type: 'gaugeSeries'
            }
          ]
        }
      })
      const newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          type: 'chart',
          version: '17.0.0',
          colorMatch: false,
          dataSource: {
            query: {
              outStatistics: [
                {
                  statisticType: 'sum',
                  onStatisticField: 'Beat',
                  outStatisticFieldName: 'displayValue'
                }
              ]
            }
          },
          series: [
            {
              type: 'gaugeSeries'
            }
          ]
        }
      })
    })
    it('Should upgrade version to 17.0.0 and remove `series.colorType` and replace `config.sortLabelsBy` with to `config.orderOptions` for `by-field` mode', () => {
      let oldConfig = Immutable({
        webChart: {
          type: 'chart',
          version: '9.4.0',
          sortLabelsBy: 'originalValue',
          dataSource: {
            query: {
              outStatistics: [
                {
                  statisticType: 'sum',
                  onStatisticField: 'District',
                  outStatisticFieldName: 'District'
                },
                {
                  statisticType: 'sum',
                  onStatisticField: 'Ward',
                  outStatisticFieldName: 'Ward'
                }
              ],
              orderByFields: [
                'name ASC'
              ]
            }
          },
          series: [
            {
              type: 'barSeries'
            }
          ]
        }
      })
      let newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          type: 'chart',
          version: '17.0.0',
          colorMatch: false,
          orderOptions: {
            data: {
              orderType: 'arcgis-charts-category',
              preferLabel: false,
              orderBy: 'ASC'
            }
          },
          dataSource: {
            query: {
              outStatistics: [
                {
                  statisticType: 'sum',
                  onStatisticField: 'District',
                  outStatisticFieldName: 'District'
                },
                {
                  statisticType: 'sum',
                  onStatisticField: 'Ward',
                  outStatisticFieldName: 'Ward'
                }
              ]
            }
          },
          series: [
            {
              type: 'barSeries'
            }
          ]
        }
      })

      oldConfig = Immutable({
        webChart: {
          type: 'chart',
          version: '9.4.0',
          sortLabelsBy: 'originalValue',
          dataSource: {
            query: {
              outStatistics: [
                {
                  statisticType: 'sum',
                  onStatisticField: 'District',
                  outStatisticFieldName: 'District'
                },
                {
                  statisticType: 'sum',
                  onStatisticField: 'Ward',
                  outStatisticFieldName: 'Ward'
                }
              ],
              orderByFields: [
                'value DESC'
              ]
            }
          },
          series: [
            {
              type: 'barSeries'
            }
          ]
        }
      })
      newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          type: 'chart',
          version: '17.0.0',
          colorMatch: false,
          orderOptions: {
            data: {
              orderType: 'arcgis-charts-y-value',
              preferLabel: false,
              orderBy: 'DESC'
            }
          },
          dataSource: {
            query: {
              outStatistics: [
                {
                  statisticType: 'sum',
                  onStatisticField: 'District',
                  outStatisticFieldName: 'District'
                },
                {
                  statisticType: 'sum',
                  onStatisticField: 'Ward',
                  outStatisticFieldName: 'Ward'
                }
              ]
            }
          },
          series: [
            {
              type: 'barSeries'
            }
          ]
        }
      })
    })
    it('Should upgrade version to 17.0.0 and remove `series.colorType` and replace `config.sortLabelsBy` with to `config.orderOptions` for `no-aggregation` statistics type', () => {
      let oldConfig = Immutable({
        webChart: {
          type: 'chart',
          version: '9.4.0',
          sortLabelsBy: 'originalValue',
          dataSource: {
            query: {
              groupByFieldsForStatistics: [
                'Year'
              ],
              outFields: [
                'District',
                'Ward'
              ],
              orderByFields: [
                'Year DESC'
              ],
              where: ''
            }
          },
          series: [
            {
              type: 'barSeries'
            }
          ]
        }
      })
      let newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          type: 'chart',
          version: '17.0.0',
          colorMatch: false,
          orderOptions: {
            orderByFields: [
              'Year DESC'
            ],
            data: {
              orderType: 'arcgis-charts-category',
              preferLabel: false,
              orderBy: 'DESC'
            }
          },
          dataSource: {
            query: {
              groupByFieldsForStatistics: [
                'Year'
              ],
              outFields: [
                'District',
                'Ward'
              ],
              where: ''
            }
          },
          series: [
            {
              type: 'barSeries'
            }
          ]
        }
      })

      oldConfig = Immutable({
        webChart: {
          type: 'chart',
          version: '9.4.0',
          sortLabelsBy: 'originalValue',
          dataSource: {
            query: {
              groupByFieldsForStatistics: [
                'Year'
              ],
              outFields: [
                'District',
                'Ward'
              ],
              orderByFields: [
                'District ASC'
              ],
              where: ''
            }
          },
          series: [
            {
              type: 'barSeries'
            }
          ]
        }
      })
      newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          type: 'chart',
          version: '17.0.0',
          colorMatch: false,
          orderOptions: {
            orderByFields: [
              'District ASC'
            ],
            data: {
              orderType: 'arcgis-charts-y-value',
              preferLabel: false,
              orderBy: 'ASC'
            }
          },
          dataSource: {
            query: {
              groupByFieldsForStatistics: [
                'Year'
              ],
              outFields: [
                'District',
                'Ward'
              ],
              where: ''
            }
          },
          series: [
            {
              type: 'barSeries'
            }
          ]
        }
      })
    })
    it('Should upgrade version to 17.0.0 and remove `series.colorType` and replace `config.sortLabelsBy` with to `config.orderOptions` for normal serial charts', () => {
      let oldConfig = Immutable({
        webChart: {
          type: 'chart',
          version: '9.4.0',
          sortLabelsBy: 'originalValue',
          dataSource: {
            query: {
              groupByFieldsForStatistics: [
                'Year'
              ],
              outStatistics: [
                {
                  statisticType: 'sum',
                  onStatisticField: 'District',
                  outStatisticFieldName: 'sum_of_District'
                },
                {
                  statisticType: 'sum',
                  onStatisticField: 'Ward',
                  outStatisticFieldName: 'sum_of_Ward'
                }
              ],
              orderByFields: [
                'Year DESC'
              ],
              where: ''
            }
          },
          series: [
            {
              type: 'barSeries'
            }
          ]
        }
      })
      let newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          type: 'chart',
          version: '17.0.0',
          colorMatch: false,
          orderOptions: {
            orderByFields: [
              'Year DESC'
            ],
            data: {
              orderType: 'arcgis-charts-category',
              preferLabel: false,
              orderBy: 'DESC'
            }
          },
          dataSource: {
            query: {
              groupByFieldsForStatistics: [
                'Year'
              ],
              outStatistics: [
                {
                  statisticType: 'sum',
                  onStatisticField: 'District',
                  outStatisticFieldName: 'sum_of_District'
                },
                {
                  statisticType: 'sum',
                  onStatisticField: 'Ward',
                  outStatisticFieldName: 'sum_of_Ward'
                }
              ],
              where: ''
            }
          },
          series: [
            {
              type: 'barSeries'
            }
          ]
        }
      })

      oldConfig = Immutable({
        webChart: {
          type: 'chart',
          version: '9.4.0',
          sortLabelsBy: 'originalValue',
          dataSource: {
            query: {
              groupByFieldsForStatistics: [
                'Year'
              ],
              outStatistics: [
                {
                  statisticType: 'sum',
                  onStatisticField: 'District',
                  outStatisticFieldName: 'sum_of_District'
                },
                {
                  statisticType: 'sum',
                  onStatisticField: 'Ward',
                  outStatisticFieldName: 'sum_of_Ward'
                }
              ],
              orderByFields: [
                'sum_of_District ASC'
              ],
              where: ''
            }
          },
          series: [
            {
              type: 'pieSeries'
            }
          ]
        }
      })
      newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          type: 'chart',
          version: '17.0.0',
          colorMatch: false,
          orderOptions: {
            orderByFields: [
              'sum_of_District ASC'
            ],
            data: {
              orderType: 'arcgis-charts-y-value',
              preferLabel: false,
              orderBy: 'ASC'
            }
          },
          dataSource: {
            query: {
              groupByFieldsForStatistics: [
                'Year'
              ],
              outStatistics: [
                {
                  statisticType: 'sum',
                  onStatisticField: 'District',
                  outStatisticFieldName: 'sum_of_District'
                },
                {
                  statisticType: 'sum',
                  onStatisticField: 'Ward',
                  outStatisticFieldName: 'sum_of_Ward'
                }
              ],
              where: ''
            }
          },
          series: [
            {
              type: 'pieSeries'
            }
          ]
        }
      })
    })
  })

  describe('version 1.18.0', () => {
    beforeAll(() => {
      upgrader = versionManager.versions?.find(function (version) {
        return version.version === '1.18.0'
      })?.upgrader
    })
    it('Should upgrade `binTemporalData` successfully', () => {
      let oldConfig = Immutable({
        webChart: {
          type: 'chart',
          version: '18.0.0',
          dataSource: {
            query: {
              groupByFieldsForStatistics: ['Date'],
              outStatistics: [{
                statisticType: 'count',
                onStatisticField: 'FID',
                outStatisticFieldName: 'count_of_FID'
              }]
            }
          },
          series: [{
            type: 'barSeries',
            x: 'Date',
            y: 'count_of_FID',
            binTemporalData: false
          }]
        }
      })
      let newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          type: 'chart',
          version: '23.2.0',
          dataSource: {
            query: {
              groupByFieldsForStatistics: ['Date'],
              outStatistics: [{
                statisticType: 'count',
                onStatisticField: 'FID',
                outStatisticFieldName: 'count_of_FID'
              }]
            }
          },
          series: [{
            type: 'barSeries',
            x: 'Date',
            y: 'count_of_FID',
            binTemporalData: false
          }]
        }
      })

      oldConfig = Immutable({
        webChart: {
          type: 'chart',
          version: '18.0.0',
          dataSource: {
            query: {
              groupByFieldsForStatistics: ['Date'],
              outStatistics: [{
                statisticType: 'count',
                onStatisticField: 'FID',
                outStatisticFieldName: 'count_of_FID'
              }]
            }
          },
          series: [{
            type: 'barSeries',
            x: 'Date',
            y: 'count_of_FID',
            binTemporalData: true,
            nullPolicy: 'null',
            timeAggregationType: 'equalIntervalsFromEndTime',
            timeIntervalSize: 3,
            timeIntervalUnits: 'esriTimeUnitsMonths',
            trimIncompleteTimeInterval: false,
          }]
        }
      })
      newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          type: 'chart',
          version: '23.2.0',
          dataSource: {
            query: {
              groupByFieldsForStatistics: ['Date'],
              outStatistics: [{
                statisticType: 'count',
                onStatisticField: 'FID',
                outStatisticFieldName: 'count_of_FID'
              }]
            }
          },
          series: [{
            type: 'barSeries',
            x: 'Date',
            y: 'count_of_FID',
            binTemporalData: true,
            temporalBinning: {
              size: 3,
              nullPolicy: 'null',
              unit: 'months',
              type: 'fixedDateBased',
              timeAggregationType: 'equalIntervalsFromEndTime',
              trimIncompleteTimeInterval: false
            }
          }]
        }
      })

      oldConfig = Immutable({
        webChart: {
          type: 'chart',
          version: '18.0.0',
          dataSource: {
            query: {
              groupByFieldsForStatistics: ['Date'],
              outStatistics: [{
                statisticType: 'count',
                onStatisticField: 'FID',
                outStatisticFieldName: 'count_of_FID'
              }]
            }
          },
          series: [{
            type: 'barSeries',
            x: 'Date',
            y: 'count_of_FID',
            nullPolicy: 'null',
            timeAggregationType: 'equalIntervalsFromEndTime',
            timeIntervalSize: 3,
            timeIntervalUnits: 'esriTimeUnitsMonths',
            trimIncompleteTimeInterval: false,
          }]
        }
      }) as any
      newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          type: 'chart',
          version: '23.2.0',
          dataSource: {
            query: {
              groupByFieldsForStatistics: ['Date'],
              outStatistics: [{
                statisticType: 'count',
                onStatisticField: 'FID',
                outStatisticFieldName: 'count_of_FID'
              }]
            }
          },
          series: [{
            type: 'barSeries',
            x: 'Date',
            y: 'count_of_FID',
            binTemporalData: true,
            temporalBinning: {
              size: 3,
              nullPolicy: 'null',
              unit: 'months',
              type: 'fixedDateBased',
              timeAggregationType: 'equalIntervalsFromEndTime',
              trimIncompleteTimeInterval: false
            }
          }]
        }
      })
    })

    it('Should upgrade `percentile_cont` successfully', () => {
      let oldConfig = Immutable({
        webChart: {
          type: 'chart',
          version: '18.0.0',
          dataSource: {
            query: {
              groupByFieldsForStatistics: ['Date'],
              outStatistics: [{
                statisticType: 'count',
                onStatisticField: 'FID',
                outStatisticFieldName: 'count_of_FID'
              }]
            }
          },
          series: [{
            type: 'barSeries',
            x: 'Date',
            y: 'count_of_FID',
            binTemporalData: false
          }]
        }
      })
      let newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          type: 'chart',
          version: '23.2.0',
          dataSource: {
            query: {
              groupByFieldsForStatistics: ['Date'],
              outStatistics: [{
                statisticType: 'count',
                onStatisticField: 'FID',
                outStatisticFieldName: 'count_of_FID'
              }]
            }
          },
          series: [{
            type: 'barSeries',
            x: 'Date',
            y: 'count_of_FID',
            binTemporalData: false
          }]
        }
      })

      oldConfig = Immutable({
        webChart: {
          type: 'chart',
          version: '18.0.0',
          dataSource: {
            query: {
              groupByFieldsForStatistics: ['Year'],
              outStatistics: [{
                statisticType: 'percentile_cont',
                onStatisticField: 'Beat',
                outStatisticFieldName: 'percentile_cont_of_Beat',
                statisticParameters: {
                  value: 0.5
                }
              }]
            }
          },
          series: [{
            type: 'barSeries',
            x: 'Year',
            y: 'percentile_cont_of_Beat',
            binTemporalData: false
          }]
        }
      })
      newConfig = upgrader(oldConfig)
      expect(newConfig).toEqual({
        webChart: {
          type: 'chart',
          version: '23.2.0',
          dataSource: {
            query: {
              groupByFieldsForStatistics: ['Year'],
              outStatistics: [{
                statisticType: 'percentile-continuous',
                onStatisticField: 'Beat',
                outStatisticFieldName: 'percentile_cont_of_Beat',
                statisticParameters: {
                  value: 0.5
                }
              }]
            }
          },
          series: [{
            type: 'barSeries',
            x: 'Year',
            y: 'percentile_cont_of_Beat',
            binTemporalData: false
          }]
        }
      })
    })
  })
})
