import { ActionTree } from "vuex";
import { GetterTree } from "vuex";
import { MutationTree } from "vuex";
import { firebaseData } from "@/firebaseConfig.ts";

const state = {};

const getters: GetterTree<any, any> = {};
const mutations: MutationTree<any> = {
  // changeBitPrice(state, newBitPrice) {
  //   state.currentBitPrice = newBitPrice;
  // }
};
const actions: ActionTree<any, any> = {
  async addPlayerToSession({ commit }, payload) {
    let gameSession = firebaseData
      .firestore()
      .collection("gameSessions")
      .doc(payload.gameSessionId);
    await gameSession.collection("players").add(payload.player);
  }
};

// Todo: figure out how to send GeoPoint to firebase
export default {
  actions,
  mutations,
  getters,
  state
};
