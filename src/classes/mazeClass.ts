import { point } from "@/interfaces/points";
import { Player } from "./playerClass";

export class Maze {
  solutions: number;
  startPosition: string;
  endPositions: Array<string>;
  mazeMap: mazeMap;
  players: Array<Player>;

  constructor(players: Array<Player>) {
    this.solutions = 0;
    this.startPosition = ``;
    this.endPositions = [];
    this.mazeMap = {};
    this.players = players;
  }
  // http://reeborg.ca/docs/en/reference/mazes.html
  // randomly select start and number of destinations
  generateMaze(solutions: number, width: number, height: number) {
    this.mazeMap = this.fillMaze(width, height);
    let visitedPoints: Array<string> = []; // Todo: update with a type of x, y point
    let randomPoint = `${Math.floor(Math.random() * width)},${Math.floor(
      Math.random() * height
    )}`;
    console.log(
      "randomPoint",
      randomPoint,
      "neigbor",
      this.getNeighborCell(randomPoint)
    );
    console.log(visitedPoints, randomPoint);
    // This is what needs to be done before working on anything else:
    //    1. make designated number for N, S, E, W
    //    2. getNeightborCell needs to fixed
    //    3. removeWall would be done after that
    let doneMakingMaze = false;
    //  We pick a random cell
    // We select a random neighbouring cell(not visited) ...
    // We remove the wall between the two cells and add the neighbouring cell to the list of cells having been visited.
    // If there are no unvisited neighbouring cell, we backtrack to one that has at least one unvisited neighbour; this is done until we backtract to the original cell.
    while (!doneMakingMaze) {}
  }

  private fillMaze(width: number, height: number): mazeMap {
    let mazeMap: mazeMap = {};
    // BOTTOM LEFT IS 0,0
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        let point: string = `${x},${y}`;
        mazeMap[point] = {
          visited: false,
          N: false,
          S: false,
          E: false,
          W: false
        };
      }
    }
    return mazeMap;
  }
  // Todo: still need to add a random for equal distirbution for 4 sides
  private getNeighborCell(point: string): string {
    // Todo: make sure it does not go accross
    let w: number = Number(point.split(",")[0]);
    let y: number = Number(point.split(",")[1]);
    // ? There are 4 possible situations, N, S, E, W
    // generate a random number between 0 and 3 and
    if (this.generateNumber() === 1 && w + 1 > 0) {
      return `${w + 1},${y}`;
    }
    if (this.generateNumber() === -1 && y + 1 > 0) {
      return `${w},${y + 1}`;
    }
    return `${w},${y - 1}`;
  }
  // Todo: make this better this is nasty
  private removeWall(point1: string, point2: string) {
    let point1H: number = Number(point1.split(",")[0]);
    let point1V: number = Number(point1.split(",")[1]);
    let point2H: number = Number(point2.split(",")[0]);
    let point2V: number = Number(point2.split(",")[1]);

    if (point1H > point2H) {
      this.mazeMap[point1]["W"] = true;
      this.mazeMap[point2]["E"] = true;
    } else if (point1H > point2H) {
    } else if (point1V > point2V) {
    } else if (point1V < point2V) {
    }

    // find difference in horizontal or vertical, and then remove their N,S,E,W respectvly
  }

  private generateNumber(): number {
    let random = Math.random();
    if (random > 0.5) {
      return 1;
    }
    return -1;
  }
}

interface mazeMap {
  [key: string]: {
    visited: boolean;
    // Todo: give time codes so I dont have to wirte if else if else
    N: boolean;
    S: boolean;
    E: boolean;
    W: boolean;
  };
}
