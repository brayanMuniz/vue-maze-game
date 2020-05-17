<template>
  <div id="app">
    <div class="container-fluid mt-1">
      <navbar
        v-if="dataReady"
        @generateMazeSession="generateMazeSession"
        @joinMazeSession="joinMazeSession"
      />
    </div>

    <div class="container-fluid mt-2 mx-2" v-if="dataReady">
      <maze :playableMaze="playableMaze" />
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

export default Vue.extend({
  name: "app",
  data() {
    return {
      dataReady: false,
      playableMaze: new firebaseMaze([], ""),
      startPostion: String(),
      gameId: String(),
      myAccountId: String(),
      playerName: String(),
      myAccount: new Account()
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
          let defaultSessionId: string = "xVkrepqPr6Gg6YpkdaUS";
          await this.joinMazeSession(defaultSessionId);
        } else {
          this.makeLocalSession(1, 10, 10);
          this.dataReady = true;
        }
      } else {
        this.createAnonymousAccount();
      }
    });
  },
  methods: {
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
    async joinMazeSession(gameId: string) {
      let gameReady = {
        mazeReady: false,
        playerDataReady: false,
        everythingReady: function() {
          return this.mazeReady && this.playerDataReady;
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
              await this.addPlayerToDB(this.startPostion, gameId)
                .then(res => {
                  gameReady.playerDataReady = true;
                })
                .catch(err => {
                  console.error(err);
                });
            }

            await snapshot.docChanges().forEach(async (change: any) => {
              this.playerHandler(change.type, change);
              if (this.playableMaze.players.length === snapshot.size) {
                if (!this.playableMaze.checkIfPlayerInGame(this.myAccountId)) {
                  await this.addPlayerToDB(this.startPostion, gameId).then(
                    res => {
                      gameReady.playerDataReady = true;
                    }
                  );
                }
                this.dataReady = true;
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
    async addPlayerToDB(startPosition: string, gameId: string) {
      let accountId: string = store.getters["accountStore/getMyAccountId"];
      console.log(accountId);
      let player: Player = new Player(
        startPosition,
        false,
        accountId,
        this.playerName
      );
      let data: playerGameSession = {
        gameId,
        player
      };
      if (accountId != "" || accountId != undefined)
        return await store.dispatch("addPlayerToSession", data).catch(err => {
          console.error(err);
          alert("problem adding you");
        });
    },
    async createAnonymousAccount() {
      let newAccount: Account = new Account();
      await newAccount.makeAnonymousAccount().then(res => {
        console.log("Made an account, sneaky");
      });
    },
    playerHandler(changeType: string, changeDoc: any) {
      if (changeType === "added") {
        let playerData: Player = changeDoc.doc.data();
        let newPlayer: Player = new Player(
          playerData.currentPosition,
          playerData.wonGame,
          changeDoc.doc.id,
          playerData.playerName
        );
        if (
          newPlayer.getAccountId() ===
          store.getters["accountStore/getMyAccountId"]
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
        "",
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
    localSession(): boolean {
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
$grid-columns: 100;
</style>