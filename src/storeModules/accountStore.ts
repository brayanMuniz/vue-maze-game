import { ActionTree } from "vuex";
import { GetterTree } from "vuex";
import { MutationTree } from "vuex";

const state = {
  myUid: String(),
  myDocId: String(),
};
const getters: GetterTree<any, any> = {
  getMyAccountId(state) {
    return state.myUid;
  },
};
const mutations: MutationTree<any> = {
  setMyUid(state, newUid: string) {
    state.myUid = newUid;
  },
};
const actions: ActionTree<any, any> = {};

export default {
  state,
  getters,
  mutations,
  actions,
};
