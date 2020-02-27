export class Player {
  currentPosition: string;
  playerId: string;
  constructor(startPosition: string, playerId: string) {
    this.currentPosition = startPosition;
    this.playerId = playerId;
  }

  getCurrentPosition() {
    return this.currentPosition;
  }
  public updatePosition(newX: number, newY: number) {
    let updatedX: number = Number(this.currentPosition.split(",")[0]) + newX;
    let updatedY: number = Number(this.currentPosition.split(",")[1]) + newY;
    this.currentPosition = `${updatedX},${updatedY}`;
  }
}
