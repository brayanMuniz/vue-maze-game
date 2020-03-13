import * as firebase from "firebase";
let firebaseConfig = {
  apiKey: "AIzaSyAu82y1kosfyjoUZIhIk_6l2rVEiRmkYTE",
  authDomain: "maze-game-data.firebaseapp.com",
  databaseURL: "https://maze-game-data.firebaseio.com",
  projectId: "maze-game-data",
  storageBucket: "maze-game-data.appspot.com",
  messagingSenderId: "328349165416",
  appId: "1:328349165416:web:fe81b211d6cebac6dfd8dd"
};
let firebaseData = firebase.initializeApp(firebaseConfig);

export const dbSchema = {
  gameSessions: "gameSessions",
  players: "players"
};

export { firebaseData };
