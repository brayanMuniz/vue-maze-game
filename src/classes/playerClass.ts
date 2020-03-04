export class Player {
  currentPosition: string;
  playerId: string;
  currentlyPlaying: boolean;
  constructor(startPosition: string, playerId?: string, playing?: boolean) {
    this.currentPosition = startPosition;
    this.playerId = "";
    this.currentlyPlaying = false;
    if (playerId) {
      this.playerId = playerId;
    }
    if (playing) {
      this.currentlyPlaying = true;
    }
  }

  getCurrentPosition() {
    return this.currentPosition;
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
