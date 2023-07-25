import { memo, useCallback, useEffect, useState } from 'react'
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useSelector, useDispatch } from 'react-redux';
import type {StateType, DispatchType } from '@/store';
import { actions } from '@/store/app';
import { useShowDrawer } from '@/hook/public';

type FansFollowersType = {
  owner: string;
  create_time: string;
}[]

interface IProps {
  fans: FansFollowersType;
  handleTabsChange: (activeKey: string) => void;
  handleInputSearch: (value: string) => void;
  setSearchAccount: React.Dispatch<React.SetStateAction<string>>;
}

interface DataType {
  key: number;
  index: number;
  user: string;
  time: string;
  account: string;
}

const UserFansTable: React.FC<IProps> = (props) => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const account = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.account);
  const liked = useSelector<StateType, boolean>((state: StateType) => state.app.liked);
  const followed = useSelector<StateType, boolean>((state: StateType) => state.app.followed);
  const shiningVipAccounts = useSelector<StateType, string[]>((state: StateType) => state.app.vipAccounts);
  const vip: boolean = (liked && followed) || shiningVipAccounts.includes(account.name);
  const dispatch = useDispatch<DispatchType>();
  const handleShowDrawer = useShowDrawer();
  const profiles = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.profiles);
  
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
      title: <span className="fw-bold">粉丝</span>,
      dataIndex: 'user',
      key: 'user',
      align: 'center',
      render: (text: string, record, index) => {
        return <span style={{color: '#1890ff'}} className="hover-pointer" onClick={() => handleShowDrawer(record.account)}>{text}</span>
      }
    },
    {
      title: <span className="fw-bold">关注时间</span>,
      dataIndex: 'time',
      key: 'time',
      align: 'center',
      width: '40%'
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

  const handleFansData = useCallback(() => {
    if (!props.fans.length || !vip) {//判断对象是否为空
      setDataSource([]);
      return;
    }

    const profilesTmp: {[index: string]: string} = profiles;
    const dataArray: DataType[] = [];
    let index: number = 1;
    props.fans.forEach(item => {
      const nick = profilesTmp[item.owner] as string;
      const time = moment(item.create_time).add(8, 'hour').format().slice(0, -6);
      dataArray.push({ key: index, index: index++, user: handleShowName(nick, item.owner), time, account: item.owner});    
    })

    dataArray.sort((a, b) => {
      return moment(b.time).unix() - moment(a.time).unix();
    })
    index = 1;
    dataArray.forEach(item => {
      item.key = index;
      item.index = index++;
    })
    setDataSource(dataArray);
  }, [props, handleShowName, vip, profiles]);


  useEffect(() => {
    handleFansData();
  },[handleFansData]);

  return (
    <div>
      <Table size="small" dataSource={dataSource} columns={columns}/> 
    </div>
  )
};

export default memo(UserFansTable);
