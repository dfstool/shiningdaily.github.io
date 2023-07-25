import { expose } from "threads/worker"
import { db, awaitWrapDB, IAction, IProfile, IContentfi, IHolder, IRelation } from '@/utils/db';
import type { ActionType, DfsWeb3ActionsType, ShiningPoolActionsType } from '@/utils/db';


expose({
  async test() {
    // console.log("")
    return "test";
  }
})