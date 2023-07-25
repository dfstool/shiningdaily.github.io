import { Pie } from '@ant-design/plots';
import { memo } from 'react';
import { Empty } from 'antd';
import { useSelector } from 'react-redux';
import type { StateType } from '@/store';

interface IProps {
}

const NewPostTimePie: React.FC<IProps> = (props) => {
  const data: any[] = [];
  const newPostTime = useSelector<StateType, {[index: string]: number}>((state: StateType) => state.app.newPostTime);
  let keyValue: number = 0;
  for (const key in newPostTime) {
    keyValue = newPostTime[key];
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

export default memo(NewPostTimePie);