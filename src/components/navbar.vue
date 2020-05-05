<template>
  <div class="input-group input-group-sm" v-if="!localSession">
    <div class="input-group-prepend">
      <span class="input-group-text" id="basic-addon1">Session Id:</span>
    </div>
    <input type="text" placeholder="gameId" v-model.trim="gameId" class="form-control" />
    <button
      @click="$emit('joinMazeSession', String(gameId))"
      class="mr-1 btn btn-primary btn-sm"
    >Join Game</button>
    <div class="input-group-prepend">
      <span class="input-group-text" id="basic-addon1">Update/Turn:</span>
    </div>
    <input
      type="number"
      placeholder="Steps To DB"
      v-model="playerCountLimit"
      class="form-control mr-1"
    />

    <input type="text" placeholder="Name" v-model="playerName" class="form-control" />
    <button @click="updatePlayerName(gameId, playerName)" class="btn btn-primary btn-sm">Update Name</button>
    <div class="input-group-prepend">
      <span class="input-group-text" id="basic-addon1">Size:</span>
    </div>
    <input type="number" placeholder="mazeSize" v-model="mazeSize" class="form-control" />

    <button
      @click="$emit('generateMazeSession', Number(mazeSize))"
      class="ml-1 btn btn-primary btn-sm"
    >New Game</button>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import store from "@/store/store.ts";

export default Vue.extend({
  data() {
    return {
      mazeSize: 10,
      playerName: String(),
      gameId: String(),
      playerCountLimit: 1
    };
  },
  created() {
    if (store.getters.getMyPLayerData != undefined)
      this.playerName = store.getters.getMyPLayerData.playerName;

    if (store.getters.getCurrentMaze != undefined)
      this.gameId = store.getters.getCurrentMaze.mazeId;
  },
  methods: {
    async updatePlayerName(gameId: string, newPlayerName: string) {
      let playerAccountId: string =
        store.getters["accountStore/getMyAccountId"];
      console.log(playerAccountId);
      if (
        gameId != undefined &&
        playerAccountId != undefined &&
        newPlayerName != undefined
      ) {
        await store
          .dispatch("updatePlayerName", {
            gameId,
            playerAccountId,
            newPlayerName
          })
          .then(res => {
            console.log("Updated PlayerName");
            this.playerName = newPlayerName;
          })
          .catch(err => {
            alert("Err happen, but dont worry about it.");
          });
      }
    }
  },
  watch: {
    playerCountLimit() {
      store.commit("updateMoveCounter", this.playerCountLimit);
    }
  },
  computed: {
    localSession() {
      return store.state.localSession;
    }
  }
});
</script>