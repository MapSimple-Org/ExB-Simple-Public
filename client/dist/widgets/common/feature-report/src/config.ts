import type { ImmutableObject } from 'jimu-core'

export interface Config {
  surveyItemId?: string
  hides?: string[]
  useDataSources?: any
  mergeFiles?: string
  reportTemplateIds?: string[]
  reportName?: string
  outputFormat?: string
  inputFeatureTemplate?: string

  // labels
  inputFeaturesLabel?: string
  selectTemplateLabel?: string
  reportSettingLabel?: string
  showCreditsLabel?: string
  generateReportLabel?: string
  recentReportsLabel?: string
  fileOptionsLabel?: string
  reportNameLabel?: string
  saveToAGSAccountLabel?: string
  outputFormatLabel?: string

  dsType?: string
  timestamp?: number
}

export type IMConfig = ImmutableObject<Config>
