import { ActionTree } from "vuex";
import { GetterTree } from "vuex";
import { MutationTree } from "vuex";
import { firebaseData } from "@/firebaseConfig.ts";
import { mazeData, Maze } from "@/classes/baseMaze";
import { firebaseMaze } from "@/classes/dbMazeClass";
let mazeConverter = {
  toFireStore: function(maze: Maze) {
    return {
      solutions: maze.solutions,
      startPosition: maze.startPosition,
      endPositions: maze.endPositions,
      mazeMap: maze.mazeMap,
      width: maze.width,
      height: maze.height
    };
  },
  fromFireStore: function(firebaseMazeData: mazeData, mazeId: string) {
    return new firebaseMaze([], mazeId, firebaseMazeData);
  }
};

const state = {};
const getters: GetterTree<any, any> = {};
const mutations: MutationTree<any> = {
  changeBitPrice(state, newBitPrice) {
    state.currentBitPrice = newBitPrice;
  }
};
const actions: ActionTree<any, any> = {
  async makeGameSession({ commit }, payload: Maze) {
    let gameSessionCollection = firebaseData
      .firestore()
      .collection("gameSessions");

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
