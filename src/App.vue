<template>
  <div id="app">
    <div class="container-fluid">
      <!-- AntWnn37HeSw4xRPy2s3, 241m776ej6r17eunsAq9 -->
      <div class="input-group input-group-sm">
        <!-- <button
          @click="updatePlayerName(sessionId, myDocumentId, playerName)"
          class="btn btn-primary btn-sm"
        >Update Name</button>
        <input type="text" placeholder="Player Name" v-model="playerName" class="form-control" />-->
        <button @click="joinMazeSession(sessionId)" class="ml-1 btn btn-primary btn-sm">Join Game</button>
        <input type="text" placeholder="sessionId" v-model.trim="sessionId" class="form-control" />
        <button @click="generateMazeSession()" class="ml-1 btn btn-primary btn-sm">New Game</button>
      </div>
      <button
        v-if="myAccountId == ''"
        @click="createAnonymousAccount()"
        class="ml-1 btn btn-primary btn-sm"
      >Make Account</button>
    </div>
    <div class="container-fluid mt-2 mx-2" v-if="dataReady">
      <mazeComponent
        :playableMaze="playableMaze"
        :myAccountId="myAccountId"
        :myDocumentId="myDocumentId"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import bootstrap from "bootstrap";
import store from "@/store/store.ts";
import mazeComponent from "@/components/mazeComponent.vue";
import { Account } from "@/classes/Account";
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
      myAccountId: String(),
      myDocumentId: String(),
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
        let testSessionId: string = "241m776ej6r17eunsAq9";
        await this.joinMazeSession(testSessionId);
      } else {
        alert("Make account to play");
      }
    });
  },
  methods: {
    playerHandler(changeType: string, changeDoc: any) {
      if (changeType === "added") {
        let playerData: Player = changeDoc.doc.data();
        let newPlayer: Player = new Player(
          playerData.currentPosition,
          changeDoc.doc.id,
          playerData.lastMoveTime,
          playerData.accountId
        );
        this.playableMaze.addPlayer(newPlayer);
      }
      if (changeType === "modified") {
        if (changeDoc.doc.id != this.myDocumentId) {
          let x: number = changeDoc.doc.data().currentPosition.split(",")[0];
          let y: number = changeDoc.doc.data().currentPosition.split(",")[1];
          this.playableMaze.replacePlayerPosition(changeDoc.doc.id, x, y);
        }
      }
      if (changeType === "removed") {
        this.playableMaze.removePlayer(changeDoc.doc.id);
      }
    },
    async joinMazeSession(gameId: string) {
      let gameReady = {
        mazeReady: false,
        playerDataReady: false
      };
      await this.getMazeData(gameId)
        .then((mazeDataResult: firebaseMaze) => {
          this.setMaze(mazeDataResult, gameId);
          gameReady.mazeReady = true;
        })
        .catch(err => {
          gameReady.mazeReady = false;
          console.error(err);
        });

      await this.listenPlayerMoves(gameId).then(async snapshotResult => {
        await snapshotResult.onSnapshot(async (snapshot: any) => {
          if (snapshot.empty) {
            await this.addPlayerToDB(
              this.startPostion,
              this.myAccountId,
              gameId
            ).then(res => {
              this.myDocumentId = res.id;
              gameReady.playerDataReady = true;
            });
          }

          await snapshot.docChanges().forEach(async (change: any) => {
            this.dataReady = false;
            this.playerHandler(change.type, change);
            // All players are accounted for
            if (this.playableMaze.players.length === snapshot.size) {
              if (this.playableMaze.checkIfPlayerInGame(this.myAccountId)) {
                let myDocId = this.playableMaze.getDocIdOnAccountId(
                  this.myAccountId
                );
                if (myDocId != undefined) {
                  this.myDocumentId = myDocId;
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
                  this.myDocumentId = res.id;
                  gameReady.playerDataReady = true;
                });
              }
            }

            if (gameReady.mazeReady && gameReady.playerDataReady) {
              this.dataReady = true;
            }
          });
        });
      });
    },
    async listenPlayerMoves(gameId: string) {
      let payload = {
        gameId
      };

      return await store.dispatch("subscribeToPlayerMoves", payload);
    },
    async createAnonymousAccount() {
      let newAccount: Account = new Account();
      await newAccount.makeAnonymousAccount().then(res => {
      });
    },
    // Todo: fix this, FirebaseError: No document to update: projects/maze-game-data/databases/(default)/
    async generateMazeSession() {
      this.dataReady = false;
      let players: Array<Player> = [];
      let mazeId: string = "";
      let newMaze = new firebaseMaze(players, mazeId);
      newMaze.generateMaze(1, 11, 11);
      await store
        .dispatch("makeGameSession", newMaze)
        .then(async mazeDataDoc => {
          this.joinMazeSession(mazeDataDoc.id);
        })
        .catch(err => {
          alert("help");
        });
    },
    async getMazeData(sessionId: string) {
      return await store.dispatch("getMazeDataOnce", sessionId);
    },
    async addPlayerToDB(
      startPosition: string,
      accountId: string,
      gameId: string
    ) {
      let player: Player = new Player(
        startPosition,
        undefined,
        moment().unix(),
        accountId
      );
      let data: playerGameSession = {
        gameId,
        player
      };
      return await store.dispatch("addPlayerToSession", data).catch(err => {
        console.error(err);
      });
    },
    // Todo: does not work because fieldName playerName does not exist. Update DB schema for capabilites
    async updatePlayerName(
      gameId: string,
      playerDoc: string,
      newPLayerName: string
    ) {
      if (
        gameId != undefined &&
        playerDoc != undefined &&
        newPLayerName != undefined
      ) {
        return await store.dispatch("updatePlayerName", {
          gameId,
          playerDoc,
          newPLayerName
        });
      }
    },
    setMaze(mazeData: firebaseMaze, mazeId: string) {
      this.playableMaze = mazeData;
      this.startPostion = this.playableMaze.startPosition;
      this.sessionId = mazeId;
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