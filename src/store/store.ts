import Vue from "vue";
import Vuex from "vuex";
import fbMaze from "@/storeModules/fbMaze";
import fbPlayer from "@/storeModules/fbPlayer";
Vue.use(Vuex);

// Todo: make an algorithim to complete the maze




// Todo: Firebase LAST ONE
// Todo: generate a maze session 
// Todo: be able to join the session 
// Todo: generate players 
// Todo: have players join the session 
// Todo: update all player moves for every client 


export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: { fbMaze, fbPlayer }
});
