import { ActionTree } from "vuex";
import { GetterTree } from "vuex";
import { MutationTree } from "vuex";
import { firebaseData, dbSchema } from "@/firebaseConfig.ts";
import { Maze } from "@/classes/BaseMaze";
import { mazeConverter } from "@/converters.ts";

const state = {};
const getters: GetterTree<any, any> = {};
const mutations: MutationTree<any> = {};
const actions: ActionTree<any, any> = {
  async makeGameSession({ commit }, payload: Maze) {
    let gameSessionCollection = firebaseData
      .firestore()
      .collection(dbSchema.gameSessions);

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
      .then(mazeData => {
        if (mazeData.exists) {
          convertedMaze = mazeConverter.fromFireStore(
            mazeData.data(),
            mazeData.id
          );
        }
      });

    return convertedMaze;
  }
};

export default {
  actions,
  mutations,
  getters,
  state
};
