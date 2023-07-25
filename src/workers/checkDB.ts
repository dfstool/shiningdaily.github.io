import { expose } from "threads/worker"
import { db, awaitWrapDB } from '@/utils/db';

expose({
  async checkDfsWeb3DB() {
    let [err, res]: any[] = await awaitWrapDB(db.dfsweb3desoc.toArray());
    if (err) {
      console.log("db.dfsweb3desoc.toArray: " + err);
      return ["db.dfsweb3desoc.toArray error", null];
    };

    let actions: {account_action_seq: number}[] = res;
    for (let i=0; i<actions.length; i++) {
      if (actions[i].account_action_seq !== i) {
        return ["check dfsweb3desoc table error", null];
      }
    };

    return [null, true];
  },

  async checkShiningPoolDB() {
    let [err, res]: any[] = await awaitWrapDB(db.shiningpool1.toArray());
    if (err) {
      console.log("db.shiningpool1.toArray: " + err);
      return ["db.shiningpool1.toArray error", null]
    };

    let actions: {account_action_seq: number}[] = res;
    for (let i=0; i<actions.length; i++) {
      if (actions[i].account_action_seq !== i) {
        return ["check shiningpool1 table error", null];
      }
    };

    return [null, true];
  }
})