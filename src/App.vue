<template>
  <div id="app">
    <div class="container-fluid mt-1">
      <navbar v-if="dataReady" @generateMazeSession="generateMazeSession" />
      <!-- Todo: should do this automotically, no need to enter button -->
      <button
        v-if="myAccountId == ''"
        @click="createAnonymousAccount()"
        class="ml-1 btn btn-primary btn-sm"
      >Make Account</button>
    </div>

    <div class="container-fluid mt-2 mx-2" v-if="dataReady">
      <maze :playableMaze="playableMaze" :playerCountLimit="Number(playerCountLimit)" />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import bootstrap from "bootstrap";
import moment from "moment";
import { mazeConverter } from "@/converters";

// Components
import maze from "@/components/maze.vue";
import navbar from "@/components/navbar.vue";

// Classes
import { Account } from "@/classes/Account";
import { Player } from "@/classes/Player";
import { Graph, nodes } from "@/classes/Graph";
import { Maze, mazeMap, mazeData } from "@/classes/Maze";
import { firebaseMaze } from "@/classes/DBMaze";

import { firebaseData } from "@/firebaseConfig.ts";

// Store
import store from "@/store/store.ts";
import {
  playerGameSession,
  playerSnapshot,
  playingValue
} from "@/storeModules/fbPlayer";
import accountStore, {
  accountMutationsSchema
} from "@/storeModules/accountStore";

export default Vue.extend({
  name: "app",
  data() {
    return {
      dataReady: false,
      playableMaze: new firebaseMaze([], ""),
      graphMaze: new firebaseMaze([], ""),
      startPostion: String(),
      players: Array<Player>(),
      gameId: String(),
      myAccountId: String(),
      playerName: String(),
      myAccount: new Account(),
      playerCountLimit: 2
    };
  },
  async mounted() {
    this.dataReady = false;
    await firebaseData.auth().onAuthStateChanged(async user => {
      if (user) {
        let account: Account = new Account(user.uid);
        this.myAccount = account;
        this.myAccountId = this.myAccount.returnUid();
        store.commit("accountStore/setMyUid", user.uid);
        if (this.localSession === false) {
          let defaultSessionId: string = "xCDNvSHjpOfb2qU0KZ0D";
          await this.joinMazeSession(defaultSessionId);
        } else {
          this.makeLocalSession(1, 10, 10); //! only works if height and width are the same
          this.dataReady = true;
        }
      } else {
        alert("Make account to play");
      }
    });
  },
  methods: {
    async joinMazeSession(gameId: string) {
      let gameReady = {
        mazeReady: false,
        playerDataReady: false,
        everythingReady: function() {
          let allOk: boolean = false;
          if (this.mazeReady && this.playerDataReady) {
            allOk = true;
          }
          return allOk;
        }
      };

      await store
        .dispatch("getMazeDataOnce", gameId)
        .then((mazeDataResult: firebaseMaze) => {
          this.setMaze(mazeDataResult, gameId);
          gameReady.mazeReady = true;
        })
        .catch(err => {
          console.error(err);
          gameReady.mazeReady = false;
        });

      await store
        .dispatch("subscribeToPlayerMoves", gameId)
        .then(async snapshotResult => {
          await snapshotResult.onSnapshot(async (snapshot: any) => {
            if (snapshot.empty) {
              await this.addPlayerToDB(
                this.startPostion,
                this.myAccountId,
                gameId
              )
                .then(res => {
                  store.commit("accountStore/setMyDocId", res.id);
                  gameReady.playerDataReady = true;
                })
                .catch(err => {
                  console.error(err);
                });
            }

            await snapshot.docChanges().forEach(async (change: any) => {
              this.playerHandler(change.type, change);
              if (this.playableMaze.players.length === snapshot.size) {
                // Checks if you are in the game
                if (this.playableMaze.checkIfPlayerInGame(this.myAccountId)) {
                  let myDocId = this.playableMaze.getDocIdOnAccountId(
                    this.myAccountId
                  );
                  if (myDocId != undefined) {
                    store.commit("accountStore/setMyDocId", myDocId);
                    gameReady.playerDataReady = true;
                  } else {
                    gameReady.playerDataReady = false;
                    alert("Problem getting your data");
                  }
                } else {
                  await this.addPlayerToDB(
                    this.startPostion,
                    this.myAccountId,
                    gameId
                  ).then(res => {
                    store.commit("accountStore/setMyDocId", res.id);
                    gameReady.playerDataReady = true;
                  });
                }
                // Game ready condition must be in here, because this does not have all the players in the first try,
                // So when all players are loaded in check if you are here
                if (gameReady.everythingReady()) {
                  this.dataReady = true;
                }
              }
            });
          });
        })
        .catch(err => {
          console.error(err);
        });
    },
    async createAnonymousAccount() {
      let newAccount: Account = new Account();
      await newAccount.makeAnonymousAccount().then(res => {});
    },
    async generateMazeSession(mazeSize: number) {
      if (mazeSize > 0 && mazeSize < 50) {
        this.dataReady = false;
        let players: Array<Player> = [];
        let mazeId: string = "";
        let newMaze = new firebaseMaze(players, mazeId);
        newMaze.generateMaze(1, mazeSize, mazeSize);
        await store
          .dispatch("makeGameSession", newMaze)
          .then(async mazeDataDoc => {
            this.joinMazeSession(mazeDataDoc.id);
          })
          .catch(err => {
            console.error(err);
            alert("not able to make new maze");
          });
      } else {
        alert("Lower that number.");
      }
    },
    async addPlayerToDB(
      startPosition: string,
      accountId: string,
      gameId: string
    ) {
      let player: Player = new Player(
        startPosition,
        false,
        undefined,
        moment().unix(),
        accountId,
        this.playerName
      );
      let data: playerGameSession = {
        gameId,
        player
      };
      return await store.dispatch("addPlayerToSession", data).catch(err => {
        alert("problem adding you");
      });
    },
    playerHandler(changeType: string, changeDoc: any) {
      if (changeType === "added") {
        let playerData: Player = changeDoc.doc.data();
        let newPlayer: Player = new Player(
          playerData.currentPosition,
          playerData.wonGame,
          changeDoc.doc.id,
          playerData.lastMoveTime,
          playerData.accountId,
          playerData.playerName
        );
        if (
          newPlayer.accountId === store.getters["accountStore/getMyAccountId"]
        )
          store.commit("updateMyPlayerData", newPlayer);
        this.playableMaze.addPlayer(newPlayer);
      }
      if (changeType === "modified") {
        if (changeDoc.doc.id != store.getters["accountStore/getMyDocId"]) {
          let x: number = changeDoc.doc.data().currentPosition.split(",")[0];
          let y: number = changeDoc.doc.data().currentPosition.split(",")[1];
          this.playableMaze.replacePlayerPosition(changeDoc.doc.id, x, y);
          this.playableMaze.updatePlayerName(
            changeDoc.doc.id,
            changeDoc.doc.data().playerName
          );
        }
        // Could do one of two things, add a counter that saves the user that recently won, or when a user changes position, change the value
        if (changeDoc.doc.data().wonGame) {
          let name = changeDoc.doc.data().playerName;
          if (name === undefined) name = "BRUH";
          alert(`This guy,  ${name}, won`);
        }
      }
      if (changeType === "removed") {
        this.playableMaze.removePlayer(changeDoc.doc.id);
      }
    },
    makeLocalSession(solutions: number, height: number, width: number) {
      let players: Array<Player> = [];
      let mazeId: string = "";
      let newMaze = new firebaseMaze(players, mazeId);
      let testDocId: string = "testDocId";
      let myAccountId: string = store.getters["accountStore/getMyAccountId"];

      newMaze.generateMaze(solutions, height, width);
      let myPlayer: Player = new Player(
        newMaze.getStartPosition(),
        false,
        testDocId,
        moment().unix(),
        myAccountId,
        "myName"
      );
      newMaze.addPlayer(myPlayer);
      store.commit("accountStore/setMyDocId", testDocId);
      this.setMaze(newMaze, mazeId);
    },
    setMaze(mazeData: firebaseMaze, mazeId: string) {
      this.playableMaze = mazeData;
      this.startPostion = this.playableMaze.startPosition;
      this.gameId = mazeId;
      store.commit("updateCurrentMaze", mazeData);
    }
  },
  computed: {
    localSession() {
      return store.state.localSession;
    }
  },
  components: {
    maze,
    navbar
  }
});
</script> 
  
<style lang="scss">
@import "~bootstrap/scss/bootstrap";

$grid-columns: 100; // allows bootstrap to have rows and col up to 40 until breaking to new line
</style>