import { memo, useCallback, useEffect, useState } from 'react'
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { db } from '@/utils/db'
import { useSelector, useDispatch } from 'react-redux';
import type {StateType, DispatchType } from '@/store';
import { actions } from '@/store/app';
import { useShowDrawer } from '@/hook/public';
import type { UserDfsWeb3DatasType, UserDfsWeb3DataType } from '@/store/app';

interface IProps {
  accountFlag: string;
  account: string;
  handleTabsChange: (activeKey: string) => void;
  handleInputSearch: (value: string) => void;
  setSearchAccount: React.Dispatch<React.SetStateAction<string>>;
}

interface DataType {
  key: number;
  index: number;
  user: string;
  reward: number;
  like: number;
  percent: string;
  account: string;
}

const UserLikeOccupyTable: React.FC<IProps> = (props) => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const account = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.account);
  const liked = useSelector<StateType, boolean>((state: StateType) => state.app.liked);
  const followed = useSelector<StateType, boolean>((state: StateType) => state.app.followed);
  const shiningVipAccounts = useSelector<StateType, string[]>((state: StateType) => state.app.vipAccounts);
  const vip: boolean = (liked && followed) || shiningVipAccounts.includes(account.name);
  const dispatch = useDispatch<DispatchType>();
  const handleShowDrawer = useShowDrawer();
  const profiles = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.profiles);
  const userDfsWeb3Datas = useSelector<StateType, UserDfsWeb3DatasType>((state: StateType) => state.app.userDfsWeb3Datas);
  const dfsPrice = useSelector<StateType, {DFS: number, USD: number, CNY: number}>((state: StateType) => state.app.dfsPrice);
  const priceOption = useSelector<StateType, 'DFS'|'USD'|'CNY'>((state: StateType) => state.app.priceOption);
  const accountMapId = useSelector<StateType, {[index: string]: string | number}>((state: StateType) => state.app.accountMapId);
  const idMapAccount = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.idMapAccount);
  const columns: ColumnsType<DataType> = [
    {
      title: <span className="fw-bold">序号</span>,
      dataIndex: 'index',
      key: 'index',
      align: 'center',
      width: '15%',
      render: (text: string, record, index) => {
        return <span style={{color: '#1890ff'}} className="hover-pointer" onClick={() => handleSearchAccount(record.account)}>{text}</span>
      }
    },
    {
      title: <span className="fw-bold">作者</span>,
      dataIndex: 'user',
      key: 'user',
      align: 'center',
      render: (text: string, record, index) => {
        return <span style={{color: '#1890ff'}} className="hover-pointer" onClick={() => handleShowDrawer(record.account)}>{text}</span>
      }
    },
    {
      title: <span className="fw-bold">奖励({priceOption})</span>,
      dataIndex: 'reward',
      key: 'reward',
      align: 'center',
    },
    {
      title: <span className="fw-bold">获赞</span>,
      dataIndex: 'like',
      key: 'like',
      align: 'center',
      width: '15%',
    },
    {
      title: <span className="fw-bold">百分比</span>,
      dataIndex: 'percent',
      key: 'percent',
      align: 'center',
      width: '20%',
    },
  ];

  const handleShowName = useCallback((nick: string, account: string): string => {
    // return (nick? nick: '') + (showAccount? '@' + account : '@******');
    if (typeof nick === 'undefined' || nick.trim() === '') {
      return account;
    } else {
      return nick;
    }
  }, []);

  const handleSearchAccount = useCallback((account: string) => {
    dispatch(actions.setActiveKey(3));
    props.handleTabsChange('3');
    props.handleInputSearch(account);
    props.setSearchAccount(account);
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }, [dispatch, props]);

  const handleLikeData = useCallback(async () => {
    if (!Object.keys(userDfsWeb3Datas).length || !vip) {//判断对象是否为空
      setDataSource([]);
      return;
    }
    type LikeAccountsType = {acc: string, time: string, id: number, type: string, trx: string}[];
    let accountsData: {[index: string]: {like: number, reward: number}} = {};
    let rewardSum: number = 0;
    let likeSum: number = 0;
    let accSet: string[] = [];
    const profilesTmp: {[index: string]: string} = profiles;
    const dataArray: DataType[] = [];
    const accountId = accountMapId[props.account];

    for (let date in userDfsWeb3Datas) {
      let likeAccounts: LikeAccountsType = [];
      const accountMap = userDfsWeb3Datas[date] as UserDfsWeb3DataType;
      if (accountMap.hasOwnProperty(accountId)) {
        likeAccounts = accountMap[accountId].likeAcc as LikeAccountsType;
      } else {
        continue;
      } 
      for (let item of likeAccounts) {
        const trx_id = item.trx;
        let reward = 0.0000;
        const idAccount = idMapAccount[item.acc];
        const actions = (await db.shiningpool1.where('trx_id').startsWith(trx_id).toArray()).filter((value) => {
          if (value.account === "minedfstoken" && value.name === "transfer" && value.data.from === "shiningpool1" && 
              value.data.memo === "author content mining reward" && value.data.to === idAccount && value.receiver === idAccount) {
                return true;
              } else {
                return false;
              }
        });
        if (actions.length) {
          reward = Number((actions[0].data.quantity as string).split(' ')[0]);
        }
        if (accountsData.hasOwnProperty(idAccount)) {
          accountsData[idAccount].like += 1;
          accountsData[idAccount].reward += reward;
        } else {
          accountsData[idAccount] = {like: 1, reward};    
        }
        if (!accSet.includes(item.acc)) {
          accSet.push(item.acc);
        }
        rewardSum += reward;
        likeSum += 1;
      }
    }

    if (rewardSum > 0.0001) {
      for (let account in accountsData) {
        const nick = profilesTmp[account] as string;
        dataArray.push({ key: 0, index: 0, user: handleShowName(nick, account), like: accountsData[account].like,
          reward: Number((accountsData[account].reward * dfsPrice[priceOption]).toFixed(4)), account,
          percent: (accountsData[account].reward / rewardSum * 100).toFixed(1) + '%'});
      }
      dataArray.sort((a, b) => b.reward - a.reward);
    } else { //rewardSum为0时，按like数来排序
      for (let account in accountsData) {
        const nick = profilesTmp[account] as string;
        dataArray.push({ key: 0, index: 0, user: handleShowName(nick, account), like: accountsData[account].like,
          reward: Number((accountsData[account].reward * dfsPrice[priceOption]).toFixed(4)), account,
          percent: (accountsData[account].like / likeSum * 100).toFixed(1) + '%'});
      }
      dataArray.sort((a, b) => b.like - a.like);
    }

    let index: number = 1;
    dataArray.forEach(item => {
      item.key = index;
      item.index = index++;
    })
    if (props.accountFlag === '1') {
      dispatch(actions.setYouLikeAccountCount(accSet.length));
    } else if (props.accountFlag === '2') {
      dispatch(actions.setHeLikeAccountCount(accSet.length));
    }
    setDataSource(dataArray);
  }, [props, handleShowName, vip, profiles, userDfsWeb3Datas, dfsPrice, priceOption, accountMapId, idMapAccount, dispatch]);

  useEffect(() => {
    handleLikeData();
  },[handleLikeData]);

  return (
    <div>
      <Table size="small" dataSource={dataSource} columns={columns}/>
    </div>
  )
};

export default memo(UserLikeOccupyTable);
