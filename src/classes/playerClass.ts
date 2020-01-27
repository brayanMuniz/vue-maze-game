import { GeoPoint } from "@/types/playerType";
import { maze } from "@/types/mazeType";

export class Player {
  playerName: string;
  currentPosition: GeoPoint;
  constructor(startPosition: GeoPoint, playerName?: string) {
    if (playerName) {
      this.playerName = playerName;
    } else {
      this.playerName = "";
    }
    if (startPosition) {
      this.currentPosition = startPosition;
    } else {
      this.currentPosition = {
        latitude: 0,
        longitude: 0
      };
    }
  }

  getCurrentPosition() {
    return this.currentPosition;
  }

  getMapData(maze: maze): maze {
    return maze;
  }

  updatePosition(horizontal: number, veritcal: number, maze: maze): GeoPoint {
    if (this.isMoveValid(horizontal, veritcal)) {
      return this.currentPosition;
    }
    let newVPoint = this.currentPosition["latitude"] + veritcal;
    let newHPoint = this.currentPosition["longitude"] + horizontal;
    if (maze["mazeMap"][newHPoint][newVPoint]) {
      this.currentPosition.latitude = newVPoint;
      this.currentPosition.longitude = newHPoint;
      return this.currentPosition;
    } else {
      return this.currentPosition;
    }
  }

  isMoveValid(horizontal: number, veritcal: number): Boolean {
    if (this.currentPosition.longitude == 0 && horizontal == -1) {
      console.log("outOfBounds");
      return false;
    } else if (this.currentPosition.latitude == 0 && veritcal == 1) {
      console.log("outOfBounds");
      return false;
    }
    return true;
  }
}
