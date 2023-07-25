import ScatterJS from 'scatterjs-core';
import ScatterEOS from 'scatterjs-plugin-eosjs';
import Eos from 'eosjs-without-sort';
import store from '@/store';
import { actions } from '@/store/app';

ScatterJS.plugins( new ScatterEOS() );

class ScatterClass {
  constructor() {
    this.scatter = ScatterJS;
    this.appName = 'DApp';
    this.logined = false;
    this.connected = false;
    this.network = null;
    this.api = null; //用于交易
    this.rpc = null; //常用rpc接口
    this.try = 3;
    this.delay = 2000;
    this.freeCpuEos = null;
  }

  sleep(millisecond) {
    return new Promise((resolve, reject) => setTimeout(resolve, millisecond));
  }

  check() {
    if (this.logined && this.connected) {
      return true;
    } else {
      return false;
    }
  }

  async awaitWrap(promise) {
    // return promise.then(res => [null, res]).catch(err => [err, null]);
    return promise.then(res => [null, res]).catch(err => {
      //console.log(Object.getOwnPropertyNames(err))
      //err的Errorc对象属性有['stack', 'message']
      if (err instanceof Error) {
        console.log(err.message);
        return [err.message, null]
      } else if (err.hasOwnProperty('type')) { //内部错误{type: 'parsing_error', message: 'Something happened while trying to parse the transaction internally.', code: 402, isError: true}
        console.log(err);
        return [err.message, null]        
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

  isJSON(str) {
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

  connect() {
    return this.awaitWrap(ScatterJS.connect(this.appName, {network: this.network}))
  }

  login() {
    return this.awaitWrap(ScatterJS.login())
  }

  async init(appName) {
    // const nodeConfig = store.state.app.nodeConfig
    const nodeConfig = store.getState().app.nodeConfig;
    this.network = ScatterJS.Network.fromJson({
        blockchain: nodeConfig? nodeConfig.blockchain: 'eos',
        chainId: nodeConfig? nodeConfig.chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
        // host: nodeConfig? nodeConfig.host: 'eospush.tokenpocket.pro',
        host: nodeConfig? nodeConfig.host: 'eos.greymass.com',
        port: nodeConfig? nodeConfig.port: '443',
        protocol: nodeConfig? nodeConfig.protocol: 'https',
    });
    this.freeCpuEos = Eos({
      keyProvider: store.getState().app.freeCpuPrivateKey,
      // httpEndpoint: 'https://eospush.tokenpocket.pro:443',
      httpEndpoint: 'https://eos.greymass.com:443',
      chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
    });

    let [err, res] = [null, null];
    let success = false;
    if (typeof appName !== 'undefined') {
      this.appName = appName;
    }
    for (let i=0; i<10; i++) {
      [err, res] = await this.connect(appName);
      if (res) {
        success = true;
        this.connected = true;
        console.log('connect pass');
        break;
      } else {
        console.log('connect fail');
      }
      await this.sleep(1000);
    }

    if (!success) {
      console.log('connect fail, over max try time');
      return ['connect fail, over max try time', null];
    }

    this.api = ScatterJS.eos(this.network, Eos);
    [err, res] = await this.login();
    if (res) {
      console.log('login pass');
      this.logined = true;
      const account = ScatterJS.account('eos');
      const newAccount = {
        name: account.name,
        // // name: 'wwwcyb112112',
        // name: 'hazdqmjqgige',
        // // name: 'manjianetvip',
        permissions: account.authority,
        publicKey: account.publicKey,
      }
      store.dispatch(actions.setAccount(newAccount));
      return [err, newAccount];
    } else {
      console.log('login fail');
    }
    return [err, res];
  }

  async transact(params) {
    if (!this.check()) {
      return ['no connect and login', null]
    }
    // const useFreeCpu = store.state.app.freeCpu;
    const useFreeCpu = store.getState().app.freeCpu;
    if (useFreeCpu) {
      return this.transactFree(params);
    }    

    let [err, res] = [null, null];
    [err, res] = await this.awaitWrap(this.api.transaction(params, {blocksBehind: 3, expireSeconds: 30,}))
    //err = {"code":500,"message":"Internal Service Error","error":{"code":3080004,"name":"tx_cpu_usage_exceeded","what":"Transaction exceeded the current CPU usage limit imposed on the transaction","details":[{"message":"billed CPU time (170 us) is greater than the maximum billable CPU time for the transaction (5 us)","file":"transaction_context.cpp","line_number":487,"method":"validate_account_cpu_usage"}]}}
    if (err && this.isJSON(err) && JSON.parse(err).hasOwnProperty('error')) { //err返回的是string，所以这里需要转换。this.$toast能正常显示的，就说明是字符串
      return [JSON.parse(err).error.details[0].message, res]
    }
    return [err, res];
  }

  async toSignFreeCpu(params) {
    let [err, res] = [null, null];
    [err, res] = await this.awaitWrap(this.freeCpuEos.transaction(params, {
      sign: true,
      broadcast: false,
      blocksBehind: 3,
      expireSeconds: 30,
    }));
    if (err) {
      if (this.isJSON(err) && JSON.parse(err).hasOwnProperty('error')) { //err返回的是string，所以这里需要转换。this.$toast能正常显示的，就说明是字符串
        return [JSON.parse(err).error.details[0].message, res]
      }
      return [err, res];
    }
    const pushTransaction = res.transaction;
    pushTransaction.signatures.push(params.signatures[0]);
    [err, res] = await this.awaitWrap(this.freeCpuEos.pushTransaction(pushTransaction));
    if (err) {
      if (this.isJSON(err) && JSON.parse(err).hasOwnProperty('error')) { //err返回的是string，所以这里需要转换。this.$toast能正常显示的，就说明是字符串
        return [JSON.parse(err).error.details[0].message, res]
      }
    }
    return [err, res];
  }

  async transactFree(tx) {
    const txh = {blocksBehind: 3, expireSeconds: 120,};
    const data = {tx, txh};
    // const formName = store.state.app.account.name;
    const formName = store.getState().app.account.name;
    tx.actions.unshift({
      account: "dfsfreecpu11",
      name: 'freecpu2',
      authorization: [
        {
          actor: "yfcmonitor11",
          permission: `cpu`,
        },
      ],
      data: {
        user: formName
      },
    })  
    let [err, res] = [null, null];
    [err, res] = await this.awaitWrap(this.api.transaction(tx, {...txh, sign: true, broadcast: false,}));
    if (err) {
      if (this.isJSON(err) && JSON.parse(err).hasOwnProperty('error')) { //err返回的是string，所以这里需要转换。this.$toast能正常显示的，就说明是字符串
        return [JSON.parse(err).error.details[0].message, res]
      }
      return [err, res];
    }

    const transaction = res.transaction.transaction;
    transaction.signatures = res.transaction.signatures;
    transaction.context_free_data = [];
    data.sign_data = transaction;

    return this.toSignFreeCpu(data.sign_data);
  }

  async getTableRows(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.getTableRows(params));
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async abiBinToJson(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.abiBinToJson(params));
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async abiJsonToBin(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.abiJsonToBin(params));
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getAbi(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.getAbi(params))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getAccount(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.getAccount(params))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getBlockHeaderState(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.getBlockHeaderState(params))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getBlock(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.getBlock(params))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getCode(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.getCode(params))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getCodeHash(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.getCodeHash(params))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getCurrencyBalance(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.getCurrencyBalance(params))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getCurrencyStats(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.getCurrencyStats(params))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getInfo() {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.getInfo())
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getProducerSchedule() {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.getProducerSchedule())
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getProducers(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.getProducers(params))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getRawCodeAndAbi(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.getRawCodeAndAbi(params))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getScheduledTransactions(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.getScheduledTransactions(params))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getRequiredKeys(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.getRequiredKeys(params));
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getKeyAccounts(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.getKeyAccounts(params));
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

}

//https://www.zhihu.com/question/266129549
//无论是NodeJS和Webpack，默认的资源Index都是文件的绝对路径。
//所以只要绝对路径相同，文件就应该是只被加载一次，第二次加载就是从cache中获取
export default new ScatterClass();