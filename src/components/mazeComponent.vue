<template>
  <div v-if="dataReady">
    <!-- Todo: this part is broken  -->
    <div class="row" v-for="row in mazeSize" :key="row">
      <div
        class="col-sm m-0 p-0 border-dark"
        v-for="col in mazeSize"
        :class="generateCellClasses(row, col)"
        :key="col"
      >
        <div class="p-3">
          <!-- Uncomment next line to show points -->
          {{showCorrectPoint(row, col)}}
          <div class="input-group input-group-sm">
            <div class="row">
              <div
                class="col"
                v-for="player in playersOnPoint(playableMaze.players, showCorrectPoint(row, col))"
                :key="player.accountId"
              >
                <playerComponent
                  :player="player"
                  :playerCountLimit="playerCountLimit"
                  :gameId="playableMaze.mazeId"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import store from "@/store/store.ts";
import playerComponent from "@/components/playerComponent.vue";
import { firebaseMaze } from "../classes/DBMaze";
import { Player } from "../classes/Player";
import { playerMove } from "../storeModules/fbPlayer";
import moment from "moment";
export default Vue.extend({
  name: "mazeComponent",
  props: {
    playableMaze: firebaseMaze,
    playerCountLimit: Number
  },
  data() {
    return {
      dataReady: false,
      tempRow: Number(),
      playerMoveTimeCount: 0,
      mazeSize: Number(this.playableMaze.width)
    };
  },
  mounted() {
    this.tempRow = this.mazeSize - 1;
    this.dataReady = true;
  },
  methods: {
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
      // row and col will always be > 1
      return `${col - 1},${Math.abs(Number(row - 1 - this.tempRow))}`;
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
    }
  },
  components: {
    playerComponent
  }
});
</script>

<style lang="scss">
.startPoint {
  background-color: lightblue;
}

.endPoint {
  background-color: lightcoral;
}
</style>

