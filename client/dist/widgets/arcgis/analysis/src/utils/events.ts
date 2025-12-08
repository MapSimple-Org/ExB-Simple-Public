import type { AnalysisGPJobStatus, AnalysisJobResults } from '@arcgis/analysis-shared-utils'
import type { AnalysisGPJobSubmitted } from '../config'

export enum AnalysisCoreEvents {
  ResultDataComplete = 'analysisCoreResultDataComplete',
  JobStatus = 'analysisCoreJobStatus',
  JobSubmited = 'analysisCoreJobSubmited'
}

/**
 * Generates the `CustomEventInit` dictionary for [CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent)
 * @param eventPayload
 */
function generateEventInit<T> (eventPayload?: T): CustomEventInit<T> {
  return {
    detail: eventPayload,
    composed: true,
    cancelable: true,
    bubbles: true
  }
}

/**
 * Sending an event carrying results from analysis after successful job execution.
 * @param htmlContainer
 * @param data
 */
export function notifyResultData (htmlContainer: HTMLElement, data?: AnalysisJobResults): void {
  htmlContainer.dispatchEvent(new window.CustomEvent(AnalysisCoreEvents.ResultDataComplete, generateEventInit(data)))
}

/**
 * Sending an event carrying job status information from job run.
 * @param htmlContainer
 * @param data
 */
export function notifyJobStatus (htmlContainer: HTMLElement, data?: AnalysisGPJobStatus): void {
  htmlContainer.dispatchEvent(new window.CustomEvent(AnalysisCoreEvents.JobStatus, generateEventInit(data)))
}

/**
 * Sending an event carrying job status information from job run.
 * @param htmlContainer
 * @param data
 */
export function notifyJobSubmited (htmlContainer: HTMLElement, data?: AnalysisGPJobSubmitted): void {
  htmlContainer.dispatchEvent(new window.CustomEvent(AnalysisCoreEvents.JobSubmited, generateEventInit(data)))
}
