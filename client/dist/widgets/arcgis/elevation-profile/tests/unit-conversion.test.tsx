import { convertSingle } from '../src/common/unit-conversion'

describe('Validate the distance and elevation values for ground elevation and profile line are converted according to', () => {
  it('The values and units from the elevation service should convert properly', function () {
    const convertMetersToKm = convertSingle(10, 'meters', 'kilometers')
    expect(convertMetersToKm).toEqual(0.01)

    const convertMetersToFeet = convertSingle(10, 'meters', 'feet')
    expect(convertMetersToFeet).toEqual(32.80839895013123)

    const convertMetersToMiles = convertSingle(10, 'meters', 'miles')
    expect(convertMetersToMiles).toEqual(0.006213711922373339)

    const convertMetersToYards = convertSingle(10, 'meters', 'yards')
    expect(convertMetersToYards).toEqual(10.936132983377078)

    const convertFeetToMeters = convertSingle(10, 'feet', 'meters')
    expect(convertFeetToMeters).toEqual(3.0480000000000005)

    const convertFeetToMiles = convertSingle(10, 'feet', 'miles')
    expect(convertFeetToMiles).toEqual(0.001893939393939394)

    const convertFeetToKm = convertSingle(10, 'feet', 'kilometers')
    expect(convertFeetToKm).toEqual(0.0030480000000000004)

    const convertFeetToYards = convertSingle(10, 'feet', 'yards')
    expect(convertFeetToYards).toEqual(3.333333333333334)

    const convertKmToMeters = convertSingle(10, 'kilometers', 'meters')
    expect(convertKmToMeters).toEqual(10000)

    const convertKmToFeet = convertSingle(10, 'kilometers', 'feet')
    expect(convertKmToFeet).toEqual(32808.39895013123)

    const convertKmToMiles = convertSingle(10, 'kilometers', 'miles')
    expect(convertKmToMiles).toEqual(6.2137119223733395)

    const convertKmToYards = convertSingle(10, 'kilometers', 'miles')
    expect(convertKmToYards).toEqual(6.2137119223733395)

    const convertMilesToFeet = convertSingle(10, 'miles', 'feet')
    expect(convertMilesToFeet).toEqual(52799.99999999999)

    const convertMilesToYards = convertSingle(10, 'miles', 'yards')
    expect(convertMilesToYards).toEqual(17600)

    const convertMilesToKm = convertSingle(10, 'miles', 'kilometers')
    expect(convertMilesToKm).toEqual(16.09344)

    const convertMilesToMeters = convertSingle(10, 'miles', 'meters')
    expect(convertMilesToMeters).toEqual(16093.44)

    const convertYardsToMiles = convertSingle(10, 'yards', 'miles')
    expect(convertYardsToMiles).toEqual(0.005681818181818181)

    const convertYardsToFeet = convertSingle(10, 'yards', 'feet')
    expect(convertYardsToFeet).toEqual(29.999999999999996)

    const convertYardsToMeters = convertSingle(10, 'yards', 'meters')
    expect(convertYardsToMeters).toEqual(9.144)

    const convertYardsToKm = convertSingle(10, 'yards', 'kilometers')
    expect(convertYardsToKm).toEqual(0.009144000000000001)
  })
})
