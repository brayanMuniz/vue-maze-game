<template>
  <div id="app">
    <!-- Because of bootstrap max width and height will be 144, make it 10000 -->
    <div class="container mt-2" v-if="dataReady">
      <!-- Is not displaying corretly. Start from left to right bottom left is 0,0 -->
      <!-- <div v-for="(cell, point) in playableMaze.mazeMap" :key="point">{{point}}{{cell}}</div> -->
      <!-- :class="generateBorders(row, col)"-->
      <!-- {{showCorrectPoint(row, col)}} -->
      <div class="row" v-for="row in playableMaze.width" :key="row">
        <div
          class="col-sm m-0 p-0"
          v-for="col in playableMaze.height"
          :class="generateBorders(row, col)"
          :key="col"
        >{{showCorrectPoint(row, col)}}</div>
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
      reverseList: [5, 4, -3, -2, -1],
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
      return `${Math.abs(row - 1 - this.tempRow)},${col - 1}`;
    }
  }
});
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";
</style>
