<template>
  <div id="app">
    <div class="container-fluid mt-2 mx-2" v-if="dataReady">
      <div class="row" v-for="row in playableMaze.width" :key="row">
        <div
          class="col-sm m-0 p-0 border-dark"
          v-for="col in playableMaze.height"
          :class="generateBorders(row, col)"
          :key="col"
        >
          <div class="p-5">{{showCorrectPoint(row, col)}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import bootstrap from "bootstrap";
import { firebaseData } from "@/firebaseConfig.ts";
import { Maze } from "./classes/mazeClass";

export default Vue.extend({
  name: "app",
  data() {
    return {
      playableMaze: Object(),
      dataReady: false,
      tempRow: Number(),
      tempCounter: Number()
    };
  },
  mounted() {
    let newMaze = new Maze([]);
    newMaze.generateMaze(1, 5, 5);
    this.playableMaze = newMaze;
    this.tempRow = newMaze.height - 1;
    this.tempCounter = newMaze.width - 1;
    console.log(this.tempRow, this.tempCounter);
    this.dataReady = true;
  },
  methods: {
    generateBorders(x: number, y: number) {
      let correctPoint: string = this.showCorrectPoint(x, y);
      let borders: any = {
        "border-top": !this.playableMaze.mazeMap[correctPoint].N,
        "border-right": !this.playableMaze.mazeMap[correctPoint].E,
        "border-bottom": !this.playableMaze.mazeMap[correctPoint].S,
        "border-left": !this.playableMaze.mazeMap[correctPoint].W
      };
      return borders;
    },
    showCorrectPoint(row: number, col: number): string {
      return `${col - 1},${Math.abs(row - 1 - this.tempRow)}`;
    }
  }
});
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";
</style>
