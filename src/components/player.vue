<template>
  <div>
    <input
      @keyup.up="userMove(myAccountUid, 0 ,1)"
      @keyup.down="userMove(myAccountUid, 0 ,-1)"
      @keyup.left="userMove(myAccountUid, -1 ,0)"
      @keyup.right="userMove(myAccountUid, 1 ,0)"
      class="form-control m-1 p-0"
      :class="generatePlayerClasses()"
      v-model="playerName"
      v-focus="returnCurrentPointHelper(player.currentPosition)"
    />
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import moment from "moment";
// Store
import store from "@/store/store.ts";
import { playerMove } from "@/storeModules/fbPlayer";
// Classes
import { firebaseMaze } from "@/classes/DBMaze";
import { Player } from "@/classes/Player";

export default Vue.extend({
  name: "playerComponent",
  directives: {
    focus: {
      inserted: (el, binding, vnode) => {
        if (vnode.context) {
          let currentMaze: firebaseMaze = store.getters.getCurrentMaze;
          let accountUid: string = store.getters["accountStore/getMyAccountId"];
          let myCurrentPosition: string = currentMaze.getPLayerPosition(
            accountUid
          );
          if (binding.value === myCurrentPosition) {
            el.focus();
          }
        }
      }
    }
  },
  props: {
    playerCountLimit: Number,
    player: Object,
    gameId: String
  },
  data() {
    return {
      dataReady: false,
      playerName: String(),
      playerMoveTimeCount: 0,
      playerMoveTimeCounterLimit: Number(),
      playerMoveCount: 0,
      myAccountUid: store.getters["accountStore/getMyAccountId"]
    };
  },
  mounted() {
    if (this.myAccountUid === "" || this.myAccountUid === undefined) {
      this.myAccountUid = store.getters["accountStore/getMyAccountId"];
    }
    this.playerName = this.player.getPlayerName();
  },
  methods: {
    async userMove(accountUid: string, x: number, y: number) {
      let currentMaze: firebaseMaze = store.getters.getCurrentMaze;

      if (currentMaze.checkPlayerMove(accountUid, x, y)) {
        let playerMove: playerMove = {
          accountUid,
          newPlayerPostion: currentMaze.movePLayer(accountUid, x, y),
          gameID: this.gameId
        };

        store.commit("updatePlayerMoveCount", 1);
        let playerMoveCount: number = store.getters.getPlayerMoveCount;
        if (playerMoveCount === store.getters.getLimitForMoveCounter) {
          await store
            .dispatch("sendPlayerMove", playerMove)
            .then(res => {
              store.commit("updatePlayerMoveCount", -playerMoveCount);
            })
            .catch(err => {
              alert("stop");
            });
        }
        let playerAtEnd: boolean = currentMaze.checkPlayerReachedEnd(
          this.player
        );

        if (playerAtEnd) {
          let payload: any = {
            gameId: currentMaze.getGameId(),
            playerId: this.player.getAccountId(),
            win: true
          };
          store.dispatch("changePlayerWinStatus", payload);
        }

        if (!playerAtEnd && store.getters.getMyPLayerData.wonGame) {
          let payload: any = {
            gameId: currentMaze.getGameId(),
            playerId: this.player.getAccountId(),
            win: false
          };
          store.dispatch("changePlayerWinStatus", payload);
        }
      }
    },
    generatePlayerClasses() {
      let currentMaze: firebaseMaze = store.getters.getCurrentMaze;
      let playerClass: any = {
        "bg-success": false
      };

      let myPoint = currentMaze.getPLayerPosition(
        store.getters["accountStore/getMyAccountId"]
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
  },
  computed: {
    getPlayerMoveCounterLimit() {
      return store.getters.getLimitForMoveCounter;
    }
  }
});
</script>

