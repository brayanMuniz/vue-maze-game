<template>
  <div v-if="dataReady">
    <div class="row" v-for="row in playableMaze.width" :key="row">
      <div
        class="col-sm m-0 p-0 border-dark"
        v-for="col in playableMaze.height"
        :class="generateCellClasses(row, col)"
        :key="col"
      >
        <div class="p-3">
          <!-- Uncomment this line to show points {{showCorrectPoint(row, col)}} -->
          <div class="input-group input-group-sm">
            <input
              @keyup.up="movePlayer(myPlayerId, 0 ,1)"
              @keyup.down="movePlayer(myPlayerId, 0 ,-1)"
              @keyup.left="movePlayer(myPlayerId, -1 ,0)"
              @keyup.right="movePlayer(myPlayerId, 1 ,0)"
              v-if="showPlayer(showCorrectPoint(row, col), playableMaze.players)"
              v-focus
              class="form-control m-0"
              v-model="playerName"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import store from "@/store/store.ts";
import { firebaseMaze } from "../classes/dbMazeClass";
import { Player } from "../classes/playerClass";
import { playerMove } from "../storeModules/fbPlayer";
import moment from "moment";
Vue.directive("focus", {
  inserted: function(el) {
    el.focus();
  }
});
export default Vue.extend({
  name: "mazeComponent",
  props: {
    playableMaze: firebaseMaze,
    myPlayerId: String
  },
  data() {
    return {
      dataReady: false,
      tempRow: Number(),
      gameId: String(),
      playerName: String(),
      playerMoveTimeCount: 0,
      playerMoveTimeCounterLimit: Number(), // this will update the lastPlayerMoveField. Dependent on size of maze
      playerMoveCount: 0,
      playerCountLimit: 3
    };
  },
  mounted() {
    this.dataReady = true;
    this.tempRow = this.playableMaze.height - 1;
    this.gameId = this.playableMaze.mazeId; // update propety to gameId
    this.playerMoveTimeCounterLimit = Math.floor(
      (this.playableMaze.height * this.playableMaze.width) / 10
    );
  },
  methods: {
    async movePlayerDB(newMove: playerMove) {
      return store.dispatch("sendPlayerMove", newMove);
    },
    async lastMoveTimeUpdate(playerId: string) {
      let payload = {
        playerId,
        gameId: this.gameId,
        newLastMoveTimeSeconds: moment().unix()
      };
      return store.dispatch("updatePlayerLastMoveTime", payload);
    },
    addPLayerToMaze(player: Player) {
      this.playableMaze.addPlayer(player);
    },
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
    generatePlayer(startPosition: string, id: string) {
      let newPlayer: Player = new Player(startPosition, id);
      return newPlayer;
    },
    async movePlayer(playerId: string, x: number, y: number) {
      if (this.playableMaze.checkPlayerMove(playerId, x, y)) {
        let newPosition: string = this.playableMaze.movePLayer(playerId, x, y);
        let playerMove: playerMove = {
          playerId,
          newPlayerPostion: newPosition,
          gameID: this.gameId
        };
        this.playerMoveCount++;
        this.playerMoveTimeCount++;
        if (this.playerMoveTimeCount == this.playerMoveTimeCounterLimit) {
          await this.lastMoveTimeUpdate(playerId)
            .then(res => {
              this.playerMoveTimeCount = 0;
              console.log("Time Move Update DB");
            })
            .catch(err => {
              console.error(err);
            });
        }
        if (this.playerMoveCount == this.playerCountLimit) {
          await this.movePlayerDB(playerMove)
            .then(res => {
              this.playerMoveCount = 0;
              console.log("Move Update DB");
            })
            .catch(err => {
              alert("stop");
            });
        }
      }
    }
  }
});
</script>

