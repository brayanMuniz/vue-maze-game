import { ActionTree } from "vuex";
import { GetterTree } from "vuex";
import { MutationTree } from "vuex";
import { firebaseData } from "@/firebaseConfig.ts";
import { Maze } from "@/classes/mazeClass";
let mazeConverter = {
  toFireStore: function(maze: Maze) {
    return {
      solutions: maze.solutions,
      startPosition: maze.startPosition,
      endPositions: maze.endPositions,
      mazeMap: maze.mazeMap,
      // players: maze.players,
      width: maze.width,
      height: maze.height
    };
  },
  // this will be used later to join sessions
  fromFireStore: function(firebaseMazeData: any) {
    let mazeData: Maze = firebaseMazeData;
    mazeData.players = [];
    return mazeData;
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
          convertedMaze = mazeConverter.fromFireStore(mazeData.data());
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
