import { Player } from "./Player";
import { mazeConverter } from "@/converters";
export class Maze {
  solutions: number;
  startPosition: string;
  endPositions: Array<string>;
  mazeMap: mazeMap;
  width: number;
  height: number;
  private unvisitedCells: Array<string>;
  blocks: Array<Array<string>>;

  constructor(fromFirestoreMazeData?: mazeData) {
    this.solutions = 0;
    this.startPosition = ``;
    this.endPositions = [];
    this.mazeMap = {};
    this.width = 0;
    this.height = 0;
    this.unvisitedCells = [];
    this.blocks = [];
    if (fromFirestoreMazeData != undefined) {
      this.solutions = fromFirestoreMazeData.solutions;
      this.startPosition = fromFirestoreMazeData.startPosition;
      this.endPositions = fromFirestoreMazeData.endPositions;
      this.width = fromFirestoreMazeData.width;
      this.height = fromFirestoreMazeData.height;
      this.mazeMap = mazeConverter.fromFireStoreMazeMap(
        fromFirestoreMazeData.mazeMap,
        this.width
      );
    }
  }

  public checkPlayerReachedEnd(player: Player): boolean {
    if (this.endPositions.includes(player.getCurrentPosition())) return true;
    return false;
  }

  public generateMaze(solutions: number, width: number, height: number) {
    this.mazeMap = this.fillMaze(width, height);
    this.unvisitedCells = Object.keys(this.mazeMap);
    let visitedCells: Array<string> = [];
    let firstPoint: string = `${Math.floor(Math.random() * width)},${Math.floor(
      Math.random() * height
    )}`;
    visitedCells.push(firstPoint);
    this.startPosition = firstPoint;
    this.removeFromUnvisitedList(firstPoint);
    let leadingPoint: string = firstPoint;
    let newBlock: Array<string> = [firstPoint];
    let switchCounter: number = 0;
    while (this.unvisitedCells.length > 0) {
      if (switchCounter > 3) {
        let pointsToBranch = Array<string>();
        let pointToBranchOff = String();
        visitedCells.forEach(point => {
          if (pointsToBranch.length === 0) {
            pointToBranchOff = point;
            pointsToBranch = this.potentialNeighborHelper(point, this.unvisitedCells);
          }
        });
        if (pointsToBranch.length >= 1) {
          this.removeWall(pointToBranchOff, pointsToBranch[0]);
          firstPoint = pointToBranchOff;
        } else {
          firstPoint = this.returnUnvisitedCell();
          this.blocks.push(newBlock);
          newBlock = [firstPoint];
        }
        this.removeFromUnvisitedList(firstPoint);
        switchCounter = 0;
      }
      let sideCell: string = this.getRandomNeighborCell(
        leadingPoint,
        this.unvisitedCells
      );

      if (sideCell !== leadingPoint) {
        this.removeWall(leadingPoint, sideCell);
        this.removeFromUnvisitedList(sideCell);
        visitedCells.push(sideCell);
        leadingPoint = sideCell;
        newBlock.push(leadingPoint);
      } else {
        switchCounter++;
        leadingPoint = firstPoint;
      }
    }

    if (newBlock.length != 0 && !this.blocks.includes(newBlock)) {
      this.blocks.push(newBlock);
    }
    if (this.blocks.length > 1) {
      alert("Maze BrOkEn");
    }
    this.generateSolutions(solutions);
  }

  public getStartPosition() {
    return this.startPosition;
  }

  private potentialNeighborHelper(
    point: string,
    playablePoints: Array<string>
  ): Array<string> {
    let deConstructedPoint = this.deConstructPoint(point);
    let potentialNeighbors = Object.values(
      this.generatePlayableCells(
        deConstructedPoint.x,
        deConstructedPoint.y,
        playablePoints
      )
    );
    return potentialNeighbors;
  }

  private generateSolutions(amountOfSolutions: number) {
    let allPoints: Array<string> = Object.keys(this.mazeMap);
    for (let i = 0; i < amountOfSolutions; i++) {
      this.endPositions.push(allPoints[Math.floor(Math.random() * allPoints.length)]);
    }
  }

  private returnUnvisitedCell() {
    return this.unvisitedCells[Math.floor(Math.random() * this.unvisitedCells.length)];
  }

  private removeFromUnvisitedList(point: string) {
    const index = this.unvisitedCells.indexOf(point);
    if (index > -1) {
      this.unvisitedCells.splice(index, 1);
    } else {
      ("WHT");
    }
  }

  private fillMaze(width: number, height: number): mazeMap {
    let mazeMap: mazeMap = {};
    for (let x = width - 1; x >= 0; x--) {
      for (let y = height - 1; y >= 0; y--) {
        let point: string = `${x},${y}`;
        mazeMap[point] = {
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

  private getRandomNeighborCell(point: string, unvisitedCells: Array<string>): string {
    let dPoint = this.deConstructPoint(point);
    let playableCells = this.generatePlayableCells(dPoint.x, dPoint.y, unvisitedCells);
    if (Object.keys(playableCells).length != 0) {
      return Object.values(playableCells)[
        Math.floor(Math.random() * Object.values(playableCells).length)
      ];
    }
    return point;
  }

  private generatePlayableCells(
    xPoint: number,
    yPoint: number,
    unvisitedCells: Array<string>
  ): object {
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
      if (unvisitedCells.includes(points[direction])) {
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

  public checkMazeMapSize(): number {
    let total: number = 0;
    for (let key in this.mazeMap) {
      let value = this.mazeMap[key];
      total += Object.values(value).length;
    }
    return total;
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
  }
}

export interface mazeData {
  solutions: number;
  startPosition: string;
  endPositions: Array<string>;
  mazeMap: mazeMap;
  width: number;
  height: number;
}

export interface mazeMap {
  [key: string]: {
    N: boolean;
    S: boolean;
    E: boolean;
    W: boolean;
  };
}
