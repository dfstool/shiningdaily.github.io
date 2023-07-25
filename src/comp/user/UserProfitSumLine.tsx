import { Line } from '@ant-design/plots';
import { memo } from 'react';
import { Empty } from 'antd';
import { useSelector } from 'react-redux';
import type { StateType } from '@/store';
import type { AccountPostDataType } from '@/store/app';

interface IProps {
  accountPostData: AccountPostDataType;
}

const UserProfitSumLine: React.FC<IProps> = (props) => {
  const data: any[] = [];
  const account = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.account);
  const liked = useSelector<StateType, boolean>((state: StateType) => state.app.liked);
  const followed = useSelector<StateType, boolean>((state: StateType) => state.app.followed);
  const shiningVipAccounts = useSelector<StateType, string[]>((state: StateType) => state.app.vipAccounts);
  const vip: boolean = (liked && followed) || shiningVipAccounts.includes(account.name);
  const dfsPrice = useSelector<StateType, {DFS: number, USD: number, CNY: number}>((state: StateType) => state.app.dfsPrice);
  const eosPrice = useSelector<StateType, {EOS: number, USD: number, CNY: number}>((state: StateType) => state.app.eosPrice);
  const ramPrice = useSelector<StateType, number>((state: StateType) => state.app.ramPrice);
  const priceOption = useSelector<StateType, 'DFS'|'USD'|'CNY'>((state: StateType) => state.app.priceOption);

  let postData: AccountPostDataType = props.accountPostData;
  let rewardSum: number = 0;
  let profitSum: number = 0;
  let costSum: number = 0;
  let postDataTmp: {[index: string]: {reward: number, cost: number, profit: number}} = {};
  for (let post_id in postData) {
    const time = postData[post_id].time.slice(0, 10);
    const reward = postData[post_id].reward * dfsPrice[priceOption];
    const ram = postData[post_id].ram;
    let cost: number = 0;
    if (priceOption === 'DFS') {
      cost = (ram / 1024 * ramPrice + 0.1) * eosPrice['USD'] / dfsPrice['USD'];
    } else {
      cost = (ram / 1024 * ramPrice + 0.1) * eosPrice[priceOption];
    }
    const profit = reward - cost;

    if (postDataTmp.hasOwnProperty(time)) {
      postDataTmp[time].cost += cost;
      postDataTmp[time].reward += reward;
      postDataTmp[time].profit += profit;
    } else {
      postDataTmp[time] = {cost: 0, reward: 0, profit: 0};
      postDataTmp[time].cost = cost;
      postDataTmp[time].reward = reward;
      postDataTmp[time].profit = profit;
    }
  }

  for (let key in postDataTmp) {
    rewardSum += postDataTmp[key].reward;
    profitSum += postDataTmp[key].profit;
    costSum += postDataTmp[key].cost;
    data.push({day: key, value: Number(rewardSum.toFixed(2)), category: `奖励(${priceOption})`});
    data.push({day: key, value: Number(profitSum.toFixed(2)), category: `利润(${priceOption})`});
    data.push({day: key, value: Number(costSum.toFixed(2)),   category: `成本(${priceOption})`});
  }

  const config = {
    data,
    xField: 'day',
    xAxis: {
      type: 'time',
      mask: 'MM-DD',
    },
    yField: 'value',
    // yAxis: {
    //   type: 'pow'
    // },
    seriesField: 'category',
    // point: {
    //   size: 3,
    //   shape: 'circle',
    // },
    slider: {
      start: 0,
      end: 1,
    },
    // smooth: true,
    label: {},
  };
  
  return (
    <>
      {
        (data.length && vip) ?
        <Line {...config} /> : 
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      }      
    </>
  )
};

export default memo(UserProfitSumLine);
