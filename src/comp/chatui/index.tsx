import { useEffect, useCallback, useRef } from 'react';
// 引入组件
import Chat, { Bubble, MessageProps,  useMessages,  QuickReplyItemProps,  useQuickReplies,  Card,  CardTitle, CardText, List, //有bug，需要给ListProps加上children?: React.ReactNode;或者装2.4.8-beta.0这个版本
  ListItem,  Flex, FlexItem, ScrollView, ToolbarItemProps, 
} from '@chatui/core';
import shiningdaily from '@/assets/pic/shiningdaily.png';
import './icons'; //必须要导入icons后，<Icon>才能使用
import OrderSelector from './OrdderSelector';
import './demo.css';

import { get_actions } from '@/api/eosjs-api';
import { IAction } from '@/utils/db';
import type { ActionType } from '@/utils/db';

interface IProps {
  handleChatUICancel: any
}

type MessageWithoutId = Omit<MessageProps, '_id'>;
const initialMessages: MessageWithoutId[] = [
  {
    type: 'system',
    content: { text: '88VIP专属智能客服小蜜 为您服务' },
  },
  {
    type: 'text',
    content: { text: 'Hi，我是你的专属智能助理小蜜，有问题请随时找我哦~' },
    user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg', name: '小小蜜' },
    createdAt: Date.now(),
    hasTime: true,
  },
  {
    type: 'guess-you',
  },
  {
    type: 'skill-cards',
  },
  {
    type: 'text',
    content: { text: '小蜜我要查看我的物流信息' },
    position: 'right',
    user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg' },
  },
  {
    type: 'image',
    content: {
      picUrl: '//img.alicdn.com/tfs/TB1p_nirYr1gK0jSZR0XXbP8XXa-300-300.png',
    },
  },
  {
    type: 'system',
    content: {
      text: '由于您长时间未说话或退出小蜜（离开页面、锁屏等）已自动结束本次服务',
    },
  },
  {
    type: 'system',
    content: { text: '88VIP专属智能客服小蜜 为您服务' },
  },
  {
    type: 'text',
    content: { text: 'Hi，我是你的专属智能助理小蜜，有问题请随时找我哦~' },
    user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg', name: '小小蜜' },
    createdAt: Date.now(),
    hasTime: true,
  },
  {
    type: 'guess-you',
  },
  {
    type: 'skill-cards',
  },
  {
    type: 'text',
    content: { text: '小蜜我要查看我的物流信息' },
    position: 'right',
    user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg' },
  },
  {
    type: 'image',
    content: {
      picUrl: '//img.alicdn.com/tfs/TB1p_nirYr1gK0jSZR0XXbP8XXa-300-300.png',
    },
  },
  {
    type: 'system',
    content: {
      text: '由于您长时间未说话或退出小蜜（离开页面、锁屏等）已自动结束本次服务',
    },
  },
];

const defaultQuickReplies = [
  {
    icon: 'shopping-bag',
    name: '咨询订单问题（高亮）',
    code: 'orderSelector',
    isHighlight: true,
  },
  {
    icon: 'shopping-bag',
    name: '如何申请退款（高亮）',
    code: 'orderSelector',
    isHighlight: true,
  },
  {
    icon: 'message',
    name: '联系人工服务（高亮+新）',
    code: 'q1',
    isNew: true,
    isHighlight: true,
  },
  {
    name: '质量问题（新）',
    code: 'q3',
    isNew: true,
  },
  {
    name: '卖家文案',
    code: 'q4',
  },
  {
    name: '5强快捷短语',
    code: 'q5',
  },
  {
    name: '6弱快捷短语',
    code: 'q6',
  },
];

const skillList = [
  { title: '话费充值', desc: '智能充值智能充值' },
  { title: '评价管理', desc: '我的评价' },
  { title: '联系商家', desc: '急速联系' },
  { title: '红包卡券', desc: '使用优惠' },
  { title: '修改地址', desc: '修改地址' },
];

const toolbar = [
  {
    type: 'smile',
    icon: 'smile',
    title: '表情',
  },
  {
    type: 'orderSelector',
    icon: 'shopping-bag',
    title: '宝贝',
  },
  {
    type: 'image',
    icon: 'image',
    title: '图片',
  },
  {
    type: 'camera',
    icon: 'camera',
    title: '拍照',
  },
  {
    type: 'photo',
    title: 'Photo',
    img: 'https://gw.alicdn.com/tfs/TB1eDjNj.T1gK0jSZFrXXcNCXXa-80-80.png',
  },
];


const ChatUI: React.FC<IProps> = (props) => {
  // 消息列表
  const { messages, appendMsg, setTyping, prependMsgs } = useMessages(initialMessages);
  const { quickReplies, replace } = useQuickReplies(defaultQuickReplies);
  const msgRef = useRef(null);
  const lock = useRef<boolean>(false);

  window.appendMsg = appendMsg;
  window.msgRef = msgRef;

  // 发送回调
  function handleSend(type: string, val: string) {
    if (type === 'text' && val.trim()) {
      // TODO: 发送请求
      appendMsg({
        type: 'text',
        content: { text: val },
        position: 'right',
      });

      setTimeout(() => {
        setTyping(true);
      }, 10);

      // 模拟回复消息
      setTimeout(() => {
        appendMsg({
          type: 'text',
          content: { text: '亲，您遇到什么问题啦？请简要描述您的问题~' },
        });
      }, 1000);
    }
  }

  // 快捷短语回调，可根据 item 数据做出不同的操作，这里以发送文本消息为例
  function handleQuickReplyClick(item: QuickReplyItemProps) {
    handleSend('text', item.name);

    if (item.code === 'q1') {
      replace([
        {
          name: '短语a',
          code: 'qa',
          isHighlight: true,
        },
        {
          name: '短语b',
          code: 'qb',
        },
      ]);
    } else if (item.code === 'orderSelector') {
      appendMsg({
        type: 'order-selector',
        content: {},
      });
    }
  }

  function handleRefresh() {
    return new Promise((resolve) => {
      setTimeout(() => {
        const now = Date.now();

        prependMsgs([
          {
            _id: now + '1111',
            type: 'text',
            content: { text: '11111Hi，我是你的专属智能助理小蜜，有问题请随时找我哦~' },
            user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg' },
          },
          {
            _id: now + '2222',
            type: 'text',
            content: { text: '22222 Hi，我是你的专属智能助理小蜜，有问题请随时找我哦~' },
            user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg' },
          },
          {
            _id: now + '3333',
            type: 'text',
            content: { text: '333 Hi，我是你的专属智能助理小蜜，有问题请随时找我哦~' },
            user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg' },
          },
          {
            _id: now + '4444',
            type: 'text',
            content: { text: '444 Hi，我是你的专属智能助理小蜜，有问题请随时找我哦~' },
            user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg' },
          },
          {
            _id: now + '5555',
            type: 'text',
            content: { text: '555 Hi，我是你的专属智能助理小蜜，有问题请随时找我哦~' },
            user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg' },
          },
          {
            _id: now + '6666',
            type: 'text',
            content: { text: '666 Hi，我是你的专属智能助理小蜜，有问题请随时找我哦~' },
            user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg' },
          },
          {
            _id: now + '7777',
            type: 'text',
            content: { text: '777 Hi，我是你的专属智能助理小蜜，有问题请随时找我哦~' },
            user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg' },
          },
        ]);
        resolve({});
      }, 800);
    });
  }

  function handleToolbarClick(item: ToolbarItemProps) {
    if (item.type === 'orderSelector') {
      appendMsg({
        type: 'text',
        content: { text: "test" },
        position: 'left',
        user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg', name: 'eosio5211314' },
        createdAt: Date.now(),
      });
    }
  }

  function renderMessageContent(msg: MessageProps) {
    const { type, content } = msg;

    // 根据消息类型来渲染
    switch (type) {
      case 'text':
        return <Bubble content={content.text} />;
      case 'guess-you':
        return (
          <Card fluid>
            <Flex>
              <div className="guess-you-aside">
                <h1>猜你想问</h1>
              </div>
              <FlexItem>
                <List>
                  <ListItem content="我的红包退款去哪里?" as="a" rightIcon="chevron-right" />
                  <ListItem content="我的红包退款去哪里?" as="a" rightIcon="chevron-right" />
                  <ListItem content="如何修改评价?" as="a" rightIcon="chevron-right" />
                  <ListItem content="物流问题咨询" as="a" rightIcon="chevron-right" />
                </List>
              </FlexItem>
            </Flex>
          </Card>
        );
      case 'skill-cards':
        return (
          <ScrollView
            className="skill-cards"
            data={skillList}
            fullWidth
            renderItem={(item: { title: any; desc: any; }) => (
              <Card>
                <CardTitle>{item.title}</CardTitle>
                <CardText>{item.desc}</CardText>
              </Card>
            )}
          />
        );
      case 'order-selector':
        return <OrderSelector />;
      case 'image':
        return (
          <Bubble type="image">
            <img src={content.picUrl} alt="" />
          </Bubble>
        );
      default:
        return null;
    }
  }

  const handleInitMsg = useCallback(async () => {
    console.time("handleInitMsg")
    // type ParamsType = {account_name: string,  offset: number, after: string};
    //pos: 账号所有action(包括内联action)的索引值，从0开始
    //offset: 从pos开始，获取action的数量，即[pos, pos+offset]
    //如果pos和offset都不填，那取账号最新的20个action
    //after、before、filter不起作用
    type ParamsType = {account_name: string, pos: number, offset: number};
    const params: ParamsType = {
      account_name: 'hazdqmjqgige',
      pos: 0,
      offset: 100
    };  

    let [err, res]: any = await get_actions(params);
    if (err) {
      console.log(err.toString());
      return;
    }

    console.log(res)

    // let actions: IAction[] = [];
    // res.actions.forEach((item: ActionType) => {
    //   if (item.action_trace.act.account === 'eosio.token') {
    //     actions.push({account_action_seq: item.account_action_seq, block_time: item.block_time, 
    //       account_ram_deltas: item.action_trace.account_ram_deltas, account: item.action_trace.act.account, 
    //       authorization: item.action_trace.act.authorization, data: item.action_trace.act.data, 
    //       name: item.action_trace.act.name, receiver: item.action_trace.receiver, trx_id: item.action_trace.trx_id});
    //   }
    // });

    const initialMessages: MessageWithoutId[] = [];
    res.actions.forEach((item: ActionType) => {
      let account: string = item.action_trace.act.account;
      let to: string = item.action_trace.act.data.to as string;
      let account_action_seq: number = item.account_action_seq;
      let memo = item.action_trace.act.data.memo;
      if (account === 'eosio.token') {
        initialMessages.push(
          {
            type: 'text',
            content: { text: memo },
            position: 'left',
            user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg', name: to },
          }
        )
        appendMsg(
          {
            type: 'text',
            content: { text: memo },
            position: 'left',
            user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg', name: to },
          }
        );
      }
    });

    console.log(initialMessages);

  }, [appendMsg]);

  useEffect(() => {
    (async function() {
      if (lock.current) return;
      lock.current = true;

      setTimeout(handleInitMsg, 2000);
      setTimeout(() => {
        appendMsg(
          {
            type: 'text',
            content: { text: "text" },
            position: 'left',
            user: { avatar: '//gw.alicdn.com/tfs/TB1DYHLwMHqK1RjSZFEXXcGMXXa-56-62.svg', name: "eosio5211314" },
          }
        );        
      }, 1000);

      lock.current = false;
    })();
  }, []);

  return (
    <Chat
      onRefresh={handleRefresh}
      wideBreakpoint="600px"
      navbar={{
        leftContent: {
          img: shiningdaily,
          title: 'logo',
        },
        rightContent: [
          {
            icon: 'close',
            title: 'close',
            onClick: props.handleChatUICancel,
          },
        ],
        title: '留言日报',
      }}
      rightAction={{ icon: 'smile' }}
      toolbar={toolbar}
      messagesRef={msgRef}
      onToolbarClick={handleToolbarClick}
      recorder={{ canRecord: true }}
      messages={messages}
      renderMessageContent={renderMessageContent}
      quickReplies={quickReplies}
      onQuickReplyClick={handleQuickReplyClick}
      onSend={handleSend}
      onImageSend={() => Promise.resolve()}
      // renderBeforeMessageList={() => <div className='text-center'>renderBeforeMessageList</div>}
    />
  );
};

export default ChatUI;