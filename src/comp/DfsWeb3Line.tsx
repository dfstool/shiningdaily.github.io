import { Line } from '@ant-design/plots';
import { memo } from 'react';
import { Empty } from 'antd';
import type { DfsWeb3DatasType, DfsWeb3DataType } from '@/store/app';
import { useSelector } from 'react-redux';
import type {StateType } from '@/store';
import moment from 'moment';

interface IProps {
}

const DfsWeb3Line: React.FC<IProps> = (props) => {
  const data: any[] = [];
  const dfsWeb3Datas = useSelector<StateType, DfsWeb3DatasType>((state: StateType) => state.app.dfsWeb3Datas);
  let day: string;
  for (const key in dfsWeb3Datas) {
    day = moment('2022-10-30').add(key, 'days').format('YYYY-MM-DD');
    // data.push({day, value: props.actionsData[key].newpost_thought, category: '想法'});
    // data.push({day, value: props.actionsData[key].newpost_article, category: '文章'});
    data.push({day, value: (dfsWeb3Datas[key] as DfsWeb3DataType).like, category: '点赞数'});
    data.push({day, value: (dfsWeb3Datas[key] as DfsWeb3DataType).new, category: '作品数'});
    data.push({day, value: (dfsWeb3Datas[key] as DfsWeb3DataType).reply1, category: '回复数'});
  }
  
  const config = {
    data: data.slice(14*3, data.length-3), //去掉测试前和当天的数据
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

export default memo(DfsWeb3Line);