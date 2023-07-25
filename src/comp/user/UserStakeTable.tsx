import { memo, useCallback, useEffect, useState } from 'react'
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import moment from 'moment';
import { useSelector } from 'react-redux';
import type {StateType, } from '@/store';
import { useShowDrawer } from '@/hook/public';
import { IHolder } from '@/utils/db';

interface IProps {
  account: string;
}

interface DataType {
  key: number;
  rank: number;
  holder: string;
  bal: string;
  join_time: string;
  account: string;
}

const UserStakeTable: React.FC<IProps> = (props) => {
  const account = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.account);
  const liked = useSelector<StateType, boolean>((state: StateType) => state.app.liked);
  const followed = useSelector<StateType, boolean>((state: StateType) => state.app.followed);
  const shiningVipAccounts = useSelector<StateType, string[]>((state: StateType) => state.app.vipAccounts);
  const vip: boolean = (liked && followed) || shiningVipAccounts.includes(account.name);
  // const showAccount = useSelector<StateType, Boolean>((state: StateType) => state.app.showAccount);
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const handleShowDrawer = useShowDrawer();
  const holders = useSelector<StateType, IHolder[]>((state: StateType) => state.app.holders);
  const profiles = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.profiles);
  const columns: ColumnsType<DataType> = [
    {
      title: <span className="fw-bold">序号</span>,
      dataIndex: 'rank',
      key: 'rank',
      align: 'center',
      width: '15%'
    },
    {
      title: <span className="fw-bold">抵押用户</span>,
      dataIndex: 'holder',
      key: 'holder',
      align: 'center',
      width: "40%",
      render: (text: string, record, index) => {
        return <span style={{color: '#1890ff'}} className="hover-pointer" onClick={() => handleShowDrawer(record.account)}>{text}</span>
      }
    },
    {
      title: <span className="fw-bold">抵押数量</span>,
      dataIndex: 'bal',
      key: 'bal',
      align: 'center',
      width: '20%'
    },
    {
      title: <span className="fw-bold">加入时间</span>,
      dataIndex: 'join_time',
      key: 'join_time',
      align: 'center',
      width: '28%'
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

  const handleHoldersData = useCallback(() => {
    if (!Object.keys(holders).length || !vip) {//判断对象是否为空
      setDataSource([]);
      return;
    }
    const dataArray: DataType[] = [];
    let rank: number = 1;
    for (let i=0; i<holders.length; i++) {
      if (holders[i].holder === props.account) {
        const nick =  profiles[holders[i].holder] as string;
        dataArray.push({ key: rank, rank: rank++, holder: handleShowName(nick, holders[i].holder), bal: holders[i].bal.split(' ')[0], join_time: moment(holders[i].join_time).add(8, 'hour').format('YYYY-MM-DD'), account: holders[i].holder});        
        break;
      }
    }

    setDataSource(dataArray);

  }, [handleShowName, holders, profiles, vip, props]);

  useEffect(() => {
    handleHoldersData();
  },[handleHoldersData]);

  return (
    <div>
      <Table size="small" dataSource={dataSource} columns={columns}/>
    </div>
  )
};

export default memo(UserStakeTable);
