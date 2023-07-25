import './App.css';
import pako from 'pako';
import axios from 'axios';
import moment from 'moment';
import Wallet from './wallet';
import html2canvas from 'html2canvas';
import VConsole from 'vconsole';
import watermark from '@sangtian152/watermark';

import { actions } from './store/app';
import { useShowDrawer } from '@/hook/public';
import { get_price, inflate, deflate } from '@/api/dfs';
import { useSelector, useDispatch } from 'react-redux';
import type {StateType, DispatchType } from './store';
import type { DfsWeb3DataType, DfsWeb3DatasType, UserDfsWeb3DatasMapDataType, UserDfsWeb3DataType, UserDfsWeb3DatasType, 
              ShiningPoolDatasType, AccountPostDatasMapDataType, AccountPostDatasType, FansFollowersType, AccountPostDataType, 
              ShiningPoolDataType, RefundMapType, PostDatasType} from './store/app';


import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Modal, Image, Spin, message, Tabs, AutoComplete, Input, Avatar, Tag, Button, Tooltip, notification, Drawer, Space, Switch, 
         Badge, Affix, Select, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import { UserOutlined, CheckCircleOutlined, CloseCircleOutlined, QuestionCircleOutlined, EyeOutlined, EyeInvisibleOutlined, 
         LikeOutlined, ToTopOutlined, SyncOutlined, MenuOutlined, CommentOutlined } from '@ant-design/icons';
import { get_actions, get_table_rows, awaitWrap } from './api/eosjs-api';
import { db, awaitWrapDB, IAction, IProfile, IContentfi, IHolder, IRelation } from './utils/db';
import type { ActionType, DfsWeb3ActionsType, ShiningPoolActionsType } from './utils/db';
import { importInto, exportDB,} from "dexie-export-import";
import { localStorageSpace, sessionStorageSpace } from './utils/public';
import typer from './assets/pic/typer.png';
import shining from './assets/pic/shining.png';
import dbc from './assets/pic/dbc.png';
import yfc from './assets/pic/yfc.png';
import dfs from './assets/pic/dfs.png';
import tag from './assets/pic/tag.png';
import usdx from './assets/pic/usdx.png';
import pdd from './assets/pic/pdd.png';
import shiningdaily from './assets/pic/shiningdaily.png';
import telegram from './assets/pic/telegram.svg';

import DfsWeb3Line from './comp/DfsWeb3Line';
import DfsWeb3SumLine from './comp/DfsWeb3SumLine';
import ActiveAccountArea from './comp/ActiveAccountArea';
import RamOccupyLine from './comp/RamOccupyLine';
import RamOccupySumLine from './comp/RamOccupySumLine';
import StakeArea from './comp/StakeArea';
import RewardArea from './comp/RewardArea';
import RewardSumLine from './comp/RewardSumLine';
import LikeRank from './comp/LikeRank';
import RewardRank from './comp/RewardRank';
import FansRank from './comp/FansRank';
import StakeRank from './comp/StakeRank';
import CreateRank from './comp/CreateRank';
import CreateRewardRank from './comp/CreateRewardRank';
import LikedRank from './comp/LikedRank';
import LikePostTimePie from './comp/LikePostTimePie';
import NewPostTimePie from './comp/NewPostTimePie';

import UserDfsWeb3Line from './comp/user/UserDfsWeb3Line';
import UserDfsWeb3SumLine from './comp/user/UserDfsWeb3SumLine';
import UserLikedTable from './comp/user/UserLikedTable';
import UserLikeTable from './comp/user/UserLikeTable';
import UserRamOccupyLine from './comp/user/UserRamOccupyLine';
import UserRamOccupySumLine from './comp/user/UserRamOccupySumLine';
import UserPostDatasTree from './comp/user/UserPostDatasTree';
import UserFansTable from './comp/user/UserFansTable';
import UserFollowersTable from './comp/user/UserFollowersTable';
import UserStakeTable from './comp/user/UserStakeTable';
import UserProfitTable from './comp/user/UserProfitTable';
import UserProfitSumLine from './comp/user/UserProfitSumLine';
import UserLikeOccupyTable from './comp/user/UserLikeOccupyTable'; 
import UserLikedOccupyTable from './comp/user/UserLikedOccupyTable'; 
// import My from './comp/my/My'; 
// import ChatUI from './comp/chatui';

import { spawn, Thread, Worker } from "threads"

console.time = () => {}
console.timeEnd = () => {}

//对象与原始类型的根本区别之一是，对象是“通过引用”存储和复制的，而原始类型：字符串、数字、布尔值等 —— 总是“作为一个整体”复制。
//浅拷备：Object.assign([], arr), Object.assign({}, obj), [...arr], {...obj}
//深拷备：lodash 库的 _.cloneDeep(obj),或者使用JSON对象的parse和stringify，例如
//function deepClone(obj) {
//  return JSON.parse(JSON.stringify(obj));
//}

//为什么 react 的函数组件每次渲染执行两次?因为 React 在 Dev mode 下会刻意执行两次渲染，以防止组件内有什么 side effect 引起 bug，提前预防。
function App() {
  const version = "V1.6.4";
  const currentDataVersion = '1';
  const shiningDailyAccount = 'hazdqmjqgige'; 
  // const yesterday: string = moment().subtract(1, 'days').format('YYYY-MM-DD');
  const yesterday: string = moment().subtract(1, 'days').diff('2022-10-30', 'days').toString();
  //必须外部定义，否则alink.click()后，手机浏览器会闪退。(还是会闪退，具体原因不知道。如下方法可以试一下：https://github.com/eligrey/FileSaver.js/)
  let alink = document.createElement("a"); 
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [imageSrc, setImageSrc] = useState<string>("");
  const [spinning, setSpinning] = useState<boolean>(true);
  const [spinningSync, setSpinningSync] = useState<boolean>(false);
  const [tip, setTip] = useState<string>("Loading 0%+0");
  const [searchAccount, setSearchAccount] = useState<string>("");
  // const [fans, setFans] = useState<FansFollowersType>([]);
  const [searchFans, setSearchFans] = useState<FansFollowersType>([]);
  // const [followers, setFollowers] = useState<FansFollowersType>([]);
  const [searchFollowers, setSearchFollowers] = useState<FansFollowersType>([]);
  const [options, setOptions] = useState<{ value: string }[]>([]);
  const [logined, setLogined] = useState(false);
  const [logining, setLogining] = useState(false);
  const [showYourAccount, setShowYourAccount] = useState<boolean>(true);
  const [counters, setCounters] = useState<number>(0);

  const [profilesUpdate, ] = useState<string>(localStorage.getItem('profilesUpdate') as string);
  // const [contentfisUpdate, ] = useState<string>(localStorage.getItem('contentfisUpdate') as string);
  // const [ramPriceUpdate, ] = useState<string>(localStorage.getItem('ramPriceUpdate') as string);
  // const [holdersUpdate, ] = useState<string>(localStorage.getItem('holdersUpdate') as string);
  const [vConsoleLabel, setVConsoleLabel] = useState<string>("");
  // const [isChatUIOpen, setIsChatUIOpen] = useState<boolean>(false);


  const init = useRef(false);
  const lock = useRef<boolean>(false);
  const syncLock = useRef<boolean>(false);
  // const percentage = useRef<number>(0);
  // const count = useRef<number>(0);
  const accountMapIdRef = useRef<{[index: string]: string | number}>({});
  const postDatasRef = useRef<PostDatasType>({});
  type loadingTipType = {total: number; inc: {[index: string]: number}; items: {[index: string]: number}};
  const loadingTipRef = useRef<loadingTipType>({total: 0, inc: {}, items: {}});
  const ignoreLoadingTipRef = useRef<boolean>(false);
  const vConsoleRef = useRef<VConsole>();

  const dispatch = useDispatch<DispatchType>();
  const account = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.account);
  const liked = useSelector<StateType, boolean>((state: StateType) => state.app.liked);
  const followed = useSelector<StateType, boolean>((state: StateType) => state.app.followed);
  const shiningVipAccounts = useSelector<StateType, string[]>((state: StateType) => state.app.vipAccounts);
  const vip = (liked && followed) || shiningVipAccounts.includes(account.name);
  const activeKey = useSelector<StateType, string>((state: StateType) => state.app.activeKey);
  const iframeSrc = useSelector<StateType, string>((state: StateType) => state.app.iframeSrc);
  const isDrawerOpen = useSelector<StateType, boolean>((state: StateType) => state.app.isDrawerOpen);
  const drawerType = useSelector<StateType, {type: string, value: number | string, status: string}>((state: StateType) => state.app.drawerType);
  const freeCpu = useSelector<StateType, boolean>((state: StateType) => state.app.freeCpu);
  const profiles = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.profiles);
  const userDfsWeb3Datas = useSelector<StateType, UserDfsWeb3DatasType>((state: StateType) => state.app.userDfsWeb3Datas);
  const fans = useSelector<StateType, FansFollowersType>((state: StateType) => state.app.fans);
  const followers = useSelector<StateType, FansFollowersType>((state: StateType) => state.app.followers);
  const dfsWeb3Datas = useSelector<StateType, DfsWeb3DatasType>((state: StateType) => state.app.dfsWeb3Datas);
  const priceOption = useSelector<StateType, 'DFS'|'USD'|'CNY'>((state: StateType) => state.app.priceOption);
  const accountPostDatas = useSelector<StateType, AccountPostDatasType>((state: StateType) => state.app.accountPostDatas);
  const accountPostData = useSelector<StateType, AccountPostDataType>((state: StateType) => state.app.accountPostData);
  const searchAccountPostData = useSelector<StateType, AccountPostDataType>((state: StateType) => state.app.searchAccountPostData);
  const youLikeCount = useSelector<StateType, number>((state: StateType) => state.app.youLikeCount);
  const youLikedCount = useSelector<StateType, number>((state: StateType) => state.app.youLikedCount);
  const heLikeCount = useSelector<StateType, number>((state: StateType) => state.app.heLikeCount);
  const heLikedCount = useSelector<StateType, number>((state: StateType) => state.app.heLikedCount);
  const youLikeAccountCount = useSelector<StateType, number>((state: StateType) => state.app.youLikeAccountCount);
  const youLikedAccountCount = useSelector<StateType, number>((state: StateType) => state.app.youLikedAccountCount);
  const heLikeAccountCount = useSelector<StateType, number>((state: StateType) => state.app.heLikeAccountCount);
  const heLikedAccountCount = useSelector<StateType, number>((state: StateType) => state.app.heLikedAccountCount);
  const heProfitCount = useSelector<StateType, number>((state: StateType) => state.app.heProfitCount);
  const youProfitCount = useSelector<StateType, number>((state: StateType) => state.app.youProfitCount);
  const dataVersion = useSelector<StateType, string>((state: StateType) => state.app.dataVersion);
  // const shiningPoolDatas = useSelector<StateType, ShiningPoolDatasType>((state: StateType) => state.app.shiningPoolDatas);
  // const accountMapId = useSelector<StateType, {[index: string]: string | number}>((state: StateType) => state.app.accountMapId);

  const handleCheckRefresh = useCallback(() => {
    let refresh: boolean = JSON.parse(sessionStorage.getItem('refresh') as string);
    if (refresh) {
      return true;
    } else {
      return false;
    }
  }, []);

  const handleShowDrawer = useShowDrawer();

  const handleGetPrice = useCallback(async () => {
    console.time('handleGetPrice')
    type PriceType = {coin: string, price: number, CNY: number};
    let err;
    let res: any;
    let priceArray = JSON.parse(sessionStorage.getItem('priceArray') as string); 
    if (priceArray) {
      res = priceArray;
    } else {
      [err, res] = await get_price();
      if (err) {
        message.error("获取价格失败");
        console.log("get_price fail")
        return
      }
      sessionStorage.setItem('priceArray', JSON.stringify(res));
    }

    res.forEach((elem: PriceType) => {
      if (elem.coin === "DFS") {
        dispatch(actions.setDfsPrice({DFS: 1, USD: elem.price, CNY: elem.CNY}));
      } else if (elem.coin === "EOS") {
        dispatch(actions.setEosPrice({EOS: 1, USD: elem.price, CNY: elem.CNY}));
      }
    });
    console.timeEnd('handleGetPrice')
  }, [dispatch]);

  // const handleTipAdd = useCallback((percent?: number ) => {
  //   // tip.current = `Loading ${percentage.current}%+${count.current++}`;
  //   if (typeof percent !== 'undefined') {
  //     setTip(`Loading ${percentage.current}%+${count.current++}`);
  //   }
  // },[setTip]);

  // const handleTipNext = useCallback((percent?: number ) => {
  //   if (typeof percent !== 'undefined') {
  //     if (percentage.current >= 100) {
  //       count.current += 1;
  //     } else {
  //       percentage.current += percent;
  //       count.current = 0;
  //     }
  //     setTip(`Loading ${percentage.current}%+${count.current}`);
  //   }
  // },[setTip]);

  const handleLoadingTip = useCallback((funcName: string, num: number) => {
    if (ignoreLoadingTipRef.current) return;
    loadingTipRef.current.items[funcName] = num;
    if (!loadingTipRef.current.inc.hasOwnProperty(funcName)) {
      loadingTipRef.current.inc[funcName] = num;      
    } else {
      loadingTipRef.current.inc[funcName] += num;
    }
    let total: number = loadingTipRef.current.total;
    let percentage = Number((Object.keys(loadingTipRef.current.items).length / total * 100).toFixed(0));
    let count: number = 0;
    for (let key in loadingTipRef.current.inc) {
      count += loadingTipRef.current.inc[key];
    }
    setTip(`Loading ${percentage}%+${count}`);
  },[setTip]);

  const handleNormalLiked = useCallback(async (account: {[index: string]: string}) => {
    // const today = moment().format('YYYY-MM-DD');
    const today: string = moment().diff('2022-10-30', 'days').toString();
    const accountId = accountMapIdRef.current[account.name];
    if (userDfsWeb3Datas.hasOwnProperty(today)) { //userDfsWeb3Datas还没有运行完，可能为undefined
      if ((userDfsWeb3Datas[today] as UserDfsWeb3DataType).hasOwnProperty(accountId)) {
        const actionData: UserDfsWeb3DatasMapDataType = (userDfsWeb3Datas[today] as UserDfsWeb3DataType)[accountId];
        for (let i=0; i<actionData.likeAcc.length; i++) {
          if (actionData.likeAcc[i].acc === accountMapIdRef.current[shiningDailyAccount]) {
            dispatch(actions.setLiked(true));
            return;
          }
        }
        dispatch(actions.setLiked(false));
      } else {
        dispatch(actions.setLiked(false));
      }
    }
  }, [userDfsWeb3Datas, dispatch]);

  const handleLikePostIds = useCallback(async (account: {[index: string]: string}) => {
    let likePostIds: number[] = [];
    const accountId = accountMapIdRef.current[account.name];
    for (let day in userDfsWeb3Datas) {
      if ((userDfsWeb3Datas[day] as UserDfsWeb3DataType).hasOwnProperty(accountId)) {
        for (let value of (userDfsWeb3Datas[day] as UserDfsWeb3DataType)[accountId].likeAcc) {
          if (!likePostIds.includes(value.id)) {
            likePostIds.push(value.id);
          }
        }
      }
    }
    dispatch(actions.setLikePostIds(likePostIds));
  }, [userDfsWeb3Datas, dispatch]);

  // const handleValidLiked = useCallback((account: {[index: string]: string}) => {
  // });

  const handleTabsChange = useCallback((activeKey: string) => {
    if (activeKey === '2' || activeKey === '3') {
      handleNormalLiked(account);
      handleLikePostIds(account);
    }

    dispatch(actions.setActiveKey(activeKey));
  }, [account, handleNormalLiked, dispatch, handleLikePostIds]);

  const handleFans = useCallback(async (account: {[index: string]: string}) => {
    type ParamsType = {code: string, json: true, scope: string, table: string, limit: number, lower_bound: string};
    let more = true;
    let next_key = '';
    let fans: FansFollowersType = [];
    while (more) {
      const params: ParamsType = {
        code: 'dfsweb3desoc',
        json: true,
        scope: account.name + ' ',
        table: "fans",
        limit: 1000,
        lower_bound: next_key,
      };
      
      let [err, res]: any[] = await get_table_rows(params);
      if (err) {
        console.log(err);
        return;
      }
      more = res.more;
      next_key = res.next_key;
      fans.push(...res.rows)
    }
  
    // setFans(fans);
    dispatch(actions.setFans(fans));
  }, [dispatch]);

  const handleFollowers = useCallback(async (account: {[index: string]: string}) => {
    type ParamsType = {code: string, json: true, scope: string, table: string, limit: number, lower_bound: string};
  
    let more = true;
    let next_key = '';
    let followers: FansFollowersType = [];
    while (more) {
      const params: ParamsType = {
        code: 'dfsweb3desoc',
        json: true,
        scope: account.name + ' ',
        table: "followers",
        limit: 1000,
        lower_bound: next_key,
      };
      
      let [err, res]: any[] = await get_table_rows(params);
      if (err) {
        console.log(err);
        return;
      }
      more = res.more;
      next_key = res.next_key;
      followers.push(...res.rows)
    }
    
    for (let i=0; i<followers.length; i++) {
      if (followers[i].owner === shiningDailyAccount) {
        dispatch(actions.setFollowed(true));
        break;
      }
    }
    // setFollowers(followers);
    dispatch(actions.setFollowers(followers));
  }, [dispatch]);

  const handleCounters = useCallback(async (account: {[index: string]: string}) => {
    type ParamsType = {code: string, json: true, scope: string, table: string, lower_bound: string, upper_bound: string};
    const params: ParamsType = {
      code: 'dfsweb3desoc',
      json: true,
      scope: 'dfsweb3desoc',
      table: "counters",
      lower_bound: account.name,
      upper_bound: account.name,
    };
    
    let [err, res]: any[] = await get_table_rows(params);
    if (err) {
      console.log(err);
      return;
    }

    if (res.rows.length) {
      setCounters(res.rows[0].count);
    }
  }, []);

  // const handleAccountContentfi = useCallback(async (account: {[index: string]: string}) => {
  //   let [err, res] = await awaitWrapDB(db.contentfis.where('user').equals(account.name).toArray()); //返回所有内容
  //   if (err) {
  //     console.log("db.contentfis.toArray: " + err);
  //     return;
  //   } 
  //   if (res[0]) {
  //     setAccountContentfi(res[0]);
  //   } else {
  //     setAccountContentfi({user: '', create_count: 0, like_count: 0, create_reward: '0.0000 DFS', like_reward: '0.0000 DFS',});
  //   }
  // }, []);

  const handleLogin = useCallback(async () => {
    if (init.current) return;
    init.current = true;
    setLogining(true);
    let [err, res]: any[] = await Wallet.init('Shining');
    if (err) {
      message.error(err.toString());
    } else {
      await handleFans(res);
      await handleFollowers(res);
      // await handleAccountContentfi(res);
      await handleCounters(res);
      // await handleNormalLiked(res); //tab切换到2时才进行检测，这样可以保证数据已加载完成
      setLogined(true);
    }
    setLogining(false);

    init.current = false;
  }, [handleFans, handleFollowers, handleCounters]);

  const handleSaveImage = useCallback((imgSrc: string, fileName: string) => {
    alink.href = imgSrc;
    alink.download = fileName; //fileName保存提示中用作预先填写的文件名
    alink.click();
  }, [alink]);

  const handleExportDB = useCallback(async () => {
    //https://blog.csdn.net/weixin_43294560/article/details/122216418
    //https://blog.csdn.net/high32/article/details/122257629
    //http://nodeca.github.io/pako/#Deflate
    let [err, blob]: any[] = await awaitWrapDB(exportDB(db)); //{size: 35314667, type: 'text/json'}
    if (err) {
      console.log("exportDB error: " + err);
      message.success("Export DB fail");
      return;
    }

    let reader = new FileReader();
    reader.readAsText(blob); //默认为utf-8
    reader.onload = (ev) => {
      const compressed = pako.deflate(reader.result); //压缩, 将string转成Uint8Array
      let compressedBlob = new Blob([compressed]); //将Uint8Array转成Blob

      //浏览器内部为每个通过 URL.createObjectURL 生成的 URL 存储了一个 URL → Blob 映射。因此，此类 URL 较短，但可以访问 Blob。
      //生成的 URL 仅在当前文档打开的状态下才有效。它允许引用 <img>、<a> 中的 Blob，但如果你访问的 Blob URL 不再存在，则会从浏览器中收到 404 错误.
      //调用 URL.revokeObjectURL(url) 方法，从内部映射中删除引用，从而允许删除 Blob（如果没有其他引用），并释放内存。
      const url = URL.createObjectURL(compressedBlob); //blob:http://localhost:3000/095a91e2-a1ac-4e67-99e9-6f6dfe433d5f
      let alink = document.createElement("a");
      alink.href = url;
      alink.download = 'ChainDB'; //fileName保存提示中用作预先填写的文件名
      alink.click();
      message.success("Export DB success");
      URL.revokeObjectURL(url)
    }
  }, []);

  const handleImportDB = useCallback(async () => {
    // let count1: number = 0;
    // let count2: number = 0;
    // let err, res;
    // [err, res] = await awaitWrapDB(db.dfsweb3desoc.count());
    // if (err) {
    //   console.log("db.dfsweb3desoc.count error: " + err);
    //   message.error("Import DB fail");
    //   return -1;
    // }
    // count1 = res;
    // [err, res] = await awaitWrapDB(db.shiningpool1.count());
    // if (err) {
    //   console.log("db.shiningpool1.count error: " + err);
    //   message.error("Import DB fail");
    //   return -1;
    // }
    // count2 = res;
 
    let err, res, update = false;
    let importDB = JSON.parse(localStorage.getItem('importDB') as string);
    if (!importDB) {
      //通过db.holders.count()来判断是否有数据，可以优化时间，
      //因为数据很多的情况下，db.dfsweb3desoc.count()或者db.shiningpool1.count()会比较耗时
      [err, res] = await awaitWrapDB(db.holders.count());
      if (err) {
        console.log("db.holders.count error: " + err);
        message.error("Import DB fail");
        return -1;
      }
      if (res) {
        update = false;
        localStorage.setItem('importDB', JSON.stringify(true));
      } else {
        update = true;
      }
    }
    if (!update) {
    // if (count1 && count2) {
      console.log("No need to import DB");
      return 0;
    } else {
      // let compressedDB = require('./assets/db/ChainDB.txt');
      // const addr = window.location.protocol + '//' + window.location.host;
      // let [err, res]: any[] = await awaitWrap(axios.get(`${addr}${compressedDB}`, {
      //   responseType: 'arraybuffer', // 浏览器专属：'blob'，这里转成arraybuffer，方便解压操作
      // }));
      const compressedDB = new URL('./assets/db/ChainDB.txt', import.meta.url).toString();
      let [err, res]: any[] = await awaitWrap(axios.get(compressedDB, {
        responseType: 'arraybuffer', // 浏览器专属：'blob'，这里转成arraybuffer，方便解压操作
      }));
      if (err) {
        console.log("axios.get DB error: " + err);
        message.error("Import DB fail");
        return -1;
      }
      const buffer = new Uint8Array(res); //创建arraybuffer视图
      const decompressed = pako.inflate(buffer); //解压，返回Uint8Array
      const blob = new Blob([decompressed]);

      [err,] = await awaitWrapDB(importInto(db, blob, {
        progressCallback: (progress): boolean => {
          console.log(progress.completedRows)
          setTip(`Importing DB rows: ${progress.completedRows}`);
          return true;
        }
      }));
      if (err) {
        console.log("importInto error: " + err);
        message.error("Import DB fail");
        return -1;
      } else {
        message.success("Import DB success");
        localStorage.setItem('importDB', JSON.stringify(true));
        return 0;
      }    
    }
  }, []);

  const handleGetDate = useCallback((weekdays: boolean = true) => {
    moment.updateLocale('zh-cn', {
      months: '一月_二月_三月_四月_五月_六月_七月_八月_九月_十月_十一月_十二月'.split('_'),
      monthsShort: '1月_2月_3月_4月_5月_6月_7月_8月_9月_10月_11月_12月'.split('_'),
      weekdays: '星期日_星期一_星期二_星期三_星期四_星期五_星期六'.split('_'),
      weekdaysShort: '周日_周一_周二_周三_周四_周五_周六'.split('_'),
      weekdaysMin: '日_一_二_三_四_五_六'.split('_'),
      longDateFormat: {
        LT: 'HH:mm',
        LTS: 'HH:mm:ss',
        L: 'YYYY-MM-DD',
        LL: 'YYYY年MM月DD日',
        LLL: 'YYYY年MM月DD日Ah点mm分',
        LLLL: 'YYYY年MM月DD日ddddAh点mm分',
        l: 'YYYY-M-D',
        ll: 'YYYY年M月D日',
        lll: 'YYYY年M月D日 HH:mm',
        llll: 'YYYY年M月D日dddd HH:mm'
      },
      meridiemParse: /凌晨|早上|上午|中午|下午|晚上/,
      meridiemHour: function (hour: number, meridiem: string) {
        if (hour === 12) {
          hour = 0;
        }
        if (meridiem === '凌晨' || meridiem === '早上' ||
          meridiem === '上午') {
          return hour;
        } else if (meridiem === '下午' || meridiem === '晚上') {
          return hour + 12;
        } else {
          // '中午'
          return hour >= 11 ? hour : hour + 12;
        }
      },
      meridiem: function (hour, minute, isLower) {
        const hm = hour * 100 + minute;
        if (hm < 600) {
          return '凌晨';
        } else if (hm < 900) {
          return '早上';
        } else if (hm < 1130) {
          return '上午';
        } else if (hm < 1230) {
          return '中午';
        } else if (hm < 1800) {
          return '下午';
        } else {
          return '晚上';
        }
      },
      calendar: {
        sameDay: '[今天]LT',
        nextDay: '[明天]LT',
        nextWeek: '[下]ddddLT',
        lastDay: '[昨天]LT',
        lastWeek: '[上]ddddLT',
        sameElse: 'L'
      },
      dayOfMonthOrdinalParse: /\d{1,2}(日|月|周)/,
      relativeTime: {
        future: '%s内',
        past: '%s前',
        s: '几秒',
        ss: '%d秒',
        m: '1分钟',
        mm: '%d分钟',
        h: '1小时',
        hh: '%d小时',
        d: '1天',
        dd: '%d天',
        M: '1个月',
        MM: '%d个月',
        y: '1年',
        yy: '%d年'
      },
      week: {
        // GB/T 7408-1994《数据元和交换格式·信息交换·日期和时间表示法》与ISO 8601:1988等效
        dow: 1, // Monday is the first day of the week.
        doy: 4  // The week that contains Jan 4th is the first week of the year.
      }
    })
    if (weekdays) {
      return moment().format('ll dddd');
    } else {
      return moment().format('ll');
    }
  },[]);

  const handleShowModal = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleOk = useCallback(() => {
    // vConsole.showSwitch();
    handleSaveImage(imageSrc, `闪灵日报@${handleGetDate(false)}`);
    setIsModalOpen(false);
  }, [handleSaveImage, handleGetDate, imageSrc]);

  const handleCancel = useCallback(() => {
    setIsModalOpen(false);
    // vConsole.showSwitch();
  }, []);

  const handleDrawerCancel = useCallback(() => {
    dispatch(actions.setIsDrawerOpen(false));
  }, [dispatch]);

  // const handleChatUICancel = useCallback(() => {
  //   document.body.style.overflow = "auto";
  //   setIsChatUIOpen(false);
  // }, []);

  // const handleChatUIOpen = useCallback(() => {
  //   document.body.style.overflow = "hidden";
  //   setIsChatUIOpen(true);
  // }, []);

  const handleHtml2Canvas = useCallback(async () => {
    // vConsole.hideSwitch();
    document.body.scrollTop = document.documentElement.scrollTop = 0;
    let element: HTMLHtmlElement = document.querySelector('#root') as HTMLHtmlElement;
    let canvas: HTMLCanvasElement = await html2canvas(element, {
      scale: 1,
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight,
      useCORS: true,
      allowTaint: true, 
    });

    const url = canvas.toDataURL('image/png', 1.0); //data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA
    const can = new watermark(url);
    can.addText('闪灵日报', {markSpacing: '50%', lineSpacing: 200, rotate: -20, start: 1500, globalAlpha: 0.05, fontSize: 100, fillStyle: '#ff4d4f', repeat: true});
    can.draw(function() {
      const imgUrl = can.getBase64(); //data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYS
      setImageSrc(imgUrl);
      handleShowModal();
    })   
  },[handleShowModal]);

  const handleStoreDfsWeb3 = useCallback(async () => {
    console.time("handleStoreDfsWeb3")
    // type ParamsType = {account_name: string,  offset: number, after: string};
    //pos: 账号所有action(包括内联action)的索引值，从0开始
    //offset: 从pos开始，获取action的数量，即[pos, pos+offset]
    //如果pos和offset都不填，那取账号最新的20个action
    //after、before、filter不起作用
    type ParamsType = {account_name: string, pos: number, offset: number};
    const params: ParamsType = {
      account_name: 'dfsweb3desoc',
      pos: 0,
      offset: 100
    };  

    while (true) {
      // handleTipAdd(percent);
      handleLoadingTip("handleStoreDfsWeb3", 1);
      let [err, res] = await awaitWrapDB(db.dfsweb3desoc.count());
      if (err) {
        console.log("db.dfsweb3desoc.count error: " + err);
        break;
      }
      if (res) {
        let [err, last]: any[] = await awaitWrapDB(db.dfsweb3desoc.get(res-1));
        if (err) {
          console.log("db.dfsweb3desoc.get error: " + err);
          break;
        }
        if (last) { //获取last成功
          params.pos = (last as ActionType).account_action_seq + 1;
        } else { //获取last失败
          console.log("db.dfsweb3desoc.get error");
          break;           
        }        
      }

      [err, res] = await get_actions(params);
      if (err) {
        // message.error('get_actions error'); 
        console.log(err.toString());
        break;
      }
      console.log(res.actions);
      let actionsLength = res.actions.length;
      if (!actionsLength) {  //长度等于0
        break;
      }

      let actions: IAction[] = [];
      res.actions.forEach((item: ActionType) => {
        actions.push({account_action_seq: item.account_action_seq, block_time: item.block_time, 
          account_ram_deltas: item.action_trace.account_ram_deltas, account: item.action_trace.act.account, 
          authorization: item.action_trace.act.authorization, data: item.action_trace.act.data, 
          name: item.action_trace.act.name, receiver: item.action_trace.receiver, trx_id: item.action_trace.trx_id});
      });
      [err, res] = await awaitWrapDB(db.dfsweb3desoc.bulkPut(actions));
      if (err) {
        console.log("db.dfsweb3desoc.bulkPut error: " + err);
        // return; //会出现部分成功的情况，所以没必要完全退出
      }
    }

    // handleTipNext(percent);
    handleLoadingTip("handleStoreDfsWeb3", 0);
    console.timeEnd("handleStoreDfsWeb3")
  }, [handleLoadingTip]);

  const handleStoreShiningPool = useCallback(async ( ) => {
    console.time("handleStoreShiningPool")
    // type ParamsType = {account_name: string,  offset: number, after: string};
    //pos: 账号所有action(包括内联action)的索引值，从0开始
    //offset: 从pos开始，获取action的数量，即[pos, pos+offset]
    //如果pos和offset都不填，那取账号最新的20个action
    //after、before、filter不起作用
    type ParamsType = {account_name: string, pos: number, offset: number};
    const params: ParamsType = {
      account_name: 'shiningpool1',
      pos: 0,
      offset: 100
    };    

    while (true) {
      // handleTipAdd(percent);
      handleLoadingTip("handleStoreShiningPool", 1);
      let [err, res] = await awaitWrapDB(db.shiningpool1.count());
      if (err) {
        console.log("db.shiningpool1.count error: " + err);
        break;
      }

      if (res) {
        let [err, last]: any[] = await awaitWrapDB(db.shiningpool1.get(res-1));
        if (err) {
          console.log("db.shiningpool1.get error: " + err);
          break;
        }
        if (last) { //获取last成功
          params.pos = (last as ActionType).account_action_seq + 1;
        } else { //获取last失败
          console.log("db.shiningpool1.get error");
          break;           
        }        
      }

      [err, res] = await get_actions(params);
      if (err) {
        // message.error('get_actions error'); 
        console.log(err.toString());
        break;
      }
      console.log(res.actions);
      let actionsLength = res.actions.length;
      if (!actionsLength) {  //长度等于0
        break;
      }

      let actions: IAction[] = [];
      res.actions.forEach((item: ActionType) => {
        actions.push({account_action_seq: item.account_action_seq, block_time: item.block_time, 
          account: item.action_trace.act.account, 
          authorization: item.action_trace.act.authorization, data: item.action_trace.act.data, 
          name: item.action_trace.act.name, receiver: item.action_trace.receiver,  trx_id: item.action_trace.trx_id});
      });
      [err, res] = await awaitWrapDB(db.shiningpool1.bulkPut(actions));
      if (err) {
        console.log("db.shiningpool1.bulkPut error: " + err);
        // return; //会出现部分成功的情况，所以没必要完全退出
      }
    }

    // handleTipNext(percent);
    handleLoadingTip("handleStoreShiningPool", 0);
    console.timeEnd("handleStoreShiningPool")
  }, [handleLoadingTip]);

//   const handleStoreActionsV2 = useCallback(async () => {
//     type ParamsType = {account: string, filter: string, limit: number, noBinary: boolean, sort: string, simple: boolean, after: string};
//     const params: ParamsType = {
//       account: 'dfsweb3desoc',
//       filter: 'dfsweb3desoc:*',
//       limit: 1000,
//       noBinary: true,
//       sort: 'asc',
//       simple: true,
//       after: '2022-10-31T09:19:00.000'
//       // after: '2022-11-22T14:22:14.000'
//     };

//     while (true) {
//       let [err, count] = await awaitWrapDB(db.dfsweb3desoc.count());
//       if (err) {
//         console.log("db.dfsweb3desoc.count error: " + err);
//         return;
//       }
//       if (!count) {
//         let [err, res]: any[] = await get_actions2(params);
//         if (err) {
//           // message.error('get_actions2 error'); 
//           console.log(err.toString());
//           return;
//         }
//         console.log(res.simple_actions);
//         [err, res] = await awaitWrapDB(db.dfsweb3desoc.bulkAdd(res.simple_actions));
//         if (err) {
//           console.log("db.dfsweb3desoc.bulkAdd error: " + err);
//           // return; //会出现部分成功的情况，所以没必要完全退出
//         }
//       } else {
//         let [err, last] = await awaitWrapDB(db.dfsweb3desoc.get(count));
//         if (err) {
//           console.log("db.dfsweb3desoc.get error: " + err);
//            return;
//         }
//         if (last) { //获取last成功
//           params.after = last.timestamp;
//           // console.log(params)
//           let [err, res]: any[] = await get_actions2(params);
//           if (err) {
//             // message.error('get_actions2 error'); 
//             console.log(err.toString());
//             return;
//           }
//           console.log(res.simple_actions);
//           let actionsLength = res.simple_actions.length;
//           if (!actionsLength) {  //长度等于0
//             return;
//           } else { //长度非0
//             let index: number = 0;
//             while (true) {
//               if (res.simple_actions[index].transaction_id !== last.transaction_id) {
//                 index++;
//               } else {
//                 index++;
//                 break;
//               }
//             }
//             if (index === actionsLength) { //刚好是最后一个，即是没有最新数据
//               console.log("no new action");
//                 return;
//             } else {
//               let [err, ] = await awaitWrapDB(db.dfsweb3desoc.bulkAdd(res.simple_actions.slice(index, actionsLength)));
//               if (err) {
//                 console.log("db.dfsweb3desoc.bulkAdd error: " + err);
//                 // return; //会出现部分成功的情况，所以没必要完全退出
//               }
//             }
//           }
//         } else { //获取last失败
//           console.log("db.dfsweb3desoc.get error");
//           return; 
//         }
//       }
//     }
//   }, []);

  // const handleParseDfsWeb3 = useCallback(async (percent?: number ) => {
  //   let err, res, end;
  //   if (dataVersion === currentDataVersion) {
  //     [err, end] = await awaitWrapDB(db.dfsweb3desoc.count());
  //     if (err || (dfsWeb3DesocStart > end)) {
  //       console.log("db.dfsweb3desoc.count: " + err);
  //       handleTipNext(percent);
  //       return;        
  //     }
  //     [err, res] = await awaitWrapDB(db.dfsweb3desoc.where('account_action_seq').between(dfsWeb3DesocStart, end).toArray());
  //     if (err) {
  //       console.log("db.dfsweb3desoc.toArray: " + err);
  //       handleTipNext(percent);
  //       return;
  //     }
  //   } else {
  //     [err, res] = await awaitWrapDB(db.dfsweb3desoc.toArray()); //返回所有内容
  //     if (err) {
  //       console.log("db.dfsweb3desoc.toArray: " + err);
  //       handleTipNext(percent);
  //       return;
  //     }
  //   }
  //   handleTipAdd(percent);

  //   type DfsWeb3ActionsType =  {account_action_seq: number, block_time: string, account: string, name: string, 
  //     data: {type: string, memo: string, quantity: string, to: string, user: string, id: number, post_id: number}, 
  //     authorization: {actor: string, permission: string}[], account_ram_deltas: {account: string, delta: number}[],
  //     receiver: string, trx_id: string
  //   }[];
  //   const dfsWeb3actions: DfsWeb3ActionsType = res;
  //   const dfsWeb3DatasTmp: DfsWeb3DatasType = {};
    
  //   const userDfsWeb3DatasTmp: UserDfsWeb3DatasType = {};
  //   const accountPostDatasTmp: AccountPostDatasType = {};
  //   const refundMap: Map<number, {user: string, bal: number}> = new Map();
  //   let refundKey: number = -1; //由于开头的两个unstake是无效数据，所以-1开始自加，相当于去掉前两个数据，key为1才是第一个数据
  //   const postIdMap: Map<number, {author: string, type: string}> = new Map();
  //   const likePostTime: {[index: string]: number} = {
  //     "1": 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0,
  //     "13": 0, '14': 0, '15': 0, '16': 0, '17': 0, '18': 0, '19': 0, '20': 0, '21': 0, '22': 0, '23': 0, '0': 0      
  //   };
  //   const newPostTime: {[index: string]: number} = {
  //     "1": 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0,
  //     "13": 0, '14': 0, '15': 0, '16': 0, '17': 0, '18': 0, '19': 0, '20': 0, '21': 0, '22': 0, '23': 0, '0': 0      
  //   }
  //   let postId = 1;

  //   // let checkDB = 0;
  //   // let dfsWeb3Check = true;
  //   dfsWeb3actions.forEach((item) => {
  //     // if (item.account_action_seq !== checkDB++) {
  //     //   checkDB = item.account_action_seq + 1; //防止一次报错后，后面的也一直报错
  //     //   dfsWeb3Check = false;
  //     // }
  //     let type: string | null;
  //     const time = moment(item.block_time).add(8, 'hour');
  //     const day: string = time.format('YYYY-MM-DD'); //将utc时间改成北京时间
  //     const hour: number = Number(time.format('H'));
  //     const hourMinute: string = time.format('HH:mm');
  //     const account: string = item.account;
  //     const action: string = item.name;
  //     const authorization: {actor: string, permission: string}[] = item.authorization;
  //     const account_ram_deltas: {account: string, delta: number}[] = item.account_ram_deltas;
  //     const receiver: string = item.receiver;
  //     const trx_id: string = item.trx_id;
  //     let actor: string = '';
  //     if (authorization.length > 1) {
  //       actor = authorization[authorization.length-1].actor; //一般第一个为代付资源的账号，默认最后一个为正常账号
  //     } else {
  //       actor = authorization[0].actor; 
  //     }

  //     if (!dfsWeb3DatasTmp.hasOwnProperty(day)) {
  //       // dfsWeb3DatasTmp[day] = {likepost: 0, newpost: 0, newpost_thought: 0, newpost_article: 0, newpost_video: 0, reply1: 0,
  //       //   likepost_sum: 0, newpost_sum: 0, newpost_thought_sum: 0, newpost_article_sum: 0, newpost_video_sum: 0, reply1_sum: 0,
  //       //   active_account: [], ram: 0, ram_sum: 0, stake: 0, stake_sum: 0,
  //       // };
  //       dfsWeb3DatasTmp[day] = {likepost: 0, newpost: 0, newpost_thought: 0, newpost_article: 0, newpost_video: 0, reply1: 0,
  //         ram: 0, stake: 0, active_account: []
  //       };
  //       userDfsWeb3DatasTmp[day] = {};
  //     }
  //     if (!userDfsWeb3DatasTmp[day].hasOwnProperty(actor)) {
  //       // userDfsWeb3DatasTmp[day].set(actor, {
  //       //   likepost: 0, newpost: 0, newpost_thought: 0, newpost_article: 0, newpost_video: 0, reply1: 0,
  //       //   ram: 0, ram_sum: 0, like_accounts: [], liked_accounts: [],       
  //       // })
  //       userDfsWeb3DatasTmp[day][actor] = {
  //         likepost: 0, newpost: 0, newpost_thought: 0, newpost_article: 0, newpost_video: 0, reply1: 0,
  //         ram: 0, ram_sum: 0, like_accounts: [], liked_accounts: [],       
  //       }
  //     }
  //     // const userDfsWeb3DatasItem = userDfsWeb3DatasTmp[day].get(actor) as UserDfsWeb3DatasMapDataType;
  //     const userDfsWeb3DatasItem = userDfsWeb3DatasTmp[day][actor] as UserDfsWeb3DatasMapDataType;
      
  //     if (!accountPostDatasTmp.hasOwnProperty(actor)) {
  //       accountPostDatasTmp[actor] = {};
  //     }
  //     const accountPostDatasItem = accountPostDatasTmp[actor] as AccountPostDatasMapDataType;

  //     if (account === 'dfsweb3desoc') {
  //       let actionRam = 0;
  //       // dfsWeb3DatasTmp[day].active_account.add(actor); //给每日活跃账号数使用
  //       if (!dfsWeb3DatasTmp[day].active_account.includes(actor)) {
  //         dfsWeb3DatasTmp[day].active_account.push(actor);
  //       }
  //       account_ram_deltas.forEach((item) => {
  //         dfsWeb3DatasTmp[day].ram += item.delta;
  //         userDfsWeb3DatasItem.ram += item.delta;
  //         actionRam +=  item.delta;
  //       });

  //       switch (action) {
  //         case 'likepost':
  //           const post_id: number = item.data.post_id;
  //           const post_data: {author: string, type: string} = postIdMap.get(post_id) as {author: string, type: string};
  //           const post_author: string = post_data.author;
  //           const post_type: string = post_data.type;
  //           const user = item.data.user;
  //           userDfsWeb3DatasItem.like_accounts.push({account: post_author, time: hourMinute, post_id, post_type, trx_id});

  //           if (!userDfsWeb3DatasTmp[day].hasOwnProperty(post_author)) {
  //             // userDfsWeb3DatasTmp[day].set(post_author, {
  //             //   likepost: 0, newpost: 0, newpost_thought: 0, newpost_article: 0, newpost_video: 0, reply1: 0,
  //             //   ram: 0, ram_sum: 0, like_accounts: [], liked_accounts: []          
  //             // })
  //             userDfsWeb3DatasTmp[day][post_author] = {
  //                 likepost: 0, newpost: 0, newpost_thought: 0, newpost_article: 0, newpost_video: 0, reply1: 0,
  //                 ram: 0, ram_sum: 0, like_accounts: [], liked_accounts: []          
  //               }
  //           }
  //           // let postAuthorData: UserDfsWeb3DatasMapDataType = userDfsWeb3DatasTmp[day].get(post_author) as UserDfsWeb3DatasMapDataType;
  //           let postAuthorData: UserDfsWeb3DatasMapDataType = userDfsWeb3DatasTmp[day][post_author] as UserDfsWeb3DatasMapDataType;
  //           postAuthorData.liked_accounts.push({account: user, time: hourMinute, post_id, post_type, trx_id});
  //           // userDfsWeb3DatasTmp[day].set(post_author, postAuthorData);
  //           userDfsWeb3DatasTmp[day][post_author] = postAuthorData;

  //           const accountPostData = accountPostDatasTmp[post_author] as AccountPostDatasMapDataType;
  //           accountPostData[post_id].liked_accounts.push({account: actor, time: time.format(), trx_id});
  //           accountPostDatasTmp[post_author] = accountPostData;
            
  //           userDfsWeb3DatasItem.likepost += 1;
  //           dfsWeb3DatasTmp[day].likepost += 1;
  //           likePostTime[hour] += 1;
  //           break;
  //         case 'newpost':
  //           if (typeof item.data.type !== 'undefined') {
  //             type = item.data.type;
  //             if (type === 'thought') {
  //               dfsWeb3DatasTmp[day].newpost_thought += 1;
  //               userDfsWeb3DatasItem.newpost_thought += 1;
  //             } else if (type === 'article') {
  //               dfsWeb3DatasTmp[day].newpost_article += 1;
  //               userDfsWeb3DatasItem.newpost_article += 1;
  //             } else if (type === 'video') {
  //               dfsWeb3DatasTmp[day].newpost_video += 1;
  //               userDfsWeb3DatasItem.newpost_video += 1;
  //             }
  //             accountPostDatasItem[postId] = {post_type: type, time: time.format(), ram: actionRam, liked_accounts: []};
  //             postIdMap.set(postId++, {author: actor, type});
  //           } else {
  //               accountPostDatasItem[postId] = {post_type: 'undefined', time: time.format(), ram: actionRam, liked_accounts: []};
  //               postIdMap.set(postId++, {author: actor, type: 'undefined'});
  //           }
  //           accountPostDatasTmp[actor] = accountPostDatasItem;
  //           userDfsWeb3DatasItem.newpost += 1;
  //           dfsWeb3DatasTmp[day].newpost += 1;
  //           newPostTime[hour] += 1;
  //           break;
  //         case 'reply1':
  //           dfsWeb3DatasTmp[day].reply1 += 1;
  //           userDfsWeb3DatasItem.reply1 += 1;
  //           break;
  //         case 'unstake':
  //           const quantity = Number(item.data.quantity.split(' ')[0]);
  //           // dfsWeb3DatasTmp[day].stake -= quantity; //refund后才减
  //           refundMap.set(refundKey++, {user: item.data.user, bal: quantity}); 
  //           break;  
  //         case 'refund':
  //           dfsWeb3DatasTmp[day].stake -= refundMap.get(item.data.id)?.bal as number;
  //           refundMap.delete(item.data.id);
  //           break;
  //         case 'cancelrefund':
  //           // dfsWeb3DatasTmp[day].stake += refundMap.get(item.data.id)?.bal as number;
  //           refundMap.delete(item.data.id);
  //           break;

  //       }
  //     }
  //     if (account === 'minedfstoken' && action === 'transfer' && receiver === 'dfsweb3desoc') {
  //       if (item.data.memo === 'stake' && item.data.to === 'dfsweb3desoc') {
  //         const quantity = Number(item.data.quantity.split(' ')[0]);
  //         dfsWeb3DatasTmp[day].stake += quantity;
  //       }
  //     }

  //     // userDfsWeb3DatasTmp[day].set(actor, userDfsWeb3DatasItem);
  //     userDfsWeb3DatasTmp[day][actor] = userDfsWeb3DatasItem;
  //   });
  //   setDfsWeb3Check(dfsWeb3Check);
  //   handleTipAdd(percent);

  //   // let likepost_sum: number = 0, newpost_sum: number = 0, newpost_thought_sum: number = 0, newpost_article_sum: number = 0,
  //   //     newpost_video_sum: number = 0, reply1_sum: number = 0, ram_sum: number = 0, stake_sum: number = 0;
  //   // for (const day in dfsWeb3DatasTmp) {
  //   //   likepost_sum += dfsWeb3DatasTmp[day].likepost;
  //   //   newpost_sum += dfsWeb3DatasTmp[day].newpost;
  //   //   newpost_thought_sum += dfsWeb3DatasTmp[day].newpost_thought;
  //   //   newpost_article_sum += dfsWeb3DatasTmp[day].newpost_article;
  //   //   newpost_video_sum += dfsWeb3DatasTmp[day].newpost_video;
  //   //   reply1_sum += dfsWeb3DatasTmp[day].reply1;
  //   //   ram_sum += dfsWeb3DatasTmp[day].ram;
  //   //   stake_sum += dfsWeb3DatasTmp[day].stake;
  //   //   dfsWeb3DatasTmp[day].likepost_sum = likepost_sum;
  //   //   dfsWeb3DatasTmp[day].newpost_sum = newpost_sum;
  //   //   dfsWeb3DatasTmp[day].newpost_thought_sum = newpost_thought_sum;
  //   //   dfsWeb3DatasTmp[day].newpost_article_sum = newpost_article_sum;
  //   //   dfsWeb3DatasTmp[day].newpost_video_sum = newpost_video_sum;
  //   //   dfsWeb3DatasTmp[day].reply1_sum = reply1_sum;
  //   //   dfsWeb3DatasTmp[day].ram_sum = ram_sum;
  //   //   dfsWeb3DatasTmp[day].stake_sum = stake_sum;
  //   // }

  //   // dispatch(actions.setDfsWeb3Datas(handleDfsWeb3DatasMerge(dfsWeb3DatasTmp)));
  //   // dispatch(actions.setUserDfsWeb3Datas(handleUserDfsWeb3DatasMerge(userDfsWeb3DatasTmp)));
  //   // dispatch(actions.setAccountPostDatas(handleAccountPostDatasMerge(accountPostDatasTmp)));
  //   // dispatch(actions.setLikePostTime(handleLikePostTimeMerge(likePostTime)));
  //   // dispatch(actions.setNewPostTime(handleNewPostTimeMerge(newPostTime)));

  //   dispatch(actions.setDfsWeb3Datas(dfsWeb3DatasTmp));
  //   dispatch(actions.setUserDfsWeb3Datas(userDfsWeb3DatasTmp));
  //   dispatch(actions.setAccountPostDatas(accountPostDatasTmp));
  //   dispatch(actions.setLikePostTime(likePostTime));
  //   dispatch(actions.setNewPostTime(newPostTime));
  //   handleTipNext(percent);
  // }, [handleTipAdd, handleTipNext, dispatch, dfsWeb3DesocStart, dataVersion, currentDataVersion]);

  const handleParseAccountDatas = useCallback(async (count: number) => {
    console.time("handleParseAccountDatas");
    let err, res, end;
    let accountMapId: {[index: string]: string | number};
    let account_action_seq: number;
    let tmp = localStorage.getItem('accountMapId') as string;
    if (dataVersion === currentDataVersion && tmp !== null) {
      accountMapId = JSON.parse(inflate(tmp));
      account_action_seq = accountMapId.account_action_seq as number;
      // [err, end] = await awaitWrapDB(db.dfsweb3desoc.count());
      [err, end] = [null, count];
      if (err || (account_action_seq > end)) {
        console.log("db.dfsweb3desoc.count: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseAccountDatas", 0);
        return;        
      }
      [err, res] = await awaitWrapDB(db.dfsweb3desoc.where('account_action_seq').between(account_action_seq+1, end).toArray());
      if (err) {
        console.log("db.dfsweb3desoc.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseAccountDatas", 0);
        return;
      }
    } else {
      [err, res] = await awaitWrapDB(db.dfsweb3desoc.toArray()); //返回所有内容
      if (err) {
        console.log("db.dfsweb3desoc.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseAccountDatas", 0);
        return;
      };
      //由于开头的两个unstake是无效数据，所以-1开始自加，相当于去掉前两个数据，key为1才是第一个数据
      accountMapId = {account_action_seq: 0}; 
    }
    // handleTipAdd(percent);
    handleLoadingTip("handleParseAccountDatas", 1);

    const dfsWeb3actions: DfsWeb3ActionsType = res;
    dfsWeb3actions.forEach((item) => {
      accountMapId.account_action_seq = item.account_action_seq;
      const authorization: {actor: string, permission: string}[] = item.authorization;
      const account: string = item.account;
      let actor: string = '';
      if (authorization.length > 1) {
        actor = authorization[authorization.length-1].actor; //一般第一个为代付资源的账号，默认最后一个为正常账号
      } else {
        actor = authorization[0].actor; 
      }

      if (account === 'dfsweb3desoc' || account === "minedfstoken") {
        if (!accountMapId.hasOwnProperty(actor)) {
          accountMapId[actor] = Object.keys(accountMapId).length;
        }
      }
    });

    // console.log(accountMapId)
    localStorage.setItem('accountMapId', deflate(JSON.stringify(accountMapId))); 
    delete accountMapId.account_action_seq;
    accountMapIdRef.current = accountMapId;
    dispatch(actions.setAccountMapId(accountMapId));
    
    // handleTipAdd(percent);  
    handleLoadingTip("handleParseAccountDatas", 1);

    let idMapAccount: {[index: string]: string} = {};
    for (let account in accountMapId) {
      idMapAccount[accountMapId[account]] = account;
    }
    dispatch(actions.setIdMapAccount(idMapAccount));
    // console.log(idMapAccount)
    // handleTipNext(percent);
    handleLoadingTip("handleParseAccountDatas", 0);
    console.timeEnd("handleParseAccountDatas");
  }, [handleLoadingTip, dispatch, dataVersion, currentDataVersion]);

  //只在App.tsx中的handleParseUserDfsWeb3Datas和handleParseAccountPostDatas中使用，并且以postDatasRef出现
  const handleParsePostDatas = useCallback(async (count: number) => {
    console.time("handleParsePostDatas");
    let err, res, end;
    let postDatas: PostDatasType;
    let account_action_seq: number;
    let tmp = localStorage.getItem('postDatas') as string;
    if (dataVersion === currentDataVersion && tmp !== null) {
      postDatas = JSON.parse(inflate(tmp));
      account_action_seq = postDatas.account_action_seq as number;
      // [err, end] = await awaitWrapDB(db.dfsweb3desoc.count());
      [err, end] = [null, count];
      if (err || (account_action_seq > end)) {
        console.log("db.dfsweb3desoc.count: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParsePostDatas", 0);
        return;        
      }
      [err, res] = await awaitWrapDB(db.dfsweb3desoc.where('account_action_seq').between(account_action_seq+1, end).toArray());
      if (err) {
        console.log("db.dfsweb3desoc.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParsePostDatas", 0);
        return;
      }
    } else {
      [err, res] = await awaitWrapDB(db.dfsweb3desoc.toArray()); //返回所有内容
      if (err) {
        console.log("db.dfsweb3desoc.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParsePostDatas", 0);
        return;
      };
      postDatas = {account_action_seq: 0, id: 1}; 
    }
    // handleTipAdd(percent);
    handleLoadingTip("handleParsePostDatas", 1);

    const dfsWeb3actions: DfsWeb3ActionsType = res;
    dfsWeb3actions.forEach((item) => {
      postDatas.account_action_seq = item.account_action_seq;
      let type: string | null;
      let postId: string;
      const account: string = item.account;
      const action: string = item.name;
      const authorization: {actor: string, permission: string}[] = item.authorization;
      let actor: string = '';

      if (authorization.length > 1) {
        actor = authorization[authorization.length-1].actor; //一般第一个为代付资源的账号，默认最后一个为正常账号
      } else {
        actor = authorization[0].actor; 
      }
      actor = accountMapIdRef.current[actor] as string;

      if (account === 'dfsweb3desoc') {
        switch (action) {
          case 'newpost':
            postId = String((postDatas.id as number)++);
            if (typeof item.data.type !== 'undefined') {
              type = item.data.type;
              if (type === 'thought') {
                type = "想法";
              } else if (type === 'article') {
                type = "文章";
              } else if (type === 'video') {
                type = "视频";
              } else {
                type = "其它";
              }
              postDatas[postId] = {author: actor, type};
            } else {
                postDatas[postId] = {author: actor, type: '无'};
            }
            break;
        }
      }
    });
    // handleTipAdd(percent);
    handleLoadingTip("handleParsePostDatas", 1);

    // console.log("postDatas");
    // console.log(postDatas);
    localStorage.setItem('postDatas', deflate(JSON.stringify(postDatas))); 
    postDatasRef.current = postDatas;
    // handleTipNext(percent);
    handleLoadingTip("handleParsePostDatas", 0);
    console.timeEnd("handleParsePostDatas");
  }, [handleLoadingTip, dataVersion, currentDataVersion]);

  const handleParseDfsWeb3Datas = useCallback(async (count: number) => {
    console.time("handleParseDfsWeb3Datas")
    let err, res, end;
    let dfsWeb3Datas: DfsWeb3DatasType;
    let account_action_seq: number;
    let tmp = localStorage.getItem('dfsWeb3Datas') as string;
    if (dataVersion === currentDataVersion && tmp !== null) {
      dfsWeb3Datas = JSON.parse(inflate(tmp));
      account_action_seq = dfsWeb3Datas.account_action_seq as number;
      // [err, end] = await awaitWrapDB(db.dfsweb3desoc.count());
      [err, end] = [null, count];
      if (err || (account_action_seq > end)) {
        console.log("db.dfsweb3desoc.count: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseDfsWeb3Datas", 0);
        return;        
      }
      [err, res] = await awaitWrapDB(db.dfsweb3desoc.where('account_action_seq').between(account_action_seq+1, end).toArray());
      if (err) {
        console.log("db.dfsweb3desoc.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseDfsWeb3Datas", 0);
        return;
      }
    } else {
      [err, res] = await awaitWrapDB(db.dfsweb3desoc.toArray()); //返回所有内容
      if (err) {
        console.log("db.dfsweb3desoc.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseDfsWeb3Datas", 0);
        return;
      };
      //由于开头的两个unstake是无效数据，所以-1开始自加，相当于去掉前两个数据，key为1才是第一个数据
      dfsWeb3Datas = {refundMap: {}, refundKey: -1, account_action_seq: 0}; 
    }
    // handleTipAdd(percent);
    handleLoadingTip("handleParseDfsWeb3Datas", 1);

    const dfsWeb3actions: DfsWeb3ActionsType = res;
    dfsWeb3actions.forEach((item) => {
      dfsWeb3Datas.account_action_seq = item.account_action_seq;
      // let type: string | null;
      const time = moment(item.block_time).add(8, 'hour');
      // const day: string = time.format('YYYY-MM-DD'); //将utc时间改成北京时间
      const day: string = time.diff('2022-10-30', 'days').toString(); //计算与2022-10-30有多少天
      const account: string = item.account;
      const action: string = item.name;
      const authorization: {actor: string, permission: string}[] = item.authorization;
      const account_ram_deltas: {account: string, delta: number}[] = item.account_ram_deltas;
      const receiver: string = item.receiver;
      let actor: string = '';
      if (authorization.length > 1) {
        actor = authorization[authorization.length-1].actor; //一般第一个为代付资源的账号，默认最后一个为正常账号
      } else {
        actor = authorization[0].actor; 
      }

      if (!dfsWeb3Datas.hasOwnProperty(day)) {
        // dfsWeb3Datas[day] = {likepost: 0, newpost: 0, newpost_thought: 0, newpost_article: 0, newpost_video: 0, reply1: 0,
        //   ram: 0, stake: 0, active_account: []
        // };
        dfsWeb3Datas[day] = {like: 0, new: 0, reply1: 0, ram: 0, stake: 0, dau: []
        };
      }

      if (account === 'dfsweb3desoc') {
        actor = accountMapIdRef.current[actor] as string;
        if (!(dfsWeb3Datas[day] as DfsWeb3DataType).dau.includes(actor)) {
          (dfsWeb3Datas[day] as DfsWeb3DataType).dau.push(actor);
        }
        account_ram_deltas.forEach((item) => {
          (dfsWeb3Datas[day] as DfsWeb3DataType).ram += item.delta;
        });

        switch (action) {
          case 'likepost':
            (dfsWeb3Datas[day] as DfsWeb3DataType).like += 1;
            break;
          case 'newpost':
            // if (typeof item.data.type !== 'undefined') {
            //   type = item.data.type;
            //   if (type === 'thought') {
            //     (dfsWeb3Datas[day] as DfsWeb3DataType).newpost_thought += 1;
            //   } else if (type === 'article') {
            //     (dfsWeb3Datas[day] as DfsWeb3DataType).newpost_article += 1;
            //   } else if (type === 'video') {
            //     (dfsWeb3Datas[day] as DfsWeb3DataType).newpost_video += 1;
            //   }
            // }
            (dfsWeb3Datas[day] as DfsWeb3DataType).new += 1;
            break;
          case 'reply1':
            (dfsWeb3Datas[day] as DfsWeb3DataType).reply1 += 1;
            break;
          case 'unstake':
            const quantity = Number(Number(item.data.quantity.split(' ')[0]).toFixed(4));
            // // dfsWeb3Datas[day].stake -= quantity; //refund后才减
            (dfsWeb3Datas.refundMap as RefundMapType)[(dfsWeb3Datas.refundKey as number)++] = {user: item.data.user, bal: quantity};
            break;  
          case 'refund':
            let bal: number = (dfsWeb3Datas.refundMap as RefundMapType)[String(item.data.id)].bal;
            let stake: number = (dfsWeb3Datas[day] as DfsWeb3DataType).stake;
            (dfsWeb3Datas[day] as DfsWeb3DataType).stake = Number((stake - bal).toFixed(4));
            delete (dfsWeb3Datas.refundMap as RefundMapType)[String(item.data.id)];
            break;
          case 'cancelrefund':
            // // dfsWeb3Datas[day].stake += refundMap.get(item.data.id)?.bal as number;
            // refundMap.delete(String(item.data.id));
            delete (dfsWeb3Datas.refundMap as RefundMapType)[String(item.data.id)];
            break;

        }
      }
      if (account === 'minedfstoken' && action === 'transfer' && receiver === 'dfsweb3desoc') {
        if (item.data.memo === 'stake' && item.data.to === 'dfsweb3desoc') {
          const quantity = Number(item.data.quantity.split(' ')[0]);
          let stake: number = (dfsWeb3Datas[day] as DfsWeb3DataType).stake;
          (dfsWeb3Datas[day] as DfsWeb3DataType).stake = Number((quantity + stake).toFixed(4));
        }
      }

    });
    // handleTipAdd(percent);
    handleLoadingTip("handleParseDfsWeb3Datas", 1);

    // console.log("dfsWeb3Datas")
    // console.log(dfsWeb3Datas);
    localStorage.setItem('dfsWeb3Datas', deflate(JSON.stringify(dfsWeb3Datas))); 
    delete dfsWeb3Datas.account_action_seq;
    delete dfsWeb3Datas.refundKey;
    delete dfsWeb3Datas.refundMap;
    dispatch(actions.setDfsWeb3Datas(dfsWeb3Datas));
    // handleTipNext(percent);
    handleLoadingTip("handleParseDfsWeb3Datas", 0);
    console.timeEnd("handleParseDfsWeb3Datas")
  }, [handleLoadingTip, dispatch, dataVersion, currentDataVersion]);

  //App.tsx中handleNormalLiked和handleLikePostIds
  //UserActionsLine.tsx UserDfsWeb3SumLine.tsx
  const handleParseUserDfsWeb3Datas = useCallback(async (count: number) => {
    console.time("handleParseUserDfsWeb3Datas")
    let err, res, end;
    let userDfsWeb3Datas: UserDfsWeb3DatasType;
    let account_action_seq: number;
    let tmp = localStorage.getItem('userDfsWeb3Datas') as string;
    if (dataVersion === currentDataVersion && tmp !== null) {
      userDfsWeb3Datas = JSON.parse(inflate(tmp));
      account_action_seq = userDfsWeb3Datas.account_action_seq as number;
      // [err, end] = await awaitWrapDB(db.dfsweb3desoc.count());
      [err, end] = [null, count];
      if (err || (account_action_seq > end)) {
        console.log("db.dfsweb3desoc.count: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseUserDfsWeb3Datas", 0);
        return;        
      }
      [err, res] = await awaitWrapDB(db.dfsweb3desoc.where('account_action_seq').between(account_action_seq+1, end).toArray());
      if (err) {
        console.log("db.dfsweb3desoc.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseUserDfsWeb3Datas", 0);
        return;
      }
    } else {
      [err, res] = await awaitWrapDB(db.dfsweb3desoc.toArray()); //返回所有内容
      if (err) {
        console.log("db.dfsweb3desoc.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseUserDfsWeb3Datas", 0);
        return;
      };
      userDfsWeb3Datas = {account_action_seq: 0}; 
    }
    // handleTipAdd(percent);
    handleLoadingTip("handleParseUserDfsWeb3Datas", 1);

    const dfsWeb3actions: DfsWeb3ActionsType = res;
    dfsWeb3actions.forEach((item) => {
      userDfsWeb3Datas.account_action_seq = item.account_action_seq;
      // let type: string | null;
      const time = moment(item.block_time).add(8, 'hour');
      // const day: string = time.format('YYYY-MM-DD'); //将utc时间改成北京时间
      const day: string = time.diff('2022-10-30', 'days').toString(); //计算与2022-10-30有多少天
      const hourMinute: string = time.format('HH:mm');
      const account: string = item.account;
      const action: string = item.name;
      const authorization: {actor: string, permission: string}[] = item.authorization;
      const account_ram_deltas: {account: string, delta: number}[] = item.account_ram_deltas;
      const trx_id: string = item.trx_id.slice(0, 8);
      let actor: string = '';
      if (authorization.length > 1) {
        actor = authorization[authorization.length-1].actor; //一般第一个为代付资源的账号，默认最后一个为正常账号
      } else {
        actor = authorization[0].actor; 
      }

      actor = accountMapIdRef.current[actor] as string;
      if (!userDfsWeb3Datas.hasOwnProperty(day)) {
        userDfsWeb3Datas[day] = {};
      }
      if (!(userDfsWeb3Datas[day] as UserDfsWeb3DataType).hasOwnProperty(actor)) {
        // (userDfsWeb3Datas[day] as UserDfsWeb3DataType)[actor] = {
        //   likepost: 0, newpost: 0, newpost_thought: 0, newpost_article: 0, newpost_video: 0, reply1: 0,
        //   ram: 0, ram_sum: 0, like_accounts: [], liked_accounts: [],       
        // }
        (userDfsWeb3Datas[day] as UserDfsWeb3DataType)[actor] = {
          like: 0, new: 0, reply1: 0, ram: 0, likeAcc: [], likedAcc: [],       
        }
      }

      const userDfsWeb3DatasItem: UserDfsWeb3DatasMapDataType = (userDfsWeb3Datas[day] as UserDfsWeb3DataType)[actor];
      if (account === 'dfsweb3desoc') {
        account_ram_deltas.forEach((item) => {
          userDfsWeb3DatasItem.ram += item.delta;
        });

        switch (action) {
          case 'likepost':
            const post_id: number = item.data.post_id;
            const post_data: {author: string, type: string} = postDatasRef.current[String(post_id)] as {author: string, type: string};
            const post_author: string = post_data.author; //已经是accountId
            const post_type: string = post_data.type;
            let user = item.data.user;
            user = accountMapIdRef.current[user] as string;
            userDfsWeb3DatasItem.likeAcc.push({acc: post_author, time: hourMinute, id: post_id, type: post_type, trx: trx_id});

            if (!(userDfsWeb3Datas[day] as UserDfsWeb3DataType).hasOwnProperty(post_author)) {
              // (userDfsWeb3Datas[day] as UserDfsWeb3DataType)[post_author] = {
              //     likepost: 0, newpost: 0, newpost_thought: 0, newpost_article: 0, newpost_video: 0, reply1: 0,
              //     ram: 0, ram_sum: 0, like_accounts: [], liked_accounts: []          
              // }
              (userDfsWeb3Datas[day] as UserDfsWeb3DataType)[post_author] = {
                like: 0, new: 0, reply1: 0, ram: 0, likeAcc: [], likedAcc: []          
              }
            }
            let postAuthorData: UserDfsWeb3DatasMapDataType = (userDfsWeb3Datas[day] as UserDfsWeb3DataType)[post_author] as UserDfsWeb3DatasMapDataType;
            postAuthorData.likedAcc.push({acc: user, time: hourMinute, id: post_id, type: post_type, trx: trx_id});
            // userDfsWeb3Datas[day].set(post_author, postAuthorData);
            (userDfsWeb3Datas[day] as UserDfsWeb3DataType)[post_author] = postAuthorData;
            userDfsWeb3DatasItem.like += 1;
            break;
          case 'newpost':
            // if (typeof item.data.type !== 'undefined') {
            //   type = item.data.type;
            //   // if (type === 'thought') {
            //   //   userDfsWeb3DatasItem.newpost_thought += 1;
            //   // } else if (type === 'article') {
            //   //   userDfsWeb3DatasItem.newpost_article += 1;
            //   // } else if (type === 'video') {
            //   //   userDfsWeb3DatasItem.newpost_video += 1;
            //   // }
            // }
            userDfsWeb3DatasItem.new += 1;
            break;
          case 'reply1':
            userDfsWeb3DatasItem.reply1 += 1;
            break;
          // case 'unstake':
          //   break;  
          // case 'refund':
          //   break;
          // case 'cancelrefund':
          //   break;
        }
      }

      (userDfsWeb3Datas[day] as UserDfsWeb3DataType)[actor] = userDfsWeb3DatasItem;
    });
    // handleTipAdd(percent);
    handleLoadingTip("handleParseUserDfsWeb3Datas", 1);

    // console.log("accountMapId");
    // console.log(accountMapIdRef.current);
    // console.log("userDfsWeb3Datas");
    // console.log(userDfsWeb3Datas);
    localStorage.setItem('userDfsWeb3Datas', deflate(JSON.stringify(userDfsWeb3Datas))); 
    delete userDfsWeb3Datas.account_action_seq;
    dispatch(actions.setUserDfsWeb3Datas(userDfsWeb3Datas));
    // handleTipNext(percent);
    handleLoadingTip("handleParseUserDfsWeb3Datas", 0);
    console.timeEnd("handleParseUserDfsWeb3Datas")
  }, [handleLoadingTip, dispatch, dataVersion, currentDataVersion]);

  const handleParseAccountPostDatas = useCallback(async (count: number) => {
    console.time("handleParseAccountPostDatas")
    let err, res, end;
    let accountPostDatas: AccountPostDatasType;
    let account_action_seq: number;
    let tmp = localStorage.getItem('accountPostDatas') as string;
    if (dataVersion === currentDataVersion && tmp !== null) {
      accountPostDatas = JSON.parse(inflate(tmp));
      account_action_seq = accountPostDatas.account_action_seq as number;
      // [err, end] = await awaitWrapDB(db.dfsweb3desoc.count());
      [err, end] = [null, count];
      if (err || (account_action_seq > end)) {
        console.log("db.dfsweb3desoc.count: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseAccountPostDatas", 0);
        return;        
      }
      [err, res] = await awaitWrapDB(db.dfsweb3desoc.where('account_action_seq').between(account_action_seq+1, end).toArray());
      if (err) {
        console.log("db.dfsweb3desoc.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseAccountPostDatas", 0);
        return;
      }
    } else {
      [err, res] = await awaitWrapDB(db.dfsweb3desoc.toArray()); //返回所有内容
      if (err) {
        console.log("db.dfsweb3desoc.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseAccountPostDatas", 0);
        return;
      };
      accountPostDatas = {account_action_seq: 0, id: 1}; 
    }
    // handleTipAdd(percent);
    handleLoadingTip("handleParseAccountPostDatas", 1);

    const dfsWeb3actions: DfsWeb3ActionsType = res;
    dfsWeb3actions.forEach((item) => {
      accountPostDatas.account_action_seq = item.account_action_seq;
      let type: string | null;
      let timeMoment = moment(item.block_time).add(8, 'hour');
      let time: string = timeMoment.diff('2022-10-30', 'minutes').toString();
      const account: string = item.account;
      const action: string = item.name;
      const authorization: {actor: string, permission: string}[] = item.authorization;
      const account_ram_deltas: {account: string, delta: number}[] = item.account_ram_deltas;
      const trx_id: string = item.trx_id.slice(0, 8);
      let actor: string = '';

      if (authorization.length > 1) {
        actor = authorization[authorization.length-1].actor; //一般第一个为代付资源的账号，默认最后一个为正常账号
      } else {
        actor = authorization[0].actor; 
      }
      
      actor = accountMapIdRef.current[actor] as string;
      if (!accountPostDatas.hasOwnProperty(actor)) {
        accountPostDatas[actor] = {};
      }

      const accountPostDatasItem = accountPostDatas[actor] as AccountPostDatasMapDataType;
      if (account === 'dfsweb3desoc') {
        let actionRam = 0;
        account_ram_deltas.forEach((item) => {
          actionRam += item.delta;
        });

        switch (action) {
          case 'likepost':
            const post_id: string = String(item.data.post_id);
            const post_data: {author: string, type: string} = postDatasRef.current[post_id] as {author: string, type: string};
            const post_author: string = post_data.author; //已经是accountId
            const accountPostData = accountPostDatas[post_author] as AccountPostDatasMapDataType;
            accountPostData[post_id].likedAcc.push({acc: actor, time, trx: trx_id});
            accountPostDatas[post_author] = accountPostData;
            break;
          case 'newpost':
            if (typeof item.data.type !== 'undefined') {
              type = item.data.type;
              if (type === 'thought') {
                type = "想法";
              } else if (type === 'article') {
                type = "文章";
              } else if (type === 'video') {
                type = "视频";
              } else {
                type = "其它";
              }
              accountPostDatasItem[String(accountPostDatas.id)] = {type, time, ram: actionRam, likedAcc: []};
            } else {
                accountPostDatasItem[String(accountPostDatas.id)] = {type: '无', time, ram: actionRam, likedAcc: []};
            }
            (accountPostDatas.id as number) += 1;
            accountPostDatas[actor] = accountPostDatasItem;
            break;
          // case 'reply1':
          //   break;
          // case 'unstake':
          //   break;  
          // case 'refund':
          //   break;
          // case 'cancelrefund':
          //   break;
        }
      }
    });
    // handleTipAdd(percent);
    handleLoadingTip("handleParseAccountPostDatas", 1);

    // console.log("accountPostDatas");
    // console.log(accountPostDatas);
    localStorage.setItem('accountPostDatas', deflate(JSON.stringify(accountPostDatas))); 
    delete accountPostDatas.account_action_seq;
    dispatch(actions.setAccountPostDatas(accountPostDatas));
    // handleTipNext(percent);
    handleLoadingTip("handleParseAccountPostDatas", 0);
    console.timeEnd("handleParseAccountPostDatas")
  }, [handleLoadingTip, dispatch, dataVersion, currentDataVersion]);

  const handleParseLikePostTime = useCallback(async (count: number) => {
    console.time("handleParseLikePostTime")
    let err, res, end;
    let account_action_seq: number;
    let likePostTime: {[index: string]: number} = JSON.parse(sessionStorage.getItem('likePostTime') as string);
    if (likePostTime) {
      dispatch(actions.setLikePostTime(likePostTime));
      handleLoadingTip("handleParseLikePostTime", 0);
      console.timeEnd("handleParseLikePostTime"); 
      return;     
    }
    let tmp = localStorage.getItem('likePostTime') as string;
    if (dataVersion === currentDataVersion && tmp !== null) {
      likePostTime = JSON.parse(inflate(tmp));
      account_action_seq = likePostTime.account_action_seq;
      // [err, end] = await awaitWrapDB(db.dfsweb3desoc.count());
      [err, end] = [null, count];
      if (err || (account_action_seq > end)) {
        console.log("db.dfsweb3desoc.count: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseLikePostTime", 0);
        return;        
      }
      [err, res] = await awaitWrapDB(db.dfsweb3desoc.where('account_action_seq').between(account_action_seq+1, end).toArray());
      if (err) {
        console.log("db.dfsweb3desoc.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseLikePostTime", 0);
        return;
      }
    } else {
      [err, res] = await awaitWrapDB(db.dfsweb3desoc.toArray()); //返回所有内容
      if (err) {
        console.log("db.dfsweb3desoc.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseLikePostTime", 0);
        return;
      };
      likePostTime = {
        account_action_seq: 0, 
        "1": 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0,
        "13": 0, '14': 0, '15': 0, '16': 0, '17': 0, '18': 0, '19': 0, '20': 0, '21': 0, '22': 0, '23': 0, '0': 0
      }; 
    }
    // handleTipAdd(percent);
    handleLoadingTip("handleParseLikePostTime", 1);

    const dfsWeb3actions: DfsWeb3ActionsType = res;
    dfsWeb3actions.forEach((item) => {
      likePostTime.account_action_seq = item.account_action_seq;
      const time = moment(item.block_time).add(8, 'hour');
      const hour: number = Number(time.format('H'));
      const account: string = item.account;
      const action: string = item.name;

      if (account === 'dfsweb3desoc') {
        switch (action) {
          case 'likepost':
            likePostTime[hour] += 1;
            break;
          // case 'newpost':
          //   break;
          // case 'reply1':
          //   break;
          // case 'unstake':
          //   break;  
          // case 'refund':
          //   break;
          // case 'cancelrefund':
          //   break;
        }
      }

    });
    // handleTipAdd(percent);
    handleLoadingTip("handleParseLikePostTime", 1);
    localStorage.setItem('likePostTime', deflate(JSON.stringify(likePostTime))); 
    delete likePostTime.account_action_seq;
    dispatch(actions.setLikePostTime(likePostTime));
    sessionStorage.setItem('likePostTime', JSON.stringify(likePostTime)); 
    // handleTipNext(percent);
    handleLoadingTip("handleParseLikePostTime", 0);
    console.timeEnd("handleParseLikePostTime")
  }, [handleLoadingTip, dispatch, dataVersion, currentDataVersion]);

  const handleParseNewPostTime = useCallback(async (count: number) => {
    console.time("handleParseNewPostTime")
    let err, res, end;
    let account_action_seq: number;
    let newPostTime: {[index: string]: number} = JSON.parse(sessionStorage.getItem('newPostTime') as string);
    if (newPostTime) {
      dispatch(actions.setNewPostTime(newPostTime));
      handleLoadingTip("handleParseNewPostTime", 0);
      console.timeEnd("handleParseNewPostTime");  
      return;    
    }
    let tmp = localStorage.getItem('newPostTime') as string;
    if (dataVersion === currentDataVersion && tmp !== null) {
      newPostTime = JSON.parse(inflate(tmp));
      account_action_seq = newPostTime.account_action_seq;
      // [err, end] = await awaitWrapDB(db.dfsweb3desoc.count());
      [err, end] = [null, count];
      if (err || (account_action_seq > end)) {
        console.log("db.dfsweb3desoc.count: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseNewPostTime", 0);
        return;        
      }
      [err, res] = await awaitWrapDB(db.dfsweb3desoc.where('account_action_seq').between(account_action_seq+1, end).toArray());
      if (err) {
        console.log("db.dfsweb3desoc.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseNewPostTime", 0);
        return;
      }
    } else {
      [err, res] = await awaitWrapDB(db.dfsweb3desoc.toArray()); //返回所有内容
      if (err) {
        console.log("db.dfsweb3desoc.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseNewPostTime", 0);
        return;
      };
      newPostTime = {
        account_action_seq: 0, 
        "1": 0, '2': 0, '3': 0, '4': 0, '5': 0, '6': 0, '7': 0, '8': 0, '9': 0, '10': 0, '11': 0, '12': 0,
        "13": 0, '14': 0, '15': 0, '16': 0, '17': 0, '18': 0, '19': 0, '20': 0, '21': 0, '22': 0, '23': 0, '0': 0
      }; 
    }
    // handleTipAdd(percent);
    handleLoadingTip("handleParseNewPostTime", 1);

    const dfsWeb3actions: DfsWeb3ActionsType = res;
    dfsWeb3actions.forEach((item) => {
      newPostTime.account_action_seq = item.account_action_seq;
      const time = moment(item.block_time).add(8, 'hour');
      const hour: number = Number(time.format('H'));
      const account: string = item.account;
      const action: string = item.name;

      if (account === 'dfsweb3desoc') {
        switch (action) {
          // case 'likepost':
          //   break;
          case 'newpost':
            newPostTime[hour] += 1;
            break;
          // case 'reply1':
          //   break;
          // case 'unstake':
          //   break;  
          // case 'refund':
          //   break;
          // case 'cancelrefund':
          //   break;
        }
      }
    });

    // handleTipAdd(percent);
    handleLoadingTip("handleParseNewPostTime", 1);
    localStorage.setItem('newPostTime', deflate(JSON.stringify(newPostTime))); 
    delete newPostTime.account_action_seq;
    dispatch(actions.setNewPostTime(newPostTime));
    sessionStorage.setItem('newPostTime', JSON.stringify(newPostTime)); 
    // handleTipNext(percent);
    handleLoadingTip("handleParseNewPostTime", 0);
    console.timeEnd("handleParseNewPostTime")
  }, [handleLoadingTip, dispatch, dataVersion, currentDataVersion]);
      
  const handleParseShiningPoolDatas = useCallback(async ( ) => {
    console.time("handleParseShiningPoolDatas")
    let err, res, end;
    let shiningPoolDatas: ShiningPoolDatasType;
    let account_action_seq: number;
    let tmp = localStorage.getItem('shiningPoolDatas') as string;
    if (dataVersion === currentDataVersion && tmp !== null) {
      shiningPoolDatas = JSON.parse(inflate(tmp));
      account_action_seq = shiningPoolDatas.account_action_seq as number;
      [err, end] = await awaitWrapDB(db.shiningpool1.count());
      if (err || (account_action_seq > end)) {
        console.log("db.shiningpool1.count: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseShiningPoolDatas", 0);
        return;        
      }
      [err, res] = await awaitWrapDB(db.shiningpool1.where('account_action_seq').between(account_action_seq+1, end).toArray());
      if (err) {
        console.log("db.shiningpool1.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseShiningPoolDatas", 0);
        return;
      }
    } else {
      [err, res] = await awaitWrapDB(db.shiningpool1.toArray()); //返回所有内容
      if (err) {
        console.log("db.shiningpool1.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseShiningPoolDatas", 0);
        return;
      };
      shiningPoolDatas = {account_action_seq: 0}; 
    }
    // handleTipAdd(percent);
    handleLoadingTip("handleParseShiningPoolDatas", 1);

    const shiningPoolactions: ShiningPoolActionsType = res;
    shiningPoolactions.forEach((item) => {
      shiningPoolDatas.account_action_seq = item.account_action_seq;
      // const day: string = moment(item.block_time).add(8, 'hour').format('YYYY-MM-DD'); //将utc时间改成北京时间
      const time = moment(item.block_time).add(8, 'hour');
      const day: string = time.diff('2022-10-30', 'days').toString(); //计算与2022-10-30有多少天
      const account: string = item.account;
      const action: string = item.name;
      const receiver: string = item.receiver;
      const memo: string = item.data.memo;
      let to: string = item.data.to;
      to = accountMapIdRef.current[to] as string;

      if (!shiningPoolDatas.hasOwnProperty(day)) {
        // shiningPoolDatas[day] = { reward: 0, author_map: {}};
        shiningPoolDatas[day] = { reward: 0, author: {}};
      }
      if (account === 'minedfstoken' && action === 'transfer' && receiver === 'shiningpool1' && 
          (memo === 'reader content mining reward' || memo === 'author content mining reward')) {
        const quantity: number = Number(item.data.quantity.split(' ')[0]);
        const reward: number = (shiningPoolDatas[day] as ShiningPoolDataType).reward;
        (shiningPoolDatas[day] as ShiningPoolDataType).reward = Number((quantity + reward).toFixed(4));

        if (memo === 'author content mining reward') {
          if ((shiningPoolDatas[day] as ShiningPoolDataType).author.hasOwnProperty(to)) {
            let author: {like: number, reward: number} = (shiningPoolDatas[day] as ShiningPoolDataType).author[to] as {like: number, reward: number};
            (shiningPoolDatas[day] as ShiningPoolDataType).author[to] = {like: author.like + 1, reward: Number((author.reward + quantity).toFixed(4))};
          } else {
            (shiningPoolDatas[day] as ShiningPoolDataType).author[to] =  {like: 1, reward: quantity};
          }
        }
      }
    });
    // handleTipAdd(percent);
    handleLoadingTip("handleParseShiningPoolDatas", 1);

    // console.log("shiningPoolDatas")
    // console.log(shiningPoolDatas)
    localStorage.setItem('shiningPoolDatas', deflate(JSON.stringify(shiningPoolDatas))); 
    delete shiningPoolDatas.account_action_seq;
    dispatch(actions.setShiningPoolDatas(shiningPoolDatas));
    // handleTipNext(percent);
    handleLoadingTip("handleParseShiningPoolDatas", 0);
    console.timeEnd("handleParseShiningPoolDatas")
  }, [handleLoadingTip, dispatch, dataVersion, currentDataVersion]);

const handleSearchFans = useCallback(async (searchAccount: string) => {
  type ParamsType = {code: string, json: true, scope: string, table: string, limit: number, lower_bound: string};

  let more = true;
  let next_key = '';
  let searchFans: FansFollowersType = [];
  while (more) {
    const params: ParamsType = {
      code: 'dfsweb3desoc',
      json: true,
      scope: searchAccount,
      table: "fans",
      limit: 1000,
      lower_bound: next_key,
    };
    
    let [err, res]: any[] = await get_table_rows(params);
    if (err) {
      console.log(err);
      return;
    }
    more = res.more;
    next_key = res.next_key;
    searchFans.push(...res.rows)
  }

  setSearchFans(searchFans);
}, []);

const handleSearchFollowers = useCallback(async (searchAccount: string) => {
  type ParamsType = {code: string, json: true, scope: string, table: string, limit: number, lower_bound: string};

  let more = true;
  let next_key = '';
  let searchFollowers: FansFollowersType = [];
  while (more) {
    const params: ParamsType = {
      code: 'dfsweb3desoc',
      json: true,
      scope: searchAccount,
      table: "followers",
      limit: 1000,
      lower_bound: next_key,
    };
    
    let [err, res]: any[] = await get_table_rows(params);
    if (err) {
      console.log(err);
      return;
    }
    more = res.more;
    next_key = res.next_key;
    searchFollowers.push(...res.rows)
  }
  setSearchFollowers(searchFollowers);
}, []);

// const handleSearchAccountContentfi = useCallback(async (searchAccount: string) => {
//   let [err, res] = await awaitWrapDB(db.contentfis.where('user').equals(searchAccount).toArray()); //返回所有内容
//   if (err) {
//     console.log("db.contentfis.toArray: " + err);
//     return;
//   } 
//   if (res[0]) {
//     setSearchAccountContentfi(res[0]);
//   } else {
//     setSearchAccountContentfi({user: '', create_count: 0, like_count: 0, create_reward: '0.0000 DFS', like_reward: '0.0000 DFS',});
//   }
// }, []);

  const handleGetRamPrice = useCallback(async ( ) => {
    if (handleCheckRefresh()) {
        let ramPrice = localStorage.getItem('ramPrice');
        dispatch(actions.setRamPrice(Number(ramPrice)));
        // handleTipNext(percent);
        handleLoadingTip("handleGetRamPrice", 0);
        return;
    };
    console.time("handleGetRamPrice")
    // console.log(`ramPriceUpdate: ${ramPriceUpdate}`)
    // if (ramPriceUpdate) {
    //   let diff = moment().diff(moment(ramPriceUpdate)) / 1000; //单位为秒
    //   if (diff < 24 * 60 * 60) { //24小时更新一次
    //     let ramPrice = localStorage.getItem('ramPrice');
    //     dispatch(actions.setRamPrice(Number(ramPrice)));
    //     handleTipNext(percent);
    //     return;
    //   }
    // }
    type ParamsType = {code: string, json: true, scope: string, table: string};
    const params: ParamsType = {
      code: 'eosio',
      json: true,
      scope: "eosio",
      table: "rammarket",
    };

    let [err, res]: any[] = await get_table_rows(params);
    if (err) {
      console.log(err);
      // setRamPrice(0);
      dispatch(actions.setRamPrice(0));
      // handleTipNext(percent);
      handleLoadingTip("handleGetRamPrice", 0);
      return
    }
    const baseBalance = res.rows[0].base.balance.split(' ')[0];
    const baseWeight = res.rows[0].base.weight;
    const quoteBalance = res.rows[0].quote.balance.split(' ')[0];
    const quoteWeight = res.rows[0].quote.weight;
    const ramPrice = (quoteBalance * quoteWeight) / (baseBalance / 1024  * baseWeight);
    // setRamPrice(Number(ramPrice.toPrecision(5)))
    dispatch(actions.setRamPrice(Number(ramPrice.toPrecision(5))));
    // handleTipNext(percent);
    handleLoadingTip("handleGetRamPrice", 0);
    // localStorage.setItem("ramPriceUpdate", moment().format());
    localStorage.setItem("ramPrice", ramPrice.toPrecision(5));
    console.timeEnd("handleGetRamPrice")
  }, [handleLoadingTip, dispatch, handleCheckRefresh]);

  const handleStoreProfiles = useCallback(async ( ) => {
    type ParamsType = {code: string, json: true, scope: string, table: string, limit: number, lower_bound: string};

    console.log(`profilesUpdate: ${profilesUpdate}`)
    if (profilesUpdate) {
      let diff = moment().diff(moment(profilesUpdate)) / 1000; //单位为秒
      if (diff < 24 * 60 * 60) { //24小时更新一次
        // handleTipNext(percent);
        handleLoadingTip("handleStoreProfiles", 0);
        return;
      }
    }

    let more = true;
    let next_key = '';
    let profiles: IProfile[] = [];
    while (more) {
      const params: ParamsType = {
        code: 'dfsweb3desoc',
        json: true,
        scope: "dfsweb3desoc",
        table: "profiles",
        limit: 1000,
        lower_bound: next_key,
      };
  
      // handleTipAdd(percent);
      handleLoadingTip("handleStoreProfiles", 1);
      let [err, res]: any[] = await get_table_rows(params);
      if (err) {
        console.log(err);
        // handleTipNext(percent);
        handleLoadingTip("handleStoreProfiles", 0);
        return;
      }
      more = res.more;
      next_key = res.next_key;
      profiles.push(...res.rows)
    }

    let [err, ] = await awaitWrapDB(db.profiles.bulkPut(profiles));
    if (err) {
      console.log("db.profiles.bulkPut error: " + err);
    };
    // handleTipNext(percent);
    handleLoadingTip("handleStoreProfiles", 0);
    localStorage.setItem("profilesUpdate", moment().format());
  }, [handleLoadingTip, profilesUpdate]);

  const handleStoreContentfis = useCallback(async ( ) => {
    if (handleCheckRefresh()) {
      // handleTipNext(percent);
      handleLoadingTip("handleStoreContentfis", 0);
      return;
    };
    console.time('handleStoreContentfis');
    type ParamsType = {code: string, json: true, scope: string, table: string, limit: number, lower_bound: string};

    // console.log(`contentfisUpdate: ${contentfisUpdate}`)
    // if (contentfisUpdate) {
    //   let diff = moment().diff(moment(contentfisUpdate)) / 1000; //单位为秒
    //   if (diff < 24 * 60 * 60) { //24小时更新一次
    //     handleTipNext(percent);
    //     return;
    //   }
    // }

    let more = true;
    let next_key = '';
    let contentfis: IContentfi[] = [];
    while (more) {
      const params: ParamsType = {
        code: 'dfsweb3desoc',
        json: true,
        scope: "dfsweb3desoc",
        table: "contentfis",
        limit: 1000,
        lower_bound: next_key,
      };
  
      // handleTipAdd(percent);
      handleLoadingTip("handleStoreContentfis", 1);
      let [err, res]: any[] = await get_table_rows(params);
      if (err) {
        console.log(err);
        // handleTipNext(percent);
        handleLoadingTip("handleStoreContentfis", 0);
        return;
      }
      more = res.more;
      next_key = res.next_key;
      contentfis.push(...res.rows)
    }

    let [err, ] = await awaitWrapDB(db.contentfis.bulkPut(contentfis));
    if (err) {
      console.log("db.contentfis.bulkPut error: " + err);
    }

    // handleTipNext(percent);
    handleLoadingTip("handleStoreContentfis", 0);
    // localStorage.setItem("contentfisUpdate", moment().format());
    console.timeEnd('handleStoreContentfis');
  }, [handleLoadingTip, handleCheckRefresh]);

  const handleStoreHolders = useCallback(async ( ) => {
    if (handleCheckRefresh()) {
      // handleTipNext(percent);
      handleLoadingTip("handleStoreHolders", 0);
      return;
    };
    console.time('handleStoreHolders');

    type ParamsType = {code: string, json: true, scope: string, table: string, limit: number, lower_bound: string};
    // console.log(`holdersUpdate: ${holdersUpdate}`)
    // if (holdersUpdate) {
    //   let diff = moment().diff(moment(holdersUpdate)) / 1000; //单位为秒
    //   if (diff < 24 * 60 * 60) { //24小时更新一次
    //     handleTipNext(percent);
    //     return;
    //   }
    // }

    let more = true;
    let next_key = '';
    let holders: IHolder[] = [];
    while (more) {
      const params: ParamsType = {
        code: 'dfsweb3desoc',
        json: true,
        scope: "dfsweb3desoc",
        table: "holders",
        limit: 1000,
        lower_bound: next_key,
      };
      
      // handleTipAdd(percent);
      handleLoadingTip("handleStoreHolders", 1);
      let [err, res]: any[] = await get_table_rows(params);
      if (err) {
        console.log(err);
        // handleTipNext(percent);
        handleLoadingTip("handleStoreHolders", 0);
        return;
      }
      more = res.more;
      next_key = res.next_key;
      holders.push(...res.rows)
    }

    let [err, ] = await awaitWrapDB(db.holders.bulkPut(holders));
    if (err) {
      console.log("db.holders.bulkPut error: " + err);
    }
      // handleTipNext(percent);
      handleLoadingTip("handleStoreHolders", 0);
    // localStorage.setItem("holdersUpdate", moment().format());
    console.timeEnd('handleStoreHolders');
  }, [handleLoadingTip, handleCheckRefresh]);

  const handleStoreRelations = useCallback(async ( ) => {
    if (handleCheckRefresh()) {
      // handleTipNext(percent);
      handleLoadingTip("handleStoreRelations", 0);
      return;
    };
    console.time('handleStoreRelations');    
    type ParamsType = {code: string, json: true, scope: string, table: string, limit: number, lower_bound: string};
    let more = true;
    let next_key = '';
    let relations: IRelation[] = [];
    while (more) {
      const params: ParamsType = {
        code: 'dfsweb3desoc',
        json: true,
        scope: "dfsweb3desoc",
        table: "relations",
        limit: 1000,
        lower_bound: next_key,
      };
  
      // handleTipAdd(percent);
      handleLoadingTip("handleStoreRelations", 1);
      let [err, res]: any[] = await get_table_rows(params);
      if (err) {
        console.log(err);
        // handleTipNext(percent);
        handleLoadingTip("handleStoreRelations", 0);
        return;
      }
      more = res.more;
      next_key = res.next_key;
      relations.push(...res.rows)
    }

    let [err, ] = await awaitWrapDB(db.relations.bulkPut(relations));
    if (err) {
      console.log("db.relations.bulkPut error: " + err);
    }
    // handleTipNext(percent);
    handleLoadingTip("handleStoreRelations", 0);
    console.timeEnd('handleStoreRelations');
  }, [handleLoadingTip, handleCheckRefresh]);

  const handleParseProfiles = useCallback(async ( ) => {
    console.time("handleParseProfiles")
    let profiles: {[index: string]: string} = JSON.parse(sessionStorage.getItem('profiles') as string); 
    if (!profiles) {
      profiles = {};
      let [err, res] = await awaitWrapDB(db.profiles.toArray()); //返回所有内容
      if (err) {
        console.log("db.profiles.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseProfiles", 0);
        return;
      } 

      res.forEach((item: {owner: string, nick: string}) => {
        profiles[item.owner] = item.nick;
      });
      sessionStorage.setItem('profiles', JSON.stringify(profiles));
    }

    // setProfiles(profiles);
    dispatch(actions.setProfiles(profiles));
    // handleTipNext(percent);
    handleLoadingTip("handleParseProfiles", 0);
    console.timeEnd("handleParseProfiles")
  }, [handleLoadingTip, dispatch]);

  const handleParseContentfis = useCallback(async ( ) => {
    console.time("handleParseContentfis")
    let contentfis: IContentfi[] = JSON.parse(sessionStorage.getItem('contentfis') as string); 
    if (!contentfis) {
      let [err, res] = await awaitWrapDB(db.contentfis.toArray()); //返回所有内容
      if (err) {
        console.log("db.contentfis.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseContentfis", 0);
        return;
      }
      contentfis = res;
      sessionStorage.setItem('contentfis', JSON.stringify(contentfis));
    }

    // setContentfis(res);
    dispatch(actions.setContentfis(contentfis));
    // handleTipNext(percent);
    handleLoadingTip("handleParseContentfis", 0);
    console.timeEnd("handleParseContentfis")
  }, [handleLoadingTip, dispatch]);

  const handleParseHolders = useCallback(async ( ) => {
    console.time("handleParseHolders")
    let holders: IHolder[] = JSON.parse(sessionStorage.getItem('holders') as string); 
    if (!holders) {
      let [err, res] = await awaitWrapDB(db.holders.toArray()); //返回所有内容
      if (err) {
        console.log("db.holders.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseHolders", 0);
        return;
      } 
      holders = res;
      sessionStorage.setItem('holders', JSON.stringify(holders));
    }

    // setHolders(res);
    dispatch(actions.setHolders(holders));
    // handleTipNext(percent);
    handleLoadingTip("handleParseHolders", 0);
    console.timeEnd("handleParseHolders")
  }, [handleLoadingTip, dispatch]);

  const handleParseRelations = useCallback(async ( ) => {
    console.time("handleParseRelations")
    let relations: IRelation[] = JSON.parse(sessionStorage.getItem('relations') as string); 
      if (!relations) {
      let [err, res] = await awaitWrapDB(db.relations.toArray()); //返回所有内容
      if (err) {
        console.log("db.relations.toArray: " + err);
        // handleTipNext(percent);
        handleLoadingTip("handleParseRelations", 0);
        return;
      } 
      relations = res;
      sessionStorage.setItem('relations', JSON.stringify(relations));
    }

    // setRelations(res);
    dispatch(actions.setRelations(relations));
    // handleTipNext(percent);
    handleLoadingTip("handleParseRelations", 0);
    console.timeEnd("handleParseRelations")
  }, [handleLoadingTip, dispatch]);

  // const handleCheckDB = useCallback(async (percent?: number ) => {
  //   if (!dfsWeb3Check) {
  //     message.error('check dfsweb3desoc table error');
  //     handleTipNext(percent);
  //     return;
  //   }

  //   if (!shiningPoolCheck) {
  //     message.error('check shiningpool1 table error');
  //     handleTipNext(percent);
  //     return;
  //   }

  //   if (typeof percent !== 'undefined') {
  //     message.success('check DB pass');
  //   }
  // }, [handleTipNext, dfsWeb3Check, shiningPoolCheck]);

  // const handleCheckDB = useCallback(async (percent?: number ) => {
  //   console.time("handleCheckDB");
  //   let [err, res]: any[] = await awaitWrapDB(db.dfsweb3desoc.toArray());
  //   if (err) {
  //     console.log("db.dfsweb3desoc.toArray: " + err);
  //     // handleTipNext(percent);
  //     handleLoadingTip("handleCheckDB", 0);
  //     return;
  //   };
  //   // handleTipAdd();
  //   handleLoadingTip("handleCheckDB", 0);

  //   let actions: {account_action_seq: number}[] = res;
  //   for (let i=0; i<actions.length; i++) {
  //     if (actions[i].account_action_seq !== i) {
  //       message.error('check dfsweb3desoc table error');
  //       // handleTipNext(percent);
  //       handleLoadingTip("handleCheckDB", 0);
  //       return;
  //     }
  //   };
  //   // handleTipAdd();
  //   handleLoadingTip("handleCheckDB", 1);

  //   [err, res] = await awaitWrapDB(db.shiningpool1.toArray());
  //   if (err) {
  //     console.log("db.shiningpool1.toArray: " + err);
  //     // handleTipNext(percent);
  //     handleLoadingTip("handleCheckDB", 0);
  //     return;
  //   };
  //   // handleTipAdd();
  //   handleLoadingTip("handleCheckDB", 1);

  //   actions = res;
  //   for (let i=0; i<actions.length; i++) {
  //     if (actions[i].account_action_seq !== i) {
  //       message.error('check shiningpool1 table error');
  //       // handleTipNext(percent);
  //       handleLoadingTip("handleCheckDB", 0);
  //       return;
  //     }
  //   }

  //   // handleTipNext(percent);
  //   handleLoadingTip("handleCheckDB", 0);
  //   message.success('check DB pass');
  //   console.timeEnd("handleCheckDB");
  // }, [handleLoadingTip]);

  //速度只快了1秒左右
  const handleCheckDB = useCallback(async () => {
    if (handleCheckRefresh()) return;
    console.time("handleCheckDB");
    let err;
    //import.meta 是一个内置在 ES 模块内部的对象。这个对象包含了很多模块的元数据信息。
    //其中一个有用的模块元数据属性是 import.meta.url，这个属性包含了一个模块在浏览器和 Node.js 的绝对路径
    const checkDB = await spawn(new Worker(((new URL("./workers/checkDB", import.meta.url)) as unknown as string)));
    [err, ] = await checkDB.checkDfsWeb3DB();
    if (err) {
      message.error(err);
      // handleLoadingTip("handleCheckDB", 0);
    }
    // handleLoadingTip("handleCheckDB", 1);

    [err, ] = await checkDB.checkShiningPoolDB();
    if (err) {
      message.error(err);
      // handleLoadingTip("handleCheckDB", 0);
    } 

    Thread.terminate(checkDB);
    // handleLoadingTip("handleCheckDB", 0);
    message.success('check DB pass');
    console.timeEnd("handleCheckDB");
  }, [handleCheckRefresh]);

  // const handleShowAccount = useCallback(() => {
  //   // if (shiningVipAccounts.includes(account.name)) {
  //   if (vip) {
  //     dispatch(actions.setShowAccount(!showAccount));
  //     message.info(showAccount? '隐藏账号': '显示账号')
  //   }
  // }, [dispatch, showAccount, vip]);

  const handleAutoSearch = useCallback((value: string) => {
    const options: { value: string }[] = [];
    if (value.trim() !== '') {
      // profiles.forEach((nickName, account) => {
      //   if (account.includes(value) || nickName.includes(value)) {
      //     options.push({value: `${nickName}@${account}`});
      //   }
      // });
      for (let account in profiles) {
        const nickName = profiles[account];
        if (account.toLowerCase().includes(value.toLowerCase()) || nickName.toLowerCase().includes(value.toLowerCase())) {
          options.push({value: `${nickName}@${account}`});
        }
      }
    }
    setOptions(options);
  }, [profiles]);

  const handleInputSearch = useCallback(async (value: string) => {
    setOptions([]);
    if (value.trim() !== '') {
      if (!vip) {
        notification.open({
          message: '注意',
          placement: 'top',
          duration: 8,
          description: '关注并点赞闪灵日报后，便可使用个人日报和查询日报的功能',
        });
        return;
      }
      if (value.indexOf('@') !== -1) {
        value = value.split('@')[1];
      }
      const regex = new RegExp('[a-z1-5.]+');
      if (!regex.test(value)) {
        message.error("帐号格式错误");
      } else {
        const searchAccount = value;
        setSearchAccount(searchAccount);
        // await handleSearchAccountContentfi(searchAccount);
        await handleSearchFans(searchAccount);
        await handleSearchFollowers(searchAccount);
      }
    } else {
      setSearchAccount('');
      setSearchFans([]);
      setSearchFollowers([]);
      // setSearchAccountContentfi({user: '', create_count: 0, like_count: 0, create_reward: '0.0000 DFS', like_reward: '0.0000 DFS',});
    }
  }, [handleSearchFans, handleSearchFollowers, vip]);

  const handleDrawerFollow = useCallback(async () => {
    const name = account.name;
    const permission = account.permissions;
    const params = {
      actions: [{
        account: 'dfsweb3desoc',
        name: 'follow',
        authorization: [{
          actor: name,
          permission,
        }],
        data: {
          user: name,
          who: drawerType.value,
        }          
      }]
    }

    let [err, res]: any | undefined[] = await Wallet.transact(params);
    if (err) {
      message.error(err.toString());
      console.log(err);
      return;        
    }
    if (res) {
      message.success("Success");
      dispatch(actions.setDrawerType({...drawerType, status: 'followed'}));
      console.log(res);
    }
  }, [drawerType, account, dispatch]);

  const handleDrawerUnfollow = useCallback(async () => {
    const name = account.name;
    const permission = account.permissions;
    const params = {
      actions: [{
        account: 'dfsweb3desoc',
        name: 'unfollow',
        authorization: [{
          actor: name,
          permission,
        }],
        data: {
          user: name,
          who: drawerType.value,
        }          
      }]
    }

    let [err, res]: any | undefined[] = await Wallet.transact(params);
    if (err) {
      message.error(err.toString());
      console.log(err);
      return;        
    }
    if (res) {
      message.success("Success");
      dispatch(actions.setDrawerType({...drawerType, status: ''}));
      console.log(res);
    }
  }, [drawerType, account, dispatch]);

  const handleBackgroundSync = useCallback(async () => {
    if (syncLock.current) return;
    syncLock.current = true;
    setSpinningSync(true);
    ignoreLoadingTipRef.current = true;

    await handleStoreDfsWeb3();
    await handleStoreShiningPool();
    await handleStoreProfiles();
    await handleStoreContentfis();
    await handleStoreHolders();
    await handleStoreRelations();

    console.log("")
    console.time("Promise.all");
    let dfsWeb3Count: number = await db.dfsweb3desoc.count();
    await handleParseAccountDatas(dfsWeb3Count);
    await handleParsePostDatas(dfsWeb3Count);
    await Promise.all([handleGetPrice(), handleParseDfsWeb3Datas(dfsWeb3Count), handleParseUserDfsWeb3Datas(dfsWeb3Count), 
      handleParseAccountPostDatas(dfsWeb3Count), handleParseLikePostTime(dfsWeb3Count), handleParseNewPostTime(dfsWeb3Count), 
      handleParseProfiles(), handleParseContentfis(), handleParseHolders(), handleParseRelations(), handleGetRamPrice(), 
      handleParseShiningPoolDatas()]);
    console.timeEnd("Promise.all");

    syncLock.current = false;
    setSpinningSync(false);
  }, [handleStoreDfsWeb3, handleStoreShiningPool, handleStoreProfiles, handleStoreContentfis, handleStoreHolders, handleStoreRelations, 
    handleParseShiningPoolDatas, handleParseProfiles, handleParseContentfis, handleParseHolders, handleParseRelations, handleParsePostDatas,
    handleGetRamPrice, handleGetPrice, handleParseDfsWeb3Datas, handleParseUserDfsWeb3Datas, handleParseAccountDatas, handleParseNewPostTime, 
    handleParseAccountPostDatas, handleParseLikePostTime, ]);

  const handleDrawerLike = useCallback(async () => {
    const name = account.name;
    const permission = account.permissions;
    const params = {
      actions: [{
        account: 'dfsweb3desoc',
        name: 'likepost',
        authorization: [{
          actor: name,
          permission,
        }],
        data: {
          user: name,
          post_id: drawerType.value,
        }          
      }]
    }

    let [err, res]: any | undefined[] = await Wallet.transact(params);
    if (err) {
      message.error(err.toString());
      console.log(err);
      return;        
    }
    if (res) {
      message.success("Success");
      dispatch(actions.setDrawerType({...drawerType, status: 'liked'}));
      // setCounters(counters + 1);
      setTimeout(() => {
        handleCounters(account);
        // handleBackgroundSync();
      }, 5000);
      // handleCounters(account);
      console.log(res);
    }
  }, [drawerType, account, dispatch, handleCounters]);

  const handleDrawerJump = useCallback(() => {
    window.open(iframeSrc);
  }, [iframeSrc]);

  const handleChangeCheck = useCallback((checked: boolean) => {
    localStorage.setItem('freeCpu', JSON.stringify(checked));
    dispatch(actions.setFreeCpu(checked));
  }, [dispatch]);

  const handlePriceOptionChange = useCallback((value: string) => {
    localStorage.setItem('priceOption', value);
    dispatch(actions.setPriceOption(value));
  }, [dispatch]);

  const handleCreationCount = useCallback((name: string): number => {
    const accountId = accountMapIdRef.current[name];
    if (!accountPostDatas.hasOwnProperty(accountId)) {
      return 0;
    } else {
      let obj = accountPostDatas[accountId] as {};
      return Object.keys(obj).length;
    }
  }, [accountPostDatas]);

  const menuItems = useMemo((): MenuProps['items'] => {
    const items: MenuProps['items'] = [
      {
        key: 'vConsole',
        label: vConsoleLabel
      },
      {
        key: 'clearSessionStorage',
        label: '清除会话存储'
      },
      {
        key: 'clearLocalStorage',
        label: '清除本地存储'
      },
      {
        key: 'clearIndexedDB',
        label: '清除IndexedDB'
      },
    ];  
    
    return items;
  }, [vConsoleLabel])

  const handleMenuItemsClick: MenuProps['onClick'] = async ({ key }) => {
    if (key === 'clearSessionStorage') {
      sessionStorage.clear();
      message.info('清除完成');
    } else if (key === 'clearLocalStorage') {
      sessionStorage.clear();
      localStorage.clear();
      message.info('清除完成');
    } else if (key === 'clearIndexedDB') {
      sessionStorage.clear();
      localStorage.clear();
      await awaitWrapDB(db.delete());
      message.info('清除完成');
      window.location.reload();
    } else if (key === 'vConsole') {
      let vConsole = JSON.parse(localStorage.getItem("vConsole") as string);
      if (vConsole) {
        vConsoleRef.current?.destroy();
        localStorage.setItem("vConsole", JSON.stringify(false));
        setVConsoleLabel("打开vConsole");
      } else {
        vConsoleRef.current = new VConsole();
        vConsoleRef.current.setSwitchPosition(0, 0);
        localStorage.setItem("vConsole", JSON.stringify(true));
        setVConsoleLabel("关闭vConsole"); 
      }     
    }
  };

  const handleVConsole = useCallback(() => {
    let vConsole = JSON.parse(localStorage.getItem("vConsole") as string);
    if (!vConsole) {
      setVConsoleLabel("打开vConsole");
    } else {
      vConsoleRef.current = new VConsole();
      vConsoleRef.current.setSwitchPosition(0, 0);
      setVConsoleLabel("关闭vConsole");      
    }
  }, []);

  useEffect(() => {
    handleLogin();
    handleVConsole();
    (async function() {
      if (lock.current) return;
      lock.current = true;
      document.body.scrollTop = document.documentElement.scrollTop = 0;
      loadingTipRef.current.total = 20;
      let dfsWeb3Count: number = 0;
      if (!await handleImportDB()) {
        // await handleStoreDfsWeb3(15);
        // await handleStoreShiningPool(15);
        // await handleStoreProfiles(5);
        // await handleStoreContentfis(5);
        // await handleStoreHolders(5);
        // await handleStoreRelations(5);
        await handleStoreDfsWeb3();
        await handleStoreShiningPool();
        await handleStoreProfiles();
        await handleStoreContentfis();
        await handleStoreHolders();
        await handleStoreRelations();

        console.time("Promise.all");
        dfsWeb3Count = await db.dfsweb3desoc.count();
        await handleParseAccountDatas(dfsWeb3Count);
        await handleParsePostDatas(dfsWeb3Count);
        await Promise.all([handleGetPrice(), handleParseDfsWeb3Datas(dfsWeb3Count), handleParseUserDfsWeb3Datas(dfsWeb3Count), 
          handleParseAccountPostDatas(dfsWeb3Count), handleParseLikePostTime(dfsWeb3Count), handleParseNewPostTime(dfsWeb3Count), 
          handleParseProfiles(), handleParseContentfis(), handleParseHolders(), handleParseRelations(), handleGetRamPrice(), 
          handleParseShiningPoolDatas()]);
        handleCheckDB();
        console.timeEnd("Promise.all");
        // handleParseAccountDatas(5);
        // handleParsePostDatas(5);
        // handleParseDfsWeb3Datas(3);
        // handleParseUserDfsWeb3Datas(3);
        // handleParseAccountPostDatas(2);
        // handleParseLikePostTime(1);
        // handleParseNewPostTime(1);
        // // handleParseDfsWeb3(10);
        // handleParseProfiles(1);
        // handleParseContentfis(1);
        // handleParseHolders(1);
        // handleParseRelations(1);
        // handleGetRamPrice(5);
        // await handleParseShiningPoolDatas(20);
        // // await handleCheckDB(1);

        localStorage.setItem("dataVersion", currentDataVersion); //放在parse完成后才设置
        dispatch(actions.setDataVersion(currentDataVersion));
        sessionStorage.setItem('refresh', JSON.stringify(true));
        localStorageSpace();
        sessionStorageSpace();
      }
      setSpinning(false);
      // percentage.current = 0;
      // count.current = 0;
      loadingTipRef.current = {total: 0, inc: {}, items: {}};
      lock.current = false;
    })();
  }, [handleStoreDfsWeb3, handleStoreShiningPool, handleStoreProfiles, handleStoreContentfis, handleStoreHolders, handleStoreRelations, 
      handleParseShiningPoolDatas, handleParseProfiles, handleParseContentfis, handleParseHolders, handleParseRelations, handleParsePostDatas,
      handleGetRamPrice, handleImportDB, handleLogin, handleGetPrice, handleParseDfsWeb3Datas, handleParseUserDfsWeb3Datas, dispatch,
      handleParseAccountPostDatas, handleParseLikePostTime, handleParseNewPostTime, handleParseAccountDatas, 
      handleCheckDB, handleVConsole]);

  return (
    <div className="main">
      {/* <My /> */}
      <Modal open={isModalOpen} onOk={handleOk} onCancel={handleCancel}
        style={{ top: 20 }}
        width="95%"
        bodyStyle={{padding: '0'}}
        okText="保存"
        cancelText="取消"
      >
        <Image src={imageSrc} alt="img"></Image>
      </Modal>
      <Drawer
        title={<img src={shiningdaily} alt="shiningdaily" width="35"/>}
        placement="bottom"
        closable={false}
        open={isDrawerOpen}
        onClose={handleDrawerCancel}
        bodyStyle={{padding: '0px'}}
        height="90%"
        headerStyle={{ padding: '10px'}}
        destroyOnClose={true}
        extra={
          <Space>
            <Switch checked={freeCpu} onChange={handleChangeCheck} />免CPU
            <Button type="primary" onClick={handleDrawerJump}>跳转</Button>
            {
              drawerType.type === 'account'?
              (
                drawerType.status === 'followed'?
                <Button type="primary" onClick={handleDrawerUnfollow}>取关</Button>:
                <Button type="primary" onClick={handleDrawerFollow}>关注</Button>
              ) : <></>
            }
            {
              drawerType.type === 'postId'?
              (
                drawerType.status === 'liked'?
                <Button type="primary" disabled>已赞</Button> :
                <Button type="primary" onClick={handleDrawerLike}>点赞</Button>
              ) : <></>
            }
            <Button type="primary" onClick={handleDrawerCancel}>关闭</Button>
          </Space>}
      >
        <iframe title="shining" style={{borderWidth: '0px'}} width="100%" height="100%" src={iframeSrc}></iframe>
      </Drawer>
      {/* <Drawer
        placement="bottom"
        closable={false}
        open={isChatUIOpen}
        onClose={handleChatUICancel}
        bodyStyle={{padding: '0px', width: '480px', margin: 'auto'}}
        height="100%"
        headerStyle={{ padding: '10px'}}
        destroyOnClose={true}
      >
        <ChatUI handleChatUICancel={handleChatUICancel}/>
      </Drawer> */}
      <Spin tip={tip} size="large" spinning={spinning}>
      <div className="relative" style={{padding: "0"}}>
        <img className="width-100" src={typer} alt="typer"></img>
        <img className="absolute left-0 top-0 s-60 hover-pointer" style={{opacity: '0.05'}} src={shining} alt="shining" onClick={handleExportDB}></img>
        <img className="absolute s-60" style={{opacity: '0.05', right: '0px', top: '80px'}} src={dfs} alt="dfs"></img>
        <img className="absolute left-0 bottom-0 s-60" style={{opacity: '0.05'}} src={yfc} alt="yfc"></img>
        <img className="absolute right-0 bottom-0 s-60" style={{opacity: '0.05'}} src={dbc} alt="dbc"></img>
        <img className="absolute s-60" style={{opacity: '0.05', left: '10%', top: '40%'}} src={tag} alt="tag"></img>
        <img className="absolute s-60" style={{opacity: '0.05', right: '15%', bottom: '20%'}} src={usdx} alt="usdx"></img>
        <img className="absolute s-60" style={{opacity: '0.05', right: '0', top: '50'}} src={pdd} alt="pdd"></img>
        <p className="absolute text-red fs-6 fw-700" style={{left: "40.5%", top: "35%", opacity: '0.04'}}>闪灵日报</p>
      </div>
      <div className="bg-white relative">
        <div className="text-center fs-1 fw-bold text-red" style={{letterSpacing: '20px', fontStyle: 'italic'}}>
          <span className="hover-pointer" onClick={handleHtml2Canvas}>闪灵日报</span>
        </div>
        <div className="text-center fs-6 rpb-2">@{handleGetDate()} {version}</div>
        <div className="text-center flexcc">
          <SyncOutlined style={{color: '#1890ff'}} className="hover-pointer" spin={spinningSync} onClick={handleBackgroundSync}/>
          <Dropdown menu={{items: menuItems, onClick: handleMenuItemsClick}} arrow>
            <MenuOutlined  style={{color: '#1890ff'}} className="rml-4 hover-pointer"/>
          </Dropdown>
          <img className="rml-4 hover-pointer w-15 h-15" src={telegram} alt="telegram" onClick={() => window.open('https://t.me/eosDavid')}/>
          {/* <CommentOutlined style={{color: '#1890ff'}} className="rml-4 hover-pointer" onClick={handleChatUIOpen}/> */}
        </div>
      </div>

      <Tabs className="bg-white" centered size="large" defaultActiveKey="1" activeKey={activeKey} onChange={handleTabsChange} 
        items={[
        {
          label: <span className="fs-5 fw-normal">闪灵日报</span>,
          key: '1',
          children: 
          <div className="bg-info-light">
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">闪灵富豪榜</div>
              <StakeRank />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">每日活跃账号数({dfsWeb3Datas[yesterday]? (dfsWeb3Datas[yesterday] as DfsWeb3DataType).dau.length: 0})</div>
              <ActiveAccountArea />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">闪灵每日数据</div>
              <DfsWeb3Line />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">昨日奖励排名</div>
              <RewardRank />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">昨日获赞数排名</div>
              <LikeRank />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">每日{priceOption}奖励</div>
              <RewardArea />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">每日内存消耗</div>
              <RamOccupyLine />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">闪灵每日数据累计</div>
              <DfsWeb3SumLine />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">{priceOption}奖励累计</div>
              <RewardSumLine/>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">内存消耗累计</div>
              <RamOccupySumLine />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">DFS抵押累计</div>
              <StakeArea />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">创作奖励排名</div>
              <CreateRewardRank />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">创作数排名</div>
              <CreateRank />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">获赞数排名</div>
              <LikedRank />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">粉丝量排名</div>
              <FansRank />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">发文时间点分布</div>
              <NewPostTimePie />
            </div>      
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">点赞时间点分布</div>
              <LikePostTimePie />
            </div>
          </div>
        },
        {
          label: <span className="fs-5 fw-normal">个人日报</span>,
          key: '2',
          children: 
          <div className="bg-info-light">
            <div className="rmb-2 pb-24 px-10 bg-white">
              <div className='flexsc'> { vip?
                <Avatar style={{ backgroundColor: '#52c41a' }} icon={<UserOutlined />} /> :
                <Avatar style={{ backgroundColor: '#ff4d4f' }} icon={<UserOutlined />} /> } { logined?
                <span className='rml-2 rmr-2 fs-medium hover-pointer' style={{color: '#1890ff'}} onClick={() => handleShowDrawer(account.name)}>{profiles[account.name]}@{showYourAccount? account.name: '******'}</span> :
                <Button className='rml-2 rmr-2' shape="round" loading={logining} type="primary" onClick={handleLogin}>{logining? '': '登陆'}</Button> }
              </div>
              <div className='rmt-2 flexsc'>
                <Affix offsetTop={10}>
                  <Badge count={counters} color={(counters<10)? 'green': 'red'} size="small">
                    <Avatar className='hover-pointer' style={{backgroundColor: '#1890ff' }} icon={<LikeOutlined />} onClick={() => handleCounters(account)}/>
                  </Badge>
                </Affix> { followed? 
                <Tag className='rml-2' icon={<CheckCircleOutlined />} style={{}} color="success">已关注</Tag> :
                <Tag className='rml-2 hover-pointer' icon={<CloseCircleOutlined />} style={{}} color="error" onClick={() => handleFollowers(account)}>未关注</Tag> } { liked?
                <Tag className='rml-1' icon={<CheckCircleOutlined />} style={{}} color="success">已点赞</Tag> :
                <Tag className='rml-1 hover-pointer' icon={<CloseCircleOutlined />} style={{}} color="error" onClick={() => handleNormalLiked(account)}>未点赞</Tag> }
                <Select className='rml-1'
                  defaultValue={priceOption}
                  style={{ width: 70 }}
                  size='small'
                  onChange={handlePriceOptionChange}
                  options={[
                    {value: 'USD', label: 'USD'}, {value: 'CNY', label: 'CNY'}, {value: 'DFS', label: 'DFS'}
                  ]}
                /> { showYourAccount? 
                <EyeOutlined className="rml-3 hover-pointer" onClick={() => setShowYourAccount(false)} style={{fontSize: '20px'}}/> :
                <EyeInvisibleOutlined className="rml-3 hover-pointer" onClick={() => setShowYourAccount(true)} style={{fontSize: '20px'}}/> }
                {/* <ScissorOutlined className="rml-2 hover-pointer"  onClick={handleHtml2Canvas} style={{fontSize: '20px'}}/> */}
                <Tooltip placement="bottom" color='red' title="关注并点赞闪灵日报后，便可使用个人日报和查询日报的功能">
                  <QuestionCircleOutlined className="rml-3 hover-pointer" style={{fontSize: '18px'}}/>
                </Tooltip>
              </div>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">作品发布时间树({vip? handleCreationCount(account.name): 0})</div>
              <UserPostDatasTree accountFlag="1" account={account.name} handleTabsChange={handleTabsChange} handleInputSearch={handleInputSearch} setSearchAccount={setSearchAccount}/>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">点赞你的用户({youLikedCount})</div>
              <UserLikedTable accountFlag="1" account={account.name} handleTabsChange={handleTabsChange} handleInputSearch={handleInputSearch} setSearchAccount={setSearchAccount}/>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">你点赞的用户({youLikeCount})</div>
              <UserLikeTable accountFlag="1" account={account.name} handleTabsChange={handleTabsChange} handleInputSearch={handleInputSearch} setSearchAccount={setSearchAccount}/>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">每日数据</div>
              <UserDfsWeb3Line account={account.name}/>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">作品利润列表({youProfitCount})</div>
              <UserProfitTable accountFlag="1" accountPostData={accountPostData} />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">作品利润累计</div>
              <UserProfitSumLine accountPostData={accountPostData} />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">每日数据累计</div>
              <UserDfsWeb3SumLine account={account.name}/>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">点赞你的用户分布({youLikedAccountCount})</div>
              <UserLikedOccupyTable accountFlag="1" account={account.name} handleTabsChange={handleTabsChange} handleInputSearch={handleInputSearch} setSearchAccount={setSearchAccount} />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">你点赞的用户分布({youLikeAccountCount})</div>
              <UserLikeOccupyTable accountFlag="1" account={account.name} handleTabsChange={handleTabsChange} handleInputSearch={handleInputSearch} setSearchAccount={setSearchAccount} />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">你的粉丝({vip? fans.length: 0})</div>
              <UserFansTable fans={fans} handleTabsChange={handleTabsChange} handleInputSearch={handleInputSearch} setSearchAccount={setSearchAccount} />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">你的关注({vip? followers.length: 0})</div>
              <UserFollowersTable followers={followers} handleTabsChange={handleTabsChange} handleInputSearch={handleInputSearch} setSearchAccount={setSearchAccount} />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">每日内存消耗</div>
              <UserRamOccupyLine account={account.name}/>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">每日内存消耗累计</div>
              <UserRamOccupySumLine account={account.name}/>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">你抵押的DFS</div>
              <UserStakeTable account={account.name}/>
            </div>
          </div>
        },
        {
          label: <span className="fs-5 fw-normal">查询日报</span>,
          key: '3',
          children: 
          <div className="bg-info-light">
            <div className="rmb-2 pb-24 px-10 bg-white">
              <div className='flexsc'>
                <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                <span className='rml-2 rmr-2 fs-medium hover-pointer' style={{color: '#1890ff'}} onClick={() => handleShowDrawer(searchAccount)}>{profiles[searchAccount]}@{searchAccount}</span>
              </div>
              <div className="rmt-2 bg-white flexsc">
                <Affix offsetTop={10}>
                  <Badge style={{zIndex: '10'}} count={counters} color={(counters<10)? 'green': 'red'} size="small">
                    <Avatar className='hover-pointer' style={{backgroundColor: '#1890ff'}} icon={<LikeOutlined />} onClick={() => handleCounters(account)}/>
                  </Badge>
                </Affix>
                <AutoComplete className='rml-2'
                  dropdownMatchSelectWidth={252}
                  style={{ width: "100%" }}
                  options={options}
                  onSearch={handleAutoSearch}
                >
                  <Input.Search placeholder="请输入账号" prefix={<UserOutlined />} onSearch={handleInputSearch} allowClear enterButton />
                </AutoComplete>
              </div>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">作品发布时间树({handleCreationCount(searchAccount)})</div>
              <UserPostDatasTree accountFlag="2" account={searchAccount} handleTabsChange={handleTabsChange} handleInputSearch={handleInputSearch} setSearchAccount={setSearchAccount}/>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">点赞他的用户({heLikedCount})</div>
              <UserLikedTable accountFlag="2" account={searchAccount} handleTabsChange={handleTabsChange} handleInputSearch={handleInputSearch} setSearchAccount={setSearchAccount}/>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">他点赞的用户({heLikeCount})</div>
              <UserLikeTable accountFlag="2" account={searchAccount} handleTabsChange={handleTabsChange} handleInputSearch={handleInputSearch} setSearchAccount={setSearchAccount}/>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">每日数据</div>
              <UserDfsWeb3Line  account={searchAccount}/>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">作品利润列表({heProfitCount})</div>
              <UserProfitTable accountFlag="2" accountPostData={searchAccountPostData} />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">作品利润累计</div>
              <UserProfitSumLine accountPostData={searchAccountPostData} />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">每日数据累计</div>
              <UserDfsWeb3SumLine account={searchAccount}/>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">点赞他的用户分布({heLikedAccountCount})</div>
              <UserLikedOccupyTable accountFlag="2" account={searchAccount} handleTabsChange={handleTabsChange} handleInputSearch={handleInputSearch} setSearchAccount={setSearchAccount} />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">他点赞的用户分布({heLikeAccountCount})</div>
              <UserLikeOccupyTable accountFlag="2" account={searchAccount} handleTabsChange={handleTabsChange} handleInputSearch={handleInputSearch} setSearchAccount={setSearchAccount} />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">他的粉丝({searchFans.length})</div>
              <UserFansTable fans={searchFans} handleTabsChange={handleTabsChange} handleInputSearch={handleInputSearch} setSearchAccount={setSearchAccount}/>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">他的关注({searchFollowers.length})</div>
              <UserFollowersTable followers={searchFollowers} handleTabsChange={handleTabsChange} handleInputSearch={handleInputSearch} setSearchAccount={setSearchAccount} />
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">每日内存消耗</div>
              <UserRamOccupyLine account={searchAccount}/>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">每日内存消耗累计</div>
              <UserRamOccupySumLine account={searchAccount}/>
            </div>
            <div className="rmb-2 py-24 px-5 bg-white">
              <div className="text-center fs-5 fw-bold rmb-3">他抵押的DFS</div>
              <UserStakeTable account={searchAccount}/>
            </div>
          </div>
        }
      ]} />
      <Affix offsetBottom={20}  style={{ position: 'absolute', right: '5%' }}>
        <ToTopOutlined className="hover-pointer" style={{fontSize: '30px', opacity: "0.3"}} 
          onClick={() => {document.body.scrollTop = document.documentElement.scrollTop = 0}} />
      </Affix>
      </Spin>
    </div>
  );
}

export default App;
