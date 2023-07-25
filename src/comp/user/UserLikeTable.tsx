import { memo, useCallback, useEffect, useState } from 'react'
import { Table, DatePicker, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { db } from '@/utils/db'
import { useSelector, useDispatch } from 'react-redux';
import type {StateType, DispatchType } from '@/store';
import { actions } from '@/store/app';
import { useShowDrawer, useShowDrawer2 } from '@/hook/public';
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
  time: string;
  post_id: number;
  post_type: string;
  reward: number;
  account: string;
}

const UserLikeTable: React.FC<IProps> = (props) => {
  // const today: string = moment().format('YYYY-MM-DD');
  const [defaultValue, setDefaultValue] = useState<moment.Moment>(moment());
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const account = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.account);
  const liked = useSelector<StateType, boolean>((state: StateType) => state.app.liked);
  const followed = useSelector<StateType, boolean>((state: StateType) => state.app.followed);
  const shiningVipAccounts = useSelector<StateType, string[]>((state: StateType) => state.app.vipAccounts);
  const vip: boolean = (liked && followed) || shiningVipAccounts.includes(account.name);
  const dispatch = useDispatch<DispatchType>();
  const handleShowDrawer = useShowDrawer();
  const handleShowDrawer2 = useShowDrawer2();
  const profiles = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.profiles);
  const userDfsWeb3Datas = useSelector<StateType, UserDfsWeb3DatasType>((state: StateType) => state.app.userDfsWeb3Datas);
  const likePostIds = useSelector<StateType, number[]>((state: StateType) => state.app.likePostIds);
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
      title: <span className="fw-bold">时间</span>,
      dataIndex: 'time',
      key: 'time',
      align: 'center',
    },
    {
      title: <span className="fw-bold">作品</span>,
      dataIndex: 'post_id',
      key: 'post_id',
      align: 'center',
      render: (value: any, record: DataType, index: number) => {
        const addr = `https://dfs-shining.netlify.app/detail/${handleGetNameType(record.post_type)}/${value}`;
        return <Badge dot={likePostIds.includes(value)} status="success"><span style={{color: '#1890ff'}} className="hover-pointer" onClick={() => handleShowDrawer2(addr, value)}>{value}</span></Badge>
      }
    },
  ];

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

  const handleSearchAccount = useCallback((account: string) => {
    dispatch(actions.setActiveKey(3));
    props.handleTabsChange('3');
    props.handleInputSearch(account);
    props.setSearchAccount(account);
    document.body.scrollTop = document.documentElement.scrollTop = 0;
  }, [dispatch, props]);

  const handleLikeData = useCallback(async (date: string) => {
    if (!Object.keys(userDfsWeb3Datas).length || !vip) {//判断对象是否为空
      setDataSource([]);
      return;
    }
    type LikeAccountsType = {acc: string, time: string, id: number, type: string, trx: string}[];
    let likeAccounts: LikeAccountsType = [];
    const accountId = accountMapId[props.account];
    date = moment(date).diff('2022-10-30', 'days').toString();
    if (userDfsWeb3Datas.hasOwnProperty(date)) { //过了24点后，如果没有数据，props.actionData[date]为undefined，props.actionData[date].account_map会报错，所以这里加undefined判断
      const accountMap = userDfsWeb3Datas[date] as UserDfsWeb3DataType;
      if (accountMap.hasOwnProperty(accountId)) {
        likeAccounts = accountMap[accountId].likeAcc as LikeAccountsType;
      }
    }
    const profilesTmp: {[index: string]: string} = profiles;
    const dataArray: DataType[] = [];

    let index: number = 1;
    for (let item of likeAccounts) {
      const idAccount = idMapAccount[item.acc];
      const nick = profilesTmp[idAccount] as string;
      const time = item.time;
      const post_id = item.id;
      const post_type = item.type
      const trx_id = item.trx;
      let reward = 0.0000;
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

      // dataArray.push({ key: index, index: index++, user: (nick? nick: '')+'@'+item.account,});
      dataArray.push({ key: index, index: index++, user: handleShowName(nick, idAccount), time, post_id, post_type, 
        reward: Number((reward * dfsPrice[priceOption]).toFixed(4)), account: idAccount});
    }

    if (props.accountFlag === '1') {
      dispatch(actions.setYouLikeCount(index-1));
    } else if (props.accountFlag === '2') {
      dispatch(actions.setHeLikeCount(index-1));
    }
    setDataSource(dataArray);
  }, [props, handleShowName, vip, profiles, userDfsWeb3Datas, dfsPrice, priceOption, dispatch, accountMapId, idMapAccount]);

  const handleDateChange = useCallback((date: any, dateString: any) => {
    setDefaultValue(date);
    handleLikeData(dateString);
  },[handleLikeData]);

  useEffect(() => {
    handleLikeData(defaultValue.format('YYYY-MM-DD'));
  },[handleLikeData, defaultValue]);

  return (
    <div style={{position: 'relative'}}>
      <Table size="small" dataSource={dataSource} columns={columns}/>
      <DatePicker style={{position: 'absolute', bottom: '11px'}} defaultValue={defaultValue} onChange={handleDateChange} />
    </div>
  )
};

export default memo(UserLikeTable);
