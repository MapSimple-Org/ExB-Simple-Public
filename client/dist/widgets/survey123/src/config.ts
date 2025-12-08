import type { ImmutableObject } from 'jimu-core'

export interface Config {
  surveyItemId: string
  portalUrl: string
  defaultValue: {
    [key: string]: any
  }
  open: string
  layerViewInfo
  // isEmbed: boolean;
  // isHideNavbar?: boolean;
  // isFullScreen?: boolean;
  hides?: string[]
  mode?: string
  selectionChangeBehavior?: string
  embeds?: string[]
  activeLinkData: boolean
  selectedSurvey: any
  selectedSurveyQuestionFields?: string[]
  fieldQuestionMapping: any[]
  useDataSources?: any
  triggerEventType: string

  dsType?: string
  timestamp?: number
}

export type IMConfig = ImmutableObject<Config>
