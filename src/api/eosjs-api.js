import axios from 'axios';
// import store from '@/store';

const failTry = 1;
const delay = 2000;

function getHost() {
  // const nodeConfig = store.getState().app.nodeConfig;
  // // const nodeConfig = store.state.app.nodeConfig;
  // return nodeConfig.url;
  //https://eos.hyperion.eosrio.io，只有20多天前的记录
  // return "https://api.eossweden.org" //只这个节点支持v2 history, 但有些日期的数据会没有，不建议采用
  return "https://eos.greymass.com" //只有这个节点支持v1 history, eossweden获取有问题
}

export function sleep(millisecond) {
  return new Promise((resolve, reject) => setTimeout(resolve, millisecond));
}

export async function awaitWrap(promise) {
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

export async function get_table_rows(params, host) {
  if (typeof host === 'undefined') {
    host = getHost();
  }
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_table_rows`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_table_by_scope(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_table_by_scope`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_info() {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.get(`${host}/v1/chain/get_info`, {}));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_currency_stats(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_currency_stats`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_currency_balance(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_currency_balance`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function abi_json_to_bin(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/abi_json_to_bin`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function abi_bin_to_json(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/abi_bin_to_json`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_account(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_account`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_abi(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_abi`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_accounts_by_authorizers(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_accounts_by_authorizers`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_activated_protocol_features(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_activated_protocol_features`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_block_header_state(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_block_header_state`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_block_info(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_block_info`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_block(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_block`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_code(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_code`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_code_hash(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_code_hash`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_producer_schedule(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_producer_schedule`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_producers(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_producers`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_raw_code_and_abi(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_raw_code_and_abi`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_raw_abi(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_raw_abi`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_scheduled_transactions(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_scheduled_transactions`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_kv_table_rows(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_kv_table_rows`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_required_keys(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/chain/get_required_keys`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_key_accounts(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/history/get_key_accounts`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_controlled_accounts(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/history/get_controlled_accounts`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_actions(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`${host}/v1/history/get_actions`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

export async function get_actions2(params) {
  let host = getHost();
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.get(`${host}/v2/history/get_actions`, {params}));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}









