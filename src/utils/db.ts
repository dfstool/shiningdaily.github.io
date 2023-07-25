import Dexie, { Table } from 'dexie';

export type ActionType = {
  account_action_seq: number, 
  block_time: string, 
  action_trace: {
    account_ram_deltas: {
      account: string, 
      delta: number
    }[], 
    act: {
      account: string, 
      authorization: {
        actor: string, 
        permission: string
      }[], 
        data: {[index: string]: string | number}, 
        name: string
    }, 
    receiver: string,
    trx_id: string
  }
}

export type DfsWeb3ActionsType =  {account_action_seq: number, block_time: string, account: string, name: string, 
  data: {type: string, memo: string, quantity: string, to: string, user: string, id: number, post_id: number}, 
  authorization: {actor: string, permission: string}[], account_ram_deltas: {account: string, delta: number}[],
  receiver: string, trx_id: string
}[];

export type ShiningPoolActionsType =  {account_action_seq: number, block_time: string, account: string, name: string, 
  data: {from: string, memo: string, quantity: string, to: string}, 
  authorization: {actor: string, permission: string}[], receiver: string
}[];

export interface IAction {
  account_action_seq: number;
  block_time: string;
  account_ram_deltas?: {account: string, delta: number}[];
  account: string;
  authorization: {actor: string, permission: string}[];
  data: {[index: string]: string | number};
  name: string;
  receiver: string;
  trx_id: string;
}

export interface IProfile {
  owner: number;
  nick: string;
  desc: string;
  avatar: string;
  cover: string;
  sex: number;
  join: string;
  update: string;
}

export interface IContentfi {
  user: string;
  create_count: number;
  like_count: number;
  create_reward: string;
  like_reward: string;
}

export interface IHolder {
  holder: string;
  bal: string;
  join_time: string;
}

export interface IRelation {
  owner: string;
  fans: number;
  follow: number;
}

export class ActionsDataDexie extends Dexie {
  // 'friends' is added by dexie when declaring the stores()
  // We just tell the typing system this is the case
  dfsweb3desoc!: Table<IAction>; 
  shiningpool1!: Table<IAction>; 
  profiles!: Table<IProfile>; 
  contentfis!: Table<IContentfi>; 
  holders!: Table<IHolder>; 
  relations!: Table<IRelation>; 

  constructor() {
    super('ActionsDatabase');
    this.version(1).stores({
      dfsweb3desoc: '&account_action_seq, block_time, *account_ram_deltas, account, *authorization, data, name, receiver, trx_id',
      shiningpool1: '&account_action_seq, block_time, account, *authorization, data, name, receiver, trx_id',
      profiles: '&owner, nick, desc, avatar, cover, sex, join, update',
      contentfis: '&user, create_count, like_count, create_reward, like_reward',
      holders: '&holder, bal, join_time',
      relations: '&owner, fans, follow'
    });
  }
}

export async function awaitWrapDB(promise: Promise<any>) {
  return promise.then(res => [null, res]).catch(err => [err, null]);
}

export const db = new ActionsDataDexie();
