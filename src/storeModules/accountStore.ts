import { ActionTree } from "vuex";
import { GetterTree } from "vuex";
import { MutationTree } from "vuex";

const state = {
  myUid: String(),
  myDocId: String()
};
const getters: GetterTree<any, any> = {
  getMyAccountId(state) {
    return state.myUid;
  },
  getMyDocId(state) {
    return state.myDocId;
  }
};
const mutations: MutationTree<any> = {
  // !Problem was that I kept getting an infinite repeat object on getter call
  // *** Bug Fixed Lesson:
  //  *** Fix: forgot to add state to the parameter
  setMyUid(state, newUid: string) {
    state.myUid = newUid;
  },
  setMyDocId(state, newDocId: string) {
    state.myDocId = newDocId;
  }
};
const actions: ActionTree<any, any> = {};

export const accountMutationsSchema = {
  setMyUid: "setMyUid"
};

export default {
  state,
  getters,
  mutations,
  actions
};
