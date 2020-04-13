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

        <input type="text" placeholder="Name" v-model="playerName" class="form-control" />
        <button
          @click="updatePlayerName(sessionId, playerName)"
          class="btn btn-primary btn-sm"
        >Update Name</button>
        <div class="input-group-prepend">
          <span class="input-group-text" id="basic-addon1">Size:</span>
        </div>
        <input type="number" placeholder="mazeSize" v-model="mazeSize" class="form-control" />

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
import { Maze, mazeMap } from "./classes/Maze";
import { firebaseMaze } from "./classes/DBMaze";
import accountStore, {
  accountMutationsSchema
} from "@/storeModules/accountStore";
import moment from "moment";
import { mazeConverter } from "./converters";
import { Graph, nodes } from "@/classes/Graph";
// ! Strange Err:
// ! Whenever I use the converters it affects the playable maze
export default Vue.extend({
  name: "app",
  data() {
    return {
      localSession: true,
      dataReady: false,
      playableMaze: new firebaseMaze([], ""),
      mazeSize: 23, // its height X width
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
          // DB would crash at around 600 mazeSize, not accounting for keys
          // 17: oA8nRJLR2Jprgek9xpEM, crashes at 18: l8pcnORsDp1dP6kyBUhc
          let testSessionId: string = "oA8nRJLR2Jprgek9xpEM";
          await this.joinMazeSession(testSessionId);
        } else {
          this.makeLocalSession(1, this.mazeSize, this.mazeSize); //! only works if height and width are the same
          this.testConverter();
          this.dataReady = true;
        }
      } else {
        alert("Make account to play");
      }
    });
  },
  methods: {
    testConverter() {
      console.log(this.playableMaze.mazeMap);
      let defaultMapSize: number = this.playableMaze.checkMazeMapSize();
      let max: number = this.playableMaze.height - 1;
      let optimizedMap = mazeConverter.toFireStoreMazeMap(
        this.playableMaze.mazeMap,
        max
      );
      this.playableMaze.mazeMap = optimizedMap;
      let optimizedMapSize = this.playableMaze.checkMazeMapSize();
      this.playableMaze.mazeMap = mazeConverter.fromFireStoreMazeMap(
        optimizedMap,
        max
      );
      let testGraph: Graph = new Graph(this.playableMaze);
      let graphMap: nodes = testGraph.convertMazeToGraph();
      console.log("Graph is: ", graphMap);
      console.log(
        "height, width:",
        this.mazeSize,
        "default size:",
        defaultMapSize,
        "new:",
        optimizedMapSize
      );
      console.log("Graph size if correct,", testGraph.checkGraphSize(graphMap));
    },
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
          console.error(err);
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
        .catch(err => {
          console.error(err);
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
      await newAccount.makeAnonymousAccount().then(res => {});
    },
    async generateMazeSession() {
      if (this.mazeSize > 0 && this.mazeSize < 19) {
        this.dataReady = false;
        let players: Array<Player> = [];
        let mazeId: string = "";
        let newMaze = new firebaseMaze(players, mazeId);
        newMaze.generateMaze(1, this.mazeSize, this.mazeSize);

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
        alert("Lol lower that number fam.");
      }
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
          playerData.wonGame,
          changeDoc.doc.id,
          playerData.lastMoveTime,
          playerData.accountId,
          playerData.playerName
        );
        this.playableMaze.addPlayer(newPlayer);
      }
      if (changeType === "modified") {
        // Todo: add a wonGame listener
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
          let msg = `This guy,  ${name}, won`;
          alert(msg);
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

$grid-columns: 69; // allows bootstrap to have rows and col up to 40 until breaking to new line
</style>