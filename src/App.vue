<template>
  <div id="app">
    <div class="container">
      <button @click="generateMazeSession()">startSession</button>
      <!-- AntWnn37HeSw4xRPy2s3, 241m776ej6r17eunsAq9 -->
      <div class="input-group input-group-sm">
        <input type="text" placeholder="sessionId" v-model.trim="sessionId" class="form-control" />
        <input type="text" placeholder="plyerName" v-model="playerName" class="form-control" />
      </div>
      <button @click="joinSession(sessionId)">Join Game</button>
      <button @click="addPlayerToDB( playableMaze.players[0], sessionId)">addPlayer</button>
      <button @click="updatePlayerName(sessionId, myPlayerId, playerName)">updatePlayerName</button>
    </div>
    <div class="container-fluid mt-2 mx-2" v-if="dataReady">
      <mazeComponent :playableMaze="playableMaze" :myPlayerId="myPlayerId" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import bootstrap from "bootstrap";
import store from "@/store/store.ts";
import mazeComponent from "@/components/mazeComponent.vue";
import { firebaseData } from "@/firebaseConfig.ts";
import { Player } from "./classes/Player";
import {
  playerGameSession,
  playerSnapshot,
  playingValue
} from "./storeModules/fbPlayer";
import { Maze } from "./classes/BaseMaze";
import { firebaseMaze } from "./classes/DBMaze";
import moment from "moment";
Vue.directive("focus", {
  inserted: function(el) {
    el.focus();
  }
});
// Main Problem: difference in time.
// Check: dont send the amonut of blocks to fb
// Part 1:
// look for a player that is not in use and has the current position to starting position
// make your playerId
// if no such player generate player and add to maze
// Part 2:
// add property to player class that is a firebase snapshot to listen to player updates in realtime
export default Vue.extend({
  name: "app",
  data() {
    return {
      localSession: true,
      dataReady: false,
      playableMaze: new firebaseMaze([], ""),
      startPostion: String(),
      players: Array<Player>(),
      sessionId: String(),
      myPlayerId: String(),
      playerName: String()
    };
  },
  async mounted() {
    if (!this.localSession) {
      let defaultSession: string = "241m776ej6r17eunsAq9";
      let allPlayers: Array<Player> = [];
      // Todo: make gameReady an interface

      let gameReady = {
        mazeReady: false,
        playerDataReady: false,
        userReady: false,
        playerMovesReady: true
      };

      await this.joinSession(defaultSession)
        .then((mazeDataResult: firebaseMaze) => {
          this.setMaze(mazeDataResult, defaultSession); // This should run after all conditions are met
          gameReady.mazeReady = true;
        })
        .catch(err => {
          gameReady.mazeReady = false;
          console.error(err);
        });

      await this.getPlayersFromSession(defaultSession)
        .then(playerSnapshot => {
          playerSnapshot.forEach((playerDoc: playerSnapshot) => {
            let newPlayer: Player = new Player(
              playerDoc.data().currentPosition,
              playerDoc.id,
              playerDoc.data().currentlyPlaying,
              playerDoc.data().lastMoveTime
            );
            console.log(newPlayer);
            allPlayers.push(newPlayer);
          });
          this.playableMaze.replacePlayers(allPlayers);
          gameReady.playerDataReady = true;
        })
        .catch(err => {
          console.error(err);
        });

      if (this.myPlayerId == "") {
        let unusedPlayerId: string = this.playableMaze.returnUnusedPlayerId();
        console.log("Unused Player Id:", unusedPlayerId);
        if (unusedPlayerId == "") {
          let newPlayer: Player = new Player(
            this.startPostion,
            "",
            true,
            moment().unix()
          );
          await this.addPlayerToDB(newPlayer, defaultSession)
            .then(res => {
              console.log("You are using a player", res.id);
            })
            .catch(err => {
              console.log(
                "You are not using a player, The maze is not playable."
              );

              console.log(err);
            });
          // make a new player and add it to the maze
        } else {
          this.changePlayerValue(
            true,
            unusedPlayerId,
            defaultSession,
            moment().unix()
          )
            .then(userReady => {
              gameReady.userReady = true;
              this.myPlayerId = unusedPlayerId;
              console.log("now using player", this.myPlayerId);
            })
            .catch(err => {
              console.error(err);
              gameReady.userReady = false;
            });
        }
      }

      if (gameReady.mazeReady && gameReady.playerDataReady) {
        this.dataReady = true;
      }
    }
    // Todo: add and make these functions, but man im tired so later.
    // await firebaseData.auth().onAuthStateChanged(user => {
    //   if (user) {
    //     this.$store.commit("setUserAuth");
    //     if (this.userHasNoData()) {
    //       this.getUserData()
    //         .then(userDataGotten => {
    //           this.$store.commit("setUserData", userDataGotten);
    //         })
    //         .catch(err => {
    //           console.log("TCL: beforeCreate -> err", err);
    //         });
    //     }
    //   } else {
    //     this.$store.commit("clearUser");
    //   }
    // });
  },
  methods: {
    async generateMazeSession() {
      this.dataReady = false;
      let players: Array<Player> = [];
      let mazeId: string = "";
      let newMaze = new firebaseMaze(players, mazeId);
      newMaze.generateMaze(1, 11, 11);
      this.playableMaze = newMaze;
      this.startPostion = this.playableMaze.startPosition;
      await store
        .dispatch("makeGameSession", this.playableMaze)
        .then(async mazeDataDoc => {
          this.sessionId = mazeDataDoc.id;
          let defaultPlayerId = "";
          let newPlayer: Player = this.generatePlayer(
            this.startPostion,
            defaultPlayerId
          );
          this.playableMaze.addPlayer(newPlayer);
          await this.addPlayerToDB(newPlayer, this.sessionId).then(
            playerDoc => {
              this.myPlayerId = playerDoc.id;
              this.playableMaze.changePlayerId(
                defaultPlayerId,
                this.myPlayerId
              );
              console.log(this.playableMaze);
              this.dataReady = true;
            }
          );
        })
        .catch(err => {
          console.log(err);
          alert("help");
        });
    },
    async joinSession(sessionId: string) {
      this.dataReady = false;
      return await store.dispatch("getMazeDataOnce", sessionId);
    },
    async getPlayersFromSession(sessionId: string) {
      return await store.dispatch("getPlayerData", sessionId);
    },
    async addPlayerToDB(player: Player, mazeId: string) {
      let data: playerGameSession = {
        gameId: mazeId,
        player: player
      };
      return await store.dispatch("addPlayerToSession", data).catch(err => {
        console.error(err);
      });
    },
    async changePlayerValue(
      playingValue: boolean,
      playerId: string,
      gameId: string,
      lastMoveTime: number
    ) {
      let newPlayerValue: playingValue = {
        playingValue,
        gameId,
        playerId,
        lastMoveTime
      };
      return store.dispatch("updatePlayerValue", newPlayerValue);
    },
    async updatePlayerName(
      gameId: string,
      playerId: string,
      newPLayerName: string
    ) {
      if (gameId && playerId && newPLayerName) {
        console.log(gameId, playerId, newPLayerName);
        return await store.dispatch("updatePlayerName", {
          gameId,
          playerId,
          newPLayerName
        });
      }
    },
    setMaze(mazeData: firebaseMaze, mazeId: string) {
      this.playableMaze = mazeData;
      this.startPostion = this.playableMaze.startPosition;
      this.sessionId = mazeId;
    },
    generatePlayer(startPosition: string, id: string) {
      let newPlayer: Player = new Player(startPosition, id);
      return newPlayer;
    }
  },
  components: {
    mazeComponent
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
