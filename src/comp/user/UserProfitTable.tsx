import { memo, useCallback, useEffect, useState } from 'react'
import { Table, Badge } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useSelector, useDispatch } from 'react-redux';
import type { StateType, DispatchType } from '@/store';
import { useShowDrawer2 } from '@/hook/public';
import type { AccountPostDataType } from '@/store/app';
import { actions } from '@/store/app';

interface IProps {
  accountFlag: string;
  accountPostData: AccountPostDataType;
}

interface DataType {
  key: number;
  time: string;
  post_id: number;
  post_type: string;
  reward: string;
  cost: string;
  profit: string;
}

const UserProfitTable: React.FC<IProps> = (props) => {
  const [dataSource, setDataSource] = useState<DataType[]>([]);
  const account = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.account);
  const liked = useSelector<StateType, boolean>((state: StateType) => state.app.liked);
  const followed = useSelector<StateType, boolean>((state: StateType) => state.app.followed);
  const shiningVipAccounts = useSelector<StateType, string[]>((state: StateType) => state.app.vipAccounts);
  const vip: boolean = (liked && followed) || shiningVipAccounts.includes(account.name);
  const handleShowDrawer2 = useShowDrawer2();
  const likePostIds = useSelector<StateType, number[]>((state: StateType) => state.app.likePostIds);
  const dfsPrice = useSelector<StateType, {DFS: number, USD: number, CNY: number}>((state: StateType) => state.app.dfsPrice);
  const eosPrice = useSelector<StateType, {EOS: number, USD: number, CNY: number}>((state: StateType) => state.app.eosPrice);
  const ramPrice = useSelector<StateType, number>((state: StateType) => state.app.ramPrice);
  const priceOption = useSelector<StateType, 'DFS'|'USD'|'CNY'>((state: StateType) => state.app.priceOption);
  const dispatch = useDispatch<DispatchType>();

  const columns: ColumnsType<DataType> = [
    {
      title: <span className="fw-bold">作品</span>,
      dataIndex: 'post_id',
      key: 'post_id',
      align: 'center',
      render: (value: any, record: DataType, index: number) => {
        const addr = `https://dfs-shining.netlify.app/detail/${record.post_type}/${value}`;
        //value需要是number
        return <Badge dot={likePostIds.includes(value)} status="success"><span style={{color: '#1890ff'}} className="hover-pointer" onClick={() => handleShowDrawer2(addr, value)}>{value}</span></Badge>
      },
    },
    {
      title: <span className="fw-bold">利润({priceOption})</span>,
      dataIndex: 'profit',
      key: 'profit',
      align: 'center',
    },
    {
      title: <span className="fw-bold">奖励({priceOption})</span>,
      dataIndex: 'reward',
      key: 'reward',
      align: 'center',
    },
    {
      title: <span className="fw-bold">成本({priceOption})</span>,
      dataIndex: 'cost',
      key: 'cost',
      align: 'center',
    },
    {
      title: <span className="fw-bold">时间</span>,
      dataIndex: 'time',
      key: 'time',
      align: 'center',
    },

  ];

  const handlePostData = useCallback(() => {
    if (!Object.keys(props.accountPostData).length || !vip) {//判断对象是否为空
      setDataSource([]);
      if (props.accountFlag === '1') {
        dispatch(actions.setYouProfitCount(0));
      } else if (props.accountFlag === '2') {
        dispatch(actions.setHeProfitCount(0));
      }
      return;
    }

    let postData: AccountPostDataType = props.accountPostData;
    const dataArray: DataType[] = [];
    let index: number = 1;
    let profitSum: number = 0;
    for (let post_id in postData) {
      const time = postData[post_id].time.slice(2, 10);
      const reward = postData[post_id].reward * dfsPrice[priceOption];
      const ram = postData[post_id].ram;
      const post_type = postData[post_id].type;
      let cost: number = 0;
      if (priceOption === 'DFS') {
        cost = (ram / 1024 * ramPrice + 0.1) * eosPrice['USD'] / dfsPrice['USD'];
      } else {
        cost = (ram / 1024 * ramPrice + 0.1) * eosPrice[priceOption];
      }
      const profit = reward - cost;
      profitSum += profit;

      dataArray.push({key: index++, time, post_id: Number(post_id), post_type, profit: profit.toFixed(4), cost: cost.toFixed(4), reward: reward.toFixed(4)});
    }
    dataArray.sort((a, b) => b.post_id - a.post_id)

    if (props.accountFlag === '1') {
      dispatch(actions.setYouProfitCount(profitSum.toFixed(2)));
    } else if (props.accountFlag === '2') {
      dispatch(actions.setHeProfitCount(profitSum.toFixed(2)));
    }
    setDataSource(dataArray);
  }, [props, vip, dfsPrice, priceOption, ramPrice, eosPrice, dispatch]);

  useEffect(() => {
    handlePostData();
  },[handlePostData]);

  return (
    <div style={{}}>
      <Table size="small" dataSource={dataSource} columns={columns}/>
    </div>
  )
};

export default memo(UserProfitTable);
