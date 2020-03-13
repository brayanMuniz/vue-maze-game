import { Maze, mazeData } from "./baseMaze";
import { Player } from "./playerClass";
import moment, { Moment } from "moment";
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

  // Checks the currentlyPLaying field and the last playerMoveTime field.
  // ? If I just use player last player move I wont need if playing field ?
  // TODO: figure out why the time difference is so big
  public returnUnusedPlayerId(): string {
    let playerId = "";
    this.players.forEach(player => {
      let nowInSeconds: number = moment().unix();
      let playerTimeInSeconds: number = player.getLastMoveTimeSeconds();
      let differenceInSeconds: number = nowInSeconds - playerTimeInSeconds;
      console.log("Difference in seconds since last move", differenceInSeconds);
      if (player.getIfUsing() === false || differenceInSeconds > 300) {
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

  public movePLayer(playerId: string, x: number, y: number): string {
    let newCurrentPosition: string = "";
    this.players.forEach(player => {
      if (player.playerId == playerId) {
        player.updatePosition(x, y);
        newCurrentPosition = player.getCurrentPosition();
      }
    });
    return newCurrentPosition;
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
