import { Player } from "@/classes/Player";
import { firebaseMaze } from "@/classes/DBMaze";
import { Maze, mazeMap } from "@/classes/Maze";
import { nodes, Graph } from "./classes/Graph";

export interface playerFireStoreData {
  currentPosition: string;
  playerId: string;
  wonGame: boolean;
  playerName?: string;
}

export let playerConverter = {
  toFireStore: (player: Player) => {
    return {
      currentPosition: player.currentPosition,
      gameWon: player.wonGame,
      playerName: player.getPlayerName(),
    };
  },
  // this will be used later to join sessions
  fromFireStore: (firebasePlayerData: playerFireStoreData) => {
    return new Player(
      firebasePlayerData.currentPosition,
      firebasePlayerData.wonGame,
      firebasePlayerData.playerId,
      firebasePlayerData.playerName
    );
  },
};

export let mazeConverter = {
  // Deletes all the false values and keeps true values to reduce db load
  // Max must always be the root of the maze (if maze square) -1
  toFireStoreMazeMap: function(maze: Maze): nodes {
    return new Graph(maze).convertMazeToGraph();
  },
  // Fills in all the Empty values and points that do not exist
  fromFireStoreMazeMap: function(graphData: nodes, mazeSize: number): mazeMap {
    return new Graph().convertGraphToMazeData(graphData, mazeSize);
  },
  toFireStore: function(maze: Maze) {
    return {
      startPosition: maze.startPosition,
      endPositions: maze.endPositions,
      mazeMap: this.toFireStoreMazeMap(maze),
      width: maze.width,
      height: maze.height,
    };
  },
  // Todo: Fill in all the false values
  fromFireStore: function(firebaseMazeData: any, mazeId: string) {
    let players: Array<Player> = [];
    firebaseMazeData.mazeMap = this.fromFireStoreMazeMap(
      firebaseMazeData.mazeMap,
      firebaseMazeData.width
    );
    return new firebaseMaze(players, mazeId, firebaseMazeData);
  },
};
