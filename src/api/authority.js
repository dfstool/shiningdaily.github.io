import axios from 'axios';

const failTry = 1;
const delay = 2000;

function sleep(millisecond) {
  return new Promise((resolve, reject) => setTimeout(resolve, millisecond));
}

async function awaitWrap(promise) {
  // return promise.then(res => [null, res]).catch(err => [err, null]);
  return promise.then(res => {
    //res的对象属性有[config, data, headers, request, status, statusText]
    if (res.status !== 200) {
      console.log(res)
      throw new Error(`status code is ${res.status}`);
    } else {
      return [null, res.data]
    }
  }).catch(err => {
    //console.log(Object.getOwnPropertyNames(err))
    //err的Errorc对象属性有['stack', 'message', 'config', 'request', 'response', 'isAxiosError', 'toJSON']
    if (err instanceof Error) {
      console.log(err.message);
      return [err.message, null]
    } else if (err.response) {
      console.log(err.response);
      return [JSON.stringify(err.response.data), null]
    } else if (err.request) {
      console.log('no response');
      return ['no response', null]
    } else {
      console.log(err);
      if (typeof err == 'object') {
        return [JSON.stringify(err), null]
      } else {
        return [err, null]
      }
    }
  });
}

// 获取action统计数据
export async function get_actions_counter(acc) {
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.get(`https://bird.ioliu.cn/v2/?url=https://eosauthority.com/api/spa/account/${acc}/actions-counter?network=eos`));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}