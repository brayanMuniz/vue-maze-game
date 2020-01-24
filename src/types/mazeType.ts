import { player, GeoPoint } from "./playerType";

export interface maze {
  startPosition: GeoPoint;
  endPosition: GeoPoint;
  mazeMap: Array<Array<simplePoint>>;
  players: Array<player>;
}

export interface simplePoint {
  [key: string]: boolean;
}

// Array of rows with columns inside. value means if it is passable

let mazeAbstract = [
  [
    {
      "0,0": true
    }
  ],
  [
    {
      "1,0": true
    }
  ]
];

// export interface userFormatedData {
//   baseAddrFormatedData: user_addr;
//   amountChart: totalDataType;
//   profitChart: totalDataType;
//   tableTransactions: Array<tableTransactionsType>;
//   quickData: quickData;
// }
