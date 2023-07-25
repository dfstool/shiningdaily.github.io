import { Area } from '@ant-design/plots';
import { memo } from 'react';
import { Empty } from 'antd';
import { useSelector } from 'react-redux';
import type { StateType } from '@/store';
import type { ShiningPoolDatasType, ShiningPoolDataType } from '@/store/app';
import moment from 'moment';

interface IProps {
}

const RewardArea: React.FC<IProps> = (props) => {
  const data: any[] = [];
  const shiningPoolDatas = useSelector<StateType, ShiningPoolDatasType>((state: StateType) => state.app.shiningPoolDatas);
  const dfsPrice = useSelector<StateType, {DFS: number, USD: number, CNY: number}>((state: StateType) => state.app.dfsPrice);
  const priceOption = useSelector<StateType, 'DFS'|'USD'|'CNY'>((state: StateType) => state.app.priceOption);
  let day: string;
  for (const key in shiningPoolDatas) {
    day = moment('2022-10-30').add(key, 'days').format('YYYY-MM-DD');
    data.push({day, value: Number(((shiningPoolDatas[key] as ShiningPoolDataType).reward * dfsPrice[priceOption]).toFixed(0)), category: `每日${priceOption}奖励`});
  }
  
  const config = {
    data: data.slice(1, data.length-1), //去掉测试前和当天的数据
    xField: 'day',
    xAxis: {
      type: 'time',
      mask: 'MM-DD',
    },
    yField: 'value',
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
        data.length ?
        <Area {...config} /> : 
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      }      
    </>
  )
};

export default memo(RewardArea);