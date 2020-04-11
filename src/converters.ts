import { Player } from "@/classes/Player";
import { firebaseMaze } from "@/classes/DBMaze";
import { Maze, mazeMap } from "@/classes/Maze";
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
  }
};

// Gives back point from a specified direction, Ex: (0,0), N => 0,1
function findNeighborPoint(
  point: string,
  direction: "N" | "S" | "E" | "W",
  max: number
): string {
  let x: number = Number(point.split(",")[0]);
  let y: number = Number(point.split(",")[1]);
  let neighbor = point;
  if (direction === "N" && y < max) {
    y += 1;
  }
  if (direction === "S" && y > 0) {
    y -= 1;
  }
  if (direction === "E" && x < max) {
    x += 1;
  }
  if (direction === "W" && x > 0) {
    x -= 1;
  }
  neighbor = `${x},${y}`;
  return neighbor;
}

export let mazeConverter = {
  // Deletes all the false values and keeps true values to reduce db load
  // Max must always be the root of the maze (if maze square) -1
  toFireStoreMazeMap: (mazeMap: mazeMap, max: number): mazeMap => {
    for (let point in mazeMap) {
      let value = mazeMap[point];

      if (!value.N) {
        delete mazeMap[point].N;
        let neighborPoint = findNeighborPoint(point, "N", max);
        if (neighborPoint != point) {
          delete mazeMap[neighborPoint].S;
        }
      }
      // else {
      //   delete mazeMap[point].N;
      // }

      if (!value.S) {
        delete mazeMap[point].S;
        let neighborPoint = findNeighborPoint(point, "S", max);
        if (neighborPoint != point) {
          delete mazeMap[neighborPoint].N;
        }
      }
      // else {
      //   delete mazeMap[point].S;
      // }

      if (!value.E) {
        delete mazeMap[point].E;
        let neighborPoint = findNeighborPoint(point, "E", max);
        if (neighborPoint != point) {
          delete mazeMap[neighborPoint].W;
        }
      }
      // else {
      //   delete mazeMap[point].E;
      // }

      if (!value.W) {
        delete mazeMap[point].W;
        let neighborPoint = findNeighborPoint(point, "W", max);
        if (neighborPoint != point) {
          delete mazeMap[neighborPoint].E;
        }
      }
      //  else {
      //   delete mazeMap[point].W;
      // }
    }
    // Since some points might not have any values they will be removed
    // Firebase does not allow empty values
    for (let point in mazeMap) {
      if (Object.values(mazeMap[point]).length === 0) {
        delete mazeMap[point];
      }
    }
    return mazeMap;
  },
  // Fills in all the Empty values and points that do not exist
  fromFireStoreMazeMap: (mazeMap: mazeMap, max: number): mazeMap => {
    let filledMaze: mazeMap = {};
    for (let x = max; x >= 0; x--) {
      for (let y = max; y >= 0; y--) {
        let point: string = `${x},${y}`;
        filledMaze[point] = {
          N: false,
          S: false,
          E: false,
          W: false
        };
      }
    }
    for (let point in mazeMap) {
      let directionValue = mazeMap[point];
      if (directionValue.N) {
        filledMaze[findNeighborPoint(point, "N", max)].S = true;
        filledMaze[point].N = true;
      }
      if (directionValue.S) {
        filledMaze[findNeighborPoint(point, "S", max)].N = true;
        filledMaze[point].S = true;
      }
      if (directionValue.E) {
        filledMaze[findNeighborPoint(point, "E", max)].W = true;

        filledMaze[point].E = true;
      }
      if (directionValue.W) {
        filledMaze[findNeighborPoint(point, "W", max)].E = true;
        filledMaze[point].W = true;
      }
    }
    return filledMaze;
  },
  toFireStore: function(maze: Maze) {
    return {
      solutions: maze.solutions,
      startPosition: maze.startPosition,
      endPositions: maze.endPositions,
      mazeMap: this.toFireStoreMazeMap(maze.mazeMap, maze.height - 1),
      width: maze.width,
      height: maze.height
    };
  },
  // Todo: Fill in all the false values
  fromFireStore: function(firebaseMazeData: any, mazeId: string) {
    let players: Array<Player> = [];
    return new firebaseMaze(players, mazeId, firebaseMazeData);
  }
};
