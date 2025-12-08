import {
  formatNumberToLocale,
  MaximumSignificantDigits
} from '@arcgis/analysis-shared-utils'

export const LinearUnitsResultsReverseLookup: { [key: string]: string } = {
  meters: 'esriMeters',
  feet: 'esriFeet',
  kilometers: 'esriKilometers',
  miles: 'esriMiles',
  'nautical-miles': 'esriNauticalMiles',
  yards: 'esriYards',
  acres: 'esriAcres',
  hectares: 'esriHectares',
  inches: 'esriInches',
  points: 'esriPoints'
}

export const StandardUnits = {
  acres: 'acre',
  hectares: 'hectare',
  miles: 'mile',
  kilometers: 'kilometer',
  meters: 'meter',
  yards: 'yard',
  feet: 'foot',
  inches: 'inch',
  esrikilometers: 'kilometer',
  esrimeters: 'meter',
  esrimillimeters: 'millimeter',
  millimeters: 'millimeter',
  centimeters: 'centimeter',
  esricentimeters: 'centimeter',
  esriacres: 'acre',
  esrihectares: 'hectare'
}

/**
 * A list of units that cannot be translated.
 * Will be displayed, only intended to be displayed in english
 */
export const EsriOnlyUnits = {
  esrifeet: {
    singular: 'US Survey Foot',
    plural: 'US Survey Feet'
  },
  esriinches: {
    singular: 'US Survey Inch',
    plural: 'US Survey Inches'
  },
  esriintfeet: {
    singular: 'International Foot',
    plural: 'International Feet'
  },
  esriintinches: {
    singular: 'International Inch',
    plural: 'International Inches'
  },
  esriintmiles: {
    singular: 'International Mile',
    plural: 'International Miles'
  },
  esriintnauticalmiles: {
    singular: 'International Nautical Mile',
    plural: 'International Nautical Miles'
  },
  esriintyards: {
    singular: 'International Yard',
    plural: 'International Yards'
  },
  esrinauticalmiles: {
    singular: 'US Survey Nautical Mile',
    plural: 'US Survey Nautical Miles'
  },
  esripoints: {
    singular: 'International Point',
    plural: 'International Points'
  },
  esriunknownunits: {
    singular: 'Unknown',
    plural: 'Unknown'
  },
  unknown: {
    singular: 'Unknown',
    plural: 'Unknown'
  },
  esriyards: {
    singular: 'US Survey yard',
    plural: 'US Survey yards'
  },
  esridecimeters: {
    singular: 'Decimeter',
    plural: 'Decimeters'
  },
  decimeters: {
    singular: 'Decimeter',
    plural: 'Decimeters'
  },
  esridecimaldegrees: {
    singular: 'Decimal Degree',
    plural: 'Decimal Degrees'
  },
  esrimiles: {
    singular: 'US Survey mile',
    plural: 'US Survey miles'
  },
  esriunknownareaunits: {
    singular: 'Unknown',
    plural: 'Unknown'
  },
  esrisquareinches: {
    singular: 'Square International Inch',
    plural: 'Square International Inches'
  },
  esrisquarefeet: {
    singular: 'Square International Foot',
    plural: 'Square International Feet'
  },
  esrisquareyards: {
    singular: 'Square International Yard',
    plural: 'Square International Yards'
  },
  esrisquaremiles: {
    singular: 'Square Statute Mile',
    plural: 'Square Statute Miles'
  },
  esrisquaremillimeters: {
    singular: 'Square Millimeter',
    plural: 'Square Millimeters'
  },
  esrisquarecentimeters: {
    singular: 'Square Centimeter',
    plural: 'Square Centimeters'
  },
  esrisquaredecimeters: {
    singular: 'Square Decimeter',
    plural: 'Square Decimeters'
  },
  esrisquaremeters: {
    singular: 'Square Meter',
    plural: 'Square Meters'
  },
  esriares: {
    singular: 'Are',
    plural: 'Ares'
  },
  esrisquarekilometers: {
    singular: 'Square Kilometer',
    plural: 'Square Kilometers'
  },
  esrisquareinchesus: {
    singular: 'Square US Survey Inch',
    plural: 'Square US Survey Inches'
  },
  esrisquarefeetus: {
    singular: 'Square US Survey Foot',
    plural: 'Square US Survey Feet'
  },
  esrisquareyardsus: {
    singular: 'Square US Survey Yard',
    plural: 'Square US Survey Yards'
  },
  esriacresus: {
    singular: 'US Survey Acre',
    plural: 'US Survey Acres'
  },
  esrisquaremilesus: {
    singular: 'Square US Survey Mile',
    plural: 'Square US Survey Miles'
  }
}

/**
 * Takes in the raw values for a linear unit and returns a displayable string with its proper formatting
 * @param {number} value
 * @param {string} units
 * @returns {string} the formatted and translated linear unit value
 */
export function formatAnalysisUnitValue (value: number | undefined | null, units: string | undefined | null) {
  let formattedValue = ''
  if (value !== undefined && units !== undefined && value !== null && units !== null) {
    // JSAPI units for results will be kebab cased, so we should unkebab them here
    // edge case for ares, which is a square unit in JSAPI
    if (units.includes('-') || units === 'ares') {
      // GP Server units will never have a hyphen in them, so we can assume this is a JSAPI unit
      // Additionally, and ONLY for square units (JSAPI units), the word international is never included in the unit.
      // So we can safely remove it here. e.g. `square-inches-international` -> `esriSquareInches`
      const splitUnits = units
        .split('-')
        .filter(word => word.toLowerCase() !== 'international')
      // unfortunately JSAPI moves the "us" to the middle of the word instead of at the end like the server unit
      // so we have to reconfigure it here.
      const isUS = splitUnits.includes('us')
      const unitsString = splitUnits
        .filter(word => word.toLowerCase() !== 'us')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join('')
      units = `esri${unitsString}${isUS ? 'US' : ''}`
    }
    const lowercaseUnits = units.toLowerCase() as keyof typeof StandardUnits & keyof typeof EsriOnlyUnits
    if (StandardUnits[lowercaseUnits] !== undefined) {
      formattedValue = formatNumberToLocale(value, {
        style: 'unit',
        unitDisplay: 'long',
        maximumSignificantDigits: MaximumSignificantDigits,
        unit: StandardUnits[lowercaseUnits]
      })
    } else {
      let formattedUnits = units
      if (EsriOnlyUnits[lowercaseUnits] !== undefined) {
        formattedUnits =
          value === 1
            ? EsriOnlyUnits[<keyof typeof EsriOnlyUnits>lowercaseUnits].singular
            : EsriOnlyUnits[<keyof typeof EsriOnlyUnits>lowercaseUnits].plural
      }
      formattedValue = `${formatNumberToLocale(value, {
        maximumSignificantDigits: MaximumSignificantDigits
      })} ${formattedUnits}`
    }
  }
  return formattedValue
}
