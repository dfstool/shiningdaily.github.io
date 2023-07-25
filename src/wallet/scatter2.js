import ScatterJS from '@scatterjs/core';
import ScatterEOS from '@scatterjs/eosjs2';
import {JsonRpc, Api, RpcError} from 'eosjs';
import store from '@/store';
import { actions } from '@/store/app';
import { pushFreeCpu2 } from '@/api/dfs';

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
      if (err instanceof RpcError) {
        console.log(err.message);
        return [err.message, null]
      } else if (err instanceof Error) {
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

  connect() {
    return this.awaitWrap(ScatterJS.connect(this.appName, {network: this.network}))
  }

  login() {
    return this.awaitWrap(ScatterJS.login())
  }

  async init(appName) {
    const nodeConfig = store.getState().app.nodeConfig
    this.network = ScatterJS.Network.fromJson({
        blockchain: nodeConfig? nodeConfig.blockchain: 'eos',
        chainId: nodeConfig? nodeConfig.chainId: "aca376f206b8fc25a6ed44dbdc66547c36c6c33e3a119ffbeaef943642f0e906",
        host: nodeConfig? nodeConfig.host: 'eospush.tokenpocket.pro',
        port: nodeConfig? nodeConfig.port: '443',
        protocol: nodeConfig? nodeConfig.protocol: 'https',
    });
    this.rpc = new JsonRpc(this.network.fullhost());

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

    this.api = ScatterJS.eos(this.network, Api, {rpc: this.rpc});
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
    const useFreeCpu = store.getState().app.freeCpu;
    if (useFreeCpu) {
      return this.transactFree(params);
    }  

    let [err, res] = [null, null];
    [err, res] = await this.awaitWrap(this.api.transact(params, {blocksBehind: 3, expireSeconds: 30,}))
    return [err, res];
  }

  //无法使用，会报如下错误，问题出在api.transact
  //transaction declares authority '{"actor":"yfcmonitor11","permission":"active"}', but does not have signatures for it.
  async transactFree(tx) {
    const txh = {blocksBehind: 3, expireSeconds: 120,};
    const data = {tx, txh};
    const formName = store.getState().app.account.name;
    tx.actions.unshift({
      account: "dfsfreecpu11",
      name: 'freecpu',
      authorization: [
        {
          actor: "yfcmonitor11",
          permission: "active",
        },
      ],
      data: {
        user: formName
      },
    })  
    let [err, res] = [null, null];
    [err, res] = await this.awaitWrap(this.api.transact(tx, {...txh, sign: true, broadcast: false,}));
    if (err) return [err, res];
    let signatures = res.signatures;
    [err, res] = await this.deserializeTransaction(res.serializedTransaction);
    if (err) return [err, res] 
    res.signatures = signatures;
    res.context_free_data = [];
    data.sign_data = res

    return pushFreeCpu2(data);
  }

  async deserializeTransaction(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = [null, null]
      try {
        res = this.api.deserializeTransaction(params)
        break;
      } catch (e) {
        err = e
        console.log(err.toString())
        await this.sleep(this.delay);
      }
    }
    return [err, res];
  }

  async deserializeTransactionWithActions(params) {
    // return this.awaitWrap(this.api.deserializeTransactionWithActions(params))
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.api.deserializeTransactionWithActions(params))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getTableRows(params) {
    // return this.awaitWrap(this.rpc.get_table_rows(params))
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_table_rows(params));
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async abiBinToJson({code, action, binargs}) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.abi_bin_to_json(code, action, binargs));
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async abiJsonToBin({code, action, args}) {
    //return this.awaitWrap(this.rpc.abi_json_to_bin(code, action, args));
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.abi_json_to_bin(code, action, args));
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getAbi({account_name}) {
    // return this.awaitWrap(this.rpc.get_abi(params))
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_abi(account_name))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getAccount({account_name}) {
    //return this.awaitWrap(this.rpc.get_account(params))
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_account(account_name))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getAccountsByAuthorizers({ accounts, keys }) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_accounts_by_authorizers(accounts, keys))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getActivatedProtocolFeatures(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_activated_protocol_features(params))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getBlockHeaderState({ block_num_or_id }) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_block_header_state(block_num_or_id))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getBlockInfo({ block_num }) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_block_info(block_num))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getBlock({ block_num_or_id }) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_block(block_num_or_id))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getCode({account_name}) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_code(account_name))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getCodeHash({account_name}) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_code_hash(account_name))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getCurrencyBalance({ code, account, symbol }) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_currency_balance(code, account, symbol))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getCurrencyStats({ code, symbol }) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_currency_stats(code, symbol))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getInfo() {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_info())
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getProducerSchedule() {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_producer_schedule())
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getProducers({ json, lower_bound, limit }) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_producers(json, lower_bound, limit))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getRawCodeAndAbi({ account_name }) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_raw_code_and_abi(account_name))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getRawAbi({ account_name }) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_raw_abi(account_name))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getRawAbi2({ account_name }) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.getRawAbi(account_name))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getScheduledTransactions({ json, lower_bound, limit }) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_scheduled_transactions(json, lower_bound, limit))
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }
  
  async getKVTableRows(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_kv_table_rows(params));
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getTableByScope(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.get_table_by_scope(params));
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getRequiredKeys(params) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.getRequiredKeys(params));
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  async getKeyAccounts({ public_key }) {
    let [err, res] = [null, null];
    for (let i=0; i<this.try; i++) {
      [err, res] = await this.awaitWrap(this.rpc.history_get_key_accounts(public_key));
      if (res) {return [err, res]} else {await this.sleep(this.delay)}
    }
    return [err, res];
  }

  /*
    push_transaction
    push_ro_transaction
    push_transactions
    send_transaction
    db_size_get
    trace_get_block
    history_get_actions
    history_get_transaction
    history_get_key_accounts
    history_get_key_accounts
  */

}

//https://www.zhihu.com/question/266129549
//无论是NodeJS和Webpack，默认的资源Index都是文件的绝对路径。
//所以只要绝对路径相同，文件就应该是只被加载一次，第二次加载就是从cache中获取
export default new ScatterClass();