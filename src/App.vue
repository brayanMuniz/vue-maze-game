<template>
  <div id="app">
    <div class="container-fluid m-3 p-3">
      <maze :amountOfRows="amountOfRows" :amountOfColumns="amountOfColumns" />
    </div>
    <div>put stuff on right side like, position of player</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import bootstrap from "bootstrap";
import maze from "@/components/maze.vue";
import { firebaseData } from "@/firebaseConfig.ts";
import { GeoPoint } from "./types/playerType";
import { simplePoint } from "./types/mazeType";

export default Vue.extend({
  name: "app",
  data() {
    return {
      amountOfColumns: 10,
      amountOfRows: 8
    };
  },
  // Todo: be able to join a game session with a unique Id query parameter of the game session name
  // gameSession?gameId=randomGeneratedGameId
  mounted() {
    // Top left will be 0,0 and down will be negative, right will be positive.
    let gameSessionCollection = firebaseData
      .firestore()
      .collection("gameSessions");
    gameSessionCollection.doc("kek").onSnapshot(doc => {
      console.log("Current", doc.data());
    });
    this.generatePlayableMaze(5, {
      latitude: 10,
      longitude: 10
    });
  },
  methods: {
    // Make data format that would be able to
    generatePlayableMaze(difficutly: number, size: GeoPoint) {
      let mazeMap: Array<Array<simplePoint>> = [];
      for (let y = 0; y < size.longitude; y++) {
        mazeMap.push([]);
        for (let x = 0; x < size.latitude; x++) {
          let pointValue: string = `${y},${x}`;
          let formatedPoint: simplePoint = {};
          formatedPoint[pointValue] = true;
          mazeMap[y].push(formatedPoint);
        }
      }
      console.log(mazeMap);
      return mazeMap;
      // Highest difficutly would be 5. if diff == 1 -> 5-1 = 4 solutions and so on
      // Todo: the higher the difficulty the more blocked out spots there will be and the larger the maze
      // ! Problem, I dont know how to genereate a maze
      // ? Could make pointer go right then down then right etx until it finds a path to the end.
      // Generate it multiple times, but cut it off
      // fill in the gaps and block them
    }
    // getOneRoute(maze: ) {

    // }
  },
  components: { maze }
});
</script>

<style lang="scss">
.box {
  background-color: grey;
  border: 1px solid black;
}

@import "~bootstrap/scss/bootstrap";
</style>
