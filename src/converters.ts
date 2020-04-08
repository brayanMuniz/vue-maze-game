import { Player } from "@/classes/Player";
import { firebaseMaze } from "@/classes/DBMaze";
import { Maze } from "@/classes/Maze";
// Makes new player and adds documnet id instead of account id
export interface playerFireStoreData {
  currentPosition: string;
  playerId: string;
  lastMoveTime: number;
  wonGame: boolean;
  playerName?: string;
}

export let playerConverter = {
  toFireStore: (player: Player) => {
    return {
      currentPosition: player.currentPosition,
      accountId: player.accountId,
      lastPlayerMove: player.getLastMoveTimeSeconds(),
      gameWon: player.wonGame
    };
  },
  // this will be used later to join sessions
  fromFireStore: (firebasePlayerData: playerFireStoreData) => {
    return new Player(
      firebasePlayerData.currentPosition,
      firebasePlayerData.wonGame,
      firebasePlayerData.playerId,
      firebasePlayerData.lastMoveTime
    );
  },
};

export let mazeConverter = {
  toFireStore: function(maze: Maze) {
    return {
      solutions: maze.solutions,
      startPosition: maze.startPosition,
      endPositions: maze.endPositions,
      mazeMap: maze.mazeMap,
      width: maze.width,
      height: maze.height,
    };
  },
  // Todo: update any do DOc type
  fromFireStore: function(firebaseMazeData: any, mazeId: string) {
    let players: Array<Player> = [];
    return new firebaseMaze(players, mazeId, firebaseMazeData);
  },
};
