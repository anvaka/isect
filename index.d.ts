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

export default function isect(segments: Array<Segment>, options: ISectOptions) : ISectResults;