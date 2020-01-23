<template>
  <div id="app">
    <div class="container-fluid m-3 p-3">
      <maze />
      <div class="row" v-for="row in amountOfRows" :key="row">
        <div class="col-sm-1 box p-4" v-for="col in amountOfColumns" :key="col">Box</div>
      </div>
    </div>
    <div>put stuff on right side like, position of player</div>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import bootstrap from "bootstrap";
import maze from "@/components/maze.vue";
import { firebaseData } from "@/firebaseConfig.ts";

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
