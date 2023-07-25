import { createSlice } from "@reduxjs/toolkit";
import { IContentfi, IHolder, IRelation } from '@/utils/db';

export type FansFollowersType = {
  owner: string;
  create_time: string;
}[];

export type RefundMapType = {[index: string]: {user: string, bal: number}};
// export type DfsWeb3DataType = {likepost: number, newpost: number, newpost_thought: number, newpost_article: number, newpost_video: number, 
//   reply1: number, ram: number, stake: number, active_account: string[],}
export type DfsWeb3DataType = {like: number, new: number, reply1: number, ram: number, stake: number, dau: string[]}
export type DfsWeb3DatasType = {[index: string]: DfsWeb3DataType | number | undefined | {[index: string]: {user: string, bal: number}}; 
  refundMap?: RefundMapType; refundKey?: number, account_action_seq?: number
};

// export type UserDfsWeb3DatasMapDataType = {
//   likepost: number, newpost: number, newpost_thought: number, newpost_article: number, newpost_video: number, reply1: number,
//   ram: number, ram_sum: number,
//   like_accounts: {account: string, time: string, post_id: number, post_type: string, trx_id: string}[], 
//   liked_accounts: {account: string, time: string, post_id: number, post_type: string, trx_id: string}[]};
export type UserDfsWeb3DatasMapDataType = {
  like: number, new: number, reply1: number, ram: number,
  likeAcc: {acc: string, time: string, id: number, type: string, trx: string}[], 
  likedAcc: {acc: string, time: string, id: number, type: string, trx: string}[]};
export type UserDfsWeb3DataType = {[index: string]: UserDfsWeb3DatasMapDataType};
export type UserDfsWeb3DatasType = {[index: string]: UserDfsWeb3DataType | number | undefined, account_action_seq?: number};

export type ShiningPoolDataType = {reward: number, author: {[index: string]: {like: number, reward: number}}};
export type ShiningPoolDatasType = {[index: string]: ShiningPoolDataType | number | undefined; account_action_seq?: number};

// export type AccountPostDatasMapDataType = {[index: number]: {type: string, time: string, ram: number,
//   liked_accounts: {account: string, time: string, trx_id: string}[]}}
export type AccountPostDatasMapDataType = {[index: string]: {type: string, time: string, ram: number,
  likedAcc: {acc: string, time: string, trx: string}[]}}
export type AccountPostDatasType = {[index: string]: AccountPostDatasMapDataType | number | undefined; account_action_seq?: number};
export type AccountPostDataType = {[index: string]: {type: string, time: string, ram: number, reward: number}};

export type PostDatasType = {[index: string]: {author: string, type: string} | number};

type StateType = {
  account: {[index: string]: string},
  showAccount: Boolean,
  delay: number,
  freeCpu: boolean,
  liked: boolean,
  followed: boolean,
  vipAccounts: string[],
  nodeConfig: {
    [index: string]: string;
  },
  activeKey: string,
  iframeSrc: string,
  isDrawerOpen: boolean,
  drawerType: {type: string, value: number | string, status: string},
  freeCpuPrivateKey: string,
  holders: IHolder[],
  // profiles: Map<string, string>,
  profiles: {[index: string]: string},
  contentfis: IContentfi[],
  relations: IRelation[],
  ramPrice: number,
  newPostTime: {[index: string]: number},
  likePostTime: {[index: string]: number},
  fans: FansFollowersType,
  followers: FansFollowersType,
  dfsWeb3Datas: DfsWeb3DatasType,
  userDfsWeb3Datas: UserDfsWeb3DatasType,
  shiningPoolDatas: ShiningPoolDatasType,
  accountPostDatas: AccountPostDatasType,
  accountPostData: AccountPostDataType,
  searchAccountPostData: AccountPostDataType,
  likePostIds: number[],
  dfsPrice: {DFS: number, USD: number, CNY: number},
  eosPrice: {EOS: number, USD: number, CNY: number},
  priceOption: 'DFS'|'USD'|'CNY',
  youLikeCount: number,
  youLikedCount: number,
  heLikeCount: number,
  heLikedCount: number,
  youLikeAccountCount: number,
  youLikedAccountCount: number,
  heLikeAccountCount: number,
  heLikedAccountCount: number,
  youProfitCount: number,
  heProfitCount: number,
  dataVersion: string,
  accountMapId: {[index: string]: string | number},
  idMapAccount: {[index: string]: string},
}

//JSON.stringify将true、123、123.123、{}、[]、null、'abc'转换成'true'、'123'、'123.123'、'{}'、'[]'、'null'、'"abc"'
//JSON.parse将'true'、'123'、'123.123'、'{}'、'[]'、'null'、'"abc"'转换成true、123、123.123、{}、[]、null、'abc'
//JSON.parse不能转换"abc"，只能是'"abc"'，所以stringify和parse尽量配对使用，基本不会错，类型也不会错
//localStorage.setItem直接保存如下数据：true、123、123.123、{}、[1, 2, 3]、null、'abc'
//localStorage.getItem对应的数据如下：'true'、'123'、'123.123'、'[object Object]'、'1,2,3'、'null'、'abc'
//true、123、123.123和'abc'类型都变成string类型，而[]和{}类型和结构都发生变化，所以
//在localStorage中，stringify和parse一起使用是最佳实践，支持所有类型。setItem用stringify，getItem用parse
//如果是字符串类型，stringify和parse可以不用，直接用setItem和getItem即可，因为localStorage只支持字符串的保存
//小结：string类型，直接setItem和getItem；非string类型，stringify和parse一起使用
let nodeConfig = JSON.parse(localStorage.getItem("nodeConfig") as string);
let freeCpu = JSON.parse(localStorage.getItem('freeCpu') as string);
let priceOption = localStorage.getItem('priceOption') as 'DFS'|'USD'|'CNY';
let dataVersion = localStorage.getItem('dataVersion') as string;

const initialState: StateType = {
  holders: [],
  contentfis: [],
  relations: [],
  // profiles: new Map<string, string>(),
  profiles: {},
  ramPrice: 0,
  newPostTime: {
    "1": 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0,
    "13": 0, '14': 0, '15': 0, '16': 0, '17': 0, '18': 0, '19': 0, '20': 0, '21': 0, '22': 0, '23': 0, '0': 0
  },
  likePostTime: {
    "1": 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0,
    "13": 0, '14': 0, '15': 0, '16': 0, '17': 0, '18': 0, '19': 0, '20': 0, '21': 0, '22': 0, '23': 0, '0': 0
  },
  fans: [],
  followers: [],
  account: {},
  showAccount: false,
  delay: 5,
  freeCpu: (freeCpu === null)? true : freeCpu,
  liked: false,
  followed: false,
  vipAccounts: ['hazdqmjqgige', 'dfsdeveloper', 'poweraccount', 'btc.up', 'manjianetvip', 'manjianetinv'],
  activeKey: "1",
  iframeSrc: '',
  isDrawerOpen: false,
  drawerType: { type: '', value: 0, status: '' },
  freeCpuPrivateKey: '5KNY3xBG6z3sgtbxM8T4VMvh99BZks5gCuf2w14m4Rai6dpj5Hr',
  nodeConfig: {
    name: nodeConfig ? nodeConfig.name : 'TP',
    protocol: nodeConfig ? nodeConfig.protocol : 'https',
    host: nodeConfig ? nodeConfig.host : 'eospush.tokenpocket.pro',
    port: nodeConfig ? nodeConfig.port : '443',
    url: nodeConfig ? nodeConfig.url : 'https://eospush.tokenpocket.pro',
    blockchain: nodeConfig ? nodeConfig.blockchain : 'eos',
    chainId: nodeConfig ? nodeConfig.chainId : "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
  },
  // dfsWeb3Datas: dfsWeb3Datas? JSON.parse(unZip(dfsWeb3Datas)): {},
  // userDfsWeb3Datas: userDfsWeb3Datas? JSON.parse(unZip(userDfsWeb3Datas)): {},
  // shiningPoolDatas: shiningPoolDatas? JSON.parse(unZip(shiningPoolDatas)): {},
  dfsWeb3Datas: {},
  userDfsWeb3Datas: {},
  shiningPoolDatas: {},
  accountPostDatas: {},
  accountPostData: {},
  searchAccountPostData: {},
  likePostIds: [],
  dfsPrice: { DFS: 1, USD: 0, CNY: 0 },
  eosPrice: { EOS: 1, USD: 0, CNY: 0 },
  priceOption: priceOption ? priceOption : 'USD',
  dataVersion: dataVersion ? dataVersion : '0',
  youLikeCount: 0,
  youLikedCount: 0,
  heLikeCount: 0,
  heLikedCount: 0,
  youLikeAccountCount: 0,
  youLikedAccountCount: 0,
  heLikeAccountCount: 0,
  heLikedAccountCount: 0,
  youProfitCount: 0,
  heProfitCount: 0,
  accountMapId: {},
  idMapAccount: {},
}

//action types在createSlice中生成，格式为app/setAccount, app/setVip，由name字段和action名组成

//reducer
export const slice = createSlice({
  name: "app",
  initialState,
  reducers: {
    //setAccount(state){} //写法1
    //setAccount(state, action) {// action === {payload: {}, type: ''}} //写法2
    //setAccount(state, {payload}) {} //写法3，建议这个写法，因为知道type好像没什么用
    setAccount(state, {payload}) {
      state.account = payload;
      //state = {...state, account: payload} //不再需要这种方式了
    },
    setShowAccount(state, {payload}) {
      state.showAccount = payload;
    },
    setLiked(state, {payload}) {
      state.liked = payload;
    },
    setFollowed(state, {payload}) {
      state.followed = payload;
    },
    setActiveKey(state, {payload}) {
      state.activeKey = payload;
    },
    setIframeSrc(state, {payload}) {
      state.iframeSrc = payload;
    },
    setIsDrawerOpen(state, {payload}) {
      state.isDrawerOpen = payload;
    },
    setDrawerType(state, {payload}) {
      state.drawerType = payload;
    },
    setFreeCpu(state, {payload}) {
      state.freeCpu = payload;
    },
    setHolders(state, {payload}) {
      state.holders = payload;      
    },
    setProfiles(state, {payload}) {
      state.profiles = payload;      
    },
    setContentfis(state, {payload}) {
      state.contentfis = payload;      
    },
    setRelations(state, {payload}) {
      state.relations = payload;      
    },
    setRamPrice(state, {payload}) {
      state.ramPrice = payload;      
    },
    setFans(state, {payload}) {
      state.fans = payload;      
    },
    setFollowers(state, {payload}) {
      state.followers = payload;      
    },
    setDfsWeb3Datas(state, {payload}) {
      state.dfsWeb3Datas = payload
    },
    setUserDfsWeb3Datas(state, {payload}) {
      state.userDfsWeb3Datas = payload;      
    },
    setAccountPostDatas(state, {payload}) {
      state.accountPostDatas = payload;      
    },
    setNewPostTime(state, {payload}) {
      state.newPostTime = payload;      
    },
    setLikePostTime(state, {payload}) {
      state.likePostTime = payload;      
    },
    setShiningPoolDatas(state, {payload}) {
      state.shiningPoolDatas = payload;      
    },
    setLikePostIds(state, {payload}) {
      state.likePostIds = payload;      
    },
    setDfsPrice(state, {payload}) {
      state.dfsPrice = payload;      
    },
    setEosPrice(state, {payload}) {
      state.eosPrice = payload;      
    },
    setPriceOption(state, {payload}) {
      state.priceOption = payload;      
    },
    setAccountPostData(state, {payload}) {
      state.accountPostData = payload;      
    },
    setSearchAccountPostData(state, {payload}) {
      state.searchAccountPostData = payload;      
    },
    setYouLikeCount(state, {payload}) {
      state.youLikeCount = payload;      
    },
    setYouLikedCount(state, {payload}) {
      state.youLikedCount = payload;      
    },
    setHeLikeCount(state, {payload}) {
      state.heLikeCount = payload;      
    },
    setHeLikedCount(state, {payload}) {
      state.heLikedCount = payload;      
    },
    setYouLikeAccountCount(state, {payload}) {
      state.youLikeAccountCount = payload;      
    },
    setYouLikedAccountCount(state, {payload}) {
      state.youLikedAccountCount = payload;      
    },
    setHeLikeAccountCount(state, {payload}) {
      state.heLikeAccountCount = payload;      
    },
    setHeLikedAccountCount(state, {payload}) {
      state.heLikedAccountCount = payload;      
    },
    setHeProfitCount(state, {payload}) {
      state.heProfitCount = payload;      
    },
    setYouProfitCount(state, {payload}) {
      state.youProfitCount = payload;      
    },
    setAccountMapId(state, {payload}) {
      state.accountMapId = payload;      
    },
    setIdMapAccount(state, {payload}) {
      state.idMapAccount = payload;      
    },
    // setDfsWeb3DesocStart(state, {payload}) {
    //   localStorage.setItem('dfsWeb3DesocStart', JSON.stringify(payload))
    //   state.dfsWeb3DesocStart = payload;      
    // },
    // setShiningPoolStart(state, {payload}) {
    //   localStorage.setItem('shiningPoolStart', JSON.stringify(payload))
    //   state.shiningPoolStart = payload;      
    // },
    setDataVersion(state, {payload}) {
      state.dataVersion = payload;      
    },
  }
})
export default slice.reducer;

//action creators, 在createSlice中已生成
export const actions  = {
  setAccount: slice.actions.setAccount,
  setShowAccount: slice.actions.setShowAccount,
  setLiked: slice.actions.setLiked,
  setFollowed: slice.actions.setFollowed,
  setActiveKey: slice.actions.setActiveKey,
  setIframeSrc: slice.actions.setIframeSrc,
  setIsDrawerOpen: slice.actions.setIsDrawerOpen,
  setDrawerType: slice.actions.setDrawerType,
  setFreeCpu: slice.actions.setFreeCpu,
  setHolders: slice.actions.setHolders,
  setProfiles: slice.actions.setProfiles,
  setContentfis: slice.actions.setContentfis,
  setRelations: slice.actions.setRelations,
  setRamPrice: slice.actions.setRamPrice,
  setNewPostTime: slice.actions.setNewPostTime,
  setLikePostTime: slice.actions.setLikePostTime,
  setFans: slice.actions.setFans,
  setFollowers: slice.actions.setFollowers,
  setDfsWeb3Datas: slice.actions.setDfsWeb3Datas,
  setUserDfsWeb3Datas: slice.actions.setUserDfsWeb3Datas,
  setShiningPoolDatas: slice.actions.setShiningPoolDatas,
  setAccountPostDatas: slice.actions.setAccountPostDatas,
  setLikePostIds: slice.actions.setLikePostIds,
  setDfsPrice: slice.actions.setDfsPrice,
  setEosPrice: slice.actions.setEosPrice,
  setPriceOption: slice.actions.setPriceOption,
  setAccountPostData: slice.actions.setAccountPostData,
  setSearchAccountPostData: slice.actions.setSearchAccountPostData,
  setYouLikeCount: slice.actions.setYouLikeCount,
  setYouLikedCount: slice.actions.setYouLikedCount,
  setHeLikeCount: slice.actions.setHeLikeCount,
  setHeLikedCount: slice.actions.setHeLikedCount,
  setYouLikeAccountCount: slice.actions.setYouLikeAccountCount,
  setYouLikedAccountCount: slice.actions.setYouLikedAccountCount,
  setHeLikeAccountCount: slice.actions.setHeLikeAccountCount,
  setHeLikedAccountCount: slice.actions.setHeLikedAccountCount,
  setHeProfitCount: slice.actions.setHeProfitCount,
  setYouProfitCount: slice.actions.setYouProfitCount,
  setAccountMapId: slice.actions.setAccountMapId,
  setIdMapAccount: slice.actions.setIdMapAccount,
  // setDfsWeb3DesocStart: slice.actions.setDfsWeb3DesocStart,
  // setShiningPoolStart: slice.actions.setShiningPoolStart,
  setDataVersion: slice.actions.setDataVersion,
}

