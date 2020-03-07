import moment, { Moment } from "moment";
export class Player {
  currentPosition: string;
  playerId: string;
  currentlyPlaying: boolean;
  lastPlayerMove: number;
  constructor(
    startPosition: string,
    playerId?: string,
    playing?: boolean,
    lastPlayerMove?: number
  ) {
    this.currentPosition = startPosition;
    this.playerId = "";
    this.currentlyPlaying = false;
    this.lastPlayerMove = moment().unix();
    if (playerId) {
      this.playerId = playerId;
    }
    if (playing) {
      this.currentlyPlaying = true;
    }
    if (lastPlayerMove) {
      this.lastPlayerMove = lastPlayerMove;
    }
  }

  public getCurrentPosition() {
    return this.currentPosition;
  }

  public getLastMoveTimeSeconds(): number {
    return this.lastPlayerMove;
  }

  public getIfUsing() {
    return this.currentlyPlaying;
  }

  public getPLayerId() {
    return this.playerId;
  }

  public updateCurrenltyUsing(using: boolean) {
    this.currentlyPlaying = using;
  }

  public updatePosition(newX: number, newY: number) {
    let updatedX: number = Number(this.currentPosition.split(",")[0]) + newX;
    let updatedY: number = Number(this.currentPosition.split(",")[1]) + newY;
    this.currentPosition = `${updatedX},${updatedY}`;
  }

  public uppdatePLayerId(newPlayerId: string) {
    this.playerId = newPlayerId;
  }
}
