import {Injectable} from '@angular/core';
import * as contract from 'truffle-contract';
import {AES, enc} from 'crypto-js';
import {Subject} from 'rxjs/Rx';
import {Buffer} from 'buffer';



declare let require: any;
declare let global: any;
const Web3 = require('web3');



declare let window: any;

@Injectable()
export class Web3Service {
  private web3: any;
  private accounts: string[];
  private keySeed: string;
  private symKey: string;
  public ready = false;
  public MetaCoin: any;
  public accountsObservable = new Subject<string[]>();

  constructor() {
    window.addEventListener('load', (event) => {
      this.bootstrapWeb3();
    });
    let msg = new Buffer("off-chain data encription key");
    this.keySeed = "0x" + msg.toString('hex');
  }

  public bootstrapWeb3() {
    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof window.web3 !== 'undefined') {
      // Use Mist/MetaMask's provider
      this.web3 = new Web3(window.web3.currentProvider);
    } else {
      console.log('No web3? You should consider trying MetaMask!');

      // Hack to provide backwards compatibility for Truffle, which uses web3js 0.20.x
      Web3.providers.HttpProvider.prototype.sendAsync = Web3.providers.HttpProvider.prototype.send;
      // fallback - use your fallback strategy (local node / hosted node + in-dapp id mgmt / fail)
      this.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545'));
    }
    
    setInterval(() => this.refreshAccounts(), 1000);
  }

  public sign(data, cb) {
    this.web3.eth.sign(this.accounts[0], data, cb);
  }

  public async generateKey(): Promise<string> {
    let self = this;
    return new Promise<string>((resolve, reject) => {
      if(self.symKey != null) {
        resolve(self.symKey);
        return;
      }
      this.web3.personal.sign(this.keySeed, this.web3.eth.accounts[0], "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef", function(error, result) {
        self.symKey = result.slice(2, 66);
        console.log("symKey:" + self.symKey);
        resolve(self.symKey);
      });
    });
  }

  public async encrypt(data: string): Promise<string> {
    return this.generateKey().then((key) => {
      let a = AES.encrypt(data, key); 
      return a.toString();
    });
  }

  public async decrypt(data: string): Promise<string> {
    return this.generateKey().then((key) => {
      let a = AES.decrypt(data, key); 
      return a.toString(enc.Utf8);
    });
  }

  public hash(data) {
    return this.web3.sha3(data);
  }

  public isAddress(addres: string) {
    return this.web3.isAddress(addres);
  }

  public async artifactsToContract(artifacts) {
    if (!this.web3) {
      const delay = new Promise(resolve => setTimeout(resolve, 100));
      await delay;
      return await this.artifactsToContract(artifacts);
    }

    const contractAbstraction = contract(artifacts);
    contractAbstraction.setProvider(this.web3.currentProvider);
    return contractAbstraction;
  }

  public async getAccount(): Promise<string> {
    return new Promise<string>((resolve, reject)=> {
      this.web3.eth.getAccounts((err, accs) => {
        if (err != null) {
          reject(err);
          return;
        }
        if (accs.length === 0) {
          resolve(null);
        }
        resolve(accs[0]);
      })
    });
  }

  private refreshAccounts() {
    this.web3.eth.getAccounts((err, accs) => {
      console.log('Refreshing accounts');
      if (err != null) {
        console.warn('There was an error fetching your accounts.');
        return;
      }

      // Get the initial account balance so it can be displayed.
      if (accs.length === 0) {
        console.warn('Couldn\'t get any accounts! Make sure your Ethereum client is configured correctly.');
        return;
      }

      if (!this.accounts || this.accounts.length !== accs.length || this.accounts[0] !== accs[0]) {
        console.log('Observed new accounts');

        this.accountsObservable.next(accs);
        this.accounts = accs;
      }

      this.ready = true;
    });
  }
}
