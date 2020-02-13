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
  generateMaze(solutions: number, width: number, height: number) {
    this.mazeMap = this.fillMaze(width, height);
    let doneMakingMaze = false;
    //  We pick a random cell
    // We select a random neighbouring cell(not visited) ...
    // We remove the wall between the two cells and add the neighbouring cell to the list of cells having been visited.
    // If there are no unvisited neighbouring cell, we backtrack to one that has at least one unvisited neighbour; this is done until we backtract to the original cell.
    let firstPoint = `${Math.floor(Math.random() * width)},${Math.floor(
      Math.random() * height
    )}`;
    let leadingPoint = firstPoint;
    let counter: number = 1;
    while (!doneMakingMaze) { // visitedCells.length !== height * width 
      let sideCell: string = this.getRandomNeighborCell(leadingPoint);
      if (counter == 3) {
        doneMakingMaze = true;
        break;
      }
      if (sideCell !== leadingPoint) {
        this.removeWall(leadingPoint, sideCell);
        console.log("removed wall between", leadingPoint, sideCell);
        this.visitedCells.push(sideCell);
        leadingPoint = sideCell;
      } else {
        leadingPoint = firstPoint;
        sideCell = this.getRandomNeighborCell(leadingPoint);
        counter++;
      }
    }
    console.log(this.mazeMap);
  }

  private findUncheckedCell(): string {
    let unCheckedCell = ''
    
    return unCheckedCell
  }

  // BOTTOM LEFT IS 0,0
  private fillMaze(width: number, height: number): mazeMap {
    let mazeMap: mazeMap = {};
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
    this.width = width;
    this.height = height;
    return mazeMap;
  }

  private getRandomNeighborCell(point: string): string {
    let dPoint = this.deConstructPoint(point);
    let playableCells = this.generateSideCells(dPoint.x, dPoint.y);
    if (Object.keys(playableCells).length != 0) {
      let keys = Object.keys(playableCells);
      return playableCells[keys[(keys.length * Math.random()) << 0]];
    }
    return point;
  }

  private generateSideCells(xPoint: number, yPoint: number) {
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
    let firstCell: any = {
      height: Number(point1.split(",")[0]),
      width: Number(point1.split(",")[1])
    };

    let secondCell: any = {
      height: Number(point2.split(",")[0]),
      width: Number(point2.split(",")[1])
    };

    if (firstCell.height > secondCell.height) {
      this.mazeMap[point1]["S"] = true;
      this.mazeMap[point2]["N"] = true;
    } else if (firstCell.height < secondCell.height) {
      this.mazeMap[point1]["N"] = true;
      this.mazeMap[point2]["S"] = true;
    } else if (firstCell.width > secondCell.width) {
      this.mazeMap[point1]["W"] = true;
      this.mazeMap[point2]["E"] = true;
    } else if (firstCell.width < secondCell.width) {
      this.mazeMap[point1]["E"] = true;
      this.mazeMap[point2]["W"] = true;
    }
  }
  // If thre are no other parameters will generate 0 or 1
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
