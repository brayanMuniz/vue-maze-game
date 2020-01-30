import { ActionTree } from "vuex";
import { GetterTree } from "vuex";
import { MutationTree } from "vuex";

const state = {};

const getters: GetterTree<any, any> = {
  getCurrentBitPrice() {
    return state;
  }
};
const mutations: MutationTree<any> = {
  changeBitPrice(state, newBitPrice) {
    state.currentBitPrice = newBitPrice;
  }
};
const actions: ActionTree<any, any> = {
  async updatedBitPrice({ commit }) {
    let newPrice: number = 0;
    return Number(newPrice.toFixed(2));
  }
};

export default {
  actions,
  mutations,
  getters,
  state
};
