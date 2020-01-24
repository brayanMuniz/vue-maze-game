<template>
  <div class="dot"></div>
</template>
<script lang="ts">
import Vue from "vue";
import { player } from "@/types/playerType";

export default Vue.extend({
  name: "box",
  props: {
    player: Object as () => player
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