import moment, { Moment } from "moment";
export class Player {
  currentPosition: string;
  playerId: string;
  currentlyPlaying: boolean;
  lastMoveTime: number;
  constructor(
    startPosition: string,
    playerId?: string,
    playing?: boolean,
    lastPlayerMove?: number
  ) {
    this.currentPosition = startPosition;
    this.playerId = "";
    this.currentlyPlaying = false;
    this.lastMoveTime = moment().unix();
    console.log(startPosition, playerId, playing, lastPlayerMove);
    if (playerId != undefined) {
      this.playerId = playerId;
    }
    if (playing != undefined) {
      this.currentlyPlaying = true;
    }
    if (lastPlayerMove != undefined) {
      this.lastMoveTime = lastPlayerMove;
    }
  }

  public getCurrentPosition() {
    return this.currentPosition;
  }

  public getLastMoveTimeSeconds(): number {
    return this.lastMoveTime;
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
