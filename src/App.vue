<template>
  <div id="app">
    <div class="container ml-1 mt-3"></div>
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
      playableMaze: {},
      dataReady: false
    };
  },
  mounted() {
    let newMaze = new Maze([]);
    newMaze.generateMaze(1, 5, 5);
  },
  methods: {}
});
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";
</style>
