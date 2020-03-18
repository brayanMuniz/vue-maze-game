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
          <!-- Uncomment next line to show points -->
          {{showCorrectPoint(row, col)}}
          <!-- Could make a new component called myPlayer to only focus on that player when it renders -->
          <!-- Todo: add a green border around input if player is your player -->
          <div class="input-group input-group-sm">
            <input
              @keyup.up="userMove(myDocumentId, 0 ,1)"
              @keyup.down="userMove(myDocumentId, 0 ,-1)"
              @keyup.left="userMove(myDocumentId, -1 ,0)"
              @keyup.right="userMove(myDocumentId, 1 ,0)"
              v-if="showPlayer(showCorrectPoint(row, col), playableMaze.players)"
              class="form-control m-1"
              :class="generatePlayerClasses(row, col)"
              v-model="playerName"
              v-focus="showCorrectPoint(row,col)"
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
import { firebaseMaze } from "../classes/DBMaze";
import { Player } from "../classes/Player";
import { playerMove } from "../storeModules/fbPlayer";
import moment from "moment";
// let vm = this.globalThis;
// Vue.directive("focus", {
//   inserted: (el, binding, vnode) => {
//     if (binding.value === this.playable)
//       if (vnode.context) {
//         console.log(vnode.context.$props.playableMaze.players);
//       }
//     el.focus();
//   }
// });
// ! Leaves behind a trail of the old input player
export default Vue.extend({
  name: "mazeComponent",
  directives: {
    focus: {
      // "this" does not work here so use vnode
      inserted: (el, binding, vnode) => {
        if (vnode.context) {
          if (
            binding.value ===
            vnode.context.$props.playableMaze.getPLayerPosition(
              vnode.context.$props.myDocumentId
            )
          ) {
            el.focus();
          }
        }
      }
    }
  },
  props: {
    playableMaze: firebaseMaze,
    myAccountId: String,
    myDocumentId: String
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
    this.tempRow = this.playableMaze.height - 1;
    this.gameId = this.playableMaze.mazeId; // update propety to gameId
    this.playerMoveTimeCounterLimit = Math.floor(
      (this.playableMaze.height * this.playableMaze.width) / 10
    );
    this.dataReady = true;
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
    async userMove(documentId: string, x: number, y: number) {
      if (this.playableMaze.checkPlayerMove(documentId, x, y)) {
        let newPosition: string = this.playableMaze.movePLayer(
          documentId,
          x,
          y
        );
        let playerMove: playerMove = {
          documentId,
          newPlayerPostion: newPosition,
          gameID: this.gameId
        };
        this.playerMoveCount++;
        this.playerMoveTimeCount++;
        if (this.playerMoveTimeCount == this.playerMoveTimeCounterLimit) {
          await this.lastMoveTimeUpdate(documentId)
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
              console.error(err);
              alert("stop");
            });
        }
      }
    },
    generatePlayer(startPosition: string, id: string) {
      let newPlayer: Player = new Player(startPosition, id);
      return newPlayer;
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
    generatePlayerClasses(x: number, y: number) {
      let formatedPoint: string = this.showCorrectPoint(x, y);
      let myPoint = this.playableMaze.getPLayerPosition(this.myDocumentId);
      let playerClass: any = {
        "bg-success": formatedPoint === myPoint
      };
      return playerClass;
    },
    showCorrectPoint(row: number, col: number): string {
      return `${col - 1},${Math.abs(row - 1 - this.tempRow)}`;
    },
    showPlayer(formatedpoint: string, listOfPLayers: Array<Player>): boolean {
      let playerInPoint: boolean = false;
      listOfPLayers.forEach(player => {
        if (player.getCurrentPosition() === formatedpoint) {
          playerInPoint = true;
        }
      });
      return playerInPoint;
    }
  },
  watch: {
    playableMaze: {
      immediate: true, // the callback will be called immediately after the start of the observation
      deep: true,
      handler(newVal, oldVal) {
        console.log("change in the maze");
        // console.log(newVal, oldVal);
      }
    }
  }
});
</script>

