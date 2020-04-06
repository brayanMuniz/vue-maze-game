import { ActionTree } from "vuex";
import { GetterTree } from "vuex";
import { MutationTree } from "vuex";
import { firebaseData, dbSchema } from "@/firebaseConfig.ts";
import { Player } from "@/classes/Player";
import { playerConverter } from "@/converters";
// Todo: change to shcema

const state: playerState = {
  currentPlayers: Array<Player>(),
  playerMoveCount: 0,
  playerMoveTimeCount: 0,
};
const getters: GetterTree<any, any> = {
  getCurrentPlayers() {
    return state.currentPlayers;
  },
  getPlayerMoveCount() {
    return state.playerMoveCount;
  },
  getPlayerMoveTimeCount() {
    return state.playerMoveTimeCount;
  },
};
const mutations: MutationTree<any> = {
  updateCurrentPlayers(state, newPLayers: Array<Player>) {
    state.currentPlayers = newPLayers;
  },
  updatePlayerMoveCount(state, incrementAmount: number) {
    state.playerMoveCount += incrementAmount;
  },
  updatePlayerMoveTimeCount(state, incrementAmount: number) {
    state.playerMoveTimeCount += incrementAmount;
  }
};
const actions: ActionTree<any, any> = {
  async addPlayerToSession({ commit }, payload: playerGameSession) {
    let mazePlayerSubCollection = firebaseData
      .firestore()
      .collection(dbSchema.gameSessions)
      .doc(payload.gameId)
      .collection(dbSchema.players);
    return await mazePlayerSubCollection.add(
      playerConverter.toFireStore(payload.player)
    );
  },
  async getPlayerData({ commit }, gameId: string) {
    return await firebaseData
      .firestore()
      .collection(dbSchema.gameSessions)
      .doc(gameId)
      .collection(dbSchema.players)
      .get();
  },
  async subscribeToPlayerMoves({ commit }, payload: any) {
    return await firebaseData
      .firestore()
      .collection(dbSchema.gameSessions)
      .doc(payload.gameId)
      .collection(dbSchema.players);
  },
  async sendPlayerMove({ commit }, payload: playerMove) {
    const playerDoc = firebaseData
      .firestore()
      .collection(dbSchema.gameSessions)
      .doc(payload.gameID)
      .collection(dbSchema.players)
      .doc(payload.documentId);

    return await playerDoc.update({
      currentPosition: payload.newPlayerPostion,
    });
  },
  // ? Could I have one master update player ?
  async updatePlayerValue({ commit }, payload: playingValue) {
    let playerDoc = firebaseData
      .firestore()
      .collection(dbSchema.gameSessions)
      .doc(payload.gameId)
      .collection(dbSchema.players)
      .doc(payload.playerId);
    return playerDoc.update({
      lastMoveTime: payload.lastMoveTime,
    });
  },
  async updatePlayerName({ commit }, payload: any) {
    let playerDoc = firebaseData
      .firestore()
      .collection(dbSchema.gameSessions)
      .doc(payload.gameId)
      .collection(dbSchema.players)
      .doc(payload.playerDoc);
    return await playerDoc.update({
      playerName: payload.newPlayerName,
    });
  },
  async updatePlayerLastMoveTime({ commit }, payload: any) {
    let playerDoc = firebaseData
      .firestore()
      .collection(dbSchema.gameSessions)
      .doc(payload.gameId)
      .collection(dbSchema.players)
      .doc(payload.playerId);
    return playerDoc.update({
      lastMoveTime: payload.newLastMoveTimeSeconds,
    });
  },
};

export interface playingValue {
  gameId: string;
  playerId: string;
  playingValue: boolean;
  lastMoveTime: number;
}

export interface playerFireStoreData {
  currentPosition: string;
  playerId: string;
  currentlyPlaying: boolean;
  lastMoveTime: number;
}

export interface playerSnapshot {
  id: string;
  data: playerSnapShotDataFunction;
}

interface playerSnapShotDataFunction {
  (): Player;
}
export interface playerState {
  currentPlayers: Array<Player>;
  playerMoveCount: number;
  playerMoveTimeCount: number;
}

export interface playerGameSession {
  gameId: string;
  player: Player;
}
export interface playerMove {
  documentId: string;
  newPlayerPostion: string;
  gameID: string;
}

export default {
  actions,
  mutations,
  getters,
  state,
};
