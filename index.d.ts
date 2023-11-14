export type Point = {
  x: number,
  y: number
}

export type Segment = {
  from: Point,
  to: Point
}

export type ISectResults = {
  run: Function,
  step: Function
}

export type ISectOptions = {
}

export function bush(segments: Array<Segment>, options: ISectOptions) : ISectResults;
export function sweep(segments: Array<Segment>, options: ISectOptions) : ISectResults;
export function brute(segments: Array<Segment>, options: ISectOptions) : ISectResults;