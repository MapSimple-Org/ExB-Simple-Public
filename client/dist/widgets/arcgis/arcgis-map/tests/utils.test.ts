import type { ScaleRange } from '../src/config'
import { getFinalScaleRange } from '../src/utils'

describe('calculate final scale range', () => {
  describe('configScaleRange is empty', () => {
    const configScaleRange: ScaleRange = null
    it('lodMinScale and lodMaxScale are different and not empty', () => {
      const currScale = 1234
      const lodMinScale = 1000000
      const lodMaxScale = 100
      const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
      expect(result).toEqual({
        isScaleRangeValid: true,
        finalMinScale: 0,
        finalMaxScale: 0
      })
    })

    it('lodMinScale and lodMaxScale are same and not empty', () => {
      const currScale = 1234
      const lodMinScale = 1000000
      const lodMaxScale = 1000000
      const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
      expect(result).toEqual({
        isScaleRangeValid: true,
        finalMinScale: 0,
        finalMaxScale: 0
      })
    })

    it('lodMinScale and lodMaxScale are empty', () => {
      const currScale = 1234
      const lodMinScale = null
      const lodMaxScale = null
      const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
      expect(result).toEqual({
        isScaleRangeValid: true,
        finalMinScale: 0,
        finalMaxScale: 0
      })
    })
  })


  describe('configScaleRange is not empty', () => {
    describe('configScaleRange.minScale > 0 and configScaleRange.maxScale > 0', () => {
      const configScaleRange: ScaleRange = {
        minScale: 10000,
        maxScale: 100
      }

      describe('lodMinScale and lodMaxScale are different and not empty ', () => {
        it('has intersection, config scale range is little bigger', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config:     [100,     10000]
          // lod:   [5,       500]
          const lodMinScale = 500
          const lodMaxScale = 5
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: true,
            finalMinScale: 0, // change 500 to 0 because it same with lodMinScale
            finalMaxScale: 100
          })
        })

        it('has intersection, lod scale range is little bigger', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config: [100,     10000]
          // lod:          [500,       50000]
          const lodMinScale = 50000
          const lodMaxScale = 500
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: true,
            finalMinScale: 10000,
            finalMaxScale: 0 // change 500 to 0 because it same with lodMaxScale
          })
        })

        it('no intersection, config scale range > lod scale range', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config:                [100,     10000]
          // lod:   [5,       50]
          const lodMinScale = 50
          const lodMaxScale = 5
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: false,
            finalMinScale: currScale,
            finalMaxScale: currScale
          })
        })

        it('no intersection, config scale range < lod scale range', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config: [100,     10000]
          // lod:                          [50000,       5000000]
          const lodMinScale = 5000000
          const lodMaxScale = 50000
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: false,
            finalMinScale: currScale,
            finalMaxScale: currScale
          })
        })
      })

      describe('lodMinScale and lodMaxScale are same and not empty', () => {
        it('has intersection, configScaleRange.maxScale < lodScale < configScaleRange.minScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config:     [100,     10000]
          // lod:            [500,500]
          const lodMinScale = 500
          const lodMaxScale = 500
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: true,
            finalMinScale: 0, // change 500 to 0 because it same with lodMinScale
            finalMaxScale: 0 // change 500 to 0 because it same with lodMaxScale
          })
        })

        it('has intersection, lodScale === configScaleRange.maxScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config:     [100,     10000]
          // lod:        [100,100]
          const lodMinScale = 100
          const lodMaxScale = 100
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: true,
            finalMinScale: 0, // change 100 to 0 because it same with lodMinScale
            finalMaxScale: 0 // change 100 to 0 because it same with lodMaxScale
          })
        })

        it('has intersection, lodScale > configScaleRange.minScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config:     [100,     10000]
          // lod:           [10000,10000]
          const lodMinScale = 10000
          const lodMaxScale = 10000
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: true,
            finalMinScale: 0, // change 10000 to 0 because it same with lodMinScale
            finalMaxScale: 0 // change 10000 to 0 because it same with lodMaxScale
          })
        })

        it('no intersection, lodScale < configScaleRange.maxScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config:          [100,     10000]
          // lod:   [5, 50]
          const lodMinScale = 50
          const lodMaxScale = 5
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: false,
            finalMinScale: currScale,
            finalMaxScale: currScale
          })
        })

        it('no intersection, lodScale > configScaleRange.minScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config:  [100,     10000]
          // lod:                      [50000,    5000000]
          const lodMinScale = 5000000
          const lodMaxScale = 50000
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: false,
            finalMinScale: currScale,
            finalMaxScale: currScale
          })
        })
      })

      it('lodMinScale and lodMaxScale are empty', () => {
        const currScale = 1234
        const lodMinScale = null
        const lodMaxScale = null
        const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
        expect(result).toEqual({
          isScaleRangeValid: true,
          finalMinScale: configScaleRange.minScale,
          finalMaxScale: configScaleRange.maxScale
        })
      })
    })

    describe('configScaleRange.minScale > 0 and configScaleRange.maxScale is empty', () => {
      const configScaleRange: ScaleRange = { minScale: 10000 }
      describe('lodMinScale and lodMaxScale are different and not empty', () => {
        it('has intersection, lodMaxScale < configScaleRange.minScale < lodMinScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config: [-,  10000]
          // lod:    [5,            50000]
          const lodMinScale = 50000
          const lodMaxScale = 5
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: true,
            finalMinScale: 10000,
            finalMaxScale: 0 // change 5 to 0 because it same with lodMaxScale
          })
        })

        it('has intersection, configScaleRange.minScale === lodMaxScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config: [-,  10000]
          // lod:        [10000,       50000]
          const lodMinScale = 50000
          const lodMaxScale = 10000
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: true,
            finalMinScale: 10000,
            finalMaxScale: 0 // change 10000 to 0 because it same with lodMaxScale
          })
        })

        it('has intersection, configScaleRange.minScale === lodMinScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config: [-,    10000]
          // lod:    [5,    10000]
          const lodMinScale = 10000
          const lodMaxScale = 5
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: true,
            finalMinScale: 0, // change 10000 to 0 because it same with lodMinScale
            finalMaxScale: 0 // change 5 to 0 because it same with lodMaxScale
          })
        })

        it('no intersection, configScaleRange.minScale < lodMaxScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config: [-,  10000]
          // lod:                 [50000,   5000000]
          const lodMinScale = 5000000
          const lodMaxScale = 50000
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: false,
            finalMinScale: currScale,
            finalMaxScale: currScale
          })
        })

        it('has intersection, configScaleRange.minScale > lodMinScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config:             [-,  10000]
          // lod:        [5,   5000]
          const lodMinScale = 5000
          const lodMaxScale = 5
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: true,
            finalMinScale: 0, // change 5000 to 0 because it same with lodMinScale
            finalMaxScale: 0 // change 5 to 0 because it same with lodMaxScale
          })
        })
      })

      describe('lodMinScale and lodMaxScale are same and not empty', () => {
        it('no intersection, configScaleRange.minScale < lodScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config:     [-,     10000]
          // lod:                        [50000,50000]
          const lodMinScale = 50000
          const lodMaxScale = 50000
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: false,
            finalMinScale: currScale,
            finalMaxScale: currScale
          })
        })

        it('has intersection, configScaleRange.minScale === lodScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config:     [-,     10000]
          // lod:                [10000,10000]
          const lodMinScale = 10000
          const lodMaxScale = 10000
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: true,
            finalMinScale: 0, // change 10000 to 0 because it same with lodMinScale
            finalMaxScale: 0 // change 10000 to 0 because it same with lodMaxScale
          })
        })

        it('has intersection, configScaleRange.minScale > lodScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config: [-,         10000]
          // lod:    [500,500]
          const lodMinScale = 500
          const lodMaxScale = 500
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: true,
            finalMinScale: 0, // change 500 to 0 because it same with lodMinScale
            finalMaxScale: 0 // change 500 to 0 because it same with lodMaxScale
          })
        })
      })

      it('lodMinScale and lodMaxScale are empty', () => {
        const currScale = 1234
        const lodMinScale = null
        const lodMaxScale = null
        const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
        expect(result).toEqual({
          isScaleRangeValid: true,
          finalMinScale: configScaleRange.minScale,
          finalMaxScale: 0
        })
      })
    })

    describe('configScaleRange.minScale is empty and configScaleRange.maxScale > 0', () => {
      const configScaleRange: ScaleRange = { maxScale: 10000 }

      describe('lodMinScale and lodMaxScale are different and not empty', () => {
        it('has intersection, lodMaxScale < configScaleRange.maxScale < lodMinScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config:     [10000,        -]
          // lod:    [5,            50000]
          const lodMinScale = 50000
          const lodMaxScale = 5
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: true,
            finalMinScale: 0, // change 50000 to 0 because it same with lodMinScale
            finalMaxScale: 10000
          })
        })

        it('has intersection, configScaleRange.maxScale === lodMaxScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config: [10000,        -]
          // lod:    [10000,    50000]
          const lodMinScale = 50000
          const lodMaxScale = 10000
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: true,
            finalMinScale: 0, // change 50000 to 0 because it same with lodMinScale
            finalMaxScale: 0 // change 10000 to 0 because it same with lodMaxScale
          })
        })

        it('has intersection, configScaleRange.maxScale === lodMinScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config:           [10000,        -]
          // lod:    [500,     10000]
          const lodMinScale = 10000
          const lodMaxScale = 500
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: true,
            finalMinScale: 0, // change 10000 to 0 because it same with lodMinScale
            finalMaxScale: 10000
          })
        })

        it('has intersection, configScaleRange.maxScale < lodMaxScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config: [10000,                   -]
          // lod:            [50000,     5000000]
          const lodMinScale = 5000000
          const lodMaxScale = 50000
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: true,
            finalMinScale: 0, // change 5000000 to 0 because it same with lodMinScale
            finalMaxScale: 0 // change 50000 to 0 because it same with lodMaxScale
          })
        })

        it('no intersection, configScaleRange.maxScale > lodMinScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config:                   [10000,        -]
          // lod:    [5,  5000]
          const lodMinScale = 5000
          const lodMaxScale = 5
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: false,
            finalMinScale: currScale,
            finalMaxScale: currScale
          })
        })
      })

      describe('lodMinScale and lodMaxScale are same and not empty', () => {
        it('has intersection, configScaleRange.maxScale < lodScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config:     [10000,             -]
          // lod:                 [50000,50000]
          const lodMinScale = 50000
          const lodMaxScale = 50000
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: true,
            finalMinScale: 0, // change 50000 to 0 because it same with lodMinScale
            finalMaxScale: 0 // change 50000 to 0 because it same with lodMaxScale
          })
        })

        it('has intersection, configScaleRange.maxScale === lodScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config:     [10000,             -]
          // lod:        [10000,10000]
          const lodMinScale = 10000
          const lodMaxScale = 10000
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: true,
            finalMinScale: 0, // change 10000 to 0 because it same with lodMinScale
            finalMaxScale: 0 // change 10000 to 0 because it same with lodMaxScale
          })
        })

        it('no intersection, configScaleRange.maxScale > lodScale', () => {
          const currScale = 1234
          // [maxScale, minScale]
          // config:                  [10000,             -]
          // lod:   [5,     5000]
          const lodMinScale = 5000
          const lodMaxScale = 5
          const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
          expect(result).toEqual({
            isScaleRangeValid: false,
            finalMinScale: currScale,
            finalMaxScale: currScale
          })
        })
      })

      it('lodMinScale and lodMaxScale are empty', () => {
        const currScale = 1234
        const lodMinScale = null
        const lodMaxScale = null
        const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
        expect(result).toEqual({
          isScaleRangeValid: true,
          finalMinScale: 0,
          finalMaxScale: configScaleRange.maxScale
        })
      })
    })

    describe('configScaleRange.minScale is empty and configScaleRange.maxScale is empty', () => {
      const configScaleRange: ScaleRange = {}
      it('lodMinScale and lodMaxScale are different and not empty', () => {
        const currScale = 1234
        const lodMinScale = 1000000
        const lodMaxScale = 100

        const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
        expect(result).toEqual({
          isScaleRangeValid: true,
          finalMinScale: 0,
          finalMaxScale: 0
        })
      })

      it('lodMinScale and lodMaxScale are same and not empty', () => {
        const currScale = 1234
        const lodMinScale = 1000000
        const lodMaxScale = 1000000
        const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
        expect(result).toEqual({
          isScaleRangeValid: true,
          finalMinScale: 0,
          finalMaxScale: 0
        })
      })

      it('lodMinScale and lodMaxScale are empty', () => {
        const currScale = 1234
        const lodMinScale = null
        const lodMaxScale = null
        const result = getFinalScaleRange(currScale, lodMinScale, lodMaxScale, configScaleRange)
        expect(result).toEqual({
          isScaleRangeValid: true,
          finalMinScale: 0,
          finalMaxScale: 0
        })
      })
    })
  })
})