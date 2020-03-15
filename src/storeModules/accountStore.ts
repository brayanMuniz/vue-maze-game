import { ActionTree } from "vuex";
import { GetterTree } from "vuex";
import { MutationTree } from "vuex";
import { Account } from "@/classes/Account";

const state = {
  myAccount: {}
};
const getters: GetterTree<any, any> = {
  getMyAccount(state) {
    return state.myAccount;
  }
};
const mutations: MutationTree<any> = {
  updateAccount(newAccount: Account) {
    state.myAccount = newAccount;
  }
};
const actions: ActionTree<any, any> = {};

export default {
  actions,
  mutations,
  getters,
  state
};
