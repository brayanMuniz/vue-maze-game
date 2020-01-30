<template>
  <div class="dot" v-if="dataReady">
    <!-- Todo: make input a ball -->
    <!-- When the player moves destory the ball and remake and put player mouse cursor back into new ball with id="playerBall" -->

    <input
      type="text"
      v-on:keyup.up="moveBall(1,0)"
      v-on:keyup.down="moveBall(-1,0)"
      v-on:keyup.left="moveBall(0,-1)"
      v-on:keyup.right="moveBall(0,1)"
      class="form-control"
    />
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { player, GeoPoint } from "@/types/playerType";
import { simplePoint } from "../types/mazeType";
// Import the maze data so we can process in this component if the move is valid
// Todo: listen to player controls with player

export default Vue.extend({
  name: "box",
  props: {
    player: Object as () => player,
    startPoint: Object as () => GeoPoint,
    endPoint: Object as () => GeoPoint,
    mazeData: Array as () => Array<Array<simplePoint>>
  },
  data() {
    return {
      dataReady: false,
      currentPostion: {
        latitude: 0,
        longitude: 0
      }
    };
  },
  mounted() {
    this.dataReady = true;
    this.currentPostion = this.startPoint;
  },
  methods: {
    // ? Will the player keep have to clicking on the "ball"
    // https://stackoverflow.com/questions/210761/how-to-auto-select-an-input-field-and-the-text-in-it-on-page-load#210764
    moveBall(vertical: number, horizontal: number) {
      console.log(vertical, horizontal);
      if (this.isMoveValid(vertical, horizontal, this.mazeData)) {
        console.log("Move valid");
        this.updatePosition({
          latitude: 0,
          longitude: 0
        });
      } else {
        console.log("move NOT valid");
      }
      // Todo: check if you are able to move in the direction
      // Todo: emit back to mother component new position
    },
    isMoveValid(
      vertical: number,
      horizontal: number,
      maze: Array<Array<simplePoint>>
    ): Boolean {
      // Todo: getting there
      let moveValid = false;
      let newVPoint = this.currentPostion.latitude + vertical;
      let newHPoint = this.currentPostion.longitude + horizontal;
      let newPoint = `${newHPoint},${newVPoint}`;
      console.log(newHPoint, newVPoint, newPoint);
      if (newHPoint < 0 || newVPoint > 0) {
        console.log("out of bounds");
        return moveValid;
      }
      let passValue = this.mazeData[newHPoint][Math.abs(newVPoint)][newPoint];
      console.log(passValue);
      if (passValue) {
        moveValid = true;
      }
      return moveValid;
    },
    updatePosition(newPosition: GeoPoint) {
      this.currentPostion = newPosition;
      this.$emit("updatePosition", this.currentPostion);
    }
    // Todo: if reached gameEnd() emit
  }
});
</script>

<style lang="scss" scoped>
.dot {
  height: 25px;
  width: 25px;
  background-color: #bbb;
  border-radius: 50%;
  display: inline-block;
}
</style>