// Todo: unnecessary amount of work but can be used to replace basic ball playerImage: url
export interface player {
  playerName: string;
  color: string;
  currentPosition: GeoPoint;
}

// Limit lat and long to -90 and 90 respectivly
export interface GeoPoint {
  latitude: number;
  longitude: number;
}
