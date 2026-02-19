/**
 * Flat Popup Styles - r024.46
 * 
 * CSS-in-JS styles that provide layout for flattened Calcite components.
 * When shadow DOMs are flattened and calcite-* tags are renamed to divs,
 * these styles ensure the content maintains its basic layout and appearance.
 * 
 * This is a "CSS Bridge" that mimics Calcite's layout without relying on
 * the shadow DOM or web component internals.
 */

import { css } from 'jimu-core'

/**
 * Core styles for flattened popup content.
 * Applied to the container that displays pre-rendered HTML.
 */
export const flatPopupStyles = css`
  /* Container reset */
  font-family: var(--calcite-sans-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif);
  font-size: 0.875rem;
  line-height: 1.5;
  color: var(--calcite-ui-text-1, #323232);
  
  /* Icon styles - captures SVGs from calcite-icon shadow DOM */
  .f-flat-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    vertical-align: middle;
  }
  
  .f-flat-icon svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }
  
  /* Action button styles */
  .f-flat-action {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: var(--calcite-ui-text-3, #6a6a6a);
  }
  
  .f-flat-action:hover {
    background-color: var(--calcite-ui-foreground-2, #f3f3f3);
  }
  
  /* Action bar - horizontal group of actions */
  .f-flat-action-bar {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 4px;
    padding: 4px;
    background: var(--calcite-ui-foreground-1, #fff);
  }
  
  .f-flat-action-group {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  
  /* List styles */
  .f-flat-list {
    display: flex;
    flex-direction: column;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .f-flat-list-item {
    display: flex;
    flex-direction: column;
    padding: 8px 12px;
    border-bottom: 1px solid var(--calcite-ui-border-1, #e0e0e0);
  }
  
  .f-flat-list-item:last-child {
    border-bottom: none;
  }
  
  .f-flat-list-item-group {
    display: flex;
    flex-direction: column;
  }
  
  /* Value list (key-value pairs) */
  .f-flat-value-list {
    display: flex;
    flex-direction: column;
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .f-flat-value-list-item {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 4px 0;
    gap: 8px;
  }
  
  /* Link styles */
  .f-flat-link {
    color: var(--calcite-ui-brand, #007ac2);
    text-decoration: none;
    cursor: pointer;
  }
  
  .f-flat-link:hover {
    text-decoration: underline;
    color: var(--calcite-ui-brand-hover, #00619b);
  }
  
  /* Button styles */
  .f-flat-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 16px;
    background: var(--calcite-ui-brand, #007ac2);
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    line-height: 1.5;
    gap: 8px;
  }
  
  .f-flat-button:hover {
    background: var(--calcite-ui-brand-hover, #00619b);
  }
  
  /* Panel styles */
  .f-flat-panel {
    display: flex;
    flex-direction: column;
    background: var(--calcite-ui-foreground-1, #fff);
    border: 1px solid var(--calcite-ui-border-1, #e0e0e0);
    border-radius: 4px;
    overflow: hidden;
  }
  
  /* Block styles */
  .f-flat-block {
    display: flex;
    flex-direction: column;
    padding: 12px;
    border-bottom: 1px solid var(--calcite-ui-border-1, #e0e0e0);
  }
  
  .f-flat-block:last-child {
    border-bottom: none;
  }
  
  /* Card styles */
  .f-flat-card {
    display: flex;
    flex-direction: column;
    background: var(--calcite-ui-foreground-1, #fff);
    border: 1px solid var(--calcite-ui-border-1, #e0e0e0);
    border-radius: 4px;
    padding: 12px;
  }
  
  /* Chip styles */
  .f-flat-chip {
    display: inline-flex;
    align-items: center;
    padding: 4px 8px;
    background: var(--calcite-ui-foreground-2, #f3f3f3);
    border-radius: 16px;
    font-size: 0.75rem;
    gap: 4px;
  }
  
  /* Label styles */
  .f-flat-label {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-weight: 500;
  }
  
  /* Notice styles */
  .f-flat-notice {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    padding: 12px;
    background: var(--calcite-ui-foreground-2, #f3f3f3);
    border-left: 4px solid var(--calcite-ui-info, #00619b);
    gap: 12px;
  }
  
  /* Loader styles - show as simple spinner placeholder */
  .f-flat-loader {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    color: var(--calcite-ui-brand, #007ac2);
  }
  
  /* ============================================
   * ESRI Feature Widget Content Styles
   * These target common structures from popup templates
   * ============================================ */
  
  /* Popup title */
  .esri-feature__title,
  .esri-widget__heading {
    font-size: 0.875rem;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: var(--calcite-ui-text-1, #323232);
  }
  
  /* Popup text content */
  .esri-feature__text {
    margin: 0 0 8px 0;
  }
  
  /* Popup fields table */
  .esri-feature__fields {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 8px 0;
  }
  
  .esri-feature__field-header {
    font-weight: 500;
    text-align: left;
    padding: 4px 8px 4px 0;
    color: var(--calcite-ui-text-2, #4a4a4a);
    vertical-align: top;
    white-space: nowrap;
  }
  
  .esri-feature__field-data {
    padding: 4px 0;
    color: var(--calcite-ui-text-1, #323232);
    vertical-align: top;
    word-break: break-word;
  }
  
  /* Popup media (images, charts) */
  .esri-feature__media {
    margin: 8px 0;
  }
  
  .esri-feature__media img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
  }
  
  /* Popup attachments */
  .esri-feature__attachments {
    margin: 8px 0;
  }
  
  .esri-feature__attachments-title {
    font-weight: 500;
    margin-bottom: 4px;
  }
  
  .esri-feature__attachments-items {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  
  /* Arcade expression results */
  .esri-feature__content-element {
    padding: 0;
    margin: 4px 0;
  }
  
  /* Ensure tables don't overflow */
  table {
    max-width: 100%;
    overflow-x: auto;
  }
  
  /* Ensure images are responsive */
  img {
    max-width: 100%;
    height: auto;
  }
  
  /* Links in popup content */
  a {
    color: var(--calcite-ui-brand, #007ac2);
    text-decoration: none;
  }
  
  a:hover {
    text-decoration: underline;
  }
`

/**
 * Loading state styles - shown while popup is being rendered
 */
export const flatPopupLoadingStyles = css`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  color: var(--calcite-ui-text-3, #6a6a6a);
  font-style: italic;
`

/**
 * Error state styles - shown if popup rendering fails
 */
export const flatPopupErrorStyles = css`
  padding: 8px 12px;
  background: var(--calcite-ui-danger-press, #ffe6e6);
  border-left: 4px solid var(--calcite-ui-danger, #d83020);
  color: var(--calcite-ui-text-1, #323232);
  font-size: 0.875rem;
`
