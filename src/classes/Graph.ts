// Todo: I could also delte the whole maze and convert it to a graph
// Todo: accept data from a maze, convert it to a graph, send it to database instead.

import { Maze, mazeMap, mazeData } from "./Maze";

export class Graph {
  mazeData: Maze;
  //   graphData:
  constructor(mazeData: Maze) {
    this.mazeData = mazeData;
  }

  public convertMazeToGraph(): nodes {
    let graphData: nodes = {};
    let max: number = this.mazeData.height;
    let startPoint: string = this.mazeData.getStartPosition();
    let mazeMapData: mazeMap = this.mazeData.mazeMap;
    let pointsToCheck: Array<string> = [startPoint];
    let possibleDirections: Array<"N" | "S" | "E" | "W"> = ["N", "S", "E", "W"];
    let checkedPointsDirection: mazeMap = {};
    let checkedPoints: Array<string> = [];
    // Todo: check for the finished pont, eliminate it going that way
    // Ex: 6,9.S = 3 ... 6,6.N = 3 ... I just need one of them
    // Can be done through a hash table called eliminated points, this case would be 6,6:S = false
    let infiniteLoopPreventer: number = 200;
    while (pointsToCheck.length > 0 && infiniteLoopPreventer > 0) {
      let point: string = pointsToCheck[0];
      let value = mazeMapData[point];

      if (graphData[point] === undefined) {
        graphData[point] = {
          N: 0,
          S: 0,
          E: 0,
          W: 0
        };
      }
      // Todo: when there is a point that has all values of 0, check the in betweens of the largest point direction for possible in betweens.
      if (!checkedPoints.includes(point))
        possibleDirections.forEach(direction => {
          if (this.isPointDirectionChecked(checkedPointsDirection, point, direction) === false) {
            let directionResult = this.checkNodeDirectionAmount(
              value,
              direction,
              mazeMapData,
              point,
              max
            );

            if (directionResult.finishedPoint != point) {
              checkedPointsDirection = this.checkPointHelperAddition(
                checkedPointsDirection,
                directionResult.finishedPoint,
                direction
              );
            }
            directionResult.inBetweenPoints.forEach(inBetweenPoint => {
              checkedPointsDirection = this.checkPointHelperAddition(
                checkedPointsDirection,
                inBetweenPoint.point,
                this.giveOppositeDirection(inBetweenPoint.directionOrigin)
              );
              console.log("Added inbetween ", inBetweenPoint.point, "UWU");
              pointsToCheck.push(inBetweenPoint.point);
            });

            graphData[point][direction] = directionResult.vectorAmount;

            if (
              directionResult.vectorAmount > 0 &&
              !pointsToCheck.includes(directionResult.finishedPoint)
            ) {
              console.log("Added point to check", directionResult.finishedPoint);
              pointsToCheck.push(directionResult.finishedPoint);
            }
          }
        });

      checkedPoints.push(point);
      pointsToCheck.shift();
      infiniteLoopPreventer--;
    }
    if (infiniteLoopPreventer > 0) {
      console.log("It works", infiniteLoopPreventer);
    }
    return graphData;
  }

  private giveOppositeDirection(point: "N" | "S" | "E" | "W"): "N" | "S" | "E" | "W" {
    if (point == "N") return "S";
    if (point == "S") return "N";
    if (point == "E") return "W";
    if (point == "W") return "E";
    return point;
  }

  // Will ban opposite direction Given
  private checkPointHelperAddition(
    currentCheckedPoints: mazeMap,
    point: string,
    directionBan: "N" | "S" | "E" | "W"
  ): mazeMap {
    if (currentCheckedPoints[point] === undefined) {
      currentCheckedPoints[point] = {
        N: true,
        E: true,
        W: true,
        S: true
      };
    }
    // false means that it will not check that direction
    if (directionBan == "N") currentCheckedPoints[point].S = false;
    if (directionBan === "S") currentCheckedPoints[point].N = false;
    if (directionBan === "E") currentCheckedPoints[point].W = false;
    if (directionBan === "W") currentCheckedPoints[point].E = false;
    return currentCheckedPoints;
  }

  private isPointDirectionChecked(
    currentCheckedPoints: mazeMap,
    point: string,
    direction: "N" | "S" | "E" | "W"
  ): boolean {
    if (currentCheckedPoints[point] === undefined) return false;
    if (currentCheckedPoints[point][direction] === undefined) return false;
    return !currentCheckedPoints[point][direction];
  }

  private checkNodeDirectionAmount(
    value: any,
    direction: "N" | "S" | "E" | "W",
    mazeMapData: mazeMap,
    startPoint: string,
    max: number
  ) {
    let vectorCheckResult: directionCheck = {
      vectorAmount: 0,
      finishedPoint: startPoint,
      inBetweenPoints: []
    };

    if (value[direction]) {
      vectorCheckResult.vectorAmount += 1; // init with 1
      let neighborPoint: string | undefined = this.findNeighborPoint(startPoint, direction, max);
      while (neighborPoint != undefined) {
        if (mazeMapData[neighborPoint][direction]) {
          vectorCheckResult.vectorAmount += 1;
          vectorCheckResult.finishedPoint = neighborPoint;
          if (vectorCheckResult.vectorAmount > 1) {
            console.log(startPoint, direction, "There might be an in between ");
            let inBetweenPoints: Array<vector> = this.inBetweenHelper(
              mazeMapData,
              neighborPoint,
              direction,
              max
            );
            vectorCheckResult.inBetweenPoints = [
              ...vectorCheckResult.inBetweenPoints,
              ...inBetweenPoints
            ];
          }
          neighborPoint = this.findNeighborPoint(neighborPoint, direction, max);
        } else {
          vectorCheckResult.finishedPoint = neighborPoint;
          neighborPoint = undefined;
        }
      }
    }
    return vectorCheckResult;
  }

  // If in N Or S, check W and E vice versa
  private inBetweenHelper(
    mazeMapData: mazeMap,
    point: string,
    direction: "N" | "S" | "E" | "W",
    max: number
  ): Array<vector> {
    // possiblePoints should not be more than 2
    let possiblePoints: Array<vector> = [];

    if (direction === "N" || direction === "S") {
      if (mazeMapData[point].E) {
        let neighborPont = this.findNeighborPoint(point, "E", max);
        if (neighborPont != undefined)
          possiblePoints.push({
            point: neighborPont,
            directionOrigin: "W"
          });
      }
      if (mazeMapData[point].W) {
        let neighborPont = this.findNeighborPoint(point, "W", max);
        if (neighborPont != undefined)
          possiblePoints.push({
            point: neighborPont,
            directionOrigin: "E"
          });
      }
    }

    if (direction === "W" || direction === "E") {
      if (mazeMapData[point].N) {
        let neighborPont = this.findNeighborPoint(point, "N", max);
        if (neighborPont != undefined)
          possiblePoints.push({
            point: neighborPont,
            directionOrigin: "S"
          });
      }
      if (mazeMapData[point].S) {
        let neighborPont = this.findNeighborPoint(point, "S", max);
        if (neighborPont != undefined)
          possiblePoints.push({
            point: neighborPont,
            directionOrigin: "N"
          });
      }
    }

    return possiblePoints;
  }

  // Returns undefined if point DNE
  private findNeighborPoint(
    point: string,
    direction: "N" | "S" | "E" | "W",
    max: number
  ): string | undefined {
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
    if (neighbor === point) {
      return undefined;
    }
    return neighbor;
  }

  public convertGraphToMazeData(graph: nodes): mazeMap {
    let mazeMapData: mazeMap = {};
    return mazeMapData;
  }
}

interface vector {
  point: string;
  directionOrigin: "N" | "S" | "E" | "W";
}

interface directionCheck {
  vectorAmount: number;
  finishedPoint: string;
  inBetweenPoints: Array<vector>;
}

export interface nodes {
  [key: string]: {
    N: number;
    S: number;
    E: number;
    W: number;
  };
}
