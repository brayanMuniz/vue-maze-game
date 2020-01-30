<template>
  <div v-if="dataReady">
    <!-- Todo: fix it -->
    <!-- row and length are inverted I think -->
    <div class="row" v-for="row in maze.mazeMap.length" :key="row">
      <div
        class="col-sm box p-4"
        :class="passableClass(row -1, col -1)"
        v-for="col in maze.mazeMap[0].length"
        :key="col"
      >
        <!-- https://pusher.com/tutorials/vue-custom-events -->
        <!-- Todo: insert player into start postion, load other players into this position   -->
        <!--  v-if="player.playerPosition == (key, col)" -->
        <div>
          <box
            v-if="playerPositionShow(playerData.playerPosition, row, col)"
            @updatePosition="updatePlayerPositionInMaze"
            :endPoint="maze.endPosition"
            :startPoint="maze.startPosition"
            :mazeData="maze.mazeMap"
            :player="playerData"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { player, GeoPoint } from "@/types/playerType";
import box from "@/components/box.vue";
import { maze } from "../types/mazeType";

export default Vue.extend({
  name: "maze",
  props: {
    listOfPLayers: Array as () => Array<player>,
    playerData: Object as () => player,
    maze: Object as () => maze
  },
  data() {
    return {
      dataReady: false
    };
  },
  mounted() {
    this.dataReady = true;
  },
  methods: {
    passableClass(row: number, col: number) {
      let objectVal = this.maze.mazeMap[row][col];
      let passableValue: boolean = objectVal[`${row},${-col}`];
      if (passableValue == false) {
        return {
          "not-passable": true
        };
      } else {
        return {
          "background-color": "white"
        };
      }
    },
    updatePlayerPositionInMaze(test: any) {
      console.log(test);
    },
    playerPositionShow(point: GeoPoint, row: number, col: number): Boolean {
      console.log(point, row, col);
      if (point.longitude == row && point.latitude == col) {
        return true;
      }
      return false;
    }
  },
  components: {
    box
  }
});
</script>

<style lang="scss" scoped>
.box {
  border: 1px solid black;
}
.not-passable {
  background-color: #808080;
}
</style>