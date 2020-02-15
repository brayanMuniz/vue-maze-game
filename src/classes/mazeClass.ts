import { Player } from "./playerClass";

export class Maze {
  solutions: number;
  startPosition: string;
  endPositions: Array<string>;
  mazeMap: mazeMap;
  players: Array<Player>;
  width: number;
  height: number;
  pointToNumber: pointToNumber;
  visitedCells: Array<string>;
  constructor(players: Array<Player>) {
    this.solutions = 0;
    this.startPosition = ``;
    this.endPositions = [];
    this.mazeMap = {};
    this.players = players;
    this.width = 0;
    this.height = 0;
    this.visitedCells = [];
    // Todo: this
    this.pointToNumber = {
      left: 0,
      right: 1,
      up: 2,
      down: 3
    };
  }
  // http://reeborg.ca/docs/en/reference/mazes.html
  // randomly select start and number of destinations
  // ! Problem removed wall between 3,1 3,2
  // ! removed wall between 3,2 3,1
  generateMaze(solutions: number, width: number, height: number) {
    this.mazeMap = this.fillMaze(width, height);
    let doneMakingMaze = false;
    // We pick a random cell
    // We select a random neighbouring cell(not visited)
    // We remove the wall between the two cells and add the neighbouring cell to the list of cells having been visited.
    // If there are no unvisited neighbouring cell, we backtrack to one that has at least one unvisited neighbour; this is done until we backtract to the original cell.
    let firstPoint = `${Math.floor(Math.random() * width)},${Math.floor(
      Math.random() * height
    )}`;
    let leadingPoint = firstPoint;
    this.visitedCells.push(leadingPoint);
    let counter: number = 0;
    while (!doneMakingMaze && counter < 10) {
      // visitedCells.length !== height * width
      let sideCell: string = this.getRandomNeighborCell(leadingPoint); // if None: return own point
      if (sideCell !== leadingPoint) {
        this.removeWall(leadingPoint, sideCell);
        this.visitedCells.push(sideCell);
        leadingPoint = sideCell;
      } else {
        leadingPoint = firstPoint; // Todo: select random cell from list of cells that have not been visited
        sideCell = this.getRandomNeighborCell(leadingPoint);
      }
      counter++;
    }
  }

  // Figure out what 0,0 is
  private fillMaze(width: number, height: number): mazeMap {
    let mazeMap: mazeMap = {};
    for (let x = width - 1; x >= 0; x--) {
      for (let y = height - 1; y >= 0; y--) {
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
    this.width = width;
    this.height = height;
    console.log(mazeMap);
    return mazeMap;
  }

  private getRandomNeighborCell(point: string): string {
    let dPoint = this.deConstructPoint(point);
    let playableCells = this.generatePlayableCells(dPoint.x, dPoint.y);
    if (Object.keys(playableCells).length != 0) {
      return Object.values(playableCells)[
        Math.floor(Math.random() * Object.values(playableCells).length)
      ];
    }
    return point;
  }

  private generatePlayableCells(xPoint: number, yPoint: number): object {
    let points: any = {};
    if (xPoint + 1 < this.width) {
      points["right"] = `${xPoint + 1},${yPoint}`;
    }
    if (xPoint - 1 >= 0) {
      points["left"] = `${xPoint - 1},${yPoint}`;
    }
    if (yPoint + 1 < this.height) {
      points["up"] = `${xPoint},${yPoint + 1}`;
    }
    if (yPoint - 1 >= 0) {
      points["down"] = `${xPoint},${yPoint - 1}`;
    }
    let playableCells: any = {};
    for (let direction in points) {
      if (!this.visitedCells.includes(points[direction])) {
        playableCells[direction] = points[direction];
      }
    }
    return playableCells;
  }

  private deConstructPoint(point: string) {
    return {
      x: Number(point.split(",")[0]),
      y: Number(point.split(",")[1])
    };
  }

  private removeWall(point1: string, point2: string) {
    let firstCell: any = this.deConstructPoint(point1);
    let secondCell: any = this.deConstructPoint(point2);
    if (firstCell.y > secondCell.y) {
      this.mazeMap[point1]["S"] = true;
      this.mazeMap[point2]["N"] = true;
    } else if (firstCell.y < secondCell.y) {
      this.mazeMap[point1]["N"] = true;
      this.mazeMap[point2]["S"] = true;
    } else if (firstCell.x > secondCell.x) {
      this.mazeMap[point1]["W"] = true;
      this.mazeMap[point2]["E"] = true;
    } else if (firstCell.x < secondCell.x) {
      this.mazeMap[point1]["E"] = true;
      this.mazeMap[point2]["W"] = true;
    }
    console.log("removed wall between", point1, point2);
  }
}

interface playableCells {
  right: string;
  left: string;
  up: string;
  down: string;
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

interface pointToNumber {
  left: 0;
  right: 1;
  up: 2;
  down: 3;
}
