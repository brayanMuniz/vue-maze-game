import Vue from "vue";
import App from "./App.vue";
import store from "./store/store";
import "bootstrap/dist/js/bootstrap.min.js";

Vue.config.productionTip = true;

new Vue({
  store,
  render: h => h(App)
}).$mount("#app");
