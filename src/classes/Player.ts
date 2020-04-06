import moment from "moment";
// AccountId is based on the authentication, docId is the randomly generated id for the collection
export class Player {
  currentPosition: string;
  accountId: string;
  documentId: string;
  lastMoveTime: number;
  playerName?: string;
  constructor(
    startPosition: string,
    documentId?: string,
    lastPlayerMove?: number,
    accountId?: string,
    playerName?: string
  ) {
    this.currentPosition = startPosition;
    this.accountId = "";
    this.documentId = "";
    if (documentId != undefined) {
      this.documentId = documentId;
    }
    this.lastMoveTime = moment().unix();
    if (accountId != undefined) {
      this.accountId = accountId;
    }
    if (lastPlayerMove != undefined) {
      this.lastMoveTime = lastPlayerMove;
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

  public getLastMoveTimeSeconds(): number {
    return this.lastMoveTime;
  }

  public getAccountId() {
    return this.accountId;
  }

  public getDocumentId() {
    return this.documentId;
  }

  public getPlayerName() {
    return this.playerName;
  }

  public replacePostion(x: number, y: number) {
    this.currentPosition = `${x},${y}`;
  }

  public updatePosition(newX: number, newY: number) {
    let updatedX: number = Number(this.currentPosition.split(",")[0]) + newX;
    let updatedY: number = Number(this.currentPosition.split(",")[1]) + newY;
    this.currentPosition = `${updatedX},${updatedY}`;
  }

  public updateDocId(newDocId: string) {
    this.documentId = newDocId;
  }

  public uppdatePLayerId(newAccountId: string) {
    this.accountId = newAccountId;
  }
}
