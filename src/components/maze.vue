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
        <!-- Todo: insert player into start postion  -->
        <box :player="playerData" />
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
    startingPosition: Object as () => GeoPoint,
    endPosition: Object as () => GeoPoint,
    playerData: Object as () => player,
    maze: Object as () => maze
  },
  data() {
    return {
      dataReady: false
    };
  },
  created() {
    this.dataReady = true;
  },
  methods: {
    generateMazeFromData() {},
    passableClass(row: number, col: number) {
      let objectVal = this.maze.mazeMap[row][col];
      let passableValue: boolean = objectVal[`${row},${col}`];
      if (passableValue == false) {
        return {
          "not-passable": true
        };
      } else {
        return {
          "background-color": "white"
        };
      }
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