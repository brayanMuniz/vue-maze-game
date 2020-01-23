<template>
  <div>
    <div class="row" v-for="row in amountOfRows" :key="row">
      <div class="col-sm box p-4" v-for="col in amountOfColumns" :key="col">Box</div>
    </div>
  </div>
</template>
<script lang="ts">
import Vue from "vue";
export default Vue.extend({
  name: "maze",
  props: {}
});
</script>