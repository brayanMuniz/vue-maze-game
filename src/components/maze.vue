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
import box from "@/components/box.vue";

export default Vue.extend({
  name: "maze",
  props: {},
  data() {
    return {
      dataReady: false
    };
  },
  mounted() {
    this.dataReady = true;
  },
  methods: {}
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