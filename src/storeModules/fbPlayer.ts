import { ActionTree } from "vuex";
import { GetterTree } from "vuex";
import { MutationTree } from "vuex";
import { firebaseData, dbSchema } from "@/firebaseConfig.ts";
import { Player } from "@/classes/playerClass";
// Todo: change to shcema

let playerConverter = {
  toFireStore: function(player: Player) {
    return {
      currentPosition: player.currentPosition,
      playerId: player.playerId,
      currentlyPlaying: player.getIfUsing(),
      lastPlayerMove: player.getLastMoveTimeSeconds()
    };
  },
  // this will be used later to join sessions
  fromFireStore: function(firebasePlayerData: playerFireStoreData) {
    console.log("Called", firebasePlayerData);
    return new Player(
      firebasePlayerData.currentPosition,
      firebasePlayerData.playerId,
      firebasePlayerData.currentlyPlaying,
      firebasePlayerData.lastMoveTime
    );
  }
};

const state: playerState = {
  currentPlayers: Array<Player>()
};
const getters: GetterTree<any, any> = {
  getCurrentPlayers() {
    return state.currentPlayers;
  }
};
const mutations: MutationTree<any> = {
  updateCurrentPlayers(state, newPLayers: Array<Player>) {
    state.currentPlayers = newPLayers;
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
  async getPlayerDataOnce({ commit }, gameId: string) {
    let allPlayers: Array<Player> = [];
    await firebaseData
      .firestore()
      .collection(dbSchema.gameSessions)
      .doc(gameId)
      .collection(dbSchema.players)
      .get()
      .then(querySnapshot => {
        querySnapshot.forEach(function(doc) {
          console.log(doc.data());
          let newPLayer: Player = new Player(
            doc.data().currentPosition,
            doc.id,
            doc.data().currentlyPlaying,
            doc.data().lastMoveTime
          );
          allPlayers.push(newPLayer);
        });
      });
    console.log(allPlayers);
    commit("updateCurrentPlayers", allPlayers);
    return allPlayers;
  },
  async sendPlayerMove({ commit }, payload: playerMove) {
    const playerDoc = firebaseData
      .firestore()
      .collection(dbSchema.gameSessions)
      .doc(payload.gameID)
      .collection(dbSchema.players)
      .doc(payload.playerId);

    return await playerDoc.update({
      currentPosition: payload.newPlayerPostion
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
      currentlyPlaying: payload.playingValue,
      lastMoveTime: payload.lastMoveTime
    });
  },
  async updatePlayerName({ commit }, payload: any) {
    let playerDoc = firebaseData
      .firestore()
      .collection(dbSchema.gameSessions)
      .doc(payload.gameId)
      .collection(dbSchema.players)
      .doc(payload.playerId);
    return playerDoc.update({
      playerName: payload.newPlayerName
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
      lastMoveTime: payload.newLastMoveTimeSeconds
    });
  }
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
  data: playerSnapShotDataFunction;
  id: string;
}

interface playerSnapShotDataFunction {
  (): Player;
}
export interface playerState {
  currentPlayers: Array<Player>;
}

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
