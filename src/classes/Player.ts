export class Player {
  currentPosition: string;
  accountId: string;
  wonGame: boolean;
  playerName?: string;
  constructor(startPosition: string, wonGame: boolean, accountId?: string, playerName?: string) {
    this.currentPosition = startPosition;
    this.wonGame = wonGame;
    this.accountId = "";
    if (accountId != undefined) {
      this.accountId = accountId;
    }
    if (playerName != undefined) {
      this.playerName = playerName;
    }
  }

  public getCurrentPosition() {
    return this.currentPosition;
  }

  public checkForChangeInName(newName: string) {
    let changeName: boolean = false;
    if (newName != this.playerName) {
      changeName = true;
    }
    return changeName;
  }
  public updateName(newName: string) {
    this.playerName = newName;
  }

  public getAccountId() {
    return this.accountId;
  }

  public getPlayerName(): String | "" {
    if (this.playerName) return this.playerName;
    else return "";
  }

  public replacePostion(x: number, y: number) {
    this.currentPosition = `${x},${y}`;
  }

  public updatePosition(newX: number, newY: number) {
    let updatedX: number = Number(this.currentPosition.split(",")[0]) + newX;
    let updatedY: number = Number(this.currentPosition.split(",")[1]) + newY;
    this.currentPosition = `${updatedX},${updatedY}`;
  }

  public uppdatePlayerId(newAccountId: string) {
    this.accountId = newAccountId;
  }
}
