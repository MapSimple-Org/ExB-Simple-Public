import type { LineStyle } from '../config'
const STROKE_SIZE = '3px'
const STROKE_SIZE2 = '6px'
const STROKE_SIZE3 = '8px'
type DefaultStrokeSize = {
  [key in LineStyle]: string
}
export function getAllDefaultStrokeSize (): DefaultStrokeSize {
  return {
    Style0: STROKE_SIZE,
    Style1: STROKE_SIZE,
    Style2: STROKE_SIZE,
    Style3: STROKE_SIZE,
    Style4: STROKE_SIZE,
    Style5: STROKE_SIZE,
    Style6: STROKE_SIZE,
    Style7: STROKE_SIZE2,
    Style8: STROKE_SIZE2,
    Style9: STROKE_SIZE2,
    Style10: STROKE_SIZE3
  }
}

export function getAllDefaultStrokeColors (themeMode: 'light' | 'dark') {
  const AllDefaultStrokeColors = {
    dark: {
      Default: '#C6C6C6',
      Style1: '#FF8A7B',
      Style2: '#E99A29',
      Style3: '#C6C6C6',
      Style4: '#C6C6C6',
      Style5: '#5EB2F1',
      Style6: '#6FBC76',
      Style7: '#C6C6C6',
      Style18: '#C6C6C6',
      Style19: '#5EB2F1',
      Style8: '#C6C6C6',
      Style9: '#E99A29',
      Style10: '#FF8A7B',
      Style11: '#C6C6C6',
      Style12: '#C6C6C6',
      Style13: '#6FBC76',
      Style14: '#5EB2F1',
      Style15: '#C6C6C6',
      Style16: '#C6C6C6',
      Style17: '#FF8A7B'
    },
    light: {
      Default: '#303030',
      Style1: '#B4271F',
      Style2: '#865300',
      Style3: '#303030',
      Style4: '#303030',
      Style5: '#006496',
      Style6: '#00531D',
      Style7: '#303030',
      Style18: '#303030',
      Style19: '#006496',
      Style8: '#303030',
      Style9: '#865300',
      Style10: '#B4271F',
      Style11: '#303030',
      Style12: '#303030',
      Style13: '#00531D',
      Style14: '#006496',
      Style15: '#303030',
      Style16: '#303030',
      Style17: '#B4271F'
    }
  }
  return themeMode === 'dark' ? AllDefaultStrokeColors.dark : AllDefaultStrokeColors.light
}