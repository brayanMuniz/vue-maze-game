import { Maze, mazeData } from "./Maze";
import { Player } from "./Player";
export class firebaseMaze extends Maze {
  players: Array<Player>;
  mazeId: string;
  constructor(listOfPLayers: Array<Player>, mazeId: string, firestoreMazeData?: mazeData) {
    super(firestoreMazeData);
    this.players = listOfPLayers;
    this.mazeId = mazeId;
  }

  public getPlayerByDoc(playerDoc: string): Player | undefined {
    let selectedPlayer: Player | undefined = undefined;
    this.players.forEach((player) => {
      if (player.documentId == playerDoc) {
        selectedPlayer = player;
      }
    });
    return selectedPlayer;
  }

  public checkIfPlayerInGame(playerUid: string): boolean {
    let inGame: boolean = false;
    this.players.forEach((player) => {
      if (player.getAccountId() == playerUid) {
        inGame = true;
      }
    });
    return inGame;
  }

  public getDocIdOnAccountId(accountId: string): string | undefined {
    let documentId: string | undefined = undefined;
    this.players.forEach((player) => {
      if (player.getAccountId() == accountId) {
        documentId = player.getDocumentId();
      }
    });
    return documentId;
  }

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
    this.players.forEach((player) => {
      if (player.getDocumentId() === docId) {
        currentPosition = player.getCurrentPosition();
      }
    });

    return currentPosition;
  }

  public updatePlayerName(documentId: string, newName: string) {
    let selectedPlayer: Player | undefined = this.getPlayerByDoc(documentId);
    if (selectedPlayer != undefined) {
      if (selectedPlayer.checkForChangeInName(newName)) selectedPlayer.updateName(newName);
    }
  }

  public replacePlayerPosition(documentId: string, x: number, y: number) {
    this.players.forEach((player) => {
      if (player.documentId === documentId) {
        player.replacePostion(x, y);
      }
    });
  }

  public movePLayer(documentId: string, x: number, y: number): string {
    let newCurrentPosition: string = "";
    this.players.forEach((player) => {
      if (player.documentId === documentId) {
        player.updatePosition(x, y);
        newCurrentPosition = player.getCurrentPosition();
      }
    });
    return newCurrentPosition;
  }

  public checkPlayerMove(documentId: string, x: number, y: number): boolean {
    let direction: "N" | "S" | "E" | "W" | undefined;
    let playerPosition: string = "";
    if (x == 1 && y == 0) {
      direction = "E";
    } else if (x == -1 && y == 0) {
      direction = "W";
    } else if (y == 1 && x == 0) {
      direction = "N";
    } else if (y == -1 && x == 0) {
      direction = "S";
    }
    if (direction != undefined) {
      this.players.forEach((player) => {
        if (player.documentId == documentId) {
          playerPosition = player.getCurrentPosition();
        }
      });
      let result: number | boolean = this.mazeMap[playerPosition][direction];
      if (typeof result == "number" && result > 1) return true;
      if (typeof result == "boolean" && this.mazeMap[playerPosition][direction]) return true;
    }

    return false;
  }

  public replacePlayers(newPlayers: Array<Player>) {
    this.players = newPlayers;
  }

  public getGameId() {
    return this.mazeId;
  }
}
