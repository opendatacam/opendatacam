import { COUNTER_COLORS } from '../config.json';

// TODO memoize this for performance
export function evaluateCSSVariable(color) {
  return window.getComputedStyle(document.body).getPropertyValue(color.match(/\((.*?)\)/)[1]);
}

export function getColor(colorLabel) {
  let color = COUNTER_COLORS[colorLabel];
  if(color) {
    return color;
  } else {
    // Maybe if colors have been modified and old recording are in DB, we need to render a default color
    return "#000";
  }
}