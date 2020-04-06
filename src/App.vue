<template>
  <div id="app">
    <!-- Todo: seperate into own compoentn  -->
    <div class="container-fluid mt-1">
      <div class="input-group input-group-sm" v-if="!localSession">
        <div class="input-group-prepend">
          <span class="input-group-text" id="basic-addon1">Session Id:</span>
        </div>
        <input type="text" placeholder="sessionId" v-model.trim="sessionId" class="form-control" />
        <button @click="joinMazeSession(sessionId)" class="mr-1 btn btn-primary btn-sm">Join Game</button>
        <div class="input-group-prepend">
          <span class="input-group-text" id="basic-addon1">Update/Turn:</span>
        </div>
        <input
          type="number"
          placeholder="Steps To DB"
          v-model="playerCountLimit"
          class="form-control mr-1"
        />
        <div class="input-group-prepend">
          <span class="input-group-text" id="basic-addon1">Name:</span>
        </div>
        <input type="text" placeholder="Name" v-model="playerName" class="form-control" />
        <button
          @click="updatePlayerName(sessionId, playerName)"
          class="btn btn-primary btn-sm"
        >Update Name</button>
        <button @click="generateMazeSession()" class="ml-1 btn btn-primary btn-sm">New Game</button>
      </div>
      <button
        v-if="myAccountId == ''"
        @click="createAnonymousAccount()"
        class="ml-1 btn btn-primary btn-sm"
      >Make Account</button>
    </div>

    <div class="container-fluid mt-2 mx-2" v-if="dataReady">
      <mazeComponent :playableMaze="playableMaze" :playerCountLimit="Number(playerCountLimit)" />
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
import { Maze } from "./classes/Maze";
import { firebaseMaze } from "./classes/DBMaze";
import accountStore, {
  accountMutationsSchema
} from "@/storeModules/accountStore";
import moment from "moment";
export default Vue.extend({
  name: "app",
  data() {
    return {
      localSession: false,
      dataReady: false,
      playableMaze: new firebaseMaze([], ""),
      startPostion: String(),
      players: Array<Player>(),
      sessionId: String(),
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
          let testSessionId: string = "1S7dFv7uzKtoPpgOh9En";
          await this.joinMazeSession(testSessionId);
        } else {
          this.makeLocalSession(1, 12, 12); //! only works if height and width are the same
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
      await this.getMazeData(gameId)
        .then((mazeDataResult: firebaseMaze) => {
          this.setMaze(mazeDataResult, gameId);
          gameReady.mazeReady = true;
        })
        .catch(err => {
          console.log(err);
          gameReady.mazeReady = false;
        });

      await this.listenPlayerMoves(gameId)
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
              // ! line was causing problms this.dataReady = false;
              this.playerHandler(change.type, change);
              // All players are accounted for
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
        .catch(err => {});
    },
    async listenPlayerMoves(gameId: string) {
      let payload = {
        gameId
      };

      return await store.dispatch("subscribeToPlayerMoves", payload);
    },
    async createAnonymousAccount() {
      let newAccount: Account = new Account();
      await newAccount.makeAnonymousAccount().then(res => {});
    },
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
    async updatePlayerName(gameId: string, newPlayerName: string) {
      let playerDoc: string = store.getters["accountStore/getMyDocId"];
      if (
        gameId != undefined &&
        playerDoc != undefined &&
        newPlayerName != undefined
      ) {
        await store
          .dispatch("updatePlayerName", {
            gameId,
            playerDoc,
            newPlayerName
          })
          .then(res => {
            console.log("Updated PlayerName");
            this.playerName = newPlayerName;
          })
          .catch(err => {
            alert("Err happen, but dont worry about it.");
          });
      }
    },
    playerHandler(changeType: string, changeDoc: any) {
      if (changeType === "added") {
        let playerData: Player = changeDoc.doc.data();
        let newPlayer: Player = new Player(
          playerData.currentPosition,
          changeDoc.doc.id,
          playerData.lastMoveTime,
          playerData.accountId,
          playerData.playerName
        );
        this.playableMaze.addPlayer(newPlayer);
      }
      if (changeType === "modified") {
        console.log("change");
        if (changeDoc.doc.id != store.getters["accountStore/getMyDocId"]) {
          let x: number = changeDoc.doc.data().currentPosition.split(",")[0];
          let y: number = changeDoc.doc.data().currentPosition.split(",")[1];
          this.playableMaze.replacePlayerPosition(changeDoc.doc.id, x, y);
          this.playableMaze.updatePlayerName(
            changeDoc.doc.id,
            changeDoc.doc.data().playerName
          );
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
      this.sessionId = mazeId;
      store.commit("updateCurrentMaze", mazeData);
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