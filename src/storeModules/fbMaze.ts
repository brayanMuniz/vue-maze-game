import { ActionTree } from "vuex";
import { GetterTree } from "vuex";
import { MutationTree } from "vuex";
import { firebaseData } from "@/firebaseConfig.ts";

const state = {};

const getters: GetterTree<any, any> = {};
const mutations: MutationTree<any> = {
  changeBitPrice(state, newBitPrice) {
    state.currentBitPrice = newBitPrice;
  }
};
// !Nested arrays are not supported in firebase
const actions: ActionTree<any, any> = {
  async makeGameSession({ commit }, mazeData: any) {
    // Top left will be 0,0 and down will be negative, right will be positive.
    let gameSessionCollection = firebaseData
      .firestore()
      .collection("gameSessions");
    await gameSessionCollection.add(mazeData);
  },

  async subScribeToMazeSession({ commit }, id: string) {}
};

export default {
  actions,
  mutations,
  getters,
  state
};
