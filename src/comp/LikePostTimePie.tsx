import { Pie } from '@ant-design/plots';
import { memo } from 'react';
import { Empty } from 'antd';
import { useSelector } from 'react-redux';
import type { StateType } from '@/store';

interface IProps {
}

const LikePostTimePie: React.FC<IProps> = (props) => {
  const data: any[] = [];
  const likePostTime = useSelector<StateType, {[index: string]: number}>((state: StateType) => state.app.likePostTime);
  let keyValue: number = 0;
  for (const key in likePostTime) {
    keyValue = likePostTime[key];
    data.push({type: key+'点', value: keyValue});
  }
  
  const config = {
    data,
    angleField: 'value',
    colorField: 'type',
    radius: 0.9,
    legend: undefined,
    label: {
      content: '{name}, {percentage}',
    },
    width: 280,
    height: 280,

  };

  return (
    <>
      {
        data.length ?
        <Pie {...config} /> : 
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
      }      
    </>
  )
};

export default memo(LikePostTimePie);