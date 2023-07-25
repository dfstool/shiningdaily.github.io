import { Line } from '@ant-design/plots';
import { memo } from 'react';
import { Empty } from 'antd';
import { useSelector } from 'react-redux';
import type { StateType } from '@/store';
import type { UserDfsWeb3DatasType, UserDfsWeb3DataType, ShiningPoolDatasType, ShiningPoolDataType } from '@/store/app';
import moment from 'moment';

interface IProps {
  account: string;
}

const UserDfsWeb3SumLine: React.FC<IProps> = (props) => {
  const data: any[] = [];
  let flag = false;
  let newpostSum: number = 0;
  let likeSum: number = 0;
  let rewardSum: number = 0;
  const account = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.account);
  const liked = useSelector<StateType, boolean>((state: StateType) => state.app.liked);
  const followed = useSelector<StateType, boolean>((state: StateType) => state.app.followed);
  const shiningVipAccounts = useSelector<StateType, string[]>((state: StateType) => state.app.vipAccounts);
  const vip: boolean = (liked && followed) || shiningVipAccounts.includes(account.name);
  const userDfsWeb3Datas = useSelector<StateType, UserDfsWeb3DatasType>((state: StateType) => state.app.userDfsWeb3Datas);
  const shiningPoolDatas = useSelector<StateType, ShiningPoolDatasType>((state: StateType) => state.app.shiningPoolDatas);
  const dfsPrice = useSelector<StateType, {DFS: number, USD: number, CNY: number}>((state: StateType) => state.app.dfsPrice);
  const priceOption = useSelector<StateType, 'DFS'|'USD'|'CNY'>((state: StateType) => state.app.priceOption);
  const accountMapId = useSelector<StateType, {[index: string]: string | number}>((state: StateType) => state.app.accountMapId);
  const accountId = accountMapId[props.account];
  let day: string;

  for (const key in shiningPoolDatas) {
    day = moment('2022-10-30').add(key, 'days').format('YYYY-MM-DD');
    if ((shiningPoolDatas[key] as ShiningPoolDataType).author.hasOwnProperty(accountId)) {
      const like = (shiningPoolDatas[key] as ShiningPoolDataType).author[accountId].like;
      const reward = (shiningPoolDatas[key] as ShiningPoolDataType).author[accountId].reward;
      likeSum += like as number;
      rewardSum += reward as number;

      if (like) { //找出首个like为非0的开始时间
        flag = true;
      }
      if (flag) {
        data.push({day, value: likeSum, category: '有效获赞数'});
        data.push({day, value: Number((rewardSum * dfsPrice[priceOption]).toFixed(2)), category: `奖励${priceOption}数`});
      }
    } else {
      if (flag) {
        data.push({day, value: likeSum, category: '有效获赞数'});
        data.push({day, value: Number((rewardSum * dfsPrice[priceOption]).toFixed(2)), category: `奖励${priceOption}数`});
      }      
    }
  }

  flag = false;
  for (const key in userDfsWeb3Datas) {
    day = moment('2022-10-30').add(key, 'days').format('YYYY-MM-DD');
    if ((userDfsWeb3Datas[key] as UserDfsWeb3DataType).hasOwnProperty(accountId)) {
      const newpost = (userDfsWeb3Datas[key] as UserDfsWeb3DataType)[accountId].new;
      newpostSum += newpost as number;
      if (newpost) { //找出首个newpost为非0的开始时间
        flag = true;
      }
      if (flag) {
        data.push({day, value: newpostSum, category: '作品数'});
      }
    } else {
      if (flag) {
        data.push({day, value: newpostSum, category: '作品数'});
      }      
    }
  }

  const config = {
    data,
    xField: 'day',
    xAxis: {
      type: 'time',
      mask: 'MM-DD',
    },
    yField: 'value',
    yAxis: {
      type: 'pow'
    },
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

export default memo(UserDfsWeb3SumLine);
