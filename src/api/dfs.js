import axios from 'axios';
import pako from 'pako';
const zlib = require('zlib');

const failTry = 3;
const delay = 2000;

//压缩
//https://www.cnblogs.com/goloving/p/16161207.html
//localStorage存储一个字符大小是utf-16，即2或4个字节，localStorage可存储总大小是指总字符的个数，而不是总字节大小
//所以采用utf16le编码是最省空间的方式
export function deflateSync(data) {
  try {
    let compressedBuffer = zlib.deflateSync(data, {
      chunkSize: 1024e3, windowbits: 15, level: 9, memlevel: 9,
    });
    if (compressedBuffer.length % 2 === 1) { //字符串长度为单数时，toString('utf16le')会少一个字节，通过添加一个字节来取双数
      compressedBuffer = Buffer.concat([compressedBuffer, Buffer.from([0])]);
    }
    return compressedBuffer.toString('utf16le');
  } catch {
		console.log("deflateSync error");
    return "";
  }
}

//pako速度比zlib快
export function deflate(data) {
  try {
    let compressedUint8Array = pako.deflate(data, {
      chunkSize: 1024e3, windowbits: 15, level: 9, memlevel: 9,
    }); //Uint8Array
    if (compressedUint8Array.length % 2 === 1) { //字符串长度为单数时，toString('utf16le')会少一个字节，通过添加一个字节来取双数
      compressedUint8Array = Buffer.concat([compressedUint8Array, Buffer.from([0])]);
    }
    return Buffer.from(compressedUint8Array).toString('utf16le'); //string
  } catch {
		console.log("deflateSync error");
    return "";
  }
}

export function deflateRaw(data) {
  try {
    let compressedUint8Array = pako.deflateRaw(data, {
      chunkSize: 1024e3, windowbits: 15, level: 9, memlevel: 9,
    }); //Uint8Array
    if (compressedUint8Array.length % 2 === 1) { //字符串长度为单数时，toString('utf16le')会少一个字节，通过添加一个字节来取双数
      compressedUint8Array = Buffer.concat([compressedUint8Array, Buffer.from([0])]);
    }
    return Buffer.from(compressedUint8Array).toString('utf16le'); //string
  } catch {
		console.log("deflateSync error");
    return "";
  }
}

//解压
export function inflateSync(data) {
  try {
    return zlib.inflateSync(Buffer.from(data, 'utf16le'), {
      chunkSize: 1024e3, windowbits: 15
    }).toString();
  } catch {
		console.log("inflateSync error");
    return "";
	}
}

//pako速度比zlib快
export function inflate(data) {
  try {
    let compressedBuffer = Buffer.from(data, 'utf16le'); //Buffer
    let compressedUint8Array = new Uint8Array(compressedBuffer); //Uint8Array
    return pako.inflate(compressedUint8Array, {
      chunkSize: 1024e3, windowbits: 15, to: 'string'
    });
  } catch {
		console.log("inflateSync error");
    return "";
	}
}

export function inflateRaw(data) {
  try {
    let compressedBuffer = Buffer.from(data, 'utf16le'); //Buffer
    let compressedUint8Array = new Uint8Array(compressedBuffer); //Uint8Array
    return pako.inflateRaw(compressedUint8Array, {
      chunkSize: 1024e3, windowbits: 15, to: 'string'
    });
  } catch {
		console.log("inflateSync error");
    return "";
	}
}

export function dealZip(data) {
  try {
    return zlib.deflateSync(data, {
      chunkSize: 1024e3
    }).toString('base64');
  } catch {
		console.log("dealZip error");
    return "";
  }
}

export function unZip(data) {
  try {
    return zlib.inflateSync(new Buffer(data, 'base64'), {
      chunkSize: 1024e3
    }).toString();
  } catch {
		console.log("unZip error");
    return "";
	}
}

// export function gunzipSync(data) {
//   try {
//     return zlib.gunzipSync(data).toString('base64');
//   } catch {
// 		console.log("gunzipSync error");
//     return "";
//   }
// }

// export function gzipSync(data) {
//   try {
//     return zlib.gzipSync(new Buffer(data, 'base64')).toString();
//   } catch {
// 		console.log("gzipSync error");
//     return "";
// 	}
// }

// export function gzip(data) {
//   try {
//     return zlib.gzip(new Buffer(data, 'base64')).toString();
//   } catch {
// 		console.log("gzipSync error");
//     return "";
// 	}
// }

function isJSON(str) {
  if (typeof str == 'string') {
    try {
      var obj=JSON.parse(str);
      if (typeof obj == 'object' && obj ){
          return true;
      } else {
          return false;
      }
    } catch(e) {
      return false;
    }
  }
}

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

// 获取24H数据 - 多数据
export async function get_swap_summary() {
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.get('https://api.yfc.one/dfs/swap/summary2'));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

// 获取24H数据 - 基础数据
export async function get_swap_counter() {
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.get('https://api.yfc.one/dfs/swap/counter'));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

// 获取全部订单列表
export async function get_all_orders() {
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.get('https://api.yfc.one/pddex2/orders'));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

// 节点延时接口
export async function node_delay(host) {
  let [err, res] = [null, null];
  [err, res] = await awaitWrap(axios.get(`${host}/v1/chain/get_info`, {timeout: 10000,}));
  return [err, res];
}

// 获取markets压缩数据
export async function get_markets() {
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.get('https://api.yfc.one/dfs/common/markets', {timeout: 5000,}));
    if (res) {
      return [err, {rows: JSON.parse(deflateSync(res))}];
    } else {
      await sleep(delay);
    }
  }
  return [err, res];
}

// 获取常用币种价格
export async function get_price() {
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.get('https://api.yfc.one/dfs/common/get_price'));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

// 获取交易对数据
export async function get_market_info(params) {
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.get('https://api.yfc.one/dfs/apy/apy-by-mid', {params}));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

// 获取交易对最新交易记录
export async function get_swap_lasters(params) {
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.get('https://api.yfc.one/dfs/swap/marketlog', {params}));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

// 注册账户
export async function reg_newaccount(obj) {
  const params = {
    username: obj.account,
    publickey: obj.publickey
  }
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`https://api.yfc.one/account/newaccount`, JSON.stringify(params)));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

// 免CPU,交易的失败信息是通过res返回，所以需要对res做特殊处理
export async function pushFreeCpu(params) {
  //data失败后的返回格式
  //{ "code": 500, "msg": "{\"code\":500,\"message\":\"Internal Service Error\",\"error\":{\"code\":3050003,
  //\"name\":\"eosio_assert_message_exception\",\"what\":\"eosio_assert_message assertion failure\",\"details\":
  //[{\"message\":\"assertion failure with message: overdrawn balance\",\"file\":\"cf_system.cpp\",\"line_number\":14,
  //\"method\":\"eosio_assert\"}]}}" }
  //防止交易多次，只尝试一次
  const failTry = 1;
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`https://api.yfc.one/account/pushaction`, params));
    if (res && res.code === 200) {
      return [err, res];
    } else if (res && res.code !== 200) {
      if (isJSON(res.msg)) {
        const content = JSON.parse(res.msg)
        const code = content.error.code;
        const message = content.error.details[0].message;
        return [code + ' ' + message, null];
      } else {
        return [res.msg, null];
      }
    }
    await sleep(delay);
  }
  return [err, res];
}

export async function pushFreeCpu2(params) {
  //data失败后的返回格式
  //{ "code": 500, "msg": "{\"code\":500,\"message\":\"Internal Service Error\",\"error\":{\"code\":3050003,
  //\"name\":\"eosio_assert_message_exception\",\"what\":\"eosio_assert_message assertion failure\",\"details\":
  //[{\"message\":\"assertion failure with message: overdrawn balance\",\"file\":\"cf_system.cpp\",\"line_number\":14,
  //\"method\":\"eosio_assert\"}]}}" }
  //防止交易多次，只尝试一次
  const failTry = 1;
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.post(`https://api.yfc.one/account/pushaction2`, params));
    if (res && res.code === 200) {
      return [err, res];
    } else if (res && res.code !== 200) {
      if (isJSON(res.msg)) {
        const content = JSON.parse(res.msg)
        const code = content.error.code;
        const message = content.error.details[0].message;
        return [code + ' ' + message, null];
      } else {
        return [res.msg, null];
      }
    }
    await sleep(delay);
  }
  return [err, res];
}

// 获取所有币种余额
export async function get_acc_bals(acc) {
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.get(`https://api.light.xeos.me/api/balances/eos/${acc}`));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

// 用户交易对交易记录
export async function tradelog(params) {
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.get('https://api.yfc.one/dfs/swap/tradelog', {params}));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

// 用户做市记录
export async function depositlog(params) {
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.get('https://api.yfc.one/dfs/swap/depositlog', {params}));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

// 获取乐捐数据
export async function get_fundation(params) {
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.get('https://api.yfc.one/history/fundation', {params}));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

// 获取乐捐总价值
export async function get_summary() {
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.get('https://api.yfc.one/dfs/fundation/summary'));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}

// 获取最新 ｜ 最贵 ｜ 最热 留言数据
export async function get_new_fundation(params) {
  let [err, res] = [null, null];
  for (let i=0; i<failTry; i++) {
    [err, res] = await awaitWrap(axios.get('https://api.yfc.one/dfs/fundation/new', {params}));
    if (res) {return [err, res]} else {await sleep(delay)}
  }
  return [err, res];
}