// import _Widget from '../src/runtime/widget'
import { getUpdatedEndTimeByStepLength } from '../src/utils/utils'

// setup file

describe('filter widget', function () {

  it('utils - getUpdatedEndTimeByStepLength', function () {
    const startTime = { value: new Date(2020, 3, 5, 8, 0, 0).getTime() } // sep 5 2020

    // virtual date
    const startTimeVirtual = { value: 'today' }
    const endTimeVirtual = getUpdatedEndTimeByStepLength({ val: 1, unit: 'year' } as any, startTimeVirtual, new Date(2020, 8, 1, 8, 0, 0).getTime())
    expect(endTimeVirtual).toBe(null)

    // no stepLength
    const endTimeNoStepLength = getUpdatedEndTimeByStepLength(null, startTime, startTime)
    expect(endTimeNoStepLength).toBe(null)

    // year
    const stepLengthY1 = { val: 1, unit: 'year' } as any
    const endTimeY1 = getUpdatedEndTimeByStepLength(stepLengthY1, startTime, { value: new Date(2020, 8, 1, 8, 0, 0).getTime() })
    expect(endTimeY1).toBe(new Date(2021, 3, 5, 8, 0, 0).getTime())
    const endTimeY2 = getUpdatedEndTimeByStepLength(stepLengthY1, startTime, { value: new Date(2020, 8, 8, 8, 0, 0).getTime() })
    expect(endTimeY2).toBe(new Date(2021, 3, 5, 8, 0, 0).getTime())
    const endTimeY3 = getUpdatedEndTimeByStepLength(stepLengthY1, startTime, { value: new Date(2025, 1, 5, 0, 0, 0).getTime() })
    expect(endTimeY3).toBe(new Date(2025, 3, 5, 8, 0, 0).getTime())
    const endTimeY4 = getUpdatedEndTimeByStepLength(stepLengthY1, startTime, { value: new Date(2025, 3, 5, 8, 0, 0).getTime() })
    expect(endTimeY4).toBe(new Date(2025, 3, 5, 8, 0, 0).getTime())
    const endTimeY5 = getUpdatedEndTimeByStepLength(stepLengthY1, startTime, { value: new Date(2025, 8, 5, 10, 0, 0).getTime() })
    expect(endTimeY5).toBe(new Date(2026, 3, 5, 8, 0, 0).getTime())

    const stepLengthY2 = { val: 2, unit: 'year' } as any
    const endTimeMultiY1 = getUpdatedEndTimeByStepLength(stepLengthY2, startTime, { value: new Date(2020, 8, 1, 8, 0, 0).getTime() })
    expect(endTimeMultiY1).toBe(new Date(2022, 3, 5, 8, 0, 0).getTime())
    const endTimeMultiY2 = getUpdatedEndTimeByStepLength(stepLengthY2, startTime, { value: new Date(2020, 8, 8, 8, 0, 0).getTime() })
    expect(endTimeMultiY2).toBe(new Date(2022, 3, 5, 8, 0, 0).getTime())
    const endTimeMultiY3 = getUpdatedEndTimeByStepLength(stepLengthY2, startTime, { value: new Date(2025, 1, 5, 0, 0, 0).getTime() })
    expect(endTimeMultiY3).toBe(new Date(2026, 3, 5, 8, 0, 0).getTime())
    const endTimeMultiY4 = getUpdatedEndTimeByStepLength(stepLengthY2, startTime, { value: new Date(2025, 8, 5, 10, 0, 0).getTime() })
    expect(endTimeMultiY4).toBe(new Date(2026, 3, 5, 8, 0, 0).getTime())

    // month
    const stepLengthM = { val: 1, unit: 'month' } as any
    const endTimeM1 = getUpdatedEndTimeByStepLength(stepLengthM, startTime, { value: new Date(2020, 8, 1, 8, 0, 0).getTime() })
    expect(endTimeM1).toBe(new Date(2020, 8, 5, 8, 0, 0).getTime())
    const endTimeM2 = getUpdatedEndTimeByStepLength(stepLengthM, startTime, { value: new Date(2020, 8, 8, 8, 0, 0).getTime() })
    expect(endTimeM2).toBe(new Date(2020, 9, 5, 8, 0, 0).getTime())
    const endTimeM3 = getUpdatedEndTimeByStepLength(stepLengthM, startTime, { value: new Date(2022, 8, 5, 8, 0, 0).getTime() })
    expect(endTimeM3).toBe(new Date(2022, 8, 5, 8, 0, 0).getTime())
    const endTimeM4 = getUpdatedEndTimeByStepLength(stepLengthM, startTime, { value: new Date(2022, 8, 15, 10, 0, 0).getTime() })
    expect(endTimeM4).toBe(new Date(2022, 9, 5, 8, 0, 0).getTime())
    const endTimeM5 = getUpdatedEndTimeByStepLength(stepLengthM, startTime, { value: new Date(2022, 8, 8, 8, 0, 0).getTime() })
    expect(endTimeM5).toBe(new Date(2022, 9, 5, 8, 0, 0).getTime())

    const stepLengthM2 = { val: 2, unit: 'month' } as any
    const endTimeMultiM1 = getUpdatedEndTimeByStepLength(stepLengthM2, startTime, { value: new Date(2020, 9, 1, 8, 0, 0).getTime() })
    expect(endTimeMultiM1).toBe(new Date(2020, 9, 5, 8, 0, 0).getTime())
    const endTimeMultiM2 = getUpdatedEndTimeByStepLength(stepLengthM2, startTime, { value: new Date(2020, 9, 8, 8, 0, 0).getTime() })
    expect(endTimeMultiM2).toBe(new Date(2020, 11, 5, 8, 0, 0).getTime())
    const endTimeMultiM3 = getUpdatedEndTimeByStepLength(stepLengthM2, startTime, { value: new Date(2022, 9, 5, 8, 0, 0).getTime() })
    expect(endTimeMultiM3).toBe(new Date(2022, 9, 5, 8, 0, 0).getTime())
    const endTimeMultiM4 = getUpdatedEndTimeByStepLength(stepLengthM2, startTime, { value: new Date(2022, 9, 15, 10, 0, 0).getTime() })
    expect(endTimeMultiM4).toBe(new Date(2022, 11, 5, 8, 0, 0).getTime())
    const endTimeMultiM5 = getUpdatedEndTimeByStepLength(stepLengthM2, startTime, { value: new Date(2022, 8, 8, 8, 0, 0).getTime() })
    expect(endTimeMultiM5).toBe(new Date(2022, 9, 5, 8, 0, 0).getTime())

    // week
    // const stepLengthW1 = { val: 1, unit: 'week' } as any
    // const endTimeW1 = getUpdatedEndTimeByStepLength(stepLengthW1, startTime, { value: new Date(2020, 3, 15, 18, 0, 0).getTime() })
    // expect(endTimeW1).toBe(new Date(2020, 3, 19, 8, 0, 0).getTime())
    // const endTimeW2 = getUpdatedEndTimeByStepLength(stepLengthW1, startTime, { value: new Date(2020, 8, 8, 18, 0, 0).getTime() })
    // expect(endTimeW2).toBe(new Date(2020, 8, 13, 8, 0, 0).getTime())
    // const endTimeW3 = getUpdatedEndTimeByStepLength(stepLengthW1, startTime, { value: new Date(2021, 1, 5, 0, 0, 0).getTime() })
    // expect(endTimeW3).toBe(new Date(2021, 1, 7, 8, 0, 0).getTime())

    // const stepLengthW2 = { val: 2, unit: 'week' } as any
    // const endTimeMultiW1 = getUpdatedEndTimeByStepLength(stepLengthW2, startTime, { value: new Date(2020, 3, 15, 18, 0, 0).getTime() })
    // expect(endTimeMultiW1).toBe(new Date(2020, 3, 19, 8, 0, 0).getTime())
    // const endTimeMultiW2 = getUpdatedEndTimeByStepLength(stepLengthW2, startTime, { value: new Date(2020, 8, 8, 18, 0, 0).getTime() })
    // expect(endTimeMultiW2).toBe(new Date(2020, 8, 20, 8, 0, 0).getTime())
    // const endTimeMultiW3 = getUpdatedEndTimeByStepLength(stepLengthW2, startTime, { value: new Date(2021, 1, 5, 0, 0, 0).getTime() })
    // expect(endTimeMultiW3).toBe(new Date(2021, 1, 7, 8, 0, 0).getTime())

    // day
    const stepLengthD1 = { val: 1, unit: 'day' } as any
    const endTimeD1 = getUpdatedEndTimeByStepLength(stepLengthD1, startTime, { value: new Date(2020, 3, 6, 18, 0, 0).getTime() })
    expect(endTimeD1).toBe(new Date(2020, 3, 7, 8, 0, 0).getTime())
    const endTimeD2 = getUpdatedEndTimeByStepLength(stepLengthD1, startTime, { value: new Date(2020, 5, 2, 0, 0, 0).getTime() })
    expect(endTimeD2).toBe(new Date(2020, 5, 2, 8, 0, 0).getTime())
    const endTimeD3 = getUpdatedEndTimeByStepLength(stepLengthD1, startTime, { value: new Date(2021, 1, 4, 5, 0, 0).getTime() })
    expect(endTimeD3).toBe(new Date(2021, 1, 4, 8, 0, 0).getTime())
    const endTimeD4 = getUpdatedEndTimeByStepLength(stepLengthD1, startTime, { value: new Date(2021, 3, 5, 8, 0, 0).getTime() })
    expect(endTimeD4).toBe(new Date(2021, 3, 5, 8, 0, 0).getTime())
    const endTimeD5 = getUpdatedEndTimeByStepLength(stepLengthD1, startTime, { value: new Date(2023, 8, 15, 10, 0, 0).getTime() })
    expect(endTimeD5).toBe(new Date(2023, 8, 16, 8, 0, 0).getTime())

    const stepLengthD2 = { val: 7, unit: 'day' } as any
    const endTimeMultiD1 = getUpdatedEndTimeByStepLength(stepLengthD2, startTime, { value: new Date(2020, 3, 12, 3, 0, 0).getTime() })
    expect(endTimeMultiD1).toBe(new Date(2020, 3, 12, 8, 0, 0).getTime())
    const endTimeMultiD2 = getUpdatedEndTimeByStepLength(stepLengthD2, startTime, { value: new Date(2020, 3, 12, 8, 0, 0).getTime() })
    expect(endTimeMultiD2).toBe(new Date(2020, 3, 12, 8, 0, 0).getTime())
    const endTimeMultiD3 = getUpdatedEndTimeByStepLength(stepLengthD2, startTime, { value: new Date(2020, 5, 2, 0, 0, 0).getTime() })
    expect(endTimeMultiD3).toBe(new Date(2020, 5, 7, 8, 0, 0).getTime())
    const endTimeMultiD4 = getUpdatedEndTimeByStepLength(stepLengthD2, startTime, { value: new Date(2021, 3, 5, 8, 0, 0).getTime() })
    expect(endTimeMultiD4).toBe(new Date(2021, 3, 11, 8, 0, 0).getTime())
    const endTimeMultiD5 = getUpdatedEndTimeByStepLength(stepLengthD2, startTime, { value: new Date(2023, 8, 15, 10, 0, 0).getTime() })
    expect(endTimeMultiD5).toBe(new Date(2023, 8, 17, 8, 0, 0).getTime())

    // hour
    const stepLengthH1 = { val: 1, unit: 'hour' } as any
    const endTimeH1 = getUpdatedEndTimeByStepLength(stepLengthH1, startTime, { value: new Date(2020, 3, 5, 18, 30, 0).getTime() })
    expect(endTimeH1).toBe(new Date(2020, 3, 5, 19, 0, 0).getTime())
    const endTimeH2 = getUpdatedEndTimeByStepLength(stepLengthH1, startTime, { value: new Date(2020, 5, 2, 0, 0, 0).getTime() })
    expect(endTimeH2).toBe(new Date(2020, 5, 2, 0, 0, 0).getTime())
    const endTimeH3 = getUpdatedEndTimeByStepLength(stepLengthH1, startTime, { value: new Date(2021, 1, 4, 5, 10, 0).getTime() })
    expect(endTimeH3).toBe(new Date(2021, 1, 4, 6, 0, 0).getTime())
    const endTimeH4 = getUpdatedEndTimeByStepLength(stepLengthH1, startTime, { value: new Date(2021, 3, 5, 8, 0, 50).getTime() })
    expect(endTimeH4).toBe(new Date(2021, 3, 5, 9, 0, 0).getTime())
    const endTimeH5 = getUpdatedEndTimeByStepLength(stepLengthH1, startTime, { value: new Date(2023, 8, 15, 10, 10, 10).getTime() })
    expect(endTimeH5).toBe(new Date(2023, 8, 15, 11, 0, 0).getTime())

    const stepLengthH2 = { val: 8, unit: 'hour' } as any
    const endTimeMultiH1 = getUpdatedEndTimeByStepLength(stepLengthH2, startTime, { value: new Date(2020, 3, 12, 3, 0, 0).getTime() })
    expect(endTimeMultiH1).toBe(new Date(2020, 3, 12, 8, 0, 0).getTime())
    const endTimeMultiH2 = getUpdatedEndTimeByStepLength(stepLengthH2, startTime, { value: new Date(2020, 3, 12, 12, 0, 0).getTime() })
    expect(endTimeMultiH2).toBe(new Date(2020, 3, 12, 16, 0, 0).getTime())
    const endTimeMultiH3 = getUpdatedEndTimeByStepLength(stepLengthH2, startTime, { value: new Date(2020, 5, 2, 0, 0, 0).getTime() })
    expect(endTimeMultiH3).toBe(new Date(2020, 5, 2, 0, 0, 0).getTime())
    const endTimeMultiH4 = getUpdatedEndTimeByStepLength(stepLengthH2, startTime, { value: new Date(2021, 3, 5, 8, 0, 0).getTime() })
    expect(endTimeMultiH4).toBe(new Date(2021, 3, 5, 8, 0, 0).getTime())
    const endTimeMultiH5 = getUpdatedEndTimeByStepLength(stepLengthH2, startTime, { value: new Date(2023, 8, 15, 10, 0, 0).getTime() })
    expect(endTimeMultiH5).toBe(new Date(2023, 8, 15, 16, 0, 0).getTime())

    // minute
    const stepLengthm1 = { val: 1, unit: 'minute' } as any
    const endTimem1 = getUpdatedEndTimeByStepLength(stepLengthm1, startTime, { value: new Date(2020, 3, 5, 8, 30, 0).getTime() })
    expect(endTimem1).toBe(new Date(2020, 3, 5, 8, 30, 0).getTime())
    const endTimem2 = getUpdatedEndTimeByStepLength(stepLengthm1, startTime, { value: new Date(2020, 5, 2, 0, 0, 10).getTime() })
    expect(endTimem2).toBe(new Date(2020, 5, 2, 0, 1, 0).getTime())
    const endTimem3 = getUpdatedEndTimeByStepLength(stepLengthm1, startTime, { value: new Date(2021, 1, 4, 5, 10, 0).getTime() })
    expect(endTimem3).toBe(new Date(2021, 1, 4, 5, 10, 0).getTime())
    const endTimem4 = getUpdatedEndTimeByStepLength(stepLengthm1, startTime, { value: new Date(2023, 3, 5, 8, 0, 50).getTime() })
    expect(endTimem4).toBe(new Date(2023, 3, 5, 8, 1, 0).getTime())

    const stepLengthm2 = { val: 10, unit: 'minute' } as any
    const endTimeMultim1 = getUpdatedEndTimeByStepLength(stepLengthm2, startTime, { value: new Date(2020, 3, 5, 8, 30, 0).getTime() })
    expect(endTimeMultim1).toBe(new Date(2020, 3, 5, 8, 30, 0).getTime())
    const endTimeMultim2 = getUpdatedEndTimeByStepLength(stepLengthm2, startTime, { value: new Date(2020, 3, 12, 12, 0, 45).getTime() })
    expect(endTimeMultim2).toBe(new Date(2020, 3, 12, 12, 10, 0).getTime())
    const endTimeMultim3 = getUpdatedEndTimeByStepLength(stepLengthm2, startTime, { value: new Date(2021, 5, 2, 10, 10, 50).getTime() })
    expect(endTimeMultim3).toBe(new Date(2021, 5, 2, 10, 20, 0).getTime())
    const endTimeMultim4 = getUpdatedEndTimeByStepLength(stepLengthm2, startTime, { value: new Date(2023, 3, 5, 8, 9, 10).getTime() })
    expect(endTimeMultim4).toBe(new Date(2023, 3, 5, 8, 10, 0).getTime())
  })
})
