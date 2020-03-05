import { Maze, mazeData } from "./baseMaze";
import { Player } from "./playerClass";

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

  public returnUnusedPlayerId(): string {
    let playerId = "";
    this.players.forEach(player => {
      if (player.getIfUsing() === false) {
        playerId = player.getPLayerId();
      }
    });
    return playerId;
  }

  public addPlayer(player: Player) {
    this.players.push(player);
  }

  public changePlayerId(oldPlayerId: string, newPLayerId: string) {
    this.players.forEach(player => {
      if (player.playerId == oldPlayerId) {
        player.uppdatePLayerId(newPLayerId);
      }
    });
  }

  public movePLayer(playerId: string, x: number, y: number) {
    this.players.forEach(player => {
      if (player.playerId == playerId) {
        player.updatePosition(x, y);
      }
    });
  }

  public checkPlayerMove(playerId: string, x: number, y: number): boolean {
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
        if (player.playerId == playerId) {
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
