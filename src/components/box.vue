<template>
  <div class="dot" v-if="dataReady">
    <!-- Todo: use button instead with a v-focus -->
    <input
      type="text"
      v-on:keyup.up="moveBall(1,0)"
      v-on:keyup.down="moveBall(-1,0)"
      v-on:keyup.left="moveBall(0,-1)"
      v-on:keyup.right="moveBall(0,1)"
      class="form-control"
      v-focus
    />
  </div>
</template>
<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "box",
  props: {},
  data() {
    return {
      dataReady: false,
      currentPostion: {
        x: 0,
        y: 0
      }
    };
  },
  mounted() {},
  methods: {
    // use v-focus for the ball/button
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