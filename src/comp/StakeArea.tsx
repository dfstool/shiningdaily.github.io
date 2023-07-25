import { Area } from '@ant-design/plots';
import { memo } from 'react';
import { Empty } from 'antd';
import { useSelector } from 'react-redux';
import type { StateType } from '@/store';
import type { DfsWeb3DatasType, DfsWeb3DataType } from '@/store/app';
import moment from 'moment';

interface IProps {
}

const StakeArea: React.FC<IProps> = (props) => {
  const data: any[] = [];
  const dfsWeb3Datas = useSelector<StateType, DfsWeb3DatasType>((state: StateType) => state.app.dfsWeb3Datas);
  let stake_sum: number = 0;
  let day: string;
  for (const key in dfsWeb3Datas) {
    day = moment('2022-10-30').add(key, 'days').format('YYYY-MM-DD');
    stake_sum += (dfsWeb3Datas[key] as DfsWeb3DataType).stake;
    data.push({day, value: Number((stake_sum / 10000).toFixed(2)), category: 'DFS数量(万)'});
  }
  
  const config = {
    data: data.slice(14, data.length-1), //去掉测试前和当天的数据
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

export default memo(StakeArea);