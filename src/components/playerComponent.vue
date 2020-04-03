<template>
  <div>
    <input
      @keyup.up="userMove(myDocumentId, 0 ,1)"
      @keyup.down="userMove(myDocumentId, 0 ,-1)"
      @keyup.left="userMove(myDocumentId, -1 ,0)"
      @keyup.right="userMove(myDocumentId, 1 ,0)"
      class="form-control m-1 p-0"
      :class="generatePlayerClasses()"
      v-model="playerName"
      v-focus="returnCurrentPointHelper(player.currentPosition)"
    />
  </div>
</template>
<script lang="ts">
// Todo: make localSession a global state variable to not get weird bugs
import Vue from "vue";
import store from "@/store/store.ts";
import { firebaseMaze } from "../classes/DBMaze";
import { Player } from "../classes/Player";
import { playerMove } from "../storeModules/fbPlayer";
import moment from "moment";
export default Vue.extend({
  name: "playerComponent",
  directives: {
    focus: {
      inserted: (el, binding, vnode) => {
        // Global "this" does not work here: so use vnode
        if (vnode.context) {
          let currentMaze: firebaseMaze = store.getters.getCurrentMaze;
          let myDocId = store.getters["accountStore/getMyDocId"];
          let myCurrentPosition: string = currentMaze.getPLayerPosition(
            myDocId
          );
          // if the binding value of input is the same value as your current player FOCUS
          if (binding.value === myCurrentPosition) {
            el.focus();
          }
        }
      }
    }
  },
  props: {
    playerCountLimit: Number,
    player: Object
  },
  data() {
    return {
      dataReady: false,
      gameId: String(),
      playerName: String(),
      playerMoveTimeCount: 0,
      playerMoveTimeCounterLimit: Number(),
      playerMoveCount: 0,
      myDocumentId: String()
    };
  },
  mounted() {
    this.myDocumentId = store.getters["accountStore/getMyDocId"];
    this.playerName = this.player.getPlayerName();
    console.log(this.player);
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
      let currentMaze: firebaseMaze = store.getters.getCurrentMaze;
      if (currentMaze.checkPlayerMove(documentId, x, y)) {
        let newPosition: string = currentMaze.movePLayer(documentId, x, y);
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
    generatePlayerClasses() {
      let currentMaze: firebaseMaze = store.getters.getCurrentMaze;
      let playerClass: any = {
        "bg-success": false
      };

      let myPoint = currentMaze.getPLayerPosition(
        store.getters["accountStore/getMyDocId"]
      );
      if (
        this.player.getAccountId() ===
          store.getters["accountStore/getMyAccountId"] &&
        this.player.currentPosition === myPoint
      ) {
        playerClass["bg-success"] = true;
      }

      return playerClass;
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
    },
    returnCurrentPointHelper(point: string) {
      return point;
    }
  }
});
</script>

