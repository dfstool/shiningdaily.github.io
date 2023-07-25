import { Line } from '@ant-design/plots';
import { memo } from 'react';
import { Empty } from 'antd';
import { useSelector } from 'react-redux';
import type { StateType } from '@/store';
import type { UserDfsWeb3DatasType, UserDfsWeb3DataType } from '@/store/app';
import moment from 'moment';

interface IProps {
  account: string;
}

const UserRamOccupyLine: React.FC<IProps> = (props) => {
  const account = useSelector<StateType, {[index: string]: string}>((state: StateType) => state.app.account);
  const liked = useSelector<StateType, boolean>((state: StateType) => state.app.liked);
  const followed = useSelector<StateType, boolean>((state: StateType) => state.app.followed);
  const shiningVipAccounts = useSelector<StateType, string[]>((state: StateType) => state.app.vipAccounts);
  const vip: boolean = (liked && followed) || shiningVipAccounts.includes(account.name);
  const data: any[] = [];
  const ramPrice = useSelector<StateType, number>((state: StateType) => state.app.ramPrice);
  const userDfsWeb3Datas = useSelector<StateType, UserDfsWeb3DatasType>((state: StateType) => state.app.userDfsWeb3Datas);
  const accountMapId = useSelector<StateType, {[index: string]: string | number}>((state: StateType) => state.app.accountMapId);
  let flag: boolean = false;
  let day: string;
  const accountId = accountMapId[props.account];
  for (const key in userDfsWeb3Datas) {
    day = moment('2022-10-30').add(key, 'days').format('YYYY-MM-DD');
    if ((userDfsWeb3Datas[key] as UserDfsWeb3DataType).hasOwnProperty(accountId)) {
      const ram: number = (userDfsWeb3Datas[key] as UserDfsWeb3DataType)[accountId].ram as number;
      if (ram) { //找出首个newpost为非0的开始时间
        flag = true;
      }
      if (flag) {
        let ramValue: number = Number((ram / 1024).toFixed(2));
        let eosValue: number = Number((ramValue * ramPrice).toFixed(3));
        data.push({day, value: ramValue, category: '内存消耗(KB)'});
        data.push({day, value: eosValue, category: `内存EOS估值(${ramPrice.toPrecision(2)}EOS/KB))`});
      }
    } else {
      if (flag) {
        data.push({day, value: 0, category: '内存消耗(KB)'});
        data.push({day, value: 0, category: `内存EOS估值(${ramPrice.toPrecision(2)}EOS/KB))`});
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

export default memo(UserRamOccupyLine);