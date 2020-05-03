import { ActionTree } from "vuex";
import { GetterTree } from "vuex";
import { MutationTree } from "vuex";
import { firebaseData, dbSchema } from "@/firebaseConfig.ts";
import { Maze } from "@/classes/Maze";
import { mazeConverter } from "@/converters.ts";
import { firebaseMaze } from "@/classes/DBMaze";

const state: mazeState = {
  currentMaze: undefined,
};
const getters: GetterTree<any, any> = {
  getCurrentMaze(state) {
    return state.currentMaze;
  },
};
const mutations: MutationTree<any> = {
  updateCurrentMaze(state, newMaze: firebaseMaze) {
    state.currentMaze = newMaze;
  },
};
const actions: ActionTree<any, any> = {
  async makeGameSession({ commit }, payload: Maze) {
    let gameSessionCollection = firebaseData.firestore().collection(dbSchema.gameSessions);

    let formatedMaze = mazeConverter.toFireStore(payload);
    return await gameSessionCollection.add(formatedMaze);
  },

  async getMazeDataOnce({ commit }, payload: string) {
    let convertedMaze: any = {};
    await firebaseData
      .firestore()
      .collection("gameSessions")
      .doc(payload)
      .get()
      .then((mazeData) => {
        convertedMaze = mazeConverter.fromFireStore(mazeData.data(), mazeData.id);
      });
    commit("updateCurrentMaze", convertedMaze);
    return convertedMaze;
  },
};

export interface mazeState {
  currentMaze: firebaseMaze | undefined;
}

export default {
  actions,
  mutations,
  getters,
  state,
};
