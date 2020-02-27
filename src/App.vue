<template>
  <div id="app">
    <div class="container-fluid mt-2 mx-2" v-if="dataReady">
      <div class="row" v-for="row in playableMaze.width" :key="row">
        <div
          class="col-sm m-0 p-0 border-dark"
          v-for="col in playableMaze.height"
          :class="generateCellClasses(row, col)"
          :key="col"
        >
          <!-- v-if="showPlayer(row, col, )" -->
          <div
            class="p-5"
          >{{showPlayer(showCorrectPoint(row, col), playableMaze.players)}} {{showCorrectPoint(row, col)}}</div>
          <!-- <div v-if="player">Player</div> -->
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import bootstrap from "bootstrap";
import { firebaseData } from "@/firebaseConfig.ts";
import { Maze } from "./classes/mazeClass";
import { Player } from "./classes/playerClass";

export default Vue.extend({
  name: "app",
  data() {
    return {
      playableMaze: new Maze([]),
      dataReady: false,
      tempRow: Number(),
      startPostion: String(),
      players: Array<Player>()
    };
  },
  mounted() {
    let newMaze = new Maze([]);
    newMaze.generateMaze(1, 5, 5);
    this.playableMaze = newMaze;
    this.tempRow = this.playableMaze.height - 1;
    this.startPostion = this.playableMaze.startPosition;
    let testPlayer: Player = this.generatePlayer(
      this.startPostion,
      "randomGeneratePlayerId"
    );
    this.playableMaze.addPlayer(testPlayer);
    this.movePlayer("randomGeneratePlayerId", 1, 0);
    console.log(this.playableMaze.players);
    this.dataReady = true;
  },
  methods: {
    generateCellClasses(x: number, y: number) {
      let correctPoint: string = this.showCorrectPoint(x, y);
      let allClasses: any = {
        "border-top": !this.playableMaze.mazeMap[correctPoint].N,
        "border-right": !this.playableMaze.mazeMap[correctPoint].E,
        "border-bottom": !this.playableMaze.mazeMap[correctPoint].S,
        "border-left": !this.playableMaze.mazeMap[correctPoint].W
      };
      if (this.playableMaze.startPosition === correctPoint) {
        allClasses["startPoint"] = true;
      }
      if (this.playableMaze.endPositions.includes(correctPoint)) {
        allClasses["endPoint"] = true;
      }
      return allClasses;
    },
    showCorrectPoint(row: number, col: number): string {
      return `${col - 1},${Math.abs(row - 1 - this.tempRow)}`;
    },
    showPlayer(correctPoint: string, listOfPLayers: Array<Player>): boolean {
      let playerInPoint: boolean = false;
      listOfPLayers.forEach(player => {
        if (player.getCurrentPosition() == correctPoint) {
          playerInPoint = true;
        }
      });
      return playerInPoint;
    },
    generatePlayer(startPosition: string, playerId: string) {
      let newPlayer: Player = new Player(startPosition, playerId);
      console.log("Made new player ", newPlayer);
      return newPlayer;
    },
    movePlayer(playerId: string, x: number, y: number) {
      this.playableMaze.movePLayer(playerId, x, y);
    }
  }
});
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";
.startPoint {
  background-color: lightblue;
}

.endPoint {
  background-color: lightcoral;
}
</style>
