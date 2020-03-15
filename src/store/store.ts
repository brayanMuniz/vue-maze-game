import Vue from "vue";
import Vuex from "vuex";
import fbMaze from "@/storeModules/fbMaze";
import fbPlayer from "@/storeModules/fbPlayer";
import accountStore from "@/storeModules/accountStore";
Vue.use(Vuex);

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: { fbMaze, fbPlayer, accountStore }
});
