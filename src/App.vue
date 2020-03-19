<template>
  <div id="app">
    <div class="container">
      <button @click="generateMazeSession()">startSession</button>
      <!-- AntWnn37HeSw4xRPy2s3, 241m776ej6r17eunsAq9 -->
      <div class="input-group input-group-sm">
        <input type="text" placeholder="sessionId" v-model.trim="sessionId" class="form-control" />
        <input type="text" placeholder="plyerName" v-model="playerName" class="form-control" />
      </div>
      <button @click="getMazeData(sessionId)">Join Game</button>
      <!-- Abstract this  -->
      <!-- <button @click="updatePlayerName(sessionId, myAccountId, playerName)">updatePlayerName</button>-->
      <button v-if="myAccountId == ''" @click="createAnonymousAccount()">Make Account</button>
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
        console.log("Account ID is", this.myAccountId);
        let testSessionId: string = "241m776ej6r17eunsAq9";
        let allPlayers: Array<Player> = [];

        let gameReady = {
          mazeReady: false,
          playerDataReady: false,
          userReady: false,
          playerMovesReady: true
        };

        await this.getMazeData(testSessionId)
          .then((mazeDataResult: firebaseMaze) => {
            this.setMaze(mazeDataResult, testSessionId); // This should run after all conditions are met
            gameReady.mazeReady = true;
          })
          .catch(err => {
            gameReady.mazeReady = false;
            console.error(err);
          });

        this.listenPlayerMoves(testSessionId).then(async snapshotResult => {
          await snapshotResult.onSnapshot(async (snapshot: any) => {
            // Add player change doc type interface
            await snapshot.docChanges().forEach(async (change: any) => {
              this.dataReady = false;
              this.playerHandler(change.type, change);
              // Make sure all the players are loaded in before checking if user in the game
              if (this.playableMaze.players.length === snapshot.size) {
                if (this.playableMaze.checkIfPlayerInGame(this.myAccountId)) {
                  let myDocId = this.playableMaze.getDocIdOnAccountId(
                    this.myAccountId
                  );
                  if (myDocId != undefined) {
                    this.myDocumentId = myDocId;
                    console.log("Your doc Id is ", this.myDocumentId);
                    gameReady.playerDataReady = true;
                    console.log("IN THE GAME");
                  } else {
                    gameReady.playerDataReady = false;
                    console.log("Problem getting your document Id");
                  }
                } else {
                  console.log("NOT IN THE GAME");
                  console.log("Adding new player to the maze");
                  let newPLayer: Player = new Player(
                    this.startPostion,
                    undefined,
                    moment().unix(),
                    this.myAccountId
                  );
                  await this.addPlayerToDB(newPLayer, testSessionId).then(
                    res => {
                      gameReady.playerDataReady = true;
                      console.log("You are addded to maze session");
                    }
                  );
                }
              }

              if (gameReady.mazeReady && gameReady.playerDataReady) {
                this.dataReady = true;
              }
            });
          });
        });
      } else {
        console.log("Signed Out");
      }
    });
  },
  methods: {
    playerHandler(changeType: string, changeDoc: any) {
      if (changeType === "added") {
        console.log("New Player: ", changeDoc.doc.id);
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
          console.log("Modified PLayer: ", changeDoc.doc.id);
          let x: number = changeDoc.doc.data().currentPosition.split(",")[0];
          let y: number = changeDoc.doc.data().currentPosition.split(",")[1];
          console.log(x, y);
          this.playableMaze.replacePlayerPosition(changeDoc.doc.id, x, y);
        }
      }
      if (changeType === "removed") {
        this.playableMaze.removePlayer(changeDoc.doc.id);
        console.log("Removed PLayer: ", changeDoc.doc.id);
      }
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
        console.log(res);
      });
    },
    async generateMazeSession() {
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
          let myUid = this.myAccount.returnUid();
          let newPlayer: Player = new Player(this.startPostion, myUid);
          this.playableMaze.addPlayer(newPlayer);
          await this.addPlayerToDB(newPlayer, this.sessionId).then(
            playerDoc => {
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
    async getMazeData(sessionId: string) {
      return await store.dispatch("getMazeDataOnce", sessionId);
    },
    async addPlayerToDB(player: Player, gameId: string) {
      let data: playerGameSession = {
        gameId,
        player
      };
      return await store.dispatch("addPlayerToSession", data).catch(err => {
        console.error(err);
      });
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