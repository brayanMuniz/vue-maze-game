import { ActionTree } from "vuex";
import { GetterTree } from "vuex";
import { MutationTree } from "vuex";
import { firebaseData } from "@/firebaseConfig.ts";
import { Player } from "@/classes/playerClass";

let playerConverter = {
  toFireStore: function(player: Player) {
    return {
      currentPosition: player.currentPosition,
      playerId: player.playerId
    };
  },
  // this will be used later to join sessions
  fromFireStore: function(firebasePlayerData: any) {
    let playerData: Player = firebasePlayerData;
    return playerData;
  }
};

const state = {};
const getters: GetterTree<any, any> = {};
const mutations: MutationTree<any> = {};
const actions: ActionTree<any, any> = {
  async addPlayerToSession({ commit }, payload: playerGameSession) {
    let mazePlayerSubCollection = firebaseData
      .firestore()
      .collection("gameSessions")
      .doc(payload.gameId)
      .collection("players");

    return await mazePlayerSubCollection.add(
      playerConverter.toFireStore(payload.player)
    );
  },
  async listenToPLayerData({ commit }, gameId: string) {
    const snapshot = await firebaseData
      .firestore()
      .collection("gameSession")
      .doc(gameId)
      .collection("players")
      .get();
    return snapshot.docs.map(doc => playerConverter.fromFireStore(doc.data()));
  },
  async sendPlayerMove({ commit }, payload: playerMove) {
    const playerDoc = firebaseData
      .firestore()
      .collection(payload.gameID)
      .doc(payload.playerId);

    return await playerDoc.update({
      currentPosition: payload.newPlayerPostion
    });
  }
};

export interface playerGameSession {
  gameId: string;
  player: Player;
}
export interface playerMove {
  playerId: string;
  newPlayerPostion: string;
  gameID: string;
}

export default {
  actions,
  mutations,
  getters,
  state
};
