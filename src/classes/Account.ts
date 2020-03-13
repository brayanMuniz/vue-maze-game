import { firebaseData } from "@/firebaseConfig";
class Account {
  public async makeAnonymousAccount() {
    return await firebaseData
      .auth()
      .signInAnonymously()
      .catch(error => {
        console.log(error);
      });
  }
}
