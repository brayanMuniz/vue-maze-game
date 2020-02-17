import { Player } from "./playerClass";

export class Maze {
  solutions: number;
  startPosition: string;
  endPositions: Array<string>;
  mazeMap: mazeMap;
  players: Array<Player>;
  width: number;
  height: number;
  unvisitedCells: Array<string>;
  constructor(players: Array<Player>) {
    this.solutions = 0;
    this.startPosition = ``;
    this.endPositions = [];
    this.mazeMap = {};
    this.players = players;
    this.width = 0;
    this.height = 0;
    this.unvisitedCells = [];
  }
  // http://reeborg.ca/docs/en/reference/mazes.html
  // randomly select start and number of destinations
  generateMaze(solutions: number, width: number, height: number) {
    this.mazeMap = this.fillMaze(width, height);
    this.unvisitedCells = Object.keys(this.mazeMap);
    let firstPoint: string = `${Math.floor(Math.random() * width)},${Math.floor(
      Math.random() * height
    )}`;
    this.removeFromUnvisitedList(firstPoint);
    let leadingPoint: string = firstPoint;
    let count = this.unvisitedCells.length * 2; // To prevent an infinite loop
    let switchCounter: number = 0; // ! this generates seperate blocks that are never able to meet eachother
    while (this.unvisitedCells.length > 1 && count > 0) {
      if (switchCounter > 4) {
        firstPoint = this.returnUnvisitedCell();
        console.log("New firstPoint", firstPoint);
        switchCounter = 0;
      }
      let sideCell: string = this.getRandomNeighborCell(leadingPoint); // if None: return own point
      if (sideCell !== leadingPoint) {
        this.removeWall(leadingPoint, sideCell);
        this.removeFromUnvisitedList(sideCell);
        leadingPoint = sideCell;
      } else {
        console.log(`switch, ${leadingPoint} with ${firstPoint}`);
        leadingPoint = firstPoint;
        switchCounter++;
      }
      count--;
    }
  }

  private returnUnvisitedCell() {
    return this.unvisitedCells[
      Math.floor(Math.random() * this.unvisitedCells.length)
    ];
  }

  private removeFromUnvisitedList(point: string) {
    const index = this.unvisitedCells.indexOf(point);
    if (index > -1) {
      this.unvisitedCells.splice(index, 1);
    }
  }

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
      if (this.unvisitedCells.includes(points[direction])) {
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
  // TODO: FIX THIS
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
