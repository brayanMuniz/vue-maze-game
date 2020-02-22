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
  generateMaze(solutions: number, width: number, height: number) {
    this.mazeMap = this.fillMaze(width, height);
    this.unvisitedCells = Object.keys(this.mazeMap);
    let firstPoint: string = `${Math.floor(Math.random() * width)},${Math.floor(
      Math.random() * height
    )}`;
    console.log("First point", firstPoint);
    this.removeFromUnvisitedList(firstPoint);
    let leadingPoint: string = firstPoint;
    let blocks: Array<Array<string>> = [];
    let newBlock: Array<string> = [firstPoint];
    let count = this.unvisitedCells.length * 3;
    let switchCounter: number = 0;
    // this generates seperate blocks that are never able to meet eachother
    while (this.unvisitedCells.length > 0 && count > 0) {
      if (switchCounter > 3) {
        firstPoint = this.returnUnvisitedCell();
        blocks.push(newBlock);
        newBlock = [firstPoint];
        switchCounter = 0;
        this.removeFromUnvisitedList(firstPoint);
      }
      let sideCell: string = this.getRandomNeighborCell(
        leadingPoint,
        this.unvisitedCells
      );

      if (sideCell !== leadingPoint) {
        this.removeWall(leadingPoint, sideCell);
        this.removeFromUnvisitedList(sideCell);
        leadingPoint = sideCell;
        newBlock.push(leadingPoint);
      } else {
        leadingPoint = firstPoint;
        switchCounter++;
      }
      count--;
    }
    if (newBlock.length != 0 && !blocks.includes(newBlock)) {
      blocks.push(newBlock);
    }

    this.mergeBlocks(blocks);
  }

  private mergeBlocks(blocks: Array<Array<string>>) {
    let loopBlocker = blocks.length * 100;
    blocks = blocks.sort((a, b) => {
      return a.length - b.length;
    });
    blocks.forEach(block => {
      console.log(block);
    });
    while (blocks.length > 1 && loopBlocker > 0) {
      let bridge: any = {
        firstPoint: String(),
        firstPointBlockIdx: Number(),
        secondPoint: String(),
        secondPointBlockIdx: Number()
      };
      let readyToSeperate: boolean = false;
      while (readyToSeperate == false) {
        let startingBlock = 0;
        let blockCounter = startingBlock + 1;
        for (let i = startingBlock; i < blocks.length; i++) {
          blocks[startingBlock].forEach(point => {
            if (readyToSeperate === false) {
              let dPoint = this.deConstructPoint(point);
              let neighborPoints: Array<string> = Object.values(
                this.generatePlayableCells(
                  dPoint.x,
                  dPoint.y,
                  Object.keys(this.mazeMap)
                )
              );
              neighborPoints.forEach(neighborPoint => {
                if (blocks[blockCounter].includes(neighborPoint)) {
                  bridge.firstPoint = point;
                  bridge["firstPointBlockIdx"] = i;
                  bridge["secondPoint"] = neighborPoint;
                  bridge["secondPointBlockIdx"] = blockCounter;
                  readyToSeperate = true;
                }
              });
            }
          });
        }
      }
      for (let i = 0; i < blocks.length - 1; i++) {
        let foundMerge: boolean = false;

        if (readyToSeperate) {
          break;
        }
        blocks[i].forEach(point => {
          if (readyToSeperate === false) {
            let dPoint = this.deConstructPoint(point);
            let neighborPoints: Array<string> = Object.values(
              this.generatePlayableCells(
                dPoint.x,
                dPoint.y,
                Object.keys(this.mazeMap)
              )
            );
            neighborPoints.forEach(neighborPoint => {
              if (blocks[i + 1].includes(neighborPoint)) {
                bridge.firstPoint = point;
                bridge["firstPointBlockIdx"] = i;
                bridge["secondPoint"] = neighborPoint;
                bridge["secondPointBlockIdx"] = i + 1;
                readyToSeperate = true;
              }
            });
          }
        });
      }

      if (readyToSeperate) {
        this.removeWall(bridge.firstPoint, bridge.secondPoint);
        let mergedBlock: Array<string> = [
          ...new Set(
            blocks[bridge.firstPointBlockIdx].concat(
              blocks[bridge.secondPointBlockIdx]
            )
          )
        ];
        blocks.splice(bridge.firstPointBlockIdx, 1);
        blocks.splice(bridge.secondPointBlockIdx, 1);
        blocks.push(mergedBlock);
        readyToSeperate = false;
      }

      loopBlocker--;
    }
    console.log("Done merge");
  }

  private findMergeBetweenBlocks(
    firstBlock: Array<string>,
    secondBlock: Array<string>
  ) {
    let answer: any = {
      mergedBlock: [],
      foundMerge: false,
      firstPoint: String(),
      secondPoint: String()
    };
    firstBlock.forEach(point => {
      if (answer.foundMerge == false) {
        let dPoint = this.deConstructPoint(point);
        let neighborPoints: Array<string> = Object.values(
          this.generatePlayableCells(
            dPoint.x,
            dPoint.y,
            Object.keys(this.mazeMap)
          )
        );
        neighborPoints.forEach(neighborPoint => {
          if (secondBlock.includes(neighborPoint)) {
            answer.mergedBlock = [...new Set(firstBlock.concat(secondBlock))];
            answer.foundMerge = true;
            answer.firstPoint = point;
            answer.secondPoint = neighborPoint;
          }
        });
      }
    });
    return answer;
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
    } else {
      console.error("WHT");
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
    return mazeMap;
  }

  private getRandomNeighborCell(
    point: string,
    unvisitedCells: Array<string>
  ): string {
    let dPoint = this.deConstructPoint(point);
    let playableCells = this.generatePlayableCells(
      dPoint.x,
      dPoint.y,
      unvisitedCells
    );
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

interface mazeMap {
  [key: string]: {
    visited: boolean;
    N: boolean;
    S: boolean;
    E: boolean;
    W: boolean;
  };
}
