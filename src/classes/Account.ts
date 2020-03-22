// This class deals with authentication.
// Only uses anonymous auth as to not have to deal with email verification
// Using auth uid to not duplicate player in a maze session
import { firebaseData } from "@/firebaseConfig";
export class Account {
  uid: string;
  constructor(authUid?: string) {
    this.uid = "";
    if (authUid) {
      this.uid = authUid;
    }
  }
  public returnUid() {
    return this.uid;
  }

  public async makeAnonymousAccount() {
    return await firebaseData
      .auth()
      .signInAnonymously()
      .catch(error => {
      });
  }

  public async signOut() {
    return await firebaseData
      .auth()
      .signOut()
      .catch(err => {
        (err);
      });
  }

  public setAccountData(authUid: string) {
    this.uid = authUid;
  }
}
