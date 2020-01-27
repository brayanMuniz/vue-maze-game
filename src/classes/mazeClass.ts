import { GeoPoint } from "@/types/playerType";
import { simplePoint } from "@/types/mazeType";
import { Player } from "./playerClass";

export class Maze {
  startPosition: GeoPoint;
  endPosition: GeoPoint;
  map: Array<Array<simplePoint>>;
  players: Array<Player>;

  constructor(
    startPosition: GeoPoint,
    endPosition: GeoPoint,
    map: Array<Array<simplePoint>>,
    players: Array<Player>
  ) {
    this.startPosition = startPosition;
    this.endPosition = endPosition;
    this.map = map;
    this.players = players;
  }

  addPlayers(player: Player) {}

  movePLayer(player: Player, oldPosition: GeoPoint, newPosition: GeoPoint) {}
}
