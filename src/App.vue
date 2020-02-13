<template>
  <div id="app">
    <div class="container mt-2">
      <div class="row" v-for="row in playableMaze.width" :key="row">
        <div class="col-sm m-0 p-0" v-for="col in playableMaze.height" :key="col">
          <div class="p-5 m-0" :class="generateBorders(row, col)">
            player
            <!-- <input type="text" class="form-control" v-focus /> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// :class="passableClass(row -1, col -1)"
import Vue from "vue";
import bootstrap from "bootstrap";
import { firebaseData } from "@/firebaseConfig.ts";
import { Maze } from "./classes/mazeClass";

export default Vue.extend({
  name: "app",
  data() {
    return {
      playableMaze: {},
      dataReady: false
    };
  },
  mounted() {
    let newMaze = new Maze([]);
    newMaze.generateMaze(1, 5, 5);
    console.log(newMaze);
    this.playableMaze = newMaze;
  },
  methods: {
    generateBorders(x: number, y: number) {
      let point: string = `${x - 1},${y - 1}`;
      // Todo: add type to playableMaze
      let borders: any = {
        "border-top": this.playableMaze.mazeMap[point].N,
        "border-right": this.playableMaze.mazeMap[point].E,
        "border-bottom": this.playableMaze.mazeMap[point].S,
        "border-left": this.playableMaze.mazeMap[point].W
      };
      return borders;
    }
  }
});
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";
</style>
