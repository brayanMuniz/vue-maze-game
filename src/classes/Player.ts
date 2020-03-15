import moment from "moment";
// AccountId is based on the authentication, docId is the randomly generated id for the collection
export class Player {
  currentPosition: string;
  accountId: string;
  documentId: string;
  lastMoveTime: number;
  constructor(
    startPosition: string,
    documentId?: string,
    lastPlayerMove?: number,
    accountId?: string
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
  }

  public getCurrentPosition() {
    return this.currentPosition;
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

  public updatePosition(newX: number, newY: number) {
    let updatedX: number = Number(this.currentPosition.split(",")[0]) + newX;
    let updatedY: number = Number(this.currentPosition.split(",")[1]) + newY;
    this.currentPosition = `${updatedX},${updatedY}`;
  }

  public uppdatePLayerId(newAccountId: string) {
    this.accountId = newAccountId;
  }
}
