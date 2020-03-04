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
      <button @click="updatePlayerName(sessionId, playerId, playerName)">updatePlayerName</button>
    </div>
    <div class="container-fluid mt-2 mx-2" v-if="dataReady">
      <div class="row" v-for="row in playableMaze.width" :key="row">
        <div
          class="col-sm m-0 p-0 border-dark"
          v-for="col in playableMaze.height"
          :class="generateCellClasses(row, col)"
          :key="col"
        >
          <div class="p-3">
            <!-- Uncomment this line to show points {{showCorrectPoint(row, col)}} -->
            <div class="input-group input-group-sm">
              <input
                @keyup.up="movePlayer(myPlayerId, 0 ,1)"
                @keyup.down="movePlayer(myPlayerId, 0 ,-1)"
                @keyup.left="movePlayer(myPlayerId, -1 ,0)"
                @keyup.right="movePlayer(myPlayerId, 1 ,0)"
                v-if="showPlayer(showCorrectPoint(row, col), playableMaze.players)"
                v-focus
                class="form-control m-0"
                v-model="playerName"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import bootstrap from "bootstrap";
import store from "@/store/store.ts";
import { firebaseData } from "@/firebaseConfig.ts";
import { Maze } from "./classes/mazeClass";
import { Player } from "./classes/playerClass";
import { playerGameSession, playerSnapshot } from "./storeModules/fbPlayer";
Vue.directive("focus", {
  inserted: function(el) {
    el.focus();
  }
});
// Todo:
// 2.1 when join/generate maze add self to player collection
// 2.5 update the players in real time
export default Vue.extend({
  name: "app",
  data() {
    return {
      playableMaze: new Maze([]),
      dataReady: false,
      tempRow: Number(),
      startPostion: String(),
      players: Array<Player>(),
      sessionId: String(),
      myPlayerId: String(),
      playerName: String()
    };
  },
  async mounted() {
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
      .then((mazeDataResult: Maze) => {
        this.setMaze(mazeDataResult, defaultSession);
        gameReady.mazeReady = true;
      })
      .catch(err => {
        console.error(err);
      });
    await this.getPlayersFromSession(defaultSession)
      .then(playerSnapshot => {
        playerSnapshot.forEach((playerDoc: playerSnapshot) => {
          let newPlayer: Player = new Player(
            playerDoc.data().currentPosition,
            playerDoc.id
          );
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
      if (unusedPlayerId == "") {
        // make a new player and add it to the maze
      } else {
        this.changePlayerValue(true, unusedPlayerId, defaultSession).then(
          userReady => {
            gameReady.userReady = true;
            this.myPlayerId = unusedPlayerId;
          }
        );
      }
    }
    // Part 1:
    // look for a player that is not in use and has the current position to starting position
    // make your playerId
    // if no such player generate player and add to maze
    // Part 2:
    // add property to player class that is a firebase snapshot to listen to player updates in realtime

    if (gameReady.mazeReady && gameReady.playerDataReady) {
      console.log(this.playableMaze);
      this.dataReady = true;
    }
  },
  methods: {
    async generateMazeSession() {
      this.dataReady = false;
      let newMaze = new Maze([]);
      newMaze.generateMaze(1, 11, 11);
      this.playableMaze = newMaze;
      this.tempRow = this.playableMaze.height - 1;
      this.startPostion = this.playableMaze.startPosition;
      console.log(this.playableMaze);
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
      return store.dispatch("addPlayerToSession", data).catch(err => {
        console.error(err);
      });
    },
    async changePlayerValue(
      playingValue: boolean,
      playerId: string,
      gameId: string
    ) {
      return store.dispatch("updatePlayerValue", {
        playingValue,
        playerId,
        gameId
      });
    },
    updatePlayerName(gameId: string, playerId: string, newPLayerName: string) {
      return store.dispatch("updatePlayerName", {
        gameId,
        playerId,
        newPLayerName
      });
    },
    setMaze(mazeData: Maze, mazeId: string) {
      this.playableMaze = mazeData;
      this.tempRow = this.playableMaze.height - 1;
      this.startPostion = this.playableMaze.startPosition;
      this.sessionId = mazeId;
    },
    addPLayerToMaze(player: Player) {
      this.playableMaze.addPlayer(player);
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
    showCorrectPoint(row: number, col: number): string {
      return `${col - 1},${Math.abs(row - 1 - this.tempRow)}`;
    },
    showPlayer(correctPoint: string, listOfPLayers: Array<Player>): boolean {
      let playerInPoint: boolean = false;
      listOfPLayers.forEach(player => {
        if (player.getCurrentPosition() == correctPoint) {
          playerInPoint = true;
        }
      });
      return playerInPoint;
    },
    generatePlayer(startPosition: string, id: string) {
      let newPlayer: Player = new Player(startPosition, id);
      return newPlayer;
    },
    movePlayer(playerId: string, x: number, y: number) {
      if (this.playableMaze.checkPlayerMove(playerId, x, y)) {
        this.playableMaze.movePLayer(playerId, x, y);
      }
    }
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
