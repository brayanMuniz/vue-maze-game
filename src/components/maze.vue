<template>
  <div>
    <div class="row" v-for="row in amountOfRows" :key="row">
      <div class="col-sm box p-4" v-for="col in amountOfColumns" :key="col">
        <box :player="playerData" />
      </div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
import { player, GeoPoint } from "@/types/playerType";
import box from "@/components/box.vue";

export default Vue.extend({
  name: "maze",
  props: {
    amountOfRows: Number,
    amountOfColumns: Number,
    startingPosition: Object as () => GeoPoint,
    endPosition:  Object as () => GeoPoint,
    playerData: Object as () => player
  },
  data() {
    return {};
  },
  components: {
    box
  }
});
</script>