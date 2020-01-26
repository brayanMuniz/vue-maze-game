<template>
  <div id="app">
    <div class="container ml-1 mt-3">
      <mazeComponent v-if="dataReady" :maze="playableMaze" />
    </div>
    <div>put stuff on right side like, position of player</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import bootstrap from "bootstrap";
import mazeComponent from "@/components/maze.vue";
import { firebaseData } from "@/firebaseConfig.ts";
import { GeoPoint } from "./types/playerType";
import { simplePoint, maze } from "./types/mazeType";

export default Vue.extend({
  name: "app",
  data() {
    return {
      amountOfColumns: 10,
      amountOfRows: 8,
      playableMaze: {},
      dataReady: false
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
    this.playableMaze = this.generatePlayableMaze(5, {
      latitude: -10,
      longitude: 10
    });
    this.dataReady = true;
  },
  methods: {
    // Make data format that would be able to
    generatePlayableMaze(difficutly: number, size: GeoPoint): maze {
      let mazeMap: Array<Array<simplePoint>> = [];
      for (let y = 0; y < size.longitude; y++) {
        mazeMap.push([]);
        for (let x = 0; x < Math.abs(size.latitude); x++) {
          let pointValue: string = `${y},${x}`;
          let formatedPoint: simplePoint = {};
          formatedPoint[pointValue] = false;
          mazeMap[y].push(formatedPoint);
        }
      }
      let endPosition: GeoPoint = this.selectEndOfMaze(mazeMap);
      let startPosition: GeoPoint = this.selectStartOfMaze(mazeMap);
      console.log(startPosition);
      let completedMaze: maze = {
        mazeMap,
        startPosition,
        endPosition
      };
      return completedMaze;
      // Highest difficutly would be 5. if diff == 1 -> 5-1 = 4 solutions and so on
      // Todo: the higher the difficulty the more blocked out spots there will be and the larger the maze
      // Generate it multiple times, but cut it off
      // fill in the gaps and block them
    },
    // longitude is horizontal, latitude is vertical, down is posotive
    generateRoutes(
      difficulty: number,
      maze: Array<Array<simplePoint>>,
      startPoint: GeoPoint,
      endPoint: GeoPoint
    ) {
      // the higher the difficulty the more blockages there will be
      // 1. At first generate one solution
      // 1.5 Generate an array of solution path geopoints
      // 2. make a alot of solutions that cut off at the end.
      // 3. block the rest except the route to the solution
    },
    selectStartOfMaze(maze: Array<Array<simplePoint>>) {
      let startPoint: GeoPoint = {
        latitude: -Math.round(Math.random() * maze[0].length),
        longitude: 0
      };
      return startPoint;
    },
    selectEndOfMaze(maze: Array<Array<simplePoint>>) {
      // Since it is a rectangle this will work, but if randomly generated shape not work
      let endPoint: GeoPoint = {
        latitude: -Math.round(Math.random() * maze[0].length),
        longitude: maze.length - 1
      };
      return endPoint;
    }
  },
  components: { mazeComponent }
});
</script>

<style lang="scss">
@import "~bootstrap/scss/bootstrap";
</style>
