import { Maze, mazeData } from "./BaseMaze";
import { Player } from "./Player";
export class firebaseMaze extends Maze {
  players: Array<Player>;
  mazeId: string;
  constructor(
    listOfPLayers: Array<Player>,
    mazeId: string,
    firestoreMazeData?: mazeData
  ) {
    super(firestoreMazeData);
    this.players = listOfPLayers;
    this.mazeId = mazeId;
  }

  public checkIfPlayerInGame(playerUid: string): boolean {
    let inGame: boolean = false;
    this.players.forEach(player => {
      if (player.getAccountId() == playerUid) {
        inGame = true;
      }
    });
    return inGame;
  }

  public getDocIdOnAccountId(accountId: string): string | undefined {
    let documentId: string | undefined = undefined;
    this.players.forEach(player => {
      if (player.getAccountId() == accountId) {
        documentId = player.getDocumentId();
      }
    });
    return documentId;
  }
  // I think its not reactive because it does not watch the properties of the player just the array of PLayers
  // When I add a player it is reactive and shows up, BUT when I change the players position it not does change the position
  // Two ways to get around this, Either move the player and add a deep watch in the component, or remove the player from the array and add him back in
  // Try former then the latter
  public addPlayer(player: Player) {
    this.players.push(player);
  }

  public removePlayer(playerDoc: String) {
    let idx: number | undefined = undefined;
    this.players.forEach((player, index) => {
      if (player.getDocumentId() === playerDoc) {
        idx = index;
      }
    });
    if (idx != undefined) {
      this.players.splice(idx, 1);
    }
  }

  public getPLayerPosition(docId: string): string {
    let currentPosition: string = "";
    this.players.forEach(player => {
      if (player.getDocumentId() === docId) {
        currentPosition = player.getCurrentPosition();
      }
    });

    return currentPosition;
  }

  public movePLayer(documentId: string, x: number, y: number): string {
    let newCurrentPosition: string = "";
    this.players.forEach(player => {
      if (player.documentId === documentId) {
        player.updatePosition(x, y);
        newCurrentPosition = player.getCurrentPosition();
      }
    });
    return newCurrentPosition;
  }

  public checkPlayerMove(documentId: string, x: number, y: number): boolean {
    let playerCanMove: boolean = false;
    let direction: string = "";
    let playerPosition: string;
    if (x == 1 && y == 0) {
      direction = "E";
    } else if (x == -1 && y == 0) {
      direction = "W";
    } else if (y == 1 && x == 0) {
      direction = "N";
    } else if (y == -1 && x == 0) {
      direction = "S";
    }
    if (direction != "") {
      this.players.forEach(player => {
        if (player.documentId == documentId) {
          playerPosition = player.getCurrentPosition();
        }
      });
      playerCanMove = this.mazeMap[playerPosition][direction];
    }

    return playerCanMove;
  }

  public replacePlayers(newPlayers: Array<Player>) {
    this.players = newPlayers;
  }

  public getGameId() {
    return this.mazeId;
  }
}
