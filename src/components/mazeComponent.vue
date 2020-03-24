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
          <!-- {{showCorrectPoint(row, col)}} -->
          <div class="input-group input-group-sm">
            <div class="row" v-if="showPlayer(showCorrectPoint(row, col), playableMaze.players)">
              <div
                class="col"
                v-for="player in playersOnPoint(playableMaze.players, showCorrectPoint(row, col))"
                :key="player.accountId"
              >
                <input
                  @keyup.up="userMove(myDocumentId, 0 ,1)"
                  @keyup.down="userMove(myDocumentId, 0 ,-1)"
                  @keyup.left="userMove(myDocumentId, -1 ,0)"
                  @keyup.right="userMove(myDocumentId, 1 ,0)"
                  class="form-control m-1 p-0"
                  :class="generatePlayerClasses(row, col, player)"
                  v-model="playerName"
                  v-focus="showCorrectPoint(row,col)"
                />
              </div>
            </div>
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
export default Vue.extend({
  name: "mazeComponent",
  directives: {
    focus: {
      inserted: (el, binding, vnode) => {
        // "this" does not work here so use vnode
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
    myDocumentId: String,
    playerCountLimit: Number // prop so it can be adjusted by Nav from Root
  },
  data() {
    return {
      dataReady: false,
      tempRow: Number(),
      gameId: String(),
      playerName: String(),
      playerMoveTimeCount: 0,
      playerMoveTimeCounterLimit: Number(), // this will update the lastPlayerMoveField. Dependent on size of maze
      playerMoveCount: 0
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

        // Updates the last time player moved in DB
        if (this.playerMoveTimeCount == this.playerMoveTimeCounterLimit) {
          await this.lastMoveTimeUpdate(documentId)
            .then(res => {
              this.playerMoveTimeCount = 0;
            })
            .catch(err => {});
        }
        // Updates player move in DB
        if (this.playerMoveCount == this.playerCountLimit) {
          await this.movePlayerDB(playerMove)
            .then(res => {
              this.playerMoveCount = 0;
            })
            .catch(err => {
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
    generatePlayerClasses(x: number, y: number, player: Player) {
      let playerClass: any = {
        "bg-success": false
      };
      let formatedPoint: string = this.showCorrectPoint(x, y);
      let myPoint = this.playableMaze.getPLayerPosition(this.myDocumentId);
      if (
        player.getAccountId() === this.myAccountId &&
        formatedPoint === myPoint
      ) {
        playerClass["bg-success"] = true;
      }

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
    },
    playersOnPoint(listOfPLayers: Array<Player>, point: string): Array<Player> {
      let playersThere: Array<Player> = [];
      listOfPLayers.forEach(player => {
        if (player.getCurrentPosition() === point) {
          playersThere.push(player);
        }
      });
      return playersThere;
    }
  }
});
</script>

