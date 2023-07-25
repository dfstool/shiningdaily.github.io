import { Line } from '@ant-design/plots';
import { memo } from 'react';
import { Empty } from 'antd';
import { useSelector } from 'react-redux';
import type { StateType } from '@/store';
import type { DfsWeb3DatasType, DfsWeb3DataType } from '@/store/app';
import moment from 'moment';

interface IProps {
}

const RamOccupyLine: React.FC<IProps> = (props) => {
  const data: any[] = [];
  const dfsWeb3Datas = useSelector<StateType, DfsWeb3DatasType>((state: StateType) => state.app.dfsWeb3Datas);
  const ramPrice = useSelector<StateType, number>((state: StateType) => state.app.ramPrice);
  let day: string;
  for (const key in dfsWeb3Datas) {
    day = moment('2022-10-30').add(key, 'days').format('YYYY-MM-DD');
    let ramValue: number = Math.round((dfsWeb3Datas[key] as DfsWeb3DataType).ram / 1024);
    let eosValue: number = ramValue * ramPrice;
    data.push({day, value: ramValue, category: '内存消耗(KB)'});
    data.push({day, value: eosValue.toPrecision(2), category: `内存EOS估值(${ramPrice.toPrecision(2)}EOS/KB))`});
  }
  
  const config = {
    data: data.slice(14*2, data.length - 2), //去掉测试前和当天的数据
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
        data.length ?
        <Line {...config} /> : 
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      }      
    </>
  )
};

export default memo(RamOccupyLine);