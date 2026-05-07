/**
 * Widget version number.
 * Base version matches Experience Builder version (1.19.0).
 * Release number increments on major changes (001, 002, 003, ...).
 * Minor version increments on smaller fixes between major releases (r015.1, r015.2, ...).
 * 
 * To increment:
 * - Major change: Update RELEASE_NUMBER (e.g., 015 -> 016) and reset MINOR_VERSION to 0
 * - Minor fix: Increment MINOR_VERSION (e.g., 1 -> 2) while keeping same RELEASE_NUMBER
 */
const BASE_VERSION = '1.20.0'
const RELEASE_NUMBER = '027' // Increment on major changes (001, 002, 003, ...)
const MINOR_VERSION = '099' // r027.099 Fix: Table widget enum casing — selectMode, dataActionType, DS type all uppercased to match ExB 1.20 enums.

export const WIDGET_VERSION = MINOR_VERSION && Number(MINOR_VERSION) > 0
  ? `${BASE_VERSION}-r${RELEASE_NUMBER}.${MINOR_VERSION}`
  : `${BASE_VERSION}-r${RELEASE_NUMBER}`

