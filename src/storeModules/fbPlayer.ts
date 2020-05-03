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
  updateDbMoveCounter: 1,
  playerMoveTimeCount: 0,
  gameWon: false, // in db its gameWon, fix it
  myPlayerData: undefined,
};
const getters: GetterTree<any, any> = {
  getCurrentPlayers() {
    return state.currentPlayers;
  },
  getPlayerMoveCount() {
    return state.playerMoveCount;
  },
  getLimitForMoveCounter() {
    return state.updateDbMoveCounter;
  },
  getPlayerMoveTimeCount() {
    return state.playerMoveTimeCount;
  },
  getMyPLayerData() {
    return state.myPlayerData;
  },
};
const mutations: MutationTree<any> = {
  updateCurrentPlayers(state, newPLayers: Array<Player>) {
    state.currentPlayers = newPLayers;
  },
  updateMoveCounter(state, newCounterAmount: number) {
    state.updateDbMoveCounter = newCounterAmount;
  },
  updatePlayerMoveCount(state, incrementAmount: number) {
    state.playerMoveCount += incrementAmount;
  },
  updatePlayerMoveTimeCount(state, incrementAmount: number) {
    state.playerMoveTimeCount += incrementAmount;
  },
  updateMyPlayerData(state, newPlayerData: Player) {
    state.myPlayerData = newPlayerData;
  },
  updateGameWon(state, newValue: boolean) {
    state.gameWon = newValue;
  },
};
// Todo: there is a lot of repetition with referencing the player doc. Make a state of where the player is in the db
// Todo: At least make an interface that forces the relative path and adds optional parameters to specify which one you are going to use.
const actions: ActionTree<any, any> = {
  async addPlayerToSession({ commit }, payload: playerGameSession) {
    let mazePlayerSubCollection = firebaseData
      .firestore()
      .collection(dbSchema.gameSessions)
      .doc(payload.gameId)
      .collection(dbSchema.players);
    return await mazePlayerSubCollection.add(playerConverter.toFireStore(payload.player));
  },
  async subscribeToPlayerMoves({ commit }, gameId: string) {
    return await firebaseData
      .firestore()
      .collection(dbSchema.gameSessions)
      .doc(gameId)
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
  // Todo: update value and make it dynamic and change name to updatePlayerValue
  async triggerPlayerWon({ commit }, payload: any) {
    let playerDoc = firebaseData
      .firestore()
      .collection(dbSchema.gameSessions)
      .doc(payload.gameId)
      .collection(dbSchema.players)
      .doc(payload.playerId);
    commit("updateGameWon", true);
    return playerDoc.update({
      wonGame: true, // Update player value
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
  updateDbMoveCounter: Number;
  playerMoveCount: number;
  playerMoveTimeCount: number;
  gameWon: boolean;
  myPlayerData: Player | undefined;
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
