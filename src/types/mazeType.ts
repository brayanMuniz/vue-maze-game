import { player, GeoPoint } from "./playerType";

export interface maze {
  startPosition: GeoPoint;
  endPosition: GeoPoint;
  players: Array<player>;
}

// export interface userFormatedData {
//   baseAddrFormatedData: user_addr;
//   amountChart: totalDataType;
//   profitChart: totalDataType;
//   tableTransactions: Array<tableTransactionsType>;
//   quickData: quickData;
// }
