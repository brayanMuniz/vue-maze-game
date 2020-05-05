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

  public checkIfPlayerInGame(playerUid: string): boolean {
    let inGame: boolean = false;
    this.players.forEach((player) => {
      if (player.getAccountId() == playerUid) {
        inGame = true;
      }
    });
    return inGame;
  }

  public getPlayerByAccountUid(accountUid: string): Player | undefined {
    let selectedPlayer: Player | undefined = undefined;
    this.players.forEach((player) => {
      if (player.getAccountId() === accountUid) selectedPlayer = player;
    });
    return selectedPlayer;
  }

  public addPlayer(player: Player) {
    this.players.push(player);
  }

  public removePlayer(playerAccountUid: String) {
    let idx: number | undefined = undefined;
    this.players.forEach((player, index) => {
      if (player.getAccountId() === playerAccountUid) {
        idx = index;
      }
    });
    if (idx != undefined) {
      this.players.splice(idx, 1);
    }
  }

  public getPLayerPosition(accontUid: string): string {
    let currentPosition: string = "";
    this.players.forEach((player) => {
      if (player.getAccountId() === accontUid) {
        currentPosition = player.getCurrentPosition();
      }
    });

    return currentPosition;
  }

  public updatePlayerName(accountUid: string, newName: string) {
    let selectedPlayer: Player | undefined = this.getPlayerByAccountUid(accountUid);
    if (selectedPlayer != undefined) {
      if (selectedPlayer.checkForChangeInName(newName)) selectedPlayer.updateName(newName);
    }
  }

  public replacePlayerPosition(accontUid: string, x: number, y: number) {
    this.players.forEach((player) => {
      if (player.getAccountId() === accontUid) {
        player.replacePostion(x, y);
      }
    });
  }

  public movePLayer(accontUid: string, x: number, y: number): string {
    let newCurrentPosition: string = "";
    this.players.forEach((player) => {
      if (player.getAccountId() === accontUid) {
        player.updatePosition(x, y);
        newCurrentPosition = player.getCurrentPosition();
      }
    });
    return newCurrentPosition;
  }

  public checkPlayerMove(accontUid: string, x: number, y: number): boolean {
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
        if (player.getAccountId() === accontUid) {
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
