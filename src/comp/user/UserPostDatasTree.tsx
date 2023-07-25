import { memo, useCallback, useEffect, useState, useRef } from 'react'
import { Tree, Tooltip, Spin, Badge } from 'antd';
import type { DataNode } from 'antd/es/tree';
import moment from 'moment';
import { db } from '@/utils/db'
import { useSelector, useDispatch } from 'react-redux';
import type {StateType, DispatchType } from '@/store';
import { actions } from '@/store/app';
import { DownOutlined, QuestionCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { useShowDrawer, useShowDrawer2 } from '@/hook/public';
import type { AccountPostDatasType, AccountPostDatasMapDataType, AccountPostDataType } from '@/store/app';

interface IProps {
  account: string;
  accountFlag: string;
  handleTabsChange: (activeKey: string) => void;
  handleInputSearch: (value: string) => void;
  setSearchAccount: React.Dispatch<React.SetStateAction<string>>;
}

const UserPostDatasTree: React.FC<IProps> = (props) => {
  const [treeData, setTreeData] = useState<DataNode[]>([]);
  const lock = useRef<boolean>(false);
  const [spinning, setSpinning] = useState<boolean>(false);
  const account = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.account);
  const liked = useSelector<StateType, boolean>((state: StateType) => state.app.liked);
  const followed = useSelector<StateType, boolean>((state: StateType) => state.app.followed);
  const shiningVipAccounts = useSelector<StateType, string[]>((state: StateType) => state.app.vipAccounts);
  const vip: boolean = (liked && followed) || shiningVipAccounts.includes(account.name);
  const dispatch = useDispatch<DispatchType>();
  const handleShowDrawer = useShowDrawer();
  const handleShowDrawer2 = useShowDrawer2();
  const profiles = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.profiles);
  const accountPostDatas = useSelector<StateType, AccountPostDatasType>((state: StateType) => state.app.accountPostDatas);
  const likePostIds = useSelector<StateType, number[]>((state: StateType) => state.app.likePostIds);
  const dfsPrice = useSelector<StateType, {DFS: number, USD: number, CNY: number}>((state: StateType) => state.app.dfsPrice);
  const priceOption = useSelector<StateType, 'DFS'|'USD'|'CNY'>((state: StateType) => state.app.priceOption);
  const accountMapId = useSelector<StateType, {[index: string]: string | number}>((state: StateType) => state.app.accountMapId);
  const idMapAccount = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.idMapAccount);

  const handleSearchAccount = useCallback((account: string) => {
    dispatch(actions.setActiveKey(3));
    props.handleTabsChange('3');
    props.handleInputSearch(account);
    props.setSearchAccount(account);
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }, [dispatch, props]);

  // const handleGetTypeName = useCallback((type: string) => {
  //   if (type === 'article') {
  //     return '文章';
  //   } else if (type === 'thought') {
  //     return '想法';
  //   } else if (type === 'video') {
  //     return '视频';
  //   } else {
  //     return '其它';
  //   }
  // }, []);

  const handleGetNameType = useCallback((type: string) => {
    if (type === '文章') {
      return 'article';
    } else if (type === '想法') {
      return 'thought';
    } else if (type === '视频') {
      return 'video';
    } else {
      return 'undefined';
    }
  }, []);

  const handleShowName = useCallback((nick: string, account: string): string => {
    // return (nick? nick: '') + (showAccount? '@' + account : '@******');
    if (typeof nick === 'undefined' || nick.trim() === '') {
      return account;
    } else {
      return nick;
    }
  }, []);

  const handlePostDatas = useCallback(async () => {
    type ChildrenType = {title: string | JSX.Element, key: string, children: {
      title: string | JSX.Element, key: string, ram: number, reward: number, liked: number, post: number, children: {
        title: string | JSX.Element, key: string, ram: number, reward: number, liked: number, post: number, children: {
          title: string | JSX.Element, key: string, ram: number, reward: number, children: {
            title: string | JSX.Element, key: string, isLeaf: boolean
          }[]
        }[]
      }[]
    }[]};

    if (!Object.keys(accountPostDatas).length || !vip) {//判断对象是否为空
      return;
    }

    const dataNode: {[index: string]: ChildrenType} = {};
    const postDataTmp: AccountPostDataType = {};
    const accountId = accountMapId[props.account] as string;
    if (!accountPostDatas.hasOwnProperty(accountId)) {
      const year = moment().format('YYYY');
      dataNode[year] = {
        title: year+'年', key: year, children: []
      }
    } else {
      const postData = accountPostDatas[accountId] as AccountPostDatasMapDataType;
      for (let postId in postData) {
        const time = moment('2022-10-30').add(postData[postId].time, 'minutes').format();
        const year: string = time.slice(0, 4);
        const month: string = time.slice(5, 7);
        const day: string = time.slice(8, 10);
        const hourMinute: string = time.slice(11, 16);
        // const type: string = postData[postId].type;
        // const typeName: string = handleGetTypeName(type);
        const typeName: string = postData[postId].type;
        const type: string = handleGetNameType(typeName);      
        const ram: number = postData[postId].ram;
        let rewardSum = 0;
        const likedAccountsChildren = [];
        let index = 1;
        for (let item of postData[postId].likedAcc) {
          const idAccount = idMapAccount[item.acc];
          const nick = profiles[idAccount] as string;
          const user = handleShowName(nick, idAccount);
          // const time = item.time
          const time = moment('2022-10-30').add(item.time, 'minutes').format().slice(0, 16);
          const trx_id = item.trx;
          let reward = '0.0000';
          const actions = (await db.shiningpool1.where('trx_id').startsWith(trx_id).toArray()).filter((value) => {
            if (value.account === "minedfstoken" && value.name === "transfer" && value.data.from === "shiningpool1" && 
                value.data.memo === "author content mining reward" && value.data.to === props.account && value.receiver === props.account) {
                  return true;
                } else {
                  return false;
                }
          });
          if (actions.length) {
            reward = (actions[0].data.quantity as string).split(' ')[0];
          }
          rewardSum += Number(reward);
          const msg = <>
            <div>
              <Badge className="hover-pointer" style={{color: '#1890ff'}} count={<SearchOutlined onClick={() => handleSearchAccount(idAccount)} />} offset={["-50%", "70%"]} >
                <span>{index + '.'}</span>
              </Badge>
              <span style={{color: '#1890ff'}} className="hover-pointer" onClick={() => handleShowDrawer(idAccount)}>{' ' + user}</span>
            </div>
            <div><span className="color-white">{index + '. '}</span>{"点赞: " + time + ', ' + (Number(reward) * dfsPrice[priceOption]).toFixed(4) + `${priceOption}` }</div>
            {/* <div><span className="color-white">{index + '. '}</span>{"点赞时间: " + time + ' DFS奖励: ' + reward}</div> */}
          </>
          index += 1;
          likedAccountsChildren.push({title: msg, key: year+month+day+postId.toString()+idAccount, isLeaf: true});
        }
        postDataTmp[postId] = {type, time, ram, reward: rewardSum}; //用来给利润表用

        // const title = typeName + postId.toString() + ', 时间: ' + hourMinute + ', DFS奖励: ' + rewardSum.toFixed(4) + ', 内存: ' + (ram/1024).toFixed(2) + 'K';
        const addr = `https://dfs-shining.netlify.app/detail/${type}/${postId.toString()}`;
        const title = <span>
                        <Badge dot={likePostIds.includes(Number(postId))} status="success"><span style={{color: '#1890ff'}} className="hover-pointer" onClick={() => handleShowDrawer2(addr, Number(postId))}>{typeName + postId.toString()}</span></Badge>
                        {', ' + (index-1) + ', ' + (rewardSum * dfsPrice[priceOption]).toFixed(4) + ', ' + (ram/1024).toFixed(2) + 'KB, '+ hourMinute + ', '}
                        <Tooltip placement="bottom" color='red' title="作品ID, 获赞, 奖励, 内存, 时间"><QuestionCircleOutlined /></Tooltip>
                      </span>;
        if (!dataNode.hasOwnProperty(year)) { //不存在
          dataNode[year] = {title: year+'年', key: year, children: [{
            title: month+'月', key: year+month, ram: 0, reward: 0, liked: 0, post: 0, children: [{
              title: day+'日', key: year+month+day, ram: 0, reward: 0, liked: 0, post: 0, children: [{
                title, key: year+month+day+postId.toString(), ram, reward: rewardSum, children: likedAccountsChildren
              }]
            }]
          }]}
        } else { //存在
          let isMonth = false;
          let indexMonth = 0;
          for (let i=0; i<dataNode[year].children.length; i++) {
            if (dataNode[year].children[i].key === year+month) {
              isMonth = true;
              indexMonth = i;
              break;
            }
          }
          if (isMonth) {
            let isDay = false;
            let indexDay = 0;
            for (let i=0; i<dataNode[year].children[indexMonth].children.length; i++) {
              if (dataNode[year].children[indexMonth].children[i].key === year+month+day) {
                isDay = true;
                indexDay = i;
                break;
              }
            }
            if (isDay) {
              dataNode[year].children[indexMonth].children[indexDay].children.push({title, 
                key: year+month+day+postId.toString(), ram, reward: rewardSum, children: likedAccountsChildren});
            } else {
              dataNode[year].children[indexMonth].children.push({
                title: day+'日', key: year+month+day, ram: 0, reward: 0, liked: 0, post: 0, children: [{
                  title, key: year+month+day+postId.toString(), ram, reward: rewardSum, children: likedAccountsChildren
                }]
              })
            }
          } else {
            dataNode[year].children.push({
              title: month+'月', key: year+month, ram: 0, reward: 0, liked: 0, post: 0, children: [{
                title: day+'日', key: year+month+day, ram: 0, reward: 0, liked: 0, post: 0, children: [{
                  title, key: year+month+day+postId.toString(), ram, reward: rewardSum, children: likedAccountsChildren
                }]
              }]
            });
          }
        }
      }
    }

    for (let year in dataNode) {
      let monthChildren = dataNode[year].children;
      let title = dataNode[year].title;
      let postIds = dataNode[year].children;
      let yearPostSum = 0;
      let yearRamSum = 0;
      let yearRewardSum = 0;
      let yearLikedSum = 0;

      for (let month in monthChildren) {
        let dayChildren = monthChildren[month].children;
        let title = monthChildren[month].title;
        let postIds = monthChildren[month].children;
        let monthPostSum = 0;
        let monthRamSum = 0;
        let monthRewardSum = 0;
        let monthLikedSum = 0;

        for (let day in dayChildren) {
          let title = dayChildren[day].title;
          let postIds = dayChildren[day].children;
          let dayPostSum = dayChildren[day].children.length;
          let dayRamSum = 0;
          let dayRewardSum = 0;
          let dayLikedSum = 0;
          postIds.forEach(item => {
            dayLikedSum += item.children.length;
            dayRamSum += item.ram;
            dayRewardSum += item.reward;
          })
          dayChildren[day].title = title + ', 作品:' +  dayPostSum + ', 获赞:' + dayLikedSum + ', 奖励:' + 
            (dayRewardSum * dfsPrice[priceOption]).toFixed(4)  + ', 内存:' + (dayRamSum/1024).toFixed(2) + 'K';
          dayChildren[day].ram = dayRamSum;
          dayChildren[day].reward = dayRewardSum;
          dayChildren[day].liked = dayLikedSum;
          dayChildren[day].post = dayPostSum;
        }

        postIds.forEach(item => {
          monthLikedSum += item.liked;
          monthRamSum += item.ram;
          monthRewardSum += item.reward;
          monthPostSum += item.post;
        })
        monthChildren[month].title = title + ', 作品:' +  monthPostSum + ', 获赞:' + monthLikedSum + ', 奖励:' + 
          (monthRewardSum * dfsPrice[priceOption]).toFixed(2)  + ', 内存:' + (monthRamSum/1024).toFixed(2) + 'K';
        monthChildren[month].ram = monthRamSum;
        monthChildren[month].reward = monthRewardSum;
        monthChildren[month].liked = monthLikedSum;
        monthChildren[month].post = monthPostSum;
      }

      postIds.forEach(item => {
        yearLikedSum += item.liked;
        yearRamSum += item.ram;
        yearRewardSum += item.reward;
        yearPostSum += item.post;
      })
      dataNode[year].title = title + ', 作品:' +  yearPostSum + ', 获赞:' + yearLikedSum + ', 奖励:' + 
        (yearRewardSum * dfsPrice[priceOption]).toFixed(2)  + ', 内存:' + (yearRamSum/1024).toFixed(2) + 'K';
    }

    const dataNodeTmp: DataNode[] = [];
    for (let key in dataNode) {
      dataNodeTmp.push(dataNode[key]);
    }
    setTreeData(dataNodeTmp);
    if (props.accountFlag === '1') {
      dispatch(actions.setAccountPostData(postDataTmp));
    } else if (props.accountFlag === '2') {
      dispatch(actions.setSearchAccountPostData(postDataTmp));
    }

  }, [handleShowName, handleGetNameType, handleShowDrawer, handleShowDrawer2, vip, accountPostDatas, profiles, props, likePostIds, 
      dfsPrice, priceOption, handleSearchAccount, dispatch, idMapAccount, accountMapId]);


  useEffect(() => {
    (async function() {
      if (lock.current) return;
      lock.current = true;
      setSpinning(true);
      await handlePostDatas();
      setSpinning(false);
      lock.current = false;
    })();
  },[handlePostDatas]);

  return (
    <Spin spinning={spinning}>
      <Tree
        showLine
        switcherIcon={<DownOutlined />}
        treeData={treeData}
      />
    </Spin>
  )
};

export default memo(UserPostDatasTree);
