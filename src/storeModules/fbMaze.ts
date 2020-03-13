import { ActionTree } from "vuex";
import { GetterTree } from "vuex";
import { MutationTree } from "vuex";
import { firebaseData, dbSchema } from "@/firebaseConfig.ts";
import { mazeData, Maze } from "@/classes/BaseMaze";
import { firebaseMaze } from "@/classes/DBMaze";
import { Player } from "@/classes/Player";

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
    let players: Array<Player> = [];
    return new firebaseMaze(players, mazeId, firebaseMazeData);
  }
};

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

  // Todo: fix this part
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
