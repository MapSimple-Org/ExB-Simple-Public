import { Immutable, type ImmutableArray, type ImmutableObject } from 'jimu-core'
import type { WebChartGuide } from 'jimu-ui/advanced/chart'

const getGuideId = (names: ImmutableArray<string> = Immutable([])): number => {
  const reg = /^guide\_(\d+)$/
  let max = -1
  names.forEach(id => {
    const match = id.match(reg)
    if (match) {
      max = Math.max(max, parseInt(match[1], 10))
    }
  })
  if (max === -1) {
    max = (names?.length ?? 0)
  }
  return max + 1
}

export const getGuideName = (guides: ImmutableArray<WebChartGuide>) => {
  const names = guides?.map(guide => guide.name)
  const id = getGuideId(names)
  const name = `guide_${id}`
  return name
}

const isValidGuide = (guide: ImmutableObject<WebChartGuide>): boolean => {
  return typeof guide?.start === 'number' && !Number.isNaN(guide?.start)
}

export const getValidGuides = (guides: ImmutableArray<WebChartGuide>): ImmutableArray<WebChartGuide> => {
  return guides.filter(isValidGuide)
}

export const parseNumber = (value: string) => {
  if (value === '' || value == null) return undefined
  const number = +value
  return Number.isNaN(number) ? undefined : number
}
