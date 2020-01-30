import { GeoPoint } from "./playerType";

export interface maze {
  startPosition: GeoPoint;
  endPosition: GeoPoint;
  mazeMap: Array<Array<simplePoint>>;
}

export interface simplePoint {
  [key: string]: boolean;
}
